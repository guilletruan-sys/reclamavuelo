// pages/aviso-legal.jsx
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY } from '../lib/theme';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>{title}</h2>
      <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

export default function AvisoLegal() {
  return (
    <>
      <Head>
        <title>Aviso Legal — ReclamaVuelo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />

      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#fff', marginBottom: 12 }}>Aviso Legal</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
      </div>

      <div style={{ background: '#f0f9f4', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '48px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>

          <Section title="1. Datos identificativos del titular">
            <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), se informa que el titular del sitio web <strong>reclamavuelo.com</strong> es:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li><strong>Razón social:</strong> [Nombre empresa / Autónomo] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>NIF/CIF:</strong> [NIF] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>Domicilio social:</strong> [Dirección completa] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
              <li><strong>Email:</strong> info@reclamavuelo.com</li>
              <li><strong>Teléfono:</strong> [Teléfono] <em style={{ color: '#94a3b8' }}>(por añadir)</em></li>
            </ul>
          </Section>

          <Section title="2. Objeto y ámbito de aplicación">
            <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>reclamavuelo.com</strong>, su contenido y los servicios puestos a disposición de los usuarios. El acceso al sitio web implica la aceptación plena y sin reservas de todas y cada una de las condiciones establecidas en este Aviso Legal.</p>
          </Section>

          <Section title="3. Propiedad intelectual e industrial">
            <p>Todos los contenidos del sitio web (textos, imágenes, logotipos, código fuente, diseño gráfico, etc.) son propiedad del titular o de terceros que han autorizado su uso. Queda prohibida la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin autorización expresa por escrito.</p>
          </Section>

          <Section title="4. Exclusión de responsabilidad">
            <p>ReclamaVuelo no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse del acceso o uso del sitio web, ni de la información contenida en el mismo. El titular se reserva el derecho de modificar, suspender o interrumpir el acceso al sitio web sin necesidad de previo aviso.</p>
            <p style={{ marginTop: 12 }}>El análisis automatizado de reclamaciones proporcionado en este sitio tiene carácter informativo y orientativo. No constituye asesoramiento jurídico vinculante.</p>
          </Section>

          <Section title="5. Legislación aplicable y jurisdicción">
            <p>Las relaciones entre ReclamaVuelo y el usuario se regirán por la normativa española vigente. Para la resolución de controversias, ambas partes se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a los Juzgados y Tribunales del domicilio del usuario.</p>
          </Section>

          <Section title="6. Legislación de reclamaciones aéreas">
            <p>El servicio de reclamaciones se basa en el <strong>Reglamento (CE) nº 261/2004 del Parlamento Europeo y del Consejo</strong>, de 11 de febrero de 2004, por el que se establecen normas comunes sobre compensación y asistencia a los pasajeros aéreos en caso de denegación de embarque y de cancelación o gran retraso de los vuelos.</p>
          </Section>

        </div>
      </div>

      <Footer />
    </>
  );
}
