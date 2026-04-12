// lib/agent.js
// Agente Claude que analiza todos los datos y toma la decisión de reclamabilidad

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un experto jurídico en reclamaciones aéreas, especializado en el Reglamento CE 261/2004 del Parlamento Europeo.

Tu misión es analizar los datos de un vuelo y determinar si el pasajero tiene derecho a compensación económica.

REGLAS CLAVE del Reglamento CE 261/2004:

RETRASO:
- Derecho a compensación si llegada al destino final con 3h o más de retraso
- Sin compensación si la causa fue "circunstancia extraordinaria" no evitable: meteorología severa real, huelga externa (no del personal de la aerolínea), restricción ATC/ATFM de Eurocontrol, inestabilidad política, riesgo de seguridad
- La aerolínea tiene la carga de la prueba: debe demostrar la circunstancia extraordinaria

CANCELACIÓN:
- Derecho a compensación si el pasajero fue informado con menos de 14 días de antelación
- Sin compensación si: aviso >14 días antes, o causa extraordinaria, o se ofreció vuelo alternativo que llega con <2h de diferencia (vuelos <1500km) o <3h (vuelos 1500-3500km) o <4h (vuelos >3500km)

CONEXIÓN PERDIDA:
- Se aplica si los vuelos están bajo el mismo número de reserva (PNR)
- El retraso se mide en el DESTINO FINAL, no en el punto de conexión
- Compensación basada en distancia origen → destino final

OVERBOOKING:
- Casi siempre reclamable salvo fuerza mayor demostrable
- La aerolínea debe ofrecer compensación voluntaria en el momento

COMPENSACIONES según distancia:
- Vuelos ≤1500km: 250€
- Vuelos intracomunitarios >1500km y todos entre 1500-3500km: 400€  
- Vuelos >3500km fuera de la UE: 600€
- Si se ofrece vuelo alternativo que llega dentro de los límites: compensación reducida al 50%

CONDICIONES EXTRAORDINARIAS — criterio estricto:
- Meteorología: solo si las condiciones METAR confirman fenómenos realmente severos (tormentas, niebla densa, nieve intensa, viento >35kt). Un día nublado o lluvia ligera NO es circunstancia extraordinaria.
- ATC: solo si hay restricciones ATFM documentadas (no basta con que la aerolínea lo alegue)
- La aerolínea tiene OBLIGACIÓN de demostrarlo, no el pasajero

Tu respuesta debe ser SIEMPRE un único objeto JSON válido, sin texto antes ni después, sin envoltorios markdown ni bloques de código. Estructura exacta:
{
  "decision": "RECLAMABLE" | "NO_RECLAMABLE" | "REVISAR_MANUALMENTE",
  "confianza": "ALTA" | "MEDIA" | "BAJA",
  "compensacion_estimada": número en euros o null,
  "resumen_usuario": "Explicación clara en español para el pasajero (2-3 frases)",
  "razonamiento_interno": "Análisis jurídico detallado para el equipo (puede ser más técnico, máximo 4 frases)",
  "factores_clave": ["factor1", "factor2"],
  "siguiente_paso": "Qué debe hacer el usuario ahora"
}

