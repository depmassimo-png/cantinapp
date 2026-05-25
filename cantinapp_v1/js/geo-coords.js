// ============================================================
// CantinApp — Coordinate geografiche per la mappa
// ============================================================
// Coordinate (lat, lng) per le principali zone vinicole italiane
// e per le nazioni estere.
//
// FONTI: Wikipedia (centroidi DOCG ufficiali), OpenStreetMap

// --- Zone DOCG/DOC principali italiane ---
// Chiave = nome normalizzato (lowercase, no DOCG/DOC, no accenti)
// Per le bottiglie italiane proviamo a matchare in ordine:
// 1) zona_vinicola esplicita
// 2) denominazione (es. "Brunello di Montalcino DOCG")
// 3) regione (fallback: centroide regione)

const ZONE_VINICOLE_IT = {
  // Piemonte
  'barolo':              { lat: 44.611, lng: 7.946,  regione: 'Piemonte' },
  'barbaresco':          { lat: 44.722, lng: 8.080,  regione: 'Piemonte' },
  'barbera d\'asti':     { lat: 44.900, lng: 8.207,  regione: 'Piemonte' },
  'barbera d\'alba':     { lat: 44.700, lng: 8.040,  regione: 'Piemonte' },
  'gavi':                { lat: 44.745, lng: 8.806,  regione: 'Piemonte' },
  'dolcetto':            { lat: 44.620, lng: 7.990,  regione: 'Piemonte' },
  'roero':               { lat: 44.785, lng: 7.960,  regione: 'Piemonte' },
  'asti':                { lat: 44.901, lng: 8.207,  regione: 'Piemonte' },
  'nebbiolo':            { lat: 44.700, lng: 7.950,  regione: 'Piemonte' },
  'monferrato':          { lat: 44.950, lng: 8.400,  regione: 'Piemonte' },
  'langhe':              { lat: 44.620, lng: 7.990,  regione: 'Piemonte' },

  // Valle d'Aosta
  'valle d\'aosta':      { lat: 45.737, lng: 7.320,  regione: 'Valle d\'Aosta' },

  // Lombardia
  'franciacorta':        { lat: 45.575, lng: 10.040, regione: 'Lombardia' },
  'valtellina':          { lat: 46.170, lng: 9.870,  regione: 'Lombardia' },
  'oltrepo pavese':      { lat: 44.980, lng: 9.150,  regione: 'Lombardia' },
  'lugana':              { lat: 45.450, lng: 10.620, regione: 'Lombardia' },

  // Veneto
  'prosecco':            { lat: 45.890, lng: 12.297, regione: 'Veneto' },
  'prosecco conegliano': { lat: 45.890, lng: 12.297, regione: 'Veneto' },
  'prosecco valdobbiadene': { lat: 45.900, lng: 12.000, regione: 'Veneto' },
  'amarone':             { lat: 45.500, lng: 10.900, regione: 'Veneto' },
  'valpolicella':        { lat: 45.530, lng: 10.900, regione: 'Veneto' },
  'soave':               { lat: 45.430, lng: 11.250, regione: 'Veneto' },
  'bardolino':           { lat: 45.550, lng: 10.720, regione: 'Veneto' },
  'recioto':             { lat: 45.500, lng: 10.900, regione: 'Veneto' },

  // Trentino-Alto Adige
  'trentino':            { lat: 46.070, lng: 11.120, regione: 'Trentino-Alto Adige' },
  'alto adige':          { lat: 46.500, lng: 11.350, regione: 'Trentino-Alto Adige' },
  'sudtirol':            { lat: 46.500, lng: 11.350, regione: 'Trentino-Alto Adige' },
  'teroldego':           { lat: 46.180, lng: 11.100, regione: 'Trentino-Alto Adige' },
  'trento':              { lat: 46.070, lng: 11.120, regione: 'Trentino-Alto Adige' },

  // Friuli-Venezia Giulia
  'collio':              { lat: 45.960, lng: 13.500, regione: 'Friuli-Venezia Giulia' },
  'colli orientali':     { lat: 46.090, lng: 13.450, regione: 'Friuli-Venezia Giulia' },
  'friuli':              { lat: 45.960, lng: 13.500, regione: 'Friuli-Venezia Giulia' },
  'carso':               { lat: 45.770, lng: 13.700, regione: 'Friuli-Venezia Giulia' },

  // Liguria
  'cinque terre':        { lat: 44.130, lng: 9.700,  regione: 'Liguria' },
  'rossese':             { lat: 43.820, lng: 7.610,  regione: 'Liguria' },

  // Emilia-Romagna
  'lambrusco':           { lat: 44.700, lng: 10.900, regione: 'Emilia-Romagna' },
  'sangiovese di romagna': { lat: 44.200, lng: 12.100, regione: 'Emilia-Romagna' },
  'albana':              { lat: 44.250, lng: 11.900, regione: 'Emilia-Romagna' },

  // Toscana
  'chianti':             { lat: 43.450, lng: 11.250, regione: 'Toscana' },
  'chianti classico':    { lat: 43.500, lng: 11.317, regione: 'Toscana' },
  'brunello di montalcino': { lat: 43.060, lng: 11.490, regione: 'Toscana' },
  'brunello':            { lat: 43.060, lng: 11.490, regione: 'Toscana' },
  'montalcino':          { lat: 43.060, lng: 11.490, regione: 'Toscana' },
  'vino nobile di montepulciano': { lat: 43.100, lng: 11.780, regione: 'Toscana' },
  'montepulciano':       { lat: 43.100, lng: 11.780, regione: 'Toscana' }, // attenzione: anche d'Abruzzo
  'bolgheri':            { lat: 43.230, lng: 10.610, regione: 'Toscana' },
  'maremma':             { lat: 42.760, lng: 11.110, regione: 'Toscana' },
  'morellino di scansano': { lat: 42.690, lng: 11.330, regione: 'Toscana' },
  'vernaccia di san gimignano': { lat: 43.470, lng: 11.040, regione: 'Toscana' },
  'carmignano':          { lat: 43.820, lng: 11.000, regione: 'Toscana' },

  // Umbria
  'sagrantino':          { lat: 42.930, lng: 12.700, regione: 'Umbria' },
  'montefalco':          { lat: 42.890, lng: 12.660, regione: 'Umbria' },
  'orvieto':             { lat: 42.720, lng: 12.110, regione: 'Umbria' },

  // Marche
  'verdicchio':          { lat: 43.420, lng: 13.000, regione: 'Marche' },
  'conero':              { lat: 43.560, lng: 13.620, regione: 'Marche' },
  'rosso piceno':        { lat: 43.000, lng: 13.700, regione: 'Marche' },

  // Lazio
  'frascati':            { lat: 41.810, lng: 12.680, regione: 'Lazio' },
  'cesanese':            { lat: 41.860, lng: 13.080, regione: 'Lazio' },
  'est est est':         { lat: 42.580, lng: 12.080, regione: 'Lazio' },

  // Abruzzo
  'montepulciano d\'abruzzo': { lat: 42.350, lng: 14.170, regione: 'Abruzzo' },
  'trebbiano d\'abruzzo': { lat: 42.350, lng: 14.170, regione: 'Abruzzo' },
  'cerasuolo':           { lat: 42.350, lng: 14.170, regione: 'Abruzzo' },

  // Molise
  'tintilia':            { lat: 41.700, lng: 14.600, regione: 'Molise' },

  // Campania
  'taurasi':             { lat: 40.990, lng: 14.960, regione: 'Campania' },
  'aglianico':           { lat: 41.000, lng: 15.000, regione: 'Campania' }, // attenzione anche Basilicata
  'fiano':               { lat: 40.870, lng: 14.900, regione: 'Campania' },
  'greco di tufo':       { lat: 40.990, lng: 14.860, regione: 'Campania' },
  'falanghina':          { lat: 41.130, lng: 14.380, regione: 'Campania' },
  'lacryma christi':     { lat: 40.820, lng: 14.430, regione: 'Campania' },

  // Puglia
  'primitivo':           { lat: 40.680, lng: 17.000, regione: 'Puglia' },
  'primitivo di manduria': { lat: 40.400, lng: 17.640, regione: 'Puglia' },
  'salice salentino':    { lat: 40.380, lng: 18.080, regione: 'Puglia' },
  'negroamaro':          { lat: 40.350, lng: 18.170, regione: 'Puglia' },
  'castel del monte':    { lat: 41.080, lng: 16.270, regione: 'Puglia' },

  // Basilicata
  'aglianico del vulture': { lat: 40.940, lng: 15.620, regione: 'Basilicata' },

  // Calabria
  'ciro':                { lat: 39.380, lng: 17.060, regione: 'Calabria' },
  'greco di bianco':     { lat: 37.940, lng: 16.140, regione: 'Calabria' },

  // Sicilia
  'etna':                { lat: 37.751, lng: 14.998, regione: 'Sicilia' },
  'nero d\'avola':       { lat: 37.500, lng: 14.500, regione: 'Sicilia' },
  'marsala':             { lat: 37.800, lng: 12.430, regione: 'Sicilia' },
  'cerasuolo di vittoria': { lat: 36.950, lng: 14.530, regione: 'Sicilia' },
  'passito di pantelleria': { lat: 36.780, lng: 11.990, regione: 'Sicilia' },

  // Sardegna
  'vermentino di gallura': { lat: 40.920, lng: 9.520, regione: 'Sardegna' },
  'vermentino':          { lat: 40.000, lng: 9.000,  regione: 'Sardegna' }, // attenzione anche Liguria
  'cannonau':            { lat: 40.000, lng: 9.500,  regione: 'Sardegna' },
  'carignano del sulcis': { lat: 39.150, lng: 8.520, regione: 'Sardegna' },
};

