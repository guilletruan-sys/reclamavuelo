// pages/index.jsx
import { useState } from 'react';
import Head from 'next/head';

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  { id: 'delay',        icon: '⏱️', label: 'Retraso',              desc: 'Tu vuelo llegó tarde a destino' },
  { id: 'cancellation', icon: '❌', label: 'Cancelación',          desc: 'Tu vuelo fue cancelado' },
  { id: 'connection',   icon: '🔄', label: 'Conexión perdida',     desc: 'Perdiste un vuelo de conexión' },
  { id: 'overbooking',  icon: '🚫', label: 'Overbooking',         desc: 'Te denegaron el embarque' },
];

const AIRLINES = [
  { value: 'IB', label: 'Iberia' }, { value: 'VY', label: 'Vueling' },
  { value: 'FR', label: 'Ryanair' }, { value: 'UX', label: 'Air Europa' },
  { value: 'VW', label: 'Volotea' }, { value: 'AF', label: 'Air France' },
  { value: 'LH', label: 'Lufthansa' }, { value: 'BA', label: 'British Airways' },
  { value: 'U2', label: 'easyJet' }, { value: 'W6', label: 'Wizz Air' },
  { value: 'TK', label: 'Turkish Airlines' }, { value: 'EK', label: 'Emirates' },
  { value: 'OTHER', label: 'Otra compañía' },
];

const COMPENSATION = { short: 250, medium: 400, long: 600 };

// ── COMPONENTES AUXILIARES ────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['Incidencia', 'Vuelo', 'Verificación', 'Tus datos', 'Confirmado'];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, fontFamily: 'Syne, sans-serif',
                background: done ? '#10b981' : active ? '#1a56db' : '#e2e8f0',
                color: done || active ? '#fff' : '#64748b',
                boxShadow: active ? '0 0 0 4px rgba(26,86,219,0.15)' : 'none',
                transition: 'all 0.3s',
              }}>{done ? '✓' : n}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#1a56db' : done ? '#10b981' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 2, background: done ? '#10b981' : '#e2e8f0', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#0a1628', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: '#94a3b8' }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 15, fontFamily: 'DM Sans, sans-serif', color: '#0a1628',
  background: '#fff', width: '100%', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

const selectStyle = { ...inputStyle };

function Input({ ...props }) {
  return (
    <input
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#1a56db'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      {...props}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select style={selectStyle} {...props}>{children}</select>
  );
}

