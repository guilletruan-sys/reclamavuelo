import { tokens } from '../../../lib/theme';
import { SERVICES } from '../../../lib/services';

export default function TypePicker({ disabled, answer, onAnswer }) {
  if (disabled) {
    return <ReadOnlyBadge label={answer?.label || '...'} />;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s2, marginTop: tokens.s2 }}>
      {SERVICES.map(s => (
        <button
          key={s.id}
          onClick={() => onAnswer(s.id, s.title)}
          style={tipoCard}
          onMouseEnter={e => (e.currentTarget.style.borderColor = tokens.green500)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = tokens.slate200)}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 14, fontWeight: 700, color: tokens.navy900 }}>{s.title}</div>
          <div style={{ fontSize: 11, color: tokens.slate500, marginTop: 2 }}>{s.short}</div>
        </button>
      ))}
    </div>
  );
}

const tipoCard = {
  textAlign: 'left',
  padding: tokens.s3,
  cursor: 'pointer',
  background: tokens.white,
  border: `1.5px solid ${tokens.slate200}`,
  borderRadius: tokens.r1,
  transition: 'border-color 0.15s',
};

function ReadOnlyBadge({ label }) {
  return (
    <div
      style={{
        display: 'inline-block',
        background: tokens.slate50,
        border: `1px solid ${tokens.slate200}`,
        borderRadius: tokens.rPill,
        padding: '4px 10px',
        fontSize: 12,
        color: tokens.slate500,
        marginTop: 6,
      }}
    >
      ✓ {label}
    </div>
  );
}
