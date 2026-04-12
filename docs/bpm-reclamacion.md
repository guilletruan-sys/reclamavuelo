# ReclamaVuelo — Proceso de reclamación (BPM)

Diagrama de proceso al estilo **BPMN** con los 4 actores que intervienen: Cliente, Sistema (chat), Agente IA y Equipo legal. Pensado como documento operativo de proceso para imprimir o usar en reuniones.

**Notación utilizada:**

- ⚫ **Círculo negro grueso** — Evento de inicio / fin
- 🟦 **Rectángulo azul redondeado** — Tarea (acción ejecutada por un actor)
- 🔷 **Rombo azul** — Gateway (punto de decisión)
- 📩 **Rectángulo verde** — Mensaje o comunicación (email, notificación)
- 👤 **Icono de persona** — Acción del cliente
- 🖥️ **Icono de monitor** — Acción del sistema (chat, backend)
- 🤖 **Icono de robot** — Acción del agente IA (Claude)
- ⚖️ **Icono de balanza** — Acción del equipo legal

---

## 1. Proceso completo por fases

El proceso se divide en **5 fases** secuenciales. Cada fase tiene su responsable principal.

```mermaid
flowchart TB
    START((( Inicio )))

    subgraph FASE1["FASE 1 · Entrada al proceso"]
        direction TB
        F1A[👤 Cliente llega a la web]
        F1B[👤 Pulsa 'Reclamar ahora']
        F1C[🖥️ Se abre la ventana del chat]
        F1A --> F1B --> F1C
    end

    subgraph FASE2["FASE 2 · Recogida de datos del vuelo"]
        direction TB
        F2A[🖥️ Pregunta tipo de incidencia]
        F2B[👤 Selecciona uno de los 6 tipos]
        F2C[🖥️ Pide aerolínea, nº vuelo, fecha, origen, destino]
        F2D[👤 Responde los datos básicos]
        F2E{🔷 Tipo específico}
        F2A --> F2B --> F2C --> F2D --> F2E
    end

    subgraph FASE3["FASE 3 · Análisis automático"]
        direction TB
        F3A[🖥️ Consulta estado del vuelo<br/>en AviationStack]
        F3B[🖥️ Consulta meteorología<br/>en METAR / NOAA]
        F3C[🤖 Agente IA analiza caso<br/>aplicando CE 261 o Montreal]
        F3D[🤖 Emite veredicto con<br/>resumen + razonamiento + factores]
        F3A --> F3C
        F3B --> F3C
        F3C --> F3D
    end

    subgraph FASE4["FASE 4 · Datos personales y expediente"]
        direction TB
        F4A[🖥️ Pregunta datos personales<br/>uno a uno]
        F4B[👤 Introduce nombre, DNI,<br/>email, teléfono, pasajeros]
        F4C[🖥️ Pide consentimiento RGPD<br/>y aceptar comisión 25%]
        F4D[👤 Firma los dos checkboxes]
        F4E[🖥️ Genera referencia del caso<br/>RV-2026-XXXXX]
        F4F[📩 Email de confirmación<br/>al cliente con enlace de fallback]
        F4A --> F4B --> F4C --> F4D --> F4E --> F4F
    end

    subgraph FASE5["FASE 5 · Documentos y cierre"]
        direction TB
        F5A[🖥️ Solicita documentos obligatorios<br/>uno a uno]
        F5B[👤 Sube DNI, tarjeta embarque,<br/>reserva, IBAN y específicos del tipo]
        F5C[🤖 Valida cada documento<br/>con Claude Vision]
        F5D[🖥️ Empaqueta expediente<br/>con los archivos adjuntos]
        F5E[📩 Email interno al equipo legal<br/>con PDFs adjuntos]
        F5F[⚖️ Equipo recibe expediente<br/>y revisa en 24h]
        F5G[⚖️ Inicia reclamación formal<br/>ante la aerolínea]
        F5A --> F5B --> F5C --> F5D --> F5E --> F5F --> F5G
    end

    END((( Fin del proceso<br/>reclamación iniciada )))
    NOEND((( Fin sin expediente<br/>caso no reclamable )))

    START --> FASE1
    FASE1 --> FASE2

    F2E -->|retraso| F2R[👤 Hora llegada opcional]
    F2E -->|cancelación| F2C1[👤 Aviso · alternativa · hora]
    F2E -->|conexión| F2CO[👤 Vuelo 2 · destino final · PNR]
    F2E -->|overbooking| F2O[👤 Compensación aeropuerto]
    F2E -->|equipaje| F2EQ[👤 Tipo daño · valor · PIR]
    F2E -->|lesiones| F2L[👤 Tipo · parte médico · descripción]

    F2R --> FASE3
    F2C1 --> FASE3
    F2CO --> FASE3
    F2O --> FASE3
    F2EQ --> FASE3
    F2L --> FASE3

    FASE3 --> DECISION{🔷 Veredicto}
    DECISION -->|SÍ reclamable<br/>o REVISAR| FASE4
    DECISION -->|NO reclamable| NOEND

    FASE4 --> FASE5
    FASE5 --> END

    classDef fase fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef gateway fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef event fill:#0a1628,stroke:#0a1628,color:#fff,font-weight:bold
    classDef email fill:#d1fae5,stroke:#10b981,color:#065f46
    classDef task fill:#ffffff,stroke:#64748b,color:#0a1628

    class FASE1,FASE2,FASE3,FASE4,FASE5 fase
    class F2E,DECISION gateway
    class START,END,NOEND event
    class F4F,F5E email
    class F1A,F1B,F1C,F2A,F2B,F2C,F2D,F3A,F3B,F3C,F3D,F4A,F4B,F4C,F4D,F4E,F5A,F5B,F5C,F5D,F5F,F5G,F2R,F2C1,F2CO,F2O,F2EQ,F2L task
```

