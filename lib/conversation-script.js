// lib/conversation-script.js — State machine del chat conversacional.
// Cada STEP describe un turno: mensaje del bot + picker + slot + next.

import { toBackendFlight, toBackendContact } from './mappers';

export const START_STEP = 'welcome';

// ── Actions (side-effects) ─────────────────────────────────────────
async function verify(ctx) {
  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBackendFlight(ctx.tipo, ctx)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al verificar');
  return {
    result: data.decision || data,
    verifyMeta: {
      flightStatus: data.flightStatus,
      metarAnalysis: data.metarAnalysis,
      demoMode: data.demoMode,
    },
  };
}

async function submitClaim(ctx) {
  const payload = {
    ...toBackendFlight(ctx.tipo, ctx),
    ...toBackendContact(ctx),
    aiDecision: ctx.result,
  };
  const res = await fetch('/api/submit-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al enviar el caso');
  return { caseRef: data.ref, uploadUrl: data.uploadUrl };
}

async function finalizeClaim(ctx) {
  const attachments = {};
  for (const [id, f] of Object.entries(ctx.files || {})) {
    if (f?.dataUrl) attachments[id] = { name: f.name, dataUrl: f.dataUrl };
  }
  const res = await fetch('/api/finalize-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref: ctx.caseRef,
      tipo: ctx.tipo,
      contact: {
        firstName: ctx.firstName,
        lastName: ctx.lastName,
        dni: ctx.dni,
        email: ctx.email,
        phone: ctx.phone,
        passengers: ctx.passengers,
      },
      flight: ctx,
      result: ctx.result,
      iban: ctx.iban,
      attachments,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al finalizar');
  return {};
}

export const ACTIONS = { verify, submitClaim, finalizeClaim };

// ── Regexes ────────────────────────────────────────────────────────
const RE_FLIGHT = /^[A-Z]{2}\d{1,4}[A-Z]?$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_DNI = /^[A-Z0-9]{6,15}$/;
const RE_PHONE = /^[+\d][\d\s]{7,20}$/;

// ── Branching helpers ──────────────────────────────────────────────
function nextByTipo(ctx) {
  switch (ctx.tipo) {
    case 'retraso': return 'askArrivalTime';
    case 'cancelacion': return 'askCancelNotice';
    case 'conexion': return 'askFlight2Number';
    case 'overbooking': return 'askOverbookingComp';
    case 'equipaje': return 'askLuggageType';
    case 'lesiones': return 'askInjuryType';
    default: return 'verifying';
  }
}

function nextAfterBooking(ctx) {
  if (ctx.tipo === 'equipaje') return 'askDocsPir';
  if (ctx.tipo === 'lesiones') return 'askDocsMedical';
  return 'askDocsReceipts';
}

// ── STEPS ──────────────────────────────────────────────────────────
export const STEPS = {
  welcome: {
    bot: '¡Hola! Soy tu asesor legal de ReclamaVuelo. Voy a ayudarte a reclamar tu vuelo en unos minutos. Primero, ¿qué te ha pasado?',
    picker: { kind: 'type' },
    slot: 'tipo',
    next: 'askAirline',
  },

  askAirline: {
    bot: ctx => `Entendido: ${labelTipo(ctx.tipo)}. ¿Con qué aerolínea volabas?`,
    picker: { kind: 'airline' },
    slot: 'airline',
    next: 'askFlightNumber',
  },

  askFlightNumber: {
    bot: '¿Cuál era el número de vuelo? (ej: IB2634, VY1234)',
    picker: {
      kind: 'text',
      placeholder: 'IB2634',
      validate: RE_FLIGHT,
      transform: 'upper',
    },
    slot: 'flightNumber',
    next: 'askDate',
  },

  askDate: {
    bot: '¿Qué día fue el vuelo?',
    picker: { kind: 'date' },
    slot: 'date',
    next: 'askOrigin',
  },

  askOrigin: {
    bot: '¿Desde qué aeropuerto salías?',
    picker: { kind: 'airport' },
    slot: 'from',
    next: 'askDestination',
  },

  askDestination: {
    bot: '¿Y a qué aeropuerto ibas?',
    picker: { kind: 'airport', excludeField: 'from' },
    slot: 'to',
    next: nextByTipo,
  },

  // ── Retraso ─────────────────────────────────────────────────────
  askArrivalTime: {
    bot: 'Si la sabes, dime la hora real de llegada (puedes omitir este paso).',
    picker: { kind: 'text', type: 'time', optional: true, placeholder: '14:30' },
    slot: 'arrivalTime',
    next: 'verifying',
  },

  // ── Cancelación ─────────────────────────────────────────────────
  askCancelNotice: {
    bot: '¿Con cuánta antelación te avisaron de la cancelación?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'none', label: 'El mismo día / sin aviso' },
        { value: '<7', label: 'Menos de 7 días antes' },
        { value: '7-14', label: 'Entre 7 y 14 días antes' },
        { value: '>14', label: 'Más de 14 días antes' },
      ],
    },
    slot: 'canceledNoticeDays',
    next: 'askCancelAlternative',
  },

  askCancelAlternative: {
    bot: '¿Te ofrecieron un vuelo alternativo?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    slot: 'offeredAlt',
    next: ctx => (ctx.offeredAlt === 'yes' ? 'askCancelAccepted' : 'verifying'),
  },

  askCancelAccepted: {
    bot: '¿Aceptaste el vuelo alternativo?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí, lo tomé' },
        { value: 'no', label: 'No, lo rechacé' },
      ],
    },
    slot: 'acceptedAlt',
    next: ctx => (ctx.acceptedAlt === 'yes' ? 'askAltArrivalTime' : 'verifying'),
  },

  askAltArrivalTime: {
    bot: '¿A qué hora llegaste a tu destino con el vuelo alternativo?',
    picker: { kind: 'text', type: 'time', placeholder: '18:45' },
    slot: 'altArrivalTime',
    next: 'verifying',
  },

  // ── Conexión ───────────────────────────────────────────────────
  askFlight2Number: {
    bot: '¿Cuál era el número del vuelo de conexión (el que perdiste o tomaste después)?',
    picker: {
      kind: 'text',
      placeholder: 'IB3456',
      validate: RE_FLIGHT,
      transform: 'upper',
    },
    slot: 'flight2Number',
    next: 'askFinalDestination',
  },

  askFinalDestination: {
    bot: '¿Cuál era tu destino final?',
    picker: { kind: 'airport' },
    slot: 'finalDestination',
    next: 'askSamePNR',
  },

  askSamePNR: {
    bot: '¿Ambos vuelos estaban en la misma reserva (mismo billete / localizador)?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí, misma reserva' },
        { value: 'no', label: 'No, billetes separados' },
      ],
    },
    slot: 'samePNR',
    next: 'verifying',
  },

  // ── Overbooking ────────────────────────────────────────────────
  askOverbookingComp: {
    bot: '¿Te ofreció la aerolínea alguna compensación en el aeropuerto (dinero, vales, hotel)?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    slot: 'overbookingCompensation',
    next: ctx => (ctx.overbookingCompensation === 'yes' ? 'askOverbookingAccepted' : 'verifying'),
  },

  askOverbookingAccepted: {
    bot: '¿Aceptaste esa compensación?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    slot: 'overbookingAccepted',
    next: 'verifying',
  },

  // ── Equipaje ───────────────────────────────────────────────────
  askLuggageType: {
    bot: '¿Qué pasó con tu equipaje?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'lost', label: 'Perdido (nunca apareció)' },
        { value: 'delayed', label: 'Retrasado (llegó tarde)' },
        { value: 'damaged', label: 'Dañado' },
      ],
    },
    slot: 'luggageType',
    next: 'askLuggageValue',
  },

  askLuggageValue: {
    bot: '¿Cuál es el valor aproximado del equipaje y su contenido? (en euros)',
    picker: { kind: 'text', type: 'number', placeholder: '500' },
    slot: 'luggageValue',
    next: 'askPirDone',
  },

  askPirDone: {
    bot: '¿Hiciste el parte PIR (Property Irregularity Report) en el aeropuerto?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
    },
    slot: 'pirDone',
    next: 'verifying',
  },

  // ── Lesiones ───────────────────────────────────────────────────
  askInjuryType: {
    bot: '¿Qué tipo de lesión sufriste?',
    picker: { kind: 'text', placeholder: 'Ej: caída por turbulencia' },
    slot: 'injuryType',
    next: 'askMedicalReport',
  },

  askMedicalReport: {
    bot: '¿Tienes un parte médico de la lesión?',
    picker: {
      kind: 'radio',
      options: [
        { value: 'yes', label: 'Sí, tengo parte médico' },
        { value: 'later', label: 'No en el momento, pero fui al médico después' },
        { value: 'no', label: 'No' },
      ],
    },
    slot: 'medicalReport',
    next: 'askInjuryDescription',
  },

  askInjuryDescription: {
    bot: 'Cuéntame brevemente cómo ocurrió la lesión.',
    picker: {
      kind: 'text',
      multiline: true,
      placeholder: 'Describe lo que ocurrió...',
    },
    slot: 'injuryDescription',
    next: 'verifying',
  },

  // ── Verificación + Resultado ───────────────────────────────────
  verifying: {
    bot: 'Perfecto, déjame consultar los datos del vuelo y analizar tu caso con nuestro agente legal...',
    action: 'verify',
    next: 'showResult',
  },

  showResult: {
    bot: ctx => ctx.result?.resumen_usuario || 'Aquí tienes el resultado de nuestro análisis:',
    picker: { kind: 'resultCard' },
    next: ctx => {
      const status = ctx.result?.status || ctx.result?.decision;
      if (status === 'NO_RECLAMABLE') return 'endNoClaim';
      return 'askFirstName';
    },
  },

  // ── Datos de contacto ──────────────────────────────────────────
  askFirstName: {
    bot: 'Genial. Para iniciar la reclamación necesito algunos datos. ¿Cuál es tu nombre?',
    picker: { kind: 'text', placeholder: 'Tu nombre' },
    slot: 'firstName',
    next: 'askLastName',
  },

  askLastName: {
    bot: '¿Y tus apellidos?',
    picker: { kind: 'text', placeholder: 'Tus apellidos' },
    slot: 'lastName',
    next: 'askDni',
  },

  askDni: {
    bot: '¿DNI o pasaporte?',
    picker: {
      kind: 'text',
      placeholder: '12345678A',
      validate: RE_DNI,
      transform: 'upper',
    },
    slot: 'dni',
    next: 'askEmail',
  },

  askEmail: {
    bot: '¿Email de contacto?',
    picker: {
      kind: 'text',
      type: 'email',
      placeholder: 'tu@email.com',
      validate: RE_EMAIL,
    },
    slot: 'email',
    next: 'askPhone',
  },

  askPhone: {
    bot: '¿Teléfono?',
    picker: {
      kind: 'text',
      type: 'tel',
      placeholder: '+34 600 000 000',
      validate: RE_PHONE,
    },
    slot: 'phone',
    next: 'askPassengers',
  },

  askPassengers: {
    bot: '¿Cuántos pasajeros iban en la reserva (incluyéndote)?',
    picker: { kind: 'text', type: 'number', placeholder: '1', validate: /^[1-9]\d{0,2}$/ },
    slot: 'passengers',
    next: 'askConsent',
  },

  askConsent: {
    bot: 'Antes de enviar, necesito que aceptes las condiciones:',
    picker: { kind: 'consent' },
    slot: '_consent',
    next: 'submitCase',
  },

  submitCase: {
    bot: 'Guardando tu caso en nuestro sistema...',
    action: 'submitClaim',
    next: 'askDocsDni',
  },

  // ── Documentos ─────────────────────────────────────────────────
  askDocsDni: {
    bot: 'Ahora sube tu DNI o pasaporte (foto o PDF). Lo validamos automáticamente con IA.',
    picker: {
      kind: 'file',
      docId: 'dni',
      icon: '🪪',
      label: 'DNI / Pasaporte',
      hint: 'Foto nítida de ambas caras o PDF',
      required: true,
    },
    slot: 'files.dni',
    next: 'askDocsBoarding',
  },

  askDocsBoarding: {
    bot: 'Sube ahora la tarjeta de embarque.',
    picker: {
      kind: 'file',
      docId: 'boarding',
      icon: '🎫',
      label: 'Tarjeta de embarque',
      hint: 'Puede ser digital o en papel',
      required: true,
    },
    slot: 'files.boarding',
    next: 'askDocsBooking',
  },

  askDocsBooking: {
    bot: 'Y el email de confirmación de la reserva.',
    picker: {
      kind: 'file',
      docId: 'booking',
      icon: '📧',
      label: 'Confirmación de reserva',
      hint: 'Email o PDF con el localizador',
      required: true,
    },
    slot: 'files.booking',
    next: nextAfterBooking,
  },

  askDocsPir: {
    bot: 'Sube también el parte PIR que te dieron en el aeropuerto.',
    picker: {
      kind: 'file',
      docId: 'pir',
      icon: '🧳',
      label: 'Parte PIR (equipaje)',
      hint: 'Documento oficial del aeropuerto',
      required: true,
    },
    slot: 'files.pir',
    next: 'askDocsReceipts',
    skipIf: ctx => ctx.tipo !== 'equipaje',
  },

  askDocsMedical: {
    bot: 'Sube el parte médico de la lesión.',
    picker: {
      kind: 'file',
      docId: 'medical',
      icon: '🏥',
      label: 'Parte médico',
      hint: 'Informe o parte de urgencias',
      required: true,
    },
    slot: 'files.medical',
    next: 'askDocsReceipts',
    skipIf: ctx => ctx.tipo !== 'lesiones',
  },

  askDocsReceipts: {
    bot: '¿Tienes recibos de gastos extras (comidas, hotel, taxis)? Es opcional pero ayuda a maximizar la reclamación.',
    picker: {
      kind: 'file',
      docId: 'receipts',
      icon: '🧾',
      label: 'Recibos de gastos',
      hint: 'Opcional. Foto o PDF.',
      required: false,
      optional: true,
    },
    slot: 'files.receipts',
    next: 'askIban',
  },

  askIban: {
    bot: 'Por último, indícame el IBAN donde quieres recibir la compensación.',
    picker: { kind: 'iban' },
    slot: 'iban',
    next: 'finalize',
  },

  finalize: {
    bot: 'Enviando tu expediente completo a nuestro equipo legal...',
    action: 'finalizeClaim',
    next: 'end',
  },

  end: {
    bot: '¡Expediente enviado! Te contactaremos en 24h desde contacto@reclamatuvuelo.com para darte seguimiento. Gracias por confiar en ReclamaVuelo.',
  },

  endNoClaim: {
    bot: 'Lo sentimos, tu caso no parece reclamable según la normativa vigente. Si necesitas asesoramiento personalizado, puedes contactar con nuestro equipo en contacto@reclamatuvuelo.com.',
  },
};

// ── Helpers ────────────────────────────────────────────────────────
function labelTipo(tipo) {
  const map = {
    retraso: 'retraso de vuelo',
    cancelacion: 'cancelación',
    conexion: 'conexión perdida',
    overbooking: 'overbooking',
    equipaje: 'problema con el equipaje',
    lesiones: 'lesiones a bordo',
  };
  return map[tipo] || tipo;
}
