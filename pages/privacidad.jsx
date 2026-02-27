// pages/privacidad.jsx
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, globalStyles } from '../lib/theme';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>{title}</h2>
      <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — ReclamaVuelo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{globalStyles}</style>
      <Nav />

      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#fff', marginBottom: 12 }}>Política de Privacidad</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
      </div>

      <div style={{ background: '#f0f9f4', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '48px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>

          <Section title="1. Responsable del tratamiento">
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Responsable:</strong> [Nombre empresa] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>NIF:</strong> [NIF] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>Dirección:</strong> [Dirección] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>Email de contacto:</strong> info@reclamavuelo.com</li>
            </ul>
          </Section>

          <Section title="2. Datos que recogemos y finalidad">
            <p>Recogemos los siguientes datos personales:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}><strong>Datos del formulario de reclamación</strong> (nombre, apellidos, DNI/pasaporte, email, teléfono, datos del vuelo): necesarios para gestionar y presentar la reclamación ante la aerolínea y, en su caso, ante la AESA o los tribunales.</li>
              <li style={{ marginBottom: 8 }}><strong>Datos del formulario de contacto</strong> (nombre, email, teléfono, mensaje): para atender las consultas recibidas.</li>
              <li style={{ marginBottom: 8 }}><strong>Datos de navegación</strong> (IP, cookies técnicas): para el correcto funcionamiento del sitio web.</li>
            </ul>
          </Section>

          <Section title="3. Base legal del tratamiento">
            <ul style={{ paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}><strong>Ejecución de contrato:</strong> para la gestión de la reclamación contratada.</li>
              <li style={{ marginBottom: 8 }}><strong>Interés legítimo:</strong> para mejorar nuestros servicios y atender consultas.</li>
              <li style={{ marginBottom: 8 }}><strong>Cumplimiento de obligaciones legales:</strong> conservación de documentación según normativa aplicable.</li>
            </ul>
          </Section>

          <Section title="4. Conservación de los datos">
            <p>Los datos se conservarán durante el tiempo necesario para gestionar la reclamación y, una vez finalizada, durante los plazos legalmente establecidos:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li>Datos de reclamaciones: hasta 5 años tras la resolución.</li>
              <li>Datos de contacto: hasta 2 años desde la última comunicación.</li>
            </ul>
          </Section>

          <Section title="5. Cesión de datos a terceros">
            <p>Los datos no se ceden a terceros salvo:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>A las aerolíneas reclamadas, en el marco de la gestión de la reclamación.</li>
              <li style={{ marginBottom: 8 }}>A la Agencia Estatal de Seguridad Aérea (AESA) si fuera necesario.</li>
              <li style={{ marginBottom: 8 }}>A los tribunales en caso de reclamación judicial.</li>
              <li style={{ marginBottom: 8 }}>A proveedores de servicios tecnológicos (Vercel, FormSubmit) bajo contratos de encargado del tratamiento.</li>
            </ul>
          </Section>

          <Section title="6. Tus derechos">
            <p>Tienes derecho a:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}><strong>Acceder</strong> a tus datos personales.</li>
              <li style={{ marginBottom: 6 }}><strong>Rectificar</strong> datos inexactos.</li>
              <li style={{ marginBottom: 6 }}><strong>Suprimir</strong> tus datos cuando ya no sean necesarios.</li>
              <li style={{ marginBottom: 6 }}><strong>Oponerte</strong> al tratamiento.</li>
              <li style={{ marginBottom: 6 }}><strong>Limitar</strong> el tratamiento.</li>
              <li style={{ marginBottom: 6 }}><strong>Portabilidad</strong> de tus datos.</li>
            </ul>
            <p style={{ marginTop: 12 }}>Para ejercer estos derechos, escríbenos a <strong>info@reclamavuelo.com</strong> indicando tu solicitud. También puedes reclamar ante la <strong>Agencia Española de Protección de Datos (aepd.es)</strong>.</p>
          </Section>

          <Section title="7. Seguridad">
            <p>Aplicamos medidas técnicas y organizativas para proteger tus datos personales contra el acceso no autorizado, la pérdida o la destrucción accidental, conforme al RGPD y la LOPDGDD.</p>
          </Section>

        </div>
      </div>

      <Footer />
    </>
  );
}
