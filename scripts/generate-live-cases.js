#!/usr/bin/env node
/**
 * scripts/generate-live-cases.js
 *
 * Consulta AviationStack en directo y extrae vuelos reales con incidencias
 * para usar como casos de prueba del wizard. Busca en los aeropuertos
 * españoles principales y clasifica cada vuelo según lo que el wizard
 * debería responder.
 *
 * Uso:
 *   node scripts/generate-live-cases.js
 *   node scripts/generate-live-cases.js --airport MAD,BCN --limit 5
 *   node scripts/generate-live-cases.js --output fixtures.json
 *
 * Requiere AVIATIONSTACK_API_KEY en .env.local
 */

const fs   = require('fs');
const path = require('path');

// ── Cargar .env.local ─────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}
loadEnvLocal();

// ── Args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
}

const AIRPORTS   = getArg('airport', 'MAD,BCN,AGP,PMI').split(',').map(s => s.trim().toUpperCase());
const PER_AIRPORT = parseInt(getArg('limit', '100'), 10);
const OUTPUT     = getArg('output', null);
const KEY        = process.env.AVIATIONSTACK_API_KEY;

if (!KEY || KEY === 'tu_aviationstack_key_aqui') {
  console.error('❌ Falta AVIATIONSTACK_API_KEY en .env.local');
  process.exit(1);
}

// ── Fetch ─────────────────────────────────────────────────────────
async function fetchFlights(depIata) {
  const url = `http://api.aviationstack.com/v1/flights?access_key=${KEY}&dep_iata=${depIata}&limit=${PER_AIRPORT}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AviationStack HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`AviationStack: ${json.error.message || JSON.stringify(json.error)}`);
  return json.data || [];
}

// ── Haversine (para estimar tramo CE 261) ─────────────────────────
const POPULAR_COORDS = require('./airport-coords');

function km(a, b) {
  const ca = POPULAR_COORDS[a], cb = POPULAR_COORDS[b];
  if (!ca || !cb) return null;
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(cb[0] - ca[0]);
  const dLon = toRad(cb[1] - ca[1]);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(ca[0])) * Math.cos(toRad(cb[0])) * Math.sin(dLon/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

function compFor(kmVal) {
  if (kmVal == null) return null;
  if (kmVal <= 1500) return 250;
  if (kmVal <= 3500) return 400;
  return 600;
}

// ── Clasificación ─────────────────────────────────────────────────
function classify(flight) {
  const dep = flight.departure, arr = flight.arrival, st = flight.flight_status;
  const delay = arr?.delay || 0;
  const origin = dep?.iata, dest = arr?.iata;

  if (st === 'cancelled') {
    return { kind: 'cancelacion', decision: 'RECLAMABLE', expected: compFor(km(origin, dest)),
             note: 'Cancelación confirmada. RECLAMABLE salvo aviso ≥14d o circunstancia extraordinaria.' };
  }

  if (delay >= 180) {
    return { kind: 'retraso', decision: 'RECLAMABLE', expected: compFor(km(origin, dest)),
             note: `Retraso de ${Math.floor(delay/60)}h ${delay%60}min en destino ≥3h → tramo ${compFor(km(origin, dest))}€.` };
  }

  if (delay > 0 && delay < 180) {
    return { kind: 'retraso', decision: 'NO_RECLAMABLE', expected: 0,
             note: `Retraso de ${delay} min < 180 min → no alcanza el umbral Sturgeon.` };
  }

  return null; // no incidencia relevante
}

// ── Main ──────────────────────────────────────────────────────────
(async () => {
  console.log(`🔍 Consultando AviationStack para ${AIRPORTS.join(', ')}...`);
  const allCases = [];
  for (const apt of AIRPORTS) {
    try {
      const flights = await fetchFlights(apt);
      console.log(`  ${apt}: ${flights.length} vuelos recibidos`);

      for (const f of flights) {
        const cls = classify(f);
        if (!cls) continue;

        const airline      = f.airline?.iata || '';
        const flightNumber = f.flight?.iata || (airline + (f.flight?.number || ''));
        const date         = f.flight_date;
        const origin       = f.departure?.iata;
        const destination  = f.arrival?.iata;

        if (!airline || !flightNumber || !date || !origin || !destination) continue;
        if (origin === destination) continue;

        allCases.push({
          kind: cls.kind,
          wizard: {
            tipo: cls.kind,
            airline,
            flightNumber,
            date,
            from: origin,
            to: destination,
            arrivalTime: f.arrival?.actual?.slice(11, 16) || '',
          },
          expected: {
            decision: cls.decision,
            compensation: cls.expected,
          },
          note: cls.note,
          realDelay: f.arrival?.delay || 0,
          realStatus: f.flight_status,
        });
      }
    } catch (e) {
      console.error(`  ${apt}: ❌ ${e.message}`);
    }
  }

  // Deduplica por flightNumber+date
  const seen = new Set();
  const unique = allCases.filter(c => {
    const k = `${c.wizard.flightNumber}-${c.wizard.date}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Ordena: reclamables primero
  unique.sort((a, b) => {
    if (a.expected.decision !== b.expected.decision) {
      return a.expected.decision === 'RECLAMABLE' ? -1 : 1;
    }
    return b.realDelay - a.realDelay;
  });

  console.log(`\n✅ ${unique.length} casos de prueba reales encontrados (${unique.filter(c => c.expected.decision === 'RECLAMABLE').length} reclamables)`);

  if (OUTPUT) {
    fs.writeFileSync(OUTPUT, JSON.stringify(unique, null, 2));
    console.log(`📝 Guardado en ${OUTPUT}`);
  } else {
    // Output legible para copiar al wizard
    console.log('\n' + '━'.repeat(60));
    unique.slice(0, 15).forEach((c, i) => {
      console.log(`\n── Caso ${i + 1} ─── ${c.kind.toUpperCase()} · ${c.expected.decision} ${c.expected.compensation ? `· ${c.expected.compensation}€` : ''}`);
      console.log(`   Tipo:     ${c.wizard.tipo}`);
      console.log(`   Compañía: ${c.wizard.airline}`);
      console.log(`   Nº vuelo: ${c.wizard.flightNumber}`);
      console.log(`   Fecha:    ${c.wizard.date}`);
      console.log(`   Ruta:     ${c.wizard.from} → ${c.wizard.to}`);
      console.log(`   Nota:     ${c.note}`);
    });
    if (unique.length > 15) console.log(`\n... y ${unique.length - 15} más. Usa --output casos.json para guardarlos todos.`);
  }
})();
