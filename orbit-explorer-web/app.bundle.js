/* Orbit Explorer - paquete funcional sin dependencias ni módulos ES. */
'use strict';

const OrbitData = (() => {
const EARTH_REFERENCE = Object.freeze({
  temperatureK: 288,
  pressureAtm: 1,
  gravity: 9.81,
  resources: 100,
  waterPotential: 100,
  radiationRisk: 0
});

const SEED_BODIES = [
  {
    id: 'tierra',
    name: 'Tierra',
    type: 'Planeta · referencia',
    temperatureK: 288,
    pressureAtm: 1,
    gravity: 9.81,
    resources: 100,
    waterPotential: 100,
    radiationRisk: 0,
    missionCost: 0,
    fuel: 0,
    duration: 0,
    color: '#37a7ff',
    notes: 'Mundo de referencia para el modelo educativo.'
  },
  {
    id: 'marte',
    name: 'Marte',
    type: 'Planeta',
    temperatureK: 210,
    pressureAtm: 0.006,
    gravity: 3.71,
    resources: 65,
    waterPotential: 35,
    radiationRisk: 80,
    missionCost: 650,
    fuel: 320,
    duration: 9,
    color: '#e96b4b',
    notes: 'Atmósfera muy tenue y elevada exposición a radiación.'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Planeta',
    temperatureK: 737,
    pressureAtm: 92,
    gravity: 8.87,
    resources: 15,
    waterPotential: 5,
    radiationRisk: 65,
    missionCost: 720,
    fuel: 340,
    duration: 7,
    color: '#f4b862',
    notes: 'Temperatura y presión superficiales extremas.'
  },
  {
    id: 'luna',
    name: 'Luna',
    type: 'Satélite · Tierra',
    temperatureK: 250,
    pressureAtm: 0,
    gravity: 1.62,
    resources: 45,
    waterPotential: 15,
    radiationRisk: 90,
    missionCost: 180,
    fuel: 70,
    duration: 2,
    color: '#cbd2dd',
    notes: 'Destino cercano, sin atmósfera significativa.'
  },
  {
    id: 'europa',
    name: 'Europa',
    type: 'Satélite · Júpiter',
    temperatureK: 102,
    pressureAtm: 0,
    gravity: 1.31,
    resources: 80,
    waterPotential: 95,
    radiationRisk: 95,
    missionCost: 1200,
    fuel: 610,
    duration: 72,
    color: '#c9a56f',
    notes: 'Océano subsuperficial potencial; radiación intensa.'
  },
  {
    id: 'titan',
    name: 'Titán',
    type: 'Satélite · Saturno',
    temperatureK: 94,
    pressureAtm: 1.45,
    gravity: 1.35,
    resources: 75,
    waterPotential: 65,
    radiationRisk: 70,
    missionCost: 1450,
    fuel: 700,
    duration: 84,
    color: '#d9a441',
    notes: 'Atmósfera densa y química orgánica compleja.'
  },
  {
    id: 'encelado',
    name: 'Encélado',
    type: 'Satélite · Saturno',
    temperatureK: 75,
    pressureAtm: 0,
    gravity: 0.11,
    resources: 70,
    waterPotential: 95,
    radiationRisk: 75,
    missionCost: 1380,
    fuel: 680,
    duration: 78,
    color: '#d9f0ff',
    notes: 'Mundo helado con géiseres y océano subsuperficial.'
  }
];

const STORAGE_KEYS = Object.freeze({
  bodies: 'orbit-explorer:bodies:v1',
  history: 'orbit-explorer:history:v1'
});

  return { EARTH_REFERENCE, SEED_BODIES, STORAGE_KEYS };
})();

const OrbitEvaluation = (({ EARTH_REFERENCE }) => {
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));
const gaussian = (difference, scale) => Math.exp(-0.5 * (difference / scale) ** 2);

const SCORE_WEIGHTS = Object.freeze({
  temperature: 20,
  pressure: 15,
  gravity: 15,
  resources: 15,
  water: 20,
  radiation: 15
});

