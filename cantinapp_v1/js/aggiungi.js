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

  // Popola select Nazione e Regione (Italia di default)
  setupGeoSelects();
})();

function setupGeoSelects() {
  document.getElementById('nazione').innerHTML = nazioniOptionsHtml('Italia');
  document.getElementById('regioneSelect').innerHTML = regioniOptionsHtml(null);
  aggiornaCampoRegione();
}

// Quando si cambia nazione: mostra select Regione (Italia) o input testo (altri)
function aggiornaCampoRegione() {
  const naz = document.getElementById('nazione').value;
  const sel = document.getElementById('regioneSelect');
  const inp = document.getElementById('regione');
  const label = document.getElementById('regioneLabel');

  if (naz === 'Italia') {
    sel.style.display = 'block';
    inp.style.display = 'none';
    label.textContent = 'Regione';
    // Se l'input aveva un valore, prova a metterlo nella select
    if (inp.value && !sel.value) {
      sel.innerHTML = regioniOptionsHtml(inp.value);
    }
  } else {
    sel.style.display = 'none';
    inp.style.display = 'block';
    label.textContent = naz ? 'Regione / Sub-area' : 'Regione';
    // Se la select aveva un valore, riportalo nell'input
    if (sel.value && !inp.value) {
      inp.value = sel.value;
    }
  }
}

