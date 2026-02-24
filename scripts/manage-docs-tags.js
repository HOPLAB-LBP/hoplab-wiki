/**
 * Manage Docs Tags and Issues
 *
 * Scans Markdown files for TODO/PLACEHOLDER/NOTE lines and tracks them
 * as GitHub Issues – exactly one open tracking issue per Markdown file.
 *
 * Design goals:
 *   - Update counters and checklist deterministically from source files.
 *   - Preserve human-added tasks from comments and manually-completed tasks.
 *   - Never reopen a previously "completed" issue when new tags reappear;
 *     create a new issue instead to avoid carrying large histories.
 *   - Scope push events to changed files for efficiency; full scan on dispatch.
 */

const fs = require('fs').promises;
const path = require('path');

// ---------------------------------------------------------------------------
// Pure helpers (exported for testing)
// ---------------------------------------------------------------------------

function normalizePath(p) {
  return (p || '').replace(/\\/g, '/').replace(/^\/+/, '');
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
  const tm = title.match(/Tags in\s+(.+?)(?:\s*\(|$)/);
  if (tm && tm[1]) return normalizePath(tm[1]);
  const cm = title.match(/^\(\d+\/\d+ open\)\s+Tags in\s+(.+)$/);
  if (cm && cm[1]) return normalizePath(cm[1]);
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
  const tags = new Set();

  for (const line of cleaned.split(/\r?\n/)) {
    if (isAdmonitionLine(line)) continue;
    const norm = normalizeForMatch(line);
    if (strictTag.test(norm)) {
      tags.add(line.trim());
    }
  }

  return Array.from(tags).map(line => {
    const m = /(TODO|PLACEHOLDER|NOTE)/.exec(line) || [];
    return { type: m[1] || 'TODO', content: line };
  });
}

/**
 * Parse existing tasks from an issue body.
 */
function parseExistingTasks(body) {
  const taskRegex = /- \[([ x])\] (.*?)( --> (Added from comment #\d+|Added from file|Resolved from file|Manually marked as complete) <--)?$/gm;
  const tasks = [];
  let match;
  while ((match = taskRegex.exec(body)) !== null) {
    tasks.push({
      completed: match[1] === 'x',
      content: match[2].trim(),
      status: match[4] || null
    });
  }
  return tasks;
}

/**
 * Format tasks into a canonical checklist.
 *
 * Rules:
 *   - Open items first, then by type (TODO > PLACEHOLDER > NOTE), then alphabetical.
 *   - Preserve 'Added from comment' entries as-is (never auto-close them).
 *   - Preserve 'Manually marked as complete' entries.
 *   - Mark removed file-derived items as 'Resolved from file'.
 */
function formatTasks(currentTags, existingTasks) {
  const updatedTasks = [];

  for (const task of existingTasks) {
    if (task.status && task.status.startsWith('Added from comment')) {
      updatedTasks.push(task);
    } else if (currentTags.some(tag => tag.content === task.content)) {
      updatedTasks.push({ ...task, completed: false, status: 'Added from file' });
    } else if (task.completed && task.status === 'Manually marked as complete') {
      updatedTasks.push(task);
    } else {
      updatedTasks.push({ ...task, completed: true, status: 'Resolved from file' });
    }
  }

  for (const tag of currentTags) {
    if (!existingTasks.some(task => task.content === tag.content)) {
      updatedTasks.push({ ...tag, completed: false, status: 'Added from file' });
    }
  }

  const order = { TODO: 0, PLACEHOLDER: 1, NOTE: 2, ZZZ: 3 };
  function tagTypeOf(task) {
    const m = /(TODO|PLACEHOLDER|NOTE)/i.exec(task.content || '');
    return m ? m[1].toUpperCase() : 'ZZZ';
  }
  updatedTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const ta = order[tagTypeOf(a)] ?? 3;
    const tb = order[tagTypeOf(b)] ?? 3;
    if (ta !== tb) return ta - tb;
    const ca = (a.content || '').toLowerCase();
    const cb = (b.content || '').toLowerCase();
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });

  const text = updatedTasks.map(task => {
    let s = `- [${task.completed ? 'x' : ' '}] ${task.content}`;
    if (task.status) s += ` --> ${task.status} <--`;
    return s;
  }).join('\n');

  return { text, tasks: updatedTasks };
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
    // removed files don't need processFile; orphan cleanup handles them
  }

  const mdFiles = Array.from(files).filter(
    f => f.startsWith('docs/') && f.endsWith('.md')
  );
  return mdFiles.length > 0 ? mdFiles : null;
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
    this.openByFile = new Map();   // normPath -> issue (oldest)
    this.closedByFile = new Map(); // normPath -> issue (most recent, not auto-completed)
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

    // Build open-by-file map (keep oldest per file for consistency)
    for (const iss of this.allOpen) {
      const fp = extractFileFromIssue(iss);
      if (!fp) continue;
      const key = normalizePath(fp);
      if (!this.openByFile.has(key) || iss.number < this.openByFile.get(key).number) {
        this.openByFile.set(key, iss);
      }
    }

    // Build closed-by-file map (most recent, non-auto-completed)
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

  /** Return all open doc-tags issues grouped by normalized file path. */
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
    await handleNewComment({ github, owner, repo, issue, comment });
    return;
  }

  // ---- Push or workflow_dispatch ----
  console.log(`Event: ${context.eventName}`);

  // 1. Cache all issues (2 API paginated calls total)
  const cache = new IssueCache();
  await cache.load(github, owner, repo);

  // 2. Determine which files to scan
  const allFiles = await walkSync('docs');
  const allFilesSet = new Set(allFiles.map(normalizePath));
  console.log(`Found ${allFiles.length} Markdown files in docs/`);

  const changedFiles = getChangedFiles(context);
  const filesToProcess = changedFiles ? [...changedFiles] : [...allFiles];
  if (changedFiles) {
    // Verify changed files still exist (may have been deleted)
    const existing = [];
    for (const f of filesToProcess) {
      try {
        await fs.access(f);
        existing.push(f);
      } catch {
        console.log(`Changed file ${f} no longer exists (deleted); orphan cleanup will handle it`);
      }
    }
    filesToProcess.length = 0;
    filesToProcess.push(...existing);
    console.log(`Push event: processing ${filesToProcess.length} changed file(s)`);
  } else {
    console.log('Full scan: processing all files');
  }

  // Also process files that have open issues but weren't in the changed set
  // (to catch tag removals that didn't appear in the diff)
  for (const [fp] of cache.openByFile.entries()) {
    if (!filesToProcess.some(f => normalizePath(f) === fp) && allFilesSet.has(fp)) {
      filesToProcess.push(fp);
    }
  }

  // 3. Process each file
  for (const file of filesToProcess) {
    await processFile({ github, owner, repo, file, cache, closedThisRun, sha: context.sha });
  }

  // 4. Orphan cleanup – close issues for files that no longer exist
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

  // 5. De-duplicate – merge human-only entries, close extras
  console.log('Running de-duplication');
  const byFile = cache.groupByFile();
  let dupsClosed = 0;
  for (const [fp, issuesForFile] of byFile.entries()) {
    // Filter out issues we already closed
    const live = issuesForFile.filter(i => !closedThisRun.has(i.number));
    if (live.length <= 1) continue;

    live.sort((a, b) => a.number - b.number); // keep oldest
    const primary = live[0];
    console.log(`Dedup: ${live.length} issues for ${fp}, keeping #${primary.number}`);

    // Ensure primary has doc-tags label
    if (!hasLabel(primary, 'doc-tags')) {
      await github.rest.issues.addLabels({
        owner, repo, issue_number: primary.number, labels: ['doc-tags']
      });
    }

    // Merge human-sourced tasks from duplicates into primary
    const primaryFresh = await github.rest.issues.get({
      owner, repo, issue_number: primary.number
    });
    let mergedHuman = parseExistingTasks(primaryFresh.data.body || '').filter(keepForMerge);

    for (const dup of live.slice(1)) {
      const dupData = await github.rest.issues.get({
        owner, repo, issue_number: dup.number
      });
      const dupHuman = parseExistingTasks(dupData.data.body || '').filter(keepForMerge);
      mergedHuman = mergeTasksUnique(mergedHuman, dupHuman);
    }

    // Rebuild primary body
    let currentTags = [];
    if (allFilesSet.has(normalizePath(fp))) {
      try {
        const content = await fs.readFile(normalizePath(fp), 'utf8');
        currentTags = parseTags(content);
      } catch (e) {
        console.log(`Could not read ${fp} during dedup: ${e.message}`);
      }
    }

    const rebuilt = formatTasks(currentTags, mergedHuman);
    const openCount = rebuilt.tasks.filter(t => !t.completed).length;
    const totalCount = rebuilt.tasks.length;
    const labels = getLabel(fp);
    const primaryLabels = (primary.labels || []).map(l => l.name);
    const nextLabels = Array.from(new Set([...primaryLabels, 'doc-tags', ...labels]));

    await github.rest.issues.update({
      owner, repo, issue_number: primary.number,
      title: `(${openCount}/${totalCount} open) Tags in ${fp}`,
      body: buildBody(fp, owner, repo, context.sha, rebuilt.text),
      labels: nextLabels
    });

    for (const dup of live.slice(1)) {
      await github.rest.issues.createComment({
        owner, repo, issue_number: dup.number,
        body: `Duplicate of #${primary.number}. Consolidating into a single tracking issue for ${fp}. Closing this one.`
      });
      try {
        await github.rest.issues.addLabels({
          owner, repo, issue_number: dup.number, labels: ['duplicate']
        });
      } catch (e) {
        // label may not exist yet
      }
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

async function processFile({ github, owner, repo, file, cache, closedThisRun, sha }) {
  const content = await fs.readFile(file, 'utf8');
  const currentTags = parseTags(content);
  const existingIssue = cache.findOpen(file);

  if (currentTags.length === 0 && !existingIssue) return; // nothing to do

  const labels = getLabel(file);
  console.log(`${file}: ${currentTags.length} tag(s), existing issue: ${existingIssue ? '#' + existingIssue.number : 'none'}`);

  if (existingIssue) {
    // Update existing open issue
    const existingTasks = parseExistingTasks(existingIssue.body);
    const { text, tasks } = formatTasks(currentTags, existingTasks);
    const openCount = tasks.filter(t => !t.completed).length;
    const totalCount = tasks.length;
    const title = `(${openCount}/${totalCount} open) Tags in ${file}`;
    const body = buildBody(file, owner, repo, sha, text);

    const currentLabels = (existingIssue.labels || []).map(l => l.name);
    const nextLabels = Array.from(new Set([...currentLabels, 'doc-tags', ...labels]));

    await github.rest.issues.update({
      owner, repo, issue_number: existingIssue.number,
      title, body, labels: nextLabels
    });

    // Auto-close if no tasks remain or all complete
    if (totalCount === 0) {
      await github.rest.issues.createComment({
        owner, repo, issue_number: existingIssue.number,
        body: 'No valid TODO/NOTE/PLACEHOLDER items remain in the source file. Closing this empty issue.'
      });
      await github.rest.issues.update({
        owner, repo, issue_number: existingIssue.number,
        state: 'closed', labels: ['doc-tags', ...labels, 'doc-tags-complete']
      });
      closedThisRun.add(existingIssue.number);
    } else if (openCount === 0) {
      await github.rest.issues.createComment({
        owner, repo, issue_number: existingIssue.number,
        body: 'All tasks are complete. Closing this issue.'
      });
      await github.rest.issues.update({
        owner, repo, issue_number: existingIssue.number,
        state: 'closed', labels: ['doc-tags', ...labels, 'doc-tags-complete']
      });
      closedThisRun.add(existingIssue.number);
    }
  } else {
    // No open issue – create or reopen
    const { text, tasks } = formatTasks(currentTags, []);
    const openCount = tasks.filter(t => !t.completed).length;
    const totalCount = tasks.length;
    const title = `(${openCount}/${totalCount} open) Tags in ${file}`;
    const body = buildBody(file, owner, repo, sha, text);

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
// Comment handler (issue_comment event)
// ---------------------------------------------------------------------------

async function handleNewComment({ github, owner, repo, issue, comment }) {
  const tagRegex = /^\s*(?:>+\s*)?(?:(?:[-*+]\s+|\d+\.\s+))?(?:\[[ xX]\]\s+)?(?:\*\*|__|\*|_)?\[?(TODO|PLACEHOLDER|NOTE)\]?\b(?::|\s).+?(?:\*\*|__|\*|_)?$/gm;
  const newTasks = [];
  let match;

  while ((match = tagRegex.exec(comment.body)) !== null) {
    newTasks.push(`- [ ] ${match[0].trim()} --> Added from comment #${comment.id} <--`);
  }

  if (newTasks.length === 0) {
    console.log('No tags found in comment');
    return;
  }

  // Re-read the issue body fresh to avoid race conditions
  const fresh = await github.rest.issues.get({
    owner, repo, issue_number: issue.number
  });
  const freshBody = fresh.data.body || '';

  const updatedBody = `${freshBody}\n${newTasks.join('\n')}`;
  const tasksAfter = parseExistingTasks(updatedBody);
  const openCount = tasksAfter.filter(t => !t.completed).length;
  const totalCount = tasksAfter.length;

  const fileMatch = fresh.data.title.match(/^\(\d+\/\d+ open\)\s+Tags in (.+)$|^Tags in (.+?)(?:\s*\(|$)/);
  const fileForTitle = fileMatch ? (fileMatch[1] || fileMatch[2]) : null;
  const newTitle = fileForTitle
    ? `(${openCount}/${totalCount} open) Tags in ${fileForTitle}`
    : fresh.data.title;

  await github.rest.issues.update({
    owner, repo, issue_number: issue.number,
    title: newTitle, body: updatedBody
  });
  console.log(`Added ${newTasks.length} task(s) from comment to issue #${issue.number}`);
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

function buildBody(file, owner, repo, sha, formattedTasks) {
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const url = `${serverUrl}/${owner}/${repo}/blob/${sha}/${file}`;
  return [
    `File: [${file}](${url})`,
    '',
    'Tasks:',
    formattedTasks,
    '',
    'Important: do not change the status of tasks tagged as "Added from file". These tasks depend on to-do tags in the original file. To change the status of these tasks, please edit the md file directly.'
  ].join('\n');
}

function keepForMerge(task) {
  return Boolean(task) && (
    (task.status && task.status.startsWith('Added from comment')) ||
    (task.completed === true && task.status === 'Manually marked as complete')
  );
}

function mergeTasksUnique(baseTasks, extraTasks) {
  const map = new Map();
  for (const t of baseTasks) map.set(t.content, t);
  for (const t of extraTasks) {
    const existing = map.get(t.content);
    if (!existing) {
      map.set(t.content, t);
    } else {
      const isMan = x => x.completed === true && x.status === 'Manually marked as complete';
      const isCompletedComment = x => (x.status || '').startsWith('Added from comment') && x.completed === true;
      if (isMan(t) && !isMan(existing)) map.set(t.content, t);
      else if (isCompletedComment(t) && !isCompletedComment(existing)) map.set(t.content, t);
    }
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  run,
  // Pure functions for testing
  normalizePath,
  hasLabel,
  wasAutoCompleted,
  isDocTagsIssue,
  extractFileFromIssue,
  getLabel,
  parseTags,
  parseExistingTasks,
  formatTasks,
  getChangedFiles,
  keepForMerge,
  mergeTasksUnique,
  buildBody,
  walkSync,
};
