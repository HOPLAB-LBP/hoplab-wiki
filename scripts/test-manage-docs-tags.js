#!/usr/bin/env node
/**
 * Comprehensive test suite for manage-docs-tags.js
 * Covers all edge cases including non-technical user scenarios.
 * Run with: node scripts/test-manage-docs-tags.js
 */

const {
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
} = require('./manage-docs-tags.js');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(name);
    console.error(`  FAIL: ${name}`);
  }
}

function assertEqual(actual, expected, name) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failed++;
    failures.push(name);
    console.error(`  FAIL: ${name}`);
    console.error(`    expected: ${JSON.stringify(expected)}`);
    console.error(`    actual:   ${JSON.stringify(actual)}`);
  } else {
    passed++;
  }
}

// =========================================================================
// normalizePath
// =========================================================================
console.log('\n--- normalizePath ---');
assertEqual(normalizePath('docs\\foo\\bar.md'), 'docs/foo/bar.md', 'backslash to forward slash');
assertEqual(normalizePath('/docs/foo.md'), 'docs/foo.md', 'strip leading slash');
assertEqual(normalizePath('///docs/foo.md'), 'docs/foo.md', 'strip multiple leading slashes');
assertEqual(normalizePath(''), '', 'empty string');
assertEqual(normalizePath(null), '', 'null');
assertEqual(normalizePath(undefined), '', 'undefined');
assertEqual(normalizePath('docs/foo.md'), 'docs/foo.md', 'already normalized');
assertEqual(normalizePath('docs/sub dir/file name.md'), 'docs/sub dir/file name.md', 'spaces preserved');

// =========================================================================
// normalizeTaskContent
// =========================================================================
console.log('\n--- normalizeTaskContent ---');

// Formatting variants that MUST produce the same key
{
  const variants = [
    'TODO: add feature',
    '**TODO:** add feature',
    '__TODO__: add feature',
    '___TODO___: add feature',
    '*TODO*: add feature',
    '_TODO_: add feature',
    '[TODO]: add feature',
    '- TODO: add feature',
    '- **TODO:** add feature',
    '- __TODO__: add feature',
    '* TODO: add feature',
    '1. TODO: add feature',
    '> TODO: add feature',
    '  TODO:  add  feature',
  ];
  const normalized = variants.map(normalizeTaskContent);
  const expected = 'TODO: add feature';
  for (let i = 0; i < variants.length; i++) {
    assertEqual(normalized[i], expected, `normalize variant: ${variants[i]}`);
  }
}

// Author brackets preserved (only tag keyword brackets stripped)
assertEqual(
  normalizeTaskContent('TODO: [Andrea] fix links'),
  'TODO: [Andrea] fix links',
  'normalize: author brackets preserved'
);
assertEqual(
  normalizeTaskContent('TODO: fix [Andrea] link (see https://example.com)'),
  'TODO: fix [Andrea] link (see https://example.com)',
  'normalize: non-tag brackets preserved'
);

// Hmm, let me check. The regex is /\[(TODO|PLACEHOLDER|NOTE)\]/g
// So [TODO] -> TODO, but [Andrea] stays as [Andrea]
// But the * and _ stripping is global...
// Let me check what actually happens:
{
  const result = normalizeTaskContent('__[TODO]__: [Andrea] fix **bold** links');
  // __ gets stripped, [TODO] -> TODO, but [Andrea] stays, ** gets stripped
  assertEqual(result, 'TODO: [Andrea] fix bold links', 'normalize: complex mixed formatting');
}

// Empty / edge cases
assertEqual(normalizeTaskContent(''), '', 'normalize: empty string');
assertEqual(normalizeTaskContent('   '), '', 'normalize: whitespace only');
assertEqual(normalizeTaskContent('TODO:'), 'TODO:', 'normalize: tag with colon only');

// =========================================================================
// hasLabel / wasAutoCompleted / isDocTagsIssue
// =========================================================================
console.log('\n--- hasLabel / wasAutoCompleted / isDocTagsIssue ---');
assert(hasLabel({ labels: [{ name: 'doc-tags' }] }, 'doc-tags'), 'hasLabel: match');
assert(!hasLabel({ labels: [{ name: 'bug' }] }, 'doc-tags'), 'hasLabel: no match');
assert(!hasLabel({ labels: [] }, 'doc-tags'), 'hasLabel: empty labels');
assert(!hasLabel({}, 'doc-tags'), 'hasLabel: no labels prop');
assert(!hasLabel({ labels: null }, 'doc-tags'), 'hasLabel: null labels');

assert(wasAutoCompleted({ labels: [{ name: 'doc-tags-complete' }] }), 'wasAutoCompleted: yes');
assert(!wasAutoCompleted({ labels: [{ name: 'doc-tags' }] }), 'wasAutoCompleted: no');

