import { useState } from 'react';
import { tokens } from '../../lib/theme';
import { H2 } from '../ui';

const ITEMS = [
  { q: '¿Cuánto tarda el proceso?', a: 'La respuesta inicial de la aerolínea llega en 2-4 semanas. Si acepta, cobras en 4-8 semanas. Si va a juicio, puede extenderse 6-12 meses, pero nosotros lo gestionamos todo.' },
  { q: '¿Y si perdemos el caso?', a: 'No pagas nada. Cero. Solo cobramos el 25% + IVA si conseguimos tu compensación.' },
  { q: '¿Qué aerolíneas cubren CE 261/2004?', a: 'Todas las que despeguen desde un aeropuerto de la UE, o que aterricen en la UE si son compañías con sede europea.' },
  { q: '¿Qué documentos necesito?', a: 'DNI, tarjeta de embarque, confirmación de reserva e IBAN. Si el caso es equipaje añade PIR y facturas; si es lesión, parte médico.' },
  { q: '¿Puedo reclamar vuelos antiguos?', a: 'Sí. En España tienes hasta 5 años desde el vuelo para reclamar. En otros países puede variar (3-10 años).' },
  { q: '¿Por qué cobráis lo mismo si va a juicio?', a: 'Porque creemos que un cliente no debería pagar más por defender su derecho. Otras plataformas suben al 40-50% en juicio; nosotros no.' },
  { q: '¿Cómo funciona la IA legal?', a: 'Analiza el estado real del vuelo, la meteorología, la regulación aplicable y las circunstancias específicas de tu caso. Luego un abogado revisa la recomendación antes de actuar.' },
  { q: '¿Mis datos están seguros?', a: 'Sí. Cumplimos GDPR y ciframos todos los documentos. Solo nuestros abogados ven tu información, nunca se comparte con terceros salvo para la reclamación.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: tokens.slate50 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: `${tokens.s8}px ${tokens.s5}px` }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.s7 }}>
          <H2>Preguntas frecuentes</H2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.s2 }}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                background: tokens.white, borderRadius: tokens.r2,
                border: `1px solid ${tokens.slate200}`,
                boxShadow: tokens.shadowSm, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%', textAlign: 'left', padding: tokens.s4,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: tokens.s3,
                    fontFamily: tokens.fontHead, fontSize: 17, fontWeight: 600, color: tokens.navy900,
                  }}>
                  <span>{item.q}</span>
                  <span style={{
                    fontSize: 20, color: tokens.green500,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}>+</span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: `0 ${tokens.s4}px ${tokens.s4}px`,
                    fontSize: 15, lineHeight: 1.6, color: tokens.slate500,
                  }} className="fade-in">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
