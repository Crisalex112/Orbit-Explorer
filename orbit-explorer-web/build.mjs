import { readFile, writeFile } from 'node:fs/promises';

const data = (await readFile('data.js', 'utf8'))
  .replaceAll('export const EARTH_REFERENCE', 'const EARTH_REFERENCE')
  .replaceAll('export const SEED_BODIES', 'const SEED_BODIES')
  .replaceAll('export const STORAGE_KEYS', 'const STORAGE_KEYS');

let evaluation = await readFile('evaluation.js', 'utf8');
evaluation = evaluation
  .replace("import { EARTH_REFERENCE } from './data.js';\n\n", '')
  .replace('export const SCORE_WEIGHTS', 'const SCORE_WEIGHTS');
for (const name of ['evaluateBody', 'compareWithEarth', 'validateBodyInput', 'simulateMissions']) {
  evaluation = evaluation.replace(`export function ${name}`, `function ${name}`);
}

const charts = (await readFile('charts.js', 'utf8'))
  .replace('export function renderScatter', 'function renderScatter');

const app = (await readFile('app.js', 'utf8'))
  .replace("import { SEED_BODIES, STORAGE_KEYS } from './data.js';\n", '')
  .replace("import { compareWithEarth, evaluateBody, simulateMissions, validateBodyInput } from './evaluation.js';\n", '')
  .replace("import { renderScatter } from './charts.js';\n\n", '');

const bundle = `/* Orbit Explorer - paquete funcional sin dependencias ni módulos ES. */
'use strict';

const OrbitData = (() => {
${data}
  return { EARTH_REFERENCE, SEED_BODIES, STORAGE_KEYS };
})();

const OrbitEvaluation = (({ EARTH_REFERENCE }) => {
${evaluation}
  return { SCORE_WEIGHTS, evaluateBody, compareWithEarth, validateBodyInput, simulateMissions };
})(OrbitData);

const OrbitCharts = (() => {
${charts}
  return { renderScatter };
})();

(() => {
  const { SEED_BODIES, STORAGE_KEYS } = OrbitData;
  const { compareWithEarth, evaluateBody, simulateMissions, validateBodyInput } = OrbitEvaluation;
  const { renderScatter } = OrbitCharts;
${app}
})();
`;

await writeFile('app.bundle.js', bundle);
console.log('app.bundle.js generado correctamente.');
