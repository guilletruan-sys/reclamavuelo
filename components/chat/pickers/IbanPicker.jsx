import { useState } from 'react';
import { tokens } from '../../../lib/theme';
import IbanInput from '../../docs/IbanInput';
import { Button } from '../../ui';

function validateIBAN(raw) {
  const s = (raw || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
  let rem = 0;
  for (const c of numeric) rem = (rem * 10 + parseInt(c, 10)) % 97;
  return rem === 1;
}

export default function IbanPicker({ disabled, answer, onAnswer }) {
  const [val, setVal] = useState('');
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  const ok = validateIBAN(val);

  return (
    <div style={{ marginTop: tokens.s2 }}>
      <IbanInput value={val} onChange={setVal} />
      <Button
        size="sm"
        variant="primary"
        disabled={!ok}
        onClick={() => onAnswer(val.replace(/\s/g, '').toUpperCase(), val)}
        style={{ width: '100%', marginTop: tokens.s2 }}
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
