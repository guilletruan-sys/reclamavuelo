// lib/email.js
// Resend email client + all email templates

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: cambiar a noreply@reclamavuelo.com cuando se verifique el dominio en Resend
const FROM    = 'ReclamaVuelo <onboarding@resend.dev>';
const TEAM_TO = process.env.CONTACT_EMAIL || 'guilletruan@gmail.com';

// ── REGULATION COPY POR TIPO DE INCIDENCIA ───────────────────────────────────
// Acepta tanto los IDs en español del wizard (retraso, cancelacion, conexion,
// overbooking, equipaje, lesiones) como los del backend en inglés (delay,
// cancellation, connection, overbooking, baggage, injury).
export function regulationCopy(incidentType) {
  const t = (incidentType || '').toLowerCase();
  if (t === 'equipaje' || t === 'baggage') {
    return {
      regulation: 'Convenio de Montreal',
      intro:      'Tu incidencia con el equipaje está cubierta por el Convenio de Montreal (responsabilidad del transportista aéreo por equipaje perdido, dañado o retrasado).',
      maxMention: 'El límite máximo es de aproximadamente 1.600€ por pasajero, pero la cantidad final depende de la documentación aportada (PIR, facturas, fotos).',
    };
  }
  if (t === 'lesiones' || t === 'injury') {
    return {
      regulation: 'Convenio de Montreal (art. 17.1)',
      intro:      'Las lesiones sufridas durante el embarque, vuelo o desembarque están cubiertas por el Convenio de Montreal, con responsabilidad objetiva de la aerolínea.',
      maxMention: 'El importe varía según la gravedad de la lesión y la documentación médica aportada.',
    };
  }
  // default: CE 261/2004 (retraso, cancelacion, conexion, overbooking)
  return {
    regulation: 'Reglamento (CE) 261/2004',
    intro:      'Tu caso está cubierto por el Reglamento (CE) 261/2004, la normativa europea de derechos del pasajero aéreo.',
    maxMention: 'La compensación puede alcanzar los 600€ por pasajero según la distancia del vuelo.',
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f9f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#0a1628;padding:24px 32px;">
      <span style="font-size:22px;font-weight:bold;color:#ffffff;">
        Reclama<span style="color:#10b981;">Vuelo</span>
      </span>
    </div>
    <!-- Content -->
    <div style="padding:36px 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">
        ReclamaVuelo · Reglamento (CE) 261/2004 y Convenio de Montreal · Sin costes iniciales
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        <a href="https://reclamavuelo.com/privacidad" style="color:#10b981;">Privacidad</a> ·
        <a href="https://reclamavuelo.com/aviso-legal" style="color:#10b981;">Aviso legal</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function badge(text, color = '#10b981') {
  return `<span style="display:inline-block;background:${color}20;color:${color};font-size:11px;font-weight:bold;padding:3px 12px;border-radius:100px;letter-spacing:1px;text-transform:uppercase;">${text}</span>`;
}

function dataRow(label, value) {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#0a1628;font-weight:500;">${value || '—'}</td>
  </tr>`;
}

function dataTable(rows) {
  return `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden;margin:16px 0;">
    ${rows.join('')}
  </table>`;
}

function ctaButton(text, url) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#10b981;color:#ffffff;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:16px;text-decoration:none;box-shadow:0 4px 16px rgba(16,185,129,0.35);">
      ${text}
    </a>
  </div>`;
}

function docItem(icon, name, desc, required = true) {
  return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #e2e8f0;">
    <span style="font-size:20px;">${icon}</span>
    <div>
      <span style="font-size:14px;font-weight:700;color:#0a1628;">${name}</span>
      ${required ? `<span style="font-size:10px;color:#ef4444;font-weight:700;margin-left:6px;">OBLIGATORIO</span>` : `<span style="font-size:10px;color:#94a3b8;font-weight:600;margin-left:6px;">OPCIONAL</span>`}
      <p style="margin:3px 0 0;font-size:13px;color:#64748b;">${desc}</p>
    </div>
  </div>`;
}

// ── EMAIL 1: Confirmación al usuario + solicitud de documentos ────────────────

export async function sendConfirmacionUsuario({ to, nombre, ref, vuelo, ruta, compensacion, decision, uploadUrl, incidentType }) {
  const esRevisar = decision === 'REVISAR_MANUALMENTE';
  const reg = regulationCopy(incidentType);

  const content = `
    <h1 style="font-family:sans-serif;font-size:24px;font-weight:800;color:#0a1628;margin:0 0 8px;">
      ${esRevisar ? 'Hemos recibido tu caso' : '¡Tienes derecho a reclamar!'}
    </h1>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hola <strong>${nombre}</strong>, hemos analizado los datos de tu vuelo y ${esRevisar
        ? 'necesitamos revisar tu caso en detalle. Nuestro equipo lo estudiará y te confirmará en breve.'
        : `nuestro sistema ha determinado que tienes derecho a compensación bajo el ${reg.regulation}. ${reg.maxMention}`}
    </p>

    ${!esRevisar ? `
    <div style="background:linear-gradient(135deg,#0a1628,#0f2356);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:42px;font-weight:800;color:#10b981;">${compensacion}€</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Compensación estimada por pasajero</div>
    </div>` : ''}

    ${dataTable([
      dataRow('Referencia', `<strong>${ref}</strong>`),
      dataRow('Vuelo', vuelo),
      dataRow('Ruta', ruta),
      dataRow('Estado', esRevisar ? badge('En revisión', '#f59e0b') : badge('Reclamable', '#10b981')),
    ])}

    <h2 style="font-size:18px;font-weight:700;color:#0a1628;margin:28px 0 8px;">
      📎 Documentación necesaria
    </h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 16px;">
      Para iniciar la reclamación necesitamos que nos aportes los siguientes documentos a través del enlace seguro:
    </p>

    ${docItem('🪪', 'DNI o Pasaporte', 'Copia de ambas caras en vigor en la fecha del vuelo.')}
    ${docItem('🎫', 'Tarjeta de embarque', 'Física o digital (PDF/captura de pantalla).')}
    ${docItem('📧', 'Confirmación de reserva', 'Email de confirmación o e-ticket de la aerolínea.')}
    ${docItem('🏦', 'Número de cuenta IBAN', 'Para el ingreso de la compensación una vez obtenida.')}
    ${docItem('🧾', 'Gastos adicionales', 'Recibos de hotel, comida, transporte si los hubo.', false)}

    ${ctaButton('Aportar documentación →', uploadUrl)}

    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:8px;">
      El enlace es seguro y válido para tu caso. Referencia: ${ref}
    </p>

    <div style="background:#f0f9f4;border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:14px 16px;margin-top:24px;">
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.6;">
        <strong>¿Qué ocurre después?</strong><br>
        Una vez validada tu documentación, nuestro equipo presentará la reclamación formal ante la aerolínea.
        Solo cobramos el <strong>25%+IVA</strong> si obtenemos la compensación para ti.
      </p>
    </div>
  `;

  return resend.emails.send({
    from:    FROM,
    to,
    subject: `[${ref}] Reclamación recibida — Documenta tu caso`,
    html:    emailWrapper(content),
  });
}

// ── EMAIL 2: Notificación interna — nueva reclamación ─────────────────────────

export async function sendNuevaReclamacionInterna({ ref, decision, confianza, compensacion, vuelo, ruta, fecha, incidentType, nombre, email, telefono, pasajeros, razonamiento, factores, uploadUrl, iban, attachments }) {
  const decisionColor = decision === 'RECLAMABLE' ? '#10b981' : decision === 'REVISAR_MANUALMENTE' ? '#f59e0b' : '#ef4444';

  const content = `
    <h1 style="font-size:20px;font-weight:800;color:#0a1628;margin:0 0 4px;">Nuevo caso recibido</h1>
    <p style="margin:0 0 24px;">${badge(decision, decisionColor)} ${badge(`Confianza: ${confianza}`, '#1a56db')}</p>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:0 0 8px;">Datos del vuelo</h3>
    ${dataTable([
      dataRow('Referencia', `<strong>${ref}</strong>`),
      dataRow('Tipo', incidentType?.toUpperCase()),
      dataRow('Vuelo', vuelo),
      dataRow('Ruta', ruta),
      dataRow('Fecha', fecha),
      dataRow('Compensación estimada', compensacion ? `<strong>${compensacion}€ / pasajero</strong>` : 'N/A'),
    ])}

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:16px 0 8px;">Datos del reclamante</h3>
    ${dataTable([
      dataRow('Nombre', nombre),
      dataRow('Email', email),
      dataRow('Teléfono', telefono || '—'),
      dataRow('Pasajeros', pasajeros),
    ])}

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:16px 0 8px;">Análisis IA</h3>
    <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="font-size:13px;color:#334155;line-height:1.7;margin:0 0 10px;"><strong>Razonamiento:</strong><br>${razonamiento}</p>
      ${factores?.length ? `<p style="font-size:13px;color:#334155;margin:0;"><strong>Factores clave:</strong> ${factores.join(' · ')}</p>` : ''}
    </div>

    ${iban ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:16px 0 8px;">IBAN del cliente</h3><p style="font-family:monospace;font-size:14px;color:#0a1628;background:#f0fdf4;padding:10px 14px;border-radius:8px;margin:0 0 16px;">${iban}</p>` : ''}

    ${attachments?.length ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:16px 0 8px;">Documentos adjuntos (${attachments.length})</h3><p style="font-size:13px;color:#64748b;margin:0 0 16px;">${attachments.map(a => '📎 ' + a.filename).join('<br>')}</p>` : ''}

    ${uploadUrl ? ctaButton(attachments?.length ? 'Ver caso en el panel →' : 'Ver enlace de documentación del cliente →', uploadUrl) : ''}
  `;

  return resend.emails.send({
    from:    FROM,
    to:      TEAM_TO,
    subject: `[${ref}] ${decision} — ${vuelo} — ${nombre}`,
    html:    emailWrapper(content),
    attachments: attachments || undefined,
  });
}

// ── EMAIL 3: Documentos validados → usuario ───────────────────────────────────

export async function sendDocumentosValidados({ to, nombre, ref, validaciones }) {
  const todosOk = validaciones.every(v => v.ok);

  const validRows = validaciones.map(v => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #e2e8f0;">
      <span style="font-size:18px;">${v.ok ? '✅' : '⚠️'}</span>
      <div>
        <strong style="font-size:13px;color:#0a1628;">${v.nombre}</strong>
        <p style="margin:3px 0 0;font-size:12px;color:${v.ok ? '#10b981' : '#f59e0b'};">${v.mensaje}</p>
      </div>
    </div>
  `).join('');

  const content = `
    <h1 style="font-size:24px;font-weight:800;color:#0a1628;margin:0 0 8px;">
      ${todosOk ? '✅ Documentación validada' : '⚠️ Revisión de documentación'}
    </h1>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hola <strong>${nombre}</strong>,
      ${todosOk
        ? 'hemos recibido y validado correctamente toda tu documentación. Ya estamos gestionando tu reclamación.'
        : 'hemos revisado tu documentación pero necesitamos que corrijas algunos puntos antes de continuar.'}
    </p>

    ${dataTable([dataRow('Referencia', `<strong>${ref}</strong>`)])}

    <h3 style="font-size:14px;font-weight:700;color:#0a1628;margin:20px 0 12px;">Resultado de la validación</h3>
    <div>${validRows}</div>

    ${todosOk ? `
    <div style="background:#f0f9f4;border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:14px 16px;margin-top:24px;">
      <p style="margin:0;font-size:14px;color:#065f46;font-weight:700;">¿Qué ocurre ahora?</p>
      <p style="margin:6px 0 0;font-size:13px;color:#334155;line-height:1.6;">
        Nuestro equipo presentará la reclamación formal ante la aerolínea en los próximos días.
        Te mantendremos informado de cada paso del proceso.
      </p>
    </div>` : `
    <p style="font-size:13px;color:#64748b;margin-top:20px;">
      Por favor, accede de nuevo al enlace que te enviamos anteriormente para volver a subir los documentos indicados.
      Si tienes dudas, escríbenos a <a href="mailto:info@reclamavuelo.com" style="color:#10b981;">info@reclamavuelo.com</a>.
    </p>`}
  `;

  return resend.emails.send({
    from:    FROM,
    to,
    subject: todosOk
      ? `[${ref}] Documentación validada — ya gestionamos tu reclamación`
      : `[${ref}] Revisa tu documentación — hay puntos a corregir`,
    html:    emailWrapper(content),
  });
}

// ── EMAIL 4: Expediente listo para Kmaleon (interno) ─────────────────────────

export async function sendExpedienteKmaleon({ ref, nombre, docNumber, email, telefono, vuelo, fecha, ruta, incidentType, compensacion, pasajeros, validaciones, razonamiento }) {
  const reg = regulationCopy(incidentType);
  const camposKmaleon = [
    dataRow('REFERENCIA INTERNA', `<strong>${ref}</strong>`),
    dataRow('Tipo de expediente', `Reclamación aérea — ${reg.regulation}`),
    dataRow('Subtipo', incidentType?.toUpperCase()),
    dataRow('— CLIENTE —', ''),
    dataRow('Nombre completo', nombre),
    dataRow('DNI/Pasaporte', docNumber),
    dataRow('Email', email),
    dataRow('Teléfono', telefono || '—'),
    dataRow('Nº pasajeros', pasajeros),
    dataRow('— VUELO —', ''),
    dataRow('Número de vuelo', vuelo),
    dataRow('Fecha', fecha),
    dataRow('Ruta', ruta),
    dataRow('Compensación estimada', compensacion ? `${compensacion}€ × ${pasajeros} pax = ${compensacion * parseInt(pasajeros)}€` : 'N/A'),
    dataRow('— DOCUMENTACIÓN —', ''),
    ...validaciones.map(v => dataRow(v.nombre, v.ok ? '✅ Validado' : `⚠️ ${v.mensaje}`)),
  ];

  const content = `
    <h1 style="font-size:20px;font-weight:800;color:#0a1628;margin:0 0 16px;">
      📁 Expediente listo para dar de alta en Kmaleon
    </h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
      Todos los datos están validados. Crea el expediente en Kmaleon con los siguientes datos:
    </p>
    ${dataTable(camposKmaleon)}
    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin:20px 0 8px;">Razonamiento IA</h3>
    <div style="background:#f8fafc;border-radius:10px;padding:16px;">
      <p style="font-size:13px;color:#334155;line-height:1.7;margin:0;">${razonamiento}</p>
    </div>
  `;

  return resend.emails.send({
    from:    FROM,
    to:      TEAM_TO,
    subject: `[${ref}] EXPEDIENTE LISTO KMALEON — ${nombre} — ${vuelo}`,
    html:    emailWrapper(content),
  });
}
