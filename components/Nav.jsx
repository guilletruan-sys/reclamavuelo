import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tokens } from '../lib/theme';
import { Button } from './ui';

const LINKS = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/precios', label: 'Precios' },
  { href: '/sobre-nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.85)' : tokens.white,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? tokens.slate200 : 'transparent'}`,
        boxShadow: scrolled ? tokens.shadowSm : 'none',
        transition: 'all 0.2s ease',
      }}>
        <div style={{
          maxWidth: tokens.maxWidth, margin: '0 auto',
          height: 72, padding: `0 ${tokens.s5}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: tokens.fontHead, fontSize: 20, fontWeight: 800,
              color: tokens.navy900, letterSpacing: '-0.02em',
            }}>
              Reclama<span style={{ color: tokens.green500 }}>Vuelo</span>
            </span>
          </Link>

          <nav className="hide-mobile" style={{ display: 'flex', gap: tokens.s5, alignItems: 'center' }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: 14, fontWeight: 500, color: tokens.slate500,
                transition: 'color 0.15s',
              }} onMouseEnter={e => e.currentTarget.style.color = tokens.navy900}
                 onMouseLeave={e => e.currentTarget.style.color = tokens.slate500}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: tokens.s4 }}>
            <a href="tel:+34916379097" style={{
              fontSize: 14, fontWeight: 600, color: tokens.navy900,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>📞</span> 91 637 90 97
            </a>
            <Button as={Link} href="/#reclamar" variant="primary" size="sm">
              Reclamar →
            </Button>
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            style={{
              display: 'none', background: 'transparent', border: 'none',
              fontSize: 24, cursor: 'pointer', color: tokens.navy900,
            }}
            className="show-mobile"
          >☰</button>
        </div>
      </header>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,22,40,0.5)',
        }} onClick={() => setOpen(false)}>
          <aside
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: '80%', maxWidth: 320, background: tokens.white,
              padding: tokens.s5, display: 'flex', flexDirection: 'column', gap: tokens.s4,
            }}
            className="fade-in"
          >
            <button onClick={() => setOpen(false)} style={{
              alignSelf: 'flex-end', background: 'none', border: 'none',
              fontSize: 28, cursor: 'pointer', color: tokens.slate500,
            }}>×</button>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                fontSize: 20, fontWeight: 600, color: tokens.navy900,
                fontFamily: tokens.fontHead, padding: `${tokens.s2}px 0`,
              }}>{l.label}</Link>
            ))}
            <div style={{ borderTop: `1px solid ${tokens.slate200}`, margin: `${tokens.s4}px 0`, paddingTop: tokens.s4 }}>
              <a href="tel:+34916379097" style={{
                display: 'block', fontSize: 16, fontWeight: 600, color: tokens.navy900, marginBottom: 6,
              }}>📞 91 637 90 97</a>
              <a href="tel:+34917152906" style={{
                display: 'block', fontSize: 16, fontWeight: 600, color: tokens.navy900, marginBottom: 6,
              }}>📞 91 715 29 06</a>
              <div style={{ fontSize: 13, color: tokens.slate500, marginBottom: tokens.s4 }}>
                L-V 10-14h · 16-19h
              </div>
              <Button as={Link} href="/#reclamar" variant="primary" size="lg" style={{ width: '100%' }}>
                Reclamar ahora →
              </Button>
            </div>
          </aside>
        </div>
      )}

      <style jsx>{`
        @media (max-width: ${tokens.bpMd}px) {
          .show-mobile { display: inline-block !important; }
        }
      `}</style>
    </>
  );
}
