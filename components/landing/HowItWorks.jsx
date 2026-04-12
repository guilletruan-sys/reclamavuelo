import { tokens } from '../../lib/theme';
import { H2 } from '../ui';

const STEPS = [
  { n: '1', icon: '✏️', title: 'Cuéntanos tu vuelo', text: 'En 2 minutos rellenas un formulario con los datos básicos de tu vuelo.' },
  { n: '2', icon: '🤖', title: 'Analizamos con IA y abogados', text: 'Nuestra IA cruza tu caso con datos reales del vuelo y nuestros abogados validan.' },
  { n: '3', icon: '💸', title: 'Cobras tu compensación', text: 'Gestionamos todo el proceso. Solo cobras si ganamos. Nosotros también.' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ background: tokens.slate50 }}>
      <div style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
          <H2>Cómo funciona</H2>
          <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>Tres pasos. Sin letra pequeña.</p>
        </div>
        <div style={{ position: 'relative' }} className="grid3">
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ position: 'relative', textAlign: 'center', padding: tokens.s4 }}>
              <div style={{
                width: 80, height: 80, borderRadius: tokens.rPill,
                background: tokens.white, border: `2px solid ${tokens.green500}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto', position: 'relative', zIndex: 1,
                boxShadow: tokens.shadowMd,
              }}>{s.icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: tokens.green600,
                letterSpacing: '2px', marginTop: tokens.s3, textTransform: 'uppercase',
              }}>Paso {s.n}</div>
              <div style={{
                fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 700,
                color: tokens.navy900, marginTop: 6,
              }}>{s.title}</div>
              <p style={{
                fontSize: 15, color: tokens.slate500, marginTop: tokens.s2,
                maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5,
              }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
