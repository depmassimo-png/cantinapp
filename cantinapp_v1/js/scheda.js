// ============================================================
// CantinApp — Dettaglio scheda degustazione
// ============================================================

let scheda = null;
let currentUser = null;

// Stato modifica foto
let editFotoFronte = null, editFotoRetro = null;
let editRimuoviFronte = false, editRimuoviRetro = false;

// Stato visore zoom
const ZOOM_MIN = 1, ZOOM_MAX = 5;
let zScale = 1, zTx = 0, zTy = 0;
let zDW = 0, zDH = 0, zSW = 0, zSH = 0;
let zPointers = new Map();
let zPanLast = null, zLastDist = 0, zLastMid = null;
let zMoved = false, zDownTarget = null, zLastTap = 0;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  setupZoom();

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    showToast('Scheda non trovata', true);
    setTimeout(() => location.href = 'bevute.html', 1500);
    return;
  }

  await loadScheda(id);
})();

async function loadScheda(id) {
  const { data, error } = await sb
    .from('degustazioni')
    .select(`*, bottiglia:bottiglie(id, nome_vino, produttore, annata, tipologia, etichetta_url, controetichetta_url)`)
    .eq('id', id)
    .single();

  if (error || !data) {
    showToast('Scheda non trovata', true);
    setTimeout(() => location.href = 'bevute.html', 1500);
    return;
  }

  scheda = data;
  render();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

function render() {
  const d = scheda;

  // Hero foto
  renderHero();

  // Hero testo
  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || 'Vino senza nome';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';
  document.getElementById('wineName').textContent = nome;
  document.getElementById('wineProd').textContent = prod + (annata ? ' · ' + annata : '');
  document.getElementById('wineData').textContent = 'Degustato il ' + formatDate(d.data_degustazione);

  // Punteggio
  const punti = d.punteggio_totale || 0;
  document.getElementById('scoreNum').textContent = punti;
  document.getElementById('scoreFascia').textContent = d.fascia_finale ? labelFascia(d.fascia_finale) : 'Senza valutazione';

  // Stelle
  const stelle = d.voto_piacere_personale || 0;
  if (stelle > 0) {
    document.getElementById('starsBig').innerHTML =
      Array.from({length: 5}, (_, i) =>
        i < stelle ? '<span>★</span>' : '<span class="star-empty">★</span>'
      ).join('');
  } else {
    document.getElementById('starsBig').style.display = 'none';
  }

  // Contesto
  const ctx = [];
  if (d.luogo) ctx.push(attrRow('Luogo', d.luogo));
  if (d.occasione) ctx.push(attrRow('Occasione', cap(d.occasione)));
  if (d.commensali) ctx.push(attrRow('Con chi', d.commensali));
  if (d.abbinamento_cibo) ctx.push(attrRow('Abbinamento', d.abbinamento_cibo));
  if (d.temperatura_servizio) ctx.push(attrRow('Temperatura', d.temperatura_servizio + '°C'));
  if (d.tempo_apertura_min) ctx.push(attrRow('Apertura', d.tempo_apertura_min + ' min'));
  if (d.decanter) ctx.push(attrRow('Decanter', 'Sì'));
  if (ctx.length === 0) {
    document.getElementById('cardContext').style.display = 'none';
  } else {
    document.getElementById('bodyContext').innerHTML = ctx.join('');
  }

  // Visivo
  const vis = [];
  if (d.colore) vis.push(attrRow('Colore', cap(d.colore)));
  if (d.riflesso) vis.push(attrRow('Riflesso', labelize(d.riflesso)));
  if (d.limpidezza) vis.push(attrRow('Limpidezza', cap(d.limpidezza)));
  if (d.vivacita) vis.push(attrRow('Vivacità', cap(d.vivacita)));
  if (d.perlage_grana) vis.push(attrRow('Perlage', cap(d.perlage_grana)));
  document.getElementById('bodyVisivo').innerHTML = vis.join('') || emptyMsg();

  // Olfatto
  const olf = [];
  if (d.olfatto_descrittori && d.olfatto_descrittori.length) {
    const tags = d.olfatto_descrittori.map(v => `<span class="desc-tag">${labelize(v)}</span>`).join('');
    olf.push(`<div style="padding:8px 0 12px;border-bottom:1px solid var(--bordo)">
      <div style="font-size:13px;color:var(--testo-2);margin-bottom:6px">Famiglie</div>
      <div class="descrittori-list">${tags}</div>
    </div>`);
  }
  if (d.olfatto_sentori && d.olfatto_sentori.length) {
    const tags = d.olfatto_sentori.map(v => `<span class="desc-tag" style="background:var(--bordeaux);color:#fff;border-color:var(--bordeaux)">${esc(v)}</span>`).join('');
    olf.push(`<div style="padding:8px 0 12px;border-bottom:1px solid var(--bordo)">
      <div style="font-size:13px;color:var(--testo-2);margin-bottom:6px">Sentori specifici</div>
      <div class="descrittori-list">${tags}</div>
    </div>`);
  }
  if (d.olfatto_complessita_punti) olf.push(puntiRow('Complessità', d.olfatto_complessita_punti, d.olfatto_complessita_label));
  if (d.olfatto_qualita_punti) olf.push(puntiRow('Qualità olfattiva', d.olfatto_qualita_punti, d.olfatto_qualita_label));
  if (d.olfatto_note) olf.push(`<div style="padding:10px 0 0;border-top:1px solid var(--bordo);margin-top:8px">
    <div class="note-text">"${esc(d.olfatto_note)}"</div></div>`);
  document.getElementById('bodyOlfatto').innerHTML = olf.join('') || emptyMsg();

  // Gusto
  const gus = [];
  if (d.gusto_zucchero) gus.push(attrRow('Zucchero', labelize(d.gusto_zucchero)));
  if (d.gusto_alcol) gus.push(attrRow('Alcol', labelize(d.gusto_alcol)));
  if (d.gusto_acidita) gus.push(attrRow('Acidità', labelize(d.gusto_acidita)));
  if (d.gusto_tannino) gus.push(attrRow('Tannino', cap(d.gusto_tannino)));
  if (d.gusto_sapidita) gus.push(attrRow('Sapidità', labelize(d.gusto_sapidita)));
  if (d.gusto_chiusura) gus.push(attrRow('Chiusura', cap(d.gusto_chiusura)));
  if (d.gusto_equilibrio_punti) gus.push(puntiRow('Equilibrio', d.gusto_equilibrio_punti, d.gusto_equilibrio_label));
  if (d.gusto_persistenza_punti) gus.push(puntiRow('Persistenza', d.gusto_persistenza_punti, d.gusto_persistenza_label));
  if (d.gusto_qualita_punti) gus.push(puntiRow('Qualità gustativa', d.gusto_qualita_punti, d.gusto_qualita_label));
  if (d.gusto_dimensioni_punti) gus.push(puntiRow('Dimensioni', d.gusto_dimensioni_punti, d.gusto_dimensioni_label));
  document.getElementById('bodyGusto').innerHTML = gus.join('') || emptyMsg();

  // Conclusioni
  const con = [];
  if (d.prospettive_consumo) con.push(attrRow('Prospettive', labelize(d.prospettive_consumo)));
  if (d.ricomprerei !== null) con.push(attrRow('Ricomprerei', d.ricomprerei ? 'Sì' : 'No'));
  if (d.note_conclusive) con.push(`<div style="padding:10px 0 0;border-top:1px solid var(--bordo);margin-top:8px">
    <div class="note-text">"${esc(d.note_conclusive)}"</div></div>`);
  if (con.length === 0) {
    document.getElementById('cardConclusioni').style.display = 'none';
  } else {
    document.getElementById('bodyConclusioni').innerHTML = con.join('');
  }
}

// ============================================================
// FOTO: sorgenti, rendering, modifica
// ============================================================
function fotoFronteAttuale() {
  return (scheda.bottiglia && scheda.bottiglia.etichetta_url) || scheda.etichetta_url_esterna || null;
}
function fotoRetroAttuale() {
  return (scheda.bottiglia && scheda.bottiglia.controetichetta_url) || scheda.controetichetta_url_esterna || null;
}

function renderHero() {
  const hero = document.getElementById('heroPhoto');
  const editing = document.body.classList.contains('foto-editing');
  const fronte = fotoFronteAttuale();
  const retro = fotoRetroAttuale();
  const tip = (scheda.bottiglia && scheda.bottiglia.tipologia) || scheda.tipologia_esterna || '';
  const tipBadge = tip ? `<span class="badge tip-tag badge-${tip}">${cap(tip)}</span>` : '';

  if (editing) {
    hero.innerHTML = heroEditHtml();
  } else if (fronte || retro) {
    const photos = [];
    if (fronte) photos.push({ url: fronte, label: 'Fronte' });
    if (retro) photos.push({ url: retro, label: 'Retro' });
    const slides = photos.map((p, i) =>
      `<div class="hero-slide${i === 0 ? ' active' : ''}"><img src="${p.url}" alt="${p.label}" class="hero-zoomable" onclick="apriZoom('${p.url}')"></div>`
    );
    const dots = photos.length > 1 ? `
      <div class="hero-dots">
        <button class="hero-dot active" onclick="showSlide(0)" aria-label="Fronte"></button>
        <button class="hero-dot" onclick="showSlide(1)" aria-label="Retro"></button>
      </div>
      <div class="hero-side-tag" id="heroSideTag">Fronte</div>` : '';
    hero.innerHTML = `${slides.join('')}${dots}${tipBadge}`;
  } else {
    hero.innerHTML = `<i class="ti ti-camera no-photo" aria-hidden="true"></i>${tipBadge}`;
  }

  // Etichetta del pulsante in visualizzazione
  const lbl = document.getElementById('btnFotoEditLabel');
  if (lbl) lbl.textContent = (fronte || retro) ? 'Modifica foto' : 'Aggiungi foto';
}

function showSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const tag = document.getElementById('heroSideTag');
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  if (tag) tag.textContent = idx === 0 ? 'Fronte' : 'Retro';
}

