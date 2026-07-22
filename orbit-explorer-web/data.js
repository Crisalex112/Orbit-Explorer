export const EARTH_REFERENCE = Object.freeze({
  temperatureK: 288,
  pressureAtm: 1,
  gravity: 9.81,
  resources: 100,
  waterPotential: 100,
  radiationRisk: 0
});

export const SEED_BODIES = [
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

export const STORAGE_KEYS = Object.freeze({
  bodies: 'orbit-explorer:bodies:v1',
  history: 'orbit-explorer:history:v1'
});
