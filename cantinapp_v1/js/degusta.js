// ============================================================
// CantinApp — Wizard degustazione Assosommelier
// ============================================================

let currentUser = null;
let bottigliaCorrente = null;
let stepAttuale = 1;
const TOT_STEP = 5;

// Foto della bottiglia in caso di degustazione cieca/libera (rivelazione finale)
let extFotoFronte = null;
let extFotoRetro = null;

// Stato della degustazione
const D = {
  // intestazione
  bottiglia_id: null,
  nome_vino_esterno: null,
  produttore_esterno: null,
  annata_esterna: null,
  tipologia_esterna: null,
  luogo: '',
  data_degustazione: '',
  occasione: null,
  commensali: '',
  abbinamento_cibo: '',
  temperatura_servizio: 18,
  tempo_apertura_min: null,
  decanter: false,
  // visivo
  colore: null,
  riflesso: null,
  densita_cromatica: null,
  limpidezza: null,
  vivacita: null,
  perlage_grana: null,
  // olfatto
  olfatto_descrittori: [],
  olfatto_sentori: [],          // sentori specifici dalla ruota aromi (es. 'ciliegia', 'rosa')
  olfatto_famiglie_aperte: [],  // famiglie attualmente espanse nell'UI (es. 'fruttato_vino_rosso')
  olfatto_note: '',
  olfatto_complessita_label: null, olfatto_complessita_punti: null,
  olfatto_qualita_label: null, olfatto_qualita_punti: null,
  // gusto
  gusto_zucchero: null,
  gusto_alcol: null,
  gusto_acidita: null,
  gusto_tannino: null,
  gusto_sapidita: null,
  gusto_chiusura: null,
  gusto_equilibrio_label: null, gusto_equilibrio_punti: null,
  gusto_persistenza_label: null, gusto_persistenza_punti: null,
  gusto_qualita_label: null, gusto_qualita_punti: null,
  gusto_dimensioni_label: null, gusto_dimensioni_punti: null,
  // conclusioni
  prospettive_consumo: null,
  note_conclusive: '',
  voto_piacere_personale: null,
  ricomprerei: null,
};

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  // Versione nell'header (al posto del footer fixed)
  const hv = document.getElementById('headerVersion');
  if (hv && typeof APP_VERSION !== 'undefined') hv.textContent = APP_VERSION;
  setTimeout(() => {
    const f = document.getElementById('appVersionFooter');
    if (f) f.remove();
  }, 50);

  // SETUP COMUNE: chip, scale, stars, ruota aromi, binding input
  // Lo facciamo SEMPRE all'init, indipendentemente dalla modalità.
  // L'overlay di scelta si limita a mostrarsi sopra: quando viene nascosto,
  // il wizard è già pronto e funzionante.
  setupChips();
  setupScale();
  setupStars();

  // Data oggi di default
  const oggi = new Date().toISOString().split('T')[0];
  document.getElementById('dataDegustazione').value = oggi;
  D.data_degustazione = oggi;
  document.getElementById('dataDegustazione').addEventListener('change', e => {
    D.data_degustazione = e.target.value;
  });

  // Bottiglia/modalità da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('bottiglia_id');
  const modo = params.get('modo');

  if (id) {
    // Caso 1: bottiglia_id specifico → carico bottiglia e parto direttamente
    await caricaBottigliaECompleta(id);
    await completaAvvio();
  } else if (modo === 'cieca' || modo === 'esterno') {
    // Caso 2: modalità esplicita da URL
    impostaModalita(modo);
    await completaAvvio();
  } else {
    // Caso 3: nessuna info → mostra schermata di scelta
    // Il setup è già stato fatto, quando l'utente sceglie chiamiamo completaAvvio()
    document.getElementById('modalitaSceltaOverlay').style.display = 'block';
  }
})();

// Completa l'avvio del wizard (dopo che modalità/bottiglia sono determinate)
async function completaAvvio() {
  // Proponi ripresa del draft precedente se esiste
  const ripreso = await proponiRipresaDraft();
  if (ripreso) {
    ripristinaUI();
    showToast('Degustazione ripresa');
  }

  // Applica regole di tipologia (disabilita chip non pertinenti)
  applicaRegoleTipologia();

  // Attiva il salvataggio automatico in background
  attivaAutosave();

  // Forza step 1 attivo se non già stato impostato dal draft
  if (!stepAttuale || stepAttuale < 1) stepAttuale = 1;
  renderStep();

  // Sicurezza: assicurati che gli overlay siano chiusi
  for (const oid of ['modalitaSceltaOverlay', 'bottigliaSceltaOverlay', 'identificazioneOverlay']) {
    const el = document.getElementById(oid);
    if (el) el.style.display = 'none';
  }
  window.scrollTo(0, 0);
  console.log('[degusta] completaAvvio ok, step:', stepAttuale, 'bottiglia:', bottigliaCorrente?.nome_vino);
}

async function caricaBottigliaECompleta(id) {
  const { data } = await sb.from('bottiglie').select('*').eq('id', id).single();
  if (data) {
    bottigliaCorrente = data;
    D.bottiglia_id = data.id;
    const w = document.getElementById('wineId');
    w.textContent = `${data.nome_vino} · ${data.produttore}${data.annata ? ' · ' + data.annata : ''}`;
    w.classList.remove('cieca');
    document.getElementById('boxDensita').style.display = 'block';
    document.getElementById('boxPerlage').style.display = 'block';
  }
}

function impostaModalita(modo) {
  const w = document.getElementById('wineId');
  if (modo === 'cieca') {
    w.textContent = 'Degustazione alla cieca';
    w.classList.add('cieca');
  } else { // esterno
    w.textContent = 'Nuova degustazione';
    w.classList.remove('cieca');
  }
  // In entrambi i casi mostriamo i box che permettono al sommelier
  // di valutare densità/perlage (non sa la tipologia all'inizio)
  document.getElementById('boxVinoEsterno').style.display = 'block';
  document.getElementById('boxDensita').style.display = 'block';
  document.getElementById('boxPerlage').style.display = 'block';
}

// avviaWizard rimane come alias di completaAvvio per compatibilità
async function avviaWizard() {
  return completaAvvio();
}

// =========== Schermata scelta modalità ===========
async function scegliModalita(modo) {
  if (modo === 'cieca') {
    document.getElementById('modalitaSceltaOverlay').style.display = 'none';
    impostaModalita('cieca');
    await completaAvvio();
  } else if (modo === 'esterno') {
    // Modalità esterno → vai alla pagina di aggiunta bottiglia con flag degusta
    // così l'utente compila tutto come per una bottiglia normale (foto, AI, campi)
    // e al salvataggio si avvia la degustazione su quella bottiglia
    window.location.href = 'aggiungi.html?modo=degusta';
  } else if (modo === 'cantina') {
    document.getElementById('modalitaSceltaOverlay').style.display = 'none';
    document.getElementById('bottigliaSceltaOverlay').style.display = 'block';
    await caricaBottiglieScelta();
  }
}

function tornaAModalita() {
  document.getElementById('bottigliaSceltaOverlay').style.display = 'none';
  document.getElementById('identificazioneOverlay').style.display = 'none';
  document.getElementById('modalitaSceltaOverlay').style.display = 'block';
}

// =========== Schermata identificazione preliminare ('esterno') ===========
function setupIdentificazioneForm() {
  // Popola nazioni/regioni
  if (typeof nazioniOptionsHtml === 'function') {
    const nazSel = document.getElementById('idNazione');
    if (nazSel && !nazSel.innerHTML.trim()) {
      nazSel.innerHTML = nazioniOptionsHtml('Italia');
      document.getElementById('idRegioneSelect').innerHTML = regioniOptionsHtml(null);
      aggiornaCampoRegioneId();
    }
  }
}

