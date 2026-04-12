import Head from 'next/head';
import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    id: 'titular',
    title: '1. Datos identificativos del titular',
    html: `
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), se informa que el titular del sitio web <strong>reclamavuelo.com</strong> es:</p>
      <ul>
        <li><strong>Razón social:</strong> [Nombre empresa / Autónomo] <em>(por añadir)</em></li>
        <li><strong>NIF/CIF:</strong> [NIF] <em>(por añadir)</em></li>
        <li><strong>Domicilio social:</strong> [Dirección completa] <em>(por añadir)</em></li>
        <li><strong>Email:</strong> info@reclamavuelo.com</li>
        <li><strong>Teléfono:</strong> [Teléfono] <em>(por añadir)</em></li>
      </ul>
    `,
  },
  {
    id: 'objeto',
    title: '2. Objeto y ámbito de aplicación',
    html: `<p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>reclamavuelo.com</strong>, su contenido y los servicios puestos a disposición de los usuarios. El acceso al sitio web implica la aceptación plena y sin reservas de todas y cada una de las condiciones establecidas en este Aviso Legal.</p>`,
  },
  {
    id: 'propiedad',
    title: '3. Propiedad intelectual e industrial',
    html: `<p>Todos los contenidos del sitio web (textos, imágenes, logotipos, código fuente, diseño gráfico, etc.) son propiedad del titular o de terceros que han autorizado su uso. Queda prohibida la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin autorización expresa por escrito.</p>`,
  },
  {
    id: 'responsabilidad',
    title: '4. Exclusión de responsabilidad',
    html: `
      <p>ReclamaVuelo no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse del acceso o uso del sitio web, ni de la información contenida en el mismo. El titular se reserva el derecho de modificar, suspender o interrumpir el acceso al sitio web sin necesidad de previo aviso.</p>
      <p>El análisis automatizado de reclamaciones proporcionado en este sitio tiene carácter informativo y orientativo. No constituye asesoramiento jurídico vinculante.</p>
    `,
  },
  {
    id: 'legislacion',
    title: '5. Legislación aplicable y jurisdicción',
    html: `<p>Las relaciones entre ReclamaVuelo y el usuario se regirán por la normativa española vigente. Para la resolución de controversias, ambas partes se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a los Juzgados y Tribunales del domicilio del usuario.</p>`,
  },
  {
    id: 'reclamaciones',
    title: '6. Legislación de reclamaciones aéreas',
    html: `<p>El servicio de reclamaciones se basa en el <strong>Reglamento (CE) nº 261/2004 del Parlamento Europeo y del Consejo</strong>, de 11 de febrero de 2004, por el que se establecen normas comunes sobre compensación y asistencia a los pasajeros aéreos en caso de denegación de embarque y de cancelación o gran retraso de los vuelos.</p>`,
  },
];

export default function AvisoLegal() {
  return (
    <>
      <Head><title>Aviso Legal — ReclamaVuelo</title></Head>
      <LegalPage title="Aviso Legal" updated="Abril 2026" sections={SECTIONS} />
    </>
  );
}
