// ============================================================
// CantinApp — Statistiche cantina
// ============================================================

let bottiglie = [];
let currentUser = null;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;
  await loadBottiglie();
  renderStats();
})();

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
}

function renderStats() {
  const area = document.getElementById('contentArea');

  if (bottiglie.length === 0) {
    area.innerHTML = `
      <div class="empty-stat">
        <i class="ti ti-bottle-wine"></i>
        <h3>La tua cantina è vuota</h3>
        <p>Aggiungi qualche bottiglia per vedere<br>le statistiche della tua collezione</p>
      </div>`;
    return;
  }

  const annoCorrente = new Date().getFullYear();
  const totQty = bottiglie.reduce((s, b) => s + (b.quantita || 1), 0);

  // ========== Valore totale ==========
  const valoreTotale = bottiglie.reduce((s, b) => {
    const p = b.prezzo_acquisto || 0;
    return s + p * (b.quantita || 1);
  }, 0);
  const prezzoMedio = valoreTotale > 0 ? valoreTotale / totQty : 0;

  // ========== Pronti da bere ==========
  const pronte = bottiglie.filter(b => {
    if (!b.anno_pronto_da && !b.anno_pronto_a) return false;
    if (b.anno_pronto_da && annoCorrente < b.anno_pronto_da) return false;
    if (b.anno_pronto_a && annoCorrente > b.anno_pronto_a) return false;
    return true;
  });
  const prontoQty = pronte.reduce((s, b) => s + (b.quantita || 1), 0);

  // ========== In scadenza (entro 2 anni) ==========
  const inScadenza = bottiglie.filter(b => {
    if (!b.anno_pronto_a) return false;
    const yearsLeft = b.anno_pronto_a - annoCorrente;
    return yearsLeft >= 0 && yearsLeft <= 2;
  });

  // ========== Vino più vecchio ==========
  const conAnnata = bottiglie.filter(b => b.annata && b.annata !== 'NM');
  const piuVecchio = conAnnata.length > 0
    ? conAnnata.reduce((m, b) => (b.annata < m.annata ? b : m), conAnnata[0])
    : null;

  // ========== Vino più caro ==========
  const conPrezzo = bottiglie.filter(b => b.prezzo_acquisto && b.prezzo_acquisto > 0);
  const piuCaro = conPrezzo.length > 0
    ? conPrezzo.reduce((m, b) => (b.prezzo_acquisto > m.prezzo_acquisto ? b : m), conPrezzo[0])
    : null;

  // ========== Distribuzione tipologie ==========
  const perTipologia = {};
  for (const b of bottiglie) {
    const t = b.tipologia || 'altro';
    perTipologia[t] = (perTipologia[t] || 0) + (b.quantita || 1);
  }
  const tipologieOrdinate = Object.entries(perTipologia).sort((a,b) => b[1] - a[1]);

  // ========== Distribuzione regioni ==========
  const perRegione = {};
  for (const b of bottiglie) {
    if (!b.regione) continue;
    perRegione[b.regione] = (perRegione[b.regione] || 0) + (b.quantita || 1);
  }
  const regioniOrdinate = Object.entries(perRegione).sort((a,b) => b[1] - a[1]);
  const regioneTop = regioniOrdinate[0];

  // ========== Distribuzione produttori ==========
  const perProduttore = {};
  for (const b of bottiglie) {
    if (!b.produttore) continue;
    perProduttore[b.produttore] = (perProduttore[b.produttore] || 0) + (b.quantita || 1);
  }
  const produttoriOrdinati = Object.entries(perProduttore).sort((a,b) => b[1] - a[1]);

  // ============ RENDER ============
  let html = '';

  // 1. PANORAMICA
  html += `<div class="stat-section">
    <div class="stat-section-title">Panoramica</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card-label">Bottiglie</div>
        <div class="stat-card-value">${totQty}</div>
        <div class="stat-card-sub">${bottiglie.length} ${bottiglie.length === 1 ? 'etichetta diversa' : 'etichette diverse'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Valore stimato</div>
        <div class="stat-card-value">€${valoreTotale.toFixed(0)}</div>
        <div class="stat-card-sub">${prezzoMedio > 0 ? 'media €' + prezzoMedio.toFixed(1) + '/bott.' : 'prezzi non inseriti'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Pronte da bere</div>
        <div class="stat-card-value">${prontoQty}</div>
        <div class="stat-card-sub">${prontoQty === 0 ? 'nessuna nel range' : 'nel range ottimale'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">In scadenza</div>
        <div class="stat-card-value">${inScadenza.length}</div>
        <div class="stat-card-sub">entro 2 anni</div>
      </div>
    </div>
  </div>`;

  // 2. RECORD
  html += `<div class="stat-section">
    <div class="stat-section-title">Record della cantina</div>`;

  if (piuVecchio) {
    html += `<div class="stat-record">
      <div class="stat-record-icon"><i class="ti ti-history"></i></div>
      <div class="stat-record-content">
        <div class="stat-record-label">Vino più vecchio</div>
        <div class="stat-record-name">${esc(piuVecchio.nome_vino)}</div>
        <div class="stat-record-meta">${esc(piuVecchio.produttore || '')}</div>
      </div>
      <div class="stat-record-value">${piuVecchio.annata}</div>
    </div>`;
  }

  if (piuCaro) {
    html += `<div class="stat-record">
      <div class="stat-record-icon"><i class="ti ti-diamond"></i></div>
      <div class="stat-record-content">
        <div class="stat-record-label">Vino più caro</div>
        <div class="stat-record-name">${esc(piuCaro.nome_vino)}</div>
        <div class="stat-record-meta">${esc(piuCaro.produttore || '')}${piuCaro.annata ? ' · ' + piuCaro.annata : ''}</div>
      </div>
      <div class="stat-record-value">€${piuCaro.prezzo_acquisto.toFixed(0)}</div>
    </div>`;
  }

  if (regioneTop) {
    html += `<div class="stat-record">
      <div class="stat-record-icon"><i class="ti ti-map-pin"></i></div>
      <div class="stat-record-content">
        <div class="stat-record-label">Regione più rappresentata</div>
        <div class="stat-record-name">${esc(regioneTop[0])}</div>
        <div class="stat-record-meta">${regioneTop[1]} ${regioneTop[1] === 1 ? 'bottiglia' : 'bottiglie'}</div>
      </div>
      <div class="stat-record-value">${Math.round(regioneTop[1] / totQty * 100)}%</div>
    </div>`;
  }

  if (produttoriOrdinati[0] && produttoriOrdinati[0][1] > 1) {
    html += `<div class="stat-record">
      <div class="stat-record-icon"><i class="ti ti-building"></i></div>
      <div class="stat-record-content">
        <div class="stat-record-label">Produttore più presente</div>
        <div class="stat-record-name">${esc(produttoriOrdinati[0][0])}</div>
        <div class="stat-record-meta">${produttoriOrdinati[0][1]} bottiglie</div>
      </div>
    </div>`;
  }

  html += `</div>`;

  // 3. DISTRIBUZIONE TIPOLOGIE (bar chart orizzontale)
  if (tipologieOrdinate.length > 0) {
    const maxTip = tipologieOrdinate[0][1];
    html += `<div class="stat-section">
      <div class="stat-section-title">Distribuzione per tipologia</div>
      <div class="stat-tipologie">`;
    for (const [tip, n] of tipologieOrdinate) {
      const pct = Math.round(n / totQty * 100);
      const w = (n / maxTip * 100).toFixed(0);
      html += `<div class="stat-bar-row">
        <div class="stat-bar-label">${capitalize(tip)}</div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill ${tip}" style="width:${w}%"></div>
        </div>
        <div class="stat-bar-value">${n} · ${pct}%</div>
      </div>`;
    }
    html += `</div></div>`;
  }

  // 4. TOP REGIONI (se più di una)
  if (regioniOrdinate.length > 1) {
    html += `<div class="stat-section">
      <div class="stat-section-title">Top regioni</div>
      <div class="stat-tipologie">`;
    const maxReg = regioniOrdinate[0][1];
    for (const [reg, n] of regioniOrdinate.slice(0, 5)) {
      const pct = Math.round(n / totQty * 100);
      const w = (n / maxReg * 100).toFixed(0);
      html += `<div class="stat-bar-row">
        <div class="stat-bar-label">${esc(reg)}</div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill rosso" style="width:${w}%"></div>
        </div>
        <div class="stat-bar-value">${n} · ${pct}%</div>
      </div>`;
    }
    html += `</div></div>`;
  }

  // 5. BOTTIGLIE PRONTE DA BERE (lista)
  if (pronte.length > 0) {
    html += `<div class="stat-section">
      <div class="stat-section-title">✓ Pronte da bere — nel range ottimale</div>`;
    for (const b of pronte.sort((a, c) => (a.anno_pronto_a || 9999) - (c.anno_pronto_a || 9999)).slice(0, 8)) {
      const tipologia = b.tipologia || 'rosso';
      html += `<div class="stat-record">
        <div class="stat-record-icon" style="background:rgba(201,168,76,0.15);color:#C9A84C">
          <i class="ti ti-circle-check"></i>
        </div>
        <div class="stat-record-content">
          <div class="stat-record-name">${esc(b.nome_vino)}</div>
          <div class="stat-record-meta">${esc(b.produttore || '')}${b.annata ? ' · ' + b.annata : ''} · ${capitalize(tipologia)}</div>
        </div>
        <div class="stat-record-value" style="font-size:11px;color:rgba(255,255,255,0.55)">
          ${b.anno_pronto_da || '?'}-${b.anno_pronto_a || '?'}
        </div>
      </div>`;
    }
    html += `</div>`;
  }

  // 6. BOTTIGLIE IN SCADENZA (lista)
  if (inScadenza.length > 0) {
    html += `<div class="stat-section">
      <div class="stat-section-title">⚠️ In scadenza — da bere presto</div>`;
    for (const b of inScadenza.sort((a, c) => (a.anno_pronto_a || 9999) - (c.anno_pronto_a || 9999)).slice(0, 5)) {
      const yearsLeft = b.anno_pronto_a - annoCorrente;
      const label = yearsLeft === 0 ? 'quest\'anno' : (yearsLeft === 1 ? 'entro 1 anno' : 'entro ' + yearsLeft + ' anni');
      html += `<div class="stat-record">
        <div class="stat-record-icon" style="background:rgba(196,86,50,0.15);color:#c45632">
          <i class="ti ti-alert-triangle"></i>
        </div>
        <div class="stat-record-content">
          <div class="stat-record-name">${esc(b.nome_vino)}</div>
          <div class="stat-record-meta">${esc(b.produttore || '')}${b.annata ? ' · ' + b.annata : ''}</div>
        </div>
        <div class="stat-record-value" style="color:#c45632">${label}</div>
      </div>`;
    }
    html += `</div>`;
  }

  area.innerHTML = html;
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
