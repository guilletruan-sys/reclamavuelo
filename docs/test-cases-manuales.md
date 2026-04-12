# Set de pruebas manual · ReclamaVuelo

16 casos reales para probar el wizard end-to-end. Cubren los 6 tipos de incidencia y los 3 posibles resultados (RECLAMABLE · REVISAR · NO_RECLAMABLE).

**Cómo usar:**
1. Abre http://localhost:3000
2. Clic en "Reclamar" (o scroll al wizard)
3. Para cada caso: elige el tipo en Paso 1, rellena el Paso 2 con los datos indicados, y compara el resultado con la columna **Esperado**
4. Si quieres testear con API real (FlightStats/AviationStack), configura las keys en `.env.local`. Si no, el backend cae en modo demo y las decisiones siguen la lógica del árbol.

> Los vuelos listados son **rutas reales con datos plausibles**, no necesariamente vuelos exactos que ocurrieron ese día. Para datos 100% reales histórico-auditable usa un plan de pago de FlightStats/Cirium.

---

## 🟢 RETRASO (CE 261/2004)

### Caso 1 — Retraso 4h corto recorrido → 250€
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB2634
- **Fecha:** 2024-07-19 *(día del apagón CrowdStrike — retrasos masivos sin causa extraordinaria)*
- **Origen:** MAD
- **Destino:** BCN
- **Hora real llegada (opcional):** 22:45 (retraso ~4h)
- **Esperado:** ✅ RECLAMABLE · **250€**
- **Por qué:** CE 261/2004 art. 7 — retraso ≥3h en destino final da derecho a compensación. Distancia MAD-BCN ≈ 483 km (≤1.500 km) → tramo de 250€. El fallo de TI de CrowdStrike afectó a sistemas de facturación de terceros: la jurisprudencia europea (STJUE C-549/07 Wallentin) exige que la circunstancia sea **ajena + inevitable + inherente a la actividad normal**. Un fallo de proveedor tecnológico contratado por la aerolínea NO es extraordinaria → aerolínea responsable.

### Caso 2 — Retraso 3h 30min medio recorrido → 400€
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB3120
- **Fecha:** 2024-06-15
- **Origen:** MAD
- **Destino:** ATH (Atenas)
- **Hora real llegada:** con 3h 30min de retraso
- **Esperado:** ✅ RECLAMABLE · **400€**
- **Por qué:** Retraso ≥3h confirmado. Distancia MAD-ATH ≈ 2.370 km → tramo 1.500-3.500 km (CE 261 art. 7.1.b). Sin causa extraordinaria. Nota: este caso también verifica que Claude **NO aplica el 50% por retraso inferior a 4h** — ese descuento solo aplica al art. 7.2 en cancelaciones con alternativa, no a retrasos puros.

### Caso 3 — Retraso 5h largo recorrido → 600€
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB6250
- **Fecha:** 2024-08-20
- **Origen:** MAD
- **Destino:** JFK (Nueva York)
- **Hora real llegada:** 03:00 (día siguiente)
- **Esperado:** ✅ RECLAMABLE · **600€**
- **Por qué:** Distancia MAD-JFK ≈ 5.760 km (>3.500 km) → tramo máximo 600€ del art. 7.1.c. Vuelo **operado por aerolínea UE saliendo desde aeropuerto UE** → CE 261 aplica aunque el destino sea fuera de la UE (art. 3.1.b). Retraso ≥4h en largo recorrido cumple el umbral del STJUE Sturgeon (C-402/07).

### Caso 4 — Retraso menor de 3h → NO
- **Tipo:** Retraso
- **Compañía:** FR — Ryanair
- **Nº vuelo:** FR1823
- **Fecha:** 2024-05-10
- **Origen:** AGP (Málaga)
- **Destino:** STN (Londres Stansted)
- **Hora real llegada:** con 2h 15min de retraso
- **Esperado:** ❌ NO_RECLAMABLE
- **Por qué:** CE 261/2004 **NO** compensa retrasos por el texto literal del reglamento — la compensación del art. 7 se estableció para cancelaciones. Fue el STJUE en **Sturgeon (C-402/07, 2009)** quien extendió la compensación a retrasos **≥3h en destino final**. 2h 15min queda por debajo del umbral Sturgeon → sin derecho a compensación del art. 7. El pasajero sí tiene derecho a **asistencia** del art. 9 (comida/bebida a partir de 2h en corto recorrido) pero eso no se reclama económicamente.

