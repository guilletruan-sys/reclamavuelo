import Head from 'next/head';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button } from '../components/ui';
import CaseSummary from '../components/docs/CaseSummary';
import DocSlot from '../components/docs/DocSlot';
import IbanInput from '../components/docs/IbanInput';

function parseToken(d) {
  try { return JSON.parse(atob(decodeURIComponent(d))); }
  catch { return null; }
}

const BASE_DOCS = [
  { id: 'dni',      icon: '🪪', label: 'DNI / Pasaporte',   hint: 'Foto clara de ambas caras', required: true },
  { id: 'boarding', icon: '🎫', label: 'Tarjeta de embarque', hint: 'La original con el código de barras', required: true },
  { id: 'booking',  icon: '📧', label: 'Confirmación de reserva', hint: 'Email o PDF con número de localizador', required: true },
];

// IBAN se renderiza como input, no como upload
const OPTIONAL_DOCS = [
  { id: 'receipts', icon: '🧾', label: 'Recibos de gastos extras', hint: 'Comidas, hotel, transporte alternativo', required: false },
];

const TIPO_EXTRA_DOCS = {
  equipaje: [{ id: 'pir', icon: '🧳', label: 'PIR (parte de irregularidad)', hint: 'Documento que te dieron al denunciar el equipaje en el aeropuerto', required: true }],
  lesiones: [{ id: 'medical', icon: '🏥', label: 'Parte médico', hint: 'Informe del hospital o médico que te atendió', required: true }],
};

export default function AportarDocumentos() {
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [files, setFiles] = useState({}); // id -> { file, status, error }
  const [iban, setIban] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (router.query.d) {
      const data = parseToken(router.query.d);
      if (data) setCaseData(data);
    }
  }, [router.query.d]);

  const tipo = caseData?.tipo;
  const docs = useMemo(() => [...BASE_DOCS, ...(TIPO_EXTRA_DOCS[tipo] || []), ...OPTIONAL_DOCS], [tipo]);

  const validDocsCount = docs.filter(d => files[d.id]?.status === 'ok').length;
  const requiredCount = docs.filter(d => d.required).length;
  const allRequiredOk = docs.filter(d => d.required).every(d => files[d.id]?.status === 'ok');
  const canSubmit = allRequiredOk && iban && !submitting;

  const handleFile = async (docId, file) => {
    setFiles(prev => ({ ...prev, [docId]: { file, status: 'uploading' } }));
    try {
      const b64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'validating' } }));

      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validateOnly: true, docType: docId, dataUrl: b64, caseData }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Documento rechazado');
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'ok' } }));
    } catch (e) {
      setFiles(prev => ({ ...prev, [docId]: { file, status: 'error', error: e.message } }));
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        caseData, iban,
        files: Object.fromEntries(
          await Promise.all(Object.entries(files).filter(([_, f]) => f.status === 'ok').map(async ([id, f]) => {
            const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f.file); });
            return [id, { name: f.file.name, dataUrl: b64 }];
          }))
        ),
      };
      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al enviar documentación');
      setSubmitted(true);
    } catch (e) {
      alert(e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Head><title>Subir documentos — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: `${tokens.s7}px ${tokens.s5}px` }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: tokens.s8 }} className="fade-up">
            <div style={{
              width: 96, height: 96, borderRadius: tokens.rPill,
              background: tokens.green100, color: tokens.green600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', fontSize: 48,
            }}>✓</div>
            <h1 style={{ fontFamily: tokens.fontHead, fontSize: 32, marginTop: tokens.s4 }}>Documentación enviada</h1>
            <p style={{ color: tokens.slate500, marginTop: tokens.s3, maxWidth: 480, margin: `${tokens.s3}px auto 0` }}>
              Hemos recibido todo. Nuestro equipo revisará los documentos y te avisaremos cuando iniciemos la reclamación con la aerolínea.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: tokens.fontHead, fontSize: 32, fontWeight: 800, marginBottom: tokens.s2 }}>
              Sube tus documentos
            </h1>
            <p style={{ color: tokens.slate500, fontSize: 16, marginBottom: tokens.s5 }}>
              Necesitamos estos documentos para iniciar tu reclamación. Tardas 2-3 minutos.
            </p>

            <CaseSummary caseData={caseData} />

            <div style={{
              background: tokens.slate100, borderRadius: tokens.r1,
              padding: `${tokens.s2}px ${tokens.s3}px`, fontSize: 13, color: tokens.slate500,
              marginBottom: tokens.s4, fontWeight: 600,
            }}>{validDocsCount} de {requiredCount} documentos obligatorios subidos</div>

            {docs.map(d => (
              <DocSlot
                key={d.id}
                {...d}
                file={files[d.id]?.file}
                status={files[d.id]?.status}
                error={files[d.id]?.error}
                onFile={f => handleFile(d.id, f)}
              />
            ))}

            <IbanInput value={iban} onChange={setIban} />

            <Button
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              onClick={onSubmit}
              style={{ width: '100%', marginTop: tokens.s4 }}
            >
              {submitting ? 'Enviando…' : 'Enviar documentación →'}
            </Button>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
