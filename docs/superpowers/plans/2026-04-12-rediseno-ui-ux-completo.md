# ReclamaVuelo — Rediseño UI/UX Completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar completamente el frontend de ReclamaVuelo con un design system moderno tipo Stripe/Linear y ampliar el backend para cubrir los 6 tipos de incidencia de la web live.

**Architecture:** Next.js 14 + React 18 + inline styles centralizados en `lib/theme.js` (sin migración a Tailwind). Se crea un design system de tokens + componentes reutilizables y se reescriben todas las páginas consumiéndolo. El wizard de 5 pasos se condensa a 3. Se extienden `lib/agent.js`, `/api/verify.js`, `lib/validateDocs.js` y `lib/email.js` para equipaje y lesiones.

**Tech Stack:** Next.js 14.2.5, React 18, Anthropic SDK 0.24.0 (Claude Sonnet + Vision), Resend 6.9.2, FlightStats/Cirium, AviationStack, NOAA METAR, FormSubmit, Google Fonts (Space Grotesk + Inter).

**Ref spec:** `docs/superpowers/specs/2026-04-12-rediseno-ui-ux-completo-design.md`

---

## Conventions

- **Working directory:** `/Users/guille/Downloads/reclamavuelo ` (nota el espacio al final)
- **Dev server:** `npm run dev` → http://localhost:3000
- **Verification loop for UI tasks:** implement → save → browser reload → visual check → commit
- **Commits:** uno por tarea, mensaje en español, prefijo `feat:`, `refactor:`, `style:`, `fix:`
- **All JSX:** inline styles desde `lib/theme.js`, nunca className salvo utilidades globales ya definidas (`fade-up`, `grid2`, `grid3`, `hide-mobile`)
- **Colors:** siempre desde tokens (`tokens.navy900`, nunca hex literals en JSX)
- **Never break existing API contracts** de `/api/verify` o `/api/upload-docs` (solo se extienden)

---

# FASE 1 — Design System Foundation

Esta fase crea los cimientos que usará todo lo demás. Nada es visible al usuario todavía.

## Task 1: Configurar Google Fonts (Space Grotesk + Inter)

**Files:**
- Create: `pages/_document.js`

- [ ] **Step 1: Crear `pages/_document.js`**

```javascript
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0a1628" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

- [ ] **Step 2: Verificar en navegador**

Run: `npm run dev`
Abrir http://localhost:3000 → DevTools → Network → verificar que carga `fonts.googleapis.com/css2?family=Inter...`. Las fuentes todavía no aplican porque no se usan en `theme.js` aún — ese es el siguiente task.

- [ ] **Step 3: Commit**

```bash
git add pages/_document.js
git commit -m "feat: cargar Space Grotesk e Inter desde Google Fonts"
```

---

## Task 2: Reescribir `lib/theme.js` con design tokens completos

**Files:**
- Modify: `lib/theme.js` (reescritura completa, ~200 líneas)

- [ ] **Step 1: Reemplazar contenido de `lib/theme.js`**

```javascript
// lib/theme.js — Design system: tokens + componentes reutilizables

export const tokens = {
  // Colors
  navy900:  '#0a1628',
  navy700:  '#1e293b',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50:  '#f8fafc',
  white:    '#ffffff',
  green700: '#047857',
  green600: '#059669',
  green500: '#10b981',
  green100: '#d1fae5',
  green50:  '#f0fdf4',
  red500:   '#ef4444',
  red50:    '#fef2f2',
  amber500: '#f59e0b',
  amber50:  '#fffbeb',

  // Spacing (px)
  s1: 4,  s2: 8,  s3: 12, s4: 16, s5: 24, s6: 32, s7: 48, s8: 64, s9: 96, s10: 128,

  // Radii
  r1: 8, r2: 12, r3: 16, rPill: 100,

  // Shadows
  shadowSm: '0 1px 2px rgba(10,22,40,0.04)',
  shadowMd: '0 4px 16px rgba(10,22,40,0.08)',
  shadowLg: '0 20px 60px rgba(10,22,40,0.12)',

  // Type
  fontHead: '"Space Grotesk", -apple-system, sans-serif',
  fontBody: '"Inter", -apple-system, sans-serif',

  // Breakpoints
  bpSm: 600, bpMd: 900, bpLg: 1200,

  // Max widths
  maxWidth: 1200,
};

// Back-compat aliases (no romper código legacy durante la migración)
export const GREEN   = tokens.green500;
export const NAVY    = tokens.navy900;
export const BLUE    = '#1a56db';
export const LIGHT_G = 'rgba(16,185,129,0.08)';

// ---------- Components as style objects ----------

export const buttonStyles = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', cursor: 'pointer', fontFamily: tokens.fontBody, fontWeight: 600,
    borderRadius: tokens.r1, transition: 'all 0.2s ease', textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  sizes: {
    sm: { fontSize: 13, padding: '8px 14px' },
    md: { fontSize: 15, padding: '12px 20px' },
    lg: { fontSize: 16, padding: '16px 28px' },
  },
  variants: {
    primary:   { background: tokens.green500, color: tokens.white, boxShadow: tokens.shadowSm },
    secondary: { background: tokens.white, color: tokens.navy900, border: `1.5px solid ${tokens.slate200}` },
    ghost:     { background: 'transparent', color: tokens.navy900 },
    dark:      { background: tokens.navy900, color: tokens.white },
  },
};

export function btn(variant = 'primary', size = 'md', extra = {}) {
  return { ...buttonStyles.base, ...buttonStyles.sizes[size], ...buttonStyles.variants[variant], ...extra };
}

export const inputStyle = {
  padding: '14px 16px',
  border: `1.5px solid ${tokens.slate200}`,
  borderRadius: tokens.r1,
  fontSize: 15,
  fontFamily: tokens.fontBody,
  color: tokens.navy900,
  background: tokens.white,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' };

export const cardStyle = {
  background: tokens.white,
  border: `1px solid ${tokens.slate200}`,
  borderRadius: tokens.r2,
  boxShadow: tokens.shadowSm,
  padding: tokens.s5,
};

export const sectionStyle = {
  maxWidth: tokens.maxWidth,
  margin: '0 auto',
  padding: `${tokens.s8}px ${tokens.s5}px`,
};

// Badge
export const badgeStyles = {
  base: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: tokens.rPill,
    fontSize: 11, fontWeight: 700, fontFamily: tokens.fontBody,
    letterSpacing: '0.3px',
  },
  variants: {
    success: { background: tokens.green100, color: tokens.green700 },
    info:    { background: '#dbeafe',       color: '#1e40af' },
    warning: { background: tokens.amber50,  color: tokens.amber500 },
    danger:  { background: tokens.red50,    color: tokens.red500 },
    neutral: { background: tokens.slate100, color: tokens.slate500 },
  },
};

export function badge(variant = 'neutral') {
  return { ...badgeStyles.base, ...badgeStyles.variants[variant] };
}

// Global CSS (injected once via a <style> tag in _app or page)
export const globalStyles = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${tokens.fontBody};
    background: ${tokens.white};
    color: ${tokens.navy900};
    -webkit-font-smoothing: antialiased;
    font-feature-settings: "cv02","cv03","cv04","cv11";
  }
  h1, h2, h3, h4, h5, h6 { font-family: ${tokens.fontHead}; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
  a { text-decoration: none; color: inherit; }
  button { font-family: inherit; }
  input, select, textarea { font-family: inherit; }
  input:focus, select:focus, textarea:focus {
    border-color: ${tokens.green500} !important;
    box-shadow: 0 0 0 4px ${tokens.green500}22 !important;
  }

  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(-2deg); } }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .fade-in { animation: fadeIn 0.4s ease both; }
  .float { animation: float 4s ease-in-out infinite; }

  .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
  .hover-lift:hover { transform: translateY(-4px); box-shadow: ${tokens.shadowLg}; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: ${tokens.s5}px; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: ${tokens.s5}px; }
  .grid6 { display: grid; grid-template-columns: repeat(3, 1fr); gap: ${tokens.s4}px; }

  @media (max-width: ${tokens.bpMd}px) {
    .grid2, .grid3, .grid6 { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
    .stack-mobile { flex-direction: column !important; }
    h1 { font-size: 2.25rem !important; }
    h2 { font-size: 1.75rem !important; }
  }
  @media (min-width: ${tokens.bpMd + 1}px) and (max-width: ${tokens.bpLg}px) {
    .grid6 { grid-template-columns: repeat(2, 1fr); }
  }
`;
```

- [ ] **Step 2: Verificar que compila y que los aliases back-compat mantienen la app funcionando**

Run: `npm run dev`
Abrir http://localhost:3000 → la landing actual debe seguir renderizando sin errores (porque mantenemos `GREEN`, `NAVY`, `BLUE`, `LIGHT_G`, `inputStyle`, `selectStyle`, `globalStyles`).

- [ ] **Step 3: Commit**

```bash
git add lib/theme.js
git commit -m "refactor: design system tokens + componentes en theme.js"
```

---

## Task 3: Crear helper de componentes React para Button, Card, Badge

**Files:**
- Create: `components/ui.jsx`

- [ ] **Step 1: Crear `components/ui.jsx`**

```javascript
// components/ui.jsx — componentes React reutilizables del design system
import { tokens, btn as btnStyle, badge as badgeStyle, cardStyle } from '../lib/theme';

export function Button({ variant = 'primary', size = 'md', as: As = 'button', children, style, ...rest }) {
  return (
    <As style={{ ...btnStyle(variant, size), ...style }} {...rest}>
      {children}
    </As>
  );
}

export function Card({ children, style, hoverLift = false, className = '', ...rest }) {
  return (
    <div
      className={hoverLift ? `hover-lift ${className}`.trim() : className}
      style={{ ...cardStyle, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Badge({ variant = 'neutral', children, style }) {
  return <span style={{ ...badgeStyle(variant), ...style }}>{children}</span>;
}

export function Section({ children, bg, style }) {
  return (
    <section style={{ background: bg || 'transparent', width: '100%' }}>
      <div style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px`, ...style }}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, color = tokens.green600 }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '1.5px',
      textTransform: 'uppercase', color, marginBottom: tokens.s3,
    }}>{children}</div>
  );
}

export function H1({ children, style }) {
  return (
    <h1 style={{
      fontFamily: tokens.fontHead, fontSize: 'clamp(36px, 5vw, 64px)',
      fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05,
      color: tokens.navy900, ...style,
    }}>{children}</h1>
  );
}

export function H2({ children, style }) {
  return (
    <h2 style={{
      fontFamily: tokens.fontHead, fontSize: 'clamp(28px, 3.5vw, 44px)',
      fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1,
      color: tokens.navy900, ...style,
    }}>{children}</h2>
  );
}

export function Subtitle({ children, style }) {
  return (
    <p style={{
      fontSize: 17, lineHeight: 1.6, color: tokens.slate500,
      maxWidth: 560, ...style,
    }}>{children}</p>
  );
}
```

- [ ] **Step 2: Verificar que no rompe nada**

Run: `npm run dev`
Abrir http://localhost:3000 → la app sigue funcionando. `components/ui.jsx` aún no se usa pero debe importar limpio.

Run en consola del navegador: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/ui.jsx
git commit -m "feat: componentes UI reutilizables (Button, Card, Badge, Section, Eyebrow, H1, H2, Subtitle)"
```

---

## Task 4: Inyectar globalStyles en toda la app vía `_app.js`

**Files:**
- Create: `pages/_app.js` (si no existe) o Modify existing

- [ ] **Step 1: Comprobar si `pages/_app.js` existe**

Run: `ls pages/_app.js 2>/dev/null && echo EXISTS || echo MISSING`

- [ ] **Step 2: Crear/reemplazar `pages/_app.js`**

