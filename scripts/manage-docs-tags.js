/**
 * Manage Docs Tags and Issues
 *
 * Scans Markdown files for TODO/PLACEHOLDER/NOTE lines and tracks them
 * as GitHub Issues – exactly one open tracking issue per Markdown file.
 *
 * Design goals:
 *   - Source of truth: the .md file (for file tags) or the comment (for comment tags).
 *   - Issues are clean: only open tasks shown, resolved tasks disappear.
 *   - No checkboxes (they give false affordance). Plain bullets with clickable source labels.
 *   - Comment tasks are resolved by reacting with 🚀 on the original comment.
 *   - Aggressive normalization prevents ghost duplicates from reformatting.
 *   - Scoped push processing for efficiency; full scan on dispatch.
 */

const fs = require('fs').promises;
const path = require('path');

// ---------------------------------------------------------------------------
// Pure helpers (exported for testing)
// ---------------------------------------------------------------------------

function normalizePath(p) {
  return (p || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * Normalize task content for comparison.
 * Strips markdown formatting so that **TODO:** X, __TODO__: X, [TODO]: X
 * all produce the same normalized key.
 */
function normalizeTaskContent(content) {
  let s = content || '';
  // Strip markdown formatting: bold, italic, underline markers
  s = s.replace(/\*{1,3}/g, '');
  s = s.replace(/_{1,3}/g, '');
  // Strip brackets around tag keywords: [TODO] -> TODO
  s = s.replace(/\[(TODO|PLACEHOLDER|NOTE)\]/g, '$1');
  // Strip list markers at the start
  s = s.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/, '');
  // Strip blockquote prefixes
  s = s.replace(/^\s*>+\s*/, '');
  // Normalize TAG: spacing
  s = s.replace(/\b(TODO|PLACEHOLDER|NOTE)\s*:\s*/g, '$1: ');
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ');
  return s.trim();
}

function hasLabel(issue, name) {
  return (issue.labels || []).some(l => l.name === name);
}

function wasAutoCompleted(issue) {
  return hasLabel(issue, 'doc-tags-complete');
}

function isDocTagsIssue(issue) {
  return hasLabel(issue, 'doc-tags') || /Tags in\s+.+/.test(issue.title || '');
}

function extractFileFromIssue(issue) {
  const title = issue.title || '';
  // Current format: "[5 open] Tags in docs/foo.md"
  const cf = title.match(/^\[\d+ open\]\s+Tags in\s+(.+)$/);
  if (cf && cf[1]) return normalizePath(cf[1]);
  // Previous format: "Tags in docs/foo.md [5 open]"
  const nm = title.match(/Tags in\s+(.+?)\s*\[/);
  if (nm && nm[1]) return normalizePath(nm[1]);
  // Legacy format: "(5/8 open) Tags in docs/foo.md"
  const cm = title.match(/^\(\d+\/\d+ open\)\s+Tags in\s+(.+)$/);
  if (cm && cm[1]) return normalizePath(cm[1]);
  // Simple format: "Tags in docs/foo.md"
  const tm = title.match(/Tags in\s+(.+?)(?:\s*\(|$)/);
  if (tm && tm[1]) return normalizePath(tm[1]);
  // Fallback to body
  const body = issue.body || '';
  const bm = body.match(/^File: \[(.+?)\]/m);
  if (bm && bm[1]) return normalizePath(bm[1]);
  return null;
}

function getLabel(file) {
  const parts = path.dirname(file).split(path.sep);
  if (parts[0] === 'docs' && parts.length > 1) {
    const labels = parts.slice(1).filter(p => p !== 'research');
    return labels.length > 0 ? labels : ['general'];
  }
  return ['general'];
}

/**
 * Parse TODO/PLACEHOLDER/NOTE tags from Markdown content.
 * Ignores fenced code blocks, inline code spans, and admonition lines.
 * Only ALL-UPPERCASE keywords are recognized.
 */
function parseTags(content) {
  function stripCode(inp) {
    const lines = inp.split(/\r?\n/);
    let inFence = false;
    const out = [];
    for (const line of lines) {
      if (/^```/.test(line.trim())) { inFence = !inFence; out.push(''); continue; }
      if (inFence) { out.push(''); continue; }
      out.push(line.replace(/`[^`]*`/g, ''));
    }
    return out.join('\n');
  }

  function isAdmonitionLine(line) {
    const s = line.trim();
    return s.startsWith('!!!') || s.startsWith('???') || s.startsWith(':::');
  }

  function normalizeForMatch(line) {
    let s = line;
    s = s.replace(/^\s*>+\s*/, '');
    s = s.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/, '');
    s = s.replace(/^\s*\[(?: |x|X)\]\s+/, '');
    s = s.replace(/\[(TODO|PLACEHOLDER|NOTE)\]/g, '$1');
    s = s.replace(/\*{1,3}/g, '').replace(/_{1,3}/g, '');
    s = s.replace(/\b(TODO|PLACEHOLDER|NOTE)\s*:\s*/g, '$1: ');
    return s.trim();
  }

  const strictTag = /^(TODO|PLACEHOLDER|NOTE)\b(?::|\s).+/;
  const cleaned = stripCode(content);
  // Use normalized content as dedup key to prevent ghost duplicates
  const seen = new Set();
  const tags = [];

  for (const line of cleaned.split(/\r?\n/)) {
    if (isAdmonitionLine(line)) continue;
    const norm = normalizeForMatch(line);
    if (strictTag.test(norm)) {
      const normKey = normalizeTaskContent(line);
      if (!seen.has(normKey)) {
        seen.add(normKey);
        const m = /(TODO|PLACEHOLDER|NOTE)/.exec(line) || [];
        tags.push({ type: m[1] || 'TODO', content: line.trim(), normalizedKey: normKey });
      }
    }
  }

  return tags;
}

/**
 * Parse existing tasks from an issue body.
 * Handles both new format (plain bullets with HTML comments) and legacy format (checkboxes with arrows).
 */
function parseExistingTasks(body) {
  const tasks = [];

  // New format: "- content [(source)](url) <!-- source:type:id -->"
  const newFormatRegex = /^- (.+?) <!-- source:(file|comment):?(\d*) -->$/gm;
  let match;
  while ((match = newFormatRegex.exec(body)) !== null) {
    const content = match[1].replace(/\s*\[\((?:file|comment)\)\]\(.+?\)\s*$/, '').trim();
    tasks.push({
      content,
      normalizedKey: normalizeTaskContent(content),
      source: match[2],
      commentId: match[3] || null,
    });
  }

  // Legacy format: "- [ ] content --> Status <--" or "- [x] content --> Status <--"
  if (tasks.length === 0) {
    const legacyRegex = /- \[([ x])\] (.*?)( --> (Added from comment #(\d+)|Added from file|Resolved from file|Manually marked as complete) <--)?$/gm;
    while ((match = legacyRegex.exec(body)) !== null) {
      const completed = match[1] === 'x';
      const content = match[2].trim();
      const status = match[4] || null;
      const commentId = match[5] || null;
      // Skip resolved-from-file tasks in legacy migration (they get dropped)
      if (status === 'Resolved from file') continue;
      tasks.push({
        content,
        normalizedKey: normalizeTaskContent(content),
        source: commentId ? 'comment' : 'file',
        commentId,
        // Legacy: if it was completed and manually marked, preserve
        _legacyCompleted: completed,
        _legacyStatus: status,
      });
    }
  }

  return tasks;
}

/**
 * Build the updated task list from current file tags + existing tasks.
 *
 * Rules:
 *   - File-sourced tasks: if tag is still in file, keep. If removed, drop entirely.
 *   - Comment-sourced tasks: always keep (until resolved via 🚀 emoji, handled elsewhere).
 *   - Use normalized keys for matching to prevent ghost duplicates.
 *   - Sort: by type (TODO > PLACEHOLDER > NOTE), then alphabetical.
 */
function formatTasks(currentTags, existingTasks, { filePath, owner, repo, commentUrlBase } = {}) {
  const tasks = [];
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const fileEditUrl = (owner && repo && filePath)
    ? `${serverUrl}/${owner}/${repo}/edit/main/${filePath}`
    : null;

  // Build set of current normalized keys
  const currentKeySet = new Set(currentTags.map(t => t.normalizedKey));

  // Keep comment-sourced tasks from existing (regardless of file tags)
  for (const task of existingTasks) {
    if (task.source === 'comment') {
      tasks.push(task);
    }
    // File-sourced existing tasks: only keep if still in current tags (handled below)
  }

  // Add current file tags
  for (const tag of currentTags) {
    // Check if this tag already exists as a comment-sourced task (by normalized key)
    const alreadyAsComment = tasks.some(t => t.normalizedKey === tag.normalizedKey);
    if (alreadyAsComment) continue;

    tasks.push({
      content: tag.content,
      normalizedKey: tag.normalizedKey,
      source: 'file',
      commentId: null,
    });
  }

  // Sort: by type (TODO > PLACEHOLDER > NOTE), then alphabetical
  const order = { TODO: 0, PLACEHOLDER: 1, NOTE: 2, ZZZ: 3 };
  function tagTypeOf(task) {
    const m = /(TODO|PLACEHOLDER|NOTE)/i.exec(task.content || '');
    return m ? m[1].toUpperCase() : 'ZZZ';
  }
  tasks.sort((a, b) => {
    const ta = order[tagTypeOf(a)] ?? 3;
    const tb = order[tagTypeOf(b)] ?? 3;
    if (ta !== tb) return ta - tb;
    const ca = (a.content || '').toLowerCase();
    const cb = (b.content || '').toLowerCase();
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });

  // Render markdown
  const lines = tasks.map(task => {
    let sourceLabel;
    if (task.source === 'comment' && task.commentId && commentUrlBase) {
      sourceLabel = `[(comment)](${commentUrlBase}#issuecomment-${task.commentId})`;
    } else if (task.source === 'comment') {
      sourceLabel = '(comment)';
    } else if (fileEditUrl) {
      sourceLabel = `[(file)](${fileEditUrl})`;
    } else {
      sourceLabel = '(file)';
    }
    const meta = task.source === 'comment' && task.commentId
      ? `<!-- source:comment:${task.commentId} -->`
      : '<!-- source:file -->';
    return `- ${task.content} ${sourceLabel} ${meta}`;
  });

  return { text: lines.join('\n'), tasks };
}

/**
 * Extract changed docs/*.md files from a push event payload.
 * Returns null when a full scan is needed (workflow_dispatch or missing data).
 */
function getChangedFiles(context) {
  if (context.eventName !== 'push') return null;
  const commits = (context.payload && context.payload.commits) || [];
  if (commits.length === 0) return null;

  const files = new Set();
  for (const commit of commits) {
    for (const f of (commit.added || [])) files.add(f);
    for (const f of (commit.modified || [])) files.add(f);
  }

  return Array.from(files).filter(
    f => f.startsWith('docs/') && f.endsWith('.md')
  );
}

// ---------------------------------------------------------------------------
// I/O helpers
// ---------------------------------------------------------------------------

async function walkSync(dir) {
  const entries = await fs.readdir(dir);
  const filelist = [];
  for (const entry of entries) {
    const filepath = path.join(dir, entry);
    const stat = await fs.stat(filepath);
    if (stat.isDirectory()) {
      filelist.push(...(await walkSync(filepath)));
    } else if (path.extname(entry) === '.md') {
      filelist.push(filepath);
    }
  }
  return filelist;
}

// ---------------------------------------------------------------------------
// Issue cache – fetch once, look up O(1)
// ---------------------------------------------------------------------------

class IssueCache {
  constructor() {
    this.openByFile = new Map();
    this.closedByFile = new Map();
    this.allOpen = [];
  }

  async load(github, owner, repo) {
    const openIssues = await github.paginate(github.rest.issues.listForRepo, {
      owner, repo, state: 'open', per_page: 100
    });
    const closedIssues = await github.paginate(github.rest.issues.listForRepo, {
      owner, repo, state: 'closed', per_page: 100
    });

    this.allOpen = openIssues.filter(isDocTagsIssue);

    for (const iss of this.allOpen) {
      const fp = extractFileFromIssue(iss);
      if (!fp) continue;
      const key = normalizePath(fp);
      if (!this.openByFile.has(key) || iss.number < this.openByFile.get(key).number) {
        this.openByFile.set(key, iss);
      }
    }

    const closedDocIssues = closedIssues
      .filter(isDocTagsIssue)
      .filter(iss => !wasAutoCompleted(iss))
      .sort((a, b) => b.number - a.number);
    for (const iss of closedDocIssues) {
      const fp = extractFileFromIssue(iss);
      if (!fp) continue;
      const key = normalizePath(fp);
      if (!this.closedByFile.has(key)) {
        this.closedByFile.set(key, iss);
      }
    }

    console.log(`Issue cache: ${this.allOpen.length} open doc-tags issues, ${closedDocIssues.length} closed (non-complete)`);
  }

  findOpen(file) {
    return this.openByFile.get(normalizePath(file)) || null;
  }

  findClosed(file) {
    return this.closedByFile.get(normalizePath(file)) || null;
  }

  groupByFile() {
    const byFile = new Map();
    for (const iss of this.allOpen) {
      const fp = extractFileFromIssue(iss);
      if (!fp) continue;
      const key = normalizePath(fp);
      if (!byFile.has(key)) byFile.set(key, []);
      byFile.get(key).push(iss);
    }
    return byFile;
  }
}

// ---------------------------------------------------------------------------
// Main workflow logic
// ---------------------------------------------------------------------------

async function run({ github, context, core }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const closedThisRun = new Set();

  // ---- Handle issue_comment event (fast path) ----
  if (context.eventName === 'issue_comment') {
    const issue = context.payload.issue;
    const comment = context.payload.comment;
    if (!hasLabel(issue, 'doc-tags')) {
      console.log(`Skipping comment on non-doc-tags issue #${issue.number}`);
      return;
    }
    console.log(`Processing comment on doc-tags issue #${issue.number}`);
    await handleNewComment({ github, owner, repo, serverUrl, issue, comment, context });
    return;
  }

  // ---- Push or workflow_dispatch ----
  console.log(`Event: ${context.eventName}`);

  const cache = new IssueCache();
  await cache.load(github, owner, repo);

  const allFiles = await walkSync('docs');
  const allFilesSet = new Set(allFiles.map(normalizePath));
  console.log(`Found ${allFiles.length} Markdown files in docs/`);

  const changedFiles = getChangedFiles(context);
  const filesToProcess = changedFiles ? [...changedFiles] : [...allFiles];
  if (changedFiles) {
    const existing = [];
    for (const f of filesToProcess) {
      try {
        await fs.access(f);
        existing.push(f);
      } catch {
        console.log(`Changed file ${f} deleted; orphan cleanup will handle it`);
      }
    }
    filesToProcess.length = 0;
    filesToProcess.push(...existing);
    console.log(`Push event: processing ${filesToProcess.length} changed file(s)`);
  } else {
    console.log('Full scan: processing all files');
  }

  // Also process files with open issues (to catch removed tags)
  for (const [fp] of cache.openByFile.entries()) {
    if (!filesToProcess.some(f => normalizePath(f) === fp) && allFilesSet.has(fp)) {
      filesToProcess.push(fp);
    }
  }

  // Process files
  for (const file of filesToProcess) {
    await processFile({ github, owner, repo, serverUrl, file, cache, closedThisRun });
  }

  // Check emoji reactions on comment-sourced tasks and remove resolved ones
  await resolveEmojiTasks({ github, owner, repo, serverUrl, cache, closedThisRun, allFilesSet });

  // Orphan cleanup
  console.log('Running orphan cleanup');
  let orphansClosed = 0;
  for (const iss of cache.allOpen) {
    if (closedThisRun.has(iss.number)) continue;
    const fp = extractFileFromIssue(iss);
    if (fp && !allFilesSet.has(normalizePath(fp))) {
      console.log(`Orphan: ${fp} no longer exists, closing #${iss.number}`);
      await github.rest.issues.createComment({
        owner, repo, issue_number: iss.number,
        body: 'Source file no longer exists. Closing orphaned issue.'
      });
      await github.rest.issues.update({
        owner, repo, issue_number: iss.number, state: 'closed'
      });
      closedThisRun.add(iss.number);
      orphansClosed++;
    }
  }
  console.log(`Orphan cleanup: closed ${orphansClosed} issue(s)`);

  // De-duplicate
  console.log('Running de-duplication');
  const byFile = cache.groupByFile();
  let dupsClosed = 0;
  for (const [fp, issuesForFile] of byFile.entries()) {
    const live = issuesForFile.filter(i => !closedThisRun.has(i.number));
    if (live.length <= 1) continue;

    live.sort((a, b) => a.number - b.number);
    const primary = live[0];
    console.log(`Dedup: ${live.length} issues for ${fp}, keeping #${primary.number}`);

    if (!hasLabel(primary, 'doc-tags')) {
      await github.rest.issues.addLabels({
        owner, repo, issue_number: primary.number, labels: ['doc-tags']
      });
    }

    // Merge comment-sourced tasks from duplicates
    const primaryFresh = await github.rest.issues.get({
      owner, repo, issue_number: primary.number
    });
    let mergedCommentTasks = parseExistingTasks(primaryFresh.data.body || '')
      .filter(t => t.source === 'comment');

    for (const dup of live.slice(1)) {
      const dupData = await github.rest.issues.get({
        owner, repo, issue_number: dup.number
      });
      const dupComments = parseExistingTasks(dupData.data.body || '')
        .filter(t => t.source === 'comment');
      // Merge unique by normalized key
      const existingKeys = new Set(mergedCommentTasks.map(t => t.normalizedKey));
      for (const t of dupComments) {
        if (!existingKeys.has(t.normalizedKey)) {
          mergedCommentTasks.push(t);
          existingKeys.add(t.normalizedKey);
        }
      }
    }

    // Rebuild primary
    let currentTags = [];
    if (allFilesSet.has(normalizePath(fp))) {
      try {
        const content = await fs.readFile(normalizePath(fp), 'utf8');
        currentTags = parseTags(content);
      } catch (e) {
        console.log(`Could not read ${fp} during dedup: ${e.message}`);
      }
    }

    const commentUrlBase = `${serverUrl}/${owner}/${repo}/issues/${primary.number}`;
    const rebuilt = formatTasks(currentTags, mergedCommentTasks, {
      filePath: fp, owner, repo, commentUrlBase
    });
    const labels = getLabel(fp);
    const primaryLabels = (primary.labels || []).map(l => l.name);
    const nextLabels = Array.from(new Set([...primaryLabels, 'doc-tags', ...labels]));
    const openCount = rebuilt.tasks.length;

    await github.rest.issues.update({
      owner, repo, issue_number: primary.number,
      title: buildTitle(fp, openCount),
      body: buildBody(fp, owner, repo, rebuilt.text),
      labels: nextLabels
    });

    for (const dup of live.slice(1)) {
      await github.rest.issues.createComment({
        owner, repo, issue_number: dup.number,
        body: `Duplicate of #${primary.number}. Consolidating. Closing this one.`
      });
      try {
        await github.rest.issues.addLabels({
          owner, repo, issue_number: dup.number, labels: ['duplicate']
        });
      } catch (e) { /* label may not exist */ }
      await github.rest.issues.update({
        owner, repo, issue_number: dup.number, state: 'closed'
      });
      closedThisRun.add(dup.number);
      dupsClosed++;
    }
  }
  console.log(`De-duplication: closed ${dupsClosed} duplicate(s)`);
  console.log('Workflow complete');
}

// ---------------------------------------------------------------------------
// Per-file processing
// ---------------------------------------------------------------------------

async function processFile({ github, owner, repo, serverUrl, file, cache, closedThisRun }) {
  const content = await fs.readFile(file, 'utf8');
  const currentTags = parseTags(content);
  const existingIssue = cache.findOpen(file);

  if (currentTags.length === 0 && !existingIssue) return;

  const labels = getLabel(file);
  console.log(`${file}: ${currentTags.length} tag(s), issue: ${existingIssue ? '#' + existingIssue.number : 'none'}`);

  if (existingIssue) {
    const existingTasks = parseExistingTasks(existingIssue.body);
    const commentUrlBase = `${serverUrl}/${owner}/${repo}/issues/${existingIssue.number}`;
    const { text, tasks } = formatTasks(currentTags, existingTasks, {
      filePath: file, owner, repo, commentUrlBase
    });
    const openCount = tasks.length;
    const title = buildTitle(file, openCount);
    const body = buildBody(file, owner, repo, text);

    const currentLabels = (existingIssue.labels || []).map(l => l.name);
    const nextLabels = Array.from(new Set([...currentLabels, 'doc-tags', ...labels]));

    await github.rest.issues.update({
      owner, repo, issue_number: existingIssue.number,
      title, body, labels: nextLabels
    });

    // Auto-close if no tasks remain
    if (openCount === 0) {
      await github.rest.issues.createComment({
        owner, repo, issue_number: existingIssue.number,
        body: 'All tasks resolved. Closing this issue.'
      });
      await github.rest.issues.update({
        owner, repo, issue_number: existingIssue.number,
        state: 'closed', labels: ['doc-tags', ...labels, 'doc-tags-complete']
      });
      closedThisRun.add(existingIssue.number);
    }
  } else if (currentTags.length > 0) {
    // Create or reopen
    const { text, tasks } = formatTasks(currentTags, [], {
      filePath: file, owner, repo
    });
    const openCount = tasks.length;
    const title = buildTitle(file, openCount);
    const body = buildBody(file, owner, repo, text);

    const closedIssue = cache.findClosed(file);
    if (closedIssue) {
      console.log(`  Reopening closed issue #${closedIssue.number}`);
      const currentLabels = (closedIssue.labels || []).map(l => l.name);
      const nextLabels = Array.from(new Set([...currentLabels, 'doc-tags', ...labels]));
      await github.rest.issues.update({
        owner, repo, issue_number: closedIssue.number,
        state: 'open', title, body, labels: nextLabels
      });
      await github.rest.issues.createComment({
        owner, repo, issue_number: closedIssue.number,
        body: 'New tags detected in source file. Reopening this issue.'
      });
    } else {
      const created = await github.rest.issues.create({
        owner, repo, title, body, labels: ['doc-tags', ...labels]
      });
      console.log(`  Created issue #${created.data.number}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Emoji-based resolution for comment-sourced tasks
// ---------------------------------------------------------------------------

async function resolveEmojiTasks({ github, owner, repo, serverUrl, cache, closedThisRun, allFilesSet }) {
  console.log('Checking comment tasks for 🚀 emoji resolution');
  let resolved = 0;

  for (const iss of cache.allOpen) {
    if (closedThisRun.has(iss.number)) continue;

    const tasks = parseExistingTasks(iss.body);
    const commentTasks = tasks.filter(t => t.source === 'comment' && t.commentId);
    if (commentTasks.length === 0) continue;

    let changed = false;
    const resolvedIds = new Set();

    for (const task of commentTasks) {
      try {
        const reactions = await github.rest.reactions.listForIssueComment({
          owner, repo, comment_id: parseInt(task.commentId, 10)
        });
        // GitHub reactions: +1, -1, laugh, confused, heart, hooray, rocket, eyes
        // We use 🚀 (rocket) as the resolution signal — distinctive and unlikely accidental.
        const isResolved = reactions.data.some(r => r.content === 'rocket');
        if (isResolved) {
          resolvedIds.add(task.commentId);
          changed = true;
          resolved++;
        }
      } catch (e) {
        console.log(`Could not check reactions for comment ${task.commentId}: ${e.message}`);
      }
    }

    if (changed) {
      // Re-read issue fresh and rebuild without resolved comment tasks
      const fresh = await github.rest.issues.get({
        owner, repo, issue_number: iss.number
      });
      const allTasks = parseExistingTasks(fresh.data.body || '');
      const remainingTasks = allTasks.filter(t => {
        if (t.source === 'comment' && t.commentId && resolvedIds.has(t.commentId)) return false;
        return true;
      });

      const fp = extractFileFromIssue(iss);
      // Re-read file tags to rebuild properly
      let currentTags = [];
      if (fp && allFilesSet.has(normalizePath(fp))) {
        try {
          const content = await fs.readFile(normalizePath(fp), 'utf8');
          currentTags = parseTags(content);
        } catch (e) { /* file may not exist */ }
      }

      const commentUrlBase = `${serverUrl}/${owner}/${repo}/issues/${iss.number}`;
      const commentTasksRemaining = remainingTasks.filter(t => t.source === 'comment');
      const rebuilt = formatTasks(currentTags, commentTasksRemaining, {
        filePath: fp, owner, repo, commentUrlBase
      });

      const openCount = rebuilt.tasks.length;
      const labels = fp ? getLabel(fp) : ['general'];
      const currentLabels = (iss.labels || []).map(l => l.name);
      const nextLabels = Array.from(new Set([...currentLabels, 'doc-tags', ...labels]));

      await github.rest.issues.update({
        owner, repo, issue_number: iss.number,
        title: buildTitle(fp || 'unknown', openCount),
        body: buildBody(fp || 'unknown', owner, repo, rebuilt.text),
        labels: nextLabels
      });

      if (openCount === 0) {
        await github.rest.issues.createComment({
          owner, repo, issue_number: iss.number,
          body: 'All tasks resolved. Closing this issue.'
        });
        await github.rest.issues.update({
          owner, repo, issue_number: iss.number,
          state: 'closed', labels: ['doc-tags', ...labels, 'doc-tags-complete']
        });
        closedThisRun.add(iss.number);
      }
    }
  }
  console.log(`Emoji resolution: ${resolved} comment task(s) resolved`);
}

// ---------------------------------------------------------------------------
// Comment handler (issue_comment event)
// ---------------------------------------------------------------------------

async function handleNewComment({ github, owner, repo, serverUrl, issue, comment, context }) {
  const tagRegex = /^\s*(?:>+\s*)?(?:(?:[-*+]\s+|\d+\.\s+))?(?:\[[ xX]\]\s+)?(?:\*\*|__|\*|_)?\[?(TODO|PLACEHOLDER|NOTE)\]?\b(?::|\s).+?(?:\*\*|__|\*|_)?$/gm;
  const newTasks = [];
  let match;

  while ((match = tagRegex.exec(comment.body)) !== null) {
    newTasks.push({
      content: match[0].trim(),
      commentId: String(comment.id),
    });
  }

  if (newTasks.length === 0) {
    console.log('No tags found in comment');
    return;
  }

  // Re-read issue fresh
  const fresh = await github.rest.issues.get({
    owner, repo, issue_number: issue.number
  });
  const existingTasks = parseExistingTasks(fresh.data.body || '');

  // Insert new comment tasks before the footer (--- separator)
  const commentUrl = `${serverUrl}/${owner}/${repo}/issues/${issue.number}#issuecomment-${comment.id}`;
  const newTaskLines = newTasks.map(t => {
    const sourceLabel = `[(comment)](${commentUrl})`;
    return `- ${t.content} ${sourceLabel} <!-- source:comment:${t.commentId} -->`;
  });

  const bodyStr = fresh.data.body || '';
  const footerIndex = bodyStr.indexOf('\n---\n');
  let updatedBody;
  if (footerIndex !== -1) {
    // Insert before the footer
    updatedBody = bodyStr.slice(0, footerIndex) + '\n' + newTaskLines.join('\n') + bodyStr.slice(footerIndex);
  } else {
    // No footer found, append
    updatedBody = bodyStr + '\n' + newTaskLines.join('\n');
  }

  // Recount: parse the full updated body for total task count
  const allTasks = parseExistingTasks(updatedBody);
  const openCount = allTasks.length;

  const fp = extractFileFromIssue(fresh.data);
  const newTitle = fp ? buildTitle(fp, openCount) : fresh.data.title;

  await github.rest.issues.update({
    owner, repo, issue_number: issue.number,
    title: newTitle, body: updatedBody
  });

  // Auto-reply explaining how to resolve
  const taskList = newTasks.map(t => `\`${t.content}\``).join(', ');
  const commentAuthor = comment.user.login;
  const workflowActor = context.actor || '';
  const mention = (commentAuthor !== workflowActor && commentAuthor !== 'github-actions[bot]')
    ? `@${commentAuthor} `
    : '';

  await github.rest.issues.createComment({
    owner, repo, issue_number: issue.number,
    body: [
      `${mention}Task detected: ${taskList}`,
      '',
      `This has been added to the tracking list. To mark it as resolved, react with 🚀 on [your comment](${commentUrl}).`,
    ].join('\n')
  });

  console.log(`Added ${newTasks.length} task(s) from comment to issue #${issue.number}`);
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

function buildTitle(file, openCount) {
  return `[${openCount} open] Tags in ${file}`;
}

function buildBody(file, owner, repo, formattedTasks) {
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const editUrl = `${serverUrl}/${owner}/${repo}/edit/main/${file}`;
  const lines = [
    `File: [${file}](${editUrl})`,
    '',
  ];

  if (formattedTasks && formattedTasks.trim()) {
    lines.push('**Tasks:**', '', formattedTasks, '');
  } else {
    lines.push('No open tasks.', '');
  }

  lines.push(
    '---',
    '*This issue is auto-managed. To resolve a task:*',
    `*- **File task**: delete the tag from the [source file](${editUrl})*`,
    '*- **Comment task**: react with 🚀 on the comment that created it*',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  run,
  normalizePath,
  normalizeTaskContent,
  hasLabel,
  wasAutoCompleted,
  isDocTagsIssue,
  extractFileFromIssue,
  getLabel,
  parseTags,
  parseExistingTasks,
  formatTasks,
  getChangedFiles,
  buildTitle,
  buildBody,
  walkSync,
};
