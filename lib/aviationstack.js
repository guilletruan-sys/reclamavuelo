// lib/aviationstack.js
// Wrapper para AviationStack (plan gratuito: 500 req/mes, HTTP)
// Misma interfaz que flightstats.js para ser drop-in replacement

const BASE = 'http://api.aviationstack.com/v1'; // free plan = HTTP only
const KEY  = process.env.AVIATIONSTACK_API_KEY;

/**
 * Obtiene el estado de un vuelo por número IATA y fecha
 * Devuelve null si no se encuentra
 */
export async function getFlightStatus(carrier, flightNumber, date) {
  if (!KEY) throw new Error('AVIATIONSTACK_API_KEY no configurada');

  const flightIata = `${carrier}${flightNumber}`;
  const url = `${BASE}/flights?access_key=${KEY}&flight_iata=${flightIata}&flight_date=${date}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AviationStack error: ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(`AviationStack: ${data.error.message}`);

  const flights = data.data || [];
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