function aggiornaCampoRegioneId() {
  const naz = document.getElementById('idNazione').value;
  const sel = document.getElementById('idRegioneSelect');
  const inp = document.getElementById('idRegione');
  const label = document.getElementById('idRegioneLabel');
  if (!sel || !inp || !label) return;
  if (naz === 'Italia') {
    sel.style.display = 'block';
    inp.style.display = 'none';
    label.textContent = 'Regione';
  } else {
    sel.style.display = 'none';
    inp.style.display = 'block';
    label.textContent = naz ? 'Regione / Sub-area' : 'Regione';
  }
}

async function confermaIdentificazione() {
  // Validazione minima: serve almeno nome + tipologia per avere senso
  const nome = document.getElementById('idNome').value.trim();
  const tipologia = document.getElementById('idTipologia').value;

  if (!nome) {
    showToast('Inserisci almeno il nome del vino', true);
    document.getElementById('idNome').focus();
    return;
  }
  if (!tipologia) {
    showToast('Seleziona la tipologia (necessaria per le regole di degustazione)', true);
    document.getElementById('idTipologia').focus();
    return;
  }

  // Salva i dati raccolti in D
  D.nome_vino_esterno = nome;
  D.produttore_esterno = document.getElementById('idProduttore').value.trim() || null;
  const annata = document.getElementById('idAnnata').value;
  D.annata_esterna = annata ? parseInt(annata) : null;
  D.tipologia_esterna = tipologia;
  D.denominazione_esterna = document.getElementById('idDenominazione').value.trim() || null;
  D.nazione_esterna = document.getElementById('idNazione').value || null;

  // Regione: dipende dalla nazione
  if (D.nazione_esterna === 'Italia') {
    D.regione_esterna = document.getElementById('idRegioneSelect').value || null;
  } else {
    D.regione_esterna = document.getElementById('idRegione').value.trim() || null;
  }

  D.vitigni_esterni = document.getElementById('idVitigni').value.trim() || null;
  const grad = document.getElementById('idGradazione').value;
  D.gradazione_esterna = grad ? parseFloat(grad) : null;

  // Costruisci un "bottigliaCorrente" virtuale per applicare regole di tipologia
  // e per popolare profili vitigno se disponibili
  bottigliaCorrente = {
    nome_vino: nome,
    produttore: D.produttore_esterno,
    annata: D.annata_esterna,
    tipologia: tipologia,
    denominazione: D.denominazione_esterna,
    nazione: D.nazione_esterna,
    regione: D.regione_esterna,
    vitigni: D.vitigni_esterni ? D.vitigni_esterni.split(',').map(s => s.trim()).filter(Boolean) : null,
  };

  // Aggiorna header con il nome del vino
  const w = document.getElementById('wineId');
  const subtitle = [D.produttore_esterno, D.annata_esterna].filter(Boolean).join(' · ');
  w.textContent = subtitle ? `${nome} · ${subtitle}` : nome;
  w.classList.remove('cieca');

  // Mostra i box necessari
  document.getElementById('boxVinoEsterno').style.display = 'block';
  document.getElementById('boxDensita').style.display = 'block';
  document.getElementById('boxPerlage').style.display = 'block';

  // Chiudi la schermata e avvia il wizard
  document.getElementById('identificazioneOverlay').style.display = 'none';
  await avviaWizard();

  // Pre-compila il box "Identità del vino" allo step 5 con i dati già inseriti
  setTimeout(() => prepopolaBoxIdentita(), 100);
}

function prepopolaBoxIdentita() {
  // Popola gli input del box vino esterno (step 5) con i dati raccolti in identificazione
  const fields = [
    ['extNome', D.nome_vino_esterno],
    ['extProduttore', D.produttore_esterno],
    ['extAnnata', D.annata_esterna],
    ['extTipologia', D.tipologia_esterna],
    ['extDenominazione', D.denominazione_esterna],
    ['extNazione', D.nazione_esterna],
    ['extVitigni', D.vitigni_esterni],
    ['extGradazione', D.gradazione_esterna],
  ];
  for (const [id, val] of fields) {
    const el = document.getElementById(id);
    if (el && val != null) el.value = val;
  }
  // Regione: dipende dalla nazione
  if (typeof aggiornaCampoRegioneExt === 'function') aggiornaCampoRegioneExt();
  if (D.regione_esterna) {
    const naz = D.nazione_esterna;
    if (naz === 'Italia') {
      const sel = document.getElementById('extRegioneSelect');
      if (sel) sel.value = D.regione_esterna;
    } else {
      const inp = document.getElementById('extRegione');
      if (inp) inp.value = D.regione_esterna;
    }
  }
}

let _bottiglieScelta = [];
let _pickerFiltro = 'all';

async function caricaBottiglieScelta() {
  const lista = document.getElementById('listaBottiglieScelta');
  lista.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.4);font-size:13px">Caricamento...</div>';

  const { data } = await sb.from('bottiglie')
    .select('id, nome_vino, produttore, annata, tipologia, denominazione, regione, gradazione, quantita, etichetta_url, controetichetta_url, stato, anno_pronto_da, anno_pronto_a')
    .eq('user_id', currentUser.id)
    .eq('stato', 'disponibile')
    .order('created_at', { ascending: false });

  _bottiglieScelta = data || [];
  _pickerFiltro = 'all';
  // Reset visivo dei filter buttons
  document.querySelectorAll('#pickerFilterBtns .filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'all');
  });
  document.getElementById('filtroBottiglie').value = '';
  renderListaBottiglie();
}

function isBottigliaPronta(b) {
  const annoCorrente = new Date().getFullYear();
  const da = b.anno_pronto_da;
  const fino = b.anno_pronto_a;
  if (!da && !fino) return false;
  if (da && annoCorrente < da) return false;
  if (fino && annoCorrente > fino) return false;
  return true;
}

