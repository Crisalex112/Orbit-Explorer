import { SEED_BODIES, STORAGE_KEYS } from './data.js';
import { compareWithEarth, evaluateBody, simulateMissions, validateBodyInput } from './evaluation.js';
import { renderScatter } from './charts.js';

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
    const candidateInput = {
      name: String(data.name ?? '').trim(),
      type: String(data.type ?? '').trim(),
      temperatureK: data.temperatureK,
      pressureAtm: data.pressureAtm,
      gravity: data.gravity,
      resources: data.resources,
      waterPotential: data.waterPotential,
      radiationRisk: data.radiationRisk,
      missionCost: data.missionCost,
      fuel: data.fuel,
      duration: data.duration,
      notes: String(data.notes ?? '').trim()
    };
    const errors = validateBodyInput(candidateInput, bodies);
    $('#registerErrors').innerHTML = errors.map((error) => `• ${escapeHtml(error)}`).join('<br>');
    if (errors.length) return;

    const candidate = {
      id: idFromName(candidateInput.name),
      name: candidateInput.name,
      type: candidateInput.type,
      temperatureK: Number(candidateInput.temperatureK),
      pressureAtm: Number(candidateInput.pressureAtm),
      gravity: Number(candidateInput.gravity),
      resources: Number(candidateInput.resources),
      waterPotential: Number(candidateInput.waterPotential),
      radiationRisk: Number(candidateInput.radiationRisk),
      missionCost: Number(candidateInput.missionCost),
      fuel: Number(candidateInput.fuel),
      duration: Number(candidateInput.duration),
      notes: candidateInput.notes,
      color: `hsl(${Math.floor(Math.random() * 360)} 75% 65%)`
    };
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
