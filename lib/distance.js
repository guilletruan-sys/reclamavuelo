// lib/distance.js — calculo distancia y compensacion CE 261/2004

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function compensationForKm(km) {
  if (km <= 1500) return 250;
  if (km <= 3500) return 400;
  return 600;
}

// Lista reducida de aeropuertos con coordenadas para la calculadora de landing.
// (El AirportSelect del wizard usa la lista completa existente)
export const POPULAR_AIRPORTS = [
  { code: 'MAD', name: 'Madrid',     lat: 40.472, lon: -3.561 },
  { code: 'BCN', name: 'Barcelona',  lat: 41.297, lon: 2.078 },
  { code: 'PMI', name: 'Palma',      lat: 39.551, lon: 2.739 },
  { code: 'AGP', name: 'Málaga',     lat: 36.675, lon: -4.499 },
  { code: 'VLC', name: 'Valencia',   lat: 39.489, lon: -0.481 },
  { code: 'SVQ', name: 'Sevilla',    lat: 37.418, lon: -5.893 },
  { code: 'BIO', name: 'Bilbao',     lat: 43.301, lon: -2.911 },
  { code: 'LHR', name: 'Londres',    lat: 51.470, lon: -0.454 },
  { code: 'CDG', name: 'París',      lat: 49.012, lon: 2.550 },
  { code: 'FRA', name: 'Frankfurt',  lat: 50.033, lon: 8.570 },
  { code: 'AMS', name: 'Ámsterdam',  lat: 52.308, lon: 4.763 },
  { code: 'FCO', name: 'Roma',       lat: 41.800, lon: 12.238 },
  { code: 'JFK', name: 'Nueva York', lat: 40.641, lon: -73.778 },
  { code: 'EZE', name: 'Buenos Aires', lat: -34.822, lon: -58.535 },
];
