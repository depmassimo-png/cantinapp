// ============================================================
// CantinApp — Dettaglio bottiglia
// ============================================================

let bottiglia = null;
let currentUser = null;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    showToast('Bottiglia non trovata', true);
    setTimeout(() => location.href = 'cantina.html', 1500);
    return;
  }

  await loadBottiglia(id);
})();

async function loadBottiglia(id) {
  const { data, error } = await sb
    .from('bottiglie')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Bottiglia non trovata', true);
    setTimeout(() => location.href = 'cantina.html', 1500);
    return;
  }

  bottiglia = data;
  render();

  document.getElementById('loadingArea').style.display = 'none';
  document.getElementById('detailArea').style.display = 'block';
}

function render() {
  const b = bottiglia;

  // Hero photo - galleria con fronte/retro se presenti
  const hero = document.getElementById('heroPhoto');
  const fronte = b.etichetta_url;
  const retro = b.controetichetta_url;

  if (fronte || retro) {
    const slides = [];
    if (fronte) slides.push(`<div class="hero-slide active"><img src="${fronte}" alt="Fronte"></div>`);
    if (retro) slides.push(`<div class="hero-slide"><img src="${retro}" alt="Retro"></div>`);
    const dots = (fronte && retro) ? `
      <div class="hero-dots">
        <button class="hero-dot active" onclick="showSlide(0)" aria-label="Fronte"></button>
        <button class="hero-dot" onclick="showSlide(1)" aria-label="Retro"></button>
      </div>
      <div class="hero-side-tag" id="heroSideTag">Fronte</div>
    ` : '';
    hero.innerHTML = `${slides.join('')}${dots}<span class="badge tip-tag badge-${b.tipologia}">${cap(b.tipologia)}</span>`;
  } else {
    hero.innerHTML = `<i class="ti ti-bottle-wine no-photo" aria-hidden="true"></i>
      <span class="badge tip-tag badge-${b.tipologia}">${cap(b.tipologia)}</span>`;
  }

  // Title
  document.getElementById('wineName').textContent = b.nome_vino;
  document.getElementById('wineProducer').textContent = b.produttore;

  const badges = [];
  if (b.annata) badges.push(`<span class="badge badge-anno">${b.annata}</span>`);
  if (b.gradazione) badges.push(`<span class="badge badge-anno">${String(b.gradazione).replace('.',',')}°</span>`);
  if (b.formato_ml && b.formato_ml !== 750) badges.push(`<span class="badge badge-anno">${b.formato_ml}ml</span>`);
  if (b.denominazione) badges.push(`<span class="badge badge-anno">${b.denominazione}</span>`);
  document.getElementById('metaBadges').innerHTML = badges.join('');

  // Identità: Nazione (con bandiera) → Regione → Denominazione → Vitigni
  const ident = [];
  if (b.nazione) {
    const naz = (typeof NAZIONI !== 'undefined') ? NAZIONI.find(n => n.name === b.nazione) : null;
    const display = naz ? `${naz.flag} ${b.nazione}` : b.nazione;
    ident.push(row('Nazione', display));
  }
  if (b.regione) ident.push(row('Regione', b.regione));
  if (b.denominazione) ident.push(row('Denominazione', b.denominazione));
  if (b.vitigni && b.vitigni.length) {
    const tags = b.vitigni.map(v => `<span class="vit-chip">${esc(v)}</span>`).join('');
    ident.push(`<div class="info-row">
      <span class="info-label">Vitigni</span>
      <span class="info-value"><div class="vitigni-list">${tags}</div></span>
    </div>`);
  }
  document.getElementById('infoIdentita').innerHTML = ident.join('') || '<div style="font-size:13px;color:var(--testo-3);font-style:italic">Nessun dato</div>';

  // Dati tecnici
  const tec = [];
  if (b.gradazione) tec.push(row('Gradazione', String(b.gradazione).replace('.',',') + '%'));
  tec.push(row('Formato', b.formato_ml + ' ml'));
  if (b.metodo) tec.push(row('Metodo', cap(b.metodo)));
  if (b.sboccatura) tec.push(row('Sboccatura', b.sboccatura));
  if (b.dosaggio) tec.push(row('Dosaggio', b.dosaggio));
  document.getElementById('infoTecnici').innerHTML = tec.join('');

  // Cantina - con controlli quantità inline
  const cantina = [];
  cantina.push(`
    <div class="info-row">
      <span class="info-label">Quantità</span>
      <span class="info-value">
        <div class="qty-controls">
          <button class="qty-btn" onclick="cambiaQuantita(-1)" aria-label="Diminuisci">−</button>
          <span class="qty-display" id="qtyDisplay">${b.quantita}</span>
          <button class="qty-btn" onclick="cambiaQuantita(1)" aria-label="Aumenta">+</button>
        </div>
      </span>
    </div>
  `);
  if (b.prezzo_acquisto) cantina.push(row('Prezzo acquisto', '€ ' + Number(b.prezzo_acquisto).toFixed(2).replace('.', ',')));
  if (b.data_acquisto) cantina.push(row('Data acquisto', formatDate(b.data_acquisto)));
  if (b.luogo_acquisto) cantina.push(row('Luogo acquisto', b.luogo_acquisto));
  if (b.anno_pronto_da || b.anno_pronto_a) {
    const da = b.anno_pronto_da || '?';
    const a = b.anno_pronto_a || '?';
    cantina.push(row('Finestra ideale', da + ' — ' + a));
  }
  document.getElementById('infoCantina').innerHTML = cantina.join('');

  // Note
  if (b.note) {
    document.getElementById('cardNote').style.display = 'block';
    document.getElementById('infoNote').textContent = '"' + b.note + '"';
  }
}