function entraFotoEdit() {
  editFotoFronte = null; editFotoRetro = null;
  editRimuoviFronte = false; editRimuoviRetro = false;
  document.body.classList.add('foto-editing');
  document.getElementById('heroFotoView').style.display = 'none';
  document.getElementById('heroFotoEdit').style.display = 'flex';
  renderHero();
}

function annullaFotoEdit() {
  editFotoFronte = null; editFotoRetro = null;
  editRimuoviFronte = false; editRimuoviRetro = false;
  document.body.classList.remove('foto-editing');
  document.getElementById('heroFotoView').style.display = 'flex';
  document.getElementById('heroFotoEdit').style.display = 'none';
  renderHero();
}

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
  const salvata  = isFronte ? fotoFronteAttuale() : fotoRetroAttuale();
  const label    = isFronte ? 'Fronte' : 'Retro';
  const sub      = isFronte ? 'Etichetta principale' : 'Controetichetta';

  let src = null;
  if (file) src = URL.createObjectURL(file);
  else if (!rimossa && salvata) src = salvata;

  if (src) {
    return `<img src="${src}" class="hero-edit-img" alt="${label}">
      <button type="button" class="preview-remove" onclick="rimuoviFoto(event,'${lato}')" aria-label="Rimuovi foto">
        <i class="ti ti-x"></i>
      </button>`;
  }
  return `<i class="ti ti-camera upload-icon" aria-hidden="true"></i>
    <p style="font-size:13px">${label}</p>
    <small>${sub}</small>
    <input type="file" accept="image/*" onchange="handleFotoSelect(event,'${lato}')">`;
}

