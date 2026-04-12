// pages/api/verify.js
// Endpoint principal: recibe datos del formulario, consulta APIs y devuelve decisión

import { getFlightStatus, parseFlightNumber }                      from '../../lib/aviationstack';
import { getMetars, analyzeMetars }                               from '../../lib/metar';
import { analyzeClaimWithClaude }                                 from '../../lib/agent';

// Mapa IATA → ICAO para METARs (aeropuertos españoles y europeos más comunes)
const IATA_TO_ICAO = {
  MAD: 'LEMD', BCN: 'LEBL', VLC: 'LEVC', AGP: 'LEMG', PMI: 'LEPA',
  SVQ: 'LEZL', BIO: 'LEBB', LPA: 'GCLP', TFN: 'GCXO', TFS: 'GCTS',
  ALC: 'LEAL', IBZ: 'LEIB', SDR: 'LEXJ', VGO: 'LEVX', OVD: 'LEAS',
  LHR: 'EGLL', LGW: 'EGKK', CDG: 'LFPG', ORY: 'LFPO', AMS: 'EHAM',
  FRA: 'EDDF', MUC: 'EDDM', FCO: 'LIRF', MXP: 'LIML', LIS: 'LPPT',
  ZRH: 'LSZH', BRU: 'EBBR', VIE: 'LOWW', ATH: 'LGAV', WAW: 'EPWA',
  PRG: 'LKPR', BUD: 'LHBP', CPH: 'EKCH', ARN: 'ESSA', OSL: 'ENGM',
  HEL: 'EFHK', DUB: 'EIDW', JFK: 'KJFK', LAX: 'KLAX', MIA: 'KMIA',
  ORD: 'KORD', DXB: 'OMDB', DOH: 'OTHH', NRT: 'RJAA', SIN: 'WSSS',
};

