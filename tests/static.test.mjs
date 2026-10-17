import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);
test('published entry loads assets under a GitHub Pages project subdirectory', () => {
  const html = readFileSync(new URL('docs/index.html', root), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]);
  assert.ok(assets.some(path => path.endsWith('.js')));
  assert.ok(assets.some(path => path.endsWith('.css')));
  for (const path of assets) {
    assert.ok(path.startsWith('./'), `must be relative: ${path}`);
    assert.ok(existsSync(new URL(`docs/${path}`, root)), `missing: ${path}`);
  }
  assert.ok(existsSync(new URL('docs/.nojekyll', root)));
  assert.ok(existsSync(new URL('docs/brand/service-victoria.svg', root)));
});
test('published application does not depend on the former cloud API or login', () => {
  const html = readFileSync(new URL('docs/index.html', root), 'utf8');
  const script = html.match(/src="([^"]+\.js)"/)[1];
  const js = readFileSync(new URL(`docs/${script}`, root), 'utf8');
  assert.doesNotMatch(js, /\/api\/sessions|signin-with-chatgpt|sendBeacon/);
  assert.ok(js.includes('fieldnotes.sessions.v1'), 'preserves existing browser records');
  assert.ok(js.includes('./brand/service-victoria.svg'));
});
