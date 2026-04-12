# ReclamaVuelo — Mapa de decisión

Un único mapa visual con todo el árbol de decisiones del chat. Pensado para imprimir en A3 o proyectar en pantalla grande durante una sesión del equipo.

**Código de colores en todos los diagramas:**

- 🟢 **Verde** — El caso sí es reclamable. Cifra estimada al lado.
- ⚪ **Gris** — El caso no es reclamable. Fin del proceso.
- 🟡 **Ámbar** — Revisar manualmente. Un abogado debe estudiar el expediente antes de decidir.

---

## 1. Mapa completo de decisión

Este es el árbol entero, de principio a fin. Todo lo que puede ocurrir cuando un cliente entra al chat.

```mermaid
flowchart TB
    START([Cliente entra al chat]) --> TIPO{¿Qué le pasó al vuelo?}

    TIPO -->|Retraso| R1{¿Llegaste con<br/>3 horas o más de retraso<br/>al destino final?}
    TIPO -->|Cancelación| C1{¿Cuándo te avisaron?}
    TIPO -->|Conexión perdida| X1{¿Mismo billete<br/>los dos vuelos?<br/>mismo PNR}
    TIPO -->|Overbooking| O1{¿Denegación<br/>voluntaria?<br/>te ofrecieron compensar<br/>y aceptaste}
    TIPO -->|Equipaje| E1{¿Hiciste el PIR<br/>en el aeropuerto?}
    TIPO -->|Lesiones a bordo| L1{¿Tienes parte médico?}

    %% === RETRASO ===
    R1 -->|No, menos de 3h| RNO[NO RECLAMABLE<br/>No alcanza el umbral<br/>Sturgeon de 3 horas]
    R1 -->|Sí, 3h o más| R2{¿Causa extraordinaria<br/>confirmada?<br/>meteo severa, huelga ATC,<br/>restricción Eurocontrol}
    R2 -->|Sí| RNO2[NO RECLAMABLE<br/>La aerolínea queda<br/>exonerada por fuerza mayor]
    R2 -->|No| DIST

    %% === CANCELACIÓN ===
    C1 -->|Más de 14 días antes| CNO[NO RECLAMABLE<br/>Aviso suficiente<br/>según la normativa]
    C1 -->|Menos de 14 días| C2{¿Causa extraordinaria<br/>confirmada?}
    C2 -->|Sí| CNO2[NO RECLAMABLE<br/>Fuerza mayor]
    C2 -->|No| C3{¿Te ofrecieron<br/>vuelo alternativo?}
    C3 -->|No| DIST
    C3 -->|Sí| C4{¿Llegaste con<br/>la alternativa dentro<br/>de márgenes?<br/>2h / 3h / 4h según distancia}
    C4 -->|Sí, dentro| CREDUCED[RECLAMABLE<br/>MITAD DE LA CIFRA<br/>125€ / 200€ / 300€]
    C4 -->|No, muy tarde| DIST

    %% === CONEXIÓN ===
    X1 -->|No, billetes separados| XNO[NO RECLAMABLE<br/>La conexión perdida<br/>con billetes separados<br/>no está cubierta]
    X1 -->|Sí, mismo PNR| X2{¿Retraso en<br/>destino final<br/>de 3h o más?}
    X2 -->|No| XNO2[NO RECLAMABLE]
    X2 -->|Sí| DIST

    %% === OVERBOOKING ===
    O1 -->|Sí, voluntaria| OREV[REVISAR<br/>Depende del acuerdo<br/>firmado en el aeropuerto]
    O1 -->|No, involuntaria| DIST

    %% === EQUIPAJE ===
    E1 -->|Sí, tengo PIR| EREV[REVISAR<br/>Convenio de Montreal<br/>Hasta 1.600€ según<br/>documentación]
    E1 -->|No, sin PIR| EREV2[REVISAR<br/>Sin PIR la reclamación<br/>es muy difícil<br/>Plazo: 7d daño · 21d retraso]

    %% === LESIONES ===
    L1 -->|Sí| LREV[REVISAR<br/>Convenio de Montreal<br/>art. 17 — responsabilidad<br/>objetiva aerolínea]
    L1 -->|No| LREV2[REVISAR<br/>Abogado orienta sobre<br/>cómo obtener el parte]

    %% === DISTANCIA ===
    DIST{Distancia del vuelo} -->|≤ 1.500 km| C250[RECLAMABLE<br/>250€]
    DIST -->|1.500 a 3.500 km| C400[RECLAMABLE<br/>400€]
    DIST -->|Más de 3.500 km| C600[RECLAMABLE<br/>600€]

    %% === DESPUÉS DEL VEREDICTO ===
    C250 --> FLOW[Continúa el chat:<br/>datos personales<br/>consentimiento<br/>documentos]
    C400 --> FLOW
    C600 --> FLOW
    CREDUCED --> FLOW
    OREV --> FLOW
    EREV --> FLOW
    EREV2 --> FLOW
    LREV --> FLOW
    LREV2 --> FLOW

    FLOW --> DONE([Expediente enviado<br/>al equipo legal])

    RNO --> END([Fin del chat<br/>sin expediente])
    RNO2 --> END
    CNO --> END
    CNO2 --> END
    XNO --> END
    XNO2 --> END

    %% === ESTILOS ===
    classDef sino fill:#f1f5f9,stroke:#94a3b8,color:#475569
    classDef reclamable fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold
    classDef revisar fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef decision fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef terminal fill:#ffffff,stroke:#0a1628,stroke-width:3px,color:#0a1628

    class RNO,RNO2,CNO,CNO2,XNO,XNO2 sino
    class C250,C400,C600,CREDUCED reclamable
    class OREV,EREV,EREV2,LREV,LREV2 revisar
    class START,END,DONE,FLOW terminal
```

