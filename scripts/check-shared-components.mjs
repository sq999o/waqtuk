import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
const errors = [], originalError = console.error;
console.error = (...args) => errors.push(args.join(' '));
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }
const circles = html => [...html.matchAll(/<circle\b[^>]*class="wq-donut-chart-segment"[^>]*>/g)].map(m => m[0]);
const attribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const shares = html => [...html.matchAll(/class="wq-donut-chart-percent">(\d+)%/g)].map(m => Number(m[1]));
const sample = (values = [360, 510, 330, 180, 300, 360]) => values.map((minutes, i) =>
  Object.freeze({ id: `category-${i}`, label: ['Study', 'Work', 'Exercise', 'Sleep', 'Social', 'Gaming'][i] || `Item ${i}`, minutes, color: 'currentColor' }));
try {
  const { StatCard, EmptyState } = await server.ssrLoadModule('/src/components/ui/index.js');
  const { DonutChart } = await server.ssrLoadModule('/src/components/charts/index.js');
  const draw = (segments, props = {}) => renderToStaticMarkup(h(DonutChart, { segments, ...props }));
  test('StatCard renders zero, optional hints and all five hint tones', () => {
    for (const tone of ['neutral', 'success', 'warning', 'danger', 'info']) {
      const html = renderToStaticMarkup(h(StatCard, { label: 'Pending', value: 0, hint: 'This week', tone }));
      assert.match(html, /wq-stat-card-value">0</); assert.ok(html.includes(`wq-stat-card-hint--${tone}`));
      assert.ok(!html.includes(' tone='));
    }
    assert.ok(!renderToStaticMarkup(h(StatCard, { label: 'Total', value: 7 })).includes('wq-stat-card-hint'));
    assert.match(renderToStaticMarkup(h(StatCard, { hint: 0, tone: 'unknown' })), /wq-stat-card-hint--neutral">0</);
  });
  test('EmptyState renders supplied text/action without empty optional wrappers', () => {
    const html = renderToStaticMarkup(h(EmptyState, { title: 'No goals', message: 'Choose another week.', action: h('button', { type: 'button' }, 'Add Goal') }));
    assert.ok(html.includes('No goals') && html.includes('Choose another week.'));
    assert.match(html, /<button type="button">Add Goal<\/button>/);
    const empty = renderToStaticMarkup(h(EmptyState));
    assert.ok(!empty.includes('<h2') && !empty.includes('<p') && !empty.includes('wq-empty-state-action'));
  });
  test('all components preserve root HTML attributes and className and escape text', () => {
    for (const component of [StatCard, EmptyState, DonutChart]) {
      const html = renderToStaticMarkup(h(component, { className: 'custom', id: 'root-id', 'data-check': 'yes', 'aria-label': 'Overview', title: '<script>bad</script>' }));
      assert.match(html, /id="root-id"/); assert.match(html, /data-check="yes"/);
      assert.ok(html.includes('custom') && html.includes('aria-label="Overview"'));
      assert.ok(!html.includes('<script>'));
    }
  });
  test('donut legend uses agreed durations and integer percentages summing to 100', () => {
    const segments = Object.freeze(sample()), html = draw(segments, { centerValue: '34h 00m', centerLabel: 'logged' });
    assert.deepEqual(shares(html), [18, 25, 16, 9, 15, 17]);
    for (const duration of ['6h 00m', '8h 30m', '5h 30m', '3h 00m', '5h 00m']) assert.ok(html.includes(duration));
    assert.match(html, /wq-donut-chart-value">34h 00m</); assert.match(html, /wq-donut-chart-label">logged</);
    assert.equal(circles(html).length, 6); assert.equal(shares(html).reduce((a, b) => a + b, 0), 100);
  });
  test('SVG arcs use exact shares, meet at cumulative offsets and start at twelve oclock', () => {
    for (const values of [[1, 1, 1], [1, 99], [360, 510, 330, 180, 300, 360], [0, 1, 2, 0]]) {
      const arcs = circles(draw(sample(values))), total = values.reduce((a, b) => a + b, 0);
      let consumed = 0;
      values.filter(v => v > 0).forEach((value, i) => {
        const [length, gap] = attribute(arcs[i], 'stroke-dasharray').split(' ').map(Number);
        assert.ok(Math.abs(length - value / total * 100) < 1e-9);
        assert.ok(Math.abs(length + gap - 100) < 1e-9);
        assert.ok(Math.abs(Number(attribute(arcs[i], 'stroke-dashoffset')) + consumed) < 1e-9);
        assert.equal(attribute(arcs[i], 'pathLength'), '100');
        assert.equal(attribute(arcs[i], 'transform'), 'rotate(-90 100 100)'); consumed += length;
      });
      assert.ok(Math.abs(consumed - 100) < 1e-9);
    }
    assert.deepEqual(shares(draw(sample([1, 1, 1]))), [34, 33, 33]);
  });
  test('empty, zero, invalid and single-category cases never create invalid geometry', () => {
    for (const values of [[], [0, 0], [-5, NaN, Infinity, 1.5]]) {
      const html = draw(sample(values));
      assert.equal(circles(html).length, 0); assert.ok(html.includes('wq-donut-chart-track'));
      assert.ok(!/NaN|Infinity/.test(html)); assert.ok(shares(html).every(v => v === 0));
    }
    const one = draw(sample([60, 0]));
    assert.equal(circles(one).length, 1); assert.equal(attribute(circles(one)[0], 'stroke-dasharray'), '100 0');
    assert.deepEqual(shares(one), [100, 0]); assert.ok(one.includes('0h 00m'));
    assert.equal(circles(draw(undefined)).length, 0);
  });
  test('hidden legends retain accessible SVG descriptions and multiple charts have unique IDs', () => {
    const html = draw(sample([60]), { showLegend: false, centerValue: 0, centerLabel: 'logged' });
    assert.ok(!html.includes('<ul')); assert.ok(html.includes('Study: 1h 00m, 100%'));
    assert.match(html, /role="img"/); assert.match(html, /wq-donut-chart-value">0</);
    const pair = renderToStaticMarkup(h('div', null, h(DonutChart), h(DonutChart)));
    const ids = [...pair.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, 4); assert.equal(new Set(ids).size, 4);
    for (const m of pair.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) assert.ok(ids.includes(m[1]));
  });
  assert.deepEqual(errors, []);
  console.log(`PASS: all ${passed} shared component test groups; props, accessibility, legend totals and SVG geometry.`);
} finally { console.error = originalError; await server.close(); }