function toIcao(iata) {
  return IATA_TO_ICAO[iata?.toUpperCase()] || iata;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    incidentType,        // 'delay' | 'cancellation' | 'connection' | 'overbooking'
    flightNumber,
    date,
    origin,
    destination,
    airline,
    // Conexión
    flightNumber2,
    samePNR,
    finalDestination,
    // Cancelación
    alternativeOffered,
    alternativeAccepted,
    alternativeArrival,
    cancellationNotice,
    // Overbooking
    airportCompensation,
    // Equipaje (Convenio de Montreal)
    luggageType,
    luggageValue,
    pirDone,
    // Lesiones (Convenio de Montreal)
    injuryType,
    medicalReport,
    injuryDescription,
    // Demo mode
    demoMode,
  } = req.body;

  // Validación básica
  if (!incidentType || !flightNumber || !date || !origin || !destination) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    let flightStatus  = null;
    let flightStatus2 = null;
    let metarAnalysis = null;

    // ── MODO DEMO (sin API keys reales) ─────────────────────────────────
    if (demoMode || !process.env.AVIATIONSTACK_API_KEY || process.env.AVIATIONSTACK_API_KEY === 'tu_aviationstack_key_aqui') {
      flightStatus  = buildDemoFlightStatus(incidentType, flightNumber, origin, destination);
      flightStatus2 = flightNumber2 ? buildDemoFlightStatus('delay', flightNumber2, destination, finalDestination) : null;
      metarAnalysis = { available: false, adverseFound: false, conditions: [], summary: 'Modo demo: datos meteorológicos simulados. Sin condiciones adversas.' };
    } else {
      // ── FLIGHTSTATS REAL ───────────────────────────────────────────────
      try {
        const parsed = parseFlightNumber(flightNumber);
        flightStatus = await getFlightStatus(parsed.carrier, parsed.number, date);
      } catch (e) {
        console.error('FlightStats error:', e.message);
        flightStatus = null;
      }

      // Segundo vuelo si hay conexión
      if (flightNumber2) {
        try {
          const parsed2 = parseFlightNumber(flightNumber2);
          flightStatus2 = await getFlightStatus(parsed2.carrier, parsed2.number, date);
        } catch (e) {
          console.error('FlightStats error vuelo 2:', e.message);
        }
      }

      // ── METAR (solo si hay indicios de causa meteorológica) ────────────
      const needsMetar = flightStatus?.delayCodes?.includes('W') ||
                         flightStatus?.delayCodes?.includes('WX') ||
                         incidentType === 'delay' ||
                         incidentType === 'cancellation';

      if (needsMetar && flightStatus?.departed) {
        const icaoOrigin = toIcao(origin);
        const metars = await getMetars(icaoOrigin, flightStatus.departed);
        metarAnalysis = analyzeMetars(metars);
      } else {
        metarAnalysis = { available: false, summary: 'METAR no consultado para este tipo de incidencia.' };
      }
    }

    // ── AGENTE CLAUDE ────────────────────────────────────────────────────
    const claimData = {
      incidentType,
      flightData: { flightNumber, date, origin, destination, airline, flightNumber2, samePNR, finalDestination, alternativeOffered, alternativeAccepted, alternativeArrival, cancellationNotice, airportCompensation, luggageType, luggageValue, pirDone, injuryType, medicalReport, injuryDescription },
      flightStatus,
      flightStatus2,
      metarAnalysis,
    };

    let agentResult;
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'tu_anthropic_key_aqui') {
      // Demo mode para Claude también
      agentResult = buildDemoAgentResult(incidentType, flightStatus, claimData.flightData);
    } else {
      agentResult = await analyzeClaimWithClaude(claimData);
    }

    return res.status(200).json({
      success:      true,
      flightStatus,
      metarAnalysis,
      decision:     agentResult,
      demoMode:     !process.env.AVIATIONSTACK_API_KEY || process.env.AVIATIONSTACK_API_KEY === 'tu_aviationstack_key_aqui',
    });

  } catch (error) {
    console.error('Error en /api/verify:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}

// ── HELPERS MODO DEMO ─────────────────────────────────────────────────────────

function buildDemoFlightStatus(incidentType, flightNumber, origin, dest) {
  const baseStatus = {
    carrier:      flightNumber.slice(0, 2),
    flightNumber: flightNumber.slice(2),
    origin,
    destination:  dest,
    delayCodes:   [],
    cancelled:    false,
    diverted:     false,
  };

  if (incidentType === 'cancellation') {
    return { ...baseStatus, status: 'C', cancelled: true, delayMinutes: 0, departed: null, arrived: null, scheduledDep: '2024-11-15T08:30:00', scheduledArr: '2024-11-15T10:45:00' };
  }
  if (incidentType === 'overbooking') {
    return { ...baseStatus, status: 'L', cancelled: false, delayMinutes: 15, departed: '2024-11-15T08:45:00', arrived: '2024-11-15T11:00:00', scheduledDep: '2024-11-15T08:30:00', scheduledArr: '2024-11-15T10:45:00' };
  }
  // delay / connection → retraso de 4h 20min
  return { ...baseStatus, status: 'L', delayMinutes: 260, departed: '2024-11-15T12:30:00', arrived: '2024-11-15T17:05:00', scheduledDep: '2024-11-15T08:30:00', scheduledArr: '2024-11-15T12:45:00' };
}

function buildDemoAgentResult(incidentType, flightStatus, flightData = {}) {
  if (incidentType === 'baggage') {
    const pir = flightData.pirDone === 'yes';
    const val = parseInt(flightData.luggageValue, 10) || 0;
    return {
      decision: 'REVISAR_MANUALMENTE',
      confianza: pir ? 'ALTA' : 'MEDIA',
      compensacion_estimada: pir && val > 0 ? Math.min(1600, val) : null,
      resumen_usuario: pir
        ? 'Tu caso de equipaje está cubierto por el Convenio de Montreal (límite máximo ~1.600€ por pasajero). El importe exacto depende de la documentación (facturas, fotos, PIR) y lo estimará nuestro equipo tras revisar los documentos.'
        : 'Sin PIR la reclamación por equipaje es más complicada. Nuestro equipo revisará si aún hay vía alternativa y te contactará en 24h.',
      razonamiento_interno: `Demo: equipaje ${flightData.luggageType || 'N/D'}, valor ${flightData.luggageValue || 'N/D'}€, PIR: ${flightData.pirDone || 'no'}. Convenio de Montreal.`,
      factores_clave: ['Convenio de Montreal', pir ? 'PIR realizado' : 'Sin PIR'],
      siguiente_paso: 'Aporta PIR, facturas y fotos. Nuestro equipo estimará la compensación.',
      regulation: 'Convenio de Montreal',
    };
  }
  if (incidentType === 'injury') {
    const hasProof = flightData.medicalReport === 'yes';
    return {
      decision: 'REVISAR_MANUALMENTE',
      confianza: hasProof ? 'ALTA' : 'MEDIA',
      compensacion_estimada: null,
      resumen_usuario: hasProof
        ? 'Tu caso es reclamable bajo el art. 17.1 del Convenio de Montreal. Uno de nuestros abogados revisará el parte médico y te contactará para estimar la compensación.'
        : 'Los casos de lesión requieren parte médico. Nuestro equipo se pondrá en contacto para orientarte.',
      razonamiento_interno: `Demo: lesión ${flightData.injuryType || 'N/D'}. Parte médico: ${flightData.medicalReport || 'no'}. Convenio de Montreal art. 17.1.`,
      factores_clave: ['Convenio de Montreal art. 17.1', hasProof ? 'Parte médico aportado' : 'Sin parte médico'],
      siguiente_paso: hasProof ? 'Un abogado revisará el parte médico.' : 'Un abogado te orientará sobre cómo obtener el parte médico.',
      regulation: 'Convenio de Montreal art. 17.1',
    };
  }
  if (incidentType === 'overbooking') {
    return { decision: 'RECLAMABLE', confianza: 'ALTA', compensacion_estimada: 400, resumen_usuario: 'La denegación de embarque (overbooking) es reclamable bajo el Reglamento CE 261/2004. Tienes derecho a compensación económica más reembolso o vuelo alternativo.', razonamiento_interno: 'Demo: overbooking sin causa de fuerza mayor documentada.', factores_clave: ['Overbooking confirmado', 'Sin exención aplicable'], siguiente_paso: 'Iniciamos la reclamación formal ante la aerolínea.' };
  }
  if (incidentType === 'cancellation') {
    return { decision: 'RECLAMABLE', confianza: 'ALTA', compensacion_estimada: 400, resumen_usuario: 'Tu vuelo fue cancelado sin el preaviso mínimo de 14 días exigido por la normativa europea. Tienes derecho a compensación económica.', razonamiento_interno: 'Demo: cancelación con aviso insuficiente y sin circunstancia extraordinaria documentada.', factores_clave: ['Cancelación confirmada', 'Aviso insuficiente'], siguiente_paso: 'Iniciamos la reclamación formal ante la aerolínea.' };
  }
  if (flightStatus?.delayMinutes >= 180) {
    return { decision: 'RECLAMABLE', confianza: 'ALTA', compensacion_estimada: 400, resumen_usuario: `Tu vuelo llegó con ${flightStatus.delayMinutes} minutos de retraso (${Math.floor(flightStatus.delayMinutes/60)}h ${flightStatus.delayMinutes%60}min). Supera el umbral de 3 horas del Reglamento CE 261/2004 y no se detectaron circunstancias extraordinarias. Tienes derecho a compensación.`, razonamiento_interno: 'Demo: retraso >3h sin delay code de causa extraordinaria ni condiciones METAR adversas.', factores_clave: ['Retraso >3h confirmado', 'Sin meteorología adversa', 'Sin restricción ATC documentada'], siguiente_paso: 'Iniciamos la reclamación formal ante la aerolínea.' };
  }
  return { decision: 'NO_RECLAMABLE', confianza: 'ALTA', compensacion_estimada: null, resumen_usuario: 'El retraso de tu vuelo fue inferior a 3 horas, por lo que no alcanza el umbral mínimo exigido por el Reglamento CE 261/2004 para tener derecho a compensación económica.', razonamiento_interno: 'Demo: retraso <3h.', factores_clave: ['Retraso <3h'], siguiente_paso: 'Lamentablemente no es posible reclamar en este caso.' };
}