---

## 2. Mapa de distancia → cifra

Cuando el caso es "sí reclamable", la cifra depende solo de la distancia del vuelo. Esta es la regla:

```mermaid
flowchart LR
    A([Caso reclamable]) --> Q{Distancia<br/>del vuelo}

    Q -->|≤ 1.500 km| B1[250€]
    Q -->|1.500 — 3.500 km<br/>o intracomunitario<br/>de más de 1.500 km| B2[400€]
    Q -->|Más de 3.500 km<br/>fuera de la UE| B3[600€]

    B1 --> C{¿Se ofreció<br/>alternativa que llegó<br/>dentro de márgenes?}
    B2 --> C
    B3 --> C

    C -->|Sí| D[Se reduce a la mitad<br/>125€ · 200€ · 300€]
    C -->|No| E[Cifra completa<br/>250€ · 400€ · 600€]

    classDef amount fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold
    classDef reducido fill:#fef3c7,stroke:#f59e0b,color:#92400e

    class B1,B2,B3,E amount
    class D reducido
```

**Ejemplos reales:**

- Madrid → Barcelona (480 km) → 250€
- Madrid → Londres (1.250 km) → 250€
- Madrid → Atenas (2.370 km) → 400€
- Madrid → Berlín (1.860 km) → 400€
- Madrid → Nueva York (5.760 km) → 600€
- Madrid → Buenos Aires (10.050 km) → 600€

**Márgenes de reducción al 50%** (sólo aplica a cancelaciones con alternativa aceptada):

- ≤ 1.500 km → llegar con menos de **2 horas** de retraso
- 1.500 a 3.500 km → menos de **3 horas**
- Más de 3.500 km → menos de **4 horas**

---

## 3. Mapa de qué ocurre después del veredicto

Tras el análisis, el chat sigue uno de dos caminos: continúa con el cliente hasta completar el expediente, o termina con un mensaje respetuoso si no procede.