function row(label, value) {
  return `<div class="info-row">
    <span class="info-label">${esc(label)}</span>
    <span class="info-value">${esc(String(value))}</span>
  </div>`;
}

function showSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const tag = document.getElementById('heroSideTag');
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  if (tag) tag.textContent = idx === 0 ? 'Fronte' : 'Retro';
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

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ==== AZIONI ====
async function cambiaQuantita(delta) {
  const nuova = Math.max(0, (bottiglia.quantita || 0) + delta);
  const { error } = await sb
    .from('bottiglie')
    .update({ quantita: nuova })
    .eq('id', bottiglia.id);
  if (error) { showToast('Errore: ' + error.message, true); return; }
  bottiglia.quantita = nuova;
  document.getElementById('qtyDisplay').textContent = nuova;
  if (nuova === 0) {
    showToast('Hai finito le bottiglie di questo vino');
  }
}

async function segnaBevuta() {
  if (!confirm(`Vuoi segnare una bottiglia di "${bottiglia.nome_vino}" come bevuta?\n\nLa quantità verrà ridotta di 1.`)) return;

  const nuova = Math.max(0, (bottiglia.quantita || 0) - 1);
  const update = { quantita: nuova };
  if (nuova === 0) update.stato = 'bevuta';

  const { error } = await sb
    .from('bottiglie')
    .update(update)
    .eq('id', bottiglia.id);
  if (error) { showToast('Errore: ' + error.message, true); return; }

  showToast('Bottiglia segnata come bevuta');

  // Proponi compilazione scheda di degustazione
  setTimeout(() => {
    const compila = confirm(
      `Vuoi compilare la scheda di degustazione di "${bottiglia.nome_vino}" adesso?\n\n` +
      `Premi OK per iniziare subito, oppure Annulla per compilarla in seguito ` +
      `(la troverai nella sezione "Bevute").`
    );
    if (compila) {
      // Vai al wizard di degustazione
      location.href = 'degusta.html?bottiglia_id=' + bottiglia.id;
    } else if (nuova === 0) {
      // Se finita e non vuole compilare ora, torna alla cantina
      location.href = 'cantina.html';
    } else {
      // Aggiorna solo il display della quantità
      bottiglia.quantita = nuova;
      document.getElementById('qtyDisplay').textContent = nuova;
    }
  }, 600);
}

function iniziaDegustazione() {
  location.href = 'degusta.html?bottiglia_id=' + bottiglia.id;
}

