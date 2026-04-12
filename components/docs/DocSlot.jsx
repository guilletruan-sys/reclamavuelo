import { useRef, useState } from 'react';
import { tokens } from '../../lib/theme';

export default function DocSlot({ id, icon, label, hint, required, onFile, file, status, error }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const statusColor =
    status === 'ok' ? tokens.green500 :
    status === 'error' ? tokens.red500 :
    dragging ? tokens.green500 : tokens.slate300;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => status !== 'validating' && status !== 'uploading' && ref.current?.click()}
      style={{
        background: dragging ? tokens.green50 : tokens.white,
        border: `2px dashed ${statusColor}`,
        borderRadius: tokens.r2,
        padding: tokens.s4,
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: tokens.s3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.s3 }}>
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: tokens.fontHead, fontSize: 16, fontWeight: 700, color: tokens.navy900 }}>{label}</div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
              color: required ? tokens.red500 : tokens.slate400,
              textTransform: 'uppercase',
            }}>{required ? 'Obligatorio' : 'Opcional'}</span>
          </div>
          <div style={{ fontSize: 13, color: tokens.slate500, marginTop: 2 }}>{hint}</div>

          {status === 'uploading' && <div style={{ fontSize: 12, color: tokens.slate500, marginTop: 6 }}>Subiendo…</div>}
          {status === 'validating' && <div style={{ fontSize: 12, color: tokens.amber500, marginTop: 6 }}>Verificando con Claude Vision…</div>}
          {status === 'ok' && file && (
            <div style={{ fontSize: 12, color: tokens.green600, marginTop: 6, fontWeight: 600 }}>✓ {file.name}</div>
          )}
          {status === 'error' && (
            <div style={{ fontSize: 12, color: tokens.red500, marginTop: 6 }}>⚠ {error || 'No se pudo validar'}</div>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}