```mermaid
flowchart TB
    V{Veredicto<br/>del análisis}

    V -->|Sí reclamable| SI([SÍ RECLAMABLE<br/>con cifra estimada])
    V -->|Revisar| REV([REVISAR<br/>abogado estudiará el caso])
    V -->|No reclamable| NO([NO RECLAMABLE<br/>razón clara y respetuosa])

    SI --> P1[Datos personales<br/>nombre · apellidos · DNI<br/>email · teléfono · nº pasajeros]
    REV --> P1
    NO --> FIN1([Fin del chat<br/>sin recoger más datos])

    P1 --> P2[Consentimiento<br/>RGPD + comisión 25%]
    P2 --> EMAIL1[Email confirmación<br/>al cliente]
    EMAIL1 --> P3[Subida de documentos<br/>paso a paso<br/>validación con IA]
    P3 --> P4[IBAN del cliente]
    P4 --> EMAIL2[Email al equipo legal<br/>con el expediente completo<br/>y todos los adjuntos]
    EMAIL2 --> FIN2([Cliente ve pantalla<br/>de confirmación<br/>'Te contactaremos en 24h'])

    classDef reclamable fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold
    classDef revisar fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef noproc fill:#f1f5f9,stroke:#94a3b8,color:#475569
    classDef step fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef terminal fill:#ffffff,stroke:#0a1628,stroke-width:3px,color:#0a1628

    class SI reclamable
    class REV revisar
    class NO noproc
    class P1,P2,P3,P4 step
    class EMAIL1,EMAIL2 step
    class FIN1,FIN2 terminal
```

---

## 4. Resumen visual en una tabla

Si los diagramas son demasiado para un vistazo rápido, esta tabla condensa todo el criterio de clasificación:

| Tipo | Condición positiva | Condición negativa | Cifra |
|---|---|---|---|
| **Retraso** | Llegada con 3h o más de retraso | Menos de 3h **o** causa extraordinaria | 250€ / 400€ / 600€ |
| **Cancelación** | Aviso con menos de 14 días, sin alternativa razonable | Aviso ≥14 días **o** causa extraordinaria **o** alternativa dentro de márgenes (50% si dentro) | 250€ / 400€ / 600€ (o 50%) |
| **Conexión** | Mismo billete y retraso final ≥3h | Billetes separados **o** retraso final <3h | 250€ / 400€ / 600€ |
| **Overbooking** | Denegación involuntaria | Aceptó compensación voluntaria (→ revisar) | 250€ / 400€ / 600€ |
| **Equipaje** | Con PIR hecho en el aeropuerto | — (siempre revisar) | Hasta 1.600€ (revisar) |
| **Lesiones** | Con parte médico | — (siempre revisar) | Variable (revisar) |

---

## 5. Los 6 veredictos posibles en una sola vista

```mermaid
flowchart TB
    V[Veredicto final] --> R1[RECLAMABLE 250€]
    V --> R2[RECLAMABLE 400€]
    V --> R3[RECLAMABLE 600€]
    V --> R4[RECLAMABLE al 50%<br/>125€ · 200€ · 300€]
    V --> REV[REVISAR MANUALMENTE<br/>equipaje, lesiones,<br/>overbooking voluntario]
    V --> NO[NO RECLAMABLE<br/>causas extraordinarias,<br/>retraso corto, aviso largo,<br/>billetes separados]

    classDef r fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold
    classDef rev fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef n fill:#f1f5f9,stroke:#94a3b8,color:#475569

    class R1,R2,R3,R4 r
    class REV rev
    class NO n
```

---

## Nota sobre cómo leer los diagramas

- **Los rombos azules** son preguntas que hace el sistema o decisiones que toma el algoritmo
- **Los rectángulos verdes** son resultados positivos con compensación
- **Los rectángulos ámbar** son casos que requieren intervención humana
- **Los rectángulos grises** son casos que terminan sin expediente
- **Las cápsulas con borde negro** son puntos de inicio o fin del proceso

Las flechas indican el camino que sigue el flujo según cada respuesta del cliente o cada condición evaluada.

Todos los diagramas de este documento se renderizan automáticamente en GitHub, VS Code con extensión Mermaid, y en la mayoría de visores Markdown modernos.
