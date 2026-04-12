import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { Button, Eyebrow, H1, Subtitle, Badge } from '../ui';

export default function Hero() {
  return (
    <section style={{
      background: `linear-gradient(180deg, ${tokens.green50} 0%, ${tokens.white} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: tokens.maxWidth, margin: '0 auto',
        padding: `${tokens.s9}px ${tokens.s5}px ${tokens.s8}px`,
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: tokens.s7, alignItems: 'center',
      }} className="hero-grid">
        <div className="fade-up">
          <Eyebrow>CE 261/2004 · Desde 2017</Eyebrow>
          <H1>
            Hasta <span style={{
              background: `linear-gradient(180deg, transparent 62%, ${tokens.green500}44 62%)`,
            }}>600€</span><br/>
            por tu vuelo<br/>retrasado.
          </H1>
          <Subtitle style={{ marginTop: tokens.s4 }}>
            Analizamos tu caso con IA legal y nuestros abogados lo gestionan. Solo cobramos si ganamos.
          </Subtitle>
          <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s6, flexWrap: 'wrap' }}>
            <Button as={Link} href="#reclamar" variant="dark" size="lg">
              Comprobar mi vuelo gratis →
            </Button>
            <Button as={Link} href="#como-funciona" variant="secondary" size="lg">
              Ver cómo funciona
            </Button>
          </div>
          <div style={{
            display: 'flex', gap: tokens.s4, marginTop: tokens.s5,
            fontSize: 13, color: tokens.slate500, flexWrap: 'wrap',
          }}>
            <span>✓ Sin costes iniciales</span>
            <span>✓ 25% solo si ganamos</span>
            <span>✓ Abogados colegiados</span>
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: 380 }} className="hide-mobile">
          <div className="float" style={{
            position: 'absolute', top: 40, left: '10%', right: '10%',
            background: tokens.white,
            border: `1px solid ${tokens.slate200}`,
            borderRadius: tokens.r3,
            boxShadow: tokens.shadowLg,
            padding: tokens.s5,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.s3 }}>
              <div style={{ fontSize: 11, color: tokens.slate500, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>Análisis del vuelo</div>
              <Badge variant="info">IB2634</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.s3, marginBottom: tokens.s4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 28, fontWeight: 700, color: tokens.navy900 }}>MAD</div>
                <div style={{ fontSize: 12, color: tokens.slate500 }}>Madrid-Barajas</div>
              </div>
              <div style={{ color: tokens.slate400, fontSize: 18 }}>✈</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 28, fontWeight: 700, color: tokens.navy900 }}>BCN</div>
                <div style={{ fontSize: 12, color: tokens.slate500 }}>Barcelona-El Prat</div>
              </div>
            </div>
            <div style={{
              background: tokens.red50, borderRadius: tokens.r1,
              padding: `${tokens.s2}px ${tokens.s3}px`,
              fontSize: 13, fontWeight: 600, color: tokens.red500,
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: tokens.s3,
            }}>⚠ Retraso confirmado: 3h 42min</div>
            <div style={{
              background: tokens.green500, color: tokens.white,
              borderRadius: tokens.r1, padding: tokens.s3,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Reclamable</div>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 32, fontWeight: 800 }}>250€</div>
              </div>
              <div style={{ fontSize: 32 }}>✓</div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: ${tokens.bpMd}px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: ${tokens.s5}px !important; padding: ${tokens.s7}px ${tokens.s4}px !important; }
        }
      `}</style>
    </section>
  );
}