function Alert({ type = 'info', children }) {
  const colors = {
    info:    { bg: 'rgba(26,86,219,0.07)',  border: '#1a56db', color: '#1a3a8f' },
    warn:    { bg: 'rgba(245,158,11,0.1)',  border: '#f59e0b', color: '#78350f' },
    success: { bg: 'rgba(16,185,129,0.1)',  border: '#10b981', color: '#065f46' },
    error:   { bg: 'rgba(239,68,68,0.1)',   border: '#ef4444', color: '#7f1d1d' },
  };
  const c = colors[type];
  return (
    <div style={{ padding: '11px 14px', borderRadius: 8, background: c.bg, borderLeft: `3px solid ${c.border}`, color: c.color, fontSize: 13.5, lineHeight: 1.6, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      {children}
    </div>
  );
}

function Btn({ variant = 'primary', children, style = {}, ...props }) {
  const variants = {
    primary:   { background: '#1a56db', color: '#fff' },
    gold:      { background: '#f59e0b', color: '#0a1628' },
    secondary: { background: 'transparent', color: '#1a56db', border: '1.5px solid #1a56db' },
    danger:    { background: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0' },
  };
  return (
    <button
      style={{
        padding: '13px 24px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 15, cursor: 'pointer', border: 'none', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s', ...variants[variant], ...style,
      }}
      {...props}
    >{children}</button>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep]           = useState(1);
  const [incidentType, setType]   = useState('');
  const [form, setForm]           = useState({
    flightNumber: '', date: '', origin: '', destination: '', airline: '',
    flightNumber2: '', samePNR: true, finalDestination: '',
    alternativeOffered: false, alternativeAccepted: '', alternativeArrival: '', cancellationNotice: '',
    airportCompensation: false,
    firstName: '', lastName: '', docNumber: '', phone: '', email: '',
    passengers: '1', comments: '',
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult]       = useState(null);
  const [caseRef, setCaseRef]     = useState('');
  const [sending, setSending]     = useState(false);

  // honeypot
  const [hp, setHp] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const today = new Date().toISOString().split('T')[0];

  // ── Verificación ─────────────────────────────────────────────────────────
  async function handleVerify() {
    if (hp) return; // honeypot
    if (!form.flightNumber || !form.date || !form.origin || !form.destination || !form.airline) {
      alert('Por favor, completa todos los campos del vuelo.');
      return;
    }
    if (incidentType === 'connection' && (!form.flightNumber2 || !form.finalDestination)) {
      alert('Indica también el segundo vuelo y el destino final.');
      return;
    }

    setVerifying(true);
    setStep(3);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentType, demoMode: false, ...form }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setVerifying(false);
    }
  }

  // ── Envío final ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.docNumber || !form.phone || !form.email) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      alert('Introduce un email válido.');
      return;
    }

    setSending(true);
    const ref = 'RV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
    setCaseRef(ref);

    // Enviar por formulario nativo a FormSubmit
    const f = document.getElementById('hiddenForm');
    document.getElementById('hf_ref').value      = ref;
    document.getElementById('hf_subject').value  = `[${ref}] ${incidentType.toUpperCase()}: ${form.flightNumber} — ${form.firstName} ${form.lastName}`;
    document.getElementById('hf_type').value     = incidentType;
    document.getElementById('hf_flight').value   = form.flightNumber;
    document.getElementById('hf_date').value     = form.date;
    document.getElementById('hf_route').value    = `${form.origin} → ${form.destination}`;
    document.getElementById('hf_decision').value = result?.decision?.decision || 'N/D';
    document.getElementById('hf_comp').value     = result?.decision?.compensacion_estimada ? result.decision.compensacion_estimada + '€' : 'N/D';
    document.getElementById('hf_nombre').value   = `${form.firstName} ${form.lastName}`;
    document.getElementById('hf_doc').value      = form.docNumber;
    document.getElementById('hf_tel').value      = form.phone;
    document.getElementById('hf_email').value    = form.email;
    document.getElementById('hf_pax').value      = form.passengers;
    document.getElementById('hf_notes').value    = form.comments || 'Sin comentarios';
    document.getElementById('hf_reasoning').value = result?.decision?.razonamiento_interno || '';
    document.getElementById('hf_ts').value       = new Date().toLocaleString('es-ES');

    let iframe = document.getElementById('fs_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframe.name = 'fs_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    f.target = 'fs_iframe';
    f.submit();

    setSending(false);
    setStep(5);
  }

  // ── Resultado del agente ─────────────────────────────────────────────────
  function renderDecision() {
    if (!result) return null;
    if (result.error) return <Alert type="error">⚠️ {result.error}</Alert>;

    const d = result.decision;
    if (!d) return null;

    const isOk   = d.decision === 'RECLAMABLE';
    const isNo   = d.decision === 'NO_RECLAMABLE';
    const isRev  = d.decision === 'REVISAR_MANUALMENTE';

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>
          {isOk ? '✅' : isNo ? '❌' : '🔍'}
        </div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 10, color: isOk ? '#10b981' : isNo ? '#ef4444' : '#f59e0b' }}>
          {isOk ? '¡Tienes derecho a reclamar!' : isNo ? 'No es posible reclamar' : 'Revisión necesaria'}
        </h3>

        {d.confianza && (
          <span style={{ display: 'inline-block', background: '#f0f4ff', color: '#1a56db', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, marginBottom: 16, letterSpacing: 1 }}>
            Confianza: {d.confianza}
          </span>
        )}

        <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>{d.resumen_usuario}</p>

        {isOk && d.compensacion_estimada && (
          <div style={{ background: 'linear-gradient(135deg, #0a1628, #1a56db)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, color: '#fff' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: '#f59e0b' }}>{d.compensacion_estimada}€</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Compensación estimada por pasajero</div>
          </div>
        )}

        {d.factores_clave?.length > 0 && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Factores analizados</div>
            {d.factores_clave.map((f, i) => (
              <div key={i} style={{ fontSize: 13.5, color: '#334155', padding: '4px 0', display: 'flex', gap: 8 }}>
                <span>{isOk ? '✓' : '·'}</span> {f}
              </div>
            ))}
          </div>
        )}

        {result.demoMode && (
          <Alert type="warn">🎬 Modo demo activo — análisis simulado. Con las API keys reales se consultará FlightStats y METARs reales.</Alert>
        )}
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>ReclamaVuelo — Recupera lo que te pertenece</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f4ff; color: #0a1628; }
      `}</style>

      {/* DEMO BANNER */}
      <div style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', color: '#0a1628', textAlign: 'center', padding: '9px 16px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
        🎬 MODO DEMOSTRACIÓN — Análisis simulado hasta activar API keys reales
      </div>

      {/* NAV */}
      <nav style={{ background: '#0a1628', padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>
          Reclama<span style={{ color: '#f59e0b' }}>Vuelo</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#form" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Reclamar</a>
          <a href="#como" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Cómo funciona</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#0f2356 50%,#0a1628 100%)', padding: '72px 24px 88px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          ✈ Reglamento CE 261/2004
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#fff', lineHeight: 1.1, marginBottom: 18 }}>
          Tu vuelo falló.<br /><span style={{ color: '#f59e0b' }}>Reclama hasta 600€</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Retrasos, cancelaciones, overbooking o conexiones perdidas. Verificamos automáticamente tu caso con IA y datos reales.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['600€', 'Indemnización máxima'], ['25%', 'Solo si ganamos'], ['IA', 'Análisis automático'], ['99%', 'Tasa de éxito']].map(([n, l]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div id="form" style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(26,86,219,0.1)', color: '#1a56db', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Empieza aquí</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Comprueba tu reclamación</h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>Analizamos tu caso con IA combinando datos de vuelo reales, meteorología y legislación europea.</p>
        </div>

        <StepIndicator current={step} />

        <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>

          {/* ── PASO 1: Tipo de incidencia ── */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>¿Qué te ocurrió?</h3>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Selecciona el tipo de incidencia con tu vuelo.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                {INCIDENT_TYPES.map(t => (
                  <div key={t.id} onClick={() => setType(t.id)} style={{
                    padding: '20px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                    border: `2px solid ${incidentType === t.id ? '#1a56db' : '#e2e8f0'}`,
                    background: incidentType === t.id ? 'rgba(26,86,219,0.04)' : '#fff',
                    boxShadow: incidentType === t.id ? '0 0 0 3px rgba(26,86,219,0.1)' : 'none',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.desc}</div>
                  </div>
                ))}
              </div>

              <Btn onClick={() => incidentType ? setStep(2) : alert('Selecciona el tipo de incidencia.')}>
                Continuar →
              </Btn>
            </div>
          )}

          {/* ── PASO 2: Datos del vuelo ── */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                {INCIDENT_TYPES.find(t => t.id === incidentType)?.icon} Datos del vuelo
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Introduce la información del vuelo afectado.
              </p>

              {/* honeypot invisible */}
              <div style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                <input tabIndex={-1} value={hp} onChange={e => setHp(e.target.value)} name="company" autoComplete="off" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="Número de vuelo *" hint="Ej: IB3456, VY1234">
                  <Input value={form.flightNumber} onChange={e => set('flightNumber', e.target.value.toUpperCase())} placeholder="IB3456" maxLength={8} />
                </Field>
                <Field label="Fecha del vuelo *">
                  <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} max={today} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="Origen *" hint="Código IATA (3 letras)">
                  <Input value={form.origin} onChange={e => set('origin', e.target.value.toUpperCase())} placeholder="MAD" maxLength={3} />
                </Field>
                <Field label="Destino *" hint="Código IATA (3 letras)">
                  <Input value={form.destination} onChange={e => set('destination', e.target.value.toUpperCase())} placeholder="LHR" maxLength={3} />
                </Field>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Compañía aérea *">
                  <Select value={form.airline} onChange={e => set('airline', e.target.value)}>
                    <option value="">Selecciona la compañía...</option>
                    {AIRLINES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Campos extra según tipo */}
              {incidentType === 'connection' && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#0a1628' }}>🔄 Vuelo de conexión</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <Field label="Vuelo de conexión *">
                      <Input value={form.flightNumber2} onChange={e => set('flightNumber2', e.target.value.toUpperCase())} placeholder="IB5678" maxLength={8} />
                    </Field>
                    <Field label="Destino final *" hint="Código IATA">
                      <Input value={form.finalDestination} onChange={e => set('finalDestination', e.target.value.toUpperCase())} placeholder="JFK" maxLength={3} />
                    </Field>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="samePNR" checked={form.samePNR} onChange={e => set('samePNR', e.target.checked)} style={{ width: 16, height: 16 }} />
                    <label htmlFor="samePNR" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>Ambos vuelos estaban bajo el mismo número de reserva (PNR)</label>
                  </div>
                </div>
              )}

              {incidentType === 'cancellation' && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#0a1628' }}>❌ Detalles de la cancelación</div>
                  <div style={{ marginBottom: 14 }}>
                    <Field label="¿Cuándo te informaron de la cancelación?">
                      <Select value={form.cancellationNotice} onChange={e => set('cancellationNotice', e.target.value)}>
                        <option value="">Selecciona...</option>
                        <option value="same_day">El mismo día del vuelo</option>
                        <option value="1_7_days">Entre 1 y 7 días antes</option>
                        <option value="7_14_days">Entre 7 y 14 días antes</option>
                        <option value="more_14_days">Más de 14 días antes</option>
                        <option value="unknown">No lo recuerdo</option>
                      </Select>
                    </Field>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: form.alternativeOffered ? 14 : 0 }}>
                    <input type="checkbox" id="altOff" checked={form.alternativeOffered} onChange={e => set('alternativeOffered', e.target.checked)} style={{ width: 16, height: 16 }} />
                    <label htmlFor="altOff" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>La aerolínea me ofreció un vuelo alternativo</label>
                  </div>
                  {form.alternativeOffered && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                      <Field label="¿Aceptaste el vuelo alternativo?">
                        <Select value={form.alternativeAccepted ?? ''} onChange={e => set('alternativeAccepted', e.target.value)}>
                          <option value="">Selecciona...</option>
                          <option value="yes">Sí, lo acepté</option>
                          <option value="no">No, lo rechacé</option>
                        </Select>
                      </Field>
                      <Field label="Hora de llegada del alternativo" hint="Fecha y hora real de llegada">
                        <Input type="datetime-local" value={form.alternativeArrival} onChange={e => set('alternativeArrival', e.target.value)} />
                      </Field>
                    </div>
                  )}
                </div>
              )}

              {incidentType === 'overbooking' && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#0a1628' }}>🚫 Detalles del overbooking</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="airComp" checked={form.airportCompensation} onChange={e => set('airportCompensation', e.target.checked)} style={{ width: 16, height: 16 }} />
                    <label htmlFor="airComp" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>La aerolínea me ofreció compensación voluntaria en el aeropuerto</label>
                  </div>
                </div>
              )}

              <Alert type="info">
                ℹ️ <span>Consultaremos FlightStats para verificar los datos reales del vuelo y los METARs meteorológicos.</span>
              </Alert>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                <Btn onClick={handleVerify}>Verificar vuelo con IA →</Btn>
                <Btn variant="secondary" onClick={() => setStep(1)}>← Volver</Btn>
              </div>
            </div>
          )}

          {/* ── PASO 3: Verificación / Resultado ── */}
          {step === 3 && (
            <div>
              {verifying ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 48, height: 48, border: '4px solid #f0f4ff', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Analizando tu vuelo...</h4>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Consultando FlightStats, METARs y agente IA</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ) : result ? (
                <div>
                  {renderDecision()}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                    {result.decision?.decision === 'RECLAMABLE' || result.decision?.decision === 'REVISAR_MANUALMENTE' ? (
                      <Btn variant="gold" onClick={() => setStep(4)}>💰 Iniciar reclamación →</Btn>
                    ) : null}
                    <Btn variant="secondary" onClick={() => { setStep(1); setResult(null); setType(''); }}>← Probar con otro vuelo</Btn>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ── PASO 4: Datos personales ── */}
          {step === 4 && (
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>👤 Tus datos personales</h3>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Necesitamos tus datos para gestionar la reclamación en tu nombre.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="Nombre *">
                  <Input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Tu nombre" />
                </Field>
                <Field label="Apellidos *">
                  <Input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Tus apellidos" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="DNI/NIE/Pasaporte *">
                  <Input value={form.docNumber} onChange={e => set('docNumber', e.target.value)} placeholder="12345678A" />
                </Field>
                <Field label="Teléfono *">
                  <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" />
                </Field>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Field label="Email *">
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <Field label="Nº de pasajeros afectados">
                  <Select value={form.passengers} onChange={e => set('passengers', e.target.value)}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'pasajero' : 'pasajeros'}</option>)}
                    <option value="5+">5 o más</option>
                  </Select>
                </Field>
                <Field label="Comentarios">
                  <Input value={form.comments} onChange={e => set('comments', e.target.value)} placeholder="Gastos adicionales, etc." />
                </Field>
              </div>

              <Alert type="info">🔒 <span>Tus datos están protegidos bajo LOPD/RGPD y se usarán exclusivamente para gestionar tu reclamación.</span></Alert>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                <Btn variant="gold" onClick={handleSubmit} style={{ opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Enviando...' : '🚀 Enviar reclamación'}
                </Btn>
                <Btn variant="secondary" onClick={() => setStep(3)}>← Volver al resultado</Btn>
              </div>
            </div>
          )}

          {/* ── PASO 5: Confirmación ── */}
          {step === 5 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>✓</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#10b981', marginBottom: 12 }}>¡Reclamación enviada!</h3>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 6 }}>Hemos recibido tu caso. Te contactaremos en un máximo de 24 horas.</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>Referencia: <strong>{caseRef}</strong></p>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 14 }}>¿Qué ocurre ahora?</div>
                {[
                  ['1', 'Análisis jurídico', 'Nuestros abogados estudian la viabilidad de tu caso.'],
                  ['2', 'Reclamación amistosa', 'Nos dirigimos a la aerolínea exigiendo la compensación.'],
                  ['3', 'Vía judicial si necesario', 'Si la aerolínea no responde, procedemos judicialmente.'],
                  ['4', 'Recibes tu dinero', 'Te transferimos la indemnización menos nuestra comisión del 25%+IVA.'],
                ].map(([n, title, desc]) => (
                  <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 26, height: 26, background: '#1a56db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{n}</div>
                    <div><strong style={{ fontSize: 13 }}>{title}</strong> <span style={{ color: '#64748b', fontSize: 13 }}>— {desc}</span></div>
                  </div>
                ))}
              </div>

              <Btn variant="secondary" onClick={() => { setStep(1); setResult(null); setType(''); setForm(f => ({ ...f, flightNumber:'',date:'',origin:'',destination:'',airline:'',firstName:'',lastName:'',docNumber:'',phone:'',email:'',comments:'' })); }}>
                Reclamar otro vuelo
              </Btn>
            </div>
          )}

        </div>
      </div>

      {/* FORMULARIO OCULTO FORMSUBMIT */}
      <form id="hiddenForm" action="https://formsubmit.co/guilletruan@gmail.com" method="POST" style={{ display: 'none' }}>
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha"  value="false" />
        <input type="hidden" id="hf_subject"   name="_subject" />
        <input type="hidden" id="hf_ref"        name="Referencia" />
        <input type="hidden" id="hf_type"       name="Tipo incidencia" />
        <input type="hidden" id="hf_flight"     name="Vuelo" />
        <input type="hidden" id="hf_date"       name="Fecha" />
        <input type="hidden" id="hf_route"      name="Ruta" />
        <input type="hidden" id="hf_decision"   name="Decision IA" />
        <input type="hidden" id="hf_comp"       name="Compensacion estimada" />
        <input type="hidden" id="hf_nombre"     name="Nombre" />
        <input type="hidden" id="hf_doc"        name="Documento" />
        <input type="hidden" id="hf_tel"        name="Telefono" />
        <input type="hidden" id="hf_email"      name="Email pasajero" />
        <input type="hidden" id="hf_pax"        name="Num pasajeros" />
        <input type="hidden" id="hf_notes"      name="Comentarios" />
        <input type="hidden" id="hf_reasoning"  name="Razonamiento IA" />
        <input type="hidden" id="hf_ts"         name="Timestamp" />
        <button type="submit">Enviar</button>
      </form>

    </>
  );
}
