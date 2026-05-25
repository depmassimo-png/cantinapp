// ============================================================
// CantinApp — Bevute (degustazioni + bottiglie consumate senza scheda)
// ============================================================

let currentUser = null;
let degustazioni = [];
let bevuteSenzaScheda = []; // bottiglie con stato='bevuta' ma senza scheda

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;
  await Promise.all([loadDegustazioni(), loadBevuteSenzaScheda()]);
  updateStats();
  renderList();
})();

async function loadDegustazioni() {
  const { data, error } = await sb
    .from('degustazioni')
    .select(`
      *,
      bottiglia:bottiglie (
        nome_vino, produttore, annata, tipologia, etichetta_url
      )
    `)
    .order('data_degustazione', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    document.getElementById('listArea').innerHTML =
      `<div class="empty"><i class="ti ti-alert-circle"></i><h3>Errore</h3><p>${error.message}</p></div>`;
    return;
  }
  degustazioni = data || [];
}

// Carica le bottiglie segnate come "bevuta" che NON hanno ancora una scheda di degustazione
async function loadBevuteSenzaScheda() {
  // 1. Lista bottiglie con stato bevuta
  const { data: bottiglieBevute, error: e1 } = await sb
    .from('bottiglie')
    .select('id, nome_vino, produttore, annata, tipologia, etichetta_url, updated_at, created_at')
    .eq('user_id', currentUser.id)
    .eq('stato', 'bevuta')
    .order('updated_at', { ascending: false });

  if (e1 || !bottiglieBevute) {
    bevuteSenzaScheda = [];
    return;
  }

  // 2. Lista degustazioni già esistenti (per filtrare quelle bottiglie)
  const { data: idsDeg } = await sb
    .from('degustazioni')
    .select('bottiglia_id')
    .not('bottiglia_id', 'is', null);

  const idsConScheda = new Set((idsDeg || []).map(d => d.bottiglia_id));

  // 3. Filtra: tieni solo le bevute SENZA degustazione associata
  bevuteSenzaScheda = bottiglieBevute.filter(b => !idsConScheda.has(b.id));
}

function updateStats() {
  const tot = degustazioni.length;
  document.getElementById('statTot').textContent = tot;
  document.getElementById('totaleBevute').textContent =
    tot === 0 ? 'Nessuna degustazione' :
    tot === 1 ? '1 degustazione' :
    `${tot} degustazioni`;

  const conPunti = degustazioni.filter(d => d.punteggio_totale && d.punteggio_totale > 0);
  if (conPunti.length === 0) {
    document.getElementById('statMedia').textContent = '—';
    return;
  }
  const media = conPunti.reduce((s, d) => s + d.punteggio_totale, 0) / conPunti.length;
  document.getElementById('statMedia').textContent = media.toFixed(1).replace('.', ',');
}

function renderList() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const area = document.getElementById('listArea');

  let filteredDeg = degustazioni;
  let filteredBev = bevuteSenzaScheda;
  if (search) {
    filteredDeg = filteredDeg.filter(d => {
      const nome = (d.bottiglia?.nome_vino || d.nome_vino_esterno || '').toLowerCase();
      const prod = (d.bottiglia?.produttore || d.produttore_esterno || '').toLowerCase();
      return nome.includes(search) || prod.includes(search);
    });
    filteredBev = filteredBev.filter(b => {
      const nome = (b.nome_vino || '').toLowerCase();
      const prod = (b.produttore || '').toLowerCase();
      return nome.includes(search) || prod.includes(search);
    });
  }

  if (filteredDeg.length === 0 && filteredBev.length === 0) {
    if (degustazioni.length === 0 && bevuteSenzaScheda.length === 0) {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-glass-full"></i>
          <h3>Ancora nessuna bottiglia bevuta</h3>
          <p>Apri una bottiglia dalla tua cantina<br>e tocca <strong>Bevuta</strong> per cominciare</p>
        </div>`;
    } else {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-search"></i>
          <h3>Nessun risultato</h3>
          <p>Prova a modificare la ricerca</p>
        </div>`;
    }
    return;
  }

  let html = '';

  // SEZIONE 1: bottiglie bevute senza scheda (in cima, perché richiedono azione)
  if (filteredBev.length > 0) {
    html += `<div class="bev-section-title">
      <i class="ti ti-pencil"></i> Da valutare
      <span class="bev-section-count">${filteredBev.length}</span>
    </div>`;
    for (const b of filteredBev) html += cardBevutaSenzaScheda(b);
  }

  // SEZIONE 2: degustazioni complete
  if (filteredDeg.length > 0) {
    if (filteredBev.length > 0) {
      // separator visibile solo se ci sono anche le altre
      html += `<div class="bev-section-title">
        <i class="ti ti-checks"></i> Degustazioni complete
        <span class="bev-section-count">${filteredDeg.length}</span>
      </div>`;
    }
    for (const d of filteredDeg) html += cardHtml(d);
  }

  area.innerHTML = html;
}

