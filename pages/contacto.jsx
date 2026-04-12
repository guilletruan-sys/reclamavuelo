// pages/contacto.jsx
import { useState } from 'react';
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { GREEN, NAVY, LIGHT_G, inputStyle } from '../lib/theme';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }
    document.getElementById('cf_nombre').value  = form.nombre;
    document.getElementById('cf_email').value   = form.email;
    document.getElementById('cf_tel').value     = form.telefono;
    document.getElementById('cf_asunto').value  = `[Contacto] ${form.asunto || 'Consulta general'}`;
    document.getElementById('cf_mensaje').value = form.mensaje;

    let iframe = document.getElementById('cf_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframe.name = 'cf_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    const f = document.getElementById('contactForm');
    f.target = 'cf_iframe';
    f.submit();
    setSent(true);
  }

  return (
    <>
      <Head>
        <title>Contacto — ReclamaVuelo</title>
        <meta name="description" content="Contacta con el equipo de ReclamaVuelo. Estamos aquí para ayudarte con tu reclamación aérea." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2356 100%)`, padding: '64px 24px 72px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: GREEN, padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
          Contacto
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', marginBottom: 16 }}>
          ¿En qué podemos ayudarte?
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Si tienes dudas sobre tu reclamación o quieres hablar con nosotros, escríbenos. Te respondemos en menos de 24 horas.
        </p>
      </div>

      <div style={{ background: '#f0f9f4', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'flex-start' }} className="grid2">

          {/* INFO */}
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Información de contacto</h2>
            {[
              { icon: '📧', label: 'Email', value: 'info@reclamavuelo.com' },
              { icon: '📞', label: 'Teléfono', value: '[Pendiente de añadir]' },
              { icon: '🕐', label: 'Horario', value: 'Lunes a viernes\n10:00 – 14:00 | 16:00 – 19:00' },
              { icon: '📍', label: 'Dirección', value: '[Pendiente de añadir]' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, background: LIGHT_G, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{i.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{i.label}</div>
                  <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{i.value}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 32, padding: '20px', background: LIGHT_G, borderRadius: 12, borderLeft: `3px solid ${GREEN}` }}>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                <strong>¿Quieres reclamar tu vuelo?</strong><br />
                Usa nuestro formulario de reclamación online — es más rápido y te da una respuesta inmediata.
              </p>
              <a href="/#form" style={{ display: 'inline-block', marginTop: 12, background: GREEN, color: '#fff', padding: '9px 20px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                Reclamar ahora →
              </a>
            </div>
          </div>

          {/* FORM */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 64, height: 64, background: `linear-gradient(135deg, ${GREEN}, #059669)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px', color: '#fff' }}>✓</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: GREEN, marginBottom: 10 }}>Mensaje enviado</h3>
                <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>Gracias por contactarnos. Te responderemos en menos de 24 horas.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Envíanos un mensaje</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre *</label>
                    <input style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email *</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teléfono</label>
                    <input style={inputStyle} type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+34 600 000 000" onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asunto</label>
                    <input style={inputStyle} value={form.asunto} onChange={e => set('asunto', e.target.value)} placeholder="Motivo del contacto" onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mensaje *</label>
                  <textarea style={{ ...inputStyle, height: 120, resize: 'vertical' }} value={form.mensaje} onChange={e => set('mensaje', e.target.value)} placeholder="Cuéntanos en qué podemos ayudarte..." onFocus={e => e.target.style.borderColor = GREEN} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <button onClick={handleSubmit} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '13px 24px', width: '100%', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Enviar mensaje →
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden FormSubmit form */}
      <form id="contactForm" action="https://formsubmit.co/guilletruan@gmail.com" method="POST" style={{ display: 'none' }}>
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" id="cf_asunto"  name="_subject" />
        <input type="hidden" id="cf_nombre"  name="Nombre" />
        <input type="hidden" id="cf_email"   name="Email" />
        <input type="hidden" id="cf_tel"     name="Telefono" />
        <input type="hidden" id="cf_mensaje" name="Mensaje" />
        <button type="submit">Enviar</button>
      </form>

      <Footer />
    </>
  );
}