// Restituisce la regione effettiva (dalla select se Italia, dall'input altrimenti)
function getRegioneValue() {
  const naz = document.getElementById('nazione').value;
  if (naz === 'Italia') {
    return document.getElementById('regioneSelect').value || null;
  }
  return document.getElementById('regione').value.trim() || null;
}

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
    <input type="file" accept="image/*" onchange="handlePhotoSelect(event, '${lato}')">
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
    let fronteBlob, retroBlob;
    try {
      fronteBlob = await compressImageToBlob(fotoFronte);
    } catch (e) {
      showToast('Errore lettura foto fronte: ' + e.message, true);
      return;
    }
    if (fotoRetro) {
      try {
        retroBlob = await compressImageToBlob(fotoRetro);
      } catch (e) {
        showToast('Errore lettura foto retro: ' + e.message, true);
        return;
      }
    }

    // Converte in base64 dopo compressione
    const fronteBase64 = await blobToBase64(fronteBlob);
    const retroBase64 = retroBlob ? await blobToBase64(retroBlob) : null;

    const response = await fetch('/api/analyze-wine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fronte_base64: fronteBase64,
        fronte_media_type: 'image/jpeg',
        retro_base64: retroBase64,
        retro_media_type: retroBlob ? 'image/jpeg' : undefined,
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.error('AI error:', result);
      showToast('Errore analisi AI: ' + (result.error || 'sconosciuto'), true);
      return;
    }

    const dati = result.data;
    console.log('AI restituisce:', dati);
    let campiCompilati = 0;

    // Compila i campi solo se vuoti, o sovrascrive comunque
    function safeSet(id, value, counter) {
      if (value == null || value === '') return false;
      try {
        document.getElementById(id).value = value;
        return true;
      } catch (e) {
        console.warn(`Errore set ${id}=${value}:`, e.message);
        return false;
      }
    }

    if (safeSet('nomeVino', dati.nome_vino)) campiCompilati++;
    if (safeSet('produttore', dati.produttore)) campiCompilati++;
    const annataNum = sanitizeInt(dati.annata);
    if (safeSet('annata', annataNum)) campiCompilati++;
    if (dati.tipologia) {
      try {
        document.getElementById('tipologia').value = dati.tipologia;
        toggleSpumantiFields();
        campiCompilati++;
      } catch (e) { console.warn('Tipologia:', e.message); }
    }
    if (safeSet('denominazione', dati.denominazione)) campiCompilati++;
    // Nazione (dall'AI) + Regione condizionale
    if (dati.nazione) {
      const naz = NAZIONI.find(n => n.name.toLowerCase() === String(dati.nazione).toLowerCase());
      if (naz) {
        document.getElementById('nazione').value = naz.name;
        aggiornaCampoRegione();
        campiCompilati++;
      }
    }
    if (dati.regione) {
      const naz = document.getElementById('nazione').value;
      if (naz === 'Italia') {
        // 1) Match esatto case-insensitive nelle 20 regioni ufficiali
        let r = REGIONI_IT.find(rg => rg.toLowerCase() === String(dati.regione).toLowerCase());
        // 2) Matching robusto (gestisce "Trentino", "Südtirol", "Alto Adige", "Romagna", ecc.)
        if (!r && typeof trovaRegioneIT === 'function') {
          const coords = trovaRegioneIT(dati.regione);
          if (coords) {
            // trovaRegioneIT non restituisce il nome, lo ricavo dalle 20 ufficiali
            // confrontando le coordinate
            r = Object.entries(REGIONI_IT_COORDS).find(([nome, c]) => c.lat === coords.lat && c.lng === coords.lng)?.[0];
          }
        }
        if (r) {
          document.getElementById('regioneSelect').value = r;
          console.log('[AI] Regione normalizzata:', dati.regione, '→', r);
          campiCompilati++;
        } else {
          // valore non riconoscibile → aggiungi come personalizzato
          document.getElementById('regioneSelect').innerHTML = regioniOptionsHtml(dati.regione);
          console.warn('[AI] Regione non riconosciuta, aggiunta come personalizzata:', dati.regione);
          campiCompilati++;
        }
      } else {
        if (safeSet('regione', dati.regione)) campiCompilati++;
      }
    }
    const gradoNum = sanitizeFloat(dati.gradazione);
    if (safeSet('gradazione', gradoNum)) campiCompilati++;
    const formatoNum = sanitizeInt(dati.formato_ml);
    safeSet('formatoMl', formatoNum);

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
      const sboccNum = sanitizeInt(dati.sboccatura);
      if (sboccNum) document.getElementById('sboccatura').value = sboccNum;
      if (dati.dosaggio) document.getElementById('dosaggio').value = dati.dosaggio;
    }

    showToast(`Compilati ${campiCompilati} campi — verifica e conferma`);

  } catch (err) {
    console.error(err);
    // Toast persistente per debug iPhone
    const t = document.getElementById('toast');
    if (t) {
      const stack = err.stack ? '\n' + err.stack.substring(0, 200) : '';
      t.textContent = 'ERR: ' + (err.message || err.toString()) + stack;
      t.className = 'toast error show';
      t.style.cssText = 'bottom: 10px; max-height: 200px; overflow: auto; font-size: 11px; text-align: left; white-space: pre-wrap;';
      setTimeout(() => {
        t.style.cssText = '';
        t.classList.remove('show');
      }, 15000);
    }
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

// Comprime un'immagine: ridimensiona a max 900px lato lungo e qualità 75% JPEG
function compressImage(file, maxSize = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxSize) {
          h = h * (maxSize / w);
          w = maxSize;
        } else if (h > maxSize) {
          w = w * (maxSize / h);
          h = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, type: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Comprime ritornando Blob
function compressImageToBlob(file, maxSize = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxSize) {
          h = h * (maxSize / w);
          w = maxSize;
        } else if (h > maxSize) {
          w = w * (maxSize / h);
          h = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Conversione blob fallita'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Sanifica un valore in intero (toglie spazi, simboli, virgole)
function sanitizeInt(v) {
  if (v == null || v === '') return null;
  const s = String(v).replace(/[^0-9]/g, '');
  if (!s) return null;
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

// Sanifica un valore in float (gestisce virgola/punto, % e altri simboli)
function sanitizeFloat(v) {
  if (v == null || v === '') return null;
  const s = String(v).replace(',', '.').replace(/[^0-9.]/g, '');
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
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
    nazione: nullIfEmpty(document.getElementById('nazione').value),
    regione: getRegioneValue(),
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
      console.log('[upload] fronte:', fileName, 'size:', fotoFronte.size);
      const { error: upErr } = await sb.storage
        .from('etichette')
        .upload(fileName, fotoFronte, { upsert: false, contentType: fotoFronte.type });
      if (upErr) {
        overlay.classList.remove('show');
        console.error('[upload] errore fronte:', upErr);
        showToast('Errore upload foto fronte: ' + upErr.message, true);
        return; // STOP: non salvare la bottiglia senza la foto richiesta
      }
      const { data: pub1 } = sb.storage.from('etichette').getPublicUrl(fileName);
      dati.etichetta_url = pub1.publicUrl;
      console.log('[upload] fronte OK:', pub1.publicUrl);
    }

    // Upload foto RETRO se presente
    if (fotoRetro) {
      msg.textContent = 'Upload foto retro...';
      const ext = fotoRetro.name.split('.').pop().toLowerCase();
      const fileName = `${currentUser.id}/${Date.now()}_retro.${ext}`;
      console.log('[upload] retro:', fileName, 'size:', fotoRetro.size);
      const { error: upErr } = await sb.storage
        .from('etichette')
        .upload(fileName, fotoRetro, { upsert: false, contentType: fotoRetro.type });
      if (upErr) {
        overlay.classList.remove('show');
        console.error('[upload] errore retro:', upErr);
        showToast('Errore upload foto retro: ' + upErr.message, true);
        return;
      }
      const { data: pub2 } = sb.storage.from('etichette').getPublicUrl(fileName);
      dati.controetichetta_url = pub2.publicUrl;
      console.log('[upload] retro OK:', pub2.publicUrl);
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
