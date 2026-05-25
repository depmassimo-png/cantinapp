// ============================================================
// CantinApp — Mappa cantina (Leaflet + CartoDB Positron)
// ============================================================

let currentUser = null;
let bottiglie = [];
let mapInstance = null;
let gruppi = []; // [{ lat, lng, label, level, items: [bottiglia, ...] }]

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  await loadBottiglie();
  raggruppa();
  aggiornaInfo();
  initLeaflet();
  popolaListaAlternativa();
})();

async function loadBottiglie() {
  const { data, error } = await sb
    .from('bottiglie')
    .select('id, nome_vino, produttore, annata, tipologia, denominazione, nazione, regione, quantita, zona_vinicola')
    .eq('user_id', currentUser.id)
    .neq('stato', 'bevuta')   // mostro solo bottiglie attive in cantina
    .gt('quantita', 0);

  if (error) {
    console.error('Errore caricamento bottiglie:', error);
    return;
  }
  bottiglie = data || [];
  console.log('[mappa] bottiglie caricate:', bottiglie.length);
}

function raggruppa() {
  // Raggruppa per (lat, lng) approssimate per evitare cerchi sovrapposti
  const map = new Map();

  for (const b of bottiglie) {
    const coord = trovaCoordinate(b);
    if (!coord || (coord.lat === 0 && coord.lng === 0)) continue;
    const key = `${coord.lat.toFixed(3)}_${coord.lng.toFixed(3)}_${coord.label}`;
    if (!map.has(key)) {
      map.set(key, { ...coord, items: [], count: 0 });
    }
    const g = map.get(key);
    g.items.push(b);
    g.count += (b.quantita || 1);
  }

  gruppi = Array.from(map.values());
  gruppi.sort((a, b) => b.count - a.count);
  console.log('[mappa] gruppi creati:', gruppi.length);
}

function aggiornaInfo() {
  const totBott = bottiglie.reduce((s, b) => s + (b.quantita || 1), 0);
  document.getElementById('totaleBottiglie').textContent = totBott;
  const numNazioni = new Set(bottiglie.map(b => b.nazione || 'Italia')).size;
  const sub = `${gruppi.length} ${gruppi.length === 1 ? 'zona' : 'zone'} · ${numNazioni} ${numNazioni === 1 ? 'paese' : 'paesi'}`;
  document.getElementById('totaleZone').textContent = sub;
}

function initLeaflet() {
  if (!window.L) {
    console.error('Leaflet non caricato');
    document.querySelector('.loading-mappa').textContent = 'Errore caricamento mappa';
    return;
  }

  // Centra inizialmente sul mondo, con bias sull'Europa
  // Se ci sono bottiglie, fa fit ai gruppi alla fine
  mapInstance = L.map('map', {
    center: [30, 10],
    zoom: 2,
    minZoom: 1,
    zoomControl: true,
    attributionControl: true,
    worldCopyJump: false,
    // Limita lo scroll ai confini reali del mondo (no ripetizione orizzontale)
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1.0,
  });

  // Tile CartoDB Positron: chiaro, neutro, professionale, GRATIS no API key
  // noWrap: true → non ripete il mondo orizzontalmente
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 1,
    noWrap: true,
    bounds: [[-85, -180], [85, 180]],
  }).addTo(mapInstance);

  // Aggiungi cerchi
  const bounds = [];
  for (const g of gruppi) {
    const radius = calcolaRaggio(g.count);
    const fontSize = g.count >= 100 ? 14 : (g.count >= 10 ? 13 : 12);
    const icon = L.divIcon({
      className: '',
      html: `<div class="docg-marker" style="width:${radius * 2}px;height:${radius * 2}px;font-size:${fontSize}px">${g.count}</div>`,
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius],
    });

    const marker = L.marker([g.lat, g.lng], { icon }).addTo(mapInstance);
    marker.bindPopup(buildPopupHtml(g), { maxWidth: 280 });
    bounds.push([g.lat, g.lng]);
  }

  // Se ci sono almeno 2 punti, zoom per includerli tutti
  if (bounds.length >= 2) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  } else if (bounds.length === 1) {
    mapInstance.setView(bounds[0], 5);
  }

  // Rimuovi loading text
  const loading = document.querySelector('.loading-mappa');
  if (loading) loading.remove();
}

function calcolaRaggio(count) {
  // Raggio in pixel: cresce con sqrt per evitare cerchi enormi
  if (count <= 0) return 14;
  const min = 16, max = 38;
  const r = 14 + Math.sqrt(count) * 5;
  return Math.min(max, Math.max(min, r));
}

function buildPopupHtml(g) {
  const tipoLabel = g.level === 'zona' ? 'Zona vinicola' : (g.level === 'regione' ? 'Regione' : 'Paese');
  let html = `<div class="popup-title">${esc(g.label)}</div>`;
  html += `<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:8px">${tipoLabel} · ${g.count} ${g.count === 1 ? 'bottiglia' : 'bottiglie'}</div>`;

  // Mostro fino a 5 bottiglie, poi "+ N altre"
  const showLimit = 5;
  const items = g.items.slice(0, showLimit);
  for (const b of items) {
    const annoStr = b.annata ? `<span class="anno">${b.annata}</span>` : '';
    html += `<div class="popup-row">
      <a href="bottiglia.html?id=${b.id}" style="color:var(--avorio);text-decoration:none;flex:1">${esc(b.nome_vino)}</a>
      ${annoStr}
    </div>`;
  }
  if (g.items.length > showLimit) {
    const rest = g.items.length - showLimit;
    html += `<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;font-style:italic">+ ${rest} altre</div>`;
  }
  return html;
}

function popolaListaAlternativa() {
  const cont = document.getElementById('lista');
  if (gruppi.length === 0) {
    cont.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5)">Nessuna bottiglia in cantina</div>';
    return;
  }

  let html = '';
  gruppi.forEach((g, idx) => {
    const tipoLabel = g.level === 'zona' ? 'Zona' : (g.level === 'regione' ? 'Regione' : 'Paese');
    html += `<div class="lista-item">
      <div class="ranking">${idx + 1}</div>
      <div style="flex:1">
        <div class="nome">${esc(g.label)}</div>
        <div class="sub">${tipoLabel}</div>
      </div>
      <div class="count">${g.count}</div>
    </div>`;
  });
  cont.innerHTML = html;
}

function cambiaVista(vista) {
  const btnM = document.getElementById('btnMappa');
  const btnL = document.getElementById('btnLista');
  const map = document.getElementById('map');
  const lista = document.getElementById('lista');

  if (vista === 'mappa') {
    btnM.classList.add('active');
    btnL.classList.remove('active');
    map.classList.remove('hide');
    lista.classList.remove('show');
    // Leaflet ha bisogno di sapere che è di nuovo visibile per ridisegnare
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 50);
  } else {
    btnL.classList.add('active');
    btnM.classList.remove('active');
    map.classList.add('hide');
    lista.classList.add('show');
  }
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