assert(isDocTagsIssue({ labels: [{ name: 'doc-tags' }], title: 'x' }), 'isDocTags: by label');
assert(isDocTagsIssue({ labels: [], title: '[3 open] Tags in docs/foo.md' }), 'isDocTags: current title');
assert(isDocTagsIssue({ labels: [], title: 'Tags in docs/foo.md [3 open]' }), 'isDocTags: previous title');
assert(isDocTagsIssue({ labels: [], title: '(2/5 open) Tags in docs/foo.md' }), 'isDocTags: legacy title');
assert(isDocTagsIssue({ labels: [], title: 'Tags in docs/foo.md' }), 'isDocTags: simple title');
assert(!isDocTagsIssue({ labels: [], title: 'Fix the tags parser' }), 'isDocTags: unrelated');
assert(!isDocTagsIssue({ labels: [{ name: 'bug' }], title: 'Bug report' }), 'isDocTags: no match');

// =========================================================================
// extractFileFromIssue
// =========================================================================
console.log('\n--- extractFileFromIssue ---');

// Current format: "[N open] Tags in file"
assertEqual(extractFileFromIssue({ title: '[5 open] Tags in docs/foo.md' }), 'docs/foo.md', 'extract: current format');
assertEqual(extractFileFromIssue({ title: '[0 open] Tags in docs/foo.md' }), 'docs/foo.md', 'extract: current format zero');
assertEqual(extractFileFromIssue({ title: '[4 open] Tags in docs/research/fmri/analysis/fmri-glm.md' }),
  'docs/research/fmri/analysis/fmri-glm.md', 'extract: current deep nested');

// Previous format: "Tags in file [N open]"
assertEqual(extractFileFromIssue({ title: 'Tags in docs/foo.md [5 open]' }), 'docs/foo.md', 'extract: previous format');
assertEqual(extractFileFromIssue({ title: 'Tags in docs/foo.md [0 open]' }), 'docs/foo.md', 'extract: previous format zero');
assertEqual(extractFileFromIssue({ title: 'Tags in docs/research/fmri/analysis/fmri-glm.md [4 open]' }),
  'docs/research/fmri/analysis/fmri-glm.md', 'extract: previous deep nested');

// Legacy format
assertEqual(extractFileFromIssue({ title: '(2/5 open) Tags in docs/foo.md' }), 'docs/foo.md', 'extract: legacy');
assertEqual(extractFileFromIssue({ title: '(0/0 open) Tags in docs/bar.md' }), 'docs/bar.md', 'extract: legacy zero');

// Simple format
assertEqual(extractFileFromIssue({ title: 'Tags in docs/bar.md' }), 'docs/bar.md', 'extract: simple');

// Fallback to body
assertEqual(extractFileFromIssue({ title: 'Unrelated', body: 'File: [docs/baz.md](https://...)' }),
  'docs/baz.md', 'extract: body fallback');

// No match
assertEqual(extractFileFromIssue({ title: 'Bug fix', body: 'No file here' }), null, 'extract: no match');
assertEqual(extractFileFromIssue({ title: '', body: '' }), null, 'extract: empty');
assertEqual(extractFileFromIssue({}), null, 'extract: empty object');

// File with spaces (edge case)
assertEqual(extractFileFromIssue({ title: '[1 open] Tags in docs/my file.md' }),
  'docs/my file.md', 'extract: current file with spaces');
assertEqual(extractFileFromIssue({ title: 'Tags in docs/my file.md [1 open]' }),
  'docs/my file.md', 'extract: previous file with spaces');

// =========================================================================
// getLabel
// =========================================================================
console.log('\n--- getLabel ---');
assertEqual(getLabel('docs/index.md'), ['general'], 'label: root docs');
assertEqual(getLabel('docs/contribute.md'), ['general'], 'label: root file');
assertEqual(getLabel('docs/research/index.md'), ['general'], 'label: research root -> general');
assertEqual(getLabel('docs/research/fmri/analysis/fmri-glm.md'), ['fmri', 'analysis'], 'label: nested');
assertEqual(getLabel('docs/get-started/admin-procedures.md'), ['get-started'], 'label: single subdir');
assertEqual(getLabel('docs/research/eeg/eeg-task.md'), ['eeg'], 'label: eeg');
assertEqual(getLabel('docs/research/behaviour/experimental-setup/pavlovia-psychopy.md'),
  ['behaviour', 'experimental-setup'], 'label: behaviour nested');
assertEqual(getLabel('docs/research/ethics/MEC.md'), ['ethics'], 'label: ethics');

// =========================================================================
// parseTags — exhaustive edge cases
// =========================================================================
console.log('\n--- parseTags: basic detection ---');

// Standard tags
{
  const t = parseTags('TODO: add this\nPLACEHOLDER: fill in\nNOTE: remember');
  assertEqual(t.length, 3, 'basic: 3 tags');
  assertEqual(t.map(x => x.type), ['TODO', 'PLACEHOLDER', 'NOTE'], 'basic: correct types');
}

// Single tag
assertEqual(parseTags('TODO: one thing').length, 1, 'single tag');
assertEqual(parseTags('PLACEHOLDER: holder').length, 1, 'single placeholder');
assertEqual(parseTags('NOTE: a note').length, 1, 'single note');

console.log('\n--- parseTags: formatting variants ---');

// Bold
assertEqual(parseTags('**TODO:** bold task').length, 1, 'bold asterisk');
assertEqual(parseTags('__TODO__: underscore bold').length, 1, 'underscore bold');
assertEqual(parseTags('***TODO:*** triple asterisk').length, 1, 'triple asterisk');
assertEqual(parseTags('___TODO___: triple underscore').length, 1, 'triple underscore');

