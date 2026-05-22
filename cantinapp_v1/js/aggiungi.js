// ============================================================
// CantinApp — Aggiungi bottiglia
// ============================================================

let currentUser = null;
let fotoFile = null;
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

// ==== GESTIONE FOTO ETICHETTA ====
function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Foto troppo grande (max 5MB)', true);
    return;
  }

  fotoFile = file;

  // Mostra preview
  const reader = new FileReader();
  reader.onload = function(evt) {
    const area = document.getElementById('uploadArea');
    area.classList.add('has-image');
    area.innerHTML = `
      <img src="${evt.target.result}" class="preview-img" alt="Etichetta">
      <button type="button" class="preview-remove" onclick="rimuoviFoto(event)" aria-label="Rimuovi foto">
        <i class="ti ti-x"></i>
      </button>
    `;
    document.getElementById('aiHint').style.display = 'flex';
    document.getElementById('btnAI').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function rimuoviFoto(e) {
  e.stopPropagation();
  fotoFile = null;
  const area = document.getElementById('uploadArea');
  area.classList.remove('has-image');
  area.innerHTML = `
    <i class="ti ti-camera upload-icon" aria-hidden="true"></i>
    <p>Fotografa l'etichetta</p>
    <small>oppure scegli dalla galleria</small>
    <input type="file" id="fotoEtichetta" accept="image/*" capture="environment" onchange="handlePhotoSelect(event)">
  `;
  document.getElementById('aiHint').style.display = 'none';
  document.getElementById('btnAI').style.display = 'none';
}

function analizzaConAI() {
  // Per ora placeholder - implementeremo Claude API in fase 2
  showToast('Funzione AI in arrivo nei prossimi aggiornamenti');
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
    // Upload foto se presente
    if (fotoFile) {
      msg.textContent = 'Upload foto...';
      const ext = fotoFile.name.split('.').pop().toLowerCase();
      const fileName = `${currentUser.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage
        .from('etichette')
        .upload(fileName, fotoFile, { upsert: false });

      if (upErr) {
        console.error('Upload error:', upErr);
        showToast('Errore upload foto: ' + upErr.message, true);
      } else {
        const { data: { publicUrl } } = sb.storage.from('etichette').getPublicUrl(fileName);
        dati.etichetta_url = publicUrl;
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