### Caso 5 — Retraso por meteo extrema → NO
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB3456
- **Fecha:** 2021-01-09 *(Filomena — nevada histórica en Madrid, aeropuerto cerrado)*
- **Origen:** MAD
- **Destino:** PMI
- **Hora real llegada:** retraso 6h
- **Esperado:** ❌ NO_RECLAMABLE
- **Por qué:** CE 261 art. 5.3 exonera a la aerolínea si concurre **"circunstancia extraordinaria que no podría haberse evitado incluso tomando todas las medidas razonables"**. La jurisprudencia (STJUE C-549/07 Wallentin, C-315/15 Pešková) lista explícitamente **condiciones meteorológicas incompatibles con la realización del vuelo** como ejemplo. Filomena cerró Barajas del 8-11 enero 2021 — el METAR (SPECI LEMD 091000Z) registró nieve continua y visibilidad <200m. Claude debería consultar METAR vía `lib/metar.js` y confirmar `adverseFound: true` → aerolínea exonerada.

---

## 🚫 CANCELACIÓN (CE 261/2004)

### Caso 6 — Cancelación sin aviso, sin alternativa → 250€ (corto)
- **Tipo:** Cancelación
- **Compañía:** VY — Vueling
- **Nº vuelo:** VY1008
- **Fecha:** 2024-09-01
- **Origen:** BCN
- **Destino:** SVQ (Sevilla)
- **¿Cuándo avisaron?:** Mismo día
- **¿Ofrecieron alternativa?:** No
- **Esperado:** ✅ RECLAMABLE 100% · **250€**
- **Por qué:** CE 261 art. 5.1.c establece compensación salvo que (i) el aviso sea **≥14 días**, o (ii) haya alternativa con horarios similares (art. 5.1.c ii-iii), o (iii) concurra circunstancia extraordinaria. Aviso el mismo día → (i) incumplido. Sin alternativa ofrecida → (ii) incumplido. Sin causa extraordinaria → (iii) incumplido. Distancia BCN-SVQ ≈ 830 km → tramo 250€ del art. 7.1.a.

### Caso 7 — Cancelación con alternativa que llegó a tiempo → 50% (125€)
- **Tipo:** Cancelación
- **Compañía:** UX — Air Europa
- **Nº vuelo:** UX1095
- **Fecha:** 2024-10-12
- **Origen:** MAD
- **Destino:** VLC
- **¿Cuándo avisaron?:** 1-7 días
- **¿Ofrecieron alternativa?:** Sí
- **¿Aceptaste?:** Sí
- **Hora real de llegada con la alternativa:** <2h de retraso sobre hora original
- **Esperado:** ✅ RECLAMABLE 50% · **125€**
- **Por qué:** CE 261 art. 7.2 permite a la aerolínea **reducir la compensación a la mitad** cuando ofrece reubicación y el pasajero llega con retraso dentro de ciertos márgenes: <2h (≤1.500 km), <3h (1.500-3.500 km), <4h (>3.500 km). MAD-VLC ≈ 303 km, alternativa con retraso <2h → se activa la mitad. 250€ / 2 = **125€**.

### Caso 8 — Cancelación avisada con >14 días → NO
- **Tipo:** Cancelación
- **Compañía:** BA — British Airways
- **Nº vuelo:** BA487
- **Fecha:** 2024-11-20
- **Origen:** LHR (Londres Heathrow)
- **Destino:** BCN
- **¿Cuándo avisaron?:** Más de 14 días
- **Esperado:** ❌ NO_RECLAMABLE
- **Por qué:** CE 261 art. 5.1.c.i exonera expresamente a la aerolínea si informa de la cancelación con **al menos 14 días de antelación** respecto a la hora de salida prevista. El pasajero conserva el derecho al reembolso del billete (art. 8) pero no a la compensación económica del art. 7. **Nota Brexit:** BA es aerolínea del Reino Unido pero LHR (UK) a BCN (UE) — aplica la versión UK de CE 261 incorporada al derecho británico post-Brexit; la lógica es idéntica.

