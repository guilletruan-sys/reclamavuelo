import { useState } from 'react';
import { tokens } from '../../../lib/theme';
import { Button } from '../../ui';

export default function ConsentPicker({ disabled, answer, onAnswer }) {
  const [rgpd, setRgpd] = useState(false);
  const [terms, setTerms] = useState(false);
  if (disabled) return <ReadOnlyBadge label={answer?.label || '✓ Acepto'} />;

  const ok = rgpd && terms;

  const checkLabel = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: tokens.slate500,
    cursor: 'pointer',
    lineHeight: 1.4,
  };

  return (
    <div style={{ marginTop: tokens.s2, display: 'flex', flexDirection: 'column', gap: tokens.s2 }}>
      <label style={checkLabel}>
        <input
          type="checkbox"
          checked={rgpd}
          onChange={e => setRgpd(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          Acepto la{' '}
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            style={{ color: tokens.green600, textDecoration: 'underline' }}
          >
            política de privacidad
          </a>{' '}
          y el tratamiento de mis datos.
        </span>
      </label>
      <label style={checkLabel}>
        <input
          type="checkbox"
          checked={terms}
          onChange={e => setTerms(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          Entiendo que la comisión es del <b>25% + IVA sobre la compensación obtenida</b>, y solo
          pago si la conseguimos.
        </span>
      </label>
      <Button
        size="sm"
        variant="primary"
        disabled={!ok}
        onClick={() => onAnswer(true, '✓ Acepto las condiciones')}
      >
        Acepto y continúo →
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
