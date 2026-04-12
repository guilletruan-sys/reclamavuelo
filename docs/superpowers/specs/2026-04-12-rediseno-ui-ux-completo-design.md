# ReclamaVuelo — Rediseño UI/UX completo

**Fecha:** 2026-04-12
**Scope:** Rediseño visual + UX de todo el frontend + ampliación de lógica backend para cubrir los 6 tipos de incidencia de la web actual.

---

## 1. Contexto y objetivos

ReclamaVuelo es una plataforma de reclamaciones de vuelos existente desde 2017 (dominio público reclamatuvuelo.com). El repositorio Next.js es una reescritura moderna del sitio con motor IA propio (Claude Sonnet + FlightStats + METAR) pero con UI de MVP y menos servicios (4 tipos vs 6 en la web live).

**Objetivo del rediseño:** elevar la UI a nivel premium (estilo Stripe/Linear/Revolut), optimizar el wizard para conversión, y cerrar la paridad de producto con la web actual añadiendo los 2 tipos de incidencia que faltan (equipaje y lesiones).

**No es objetivo:** refactor de stack (seguimos con Next.js + inline styles centralizados en `lib/theme.js`), ni reescribir los textos legales, ni cambiar integraciones externas.

---

## 2. Dirección de diseño validada

| Decisión | Opción elegida |
|---|---|
| Dirección visual | **B · Modern SaaS** — fondos claros, acentos verdes, estilo Stripe/Linear |
| Tono de voz | **A · Tú, cercano pero profesional** |
| Hero concept | **B · Split + Preview** — texto izquierda, mockup animado del producto a la derecha |
| Trust signals | Reales: desde 2017, 25%+IVA solo si ganamos, abogados colegiados, teléfonos reales, mismo precio judicial/extrajudicial |
| Scope incidencias | **C · 6 tipos completos** (UI + lógica IA) |
| Tech approach | Inline styles + `lib/theme.js` extendido con tokens y componentes reutilizables (sin migrar a Tailwind/CSS Modules) |

---

## 3. Design system

### Tipografía
- **Headings:** Space Grotesk (400/600/700/800), tracking `-0.03em`
- **Body:** Inter (400/500/600)
- **Escala (px):** 12, 14, 16, 18, 22, 28, 36, 48, 64
- Cargar vía Google Fonts en `_document.js` (nuevo archivo si no existe)

### Color tokens (extender `lib/theme.js`)
```
navy-900: #0a1628   // texto principal, nav oscuro
navy-700: #1e293b   // headings secundarios
slate-500: #64748b  // texto secundario
slate-300: #cbd5e1  // bordes
slate-100: #f1f5f9  // fondos de sección
white:     #ffffff
green-600: #059669  // CTA hover
green-500: #10b981  // CTA primario
green-100: #d1fae5  // fondos success sutiles
green-50:  #f0fdf4  // hero bg
red-500:   #ef4444  // error
amber-500: #f59e0b  // warning / revisar manualmente
```

