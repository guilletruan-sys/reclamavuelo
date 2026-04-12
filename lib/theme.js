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
