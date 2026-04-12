import Head from 'next/head';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button, H1, H2, Subtitle, Card, Badge } from '../components/ui';

const INCLUDED = [
  'Análisis inicial con IA legal',
  'Gestión extrajudicial con la aerolínea',
  'Gestión judicial al mismo precio',
  'Equipo de abogados colegiados',
  'Sin costes iniciales',
  'Sin letra pequeña',
  'Comunicación transparente del caso',
  'Asesoramiento personalizado',
];

const FAQ = [
  { q: '¿Cuándo cobráis la comisión?', a: 'Solo cuando cobras tu compensación. Si no ganamos, no pagas nada.' },
  { q: '¿El IVA ya está incluido?', a: 'Decimos "25% + IVA" para que sea transparente. En tu liquidación verás exactamente cuánto se aplica.' },
  { q: '¿Y si la aerolínea se niega y hay que ir a juicio?', a: 'Seguimos cobrando lo mismo: 25% + IVA. Nosotros asumimos el riesgo del procedimiento judicial.' },
  { q: '¿Hay algún coste si mi caso no se acepta?', a: 'No. Si el análisis legal indica que no hay reclamación posible, te lo decimos y terminamos ahí.' },
  { q: '¿Cómo comparo vuestro precio con la competencia?', a: 'Muchas plataformas cobran 25-35% en gestión amistosa pero suben a 40-50% si va a juicio. Nosotros mantenemos el 25% siempre.' },
];

export default function Precios() {
  return (
    <>
      <Head><title>Precios — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
          <Badge variant="success">Precio único</Badge>
          <H1 style={{ marginTop: tokens.s3 }}>Una sola cifra. Sin sorpresas.</H1>
          <Subtitle style={{ marginTop: tokens.s3, margin: `${tokens.s3}px auto 0` }}>
            Transparencia total: cobramos el mismo porcentaje tanto si el caso se resuelve amistosamente como si va a juicio.
          </Subtitle>
        </div>

        <Card style={{
          textAlign: 'center', padding: tokens.s7,
          background: tokens.navy900, color: tokens.white, border: 'none',
        }}>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 120, fontWeight: 800, color: tokens.green500, letterSpacing: '-0.04em', lineHeight: 1 }}>
            25%
          </div>
          <div style={{ fontSize: 16, color: tokens.slate300, marginTop: 4 }}>+ IVA sobre la indemnización</div>
          <div style={{ fontSize: 14, color: tokens.slate400, marginTop: tokens.s3 }}>0€ si no ganamos · 0€ iniciales · Mismo precio en juicio</div>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: tokens.s6, textAlign: 'left' }}>
            {INCLUDED.map(i => (
              <li key={i} style={{
                padding: `10px 0`, borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                fontSize: 15, color: tokens.slate300,
              }}>
                <span style={{ color: tokens.green500, fontWeight: 700, fontSize: 18 }}>✓</span> {i}
              </li>
            ))}
          </ul>

          <Button as={Link} href="/#reclamar" variant="primary" size="lg" style={{ marginTop: tokens.s6, width: '100%' }}>
            Empezar reclamación →
          </Button>
        </Card>

        <div style={{ marginTop: tokens.s8 }}>
          <H2>Preguntas sobre precio</H2>
          <div style={{ marginTop: tokens.s5 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                padding: `${tokens.s4}px 0`,
                borderBottom: `1px solid ${tokens.slate200}`,
              }}>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 700, color: tokens.navy900, marginBottom: 6 }}>
                  {item.q}
                </div>
                <div style={{ fontSize: 15, color: tokens.slate500, lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
