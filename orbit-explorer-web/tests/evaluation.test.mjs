import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_BODIES } from '../data.js';
import { compareWithEarth, evaluateBody, simulateMissions, validateBodyInput } from '../evaluation.js';

test('La Tierra obtiene 100 puntos en el modelo de referencia', () => {
  const earth = SEED_BODIES.find((body) => body.name === 'Tierra');
  assert.equal(evaluateBody(earth).index, 100);
});

test('La evaluación siempre queda entre 0 y 100', () => {
  for (const body of SEED_BODIES) {
    const result = evaluateBody(body);
    assert.ok(result.index >= 0 && result.index <= 100);
  }
});

test('La validación detecta nombres repetidos', () => {
  const mars = { ...SEED_BODIES[1], id: 'otro-marte', name: 'MARTE' };
  const errors = validateBodyInput(mars, SEED_BODIES);
  assert.ok(errors.some((error) => error.includes('Ya existe')));
});

test('La comparación de la Tierra consigo misma da diferencias cero', () => {
  const earth = SEED_BODIES[0];
  const comparison = compareWithEarth(earth);
  assert.equal(comparison.temperature.absolute, 0);
  assert.equal(comparison.gravity.absolute, 0);
});

test('La simulación nunca deja recursos negativos', () => {
  const result = simulateMissions(SEED_BODIES, { budget: 1000, fuel: 500, time: 30 });
  assert.ok(result.remaining.budget >= 0);
  assert.ok(result.remaining.fuel >= 0);
  assert.ok(result.remaining.time >= 0);
});