---

## 2. Interacciones entre los 4 actores (diagrama de secuencia)

Cómo se comunican los actores a lo largo del proceso, en orden cronológico. Este es el diagrama operativo más útil para entender "quién hace qué y cuándo".

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Cliente
    participant S as 🖥️ Sistema (chat)
    participant I as 🤖 Agente IA (Claude)
    participant E as ⚖️ Equipo legal

    Note over C,S: FASE 1 — Entrada
    C->>S: Entra al chat y pulsa "Reclamar"
    S-->>C: Pregunta: ¿Qué le pasó al vuelo?

    Note over C,S: FASE 2 — Recogida de datos
    loop Para cada pregunta del tipo específico
        S-->>C: Pregunta
        C->>S: Respuesta (pick, texto, fecha, etc.)
    end

    Note over S,I: FASE 3 — Análisis automático
    S->>S: Consulta AviationStack (estado del vuelo)
    S->>S: Consulta METAR (meteorología)
    S->>I: Envía datos del caso al agente IA
    I->>I: Aplica reglas CE 261 o Convenio de Montreal
    I-->>S: Devuelve veredicto + razonamiento
    S-->>C: Muestra resultado con tarjeta de colores

    alt Veredicto NO reclamable
        S-->>C: Mensaje respetuoso explicando el motivo
        Note over C: Fin del chat sin expediente
    else Veredicto SÍ o REVISAR
        Note over C,S: FASE 4 — Datos personales
        loop Por cada campo personal
            S-->>C: Pregunta (nombre, DNI, email, etc.)
            C->>S: Responde
        end

        S-->>C: Pide consentimiento RGPD + comisión 25%
        C->>S: Acepta los dos checkboxes

        S->>S: Genera referencia RV-2026-XXXXX
        S-->>C: 📧 Email de confirmación + enlace de fallback

        Note over C,I: FASE 5 — Documentos
        loop Por cada documento requerido
            S-->>C: Pide el documento
            C->>S: Sube el archivo
            S->>I: Valida con Claude Vision
            I-->>S: ✓ válido o ⚠ rechazado
            alt Documento rechazado
                S-->>C: Pide que suba otra versión
                C->>S: Reintenta
            end
        end

        S-->>C: Pide IBAN
        C->>S: Introduce IBAN (validación MOD-97)

        S->>E: 📧 Email interno con el expediente completo y los archivos adjuntos
        S-->>C: Pantalla de confirmación "Te contactaremos en 24h"

        Note over E: Fuera del chat
        E->>E: Revisa el expediente
        E->>E: Inicia reclamación formal ante la aerolínea
    end