// Brackets
assertEqual(parseTags('[TODO]: bracketed').length, 1, 'bracketed tag');
assertEqual(parseTags('__[TODO]:__ bracketed bold').length, 1, 'bracketed + bold');

// List items
assertEqual(parseTags('- TODO: dash list').length, 1, 'dash list');
assertEqual(parseTags('* TODO: star list').length, 1, 'star list');
assertEqual(parseTags('+ TODO: plus list').length, 1, 'plus list');
assertEqual(parseTags('1. TODO: numbered list').length, 1, 'numbered list');
assertEqual(parseTags('42. TODO: high number list').length, 1, 'high number list');

// Checkbox (legacy, should still detect)
assertEqual(parseTags('- [ ] TODO: unchecked').length, 1, 'unchecked checkbox');
assertEqual(parseTags('- [x] TODO: checked').length, 1, 'checked checkbox');
assertEqual(parseTags('- [X] TODO: checked upper').length, 1, 'checked checkbox upper');

// Blockquote
assertEqual(parseTags('> TODO: quoted').length, 1, 'blockquote');
assertEqual(parseTags('>> TODO: double quoted').length, 1, 'double blockquote');

// Indented
assertEqual(parseTags('    TODO: indented 4 spaces').length, 1, 'indented 4 spaces');
assertEqual(parseTags('\tTODO: tabbed').length, 1, 'tabbed');

// Tag with extra spaces
assertEqual(parseTags('TODO:  extra  spaces  in content').length, 1, 'extra spaces');
assertEqual(parseTags('TODO :  space before colon').length, 1, 'space before colon');

console.log('\n--- parseTags: things that should NOT match ---');

// Lowercase
assertEqual(parseTags('todo: lowercase').length, 0, 'lowercase todo');
assertEqual(parseTags('Todo: mixed case').length, 0, 'mixed case Todo');
assertEqual(parseTags('note: lowercase note').length, 0, 'lowercase note');
assertEqual(parseTags('Note: mixed Note').length, 0, 'mixed Note');
assertEqual(parseTags('placeholder: lower').length, 0, 'lowercase placeholder');

// Bare keyword (no colon or content)
assertEqual(parseTags('TODO').length, 0, 'bare TODO');
assertEqual(parseTags('NOTE').length, 0, 'bare NOTE');
assertEqual(parseTags('PLACEHOLDER').length, 0, 'bare PLACEHOLDER');

// Keyword with colon but no content
assertEqual(parseTags('TODO:').length, 0, 'TODO colon no content');
assertEqual(parseTags('TODO:   ').length, 0, 'TODO colon only spaces');

// Keyword in middle of word
assertEqual(parseTags('AUTOTODO: not a tag').length, 0, 'keyword mid-word: AUTOTODO');
// Wait -- let me check. normalizeForMatch strips list markers etc, then strictTag tests /^(TODO|...)/.
// "AUTOTODO: not a tag" after normalization is still "AUTOTODO: not a tag" which starts with A, not TODO.
// Correct, should not match.

// Keyword in sentence (not at start after normalization)
assertEqual(parseTags('Please remember TODO: add it later').length, 0, 'tag mid-sentence');
// After normalization: "Please remember TODO: add it later" - starts with "Please", won't match ^TODO

// Admonition declarations
assertEqual(parseTags('!!! note "This is a note"').length, 0, 'admonition !!! note');
assertEqual(parseTags('??? note "Collapsible"').length, 0, 'admonition ??? note');
assertEqual(parseTags('::: note').length, 0, 'admonition ::: note');
// But NOTE keyword that's not an admonition declaration:
assertEqual(parseTags('!!! tip "Tip"\n    NOTE: inside admonition body').length, 1,
  'NOTE inside admonition body (not declaration)');

console.log('\n--- parseTags: code blocks and inline code ---');

// Fenced code block
assertEqual(parseTags('```\nTODO: in code\n```').length, 0, 'fenced block: ignored');
assertEqual(parseTags('```python\nTODO: in python block\n```').length, 0, 'fenced python: ignored');
assertEqual(parseTags('```\nTODO: block 1\n```\nTODO: outside\n```\nTODO: block 2\n```').length, 1,
  'between blocks: only outside');

// Indented code block with fence
assertEqual(parseTags('  ```\n  TODO: indented block\n  ```').length, 0, 'indented fence: ignored');

// Inline code
assertEqual(parseTags('run `TODO: inline` test').length, 0, 'inline code: ignored');
assertEqual(parseTags('`TODO: code` and `NOTE: more code`').length, 0, 'multiple inline codes');
// After inline code stripping: "prefix  TODO: real tag" — starts with "prefix", not at line start
assertEqual(parseTags('prefix `TODO: code` TODO: real tag').length, 0,
  'inline code + real tag after text: not matched (not at start)');

// Code block doesn't leak
assertEqual(parseTags('before\n```\nTODO: in code\n```\nTODO: after code').length, 1,
  'after code block: detected');

