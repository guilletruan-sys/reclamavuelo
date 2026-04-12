import { useState } from 'react';
import { tokens, inputStyle } from '../../../lib/theme';
import { Button } from '../../ui';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DatePicker({ disabled, answer, onAnswer, max }) {
  const today = new Date().toISOString().slice(0, 10);
  const [val, setVal] = useState('');
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  return (
    <div style={{ marginTop: tokens.s2, display: 'flex', gap: tokens.s2, flexDirection: 'column' }}>
      <input
        type="date"
        value={val}
        max={max || today}
        onChange={e => setVal(e.target.value)}
        style={{ ...inputStyle, background: tokens.white }}
      />
      <Button
        size="sm"
        variant="primary"
        disabled={!val}
        onClick={() => onAnswer(val, formatDate(val))}
      >
        Continuar →
      </Button>
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