function evaluateBody(body) {
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

function compareWithEarth(body) {
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

function validateBodyInput(candidate, existingBodies) {
  const errors = [];
  const normalizedName = String(candidate.name || '').trim();

  if (!normalizedName) errors.push('El nombre es obligatorio.');
  if (existingBodies.some((body) => body.name.toLowerCase() === normalizedName.toLowerCase())) {
    errors.push('Ya existe un cuerpo celeste con ese nombre.');
  }

  const validations = [
    ['temperatureK', 0, 1500, 'La temperatura debe estar entre 0 y 1500 K.'],
    ['pressureAtm', 0, 120, 'La presión debe estar entre 0 y 120 atm.'],
    ['gravity', 0.000001, 35, 'La gravedad debe ser mayor que 0 y menor o igual a 35 m/s².'],
    ['resources', 0, 100, 'Los recursos deben estar entre 0% y 100%.'],
    ['waterPotential', 0, 100, 'El potencial de agua debe estar entre 0% y 100%.'],
    ['radiationRisk', 0, 100, 'El riesgo de radiación debe estar entre 0% y 100%.'],
    ['missionCost', 0, 10000, 'El costo debe ser mayor o igual a 0.'],
    ['fuel', 0, 10000, 'El combustible debe ser mayor o igual a 0.'],
    ['duration', 0, 1000, 'La duración debe ser mayor o igual a 0.']
  ];

  for (const [key, min, max, message] of validations) {
    const value = Number(candidate[key]);
    if (!Number.isFinite(value) || value < min || value > max) errors.push(message);
  }

  return errors;
}

function simulateMissions(bodies, limits) {
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

  return { SCORE_WEIGHTS, evaluateBody, compareWithEarth, validateBodyInput, simulateMissions };
})(OrbitData);

const OrbitCharts = (() => {
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function extent(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
}

function renderScatter(container, bodies, options) {
  container.innerHTML = '';
  const width = 900;
  const height = 480;
  const margin = { top: 36, right: 38, bottom: 64, left: 76 };
  const xValues = bodies.map((body) => Number(body[options.xKey]));
  const yValues = bodies.map((body) => Number(body[options.yKey]));
  const [xMin, xMax] = extent(xValues);
  const [yMin, yMax] = extent(yValues);
  const x = (value) => margin.left + (value - xMin) / (xMax - xMin) * (width - margin.left - margin.right);
  const y = (value) => height - margin.bottom - (value - yMin) / (yMax - yMin) * (height - margin.top - margin.bottom);

  const svg = svgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': `${options.xLabel} versus ${options.yLabel}`
  });
  svg.classList.add('scatter-svg');

  for (let tick = 0; tick <= 5; tick += 1) {
    const xValue = xMin + (xMax - xMin) * tick / 5;
    const yValue = yMin + (yMax - yMin) * tick / 5;
    const xPosition = x(xValue);
    const yPosition = y(yValue);

    svg.append(svgElement('line', {
      x1: xPosition, y1: margin.top, x2: xPosition, y2: height - margin.bottom,
      class: 'chart-grid'
    }));
    svg.append(svgElement('line', {
      x1: margin.left, y1: yPosition, x2: width - margin.right, y2: yPosition,
      class: 'chart-grid'
    }));

    const xText = svgElement('text', {
      x: xPosition, y: height - margin.bottom + 28,
      'text-anchor': 'middle', class: 'chart-label'
    });
    xText.textContent = options.formatX ? options.formatX(xValue) : xValue.toFixed(1);
    svg.append(xText);

    const yText = svgElement('text', {
      x: margin.left - 16, y: yPosition + 5,
      'text-anchor': 'end', class: 'chart-label'
    });
    yText.textContent = options.formatY ? options.formatY(yValue) : yValue.toFixed(1);
    svg.append(yText);
  }

  svg.append(svgElement('line', {
    x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom,
    class: 'chart-axis'
  }));
  svg.append(svgElement('line', {
    x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom,
    class: 'chart-axis'
  }));

  const xTitle = svgElement('text', {
    x: (margin.left + width - margin.right) / 2,
    y: height - 16,
    'text-anchor': 'middle', class: 'chart-title'
  });
  xTitle.textContent = options.xLabel;
  svg.append(xTitle);

  const yTitle = svgElement('text', {
    x: 20,
    y: (margin.top + height - margin.bottom) / 2,
    transform: `rotate(-90 20 ${(margin.top + height - margin.bottom) / 2})`,
    'text-anchor': 'middle', class: 'chart-title'
  });
  yTitle.textContent = options.yLabel;
  svg.append(yTitle);

  for (const body of bodies) {
    const group = svgElement('g', { class: 'chart-point-group' });
    const circle = svgElement('circle', {
      cx: x(body[options.xKey]),
      cy: y(body[options.yKey]),
      r: body.name === 'Tierra' ? 10 : 7,
      fill: body.color || '#7ed6ff',
      class: body.name === 'Tierra' ? 'chart-point earth-point' : 'chart-point'
    });
    const title = svgElement('title');
    title.textContent = `${body.name}: ${options.xLabel} ${body[options.xKey]}, ${options.yLabel} ${body[options.yKey]}`;
    circle.append(title);
    group.append(circle);

    const label = svgElement('text', {
      x: x(body[options.xKey]) + 11,
      y: y(body[options.yKey]) - 10,
      class: 'point-label'
    });
    label.textContent = body.name;
    group.append(label);
    svg.append(group);
  }

  container.append(svg);
}

  return { renderScatter };
})();

