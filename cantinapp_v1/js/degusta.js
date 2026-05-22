// ============================================================
// CantinApp — Wizard degustazione Assosommelier
// ============================================================

let currentUser = null;
let bottigliaCorrente = null;
let stepAttuale = 1;
const TOT_STEP = 5;

// Stato della degustazione
const D = {
  // intestazione
  bottiglia_id: null,
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
  limpidezza: null,
  vivacita: null,
  perlage_grana: null,
  // olfatto
  olfatto_descrittori: [],
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

      // Nascondi tannino per non-rossi e mostra perlage per spumanti
      if (data.tipologia !== 'rosso') {
        document.getElementById('boxTannino').style.display = 'none';
      }
      if (data.tipologia === 'spumante') {
        document.getElementById('boxPerlage').style.display = 'block';
      }
    }
  } else {
    document.getElementById('wineId').textContent = 'Degustazione libera';
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

  renderStep();
})();

// ==== SETUP CHIP (selezione singola) ====
function setupChips() {
  const config = [
    ['chipsOccasione', 'occasione'],
    ['chipsDecanter', 'decanter', v => v === 'true'],
    ['chipsColore', 'colore'],
    ['chipsRiflesso', 'riflesso'],
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
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
        chip.classList.add('sel');
        const v = chip.dataset.v;
        D[field] = transform ? transform(v) : v;
      });
    });
  }

  // Descrittori olfattivi (multi)
  document.querySelectorAll('#descGrid .desc-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('sel');
      D.olfatto_descrittori = Array.from(document.querySelectorAll('#descGrid .desc-chip.sel'))
        .map(c => c.dataset.v);
    });
  });

  // Input testuali e textarea
  bindInput('luogo');
  bindInput('commensali');
  bindInput('abbinamento');
  bindInput('tempoApertura', 'tempo_apertura_min', v => v ? parseInt(v) : null);
  bindInput('olfattoNote');
  bindInput('noteConclusive');

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

  // Scroll in alto
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function stepAvanti() {
  if (stepAttuale < TOT_STEP) {
    stepAttuale++;
    renderStep();
  }
}

function stepIndietro() {
  if (stepAttuale > 1) {
    stepAttuale--;
    renderStep();
  }
}

function annullaDegustazione() {
  if (confirm('Vuoi davvero annullare la degustazione?\n\nI dati inseriti andranno persi.')) {
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
  if (punti < 18) return 'accettabile';
  if (punti < 22) return 'buono';
  if (punti < 24) return 'ottimo';
  if (punti < 27) return 'eccellente';
  return 'avvincente';
}

function labelFascia(f) {
  const map = {
    accettabile: 'Accettabile',
    buono: 'Buono',
    ottimo: 'Ottimo',
    eccellente: 'Eccellente',
    avvincente: 'Avvincente',
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
  if (D.olfatto_descrittori.length) parts.push(`<span class="lbl">Olfatto:</span> ${D.olfatto_descrittori.join(', ')}`);
  if (D.gusto_zucchero) parts.push(`<span class="lbl">Bocca:</span> ${D.gusto_zucchero}${D.gusto_acidita ? ', ' + D.gusto_acidita : ''}`);
  document.getElementById('summaryBox').innerHTML = parts.join(' · ') || 'Riepilogo non disponibile';
}

// ==== SALVATAGGIO ====
async function salvaDegustazione() {
  const punti = calcolaPunteggio();
  const fascia = calcolaFascia(punti);

  const payload = {
    user_id: currentUser.id,
    bottiglia_id: D.bottiglia_id,
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
    limpidezza: D.limpidezza,
    vivacita: D.vivacita,
    perlage_grana: D.perlage_grana,
    olfatto_descrittori: D.olfatto_descrittori.length ? D.olfatto_descrittori : null,
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
  setTimeout(() => {
    if (bottigliaCorrente) {
      location.href = 'bottiglia.html?id=' + bottigliaCorrente.id;
    } else {
      location.href = 'cantina.html';
    }
  }, 1200);
}
