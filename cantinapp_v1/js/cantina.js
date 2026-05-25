// ============================================================
// CantinApp — Cantina (lista bottiglie)
// ============================================================

let bottiglie = [];
let filtroAttivo = 'all';
let currentUser = null;

// Inizializzazione
(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  // Carica nome utente
  loadUserName();

  // Carica bottiglie
  await loadBottiglie();
})();

async function loadUserName() {
  const el = document.getElementById('userName');
  if (!el) return;
  const { data } = await sb.from('profiles').select('username').eq('id', currentUser.id).single();
  if (data) {
    el.textContent = 'Ciao, ' + data.username;
  } else {
    el.textContent = currentUser.email;
  }
}

async function loadBottiglie() {
  const { data, error } = await sb
    .from('bottiglie')
    .select('*')
    .eq('stato', 'disponibile')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Errore caricamento: ' + error.message, true);
    return;
  }
  bottiglie = data || [];

  // Counter bottiglie
  const n = bottiglie.length;
  const totQty = bottiglie.reduce((s, b) => s + (b.quantita || 1), 0);
  const label = n === 0
    ? 'Nessuna bottiglia in cantina'
    : (totQty === 1 ? '1 bottiglia in cantina' : totQty + ' bottiglie in cantina');
  document.getElementById('totalCount').textContent = label;

  // Valore totale stimato
  let valore = 0;
  for (const b of bottiglie) {
    if (b.prezzo_acquisto && b.prezzo_acquisto > 0) {
      valore += b.prezzo_acquisto * (b.quantita || 1);
    }
  }
  const elValore = document.getElementById('totalValue');
  if (elValore) {
    if (valore > 0) {
      elValore.textContent = `Valore stimato: €${valore.toFixed(0)}`;
      elValore.style.display = 'block';
    } else {
      elValore.style.display = 'none';
    }
  }

  renderBottiglie();
}

// Determina se una bottiglia è "pronta da bere" in base al range pronto_da/pronto_fino_a
function isBottigliaPronta(b) {
  const annoCorrente = new Date().getFullYear();
  const da = b.pronto_da;
  const fino = b.pronto_fino_a;
  // Se mancano entrambi, non sappiamo: non è "pronta certa"
  if (!da && !fino) return false;
  if (da && annoCorrente < da) return false;
  if (fino && annoCorrente > fino) return false;
  return true;
}

function setFilter(filter, btn) {
  filtroAttivo = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBottiglie();
}

function applyFilters() {
  renderBottiglie();
}

function renderBottiglie() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const area = document.getElementById('contentArea');

  // Filtri
  let filtered = bottiglie;
  if (filtroAttivo === 'pronti') {
    filtered = filtered.filter(isBottigliaPronta);
  } else if (filtroAttivo !== 'all') {
    filtered = filtered.filter(b => b.tipologia === filtroAttivo);
  }
  if (search) {
    filtered = filtered.filter(b =>
      (b.nome_vino || '').toLowerCase().includes(search) ||
      (b.produttore || '').toLowerCase().includes(search) ||
      (b.denominazione || '').toLowerCase().includes(search) ||
      (b.regione || '').toLowerCase().includes(search)
    );
  }

  // Empty state
  if (filtered.length === 0) {
    if (bottiglie.length === 0) {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-bottle-wine" aria-hidden="true"></i>
          <h3>La tua cantina è vuota</h3>
          <p>Aggiungi la tua prima bottiglia<br>toccando il pulsante <strong>+</strong> in basso</p>
        </div>`;
    } else if (filtroAttivo === 'pronti') {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-clock" aria-hidden="true"></i>
          <h3>Nessuna bottiglia pronta</h3>
          <p>Nessuno dei tuoi vini è nel range ottimale di consumo<br>secondo i campi "Pronto da / Pronto fino a"</p>
        </div>`;
    } else {
      area.innerHTML = `
        <div class="empty">
          <i class="ti ti-search" aria-hidden="true"></i>
          <h3>Nessun risultato</h3>
          <p>Prova a modificare i filtri o la ricerca</p>
        </div>`;
    }
    return;
  }

  // Lista piatta (no raggruppamenti)
  let html = '<div class="wine-list">';
  for (const b of filtered) html += cardHtml(b);
  html += '</div>';

  area.innerHTML = html;
}

function groupByTipologia(arr) {
  const out = {};
  for (const b of arr) {
    (out[b.tipologia] = out[b.tipologia] || []).push(b);
  }
  return out;
}

function labelTipologia(tip) {
  const map = {
    rosso: 'Vini rossi', bianco: 'Vini bianchi', rosato: 'Vini rosati',
    spumante: 'Spumanti', passito: 'Passiti', liquoroso: 'Liquorosi'
  };
  return map[tip] || tip;
}

function badgeClass(tipologia) {
  return 'badge-' + tipologia;
}

function cardHtml(b) {
  const tipologia = b.tipologia || 'rosso';
  const annata = b.annata || 'NM';
  const gradi = b.gradazione ? b.gradazione.toString().replace('.', ',') + '°' : '';
  const qty = b.quantita || 1;
  const pronta = isBottigliaPronta(b);
  const img = b.etichetta_url
    ? `<img src="${b.etichetta_url}" alt="">`
    : (b.controetichetta_url
        ? `<img src="${b.controetichetta_url}" alt="">`
        : `<i class="ti ti-bottle-wine" aria-hidden="true"></i>`);

  const badgePronto = pronta
    ? `<span class="wine-badge-pronto" title="Nel range ottimale di consumo"><i class="ti ti-circle-check" style="font-size:11px"></i> Pronto</span>`
    : '';

  return `
    <a class="wine-card" href="bottiglia.html?id=${b.id}">
      <span class="wine-stripe stripe-${tipologia}"></span>
      <div class="wine-thumb ${tipologia}">${img}</div>
      <div class="wine-info">
        <div class="wine-name">${escapeHtml(b.nome_vino)}${badgePronto}</div>
        <div class="wine-producer">${escapeHtml(b.produttore)}</div>
        <div class="wine-meta-row">
          <span class="tipo-label tipo-${tipologia}">${capitalize(tipologia)}</span>
          <span class="wine-extra">${annata}${gradi ? ' · ' + gradi : ''}</span>
        </div>
      </div>
      <div class="wine-qty">×${qty}</div>
    </a>`;
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function confirmLogout() {
  if (confirm('Vuoi davvero uscire?')) {
    sb.auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  }
}
