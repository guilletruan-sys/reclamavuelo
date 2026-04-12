// pages/api/finalize-claim.js
// Segundo paso del envío: tras /api/submit-claim (que crea la ref y envía el
// email de confirmación al usuario), este endpoint recibe los documentos
// validados + IBAN y dispara el email interno al equipo con los archivos
// adjuntos vía Resend.

import { sendNuevaReclamacionInterna } from '../../lib/email';

// Nombres amigables para el email interno
const DOC_NAMES = {
  dni:      'DNI-Pasaporte',
  boarding: 'Tarjeta-embarque',
  booking:  'Confirmacion-reserva',
  receipts: 'Recibos-gastos',
  pir:      'PIR-equipaje',
  medical:  'Parte-medico',
};

function extFromDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:([^;]+);/);
  const mime = m ? m[1] : '';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'bin';
}

function dataUrlToBuffer(dataUrl) {
  const idx = dataUrl.indexOf(',');
  if (idx === -1) return Buffer.from('');
  return Buffer.from(dataUrl.slice(idx + 1), 'base64');
}

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ref, tipo, contact, flight, result, iban, attachments } = req.body;

  if (!ref || !contact || !flight) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Construye el array de attachments de Resend
  const resendAttachments = [];
  for (const [docId, fileInfo] of Object.entries(attachments || {})) {
    if (!fileInfo?.dataUrl) continue;
    const friendly = DOC_NAMES[docId] || docId;
    const ext = extFromDataUrl(fileInfo.dataUrl);
    resendAttachments.push({
      filename: `${ref}_${friendly}.${ext}`,
      content:  dataUrlToBuffer(fileInfo.dataUrl),
    });
  }

  try {
    const nombre = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Pasajero';
    const ruta   = `${flight.from || flight.origin || ''} → ${flight.to || flight.destination || ''}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await sendNuevaReclamacionInterna({
          ref,
          decision:     result?.decision,
          confianza:    result?.confianza,
          compensacion: result?.compensacion_estimada,
          vuelo:        flight.flightNumber,
          ruta,
          fecha:        flight.date,
          incidentType: tipo,
          nombre,
          email:        contact.email,
          telefono:     contact.phone || '',
          pasajeros:    contact.passengers || '1',
          razonamiento: result?.razonamiento_interno,
          factores:     result?.factores_clave,
          iban,
          attachments:  resendAttachments,
        });
      } catch (emailErr) {
        console.error('Error enviando email interno con adjuntos:', emailErr);
        // No bloqueamos: el usuario ya tiene su confirmación del paso anterior
      }
    }

    return res.status(200).json({
      success: true,
      ref,
      attachedCount: resendAttachments.length,
    });

  } catch (error) {
    console.error('Error en /api/finalize-claim:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
