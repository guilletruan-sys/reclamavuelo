// lib/agent.js
// Agente Claude que analiza todos los datos y toma la decisión de reclamabilidad

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un experto en CE 261/2004. Tu trabajo: decidir si el pasajero tiene derecho a compensación y dar una respuesta CLARA Y CORTA.

REGLAS OPERATIVAS:
1. **Decide siempre.** Tu output debe ser RECLAMABLE o NO_RECLAMABLE. Solo usa REVISAR_MANUALMENTE si el caso tiene ambigüedad jurídica real (ej: overbooking voluntario, lesión con parte médico pendiente). NUNCA uses REVISAR por falta de datos de FlightStats — confía en la declaración del pasajero.
2. **FlightStats puede faltar.** Si no hay datos verificados, asume que el pasajero dice la verdad. Trabaja con los datos declarados.
3. **Sé breve y directo.** El pasajero quiere saber sí o no, y cuánto. No pidas más información en el resumen ni en el siguiente paso.

COMPENSACIONES CE 261 art. 7:
- ≤1500 km: 250€
- 1500-3500 km (o intracomunitario >1500): 400€
- >3500 km (fuera UE): 600€
- Mitad si se ofreció alternativa que llegó dentro de márgenes (<2h/3h/4h)

CUÁNDO SÍ RECLAMABLE:
- RETRASO ≥3h en destino final sin causa extraordinaria documentada → SÍ
- CANCELACIÓN avisada con <14 días y sin causa extraordinaria → SÍ
- CONEXIÓN perdida mismo PNR con ≥3h retraso en destino final → SÍ
- OVERBOOKING con denegación involuntaria → SÍ

CUÁNDO NO RECLAMABLE:
- Retraso <3h → NO
- Cancelación avisada ≥14 días antes → NO
- Causa extraordinaria documentada (METAR severo confirmado, huelga de terceros tipo controladores, ATC/ATFM Eurocontrol, riesgo seguridad) → NO
- Conexión con billetes separados (distinto PNR) → NO

CIRCUNSTANCIAS EXTRAORDINARIAS — solo aplican si están confirmadas por datos (METAR severo en el feed, noticia pública de huelga ATC, restricción ATFM). En ausencia de evidencia de extraordinaria → asume que NO aplica y decide a favor del pasajero.

FORMATO DE SALIDA — SOLO JSON plano, sin markdown ni backticks:
{
  "decision": "RECLAMABLE" | "NO_RECLAMABLE" | "REVISAR_MANUALMENTE",
  "confianza": "ALTA" | "MEDIA" | "BAJA",
  "compensacion_estimada": número en euros o null,
  "resumen_usuario": "1 frase directa: sí/no + cifra si procede + razón principal. Máximo 25 palabras.",
  "razonamiento_interno": "2 frases con el artículo aplicable. Máximo 40 palabras.",
  "factores_clave": ["factor1", "factor2", "factor3"],
  "siguiente_paso": "1 frase corta con acción concreta. Máximo 15 palabras."
}

EJEMPLOS del estilo que quiero:

RECLAMABLE retraso:
  resumen_usuario: "Sí, reclamable. 250€ por retraso superior a 3h en un vuelo ≤1.500 km."
  razonamiento_interno: "CE 261 art. 7.1.a + doctrina Sturgeon (C-402/07). Sin causa extraordinaria confirmada."
  factores_clave: ["Retraso ≥3h declarado", "Distancia ≤1.500 km", "Sin causa extraordinaria"]
  siguiente_paso: "Inicia tu reclamación y adjunta tarjeta de embarque."

NO_RECLAMABLE cancelación avisada:
  resumen_usuario: "No reclamable. La aerolínea avisó con más de 14 días de antelación, como permite el art. 5.1.c."
  razonamiento_interno: "CE 261 art. 5.1.c.i exonera de compensación con aviso ≥14 días. Solo procede reembolso/reubicación."
  factores_clave: ["Aviso >14 días", "Art. 5.1.c.i"]
  siguiente_paso: "Solicita reembolso del billete a la aerolínea."

RECLAMABLE cancelación:
  resumen_usuario: "Sí, reclamable. 250€ por cancelación avisada el mismo día sin alternativa ofrecida."
  razonamiento_interno: "CE 261 art. 5.1.c + art. 7.1.a. Ruta ≤1.500 km, aviso <14 días, sin extraordinaria."
  factores_clave: ["Aviso mismo día", "Sin alternativa", "≤1.500 km"]
  siguiente_paso: "Inicia la reclamación ahora."

RESPUESTA: solo el JSON, nada más. Corto, directo, sin rodeos, sin pedir más datos.`;

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
