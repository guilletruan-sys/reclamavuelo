// pages/index.jsx
import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, BLUE, LIGHT_G, globalStyles, inputStyle, selectStyle } from '../lib/theme';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  { id: 'delay',        icon: '⏱️', label: 'Retraso',          desc: 'Tu vuelo llegó tarde a destino' },
  { id: 'cancellation', icon: '❌', label: 'Cancelación',      desc: 'Tu vuelo fue cancelado' },
  { id: 'connection',   icon: '🔄', label: 'Conexión perdida', desc: 'Perdiste un vuelo de conexión' },
  { id: 'overbooking',  icon: '🚫', label: 'Overbooking',      desc: 'Te denegaron el embarque' },
];

const AIRLINES = [
  { value: 'IB', label: 'Iberia' },
  { value: 'VY', label: 'Vueling' },
  { value: 'FR', label: 'Ryanair' },
  { value: 'UX', label: 'Air Europa' },
  { value: 'VW', label: 'Volotea' },
  { value: 'AF', label: 'Air France' },
  { value: 'LH', label: 'Lufthansa' },
  { value: 'BA', label: 'British Airways' },
  { value: 'U2', label: 'easyJet' },
  { value: 'W6', label: 'Wizz Air' },
  { value: 'TK', label: 'Turkish Airlines' },
  { value: 'EK', label: 'Emirates' },
  { value: 'OTHER', label: 'Otra compañía' },
];

