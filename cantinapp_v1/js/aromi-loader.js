// ============================================================
// CantinApp v1.07 - Loader sentori dinamico dal DB
// ============================================================
// Carica famiglie/sottocategorie/sentori da Supabase e SOSTITUISCE
// il contenuto della variabile globale AROMI (popolata da aromi-data.js).
//
// Strategia di fallback:
//   1. aromi-data.js viene caricato per primo (sync) → AROMI = dati statici
//   2. Questo loader prova a caricare dal DB (async)
//   3. Se DB risponde: mergia/sostituisce i sentori in AROMI
//   4. Se DB fallisce (offline, errore): AROMI resta com'è (fallback statico)
//   5. Cache in localStorage con TTL di 24h per evitare fetch ogni volta
// ============================================================

const AROMI_CACHE_KEY = 'cantinapp_aromi_cache_v1';
const AROMI_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function caricaAromiDaDB(forceRefresh = false) {
  // Tenta prima dalla cache (localStorage)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(AROMI_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < AROMI_CACHE_TTL_MS && parsed.aromi) {
          console.log('[aromi-loader] Cache hit (age:', Math.round(age/60000), 'min)');
          applicaAromi(parsed.aromi);
          // Aggiorna in background (non blocca)
          fetchAromiAsync();
          return;
        }
      }
    } catch (e) {
      console.warn('[aromi-loader] Cache illegibile:', e);
    }
  }

  // Cache stale o assente → fetch live
  await fetchAromiAsync();
}

async function fetchAromiAsync() {
  if (typeof sb === 'undefined') {
    console.warn('[aromi-loader] sb (Supabase client) non disponibile, uso fallback statico');
    return;
  }

  try {
    // Fetch parallelo delle 3 tabelle
    const [famRes, subRes, sentRes] = await Promise.all([
      sb.from('famiglie_olfattive').select('*').order('ordine'),
      sb.from('sottocategorie_olfattive').select('*').order('famiglia_key, ordine'),
      sb.from('sentori').select('id, sottocategoria_id, nome, stato').eq('stato', 'attivo'),
    ]);

    if (famRes.error) throw famRes.error;
    if (subRes.error) throw subRes.error;
    if (sentRes.error) throw sentRes.error;

    if (!famRes.data || famRes.data.length === 0) {
      console.warn('[aromi-loader] Nessuna famiglia nel DB, uso fallback statico');
      return;
    }

    // Ricostruisci la struttura AROMI nel formato originale
    const aromiNew = {};
    for (const fam of famRes.data) {
      aromiNew[fam.key] = {
        label: fam.label,
        color: fam.color || '#888',
        subcategories: {}
      };
    }
    for (const sub of subRes.data) {
      if (!aromiNew[sub.famiglia_key]) continue;
      aromiNew[sub.famiglia_key].subcategories[sub.key] = {
        _id: sub.id,
        label: sub.label,
        compat: sub.compat || [],
        sentori: []
      };
    }
    // Mappa: sottocategoria_id → riferimento sottocategoria
    const subById = {};
    for (const fam of Object.values(aromiNew)) {
      for (const sub of Object.values(fam.subcategories)) {
        subById[sub._id] = sub;
      }
    }
    for (const sent of sentRes.data) {
      const sub = subById[sent.sottocategoria_id];
      if (sub) sub.sentori.push(sent.nome);
    }
    // Ordina i sentori alfabeticamente all'interno di ogni sottocategoria
    for (const fam of Object.values(aromiNew)) {
      for (const sub of Object.values(fam.subcategories)) {
        sub.sentori.sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
      }
    }

    console.log(`[aromi-loader] DB caricato: ${famRes.data.length} famiglie, ${subRes.data.length} sottocat, ${sentRes.data.length} sentori`);

    // Salva in cache
    try {
      localStorage.setItem(AROMI_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        aromi: aromiNew
      }));
    } catch (e) {
      console.warn('[aromi-loader] Cache write failed:', e);
    }

    applicaAromi(aromiNew);
  } catch (e) {
    console.error('[aromi-loader] Errore fetch da DB, uso fallback:', e);
  }
}

function applicaAromi(aromiNew) {
  // Sostituisce in-place il contenuto della variabile globale AROMI
  // così tutto il codice che la usa (renderFamiglieAromi, ecc.) vede i nuovi dati
  if (typeof AROMI === 'undefined') {
    window.AROMI = aromiNew;
  } else {
    // Cancella le chiavi attuali e copia le nuove (in-place)
    for (const k of Object.keys(AROMI)) delete AROMI[k];
    for (const k of Object.keys(aromiNew)) AROMI[k] = aromiNew[k];
  }

  // Se la pagina ha già renderizzato la ruota aromi, ri-renderizza
  if (typeof renderFamiglieAromi === 'function') {
    try { renderFamiglieAromi(); } catch (e) { /* ignora */ }
  }
}

// Cancella la cache (utile dopo modifiche dall'admin)
function invalidaCacheAromi() {
  try { localStorage.removeItem(AROMI_CACHE_KEY); } catch (e) {}
}

// Auto-avvio al load: aspetta che sb sia pronto
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Piccolo delay per essere sicuro che supabase.js sia caricato
    setTimeout(() => caricaAromiDaDB(), 100);
  });
}
