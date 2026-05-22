// ============================================================
// CantinApp — Aggiungi bottiglia
// ============================================================

let currentUser = null;
let fotoFronte = null;
let fotoRetro = null;
let vitigni = [];

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  // Imposta data acquisto a oggi di default
  document.getElementById('dataAcquisto').valueAsDate = new Date();
})();

function toggleSpumantiFields() {
  const tip = document.getElementById('tipologia').value;
  document.getElementById('spumantiFields').style.display =
    tip === 'spumante' ? 'block' : 'none';
}

// ==== GESTIONE FOTO ETICHETTA (FRONTE/RETRO) ====
function handlePhotoSelect(e, lato) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Foto troppo grande (max 5MB)', true);
    return;
  }

  if (lato === 'fronte') fotoFronte = file;
  else fotoRetro = file;

  // Mostra preview
  const reader = new FileReader();
  reader.onload = function(evt) {
    const areaId = lato === 'fronte' ? 'uploadFronte' : 'uploadRetro';
    const area = document.getElementById(areaId);
    area.classList.add('has-image');
    area.innerHTML = `
      <img src="${evt.target.result}" class="preview-img" alt="Etichetta ${lato}">
      <button type="button" class="preview-remove" onclick="rimuoviFoto(event, '${lato}')" aria-label="Rimuovi foto">
        <i class="ti ti-x"></i>
      </button>
    `;
    aggiornaAIHint();
  };
  reader.readAsDataURL(file);
}

function rimuoviFoto(e, lato) {
  e.stopPropagation();
  const areaId = lato === 'fronte' ? 'uploadFronte' : 'uploadRetro';
  const area = document.getElementById(areaId);
  if (lato === 'fronte') fotoFronte = null;
  else fotoRetro = null;

  const label = lato === 'fronte' ? 'Fronte' : 'Retro';
  const sub = lato === 'fronte' ? 'Etichetta principale' : 'Controetichetta';

  area.classList.remove('has-image');
  area.innerHTML = `
    <i class="ti ti-camera upload-icon" aria-hidden="true"></i>
    <p style="font-size:13px">${label}</p>
    <small>${sub}</small>
    <input type="file" accept="image/*" capture="environment" onchange="handlePhotoSelect(event, '${lato}')">
  `;
  aggiornaAIHint();
}

function aggiornaAIHint() {
  const ne = (fotoFronte || fotoRetro);
  document.getElementById('aiHint').style.display = ne ? 'flex' : 'none';
  document.getElementById('btnAI').style.display = ne ? 'flex' : 'none';
}

