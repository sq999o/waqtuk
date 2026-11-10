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
  assert.ok(validators.MESSAGES && typeof validators.MESSAGES === 'object');
  assert.ok(Object.values(validators.MESSAGES).every(value => typeof value === 'string'));
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
  // Check interfaces/data shapes, not Phase 0 no-op behavior or empty seeds.
  // Each owner adds behavior tests alongside their real implementation.
  for (const file of ['users','categories','activities','goals','sharing','feedback','announcements','reports']) {
    const records = await readJson(`src/data/${file}.json`);
    assert.ok(Array.isArray(records), `${file}.json must be an array`);
    assert.ok(records.every(record => typeof record.id === 'string' && record.id.length > 0));
    assert.equal(new Set(records.map(record => record.id)).size, records.length, `${file}: duplicate IDs`);
  }
  const usage = await readJson('src/data/usage.json');
  assert.ok(usage && typeof usage === 'object' && !Array.isArray(usage));
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
  console.log(`PASS: ${checked} export checks; 22 routes; providers; data shapes; unique IDs; UI render checks.`);
} finally {
  await server.close();
}
