import Link from 'next/link';
import { tokens } from '../lib/theme';

const COLS = [
  {
    title: 'Producto',
    links: [
      { href: '/#servicios', label: 'Servicios' },
      { href: '/precios', label: 'Precios' },
      { href: '/#como-funciona', label: 'Cómo funciona' },
      { href: '/#calculadora', label: 'Calculadora' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { href: '/sobre-nosotros', label: 'Sobre nosotros' },
      { href: '/contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/aviso-legal', label: 'Aviso legal' },
      { href: '/privacidad', label: 'Privacidad' },
      { href: '/cookies', label: 'Cookies' },
    ],
  },
];

const linkStyle = {
  display: 'block', color: tokens.slate300, fontSize: 14,
  padding: '4px 0', transition: 'color 0.15s',
};

export default function Footer() {
  return (
    <footer style={{ background: tokens.navy900, color: tokens.slate300, marginTop: tokens.s9 }}>
      <div style={{
        maxWidth: tokens.maxWidth, margin: '0 auto',
        padding: `${tokens.s8}px ${tokens.s5}px ${tokens.s6}px`,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.3fr',
          gap: tokens.s6,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 800,
              color: tokens.white, letterSpacing: '-0.02em',
            }}>
              Reclama<span style={{ color: tokens.green500 }}>Vuelo</span>
            </div>
            <p style={{ fontSize: 13, color: tokens.slate400, marginTop: tokens.s3, lineHeight: 1.6, maxWidth: 260 }}>
              Reclama lo que te deben. Abogados y tecnología al servicio del pasajero desde 2017.
            </p>
            <div style={{ display: 'flex', gap: tokens.s2, marginTop: tokens.s4 }}>
              {['Instagram', 'Facebook', 'Twitter'].map(s => (
                <a key={s} href={`https://${s.toLowerCase()}.com/reclamatuvuelo`} target="_blank" rel="noopener"
                   aria-label={s}
                   style={{
                     width: 36, height: 36, borderRadius: tokens.rPill,
                     background: 'rgba(255,255,255,0.08)', color: tokens.white,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: 14, fontWeight: 600,
                   }}>{s[0]}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: tokens.slate400, marginBottom: tokens.s3,
              }}>{col.title}</div>
              {col.links.map(l => (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ))}
            </div>
          ))}

          {/* Contact */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1.5px', color: tokens.slate400, marginBottom: tokens.s3,
            }}>Contacto</div>
            <a href="tel:+34916379097" style={linkStyle}>📞 91 637 90 97</a>
            <a href="tel:+34917152906" style={linkStyle}>📞 91 715 29 06</a>
            <div style={{ ...linkStyle, cursor: 'default' }}>⏰ L-V 10-14 / 16-19</div>
            <a href="mailto:contacto@reclamatuvuelo.com" style={linkStyle}>✉️ contacto@reclamatuvuelo.com</a>
          </div>
        </div>

        <div style={{
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          marginTop: tokens.s7,
          paddingTop: tokens.s5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: tokens.s3,
          fontSize: 12, color: tokens.slate400,
        }}>
          <div>© {new Date().getFullYear()} ReclamaVuelo · Todos los derechos reservados</div>
          <div>Reclamaciones conforme al Reglamento (CE) 261/2004 y Convenio de Montreal</div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: ${tokens.bpMd}px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: ${tokens.bpSm}px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