// Unmatched backticks (edge case)
assertEqual(parseTags('```\nTODO: no closing fence').length, 0,
  'unclosed fence: treats rest as code');

console.log('\n--- parseTags: deduplication via normalization ---');

// Same content, different formatting -> single tag
assertEqual(parseTags('**TODO:** add feature\n__TODO__: add feature').length, 1,
  'dedup: bold vs underscore');
assertEqual(parseTags('TODO: add feature\n- TODO: add feature').length, 1,
  'dedup: plain vs list item');
assertEqual(parseTags('[TODO]: add feature\nTODO: add feature').length, 1,
  'dedup: bracket vs plain');

// Different content -> separate tags
assertEqual(parseTags('TODO: feature A\nTODO: feature B').length, 2,
  'no dedup: different content');

console.log('\n--- parseTags: real-world patterns from the wiki ---');

// Patterns actually found in the codebase
assertEqual(parseTags('**TODO:** add info about the codes sent by each box.').length, 1,
  'real: bold TODO with period');
assertEqual(parseTags('**TODO:** MATLAB and PTB have been updated to newer version!').length, 1,
  'real: bold TODO with exclamation');
assertEqual(parseTags('__TODO__: [Andrea] Create the template and link it here.').length, 1,
  'real: underscore with author');
assertEqual(parseTags('- __[TODO]:__ Add example directories').length, 1,
  'real: list + underscore + bracket');
assertEqual(parseTags('- __[PLACEHOLDER]:__ Add a screenshot').length, 1,
  'real: PLACEHOLDER variant');
assertEqual(parseTags('- NOTE: if you are running a pilot').length, 1,
  'real: NOTE in list');
// Standalone **NOTE: ...** at line start: after stripping bold, starts with NOTE -> IS a match
assertEqual(parseTags('**NOTE: Amendments can only be submitted**').length, 1,
  'standalone bold NOTE at line start: matched correctly');

// But in full sentence context (real SMEC.md line 64), NOTE is mid-line -> NOT matched
{
  const fullLine = '3. Make any necessary changes to the dossier, giving a clear explanation of changes on the communication page prior to submission. **NOTE: Amendments can only be submitted for **small modifications or extensions**, and only for dossiers that are less than 4 years old.';
  const tags = parseTags(fullLine);
  assertEqual(tags.length, 0, 'real SMEC: NOTE mid-sentence after numbered list NOT matched');
}

// Tag at start of line after list marker
{
  const tags = parseTags('3. NOTE: this is a real note at start');
  assertEqual(tags.length, 1, 'real: numbered list + NOTE at start');
}

console.log('\n--- parseTags: tricky non-technical user mistakes ---');

// User writes "Todo" instead of "TODO"
assertEqual(parseTags('Todo: user wrote wrong case').length, 0, 'user mistake: Title case');
assertEqual(parseTags('tODO: random case').length, 0, 'user mistake: random case');

// User writes tag without colon
assertEqual(parseTags('TODO add feature without colon').length, 1, 'no colon: space after TODO works');
assertEqual(parseTags('TODO').length, 0, 'no colon no content: not matched');

// User writes tag on line with other content before it
assertEqual(parseTags('Some text TODO: embedded tag').length, 0, 'embedded: not at line start');

// User puts tag after heading
assertEqual(parseTags('## TODO: heading tag').length, 0,
  'heading: ## is not stripped by normalizeForMatch');
// Actually, ## is NOT a list marker or blockquote, so normalizeForMatch keeps it.
// After normalize: "## TODO: heading tag" -> stripped bold/underline -> "## TODO: heading tag"
// strictTag: /^(TODO|...)/ -> starts with ##, not TODO. Correct: no match.

// User writes tag in HTML comment (should not match because it's a comment)
assertEqual(parseTags('<!-- TODO: hidden comment -->').length, 0,
  'HTML comment: not matched (inline code stripping handles backticks, not HTML)');
// Wait -- HTML comments aren't stripped. Let me check:
// "<!-- TODO: hidden comment -->" after stripCode: no change (not in backticks)
// After normalizeForMatch: no change (no list markers, blockquotes, etc.)
// strictTag: /^(TODO|...)/ -> starts with "<!--", not TODO. Correct: no match.

// User writes in a table cell
{
  const table = '| Column 1 | Column 2 |\n|---|---|\n| TODO: in table | value |';
  const tags = parseTags(table);
  // "| TODO: in table | value |" -> no list marker stripping. normalizeForMatch leaves it as is.
  // Starts with "| TODO:" -> not ^TODO. Should not match.
  assertEqual(tags.length, 0, 'table cell: not matched (pipe prefix)');
}

// User writes at very start of file
assertEqual(parseTags('TODO: very first line\nother content').length, 1, 'first line of file');

// User writes with Windows line endings
assertEqual(parseTags('TODO: windows line\r\nmore text').length, 1, 'Windows CRLF');

// Empty file
assertEqual(parseTags('').length, 0, 'empty file');

// File with only whitespace
assertEqual(parseTags('   \n\n  \n').length, 0, 'whitespace only file');

// File with only code blocks
assertEqual(parseTags('```\ncode\n```').length, 0, 'only code block');

// =========================================================================
// parseExistingTasks — new format
// =========================================================================
console.log('\n--- parseExistingTasks: new format ---');

