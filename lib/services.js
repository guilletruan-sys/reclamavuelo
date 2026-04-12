// lib/services.js — catálogo único de los 6 tipos de incidencia, consumido
// por la landing, el wizard y el backend.

export const SERVICES = [
  {
    id: 'retraso',
    icon: '⏱',
    title: 'Retraso',
    short: '+3h en destino',
    description: 'Llegaste con más de 3 horas de retraso. Hasta 600€.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'cancelacion',
    icon: '🚫',
    title: 'Cancelación',
    short: 'Sin aviso previo',
    description: 'Te cancelaron el vuelo con menos de 14 días de aviso. Hasta 600€.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'conexion',
    icon: '🔄',
    title: 'Conexión perdida',
    short: 'Mismo billete',
    description: 'Perdiste un enlace del mismo billete y llegaste tarde.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'overbooking',
    icon: '🎫',
    title: 'Overbooking',
    short: 'Denegación embarque',
    description: 'Te denegaron el embarque por sobreventa. Compensación garantizada.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'equipaje',
    icon: '🧳',
    title: 'Equipaje',
    short: 'Perdido o dañado',
    description: 'Tu equipaje llegó tarde, dañado o nunca apareció. Hasta 1.600€.',
    regulation: 'Convenio de Montreal',
    maxAmount: 1600,
  },
  {
    id: 'lesiones',
    icon: '🩹',
    title: 'Lesiones a bordo',
    short: 'Durante el vuelo',
    description: 'Sufriste una lesión durante el vuelo o al embarcar.',
    regulation: 'Convenio de Montreal',
    maxAmount: null, // varía mucho, REVISAR_MANUALMENTE
  },
];

export function getService(id) {
  return SERVICES.find(s => s.id === id);
}