### Caso 9 — Cancelación por huelga ATC externa → NO
- **Tipo:** Cancelación
- **Compañía:** AF — Air France
- **Nº vuelo:** AF1701
- **Fecha:** 2023-03-28 *(huelga controladores franceses confirmada)*
- **Origen:** CDG
- **Destino:** MAD
- **¿Cuándo avisaron?:** Mismo día
- **¿Ofrecieron alternativa?:** No
- **Esperado:** ❌ NO_RECLAMABLE
- **Por qué:** STJUE C-28/20 **Airhelp vs SAS** (2021) y C-613/20 distinguen dos tipos de huelga: (i) huelga de **personal propio** de la aerolínea = NO extraordinaria (reclamable), (ii) huelga de **terceros** — controladores aéreos, personal de aeropuerto, seguridad — = SÍ extraordinaria (exonera). Los controladores franceses dependen de la DGAC, no de Air France → huelga de tercero → art. 5.3 exonera. ⚠️ **Este caso es el más sutil de toda la batería.** Si Claude lo falla y dice reclamable, probablemente no está distinguiendo bien el origen de la huelga.

---

## 🔄 CONEXIÓN PERDIDA (CE 261/2004)

### Caso 10 — Conexión mismo PNR, retraso en destino final >3h → reclamable
- **Tipo:** Conexión perdida
- **Compañía:** LH — Lufthansa
- **Nº vuelo:** LH1801
- **Fecha:** 2024-07-05
- **Origen:** MAD
- **Destino:** FRA (Frankfurt)
- **Nº del segundo vuelo:** LH760
- **Destino final:** DEL (Nueva Delhi)
- **¿Mismo PNR?:** Sí
- **Esperado:** ✅ RECLAMABLE · **600€**
- **Por qué:** STJUE **C-537/17 Wegener** (2018) y **C-502/18 České aerolinie** (2019) establecen que cuando dos vuelos están en el mismo billete (único contrato de transporte) se evalúan como **un único transporte aéreo** a efectos de CE 261. Lo que cuenta es el retraso en el **destino final**, no el intermedio. MAD→DEL ≈ 7.270 km (>3.500 km) → tramo 600€. Un fallo del LH1801 que provoca perder LH760 y llegar a DEL >3h tarde = compensación completa. Si el PNR fuera separado (ver Caso 11), el segundo vuelo sería un contrato distinto y no habría conexión protegida.

### Caso 11 — Conexión con billetes separados (distinto PNR) → NO
- **Tipo:** Conexión perdida
- **Compañía:** FR — Ryanair
- **Nº vuelo:** FR3562
- **Fecha:** 2024-08-12
- **Origen:** AGP
- **Destino:** BER (Berlín)
- **Nº del segundo vuelo:** LH192
- **Destino final:** MUC (Múnich)
- **¿Mismo PNR?:** No
- **Esperado:** ❌ NO_RECLAMABLE (por la conexión perdida en sí)
- **Por qué:** Dos billetes separados = dos contratos de transporte independientes. CE 261 evalúa cada uno por separado. Si FR3562 llegó a BER con retraso <3h, ese vuelo no es reclamable bajo art. 7. El LH192 salió a su hora, así que Lufthansa cumplió su contrato. El pasajero asumió el riesgo de la conexión autogestionada. **Matiz importante:** si el FR3562 hubiera tenido un retraso ≥3h propio, **sí** sería reclamable ese vuelo individualmente — pero no como "conexión perdida". Úsalo para verificar que Claude distingue los dos conceptos.

---

## 🎫 OVERBOOKING (CE 261/2004)

