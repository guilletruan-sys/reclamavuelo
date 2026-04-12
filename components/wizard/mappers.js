// Mapeo de nombres de campo del wizard (tipos en español, fields locales)
// a los que esperan /api/verify y /api/submit-claim (tipos en inglés, heredado).

export const TIPO_TO_INCIDENT = {
  retraso:     'delay',
  cancelacion: 'cancellation',
  conexion:    'connection',
  overbooking: 'overbooking',
  equipaje:    'baggage',
  lesiones:    'injury',
};

export function toBackendFlight(tipo, f) {
  return {
    incidentType:         TIPO_TO_INCIDENT[tipo] || tipo,
    airline:              f.airline,
    flightNumber:         f.flightNumber,
    date:                 f.date,
    origin:               f.from,
    destination:          f.to,
    cancellationNotice:   f.canceledNoticeDays,
    alternativeOffered:   f.offeredAlt,
    alternativeAccepted:  f.acceptedAlt,
    alternativeArrival:   f.altArrivalTime,
    flightNumber2:        f.flight2Number,
    finalDestination:     f.finalDestination,
    samePNR:              f.samePNR,
    airportCompensation:  f.overbookingCompensation,
    airportCompensationAccepted: f.overbookingAccepted,
    arrivalTime:          f.arrivalTime,
    luggageType:          f.luggageType,
    luggageValue:         f.luggageValue,
    pirDone:              f.pirDone,
    injuryType:           f.injuryType,
    medicalReport:        f.medicalReport,
    injuryDescription:    f.injuryDescription,
  };
}

export function toBackendContact(c) {
  return {
    firstName: c.firstName,
    lastName:  c.lastName,
    docNumber: c.dni,
    email:     c.email,
    phone:     c.phone,
    passengers: c.passengers,
  };
}
