import Head from 'next/head';
import LegalPage from '../components/LegalPage';

const tableStyle = `
  <div style="overflow-x:auto;margin-top:12px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#f0fdf4">
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#334155;border-bottom:2px solid #10b981">Nombre</th>
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#334155;border-bottom:2px solid #10b981">Proveedor</th>
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#334155;border-bottom:2px solid #10b981">Finalidad</th>
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#334155;border-bottom:2px solid #10b981">Duración</th>
        </tr>
      </thead>
`;

const SECTIONS = [
  {
    id: 'que-son',
    title: '¿Qué son las cookies?',
    html: `<p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas. Permiten al sitio recordar tus preferencias, mejorar tu experiencia y, en algunos casos, analizar el uso del sitio.</p>`,
  },
  {
    id: 'cuales',
    title: 'Cookies que utilizamos',
    html: `
      <p><strong>Cookies técnicas (necesarias)</strong></p>
      <p>Son imprescindibles para el funcionamiento del sitio. Sin ellas, el sitio no puede funcionar correctamente. No requieren tu consentimiento.</p>
      ${tableStyle}
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 14px;color:#475569">__session</td>
            <td style="padding:10px 14px;color:#475569">reclamavuelo.com</td>
            <td style="padding:10px 14px;color:#475569">Mantiene la sesión del usuario durante la navegación</td>
            <td style="padding:10px 14px;color:#475569">Sesión</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc">
            <td style="padding:10px 14px;color:#475569">_vercel_no_cache</td>
            <td style="padding:10px 14px;color:#475569">Vercel</td>
            <td style="padding:10px 14px;color:#475569">Control de caché del servidor</td>
            <td style="padding:10px 14px;color:#475569">Sesión</td>
          </tr>
        </tbody>
      </table></div>

      <p style="margin-top:24px"><strong>Cookies analíticas (opcionales)</strong></p>
      <p>Nos ayudan a entender cómo los usuarios interactúan con el sitio para mejorarlo. Solo se activan con tu consentimiento.</p>
      ${tableStyle}
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 14px;color:#475569">_ga</td>
            <td style="padding:10px 14px;color:#475569">Google Analytics</td>
            <td style="padding:10px 14px;color:#475569">Registra una ID para generar datos estadísticos de uso</td>
            <td style="padding:10px 14px;color:#475569">2 años</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc">
            <td style="padding:10px 14px;color:#475569">_gid</td>
            <td style="padding:10px 14px;color:#475569">Google Analytics</td>
            <td style="padding:10px 14px;color:#475569">Registra una ID para generar datos estadísticos de uso</td>
            <td style="padding:10px 14px;color:#475569">24 horas</td>
          </tr>
        </tbody>
      </table></div>
    `,
  },
  {
    id: 'gestion',
    title: 'Cómo gestionar las cookies',
    html: `
      <p>Puedes gestionar, bloquear o eliminar las cookies desde la configuración de tu navegador:</p>
      <ul>
        <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
        <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
        <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web</li>
        <li><strong>Edge:</strong> Configuración → Cookies y permisos de sitio</li>
      </ul>
      <p>Ten en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento del sitio web.</p>
    `,
  },
  {
    id: 'mas-info',
    title: 'Más información',
    html: `<p>Para cualquier duda sobre nuestra política de cookies, puedes contactarnos en <strong>info@reclamavuelo.com</strong> o consultar nuestra <a href="/privacidad" style="color:#059669;font-weight:600">Política de Privacidad</a>.</p>`,
  },
];

export default function Cookies() {
  return (
    <>
      <Head><title>Política de Cookies — ReclamaVuelo</title></Head>
      <LegalPage title="Política de Cookies" updated="Abril 2026" sections={SECTIONS} />
    </>
  );
}