{
  const body = [
    'File: [docs/foo.md](url)',
    '',
    '**Tasks:**',
    '',
    '- **TODO:** add feature [(file)](https://github.com/X/Y/edit/main/docs/foo.md) <!-- source:file -->',
    '- NOTE: from comment [(comment)](https://github.com/X/Y/issues/1#issuecomment-456) <!-- source:comment:456 -->',
    '',
    '---',
    '*footer*'
  ].join('\n');

  const tasks = parseExistingTasks(body);
  assertEqual(tasks.length, 2, 'new format: 2 tasks');
  assertEqual(tasks[0].source, 'file', 'new format: first is file');
  assert(tasks[0].content.includes('TODO'), 'new format: first has TODO');
  assert(!tasks[0].content.includes('[(file)]'), 'new format: source label stripped from content');
  assertEqual(tasks[1].source, 'comment', 'new format: second is comment');
  assertEqual(tasks[1].commentId, '456', 'new format: comment ID');
}

// Empty body
assertEqual(parseExistingTasks('').length, 0, 'new format: empty body');

// Body with no tasks
assertEqual(parseExistingTasks('File: [f](u)\n\nNo open tasks.').length, 0, 'new format: no tasks text');

// Single file task
{
  const body = '- TODO: single task [(file)](url) <!-- source:file -->';
  const tasks = parseExistingTasks(body);
  assertEqual(tasks.length, 1, 'new format: single task');
  assertEqual(tasks[0].source, 'file', 'new format: single is file');
}

// Single comment task
{
  const body = '- TODO: comment task [(comment)](url) <!-- source:comment:789 -->';
  const tasks = parseExistingTasks(body);
  assertEqual(tasks.length, 1, 'new format: single comment');
  assertEqual(tasks[0].commentId, '789', 'new format: comment ID 789');
}

console.log('\n--- parseExistingTasks: legacy format ---');

{
  const body = [
    '- [ ] TODO: open task --> Added from file <--',
    '- [x] TODO: resolved --> Resolved from file <--',
    '- [ ] NOTE: comment task --> Added from comment #123 <--',
    '- [x] TODO: manually done --> Manually marked as complete <--',
    '- [ ] PLACEHOLDER: no status',
  ].join('\n');

  const tasks = parseExistingTasks(body);
  // Resolved from file should be DROPPED
  // Manually marked as complete: preserved (legacy)
  // The rest: kept
  assertEqual(tasks.length, 4, 'legacy: 4 tasks (1 resolved dropped)');
  assertEqual(tasks[0].source, 'file', 'legacy: first is file');
  assertEqual(tasks[1].source, 'comment', 'legacy: comment task');
  assertEqual(tasks[1].commentId, '123', 'legacy: comment ID');
  assertEqual(tasks[2]._legacyStatus, 'Manually marked as complete', 'legacy: manual status');
  assertEqual(tasks[3].source, 'file', 'legacy: no-status task is file');
}

// Mixed format should prefer new over legacy
{
  const body = [
    '- TODO: new format [(file)](url) <!-- source:file -->',
    '- [ ] TODO: legacy --> Added from file <--',
  ].join('\n');
  const tasks = parseExistingTasks(body);
  // New format regex runs first and finds 1 task. Since tasks.length > 0, legacy regex skipped.
  assertEqual(tasks.length, 1, 'mixed: new format takes priority');
  assertEqual(tasks[0].source, 'file', 'mixed: new format task');
}

// =========================================================================
// formatTasks
// =========================================================================
console.log('\n--- formatTasks: file tags only ---');

{
  const tags = [
    { type: 'TODO', content: 'TODO: alpha', normalizedKey: 'TODO: alpha' },
    { type: 'NOTE', content: 'NOTE: beta', normalizedKey: 'NOTE: beta' },
  ];
  const { tasks, text } = formatTasks(tags, []);
  assertEqual(tasks.length, 2, 'file only: 2 tasks');
  assert(!text.includes('- [ ]'), 'file only: no checkboxes');
  assert(!text.includes('- [x]'), 'file only: no checked boxes');
  assert(text.includes('<!-- source:file -->'), 'file only: has metadata');
}

console.log('\n--- formatTasks: resolved file tags disappear ---');

{
  const tags = []; // all tags removed from file
  const existing = [
    { content: 'TODO: was here', normalizedKey: 'TODO: was here', source: 'file', commentId: null },
    { content: 'TODO: also here', normalizedKey: 'TODO: also here', source: 'file', commentId: null },
  ];
  const { tasks } = formatTasks(tags, existing);
  assertEqual(tasks.length, 0, 'resolved: all file tasks gone');
}

// Partial removal
{
  const tags = [
    { type: 'TODO', content: 'TODO: still here', normalizedKey: 'TODO: still here' },
  ];
  const existing = [
    { content: 'TODO: still here', normalizedKey: 'TODO: still here', source: 'file', commentId: null },
    { content: 'TODO: removed', normalizedKey: 'TODO: removed', source: 'file', commentId: null },
  ];
  const { tasks } = formatTasks(tags, existing);
  assertEqual(tasks.length, 1, 'partial resolve: 1 task remains');
  assertEqual(tasks[0].content, 'TODO: still here', 'partial resolve: correct task kept');
}