function handleFotoSelect(e, lato) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Foto troppo grande (max 5MB)', true); return; }
  if (lato === 'fronte') { editFotoFronte = file; editRimuoviFronte = false; }
  else                   { editFotoRetro  = file; editRimuoviRetro  = false; }
  document.getElementById(lato === 'fronte' ? 'heroSlotFronte' : 'heroSlotRetro').innerHTML = heroSlotInner(lato);
}

function rimuoviFoto(e, lato) {
  e.stopPropagation(); e.preventDefault();
  if (lato === 'fronte') { editFotoFronte = null; if (fotoFronteAttuale()) editRimuoviFronte = true; }
  else                   { editFotoRetro  = null; if (fotoRetroAttuale()) editRimuoviRetro = true; }
  document.getElementById(lato === 'fronte' ? 'heroSlotFronte' : 'heroSlotRetro').innerHTML = heroSlotInner(lato);
}

// Comprime/ridimensiona prima dell'upload (riduce tempi e peso)
async function comprimiImmagine(file, maxDim = 1920, quality = 0.85) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (_) {
    try { bitmap = await createImageBitmap(file); } catch (_) { return file; }
  }
  let { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  if (bitmap.close) bitmap.close();
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob || blob.size >= file.size) return file;
  console.log('[comprimi]', Math.round(file.size / 1024), 'KB →', Math.round(blob.size / 1024), 'KB');
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