function setPickerFilter(filter, btn) {
  _pickerFiltro = filter;
  document.querySelectorAll('#pickerFilterBtns .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderListaBottiglie();
}

function renderListaBottiglie() {
  const lista = document.getElementById('listaBottiglieScelta');
  const vuota = document.getElementById('listaBottiglieVuota');
  const search = document.getElementById('filtroBottiglie').value.toLowerCase().trim();

  // Applica filtri
  let filtered = _bottiglieScelta;
  if (_pickerFiltro === 'pronti') {
    filtered = filtered.filter(isBottigliaPronta);
  } else if (_pickerFiltro !== 'all') {
    filtered = filtered.filter(b => b.tipologia === _pickerFiltro);
  }
  if (search) {
    filtered = filtered.filter(b =>
      (b.nome_vino || '').toLowerCase().includes(search) ||
      (b.produttore || '').toLowerCase().includes(search) ||
      (b.denominazione || '').toLowerCase().includes(search) ||
      (b.regione || '').toLowerCase().includes(search)
    );
  }

  if (!filtered || filtered.length === 0) {
    lista.innerHTML = '';
    vuota.style.display = 'block';
    return;
  }
  vuota.style.display = 'none';

  lista.innerHTML = filtered.map(b => {
    const tipologia = b.tipologia || 'rosso';
    const annata = b.annata || 'NM';
    const gradi = b.gradazione ? b.gradazione.toString().replace('.', ',') + '°' : '';
    const qty = b.quantita || 1;
    const pronta = isBottigliaPronta(b);
    const img = b.etichetta_url
      ? `<img src="${esc(b.etichetta_url)}" alt="">`
      : (b.controetichetta_url
          ? `<img src="${esc(b.controetichetta_url)}" alt="">`
          : `<i class="ti ti-bottle-wine" aria-hidden="true"></i>`);
    const badgePronto = pronta
      ? `<span class="wine-badge-pronto"><i class="ti ti-circle-check" style="font-size:11px"></i> Pronto</span>`
      : '';
    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    return `
      <button type="button" class="wine-card" onclick="scegliBottigliaScelta('${b.id}')">
        <span class="wine-stripe stripe-${tipologia}"></span>
        <div class="wine-thumb">${img}</div>
        <div class="wine-info">
          <div class="wine-name">${esc(b.nome_vino || 'Senza nome')}${badgePronto}</div>
          <div class="wine-producer">${esc(b.produttore || '—')}</div>
          <div class="wine-meta-row">
            <span class="tipo-label tipo-${tipologia}">${cap(tipologia)}</span>
            <span class="wine-extra">${annata}${gradi ? ' · ' + gradi : ''}</span>
          </div>
        </div>
        <div class="wine-qty">×${qty}</div>
      </button>
    `;
  }).join('');
}

function filtraBottiglie() {
  renderListaBottiglie();
}

async function scegliBottigliaScelta(id) {
  console.log('[degusta] scegliBottigliaScelta:', id);
  document.getElementById('bottigliaSceltaOverlay').style.display = 'none';
  try {
    await caricaBottigliaECompleta(id);
    console.log('[degusta] bottiglia caricata, bottigliaCorrente:', bottigliaCorrente);
    await completaAvvio();
    console.log('[degusta] wizard avviato, stepAttuale:', stepAttuale);
  } catch (e) {
    console.error('[degusta] Errore in scegliBottigliaScelta:', e);
    showToast('Errore: ' + (e.message || 'impossibile aprire la bottiglia'), true);
  }
}

// Escape HTML per evitare XSS quando inseriamo testo utente in innerHTML
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==== SETUP CHIP (selezione singola) ====
function setupChips() {
  const config = [
    ['chipsOccasione', 'occasione'],
    ['chipsCommensali', 'commensali'],
    ['chipsDecanter', 'decanter', v => v === 'true'],
    ['chipsColore', 'colore'],
    ['chipsRiflesso', 'riflesso'],
    ['chipsDensita', 'densita_cromatica'],
    ['chipsLimpidezza', 'limpidezza'],
    ['chipsVivacita', 'vivacita'],
    ['chipsPerlage', 'perlage_grana'],
    ['chipsZucchero', 'gusto_zucchero'],
    ['chipsAlcol', 'gusto_alcol'],
    ['chipsAcidita', 'gusto_acidita'],
    ['chipsTannino', 'gusto_tannino'],
    ['chipsSapidita', 'gusto_sapidita'],
    ['chipsChiusura', 'gusto_chiusura'],
    ['chipsProspettive', 'prospettive_consumo'],
    ['chipsRicomprerei', 'ricomprerei', v => v === 'true'],
  ];

  for (const [containerId, field, transform] of config) {
    const c = document.getElementById(containerId);
    if (!c) continue;
    c.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Se il chip è disabilitato (non pertinente alla tipologia), ignora il click
        if (chip.classList.contains('chip-disabled')) {
          mostraTooltipNonApplicabile(chip);
          return;
        }
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
        chip.classList.add('sel');
        const v = chip.dataset.v;
        D[field] = transform ? transform(v) : v;

        // Se è cambiato il colore o la tipologia esterna, ricalcola le regole
        // (importante per gli spumanti: bianco vs rosato vs rosso e per la cieca)
        if (field === 'colore' || field === 'tipologia_esterna') {
          if (typeof applicaRegoleTipologia === 'function') applicaRegoleTipologia();
          if (typeof renderFamiglieAromi === 'function') renderFamiglieAromi();
        }
      });
    });
  }

  // ===== RUOTA AROMI - render iniziale =====
  renderFamiglieAromi();

  // Input testuali e textarea
  bindInput('luogo');
  bindInput('abbinamento');
  bindInput('tempoApertura', 'tempo_apertura_min', v => v ? parseInt(v) : null);
  bindInput('olfattoNote');
  bindInput('noteConclusive');

  // Campi vino esterno (degustazione cieca)
  bindInput('extNome', 'nome_vino_esterno', v => v.trim() || null);
  bindInput('extProduttore', 'produttore_esterno', v => v.trim() || null);
  bindInput('extAnnata', 'annata_esterna', v => v ? parseInt(v) : null);
  bindInput('extTipologia', 'tipologia_esterna', v => v || null);
  bindInput('extDenominazione', 'denominazione_esterna', v => v.trim() || null);
  bindInput('extNazione', 'nazione_esterna', v => v || null);
  bindInput('extGradazione', 'gradazione_esterna', v => v ? parseFloat(v) : null);
  bindInput('extVitigni', 'vitigni_esterni', v => v.trim() || null);
  // Regione: doppio handler (select e input) — il valore effettivo viene letto al salvataggio
  const regioneSel = document.getElementById('extRegioneSelect');
  if (regioneSel) regioneSel.addEventListener('change', () => {
    D.regione_esterna = getRegioneExtValue();
  });
  const regioneInp = document.getElementById('extRegione');
  if (regioneInp) regioneInp.addEventListener('input', () => {
    D.regione_esterna = getRegioneExtValue();
  });

  // Setup nazione/regione (Italia di default)
  if (typeof nazioniOptionsHtml === 'function') {
    document.getElementById('extNazione').innerHTML = nazioniOptionsHtml('Italia');
    document.getElementById('extRegioneSelect').innerHTML = regioniOptionsHtml(null);
    aggiornaCampoRegioneExt();
  }

  document.getElementById('tempSlider').addEventListener('input', e => {
    D.temperatura_servizio = parseFloat(e.target.value);
  });
}

// Toggle Regione: select se nazione=Italia, input testo altrimenti
function aggiornaCampoRegioneExt() {
  const naz = document.getElementById('extNazione').value;
  const sel = document.getElementById('extRegioneSelect');
  const inp = document.getElementById('extRegione');
  const label = document.getElementById('extRegioneLabel');
  if (!sel || !inp || !label) return;

  if (naz === 'Italia') {
    sel.style.display = 'block';
    inp.style.display = 'none';
    label.textContent = 'Regione';
    if (inp.value && !sel.value) sel.innerHTML = regioniOptionsHtml(inp.value);
  } else {
    sel.style.display = 'none';
    inp.style.display = 'block';
    label.textContent = naz ? 'Regione / Sub-area' : 'Regione';
    if (sel.value && !inp.value) inp.value = sel.value;
  }
  D.regione_esterna = getRegioneExtValue();
  D.nazione_esterna = naz || null;
}

function getRegioneExtValue() {
  const naz = document.getElementById('extNazione').value;
  if (naz === 'Italia') {
    return document.getElementById('extRegioneSelect').value || null;
  }
  return document.getElementById('extRegione').value.trim() || null;
}

function bindInput(elId, field, transform) {
  const el = document.getElementById(elId);
  if (!el) return;
  const fieldName = field || mapField(elId);
  el.addEventListener('input', e => {
    const v = e.target.value;
    D[fieldName] = transform ? transform(v) : (v.trim() || '');
  });
}

function mapField(elId) {
  const map = {
    luogo: 'luogo',
    commensali: 'commensali',
    abbinamento: 'abbinamento_cibo',
    olfattoNote: 'olfatto_note',
    noteConclusive: 'note_conclusive',
  };
  return map[elId] || elId;
}

