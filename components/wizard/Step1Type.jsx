import { tokens } from '../../lib/theme';
import { SERVICES } from '../../lib/services';

export default function Step1Type({ value, onPick }) {
  return (
    <div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 24, marginBottom: tokens.s4 }}>
        ¿Qué le pasó a tu vuelo?
      </h2>
      <p style={{ color: tokens.slate500, marginBottom: tokens.s5, fontSize: 15 }}>
        Elige el tipo de incidencia para empezar.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }} className="grid2">
        {SERVICES.map(s => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{
                textAlign: 'left', padding: tokens.s4, cursor: 'pointer',
                background: active ? tokens.green50 : tokens.white,
                border: `2px solid ${active ? tokens.green500 : tokens.slate200}`,
                borderRadius: tokens.r2, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = tokens.slate300; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = tokens.slate200; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 700, color: tokens.navy900 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 2 }}>{s.short}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
