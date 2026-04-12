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
