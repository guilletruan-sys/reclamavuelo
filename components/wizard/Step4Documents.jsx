import { useMemo, useState } from 'react';
import { tokens } from '../../lib/theme';
import { Button } from '../ui';
import DocSlot from '../docs/DocSlot';
import IbanInput from '../docs/IbanInput';

// Documentos base (todos los tipos de incidencia)
const BASE_DOCS = [
  { id: 'dni',      icon: '🪪', label: 'DNI / Pasaporte',   hint: 'Foto clara de ambas caras', required: true },
  { id: 'boarding', icon: '🎫', label: 'Tarjeta de embarque', hint: 'La original con el código de barras', required: true },
  { id: 'booking',  icon: '📧', label: 'Confirmación de reserva', hint: 'Email o PDF con número de localizador', required: true },
];

// Documentos específicos por tipo de incidencia
const TIPO_EXTRA_DOCS = {
  equipaje: [{ id: 'pir', icon: '🧳', label: 'PIR (parte de irregularidad)', hint: 'Documento que te dieron al denunciar el equipaje', required: true }],
  lesiones: [{ id: 'medical', icon: '🏥', label: 'Parte médico', hint: 'Informe del hospital o médico que te atendió', required: true }],
};

const OPTIONAL_DOCS = [
  { id: 'receipts', icon: '🧾', label: 'Recibos de gastos extras', hint: 'Comidas, hotel, transporte alternativo', required: false },
];

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Step4Documents({ tipo, caseRef, contact, flight, result, onBack, onDone, onSkip }) {
  const [files, setFiles] = useState({});
  const [iban, setIban]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const docs = useMemo(
    () => [...BASE_DOCS, ...(TIPO_EXTRA_DOCS[tipo] || []), ...OPTIONAL_DOCS],
    [tipo]
  );

  const requiredDocs = docs.filter(d => d.required);
  const validRequiredCount = requiredDocs.filter(d => files[d.id]?.status === 'ok').length;
  const allRequiredOk = requiredDocs.every(d => files[d.id]?.status === 'ok');
  const canSubmit = allRequiredOk && iban && !submitting;

  const handleFile = async (docId, file) => {
    setFiles(p => ({ ...p, [docId]: { file, status: 'uploading' } }));
    try {
      const dataUrl = await fileToDataUrl(file);
      setFiles(p => ({ ...p, [docId]: { file, dataUrl, status: 'validating' } }));
      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validateOnly: true,
          docType: docId,
          dataUrl,
          caseData: { ref: caseRef, ...flight, ...contact },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Documento rechazado');
      setFiles(p => ({ ...p, [docId]: { file, dataUrl, status: 'ok' } }));
    } catch (e) {
      setFiles(p => ({ ...p, [docId]: { file, status: 'error', error: e.message } }));
    }
  };

  const onFinalize = async () => {
    setSubmitting(true); setError(null);
    try {
      // Empaquetar files válidos como dataUrls
      const attachments = {};
      for (const [id, f] of Object.entries(files)) {
        if (f.status === 'ok' && f.dataUrl) {
          attachments[id] = { name: f.file.name, dataUrl: f.dataUrl };
        }
      }
      const res = await fetch('/api/finalize-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: caseRef,
          tipo,
          contact,
          flight,
          result,
          iban,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error enviando expediente');
      onDone();
    } catch (e) {
      setError(e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: tokens.fontHead, fontSize: 24, marginBottom: tokens.s2, color: tokens.navy900 }}>
        Sube tus documentos
      </h2>
      <p style={{ color: tokens.slate500, fontSize: 15, marginBottom: tokens.s4 }}>
        Necesitamos estos documentos para iniciar tu reclamación. Se validan con IA al subirlos.
      </p>

      <div style={{
        background: tokens.slate50, borderRadius: tokens.r1,
        padding: `${tokens.s2}px ${tokens.s3}px`,
        fontSize: 13, color: tokens.slate500, marginBottom: tokens.s4, fontWeight: 600,
      }}>
        {validRequiredCount} de {requiredDocs.length} documentos obligatorios verificados
      </div>

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

      {error && (
        <div style={{
          background: tokens.red50, color: tokens.red500, padding: tokens.s3,
          borderRadius: tokens.r1, fontSize: 14, marginTop: tokens.s3,
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: tokens.s3, marginTop: tokens.s5, alignItems: 'center' }}>
        <Button variant="ghost" onClick={onBack} disabled={submitting}>← Atrás</Button>
        <div style={{ flex: 1 }} />
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            style={{
              background: 'transparent', border: 'none', color: tokens.slate500,
              fontSize: 13, fontWeight: 600, cursor: submitting ? 'default' : 'pointer',
              textDecoration: 'underline', padding: '8px 12px',
            }}
          >
            Subirlos por email más tarde
          </button>
        )}
        <Button variant="primary" disabled={!canSubmit} onClick={onFinalize}>
          {submitting ? 'Enviando…' : 'Finalizar expediente →'}
        </Button>
      </div>
    </div>
  );
}
