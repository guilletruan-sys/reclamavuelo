import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { SERVICES } from '../../lib/services';
import { H2, Card } from '../ui';

export default function Services() {
  return (
    <section id="servicios" style={{
      maxWidth: tokens.maxWidth, margin: '0 auto',
      padding: `${tokens.s8}px ${tokens.s5}px`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
        <H2>Reclamamos cualquier incidencia en tu vuelo</H2>
        <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
          6 tipos de reclamación, un único equipo de abogados.
        </p>
      </div>
      <div className="grid6">
        {SERVICES.map(s => (
          <Link key={s.id} href={`/#reclamar?tipo=${s.id}`} style={{ display: 'block' }}>
            <Card hoverLift style={{ padding: tokens.s5, height: '100%', cursor: 'pointer' }}>
              <div style={{ fontSize: 36, marginBottom: tokens.s3 }}>{s.icon}</div>
              <div style={{
                fontFamily: tokens.fontHead, fontSize: 20, fontWeight: 700,
                color: tokens.navy900, marginBottom: 4,
              }}>{s.title}</div>
              <div style={{ fontSize: 12, color: tokens.green600, fontWeight: 600, marginBottom: tokens.s3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.short}
              </div>
              <div style={{ fontSize: 14, color: tokens.slate500, lineHeight: 1.5 }}>
                {s.description}
              </div>
              <div style={{
                marginTop: tokens.s4, paddingTop: tokens.s3,
                borderTop: `1px solid ${tokens.slate200}`,
                fontSize: 11, color: tokens.slate500, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>{s.regulation}</div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