console.log('\n--- formatTasks: comment tasks preserved ---');

{
  const tags = []; // no file tags
  const existing = [
    { content: 'TODO: from comment', normalizedKey: 'TODO: from comment', source: 'comment', commentId: '42' },
  ];
  const { tasks } = formatTasks(tags, existing);
  assertEqual(tasks.length, 1, 'comment preserved: 1 task');
  assertEqual(tasks[0].source, 'comment', 'comment preserved: source');
  assertEqual(tasks[0].commentId, '42', 'comment preserved: ID');
}

// Comment task survives even when all file tags removed
{
  const tags = [];
  const existing = [
    { content: 'TODO: file task', normalizedKey: 'TODO: file task', source: 'file', commentId: null },
    { content: 'TODO: comment task', normalizedKey: 'TODO: comment task', source: 'comment', commentId: '10' },
  ];
  const { tasks } = formatTasks(tags, existing);
  assertEqual(tasks.length, 1, 'comment survives file removal');
  assertEqual(tasks[0].source, 'comment', 'surviving task is comment');
}

console.log('\n--- formatTasks: dedup file vs comment ---');

// If same content exists as both file tag and comment task, comment takes priority
{
  const tags = [
    { type: 'TODO', content: 'TODO: same thing', normalizedKey: 'TODO: same thing' },
  ];
  const existing = [
    { content: 'TODO: same thing', normalizedKey: 'TODO: same thing', source: 'comment', commentId: '5' },
  ];
  const { tasks } = formatTasks(tags, existing);
  assertEqual(tasks.length, 1, 'file+comment same: only 1');
  assertEqual(tasks[0].source, 'comment', 'file+comment same: comment wins');
}

console.log('\n--- formatTasks: sorting ---');

{
  const tags = [
    { type: 'NOTE', content: 'NOTE: zebra', normalizedKey: 'NOTE: zebra' },
    { type: 'TODO', content: 'TODO: apple', normalizedKey: 'TODO: apple' },
    { type: 'PLACEHOLDER', content: 'PLACEHOLDER: middle', normalizedKey: 'PLACEHOLDER: middle' },
    { type: 'TODO', content: 'TODO: banana', normalizedKey: 'TODO: banana' },
  ];
  const { tasks } = formatTasks(tags, []);
  assertEqual(tasks[0].content, 'TODO: apple', 'sort: TODO first alpha');
  assertEqual(tasks[1].content, 'TODO: banana', 'sort: TODO second alpha');
  assertEqual(tasks[2].content, 'PLACEHOLDER: middle', 'sort: PLACEHOLDER');
  assertEqual(tasks[3].content, 'NOTE: zebra', 'sort: NOTE last');
}

console.log('\n--- formatTasks: output with links ---');

{
  process.env.GITHUB_SERVER_URL = 'https://github.com';
  const tags = [
    { type: 'TODO', content: 'TODO: file task', normalizedKey: 'TODO: file task' },
  ];
  const existing = [
    { content: 'NOTE: comment', normalizedKey: 'NOTE: comment', source: 'comment', commentId: '99' },
  ];
  const { text } = formatTasks(tags, existing, {
    filePath: 'docs/foo.md',
    owner: 'HOPLAB-LBP',
    repo: 'hoplab-wiki',
    commentUrlBase: 'https://github.com/HOPLAB-LBP/hoplab-wiki/issues/100',
  });
  assert(text.includes('[(file)](https://github.com/HOPLAB-LBP/hoplab-wiki/edit/main/docs/foo.md)'),
    'output: file link in edit mode');
  assert(text.includes('[(comment)](https://github.com/HOPLAB-LBP/hoplab-wiki/issues/100#issuecomment-99)'),
    'output: comment link');
  assert(text.includes('<!-- source:file -->'), 'output: file metadata');
  assert(text.includes('<!-- source:comment:99 -->'), 'output: comment metadata');
}

// Without URLs (fallback)
{
  const tags = [
    { type: 'TODO', content: 'TODO: task', normalizedKey: 'TODO: task' },
  ];
  const { text } = formatTasks(tags, []);
  assert(text.includes('(file)'), 'output fallback: plain (file) label');
  assert(text.includes('<!-- source:file -->'), 'output fallback: still has metadata');
}

// =========================================================================
// getChangedFiles
// =========================================================================
console.log('\n--- getChangedFiles ---');

assertEqual(getChangedFiles({ eventName: 'workflow_dispatch', payload: {} }), null, 'dispatch: null');
assertEqual(getChangedFiles({ eventName: 'issue_comment', payload: {} }), null, 'comment: null');
assertEqual(getChangedFiles({ eventName: 'push', payload: { commits: [] } }), null, 'push empty: null');
assertEqual(getChangedFiles({ eventName: 'push', payload: {} }), null, 'push no commits: null');

{
  const ctx = {
    eventName: 'push',
    payload: { commits: [{ added: ['docs/a.md'], modified: ['docs/b.md'], removed: ['docs/c.md'] }] }
  };
  const r = getChangedFiles(ctx);
  assertEqual(r.length, 2, 'push: added+modified, not removed');
  assert(r.includes('docs/a.md'), 'push: includes added');
  assert(r.includes('docs/b.md'), 'push: includes modified');
}

