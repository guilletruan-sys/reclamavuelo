// lib/theme.js — shared design constants

export const GREEN   = '#10b981';
export const NAVY    = '#0a1628';
export const BLUE    = '#1a56db';
export const LIGHT_G = 'rgba(16,185,129,0.08)';

export const inputStyle = {
  padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 15, fontFamily: 'DM Sans, sans-serif', color: NAVY,
  background: '#fff', width: '100%', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

export const selectStyle = { ...inputStyle };

export const globalStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #f0f9f4; color: ${NAVY}; }
  a { text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.5s ease both; }
  @media (max-width: 600px) {
    .grid2 { grid-template-columns: 1fr !important; }
    .grid3 { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
    .hero-title { font-size: 2rem !important; }
  }
`;