### Caso 12 — Denegación involuntaria → reclamable
- **Tipo:** Overbooking
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB3170
- **Fecha:** 2024-08-03
- **Origen:** MAD
- **Destino:** CDG
- **¿Te ofrecieron compensación en el aeropuerto?:** No
- **Esperado:** ✅ RECLAMABLE · **250€**
- **Por qué:** CE 261 art. 4 regula la denegación de embarque. Cuando la aerolínea no encuentra voluntarios suficientes (art. 4.1) y deniega el embarque **contra la voluntad** del pasajero (art. 4.3), compensación automática del art. 7 **sin necesidad de probar retraso ni meteo** — la responsabilidad es objetiva. MAD-CDG ≈ 1.050 km → tramo 250€. **⚠ corrección:** mi estimación inicial de 400€ era errónea, MAD-CDG queda por debajo del corte de 1.500 km.

### Caso 13 — Denegación voluntaria (aceptaste quedarte) → REVISAR
- **Tipo:** Overbooking
- **Compañía:** UX — Air Europa
- **Nº vuelo:** UX0097
- **Fecha:** 2024-07-22
- **Origen:** MAD
- **Destino:** EZE (Buenos Aires)
- **¿Te ofrecieron compensación en el aeropuerto?:** Sí
- **¿La aceptaste?:** Sí
- **Esperado:** 🟡 REVISAR_MANUALMENTE
- **Por qué:** CE 261 art. 4.1 establece que cuando la aerolínea se anticipa al overbooking buscando voluntarios, estos renuncian al art. 7 a cambio de las **"contraprestaciones negociadas"** (bonos, vuelo posterior, alojamiento…). Si el acuerdo fue claramente inferior al art. 7 puede haber nulidad por vicio del consentimiento, pero eso depende de los términos exactos del acuerdo y requiere revisión abogado → REVISAR_MANUALMENTE. El abogado pedirá el documento firmado en el aeropuerto.

---

## 🧳 EQUIPAJE (Convenio de Montreal)

### Caso 14 — Equipaje dañado con PIR → revisar, estimación ~valor declarado
- **Tipo:** Equipaje
- **Compañía:** FR — Ryanair
- **Nº vuelo:** FR4510
- **Fecha:** 2024-09-15
- **Origen:** DUB (Dublín)
- **Destino:** MAD
- **¿Qué le pasó?:** Dañado
- **Valor aproximado (€):** 450
- **¿PIR hecho en aeropuerto?:** Sí
- **Esperado:** 🟡 REVISAR_MANUALMENTE · regulation: **Convenio de Montreal**
- **Por qué:** CE 261/2004 NO cubre equipaje — aplica el **Convenio de Montreal de 1999**, arts. 17.2 (responsabilidad por destrucción/pérdida/avería) y 22.2 (límite de ~1.288 DEG ≈ 1.600€ por pasajero). Requisitos formales estrictos: el pasajero debe presentar protesta por escrito a la aerolínea en **7 días** para equipaje dañado y en **21 días** para equipaje retrasado (art. 31.2). El **PIR (Property Irregularity Report)** firmado en el aeropuerto es la prueba canónica del cumplimiento de esos plazos. Con PIR + facturas del contenido, el abogado puede estimar hasta los 450€ declarados. Sin prueba del valor, se indemnizaría sobre baremos inferiores.

### Caso 15 — Equipaje perdido SIN PIR → revisar difícil
- **Tipo:** Equipaje
- **Compañía:** LH — Lufthansa
- **Nº vuelo:** LH1801
- **Fecha:** 2024-06-28
- **Origen:** MAD
- **Destino:** FRA
- **¿Qué le pasó?:** Perdido
- **Valor aproximado (€):** 800
- **¿PIR hecho en aeropuerto?:** No
- **Esperado:** 🟡 REVISAR_MANUALMENTE
- **Por qué:** Montreal art. 31.2 obliga al pasajero a protestar por escrito en **21 días** desde que el equipaje debía entregarse (pérdida definitiva se presume tras 21 días no entregado — art. 17.3). Sin PIR, la prueba del incumplimiento de la aerolínea es mucho más difícil: hay que reconstruir con tarjeta de embarque, correos de reclamación, testigos, etc. El abogado intentará la protesta retroactiva si estamos dentro del plazo de 21 días — si ya se superaron, la reclamación probablemente prescribe por defecto formal (no por prescripción material, que es 2 años art. 35). Claude debería etiquetar **urgencia de contactar antes de día 21**.

