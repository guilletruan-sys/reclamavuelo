import { useState } from 'react';
import { tokens, selectStyle } from '../../../lib/theme';
import { AIRPORTS, AIRPORT_GROUPS } from '../../../lib/airports';
import { Button } from '../../ui';

export default function AirportPicker({ disabled, answer, onAnswer, excludeField, context }) {
  const [val, setVal] = useState('');
  if (disabled) return <ReadOnlyBadge label={answer?.label} />;

  const excluded = excludeField ? context?.[excludeField] : null;
  const selected = AIRPORTS.find(a => a.iata === val);

  return (
    <div style={{ marginTop: tokens.s2, display: 'flex', gap: tokens.s2, flexDirection: 'column' }}>
      <select
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ ...selectStyle, background: tokens.white }}
      >
        <option value="">Selecciona aeropuerto...</option>
        {Object.entries(AIRPORT_GROUPS).map(([region, list]) => (
          <optgroup key={region} label={region}>
            {list
              .filter(a => a.iata !== excluded)
              .map(a => (
                <option key={a.iata} value={a.iata}>
                  {a.iata} — {a.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <Button
        size="sm"
        variant="primary"
        disabled={!val}
        onClick={() => onAnswer(val, `${val} — ${selected?.name || ''}`)}
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