// --- Centroidi delle 20 regioni italiane (fallback) ---
const REGIONI_IT_COORDS = {
  'Abruzzo':              { lat: 42.350, lng: 13.800 },
  'Basilicata':           { lat: 40.500, lng: 16.000 },
  'Calabria':             { lat: 39.000, lng: 16.500 },
  'Campania':             { lat: 40.800, lng: 14.800 },
  'Emilia-Romagna':       { lat: 44.500, lng: 11.300 },
  'Friuli-Venezia Giulia': { lat: 46.000, lng: 13.250 },
  'Lazio':                { lat: 41.900, lng: 12.500 },
  'Liguria':              { lat: 44.300, lng: 8.900 },
  'Lombardia':            { lat: 45.580, lng: 9.930 },
  'Marche':               { lat: 43.300, lng: 13.300 },
  'Molise':               { lat: 41.700, lng: 14.700 },
  'Piemonte':             { lat: 45.000, lng: 7.800 },
  'Puglia':               { lat: 41.000, lng: 16.700 },
  'Sardegna':             { lat: 40.100, lng: 9.000 },
  'Sicilia':              { lat: 37.600, lng: 14.000 },
  'Toscana':              { lat: 43.450, lng: 11.250 },
  'Trentino-Alto Adige':  { lat: 46.300, lng: 11.300 },
  'Umbria':               { lat: 42.950, lng: 12.700 },
  "Valle d'Aosta":        { lat: 45.737, lng: 7.320 },
  'Veneto':               { lat: 45.500, lng: 11.800 },
};

