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
- **Esperado:** ✅ RECLAMABLE · **250€** · distancia ≤1.500 km · causa no extraordinaria (fallo TI)

### Caso 2 — Retraso 3h 30min medio recorrido → 400€
- **Tipo:** Retraso
- **Compañía:** VY — Vueling
- **Nº vuelo:** VY6250
- **Fecha:** 2024-06-15
- **Origen:** BCN
- **Destino:** CDG (París Charles de Gaulle)
- **Hora real llegada:** 21:30
- **Esperado:** ✅ RECLAMABLE · **400€** · distancia 1.500-3.500 km

### Caso 3 — Retraso 5h largo recorrido → 600€
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB6250
- **Fecha:** 2024-08-20
- **Origen:** MAD
- **Destino:** JFK (Nueva York)
- **Hora real llegada:** 03:00 (día siguiente)
- **Esperado:** ✅ RECLAMABLE · **600€** · distancia >3.500 km

### Caso 4 — Retraso menor de 3h → NO
- **Tipo:** Retraso
- **Compañía:** FR — Ryanair
- **Nº vuelo:** FR1823
- **Fecha:** 2024-05-10
- **Origen:** AGP (Málaga)
- **Destino:** STN (Londres Stansted)
- **Hora real llegada:** con 2h 15min de retraso
- **Esperado:** ❌ NO_RECLAMABLE · no supera el umbral de 3h en destino final

### Caso 5 — Retraso por meteo extrema → NO
- **Tipo:** Retraso
- **Compañía:** IB — Iberia
- **Nº vuelo:** IB3456
- **Fecha:** 2021-01-09 *(Filomena — nevada histórica en Madrid, aeropuerto cerrado)*
- **Origen:** MAD
- **Destino:** PMI
- **Hora real llegada:** retraso 6h
- **Esperado:** ❌ NO_RECLAMABLE · circunstancia extraordinaria (METAR confirma nieve severa)

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
- **Esperado:** ✅ RECLAMABLE 100% · **250€** · distancia ≤1.500 km

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
- **Hora real de llegada con la alternativa:** dentro de la banda ≤1.500km: <2h de retraso sobre hora original
- **Esperado:** ✅ RECLAMABLE 50% · **125€**

### Caso 8 — Cancelación avisada con >14 días → NO
- **Tipo:** Cancelación
- **Compañía:** BA — British Airways
- **Nº vuelo:** BA487
- **Fecha:** 2024-11-20
- **Origen:** LHR (Londres Heathrow)
- **Destino:** BCN
- **¿Cuándo avisaron?:** Más de 14 días
- **Esperado:** ❌ NO_RECLAMABLE · aviso suficiente según CE 261

### Caso 9 — Cancelación por huelga ATC externa → NO
- **Tipo:** Cancelación
- **Compañía:** AF — Air France
- **Nº vuelo:** AF1701
- **Fecha:** 2023-03-28 *(huelga controladores franceses confirmada)*
- **Origen:** CDG
- **Destino:** MAD
- **¿Cuándo avisaron?:** Mismo día
- **¿Ofrecieron alternativa?:** No
- **Esperado:** ❌ NO_RECLAMABLE · circunstancia extraordinaria (huelga ATC ajena a la aerolínea) · Claude debería detectar el contexto

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
- **Destino final:** DEL (Nueva Delhi) *(>3.500 km)*
- **¿Mismo PNR?:** Sí
- **Esperado:** ✅ RECLAMABLE · **600€** · distancia origen→final >3.500 km y retraso en destino final ≥3h

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
- **Esperado:** ❌ NO_RECLAMABLE · al no ser mismo billete, CE 261 no cubre la conexión perdida

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
- **Esperado:** ✅ RECLAMABLE · **400€** · distancia 1.500-3.500 km · sin compensación in-situ aceptada

### Caso 13 — Denegación voluntaria (aceptaste quedarte) → REVISAR
- **Tipo:** Overbooking
- **Compañía:** UX — Air Europa
- **Nº vuelo:** UX0097
- **Fecha:** 2024-07-22
- **Origen:** MAD
- **Destino:** EZE (Buenos Aires)
- **¿Te ofrecieron compensación en el aeropuerto?:** Sí
- **¿La aceptaste?:** Sí
- **Esperado:** 🟡 REVISAR_MANUALMENTE · depende de lo acordado con la aerolínea

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
- **Esperado:** 🟡 REVISAR_MANUALMENTE · compensación estimada hasta ~450€ · regulation: Convenio de Montreal · nota: requiere fotos + facturas

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
- **Esperado:** 🟡 REVISAR_MANUALMENTE · sin PIR la reclamación es difícil · Claude debería sugerir carta a la aerolínea en 7/21 días

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
- **Esperado:** 🟡 REVISAR_MANUALMENTE · Convenio de Montreal art. 17.1 · responsabilidad objetiva · abogado se pondrá en contacto

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
