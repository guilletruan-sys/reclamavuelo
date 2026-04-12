import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../../lib/theme';
import ProgressBar from './ProgressBar';
import Step1Type from './Step1Type';
import Step2Flight from './Step2Flight';
import Step3Contact from './Step3Contact';
import Step4Documents from './Step4Documents';
import Result from './Result';
import { toBackendFlight } from './mappers';

const STORAGE_KEY = 'rv-wizard-draft';

const INITIAL = {
  tipo: null,
  flight: {},
  result: null,
  contact: {},
  caseRef: null,   // generado por /api/submit-claim en el paso 3
  uploadUrl: null, // fallback si abandona antes de acabar el paso 4
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

  const stepTitle = { 1: 'Tipo de incidencia', 2: 'Datos del vuelo', 3: 'Tus datos', 4: 'Documentos' };
  const totalSteps = 4;
  // Para la barra de progreso usamos un int aunque internamente manejemos 2.5
  const displayStep = Math.floor(step);

  return (
    <section id="reclamar" style={{ background: tokens.slate50, padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        background: tokens.white, borderRadius: tokens.r3,
        boxShadow: tokens.shadowLg, padding: tokens.s6,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.green600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
          Paso {displayStep > totalSteps ? totalSteps : displayStep} de {totalSteps} · {stepTitle[displayStep] || 'Confirmación'}
        </div>
        <ProgressBar step={displayStep > totalSteps ? totalSteps : displayStep} total={totalSteps} />

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
                // /api/verify devuelve { success, decision: {agentResult}, ... }
                // desempaquetamos el agentResult para que Result.jsx lo use directo
                const agentResult = data.decision || data;
                setState(s => ({ ...s, flight, result: agentResult }));
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
            onSubmitted={data => {
              setState(s => ({
                ...s,
                caseRef:   data?.ref       || null,
                uploadUrl: data?.uploadUrl || null,
              }));
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <Step4Documents
            tipo={state.tipo}
            caseRef={state.caseRef}
            contact={state.contact}
            flight={state.flight}
            result={state.result}
            onBack={() => setStep(3)}
            onSkip={() => { localStorage.removeItem(STORAGE_KEY); setStep(5); }}
            onDone={() => { localStorage.removeItem(STORAGE_KEY); setStep(5); }}
          />
        )}
        {step === 5 && <Confirmation uploadUrl={state.uploadUrl} />}
      </div>
    </section>
  );
}

function Confirmation({ uploadUrl }) {
  return (
    <div style={{ textAlign: 'center', padding: `${tokens.s6}px 0` }} className="fade-up">
      <div style={{
        width: 80, height: 80, borderRadius: tokens.rPill,
        background: tokens.green100, color: tokens.green600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: 36, fontWeight: 800,
      }}>✓</div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 26, marginTop: tokens.s4, color: tokens.navy900 }}>¡Expediente enviado!</h2>
      <p style={{ color: tokens.slate500, marginTop: tokens.s3, maxWidth: 440, margin: `${tokens.s3}px auto 0` }}>
        Nuestro equipo revisará la documentación y te contactará en 24 horas para iniciar la reclamación formal ante la aerolínea.
      </p>
      {uploadUrl && (
        <p style={{ fontSize: 13, color: tokens.slate500, marginTop: tokens.s4 }}>
          ¿Faltaba algún documento? <a href={uploadUrl} style={{ color: tokens.green600, textDecoration: 'underline', fontWeight: 600 }}>Añádelo aquí</a>.
        </p>
      )}
    </div>
  );
}
