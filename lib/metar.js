// lib/metar.js
// Consulta METARs históricos en aviationweather.gov (NOAA) — gratuito, sin key

/**
 * Obtiene METARs históricos para un aeropuerto en una fecha/hora concreta
 * Devuelve array de observaciones METAR en torno a la hora del vuelo
 */
export async function getMetars(icaoCode, dateLocal) {
  // Convertimos fecha local a rango UTC ±3h para cubrir el vuelo
  const dt = new Date(dateLocal);
  const from = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
  const to   = new Date(dt.getTime() + 1 * 60 * 60 * 1000);

  const fmt = (d) => d.toISOString().replace(/\.\d+Z$/, 'Z');

  const url = `https://aviationweather.gov/api/data/metar?ids=${icaoCode}&format=json&taf=false&hours=6&time=valid&startTime=${fmt(from)}&endTime=${fmt(to)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return []; // METAR no crítico — si falla, el agente trabaja sin él
  }
}

/**
 * Analiza si las condiciones meteorológicas eran adversas en los METARs
 * Devuelve un resumen para pasarle al agente Claude
 */
export function analyzeMetars(metars) {
  if (!metars || metars.length === 0) {
    return { available: false, summary: 'No hay datos METAR disponibles para esta fecha/aeropuerto.' };
  }

  const adverse = [];

  metars.forEach(m => {
    const raw = m.rawOb || m.raw_text || '';

    // Visibilidad baja (< 1500m)
    if (/\b[0-9]{3,4}\b/.test(raw) && parseInt(raw.match(/\b([0-9]{3,4})\b/)?.[1]) < 1500) {
      adverse.push(`Visibilidad reducida: ${raw.match(/\b([0-9]{3,4})\b/)?.[1]}m`);
    }

    // Techo bajo (BKN/OVC por debajo de 500ft)
    const ceilingMatch = raw.match(/(BKN|OVC)(\d{3})/g);
    if (ceilingMatch) {
      ceilingMatch.forEach(c => {
        const ft = parseInt(c.slice(3)) * 100;
        if (ft < 500) adverse.push(`Techo bajo: ${ft}ft`);
      });
    }

    // Fenómenos significativos
    const phenomena = {
      'TS':   'Tormenta',
      'TSRA': 'Tormenta con lluvia',
      'SN':   'Nieve',
      'FZRA': 'Lluvia engelante',
      'FZDZ': 'Llovizna engelante',
      'FG':   'Niebla densa',
      'LIFR': 'Condiciones IFR bajas',
      'VCTS': 'Tormenta en la vecindad',
      '+RA':  'Lluvia intensa',
      '+SN':  'Nieve intensa',
      'BLSN': 'Ventisca',
      'FC':   'Tornado/tromba',
    };

    Object.entries(phenomena).forEach(([code, desc]) => {
      if (raw.includes(code)) adverse.push(desc);
    });

    // Viento fuerte (> 25kt)
    const windMatch = raw.match(/\d{3}(\d{2,3})(G\d{2,3})?KT/);
    if (windMatch) {
      const speed = parseInt(windMatch[1]);
      const gust  = windMatch[2] ? parseInt(windMatch[2].slice(1)) : 0;
      if (speed > 25 || gust > 35) {
        adverse.push(`Viento fuerte: ${speed}kt${gust ? ' ráfagas ' + gust + 'kt' : ''}`);
      }
    }
  });

  const unique = [...new Set(adverse)];

  return {
    available:    true,
    adverseFound: unique.length > 0,
    conditions:   unique,
    summary:      unique.length > 0
      ? `Condiciones adversas detectadas: ${unique.join(', ')}.`
      : 'Sin condiciones meteorológicas adversas significativas en el momento del vuelo.',
    rawMetars:    metars.map(m => m.rawOb || m.raw_text || '').filter(Boolean),
  };
}
