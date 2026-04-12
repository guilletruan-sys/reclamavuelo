import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from './Nav';
import Footer from './Footer';
import { tokens } from '../lib/theme';
import { H1 } from './ui';

// sections: [{ id, title, html }]
export default function LegalPage({ title, updated, sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const onScroll = () => {
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 200) { setActive(s.id); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
        <H1>{title}</H1>
        <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 6 }}>Última actualización: {updated}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: tokens.s7, marginTop: tokens.s6 }} className="legal-grid">
          <aside className="hide-mobile" style={{
            position: 'sticky', top: 96, alignSelf: 'start',
            fontSize: 13, borderLeft: `2px solid ${tokens.slate200}`, paddingLeft: tokens.s3,
          }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{
                display: 'block', padding: '6px 0',
                color: active === s.id ? tokens.green600 : tokens.slate500,
                fontWeight: active === s.id ? 700 : 500,
                transition: 'color 0.15s',
              }}>{s.title}</a>
            ))}
          </aside>

          <article style={{
            fontSize: 16, lineHeight: 1.7, color: tokens.navy700,
          }}>
            {sections.map(s => (
              <section key={s.id} id={s.id} style={{ marginBottom: tokens.s7, scrollMarginTop: 96 }}>
                <h2 style={{
                  fontFamily: tokens.fontHead, fontSize: 24, fontWeight: 700,
                  color: tokens.navy900, marginBottom: tokens.s3, letterSpacing: '-0.02em',
                }}>{s.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}
            <div style={{
              marginTop: tokens.s7, padding: tokens.s4,
              background: tokens.slate50, borderRadius: tokens.r2,
              fontSize: 14, color: tokens.slate500,
            }}>
              ¿Tienes dudas? <Link href="/contacto" style={{ color: tokens.green600, fontWeight: 600 }}>Contáctanos</Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: ${tokens.bpMd}px) {
          .legal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
