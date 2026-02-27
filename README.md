# ReclamaVuelo ✈️

Plataforma de reclamaciones aéreas con verificación automática via IA.

## Stack
- **Next.js 14** — frontend + API routes
- **FlightStats/Cirium** — datos históricos de vuelos
- **aviationweather.gov** — METARs meteorológicos (gratuito)
- **Claude Sonnet** — agente de decisión jurídica
- **FormSubmit** — envío de emails sin backend

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Edita .env.local con tus keys:
#   FLIGHTSTATS_APP_ID=...
#   FLIGHTSTATS_APP_KEY=...
#   ANTHROPIC_API_KEY=...

# 3. Arrancar en local
npm run dev
# → http://localhost:3000
```

## Deploy en Vercel

```bash
# Primera vez
npm i -g vercel
vercel

# Siguientes deploys (desde GitHub automático o manual)
vercel --prod
```

**Variables de entorno en Vercel:**
Ve a tu proyecto → Settings → Environment Variables y añade las mismas que en `.env.local`.

## Casos cubiertos
- ✅ Retraso (+3h en destino final)
- ✅ Cancelación (aviso <14 días)
- ✅ Conexión perdida (mismo PNR)
- ✅ Overbooking (denegación de embarque)

## Lógica del agente
1. **FlightStats** → retraso real, estado del vuelo, delay codes
2. **METAR** → condiciones meteorológicas en hora del vuelo
3. **Claude Sonnet** → análisis jurídico CE 261/2004 → RECLAMABLE / NO_RECLAMABLE / REVISAR

## Compensaciones CE 261/2004
| Distancia | Compensación |
|-----------|-------------|
| ≤1.500 km | 250€ |
| 1.500–3.500 km | 400€ |
| >3.500 km | 600€ |