// --- Centroidi delle nazioni vinicole (per bottiglie estere) ---
const NAZIONI_COORDS = {
  'Italia':       { lat: 42.500, lng: 12.500 },
  'Francia':      { lat: 46.200, lng: 2.200 },
  'Spagna':       { lat: 40.460, lng: -3.750 },
  'Portogallo':   { lat: 39.500, lng: -8.000 },
  'Germania':     { lat: 51.160, lng: 10.450 },
  'Austria':      { lat: 47.520, lng: 14.550 },
  'Svizzera':     { lat: 46.820, lng: 8.230 },
  'Grecia':       { lat: 39.070, lng: 21.820 },
  'Ungheria':     { lat: 47.160, lng: 19.500 },
  'Slovenia':     { lat: 46.150, lng: 14.990 },
  'Croazia':      { lat: 45.100, lng: 15.200 },
  'Georgia':      { lat: 42.310, lng: 43.360 },
  'Stati Uniti':  { lat: 37.000, lng: -120.000 }, // centrato su California (zona vinicola principale)
  'Argentina':    { lat: -33.000, lng: -68.500 }, // centrato su Mendoza
  'Cile':         { lat: -33.450, lng: -70.650 },
  'Australia':    { lat: -34.900, lng: 138.600 }, // centrato su Adelaide
  'Nuova Zelanda': { lat: -41.290, lng: 174.770 },
  'Sudafrica':    { lat: -33.900, lng: 18.420 }, // centrato su Cape Town
  'Altro':        { lat: 0, lng: 0 },
};