{
  const r = getChangedFiles({ eventName: 'push', payload: { commits: [{ added: ['README.md'], modified: [], removed: [] }] } });
  assert(Array.isArray(r), 'push: non-docs returns array');
  assertEqual(r.length, 0, 'push: non-docs returns empty array');
}

// Multi-commit dedup
{
  const ctx = {
    eventName: 'push',
    payload: { commits: [
      { added: ['docs/x.md'], modified: [], removed: [] },
      { added: [], modified: ['docs/x.md', 'docs/y.md'], removed: [] },
    ]}
  };
  const r = getChangedFiles(ctx);
  assertEqual(r.length, 2, 'multi-commit: deduplicates');
}

// =========================================================================
// buildTitle
// =========================================================================
console.log('\n--- buildTitle ---');
assertEqual(buildTitle('docs/foo.md', 5), '[5 open] Tags in docs/foo.md', 'title: 5 open');
assertEqual(buildTitle('docs/foo.md', 0), '[0 open] Tags in docs/foo.md', 'title: 0 open');
assertEqual(buildTitle('docs/foo.md', 1), '[1 open] Tags in docs/foo.md', 'title: 1 open');

// Verify the new title can be parsed back
{
  const title = buildTitle('docs/research/fmri/index.md', 3);
  const fp = extractFileFromIssue({ title });
  assertEqual(fp, 'docs/research/fmri/index.md', 'title roundtrip: file extracted correctly');
}

// =========================================================================
// buildBody
// =========================================================================
console.log('\n--- buildBody ---');

{
  process.env.GITHUB_SERVER_URL = 'https://github.com';
  const body = buildBody('docs/foo.md', 'HOPLAB-LBP', 'hoplab-wiki', '- TODO: task [(file)](url) <!-- source:file -->');
  assert(body.includes('File: [docs/foo.md]'), 'body: file link');
  assert(body.includes('/edit/main/docs/foo.md'), 'body: edit mode URL');
  assert(body.includes('**Tasks:**'), 'body: tasks header');
  assert(body.includes('auto-managed'), 'body: auto-managed notice');
  assert(body.includes('delete the tag'), 'body: file resolution instruction');
  assert(body.includes('react with'), 'body: comment resolution instruction');
  assert(body.includes('🚀'), 'body: rocket emoji for resolution');
  assert(!body.includes('- [ ]'), 'body: no checkboxes');
  assert(!(body.includes(' --> ') && body.includes(' <--')), 'body: no old-format arrow markers');
}

// Empty tasks
{
  const body = buildBody('docs/foo.md', 'O', 'R', '');
  assert(body.includes('No open tasks.'), 'body empty: shows message');
  assert(!body.includes('**Tasks:**'), 'body empty: no tasks header');
}

