// components/Footer.jsx
import Link from 'next/link';
import { GREEN, NAVY } from '../lib/theme';

export default function Footer() {
  return (
    <footer style={{ background: NAVY, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 24px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 8 }}>
              Reclama<span style={{ color: GREEN }}>Vuelo</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, maxWidth: 240, lineHeight: 1.6 }}>
              Reclamaciones aéreas bajo el Reglamento CE 261/2004. Sin costes iniciales.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Empresa</div>
              {[
                { label: 'Sobre nosotros',  href: '/sobre-nosotros' },
                { label: 'Cómo funciona',  href: '/#como' },
                { label: 'Contacto',       href: '/contacto' },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 8 }}>
                  <Link href={l.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{l.label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Legal</div>
              {[
                { label: 'Aviso legal',            href: '/aviso-legal' },
                { label: 'Política de privacidad', href: '/privacidad' },
                { label: 'Política de cookies',    href: '/cookies' },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 8 }}>
                  <Link href={l.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{l.label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Contacto</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8 }}>info@reclamavuelo.com</div>
              <Link href="/#form" style={{
                display: 'inline-block', background: GREEN, color: '#fff',
                padding: '8px 18px', borderRadius: 7,
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, marginTop: 4,
              }}>
                Reclamar ahora
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
            © {new Date().getFullYear()} ReclamaVuelo. Todos los derechos reservados.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Reglamento CE 261/2004 · LOPD/RGPD</p>
        </div>
      </div>
    </footer>
  );
}