// Helper: normalizza una stringa per il matching (lowercase, no DOCG/DOC/IGT, trim)
function normalizzaZona(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/\b(docg|doc|igt|igp|dop|vino da tavola)\b/gi, '')
    .replace(/[àáâ]/g, 'a').replace(/[èéê]/g, 'e').replace(/[ìí]/g, 'i')
    .replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
    .replace(/\s+/g, ' ')
    .trim();
}

// Trova coordinate per una bottiglia
// Strategia: prova zona_vinicola → denominazione → nome_vino → regione → nazione
function trovaCoordinate(bottiglia) {
  const naz = bottiglia.nazione || 'Italia';

  if (naz === 'Italia') {
    // Prova prima zona_vinicola esplicita (campo futuro)
    if (bottiglia.zona_vinicola) {
      const k = normalizzaZona(bottiglia.zona_vinicola);
      if (ZONE_VINICOLE_IT[k]) return { ...ZONE_VINICOLE_IT[k], label: bottiglia.zona_vinicola, level: 'zona' };
    }
    // Prova denominazione (es. "Brunello di Montalcino DOCG")
    if (bottiglia.denominazione) {
      const k = normalizzaZona(bottiglia.denominazione);
      if (ZONE_VINICOLE_IT[k]) return { ...ZONE_VINICOLE_IT[k], label: bottiglia.denominazione, level: 'zona' };
      // Prova match parziale (es. "Brunello di Montalcino Riserva" → "brunello di montalcino")
      for (const zona of Object.keys(ZONE_VINICOLE_IT)) {
        if (k.includes(zona)) return { ...ZONE_VINICOLE_IT[zona], label: capFirst(zona), level: 'zona' };
      }
    }
    // Prova nel nome del vino
    if (bottiglia.nome_vino) {
      const k = normalizzaZona(bottiglia.nome_vino);
      for (const zona of Object.keys(ZONE_VINICOLE_IT)) {
        if (k.includes(zona)) return { ...ZONE_VINICOLE_IT[zona], label: capFirst(zona), level: 'zona' };
      }
    }
    // Fallback: regione
    if (bottiglia.regione && REGIONI_IT_COORDS[bottiglia.regione]) {
      return { ...REGIONI_IT_COORDS[bottiglia.regione], label: bottiglia.regione, level: 'regione' };
    }
    // Ultimo fallback: centro Italia
    return { ...NAZIONI_COORDS['Italia'], label: 'Italia', level: 'nazione' };
  }

  // Bottiglia estera: usa centroide nazione
  if (NAZIONI_COORDS[naz]) {
    return { ...NAZIONI_COORDS[naz], label: naz, level: 'nazione' };
  }

  return { lat: 0, lng: 0, label: naz || 'Sconosciuto', level: 'nazione' };
}

function capFirst(s) {
  if (!s) return '';
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
