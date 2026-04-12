import Head from 'next/head';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button, H1, H2, Subtitle, Card, Eyebrow } from '../components/ui';

const PILLARS = [
  { icon: '🤖', title: 'IA legal propia', text: 'Analizamos cada caso con inteligencia artificial entrenada en CE 261/2004 y el Convenio de Montreal.' },
  { icon: '⚖️', title: 'Abogados colegiados', text: 'Detrás de la IA, un equipo real que lleva tu caso desde la primera gestión hasta el juzgado si hace falta.' },
  { icon: '💚', title: 'Sin costes iniciales', text: 'No pagas nada hasta que cobras. Si no ganamos, no cobramos.' },
];

const STATS = [
  { big: '2017', small: 'Año de fundación' },
  { big: '8+',   small: 'Años defendiendo pasajeros' },
  { big: '6',    small: 'Tipos de incidencia' },
  { big: '25%',  small: 'Comisión única' },
];

export default function SobreNosotros() {
  return (
    <>
      <Head><title>Sobre nosotros — ReclamaVuelo</title></Head>
      <Nav />
      <main>
        <section style={{ maxWidth: 880, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px ${tokens.s6}px` }}>
          <Eyebrow>Desde 2017</Eyebrow>
          <H1>Abogados especializados en derechos del pasajero</H1>
          <Subtitle style={{ marginTop: tokens.s4, fontSize: 19 }}>
            Llevamos ocho años recuperando el dinero que las aerolíneas deben a sus pasajeros. Con un equipo legal humano, y una capa de IA que hace el proceso rápido y transparente.
          </Subtitle>
        </section>

        <section style={{ background: tokens.slate50 }}>
          <div style={{ maxWidth: 880, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
            <H2 style={{ marginBottom: tokens.s5 }}>Cómo trabajamos</H2>
            <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.s4 }}>
              {PILLARS.map(p => (
                <Card key={p.title} hoverLift>
                  <div style={{ fontSize: 32, marginBottom: tokens.s3 }}>{p.icon}</div>
                  <div style={{ fontFamily: tokens.fontHead, fontSize: 19, fontWeight: 700, marginBottom: tokens.s2 }}>{p.title}</div>
                  <p style={{ color: tokens.slate500, fontSize: 14, lineHeight: 1.6 }}>{p.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 880, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.s4 }} className="grid2">
            {STATS.map(s => (
              <div key={s.small} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 56, fontWeight: 800, color: tokens.green600, letterSpacing: '-0.03em' }}>{s.big}</div>
                <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 4, fontWeight: 600 }}>{s.small}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: tokens.green50 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px`, textAlign: 'center' }}>
            <H2>¿Tu vuelo se retrasó o lo cancelaron?</H2>
            <p style={{ color: tokens.slate500, marginTop: tokens.s3, fontSize: 17 }}>Compruébalo gratis en 2 minutos.</p>
            <Button as={Link} href="/#reclamar" variant="primary" size="lg" style={{ marginTop: tokens.s5 }}>
              Empezar reclamación →
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
