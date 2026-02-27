// lib/validateDocs.js
// Validación de documentos con Claude Vision

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DOC_TYPES = {
  dni:      { nombre: 'DNI / Pasaporte',          icon: '🪪' },
  embarque: { nombre: 'Tarjeta de embarque',       icon: '🎫' },
  reserva:  { nombre: 'Confirmación de reserva',   icon: '📧' },
  iban:     { nombre: 'Número de cuenta (IBAN)',   icon: '🏦' },
  gastos:   { nombre: 'Justificantes de gastos',   icon: '🧾' },
};

/**
 * Valida un conjunto de documentos usando Claude Vision
 * @param {Array} files - [{ tipo, mimeType, base64 }]
 * @param {Object} caseData - { nombre, vuelo, fecha, ruta }
 * @returns {Array} - [{ tipo, nombre, ok, mensaje, datosExtraidos }]
 */
export async function validateDocuments(files, caseData) {
  if (!files || files.length === 0) {
    return [];
  }

  const results = [];

  for (const file of files) {
    try {
      const result = await validateSingleDocument(file, caseData);
      results.push(result);
    } catch (err) {
      results.push({
        tipo:    file.tipo,
        nombre:  DOC_TYPES[file.tipo]?.nombre || file.tipo,
        ok:      false,
        mensaje: 'Error al procesar el documento. Por favor, inténtalo de nuevo.',
        datosExtraidos: null,
      });
    }
  }

  return results;
}

async function validateSingleDocument(file, caseData) {
  const docInfo = DOC_TYPES[file.tipo] || { nombre: file.tipo };

  const systemPrompt = `Eres un validador de documentos para reclamaciones aéreas.
Tu misión es verificar que cada documento es auténtico, legible, completo y coherente con los datos del caso.
Responde SIEMPRE con un JSON con esta estructura exacta:
{
  "valido": true | false,
  "mensaje": "Mensaje corto explicando el resultado (1-2 frases)",
  "datosExtraidos": { clave: valor, ... },
  "problemas": ["problema1", "problema2"]
}`;

  const promptPorTipo = {
    dni: `Verifica este DNI o Pasaporte:
- ¿Es un documento de identidad real (DNI, NIE, Pasaporte)?
- ¿Es legible y no está cortado?
- ¿Está en vigor (fecha de caducidad)?
- Extrae: nombre completo, número de documento, fecha de nacimiento, fecha de caducidad.
Datos del caso: Titular esperado: ${caseData.nombre}`,

    embarque: `Verifica esta tarjeta de embarque:
- ¿Es una tarjeta de embarque real (física o digital)?
- ¿Es legible?
- ¿Contiene número de vuelo, fecha, origen/destino, nombre del pasajero?
- Extrae: número de vuelo, fecha, origen, destino, nombre en la tarjeta, asiento.
Datos del caso: Vuelo ${caseData.vuelo}, Fecha ${caseData.fecha}, Ruta ${caseData.ruta}, Pasajero ${caseData.nombre}`,

    reserva: `Verifica esta confirmación de reserva o e-ticket:
- ¿Es una confirmación de reserva o e-ticket de aerolínea?
- ¿Es legible?
- ¿Contiene número de vuelo, localizador/PNR, ruta y fecha?
- Extrae: número de vuelo, localizador/PNR, fecha, origen, destino, nombre del pasajero, aerolínea.
Datos del caso: Vuelo ${caseData.vuelo}, Fecha ${caseData.fecha}, Ruta ${caseData.ruta}`,

    iban: `Verifica este justificante de cuenta bancaria o IBAN:
- ¿Contiene un número IBAN válido (formato ES + 22 dígitos)?
- ¿El titular coincide con el reclamante?
- Extrae: IBAN (puede estar parcialmente oculto por seguridad), titular.
Datos del caso: Titular esperado: ${caseData.nombre}`,

    gastos: `Verifica estos justificantes de gastos adicionales:
- ¿Son recibos, facturas o tickets de gastos relacionados con el incidente aéreo (hotel, comida, transporte)?
- ¿Son legibles y tienen fecha próxima al vuelo?
- Extrae: tipo de gasto, importe, fecha, establecimiento.
Datos del caso: Fecha del vuelo: ${caseData.fecha}`,
  };

  const userPrompt = promptPorTipo[file.tipo] || `Verifica que este documento (${docInfo.nombre}) es válido, legible y completo.`;

  // Construir el contenido del mensaje con la imagen/documento
  const messageContent = [
    {
      type: 'text',
      text: userPrompt,
    },
  ];

  // Añadir imagen o documento según el tipo MIME
  if (file.mimeType === 'application/pdf') {
    messageContent.push({
      type: 'document',
      source: {
        type:       'base64',
        media_type: 'application/pdf',
        data:       file.base64,
      },
    });
  } else {
    messageContent.push({
      type: 'image',
      source: {
        type:       'base64',
        media_type: file.mimeType,
        data:       file.base64,
      },
    });
  }

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 512,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: messageContent }],
  });

  const text = response.content[0].text;

  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // Si no se puede parsear, asumimos que hay un problema
    parsed = { valido: false, mensaje: 'No se pudo analizar el documento. Verifica que sea legible.', datosExtraidos: {}, problemas: [] };
  }

  return {
    tipo:           file.tipo,
    nombre:         docInfo.nombre,
    ok:             parsed.valido,
    mensaje:        parsed.mensaje || (parsed.valido ? 'Documento validado correctamente.' : 'Documento no válido.'),
    datosExtraidos: parsed.datosExtraidos || {},
    problemas:      parsed.problemas || [],
  };
}