---

## 🩹 LESIONES A BORDO (Convenio de Montreal art. 17)

### Caso 16 — Caída por turbulencia con parte médico → revisar
- **Tipo:** Lesiones a bordo
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB6275
- **Fecha:** 2024-07-30
- **Origen:** MAD
- **Destino:** GRU (São Paulo)
- **Tipo de lesión:** Caída por turbulencia imprevista
- **¿Tienes parte médico?:** Sí
- **Descripción breve:** Golpe en la cabeza contra el compartimento superior, atendida por médico en destino
- **Esperado:** 🟡 REVISAR_MANUALMENTE · regulation: **Convenio de Montreal art. 17.1**
- **Por qué:** Montreal art. 17.1 establece **responsabilidad objetiva** de la aerolínea por muerte o **lesión corporal** del pasajero si el accidente ocurre "**a bordo** o en las operaciones de embarque o desembarque". La aerolínea responde sin culpa hasta **128.821 DEG** (~160.000€, límite actualizado 2019). Por encima de ese importe, la aerolínea puede exonerarse solo si prueba que no hubo negligencia. El nexo causal (lesión ↔ turbulencia ↔ vuelo) es clave y requiere: parte médico con diagnóstico, testimonios, posiblemente informe técnico de la tripulación. Compensación varía enormemente caso a caso → siempre REVISAR_MANUALMENTE. **Dato útil para Claude:** en STJUE C-532/18 **Niki Luftfahrt** (2019) el tribunal definió "accidente" como "acontecimiento involuntario, anormal e imprevisto" — una turbulencia severa entra dentro; un golpe por equipaje mal colocado del propio pasajero, no.

---

## Cobertura del set

| Resultado | Casos |
|---|---|
| ✅ RECLAMABLE | 1, 2, 3, 6, 7, 10, 12 (7 casos) |
| 🟡 REVISAR_MANUALMENTE | 13, 14, 15, 16 (4 casos) |
| ❌ NO_RECLAMABLE | 4, 5, 8, 9, 11 (5 casos) |

| Regulación | Casos |
|---|---|
| CE 261/2004 | 1-13 (13 casos) |
| Convenio de Montreal | 14, 15, 16 (3 casos) |

| Tipo | Casos |
|---|---|
| Retraso | 1-5 |
| Cancelación | 6-9 |
| Conexión | 10-11 |
| Overbooking | 12-13 |
| Equipaje | 14-15 |
| Lesiones | 16 |

---

## Paso 3 — Datos personales (comunes a todos los casos)

Cuando llegues al Paso 3, puedes usar:

```
Nombre:     Test
Apellidos:  Pasajero
DNI/NIE:    00000000T
Email:      tu-email-real@ejemplo.com   (para recibir el email de confirmación)
Teléfono:   600000000
Pasajeros:  1
```

Marca los 2 checkboxes (RGPD + condiciones) y dale a "Enviar caso →". Si `RESEND_API_KEY` está configurada en `.env.local`, recibirás los emails reales.

---

## Qué mirar en cada test

1. **Paso 1:** los 6 tipos aparecen en grid 2×3, el click auto-avanza
2. **Paso 2:** campos condicionales aparecen según el tipo (ej: cancelación muestra "¿Cuándo avisaron?")
3. **Al pulsar "Verificar con IA":** spinner con texto animado, luego el card de resultado aparece con el color correcto (verde/ámbar/gris)
4. **En RECLAMABLE:** cifra grande, razonamiento colapsable, botón "Iniciar reclamación →"
5. **En REVISAR:** ámbar, texto de aviso, botón "Hablar con un abogado →"
6. **En NO:** gris (no rojo), razón clara, botón "Intentarlo con otro vuelo"
7. **Auto-save:** si cierras la pestaña a mitad del Paso 2 y vuelves, los datos siguen ahí (localStorage `rv-wizard-draft`)
8. **Mobile (<900px):** el wizard se colapsa a 1 columna, el hero oculta el preview card
