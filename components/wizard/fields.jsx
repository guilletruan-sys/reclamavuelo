import { tokens, inputStyle, selectStyle } from '../../lib/theme';

export function Field({ label, children, hint, error }) {
  return (
    <div style={{ marginBottom: tokens.s4 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: tokens.slate500, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</label>
      {children}
      {hint && !error && <div style={{ fontSize: 12, color: tokens.slate400, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: tokens.red500, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function Input(props) {
  return <input style={inputStyle} {...props} />;
}

export function Select({ children, ...rest }) {
  return <select style={selectStyle} {...rest}>{children}</select>;
}

export function RadioPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value} type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 16px', borderRadius: tokens.rPill,
              border: `1.5px solid ${active ? tokens.green500 : tokens.slate200}`,
              background: active ? tokens.green50 : tokens.white,
              color: active ? tokens.green700 : tokens.slate500,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>{opt.label}</button>
        );
      })}
    </div>
  );
}