// ==== SETUP SCALE (punteggi) ====
function setupScale() {
  const config = [
    ['scaleOlfComplessita', 'olfatto_complessita'],
    ['scaleOlfQualita', 'olfatto_qualita'],
    ['scaleEquilibrio', 'gusto_equilibrio'],
    ['scalePersistenza', 'gusto_persistenza'],
    ['scaleGustoQualita', 'gusto_qualita'],
    ['scaleDimensioni', 'gusto_dimensioni'],
  ];
  for (const [containerId, prefix] of config) {
    const c = document.getElementById(containerId);
    if (!c) continue;
    c.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        c.querySelectorAll('.scale-btn').forEach(x => x.classList.remove('sel'));
        btn.classList.add('sel');
        D[prefix + '_punti'] = parseInt(btn.dataset.v);
        D[prefix + '_label'] = btn.dataset.lbl;
      });
    });
  }
}

// ==== SETUP STELLE ====
function setupStars() {
  document.querySelectorAll('#stars .star').forEach(star => {
    star.addEventListener('click', () => {
      const v = parseInt(star.dataset.v);
      D.voto_piacere_personale = v;
      document.querySelectorAll('#stars .star').forEach(s => {
        s.classList.toggle('sel', parseInt(s.dataset.v) <= v);
      });
      draftDirty = true;
    });
  });
}

// ==== NAVIGAZIONE ====
function renderStep() {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === stepAttuale);
  });
  document.getElementById('stepInfo').textContent = stepAttuale + ' · ' + TOT_STEP;
  document.getElementById('progBar').style.width = (stepAttuale * 100 / TOT_STEP) + '%';
  document.getElementById('btnBack').style.display = stepAttuale > 1 ? 'flex' : 'none';

  if (stepAttuale === TOT_STEP) {
    document.getElementById('btnNext').style.display = 'none';
    document.getElementById('btnSalva').style.display = 'flex';
    aggiornaPunteggio();
  } else {
    document.getElementById('btnNext').style.display = 'flex';
    document.getElementById('btnSalva').style.display = 'none';
  }

  // Aggiorna la ruota aromi se entro nello step Olfatto
  // (il colore o la tipologia potrebbero essere appena stati selezionati)
  if (stepAttuale === 3) {
    renderFamiglieAromi();
  }

  // Scroll all'inizio del passo attivo (considera header sticky tramite scroll-margin-top)
  setTimeout(() => {
    const stepActive = document.querySelector('.step.active');
    if (stepActive) {
      stepActive.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, 0);
}

function stepAvanti() {
  if (stepAttuale < TOT_STEP) {
    stepAttuale++;
    renderStep();
    if (typeof salvaDraft === 'function') salvaDraft();
  }
}

function stepIndietro() {
  if (stepAttuale > 1) {
    stepAttuale--;
    renderStep();
    if (typeof salvaDraft === 'function') salvaDraft();
  }
}

async function annullaDegustazione() {
  if (!confirm('Vuoi davvero annullare la degustazione?\n\nI dati inseriti andranno persi.')) return;

  if (typeof cancellaDraft === 'function') cancellaDraft();
  draftDirty = false;

  // Se la bottiglia è stata creata per la degustazione (stato 'esterna') e l'utente
  // annulla, cancello la bottiglia per non lasciarla "orfana" nel DB
  if (bottigliaCorrente && bottigliaCorrente.stato === 'esterna') {
    try {
      await sb.from('bottiglie').delete().eq('id', bottigliaCorrente.id);
    } catch (e) {
      console.warn('Impossibile cancellare bottiglia esterna:', e);
    }
    location.href = 'cantina.html';
    return;
  }

  if (bottigliaCorrente) {
    location.href = 'bottiglia.html?id=' + bottigliaCorrente.id;
  } else {
    location.href = 'cantina.html';
  }
}

// ==== CALCOLO PUNTEGGIO ====
function calcolaPunteggio() {
  return (D.olfatto_complessita_punti || 0)
       + (D.olfatto_qualita_punti || 0)
       + (D.gusto_equilibrio_punti || 0)
       + (D.gusto_persistenza_punti || 0)
       + (D.gusto_qualita_punti || 0)
       + (D.gusto_dimensioni_punti || 0);
}

function calcolaFascia(punti) {
  if (!punti) return null;
  if (punti < 70) return null;        // sotto soglia
  if (punti <= 77) return 'accettabile';   // 70-77
  if (punti <= 85) return 'buono';          // 78-85
  if (punti <= 90) return 'ottimo';         // 86-90
  if (punti <= 96) return 'eccellente';     // 91-96
  return 'memorabile';                       // 97-100
}

function labelFascia(f) {
  const map = {
    accettabile: 'Accettabile',
    buono: 'Buono',
    ottimo: 'Ottimo',
    eccellente: 'Eccellente',
    memorabile: 'Memorabile',
  };
  return map[f] || '—';
}

function aggiornaPunteggio() {
  const punti = calcolaPunteggio();
  const fascia = calcolaFascia(punti);
  document.getElementById('scoreNum').textContent = punti;
  document.getElementById('scoreFascia').textContent = fascia ? labelFascia(fascia) : 'Compila i punteggi';

  // Summary
  const parts = [];
  if (D.colore) parts.push(`<span class="lbl">Colore:</span> ${D.colore}`);
  if (D.olfatto_sentori.length) {
    const display = D.olfatto_sentori.slice(0, 5).join(', ') + (D.olfatto_sentori.length > 5 ? '…' : '');
    parts.push(`<span class="lbl">Sentori:</span> ${display}`);
  } else if (D.olfatto_descrittori.length) {
    parts.push(`<span class="lbl">Olfatto:</span> ${D.olfatto_descrittori.join(', ')}`);
  }
  if (D.gusto_zucchero) parts.push(`<span class="lbl">Bocca:</span> ${D.gusto_zucchero}${D.gusto_acidita ? ', ' + D.gusto_acidita : ''}`);
  document.getElementById('summaryBox').innerHTML = parts.join(' · ') || 'Riepilogo non disponibile';
}

// ==== SALVATAGGIO ====
async function salvaDegustazione() {
  const punti = calcolaPunteggio();
  const fascia = calcolaFascia(punti);

  let bottigliaIdFinale = D.bottiglia_id;

  // Se è una degustazione cieca/libera (no bottiglia in cantina) e l'utente ha
  // rivelato l'identità del vino, CHIEDIAMO se vuole aggiungere la bottiglia in cantina
  const haRivelato = !D.bottiglia_id && (D.nome_vino_esterno || extFotoFronte || extFotoRetro);
  if (haRivelato) {
    const nomeMostrato = D.nome_vino_esterno || 'questa bottiglia';
    const conferma = confirm(
      `Hai compilato i dati del vino degustato.\n\n` +
      `Vuoi aggiungere "${nomeMostrato}" alla cantina (con stato "bevuta")?\n\n` +
      `Ti consente di ritrovarla nelle Bevute, nello storico degustazioni, sulla mappa e nelle statistiche.`
    );

    if (conferma) {
      try {
        const urlFronte = extFotoFronte ? await uploadFotoEsterna(extFotoFronte, 'fronte') : null;
        const urlRetro  = extFotoRetro  ? await uploadFotoEsterna(extFotoRetro,  'retro')  : null;

        // Parser vitigni: "Nebbiolo, Barbera" → ['Nebbiolo', 'Barbera']
        const vitigniArr = (D.vitigni_esterni || '')
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0);

        const nuovaBott = {
          user_id: currentUser.id,
          nome_vino: D.nome_vino_esterno || 'Vino in degustazione cieca',
          produttore: D.produttore_esterno || null,
          annata: D.annata_esterna || null,
          tipologia: D.tipologia_esterna || 'rosso',
          denominazione: D.denominazione_esterna || null,
          nazione: D.nazione_esterna || null,
          regione: D.regione_esterna || null,
          vitigni: vitigniArr.length ? vitigniArr : null,
          gradazione: D.gradazione_esterna || null,
          stato: 'bevuta',
          quantita: 0,
          etichetta_url: urlFronte,
          controetichetta_url: urlRetro,
        };
        const { data: bot, error: errBot } = await sb
          .from('bottiglie')
          .insert(nuovaBott)
          .select()
          .single();
        if (errBot) throw errBot;
        bottigliaIdFinale = bot.id;
      } catch (e) {
        console.error('Errore creazione bottiglia da degustazione cieca:', e);
        showToast('Errore salvataggio bottiglia: ' + (e.message || ''), true);
        // Non blocchiamo: continuiamo a salvare la degustazione senza il record bottiglia
      }
    }
  }

  // Se la bottiglia esiste già (cantina o esterna) ed è ancora in stato 'esterna'
  // (caso "Vino esterno noto" arrivato via aggiungi.html?modo=degusta), la promuovo
  // a 'bevuta' adesso che la degustazione è stata completata
  if (bottigliaIdFinale && bottigliaCorrente && bottigliaCorrente.stato === 'esterna') {
    try {
      await sb.from('bottiglie')
        .update({ stato: 'bevuta', quantita: 0 })
        .eq('id', bottigliaIdFinale);
    } catch (e) {
      console.warn('Impossibile aggiornare stato bottiglia esterna:', e);
    }
  }

  const payload = {
    user_id: currentUser.id,
    bottiglia_id: bottigliaIdFinale,
    nome_vino_esterno: D.nome_vino_esterno,
    produttore_esterno: D.produttore_esterno,
    annata_esterna: D.annata_esterna,
    luogo: D.luogo || null,
    data_degustazione: D.data_degustazione,
    occasione: D.occasione,
    commensali: D.commensali || null,
    abbinamento_cibo: D.abbinamento_cibo || null,
    temperatura_servizio: D.temperatura_servizio,
    tempo_apertura_min: D.tempo_apertura_min,
    decanter: D.decanter,
    colore: D.colore,
    riflesso: D.riflesso,
    densita_cromatica: D.densita_cromatica,
    limpidezza: D.limpidezza,
    vivacita: D.vivacita,
    perlage_grana: D.perlage_grana,
    olfatto_descrittori: D.olfatto_descrittori.length ? D.olfatto_descrittori : null,
    olfatto_sentori: D.olfatto_sentori.length ? D.olfatto_sentori : null,
    olfatto_note: D.olfatto_note || null,
    olfatto_complessita_label: D.olfatto_complessita_label,
    olfatto_complessita_punti: D.olfatto_complessita_punti,
    olfatto_qualita_label: D.olfatto_qualita_label,
    olfatto_qualita_punti: D.olfatto_qualita_punti,
    gusto_zucchero: D.gusto_zucchero,
    gusto_alcol: D.gusto_alcol,
    gusto_acidita: D.gusto_acidita,
    gusto_tannino: D.gusto_tannino,
    gusto_sapidita: D.gusto_sapidita,
    gusto_chiusura: D.gusto_chiusura,
    gusto_equilibrio_label: D.gusto_equilibrio_label,
    gusto_equilibrio_punti: D.gusto_equilibrio_punti,
    gusto_persistenza_label: D.gusto_persistenza_label,
    gusto_persistenza_punti: D.gusto_persistenza_punti,
    gusto_qualita_label: D.gusto_qualita_label,
    gusto_qualita_punti: D.gusto_qualita_punti,
    gusto_dimensioni_label: D.gusto_dimensioni_label,
    gusto_dimensioni_punti: D.gusto_dimensioni_punti,
    prospettive_consumo: D.prospettive_consumo,
    fascia_finale: fascia,
    note_conclusive: D.note_conclusive || null,
    voto_piacere_personale: D.voto_piacere_personale,
    ricomprerei: D.ricomprerei,
  };

  const { error } = await sb.from('degustazioni').insert(payload);

  if (error) {
    showToast('Errore: ' + error.message, true);
    console.error(error);
    return;
  }

  showToast('Degustazione salvata!');
  cancellaDraft();
  draftDirty = false;
  setTimeout(() => {
    // Dopo il salvataggio andiamo sempre nella sezione Bevute
    // (sia per degustazioni di bottiglie in cantina sia per quelle cieche)
    location.href = 'bevute.html';
  }, 1200);
}

