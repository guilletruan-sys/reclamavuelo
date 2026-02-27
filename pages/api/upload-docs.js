// pages/api/upload-docs.js
// Recibe documentos, los valida con Claude Vision y envía emails

import { validateDocuments }       from '../../lib/validateDocs';
import { sendDocumentosValidados, sendExpedienteKmaleon } from '../../lib/email';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caseData, files } = req.body;

  if (!caseData || !files || files.length === 0) {
    return res.status(400).json({ error: 'Faltan datos o archivos' });
  }

  // Validar con Claude Vision (o modo demo si no hay API key)
  let validaciones;

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'tu_anthropic_key_aqui') {
    // Modo demo: simular validación
    validaciones = files.map(f => ({
      tipo:    f.tipo,
      nombre:  { dni: 'DNI / Pasaporte', embarque: 'Tarjeta de embarque', reserva: 'Confirmación de reserva', iban: 'Número de cuenta (IBAN)', gastos: 'Justificantes de gastos' }[f.tipo] || f.tipo,
      ok:      true,
      mensaje: 'Documento validado correctamente (modo demo).',
      datosExtraidos: {},
    }));
  } else {
    try {
      validaciones = await validateDocuments(files, caseData);
    } catch (err) {
      console.error('Error en validación:', err);
      return res.status(500).json({ error: 'Error al validar documentos', detail: err.message });
    }
  }

  const todosOk = validaciones.every(v => v.ok);

  // Enviar emails si hay API key de Resend
  if (process.env.RESEND_API_KEY) {
    try {
      // Email al usuario con resultado
      await sendDocumentosValidados({
        to:          caseData.email,
        nombre:      caseData.nombre,
        ref:         caseData.ref,
        validaciones,
      });

      // Si todo ok → email interno con expediente listo para Kmaleon
      if (todosOk) {
        await sendExpedienteKmaleon({
          ref:          caseData.ref,
          nombre:       caseData.nombre,
          docNumber:    caseData.docNumber || '—',
          email:        caseData.email,
          telefono:     caseData.telefono,
          vuelo:        caseData.vuelo,
          fecha:        caseData.fecha,
          ruta:         caseData.ruta,
          incidentType: caseData.incidentType,
          compensacion: caseData.compensacion,
          pasajeros:    caseData.pasajeros || '1',
          validaciones,
          razonamiento: caseData.razonamiento || '—',
        });
      }
    } catch (emailErr) {
      console.error('Error enviando emails de validación:', emailErr);
      // No bloqueamos la respuesta si el email falla
    }
  }

  return res.status(200).json({
    success:     true,
    validaciones,
    todosOk,
  });
}
