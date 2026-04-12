import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Button, Badge } from '../ui';

export default function Result({ result, tipo, onBack, onContinue }) {
  const [showReasoning, setShowReasoning] = useState(false);
  if (!result) return null;

  const status = result.status || result.decision || 'REVISAR';
  const isOk = status === 'RECLAMABLE';
  const isReview = status === 'REVISAR' || status === 'REVISAR_MANUALMENTE';
  const amount = result.compensation || result.compensacion_estimada || result.amount || 0;
  const reasoning = result.reasoning || result.razonamiento_interno;
  const reason = result.reason || result.motivo;

  const theme = isOk
    ? { bg: tokens.green50, border: tokens.green500, icon: '✓', iconBg: tokens.green500, label: 'Reclamable', labelColor: tokens.green700 }
    : isReview
      ? { bg: tokens.amber50, border: tokens.amber500, icon: '⚠', iconBg: tokens.amber500, label: 'Revisar caso', labelColor: tokens.amber500 }
      : { bg: tokens.slate100, border: tokens.slate300, icon: 'ⓘ', iconBg: tokens.slate500, label: 'No reclamable', labelColor: tokens.slate500 };

  return (
    <div className="fade-up">
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

        {isOk && (
          <>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 56, fontWeight: 800, color: tokens.navy900, marginTop: tokens.s2, letterSpacing: '-0.03em' }}>
              {amount}€
            </div>
            <div style={{ fontSize: 13, color: tokens.slate500 }}>
              compensación estimada por pasajero
            </div>
          </>
        )}

        {isReview && (
          <div style={{ fontSize: 15, color: tokens.navy700, marginTop: tokens.s3, maxWidth: 420, margin: `${tokens.s3}px auto 0` }}>
            Tu caso necesita revisión personalizada. Uno de nuestros abogados lo estudiará.
          </div>
        )}

        {!isOk && !isReview && (
          <div style={{ fontSize: 15, color: tokens.navy700, marginTop: tokens.s3, maxWidth: 420, margin: `${tokens.s3}px auto 0` }}>
            {reason || 'Según nuestro análisis, este caso no cumple los requisitos para reclamación.'}
          </div>
        )}

        {reasoning && (
          <div style={{ marginTop: tokens.s4 }}>
            <button
              onClick={() => setShowReasoning(v => !v)}
              style={{
                background: 'transparent', border: 'none', color: tokens.slate500,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
              }}>
              {showReasoning ? 'Ocultar' : 'Ver'} razonamiento del análisis
            </button>
            {showReasoning && (
              <div style={{
                background: tokens.white, border: `1px solid ${tokens.slate200}`,
                borderRadius: tokens.r1, padding: tokens.s3, marginTop: tokens.s3,
                fontSize: 13, color: tokens.slate500, textAlign: 'left', lineHeight: 1.6,
              }}>{reasoning}</div>
            )}
          </div>
        )}
      </div>

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
