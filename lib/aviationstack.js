// lib/aviationstack.js
// Wrapper para AviationStack (plan gratuito: 500 req/mes, HTTP)
// Misma interfaz que flightstats.js para ser drop-in replacement

const BASE = 'http://api.aviationstack.com/v1'; // free plan = HTTP only
const KEY  = process.env.AVIATIONSTACK_API_KEY;

/**
 * Obtiene el estado de un vuelo por número IATA y fecha.
 *
 * IMPORTANTE — El filtro `flight_iata` del plan gratuito de AviationStack
 * devuelve 0 resultados aunque el vuelo exista. Estrategia:
 *   1. Intentar primero con `flight_iata` (funciona en plan de pago).
 *   2. Si devuelve 0 y tenemos aeropuerto origen, consultar por `dep_iata`
 *      y filtrar client-side por flight_iata exacto.
 *
 * `origin` es opcional para retro-compatibilidad pero muy recomendado
 * para que funcione el fallback.
 *
 * Devuelve null si no se encuentra.
 */
export async function getFlightStatus(carrier, flightNumber, date, origin) {
  if (!KEY) throw new Error('AVIATIONSTACK_API_KEY no configurada');

  const flightIata = `${carrier}${flightNumber}`;

  // Intento 1: por flight_iata (rápido, requiere plan de pago).
  // Si el plan gratuito no lo permite (403) o no devuelve resultados, pasamos al fallback.
  let flights = [];
  try {
    flights = await fetchFlights({ flight_iata: flightIata, flight_date: date });
  } catch (e) {
    console.warn('[aviationstack] flight_iata no disponible, usando fallback dep_iata:', e.message);
  }

  // Intento 2: fallback por aeropuerto origen + filter client-side (funciona en plan gratuito)
  if (flights.length === 0 && origin) {
    try {
      const all = await fetchFlights({ dep_iata: origin, flight_date: date, limit: 100 });
      flights = all.filter(f => (f.flight?.iata || '').toUpperCase() === flightIata.toUpperCase());
    } catch (e) {
      console.error('[aviationstack] fallback dep_iata fallo:', e.message);
      return null;
    }
  }

  if (flights.length === 0) return null;

  const f = flights[0];
  const dep = f.departure || {};
  const arr = f.arrival   || {};

  const delayArr = arr.delay || 0; // minutos

  // Mapeo al mismo formato que usaba flightstats.js
  return {
    carrier:       carrier,
    flightNumber:  flightNumber,
    status:        mapStatus(f.flight_status),
    departed:      dep.actual    || dep.estimated || null,
    arrived:       arr.actual    || arr.estimated || null,
    scheduledDep:  dep.scheduled || null,
    scheduledArr:  arr.scheduled || null,
    delayMinutes:  delayArr,
    delayCodes:    [],             // AviationStack free no da códigos de causa
    cancelled:     f.flight_status === 'cancelled',
    diverted:      f.flight_status === 'diverted',
    origin:        dep.iata || carrier,
    destination:   arr.iata || '',
    raw:           f,
  };
}

/**
 * Helper interno: construye URL + fetch + error handling.
 */
async function fetchFlights(params) {
  const qs = new URLSearchParams({ access_key: KEY, ...params });
  const url = `${BASE}/flights?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AviationStack HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`AviationStack: ${data.error.message || JSON.stringify(data.error)}`);
  return data.data || [];
}

/**
 * Parsea el número de vuelo en carrier (IATA) + número
 * Ej: "IB3456" → { carrier: "IB", number: "3456" }
 */
export function parseFlightNumber(raw) {
  const match = raw.trim().toUpperCase().match(/^([A-Z]{2,3})(\d+)$/);
  if (!match) throw new Error(`Número de vuelo inválido: ${raw}`);
  return { carrier: match[1], number: match[2] };
}

function mapStatus(s) {
  switch (s) {
    case 'landed':    return 'L';
    case 'cancelled': return 'C';
    case 'diverted':  return 'D';
    case 'active':    return 'A';
    default:          return 'S';
  }
}
