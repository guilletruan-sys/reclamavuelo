import { tokens } from '../../lib/theme';

const CLAIMS = [
  { icon: '🏛', text: 'Desde 2017' },
  { icon: '⚖️', text: 'Abogados colegiados' },
  { icon: '💰', text: '25% solo si ganamos' },
  { icon: '✓',  text: 'Mismo precio judicial y extrajudicial' },
];

export default function TrustBar() {
  return (
    <div style={{ background: tokens.slate100, borderTop: `1px solid ${tokens.slate200}`, borderBottom: `1px solid ${tokens.slate200}` }}>
      <div style={{
        maxWidth: tokens.maxWidth, margin: '0 auto',
        padding: `${tokens.s4}px ${tokens.s5}px`,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        flexWrap: 'wrap', gap: tokens.s4,
        fontSize: 13, fontWeight: 600, color: tokens.slate500,
      }}>
        {CLAIMS.map(c => (
          <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
