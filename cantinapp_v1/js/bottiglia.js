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
  const editing = document.body.classList.contains('editing');

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

  let { error } = await sb
    .from('bottiglie')
    .update(update)
    .eq('id', bottiglia.id);

  // Fallback se manca la colonna nazione (migration non applicata)
  if (error && /nazione/i.test(error.message || '')) {
    console.warn('[salvaEdit] colonna nazione assente, retry senza nazione');
    delete update.nazione;
    const retry = await sb
      .from('bottiglie')
      .update(update)
      .eq('id', bottiglia.id);
    error = retry.error;
    if (!error) {
      showToast('Salvato (applicare migration SQL per il campo Nazione)', true);
    }
  }

  if (error) {
    console.error('[salvaEdit] errore:', error);
    showToast('Errore: ' + error.message, true);
    return;
  }

  Object.assign(bottiglia, update);
  // Esci da edit mode e ri-renderizza in view
  annullaEdit();
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