```javascript
import { globalStyles } from '../lib/theme';

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`${globalStyles}`}</style>
      <Component {...pageProps} />
    </>
  );
}
```

- [ ] **Step 3: Eliminar cualquier inyección duplicada de `globalStyles` en páginas existentes**

Run: `grep -rn "globalStyles" pages/ --include="*.jsx" --include="*.js"`
Para cada hit en un archivo que no sea `_app.js`, eliminar el `<style>` que inyecta `globalStyles` (los dejaremos en `_app.js` solo). Si una página también añade sus propios estilos globales, preservarlos en su propio `<style jsx global>`.

- [ ] **Step 4: Verificar en navegador**

Run: `npm run dev` y visitar `/`, `/sobre-nosotros`, `/contacto`, `/aviso-legal`, `/privacidad`, `/cookies`, `/aportar-documentos` → todas deben renderizar con body en Inter y headings en Space Grotesk.

- [ ] **Step 5: Commit**

```bash
git add pages/_app.js pages/*.jsx
git commit -m "refactor: centralizar globalStyles en _app.js"
```

---

# FASE 2 — Nav y Footer

Estos componentes aparecen en todas las páginas — se rediseñan ahora para que las páginas que escribamos después ya los consuman nuevos.

## Task 5: Rediseñar `components/Nav.jsx`

**Files:**
- Modify: `components/Nav.jsx` (reescritura completa)

- [ ] **Step 1: Reescribir el componente completo**

```javascript
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

          {/* Mobile burger */}
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

      {/* Mobile drawer */}
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
```

- [ ] **Step 2: Verificar en navegador en 3 tamaños**

Run: `npm run dev`
- http://localhost:3000 con viewport 1200px: nav completo visible, glass effect al scrollear
- 900px: se oculta y aparece burger
- Click burger → drawer desliza desde derecha con overlay

- [ ] **Step 3: Commit**

```bash
git add components/Nav.jsx
git commit -m "feat: nav sticky con glass effect, mega-links y drawer mobile"
```

---

## Task 6: Rediseñar `components/Footer.jsx`

**Files:**
- Modify: `components/Footer.jsx` (reescritura completa)

- [ ] **Step 1: Reescribir**

```javascript
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
```

- [ ] **Step 2: Verificar en desktop y mobile**

Run: `npm run dev` → http://localhost:3000 → scroll al final, footer navy, 5 columnas desktop, 2 cols tablet, 1 col mobile.

- [ ] **Step 3: Commit**

```bash
git add components/Footer.jsx
git commit -m "feat: footer 5 columnas con contacto real y brand"
```

---

# FASE 3 — Landing page

Reescritura completa de `pages/index.jsx`. Como el archivo es gigante (891 líneas actualmente con todo mezclado landing+wizard), vamos a separarlo:
- `pages/index.jsx` — solo landing
- `components/wizard/*.jsx` — el wizard (Fase 4)

Esta fase solo escribe la landing; el wizard queda temporalmente en un stub hasta Fase 4.

## Task 7: Crear skeleton de `pages/index.jsx` con solo landing (sin wizard)

**Files:**
- Modify: `pages/index.jsx` (reescritura completa — guardamos el original temporalmente)

- [ ] **Step 1: Backup del original**

Run: `cp pages/index.jsx pages/index.legacy.jsx.bak`

El backup es temporal, lo borramos al final de la Fase 4.

- [ ] **Step 2: Reescribir `pages/index.jsx` con estructura de landing**

Este task crea el esqueleto con todas las secciones importadas de componentes que iremos creando en los tasks siguientes. Cada sección vive en su propio archivo en `components/landing/`.

```javascript
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Hero from '../components/landing/Hero';
import TrustBar from '../components/landing/TrustBar';
import Services from '../components/landing/Services';
import HowItWorks from '../components/landing/HowItWorks';
import Calculator from '../components/landing/Calculator';
import Pricing from '../components/landing/Pricing';
import WhyUs from '../components/landing/WhyUs';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
// Wizard entry — en Fase 4 se reemplaza por el wizard real
import WizardStub from '../components/landing/WizardStub';

export default function Home() {
  return (
    <>
      <Head>
        <title>ReclamaVuelo — Reclama hasta 600€ por tu vuelo retrasado</title>
        <meta name="description" content="Abogados y tecnología al servicio del pasajero desde 2017. Solo cobramos si ganamos. Analizamos tu caso con IA en 2 minutos." />
      </Head>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <Calculator />
        <WizardStub />
        <Pricing />
        <WhyUs />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Crear stubs temporales para que compile**

Create `components/landing/Hero.jsx`:
```javascript
export default function Hero() { return <div style={{padding:80,textAlign:'center'}}>Hero (Task 8)</div>; }
```
Create los otros 9 archivos (`TrustBar.jsx`, `Services.jsx`, `HowItWorks.jsx`, `Calculator.jsx`, `Pricing.jsx`, `WhyUs.jsx`, `FAQ.jsx`, `FinalCTA.jsx`, `WizardStub.jsx`) cada uno con `export default function X() { return <div style={{padding:40,textAlign:'center',background:'#f1f5f9'}}>X (pending)</div>; }`

- [ ] **Step 4: Verificar que compila y se ven 10 stubs apilados**

Run: `npm run dev` → http://localhost:3000 → Nav + 10 stubs + Footer.

- [ ] **Step 5: Commit**

```bash
git add pages/index.jsx components/landing/
git commit -m "refactor: landing page esqueleto con secciones como componentes"
```

---

## Task 8: Implementar `Hero.jsx` (split + preview animado)

**Files:**
- Modify: `components/landing/Hero.jsx`

- [ ] **Step 1: Reescribir Hero**

```javascript
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
```

- [ ] **Step 2: Verificar**

http://localhost:3000 → hero con split, preview card flota a la derecha. Mobile <900px: texto arriba, card oculta.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Hero.jsx
git commit -m "feat: hero split con preview animado del producto"
```

---

## Task 9: Implementar `TrustBar.jsx`

**Files:**
- Modify: `components/landing/TrustBar.jsx`

- [ ] **Step 1: Escribir**

```javascript
import { tokens } from '../../lib/theme';

const CLAIMS = [
  { icon: '🏛', text: 'Desde 2017' },
  { icon: '⚖️', text: 'Abogados colegiados' },
  { icon: '💰', text: '25% solo si ganamos' },
  { icon: '✓',  text: 'Mismo precio judicial y extrajudicial' },
];

export default function TrustBar() {
  return (
    <div style={{ background: tokens.slate100, borderTop: `1px solid ${tokens.slate200}`, borderBottom: `1px solid ${tokens.slate200}` }}>
      <div style={{
        maxWidth: tokens.maxWidth, margin: '0 auto',
        padding: `${tokens.s4}px ${tokens.s5}px`,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        flexWrap: 'wrap', gap: tokens.s4,
        fontSize: 13, fontWeight: 600, color: tokens.slate500,
      }}>
        {CLAIMS.map(c => (
          <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            <span>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar → refresh browser.**

- [ ] **Step 3: Commit**

```bash
git add components/landing/TrustBar.jsx
git commit -m "feat: trust bar con 4 claims reales"
```

---

## Task 10: Implementar `Services.jsx` (grid 3×2 de 6 tipos)

**Files:**
- Modify: `components/landing/Services.jsx`
- Create: `lib/services.js` (datos compartidos de los 6 tipos)

- [ ] **Step 1: Crear `lib/services.js`**

```javascript
// lib/services.js — catálogo único de los 6 tipos de incidencia, consumido
// por la landing, el wizard y el backend.

export const SERVICES = [
  {
    id: 'retraso',
    icon: '⏱',
    title: 'Retraso',
    short: '+3h en destino',
    description: 'Llegaste con más de 3 horas de retraso. Hasta 600€.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'cancelacion',
    icon: '🚫',
    title: 'Cancelación',
    short: 'Sin aviso previo',
    description: 'Te cancelaron el vuelo con menos de 14 días de aviso. Hasta 600€.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'conexion',
    icon: '🔄',
    title: 'Conexión perdida',
    short: 'Mismo billete',
    description: 'Perdiste un enlace del mismo billete y llegaste tarde.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'overbooking',
    icon: '🎫',
    title: 'Overbooking',
    short: 'Denegación embarque',
    description: 'Te denegaron el embarque por sobreventa. Compensación garantizada.',
    regulation: 'CE 261/2004',
    maxAmount: 600,
  },
  {
    id: 'equipaje',
    icon: '🧳',
    title: 'Equipaje',
    short: 'Perdido o dañado',
    description: 'Tu equipaje llegó tarde, dañado o nunca apareció. Hasta 1.600€.',
    regulation: 'Convenio de Montreal',
    maxAmount: 1600,
  },
  {
    id: 'lesiones',
    icon: '🩹',
    title: 'Lesiones a bordo',
    short: 'Durante el vuelo',
    description: 'Sufriste una lesión durante el vuelo o al embarcar.',
    regulation: 'Convenio de Montreal',
    maxAmount: null, // varía mucho, REVISAR_MANUALMENTE
  },
];

export function getService(id) {
  return SERVICES.find(s => s.id === id);
}
```

- [ ] **Step 2: Escribir `Services.jsx`**

```javascript
import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { SERVICES } from '../../lib/services';
import { H2, Card } from '../ui';