const AIRPORTS = [
  // España
  { iata: 'MAD', name: 'Madrid Barajas',           region: '🇪🇸 España' },
  { iata: 'BCN', name: 'Barcelona El Prat',         region: '🇪🇸 España' },
  { iata: 'VLC', name: 'Valencia',                  region: '🇪🇸 España' },
  { iata: 'AGP', name: 'Málaga Costa del Sol',      region: '🇪🇸 España' },
  { iata: 'PMI', name: 'Palma de Mallorca',         region: '🇪🇸 España' },
  { iata: 'SVQ', name: 'Sevilla',                   region: '🇪🇸 España' },
  { iata: 'BIO', name: 'Bilbao',                    region: '🇪🇸 España' },
  { iata: 'LPA', name: 'Las Palmas (Gran Canaria)', region: '🇪🇸 España' },
  { iata: 'TFN', name: 'Tenerife Norte',            region: '🇪🇸 España' },
  { iata: 'TFS', name: 'Tenerife Sur',              region: '🇪🇸 España' },
  { iata: 'ALC', name: 'Alicante',                  region: '🇪🇸 España' },
  { iata: 'IBZ', name: 'Ibiza',                     region: '🇪🇸 España' },
  { iata: 'SDR', name: 'Santander',                 region: '🇪🇸 España' },
  { iata: 'VGO', name: 'Vigo',                      region: '🇪🇸 España' },
  { iata: 'OVD', name: 'Asturias',                  region: '🇪🇸 España' },
  { iata: 'ACE', name: 'Lanzarote',                 region: '🇪🇸 España' },
  { iata: 'FUE', name: 'Fuerteventura',             region: '🇪🇸 España' },
  { iata: 'GRX', name: 'Granada',                   region: '🇪🇸 España' },
  { iata: 'MAH', name: 'Menorca',                   region: '🇪🇸 España' },
  { iata: 'REU', name: 'Reus',                      region: '🇪🇸 España' },
  { iata: 'ZAZ', name: 'Zaragoza',                  region: '🇪🇸 España' },
  { iata: 'SCQ', name: 'Santiago de Compostela',    region: '🇪🇸 España' },
  { iata: 'XRY', name: 'Jerez de la Frontera',      region: '🇪🇸 España' },
  { iata: 'LEI', name: 'Almería',                   region: '🇪🇸 España' },
  { iata: 'MJV', name: 'Murcia',                    region: '🇪🇸 España' },
  { iata: 'EAS', name: 'San Sebastián',             region: '🇪🇸 España' },
  // Reino Unido e Irlanda
  { iata: 'LHR', name: 'Londres Heathrow',          region: '🇬🇧 Reino Unido' },
  { iata: 'LGW', name: 'Londres Gatwick',           region: '🇬🇧 Reino Unido' },
  { iata: 'STN', name: 'Londres Stansted',          region: '🇬🇧 Reino Unido' },
  { iata: 'LTN', name: 'Londres Luton',             region: '🇬🇧 Reino Unido' },
  { iata: 'MAN', name: 'Manchester',                region: '🇬🇧 Reino Unido' },
  { iata: 'EDI', name: 'Edimburgo',                 region: '🇬🇧 Reino Unido' },
  { iata: 'GLA', name: 'Glasgow',                   region: '🇬🇧 Reino Unido' },
  { iata: 'BHX', name: 'Birmingham',                region: '🇬🇧 Reino Unido' },
  { iata: 'DUB', name: 'Dublín',                    region: '🇬🇧 Reino Unido' },
  // Francia
  { iata: 'CDG', name: 'París Charles de Gaulle',   region: '🇫🇷 Francia' },
  { iata: 'ORY', name: 'París Orly',                region: '🇫🇷 Francia' },
  { iata: 'BVA', name: 'París Beauvais',            region: '🇫🇷 Francia' },
  { iata: 'NCE', name: 'Niza',                      region: '🇫🇷 Francia' },
  { iata: 'LYS', name: 'Lyon',                      region: '🇫🇷 Francia' },
  { iata: 'MRS', name: 'Marsella',                  region: '🇫🇷 Francia' },
  { iata: 'TLS', name: 'Toulouse',                  region: '🇫🇷 Francia' },
  { iata: 'BOD', name: 'Burdeos',                   region: '🇫🇷 Francia' },
  // Alemania
  { iata: 'FRA', name: 'Frankfurt',                 region: '🇩🇪 Alemania' },
  { iata: 'MUC', name: 'Múnich',                    region: '🇩🇪 Alemania' },
  { iata: 'BER', name: 'Berlín',                    region: '🇩🇪 Alemania' },
  { iata: 'HAM', name: 'Hamburgo',                  region: '🇩🇪 Alemania' },
  { iata: 'DUS', name: 'Düsseldorf',                region: '🇩🇪 Alemania' },
  { iata: 'STR', name: 'Stuttgart',                 region: '🇩🇪 Alemania' },
  { iata: 'CGN', name: 'Colonia',                   region: '🇩🇪 Alemania' },
  // Benelux
  { iata: 'AMS', name: 'Ámsterdam Schiphol',        region: '🇳🇱 Países Bajos' },
  { iata: 'BRU', name: 'Bruselas',                  region: '🇧🇪 Bélgica' },
  // Suiza / Austria
  { iata: 'ZRH', name: 'Zúrich',                    region: '🇨🇭 Suiza / Austria' },
  { iata: 'GVA', name: 'Ginebra',                   region: '🇨🇭 Suiza / Austria' },
  { iata: 'VIE', name: 'Viena',                     region: '🇨🇭 Suiza / Austria' },
  // Italia
  { iata: 'FCO', name: 'Roma Fiumicino',            region: '🇮🇹 Italia' },
  { iata: 'MXP', name: 'Milán Malpensa',            region: '🇮🇹 Italia' },
  { iata: 'LIN', name: 'Milán Linate',              region: '🇮🇹 Italia' },
  { iata: 'NAP', name: 'Nápoles',                   region: '🇮🇹 Italia' },
  { iata: 'VCE', name: 'Venecia',                   region: '🇮🇹 Italia' },
  { iata: 'BLQ', name: 'Bolonia',                   region: '🇮🇹 Italia' },
  { iata: 'CTA', name: 'Catania',                   region: '🇮🇹 Italia' },
  { iata: 'PMO', name: 'Palermo',                   region: '🇮🇹 Italia' },
  // Portugal
  { iata: 'LIS', name: 'Lisboa',                    region: '🇵🇹 Portugal' },
  { iata: 'OPO', name: 'Oporto',                    region: '🇵🇹 Portugal' },
  { iata: 'FAO', name: 'Faro',                      region: '🇵🇹 Portugal' },
  // Escandinavia
  { iata: 'CPH', name: 'Copenhague',                region: '🇸🇪 Escandinavia' },
  { iata: 'ARN', name: 'Estocolmo Arlanda',         region: '🇸🇪 Escandinavia' },
  { iata: 'OSL', name: 'Oslo',                      region: '🇸🇪 Escandinavia' },
  { iata: 'HEL', name: 'Helsinki',                  region: '🇸🇪 Escandinavia' },
  // Europa del Este
  { iata: 'WAW', name: 'Varsovia',                  region: '🌍 Europa del Este' },
  { iata: 'KRK', name: 'Cracovia',                  region: '🌍 Europa del Este' },
  { iata: 'BUD', name: 'Budapest',                  region: '🌍 Europa del Este' },
  { iata: 'PRG', name: 'Praga',                     region: '🌍 Europa del Este' },
  { iata: 'ATH', name: 'Atenas',                    region: '🌍 Europa del Este' },
  { iata: 'SKG', name: 'Tesalónica',                region: '🌍 Europa del Este' },
  { iata: 'SOF', name: 'Sofía',                     region: '🌍 Europa del Este' },
  { iata: 'OTP', name: 'Bucarest',                  region: '🌍 Europa del Este' },
  { iata: 'IST', name: 'Estambul',                  region: '🌍 Europa del Este' },
  { iata: 'SAW', name: 'Estambul Sabiha Gökçen',    region: '🌍 Europa del Este' },
  { iata: 'AYT', name: 'Antalya',                   region: '🌍 Europa del Este' },
  // África del Norte
  { iata: 'CMN', name: 'Casablanca',                region: '🌍 África del Norte' },
  { iata: 'RAK', name: 'Marrakech',                 region: '🌍 África del Norte' },
  { iata: 'TNG', name: 'Tánger',                    region: '🌍 África del Norte' },
  { iata: 'CAI', name: 'El Cairo',                  region: '🌍 África del Norte' },
  { iata: 'TUN', name: 'Túnez',                     region: '🌍 África del Norte' },
  // América
  { iata: 'JFK', name: 'Nueva York JFK',            region: '🌎 América' },
  { iata: 'EWR', name: 'Nueva York Newark',         region: '🌎 América' },
  { iata: 'MIA', name: 'Miami',                     region: '🌎 América' },
  { iata: 'ORD', name: 'Chicago',                   region: '🌎 América' },
  { iata: 'LAX', name: 'Los Ángeles',               region: '🌎 América' },
  { iata: 'BOS', name: 'Boston',                    region: '🌎 América' },
  { iata: 'ATL', name: 'Atlanta',                   region: '🌎 América' },
  { iata: 'DFW', name: 'Dallas',                    region: '🌎 América' },
  { iata: 'YYZ', name: 'Toronto',                   region: '🌎 América' },
  { iata: 'YUL', name: 'Montreal',                  region: '🌎 América' },
  { iata: 'MEX', name: 'Ciudad de México',          region: '🌎 América' },
  { iata: 'CUN', name: 'Cancún',                    region: '🌎 América' },
  { iata: 'BOG', name: 'Bogotá',                    region: '🌎 América' },
  { iata: 'LIM', name: 'Lima',                      region: '🌎 América' },
  { iata: 'EZE', name: 'Buenos Aires',              region: '🌎 América' },
  { iata: 'GRU', name: 'São Paulo',                 region: '🌎 América' },
  { iata: 'SCL', name: 'Santiago de Chile',         region: '🌎 América' },
  { iata: 'UIO', name: 'Quito',                     region: '🌎 América' },
  { iata: 'HAV', name: 'La Habana',                 region: '🌎 América' },
  { iata: 'SDQ', name: 'Santo Domingo',             region: '🌎 América' },
  { iata: 'PTY', name: 'Ciudad de Panamá',          region: '🌎 América' },
  { iata: 'MDE', name: 'Medellín',                  region: '🌎 América' },
  // Oriente Medio
  { iata: 'DXB', name: 'Dubái',                     region: '🌍 Oriente Medio' },
  { iata: 'DOH', name: 'Doha',                      region: '🌍 Oriente Medio' },
  { iata: 'AUH', name: 'Abu Dabi',                  region: '🌍 Oriente Medio' },
  { iata: 'RUH', name: 'Riad',                      region: '🌍 Oriente Medio' },
  { iata: 'TLV', name: 'Tel Aviv',                  region: '🌍 Oriente Medio' },
  { iata: 'AMM', name: 'Amán',                      region: '🌍 Oriente Medio' },
  // Asia
  { iata: 'BKK', name: 'Bangkok Suvarnabhumi',      region: '🌏 Asia' },
  { iata: 'HKG', name: 'Hong Kong',                 region: '🌏 Asia' },
  { iata: 'NRT', name: 'Tokio Narita',              region: '🌏 Asia' },
  { iata: 'HND', name: 'Tokio Haneda',              region: '🌏 Asia' },
  { iata: 'ICN', name: 'Seúl Incheon',              region: '🌏 Asia' },
  { iata: 'SIN', name: 'Singapur',                  region: '🌏 Asia' },
  { iata: 'KUL', name: 'Kuala Lumpur',              region: '🌏 Asia' },
  { iata: 'PEK', name: 'Pekín',                     region: '🌏 Asia' },
  { iata: 'PVG', name: 'Shanghái Pudong',           region: '🌏 Asia' },
  { iata: 'BOM', name: 'Mumbai',                    region: '🌏 Asia' },
  { iata: 'DEL', name: 'Nueva Delhi',               region: '🌏 Asia' },
  { iata: 'DPS', name: 'Bali',                      region: '🌏 Asia' },
  // Oceanía / África subsahariana
  { iata: 'SYD', name: 'Sídney',                    region: '🌏 Oceanía' },
  { iata: 'MEL', name: 'Melbourne',                 region: '🌏 Oceanía' },
  { iata: 'JNB', name: 'Johannesburgo',             region: '🌍 África' },
  { iata: 'CPT', name: 'Ciudad del Cabo',           region: '🌍 África' },
];

