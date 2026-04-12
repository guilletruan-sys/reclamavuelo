import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { Button, H2, Card, Badge } from '../ui';

const INCLUDES = [
  'Análisis IA legal instantáneo',
  'Gestión extrajudicial completa',
  'Gestión judicial al mismo precio',
  'Abogados colegiados',
  'Sin costes iniciales',
  'Sin letra pequeña',
];

export default function Pricing() {
  return (
    <section id="precios" style={{ background: tokens.white }}>
      <div style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s6 }}>
          <Badge variant="success">Transparente</Badge>
          <H2 style={{ marginTop: tokens.s3 }}>Solo pagas si ganas</H2>
          <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
            Un único precio. Mismo porcentaje aunque tu caso acabe en juicio.
          </p>
        </div>
        <Card style={{
          maxWidth: 560, margin: '0 auto', padding: tokens.s7,
          textAlign: 'center', background: tokens.navy900, color: tokens.white, border: 'none',
        }}>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 80, fontWeight: 800, color: tokens.green500, letterSpacing: '-0.04em', lineHeight: 1 }}>
            25%
          </div>
          <div style={{ fontSize: 14, color: tokens.slate300, marginTop: 4, fontWeight: 500 }}>+ IVA sobre la indemnización</div>
          <div style={{ fontSize: 13, color: tokens.slate400, marginTop: tokens.s2 }}>Solo cobramos si ganamos. 0€ si perdemos.</div>

          <ul style={{ listStyle: 'none', marginTop: tokens.s6, padding: 0, textAlign: 'left' }}>
            {INCLUDES.map(i => (
              <li key={i} style={{
                padding: `${tokens.s2}px 0`, display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 15, color: tokens.slate300, borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ color: tokens.green500, fontWeight: 700 }}>✓</span> {i}
              </li>
            ))}
          </ul>

          <Button as={Link} href="#reclamar" variant="primary" size="lg" style={{ marginTop: tokens.s6, width: '100%' }}>
            Empezar mi reclamación →
          </Button>
        </Card>
      </div>
    </section>
  );
}
