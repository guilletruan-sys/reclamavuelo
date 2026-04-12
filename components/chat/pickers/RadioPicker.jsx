import { tokens } from '../../../lib/theme';

export default function RadioPicker({ disabled, answer, onAnswer, options }) {
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.s2, marginTop: tokens.s2 }}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onAnswer(opt.value, opt.label)}
          style={{
            padding: '10px 16px',
            borderRadius: tokens.rPill,
            border: `1.5px solid ${tokens.slate200}`,
            background: tokens.white,
            color: tokens.navy900,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = tokens.green500;
            e.currentTarget.style.background = tokens.green50;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = tokens.slate200;
            e.currentTarget.style.background = tokens.white;
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