IMPORTANTE: sé conciso en razonamiento_interno (máximo 4 frases). No uses bloques de código markdown. Responde solo con el JSON plano, nada más.`;

export async function analyzeClaimWithClaude(claimData) {
  const {
    incidentType,    // 'delay' | 'cancellation' | 'connection' | 'overbooking' | 'baggage' | 'injury'
    flightData,      // datos del formulario
    flightStatus,    // respuesta de FlightStats
    flightStatus2,   // segundo vuelo si hay conexión
    metarAnalysis,   // análisis METAR
  } = claimData;

  // Convenio de Montreal: equipaje y lesiones — análisis determinista, siempre REVISAR_MANUALMENTE
  if (incidentType === 'baggage') {
    return analyzeBaggage(flightData || {});
  }
  if (incidentType === 'injury') {
    return analyzeInjury(flightData || {});
  }

  const userMessage = buildPrompt(claimData);

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 4096,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userMessage }],
  });

  const text = response.content?.[0]?.text || '';
  const stopReason = response.stop_reason;

  // Extraer JSON de la respuesta
  try {
    // Quitar cercos markdown si los añadió
    let clean = text.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    // Si hay texto antes/después del objeto JSON, extraer el bloque {...} greedy
    const first = clean.indexOf('{');
    const last  = clean.lastIndexOf('}');
    if (first !== -1 && last > first) {
      clean = clean.slice(first, last + 1);
    }

    if (!clean.startsWith('{')) throw new Error('No JSON object found');
    if (stopReason === 'max_tokens') throw new Error('Respuesta truncada por max_tokens');

    const parsed = JSON.parse(clean);
    // Validación mínima del schema
    if (!parsed.decision) throw new Error('JSON sin campo decision');
    return parsed;
  } catch (e) {
    console.error('[agent] Parse error:', e.message);
    console.error('[agent] Raw response (stop=' + stopReason + '):', text.slice(0, 600));
    return {
      decision:              'REVISAR_MANUALMENTE',
      confianza:             'BAJA',
      compensacion_estimada: null,
      resumen_usuario:       'Hemos recibido tu caso. Nuestro equipo lo revisará manualmente y te contactaremos en 24 horas.',
      razonamiento_interno:  `Error parseando respuesta del agente (${e.message}, stop=${stopReason}): ${text.slice(0, 800)}`,
      factores_clave:        [],
      siguiente_paso:        'Espera respuesta del equipo en 24 horas.',
    };
  }
}

function buildPrompt(data) {
  const { incidentType, flightData, flightStatus, flightStatus2, metarAnalysis } = data;

  const lines = [
    `TIPO DE INCIDENCIA: ${incidentType}`,
    '',
    '=== DATOS APORTADOS POR EL PASAJERO ===',
    `Vuelo: ${flightData.flightNumber}`,
    `Fecha: ${flightData.date}`,
    `Ruta: ${flightData.origin} → ${flightData.destination}`,
    `Aerolínea: ${flightData.airline}`,
  ];

  if (incidentType === 'connection' && flightData.flightNumber2) {
    lines.push(`Vuelo conexión: ${flightData.flightNumber2}`);
    lines.push(`Mismo PNR: ${flightData.samePNR ? 'SÍ' : 'NO'}`);
    lines.push(`Destino final: ${flightData.finalDestination}`);
  }

  if (incidentType === 'cancellation') {
    lines.push(`¿Se ofreció vuelo alternativo?: ${flightData.alternativeOffered ? 'SÍ' : 'NO'}`);
    if (flightData.alternativeOffered) {
      lines.push(`Hora llegada alternativa: ${flightData.alternativeArrival || 'No indicada'}`);
    }
    lines.push(`¿Cuándo fue informado de la cancelación?: ${flightData.cancellationNotice || 'No indicado'}`);
  }

  if (incidentType === 'overbooking') {
    lines.push(`¿Se ofreció compensación en el aeropuerto?: ${flightData.airportCompensation ? 'SÍ' : 'NO'}`);
  }

  lines.push('');
  lines.push('=== DATOS VERIFICADOS EN FLIGHTSTATS ===');

  if (flightStatus) {
    lines.push(`Estado del vuelo: ${statusLabel(flightStatus.status)}`);
    lines.push(`Salida programada: ${flightStatus.scheduledDep || 'N/D'}`);
    lines.push(`Salida real: ${flightStatus.departed || 'N/D'}`);
    lines.push(`Llegada programada: ${flightStatus.scheduledArr || 'N/D'}`);
    lines.push(`Llegada real: ${flightStatus.arrived || 'N/D'}`);
    lines.push(`Retraso en llegada: ${flightStatus.delayMinutes} minutos`);
    lines.push(`Cancelado: ${flightStatus.cancelled ? 'SÍ' : 'NO'}`);
    lines.push(`Códigos de causa: ${flightStatus.delayCodes.length > 0 ? flightStatus.delayCodes.join(', ') : 'No disponibles'}`);
  } else {
    lines.push('Vuelo NO encontrado en FlightStats (modo demo activo o vuelo muy antiguo)');
  }

  if (flightStatus2) {
    lines.push('');
    lines.push('--- Vuelo de conexión ---');
    lines.push(`Estado: ${statusLabel(flightStatus2.status)}`);
    lines.push(`Llegada real destino final: ${flightStatus2.arrived || 'N/D'}`);
    lines.push(`Llegada programada destino final: ${flightStatus2.scheduledArr || 'N/D'}`);
    lines.push(`Retraso en destino final: ${flightStatus2.delayMinutes} minutos`);
  }

  lines.push('');
  lines.push('=== DATOS METEOROLÓGICOS (METAR) ===');
  lines.push(metarAnalysis?.summary || 'No disponible');
  if (metarAnalysis?.conditions?.length > 0) {
    lines.push(`Condiciones detectadas: ${metarAnalysis.conditions.join(', ')}`);
  }
  if (metarAnalysis?.rawMetars?.length > 0) {
    lines.push(`METARs raw: ${metarAnalysis.rawMetars.slice(0, 3).join(' | ')}`);
  }

  lines.push('');
  lines.push('Analiza este caso y emite tu decisión en el formato JSON especificado.');

  return lines.join('\n');
}

// ── CONVENIO DE MONTREAL — EQUIPAJE ──────────────────────────────────────────
function analyzeBaggage(flightData) {
  const { luggageType, luggageValue, pirDone } = flightData;

  if (pirDone !== 'yes') {
    return {
      decision:              'REVISAR_MANUALMENTE',
      confianza:             'MEDIA',
      compensacion_estimada: null,
      resumen_usuario:       'Sin PIR (parte de irregularidad en el aeropuerto), la reclamación por equipaje es más complicada. Nuestro equipo revisará si aún hay vía alternativa (carta formal a la aerolínea) y te contactará en 24h.',
      razonamiento_interno:  `Equipaje ${luggageType || 'N/D'}, valor declarado ${luggageValue || 'N/D'}€, sin PIR. Aplica Convenio de Montreal art. 17.2 y 31 (plazos: 7 días para daño, 21 días para retraso).`,
      factores_clave:        ['Sin PIR', 'Convenio de Montreal', 'Revisión abogado'],
      siguiente_paso:        'Un abogado revisará si existe vía alternativa de reclamación.',
      regulation:            'Convenio de Montreal art. 17.2, 31',
    };
  }

  const valorNum = parseInt(luggageValue, 10) || 0;
  const compensacion = valorNum > 0 ? Math.min(1600, valorNum) : null;

  return {
    decision:              'REVISAR_MANUALMENTE',
    confianza:             'ALTA',
    compensacion_estimada: compensacion,
    resumen_usuario:       'Tu caso de equipaje está cubierto por el Convenio de Montreal (límite máximo ~1.600€ por pasajero). El importe exacto depende de la documentación (facturas, fotos, PIR) y lo estimará nuestro equipo tras revisar los documentos.',
    razonamiento_interno:  `Equipaje ${luggageType || 'N/D'}. Valor declarado: ${luggageValue || 'no indicado'}€. PIR: sí. Aplica Convenio de Montreal — límite ~1.288 DEG (~1.600€) por pasajero. Importe exacto requiere revisión con documentación probatoria.`,
    factores_clave:        ['PIR realizado', 'Convenio de Montreal', `Valor declarado: ${luggageValue || 'N/D'}€`],
    siguiente_paso:        'Aporta PIR, facturas y fotos del equipaje. Nuestro equipo estimará la compensación.',
    regulation:            'Convenio de Montreal',
  };
}

// ── CONVENIO DE MONTREAL — LESIONES ──────────────────────────────────────────
function analyzeInjury(flightData) {
  const { medicalReport, injuryType, injuryDescription } = flightData;
  const hasProof = medicalReport === 'yes';

  return {
    decision:              'REVISAR_MANUALMENTE',
    confianza:             hasProof ? 'ALTA' : 'MEDIA',
    compensacion_estimada: null, // varía caso a caso
    resumen_usuario:       hasProof
      ? 'Tu caso es reclamable bajo el art. 17.1 del Convenio de Montreal (responsabilidad objetiva de la aerolínea por lesiones durante embarque, vuelo o desembarque). Uno de nuestros abogados revisará el parte médico y te contactará para estimar la compensación.'
      : 'Los casos de lesión requieren parte médico para estimar compensación. Nuestro equipo se pondrá en contacto para orientarte sobre cómo obtener la prueba necesaria.',
    razonamiento_interno:  `Tipo de lesión: ${injuryType || 'N/D'}. Descripción: ${injuryDescription || 'sin descripción'}. Parte médico: ${medicalReport || 'no'}. Aplica Convenio de Montreal art. 17.1.`,
    factores_clave:        ['Convenio de Montreal art. 17.1', hasProof ? 'Parte médico aportado' : 'Sin parte médico'],
    siguiente_paso:        hasProof
      ? 'Un abogado revisará el parte médico y te contactará para estimar la compensación.'
      : 'Un abogado te orientará sobre cómo obtener el parte médico.',
    regulation:            'Convenio de Montreal art. 17.1',
  };
}

function statusLabel(code) {
  const labels = {
    'L': 'Aterrizado (L)',
    'C': 'Cancelado (C)',
    'A': 'En vuelo (A)',
    'S': 'Programado (S)',
    'D': 'Desviado (D)',
    'U': 'Desconocido (U)',
  };
  return labels[code] || code || 'Desconocido';
}