// =========================================================================
// walkSync (integration)
// =========================================================================
console.log('\n--- walkSync (integration) ---');
(async () => {
  try {
    const files = await walkSync('docs');
    assert(files.length > 0, `walkSync: found ${files.length} files`);
    assert(files.every(f => f.endsWith('.md')), 'walkSync: all .md');
    assertEqual(files.length, new Set(files).size, 'walkSync: no duplicates');
    assert(files.some(f => f.includes('index.md')), 'walkSync: includes index.md');
    assert(files.some(f => f.includes('contribute.md')), 'walkSync: includes contribute.md');
  } catch (e) {
    assert(false, `walkSync error: ${e.message}`);
  }

  // =========================================================================
  // Integration: parseTags on every real file
  // =========================================================================
  console.log('\n--- Integration: all real files ---');
  try {
    const fs = require('fs').promises;
    const files = await walkSync('docs');
    let totalTags = 0;

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const tags = parseTags(content);
      totalTags += tags.length;

      // Verify no duplicate keys within a file
      const keys = tags.map(t => t.normalizedKey);
      const unique = new Set(keys);
      assertEqual(keys.length, unique.size, `${file}: no duplicate normalized keys`);

      // Verify all tags have required properties
      for (const tag of tags) {
        assert(tag.type === 'TODO' || tag.type === 'PLACEHOLDER' || tag.type === 'NOTE',
          `${file}: valid type '${tag.type}'`);
        assert(tag.content.length > 0, `${file}: non-empty content`);
        assert(tag.normalizedKey.length > 0, `${file}: non-empty normalizedKey`);
      }
    }

    assert(totalTags > 50, `total tags across all files: ${totalTags} (expected >50)`);

    // Specific file checks based on known state
    const indexContent = await fs.readFile('docs/index.md', 'utf8');
    assertEqual(parseTags(indexContent).length, 2, 'docs/index.md: 2 tags');

    const contributeContent = await fs.readFile('docs/contribute.md', 'utf8');
    assertEqual(parseTags(contributeContent).length, 0, 'docs/contribute.md: 0 tags (examples in code blocks)');

    const andreaContent = await fs.readFile('docs/research/fmri/analysis/fmri-andrea-workflow.md', 'utf8');
    assertEqual(parseTags(andreaContent).length, 9, 'fmri-andrea-workflow.md: 9 tags');

    // Ghost duplicate test: fmri/index.md
    const fmriIndexContent = await fs.readFile('docs/research/fmri/index.md', 'utf8');
    const fmriIndexTags = parseTags(fmriIndexContent);
    assertEqual(fmriIndexTags.length, 5, 'fmri/index.md: 5 unique tags (no ghosts)');

  } catch (e) {
    assert(false, `integration error: ${e.message}`);
  }

  // =========================================================================
  // Integration: full roundtrip (parseTags -> formatTasks -> parseExistingTasks)
  // =========================================================================
  console.log('\n--- Integration: roundtrip ---');
  try {
    const fs = require('fs').promises;
    process.env.GITHUB_SERVER_URL = 'https://github.com';

    const content = await fs.readFile('docs/index.md', 'utf8');
    const tags = parseTags(content);

    // Format into issue body
    const { text, tasks } = formatTasks(tags, [], {
      filePath: 'docs/index.md',
      owner: 'HOPLAB-LBP',
      repo: 'hoplab-wiki',
    });

    // Build full body
    const body = buildBody('docs/index.md', 'HOPLAB-LBP', 'hoplab-wiki', text);

    // Parse back
    const parsed = parseExistingTasks(body);
    assertEqual(parsed.length, tags.length, 'roundtrip: same count after parse-back');

    for (const task of parsed) {
      assertEqual(task.source, 'file', 'roundtrip: all are file source');
      assert(task.content.length > 0, 'roundtrip: content preserved');
      assert(task.normalizedKey.length > 0, 'roundtrip: normalizedKey present');
    }

    // Second roundtrip with comment tasks
    const commentTask = { content: 'TODO: from comment', normalizedKey: 'TODO: from comment', source: 'comment', commentId: '999' };
    const { text: text2 } = formatTasks(tags, [commentTask], {
      filePath: 'docs/index.md',
      owner: 'HOPLAB-LBP',
      repo: 'hoplab-wiki',
      commentUrlBase: 'https://github.com/HOPLAB-LBP/hoplab-wiki/issues/262',
    });
    const body2 = buildBody('docs/index.md', 'HOPLAB-LBP', 'hoplab-wiki', text2);
    const parsed2 = parseExistingTasks(body2);
    assertEqual(parsed2.length, tags.length + 1, 'roundtrip2: file tags + comment task');
    const commentParsed = parsed2.find(t => t.source === 'comment');
    assert(commentParsed !== undefined, 'roundtrip2: comment task found');
    assertEqual(commentParsed.commentId, '999', 'roundtrip2: comment ID preserved');

    // Third roundtrip: remove all file tags, only comment survives
    const { tasks: tasks3 } = formatTasks([], [commentTask], {
      filePath: 'docs/index.md', owner: 'HOPLAB-LBP', repo: 'hoplab-wiki',
    });
    assertEqual(tasks3.length, 1, 'roundtrip3: only comment survives');
    assertEqual(tasks3[0].source, 'comment', 'roundtrip3: it is the comment task');

  } catch (e) {
    assert(false, `roundtrip error: ${e.message}`);
  }

  // =========================================================================
  // Integration: legacy issue migration
  // =========================================================================
  console.log('\n--- Integration: legacy migration ---');
  {
    // Simulate a real legacy issue body (from issue #248)
    const legacyBody = `File: [docs/research/fmri/index.md](https://github.com/HOPLAB-LBP/hoplab-wiki/blob/abc123/docs/research/fmri/index.md)

Tasks:
- [ ] __TODO__: [ANDREA] add info on where to find atlases --> Added from file <--
- [ ] __TODO__: [Klara] Add retinotopic mapping info --> Added from file <--
- [x] **TODO**: [ANDREA] add info on where to find atlases --> Resolved from file <--
- [ ] NOTE: comment task --> Added from comment #555 <--`;

    const tasks = parseExistingTasks(legacyBody);
    // Resolved should be dropped, rest kept
    assertEqual(tasks.length, 3, 'legacy migration: 3 tasks (1 resolved dropped)');
    assertEqual(tasks.filter(t => t.source === 'file').length, 2, 'legacy migration: 2 file tasks');
    assertEqual(tasks.filter(t => t.source === 'comment').length, 1, 'legacy migration: 1 comment task');
    assertEqual(tasks[2].commentId, '555', 'legacy migration: comment ID preserved');

    // Now run formatTasks with current file tags + migrated tasks
    const currentTags = [
      { type: 'TODO', content: '__TODO__: [ANDREA] add info on where to find atlases', normalizedKey: 'TODO: [ANDREA] add info on where to find atlases' },
      { type: 'TODO', content: '__TODO__: [Klara] Add retinotopic mapping info', normalizedKey: 'TODO: [Klara] Add retinotopic mapping info' },
    ];
    const { tasks: formatted } = formatTasks(currentTags, tasks);
    // Should have: 2 file tasks + 1 comment task = 3
    assertEqual(formatted.length, 3, 'legacy migration format: 3 tasks total');
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('========================================\n');
  process.exit(failed > 0 ? 1 : 0);
})();