```

**Cómo leerlo:**

- Las flechas sólidas (→) son **llamadas o acciones** de un actor hacia otro
- Las flechas discontinuas (-->) son **respuestas** del receptor
- Los bloques `alt` son **decisiones condicionales** (pasa A o pasa B)
- Los bloques `loop` son **repeticiones** (se ejecutan N veces hasta completar)
- Las notas son **agrupaciones de fase** para orientarte visualmente

---

## 3. Subproceso de análisis (el gateway principal)

Zoom sobre la fase 3, donde el agente IA toma la decisión. Este es el corazón del proceso.

```mermaid
flowchart TB
    START2((( Datos del caso<br/>recibidos )))
    START2 --> INPUT[/🖥️ Inputs:<br/>tipo, aerolínea, vuelo, fecha,<br/>origen, destino, campos específicos/]

    INPUT --> PREP[🖥️ Preparación<br/>- Normaliza datos<br/>- Calcula distancia<br/>- Mapea a esquema backend]

    PREP --> LOOKUP[🖥️ Enriquecimiento<br/>- AviationStack: estado vuelo<br/>- METAR: meteorología]

    LOOKUP --> TIPO{🔷 ¿Qué tipo?}

    TIPO -->|retraso · cancelación<br/>conexión · overbooking| CE261[🤖 Agente CE 261<br/>Claude aplica reglamento<br/>europeo con jurisprudencia]
    TIPO -->|equipaje| MONTB[🤖 Rama Equipaje<br/>Convenio de Montreal<br/>análisis determinista]
    TIPO -->|lesiones| MONTI[🤖 Rama Lesiones<br/>Convenio de Montreal<br/>siempre REVISAR]

    CE261 --> EVAL{🔷 Evalúa condiciones}

    EVAL -->|Retraso <3h<br/>o aviso ≥14d<br/>o causa extraordinaria| NO[⚪ NO RECLAMABLE]
    EVAL -->|Condiciones positivas<br/>sin exoneración| DIST{🔷 Distancia}

    DIST -->|≤ 1.500 km| R250[🟢 RECLAMABLE 250€]
    DIST -->|1.500-3.500 km| R400[🟢 RECLAMABLE 400€]
    DIST -->|>3.500 km| R600[🟢 RECLAMABLE 600€]

    EVAL -->|Cancelación con alternativa<br/>dentro de márgenes| REDUCED[🟢 RECLAMABLE 50%]

    MONTB --> PIR{🔷 ¿Hay PIR?}
    PIR -->|Sí| EQ_OK[🟡 REVISAR con estimación<br/>hasta 1.600€]
    PIR -->|No| EQ_KO[🟡 REVISAR sin PIR<br/>viabilidad reducida]

    MONTI --> MED{🔷 ¿Parte médico?}
    MED -->|Sí| LE_OK[🟡 REVISAR con<br/>documento sanitario]
    MED -->|No| LE_KO[🟡 REVISAR<br/>orientación del abogado]

    OUT[/🤖 Output estructurado:<br/>decision, confianza, cifra,<br/>resumen, razonamiento,<br/>factores, siguiente paso/]

    NO --> OUT
    R250 --> OUT
    R400 --> OUT
    R600 --> OUT
    REDUCED --> OUT
    EQ_OK --> OUT
    EQ_KO --> OUT
    LE_OK --> OUT
    LE_KO --> OUT

    OUT --> END2((( Veredicto<br/>listo para el cliente )))

    classDef task fill:#ffffff,stroke:#64748b,color:#0a1628
    classDef gateway fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef event fill:#0a1628,stroke:#0a1628,color:#fff,font-weight:bold
    classDef reclamable fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold
    classDef noproc fill:#f1f5f9,stroke:#94a3b8,color:#475569
    classDef revisar fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef data fill:#e0e7ff,stroke:#4f46e5,color:#312e81

    class INPUT,PREP,LOOKUP,CE261,MONTB,MONTI,OUT task
    class TIPO,EVAL,DIST,PIR,MED gateway
    class START2,END2 event
    class R250,R400,R600,REDUCED reclamable
    class NO noproc
    class EQ_OK,EQ_KO,LE_OK,LE_KO revisar
```

---

## 4. Eventos excepcionales

Qué ocurre cuando algo se sale del camino feliz. Un proceso BPM robusto necesita definir estos flujos.

```mermaid
flowchart TB
    START3((( Proceso normal<br/>en curso )))
    START3 --> NORMAL[Cliente avanza<br/>respondiendo preguntas]

    NORMAL --> Q1{¿Cliente cierra<br/>el navegador?}
    Q1 -->|Sí| Q1A[🖥️ Estado guardado<br/>en localStorage]
    Q1A --> Q1B[Cliente vuelve más tarde]
    Q1B --> Q1C[🖥️ Muestra banner:<br/>¿Continuar o empezar?]
    Q1C --> Q1D[Cliente elige]
    Q1D --> NORMAL

    NORMAL --> Q2{¿AviationStack<br/>no encuentra el vuelo?}
    Q2 -->|Sí| Q2A[🤖 Agente analiza con<br/>los datos declarados<br/>por el cliente]
    Q2A --> NORMAL

    NORMAL --> Q3{¿Documento<br/>rechazado por IA?}
    Q3 -->|Sí| Q3A[🖥️ Muestra razón<br/>'Foto poco nítida',<br/>'Nombre no legible',...]
    Q3A --> Q3B[👤 Cliente sube<br/>otra versión]
    Q3B --> NORMAL

    NORMAL --> Q4{¿Cliente no tiene<br/>los documentos<br/>a mano ahora?}
    Q4 -->|Sí| Q4A[🖥️ Opción 'Subirlos<br/>por email más tarde']
    Q4A --> Q4B[📩 Email con link único<br/>/aportar-documentos?d=token]
    Q4B --> Q4C[Cliente vuelve<br/>desde el email]
    Q4C --> NORMAL

    NORMAL --> Q5{¿Fallo de red<br/>o timeout del backend?}
    Q5 -->|Sí| Q5A[🖥️ Mensaje de error<br/>con botón 'Reintentar']
    Q5A --> NORMAL

    NORMAL --> HAPPY((( Proceso completado<br/>con éxito )))

    classDef normal fill:#d1fae5,stroke:#10b981,color:#065f46
    classDef excep fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef gateway fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef event fill:#0a1628,stroke:#0a1628,color:#fff,font-weight:bold

    class NORMAL,HAPPY normal
    class Q1A,Q1B,Q1C,Q1D,Q2A,Q3A,Q3B,Q4A,Q4B,Q4C,Q5A excep
    class Q1,Q2,Q3,Q4,Q5 gateway
    class START3,HAPPY event
