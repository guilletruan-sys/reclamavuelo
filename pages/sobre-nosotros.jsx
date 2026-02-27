// pages/sobre-nosotros.jsx
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, LIGHT_G, globalStyles } from '../lib/theme';

export default function SobreNosotros() {
  return (
    <>
      <Head>
        <title>Sobre nosotros — ReclamaVuelo</title>
        <meta name="description" content="Conoce al equipo de ReclamaVuelo. Especialistas en reclamaciones aéreas bajo el Reglamento CE 261/2004." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{globalStyles}</style>
      <Nav />

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '72px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: GREEN, padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          Quiénes somos
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', lineHeight: 1.1, marginBottom: 18 }}>
          Recuperamos lo que<br /><span style={{ color: GREEN }}>te pertenece</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Somos especialistas en reclamaciones aéreas. Combinamos tecnología, inteligencia artificial y experiencia jurídica para conseguir la compensación que mereces.
        </p>
      </div>

      {/* MISIÓN */}
      <div style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="grid2">
          <div>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 16 }}>Nuestra misión</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>Que ningún pasajero se quede sin su compensación</h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              Cada año, millones de pasajeros europeos sufren retrasos, cancelaciones u overbooking sin recibir la compensación a la que tienen derecho bajo el Reglamento CE 261/2004.
            </p>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8 }}>
              En ReclamaVuelo hemos automatizado y simplificado el proceso para que cualquier persona pueda reclamar en menos de 4 minutos, sin conocimientos jurídicos y sin coste inicial.
            </p>
          </div>
          <div style={{ background: LIGHT_G, borderRadius: 20, padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: GREEN, marginBottom: 8 }}>+2.000</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Reclamaciones gestionadas</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: GREEN, marginBottom: 8 }}>94%</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Tasa de éxito</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: GREEN, marginBottom: 8 }}>600€</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>Máxima compensación obtenida</div>
          </div>
        </div>
      </div>

      {/* VALORES */}
      <div style={{ background: '#f0f9f4', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Valores</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800 }}>Lo que nos mueve</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="grid3">
            {[
              { icon: '🤝', title: 'Sin letra pequeña', desc: 'Solo cobramos si tú cobras. El 25%+IVA del importe obtenido, sin sorpresas ni costes ocultos.' },
              { icon: '⚡', title: 'Rapidez y eficacia', desc: 'Nuestra tecnología permite analizar tu caso en segundos y presentar la reclamación de forma inmediata.' },
              { icon: '🔍', title: 'Transparencia total', desc: 'Te mantenemos informado en cada fase del proceso. Sabrás siempre en qué punto está tu reclamación.' },
            ].map(v => (
              <div key={v.title} style={{ background: '#fff', borderRadius: 16, padding: '32px 24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EQUIPO */}
      <div style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: LIGHT_G, color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 14 }}>Equipo</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Las personas detrás de ReclamaVuelo</h2>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              {/* TODO: Añadir descripción real del equipo */}
              Un equipo multidisciplinar de abogados, ingenieros y especialistas en aviación comprometidos con los derechos de los pasajeros.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="grid3">
            {[
              { nombre: '[Nombre CEO]',     cargo: 'CEO & Fundador',      bio: 'Especialista en derecho aeronáutico con más de 10 años de experiencia en reclamaciones aéreas.' },
              { nombre: '[Nombre Abogado]', cargo: 'Director Jurídico',   bio: 'Abogado especializado en derecho del consumidor y legislación europea de transporte aéreo.' },
              { nombre: '[Nombre Tech]',    cargo: 'Director de Tecnología', bio: 'Responsable del desarrollo de la plataforma de análisis automático con IA.' },
            ].map(p => (
              <div key={p.nombre} style={{ textAlign: 'center', padding: '32px 20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#fff' }}>👤</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.nombre}</h3>
                <div style={{ color: GREEN, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>{p.cargo}</div>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>¿Tienes un vuelo que reclamar?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Comprueba en menos de 4 minutos si tienes derecho a compensación. Sin coste inicial.
        </p>
        <a href="/#form" style={{
          display: 'inline-block', background: GREEN, color: '#fff',
          padding: '15px 36px', borderRadius: 10,
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
          boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
        }}>
          Comienza tu reclamación →
        </a>
      </div>

      <Footer />
    </>
  );
}