(() => {
  const { SEED_BODIES, STORAGE_KEYS } = OrbitData;
  const { compareWithEarth, evaluateBody, simulateMissions, validateBodyInput } = OrbitEvaluation;
  const { renderScatter } = OrbitCharts;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const idFromName = (name) => `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
const round = (value, digits = 1) => Number(Number(value).toFixed(digits));

let bodies = load(STORAGE_KEYS.bodies, clone(SEED_BODIES));
let history = load(STORAGE_KEYS.history, []);
let toastTimer;

const viewTitles = {
  dashboard: 'Centro de control',
  catalog: 'Base de datos celestial',
  register: 'Registrar cuerpo celeste',
  evaluate: 'Evaluación de habitabilidad',
  compare: 'Comparación con la Tierra',
  reports: 'Reportes planetarios',
  charts: 'Gráficas y plano cartesiano',
  simulation: 'Simulación de exploración',
  history: 'Historial de evaluaciones'
};

function load(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEYS.bodies, JSON.stringify(bodies));
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    return true;
  } catch (error) {
    console.warn('No fue posible guardar los datos en el almacenamiento del navegador:', error);
    return false;
  }
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function classificationKey(classification) {
  if (classification.includes('Alta')) return 'high';
  if (classification.includes('Media')) return 'medium';
  return 'low';
}

function goToView(viewName) {
  $$('.view').forEach((view) => view.classList.toggle('active-view', view.id === viewName));
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  $('#viewTitle').textContent = viewTitles[viewName] || 'Orbit Explorer';
  $('#sidebar').classList.remove('open');
  if (viewName === 'charts') renderCurrentChart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortedEvaluations() {
  return bodies
    .map((body) => ({ body, evaluation: evaluateBody(body) }))
    .sort((a, b) => b.evaluation.index - a.evaluation.index);
}

function renderAll() {
  renderDashboard();
  renderCatalog();
  renderSelects();
  renderComparison();
  renderReports();
  renderHistory();
  renderCurrentChart();
}

function renderDashboard() {
  const evaluations = sortedEvaluations();
  const counts = { high: 0, medium: 0, low: 0 };
  evaluations.forEach(({ evaluation }) => counts[classificationKey(evaluation.classification)] += 1);
  const average = evaluations.length
    ? round(evaluations.reduce((sum, item) => sum + item.evaluation.index, 0) / evaluations.length)
    : 0;
  const top = evaluations.find(({ body }) => body.name !== 'Tierra') || evaluations[0];

  $('#dashboardMetrics').innerHTML = [
    ['Cuerpos registrados', bodies.length, 'Base de datos activa'],
    ['Índice promedio', `${average}%`, 'Modelo multidimensional'],
    ['Mejor candidato externo', top ? top.body.name : '—', top ? `${top.evaluation.index} puntos` : 'Sin datos'],
    ['Evaluaciones realizadas', history.length, 'Historial del usuario']
  ].map(([label, value, detail]) => `<article class="metric-card"><small>${label}</small><strong>${value}</strong><span>${detail}</span></article>`).join('');

  $('#topCandidates').innerHTML = evaluations.slice(0, 5).map(({ body, evaluation }, index) => rankRow(index, body.name, body.type, evaluation.index, '%')).join('');

  const total = bodies.length || 1;
  $('#classificationOverview').innerHTML = [
    ['Prioridad alta', counts.high, 'high'],
    ['Prioridad media', counts.medium, 'medium'],
    ['Prioridad baja', counts.low, 'low']
  ].map(([label, count, css]) => `<div class="classification-line"><span>${label}</span><div class="classification-track"><i class="${css}" style="width:${count / total * 100}%"></i></div><strong>${count}</strong></div>`).join('');
}

function renderCatalog() {
  const query = $('#catalogSearch').value.trim().toLowerCase();
  const filter = $('#catalogFilter').value;
  const filtered = bodies.filter((body) => {
    const evaluation = evaluateBody(body);
    const matchesText = body.name.toLowerCase().includes(query) || body.type.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || evaluation.classification.includes(filter);
    return matchesText && matchesFilter;
  });

  $('#bodyGrid').innerHTML = filtered.length ? filtered.map((body) => {
    const evaluation = evaluateBody(body);
    const key = classificationKey(evaluation.classification);
    return `<article class="body-card" style="--planet-color:${body.color || '#63dcff'}">
      <div class="body-card-header"><span class="planet-dot"></span><div><h3>${escapeHtml(body.name)}</h3><span class="type">${escapeHtml(body.type)}</span></div></div>
      <span class="classification-badge ${key}">${evaluation.classification}</span>
      <div class="body-stats">
        <div class="body-stat"><small>Índice</small><strong>${evaluation.index}%</strong></div>
        <div class="body-stat"><small>Temperatura</small><strong>${body.temperatureK} K</strong></div>
        <div class="body-stat"><small>Gravedad</small><strong>${body.gravity} m/s²</strong></div>
        <div class="body-stat"><small>Recursos</small><strong>${body.resources}%</strong></div>
      </div>
      <div class="card-actions"><button class="secondary-button" data-evaluate-id="${body.id}">Evaluar</button><button class="ghost-button" data-compare-id="${body.id}">Comparar</button></div>
    </article>`;
  }).join('') : '<div class="empty-message">No se encontraron cuerpos celestes.</div>';

  $$('[data-evaluate-id]').forEach((button) => button.addEventListener('click', () => {
    $('#evaluationSelect').value = button.dataset.evaluateId;
    renderSelectedSummary();
    goToView('evaluate');
  }));
  $$('[data-compare-id]').forEach((button) => button.addEventListener('click', () => {
    $('#comparisonSelect').value = button.dataset.compareId;
    renderComparison();
    goToView('compare');
  }));
}

function renderSelects() {
  const options = bodies.map((body) => `<option value="${body.id}">${escapeHtml(body.name)} · ${escapeHtml(body.type)}</option>`).join('');
  const evaluationValue = $('#evaluationSelect').value;
  const comparisonValue = $('#comparisonSelect').value;
  $('#evaluationSelect').innerHTML = options;
  $('#comparisonSelect').innerHTML = options;
  if (bodies.some((body) => body.id === evaluationValue)) $('#evaluationSelect').value = evaluationValue;
  if (bodies.some((body) => body.id === comparisonValue)) $('#comparisonSelect').value = comparisonValue;
  renderSelectedSummary();
}

function renderSelectedSummary() {
  const body = bodies.find((item) => item.id === $('#evaluationSelect').value) || bodies[0];
  if (!body) return;
  $('#selectedBodySummary').innerHTML = [
    ['Tipo', body.type],
    ['Temperatura', `${body.temperatureK} K`],
    ['Presión', `${body.pressureAtm} atm`],
    ['Gravedad', `${body.gravity} m/s²`],
    ['Recursos', `${body.resources}%`]
  ].map(([label, value]) => `<div class="summary-line"><span>${label}</span><strong>${escapeHtml(String(value))}</strong></div>`).join('');
}

function performEvaluation(bodyId, saveToHistory = true) {
  const body = bodies.find((item) => item.id === bodyId);
  if (!body) return;
  const evaluation = evaluateBody(body);
  if (saveToHistory) {
    history.unshift({
      id: `${body.id}-${Date.now()}`,
      bodyId: body.id,
      name: body.name,
      index: evaluation.index,
      classification: evaluation.classification,
      timestamp: new Date().toISOString()
    });
    history = history.slice(0, 150);
    persist();
    renderDashboard();
    renderHistory();
  }

  const key = classificationKey(evaluation.classification);
  const scoreLabels = {
    temperature: 'Temperatura', pressure: 'Presión', gravity: 'Gravedad',
    resources: 'Recursos', water: 'Agua', radiation: 'Radiación'
  };
  const conditionLabels = {
    thermal: 'Temperatura adecuada', pressure: 'Presión adecuada', gravity: 'Gravedad adecuada',
    resources: 'Recursos suficientes', water: 'Agua potencial', radiation: 'Radiación aceptable'
  };

  $('#evaluationResult').className = 'panel result-panel';
  $('#evaluationResult').innerHTML = `
    <div class="evaluation-header">
      <div><p class="eyebrow">REPORTE DE EVALUACIÓN</p><h3>${escapeHtml(body.name)}</h3><span class="classification-badge ${key}">${evaluation.classification}</span></div>
      <div class="index-display"><strong>${evaluation.index}</strong><small>Índice / 100</small></div>
    </div>
    <div class="score-grid">${Object.entries(evaluation.scores).map(([keyName, score]) => `<div class="score-card"><small>${scoreLabels[keyName]}</small><strong>${score} pts</strong><div class="mini-bar"><span style="width:${score / ({temperature:20,pressure:15,gravity:15,resources:15,water:20,radiation:15}[keyName]) * 100}%"></span></div></div>`).join('')}</div>
    <div class="decision-box"><strong>Decisión del sistema:</strong><br>${escapeHtml(evaluation.explanation)}</div>
    <div class="condition-list">${Object.entries(evaluation.conditions).map(([keyName, value]) => `<div class="condition-chip ${value}">${value ? '✓' : '✕'} ${conditionLabels[keyName]}</div>`).join('')}</div>
    <div class="model-note">Recomendación humana: ${evaluation.colonyRecommended ? 'posible colonia experimental' : evaluation.roboticExploration ? 'exploración robótica' : 'observación remota'}. ${evaluation.specialSuits ? 'Se requiere soporte vital especializado.' : 'No se detecta soporte vital extremo dentro del modelo.'}</div>`;
}

function renderComparison() {
  const body = bodies.find((item) => item.id === $('#comparisonSelect').value) || bodies[0];
  if (!body) return;
  const comparison = compareWithEarth(body);
  const labels = { temperature: 'Temperatura', pressure: 'Presión', gravity: 'Gravedad', resources: 'Recursos', water: 'Agua potencial', radiation: 'Riesgo de radiación' };
  $('#comparisonContent').innerHTML = `<table class="comparison-table"><thead><tr><th>Parámetro</th><th>Tierra</th><th>${escapeHtml(body.name)}</th><th>Diferencia absoluta</th><th>Diferencia porcentual</th></tr></thead><tbody>${Object.entries(comparison).map(([key, item]) => `<tr><td><strong>${labels[key]}</strong></td><td>${item.earth} ${item.unit}</td><td>${item.body} ${item.unit}</td><td>${item.absolute} ${item.unit}</td><td>${item.percentage === null ? 'No aplicable' : `${item.percentage}%`}</td></tr>`).join('')}</tbody></table>`;
}

function renderReports() {
  const evaluations = sortedEvaluations();
  const groups = { high: [], medium: [], low: [] };
  evaluations.forEach((item) => groups[classificationKey(item.evaluation.classification)].push(item));
  const averageResources = bodies.length ? round(bodies.reduce((sum, body) => sum + body.resources, 0) / bodies.length) : 0;
  const averageTemperature = bodies.length ? round(bodies.reduce((sum, body) => sum + body.temperatureK, 0) / bodies.length) : 0;

  $('#reportMetrics').innerHTML = [
    ['Prioridad alta', groups.high.length, 'cuerpos'],
    ['Prioridad media', groups.medium.length, 'cuerpos'],
    ['Prioridad baja', groups.low.length, 'cuerpos'],
    ['Recursos promedio', `${averageResources}%`, `Temp. media ${averageTemperature} K`]
  ].map(([label, value, detail]) => `<article class="metric-card"><small>${label}</small><strong>${value}</strong><span>${detail}</span></article>`).join('');

  $('#habitabilityRanking').innerHTML = evaluations.map(({ body, evaluation }, index) => rankRow(index, body.name, evaluation.classification, evaluation.index, ' pts')).join('');
  const resources = [...bodies].sort((a, b) => b.resources - a.resources);
  $('#resourceRanking').innerHTML = resources.map((body, index) => rankRow(index, body.name, body.type, body.resources, '%')).join('');
  $('#classificationGroups').innerHTML = [
    ['Prioridad alta', groups.high, 'high'],
    ['Prioridad media', groups.medium, 'medium'],
    ['Prioridad baja', groups.low, 'low']
  ].map(([title, items, key]) => `<div class="classification-group"><span class="classification-badge ${key}">${title} · ${items.length}</span><ul>${items.length ? items.map(({ body }) => `<li>${escapeHtml(body.name)}</li>`).join('') : '<li>Sin registros</li>'}</ul></div>`).join('');
}

function rankRow(index, name, detail, value, suffix) {
  return `<div class="rank-row"><span class="rank-number">${index + 1}</span><div class="rank-info"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(detail)}</small><div class="mini-bar"><span style="width:${Math.min(100, Number(value))}%"></span></div></div><span class="rank-value">${value}${suffix}</span></div>`;
}

function renderCurrentChart() {
  const type = $('#chartSelect')?.value || 'temp-gravity';
  const configurations = {
    'temp-gravity': {
      xKey: 'temperatureK', yKey: 'gravity', xLabel: 'Temperatura (K)', yLabel: 'Gravedad (m/s²)',
      description: 'Los puntos más cercanos a la Tierra combinan temperatura y gravedad semejantes a sus valores de referencia.',
      formatX: (value) => `${Math.round(value)}`, formatY: (value) => value.toFixed(1)
    },
    'pressure-resources': {
      xKey: 'pressureAtm', yKey: 'resources', xLabel: 'Presión (atm)', yLabel: 'Recursos (%)',
      description: 'Permite observar si una alta disponibilidad de recursos coincide con presiones aptas para operaciones humanas.',
      formatX: (value) => value.toFixed(value < 1 ? 2 : 0), formatY: (value) => `${Math.round(value)}`
    },
    'water-radiation': {
      xKey: 'waterPotential', yKey: 'radiationRisk', xLabel: 'Potencial de agua (%)', yLabel: 'Riesgo de radiación (%)',
      description: 'Una zona favorable tendría alto potencial de agua y bajo riesgo de radiación.',
      formatX: (value) => `${Math.round(value)}`, formatY: (value) => `${Math.round(value)}`
    }
  };
  const config = configurations[type];
  if (!$('#scatterChart')) return;
  $('#chartDescription').textContent = config.description;
  renderScatter($('#scatterChart'), bodies, config);
}

function renderHistory() {
  $('#historyContent').innerHTML = history.length ? `<table class="history-table"><thead><tr><th>#</th><th>Cuerpo</th><th>Índice</th><th>Clasificación</th><th>Fecha</th></tr></thead><tbody>${history.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.name)}</strong></td><td>${item.index}</td><td>${escapeHtml(item.classification)}</td><td>${new Intl.DateTimeFormat('es-EC', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.timestamp))}</td></tr>`).join('')}</tbody></table>` : '<div class="empty-message">Todavía no se han solicitado evaluaciones individuales.</div>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function startStarfield() {
  const canvas = $('#starfield');
  if (!canvas || typeof canvas.getContext !== 'function') return;
  const context = canvas.getContext('2d');
  if (!context) return;
  let stars = [];
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(260, Math.floor(innerWidth * innerHeight / 5500)) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + .2,
      a: Math.random() * .65 + .15,
      speed: Math.random() * .12 + .02
    }));
  }
  function draw() {
    context.clearRect(0, 0, innerWidth, innerHeight);
    for (const star of stars) {
      star.y += star.speed;
      if (star.y > innerHeight) star.y = 0;
      context.beginPath();
      context.fillStyle = `rgba(210,230,255,${star.a})`;
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize', resize);
  draw();
}

function bindEvents() {
  $$('.nav-item').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.view)));
  $$('[data-go]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.go)));
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#catalogSearch').addEventListener('input', renderCatalog);
  $('#catalogFilter').addEventListener('change', renderCatalog);
  $('#evaluationSelect').addEventListener('change', renderSelectedSummary);
  $('#comparisonSelect').addEventListener('change', renderComparison);
  $('#chartSelect').addEventListener('change', renderCurrentChart);
  $('#evaluateButton').addEventListener('click', () => {
    performEvaluation($('#evaluationSelect').value, true);
    showToast('Evaluación registrada en el historial.');
  });

  $('#registerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const candidate = {
      id: idFromName(data.name),
      name: data.name.trim(),
      type: data.type.trim(),
      temperatureK: Number(data.temperatureK),
      pressureAtm: Number(data.pressureAtm),
      gravity: Number(data.gravity),
      resources: Number(data.resources),
      waterPotential: Number(data.waterPotential),
      radiationRisk: Number(data.radiationRisk),
      missionCost: Number(data.missionCost),
      fuel: Number(data.fuel),
      duration: Number(data.duration),
      notes: data.notes.trim(),
      color: `hsl(${Math.floor(Math.random() * 360)} 75% 65%)`
    };
    const errors = validateBodyInput(candidate, bodies);
    $('#registerErrors').innerHTML = errors.map((error) => `• ${escapeHtml(error)}`).join('<br>');
    if (errors.length) return;
    bodies.push(candidate);
    persist();
    event.currentTarget.reset();
    event.currentTarget.elements.waterPotential.value = 50;
    event.currentTarget.elements.radiationRisk.value = 50;
    event.currentTarget.elements.missionCost.value = 500;
    event.currentTarget.elements.fuel.value = 250;
    event.currentTarget.elements.duration.value = 12;
    renderAll();
    showToast(`${candidate.name} fue registrado correctamente.`);
    goToView('catalog');
  });

  $('#simulationForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = simulateMissions(bodies, data);
    $('#simulationResult').className = 'panel result-panel';
    $('#simulationResult').innerHTML = `<p class="eyebrow">RESULTADO DE SIMULACIÓN</p><h3>${result.approved.length} misiones aprobadas</h3>
      <div class="mission-list">${result.approved.map(({ body, evaluation }) => `<div class="mission-card approved"><strong>✓ ${escapeHtml(body.name)}</strong><br><small>${evaluation.classification} · costo ${body.missionCost} · combustible ${body.fuel} · ${body.duration} meses</small></div>`).join('') || '<div class="mission-card rejected">No se aprobó ninguna misión.</div>'}</div>
      <h3 style="margin-top:20px">Misiones no seleccionadas</h3>
      <div class="mission-list">${result.rejected.map(({ body, reasons }) => `<div class="mission-card rejected"><strong>✕ ${escapeHtml(body.name)}</strong><br><small>${escapeHtml(reasons.join(', '))}</small></div>`).join('') || '<div class="mission-card approved">Todos los candidatos viables fueron seleccionados.</div>'}</div>
      <div class="resource-remains"><div class="resource-remain"><strong>${round(result.remaining.budget)}</strong><small>presupuesto restante</small></div><div class="resource-remain"><strong>${round(result.remaining.fuel)}</strong><small>combustible restante</small></div><div class="resource-remain"><strong>${round(result.remaining.time)}</strong><small>meses restantes</small></div></div>`;
  });

  $('#clearHistoryButton').addEventListener('click', () => {
    if (!confirm('¿Deseas eliminar todo el historial de evaluaciones?')) return;
    history = [];
    persist();
    renderHistory();
    renderDashboard();
    showToast('Historial eliminado.');
  });

  $('#resetButton').addEventListener('click', () => {
    if (!confirm('Esto eliminará los registros añadidos y restaurará los datos iniciales.')) return;
    bodies = clone(SEED_BODIES);
    history = [];
    persist();
    renderAll();
    showToast('Base de datos restablecida.');
  });

  $('#exportButton').addEventListener('click', () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), bodies, history }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbit-explorer-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados en formato JSON.');
  });
}

function initializeOrbitExplorer() {
  try {
    startStarfield();
    bindEvents();
    renderAll();
    document.documentElement.dataset.orbitReady = 'true';
  } catch (error) {
    console.error('Orbit Explorer no pudo iniciar:', error);
    const message = document.createElement('div');
    message.className = 'startup-error';
    message.innerHTML = `<strong>No se pudo iniciar Orbit Explorer.</strong><br>${escapeHtml(error.message)}<br><small>Abre la consola del navegador para ver más detalles.</small>`;
    document.body.append(message);
  }
}

window.addEventListener('error', (event) => {
  console.error('Error global de Orbit Explorer:', event.error || event.message);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOrbitExplorer, { once: true });
} else {
  initializeOrbitExplorer();
}

})();