async function analizzaConAI() {
  if (!fotoFronte) {
    showToast('Carica almeno la foto fronte', true);
    return;
  }

  const btn = document.getElementById('btnAI');
  const origText = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-loader-2" style="font-size:16px;animation:spin .7s linear infinite"></i> Analisi in corso...';
  btn.disabled = true;

  try {
    const fronteBase64 = await fileToBase64(fotoFronte);
    const retroBase64 = fotoRetro ? await fileToBase64(fotoRetro) : null;

    const response = await fetch('/api/analyze-wine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fronte_base64: fronteBase64,
        fronte_media_type: fotoFronte.type,
        retro_base64: retroBase64,
        retro_media_type: fotoRetro?.type,
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.error('AI error:', result);
      showToast('Errore analisi AI: ' + (result.error || 'sconosciuto'), true);
      return;
    }

    const dati = result.data;
    let campiCompilati = 0;

    // Compila i campi solo se vuoti, o sovrascrive comunque
    if (dati.nome_vino) { document.getElementById('nomeVino').value = dati.nome_vino; campiCompilati++; }
    if (dati.produttore) { document.getElementById('produttore').value = dati.produttore; campiCompilati++; }
    if (dati.annata) { document.getElementById('annata').value = dati.annata; campiCompilati++; }
    if (dati.tipologia) {
      document.getElementById('tipologia').value = dati.tipologia;
      toggleSpumantiFields();
      campiCompilati++;
    }
    if (dati.denominazione) { document.getElementById('denominazione').value = dati.denominazione; campiCompilati++; }
    if (dati.regione) { document.getElementById('regione').value = dati.regione; campiCompilati++; }
    if (dati.gradazione) { document.getElementById('gradazione').value = dati.gradazione; campiCompilati++; }
    if (dati.formato_ml) { document.getElementById('formatoMl').value = dati.formato_ml; }

    // Vitigni - aggiungi alla lista
    if (dati.vitigni && Array.isArray(dati.vitigni)) {
      for (const v of dati.vitigni) {
        if (v && !vitigni.includes(v)) vitigni.push(v);
      }
      renderVitigni();
      campiCompilati++;
    }

    // Campi spumante
    if (dati.tipologia === 'spumante') {
      if (dati.metodo) document.getElementById('metodo').value = dati.metodo;
      if (dati.sboccatura) document.getElementById('sboccatura').value = dati.sboccatura;
      if (dati.dosaggio) document.getElementById('dosaggio').value = dati.dosaggio;
    }

    showToast(`Compilati ${campiCompilati} campi — verifica e conferma`);

  } catch (err) {
    console.error(err);
    showToast('Errore: ' + err.message, true);
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

// Converte File a base64 (senza il prefisso data:...)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==== GESTIONE VITIGNI ====
function handleVitigno(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = e.target;
  const valore = input.value.trim();
  if (!valore) return;
  if (vitigni.includes(valore)) {
    showToast('Vitigno già aggiunto', true);
    return;
  }
  vitigni.push(valore);
  input.value = '';
  renderVitigni();
}

function rimuoviVitigno(v) {
  vitigni = vitigni.filter(x => x !== v);
  renderVitigni();
}

function renderVitigni() {
  const c = document.getElementById('vitigniTags');
  c.innerHTML = vitigni.map(v => `
    <span class="vitigno-tag">
      ${escapeHtml(v)}
      <button type="button" onclick="rimuoviVitigno('${v.replace(/'/g, "\\'")}')">×</button>
    </span>
  `).join('');
}

// ==== SALVATAGGIO ====
async function salvaBottiglia(e) {
  e.preventDefault();
  const overlay = document.getElementById('savingOverlay');
  const msg = document.getElementById('savingMsg');

  // Raccogli dati
  const dati = {
    user_id: currentUser.id,
    nome_vino: document.getElementById('nomeVino').value.trim(),
    produttore: document.getElementById('produttore').value.trim(),
    annata: parseIntOrNull(document.getElementById('annata').value),
    tipologia: document.getElementById('tipologia').value,
    denominazione: nullIfEmpty(document.getElementById('denominazione').value),
    regione: nullIfEmpty(document.getElementById('regione').value),
    gradazione: parseFloatOrNull(document.getElementById('gradazione').value),
    formato_ml: parseInt(document.getElementById('formatoMl').value),
    vitigni: vitigni.length ? vitigni : null,
    quantita: parseInt(document.getElementById('quantita').value) || 1,
    prezzo_acquisto: parseFloatOrNull(document.getElementById('prezzo').value),
    data_acquisto: nullIfEmpty(document.getElementById('dataAcquisto').value),
    luogo_acquisto: nullIfEmpty(document.getElementById('luogoAcquisto').value),
    anno_pronto_da: parseIntOrNull(document.getElementById('prontoDa').value),
    anno_pronto_a: parseIntOrNull(document.getElementById('prontoA').value),
    note: nullIfEmpty(document.getElementById('note').value),
  };

  // Campi spumante
  if (dati.tipologia === 'spumante') {
    dati.metodo = nullIfEmpty(document.getElementById('metodo').value);
    dati.sboccatura = parseIntOrNull(document.getElementById('sboccatura').value);
    dati.dosaggio = nullIfEmpty(document.getElementById('dosaggio').value);
  }

  // Validazione minima
  if (!dati.nome_vino || !dati.produttore) {
    showToast('Compila nome vino e produttore', true);
    return;
  }

  overlay.classList.add('show');

  try {
    // Upload foto FRONTE se presente
    if (fotoFronte) {
      msg.textContent = 'Upload foto fronte...';
      const ext = fotoFronte.name.split('.').pop().toLowerCase();
      const fileName = `${currentUser.id}/${Date.now()}_fronte.${ext}`;
      const { error: upErr } = await sb.storage
        .from('etichette')
        .upload(fileName, fotoFronte, { upsert: false });
      if (upErr) {
        console.error('Upload fronte error:', upErr);
        showToast('Errore upload fronte: ' + upErr.message, true);
      } else {
        const { data: { publicUrl } } = sb.storage.from('etichette').getPublicUrl(fileName);
        dati.etichetta_url = publicUrl;
      }
    }

    // Upload foto RETRO se presente
    if (fotoRetro) {
      msg.textContent = 'Upload foto retro...';
      const ext = fotoRetro.name.split('.').pop().toLowerCase();
      const fileName = `${currentUser.id}/${Date.now()}_retro.${ext}`;
      const { error: upErr } = await sb.storage
        .from('etichette')
        .upload(fileName, fotoRetro, { upsert: false });
      if (upErr) {
        console.error('Upload retro error:', upErr);
        showToast('Errore upload retro: ' + upErr.message, true);
      } else {
        const { data: { publicUrl } } = sb.storage.from('etichette').getPublicUrl(fileName);
        dati.controetichetta_url = publicUrl;
      }
    }

    // Insert
    msg.textContent = 'Salvataggio in cantina...';
    const { data: nuovaBottiglia, error } = await sb
      .from('bottiglie')
      .insert(dati)
      .select()
      .single();

    if (error) {
      overlay.classList.remove('show');
      showToast('Errore: ' + error.message, true);
      return;
    }

    // Salva posizione se inserita
    const posizione = document.getElementById('posizione').value.trim();
    if (posizione && nuovaBottiglia) {
      await sb.from('posizioni').insert({
        user_id: currentUser.id,
        bottiglia_id: nuovaBottiglia.id,
        scaffale: posizione
      });
    }

    overlay.classList.remove('show');
    showToast('Bottiglia aggiunta in cantina!');
    setTimeout(() => window.location.href = 'cantina.html', 800);

  } catch (err) {
    overlay.classList.remove('show');
    showToast('Errore: ' + err.message, true);
    console.error(err);
  }
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
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
