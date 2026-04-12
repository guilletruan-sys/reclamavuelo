import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input } from './fields';
import { Button } from '../ui';
import { toBackendFlight, toBackendContact } from './mappers';

export default function Step3Contact({ value, result, flight, tipo, onChange, onBack, onSubmitted }) {
  const [c, setC] = useState({
    firstName: '', lastName: '', dni: '', email: '', phone: '', passengers: 1,
    rgpd: false, terms: false,
    ...value,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => { const next = { ...c, [k]: v }; setC(next); onChange(next); };
  const valid = c.firstName && c.lastName && c.dni && c.email && c.phone && c.rgpd && c.terms;

  const onSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const payload = {
        ...toBackendFlight(tipo, flight),
        ...toBackendContact(c),
        aiDecision: result,
      };
      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error enviando el caso');
      onSubmitted(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 24, marginBottom: tokens.s4 }}>Tus datos</h2>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Nombre"><Input value={c.firstName} onChange={e => set('firstName', e.target.value)} /></Field>
        <Field label="Apellidos"><Input value={c.lastName} onChange={e => set('lastName', e.target.value)} /></Field>
      </div>
      <Field label="DNI / NIE / Pasaporte"><Input value={c.dni} onChange={e => set('dni', e.target.value.toUpperCase())} /></Field>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Email"><Input type="email" inputMode="email" value={c.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Teléfono"><Input type="tel" inputMode="tel" value={c.phone} onChange={e => set('phone', e.target.value)} /></Field>
      </div>
      <Field label="Nº de pasajeros en la reserva">
        <Input type="number" min="1" max="20" value={c.passengers} onChange={e => set('passengers', parseInt(e.target.value) || 1)} />
      </Field>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: tokens.s3, fontSize: 13, color: tokens.slate500, cursor: 'pointer' }}>
        <input type="checkbox" checked={c.rgpd} onChange={e => set('rgpd', e.target.checked)} style={{ marginTop: 3 }} />
        <span>Acepto la <a href="/privacidad" style={{ color: tokens.green600, textDecoration: 'underline' }}>política de privacidad</a> y el tratamiento de mis datos para gestionar la reclamación.</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: tokens.s2, fontSize: 13, color: tokens.slate500, cursor: 'pointer' }}>
        <input type="checkbox" checked={c.terms} onChange={e => set('terms', e.target.checked)} style={{ marginTop: 3 }} />
        <span>Entiendo que la comisión es del <b>25% + IVA sobre la compensación obtenida</b>, y que solo pago si se consigue.</span>
      </label>

      {error && (
        <div style={{ background: tokens.red50, color: tokens.red500, padding: tokens.s3, borderRadius: tokens.r1, fontSize: 14, marginTop: tokens.s3 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Atrás</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" disabled={!valid || loading} onClick={onSubmit}>
          {loading ? 'Enviando…' : 'Enviar caso →'}
        </Button>
      </div>
    </div>
  );
}