```

---

## 5. Matriz de responsabilidades (RACI)

Quién es responsable, aprueba, es consultado o informado en cada fase del proceso.

| Fase | Cliente | Sistema | Agente IA | Equipo legal |
|---|:-:|:-:|:-:|:-:|
| **1. Entrada al proceso** | **R** | A | — | — |
| **2. Recogida de datos del vuelo** | **R** | A | — | — |
| **3. Análisis automático** | — | C | **R** | — |
| **4. Datos personales** | **R** | A | — | I |
| **5. Subida de documentos** | **R** | A | C | I |
| **6. Envío de expediente** | I | **R** | — | I |
| **7. Reclamación formal a la aerolínea** | I | — | — | **R** |

**Leyenda:** **R** = Responsable (ejecuta la tarea) · **A** = Apoyo (ayuda a ejecutar) · **C** = Consultado (se le pide información) · **I** = Informado (recibe notificación) · **—** = No participa

---

## 6. KPIs y puntos de medida

Métricas que se pueden extraer del proceso para evaluar rendimiento:

| Métrica | Dónde se mide | Objetivo |
|---|---|---|
| **Tasa de abandono por fase** | Contar cuántos clientes entran en cada fase y cuántos llegan a la siguiente | < 15% entre fase 2 y 3 |
| **Tiempo medio por fase** | Timestamp de inicio y fin de cada fase por cliente | Fase 2: <3 min · Fase 4: <2 min · Fase 5: <4 min |
| **Tasa de reclamabilidad** | Decisiones positivas del agente / total de análisis | Orientativo, depende del tipo de tráfico |
| **Precisión del agente** | Casos donde el equipo legal está de acuerdo con el veredicto | >90% |
| **Tasa de documentos válidos al primer intento** | Validaciones OK / total de uploads | >80% |
| **Tiempo hasta contacto del equipo** | Desde email interno hasta primera respuesta al cliente | <24h |
| **Tasa de conversión a reclamación formal** | Expedientes enviados a aerolínea / expedientes recibidos | >95% |

Estas métricas se deberían instrumentar en una iteración posterior con analítica (PostHog, Umami o similar).

---

## Notación BPMN usada en este documento

Este documento usa una versión **simplificada** de BPMN (Business Process Model and Notation). Los elementos clave:

| Elemento | Símbolo | Significado |
|---|---|---|
| **Evento de inicio** | `((( Inicio )))` | Punto donde arranca el proceso |
| **Evento de fin** | `((( Fin )))` | Punto donde termina una rama |
| **Tarea** | `[Rectángulo]` | Acción concreta ejecutada por un actor |
| **Gateway (decisión)** | `{Rombo}` | Punto donde el flujo se bifurca según una condición |
| **Mensaje / comunicación** | `📩 Email` | Envío de información entre actores |
| **Subproceso** | Subgraph | Grupo de tareas que forman una fase |
| **Swimlane implícito** | Icono en cada tarea | Actor responsable (👤🖥️🤖⚖️) |

BPMN completo tiene más elementos (subproceso colapsado, eventos intermedios, compensación, temporizadores, mensajes entre pools, etc.) pero para este proceso los anteriores son suficientes.

---

**Mantenimiento del documento:** cuando se modifique el flujo del chat en `lib/conversation-script.js` o se cambie el criterio legal del agente en `lib/agent.js`, actualiza este documento para que refleje el proceso real.
