// ============================================================
// CantinApp — Bevute (lista degustazioni)
// ============================================================

let currentUser = null;
let degustazioni = [];

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;
  await loadDegustazioni();
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
  updateStats();
  renderList();
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

  let filtered = degustazioni;
  if (search) {
    filtered = filtered.filter(d => {
      const nome = (d.bottiglia?.nome_vino || d.nome_vino_esterno || '').toLowerCase();
      const prod = (d.bottiglia?.produttore || d.produttore_esterno || '').toLowerCase();
      return nome.includes(search) || prod.includes(search);
    });
  }

  if (filtered.length === 0) {
    if (degustazioni.length === 0) {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-glass-full"></i>
          <h3>Ancora nessuna degustazione</h3>
          <p>Apri una bottiglia dalla tua cantina<br>e tocca <strong>Degusta ora</strong> per cominciare</p>
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
  for (const d of filtered) html += cardHtml(d);
  area.innerHTML = html;
}

function cardHtml(d) {
  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || 'Vino senza nome';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';
  const tipologia = d.bottiglia?.tipologia || '';

  const punti = d.punteggio_totale || 0;
  const fascia = d.fascia_finale || '';
  const stelle = d.voto_piacere_personale || 0;
  const stelleHtml = stelle > 0
    ? Array.from({length: 5}, (_, i) => i < stelle ? '★' : '<span class="empty">★</span>').join('')
    : '';

  return `
    <a class="degust-card" href="scheda.html?id=${d.id}">
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
        ${tipologia ? `<span class="badge badge-${tipologia}">${cap(tipologia)}</span>` : ''}
        ${fascia ? `<span class="degust-fascia f-${fascia}">${labelFascia(fascia)}</span>` : ''}
        ${d.luogo ? `<span class="badge badge-anno">${esc(d.luogo)}</span>` : ''}
      </div>
      ${stelleHtml ? `<div class="stars-line">${stelleHtml}</div>` : ''}
      ${d.note_conclusive ? `<div class="degust-note">"${esc(d.note_conclusive)}"</div>` : ''}
    </a>`;
}

function labelFascia(f) {
  const map = {
    accettabile: 'Accettabile',
    buono: 'Buono',
    ottimo: 'Ottimo',
    eccellente: 'Eccellente',
    avvincente: 'Avvincente',
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
