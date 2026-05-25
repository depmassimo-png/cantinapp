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

  // Bottiglia da degustare (opzionale)
  const id = new URLSearchParams(window.location.search).get('bottiglia_id');
  if (id) {
    const { data } = await sb.from('bottiglie').select('*').eq('id', id).single();
    if (data) {
      bottigliaCorrente = data;
      D.bottiglia_id = data.id;
      document.getElementById('wineId').textContent =
        `${data.nome_vino} · ${data.produttore}${data.annata ? ' · ' + data.annata : ''}`;

      // Mostra TUTTI i box (densità, tannino, perlage), gestiamo poi
      // l'abilitazione tramite applicaRegoleTipologia()
      document.getElementById('boxDensita').style.display = 'block';
      document.getElementById('boxPerlage').style.display = 'block';
    }
  } else {
    document.getElementById('wineId').textContent = 'Degustazione alla cieca';
    document.getElementById('boxVinoEsterno').style.display = 'block';
    document.getElementById('boxDensita').style.display = 'block';
    document.getElementById('boxPerlage').style.display = 'block';
  }

  // Data oggi
  const oggi = new Date().toISOString().split('T')[0];
  document.getElementById('dataDegustazione').value = oggi;
  D.data_degustazione = oggi;

  // Setup event listeners su chip
  setupChips();
  setupScale();
  setupStars();

  document.getElementById('dataDegustazione').addEventListener('change', e => {
    D.data_degustazione = e.target.value;
  });

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

  renderStep();
})();

// ==== SETUP CHIP (selezione singola) ====
function setupChips() {
  const config = [
    ['chipsOccasione', 'occasione'],
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
  bindInput('commensali');
  bindInput('abbinamento');
  bindInput('tempoApertura', 'tempo_apertura_min', v => v ? parseInt(v) : null);
  bindInput('olfattoNote');
  bindInput('noteConclusive');

  // Campi vino esterno (degustazione cieca)
  bindInput('extNome', 'nome_vino_esterno', v => v.trim() || null);
  bindInput('extProduttore', 'produttore_esterno', v => v.trim() || null);
  bindInput('extAnnata', 'annata_esterna', v => v ? parseInt(v) : null);
  bindInput('extTipologia', 'tipologia_esterna', v => v || null);

  document.getElementById('tempSlider').addEventListener('input', e => {
    D.temperatura_servizio = parseFloat(e.target.value);
  });
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
        s.classList.toggle('lit', parseInt(s.dataset.v) <= v);
      });
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

function annullaDegustazione() {
  if (confirm('Vuoi davvero annullare la degustazione?\n\nI dati inseriti andranno persi.')) {
    if (typeof cancellaDraft === 'function') cancellaDraft();
    draftDirty = false;
    if (bottigliaCorrente) {
      location.href = 'bottiglia.html?id=' + bottigliaCorrente.id;
    } else {
      location.href = 'cantina.html';
    }
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
  // rivelato l'identità del vino (nome o foto), creiamo la bottiglia in cantina
  // direttamente con stato 'bevuta', includendo le foto
  if (!D.bottiglia_id && (D.nome_vino_esterno || extFotoFronte || extFotoRetro)) {
    try {
      const urlFronte = extFotoFronte ? await uploadFotoEsterna(extFotoFronte, 'fronte') : null;
      const urlRetro  = extFotoRetro  ? await uploadFotoEsterna(extFotoRetro,  'retro')  : null;

      const nuovaBott = {
        user_id: currentUser.id,
        nome_vino: D.nome_vino_esterno || 'Vino in degustazione cieca',
        produttore: D.produttore_esterno || null,
        annata: D.annata_esterna || null,
        tipologia: D.tipologia_esterna || 'rosso',
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
      showToast('Errore salvataggio foto: ' + (e.message || ''), true);
      // Non blocchiamo: continuiamo a salvare la degustazione senza foto
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

  // Render delle famiglie aperte
  renderSentoriContainer();
  renderSentoriRiepilogo();
  aggiornaContatori();
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
    commensali: 'commensali',
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
