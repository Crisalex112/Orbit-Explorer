import { EARTH_REFERENCE } from './data.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));
const gaussian = (difference, scale) => Math.exp(-0.5 * (difference / scale) ** 2);

export const SCORE_WEIGHTS = Object.freeze({
  temperature: 20,
  pressure: 15,
  gravity: 15,
  resources: 15,
  water: 20,
  radiation: 15
});

export function evaluateBody(body) {
  const temperature = SCORE_WEIGHTS.temperature
    * gaussian(body.temperatureK - EARTH_REFERENCE.temperatureK, 90);

  const pressure = body.pressureAtm <= 0
    ? 0
    : SCORE_WEIGHTS.pressure * gaussian(
      Math.log10(body.pressureAtm / EARTH_REFERENCE.pressureAtm),
      1.2
    );

  const gravity = SCORE_WEIGHTS.gravity
    * gaussian(body.gravity - EARTH_REFERENCE.gravity, 5);

  const resources = SCORE_WEIGHTS.resources
    * clamp(body.resources, 0, 100) / 100;

  const water = SCORE_WEIGHTS.water
    * clamp(body.waterPotential, 0, 100) / 100;

  const radiation = SCORE_WEIGHTS.radiation
    * (1 - clamp(body.radiationRisk, 0, 100) / 100);

  const scores = {
    temperature: round(temperature),
    pressure: round(pressure),
    gravity: round(gravity),
    resources: round(resources),
    water: round(water),
    radiation: round(radiation)
  };

  const index = round(Object.values(scores).reduce((sum, score) => sum + score, 0));
  const classification = index >= 70
    ? 'Prioridad Alta (Habitable)'
    : index >= 35
      ? 'Prioridad Media (Explorable)'
      : 'Prioridad Baja (No recomendable)';

  const conditions = {
    thermal: scores.temperature >= SCORE_WEIGHTS.temperature * 0.6,
    pressure: scores.pressure >= SCORE_WEIGHTS.pressure * 0.5,
    gravity: scores.gravity >= SCORE_WEIGHTS.gravity * 0.5,
    resources: body.resources >= 55,
    water: body.waterPotential >= 55,
    radiation: body.radiationRisk <= 45
  };

  const colonyRecommended = index >= 70
    && conditions.radiation
    && conditions.water
    && conditions.resources;

  const roboticExploration = !colonyRecommended
    && (index >= 35 || body.resources >= 65 || body.waterPotential >= 65);

  const specialSuits = !conditions.thermal
    || !conditions.pressure
    || !conditions.gravity
    || !conditions.radiation;

  const missionJustified = body.resources >= 55 || body.waterPotential >= 60;

  const criticalFactors = [];
  if (!conditions.thermal) criticalFactors.push('temperatura');
  if (!conditions.pressure) criticalFactors.push('presión');
  if (!conditions.gravity) criticalFactors.push('gravedad');
  if (!conditions.radiation) criticalFactors.push('radiación');
  if (!conditions.water) criticalFactors.push('disponibilidad de agua');

  const decision = colonyRecommended
    ? 'El modelo recomienda estudiar una colonia experimental con protección y verificación científica adicional.'
    : roboticExploration
      ? 'El modelo recomienda una misión robótica prioritaria antes de considerar presencia humana.'
      : 'El modelo no recomienda una misión humana; solo observación remota o investigación muy especializada.';

  const explanation = `${decision} ${missionJustified
    ? 'El potencial de recursos o agua puede justificar la inversión.'
    : 'Los beneficios estimados no compensan las condiciones adversas.'}${criticalFactors.length
    ? ` Factores críticos: ${criticalFactors.join(', ')}.`
    : ' No se detectaron factores críticos en el modelo.'}`;

  return {
    index,
    classification,
    scores,
    conditions,
    colonyRecommended,
    roboticExploration,
    specialSuits,
    missionJustified,
    criticalFactors,
    explanation
  };
}

