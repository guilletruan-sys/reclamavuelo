import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../../lib/theme';
import ProgressBar from './ProgressBar';
import Step1Type from './Step1Type';
import Step2Flight from './Step2Flight';
import Step3Contact from './Step3Contact';
import Result from './Result';
import { toBackendFlight } from './mappers';

const STORAGE_KEY = 'rv-wizard-draft';

const INITIAL = {
  tipo: null,
  flight: {},
  result: null,
  contact: {},
};

export default function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restaurar draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  // Guardar draft
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  // Preselect from ?tipo=
  useEffect(() => {
    const t = router.query.tipo;
    if (t && !state.tipo) {
      setState(s => ({ ...s, tipo: t }));
      setStep(2);
    }
  }, [router.query.tipo]);

  const stepTitle = { 1: 'Tipo de incidencia', 2: 'Datos del vuelo', 3: 'Tus datos' };

  return (
    <section id="reclamar" style={{ background: tokens.slate50, padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        background: tokens.white, borderRadius: tokens.r3,
        boxShadow: tokens.shadowLg, padding: tokens.s6,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.green600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
          Paso {step} de 3 · {stepTitle[step]}
        </div>
        <ProgressBar step={step} />

        {step === 1 && (
          <Step1Type
            value={state.tipo}
            onPick={tipo => { setState(s => ({ ...s, tipo })); setStep(2); }}
          />
        )}
        {step === 2 && (
          <Step2Flight
            tipo={state.tipo}
            value={state.flight}
            loading={loading}
            error={error}
            onChange={flight => setState(s => ({ ...s, flight }))}
            onBack={() => setStep(1)}
            onSubmit={async flight => {
              setLoading(true); setError(null);
              try {
                const res = await fetch('/api/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(toBackendFlight(state.tipo, flight)),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al verificar');
                setState(s => ({ ...s, flight, result: data }));
                setStep(2.5);
              } catch (e) {
                setError(e.message);
              } finally { setLoading(false); }
            }}
          />
        )}
        {step === 2.5 && (
          <Result
            result={state.result}
            tipo={state.tipo}
            onBack={() => setStep(2)}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Contact
            value={state.contact}
            result={state.result}
            flight={state.flight}
            tipo={state.tipo}
            onChange={contact => setState(s => ({ ...s, contact }))}
            onBack={() => setStep(2.5)}
            onSubmitted={() => {
              localStorage.removeItem(STORAGE_KEY);
              setStep(4); // confirmation
            }}
          />
        )}
        {step === 4 && <Confirmation />}
      </div>
    </section>
  );
}

function Confirmation() {
  return (
    <div style={{ textAlign: 'center', padding: `${tokens.s6}px 0` }} className="fade-up">
      <div style={{
        width: 80, height: 80, borderRadius: tokens.rPill,
        background: tokens.green100, color: tokens.green600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: 36, fontWeight: 800,
      }}>✓</div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 26, marginTop: tokens.s4 }}>¡Caso recibido!</h2>
      <p style={{ color: tokens.slate500, marginTop: tokens.s3 }}>
        Te hemos enviado un email con el enlace para subir tus documentos. Revísalo para continuar.
      </p>
    </div>
  );
}