### Spacing (px)
Escala 4/8: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`

### Radios (px)
`8` inputs · `12` cards · `16` secciones · `100` pills

### Sombras
- `sm`: `0 1px 2px rgba(10,22,40,0.04)`
- `md`: `0 4px 16px rgba(10,22,40,0.08)`
- `lg`: `0 20px 60px rgba(10,22,40,0.12)`

### Componentes base (en `lib/theme.js`)
- `Button` — variantes `primary | secondary | ghost`, tamaños `sm | md | lg`
- `Input` — con floating label, error state, icon slot
- `Card` — slots `header | body | footer`
- `Badge` — variantes `success | info | warning | danger`
- `Alert` — con icon + title + body
- `Section` — wrapper max-width 1200px, padding vertical responsive

### Breakpoints
`sm: 600`, `md: 900`, `lg: 1200` (actualmente solo hay 600, se amplía)

### Animaciones
- `fadeUp` on scroll (existe, se reutiliza)
- `hoverLift` en cards (nuevo: `transform: translateY(-4px)` + sombra lg)
- Transiciones globales: `all 0.2s ease`

---

## 4. Landing page (`pages/index.jsx`)

Reescritura completa manteniendo el API del formulario.

**Estructura vertical:**

1. **Nav sticky** (componente `Nav.jsx` rediseñado)
2. **Hero split**
   - Izquierda: eyebrow "CE 261/2004 · Desde 2017", H1 con "600€" destacado en verde, subtitle, CTA primario "Comprobar mi vuelo gratis →" + CTA secundario "Ver cómo funciona", microcopy "Sin costes iniciales · 25% solo si ganamos"
   - Derecha: mockup de boarding pass card con vuelo ejemplo (MAD→BCN, IB2634, retraso 3h 42min, badge "RECLAMABLE · 250€"), leve rotación y sombra `lg`
3. **Trust bar** — strip `slate-100` con 4 claims en línea separados por puntos
4. **Servicios (6 tipos)** — grid 3×2 de cards clickables. Cada card enlaza a `/?tipo=<id>` (preselecciona wizard)
5. **Cómo funciona** — 3 pasos horizontales con línea conectora: Cuéntanos → Analizamos → Cobras
6. **Calculadora de compensación** — bloque interactivo independiente (inputs origen/destino → muestra 250/400/600€ según distancia Haversine)
7. **Precio transparente** — card grande con cifra "25% + IVA" y bullets
8. **Por qué ReclamaVuelo** — 4 cards con ventajas vs DIY
9. **FAQ** — 8-10 preguntas colapsables (accordion)
10. **CTA final** — sección fondo `green-50` con CTA grande
11. **Footer** (componente `Footer.jsx` rediseñado)

**Animaciones:** fade-up on scroll para cada sección, hover lift en cards, smooth anchor scroll.

**Responsive:** todas las secciones colapsan a single-column en <900px; hero se apila (texto arriba, mockup abajo).

---

## 5. Wizard de reclamación

Rediseño del formulario existente en `pages/index.jsx` — pasa de 5 pasos visibles a **3 pasos** con sub-pasos internos.

### Layout global
- Card centrado max-width 640px
- Barra de progreso de 3 segmentos
- Breadcrumb "Paso N de 3 · <título>"
- Botones fijos abajo: "Atrás" (ghost) + "Siguiente →" (primary)
- Navegación con teclado (Enter avanza si válido)
- Auto-save en `localStorage` con key `rv-wizard-draft` (recupera si cierra pestaña)

### Paso 1 — Tipo de incidencia
- Grid 2×3 de cards grandes (icono + título + descripción breve)
- Seleccionar card = auto-avanza al Paso 2
- Query param `?tipo=<id>` preselecciona y salta directo a Paso 2

### Paso 2 — Datos del vuelo (adaptativo)
**Campos core (todos):** Compañía (autocomplete IATA), Nº vuelo, Fecha, Origen, Destino.

**Campos condicionales:**
- **Retraso:** + hora real de llegada (opcional)
- **Cancelación:** + ¿Cuándo avisaron? (pills: mismo día / 1-7d / 7-14d / +14d) + ¿Alternativa? → si sí: ¿aceptaste? + hora llegada real
- **Conexión:** + Nº vuelo 2, Destino final, ¿Mismo PNR?
- **Overbooking:** + ¿Compensación ofrecida en aeropuerto? + ¿Aceptaste?
- **Equipaje:** + ¿Perdido o dañado? + valor aproximado + ¿PIR hecho?
- **Lesiones:** + tipo de lesión + ¿Parte médico? + descripción breve

**Submit:** botón "Verificar con IA →" llama a `/api/verify` con spinner animado ("Consultando estado del vuelo… Analizando meteorología… Aplicando CE 261/2004…").

### Resultado (inline, no es un paso)
Card grande con uno de 3 estados visuales:
- **RECLAMABLE** — verde, check grande, cifra compensación enorme, breakdown (base × pasajeros), razonamiento IA colapsable, CTA "Iniciar reclamación →"
- **REVISAR** — ámbar, warning, explicación, CTA "Hablar con un abogado"
- **NO_RECLAMABLE** — gris (no rojo), info, razón clara, CTA secundario "Intentarlo con otro vuelo" + "Contactar igualmente"

### Paso 3 — Tus datos (solo si RECLAMABLE/REVISAR)
Nombre, apellidos, DNI/NIE, email, teléfono, nº pasajeros, checkbox RGPD, checkbox 25%+IVA, botón "Enviar caso →".

**Post-envío:** pantalla de confirmación con resumen + "Revisa tu email · Sube documentos" + botón "Subir documentos ahora".

### Mejoras transversales
- Validación inline (on blur, no al submit)
- Mensajes de error positivos y específicos
- Mobile-first: inputs grandes, `inputMode` correcto, autocomplete de navegador
- Accesibilidad: labels reales, `aria-invalid`, focus rings visibles

---

## 6. Página de documentos (`pages/aportar-documentos.jsx`)

Rediseño completo manteniendo la URL con token.

### Layout
- Card centrado max-width 720px
- **Mini-card de resumen del caso** arriba (referencia RV-YYYY-XXXXX, vuelo, ruta, fecha, compensación, pasajeros)
- Barra "3 de 5 documentos subidos"
- Intro breve: "Necesitamos estos documentos para iniciar tu reclamación. Tardas 2-3 minutos."

### Lista de documentos (5 bloques)
Cada uno es una card con estados: vacío, subiendo, validando, válido, error.

1. 🪪 DNI/Pasaporte — OBLIGATORIO
2. 🎫 Tarjeta de embarque — OBLIGATORIO
3. 📧 Confirmación de reserva — OBLIGATORIO
4. 🏦 IBAN — OBLIGATORIO (input de texto con validación de formato, no upload)
5. 🧾 Recibos de gastos extras — OPCIONAL (múltiples)

**Nuevos documentos condicionales según tipo de incidencia:**
- Equipaje: + PIR (parte de irregularidad)
- Lesiones: + parte médico

### Interacciones
- Drag & drop en toda la página (no solo dropzones)
- Paste desde portapapeles (Cmd+V)
- Miniaturas reales (no iconos genéricos)
- Lightbox al click en thumbnail
- Validación por Claude Vision con feedback específico ("No se ve bien la fecha, sube foto más nítida")

### Submit
Botón "Enviar documentación" disabled hasta que todos los obligatorios estén verificados. Post-envío: pantalla de éxito con check grande.

### Sidebar informativo
"¿Por qué necesitamos esto?" con explicación breve de cada documento + FAQ corto ("¿Es seguro? ¿Quién lo ve?").

---

## 7. Páginas secundarias

### `/sobre-nosotros` (max-width 880px)
1. Hero: "Abogados especializados en derechos del pasajero desde 2017" + stat "8+ años"
2. Nuestra historia (2-3 párrafos)
3. Cómo trabajamos (3 cards: IA legal, abogados colegiados, sin costes iniciales)
4. Cifras reales (desde 2017, 6 tipos, mismo precio judicial/extrajudicial)
5. CTA final

### `/contacto` (max-width 960px, grid 2 cols)
- Izquierda: datos destacados (teléfonos reales clickables, horario, email, redes sociales)
- Derecha: formulario (nombre, email, asunto con select, mensaje) vía FormSubmit

### `/aviso-legal`, `/privacidad`, `/cookies` (max-width 760px)
- Layout tipo documento legal moderno
- TOC sticky a la izquierda en desktop (smooth scroll)
- Tipografía óptima de lectura (body 16px, line-height 1.7)
- Contenido legal existente preservado, solo reestructurado visualmente
- Link "¿Tienes dudas? Contáctanos" al final

### `/precios` (nueva página, max-width 760px)
- Card grande con "25% + IVA" + "solo si ganamos"
- Bullets de lo incluido
- Comparativa honesta (mismo precio judicial/extrajudicial vs competencia)
- FAQ 5 preguntas
- CTA "Reclamar →"

---

## 8. Nav & Footer

### Nav (`components/Nav.jsx` rediseñado)
**Desktop (≥900px):**
- Altura 72px, fondo blanco con glass effect en scroll
- Logo | Servicios (mega-menu con 6 tipos) · Cómo funciona · Precios · Blog · Contacto | 📞 Teléfono | CTA "Reclamar →"
- Sombra `sm` aparece al hacer scroll
- Link activo subrayado con `green-500`

**Mobile (<900px):**
- Altura 60px
- Logo + hamburger + CTA compacto
- Drawer lateral derecho con overlay, links grandes verticales, teléfonos destacados, CTA grande

### Footer (`components/Footer.jsx` rediseñado)
**Desktop — 5 columnas:**
1. Brand (logo + claim + redes sociales)
2. Producto (Servicios, Precios, Cómo funciona, Calculadora)
3. Empresa (Sobre nosotros, Blog, Contacto, Prensa)
4. Legal (Aviso legal, Privacidad, Cookies)
5. Contacto (teléfonos reales, horario, email)

**Barra inferior:** © 2026 · CE 261/2004.

**Estilo:** fondo `navy-900`, texto `slate-300`, links hover `green-500`.

**Mobile:** columnas en accordion o stack vertical.

---

## 9. Backend — ampliación a 6 tipos

### `lib/agent.js`
Extender prompt de Claude para cubrir:
- **Equipaje perdido/dañado** — Convenio de Montreal (NO CE 261/2004), hasta ~1600€ por pasajero, requiere PIR en aeropuerto, facturas, fotos del daño
- **Lesiones a bordo** — Convenio de Montreal art. 17, responsabilidad objetiva hasta ~170k DEG, requiere parte médico y nexo causal

Output unificado con los tipos actuales pero etiquetando qué regulación aplica.

### `pages/api/verify.js`
Nuevos branches según `tipo`. Para equipaje y lesiones, el resultado por defecto puede ser `REVISAR_MANUALMENTE` (requieren documentación específica que no se valida en verify sino en el upload), con CTA a hablar con abogado.

### `pages/index.jsx`
Los 2 tipos nuevos en el Paso 1 y sus sub-formularios en el Paso 2.

### `lib/validateDocs.js`
Nuevos tipos validables por Claude Vision:
- PIR (parte de irregularidad de equipaje)
- Parte médico
- Facturas de objetos perdidos/dañados

### `lib/email.js`
Templates con variaciones por tipo (texto ligeramente distinto para equipaje y lesiones — no CE 261/2004 sino Montreal).

---

## 10. Orden de implementación

1. **Design system** (`lib/theme.js` extendido + Google Fonts)
2. **Nav y Footer** (componentes compartidos, son prerequisito de todas las páginas)
3. **Landing page** (`pages/index.jsx` — parte no-wizard)
4. **Wizard** (`pages/index.jsx` — parte wizard) + ampliación a 6 tipos en UI
5. **Página de documentos** (`pages/aportar-documentos.jsx`)
6. **Páginas secundarias** (sobre-nosotros, contacto, legales, nueva `/precios`)
7. **Backend 6 tipos** (`lib/agent.js`, `/api/verify.js`, `lib/validateDocs.js`, `lib/email.js`)

Cada bloque es un checkpoint verificable en navegador antes de pasar al siguiente.

---

## 11. Fuera de scope

- Migración a Tailwind / CSS Modules
- Reescritura de textos legales (contenido preservado, solo reestructurado)
- Integración con Kmaleon API (sigue manual)
- Cambios en integraciones externas (FlightStats, AviationStack, METAR, Resend, FormSubmit)
- Internacionalización (sigue solo en español)
- Sistema de autenticación / cuentas de usuario
- Dashboard de seguimiento de casos para el usuario final

---

## 12. Criterios de éxito

- Todas las páginas renderizan sin errores en desktop y mobile
- Wizard completo de 3 pasos funciona con los 6 tipos de incidencia
- Lighthouse Performance ≥85, Accessibility ≥95
- El flujo end-to-end (landing → wizard → resultado → datos → email → upload → validación) funciona con al menos 1 tipo nuevo (equipaje)
- Responsive sin roturas en 360, 600, 900, 1200 px