export function compareWithEarth(body) {
  const percentageDifference = (value, reference) => reference === 0
    ? 0
    : round(Math.abs(value - reference) / Math.abs(reference) * 100);

  return {
    temperature: {
      earth: EARTH_REFERENCE.temperatureK,
      body: body.temperatureK,
      absolute: round(Math.abs(body.temperatureK - EARTH_REFERENCE.temperatureK)),
      percentage: percentageDifference(body.temperatureK, EARTH_REFERENCE.temperatureK),
      unit: 'K'
    },
    pressure: {
      earth: EARTH_REFERENCE.pressureAtm,
      body: body.pressureAtm,
      absolute: round(Math.abs(body.pressureAtm - EARTH_REFERENCE.pressureAtm), 3),
      percentage: percentageDifference(body.pressureAtm, EARTH_REFERENCE.pressureAtm),
      unit: 'atm'
    },
    gravity: {
      earth: EARTH_REFERENCE.gravity,
      body: body.gravity,
      absolute: round(Math.abs(body.gravity - EARTH_REFERENCE.gravity), 2),
      percentage: percentageDifference(body.gravity, EARTH_REFERENCE.gravity),
      unit: 'm/s²'
    },
    resources: {
      earth: EARTH_REFERENCE.resources,
      body: body.resources,
      absolute: round(Math.abs(body.resources - EARTH_REFERENCE.resources)),
      percentage: percentageDifference(body.resources, EARTH_REFERENCE.resources),
      unit: '%'
    },
    water: {
      earth: EARTH_REFERENCE.waterPotential,
      body: body.waterPotential,
      absolute: round(Math.abs(body.waterPotential - EARTH_REFERENCE.waterPotential)),
      percentage: percentageDifference(body.waterPotential, EARTH_REFERENCE.waterPotential),
      unit: '%'
    },
    radiation: {
      earth: EARTH_REFERENCE.radiationRisk,
      body: body.radiationRisk,
      absolute: round(Math.abs(body.radiationRisk - EARTH_REFERENCE.radiationRisk)),
      percentage: null,
      unit: '% de riesgo'
    }
  };
}

export function validateBodyInput(candidate, existingBodies) {
  const errors = [];
  const normalizedName = String(candidate.name || '').trim();
  const normalizedType = String(candidate.type || '').trim();

  if (!normalizedName) errors.push('El nombre es obligatorio.');
  if (!normalizedType) errors.push('El tipo o ubicación es obligatorio.');
  if (normalizedName && existingBodies.some((body) => body.name.toLowerCase() === normalizedName.toLowerCase())) {
    errors.push('Ya existe un cuerpo celeste con ese nombre.');
  }

  const validations = [
    ['temperatureK', 0, 1500, 'La temperatura es obligatoria.', 'La temperatura debe estar entre 0 y 1500 K.'],
    ['pressureAtm', 0, 120, 'La presión atmosférica es obligatoria.', 'La presión debe estar entre 0 y 120 atm.'],
    ['gravity', 0.000001, 35, 'La gravedad es obligatoria.', 'La gravedad debe ser mayor que 0 y menor o igual a 35 m/s².'],
    ['resources', 0, 100, 'Los recursos aprovechables son obligatorios.', 'Los recursos deben estar entre 0% y 100%.'],
    ['waterPotential', 0, 100, 'El potencial de agua es obligatorio.', 'El potencial de agua debe estar entre 0% y 100%.'],
    ['radiationRisk', 0, 100, 'El riesgo de radiación es obligatorio.', 'El riesgo de radiación debe estar entre 0% y 100%.'],
    ['missionCost', 0, 10000, 'El costo de misión es obligatorio.', 'El costo debe ser mayor o igual a 0.'],
    ['fuel', 0, 10000, 'El combustible es obligatorio.', 'El combustible debe ser mayor o igual a 0.'],
    ['duration', 0, 1000, 'La duración estimada es obligatoria.', 'La duración debe ser mayor o igual a 0.']
  ];

  for (const [key, min, max, requiredMessage, rangeMessage] of validations) {
    const rawValue = candidate[key];

    if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
      errors.push(requiredMessage);
      continue;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < min || value > max) errors.push(rangeMessage);
  }

  return errors;
}

export function simulateMissions(bodies, limits) {
  const remaining = {
    budget: Number(limits.budget),
    fuel: Number(limits.fuel),
    time: Number(limits.time)
  };

  const candidates = bodies
    .filter((body) => body.name.toLowerCase() !== 'tierra')
    .map((body) => ({ body, evaluation: evaluateBody(body) }))
    .sort((a, b) => {
      const scoreA = a.evaluation.index + a.body.resources * 0.12 + a.body.waterPotential * 0.12;
      const scoreB = b.evaluation.index + b.body.resources * 0.12 + b.body.waterPotential * 0.12;
      return scoreB - scoreA;
    });

  const approved = [];
  const rejected = [];

  for (const candidate of candidates) {
    const { body, evaluation } = candidate;
    const reasons = [];
    if (body.missionCost > remaining.budget) reasons.push('presupuesto insuficiente');
    if (body.fuel > remaining.fuel) reasons.push('combustible insuficiente');
    if (body.duration > remaining.time) reasons.push('tiempo insuficiente');

    if (reasons.length === 0 && evaluation.classification !== 'Prioridad Baja (No recomendable)') {
      approved.push(candidate);
      remaining.budget -= body.missionCost;
      remaining.fuel -= body.fuel;
      remaining.time -= body.duration;
    } else {
      if (evaluation.classification === 'Prioridad Baja (No recomendable)') {
        reasons.push('prioridad científica baja');
      }
      rejected.push({ ...candidate, reasons });
    }
  }

  return { approved, rejected, remaining };
}
