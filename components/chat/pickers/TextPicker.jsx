import { useState } from 'react';
import { tokens, inputStyle } from '../../../lib/theme';
import { Button } from '../../ui';

export default function TextPicker({
  disabled,
  answer,
  onAnswer,
  placeholder,
  validate,
  type = 'text',
  multiline,
  transform,
  optional,
}) {
  const [val, setVal] = useState('');
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  const transformed = transform === 'upper' ? val.toUpperCase() : val;
  const re = validate ? (validate instanceof RegExp ? validate : new RegExp(validate)) : null;
  const isValid = val.trim() && (!re || re.test(transformed.trim()));

  const sharedStyle = { ...inputStyle, background: tokens.white };

  return (
    <div style={{ marginTop: tokens.s2, display: 'flex', gap: tokens.s2, flexDirection: 'column' }}>
      {multiline ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{ ...sharedStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          style={sharedStyle}
        />
      )}
      <div style={{ display: 'flex', gap: tokens.s2 }}>
        <Button
          size="sm"
          variant="primary"
          disabled={!isValid}
          onClick={() => onAnswer(transformed.trim(), transformed.trim())}
          style={{ flex: 1 }}
        >
          Continuar →
        </Button>
        {optional && (
          <Button size="sm" variant="ghost" onClick={() => onAnswer(null, '— sin dato —')}>
            Omitir
          </Button>
        )}
      </div>
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
