import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('el HTML contiene los elementos usados por la aplicación', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../app.js', import.meta.url), 'utf8')
  ]);

  const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const referencedIds = new Set([...app.matchAll(/\$\('#([^']+)'\)/g)].map((match) => match[1]));
  for (const id of referencedIds) {
    assert.ok(htmlIds.has(id), `Falta el elemento HTML #${id}`);
  }
});

test('el HTML carga el paquete clásico funcional', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<script defer src="app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
});

test('el paquete no contiene imports de módulos', async () => {
  const bundle = await readFile(new URL('../app.bundle.js', import.meta.url), 'utf8');
  assert.doesNotMatch(bundle, /^\s*import\s/m);
  assert.match(bundle, /initializeOrbitExplorer/);
});
