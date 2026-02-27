// lib/flightstats.js
// Wrapper para la API de FlightStats/Cirium

const BASE = 'https://api.flightstats.com/flex';
const APP_ID  = process.env.FLIGHTSTATS_APP_ID;
const APP_KEY = process.env.FLIGHTSTATS_APP_KEY;

/**
 * Obtiene el estado histórico de un vuelo por fecha
 * Devuelve null si no se encuentra
 */
export async function getFlightStatus(carrier, flightNumber, date) {
  const d = new Date(date);
  const year  = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day   = d.getUTCDate();

  const url = `${BASE}/flightstatus/rest/v2/json/flight/status/${carrier}/${flightNumber}/arr/${year}/${month}/${day}?appId=${APP_ID}&appKey=${APP_KEY}&utc=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`FlightStats error: ${res.status}`);

  const data = await res.json();
  const flights = data.flightStatuses || [];
  if (flights.length === 0) return null;

  // Cogemos el primer resultado (puede haber varios legs)
  const f = flights[0];

  return {
    carrier:        f.carrierFsCode,
    flightNumber:   f.flightNumber,
    status:         f.status,                          // 'L' landed, 'C' cancelled, 'A' active, 'S' scheduled
    departed:       f.operationalTimes?.actualGateDeparture?.dateLocal || null,
    arrived:        f.operationalTimes?.actualGateArrival?.dateLocal   || null,
    scheduledArr:   f.operationalTimes?.scheduledGateArrival?.dateLocal || null,
    scheduledDep:   f.operationalTimes?.scheduledGateDeparture?.dateLocal || null,
    delayMinutes:   f.delays?.arrivalGateDelayMinutes  || 0,
    delayCodes:     f.flightDurations?.scheduledBlockMinutes ? extractDelayCodes(f) : [],
    cancelled:      f.status === 'C',
    diverted:       f.status === 'D',
    origin:         f.departureAirportFsCode,
    destination:    f.arrivalAirportFsCode,
    raw:            f,                                 // respuesta completa por si acaso
  };
}

/**
 * Extrae delay codes del vuelo (W=weather, A=ATC, M=maintenance, etc.)
 */
function extractDelayCodes(flight) {
  const codes = [];
  const irregOps = flight.irregularOperations || [];
  irregOps.forEach(op => {
    if (op.category) codes.push(op.category);
  });
  return codes;
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
