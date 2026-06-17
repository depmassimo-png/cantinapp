// ============================================================
// CantinApp — Dettaglio bottiglia
// ============================================================

let bottiglia = null;
let currentUser = null;

// Stato modifica foto (edit inline)
let editFotoFronte = null;     // nuovo File selezionato per il fronte
let editFotoRetro  = null;     // nuovo File selezionato per il retro
let editRimuoviFronte = false; // flag: elimina la foto fronte esistente
let editRimuoviRetro  = false; // flag: elimina la foto retro esistente

// Stato visore zoom (visualizzazione)
const ZOOM_MIN = 1, ZOOM_MAX = 5;
let zScale = 1, zTx = 0, zTy = 0;     // trasformazione corrente
let zDW = 0, zDH = 0, zSW = 0, zSH = 0; // dimensioni immagine "fit" e stage
let zPointers = new Map();             // pointerId -> {x,y}
let zPanLast = null, zLastDist = 0, zLastMid = null;
let zMoved = false, zDownTarget = null, zLastTap = 0;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  setupZoom();

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

  // Carica storico degustazioni dello stesso vino (asincrono, non blocca)
  loadStoricoDegustazioni();
}

async function loadStoricoDegustazioni() {
  const b = bottiglia;
  if (!b.nome_vino || !b.produttore) return;

  // (1) Trova tutte le bottiglie con stesso nome+produttore (qualunque annata)
  const { data: bottiglieFratelle } = await sb
    .from('bottiglie')
    .select('id, annata')
    .eq('user_id', currentUser.id)
    .ilike('nome_vino', b.nome_vino)
    .ilike('produttore', b.produttore);

  const idsBottiglie = (bottiglieFratelle || []).map(x => x.id);
  const annataMap = {};
  (bottiglieFratelle || []).forEach(x => { annataMap[x.id] = x.annata; });

  // (2) Carica degustazioni collegate a queste bottiglie
  let q1 = [];
  if (idsBottiglie.length > 0) {
    const { data } = await sb
      .from('degustazioni')
      .select('id, bottiglia_id, data_degustazione, luogo, occasione, commensali, punteggio_totale, fascia_finale, voto_piacere_personale, olfatto_sentori, olfatto_descrittori, note_conclusive, nome_vino_esterno, produttore_esterno, annata_esterna')
      .eq('user_id', currentUser.id)
      .in('bottiglia_id', idsBottiglie);
    q1 = data || [];
  }

  // (3) Carica degustazioni esterne con stesso nome/produttore
  const { data: q2 } = await sb
    .from('degustazioni')
    .select('id, bottiglia_id, data_degustazione, luogo, occasione, commensali, punteggio_totale, fascia_finale, voto_piacere_personale, olfatto_sentori, olfatto_descrittori, note_conclusive, nome_vino_esterno, produttore_esterno, annata_esterna')
    .eq('user_id', currentUser.id)
    .ilike('nome_vino_esterno', b.nome_vino)
    .ilike('produttore_esterno', b.produttore);

  // Unione + dedup per id
  const allMap = new Map();
  for (const d of q1) allMap.set(d.id, { ...d, annata: annataMap[d.bottiglia_id] });
  for (const d of (q2 || [])) {
    if (!allMap.has(d.id)) allMap.set(d.id, { ...d, annata: d.annata_esterna });
  }

  const degustazioni = Array.from(allMap.values())
    .sort((a, b) => (b.data_degustazione || '').localeCompare(a.data_degustazione || ''));

  console.log('[storico] degustazioni trovate:', degustazioni.length);
  renderStorico(degustazioni);
}

