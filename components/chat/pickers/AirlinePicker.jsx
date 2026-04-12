import { useState } from 'react';
import { tokens, selectStyle } from '../../../lib/theme';
import { AIRLINES } from '../../../lib/airlines';
import { Button } from '../../ui';

export default function AirlinePicker({ disabled, answer, onAnswer }) {
  const [val, setVal] = useState('');
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  const selected = AIRLINES.find(a => a.code === val);

  return (
    <div style={{ marginTop: tokens.s2, display: 'flex', gap: tokens.s2, flexDirection: 'column' }}>
      <select
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ ...selectStyle, background: tokens.white }}
      >
        <option value="">Selecciona aerolínea...</option>
        {AIRLINES.map(a => (
          <option key={a.code} value={a.code}>
            {a.code} — {a.name}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="primary"
        disabled={!val}
        onClick={() => onAnswer(val, `${val} — ${selected?.name || val}`)}
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
