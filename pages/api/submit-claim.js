// pages/api/submit-claim.js
// Recibe datos personales + resultado de verificación → genera ref, envía emails, devuelve uploadUrl

import { sendConfirmacionUsuario, sendNuevaReclamacionInterna } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    // Datos del vuelo (del paso 2)
    incidentType,
    flightNumber,
    date,
    origin,
    destination,
    airline,
    flightNumber2,
    samePNR,
    finalDestination,
    alternativeOffered,
    alternativeAccepted,
    alternativeArrival,
    cancellationNotice,
    airportCompensation,
    // Datos personales (del paso 4)
    firstName,
    lastName,
    docNumber,
    email,
    phone,
    passengers,
    comments,
    // Resultado IA (del paso 3)
    aiDecision,
  } = req.body;

  // Validación
  if (!firstName || !lastName || !email || !incidentType || !flightNumber) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  try {
    const ref = 'RV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
    const nombre = `${firstName} ${lastName}`.trim();
    const ruta = `${origin} → ${destination}`;

    // Token para la página de subida de documentos (sin razonamiento interno)
    const casePayload = {
      ref,
      nombre,
      email,
      telefono: phone || '',
      vuelo: flightNumber,
      fecha: date,
      ruta,
      incidentType,
      compensacion: aiDecision?.compensacion_estimada,
      pasajeros: passengers || '1',
      decision: aiDecision?.decision,
    };

    const token = Buffer.from(JSON.stringify(casePayload)).toString('base64');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const uploadUrl = `${baseUrl}/aportar-documentos?d=${token}`;

    // Enviar emails si Resend está configurado
    if (process.env.RESEND_API_KEY) {
      try {
        await Promise.all([
          sendConfirmacionUsuario({
            to: email,
            nombre,
            ref,
            vuelo: flightNumber,
            ruta,
            compensacion: aiDecision?.compensacion_estimada,
            decision: aiDecision?.decision,
            uploadUrl,
          }),
          sendNuevaReclamacionInterna({
            ref,
            decision: aiDecision?.decision,
            confianza: aiDecision?.confianza,
            compensacion: aiDecision?.compensacion_estimada,
            vuelo: flightNumber,
            ruta,
            fecha: date,
            incidentType,
            nombre,
            email,
            telefono: phone || '',
            pasajeros: passengers || '1',
            razonamiento: aiDecision?.razonamiento_interno,
            factores: aiDecision?.factores_clave,
            uploadUrl,
          }),
        ]);
      } catch (emailErr) {
        console.error('Error enviando emails:', emailErr);
        // No bloqueamos la respuesta si el email falla
      }
    }

    return res.status(200).json({
      success: true,
      ref,
      uploadUrl,
    });

  } catch (error) {
    console.error('Error en /api/submit-claim:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
