import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input } from '../wizard/fields';

function validateIBAN(raw) {
  const s = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  // MOD-97 check
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
  let rem = 0;
  for (const c of numeric) rem = (rem * 10 + parseInt(c, 10)) % 97;
  return rem === 1;
}

export default function IbanInput({ value, onChange }) {
  const [v, setV] = useState(value || '');
  const [touched, setTouched] = useState(false);
  const ok = validateIBAN(v);
  const error = touched && v && !ok ? 'El IBAN no parece válido' : null;
  return (
    <Field label="IBAN" hint="Formato español: ES00 0000 0000 0000 0000 0000" error={error}>
      <Input
        value={v}
        placeholder="ES00 0000 0000 0000 0000 0000"
        onChange={e => { setV(e.target.value); onChange(e.target.value); }}
        onBlur={() => setTouched(true)}
        style={{ borderColor: ok ? tokens.green500 : undefined }}
      />
    </Field>
  );
}
