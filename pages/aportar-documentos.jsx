// pages/aportar-documentos.jsx
// Página de subida de documentos — acceso únicamente vía link del email
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, LIGHT_G, inputStyle } from '../lib/theme';

const DOCS_NEEDED = [
  { tipo: 'dni',      icon: '🪪', label: 'DNI o Pasaporte',         desc: 'Ambas caras. Debe estar en vigor en la fecha del vuelo.', accept: 'image/*,.pdf', required: true },
  { tipo: 'embarque', icon: '🎫', label: 'Tarjeta de embarque',      desc: 'Física o digital. PDF, foto o captura de pantalla.', accept: 'image/*,.pdf', required: true },
  { tipo: 'reserva',  icon: '📧', label: 'Confirmación de reserva',  desc: 'Email de confirmación o e-ticket de la aerolínea.', accept: 'image/*,.pdf', required: true },
  { tipo: 'iban',     icon: '🏦', label: 'Número de cuenta (IBAN)',  desc: 'Cualquier documento que muestre tu IBAN completo.', accept: 'image/*,.pdf', required: true },
  { tipo: 'gastos',   icon: '🧾', label: 'Gastos adicionales',       desc: 'Recibos de hotel, comida o transporte si los hubo.', accept: 'image/*,.pdf', required: false },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
  });
}

export default function AportarDocumentos() {
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [files, setFiles]       = useState({});
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    const { d } = router.query;
    if (!d) return;
    try {
      const decoded = JSON.parse(Buffer.from(d, 'base64').toString('utf-8'));
      setCaseData(decoded);
    } catch {
      setError('Enlace inválido. Usa el enlace que te enviamos por email.');
    }
  }, [router.query]);

  function handleFile(tipo, file) {
    if (!file) return;
    setFiles(prev => ({ ...prev, [tipo]: file }));
  }

  async function handleSubmit() {
    const requiredMissing = DOCS_NEEDED.filter(d => d.required && !files[d.tipo]);
    if (requiredMissing.length > 0) {
      alert(`Faltan documentos obligatorios: ${requiredMissing.map(d => d.label).join(', ')}`);
      return;
    }
    if (!caseData) return;

    setLoading(true);
    setError('');

    try {
      // Convert files to base64
      const filesPayload = [];
      for (const doc of DOCS_NEEDED) {
        if (files[doc.tipo]) {
          const { base64, mimeType } = await fileToBase64(files[doc.tipo]);
          filesPayload.push({ tipo: doc.tipo, base64, mimeType });
        }
      }

      const res = await fetch('/api/upload-docs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ caseData, files: filesPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar los documentos');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const allOk = result?.validaciones?.every(v => v.ok);

  return (
    <>
      <Head>
        <title>Aportar documentación — ReclamaVuelo</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />

      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,4vw,2.2rem)', color: '#fff', marginBottom: 12 }}>
          Aporta tu documentación
        </h1>
        {caseData && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            Caso <strong style={{ color: GREEN }}>{caseData.ref}</strong> · {caseData.nombre} · {caseData.vuelo}
          </p>
        )}
      </div>

      <div style={{ background: '#f0f9f4', padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 10, padding: '14px 16px', color: '#7f1d1d', fontSize: 14, marginBottom: 24 }}>
              ⚠️ {error}
            </div>
          )}

          {!caseData && !error && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
              Cargando datos del caso...
            </div>
          )}

          {caseData && !result && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: 28, padding: '16px', background: LIGHT_G, borderRadius: 10, borderLeft: `3px solid ${GREEN}` }}>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  <strong>Sube los documentos en cualquier formato</strong> (foto, PDF, captura de pantalla).
                  Asegúrate de que sean legibles y que toda la información sea visible.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {DOCS_NEEDED.map(doc => (
                  <div key={doc.tipo} style={{
                    border: `1.5px solid ${files[doc.tipo] ? GREEN : '#e2e8f0'}`,
                    borderRadius: 12, padding: '18px 20px',
                    background: files[doc.tipo] ? LIGHT_G : '#fff',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 20 }}>{doc.icon}</span>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>{doc.label}</span>
                          {doc.required
                            ? <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>OBLIGATORIO</span>
                            : <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>OPCIONAL</span>
                          }
                        </div>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{doc.desc}</p>
                        {files[doc.tipo] && (
                          <p style={{ fontSize: 12, color: GREEN, margin: '6px 0 0', fontWeight: 600 }}>
                            ✓ {files[doc.tipo].name}
                          </p>
                        )}
                      </div>
                      <label style={{
                        display: 'inline-block', cursor: 'pointer',
                        background: files[doc.tipo] ? GREEN : 'transparent',
                        color: files[doc.tipo] ? '#fff' : GREEN,
                        border: `1.5px solid ${GREEN}`,
                        padding: '8px 16px', borderRadius: 8,
                        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}>
                        {files[doc.tipo] ? 'Cambiar' : 'Subir archivo'}
                        <input
                          type="file"
                          accept={doc.accept}
                          style={{ display: 'none' }}
                          onChange={e => handleFile(doc.tipo, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: 28, width: '100%', background: loading ? '#94a3b8' : GREEN,
                  color: '#fff', border: 'none', borderRadius: 10, padding: '14px 24px',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Validando documentos con IA...
                  </span>
                ) : 'Enviar documentación →'}
              </button>

              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                🔒 Tus documentos se procesan de forma segura y cifrada.
              </p>
            </div>
          )}

          {result && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: allOk ? `linear-gradient(135deg, ${GREEN}, #059669)` : 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, margin: '0 auto 20px', color: '#fff',
                boxShadow: allOk ? '0 8px 24px rgba(16,185,129,0.3)' : '0 8px 24px rgba(245,158,11,0.3)',
              }}>
                {allOk ? '✓' : '!'}
              </div>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: allOk ? GREEN : '#f59e0b', marginBottom: 10 }}>
                {allOk ? 'Documentación validada' : 'Revisa algunos documentos'}
              </h2>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                {allOk
                  ? 'Hemos recibido y validado toda tu documentación. Te hemos enviado un email de confirmación.'
                  : 'Algunos documentos necesitan corrección. Revisa los puntos indicados y vuelve a subir los que tengan problemas.'}
              </p>

              <div style={{ textAlign: 'left', marginBottom: 24 }}>
                {result.validaciones.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 20 }}>{v.ok ? '✅' : '⚠️'}</span>
                    <div>
                      <strong style={{ fontSize: 14, color: NAVY }}>{v.nombre}</strong>
                      <p style={{ fontSize: 13, color: v.ok ? '#10b981' : '#f59e0b', margin: '3px 0 0' }}>{v.mensaje}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!allOk && (
                <button onClick={() => setResult(null)} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Volver a subir documentos
                </button>
              )}

              {allOk && (
                <div style={{ background: LIGHT_G, borderRadius: 10, padding: 16, textAlign: 'left' }}>
                  <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    <strong>¿Qué ocurre ahora?</strong><br />
                    Nuestro equipo presentará la reclamación ante la aerolínea. Solo cobramos si tú cobras: 25%+IVA.
                    Te avisaremos de cada novedad por email.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
