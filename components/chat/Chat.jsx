import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../../lib/theme';
import { Button } from '../ui';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import Pickers from './pickers';
import { STEPS, ACTIONS, START_STEP } from '../../lib/conversation-script';

const STORAGE_KEY = 'rv-chat-session';

// Pequeño helper para esperas aleatorizadas (simula tipeo humano)
const typingDelay = () => 600 + Math.random() * 600;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/*
  Estado:
    messages: [{ id, role, content, picker?, pickerState: 'active'|'answered', answer?, step? }]
    context:  { tipo, airline, flightNumber, ..., result, caseRef, files, iban }
    stepId:   current step id from STEPS
    busy:     true mientras el bot está escribiendo o ejecutando una action
*/

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [context, setContext]   = useState({});
  const [stepId, setStepId]     = useState(null);
  const [busy, setBusy]         = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const scrollRef = useRef(null);
  const mountedRef = useRef(false);

  // ── Persistencia ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.stepId && saved.stepId !== 'end') {
          setResumePrompt(saved);
          return;
        }
      }
    } catch {}
    // Sin sesión previa: arrancar en welcome
    setStepId(START_STEP);
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current || !stepId) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, context, stepId }));
    } catch {}
  }, [messages, context, stepId]);

  // ── ?tipo= pre-selección desde los cards de servicios ──────────
  useEffect(() => {
    const t = router.query.tipo;
    if (t && !context.tipo && mountedRef.current) {
      // Simulamos que el usuario respondió la primera pregunta
      handleAnswer(t, labelForTipo(t), STEPS[START_STEP]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.tipo, mountedRef.current]);

  // ── Scroll automático ──────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  // ── Loop principal: cuando cambia stepId, ejecuta el turno ─────
  useEffect(() => {
    if (!stepId || !mountedRef.current) return;
    const step = STEPS[stepId];
    if (!step) return;

    // Salto condicional
    if (step.skipIf && step.skipIf(context)) {
      const nextId = resolveNext(step.next, context);
      setStepId(nextId);
      return;
    }

    runTurn(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  async function runTurn(step) {
    setBusy(true);

    // 1. Typing indicator
    await sleep(typingDelay());

    // 2. Mostrar mensaje del bot (si existe)
    const botText = typeof step.bot === 'function' ? step.bot(context) : step.bot;
    if (botText) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'bot', content: botText, step }]);
    }

    // 3. Si hay action, ejecutarla y avanzar solo
    if (step.action) {
      await sleep(300); // breve pausa tras el texto
      const actionFn = ACTIONS[step.action];
      try {
        const updates = await actionFn(context);
        const newContext = { ...context, ...updates };
        setContext(newContext);
        const nextId = resolveNext(step.next, newContext);
        setBusy(false);
        setStepId(nextId);
      } catch (e) {
        setMessages(m => [...m, {
          id: crypto.randomUUID(),
          role: 'system',
          content: `⚠ ${e.message || 'Error de conexión'}. Inténtalo de nuevo en unos segundos.`,
        }]);
        setBusy(false);
      }
      return;
    }

    // 4. Si hay picker, marcamos como activo y esperamos respuesta
    if (step.picker) {
      setMessages(m => {
        // Buscamos el último mensaje del bot y le añadimos el picker
        const copy = [...m];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === 'bot' && !copy[i].picker) {
            copy[i] = { ...copy[i], picker: step.picker, pickerState: 'active', stepId: step.id || stepId };
            break;
          }
        }
        return copy;
      });
    }

    setBusy(false);

    // 5. Si no hay picker ni action (ej: step `end`), no avanzamos más
  }

  function handleAnswer(value, label, step) {
    if (busy) return;
    // Marcar el picker activo como respondido
    setMessages(m => m.map(msg => {
      if (msg.pickerState === 'active') {
        return { ...msg, pickerState: 'answered', answer: { value, label } };
      }
      return msg;
    }));

    // Añadir burbuja del usuario con el label legible
    if (label) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'user', content: label }]);
    }

    // Guardar en contexto
    const currentStep = step || STEPS[stepId];
    let newContext = context;
    if (currentStep.slot && currentStep.slot !== '_consent' && !currentStep.slot.startsWith('files.')) {
      newContext = { ...context, [currentStep.slot]: value };
      setContext(newContext);
    } else if (currentStep.slot?.startsWith('files.')) {
      const fileKey = currentStep.slot.replace('files.', '');
      newContext = { ...context, files: { ...(context.files || {}), [fileKey]: value } };
      setContext(newContext);
    }

    // Avanzar al siguiente step
    const nextId = resolveNext(currentStep.next, newContext);
    setStepId(nextId);
  }

  function handleResume(action) {
    if (action === 'continue') {
      setMessages(resumePrompt.messages || []);
      setContext(resumePrompt.context || {});
      setStepId(resumePrompt.stepId || START_STEP);
    } else {
      // Empezar de cero
      localStorage.removeItem(STORAGE_KEY);
      setMessages([]);
      setContext({});
      setStepId(START_STEP);
    }
    setResumePrompt(false);
    mountedRef.current = true;
  }

  // ── UI ──────────────────────────────────────────────────────────
  return (
    <section id="reclamar" style={{ background: tokens.slate50, padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{
        maxWidth: tokens.chatMaxWidth, margin: '0 auto',
        background: tokens.white, borderRadius: tokens.r3,
        boxShadow: tokens.shadowLg,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        height: 'min(720px, 90vh)',
      }}>
        {/* Header */}
        <header style={{
          padding: `${tokens.s3}px ${tokens.s5}px`,
          borderBottom: `1px solid ${tokens.slate200}`,
          display: 'flex', alignItems: 'center', gap: tokens.s3,
          background: tokens.white,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: tokens.rPill,
            background: tokens.navy900, color: tokens.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>⚖️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 15, fontWeight: 700, color: tokens.navy900 }}>
              Asesor legal ReclamaVuelo
            </div>
            <div style={{ fontSize: 12, color: tokens.green600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.green500 }} />
              Online · responde en segundos
            </div>
          </div>
        </header>

        {/* Mensajes */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.s5,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.s3,
            background: tokens.slate50,
          }}
        >
          {resumePrompt && (
            <div style={{
              background: tokens.amber50,
              border: `1px solid #fde68a`,
              borderRadius: tokens.r2,
              padding: tokens.s4,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, color: tokens.navy900, marginBottom: tokens.s3 }}>
                Tienes una conversación pendiente. ¿Quieres continuar donde lo dejaste?
              </div>
              <div style={{ display: 'flex', gap: tokens.s2, justifyContent: 'center' }}>
                <Button size="sm" variant="primary" onClick={() => handleResume('continue')}>Continuar →</Button>
                <Button size="sm" variant="ghost"   onClick={() => handleResume('restart')}>Empezar de cero</Button>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <Message key={msg.id} role={msg.role} avatar={msg.role === 'bot' ? '⚖️' : null}>
              {msg.role === 'bot' && msg.picker ? (
                <>
                  <div style={{ marginBottom: tokens.s3 }}>{msg.content}</div>
                  <Pickers
                    picker={msg.picker}
                    context={context}
                    disabled={msg.pickerState !== 'active'}
                    answer={msg.answer}
                    onAnswer={(value, label) => handleAnswer(value, label, STEPS[msg.stepId])}
                  />
                </>
              ) : msg.content}
            </Message>
          ))}

          {busy && <TypingIndicator />}
        </div>
      </div>
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function resolveNext(next, ctx) {
  if (typeof next === 'function') return next(ctx);
  return next;
}

function labelForTipo(t) {
  const map = {
    retraso: 'Retraso', cancelacion: 'Cancelación', conexion: 'Conexión perdida',
    overbooking: 'Overbooking', equipaje: 'Equipaje', lesiones: 'Lesiones a bordo',
  };
  return map[t] || t;
}
