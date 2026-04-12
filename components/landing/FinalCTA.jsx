import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { Button, H2 } from '../ui';

export default function FinalCTA() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${tokens.green500} 0%, ${tokens.green600} 100%)`,
      color: tokens.white,
    }}>
      <div style={{
        maxWidth: 720, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px`,
        textAlign: 'center',
      }}>
        <H2 style={{ color: tokens.white }}>¿Tu vuelo se retrasó? Compruébalo gratis.</H2>
        <p style={{ fontSize: 17, marginTop: tokens.s3, opacity: 0.9 }}>
          Tardas 2 minutos. Sin compromiso. Solo pagas si ganamos.
        </p>
        <Button as={Link} href="#reclamar" size="lg" style={{
          marginTop: tokens.s5, background: tokens.white, color: tokens.navy900,
        }}>
          Empezar ahora →
        </Button>
      </div>
    </section>
  );
}
