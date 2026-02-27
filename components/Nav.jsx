// components/Nav.jsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GREEN, NAVY } from '../lib/theme';

const LINKS = [
  { label: 'Cómo funciona',  href: '/#como' },
  { label: 'Servicios',      href: '/#servicios' },
  { label: 'Sobre nosotros', href: '/sobre-nosotros' },
  { label: 'Contacto',       href: '/contacto' },
];

export default function Nav() {
  const router = useRouter();

  return (
    <nav style={{
      background: NAVY, padding: '0 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 100, height: 64,
    }}>
      <Link href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>
        Reclama<span style={{ color: GREEN }}>Vuelo</span>
      </Link>

      <div className="hide-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {LINKS.map(l => {
          const active = router.pathname === l.href || router.pathname === l.href.split('#')[0];
          return (
            <Link key={l.href} href={l.href} style={{
              color: active ? GREEN : 'rgba(255,255,255,0.75)',
              fontSize: 14, fontWeight: active ? 600 : 500,
              transition: 'color 0.2s',
            }}>
              {l.label}
            </Link>
          );
        })}
      </div>

      <Link href="/#form" style={{
        background: GREEN, color: '#fff', padding: '9px 20px', borderRadius: 8,
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
      }}>
        Reclamar ahora
      </Link>
    </nav>
  );
}