// Card per una bottiglia bevuta senza scheda compilata
function cardBevutaSenzaScheda(b) {
  const data = b.updated_at ? formatDate(b.updated_at) : '';
  const annata = b.annata || '';
  const tipologia = b.tipologia || 'default';

  return `
    <a class="degust-card degust-card-pending" href="degusta.html?bottiglia_id=${b.id}">
      <div class="degust-stripe stripe-${tipologia}"></div>
      <div class="degust-top">
        <div class="degust-info">
          <div class="degust-name">${esc(b.nome_vino || 'Vino senza nome')}</div>
          <div class="degust-prod">${esc(b.produttore || '')}${annata ? ' · ' + annata : ''}</div>
        </div>
        <div class="degust-right">
          <div class="degust-data">${data}</div>
        </div>
      </div>
      <div class="degust-meta">
        ${tipologia !== 'default' ? `<span class="tipo-label tipo-${tipologia}">${cap(tipologia)}</span>` : ''}
        <span class="degust-pending-pill"><i class="ti ti-pencil"></i> Compila scheda</span>
      </div>
    </a>`;
}

function cardHtml(d) {
  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || 'Vino senza nome';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';
  const tipologia = d.bottiglia?.tipologia || 'default';

  const punti = d.punteggio_totale || 0;
  const stelle = d.voto_piacere_personale || 0;
  const stelleHtml = stelle > 0
    ? Array.from({length: 5}, (_, i) => i < stelle ? '★' : '<span class="empty">★</span>').join('')
    : '';

  return `
    <a class="degust-card" href="scheda.html?id=${d.id}">
      <div class="degust-stripe stripe-${tipologia}"></div>
      <div class="degust-top">
        <div class="degust-info">
          <div class="degust-name">${esc(nome)}</div>
          <div class="degust-prod">${esc(prod)}${annata ? ' · ' + annata : ''}</div>
        </div>
        <div class="degust-right">
          ${punti > 0 ? `<div class="degust-punti">${punti}<span class="degust-punti-max">/100</span></div>` : ''}
          <div class="degust-data">${formatDate(d.data_degustazione)}</div>
        </div>
      </div>
      <div class="degust-meta">
        ${tipologia !== 'default' ? `<span class="tipo-label tipo-${tipologia}">${cap(tipologia)}</span>` : ''}
        ${d.luogo ? `<span class="degust-tag"><i class="ti ti-map-pin"></i>${esc(d.luogo)}</span>` : ''}
        ${stelleHtml ? `<span class="stars-line">${stelleHtml}</span>` : ''}
      </div>
    </a>`;
}

function labelFascia(f) {
  const map = {
    accettabile: 'Accettabile',
    buono: 'Buono',
    ottimo: 'Ottimo',
    eccellente: 'Eccellente',
    memorabile: 'Memorabile',
  };
  return map[f] || f;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
