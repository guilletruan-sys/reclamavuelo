import { tokens } from '../../lib/theme';
import { Badge } from '../ui';

export default function CaseSummary({ caseData }) {
  if (!caseData) return null;
  const { reference, flight, route, date, compensation, passengers } = caseData;
  return (
    <div style={{
      background: tokens.slate50, border: `1px solid ${tokens.slate200}`,
      borderRadius: tokens.r2, padding: tokens.s4, marginBottom: tokens.s5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: tokens.s3, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.slate500, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Tu caso
          </div>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 18, fontWeight: 700, color: tokens.navy900, marginTop: 4 }}>
            {reference || 'RV-pendiente'}
          </div>
          <div style={{ fontSize: 14, color: tokens.slate500, marginTop: 4 }}>
            {flight} · {route} · {date}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge variant="success">Compensación estimada</Badge>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 28, fontWeight: 800, color: tokens.green600, marginTop: 4 }}>
            {compensation}€
          </div>
          <div style={{ fontSize: 12, color: tokens.slate500 }}>× {passengers} pasajero{passengers > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
}