// ====== FOTO ESTERNE (degustazione cieca/libera) ======
function handleExtPhotoSelect(e, lato) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('Foto troppo grande (max 5MB)', true);
    return;
  }
  if (lato === 'fronte') extFotoFronte = file;
  else extFotoRetro = file;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const areaId = lato === 'fronte' ? 'extUploadFronte' : 'extUploadRetro';
    const area = document.getElementById(areaId);
    if (!area) return;
    area.classList.add('has-image');
    area.innerHTML = `
      <img src="${evt.target.result}" class="preview-img" alt="Etichetta ${lato}">
      <button type="button" class="preview-remove" onclick="rimuoviExtFoto(event, '${lato}')" aria-label="Rimuovi foto">
        <i class="ti ti-x"></i>
      </button>
    `;
  };
  reader.readAsDataURL(file);
  draftDirty = true;
}

function rimuoviExtFoto(e, lato) {
  e.stopPropagation();
  e.preventDefault();
  const areaId = lato === 'fronte' ? 'extUploadFronte' : 'extUploadRetro';
  const area = document.getElementById(areaId);
  if (lato === 'fronte') extFotoFronte = null;
  else extFotoRetro = null;
  const label = lato === 'fronte' ? 'Fronte' : 'Retro';
  const sub = lato === 'fronte' ? 'Etichetta principale' : 'Controetichetta';
  area.classList.remove('has-image');
  area.innerHTML = `
    <i class="ti ti-camera upload-icon" aria-hidden="true"></i>
    <p style="font-size:13px">${label}</p>
    <small>${sub}</small>
    <input type="file" accept="image/*" onchange="handleExtPhotoSelect(event, '${lato}')">
  `;
  draftDirty = true;
}