// Group airports by region for optgroup
const AIRPORT_GROUPS = AIRPORTS.reduce((acc, a) => {
  if (!acc[a.region]) acc[a.region] = [];
  acc[a.region].push(a);
  return acc;
}, {});

// ── LOCAL STYLE OVERRIDES ─────────────────────────────────────────────────────

// ── AUXILIARY COMPONENTS ──────────────────────────────────────────────────────

function StepIndicator({ current }) {
  const steps = ['Incidencia', 'Vuelo', 'Verificación', 'Tus datos', 'Confirmado'];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, fontFamily: 'Syne, sans-serif',
                background: done ? GREEN : active ? BLUE : '#e2e8f0',
                color: done || active ? '#fff' : '#64748b',
                boxShadow: active ? `0 0 0 4px rgba(26,86,219,0.15)` : 'none',
                transition: 'all 0.3s',
              }}>{done ? '✓' : n}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? BLUE : done ? GREEN : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 2, background: done ? GREEN : '#e2e8f0', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: '#94a3b8' }}>{hint}</span>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = GREEN}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      {...props}
    />
  );
}

function AirportSelect({ value, onChange, placeholder }) {
  return (
    <select
      style={selectStyle}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.style.borderColor = GREEN}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
    >
      <option value="">{placeholder || 'Selecciona aeropuerto...'}</option>
      {Object.entries(AIRPORT_GROUPS).map(([region, airports]) => (
        <optgroup key={region} label={region}>
          {airports.map(a => (
            <option key={a.iata} value={a.iata}>{a.iata} — {a.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function Select({ children, ...props }) {
  return <select style={selectStyle} {...props}>{children}</select>;
}

function Alert({ type = 'info', children }) {
  const colors = {
    info:    { bg: 'rgba(26,86,219,0.07)',   border: BLUE,    color: '#1a3a8f' },
    warn:    { bg: 'rgba(245,158,11,0.1)',   border: '#f59e0b', color: '#78350f' },
    success: { bg: LIGHT_G,                  border: GREEN,   color: '#065f46' },
    error:   { bg: 'rgba(239,68,68,0.1)',    border: '#ef4444', color: '#7f1d1d' },
  };
  const c = colors[type];
  return (
    <div style={{ padding: '11px 14px', borderRadius: 8, background: c.bg, borderLeft: `3px solid ${c.border}`, color: c.color, fontSize: 13.5, lineHeight: 1.6, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      {children}
    </div>
  );
}

function Btn({ variant = 'primary', children, style = {}, ...props }) {
  const variants = {
    primary:   { background: GREEN,       color: '#fff' },
    blue:      { background: BLUE,        color: '#fff' },
    secondary: { background: 'transparent', color: GREEN, border: `1.5px solid ${GREEN}` },
    danger:    { background: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0' },
  };
  return (
    <button
      style={{
        padding: '13px 24px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 15, cursor: 'pointer', border: 'none', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s', ...variants[variant], ...style,
      }}
      {...props}
    >{children}</button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep]         = useState(1);
  const [incidentType, setType] = useState('');
  const [form, setForm]         = useState({
    flightNumber: '', date: '', origin: '', destination: '', airline: '',
    flightNumber2: '', samePNR: true, finalDestination: '',
    alternativeOffered: false, alternativeAccepted: '', alternativeArrival: '', cancellationNotice: '',
    airportCompensation: false,
    firstName: '', lastName: '', docNumber: '', phone: '', email: '',
    passengers: '1', comments: '',
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult]       = useState(null);
  const [caseRef, setCaseRef]     = useState('');
  const [sending, setSending]     = useState(false);
  const [hp, setHp]               = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const today = new Date().toISOString().split('T')[0];

  // Auto-fill airline prefix in flight number
  function handleAirlineChange(val) {
    set('airline', val);
    if (val && val !== 'OTHER') {
      const current = form.flightNumber;
      const prevCode = form.airline !== 'OTHER' ? form.airline : '';
      if (!current || current === prevCode) {
        set('flightNumber', val);
      }
    }
  }

  // ── Verification ──────────────────────────────────────────────────────────
  async function handleVerify() {
    if (hp) return;
    if (!form.flightNumber || !form.date || !form.origin || !form.destination || !form.airline) {
      alert('Por favor, completa todos los campos del vuelo.');
      return;
    }
    if (incidentType === 'connection' && (!form.flightNumber2 || !form.finalDestination)) {
      alert('Indica también el segundo vuelo y el destino final.');
      return;
    }

    setVerifying(true);
    setStep(3);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentType, demoMode: false, ...form }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setVerifying(false);
    }
  }

  // ── Final submission ───────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.docNumber || !form.phone || !form.email) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Introduce un email válido.');
      return;
    }

    setSending(true);
    const ref = 'RV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
    setCaseRef(ref);

    const f = document.getElementById('hiddenForm');
    document.getElementById('hf_ref').value       = ref;
    document.getElementById('hf_subject').value   = `[${ref}] ${incidentType.toUpperCase()}: ${form.flightNumber} — ${form.firstName} ${form.lastName}`;
    document.getElementById('hf_type').value      = incidentType;
    document.getElementById('hf_flight').value    = form.flightNumber;
    document.getElementById('hf_date').value      = form.date;
    document.getElementById('hf_route').value     = `${form.origin} → ${form.destination}`;
    document.getElementById('hf_decision').value  = result?.decision?.decision || 'N/D';
    document.getElementById('hf_comp').value      = result?.decision?.compensacion_estimada ? result.decision.compensacion_estimada + '€' : 'N/D';
    document.getElementById('hf_nombre').value    = `${form.firstName} ${form.lastName}`;
    document.getElementById('hf_doc').value       = form.docNumber;
    document.getElementById('hf_tel').value       = form.phone;
    document.getElementById('hf_email').value     = form.email;
    document.getElementById('hf_pax').value       = form.passengers;
    document.getElementById('hf_notes').value     = form.comments || 'Sin comentarios';
    document.getElementById('hf_reasoning').value = result?.decision?.razonamiento_interno || '';
    document.getElementById('hf_ts').value        = new Date().toLocaleString('es-ES');

    let iframe = document.getElementById('fs_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframe.name = 'fs_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    f.target = 'fs_iframe';
    f.submit();

    setSending(false);
    setStep(5);
  }

  // ── Decision render ────────────────────────────────────────────────────────
  function renderDecision() {
    if (!result) return null;
    if (result.error) return <Alert type="error">⚠️ {result.error}</Alert>;

    const d = result.decision;
    if (!d) return null;

    const isOk  = d.decision === 'RECLAMABLE';
    const isNo  = d.decision === 'NO_RECLAMABLE';

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>
          {isOk ? '✅' : isNo ? '❌' : '🔍'}
        </div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 10, color: isOk ? GREEN : isNo ? '#ef4444' : '#f59e0b' }}>
          {isOk ? '¡Tienes derecho a reclamar!' : isNo ? 'No es posible reclamar' : 'Revisión necesaria'}
        </h3>

        {d.confianza && (
          <span style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, marginBottom: 16, letterSpacing: 1 }}>
            Confianza: {d.confianza}
          </span>
        )}

        <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>{d.resumen_usuario}</p>

        {isOk && d.compensacion_estimada && (
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, #0f2356)`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, color: '#fff' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: GREEN }}>{d.compensacion_estimada}€</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Compensación estimada por pasajero</div>
          </div>
        )}

        {d.factores_clave?.length > 0 && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Factores analizados</div>
            {d.factores_clave.map((f, i) => (
              <div key={i} style={{ fontSize: 13.5, color: '#334155', padding: '4px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: isOk ? GREEN : '#94a3b8' }}>{isOk ? '✓' : '·'}</span> {f}
              </div>
            ))}
          </div>
        )}

        {result.demoMode && (
          <Alert type="warn">🎬 Modo demo activo — análisis simulado hasta activar las API keys reales.</Alert>
        )}
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>ReclamaVuelo — Reclama hasta 600€ por tu vuelo</title>
        <meta name="description" content="Reclamaciones de vuelos online. Retrasos, cancelaciones, overbooking. Sin costes iniciales. Cobramos solo si tú cobras." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{globalStyles}</style>
      <Nav />

      {/* ── HERO ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 50%, ${NAVY} 100%)`, padding: '80px 24px 96px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: `rgba(16,185,129,0.15)`, border: `1px solid rgba(16,185,129,0.4)`, color: GREEN, padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          ✈ Reglamento CE 261/2004
        </div>
        <h1 className="hero-title" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#fff', lineHeight: 1.1, marginBottom: 18 }}>
          Reclama tu vuelo,<br /><span style={{ color: GREEN }}>con un solo click</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 540, margin: '0 auto 16px', lineHeight: 1.7 }}>
          Retrasos, cancelaciones, overbooking o conexiones perdidas. Verificamos tu caso automáticamente con IA y datos reales.
        </p>
        <p style={{ color: GREEN, fontWeight: 700, fontSize: 15, marginBottom: 40 }}>
          Sin costes iniciales · Cobramos un 25% solo si tú cobras
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 48 }}>
          {[['600€', 'Indemnización máxima'], ['25%', 'Solo si ganamos'], ['4 min', 'Para reclamar'], ['IA', 'Análisis automático']].map(([n, l]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: GREEN }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <a href="#form" style={{
          display: 'inline-block', background: GREEN, color: '#fff',
          padding: '15px 36px', borderRadius: 10,
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
          boxShadow: `0 8px 24px rgba(16,185,129,0.4)`,
        }}>
          Comienza tu reclamación →
        </a>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <div id="como" style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Proceso</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Cómo funciona</h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>En menos de 4 minutos sabrás si tienes derecho a compensación.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="grid2">
            {[
              { n: '1', icon: '📋', title: 'Envía el formulario', desc: 'Rellena los datos de tu vuelo. Nuestro sistema analiza automáticamente tu caso con IA.' },
              { n: '2', icon: '⚖️', title: 'Nos ocupamos del resto', desc: 'Gestionamos la reclamación ante la aerolínea y, si es necesario, vía judicial. Sin que tengas que hacer nada.' },
              { n: '3', icon: '💰', title: 'Obtén tu indemnización', desc: 'Recibes la compensación directamente. Solo cobramos si tú cobras: 25% + IVA del importe obtenido.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center', padding: '32px 24px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${GREEN}, #059669)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      <div id="form" style={{ background: '#f0f9f4', padding: '72px 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Empieza aquí</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Comprueba tu reclamación</h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>Analizamos tu caso con IA combinando datos de vuelo reales, meteorología y legislación europea.</p>
          </div>

          <StepIndicator current={step} />

          <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>

            {/* ── STEP 1: Incident type ── */}
            {step === 1 && (
              <div className="fade-up">
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>¿Qué te ocurrió?</h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Selecciona el tipo de incidencia con tu vuelo.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }} className="grid2">
                  {INCIDENT_TYPES.map(t => (
                    <div key={t.id} onClick={() => setType(t.id)} style={{
                      padding: '20px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                      border: `2px solid ${incidentType === t.id ? GREEN : '#e2e8f0'}`,
                      background: incidentType === t.id ? LIGHT_G : '#fff',
                      boxShadow: incidentType === t.id ? `0 0 0 3px rgba(16,185,129,0.12)` : 'none',
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.label}</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.desc}</div>
                    </div>
                  ))}
                </div>

                <Btn onClick={() => incidentType ? setStep(2) : alert('Selecciona el tipo de incidencia.')}>
                  Continuar →
                </Btn>
              </div>
            )}

            {/* ── STEP 2: Flight data ── */}
            {step === 2 && (
              <div className="fade-up">
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                  {INCIDENT_TYPES.find(t => t.id === incidentType)?.icon} Datos del vuelo
                </h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                  Introduce la información del vuelo afectado.
                </p>

                {/* honeypot */}
                <div style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                  <input tabIndex={-1} value={hp} onChange={e => setHp(e.target.value)} name="company" autoComplete="off" />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <Field label="Compañía aérea *">
                    <Select value={form.airline} onChange={e => handleAirlineChange(e.target.value)}>
                      <option value="">Selecciona la compañía...</option>
                      {AIRLINES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </Select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <Field label="Número de vuelo *" hint="Se autorellena con el código de la compañía">
                    <Input value={form.flightNumber} onChange={e => set('flightNumber', e.target.value.toUpperCase())} placeholder="IB3456" maxLength={8} />
                  </Field>
                  <Field label="Fecha del vuelo *">
                    <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} max={today} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <Field label="Aeropuerto de origen *">
                    <AirportSelect value={form.origin} onChange={v => set('origin', v)} placeholder="Selecciona origen..." />
                  </Field>
                  <Field label="Aeropuerto de destino *">
                    <AirportSelect value={form.destination} onChange={v => set('destination', v)} placeholder="Selecciona destino..." />
                  </Field>
                </div>

                {/* Conexión */}
                {incidentType === 'connection' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: NAVY }}>🔄 Vuelo de conexión</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                      <Field label="Vuelo de conexión *">
                        <Input value={form.flightNumber2} onChange={e => set('flightNumber2', e.target.value.toUpperCase())} placeholder="IB5678" maxLength={8} />
                      </Field>
                      <Field label="Destino final *">
                        <AirportSelect value={form.finalDestination} onChange={v => set('finalDestination', v)} placeholder="Selecciona destino final..." />
                      </Field>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" id="samePNR" checked={form.samePNR} onChange={e => set('samePNR', e.target.checked)} style={{ width: 16, height: 16, accentColor: GREEN }} />
                      <label htmlFor="samePNR" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>Ambos vuelos estaban bajo el mismo número de reserva (PNR)</label>
                    </div>
                  </div>
                )}

                {/* Cancelación */}
                {incidentType === 'cancellation' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: NAVY }}>❌ Detalles de la cancelación</div>
                    <div style={{ marginBottom: 14 }}>
                      <Field label="¿Cuándo te informaron de la cancelación?">
                        <Select value={form.cancellationNotice} onChange={e => set('cancellationNotice', e.target.value)}>
                          <option value="">Selecciona...</option>
                          <option value="same_day">El mismo día del vuelo</option>
                          <option value="1_7_days">Entre 1 y 7 días antes</option>
                          <option value="7_14_days">Entre 7 y 14 días antes</option>
                          <option value="more_14_days">Más de 14 días antes</option>
                          <option value="unknown">No lo recuerdo</option>
                        </Select>
                      </Field>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: form.alternativeOffered ? 14 : 0 }}>
                      <input type="checkbox" id="altOff" checked={form.alternativeOffered} onChange={e => set('alternativeOffered', e.target.checked)} style={{ width: 16, height: 16, accentColor: GREEN }} />
                      <label htmlFor="altOff" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>La aerolínea me ofreció un vuelo alternativo</label>
                    </div>
                    {form.alternativeOffered && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }} className="grid2">
                        <Field label="¿Aceptaste el vuelo alternativo?">
                          <Select value={form.alternativeAccepted} onChange={e => set('alternativeAccepted', e.target.value)}>
                            <option value="">Selecciona...</option>
                            <option value="yes">Sí, lo acepté</option>
                            <option value="no">No, lo rechacé</option>
                          </Select>
                        </Field>
                        <Field label="Hora de llegada del alternativo" hint="Fecha y hora real de llegada">
                          <Input type="datetime-local" value={form.alternativeArrival} onChange={e => set('alternativeArrival', e.target.value)} />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {/* Overbooking */}
                {incidentType === 'overbooking' && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 14, color: NAVY }}>🚫 Detalles del overbooking</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" id="airComp" checked={form.airportCompensation} onChange={e => set('airportCompensation', e.target.checked)} style={{ width: 16, height: 16, accentColor: GREEN }} />
                      <label htmlFor="airComp" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>La aerolínea me ofreció compensación voluntaria en el aeropuerto</label>
                    </div>
                  </div>
                )}

                <Alert type="info">
                  ℹ️ <span>Verificaremos los datos reales del vuelo y condiciones meteorológicas mediante IA.</span>
                </Alert>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  <Btn onClick={handleVerify}>Verificar vuelo con IA →</Btn>
                  <Btn variant="secondary" onClick={() => setStep(1)}>← Volver</Btn>
                </div>
              </div>
            )}

            {/* ── STEP 3: Result ── */}
            {step === 3 && (
              <div className="fade-up">
                {verifying ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ width: 48, height: 48, border: `4px solid ${LIGHT_G}`, borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Analizando tu vuelo...</h4>
                    <p style={{ color: '#64748b', fontSize: 14 }}>Consultando datos de vuelo, METARs y agente IA</p>
                  </div>
                ) : result ? (
                  <div>
                    {renderDecision()}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                      {(result.decision?.decision === 'RECLAMABLE' || result.decision?.decision === 'REVISAR_MANUALMENTE') && (
                        <Btn onClick={() => setStep(4)}>💰 Iniciar reclamación →</Btn>
                      )}
                      <Btn variant="secondary" onClick={() => { setStep(1); setResult(null); setType(''); }}>← Probar con otro vuelo</Btn>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── STEP 4: Personal data ── */}
            {step === 4 && (
              <div className="fade-up">
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>👤 Tus datos personales</h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Necesitamos tus datos para gestionar la reclamación en tu nombre.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <Field label="Nombre *">
                    <Input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Tu nombre" />
                  </Field>
                  <Field label="Apellidos *">
                    <Input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Tus apellidos" />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <Field label="DNI/NIE/Pasaporte *">
                    <Input value={form.docNumber} onChange={e => set('docNumber', e.target.value)} placeholder="12345678A" />
                  </Field>
                  <Field label="Teléfono *">
                    <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" />
                  </Field>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Field label="Email *">
                    <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }} className="grid2">
                  <Field label="Nº de pasajeros afectados">
                    <Select value={form.passengers} onChange={e => set('passengers', e.target.value)}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'pasajero' : 'pasajeros'}</option>)}
                      <option value="5+">5 o más</option>
                    </Select>
                  </Field>
                  <Field label="Comentarios">
                    <Input value={form.comments} onChange={e => set('comments', e.target.value)} placeholder="Gastos adicionales, etc." />
                  </Field>
                </div>

                <Alert type="info">🔒 <span>Tus datos están protegidos bajo LOPD/RGPD y se usarán exclusivamente para gestionar tu reclamación.</span></Alert>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  <Btn onClick={handleSubmit} style={{ opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'Enviando...' : '🚀 Enviar reclamación'}
                  </Btn>
                  <Btn variant="secondary" onClick={() => setStep(3)}>← Volver al resultado</Btn>
                </div>
              </div>
            )}

            {/* ── STEP 5: Confirmation ── */}
            {step === 5 && (
              <div className="fade-up" style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: `linear-gradient(135deg, ${GREEN}, #059669)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px', boxShadow: `0 8px 24px rgba(16,185,129,0.3)` }}>✓</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: GREEN, marginBottom: 12 }}>¡Reclamación enviada!</h3>
                <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 6 }}>Hemos recibido tu caso. Te contactaremos en un máximo de 24 horas.</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>Referencia: <strong>{caseRef}</strong></p>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 14 }}>¿Qué ocurre ahora?</div>
                  {[
                    ['1', 'Análisis jurídico', 'Nuestros abogados estudian la viabilidad de tu caso.'],
                    ['2', 'Reclamación amistosa', 'Nos dirigimos a la aerolínea exigiendo la compensación.'],
                    ['3', 'Vía judicial si necesario', 'Si la aerolínea no responde, procedemos judicialmente.'],
                    ['4', 'Recibes tu dinero', 'Te transferimos la indemnización menos nuestra comisión del 25%+IVA.'],
                  ].map(([n, title, desc]) => (
                    <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ width: 26, height: 26, background: GREEN, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{n}</div>
                      <div><strong style={{ fontSize: 13 }}>{title}</strong> <span style={{ color: '#64748b', fontSize: 13 }}>— {desc}</span></div>
                    </div>
                  ))}
                </div>

                <Btn variant="secondary" onClick={() => {
                  setStep(1); setResult(null); setType('');
                  setForm(f => ({ ...f, flightNumber:'',date:'',origin:'',destination:'',airline:'',firstName:'',lastName:'',docNumber:'',phone:'',email:'',comments:'' }));
                }}>
                  Reclamar otro vuelo
                </Btn>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── SERVICIOS ── */}
      <div id="servicios" style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Cobertura</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>¿Qué reclamamos?</h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Cubrimos todas las incidencias contempladas en el Reglamento CE 261/2004.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="grid2">
            {[
              { icon: '⏱️', title: 'Retrasos', desc: 'Más de 3 horas en destino. Hasta 600€ por pasajero.' },
              { icon: '❌', title: 'Cancelaciones', desc: 'Sin aviso de 14 días. Compensación + reembolso o vuelo alternativo.' },
              { icon: '🔄', title: 'Conexión perdida', desc: 'Si ambos vuelos estaban en la misma reserva y causó retraso >3h.' },
              { icon: '🚫', title: 'Overbooking', desc: 'Denegación de embarque involuntaria. Derecho a compensación inmediata.' },
            ].map(s => (
              <div key={s.title} style={{ padding: '28px 20px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POR QUÉ NOSOTROS ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: `rgba(16,185,129,0.15)`, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Garantías</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Por qué elegirnos</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Te informamos de las posibilidades reales de tu reclamación y estarás al corriente de todo el proceso.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="grid2">
            {[
              { icon: '🤖', title: 'Análisis con IA', desc: 'Verificamos datos reales del vuelo, METARs y legislación CE 261/2004 de forma automática.' },
              { icon: '⚖️', title: 'Equipo jurídico', desc: 'Abogados especializados en reclamaciones aéreas disponibles por teléfono durante el proceso.' },
              { icon: '🔒', title: 'Sin riesgo', desc: 'Sin costes iniciales. Solo cobramos el 25%+IVA si obtenemos la compensación para ti.' },
              { icon: '📱', title: 'Todo online', desc: 'Gestión completamente online. Reclama en menos de 4 minutos desde cualquier dispositivo.' },
              { icon: '📊', title: 'Transparencia total', desc: 'Te mantenemos informado en cada paso del proceso, desde la reclamación hasta el cobro.' },
              { icon: '✈️', title: 'Todas las aerolíneas', desc: 'Reclamamos ante cualquier compañía que opere vuelos con origen o destino en la UE.' },
            ].map(s => (
              <div key={s.title} style={{ padding: '24px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── HIDDEN FORMSUBMIT FORM ── */}
      <form id="hiddenForm" action="https://formsubmit.co/guilletruan@gmail.com" method="POST" style={{ display: 'none' }}>
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha"  value="false" />
        <input type="hidden" id="hf_subject"   name="_subject" />
        <input type="hidden" id="hf_ref"        name="Referencia" />
        <input type="hidden" id="hf_type"       name="Tipo incidencia" />
        <input type="hidden" id="hf_flight"     name="Vuelo" />
        <input type="hidden" id="hf_date"       name="Fecha" />
        <input type="hidden" id="hf_route"      name="Ruta" />
        <input type="hidden" id="hf_decision"   name="Decision IA" />
        <input type="hidden" id="hf_comp"       name="Compensacion estimada" />
        <input type="hidden" id="hf_nombre"     name="Nombre" />
        <input type="hidden" id="hf_doc"        name="Documento" />
        <input type="hidden" id="hf_tel"        name="Telefono" />
        <input type="hidden" id="hf_email"      name="Email pasajero" />
        <input type="hidden" id="hf_pax"        name="Num pasajeros" />
        <input type="hidden" id="hf_notes"      name="Comentarios" />
        <input type="hidden" id="hf_reasoning"  name="Razonamiento IA" />
        <input type="hidden" id="hf_ts"         name="Timestamp" />
        <button type="submit">Enviar</button>
      </form>
    </>
  );
}
