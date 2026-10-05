import { randomInt } from 'node:crypto'
// La simulación se crea una sola vez al cargar el módulo, al arrancar Express.
const snails = [
  { id: 'gary', name: 'Gary', chartColor: '#34d399', iconColor: 'text-emerald-400' },
  { id: 'rocky', name: 'Rocky', chartColor: '#92400e', iconColor: 'text-amber-700' },
  { id: 'snellie', name: 'Snellie', chartColor: '#3b82f6', iconColor: 'text-blue-400' },
  { id: 'tuffsy', name: 'Miss Tuffsy', chartColor: '#ec4899', iconColor: 'text-pink-400' },
  { id: 'turbo', name: 'Turbo', chartColor: '#facc15', iconColor: 'text-yellow-400' },
  { id: 'shelly', name: 'Shelly', chartColor: '#a855f7', iconColor: 'text-purple-400' }
]
// Cada arranque representa un día simulado de seis carreras.
const RACE_COUNT = 6
// Cada carrera tiene un ganador y una apuesta ficticia a uno de los seis caracoles.
const simulation = Array.from({ length: RACE_COUNT }, (_, index) => ({
  raceNumber: index + 1,
  winner: snails[randomInt(snails.length)],
  betSnailId: snails[randomInt(snails.length)].id
}))
const won = simulation.filter(race => race.betSnailId === race.winner.id).length
const cachedDashboard = {
  won,
  lost: RACE_COUNT - won,
  snails: snails.map(snail => ({ ...snail, wins: simulation.filter(race => race.winner.id === snail.id).length })),
  races: simulation.map(race => ({ raceNumber: race.raceNumber, ...race.winner }))
}
export function dashboardData() {
  // Consultar o recargar la página no vuelve a generar carreras.
  return cachedDashboard
}

