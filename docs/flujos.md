# ReclamaVuelo — Flujos del chat de reclamación

Este documento describe **qué pregunta el chat al cliente**, en qué orden, y cómo cambian las preguntas según sus respuestas. Es la versión legible para el equipo que gestiona las reclamaciones. Todos los diagramas están en Mermaid y se ven directamente en GitHub.

**Índice**

1. [Visión general](#1-visión-general)
2. [Recorrido común al principio](#2-recorrido-común-al-principio)
3. [Preguntas según el tipo de incidencia](#3-preguntas-según-el-tipo-de-incidencia)
   - [Retraso](#retraso)
   - [Cancelación](#cancelación)
   - [Conexión perdida](#conexión-perdida)
   - [Overbooking](#overbooking)
   - [Equipaje](#equipaje)
   - [Lesiones a bordo](#lesiones-a-bordo)
4. [Resultado del análisis](#4-resultado-del-análisis)
5. [Datos personales y consentimiento](#5-datos-personales-y-consentimiento)
6. [Subida de documentos](#6-subida-de-documentos)
7. [Final del proceso](#7-final-del-proceso)
8. [Cuándo se dice "sí", "no" o "revisar"](#8-cuándo-se-dice-sí-no-o-revisar)

---

## 1. Visión general

El cliente entra en la web y habla con un asesor virtual. El chat le va haciendo preguntas una a una. Al final recoge:

- **Qué pasó con el vuelo** y sus detalles concretos
- **Datos personales** y consentimiento
- **Documentos** para el expediente

Cuando termina, el equipo legal recibe un email con el caso completo y todos los archivos adjuntos.

```mermaid
flowchart LR
    A([Cliente<br/>llega a la web]) --> B[Empieza el chat]
    B --> C[Cuenta qué le pasó<br/>al vuelo]
    C --> D[El sistema analiza<br/>si tiene derecho]
    D --> E{¿Procede?}
    E -->|No procede| F([Se le explica<br/>el motivo y fin])
    E -->|Sí o dudoso| G[Datos personales<br/>+ aceptar condiciones]
    G --> H[Sube documentos]
    H --> I([El equipo recibe<br/>el expediente<br/>por email])

    style B fill:#d1fae5
    style D fill:#fef3c7
    style I fill:#d1fae5
    style F fill:#f1f5f9
```

---

## 2. Recorrido común al principio

Todos los clientes empiezan respondiendo las mismas 6 preguntas básicas, sin importar qué tipo de incidencia tengan. Son los datos del vuelo.

```mermaid
flowchart TB
    Q1[¿Qué le pasó a tu vuelo?<br/>6 opciones: retraso · cancelación ·<br/>conexión · overbooking · equipaje · lesiones]
    Q1 --> Q2[¿Con qué aerolínea volaste?]
    Q2 --> Q3[¿Cuál era el número de vuelo?<br/>ej: IB2634]
    Q3 --> Q4[¿En qué fecha fue el vuelo?]
    Q4 --> Q5[¿Desde qué aeropuerto saliste?<br/>Madrid, Barcelona, Londres...]
    Q5 --> Q6[¿A qué aeropuerto ibas?]
    Q6 --> Branch{{A partir de aquí las preguntas cambian<br/>según el tipo de incidencia}}

    style Branch fill:#fef3c7
```

Una vez contestadas, el chat salta a las preguntas específicas del tipo de incidencia elegido.

---

## 3. Preguntas según el tipo de incidencia

### Retraso

Una sola pregunta adicional, y opcional.

```mermaid
flowchart LR
    A[Preguntas básicas del vuelo] --> B[¿Sabes a qué hora llegaste<br/>finalmente al destino?<br/>Opcional: se puede omitir]
    B --> C[El sistema analiza el caso]

    style C fill:#fef3c7
```

**Qué necesita el equipo saber:** hora real de llegada si la conoce. Si no, lo buscamos con datos operacionales.

---

### Cancelación

El tipo con más ramificación. Dependiendo de si hubo alternativa y si la aceptó, el flujo cambia.

```mermaid
flowchart TB
    A[Preguntas básicas del vuelo] --> Q1[¿Cuándo te avisaron<br/>de la cancelación?]
    Q1 --> Q2[¿La aerolínea te ofreció<br/>un vuelo alternativo?]

    Q2 -->|No| Final[El sistema analiza el caso]
    Q2 -->|Sí| Q3[¿Aceptaste el vuelo alternativo?]

    Q3 -->|No| Final
    Q3 -->|Sí| Q4[¿A qué hora llegaste finalmente<br/>con el vuelo alternativo?]
    Q4 --> Final

    style Final fill:#fef3c7
```

**Opciones de la pregunta "¿Cuándo te avisaron?":** Mismo día · 1-7 días antes · 7-14 días antes · Más de 14 días.

**Qué necesita el equipo saber:** si el aviso fue con más de 14 días, la reclamación no procede (la aerolínea cumplió el Reglamento). Si hubo alternativa y llegó con poco retraso, la compensación puede reducirse a la mitad.

---

### Conexión perdida

Tres preguntas adicionales. La más importante es si los dos vuelos estaban en la misma reserva.

```mermaid
flowchart LR
    A[Preguntas básicas del vuelo] --> Q1[¿Número del segundo vuelo<br/>que perdiste?]
    Q1 --> Q2[¿A qué aeropuerto<br/>ibas finalmente?]
    Q2 --> Q3[¿Los dos vuelos estaban<br/>en la misma reserva?<br/>mismo billete y PNR]
    Q3 --> Final[El sistema analiza el caso]

    style Final fill:#fef3c7
```

**Qué necesita el equipo saber:** si los billetes eran separados (distinto PNR), la conexión perdida no está cubierta por la normativa europea — el cliente asumió el riesgo al comprar dos billetes independientes.

---

### Overbooking

Dos preguntas sobre si la aerolínea intentó compensar en el aeropuerto.

```mermaid
flowchart LR
    A[Preguntas básicas del vuelo] --> Q1[¿Te ofrecieron compensación<br/>en el aeropuerto?]

    Q1 -->|No| Final[El sistema analiza el caso]
    Q1 -->|Sí| Q2[¿Aceptaste esa compensación?]
    Q2 --> Final

    style Final fill:#fef3c7
```

**Qué necesita el equipo saber:** si el cliente aceptó voluntariamente la compensación ofrecida en el mostrador (bonos, vuelo posterior, alojamiento...), el caso se marca para revisión manual porque depende de lo que firmó. Si fue denegación involuntaria, normalmente procede la compensación automática del Reglamento.

---

### Equipaje

Tres preguntas sobre el daño/pérdida y el parte en el aeropuerto.

```mermaid
flowchart LR
    A[Preguntas básicas del vuelo] --> Q1[¿Qué le pasó al equipaje?<br/>Perdido · Retrasado · Dañado]
    Q1 --> Q2[Valor aproximado<br/>del contenido en euros]
    Q2 --> Q3[¿Hiciste el PIR<br/>parte de irregularidad<br/>en el aeropuerto?]
    Q3 --> Final[El sistema analiza el caso]

    style Final fill:#fef3c7
```

**Qué necesita el equipo saber:** el PIR es **imprescindible** para reclamar por equipaje. Sin PIR, el caso pasa a revisión manual con advertencia de que la viabilidad es baja (hay un plazo de 7 días para daños y 21 días para retrasos). El límite legal de compensación es aproximadamente 1.600€ por pasajero según el Convenio de Montreal.

---

### Lesiones a bordo

Tres preguntas sobre la lesión y el parte médico.

```mermaid
flowchart LR
    A[Preguntas básicas del vuelo] --> Q1[¿Qué tipo de lesión sufriste?<br/>caída, quemadura, golpe...]
    Q1 --> Q2[¿Tienes parte médico?<br/>Sí · No pero fui al médico · No]
    Q2 --> Q3[Descripción breve<br/>de lo que ocurrió]
    Q3 --> Final[El sistema analiza el caso]

    style Final fill:#fef3c7
```

**Qué necesita el equipo saber:** todos los casos de lesiones van a revisión manual (un abogado estudia el expediente) porque la compensación varía mucho según gravedad y documentación médica aportada. El marco legal es el Convenio de Montreal y la aerolínea responde sin necesidad de probar culpa.

---

## 4. Resultado del análisis

Tras las preguntas, el sistema analiza el caso y da uno de tres veredictos. El chat lo muestra al cliente con colores distintos y el razonamiento jurídico.

```mermaid
flowchart TB
    A[El sistema analiza<br/>el caso con las reglas<br/>CE 261 o Convenio de Montreal] --> B{Resultado}

    B -->|Sí reclamable| SI[SÍ RECLAMABLE<br/>muestra cifra estimada<br/>250€ · 400€ · 600€]
    B -->|No reclamable| NO[NO RECLAMABLE<br/>explica el motivo legal<br/>al cliente con respeto]
    B -->|Caso dudoso| REV[REVISAR MANUALMENTE<br/>un abogado estudiará el caso]

    SI --> C[Continúa con datos personales]
    REV --> C
    NO --> Fin([Fin del chat<br/>sin expediente])

    style SI fill:#d1fae5
    style NO fill:#f1f5f9
    style REV fill:#fef3c7
```

**Qué ve el cliente:**

- **Sí reclamable** → tarjeta verde con la cifra grande, factores clave que ha considerado el análisis (ej: "retraso ≥3h", "sin causa extraordinaria") y el siguiente paso
- **No reclamable** → tarjeta neutra (no roja — no queremos ser hostiles) con la razón jurídica clara
- **Revisar manualmente** → tarjeta ámbar con explicación de por qué necesita revisión humana

---

## 5. Datos personales y consentimiento

Solo si el resultado ha sido "sí reclamable" o "revisar". Si fue "no reclamable", el chat termina antes.

```mermaid
flowchart LR
    Q1[Nombre] --> Q2[Apellidos]
    Q2 --> Q3[DNI / NIE / Pasaporte]
    Q3 --> Q4[Email]
    Q4 --> Q5[Teléfono]
    Q5 --> Q6[Número de pasajeros<br/>en la reserva]
    Q6 --> Q7[Dos casillas obligatorias:<br/>RGPD + comisión 25%]
    Q7 --> Guardar[Se guarda el caso<br/>y el cliente recibe<br/>un email de confirmación]

    style Guardar fill:#d1fae5
```

**Qué firma el cliente:**

1. Política de privacidad y tratamiento de datos
2. Aceptación de la comisión del 25% + IVA sobre la compensación obtenida (solo si se consigue)

**Qué pasa en este momento:** se genera una referencia de caso (`RV-2026-XXXXX`) y se manda un email al cliente confirmando que hemos recibido su reclamación con un enlace por si más tarde quiere añadir documentos.

---

## 6. Subida de documentos

El cliente sube los archivos necesarios. Cada uno se analiza automáticamente para verificar que es legible y coherente con el caso antes de avanzar a la siguiente pregunta.

```mermaid
flowchart TB
    A[DNI o Pasaporte<br/>foto de ambas caras] --> B[Tarjeta de embarque]
    B --> C[Confirmación de reserva<br/>email o PDF con el localizador]

    C --> Branch{¿Tipo de incidencia?}

    Branch -->|Equipaje| D1[PIR<br/>parte de irregularidad<br/>del aeropuerto]
    Branch -->|Lesiones| D2[Parte médico<br/>del centro sanitario]
    Branch -->|Resto| D3[Recibos opcionales<br/>comidas, hotel, taxis...]

    D1 --> E[Recibos opcionales<br/>comidas, hotel, taxis...]
    D2 --> E
    D3 --> IBAN[IBAN del cliente<br/>para el ingreso]

    E --> IBAN
    IBAN --> Final[Se envía el expediente<br/>completo al equipo legal<br/>con todos los archivos adjuntos]

    style Final fill:#d1fae5
```

**Qué documentos son obligatorios según el caso:**

| Tipo de incidencia | DNI | Tarjeta embarque | Reserva | PIR | Parte médico | Recibos |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Retraso | ✓ | ✓ | ✓ | — | — | opcional |
| Cancelación | ✓ | ✓ | ✓ | — | — | opcional |
| Conexión | ✓ | ✓ | ✓ | — | — | opcional |
| Overbooking | ✓ | ✓ | ✓ | — | — | opcional |
| Equipaje | ✓ | ✓ | ✓ | **✓** | — | opcional |
| Lesiones | ✓ | ✓ | ✓ | — | **✓** | opcional |

**Validación automática:** cada archivo se revisa con IA antes de aceptarse. Si un documento no es legible o está incompleto, el chat le pide al cliente que suba otra versión antes de continuar.

---

## 7. Final del proceso

Cuando el cliente termina todos los pasos, el equipo legal recibe un email con:

- **Referencia del caso** (`RV-2026-XXXXX`)
- **Datos del cliente** y del vuelo
- **Decisión del análisis** y razonamiento jurídico
- **Todos los documentos adjuntos** nombrados con la referencia: `RV-2026-XXXXX_DNI.jpg`, `RV-2026-XXXXX_TarjetaEmbarque.pdf`, etc.
- **IBAN** del cliente para el futuro ingreso

El cliente ve una pantalla final confirmando que todo se ha enviado correctamente y que se le contactará en 24 horas.

```mermaid
flowchart LR
    A([Cliente termina<br/>el chat]) --> B[Email de confirmación<br/>al cliente]
    A --> C[Email interno<br/>al equipo legal<br/>con adjuntos]
    C --> D[Equipo revisa<br/>el expediente<br/>en 24 horas]
    D --> E[Se inicia la reclamación<br/>formal a la aerolínea]

    style A fill:#d1fae5
    style B fill:#d1fae5
    style E fill:#d1fae5
```

---

## 8. Cuándo se dice "sí", "no" o "revisar"

Esto es el resumen del criterio que usa el análisis automático para clasificar cada caso. Está basado en el **Reglamento (CE) 261/2004** y en el **Convenio de Montreal 1999**.

### Cuándo SÍ es reclamable

| Situación | Cifra |
|---|---|
| Retraso de 3 horas o más en el destino final, sin causa justificada | 250€ / 400€ / 600€ según distancia |
| Cancelación avisada con menos de 14 días de antelación, sin causa justificada | 250€ / 400€ / 600€ según distancia |
| Cancelación con alternativa que llegó con mucho retraso | 250€ / 400€ / 600€ según distancia |
| Conexión perdida con los dos vuelos en el mismo billete y retraso final ≥3h | 250€ / 400€ / 600€ según distancia |
| Denegación de embarque involuntaria por overbooking | 250€ / 400€ / 600€ según distancia |
| Cancelación con alternativa que llegó dentro de márgenes (2h/3h/4h) | **La mitad** de la cifra |

**Cifras según la distancia del vuelo:**

- ≤ 1.500 km → 250€
- 1.500 a 3.500 km (o intracomunitario superior a 1.500 km) → 400€
- Más de 3.500 km fuera de la UE → 600€

### Cuándo NO es reclamable

- Retraso inferior a 3 horas (no alcanza el umbral mínimo establecido por el Tribunal de Justicia europeo)
- Cancelación avisada con **más de 14 días** de antelación (la aerolínea cumplió la normativa)
- Causa extraordinaria confirmada:
  - Meteorología realmente severa (nevada intensa, niebla densa, tormenta importante)
  - Huelga de controladores aéreos u otros terceros ajenos a la aerolínea
  - Restricciones de ATC/Eurocontrol documentadas
  - Riesgos de seguridad o inestabilidad política
- Conexión perdida con **billetes separados** (distinto PNR) — la normativa no cubre enlaces autogestionados

### Cuándo pasa a REVISAR MANUALMENTE

- **Overbooking con compensación aceptada voluntariamente** en el aeropuerto → depende del acuerdo concreto firmado con la aerolínea
- **Equipaje** (cualquier caso) → la compensación varía según documentación aportada, aplica Convenio de Montreal no CE 261
- **Lesiones a bordo** → siempre revisión humana, los importes son muy variables y dependen del parte médico

---

## Notas para el equipo

- **El sistema es conservador con las causas extraordinarias:** solo las considera si hay evidencia real (p.ej. el parte meteorológico del aeropuerto confirma la severidad, o hay noticia pública de una huelga). No basta con que la aerolínea lo alegue.
- **Un caso clasificado como "no reclamable" no significa que no se pueda intentar.** El cliente siempre puede contactar con nosotros si cree que hay matices que el análisis automático no ha considerado.
- **En "revisar manualmente" es obligatorio que un abogado valide antes de enviar la reclamación** a la aerolínea.
- **Los importes que muestra el chat son estimaciones.** La cifra final puede variar según documentación probatoria adicional y lo que finalmente acepte la aerolínea o decida el juzgado.
- **El chat guarda la conversación** mientras el cliente la mantiene abierta. Si cierra el navegador y vuelve, aparece un banner ofreciendo continuar donde lo dejó.

---

**Mantenimiento del documento:** si cambia alguna pregunta del chat, se añade un tipo nuevo, o se actualizan los criterios legales, actualiza este archivo para que refleje lo que ve realmente el cliente.
