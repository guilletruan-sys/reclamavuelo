import { useState } from 'react';
import { tokens } from '../../../lib/theme';
import DocSlot from '../../docs/DocSlot';
import { Button } from '../../ui';

async function fileToDataUrl(f) {
  return new Promise((ok, err) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = err;
    r.readAsDataURL(f);
  });
}

export default function FilePicker({
  disabled,
  answer,
  onAnswer,
  docId,
  icon,
  label,
  hint,
  required,
  context,
  optional,
}) {
  const [state, setState] = useState({ file: null, status: null, error: null });

  if (disabled) {
    return <ReadOnlyBadge label={answer?.label || '— omitido —'} />;
  }

  const handleFile = async file => {
    setState({ file, status: 'uploading' });
    try {
      const dataUrl = await fileToDataUrl(file);
      setState({ file, dataUrl, status: 'validating' });
      const res = await fetch('/api/upload-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validateOnly: true,
          docType: docId,
          dataUrl,
          caseData: { ref: context?.caseRef, ...context },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Documento rechazado');
      setState({ file, dataUrl, status: 'ok' });
      setTimeout(
        () => onAnswer({ dataUrl, name: file.name, docType: docId }, `✓ ${file.name}`),
        400
      );
    } catch (e) {
      setState({ file, status: 'error', error: e.message });
    }
  };

  return (
    <div style={{ marginTop: tokens.s2 }}>
      <DocSlot
        icon={icon || '📎'}
        label={label}
        hint={hint}
        required={required}
        file={state.file}
        status={state.status}
        error={state.error}
        onFile={handleFile}
      />
      {optional && state.status !== 'ok' && (
        <Button size="sm" variant="ghost" onClick={() => onAnswer(null, '— omitido —')}>
          Omitir este documento
        </Button>
      )}
    </div>
  );
}

function ReadOnlyBadge({ label }) {
  return (
    <div
      style={{
        display: 'inline-block',
        background: tokens.slate50,
        border: `1px solid ${tokens.slate200}`,
        borderRadius: tokens.rPill,
        padding: '4px 10px',
        fontSize: 12,
        color: tokens.slate500,
        marginTop: 6,
      }}
    >
      ✓ {label}
    </div>
  );
}