// ==== MODIFICA ====
function apriModifica() {
  document.getElementById('mNome').value = bottiglia.nome_vino || '';
  document.getElementById('mProduttore').value = bottiglia.produttore || '';
  document.getElementById('mAnnata').value = bottiglia.annata || '';
  document.getElementById('mTipologia').value = bottiglia.tipologia || 'rosso';
  document.getElementById('mDenominazione').value = bottiglia.denominazione || '';
  document.getElementById('mGradazione').value = bottiglia.gradazione || '';
  document.getElementById('mQuantita').value = bottiglia.quantita || 0;
  document.getElementById('mProntoDa').value = bottiglia.anno_pronto_da || '';
  document.getElementById('mProntoA').value = bottiglia.anno_pronto_a || '';
  document.getElementById('mPrezzo').value = bottiglia.prezzo_acquisto || '';
  document.getElementById('mPosizione').value = bottiglia.posizione || '';
  document.getElementById('mNote').value = bottiglia.note || '';

  // Nazione + Regione (per bottiglie pre-migration, default 'Italia')
  const naz = bottiglia.nazione || 'Italia';
  document.getElementById('mNazione').innerHTML = nazioniOptionsHtml(naz);
  document.getElementById('mRegioneSelect').innerHTML = regioniOptionsHtml(bottiglia.regione);
  document.getElementById('mRegione').value = bottiglia.regione || '';
  aggiornaCampoRegioneModal();

  document.getElementById('modalModifica').classList.add('show');
}

// Aggiorna visualizzazione regione nel modal in base alla nazione scelta
function aggiornaCampoRegioneModal() {
  const naz = document.getElementById('mNazione').value;
  const sel = document.getElementById('mRegioneSelect');
  const inp = document.getElementById('mRegione');
  const label = document.getElementById('mRegioneLabel');

  if (naz === 'Italia') {
    sel.style.display = 'block';
    inp.style.display = 'none';
    label.textContent = 'Regione';
    if (inp.value && !sel.value) {
      sel.innerHTML = regioniOptionsHtml(inp.value);
    }
  } else {
    sel.style.display = 'none';
    inp.style.display = 'block';
    label.textContent = naz ? 'Regione / Sub-area' : 'Regione';
    if (sel.value && !inp.value) {
      inp.value = sel.value;
    }
  }
}

function getRegioneModalValue() {
  const naz = document.getElementById('mNazione').value;
  if (naz === 'Italia') {
    return document.getElementById('mRegioneSelect').value || null;
  }
  return document.getElementById('mRegione').value.trim() || null;
}

function chiudiModifica() {
  document.getElementById('modalModifica').classList.remove('show');
}

async function salvaModifica(e) {
  e.preventDefault();
  const update = {
    nome_vino: document.getElementById('mNome').value.trim(),
    produttore: document.getElementById('mProduttore').value.trim(),
    annata: parseIntOrNull(document.getElementById('mAnnata').value),
    tipologia: document.getElementById('mTipologia').value,
    denominazione: nullIfEmpty(document.getElementById('mDenominazione').value),
    nazione: nullIfEmpty(document.getElementById('mNazione').value),
    regione: getRegioneModalValue(),
    gradazione: parseFloatOrNull(document.getElementById('mGradazione').value),
    quantita: parseInt(document.getElementById('mQuantita').value) || 0,
    anno_pronto_da: parseIntOrNull(document.getElementById('mProntoDa').value),
    anno_pronto_a: parseIntOrNull(document.getElementById('mProntoA').value),
    prezzo_acquisto: parseFloatOrNull(document.getElementById('mPrezzo').value),
    posizione: nullIfEmpty(document.getElementById('mPosizione').value),
    note: nullIfEmpty(document.getElementById('mNote').value),
  };

  const { error } = await sb
    .from('bottiglie')
    .update(update)
    .eq('id', bottiglia.id);

  if (error) { showToast('Errore: ' + error.message, true); return; }

  Object.assign(bottiglia, update);
  render();
  chiudiModifica();
  showToast('Modifiche salvate');
}

// ==== ELIMINA ====
async function confermaElimina() {
  if (!confirm(`Eliminare definitivamente "${bottiglia.nome_vino}"?\n\nQuesta azione non può essere annullata.`)) return;

  const { error } = await sb
    .from('bottiglie')
    .delete()
    .eq('id', bottiglia.id);

  if (error) { showToast('Errore: ' + error.message, true); return; }

  showToast('Bottiglia eliminata');
  setTimeout(() => location.href = 'cantina.html', 1000);
}

// ==== HELPERS ====
function parseIntOrNull(v) {
  v = (v || '').toString().trim();
  return v ? parseInt(v) : null;
}
function parseFloatOrNull(v) {
  v = (v || '').toString().trim().replace(',', '.');
  return v ? parseFloat(v) : null;
}
function nullIfEmpty(v) {
  v = (v || '').toString().trim();
  return v ? v : null;
}
