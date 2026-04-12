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