async function uploadEtichetta(file, lato) {
  const out = await comprimiImmagine(file);
  const ext = (out.name.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${currentUser.id}/${Date.now()}_${lato}.${ext}`;
  const { error } = await sb.storage.from('etichette')
    .upload(fileName, out, { upsert: false, contentType: out.type });
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

async function salvaFoto() {
  const btn = document.getElementById('btnFotoSave');
  bloccaBtnFoto(btn);

  // Dove salvare: bottiglia collegata se esiste, altrimenti colonne _esterna
  const usaBottiglia = !!scheda.bottiglia_id;
  const campoFronte = usaBottiglia ? 'etichetta_url' : 'etichetta_url_esterna';
  const campoRetro  = usaBottiglia ? 'controetichetta_url' : 'controetichetta_url_esterna';
  const fronteAttuale = fotoFronteAttuale();
  const retroAttuale  = fotoRetroAttuale();

  const update = {};
  const daEliminare = [];
  try {
    if (editFotoFronte) {
      console.log('[salvaFoto] upload fronte…', editFotoFronte.size);
      update[campoFronte] = await uploadEtichetta(editFotoFronte, 'fronte');
      if (fronteAttuale) daEliminare.push(fronteAttuale);
    } else if (editRimuoviFronte) {
      if (fronteAttuale) daEliminare.push(fronteAttuale);
      update[campoFronte] = null;
    }
    if (editFotoRetro) {
      console.log('[salvaFoto] upload retro…', editFotoRetro.size);
      update[campoRetro] = await uploadEtichetta(editFotoRetro, 'retro');
      if (retroAttuale) daEliminare.push(retroAttuale);
    } else if (editRimuoviRetro) {
      if (retroAttuale) daEliminare.push(retroAttuale);
      update[campoRetro] = null;
    }
  } catch (e) {
    console.error('[salvaFoto] errore upload:', e);
    showToast('Errore upload foto: ' + (e.message || ''), true);
    sbloccaBtnFoto(btn);
    return;
  }

  if (Object.keys(update).length === 0) {
    annullaFotoEdit();
    sbloccaBtnFoto(btn);
    return;
  }

  const tabella  = usaBottiglia ? 'bottiglie' : 'degustazioni';
  const idTarget = usaBottiglia ? scheda.bottiglia_id : scheda.id;
  const { data, error } = await sb.from(tabella).update(update).eq('id', idTarget).select();

  if (error) {
    console.error('[salvaFoto] errore update:', error);
    showToast('Errore: ' + error.message, true);
    sbloccaBtnFoto(btn);
    return;
  }
  if (!data || data.length === 0) {
    console.error('[salvaFoto] update di 0 righe — probabile policy RLS');
    showToast('Salvataggio non riuscito: 0 righe aggiornate (permessi?)', true);
    sbloccaBtnFoto(btn);
    return;
  }

  for (const url of daEliminare) await eliminaDalloStorage(url);

  // Sincronizza lo stato in memoria
  if (usaBottiglia) {
    scheda.bottiglia = scheda.bottiglia || {};
    if (campoFronte in update) scheda.bottiglia.etichetta_url = update[campoFronte];
    if (campoRetro in update)  scheda.bottiglia.controetichetta_url = update[campoRetro];
  } else {
    if (campoFronte in update) scheda.etichetta_url_esterna = update[campoFronte];
    if (campoRetro in update)  scheda.controetichetta_url_esterna = update[campoRetro];
  }

  sbloccaBtnFoto(btn);
  annullaFotoEdit();
  showToast('Foto salvate');
}

function bloccaBtnFoto(btn) {
  if (!btn) return;
  btn.disabled = true;
  if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-loader"></i> Salvataggio…';
}
function sbloccaBtnFoto(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
}

// ============================================================
// VISORE FOTO CON ZOOM
// ============================================================
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
  const f = Math.min(zSW / iw, zSH / ih);
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
      zTx += mid.x - zLastMid.x;
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
        chiudiZoom();
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

// ============================================================
// HELPERS
// ============================================================
function attrRow(label, value) {
  return `<div class="attr-row">
    <span class="attr-label">${esc(label)}</span>
    <span class="attr-value">${esc(value)}</span>
  </div>`;
}

function puntiRow(label, punti, lbl) {
  const lblTxt = lbl ? labelize(lbl) : '';
  return `<div class="attr-row">
    <span class="attr-label">${esc(label)}</span>
    <span class="attr-value punti">
      <span class="num">${punti}</span>${esc(lblTxt)}
    </span>
  </div>`;
}

function emptyMsg() {
  return '<div style="font-size:13px;color:var(--testo-3);font-style:italic">Non compilato</div>';
}

function labelize(s) {
  if (!s) return '';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function labelFascia(f) {
  const map = {
    accettabile: 'Accettabile',
    buono: 'Buono',
    ottimo: 'Ottimo',
    eccellente: 'Eccellente',
    memorabile: 'Memorabile',
  };
  return map[f] || f;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
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

async function elimina() {
  if (!confirm('Eliminare questa scheda di degustazione?\n\nL\'azione non può essere annullata.')) return;
  const { error } = await sb.from('degustazioni').delete().eq('id', scheda.id);
  if (error) { showToast('Errore: ' + error.message, true); return; }
  showToast('Scheda eliminata');
  setTimeout(() => location.href = 'bevute.html', 1000);
}