async function uploadFotoEsterna(file, lato) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${currentUser.id}/${Date.now()}_${lato}.${ext}`;
  const { error: errUp } = await sb.storage
    .from('etichette')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (errUp) throw errUp;
  const { data: publ } = sb.storage.from('etichette').getPublicUrl(fileName);
  return publ.publicUrl;
}

// ============================================================
// RUOTA AROMI: rendering interattivo gerarchico
// ============================================================

function renderFamiglieAromi() {
  const tipologia = determinaTipologia();
  console.log('[Ruota Aromi] bottigliaCorrente:', bottigliaCorrente);
  console.log('[Ruota Aromi] tipologia determinata:', tipologia);
  console.log('[Ruota Aromi] D.colore:', D.colore);
  const grid = document.getElementById('famiglieGrid');
  if (!grid) return;

  // Filtra le famiglie compatibili con la tipologia
  const famiglie = tipologia ? getFamiglieCompatibili(tipologia) : AROMI;

  // Banner vitigno (se presente)
  renderVitignoBanner();

  // Render delle famiglie come chip
  grid.innerHTML = '';
  for (const [key, fam] of Object.entries(famiglie)) {
    const chip = document.createElement('div');
    chip.className = 'fam-chip';
    chip.dataset.key = key;
    if (D.olfatto_famiglie_aperte.includes(key)) chip.classList.add('sel');
    chip.innerHTML = `
      <span class="fam-dot" style="background:${fam.color}"></span>
      <span>${fam.label}</span>
      <span class="fam-count" id="count-${key}" style="display:none">0</span>
    `;
    chip.addEventListener('click', () => toggleFamiglia(key));
    grid.appendChild(chip);
  }

  // Modalità sticky: attiva quando almeno una famiglia è aperta
  // (altrimenti la griglia 2-colonne aiuta a scegliere la prima famiglia)
  const haFamigliaAperta = D.olfatto_famiglie_aperte && D.olfatto_famiglie_aperte.length > 0;
  grid.classList.toggle('sticky-row', haFamigliaAperta);

  // Render delle famiglie aperte
  renderSentoriContainer();
  renderSentoriRiepilogo();
  aggiornaContatori();

  // Scorre il chip attivo in vista quando si entra in sticky mode
  if (haFamigliaAperta) {
    const lastKey = D.olfatto_famiglie_aperte[D.olfatto_famiglie_aperte.length - 1];
    const activeChip = grid.querySelector(`.fam-chip[data-key="${lastKey}"]`);
    if (activeChip && grid.classList.contains('sticky-row')) {
      // Scroll orizzontale per portare il chip attivo in vista
      setTimeout(() => {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 50);
    }
  }
}

function renderVitignoBanner() {
  const banner = document.getElementById('vitignoBanner');
  const text = document.getElementById('vitignoBannerText');
  if (!banner || !text) return;

  const vitigni = bottigliaCorrente?.vitigni || [];

  // Profili vitigno disponibili (riconosciuti)
  const profili = vitigni
    .map(v => ({ nome: v, profilo: getProfiloVitigno(v) }))
    .filter(x => x.profilo);

  if (profili.length) {
    const nomi = profili.map(p => p.nome).join(', ');
    text.innerHTML = `Profilo aromatico evidenziato per <b>${nomi}</b>. I sentori tipici sono marcati con ★`;
    banner.style.display = 'flex';
    return;
  }

  // Bottiglia in cantina con tipologia nota ma vitigno non profilato
  if (bottigliaCorrente?.tipologia) {
    const tipoLabel = { rosso: 'rosso', bianco: 'bianco', rosato: 'rosato',
                        spumante: 'spumante', passito: 'passito', liquoroso: 'liquoroso' }[bottigliaCorrente.tipologia] || bottigliaCorrente.tipologia;
    const nomeVit = vitigni.length ? ` (${vitigni.join(', ')})` : '';
    text.innerHTML = `Sentori filtrati per <b>vino ${tipoLabel}</b>${nomeVit}`;
    banner.style.display = 'flex';
    return;
  }

  // Degustazione cieca con colore selezionato
  const isCieca = !bottigliaCorrente && D.colore;
  if (isCieca) {
    const tipo = tipologiaDaColore(D.colore);
    if (tipo) {
      const tipoLabel = { rosso: 'rosso', bianco: 'bianco', rosato: 'rosato' }[tipo] || tipo;
      text.innerHTML = `Sentori filtrati per <b>vino ${tipoLabel}</b> (dedotto dal colore <b>${D.colore}</b>)`;
      banner.style.display = 'flex';
      return;
    }
  }

  banner.style.display = 'none';
}

function toggleFamiglia(key) {
  const isAperta = D.olfatto_famiglie_aperte.includes(key);

  if (isAperta) {
    // Se la famiglia è già aperta, la richiudo (toggle off)
    D.olfatto_famiglie_aperte = [];
  } else {
    // Altrimenti chiudo tutte le altre e apro solo questa
    D.olfatto_famiglie_aperte = [key];
  }

  // Aggiorna anche olfatto_descrittori basandosi sui sentori effettivamente selezionati
  // (NON sulle famiglie aperte, perché chiudere una famiglia non deve cancellare i sentori scelti)
  D.olfatto_descrittori = calcolaFamiglieDaSentori();

  // Re-render
  renderFamiglieAromi();
}

// Ricostruisce la lista delle famiglie a cui appartengono i sentori selezionati
function calcolaFamiglieDaSentori() {
  const famiglie = new Set();
  for (const sentore of D.olfatto_sentori) {
    // Cerca a quale famiglia appartiene questo sentore
    for (const [key, fam] of Object.entries(AROMI)) {
      if (!fam.subcategories) continue;
      for (const sub of Object.values(fam.subcategories)) {
        if (sub.sentori && sub.sentori.includes(sentore)) {
          famiglie.add(fam.family || key);
          break;
        }
      }
    }
  }
  return [...famiglie];
}

function renderSentoriContainer() {
  const container = document.getElementById('sentoriContainer');
  if (!container) return;
  container.innerHTML = '';

  // Calcola profili vitigno per evidenziare ★
  const vitigni = bottigliaCorrente?.vitigni || [];
  const profili = vitigni.map(v => getProfiloVitigno(v)).filter(Boolean);

  // Usa il dataset FILTRATO per tipologia, così le sottocategorie non
  // compatibili (es. Bacche rosse per uno spumante bianco) non compaiono.
  const tipologia = determinaTipologia();
  const famigliePerFiltro = tipologia ? getFamiglieCompatibili(tipologia) : AROMI;

  // Per ogni famiglia aperta, mostra le sottocategorie e sentori
  for (const key of D.olfatto_famiglie_aperte) {
    // Recupero famiglia filtrata se esiste, altrimenti fallback al dataset originale
    const fam = famigliePerFiltro[key] || AROMI[key];
    if (!fam) continue;

    const block = document.createElement('div');
    block.className = 'fam-expanded';
    block.style.borderLeft = `4px solid ${fam.color}`;

    let html = `<div class="fam-expanded-header">
      <span class="fam-dot" style="background:${fam.color}"></span>
      ${fam.label}
    </div>`;

    const subEntries = Object.entries(fam.subcategories);
    if (subEntries.length === 0) {
      html += `<div style="font-size:12px;color:var(--testo-2);font-style:italic;padding:4px 0">
        Nessun sentore tipico per questa tipologia di vino
      </div>`;
    } else {
      for (const [subKey, sub] of subEntries) {
        html += `<div class="subcat-block">
          <div class="subcat-label">${sub.label}</div>
          <div class="sentori-row">`;
        for (const sentore of sub.sentori) {
          const sel = D.olfatto_sentori.includes(sentore);
          const tipico = isSentoreTipico(sentore, profili);
          let cls = 'sentore-chip';
          if (sel) cls += ' sel';
          if (tipico) cls += ' tipico';
          html += `<span class="${cls}" data-sentore="${sentore}">${sentore}</span>`;
        }
        html += `</div></div>`;
      }
    }
    block.innerHTML = html;
    container.appendChild(block);

    // Bind eventi sentori
    block.querySelectorAll('.sentore-chip').forEach(chip => {
      chip.addEventListener('click', () => toggleSentore(chip.dataset.sentore));
    });
  }
}

function toggleSentore(sentore) {
  const idx = D.olfatto_sentori.indexOf(sentore);
  if (idx >= 0) {
    D.olfatto_sentori.splice(idx, 1);
  } else {
    D.olfatto_sentori.push(sentore);
  }
  // Aggiorna la lista delle famiglie che hanno sentori selezionati
  D.olfatto_descrittori = calcolaFamiglieDaSentori();
  // Re-render solo le parti interessate
  renderSentoriContainer();
  renderSentoriRiepilogo();
  aggiornaContatori();
}

function renderSentoriRiepilogo() {
  const box = document.getElementById('sentoriRiepilogo');
  const tagsBox = document.getElementById('sentoriTagsBox');
  const count = document.getElementById('sentoriCount');
  if (!box || !tagsBox) return;

  if (!D.olfatto_sentori.length) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';
  count.textContent = D.olfatto_sentori.length;

  tagsBox.innerHTML = D.olfatto_sentori.map(s =>
    `<span class="sentore-tag">${s} <i class="ti ti-x" data-rm="${s}"></i></span>`
  ).join('');

  tagsBox.querySelectorAll('i[data-rm]').forEach(ic => {
    ic.addEventListener('click', () => toggleSentore(ic.dataset.rm));
  });
}

function aggiornaContatori() {
  // Per ogni famiglia mostrata, conta quanti sentori selezionati le appartengono
  const tipologia = determinaTipologia();
  const famiglie = tipologia ? getFamiglieCompatibili(tipologia) : AROMI;
  for (const [key, fam] of Object.entries(famiglie)) {
    const badge = document.getElementById('count-' + key);
    if (!badge) continue;
    let n = 0;
    for (const sub of Object.values(fam.subcategories)) {
      for (const s of sub.sentori) {
        if (D.olfatto_sentori.includes(s)) n++;
      }
    }
    // Aggiorna anche la classe del chip parent per evidenziarlo
    const chip = badge.closest('.fam-chip');
    if (chip) {
      if (n > 0) chip.classList.add('has-sentori');
      else chip.classList.remove('has-sentori');
    }
    if (n > 0) {
      badge.style.display = 'flex';
      badge.textContent = n;
    } else {
      badge.style.display = 'none';
    }
  }
}

// ============================================================
// Determina la tipologia del vino in ordine di priorità:
// 1. Bottiglia in cantina (tipologia certa)
// 2. Tipologia dichiarata esternamente
// 3. Tipologia dedotta dal colore osservato (utile in degustazione alla cieca)
// ============================================================
function determinaTipologia() {
  // Tipologia base
  let tipo = null;
  if (bottigliaCorrente?.tipologia) tipo = bottigliaCorrente.tipologia;
  else if (D.tipologia_esterna) tipo = D.tipologia_esterna;
  else if (D.colore) tipo = tipologiaDaColore(D.colore);

  if (!tipo) return null;

  // Per gli spumanti, specifica il sottotipo in base al colore osservato
  if (tipo === 'spumante') {
    const c = D.colore;
    if (!c) return 'spumante_bianco'; // default: stragrande maggioranza
    if (['cerasuolo', 'ramato'].includes(c)) return 'spumante_rosato';
    if (['porpora', 'rubino', 'granato'].includes(c)) return 'spumante_rosso';
    return 'spumante_bianco';
  }

  return tipo;
}


// ============================================================
// SISTEMA AUTOSAVE DRAFT (localStorage)
// ============================================================
// Salva automaticamente lo stato della degustazione in background
// così se l'utente esce per sbaglio (back, telefonata, app chiusa)
// può riprenderla dal punto esatto in cui l'ha lasciata.
// ============================================================

const DRAFT_KEY_PREFIX = 'cantinapp_draft_degustazione_';

// Chiave specifica per questa degustazione (per bottiglia o cieca)
function getDraftKey() {
  if (!currentUser) return null;
  const id = D.bottiglia_id || 'cieca';
  return DRAFT_KEY_PREFIX + currentUser.id + '_' + id;
}

// Salva il draft in localStorage
function salvaDraft() {
  try {
    const key = getDraftKey();
    if (!key) return;
    const draft = {
      D: D,
      stepAttuale: stepAttuale,
      timestamp: Date.now(),
      nome_visualizzato: bottigliaCorrente
        ? (bottigliaCorrente.nome_vino + ' · ' + (bottigliaCorrente.annata || 'NM'))
        : 'Degustazione alla cieca',
    };
    localStorage.setItem(key, JSON.stringify(draft));
    draftDirty = true;
  } catch (e) {
    console.warn('Impossibile salvare draft:', e);
  }
}

// Cancella il draft (chiamato dopo salvataggio definitivo)
function cancellaDraft() {
  try {
    const key = getDraftKey();
    if (key) localStorage.removeItem(key);
    draftDirty = false;
  } catch (e) {}
}

// Carica draft esistente (se compatibile con la bottiglia corrente)
function caricaDraft() {
  try {
    const key = getDraftKey();
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Flag: true se ci sono modifiche non salvate
let draftDirty = false;

// Auto-save: aggancia salvaDraft a tutti gli eventi di modifica
function attivaAutosave() {
  // Listener globale per "input" e "change" su tutto il form
  document.addEventListener('input', () => salvaDraft());
  document.addEventListener('change', () => salvaDraft());
  // Click sui chip viene già gestito (modifica D dentro setupChips)
  // ma aggiungo un listener delegato per essere certi
  document.addEventListener('click', (e) => {
    if (e.target.closest('.chip') || e.target.closest('.scale-num') || e.target.closest('.star') || e.target.closest('.fam-chip') || e.target.closest('.sentore-chip')) {
      // Piccolo delay per dare tempo alla logica di aggiornare D
      setTimeout(() => salvaDraft(), 50);
    }
  });

  // Avviso uscita pagina se ci sono modifiche non salvate
  window.addEventListener('beforeunload', (e) => {
    if (draftDirty) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
}

// Proponi ripresa del draft se esiste
async function proponiRipresaDraft() {
  const draft = caricaDraft();
  if (!draft) return false;

  // Mostra un dialog di conferma personalizzato
  const oraSalvataggio = new Date(draft.timestamp);
  const ora = oraSalvataggio.toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  const messaggio = `Hai una degustazione non completata di "${draft.nome_visualizzato}" iniziata il ${ora}.\n\nVuoi riprenderla?`;

  if (confirm(messaggio)) {
    // Riprende: ripristina D e step
    Object.assign(D, draft.D);
    stepAttuale = draft.stepAttuale || 1;
    return true;
  } else {
    // Inizia nuova: cancella il draft
    cancellaDraft();
    return false;
  }
}

// Ripristina lo stato visivo dei chip/scale/stars dopo il caricamento del draft
function ripristinaUI() {
  // Chip (selezione singola)
  const chipConfig = [
    ['chipsOccasione', 'occasione'],
    ['chipsCommensali', 'commensali'],
    ['chipsDecanter', 'decanter'],
    ['chipsColore', 'colore'],
    ['chipsRiflesso', 'riflesso'],
    ['chipsDensita', 'densita_cromatica'],
    ['chipsLimpidezza', 'limpidezza'],
    ['chipsVivacita', 'vivacita'],
    ['chipsPerlage', 'perlage_grana'],
    ['chipsZucchero', 'gusto_zucchero'],
    ['chipsAlcol', 'gusto_alcol'],
    ['chipsAcidita', 'gusto_acidita'],
    ['chipsTannino', 'gusto_tannino'],
    ['chipsSapidita', 'gusto_sapidita'],
    ['chipsChiusura', 'gusto_chiusura'],
    ['chipsProspettive', 'prospettive_consumo'],
    ['chipsRicomprerei', 'ricomprerei'],
  ];
  for (const [containerId, field] of chipConfig) {
    const c = document.getElementById(containerId);
    if (!c) continue;
    const val = D[field];
    if (val === null || val === undefined) continue;
    c.querySelectorAll('.chip').forEach(chip => {
      const chipVal = chip.dataset.v;
      const match = (typeof val === 'boolean')
        ? (chipVal === String(val))
        : (chipVal === String(val));
      if (match) chip.classList.add('sel');
    });
  }

  // Input testuali
  const inputs = {
    luogo: 'luogo',
    abbinamento: 'abbinamento_cibo',
    tempoApertura: 'tempo_apertura_min',
    olfattoNote: 'olfatto_note',
    noteConclusive: 'note_conclusive',
    extNome: 'nome_vino_esterno',
    extProduttore: 'produttore_esterno',
    extAnnata: 'annata_esterna',
    extTipologia: 'tipologia_esterna',
    dataDegustazione: 'data_degustazione',
  };
  for (const [elId, field] of Object.entries(inputs)) {
    const el = document.getElementById(elId);
    if (el && D[field] !== null && D[field] !== undefined) {
      el.value = D[field];
    }
  }

  // Temperatura
  const tempEl = document.getElementById('tempSlider');
  if (tempEl && D.temperatura_servizio !== null) tempEl.value = D.temperatura_servizio;

  // Sentori olfatto: re-render della ruota aromi tiene conto di D.olfatto_sentori
  if (typeof renderFamiglieAromi === 'function') renderFamiglieAromi();
  if (typeof aggiornaCounterSentori === 'function') aggiornaCounterSentori();

  // Stelle voto piacere
  if (D.voto_piacere_personale) {
    document.querySelectorAll('.star').forEach(s => {
      if (parseInt(s.dataset.v) <= D.voto_piacere_personale) s.classList.add('sel');
    });
  }
}


// ============================================================
// REGOLE DI COMPATIBILITÀ TIPOLOGIA → CHIP DISABILITATI
// ============================================================
// Mostra tutta la scheda Assosommelier ma disabilita i chip che
// non sono pertinenti alla tipologia in degustazione.
// In degustazione cieca tutto resta selezionabile (devi capire tu).
// ============================================================

const COMPATIBILITA = {
  bianco: {
    colore: ['paglierino', 'dorato', 'aranciato'],
    riflesso: ['non_rilevato', 'verdolino', 'dorato', 'aranciato'],
    densita: [],
    tannino: [],
    perlage: [],
  },
  rosato: {
    colore: ['cerasuolo', 'ramato', 'aranciato'],
    riflesso: ['non_rilevato', 'aranciato'],
    densita: [],
    tannino: [],
    perlage: [],
  },
  rosso: {
    colore: ['porpora', 'rubino', 'granato', 'aranciato'],
    riflesso: ['non_rilevato', 'aranciato', 'porpora', 'granato'],
    densita: ['trasparente', 'compatto'],
    tannino: '*',
    perlage: [],
  },
  // Spumante BIANCO: comportamento simile al bianco fermo, ma con perlage attivo
  spumante_bianco: {
    colore: ['paglierino', 'dorato', 'aranciato'],
    riflesso: ['non_rilevato', 'verdolino', 'dorato', 'aranciato'],
    densita: [],
    tannino: [],
    perlage: ['grandi', 'fini'],
  },
  // Spumante ROSATO: rosato fermo + perlage
  spumante_rosato: {
    colore: ['cerasuolo', 'ramato', 'aranciato'],
    riflesso: ['non_rilevato', 'aranciato'],
    densita: [],
    tannino: [],
    perlage: ['grandi', 'fini'],
  },
  // Spumante ROSSO: rosso fermo + perlage (Lambrusco, Brachetto)
  spumante_rosso: {
    colore: ['porpora', 'rubino', 'granato', 'aranciato'],
    riflesso: ['non_rilevato', 'aranciato', 'porpora', 'granato'],
    densita: ['trasparente', 'compatto'],
    tannino: '*',
    perlage: ['grandi', 'fini'],
  },
  passito: { colore: '*', riflesso: '*', densita: '*', tannino: '*', perlage: [] },
  liquoroso: { colore: '*', riflesso: '*', densita: '*', tannino: '*', perlage: [] },
};

function applicaRegoleTipologia() {
  // Determina la tipologia EFFETTIVA (per gli spumanti distingue bianco/rosato/rosso in base al colore)
  const tipologia = determinaTipologia();

  // Se non c'è una tipologia chiara (es. degustazione cieca senza colore), abilita tutto
  if (!tipologia) {
    abilitaTuttiIChip();
    return;
  }

  const regole = COMPATIBILITA[tipologia];
  if (!regole) {
    abilitaTuttiIChip();
    return;
  }

  applicaRegolaChip('chipsColore', regole.colore, 'colore');
  applicaRegolaChip('chipsRiflesso', regole.riflesso, 'riflesso');
  applicaRegolaChip('chipsDensita', regole.densita, 'densita_cromatica');
  applicaRegolaChip('chipsTannino', regole.tannino, 'gusto_tannino');
  applicaRegolaChip('chipsPerlage', regole.perlage, 'perlage_grana');

  marcaBoxDisabilitato('boxDensita', !regole.densita || (Array.isArray(regole.densita) && regole.densita.length === 0));
  marcaBoxDisabilitato('boxTannino', !regole.tannino || (Array.isArray(regole.tannino) && regole.tannino.length === 0));
  marcaBoxDisabilitato('boxPerlage', !regole.perlage || (Array.isArray(regole.perlage) && regole.perlage.length === 0));
}

function applicaRegolaChip(containerId, valoriAmmessi, fieldName) {
  const c = document.getElementById(containerId);
  if (!c) return;

  const chips = c.querySelectorAll('.chip');
  const tuttiAmmessi = valoriAmmessi === '*';
  const nessunoAmmesso = Array.isArray(valoriAmmessi) && valoriAmmessi.length === 0;

  chips.forEach(chip => {
    const val = chip.dataset.v;
    const ammesso = tuttiAmmessi || (Array.isArray(valoriAmmessi) && valoriAmmessi.includes(val));

    if (ammesso) {
      chip.classList.remove('chip-disabled');
      chip.removeAttribute('aria-disabled');
    } else {
      chip.classList.add('chip-disabled');
      chip.setAttribute('aria-disabled', 'true');
      // Se era selezionato, deselezionalo automaticamente
      if (chip.classList.contains('sel')) {
        chip.classList.remove('sel');
        D[fieldName] = null;
      }
    }
  });

  // Se TUTTI i chip sono disabilitati, marca il container come "non applicabile"
  if (nessunoAmmesso) {
    c.classList.add('chips-all-disabled');
  } else {
    c.classList.remove('chips-all-disabled');
  }
}

function marcaBoxDisabilitato(boxId, disabilitato) {
  const box = document.getElementById(boxId);
  if (!box) return;
  if (disabilitato) {
    box.classList.add('box-non-applicabile');
  } else {
    box.classList.remove('box-non-applicabile');
  }
}

function abilitaTuttiIChip() {
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.remove('chip-disabled');
    c.removeAttribute('aria-disabled');
  });
  document.querySelectorAll('.box-non-applicabile').forEach(b => {
    b.classList.remove('box-non-applicabile');
  });
}


// Mostra un toast esplicativo quando si tenta di selezionare un chip non pertinente
function mostraTooltipNonApplicabile(chip) {
  const tipologia = determinaTipologia();
  if (!tipologia) return;
  const tipoLabel = {
    bianco: 'vini bianchi',
    rosato: 'vini rosati',
    rosso: 'vini rossi',
    spumante: 'spumanti',
    spumante_bianco: 'spumanti bianchi',
    spumante_rosato: 'spumanti rosati',
    spumante_rosso: 'spumanti rossi',
    passito: 'passiti',
    liquoroso: 'vini liquorosi',
  }[tipologia] || tipologia;
  const valLabel = chip.textContent.trim();
  showToast(`"${valLabel}" non si applica ai ${tipoLabel}`);
}
