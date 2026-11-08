import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async path => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const contracts = await readJson('docs/contracts.json');
const routes = await readJson('docs/routes.json');
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
let checked = 0;
async function checkExports(path, names) {
  const exports = await server.ssrLoadModule(`/src/${path}`);
  for (const name of names) {
    assert.equal(typeof exports[name], 'function', `Missing callable ${name} in ${path}`);
    checked++;
  }
  return exports;
}
try {
  for (const [group, folder] of [['actions', 'context/actions'], ['selectors', 'context/selectors'], ['helpers', 'utils'], ['validators', 'utils/validators']]) {
    for (const [file, names] of Object.entries(contracts[group])) await checkExports(`${folder}/${file}.js`, names);
    if (group !== 'helpers') await checkExports(`${folder}/index.js`, Object.values(contracts[group]).flat());
  }
  await checkExports('components/ui/index.js', contracts.ui);
  await checkExports('components/charts/index.js', contracts.charts);
  for (const [name, hook] of [['Auth','useAuth'],['Data','useData'],['Theme','useTheme'],['Toast','useToast']]) {
    await checkExports(`context/${name}Context.jsx`, [`${name}Provider`,hook]);
  }
  const validators = await server.ssrLoadModule('/src/utils/validators/index.js');
  assert.deepEqual(validators.MESSAGES, {});
  assert.equal(routes.length, 22);
  assert.equal(new Set(routes.map(route => route.path)).size, 22);
  const routeSource = await readFile(new URL('../src/routes.jsx', import.meta.url), 'utf8');
  for (const route of routes) {
    assert.ok(routeSource.includes(`path="${route.path}"`), `Unregistered route ${route.path}`);
    const page = await server.ssrLoadModule(`/${route.file}`);
    assert.equal(typeof page.default, 'function');
    await access(new URL(`../${route.file.replace('.jsx','.css')}`,import.meta.url));
  }
  await checkExports('pages/student/activities/ActivityFormModal.jsx', ['default']);
  await checkExports('pages/dev/ComponentsPreview.jsx', ['default']);
  const actions = await server.ssrLoadModule('/src/context/actions/index.js');
  const data = Object.freeze({ users: Object.freeze([]), activities: Object.freeze([]) });
  for (const [name, fn] of Object.entries(actions)) {
    const result = fn(data);
    assert.equal(result.data, data, `${name} must leave Phase 0 data unchanged`);
    assert.deepEqual(result.result, { ok: true });
  }
  const selectors = await server.ssrLoadModule('/src/context/selectors/index.js');
  const denied = selectors.getSharedData(data, { currentUser: null })('not-authorized');
  assert.deepEqual(denied, { student: undefined, activities: [], goals: [] });
  const usage = selectors.usageFor(data, {})('2026-11-02','2026-11-08');
  assert.deepEqual(usage, { students: 0, mentors: 0, activities: 0, requests: 0, reports: 0 });
  for (const file of ['users','categories','activities','goals','sharing','feedback','announcements','reports']) {
    assert.deepEqual(await readJson(`src/data/${file}.json`), []);
  }
  assert.deepEqual(await readJson('src/data/usage.json'), {});
  // Render every UI component with representative controlled props; DOM warnings fail.
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const { MemoryRouter } = await import('react-router-dom');
  const ui = await server.ssrLoadModule('/src/components/ui/index.js');
  const samples = {
    Button: { to: '/dashboard', loading: true, fullWidth: true, children: 'Save' },
    Input: { label: 'Email', value: '', onChange() {}, error: 'Example' },
    Select: { label: 'Category', value: '', onChange() {}, options: [] },
    Textarea: { label: 'Notes', value: '', onChange() {} },
    Checkbox: { label: 'Accept', checked: false, onChange() {} },
    Radio: { label: 'Student', checked: false, onChange() {} },
    Table: { columns: [{ key:'name',header:'Name', hideOnSmall:true }], rows: [{ id:'s1',name:'Student' }], onRowClick() {} },
    Modal: { open:true,title:'Dialog',onClose() {},size:'sm' },
    ConfirmDialog: { open:true,title:'Confirm',onConfirm() {},onCancel() {},tone:'danger' },
    SegmentedControl: { options:[{value:'day',label:'Day'}],value:'day',onChange() {} },
  };
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  try {
    for (const name of contracts.ui) renderToString(React.createElement(MemoryRouter, null, React.createElement(ui[name], samples[name] || {})));
  } finally { console.error = originalError; }
  assert.deepEqual(errors, [], 'UI stubs must not leak custom props to DOM or warn');
  console.log(`PASS: ${checked} export checks; 22 routes; providers; no-op contracts; empty seeds; UI render checks.`);
} finally {
  await server.close();
}