function renderStorico(list) {
  const card = document.getElementById('cardStorico');
  if (!list || list.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  const count = list.length;
  document.getElementById('storicoCount').textContent = count;
  document.getElementById('storicoCountLabel').textContent = count === 1 ? 'degustazione' : 'degustazioni';

  const container = document.getElementById('storicoTimeline');
  container.innerHTML = list.map(d => buildStoricoItem(d)).join('');
}

function buildStoricoItem(d) {
  const date = d.data_degustazione ? formatDate(d.data_degustazione) : '—';
  const annata = d.annata || '—';
  const punteggio = d.punteggio_totale != null ? d.punteggio_totale : '—';
  const fascia = d.fascia_finale || '';
  const stelle = d.voto_piacere_personale || 0;
  const stelleHtml = stelle > 0
    ? Array.from({length: 5}, (_, i) => i < stelle ? '★' : '<span class="star-empty">★</span>').join('')
    : '';

  const ctxParts = [];
  if (d.occasione) ctxParts.push(esc(cap(d.occasione)));
  if (d.luogo) ctxParts.push(esc(d.luogo));
  if (d.commensali) ctxParts.push('con ' + esc(d.commensali));
  const ctx = ctxParts.join(' · ');

  let sentori = [];
  if (Array.isArray(d.olfatto_sentori)) sentori = d.olfatto_sentori.slice(0, 5);
  else if (Array.isArray(d.olfatto_descrittori)) sentori = d.olfatto_descrittori.slice(0, 5);
  const sentoriHtml = sentori.length > 0
    ? `<div class="tl-section"><span class="tl-l">Sentori principali</span><span class="tl-v">${esc(sentori.join(', '))}</span></div>`
    : '';

  const noteHtml = d.note_conclusive
    ? `<div class="tl-section"><span class="tl-l">Note</span><span class="tl-v tl-note">"${esc(d.note_conclusive)}"</span></div>`
    : '';

  return `<div class="tl-item">
    <div class="tl-head">
      <div class="tl-yr">Annata ${annata}</div>
      <div class="tl-date">${date}</div>
    </div>
    ${ctx ? `<div class="tl-context">${ctx}</div>` : ''}
    <div class="tl-score-bar">
      <span class="tl-score">${punteggio}</span><span class="tl-score-max">/100</span>
      ${fascia ? `<span class="tl-fascia">${esc(fascia)}</span>` : ''}
      ${stelleHtml ? `<span class="tl-stars">${stelleHtml}</span>` : ''}
    </div>
    ${sentoriHtml}
    ${noteHtml}
    <a class="tl-link" href="scheda.html?id=${d.id}"><i class="ti ti-file-text"></i>Apri scheda</a>
  </div>`;
}

function toggleStorico() {
  const c = document.getElementById('storicoTimelineWrap');
  const i = document.getElementById('storicoToggleIcon');
  if (c.style.display === 'none') {
    c.style.display = 'block';
    i.classList.remove('ti-chevron-down');
    i.classList.add('ti-chevron-up');
  } else {
    c.style.display = 'none';
    i.classList.remove('ti-chevron-up');
    i.classList.add('ti-chevron-down');
  }
}

function render() {
  const b = bottiglia;
  const editing = document.body.classList.contains('editing');

  // Hero photo - galleria con fronte/retro se presenti
  const hero = document.getElementById('heroPhoto');
  const fronte = b.etichetta_url;
  const retro = b.controetichetta_url;

  if (editing) {
    // In modifica: riquadri di upload fronte/retro
    hero.innerHTML = heroEditHtml();
  } else if (fronte || retro) {
    const slides = [];
    if (fronte) slides.push(`<div class="hero-slide active"><img src="${fronte}" alt="Fronte" class="hero-zoomable" onclick="apriZoom('${fronte}')"></div>`);
    if (retro) slides.push(`<div class="hero-slide"><img src="${retro}" alt="Retro" class="hero-zoomable" onclick="apriZoom('${retro}')"></div>`);
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
  if (editing) {
    document.getElementById('wineName').innerHTML = `<input type="text" class="info-value-input" id="editNome" value="${escAttr(b.nome_vino || '')}" style="font-size:22px;text-align:center;max-width:100%">`;
    document.getElementById('wineProducer').innerHTML = `<input type="text" class="info-value-input" id="editProduttore" value="${escAttr(b.produttore || '')}" style="text-align:center;max-width:100%">`;
  } else {
    document.getElementById('wineName').textContent = b.nome_vino;
    document.getElementById('wineProducer').textContent = b.produttore;
  }

  const badges = [];
  if (b.annata) badges.push(`<span class="badge badge-anno">${b.annata}</span>`);
  if (b.gradazione) badges.push(`<span class="badge badge-anno">${String(b.gradazione).replace('.',',')}°</span>`);
  if (b.formato_ml && b.formato_ml !== 750) badges.push(`<span class="badge badge-anno">${b.formato_ml}ml</span>`);
  if (b.denominazione) badges.push(`<span class="badge badge-anno">${b.denominazione}</span>`);
  document.getElementById('metaBadges').innerHTML = editing ? '' : badges.join('');

  // Identità
  const ident = [];
  if (editing) {
    // Tipologia
    const tipOpts = ['rosso','bianco','rosato','spumante','passito','liquoroso']
      .map(t => `<option value="${t}"${t === b.tipologia ? ' selected' : ''}>${cap(t)}</option>`).join('');
    ident.push(rowEdit('Tipologia', `<select class="info-value-select" id="editTipologia">${tipOpts}</select>`));
    ident.push(rowEdit('Annata', `<input type="number" class="info-value-input" id="editAnnata" min="1900" max="2099" value="${b.annata || ''}">`));
    ident.push(rowEdit('Denominazione', `<input type="text" class="info-value-input" id="editDenominazione" value="${escAttr(b.denominazione || '')}">`));
    // Nazione
    const naz = b.nazione || 'Italia';
    ident.push(rowEdit('Nazione', `<select class="info-value-select" id="editNazione" onchange="aggiornaRegioneInline()">${nazioniOptionsHtml(naz)}</select>`));
    // Regione: select per Italia, input per altri (la rigenera aggiornaRegioneInline)
    ident.push(`<div class="info-row" id="rowRegione">
      <span class="info-label">Regione</span>
      <span class="info-value" id="cellRegione"></span>
    </div>`);
  } else {
    if (b.nazione) {
      const nazObj = (typeof NAZIONI !== 'undefined') ? NAZIONI.find(n => n.name === b.nazione) : null;
      const display = nazObj ? `${nazObj.flag} ${b.nazione}` : b.nazione;
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
  }
  document.getElementById('infoIdentita').innerHTML = ident.join('') || '<div style="font-size:13px;color:var(--testo-3);font-style:italic">Nessun dato</div>';

  // Setup regione inline se siamo in edit
  if (editing) aggiornaRegioneInline();

  // Dati tecnici
  const tec = [];
  if (editing) {
    tec.push(rowEdit('Gradazione (%)', `<input type="number" class="info-value-input" id="editGradazione" step="0.1" min="0" max="25" value="${b.gradazione || ''}">`));
  } else {
    if (b.gradazione) tec.push(row('Gradazione', String(b.gradazione).replace('.',',') + '%'));
    tec.push(row('Formato', b.formato_ml + ' ml'));
    if (b.metodo) tec.push(row('Metodo', cap(b.metodo)));
    if (b.sboccatura) tec.push(row('Sboccatura', b.sboccatura));
    if (b.dosaggio) tec.push(row('Dosaggio', b.dosaggio));
  }
  document.getElementById('infoTecnici').innerHTML = tec.join('');

  // Cantina
  const cantina = [];
  if (editing) {
    cantina.push(rowEdit('Quantità', `<input type="number" class="info-value-input" id="editQuantita" min="0" value="${b.quantita || 0}">`));
    cantina.push(rowEdit('Prezzo (€)', `<input type="number" class="info-value-input" id="editPrezzo" step="0.01" min="0" value="${b.prezzo_acquisto || ''}" placeholder="es. 25.00">`));
    cantina.push(rowEdit('Posizione', `<input type="text" class="info-value-input" id="editPosizione" value="${escAttr(b.posizione || '')}" placeholder="es. A2">`));
    cantina.push(rowEdit('Pronto da', `<input type="number" class="info-value-input" id="editProntoDa" min="1900" max="2099" value="${b.anno_pronto_da || ''}">`));
    cantina.push(rowEdit('Pronto fino a', `<input type="number" class="info-value-input" id="editProntoA" min="1900" max="2099" value="${b.anno_pronto_a || ''}">`));
  } else {
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
    if (b.posizione) cantina.push(row('Posizione', b.posizione));
    if (b.data_acquisto) cantina.push(row('Data acquisto', formatDate(b.data_acquisto)));
    if (b.luogo_acquisto) cantina.push(row('Luogo acquisto', b.luogo_acquisto));
    if (b.anno_pronto_da || b.anno_pronto_a) {
      const da = b.anno_pronto_da || '?';
      const a = b.anno_pronto_a || '?';
      cantina.push(row('Finestra ideale', da + ' — ' + a));
    }
  }
  document.getElementById('infoCantina').innerHTML = cantina.join('');

  // Note
  const cardNote = document.getElementById('cardNote');
  const infoNote = document.getElementById('infoNote');
  if (editing) {
    cardNote.style.display = 'block';
    infoNote.innerHTML = `<textarea class="info-value-input" id="editNote" rows="3" style="max-width:100%;text-align:left">${esc(b.note || '')}</textarea>`;
  } else if (b.note) {
    cardNote.style.display = 'block';
    infoNote.textContent = '"' + b.note + '"';
  } else {
    cardNote.style.display = 'none';
  }

  // Quick actions: nascondi in edit mode
  const qa = document.querySelector('.quick-actions');
  if (qa) qa.style.display = editing ? 'none' : '';
}

function rowEdit(label, inputHtml) {
  return `<div class="info-row row-stack">
    <span class="info-label">${esc(label)}</span>
    <span class="info-value">${inputHtml}</span>
  </div>`;
}

function escAttr(s) {
  return esc(s).replace(/"/g, '&quot;');
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


// ==== MODIFICA INLINE ====
function entraInEdit() {
  // Reset stato foto all'ingresso in modifica
  editFotoFronte = null; editFotoRetro = null;
  editRimuoviFronte = false; editRimuoviRetro = false;

  document.body.classList.add('editing');
  document.getElementById('btnEdit').style.display = 'none';
  document.getElementById('btnCancelEdit').style.display = 'inline-block';
  document.getElementById('btnSaveEdit').style.display = 'inline-flex';
  document.getElementById('editBanner').style.display = 'flex';
  document.getElementById('headerTitle').textContent = 'Modifica bottiglia';
  render();
  // Scroll al top per vedere subito i bottoni Salva/Annulla
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function annullaEdit() {
  // Reset stato foto all'uscita dalla modifica
  editFotoFronte = null; editFotoRetro = null;
  editRimuoviFronte = false; editRimuoviRetro = false;

  document.body.classList.remove('editing');
  document.getElementById('btnEdit').style.display = 'inline-flex';
  document.getElementById('btnCancelEdit').style.display = 'none';
  document.getElementById('btnSaveEdit').style.display = 'none';
  document.getElementById('editBanner').style.display = 'none';
  document.getElementById('headerTitle').textContent = 'Dettaglio bottiglia';
  render();
}

// Aggiorna campo regione in modalità edit inline (Italia → select, altro → input)
function aggiornaRegioneInline() {
  const naz = document.getElementById('editNazione').value;
  const cell = document.getElementById('cellRegione');
  if (!cell) return;
  if (naz === 'Italia') {
    cell.innerHTML = `<select class="info-value-select" id="editRegioneSelect">${regioniOptionsHtml(bottiglia.regione)}</select>`;
  } else {
    cell.innerHTML = `<input type="text" class="info-value-input" id="editRegioneInput" value="${escAttr(bottiglia.regione || '')}" placeholder="es. Bordeaux, Mosella...">`;
  }
}

function getRegioneInlineValue() {
  const naz = document.getElementById('editNazione').value;
  if (naz === 'Italia') {
    const s = document.getElementById('editRegioneSelect');
    return s ? (s.value || null) : null;
  } else {
    const i = document.getElementById('editRegioneInput');
    return i ? (i.value.trim() || null) : null;
  }
}

// ==== MODIFICA FOTO (edit inline) ====
function heroEditHtml() {
  return `<div class="hero-edit-grid">
    <div class="hero-edit-slot" id="heroSlotFronte">${heroSlotInner('fronte')}</div>
    <div class="hero-edit-slot" id="heroSlotRetro">${heroSlotInner('retro')}</div>
  </div>`;
}

function heroSlotInner(lato) {
  const isFronte = lato === 'fronte';
  const file     = isFronte ? editFotoFronte : editFotoRetro;
  const rimossa  = isFronte ? editRimuoviFronte : editRimuoviRetro;
  const salvata  = isFronte ? bottiglia.etichetta_url : bottiglia.controetichetta_url;
  const label    = isFronte ? 'Fronte' : 'Retro';
  const sub      = isFronte ? 'Etichetta principale' : 'Controetichetta';

  let src = null;
  if (file) src = URL.createObjectURL(file);
  else if (!rimossa && salvata) src = salvata;

  if (src) {
    return `<img src="${src}" class="hero-edit-img" alt="${label}">
      <button type="button" class="preview-remove" onclick="rimuoviEditFoto(event,'${lato}')" aria-label="Rimuovi foto">
        <i class="ti ti-x"></i>
      </button>`;
  }
  return `<i class="ti ti-camera upload-icon" aria-hidden="true"></i>
    <p style="font-size:13px">${label}</p>
    <small>${sub}</small>
    <input type="file" accept="image/*" onchange="handleEditPhotoSelect(event,'${lato}')">`;
}

function handleEditPhotoSelect(e, lato) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Foto troppo grande (max 5MB)', true); return; }
  if (lato === 'fronte') { editFotoFronte = file; editRimuoviFronte = false; }
  else                   { editFotoRetro  = file; editRimuoviRetro  = false; }
  document.getElementById(lato === 'fronte' ? 'heroSlotFronte' : 'heroSlotRetro').innerHTML = heroSlotInner(lato);
}

function rimuoviEditFoto(e, lato) {
  e.stopPropagation(); e.preventDefault();
  if (lato === 'fronte') { editFotoFronte = null; if (bottiglia.etichetta_url) editRimuoviFronte = true; }
  else                   { editFotoRetro  = null; if (bottiglia.controetichetta_url) editRimuoviRetro = true; }
  document.getElementById(lato === 'fronte' ? 'heroSlotFronte' : 'heroSlotRetro').innerHTML = heroSlotInner(lato);
}

async function uploadEtichetta(file, lato) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${currentUser.id}/${Date.now()}_${lato}.${ext}`;
  const { error } = await sb.storage.from('etichette')
    .upload(fileName, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from('etichette').getPublicUrl(fileName);
  return data.publicUrl;
}

function storagePathFromUrl(url) {
  if (!url) return null;
  const marker = '/etichette/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.substring(i + marker.length).split('?')[0];
}

async function eliminaDalloStorage(url) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await sb.storage.from('etichette').remove([path]);
  if (error) console.warn('[storage] rimozione fallita:', error.message);
}

async function salvaEdit() {
  console.log('[salvaEdit] inizio');
  const update = {
    nome_vino: document.getElementById('editNome').value.trim(),
    produttore: document.getElementById('editProduttore').value.trim(),
    annata: parseIntOrNull(document.getElementById('editAnnata').value),
    tipologia: document.getElementById('editTipologia').value,
    denominazione: nullIfEmpty(document.getElementById('editDenominazione').value),
    nazione: nullIfEmpty(document.getElementById('editNazione').value),
    regione: getRegioneInlineValue(),
    gradazione: parseFloatOrNull(document.getElementById('editGradazione').value),
    quantita: parseInt(document.getElementById('editQuantita').value) || 0,
    anno_pronto_da: parseIntOrNull(document.getElementById('editProntoDa').value),
    anno_pronto_a: parseIntOrNull(document.getElementById('editProntoA').value),
    prezzo_acquisto: parseFloatOrNull(document.getElementById('editPrezzo').value),
    posizione: nullIfEmpty(document.getElementById('editPosizione').value),
    note: nullIfEmpty(document.getElementById('editNote').value),
  };

  // Validazione minima
  if (!update.nome_vino) {
    showToast('Il nome del vino è obbligatorio', true);
    return;
  }
  if (!update.produttore) {
    showToast('Il produttore è obbligatorio', true);
    return;
  }

  console.log('[salvaEdit] payload:', update);

  const btn = document.getElementById('btnSaveEdit');
  bloccaBtnSalva(btn);

  // ---- FOTO: upload nuove + raccolta vecchie da eliminare ----
  const daEliminare = [];
  try {
    if (editFotoFronte) {
      console.log('[salvaEdit] upload fronte…', editFotoFronte.name, editFotoFronte.size);
      update.etichetta_url = await uploadEtichetta(editFotoFronte, 'fronte');
      console.log('[salvaEdit] fronte OK:', update.etichetta_url);
      if (bottiglia.etichetta_url) daEliminare.push(bottiglia.etichetta_url);
    } else if (editRimuoviFronte) {
      if (bottiglia.etichetta_url) daEliminare.push(bottiglia.etichetta_url);
      update.etichetta_url = null;
    }
    if (editFotoRetro) {
      console.log('[salvaEdit] upload retro…', editFotoRetro.name, editFotoRetro.size);
      update.controetichetta_url = await uploadEtichetta(editFotoRetro, 'retro');
      console.log('[salvaEdit] retro OK:', update.controetichetta_url);
      if (bottiglia.controetichetta_url) daEliminare.push(bottiglia.controetichetta_url);
    } else if (editRimuoviRetro) {
      if (bottiglia.controetichetta_url) daEliminare.push(bottiglia.controetichetta_url);
      update.controetichetta_url = null;
    }
  } catch (e) {
    console.error('[salvaEdit] errore upload foto:', e);
    showToast('Errore upload foto: ' + (e.message || ''), true);
    sbloccaBtnSalva(btn);
    return;
  }

  // .select() per riavere la riga davvero scritta: se l'array è vuoto,
  // l'update non ha toccato nulla (tipicamente RLS) pur senza errore.
  const { data, error } = await sb
    .from('bottiglie')
    .update(update)
    .eq('id', bottiglia.id)
    .select();

  if (error) {
    console.error('[salvaEdit] errore update:', error);
    showToast('Errore: ' + error.message, true);
    sbloccaBtnSalva(btn);
    return;
  }

  if (!data || data.length === 0) {
    console.error('[salvaEdit] update di 0 righe — probabile policy RLS/permessi');
    showToast('Salvataggio non riuscito: 0 righe aggiornate (permessi?)', true);
    sbloccaBtnSalva(btn);
    return;
  }

  console.log('[salvaEdit] riga salvata dal DB:', data[0]);

  // Solo dopo l'update confermato elimino i file vecchi dallo storage
  for (const url of daEliminare) await eliminaDalloStorage(url);

  // Sincronizza lo stato in memoria con quello REALMENTE salvato nel DB
  bottiglia = data[0];
  sbloccaBtnSalva(btn);
  annullaEdit();
  showToast('Modifiche salvate');
}

function bloccaBtnSalva(btn) {
  if (!btn) return;
  btn.disabled = true;
  if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-loader"></i> Salvataggio…';
}

function sbloccaBtnSalva(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
}


// ==== VISORE FOTO CON ZOOM (visualizzazione) ====
function apriZoom(src) {
  const ov = document.getElementById('zoomOverlay');
  const img = document.getElementById('zoomImg');
  ov.classList.add('show');
  document.body.style.overflow = 'hidden';
  img.onload = initZoomSize;
  img.src = src;
  if (img.complete && img.naturalWidth) initZoomSize();
}

function chiudiZoom() {
  document.getElementById('zoomOverlay').classList.remove('show');
  document.body.style.overflow = '';
  zPointers.clear();
  zPanLast = null; zLastDist = 0; zLastMid = null; zMoved = false;
}

function initZoomSize() {
  const stage = document.getElementById('zoomStage');
  const img = document.getElementById('zoomImg');
  zSW = stage.clientWidth; zSH = stage.clientHeight;
  const iw = img.naturalWidth || zSW, ih = img.naturalHeight || zSH;
  const f = Math.min(zSW / iw, zSH / ih);   // scala "contain"
  zDW = iw * f; zDH = ih * f;
  img.style.width = zDW + 'px';
  img.style.height = zDH + 'px';
  zScale = 1; clampZoom(); applyZoom(false);
}

function applyZoom(animate) {
  const img = document.getElementById('zoomImg');
  img.style.transition = animate ? 'transform .18s ease' : 'none';
  img.style.transform = `translate(${zTx}px, ${zTy}px) scale(${zScale})`;
  img.style.cursor = zScale > 1.01 ? 'grab' : 'zoom-in';
}

function clampZoom() {
  const scaledW = zDW * zScale, scaledH = zDH * zScale;
  if (scaledW <= zSW) zTx = (zSW - scaledW) / 2;
  else zTx = Math.min(0, Math.max(zSW - scaledW, zTx));
  if (scaledH <= zSH) zTy = (zSH - scaledH) / 2;
  else zTy = Math.min(0, Math.max(zSH - scaledH, zTy));
}

function zoomAt(cx, cy, newScale, animate) {
  newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
  const ix = (cx - zTx) / zScale, iy = (cy - zTy) / zScale;
  zTx = cx - ix * newScale;
  zTy = cy - iy * newScale;
  zScale = newScale;
  clampZoom();
  applyZoom(!!animate);
}

function resetZoom() { zScale = 1; clampZoom(); applyZoom(true); }

function toggleZoomPunto(cx, cy) {
  if (zScale > 1.01) resetZoom();
  else zoomAt(cx, cy, 2.5, true);
}

function zRel(e) {
  const r = document.getElementById('zoomStage').getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function setupZoom() {
  const stage = document.getElementById('zoomStage');
  if (!stage) return;
  stage.addEventListener('pointerdown', zPointerDown);
  stage.addEventListener('pointermove', zPointerMove);
  stage.addEventListener('pointerup', zPointerUp);
  stage.addEventListener('pointercancel', zPointerUp);
  stage.addEventListener('wheel', zWheel, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('zoomOverlay').classList.contains('show')) chiudiZoom();
  });
}

function zPointerDown(e) {
  const stage = document.getElementById('zoomStage');
  e.preventDefault();
  stage.setPointerCapture(e.pointerId);
  zPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  zDownTarget = e.target;
  zMoved = false;
  if (zPointers.size === 1) {
    zPanLast = { x: e.clientX, y: e.clientY };
  } else if (zPointers.size === 2) {
    const [p1, p2] = [...zPointers.values()];
    const r = stage.getBoundingClientRect();
    zLastDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    zLastMid = { x: (p1.x + p2.x) / 2 - r.left, y: (p1.y + p2.y) / 2 - r.top };
  }
}

function zPointerMove(e) {
  if (!zPointers.has(e.pointerId)) return;
  zPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const r = document.getElementById('zoomStage').getBoundingClientRect();

  if (zPointers.size === 2) {
    const [p1, p2] = [...zPointers.values()];
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const mid = { x: (p1.x + p2.x) / 2 - r.left, y: (p1.y + p2.y) / 2 - r.top };
    if (zLastDist > 0) {
      zTx += mid.x - zLastMid.x;   // segue le dita
      zTy += mid.y - zLastMid.y;
      zoomAt(mid.x, mid.y, zScale * (dist / zLastDist), false);
    }
    zLastDist = dist; zLastMid = mid; zMoved = true;
  } else if (zPointers.size === 1 && zPanLast) {
    const dx = e.clientX - zPanLast.x, dy = e.clientY - zPanLast.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) zMoved = true;
    if (zScale > 1.01) { zTx += dx; zTy += dy; clampZoom(); applyZoom(false); }
    zPanLast = { x: e.clientX, y: e.clientY };
  }
}

function zPointerUp(e) {
  const stage = document.getElementById('zoomStage');
  try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
  const wasSize = zPointers.size;
  zPointers.delete(e.pointerId);

  if (zPointers.size === 1) {
    const p = [...zPointers.values()][0];
    zPanLast = { x: p.x, y: p.y };
    zLastDist = 0;
  } else if (zPointers.size === 0) {
    zPanLast = null; zLastDist = 0; zLastMid = null;
    if (!zMoved && wasSize === 1) {
      if (zDownTarget && zDownTarget.id === 'zoomImg') {
        const now = Date.now();
        if (now - zLastTap < 300) { const rel = zRel(e); toggleZoomPunto(rel.x, rel.y); zLastTap = 0; }
        else zLastTap = now;
      } else {
        chiudiZoom(); // tap sullo sfondo
      }
    }
  }
}

function zWheel(e) {
  e.preventDefault();
  const r = document.getElementById('zoomStage').getBoundingClientRect();
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
  zoomAt(e.clientX - r.left, e.clientY - r.top, zScale * factor, false);
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
