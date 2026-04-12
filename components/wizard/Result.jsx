import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Button, Badge } from '../ui';

export default function Result({ result, verifyMeta, tipo, onBack, onContinue }) {
  const [showReasoning, setShowReasoning] = useState(false);
  if (!result) return null;

  const status = result.status || result.decision || 'REVISAR';
  const isOk = status === 'RECLAMABLE';
  const isReview = status === 'REVISAR' || status === 'REVISAR_MANUALMENTE';
  const amount = result.compensation || result.compensacion_estimada || result.amount || 0;

  // Campos del agente (Spanish keys) con fallbacks a equivalentes en inglés
  const summary     = result.resumen_usuario || result.summary || result.reason || result.motivo;
  const reasoning   = result.razonamiento_interno || result.reasoning;
  const factors     = result.factores_clave || result.factors || [];
  const nextStep    = result.siguiente_paso || result.nextStep;
  const regulation  = result.regulation || (tipo === 'equipaje' || tipo === 'lesiones' ? 'Convenio de Montreal' : 'CE 261/2004');

  const theme = isOk
    ? { bg: tokens.green50, border: tokens.green500, icon: '✓', iconBg: tokens.green500, label: 'Reclamable', labelColor: tokens.green700 }
    : isReview
      ? { bg: tokens.amber50, border: tokens.amber500, icon: '⚠', iconBg: tokens.amber500, label: 'Revisar caso', labelColor: tokens.amber500 }
      : { bg: tokens.slate100, border: tokens.slate300, icon: 'ⓘ', iconBg: tokens.slate500, label: 'No reclamable', labelColor: tokens.slate500 };

  return (
    <div className="fade-up">
      {/* ── Card principal con el titular ──────────────────────── */}
      <div style={{
        background: theme.bg, borderRadius: tokens.r2,
        border: `2px solid ${theme.border}`, padding: tokens.s5,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: tokens.rPill,
          background: theme.iconBg, color: tokens.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto', fontSize: 32, fontWeight: 800,
        }}>{theme.icon}</div>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: theme.labelColor, marginTop: tokens.s3,
        }}>{theme.label}</div>

        {isOk && amount > 0 && (
          <>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 56, fontWeight: 800, color: tokens.navy900, marginTop: tokens.s2, letterSpacing: '-0.03em' }}>
              {amount}€
            </div>
            <div style={{ fontSize: 13, color: tokens.slate500 }}>
              compensación estimada por pasajero
            </div>
          </>
        )}

        {regulation && (
          <div style={{ marginTop: isOk ? tokens.s3 : tokens.s2 }}>
            <Badge variant={isOk ? 'success' : isReview ? 'warning' : 'neutral'}>
              {regulation}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Explicación al usuario (siempre visible) ────────────── */}
      {summary && (
        <div style={{
          background: tokens.white,
          border: `1px solid ${tokens.slate200}`,
          borderRadius: tokens.r2,
          padding: tokens.s5,
          marginTop: tokens.s4,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: tokens.slate500,
            letterSpacing: '1px', textTransform: 'uppercase', marginBottom: tokens.s2,
          }}>Nuestro análisis</div>
          <p style={{
            fontSize: 15, lineHeight: 1.6, color: tokens.navy700, margin: 0,
          }}>{summary}</p>

          {factors.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              marginTop: tokens.s3,
            }}>
              {factors.map((f, i) => (
                <Badge key={i} variant="info">{f}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Siguiente paso ─────────────────────────────────────── */}
      {nextStep && (
        <div style={{
          background: isOk ? tokens.green50 : isReview ? tokens.amber50 : tokens.slate50,
          border: `1px solid ${isOk ? tokens.green100 : isReview ? '#fde68a' : tokens.slate200}`,
          borderRadius: tokens.r2,
          padding: tokens.s4,
          marginTop: tokens.s3,
          display: 'flex',
          gap: tokens.s3,
          alignItems: 'flex-start',
        }}>
          <div style={{
            fontSize: 22, lineHeight: 1, flexShrink: 0,
          }}>{isOk ? '🎯' : isReview ? '📞' : 'ℹ️'}</div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: isOk ? tokens.green700 : isReview ? tokens.amber500 : tokens.slate500,
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4,
            }}>Siguiente paso</div>
            <div style={{ fontSize: 14, color: tokens.navy700, lineHeight: 1.5 }}>
              {nextStep}
            </div>
          </div>
        </div>
      )}

      {/* ── Razonamiento jurídico (colapsable) ──────────────────── */}
      {reasoning && (
        <div style={{ marginTop: tokens.s3, textAlign: 'center' }}>
          <button
            onClick={() => setShowReasoning(v => !v)}
            style={{
              background: 'transparent', border: 'none', color: tokens.slate500,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
            }}>
            {showReasoning ? 'Ocultar' : 'Ver'} razonamiento jurídico detallado
          </button>
          {showReasoning && (
            <div style={{
              background: tokens.slate50, border: `1px solid ${tokens.slate200}`,
              borderRadius: tokens.r1, padding: tokens.s4, marginTop: tokens.s3,
              fontSize: 13, color: tokens.slate500, textAlign: 'left', lineHeight: 1.6,
            }} className="fade-in">{reasoning}</div>
          )}
        </div>
      )}

      {/* ── DEBUG TEMPORAL: respuesta cruda del agente ──────────── */}
      <details style={{
        marginTop: tokens.s4,
        background: '#fef3c7',
        border: '2px dashed #f59e0b',
        borderRadius: tokens.r2,
        padding: tokens.s4,
      }}>
        <summary style={{
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          color: '#92400e', letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          🐛 Debug · Cómo ha razonado la IA (temporal)
        </summary>
        <div style={{ marginTop: tokens.s3, fontSize: 13, lineHeight: 1.6, color: tokens.navy900 }}>
          {/* ── Origen de los datos ─────────────────────────── */}
          {verifyMeta && (() => {
            const fs = verifyMeta.flightStatus;
            const metar = verifyMeta.metarAnalysis;
            const demo = verifyMeta.demoMode;

            let dataSource, sourceColor, sourceExplanation;
            if (demo) {
              dataSource = '⚙️ MODO DEMO';
              sourceColor = '#94a3b8';
              sourceExplanation = 'AviationStack no está configurado. El backend usa datos ficticios hardcoded y Claude analiza sobre esos datos de demo.';
            } else if (fs) {
              dataSource = '✅ AVIATIONSTACK (datos reales verificados)';
              sourceColor = '#10b981';
              sourceExplanation = 'AviationStack confirmó el vuelo. Claude analizó cruzando los datos declarados por el pasajero con los datos operacionales reales.';
            } else {
              dataSource = '⚠️ SOLO DECLARACIÓN DEL PASAJERO';
              sourceColor = '#f59e0b';
              sourceExplanation = 'AviationStack NO devolvió datos del vuelo (normal si es un vuelo antiguo o el plan gratuito no lo encuentra). Claude confió en lo que declaró el pasajero en el formulario.';
            }

            return (
              <div style={{
                background: tokens.white, border: `2px solid ${sourceColor}`,
                borderRadius: tokens.r1, padding: tokens.s3, marginBottom: tokens.s3,
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: sourceColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
                  Origen de los datos del vuelo
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.navy900, marginBottom: 6 }}>
                  {dataSource}
                </div>
                <div style={{ fontSize: 12, color: tokens.slate500, lineHeight: 1.5 }}>
                  {sourceExplanation}
                </div>

                {fs && (
                  <div style={{
                    marginTop: tokens.s3, padding: tokens.s2,
                    background: tokens.slate50, borderRadius: 6, fontSize: 12,
                  }}>
                    <div><strong>Estado:</strong> {fs.status} {fs.cancelled ? '(cancelado)' : ''} {fs.diverted ? '(desviado)' : ''}</div>
                    <div><strong>Salida programada:</strong> {fs.scheduledDep || 'N/D'}</div>
                    <div><strong>Salida real:</strong> {fs.departed || 'N/D'}</div>
                    <div><strong>Llegada programada:</strong> {fs.scheduledArr || 'N/D'}</div>
                    <div><strong>Llegada real:</strong> {fs.arrived || 'N/D'}</div>
                    <div><strong>Retraso confirmado:</strong> {fs.delayMinutes != null ? fs.delayMinutes + ' min' : 'N/D'}</div>
                    {fs.delayCodes?.length > 0 && <div><strong>Códigos de causa:</strong> {fs.delayCodes.join(', ')}</div>}
                  </div>
                )}

                {metar && (metar.summary || metar.conditions?.length) && (
                  <div style={{
                    marginTop: tokens.s2, padding: tokens.s2,
                    background: tokens.slate50, borderRadius: 6, fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>🌦 METAR (meteorología)</div>
                    <div style={{ color: tokens.slate500 }}>{metar.summary || 'Sin resumen'}</div>
                    {metar.adverseFound && <div style={{ color: tokens.red500, marginTop: 2, fontWeight: 600 }}>⚠ Condiciones adversas confirmadas</div>}
                    {metar.conditions?.length > 0 && <div style={{ marginTop: 2 }}>Condiciones: {metar.conditions.join(', ')}</div>}
                  </div>
                )}
              </div>
            );
          })()}

          <div style={{ marginBottom: tokens.s3 }}>
            <strong style={{ color: '#92400e' }}>Decisión:</strong> {status}<br/>
            <strong style={{ color: '#92400e' }}>Confianza:</strong> {result.confianza || 'N/D'}<br/>
            <strong style={{ color: '#92400e' }}>Compensación estimada:</strong> {amount ? amount + '€' : 'null'}<br/>
            <strong style={{ color: '#92400e' }}>Regulación aplicada:</strong> {regulation}
          </div>

          {summary && (
            <div style={{ marginBottom: tokens.s3 }}>
              <strong style={{ color: '#92400e' }}>Resumen al usuario:</strong>
              <div style={{ background: tokens.white, padding: tokens.s2, borderRadius: 6, marginTop: 4 }}>{summary}</div>
            </div>
          )}

          {reasoning && (
            <div style={{ marginBottom: tokens.s3 }}>
              <strong style={{ color: '#92400e' }}>Razonamiento jurídico interno:</strong>
              <div style={{ background: tokens.white, padding: tokens.s2, borderRadius: 6, marginTop: 4 }}>{reasoning}</div>
            </div>
          )}

          {factors?.length > 0 && (
            <div style={{ marginBottom: tokens.s3 }}>
              <strong style={{ color: '#92400e' }}>Factores clave que ha considerado:</strong>
              <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                {factors.map((f, i) => <li key={i} style={{ marginBottom: 2 }}>{f}</li>)}
              </ul>
            </div>
          )}

          {nextStep && (
            <div style={{ marginBottom: tokens.s3 }}>
              <strong style={{ color: '#92400e' }}>Siguiente paso recomendado:</strong>
              <div style={{ background: tokens.white, padding: tokens.s2, borderRadius: 6, marginTop: 4 }}>{nextStep}</div>
            </div>
          )}

          <div>
            <strong style={{ color: '#92400e' }}>Respuesta cruda del backend (JSON):</strong>
            <pre style={{
              background: '#1e293b', color: '#e2e8f0',
              padding: tokens.s3, borderRadius: 6, marginTop: 4,
              fontSize: 11, lineHeight: 1.4,
              overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      </details>

      {/* ── Botones ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Modificar datos</Button>
        <div style={{ flex: 1 }} />
        {(isOk || isReview) && (
          <Button variant="primary" onClick={onContinue}>
            {isOk ? 'Iniciar reclamación →' : 'Hablar con un abogado →'}
          </Button>
        )}
      </div>
    </div>
  );
}