export default function Services() {
  return (
    <section id="servicios" style={{
      maxWidth: tokens.maxWidth, margin: '0 auto',
      padding: `${tokens.s8}px ${tokens.s5}px`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
        <H2>Reclamamos cualquier incidencia en tu vuelo</H2>
        <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
          6 tipos de reclamación, un único equipo de abogados.
        </p>
      </div>
      <div className="grid6">
        {SERVICES.map(s => (
          <Link key={s.id} href={`/#reclamar?tipo=${s.id}`} style={{ display: 'block' }}>
            <Card hoverLift style={{ padding: tokens.s5, height: '100%', cursor: 'pointer' }}>
              <div style={{ fontSize: 36, marginBottom: tokens.s3 }}>{s.icon}</div>
              <div style={{
                fontFamily: tokens.fontHead, fontSize: 20, fontWeight: 700,
                color: tokens.navy900, marginBottom: 4,
              }}>{s.title}</div>
              <div style={{ fontSize: 12, color: tokens.green600, fontWeight: 600, marginBottom: tokens.s3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.short}
              </div>
              <div style={{ fontSize: 14, color: tokens.slate500, lineHeight: 1.5 }}>
                {s.description}
              </div>
              <div style={{
                marginTop: tokens.s4, paddingTop: tokens.s3,
                borderTop: `1px solid ${tokens.slate200}`,
                fontSize: 11, color: tokens.slate500, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>{s.regulation}</div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar que renderiza 6 cards**

http://localhost:3000 → grid 3×2 en desktop, 2 cols en tablet, 1 col mobile. Hover lift funciona.

- [ ] **Step 4: Commit**

```bash
git add lib/services.js components/landing/Services.jsx
git commit -m "feat: servicios 3x2 con catalogo central de 6 tipos"
```

---

## Task 11: Implementar `HowItWorks.jsx`

**Files:**
- Modify: `components/landing/HowItWorks.jsx`

- [ ] **Step 1: Escribir**

```javascript
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
```

- [ ] **Step 2: Verificar**

- [ ] **Step 3: Commit**

```bash
git add components/landing/HowItWorks.jsx
git commit -m "feat: seccion como funciona en 3 pasos"
```

---

## Task 12: Implementar `Calculator.jsx` interactivo

**Files:**
- Modify: `components/landing/Calculator.jsx`
- Create: `lib/distance.js`

- [ ] **Step 1: Crear `lib/distance.js` con Haversine y tramos CE 261**

```javascript
// lib/distance.js — calculo distancia y compensacion CE 261/2004

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function compensationForKm(km) {
  if (km <= 1500) return 250;
  if (km <= 3500) return 400;
  return 600;
}

// Lista reducida de aeropuertos con coordenadas para la calculadora de landing.
// (El AirportSelect del wizard usa la lista completa existente)
export const POPULAR_AIRPORTS = [
  { code: 'MAD', name: 'Madrid',     lat: 40.472, lon: -3.561 },
  { code: 'BCN', name: 'Barcelona',  lat: 41.297, lon: 2.078 },
  { code: 'PMI', name: 'Palma',      lat: 39.551, lon: 2.739 },
  { code: 'AGP', name: 'Málaga',     lat: 36.675, lon: -4.499 },
  { code: 'VLC', name: 'Valencia',   lat: 39.489, lon: -0.481 },
  { code: 'SVQ', name: 'Sevilla',    lat: 37.418, lon: -5.893 },
  { code: 'BIO', name: 'Bilbao',     lat: 43.301, lon: -2.911 },
  { code: 'LHR', name: 'Londres',    lat: 51.470, lon: -0.454 },
  { code: 'CDG', name: 'París',      lat: 49.012, lon: 2.550 },
  { code: 'FRA', name: 'Frankfurt',  lat: 50.033, lon: 8.570 },
  { code: 'AMS', name: 'Ámsterdam',  lat: 52.308, lon: 4.763 },
  { code: 'FCO', name: 'Roma',       lat: 41.800, lon: 12.238 },
  { code: 'JFK', name: 'Nueva York', lat: 40.641, lon: -73.778 },
  { code: 'EZE', name: 'Buenos Aires', lat: -34.822, lon: -58.535 },
];
```

- [ ] **Step 2: Escribir `Calculator.jsx`**

```javascript
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { tokens, selectStyle } from '../../lib/theme';
import { POPULAR_AIRPORTS, haversine, compensationForKm } from '../../lib/distance';
import { Button, H2, Card, Badge } from '../ui';

export default function Calculator() {
  const [from, setFrom] = useState('MAD');
  const [to, setTo] = useState('LHR');

  const { km, amount } = useMemo(() => {
    const a = POPULAR_AIRPORTS.find(x => x.code === from);
    const b = POPULAR_AIRPORTS.find(x => x.code === to);
    if (!a || !b || a.code === b.code) return { km: 0, amount: 0 };
    const k = haversine(a.lat, a.lon, b.lat, b.lon);
    return { km: k, amount: compensationForKm(k) };
  }, [from, to]);

  return (
    <section id="calculadora" style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{ textAlign: 'center', marginBottom: tokens.s6 }}>
        <H2>¿Cuánto te correspondería?</H2>
        <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
          Calcula tu compensación estimada según la distancia del vuelo.
        </p>
      </div>
      <Card style={{
        maxWidth: 760, margin: '0 auto', padding: tokens.s6,
        background: `linear-gradient(135deg, ${tokens.green50} 0%, ${tokens.white} 100%)`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s4 }} className="grid2">
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: tokens.slate500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Origen</label>
            <select value={from} onChange={e => setFrom(e.target.value)} style={{ ...selectStyle, marginTop: 6 }}>
              {POPULAR_AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: tokens.slate500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Destino</label>
            <select value={to} onChange={e => setTo(e.target.value)} style={{ ...selectStyle, marginTop: 6 }}>
              {POPULAR_AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{
          marginTop: tokens.s5, padding: tokens.s5, borderRadius: tokens.r2,
          background: tokens.white, border: `1px solid ${tokens.slate200}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: tokens.s3,
        }}>
          <div>
            <Badge variant="info">{km.toLocaleString('es-ES')} km</Badge>
            <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 6 }}>
              {km <= 1500 ? 'Corto recorrido (≤1.500 km)' : km <= 3500 ? 'Medio recorrido (1.500–3.500 km)' : 'Largo recorrido (>3.500 km)'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: tokens.slate500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Te corresponderían</div>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 44, fontWeight: 800, color: tokens.green600, lineHeight: 1 }}>
              {amount}€
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: tokens.s5 }}>
          <Button as={Link} href="#reclamar" variant="primary" size="lg">Reclamar mi vuelo →</Button>
          <div style={{ fontSize: 12, color: tokens.slate500, marginTop: tokens.s2 }}>
            * Importes estimados. La cifra final depende de causas del retraso y documentación aportada.
          </div>
        </div>
      </Card>
    </section>
  );
}
```

- [ ] **Step 3: Verificar que cambia el importe al cambiar selects**

- [ ] **Step 4: Commit**

```bash
git add lib/distance.js components/landing/Calculator.jsx
git commit -m "feat: calculadora interactiva CE 261/2004 con Haversine"
```

---

## Task 13: Implementar `Pricing.jsx`

**Files:**
- Modify: `components/landing/Pricing.jsx`

- [ ] **Step 1: Escribir**

```javascript
import Link from 'next/link';
import { tokens } from '../../lib/theme';
import { Button, H2, Card, Badge } from '../ui';

const INCLUDES = [
  'Análisis IA legal instantáneo',
  'Gestión extrajudicial completa',
  'Gestión judicial al mismo precio',
  'Abogados colegiados',
  'Sin costes iniciales',
  'Sin letra pequeña',
];

export default function Pricing() {
  return (
    <section id="precios" style={{ background: tokens.white }}>
      <div style={{ maxWidth: tokens.maxWidth, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s6 }}>
          <Badge variant="success">Transparente</Badge>
          <H2 style={{ marginTop: tokens.s3 }}>Solo pagas si ganas</H2>
          <p style={{ fontSize: 17, color: tokens.slate500, marginTop: tokens.s3 }}>
            Un único precio. Mismo porcentaje aunque tu caso acabe en juicio.
          </p>
        </div>
        <Card style={{
          maxWidth: 560, margin: '0 auto', padding: tokens.s7,
          textAlign: 'center', background: tokens.navy900, color: tokens.white, border: 'none',
        }}>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 80, fontWeight: 800, color: tokens.green500, letterSpacing: '-0.04em', lineHeight: 1 }}>
            25%
          </div>
          <div style={{ fontSize: 14, color: tokens.slate300, marginTop: 4, fontWeight: 500 }}>+ IVA sobre la indemnización</div>
          <div style={{ fontSize: 13, color: tokens.slate400, marginTop: tokens.s2 }}>Solo cobramos si ganamos. 0€ si perdemos.</div>

          <ul style={{ listStyle: 'none', marginTop: tokens.s6, padding: 0, textAlign: 'left' }}>
            {INCLUDES.map(i => (
              <li key={i} style={{
                padding: `${tokens.s2}px 0`, display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 15, color: tokens.slate300, borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ color: tokens.green500, fontWeight: 700 }}>✓</span> {i}
              </li>
            ))}
          </ul>

          <Button as={Link} href="#reclamar" variant="primary" size="lg" style={{ marginTop: tokens.s6, width: '100%' }}>
            Empezar mi reclamación →
          </Button>
        </Card>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar**
- [ ] **Step 3: Commit**

```bash
git add components/landing/Pricing.jsx
git commit -m "feat: seccion precios navy con card destacada"
```

---

## Task 14: Implementar `WhyUs.jsx`

**Files:**
- Modify: `components/landing/WhyUs.jsx`

- [ ] **Step 1: Escribir**

```javascript
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
```

- [ ] **Step 2: Verificar**
- [ ] **Step 3: Commit**

```bash
git add components/landing/WhyUs.jsx
git commit -m "feat: seccion por que nosotros con 4 razones"
```

---

## Task 15: Implementar `FAQ.jsx` con accordion

**Files:**
- Modify: `components/landing/FAQ.jsx`

- [ ] **Step 1: Escribir**

```javascript
import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { H2 } from '../ui';

const ITEMS = [
  { q: '¿Cuánto tarda el proceso?', a: 'La respuesta inicial de la aerolínea llega en 2-4 semanas. Si acepta, cobras en 4-8 semanas. Si va a juicio, puede extenderse 6-12 meses, pero nosotros lo gestionamos todo.' },
  { q: '¿Y si perdemos el caso?', a: 'No pagas nada. Cero. Solo cobramos el 25% + IVA si conseguimos tu compensación.' },
  { q: '¿Qué aerolíneas cubren CE 261/2004?', a: 'Todas las que despeguen desde un aeropuerto de la UE, o que aterricen en la UE si son compañías con sede europea.' },
  { q: '¿Qué documentos necesito?', a: 'DNI, tarjeta de embarque, confirmación de reserva e IBAN. Si el caso es equipaje añade PIR y facturas; si es lesión, parte médico.' },
  { q: '¿Puedo reclamar vuelos antiguos?', a: 'Sí. En España tienes hasta 5 años desde el vuelo para reclamar. En otros países puede variar (3-10 años).' },
  { q: '¿Por qué cobráis lo mismo si va a juicio?', a: 'Porque creemos que un cliente no debería pagar más por defender su derecho. Otras plataformas suben al 40-50% en juicio; nosotros no.' },
  { q: '¿Cómo funciona la IA legal?', a: 'Analiza el estado real del vuelo, la meteorología, la regulación aplicable y las circunstancias específicas de tu caso. Luego un abogado revisa la recomendación antes de actuar.' },
  { q: '¿Mis datos están seguros?', a: 'Sí. Cumplimos GDPR y ciframos todos los documentos. Solo nuestros abogados ven tu información, nunca se comparte con terceros salvo para la reclamación.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: tokens.slate50 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
          <H2>Preguntas frecuentes</H2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.s2 }}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                background: tokens.white, borderRadius: tokens.r2,
                border: `1px solid ${tokens.slate200}`,
                boxShadow: tokens.shadowSm, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%', textAlign: 'left', padding: tokens.s4,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: tokens.s3,
                    fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 600, color: tokens.navy900,
                  }}>
                  <span>{item.q}</span>
                  <span style={{
                    fontSize: 20, color: tokens.green500,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}>+</span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: `0 ${tokens.s4}px ${tokens.s4}px`,
                    fontSize: 15, lineHeight: 1.6, color: tokens.slate500,
                  }} className="fade-in">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar accordion abre/cierra**
- [ ] **Step 3: Commit**

```bash
git add components/landing/FAQ.jsx
git commit -m "feat: FAQ accordion con 8 preguntas clave"
```

---

## Task 16: Implementar `FinalCTA.jsx`

**Files:**
- Modify: `components/landing/FinalCTA.jsx`

- [ ] **Step 1: Escribir**

```javascript
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
```

- [ ] **Step 2: Verificar**
- [ ] **Step 3: Commit**

```bash
git add components/landing/FinalCTA.jsx
git commit -m "feat: CTA final verde con gradiente"
```

---

# FASE 4 — Wizard de reclamación

El wizard se extrae del legacy monolítico a `components/wizard/` como componente independiente consumido por `index.jsx` en la sección `#reclamar`.

## Task 17: Crear estructura de archivos del wizard

**Files:**
- Create: `components/wizard/Wizard.jsx` (container principal)
- Create: `components/wizard/Step1Type.jsx`
- Create: `components/wizard/Step2Flight.jsx`
- Create: `components/wizard/Step3Contact.jsx`
- Create: `components/wizard/Result.jsx`
- Create: `components/wizard/ProgressBar.jsx`

- [ ] **Step 1: Crear los 6 archivos como stubs funcionales**

`components/wizard/ProgressBar.jsx`:
```javascript
import { tokens } from '../../lib/theme';
export default function ProgressBar({ step, total = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: tokens.s5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 100,
          background: i < step ? tokens.green500 : tokens.slate200,
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}
```

`components/wizard/Wizard.jsx`:
```javascript
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { tokens } from '../../lib/theme';
import ProgressBar from './ProgressBar';
import Step1Type from './Step1Type';
import Step2Flight from './Step2Flight';
import Step3Contact from './Step3Contact';
import Result from './Result';

const STORAGE_KEY = 'rv-wizard-draft';

const INITIAL = {
  tipo: null,
  flight: {}, // datos del vuelo
  result: null, // respuesta del /api/verify
  contact: {}, // datos personales
};

export default function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restaurar draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  // Guardar draft
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  // Preselect from ?tipo=
  useEffect(() => {
    const t = router.query.tipo;
    if (t && !state.tipo) {
      setState(s => ({ ...s, tipo: t }));
      setStep(2);
    }
  }, [router.query.tipo]);

  const stepTitle = { 1: 'Tipo de incidencia', 2: 'Datos del vuelo', 3: 'Tus datos' };

  return (
    <section id="reclamar" style={{ background: tokens.slate50, padding: `${tokens.s8}px ${tokens.s5}px` }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        background: tokens.white, borderRadius: tokens.r3,
        boxShadow: tokens.shadowLg, padding: tokens.s6,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.green600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
          Paso {step} de 3 · {stepTitle[step]}
        </div>
        <ProgressBar step={step} />

        {step === 1 && (
          <Step1Type
            value={state.tipo}
            onPick={tipo => { setState(s => ({ ...s, tipo })); setStep(2); }}
          />
        )}
        {step === 2 && (
          <Step2Flight
            tipo={state.tipo}
            value={state.flight}
            loading={loading}
            error={error}
            onChange={flight => setState(s => ({ ...s, flight }))}
            onBack={() => setStep(1)}
            onSubmit={async flight => {
              setLoading(true); setError(null);
              try {
                const res = await fetch('/api/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tipo: state.tipo, ...flight }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al verificar');
                setState(s => ({ ...s, flight, result: data }));
                setStep(2.5); // pseudo-step para mostrar Result
              } catch (e) {
                setError(e.message);
              } finally { setLoading(false); }
            }}
          />
        )}
        {step === 2.5 && (
          <Result
            result={state.result}
            tipo={state.tipo}
            onBack={() => setStep(2)}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Contact
            value={state.contact}
            result={state.result}
            flight={state.flight}
            tipo={state.tipo}
            onChange={contact => setState(s => ({ ...s, contact }))}
            onBack={() => setStep(2.5)}
            onSubmitted={() => {
              localStorage.removeItem(STORAGE_KEY);
              setStep(4); // confirmation
            }}
          />
        )}
        {step === 4 && <Confirmation />}
      </div>
    </section>
  );
}

function Confirmation() {
  return (
    <div style={{ textAlign: 'center', padding: `${tokens.s6}px 0` }} className="fade-up">
      <div style={{
        width: 80, height: 80, borderRadius: tokens.rPill,
        background: tokens.green100, color: tokens.green600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: 36, fontWeight: 800,
      }}>✓</div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 26, marginTop: tokens.s4 }}>¡Caso recibido!</h2>
      <p style={{ color: tokens.slate500, marginTop: tokens.s3 }}>
        Te hemos enviado un email con el enlace para subir tus documentos. Revísalo para continuar.
      </p>
    </div>
  );
}
```

Los otros 3 stubs (`Step1Type`, `Step2Flight`, `Step3Contact`, `Result`) van con `export default function(){ return <div>(pending)</div>; }` por ahora — se implementan en los siguientes tasks.

- [ ] **Step 2: Reemplazar `WizardStub` en `pages/index.jsx`**

Editar `pages/index.jsx`:
```javascript
// cambiar:
import WizardStub from '../components/landing/WizardStub';
// por:
import Wizard from '../components/wizard/Wizard';
// y en el JSX:
<Wizard />
```
Borrar `components/landing/WizardStub.jsx`.

- [ ] **Step 3: Verificar que compila y el contenedor del wizard aparece**

http://localhost:3000 → debajo de Calculator aparece el wizard con "Paso 1 de 3".

- [ ] **Step 4: Commit**

```bash
git add components/wizard/ pages/index.jsx
git rm components/landing/WizardStub.jsx
git commit -m "feat: esqueleto del wizard con estado y localStorage draft"
```

---

## Task 18: Implementar `Step1Type.jsx`

**Files:**
- Modify: `components/wizard/Step1Type.jsx`

- [ ] **Step 1: Escribir**

```javascript
import { tokens } from '../../lib/theme';
import { SERVICES } from '../../lib/services';

export default function Step1Type({ value, onPick }) {
  return (
    <div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 24, marginBottom: tokens.s4 }}>
        ¿Qué le pasó a tu vuelo?
      </h2>
      <p style={{ color: tokens.slate500, marginBottom: tokens.s5, fontSize: 15 }}>
        Elige el tipo de incidencia para empezar.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }} className="grid2">
        {SERVICES.map(s => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{
                textAlign: 'left', padding: tokens.s4, cursor: 'pointer',
                background: active ? tokens.green50 : tokens.white,
                border: `2px solid ${active ? tokens.green500 : tokens.slate200}`,
                borderRadius: tokens.r2, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = tokens.slate300; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = tokens.slate200; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 700, color: tokens.navy900 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 2 }}>{s.short}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que clickar una card auto-avanza al paso 2**

- [ ] **Step 3: Commit**

```bash
git add components/wizard/Step1Type.jsx
git commit -m "feat: wizard paso 1 con 6 tipos"
```

---

## Task 19: Implementar `Step2Flight.jsx` con campos adaptativos

**Files:**
- Modify: `components/wizard/Step2Flight.jsx`
- Create: `components/wizard/fields.jsx` (helpers: Field, Input, RadioPills, AirportSelect reutilizado del legacy)

- [ ] **Step 1: Crear `components/wizard/fields.jsx` con los inputs base**

```javascript
import { tokens, inputStyle, selectStyle } from '../../lib/theme';

export function Field({ label, children, hint, error }) {
  return (
    <div style={{ marginBottom: tokens.s4 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: tokens.slate500, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</label>
      {children}
      {hint && !error && <div style={{ fontSize: 12, color: tokens.slate400, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: tokens.red500, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function Input(props) {
  return <input style={inputStyle} {...props} />;
}

export function Select({ children, ...rest }) {
  return <select style={selectStyle} {...rest}>{children}</select>;
}

export function RadioPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value} type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 16px', borderRadius: tokens.rPill,
              border: `1.5px solid ${active ? tokens.green500 : tokens.slate200}`,
              background: active ? tokens.green50 : tokens.white,
              color: active ? tokens.green700 : tokens.slate500,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>{opt.label}</button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Rescatar `AirportSelect` del legacy**

Run: `grep -n "AirportSelect" pages/index.legacy.jsx.bak | head`

Copiar la definición del componente `AirportSelect` del archivo legacy (y la lista `AIRPORTS` que lo alimenta) a un nuevo archivo `components/wizard/AirportSelect.jsx` adaptando los estilos a `tokens` pero manteniendo el API (value, onChange, placeholder). Si tiene dependencias de otras constantes del legacy, cópialas con él.

- [ ] **Step 3: Escribir `Step2Flight.jsx`**

```javascript
import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input, Select, RadioPills } from './fields';
import AirportSelect from './AirportSelect';
import { Button } from '../ui';

const AIRLINES = [
  { code: 'IB', name: 'Iberia' },
  { code: 'VY', name: 'Vueling' },
  { code: 'UX', name: 'Air Europa' },
  { code: 'FR', name: 'Ryanair' },
  { code: 'EJ', name: 'EasyJet' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM' },
  { code: 'BA', name: 'British Airways' },
  { code: 'TP', name: 'TAP Portugal' },
];

export default function Step2Flight({ tipo, value, loading, error, onChange, onBack, onSubmit }) {
  const [f, setF] = useState({
    airline: '', flightNumber: '', date: '', from: '', to: '',
    arrivalTime: '', canceledNoticeDays: '', offeredAlt: '', acceptedAlt: '',
    altArrivalTime: '', flight2Number: '', finalDestination: '', samePNR: 'yes',
    overbookingCompensation: '', overbookingAccepted: '',
    luggageType: '', luggageValue: '', pirDone: '',
    injuryType: '', medicalReport: '', injuryDescription: '',
    ...value,
  });

  const set = (k, v) => {
    const next = { ...f, [k]: v };
    setF(next); onChange(next);
  };

  const onAirline = code => {
    const cur = f.flightNumber.replace(/^[A-Z]{2}/, '');
    set('airline', code);
    set('flightNumber', code + cur);
  };

  const coreValid = f.airline && f.flightNumber && f.date && f.from && f.to && f.from !== f.to;

  return (
    <div>
      <Field label="Compañía">
        <Select value={f.airline} onChange={e => onAirline(e.target.value)}>
          <option value="">Selecciona aerolínea</option>
          {AIRLINES.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
        </Select>
      </Field>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Nº vuelo"><Input placeholder="IB2634" value={f.flightNumber} onChange={e => set('flightNumber', e.target.value.toUpperCase())} /></Field>
        <Field label="Fecha"><Input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></Field>
      </div>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Origen"><AirportSelect value={f.from} onChange={v => set('from', v)} /></Field>
        <Field label="Destino"><AirportSelect value={f.to} onChange={v => set('to', v)} /></Field>
      </div>

      {tipo === 'retraso' && (
        <Field label="Hora real de llegada (opcional)" hint="Si no la sabes, la buscamos por ti.">
          <Input type="time" value={f.arrivalTime} onChange={e => set('arrivalTime', e.target.value)} />
        </Field>
      )}

      {tipo === 'cancelacion' && (
        <>
          <Field label="¿Cuándo te avisaron?">
            <RadioPills
              options={[
                { value: 'same', label: 'Mismo día' },
                { value: '1-7',  label: '1-7 días' },
                { value: '7-14', label: '7-14 días' },
                { value: '14+',  label: 'Más de 14' },
              ]}
              value={f.canceledNoticeDays}
              onChange={v => set('canceledNoticeDays', v)}
            />
          </Field>
          <Field label="¿Ofrecieron alternativa?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.offeredAlt} onChange={v => set('offeredAlt', v)}
            />
          </Field>
          {f.offeredAlt === 'yes' && (
            <>
              <Field label="¿Aceptaste la alternativa?">
                <RadioPills
                  options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
                  value={f.acceptedAlt} onChange={v => set('acceptedAlt', v)}
                />
              </Field>
              {f.acceptedAlt === 'yes' && (
                <Field label="Hora real de llegada con la alternativa">
                  <Input type="time" value={f.altArrivalTime} onChange={e => set('altArrivalTime', e.target.value)} />
                </Field>
              )}
            </>
          )}
        </>
      )}

      {tipo === 'conexion' && (
        <>
          <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
            <Field label="Nº del segundo vuelo"><Input value={f.flight2Number} onChange={e => set('flight2Number', e.target.value.toUpperCase())} /></Field>
            <Field label="Destino final"><AirportSelect value={f.finalDestination} onChange={v => set('finalDestination', v)} /></Field>
          </div>
          <Field label="¿Mismo PNR (misma reserva)?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.samePNR} onChange={v => set('samePNR', v)}
            />
          </Field>
        </>
      )}

      {tipo === 'overbooking' && (
        <>
          <Field label="¿Te ofrecieron compensación en el aeropuerto?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.overbookingCompensation} onChange={v => set('overbookingCompensation', v)}
            />
          </Field>
          {f.overbookingCompensation === 'yes' && (
            <Field label="¿La aceptaste?">
              <RadioPills
                options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
                value={f.overbookingAccepted} onChange={v => set('overbookingAccepted', v)}
              />
            </Field>
          )}
        </>
      )}

      {tipo === 'equipaje' && (
        <>
          <Field label="¿Qué le pasó al equipaje?">
            <RadioPills
              options={[
                { value: 'lost', label: 'Perdido' },
                { value: 'delayed', label: 'Retrasado' },
                { value: 'damaged', label: 'Dañado' },
              ]}
              value={f.luggageType} onChange={v => set('luggageType', v)}
            />
          </Field>
          <Field label="Valor aproximado del contenido (€)" hint="Estima lo mejor que puedas. Te pediremos facturas después.">
            <Input type="number" min="0" value={f.luggageValue} onChange={e => set('luggageValue', e.target.value)} />
          </Field>
          <Field label="¿Hiciste el PIR (parte de irregularidad) en el aeropuerto?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]}
              value={f.pirDone} onChange={v => set('pirDone', v)}
            />
          </Field>
        </>
      )}

      {tipo === 'lesiones' && (
        <>
          <Field label="Tipo de lesión">
            <Input placeholder="Ej: caída por turbulencia, quemadura por café..." value={f.injuryType} onChange={e => set('injuryType', e.target.value)} />
          </Field>
          <Field label="¿Tienes parte médico?">
            <RadioPills
              options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No, pero fui al médico' }, { value: 'none', label: 'No' }]}
              value={f.medicalReport} onChange={v => set('medicalReport', v)}
            />
          </Field>
          <Field label="Descripción breve">
            <textarea value={f.injuryDescription} onChange={e => set('injuryDescription', e.target.value)}
              rows={4} style={{
                ...tokens && {}, padding: '14px 16px', border: `1.5px solid ${tokens.slate200}`,
                borderRadius: tokens.r1, fontSize: 15, fontFamily: tokens.fontBody,
                color: tokens.navy900, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical',
              }} />
          </Field>
        </>
      )}

      {error && (
        <div style={{
          background: tokens.red50, color: tokens.red500, padding: tokens.s3,
          borderRadius: tokens.r1, fontSize: 14, marginBottom: tokens.s3,
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Atrás</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" disabled={!coreValid || loading} onClick={() => onSubmit(f)}>
          {loading ? 'Analizando…' : 'Verificar con IA →'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar selección de tipo → formulario adaptativo**

Probar que al elegir cada tipo aparecen los campos específicos. Los 4 tipos antiguos ya funcionan con `/api/verify` actual; equipaje y lesiones devolverán error o resultado inesperado (se arregla en Fase 7).

- [ ] **Step 3: Commit**

```bash
git add components/wizard/
git commit -m "feat: wizard paso 2 con formulario adaptativo por tipo"
```

---

## Task 20: Implementar `Result.jsx` (3 estados: RECLAMABLE/REVISAR/NO)

**Files:**
- Modify: `components/wizard/Result.jsx`

- [ ] **Step 1: Escribir**

```javascript
import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Button, Badge } from '../ui';

export default function Result({ result, tipo, onBack, onContinue }) {
  const [showReasoning, setShowReasoning] = useState(false);
  if (!result) return null;

  const status = result.status || result.decision || 'REVISAR';
  const isOk = status === 'RECLAMABLE';
  const isReview = status === 'REVISAR' || status === 'REVISAR_MANUALMENTE';
  const amount = result.compensation || result.amount || 0;

  const theme = isOk
    ? { bg: tokens.green50, border: tokens.green500, icon: '✓', iconBg: tokens.green500, label: 'Reclamable', labelColor: tokens.green700 }
    : isReview
      ? { bg: tokens.amber50, border: tokens.amber500, icon: '⚠', iconBg: tokens.amber500, label: 'Revisar caso', labelColor: tokens.amber500 }
      : { bg: tokens.slate100, border: tokens.slate300, icon: 'ⓘ', iconBg: tokens.slate500, label: 'No reclamable', labelColor: tokens.slate500 };

  return (
    <div className="fade-up">
      <div style={{
        background: theme.bg, borderRadius: tokens.r2,
        border: `2px solid ${theme.border}`, padding: tokens.s5,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: tokens.rPill,
          background: theme.iconBg, color: tokens.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto', fontSize: 32, fontWeight: 800,
        }}>{theme.icon}</div>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: theme.labelColor, marginTop: tokens.s3,
        }}>{theme.label}</div>

        {isOk && (
          <>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 56, fontWeight: 800, color: tokens.navy900, marginTop: tokens.s2, letterSpacing: '-0.03em' }}>
              {amount}€
            </div>
            <div style={{ fontSize: 13, color: tokens.slate500 }}>
              compensación estimada por pasajero
            </div>
          </>
        )}

        {isReview && (
          <div style={{ fontSize: 15, color: tokens.navy700, marginTop: tokens.s3, maxWidth: 420, margin: `${tokens.s3}px auto 0` }}>
            Tu caso necesita revisión personalizada. Uno de nuestros abogados lo estudiará.
          </div>
        )}

        {!isOk && !isReview && (
          <div style={{ fontSize: 15, color: tokens.navy700, marginTop: tokens.s3, maxWidth: 420, margin: `${tokens.s3}px auto 0` }}>
            {result.reason || 'Según nuestro análisis, este caso no cumple los requisitos para reclamación.'}
          </div>
        )}

        {result.reasoning && (
          <div style={{ marginTop: tokens.s4 }}>
            <button
              onClick={() => setShowReasoning(v => !v)}
              style={{
                background: 'transparent', border: 'none', color: tokens.slate500,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
              }}>
              {showReasoning ? 'Ocultar' : 'Ver'} razonamiento del análisis
            </button>
            {showReasoning && (
              <div style={{
                background: tokens.white, border: `1px solid ${tokens.slate200}`,
                borderRadius: tokens.r1, padding: tokens.s3, marginTop: tokens.s3,
                fontSize: 13, color: tokens.slate500, textAlign: 'left', lineHeight: 1.6,
              }}>{result.reasoning}</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Modificar datos</Button>
        <div style={{ flex: 1 }} />
        {(isOk || isReview) && (
          <Button variant="primary" onClick={onContinue}>
            {isOk ? 'Iniciar reclamación →' : 'Hablar con un abogado →'}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar los 3 estados**

Probar el flujo con un vuelo conocido que devuelva RECLAMABLE, otro que dé NO, y uno dudoso para REVISAR (si no hay, usar un tipo equipaje/lesiones que actualmente no gestiona el backend para forzar REVISAR).

- [ ] **Step 3: Commit**

```bash
git add components/wizard/Result.jsx
git commit -m "feat: wizard result con 3 estados visuales"
```

---

## Task 21: Implementar `Step3Contact.jsx` (datos personales + envío)

**Files:**
- Modify: `components/wizard/Step3Contact.jsx`

- [ ] **Step 1: Escribir**

```javascript
import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input } from './fields';
import { Button } from '../ui';

export default function Step3Contact({ value, result, flight, tipo, onChange, onBack, onSubmitted }) {
  const [c, setC] = useState({
    firstName: '', lastName: '', dni: '', email: '', phone: '', passengers: 1,
    rgpd: false, terms: false,
    ...value,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => { const next = { ...c, [k]: v }; setC(next); onChange(next); };
  const valid = c.firstName && c.lastName && c.dni && c.email && c.phone && c.rgpd && c.terms;

  const onSubmit = async () => {
    setLoading(true); setError(null);
    try {
      // Reutiliza /api/verify con un flag submit para que dispare emails
      // (ver lib/email.js — backend ya tiene esta ruta)
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submit: true, tipo, ...flight, ...c, result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error enviando el caso');
      onSubmitted();
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 24, marginBottom: tokens.s4 }}>Tus datos</h2>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Nombre"><Input value={c.firstName} onChange={e => set('firstName', e.target.value)} /></Field>
        <Field label="Apellidos"><Input value={c.lastName} onChange={e => set('lastName', e.target.value)} /></Field>
      </div>
      <Field label="DNI / NIE / Pasaporte"><Input value={c.dni} onChange={e => set('dni', e.target.value.toUpperCase())} /></Field>
      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.s3 }}>
        <Field label="Email"><Input type="email" inputMode="email" value={c.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Teléfono"><Input type="tel" inputMode="tel" value={c.phone} onChange={e => set('phone', e.target.value)} /></Field>
      </div>
      <Field label="Nº de pasajeros en la reserva">
        <Input type="number" min="1" max="20" value={c.passengers} onChange={e => set('passengers', parseInt(e.target.value) || 1)} />
      </Field>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: tokens.s3, fontSize: 13, color: tokens.slate500, cursor: 'pointer' }}>
        <input type="checkbox" checked={c.rgpd} onChange={e => set('rgpd', e.target.checked)} style={{ marginTop: 3 }} />
        <span>Acepto la <a href="/privacidad" style={{ color: tokens.green600, textDecoration: 'underline' }}>política de privacidad</a> y el tratamiento de mis datos para gestionar la reclamación.</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: tokens.s2, fontSize: 13, color: tokens.slate500, cursor: 'pointer' }}>
        <input type="checkbox" checked={c.terms} onChange={e => set('terms', e.target.checked)} style={{ marginTop: 3 }} />
        <span>Entiendo que la comisión es del <b>25% + IVA sobre la compensación obtenida</b>, y que solo pago si se consigue.</span>
      </label>

      {error && (
        <div style={{ background: tokens.red50, color: tokens.red500, padding: tokens.s3, borderRadius: tokens.r1, fontSize: 14, marginTop: tokens.s3 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5 }}>
        <Button variant="ghost" onClick={onBack}>← Atrás</Button>
        <div style={{ flex: 1 }} />
        <Button variant="primary" disabled={!valid || loading} onClick={onSubmit}>
          {loading ? 'Enviando…' : 'Enviar caso →'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar envío end-to-end con un caso de retraso conocido**

Probar que:
- Validación inline de campos obligatorios
- Submit deshabilitado hasta checkboxes marcados
- Al enviar, dispara `/api/verify` con `submit: true` y muestra pantalla Confirmation

- [ ] **Step 3: Commit**

```bash
git add components/wizard/Step3Contact.jsx
git commit -m "feat: wizard paso 3 contacto + envio con validacion"
```

---

## Task 22: Limpiar legacy del wizard

**Files:**
- Delete: `pages/index.legacy.jsx.bak`

- [ ] **Step 1: Verificar que el flujo completo del wizard funciona en los 4 tipos originales**

Probar manualmente retraso, cancelación, conexión, overbooking. Equipaje y lesiones quedan para Fase 7.

- [ ] **Step 2: Borrar backup**

```bash
git rm pages/index.legacy.jsx.bak
git commit -m "chore: remove legacy index backup"
```

---

# FASE 5 — Página de documentos

## Task 23: Rediseñar `pages/aportar-documentos.jsx` — skeleton con mini-card y lista

**Files:**
- Modify: `pages/aportar-documentos.jsx` (reescritura)
- Create: `components/docs/DocSlot.jsx`
- Create: `components/docs/IbanInput.jsx`
- Create: `components/docs/CaseSummary.jsx`

- [ ] **Step 1: Crear `components/docs/CaseSummary.jsx`**

```javascript
import { tokens } from '../../lib/theme';
import { Badge } from '../ui';

export default function CaseSummary({ caseData }) {
  if (!caseData) return null;
  const { reference, flight, route, date, compensation, passengers } = caseData;
  return (
    <div style={{
      background: tokens.slate50, border: `1px solid ${tokens.slate200}`,
      borderRadius: tokens.r2, padding: tokens.s4, marginBottom: tokens.s5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: tokens.s3, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.slate500, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Tu caso
          </div>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 18, fontWeight: 700, color: tokens.navy900, marginTop: 4 }}>
            {reference || 'RV-pendiente'}
          </div>
          <div style={{ fontSize: 14, color: tokens.slate500, marginTop: 4 }}>
            {flight} · {route} · {date}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge variant="success">Compensación estimada</Badge>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 28, fontWeight: 800, color: tokens.green600, marginTop: 4 }}>
            {compensation}€
          </div>
          <div style={{ fontSize: 12, color: tokens.slate500 }}>× {passengers} pasajero{passengers > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear `components/docs/DocSlot.jsx`**

```javascript
import { useRef, useState } from 'react';
import { tokens } from '../../lib/theme';

export default function DocSlot({ id, icon, label, hint, required, onFile, file, status, error }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const statusColor =
    status === 'ok' ? tokens.green500 :
    status === 'error' ? tokens.red500 :
    dragging ? tokens.green500 : tokens.slate300;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => status !== 'validating' && status !== 'uploading' && ref.current?.click()}
      style={{
        background: dragging ? tokens.green50 : tokens.white,
        border: `2px dashed ${statusColor}`,
        borderRadius: tokens.r2,
        padding: tokens.s4,
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: tokens.s3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.s3 }}>
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 16, fontWeight: 700, color: tokens.navy900 }}>{label}</div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
              color: required ? tokens.red500 : tokens.slate400,
              textTransform: 'uppercase',
            }}>{required ? 'Obligatorio' : 'Opcional'}</span>
          </div>
          <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 2 }}>{hint}</div>

          {status === 'uploading' && <div style={{ fontSize: 12, color: tokens.slate500, marginTop: 6 }}>Subiendo…</div>}
          {status === 'validating' && <div style={{ fontSize: 12, color: tokens.amber500, marginTop: 6 }}>Verificando con Claude Vision…</div>}
          {status === 'ok' && file && (
            <div style={{ fontSize: 12, color: tokens.green600, marginTop: 6, fontWeight: 600 }}>✓ {file.name}</div>
          )}
          {status === 'error' && (
            <div style={{ fontSize: 12, color: tokens.red500, marginTop: 6 }}>⚠ {error || 'No se pudo validar'}</div>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}
```

- [ ] **Step 3: Crear `components/docs/IbanInput.jsx`**

```javascript
import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { Field, Input } from '../wizard/fields';

function validateIBAN(raw) {
  const s = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  // MOD-97 check
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
  let rem = 0;
  for (const c of numeric) rem = (rem * 10 + parseInt(c, 10)) % 97;
  return rem === 1;
}

export default function IbanInput({ value, onChange }) {
  const [v, setV] = useState(value || '');
  const [touched, setTouched] = useState(false);
  const ok = validateIBAN(v);
  const error = touched && v && !ok ? 'El IBAN no parece válido' : null;
  return (
    <Field label="IBAN" hint="Formato español: ES00 0000 0000 0000 0000 0000" error={error}>
      <Input
        value={v}
        placeholder="ES00 0000 0000 0000 0000 0000"
        onChange={e => { setV(e.target.value); onChange(e.target.value); }}
        onBlur={() => setTouched(true)}
        style={{ borderColor: ok ? tokens.green500 : undefined }}
      />
    </Field>
  );
}
```

- [ ] **Step 4: Reescribir `pages/aportar-documentos.jsx`**

```javascript
import Head from 'next/head';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button } from '../components/ui';
import CaseSummary from '../components/docs/CaseSummary';
import DocSlot from '../components/docs/DocSlot';
import IbanInput from '../components/docs/IbanInput';

function parseToken(d) {
  try { return JSON.parse(atob(decodeURIComponent(d))); }
  catch { return null; }
}

const BASE_DOCS = [
  { id: 'dni',      icon: '🪪', label: 'DNI / Pasaporte',   hint: 'Foto clara de ambas caras', required: true },
  { id: 'boarding', icon: '🎫', label: 'Tarjeta de embarque', hint: 'La original con el código de barras', required: true },
  { id: 'booking',  icon: '📧', label: 'Confirmación de reserva', hint: 'Email o PDF con número de localizador', required: true },
];

// IBAN se renderiza como input, no como upload
const OPTIONAL_DOCS = [
  { id: 'receipts', icon: '🧾', label: 'Recibos de gastos extras', hint: 'Comidas, hotel, transporte alternativo', required: false },
];

const TIPO_EXTRA_DOCS = {
  equipaje: [{ id: 'pir', icon: '🧳', label: 'PIR (parte de irregularidad)', hint: 'Documento que te dieron al denunciar el equipaje en el aeropuerto', required: true }],
  lesiones: [{ id: 'medical', icon: '🏥', label: 'Parte médico', hint: 'Informe del hospital o médico que te atendió', required: true }],
};

export default function AportarDocumentos() {
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [files, setFiles] = useState({}); // id -> { file, status, error }
  const [iban, setIban] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (router.query.d) {
      const data = parseToken(router.query.d);
      if (data) setCaseData(data);
    }
  }, [router.query.d]);

  const tipo = caseData?.tipo;
  const docs = useMemo(() => [...BASE_DOCS, ...(TIPO_EXTRA_DOCS[tipo] || []), ...OPTIONAL_DOCS], [tipo]);

  const validDocsCount = docs.filter(d => files[d.id]?.status === 'ok').length;
  const requiredCount = docs.filter(d => d.required).length;
  const allRequiredOk = docs.filter(d => d.required).every(d => files[d.id]?.status === 'ok');
  const canSubmit = allRequiredOk && iban && !submitting;

  const handleFile = async (docId, file) => {
    setFiles(prev => ({ ...prev, [docId]: { file, status: 'uploading' } }));
    try {
      const b64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'validating' } }));

      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validateOnly: true, docType: docId, dataUrl: b64, caseData }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Documento rechazado');
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'ok' } }));
    } catch (e) {
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'error', error: e.message } }));
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        caseData, iban,
        files: Object.fromEntries(
          await Promise.all(Object.entries(files).filter(([_, f]) => f.status === 'ok').map(async ([id, f]) => {
            const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f.file); });
            return [id, { name: f.file.name, dataUrl: b64 }];
          }))
        ),
      };
      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al enviar documentación');
      setSubmitted(true);
    } catch (e) {
      alert(e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Head><title>Subir documentos — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: tokens.s8 }} className="fade-up">
            <div style={{
              width: 96, height: 96, borderRadius: tokens.rPill,
              background: tokens.green100, color: tokens.green600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', fontSize: 48,
            }}>✓</div>
            <h1 style={{ fontFamily: tokens.fontHead, fontSize: 32, marginTop: tokens.s4 }}>Documentación enviada</h1>
            <p style={{ color: tokens.slate500, marginTop: tokens.s3, maxWidth: 480, margin: `${tokens.s3}px auto 0` }}>
              Hemos recibido todo. Nuestro equipo revisará los documentos y te avisaremos cuando iniciemos la reclamación con la aerolínea.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: tokens.fontHead, fontSize: 32, fontWeight: 800, marginBottom: tokens.s2 }}>
              Sube tus documentos
            </h1>
            <p style={{ color: tokens.slate500, fontSize: 16, marginBottom: tokens.s5 }}>
              Necesitamos estos documentos para iniciar tu reclamación. Tardas 2-3 minutos.
            </p>

            <CaseSummary caseData={caseData} />

            <div style={{
              background: tokens.slate100, borderRadius: tokens.r1,
              padding: `${tokens.s2}px ${tokens.s3}px`, fontSize: 13, color: tokens.slate500,
              marginBottom: tokens.s4, fontWeight: 600,
            }}>{validDocsCount} de {requiredCount} documentos obligatorios subidos</div>

            {docs.map(d => (
              <DocSlot
                key={d.id}
                {...d}
                file={files[d.id]?.file}
                status={files[d.id]?.status}
                error={files[d.id]?.error}
                onFile={f => handleFile(d.id, f)}
              />
            ))}

            <IbanInput value={iban} onChange={setIban} />

            <Button
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              onClick={onSubmit}
              style={{ width: '100%', marginTop: tokens.s4 }}
            >
              {submitting ? 'Enviando…' : 'Enviar documentación →'}
            </Button>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Verificar en navegador con token de prueba**

Generar un token de prueba rápido:
```bash
node -e 'console.log(encodeURIComponent(Buffer.from(JSON.stringify({reference:"RV-2026-TEST",flight:"IB2634",route:"MAD→BCN",date:"2026-03-15",compensation:250,passengers:2,tipo:"retraso"})).toString("base64")))'
```
Abrir `http://localhost:3000/aportar-documentos?d=<token>` y verificar: mini-card muestra datos, 3+1 slots visibles, IBAN con validación en blur, submit deshabilitado hasta subir obligatorios + IBAN válido.

- [ ] **Step 6: Commit**

```bash
git add components/docs/ pages/aportar-documentos.jsx
git commit -m "feat: rediseno aportar-documentos con dropzones y IBAN validado"
```

---

## Task 24: Ampliar `/api/upload-docs` con modo `validateOnly`

**Files:**
- Modify: `pages/api/upload-docs.js`

- [ ] **Step 1: Leer el archivo actual**

Run: abrir `pages/api/upload-docs.js` y revisar la API actual.

- [ ] **Step 2: Añadir branch para `validateOnly`**

En el handler POST, al principio después del parsing del body, añadir:

```javascript
// Modo de validación individual: valida un solo doc sin enviar emails.
if (req.body.validateOnly) {
  const { docType, dataUrl, caseData } = req.body;
  if (!docType || !dataUrl) {
    return res.status(400).json({ error: 'Faltan docType o dataUrl' });
  }
  try {
    // lib/validateDocs ya existe: usar su función validateSingle o similar
    const { validateSingle } = require('../../lib/validateDocs');
    const result = await validateSingle(docType, dataUrl, caseData);
    if (result.ok) return res.status(200).json({ ok: true, extracted: result.extracted });
    return res.status(200).json({ ok: false, error: result.error });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
```

Si `lib/validateDocs.js` no exporta `validateSingle`, crearlo en ese archivo como un wrapper que valida un solo documento vs el flujo actual que valida todos. Ver Task 30 (Fase 7) para la reestructuración completa.

- [ ] **Step 3: Test rápido en navegador**

Subir un DNI → debe volver `{ok:true}` tras el spinner de Claude Vision.

- [ ] **Step 4: Commit**

```bash
git add pages/api/upload-docs.js lib/validateDocs.js
git commit -m "feat: upload-docs soporta validacion individual (validateOnly)"
```

---

# FASE 6 — Páginas secundarias

## Task 25: Rediseñar `pages/sobre-nosotros.jsx`

**Files:**
- Modify: `pages/sobre-nosotros.jsx`

- [ ] **Step 1: Reescribir**

```javascript
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
```

- [ ] **Step 2: Verificar**
- [ ] **Step 3: Commit**

```bash
git add pages/sobre-nosotros.jsx
git commit -m "feat: rediseño sobre-nosotros"
```

---

## Task 26: Rediseñar `pages/contacto.jsx`

**Files:**
- Modify: `pages/contacto.jsx`

- [ ] **Step 1: Reescribir**

```javascript
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button, H1, Subtitle } from '../components/ui';
import { Field, Input, Select } from '../components/wizard/fields';

export default function Contacto() {
  return (
    <>
      <Head><title>Contacto — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <H1>Hablemos</H1>
        <Subtitle style={{ marginTop: tokens.s3 }}>
          Escríbenos o llámanos. Nuestro equipo está disponible de lunes a viernes.
        </Subtitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: tokens.s7, marginTop: tokens.s7 }} className="grid2">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginBottom: tokens.s3 }}>Teléfonos</div>
            <a href="tel:+34916379097" style={{
              display: 'block', fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 700,
              color: tokens.navy900, marginBottom: 4,
            }}>📞 91 637 90 97</a>
            <a href="tel:+34917152906" style={{
              display: 'block', fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 700,
              color: tokens.navy900,
            }}>📞 91 715 29 06</a>
            <div style={{ fontSize: 14, color: tokens.slate500, marginTop: 6 }}>
              L-V 10:00-14:00 · 16:00-19:00
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginTop: tokens.s6, marginBottom: tokens.s3 }}>Email</div>
            <a href="mailto:contacto@reclamatuvuelo.com" style={{
              fontSize: 16, fontWeight: 600, color: tokens.navy900,
            }}>contacto@reclamatuvuelo.com</a>

            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginTop: tokens.s6, marginBottom: tokens.s3 }}>Síguenos</div>
            <div style={{ display: 'flex', gap: tokens.s2 }}>
              {['Instagram', 'Facebook', 'Twitter'].map(s => (
                <a key={s} href={`https://${s.toLowerCase()}.com/reclamatuvuelo`} target="_blank" rel="noopener"
                   style={{
                     width: 40, height: 40, borderRadius: tokens.rPill,
                     border: `1.5px solid ${tokens.slate200}`, color: tokens.navy900,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: 14, fontWeight: 700,
                   }}>{s[0]}</a>
              ))}
            </div>
          </div>

          <form
            action="https://formsubmit.co/contacto@reclamatuvuelo.com"
            method="POST"
            style={{
              background: tokens.white, border: `1px solid ${tokens.slate200}`,
              borderRadius: tokens.r2, padding: tokens.s6, boxShadow: tokens.shadowSm,
            }}
          >
            <Field label="Nombre"><Input name="nombre" required /></Field>
            <Field label="Email"><Input type="email" name="email" required /></Field>
            <Field label="Asunto">
              <Select name="asunto" required>
                <option value="">Selecciona un asunto</option>
                <option>Consulta sobre reclamación</option>
                <option>Información sobre precios</option>
                <option>Prensa y colaboraciones</option>
                <option>Otro</option>
              </Select>
            </Field>
            <Field label="Mensaje">
              <textarea
                name="mensaje" required rows={5}
                style={{
                  padding: '14px 16px', border: `1.5px solid ${tokens.slate200}`,
                  borderRadius: tokens.r1, fontSize: 15, fontFamily: tokens.fontBody,
                  color: tokens.navy900, width: '100%', boxSizing: 'border-box',
                  outline: 'none', resize: 'vertical',
                }}
              />
            </Field>
            <input type="hidden" name="_next" value="https://reclamatuvuelo.com/contacto?ok=1" />
            <input type="hidden" name="_captcha" value="false" />
            <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
              Enviar mensaje →
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verificar**
- [ ] **Step 3: Commit**

```bash
git add pages/contacto.jsx
git commit -m "feat: rediseño contacto con split info/form"
```

---

## Task 27: Crear layout reutilizable para páginas legales + rediseñar las 3

**Files:**
- Create: `components/LegalPage.jsx`
- Modify: `pages/aviso-legal.jsx`
- Modify: `pages/privacidad.jsx`
- Modify: `pages/cookies.jsx`

- [ ] **Step 1: Crear `components/LegalPage.jsx`**

```javascript
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
```

- [ ] **Step 2: Reescribir `pages/aviso-legal.jsx` usando `LegalPage`**

```javascript
import Head from 'next/head';
import LegalPage from '../components/LegalPage';

const SECTIONS = [
  { id: 'titular', title: 'Titularidad', html: '<p>ReclamaVuelo es propiedad de [Razón Social], con CIF [CIF] y domicilio en [Dirección].</p><p>Email: contacto@reclamatuvuelo.com · Teléfono: 91 637 90 97</p>' },
  { id: 'objeto',  title: 'Objeto del sitio', html: '<p>Este sitio web ofrece servicios de gestión de reclamaciones a aerolíneas conforme al Reglamento (CE) 261/2004, el Convenio de Montreal y la normativa española aplicable.</p>' },
  { id: 'uso',     title: 'Condiciones de uso', html: '<p>El usuario se compromete a usar el sitio de manera lícita y a no realizar actividades que puedan dañar su funcionamiento.</p>' },
  { id: 'propiedad', title: 'Propiedad intelectual', html: '<p>Todos los contenidos, diseños y marcas del sitio son propiedad de ReclamaVuelo o de sus legítimos titulares.</p>' },
  { id: 'responsabilidad', title: 'Responsabilidad', html: '<p>ReclamaVuelo no garantiza el éxito de todas las reclamaciones. Los plazos y resultados dependen de cada caso concreto y de la respuesta de la aerolínea y, en su caso, del juzgado.</p>' },
  { id: 'legislacion', title: 'Legislación aplicable', html: '<p>Este aviso legal se rige por la legislación española. Para cualquier disputa, las partes se someten a los juzgados de Madrid capital.</p>' },
];

export default function AvisoLegal() {
  return (
    <>
      <Head><title>Aviso Legal — ReclamaVuelo</title></Head>
      <LegalPage title="Aviso Legal" updated="Abril 2026" sections={SECTIONS} />
    </>
  );
}
```

> **Nota al implementador:** si la versión actual de `pages/aviso-legal.jsx` contiene texto legal más específico (nombres, CIF, direcciones reales), cópialos a las `html` correspondientes en lugar de los placeholders genéricos. No reescribas texto legal propio del cliente.

- [ ] **Step 3: Reescribir `pages/privacidad.jsx` de la misma forma**

Seguir el mismo patrón con las secciones estándar de una política de privacidad GDPR (responsable, datos recopilados, finalidad, base jurídica, conservación, derechos, terceros encargados — Resend, Anthropic, FlightStats, AviationStack, FormSubmit, NOAA). Preservar texto específico del archivo actual si existe.

- [ ] **Step 4: Reescribir `pages/cookies.jsx` de la misma forma**

Secciones estándar: qué son cookies, qué cookies usamos (técnicas, analíticas, de terceros), cómo gestionarlas.

- [ ] **Step 5: Verificar las 3 páginas**

Navegar a `/aviso-legal`, `/privacidad`, `/cookies` → TOC sticky a la izquierda en desktop, smooth scroll al click, contenido legible en mobile.

- [ ] **Step 6: Commit**

```bash
git add components/LegalPage.jsx pages/aviso-legal.jsx pages/privacidad.jsx pages/cookies.jsx
git commit -m "feat: paginas legales con layout LegalPage compartido y TOC sticky"
```

---

## Task 28: Crear nueva página `pages/precios.jsx`

**Files:**
- Create: `pages/precios.jsx`

- [ ] **Step 1: Escribir**

```javascript
import Head from 'next/head';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button, H1, H2, Subtitle, Card, Badge } from '../components/ui';

const INCLUDED = [
  'Análisis inicial con IA legal',
  'Gestión extrajudicial con la aerolínea',
  'Gestión judicial al mismo precio',
  'Equipo de abogados colegiados',
  'Sin costes iniciales',
  'Sin letra pequeña',
  'Comunicación transparente del caso',
  'Asesoramiento personalizado',
];

const FAQ = [
  { q: '¿Cuándo cobráis la comisión?', a: 'Solo cuando cobras tu compensación. Si no ganamos, no pagas nada.' },
  { q: '¿El IVA ya está incluido?', a: 'Decimos "25% + IVA" para que sea transparente. En tu liquidación verás exactamente cuánto se aplica.' },
  { q: '¿Y si la aerolínea se niega y hay que ir a juicio?', a: 'Seguimos cobrando lo mismo: 25% + IVA. Nosotros asumimos el riesgo del procedimiento judicial.' },
  { q: '¿Hay algún coste si mi caso no se acepta?', a: 'No. Si el análisis legal indica que no hay reclamación posible, te lo decimos y terminamos ahí.' },
  { q: '¿Cómo comparo vuestro precio con la competencia?', a: 'Muchas plataformas cobran 25-35% en gestión amistosa pero suben a 40-50% si va a juicio. Nosotros mantenemos el 25% siempre.' },
];

export default function Precios() {
  return (
    <>
      <Head><title>Precios — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
          <Badge variant="success">Precio único</Badge>
          <H1 style={{ marginTop: tokens.s3 }}>Una sola cifra. Sin sorpresas.</H1>
          <Subtitle style={{ marginTop: tokens.s3, margin: `${tokens.s3}px auto 0` }}>
            Transparencia total: cobramos el mismo porcentaje tanto si el caso se resuelve amistosamente como si va a juicio.
          </Subtitle>
        </div>

        <Card style={{
          textAlign: 'center', padding: tokens.s7,
          background: tokens.navy900, color: tokens.white, border: 'none',
        }}>
          <div style={{ fontFamily: tokens.fontHead, fontSize: 120, fontWeight: 800, color: tokens.green500, letterSpacing: '-0.04em', lineHeight: 1 }}>
            25%
          </div>
          <div style={{ fontSize: 16, color: tokens.slate300, marginTop: 4 }}>+ IVA sobre la indemnización</div>
          <div style={{ fontSize: 14, color: tokens.slate400, marginTop: tokens.s3 }}>0€ si no ganamos · 0€ iniciales · Mismo precio en juicio</div>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: tokens.s6, textAlign: 'left' }}>
            {INCLUDED.map(i => (
              <li key={i} style={{
                padding: `10px 0`, borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                fontSize: 15, color: tokens.slate300,
              }}>
                <span style={{ color: tokens.green500, fontWeight: 700, fontSize: 18 }}>✓</span> {i}
              </li>
            ))}
          </ul>

          <Button as={Link} href="/#reclamar" variant="primary" size="lg" style={{ marginTop: tokens.s6, width: '100%' }}>
            Empezar reclamación →
          </Button>
        </Card>

        <div style={{ marginTop: tokens.s8 }}>
          <H2>Preguntas sobre precio</H2>
          <div style={{ marginTop: tokens.s5 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                padding: `${tokens.s4}px 0`,
                borderBottom: `1px solid ${tokens.slate200}`,
              }}>
                <div style={{ fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 700, color: tokens.navy900, marginBottom: 6 }}>
                  {item.q}
                </div>
                <div style={{ fontSize: 15, color: tokens.slate500, lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verificar `/precios` renderiza**
- [ ] **Step 3: Commit**

```bash
git add pages/precios.jsx
git commit -m "feat: nueva pagina /precios con card destacada y FAQ"
```

---

# FASE 7 — Backend: ampliación a 6 tipos

## Task 29: Extender `lib/services.js` con datos regulatorios por tipo

**Files:**
- Modify: `lib/services.js`

- [ ] **Step 1: Añadir metadata de regulación por tipo**

Extender cada objeto en `SERVICES` con un campo `kind` que el motor usará para decidir la regulación aplicable:

```javascript
// al cargar cada service, asignar kind:
// retraso / cancelacion / conexion / overbooking  → kind: 'ce261'
// equipaje                                         → kind: 'montreal-baggage'
// lesiones                                         → kind: 'montreal-injury'
```

Modificar el array:
```javascript
export const SERVICES = [
  { id: 'retraso',      kind: 'ce261',             /* ...resto */ },
  { id: 'cancelacion',  kind: 'ce261',             /* ... */ },
  { id: 'conexion',     kind: 'ce261',             /* ... */ },
  { id: 'overbooking',  kind: 'ce261',             /* ... */ },
  { id: 'equipaje',     kind: 'montreal-baggage',  /* ... */ },
  { id: 'lesiones',     kind: 'montreal-injury',   /* ... */ },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/services.js
git commit -m "refactor: añadir kind regulatorio a SERVICES"
```

---

## Task 30: Ampliar `lib/agent.js` con branches para equipaje y lesiones

**Files:**
- Modify: `lib/agent.js`

- [ ] **Step 1: Leer el agent actual**

Run: abrir `lib/agent.js` (175 líneas).

- [ ] **Step 2: Refactorizar para rutear por `kind`**

En la función principal exportada (`analyze` / `runAgent` / como se llame), añadir un switch al principio:

```javascript
import { getService } from './services';

export async function analyze(input) {
  const svc = getService(input.tipo);
  if (!svc) return { status: 'ERROR', reason: 'Tipo de incidencia desconocido' };

  switch (svc.kind) {
    case 'ce261':             return analyzeCE261(input);
    case 'montreal-baggage':  return analyzeBaggage(input);
    case 'montreal-injury':   return analyzeInjury(input);
    default:                  return { status: 'REVISAR_MANUALMENTE', reason: 'Caso no categorizable automáticamente' };
  }
}
```

`analyzeCE261` es el flujo actual del agent — extraer todo el código existente a esa función privada sin cambiarlo.

`analyzeBaggage` y `analyzeInjury` son nuevos.

- [ ] **Step 3: Implementar `analyzeBaggage`**

```javascript
async function analyzeBaggage(input) {
  const { luggageType, luggageValue, pirDone } = input;

  if (pirDone !== 'yes') {
    return {
      status: 'REVISAR_MANUALMENTE',
      reason: 'Sin PIR (parte de irregularidad en el aeropuerto) la reclamación es muy difícil. Un abogado revisará si hay vía alternativa (correo a la aerolínea en 7 días para dañado, 21 días para retrasado).',
      regulation: 'Convenio de Montreal art. 17.2, 31',
    };
  }

  const reasoning = [
    `Caso de equipaje ${luggageType}.`,
    `Valor aproximado declarado: ${luggageValue || 'no indicado'}€.`,
    `PIR hecho en aeropuerto: sí.`,
    `Aplica Convenio de Montreal: límite máximo ~1.288 DEG por pasajero (~1.600€).`,
    `El importe exacto depende de documentación probatoria (facturas, fotos) y del criterio del juzgado.`,
  ].join(' ');

  return {
    status: 'REVISAR_MANUALMENTE',
    reason: 'Caso reclamable bajo Convenio de Montreal, pero el importe exacto requiere revisión manual con la documentación (facturas, fotos, PIR).',
    compensation: Math.min(1600, parseInt(luggageValue, 10) || 0) || null,
    regulation: 'Convenio de Montreal',
    reasoning,
  };
}
```

- [ ] **Step 4: Implementar `analyzeInjury`**

```javascript
async function analyzeInjury(input) {
  const { medicalReport, injuryType, injuryDescription } = input;

  const hasProof = medicalReport === 'yes';

  return {
    status: 'REVISAR_MANUALMENTE',
    reason: hasProof
      ? 'Caso reclamable bajo el art. 17.1 del Convenio de Montreal (responsabilidad objetiva de la aerolínea por lesiones durante embarque, vuelo o desembarque). Uno de nuestros abogados se pondrá en contacto para revisar el parte médico y estimar compensación.'
      : 'Los casos de lesión requieren parte médico para estimar compensación. Un abogado se pondrá en contacto para orientarte sobre cómo obtener la prueba necesaria.',
    compensation: null, // varía enormemente caso a caso
    regulation: 'Convenio de Montreal art. 17.1',
    reasoning: `Tipo de lesión: ${injuryType}. Descripción: ${injuryDescription || 'sin descripción'}. Parte médico: ${medicalReport}.`,
  };
}
```

(No usamos Claude Sonnet para estos dos porque el output es determinista y siempre va a `REVISAR_MANUALMENTE`. Se puede mejorar luego.)

- [ ] **Step 5: Verificar con curl que los 2 nuevos tipos responden**

```bash
curl -X POST http://localhost:3000/api/verify -H 'Content-Type: application/json' \
  -d '{"tipo":"equipaje","luggageType":"lost","luggageValue":"800","pirDone":"yes"}'
# Expected: status: REVISAR_MANUALMENTE, regulation: Convenio de Montreal

curl -X POST http://localhost:3000/api/verify -H 'Content-Type: application/json' \
  -d '{"tipo":"lesiones","injuryType":"turbulencia","medicalReport":"yes","injuryDescription":"espalda"}'
# Expected: status: REVISAR_MANUALMENTE, referencia art 17.1
```

- [ ] **Step 6: Commit**

```bash
git add lib/agent.js
git commit -m "feat: agent analiza equipaje y lesiones (Convenio de Montreal)"
```

---

## Task 31: Extender `lib/validateDocs.js` con PIR y parte médico + función `validateSingle`

**Files:**
- Modify: `lib/validateDocs.js`

- [ ] **Step 1: Leer el archivo actual (152 líneas)**

- [ ] **Step 2: Añadir los nuevos tipos al diccionario de prompts**

El archivo probablemente tiene un mapa de prompts por tipo de documento para Claude Vision. Añadir:

```javascript
const DOC_PROMPTS = {
  // ... existentes: dni, boarding, booking, receipts ...
  pir: `Analiza esta imagen. ¿Es un PIR (Property Irregularity Report / parte de irregularidad de equipaje) emitido por una aerolínea o aeropuerto?
Verifica:
- Membrete de aerolínea o aeropuerto
- Número de referencia del PIR
- Fecha del incidente
- Descripción del equipaje (perdido/dañado/retrasado)
- Datos del pasajero
Devuelve JSON: { ok: boolean, reason: string, extracted: { pirRef, date, status, description } }`,

  medical: `Analiza esta imagen. ¿Es un parte/informe médico emitido por un profesional sanitario?
Verifica:
- Membrete o sello de centro médico/hospital
- Nombre del médico y su número de colegiado
- Fecha del informe
- Diagnóstico o descripción de la lesión
- Datos del paciente
Devuelve JSON: { ok: boolean, reason: string, extracted: { doctorName, date, diagnosis, patientName } }`,
};
```

- [ ] **Step 3: Añadir exportación `validateSingle` (usada por Task 24)**

```javascript
export async function validateSingle(docType, dataUrl, caseData) {
  const prompt = DOC_PROMPTS[docType];
  if (!prompt) return { ok: false, error: `Tipo de documento desconocido: ${docType}` };

  // Reutiliza la función interna que ya llama a Claude Vision con un único documento
  // (si no existe como función aislada, extraerla del loop actual)
  try {
    const result = await callClaudeVision(prompt, dataUrl);
    // Opcional: coherencia con caseData (nombres, fechas)
    if (caseData && result.extracted) {
      // sanity check: si el doc es DNI y el nombre no matchea aprox, error
      // (mantenerlo simple, no bloquear por falsos positivos)
    }
    return result;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
```

Si `callClaudeVision` no existe aislada, refactorizar el archivo para extraerla del loop existente y reutilizarla en ambos sitios (validación bulk + validación individual). DRY.

- [ ] **Step 4: Test rápido**

Subir una imagen cualquiera como PIR en `/aportar-documentos?d=<token-equipaje>` → ver que Claude Vision responde (probablemente rechazará cualquier imagen que no sea un PIR real).

- [ ] **Step 5: Commit**

```bash
git add lib/validateDocs.js
git commit -m "feat: validateDocs soporta PIR y parte medico + validateSingle"
```

---

## Task 32: Ampliar emails en `lib/email.js` para los 2 nuevos tipos

**Files:**
- Modify: `lib/email.js`

- [ ] **Step 1: Leer el archivo actual (286 líneas)**

El archivo tiene templates HTML de los emails (caso recibido al usuario, caso al equipo, docs validados, etc.).

- [ ] **Step 2: Añadir variables condicionales por tipo**

En cada template que referencia "CE 261/2004" o "compensación", añadir un bloque condicional:

```javascript
function regulationCopy(tipo) {
  if (tipo === 'equipaje') return {
    regulation: 'Convenio de Montreal',
    intro: 'Tu incidencia con el equipaje está cubierta por el Convenio de Montreal (responsabilidad del transportista aéreo).',
    maxMention: 'El límite máximo es de aproximadamente 1.600€ por pasajero, pero la cantidad final depende de la documentación.',
  };
  if (tipo === 'lesiones') return {
    regulation: 'Convenio de Montreal (art. 17)',
    intro: 'Las lesiones sufridas durante el embarque, vuelo o desembarque están cubiertas por el Convenio de Montreal con responsabilidad objetiva de la aerolínea.',
    maxMention: 'El importe varía según la gravedad y la documentación médica aportada.',
  };
  // default CE 261/2004
  return {
    regulation: 'Reglamento (CE) 261/2004',
    intro: 'Tu caso está cubierto por la normativa europea de derechos del pasajero.',
    maxMention: 'La compensación puede alcanzar los 600€ por pasajero según la distancia del vuelo.',
  };
}
```

Usar `regulationCopy(tipo)` dentro de los templates existentes para reemplazar las menciones hardcoded a CE 261/2004.

- [ ] **Step 3: Verificar que los emails de casos antiguos (retraso, cancelación) siguen igual**

Probar el flujo completo con un caso de retraso → el email debe seguir mencionando CE 261/2004 como siempre.

Probar el flujo con un caso de equipaje → el email debe mencionar Convenio de Montreal.

- [ ] **Step 4: Commit**

```bash
git add lib/email.js
git commit -m "feat: email templates adaptados por tipo (CE 261 / Montreal)"
```

---

## Task 33: Test end-to-end completo de los 6 tipos

**Files:** (no file changes — smoke test)

- [ ] **Step 1: Probar los 6 flujos en el navegador**

Para cada tipo, recorrer el wizard completo hasta el email:
- retraso → RECLAMABLE esperado para un vuelo con retraso real
- cancelacion → RECLAMABLE
- conexion → según lógica
- overbooking → RECLAMABLE
- equipaje (con PIR) → REVISAR_MANUALMENTE, email Montreal
- lesiones (con parte médico) → REVISAR_MANUALMENTE, email Montreal

Documentar cualquier fallo en un issue.

- [ ] **Step 2: Verificar responsive en 360, 600, 900, 1200 px**

Usar DevTools responsive mode. Ninguna sección debe romperse, overflow horizontal prohibido.

- [ ] **Step 3: Lighthouse audit**

Run DevTools Lighthouse en `/`, `/precios`, `/aportar-documentos`.
Objetivo: Performance ≥85, Accessibility ≥95.

- [ ] **Step 4: Commit un `RELEASE_NOTES.md` con lo que se ha hecho**

```bash
git add .
git commit -m "chore: smoke test e2e de los 6 tipos tras redesign"
```

---

# Apéndice — Post-checkpoint

Una vez completadas las 7 fases:

1. Run `npm run build` → debe compilar sin errores ni warnings críticos
2. Deploy a Vercel en branch → review visual en producción
3. Abrir PR con resumen: "Rediseño UI/UX completo + scope 6 tipos"

---

## Self-Review (completado por el autor del plan)

- **Spec coverage:** Cada sección del spec 2026-04-12 tiene uno o más tasks:
  - §3 Design system → Tasks 1-4
  - §4 Landing → Tasks 7-16
  - §5 Wizard → Tasks 17-22
  - §6 Docs page → Tasks 23-24
  - §7 Secondary pages → Tasks 25-28
  - §8 Nav/Footer → Tasks 5-6
  - §9 Backend 6 tipos → Tasks 29-32
  - §10 Orden → respetado fase a fase
  - §12 Criterios de éxito → Task 33

- **Placeholders:** Sin TBDs. Las únicas referencias "según cliente" son en textos legales (Task 27) — documentado como "preservar el contenido legal del archivo existente si lo hay".

- **Type consistency:** El catálogo `SERVICES` se crea en Task 10, referenciado por Tasks 18, 29. La función `validateSingle` se define en Task 31 y se consume en Task 24 (orden aceptable: Task 24 crea el stub, Task 31 completa). Los componentes `Button`, `Card`, `Badge` se crean en Task 3 y se usan a partir de Task 5.
