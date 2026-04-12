// pages/cookies.jsx
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, LIGHT_G } from '../lib/theme';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>{title}</h2>
      <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function CookieTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: LIGHT_G }}>
            {['Nombre', 'Proveedor', 'Finalidad', 'Duración'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#334155', borderBottom: `2px solid ${GREEN}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: '10px 14px', color: '#475569' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Política de Cookies — ReclamaVuelo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />

      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#fff', marginBottom: 12 }}>Política de Cookies</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
      </div>

      <div style={{ background: '#f0f9f4', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '48px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>

          <Section title="¿Qué son las cookies?">
            <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas. Permiten al sitio recordar tus preferencias, mejorar tu experiencia y, en algunos casos, analizar el uso del sitio.</p>
          </Section>

          <Section title="Cookies que utilizamos">
            <p><strong>Cookies técnicas (necesarias)</strong></p>
            <p style={{ marginTop: 8 }}>Son imprescindibles para el funcionamiento del sitio. Sin ellas, el sitio no puede funcionar correctamente. No requieren tu consentimiento.</p>
            <CookieTable rows={[
              ['__session', 'reclamavuelo.com', 'Mantiene la sesión del usuario durante la navegación', 'Sesión'],
              ['_vercel_no_cache', 'Vercel', 'Control de caché del servidor', 'Sesión'],
            ]} />

            <p style={{ marginTop: 24 }}><strong>Cookies analíticas (opcionales)</strong></p>
            <p style={{ marginTop: 8 }}>Nos ayudan a entender cómo los usuarios interactúan con el sitio para mejorarlo. Solo se activan con tu consentimiento.</p>
            <CookieTable rows={[
              ['_ga', 'Google Analytics', 'Registra una ID para generar datos estadísticos de uso', '2 años'],
              ['_gid', 'Google Analytics', 'Registra una ID para generar datos estadísticos de uso', '24 horas'],
            ]} />
          </Section>

          <Section title="Cómo gestionar las cookies">
            <p>Puedes gestionar, bloquear o eliminar las cookies desde la configuración de tu navegador:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
              <li style={{ marginBottom: 8 }}><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
              <li style={{ marginBottom: 8 }}><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web</li>
              <li style={{ marginBottom: 8 }}><strong>Edge:</strong> Configuración → Cookies y permisos de sitio</li>
            </ul>
            <p style={{ marginTop: 12 }}>Ten en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento del sitio web.</p>
          </Section>

          <Section title="Más información">
            <p>Para cualquier duda sobre nuestra política de cookies, puedes contactarnos en <strong>info@reclamavuelo.com</strong> o consultar nuestra <a href="/privacidad" style={{ color: GREEN, fontWeight: 600 }}>Política de Privacidad</a>.</p>
          </Section>

        </div>
      </div>

      <Footer />
    </>
  );
}
