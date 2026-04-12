import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input, Select, RadioPills } from './fields';
import AirportSelect from './AirportSelect';
import { Button } from '../ui';

const AIRLINES = [
  { code: 'IB', name: 'Iberia' },
  { code: 'VY', name: 'Vueling' },
  { code: 'UX', name: 'Air Europa' },
  { code: 'FR', name: 'Ryanair' },
  { code: 'EJ', name: 'EasyJet' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM' },
  { code: 'BA', name: 'British Airways' },
  { code: 'TP', name: 'TAP Portugal' },
];

export default function Step2Flight({ tipo, value, loading, error, onChange, onBack, onSubmit }) {
  const [f, setF] = useState({
    airline: '', flightNumber: '', date: '', from: '', to: '',
    arrivalTime: '', canceledNoticeDays: '', offeredAlt: '', acceptedAlt: '',
    altArrivalTime: '', flight2Number: '', finalDestination: '', samePNR: 'yes',
    overbookingCompensation: '', overbookingAccepted: '',
    luggageType: '', luggageValue: '', pirDone: '',
    injuryType: '', medicalReport: '', injuryDescription: '',
    ...value,
  });

  const set = (k, v) => {
    const next = { ...f, [k]: v };
    setF(next); onChange(next);
  };

  const onAirline = code => {
    const cur = (f.flightNumber || '').replace(/^[A-Z]{2}/, '');
    const next = { ...f, airline: code, flightNumber: code + cur };
    setF(next);
    onChange(next);
  };

  const coreValid = f.airline && f.flightNumber && f.date && f.from && f.to && f.from !== f.to;

  return (
    <div>
      <Field label="Compañía">
        <Select value={f.airline} onChange={e => onAirline(e.target.value)}>
          <option value="">Selecciona aerolínea</option>
          {AIRLINES.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
        </Select>
      </Field>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Nº vuelo"><Input placeholder="IB2634" value={f.flightNumber} onChange={e => set('flightNumber', e.target.value.toUpperCase())} /></Field>
        <Field label="Fecha"><Input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></Field>
      </div>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Origen"><AirportSelect value={f.from} onChange={v => set('from', v)} /></Field>
        <Field label="Destino"><AirportSelect value={f.to} onChange={v => set('to', v)} /></Field>
      </div>

      {tipo === 'retraso' && (
        <Field label="Hora real de llegada (opcional)" hint="Si no la sabes, la buscamos por ti.">
          <Input type="time" value={f.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
        </Field>
      )}

      {tipo === 'cancelacion' && (
        <>
          <Field label="¿Cuándo te avisaron?">
            <RadioPills
              options={[
                { value: 'same', label: 'Mismo día' },
                { value: '1-7',  label: '1-7 días' },
                { value: '7-14', label: '7-14 días' },
                { value: '14+',  label: 'Más de 14' },
              ]}
              value={f.canceledNoticeDays}
              onChange={v => set('canceledNoticeDays', v)}
            />
          </Field>
          <Field label="¿Ofrecieron alternativa?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.offeredAlt} onChange={v => set('offeredAlt', v)}
            />
          </Field>
          {f.offeredAlt === 'yes' && (
            <>
              <Field label="¿Aceptaste la alternativa?">
                <RadioPills
                  options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
                  value={f.acceptedAlt} onChange={v => set('acceptedAlt', v)}
                />
              </Field>
              {f.acceptedAlt === 'yes' && (
                <Field label="Hora real de llegada con la alternativa">
                  <Input type="time" value={f.altArrivalTime} onChange={e => set('altArrivalTime', e.target.value)} />
                </Field>
              )}
            </>
          )}
        </>
      )}

      {tipo === 'conexion' && (
        <>
          <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
            <Field label="Nº del segundo vuelo"><Input value={f.flight2Number} onChange={e => set('flight2Number', e.target.value.toUpperCase())} /></Field>
            <Field label="Destino final"><AirportSelect value={f.finalDestination} onChange={v => set('finalDestination', v)} /></Field>
          </div>
          <Field label="¿Mismo PNR (misma reserva)?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.samePNR} onChange={v => set('samePNR', v)}
            />
          </Field>
        </>
      )}

      {tipo === 'overbooking' && (
        <>
          <Field label="¿Te ofrecieron compensación en el aeropuerto?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.overbookingCompensation} onChange={v => set('overbookingCompensation', v)}
            />
          </Field>
          {f.overbookingCompensation === 'yes' && (
            <Field label="¿La aceptaste?">
              <RadioPills
                options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
                value={f.overbookingAccepted} onChange={v => set('overbookingAccepted', v)}
              />
            </Field>
          )}
        </>
      )}

      {tipo === 'equipaje' && (
        <>
          <Field label="¿Qué le pasó al equipaje?">
            <RadioPills
              options={[
                { value: 'lost', label: 'Perdido' },
                { value: 'delayed', label: 'Retrasado' },
                { value: 'damaged', label: 'Dañado' },
              ]}
              value={f.luggageType} onChange={v => set('luggageType', v)}
            />
          </Field>
          <Field label="Valor aproximado del contenido (€)" hint="Estima lo mejor que puedas. Te pediremos facturas después.">
            <Input type="number" min="0" value={f.luggageValue} onChange={e => set('luggageValue', e.target.value)} />
          </Field>
          <Field label="¿Hiciste el PIR (parte de irregularidad) en el aeropuerto?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.pirDone} onChange={v => set('pirDone', v)}
            />
          </Field>
        </>
      )}

      {tipo === 'lesiones' && (
        <>
          <Field label="Tipo de lesión">
            <Input placeholder="Ej: caída por turbulencia, quemadura por café..." value={f.injuryType} onChange={e => set('injuryType', e.target.value)} />
          </Field>
          <Field label="¿Tienes parte médico?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No, pero fui al médico' }, { value: 'none', label: 'No' }]}
              value={f.medicalReport} onChange={v => set('medicalReport', v)}
            />
          </Field>
          <Field label="Descripción breve">
            <textarea value={f.injuryDescription} onChange={e => set('injuryDescription', e.target.value)}
              rows={4} style={{
                ...tokens && {}, padding: '14px 16px', border: `1.5px solid ${tokens.slate200}`,
                borderRadius: tokens.r1, fontSize: 15, fontFamily: tokens.fontBody,
                color: tokens.navy900, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical',
              }} />
          </Field>
        </>
      )}

      {error && (
        <div style={{
          background: tokens.red50, color: tokens.red500, padding: tokens.s3,
          borderRadius: tokens.r1, fontSize: 14, marginBottom: tokens.s3,
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Atrás</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" disabled={!coreValid || loading} onClick={() => onSubmit(f)}>
          {loading ? 'Analizando…' : 'Verificar con IA →'}
        </Button>
      </div>
    </div>
  );
}
