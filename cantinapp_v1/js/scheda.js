// ============================================================
// CantinApp — Dettaglio scheda degustazione
// ============================================================

let scheda = null;
let currentUser = null;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

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
    .select(`*, bottiglia:bottiglie(nome_vino, produttore, annata, tipologia)`)
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

  // Hero
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
        i < stelle ? '<span>★</span>' : '<span class="empty">★</span>'
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
    avvincente: 'Avvincente',
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
