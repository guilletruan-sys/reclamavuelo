import { tokens } from '../../lib/theme';
export default function ProgressBar({ step, total = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: tokens.s5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 100,
          background: i < step ? tokens.green500 : tokens.slate200,
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}
