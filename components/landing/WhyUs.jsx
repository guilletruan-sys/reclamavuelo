import { tokens } from '../../lib/theme';
import { H2, Card } from '../ui';

const REASONS = [
  { icon: '⚡', title: 'IA legal instantánea', text: 'En segundos sabes si tu caso es reclamable según CE 261/2004 y el Convenio de Montreal.' },
  { icon: '⚖️', title: 'Abogados de verdad', text: 'Detrás de la IA hay un equipo de abogados colegiados con 8+ años de experiencia.' },
  { icon: '🛡', title: 'Judicial incluido', text: 'Si la aerolínea se niega, llevamos tu caso al juzgado al mismo precio. Sin sorpresas.' },
  { icon: '💚', title: '0€ si no ganamos', text: 'No adelantas nada. Solo cobramos si conseguimos tu compensación.' },
];

export default function WhyUs() {
  return (
    <section style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
        <H2>¿Por qué ReclamaVuelo?</H2>
        <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
          Cuatro razones por las que no deberías reclamar solo.
        </p>
      </div>
      <div className="grid2" style={{ maxWidth: 900, margin: '0 auto', gap: tokens.s4 }}>
        {REASONS.map(r => (
          <Card key={r.title} hoverLift>
            <div style={{ fontSize: 32, marginBottom: tokens.s3 }}>{r.icon}</div>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 20, fontWeight: 700, color: tokens.navy900, marginBottom: tokens.s2 }}>
              {r.title}
            </div>
            <p style={{ fontSize: 14, color: tokens.slate500, lineHeight: 1.6 }}>{r.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
