import Head from 'next/head';
import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    id: 'responsable',
    title: '1. Responsable del tratamiento',
    html: `
      <ul>
        <li><strong>Responsable:</strong> [Nombre empresa] <em>(por añadir)</em></li>
        <li><strong>NIF:</strong> [NIF] <em>(por añadir)</em></li>
        <li><strong>Dirección:</strong> [Dirección] <em>(por añadir)</em></li>
        <li><strong>Email de contacto:</strong> info@reclamavuelo.com</li>
      </ul>
    `,
  },
  {
    id: 'datos',
    title: '2. Datos que recogemos y finalidad',
    html: `
      <p>Recogemos los siguientes datos personales:</p>
      <ul>
        <li><strong>Datos del formulario de reclamación</strong> (nombre, apellidos, DNI/pasaporte, email, teléfono, datos del vuelo): necesarios para gestionar y presentar la reclamación ante la aerolínea y, en su caso, ante la AESA o los tribunales.</li>
        <li><strong>Datos del formulario de contacto</strong> (nombre, email, teléfono, mensaje): para atender las consultas recibidas.</li>
        <li><strong>Datos de navegación</strong> (IP, cookies técnicas): para el correcto funcionamiento del sitio web.</li>
      </ul>
    `,
  },
  {
    id: 'base',
    title: '3. Base legal del tratamiento',
    html: `
      <ul>
        <li><strong>Ejecución de contrato:</strong> para la gestión de la reclamación contratada.</li>
        <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y atender consultas.</li>
        <li><strong>Cumplimiento de obligaciones legales:</strong> conservación de documentación según normativa aplicable.</li>
      </ul>
    `,
  },
  {
    id: 'conservacion',
    title: '4. Conservación de los datos',
    html: `
      <p>Los datos se conservarán durante el tiempo necesario para gestionar la reclamación y, una vez finalizada, durante los plazos legalmente establecidos:</p>
      <ul>
        <li>Datos de reclamaciones: hasta 5 años tras la resolución.</li>
        <li>Datos de contacto: hasta 2 años desde la última comunicación.</li>
      </ul>
    `,
  },
  {
    id: 'cesion',
    title: '5. Cesión de datos a terceros',
    html: `
      <p>Los datos no se ceden a terceros salvo:</p>
      <ul>
        <li>A las aerolíneas reclamadas, en el marco de la gestión de la reclamación.</li>
        <li>A la Agencia Estatal de Seguridad Aérea (AESA) si fuera necesario.</li>
        <li>A los tribunales en caso de reclamación judicial.</li>
        <li>A proveedores de servicios tecnológicos (Vercel, Resend, Anthropic, FlightStats, AviationStack, FormSubmit, NOAA) bajo contratos de encargado del tratamiento.</li>
      </ul>
    `,
  },
  {
    id: 'derechos',
    title: '6. Tus derechos',
    html: `
      <p>Tienes derecho a:</p>
      <ul>
        <li><strong>Acceder</strong> a tus datos personales.</li>
        <li><strong>Rectificar</strong> datos inexactos.</li>
        <li><strong>Suprimir</strong> tus datos cuando ya no sean necesarios.</li>
        <li><strong>Oponerte</strong> al tratamiento.</li>
        <li><strong>Limitar</strong> el tratamiento.</li>
        <li><strong>Portabilidad</strong> de tus datos.</li>
      </ul>
      <p>Para ejercer estos derechos, escríbenos a <strong>info@reclamavuelo.com</strong> indicando tu solicitud. También puedes reclamar ante la <strong>Agencia Española de Protección de Datos (aepd.es)</strong>.</p>
    `,
  },
  {
    id: 'seguridad',
    title: '7. Seguridad',
    html: `<p>Aplicamos medidas técnicas y organizativas para proteger tus datos personales contra el acceso no autorizado, la pérdida o la destrucción accidental, conforme al RGPD y la LOPDGDD.</p>`,
  },
];

export default function Privacidad() {
  return (
    <>
      <Head><title>Política de Privacidad — ReclamaVuelo</title></Head>
      <LegalPage title="Política de Privacidad" updated="Abril 2026" sections={SECTIONS} />
    </>
  );
}
