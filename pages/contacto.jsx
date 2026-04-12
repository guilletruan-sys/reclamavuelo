import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { tokens } from '../lib/theme';
import { Button, H1, Subtitle } from '../components/ui';
import { Field, Input, Select } from '../components/fields';

export default function Contacto() {
  return (
    <>
      <Head><title>Contacto — ReclamaVuelo</title></Head>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <H1>Hablemos</H1>
        <Subtitle style={{ marginTop: tokens.s3 }}>
          Escríbenos o llámanos. Nuestro equipo está disponible de lunes a viernes.
        </Subtitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: tokens.s7, marginTop: tokens.s7 }} className="grid2">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginBottom: tokens.s3 }}>Teléfonos</div>
            <a href="tel:+34916379097" style={{
              display: 'block', fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 700,
              color: tokens.navy900, marginBottom: 4,
            }}>📞 91 637 90 97</a>
            <a href="tel:+34917152906" style={{
              display: 'block', fontFamily: tokens.fontHead, fontSize: 22, fontWeight: 700,
              color: tokens.navy900,
            }}>📞 91 715 29 06</a>
            <div style={{ fontSize: 14, color: tokens.slate500, marginTop: 6 }}>
              L-V 10:00-14:00 · 16:00-19:00
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginTop: tokens.s6, marginBottom: tokens.s3 }}>Email</div>
            <a href="mailto:contacto@reclamatuvuelo.com" style={{
              fontSize: 16, fontWeight: 600, color: tokens.navy900,
            }}>contacto@reclamatuvuelo.com</a>

            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', color: tokens.green600, textTransform: 'uppercase', marginTop: tokens.s6, marginBottom: tokens.s3 }}>Síguenos</div>
            <div style={{ display: 'flex', gap: tokens.s2 }}>
              {['Instagram', 'Facebook', 'Twitter'].map(s => (
                <a key={s} href={`https://${s.toLowerCase()}.com/reclamatuvuelo`} target="_blank" rel="noopener"
                   style={{
                     width: 40, height: 40, borderRadius: tokens.rPill,
                     border: `1.5px solid ${tokens.slate200}`, color: tokens.navy900,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: 14, fontWeight: 700,
                   }}>{s[0]}</a>
              ))}
            </div>
          </div>

          <form
            action="https://formsubmit.co/contacto@reclamatuvuelo.com"
            method="POST"
            style={{
              background: tokens.white, border: `1px solid ${tokens.slate200}`,
              borderRadius: tokens.r2, padding: tokens.s6, boxShadow: tokens.shadowSm,
            }}
          >
            <Field label="Nombre"><Input name="nombre" required /></Field>
            <Field label="Email"><Input type="email" name="email" required /></Field>
            <Field label="Asunto">
              <Select name="asunto" required>
                <option value="">Selecciona un asunto</option>
                <option>Consulta sobre reclamación</option>
                <option>Información sobre precios</option>
                <option>Prensa y colaboraciones</option>
                <option>Otro</option>
              </Select>
            </Field>
            <Field label="Mensaje">
              <textarea
                name="mensaje" required rows={5}
                style={{
                  padding: '14px 16px', border: `1.5px solid ${tokens.slate200}`,
                  borderRadius: tokens.r1, fontSize: 15, fontFamily: tokens.fontBody,
                  color: tokens.navy900, width: '100%', boxSizing: 'border-box',
                  outline: 'none', resize: 'vertical',
                }}
              />
            </Field>
            <input type="hidden" name="_next" value="https://reclamatuvuelo.com/contacto?ok=1" />
            <input type="hidden" name="_captcha" value="false" />
            <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
              Enviar mensaje →
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
