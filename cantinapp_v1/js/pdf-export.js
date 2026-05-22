// ============================================================
// CantinApp — Export PDF scheda Assosommelier
// Replica fedele del layout ufficiale
// ============================================================

async function esportaPDF() {
  if (!scheda) { showToast('Scheda non caricata', true); return; }
  showToast('Genero il PDF...');

  // Carica jsPDF dinamicamente se non già presente
  if (typeof window.jspdf === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const d = scheda;
  const W = 210;   // A4 width mm
  const M = 12;    // margin
  const CW = W - M*2;  // content width

  // ===== COLORI =====
  const C = {
    blu: [27, 42, 74],
    rosso: [192, 57, 43],
    verde: [39, 174, 96],
    bluS: [46, 95, 163],
    grigio: [120, 120, 120],
    nero: [40, 40, 40],
    chiaro: [240, 240, 240],
    sel: [27, 42, 74],
    selText: [255, 255, 255],
  };

  let y = M;

  // ===== HEADER =====
  doc.setFillColor(...C.blu);
  doc.rect(M, y, CW, 12, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SCHEDA DI DEGUSTAZIONE', M + 3, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assosommelier', W - M - 3, y + 8, { align: 'right' });
  y += 16;

  // ===== INTESTAZIONE =====
  doc.setTextColor(...C.nero);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || '—';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '—';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';

  // Riga 1: Luogo + Data
  doc.text('Luogo', M, y);
  drawLine(doc, M + 12, y + 1, M + 95, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(d.luogo || '', M + 14, y - 0.5);
  doc.setFont('helvetica', 'normal');

  doc.text('Data', M + 100, y);
  drawLine(doc, M + 110, y + 1, W - M, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDateIT(d.data_degustazione), M + 112, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 5;

  // Riga 2: Vino + Annata
  doc.text('Vino', M, y);
  drawLine(doc, M + 12, y + 1, M + 95, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(`${nome}${prod !== '—' ? ' · ' + prod : ''}`, M + 14, y - 0.5);
  doc.setFont('helvetica', 'normal');

  doc.text('Annata', M + 100, y);
  drawLine(doc, M + 114, y + 1, W - M, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(String(annata), M + 116, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // ===== SEZIONE COLORE =====
  sectionHeader(doc, M, y, CW, 'COLORE', C.rosso);
  y += 6;
  const coloriOpts = ['Paglierino','Dorato','Aranciato','Cerasuolo','Ramato','Porpora','Rubino','Granato'];
  y = drawCheckRow(doc, M, y, CW, coloriOpts, d.colore);
  y += 1;

  sectionHeader(doc, M, y, CW, 'RIFLESSO', C.rosso);
  y += 6;
  const riflessoOpts = ['Non rilevato','Verdolino','Dorato','Aranciato','Porpora','Granato'];
  y = drawCheckRow(doc, M, y, CW, riflessoOpts, d.riflesso, mapValue);
  y += 1;

  // Tripla: densità + limpidezza + vivacità + perlage
  const blockW = CW / 4;
  const yStart = y;
  doc.setFontSize(7);
  doc.setTextColor(...C.rosso);
  doc.setFont('helvetica', 'bold');
  doc.text('DENSITÀ CROMATICA', M + 1, y + 2);
  doc.text('LIMPIDEZZA', M + blockW + 1, y + 2);
  doc.text('VIVACITÀ', M + blockW*2 + 1, y + 2);
  doc.text('PERLAGE / BOLLICINE', M + blockW*3 + 1, y + 2);
  // Sottolineatura
  doc.setDrawColor(...C.rosso);
  doc.setLineWidth(0.4);
  doc.line(M, y + 3, W - M, y + 3);
  y += 6;

  drawSmallChecks(doc, M, y, ['Trasparente','Compatto'], d.densita_cromatica);
  drawSmallChecks(doc, M + blockW, y, ['Opaco','Limpido'], d.limpidezza);
  drawSmallChecks(doc, M + blockW*2, y, ['Cupo','Vivace','Luminoso'], d.vivacita);
  drawSmallChecks(doc, M + blockW*3, y, ['Grandi','Fini'], d.perlage_grana);
  y += 8;

  // ===== SEZIONE OLFATTO =====
  sectionHeader(doc, M, y, CW, 'OLFATTO', C.verde);
  y += 6;
  const olfattoOpts = ['Fruttato','Floreale','Vegetale','Minerale','Erbe aromatiche','Speziato','Tostato','Balsamico','Etereo'];
  const olfattoMap = ['fruttato','floreale','vegetale','minerale','erbe_aromatiche','speziato','tostato','balsamico','etereo'];
  const olfattoSel = d.olfatto_descrittori || [];
  y = drawCheckRowMulti(doc, M, y, CW, olfattoOpts, olfattoMap, olfattoSel);

  // Note
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'normal');
  doc.text('Note', M, y + 3);
  drawLine(doc, M + 10, y + 4, W - M, y + 4);
  doc.setFont('helvetica', 'italic');
  doc.text(d.olfatto_note || '', M + 12, y + 2.5);
  doc.setFont('helvetica', 'normal');
  y += 7;

  // Complessità + Qualità olfattiva (con punti)
  y = drawScale(doc, M, y, CW, 'COMPLESSITÀ',
    [[12,'Facile'],[13,''],[14,'Complesso'],[15,'Più che complesso'],[16,'Ampio']],
    d.olfatto_complessita_punti, C.verde);
  y += 1;

  y = drawScale(doc, M, y, CW, 'QUALITÀ',
    [[14,'Accettabile'],[15,''],[16,'Fine'],[17,''],[18,'Più che fine'],[19,''],[20,'Eccellente']],
    d.olfatto_qualita_punti, C.verde);
  y += 3;

  // ===== SEZIONE GUSTO =====
  sectionHeader(doc, M, y, CW, 'GUSTO', C.bluS);
  y += 5;

  // Box zucchero / alcol / acidità / tannino (4 colonne)
  const gW = CW / 4;
  // Header colorato di ogni box
  doc.setFillColor(...C.chiaro);
  doc.rect(M, y, gW - 1, 4, 'F');
  doc.rect(M + gW, y, gW - 1, 4, 'F');
  doc.rect(M + gW*2, y, gW - 1, 4, 'F');
  doc.rect(M + gW*3, y, gW - 1, 4, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.nero);
  doc.text('ZUCCHERO', M + gW/2, y + 2.8, { align: 'center' });
  doc.text('ALCOL (percepita)', M + gW + gW/2, y + 2.8, { align: 'center' });
  doc.text('ACIDITÀ (percepita)', M + gW*2 + gW/2, y + 2.8, { align: 'center' });
  doc.text('TANNINO', M + gW*3 + gW/2, y + 2.8, { align: 'center' });
  y += 5;

  drawColumnChecks(doc, M, y, gW, ['Secco','Tendente al dolce','Dolce','Molto dolce'], d.gusto_zucchero);
  drawColumnChecks(doc, M + gW, y, gW, ['Contenuto','Caldo','Più che Caldo','Molto Caldo'], d.gusto_alcol);
  drawColumnChecks(doc, M + gW*2, y, gW, ['Contenuto','Fresco','Più che Fresco','Molto Fresco'], d.gusto_acidita);
  drawColumnChecks(doc, M + gW*3, y, gW, ['Amaro','Vegetale','Maturo','Raffinato'], d.gusto_tannino);
  y += 16;

  // Equilibrio + Persistenza scales
  y = drawScale(doc, M, y, CW, 'EQUILIBRIO',
    [[14,'Squilibrato'],[15,'In fase di equilibrio'],[16,''],[17,'Bilanciato'],[18,'Equilibrato']],
    d.gusto_equilibrio_punti, C.bluS);
  y += 1;

  y = drawScale(doc, M, y, CW, 'PERSISTENZA',
    [[12,'Accettabile'],[13,'Persistente'],[14,''],[15,'Più che persistente'],[16,'Lungo']],
    d.gusto_persistenza_punti, C.bluS);
  y += 1;

  // Sapidità + Chiusura
  const halfW = CW / 2;
  doc.setFontSize(7);
  doc.setTextColor(...C.bluS);
  doc.setFont('helvetica', 'bold');
  doc.text('SAPIDITÀ PERCEPITA', M, y + 2);
  doc.text('CHIUSURA DI BOCCA', M + halfW, y + 2);
  doc.setDrawColor(...C.bluS);
  doc.line(M, y + 3, W - M, y + 3);
  y += 6;
  drawSmallChecksHoriz(doc, M, y, halfW, ['Non avvertibile','Contenuta','Sapida','Più che sapida'], d.gusto_sapidita);
  drawSmallChecksHoriz(doc, M + halfW, y, halfW, ['Imprecisa','Buona','Precisa','Elegante'], d.gusto_chiusura);
  y += 5;

  // Qualità gustativa
  y = drawScale(doc, M, y, CW, 'QUALITÀ GUSTATIVA',
    [[20,'Accettabile'],[21,'Fine'],[22,''],[23,'Più che fine'],[24,'Eccellente']],
    d.gusto_qualita_punti, C.bluS);
  y += 1;

  // Dimensioni
  y = drawScale(doc, M, y, CW, 'DIMENSIONI',
    [[null,'Strutturato'],[null,'Sottile'],[5,'Delicato'],[6,'Suggestivo']],
    d.gusto_dimensioni_punti, C.bluS, true);
  y += 2;

  // Prospettive di consumo
  doc.setFontSize(7);
  doc.setTextColor(...C.bluS);
  doc.setFont('helvetica', 'bold');
  doc.text('PROSPETTIVE DI CONSUMO', M, y + 2);
  doc.line(M, y + 3, W - M, y + 3);
  y += 6;
  const prosOpts = ['Da bere subito','Brevi prospettive','Medie prospettive','Lunghe prospettive'];
  const prosMap = ['da_bere_subito','brevi_prospettive','medie_prospettive','lunghe_prospettive'];
  drawCheckRowMulti(doc, M, y, CW, prosOpts, prosMap, d.prospettive_consumo ? [d.prospettive_consumo] : []);
  y += 6;

  // Conclusioni - fasce di totale
  doc.setFontSize(7);
  doc.setTextColor(...C.bluS);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCLUSIONI', M, y + 2);
  doc.line(M, y + 3, W - M, y + 3);
  y += 5;

  const punteggio = d.punteggio_totale || 0;
  const fasce = [
    ['Accettabile', '12/17', 12, 17],
    ['Buono', '18/21', 18, 21],
    ['Ottimo', '22/23', 22, 23],
    ['Eccellente', '24/26', 24, 26],
    ['Avvincente', '27/100', 27, 100],
  ];
  const fascW = CW * 0.7 / 5;
  for (let i = 0; i < 5; i++) {
    const [lbl, range, min, max] = fasce[i];
    const isSel = punteggio >= min && punteggio <= max;
    if (isSel) {
      doc.setFillColor(...C.bluS);
      doc.setTextColor(255);
    } else {
      doc.setFillColor(...C.chiaro);
      doc.setTextColor(...C.nero);
    }
    doc.rect(M + i * fascW, y, fascW - 1, 5, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${lbl} ${range}`, M + i * fascW + (fascW - 1)/2, y + 3.3, { align: 'center' });
  }

  // Totale
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'normal');
  doc.text('Totale', M + CW * 0.72, y + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(String(punteggio), M + CW * 0.82, y + 3.5);
  doc.setFontSize(8);
  doc.text('/ 100', M + CW * 0.9, y + 3);
  y += 10;

  // Note conclusive (se presenti)
  if (d.note_conclusive) {
    doc.setFontSize(8);
    doc.setTextColor(...C.bluS);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTE CONCLUSIVE', M, y);
    doc.setTextColor(...C.nero);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const wrap = doc.splitTextToSize('"' + d.note_conclusive + '"', CW);
    doc.text(wrap, M, y + 4);
    y += 4 + wrap.length * 3.5;
  }

  // Footer
  doc.setFontSize(6);
  doc.setTextColor(...C.grigio);
  doc.setFont('helvetica', 'italic');
  doc.text('Generato da CantinApp · ' + formatDateIT(new Date().toISOString().split('T')[0]),
    W/2, 290, { align: 'center' });

  // Salva
  const filename = `degustazione_${nome.replace(/[^a-zA-Z0-9]/g,'_')}_${d.data_degustazione || 'data'}.pdf`;
  doc.save(filename);
}

// ===== HELPERS DI DISEGNO =====

function sectionHeader(doc, x, y, w, label, color) {
  doc.setFontSize(8);
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x, y + 2.5);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.line(x, y + 4, x + w, y + 4);
}

function drawLine(doc, x1, y1, x2, y2) {
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.line(x1, y1, x2, y2);
}

// Riga di checkbox in linea (selezione singola)
function drawCheckRow(doc, x, y, w, opts, selected, mapper) {
  const cw = w / opts.length;
  for (let i = 0; i < opts.length; i++) {
    const opt = opts[i];
    const optKey = mapper ? mapper(opt) : opt.toLowerCase().replace(/ /g, '_');
    const isSel = selected && (
      selected.toLowerCase() === opt.toLowerCase() ||
      selected.toLowerCase() === optKey.toLowerCase() ||
      selected === optKey
    );
    drawCheck(doc, x + i * cw + 1, y, isSel);
    doc.setFontSize(7);
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opt, x + i * cw + 4.5, y + 2.5);
  }
  return y + 4;
}

// Riga di checkbox multipla
function drawCheckRowMulti(doc, x, y, w, opts, keys, selectedArr) {
  const cw = w / opts.length;
  selectedArr = selectedArr || [];
  for (let i = 0; i < opts.length; i++) {
    const isSel = selectedArr.includes(keys[i]);
    drawCheck(doc, x + i * cw + 1, y, isSel);
    doc.setFontSize(7);
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opts[i], x + i * cw + 4.5, y + 2.5);
  }
  return y + 4;
}

// Checkbox piccoli su colonna verticale
function drawColumnChecks(doc, x, y, w, opts, selected) {
  for (let i = 0; i < opts.length; i++) {
    const optKey = opts[i].toLowerCase().replace(/ /g, '_').replace('à','a').replace('è','e');
    const isSel = selected && (
      selected.toLowerCase() === opts[i].toLowerCase() ||
      selected === optKey ||
      norm(selected) === norm(opts[i])
    );
    drawCheck(doc, x + 1, y + i * 3.8, isSel);
    doc.setFontSize(7);
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opts[i], x + 4.5, y + i * 3.8 + 2.5);
  }
}

// Checkbox piccoli orizzontali in un blocco
function drawSmallChecks(doc, x, y, opts, selected) {
  let curY = y;
  for (let i = 0; i < opts.length; i++) {
    const isSel = selected && norm(selected) === norm(opts[i]);
    drawCheck(doc, x + 1, curY, isSel);
    doc.setFontSize(7);
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opts[i], x + 4.5, curY + 2.5);
    curY += 3.5;
  }
}

function drawSmallChecksHoriz(doc, x, y, w, opts, selected) {
  const cw = w / opts.length;
  for (let i = 0; i < opts.length; i++) {
    const isSel = selected && norm(selected) === norm(opts[i]);
    drawCheck(doc, x + i * cw + 1, y, isSel);
    doc.setFontSize(7);
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opts[i], x + i * cw + 4.5, y + 2.5);
  }
}

function drawCheck(doc, x, y, filled) {
  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  if (filled) {
    doc.setFillColor(27, 42, 74);
    doc.rect(x, y, 2.8, 2.8, 'FD');
    doc.setDrawColor(255);
    doc.setLineWidth(0.5);
    doc.line(x + 0.6, y + 1.5, x + 1.2, y + 2.2);
    doc.line(x + 1.2, y + 2.2, x + 2.3, y + 0.7);
  } else {
    doc.rect(x, y, 2.8, 2.8);
  }
}

// Scala numerica con punti evidenziati
function drawScale(doc, x, y, w, label, items, selectedPunti, color, smallNums) {
  doc.setFontSize(7);
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x, y + 2);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.4);
  doc.line(x, y + 3, x + w, y + 3);
  y += 4;

  // Labels sopra
  const sw = (w - 25) / items.length;
  doc.setFontSize(6.5);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'normal');
  for (let i = 0; i < items.length; i++) {
    const [num, lbl] = items[i];
    if (lbl) {
      doc.text(lbl, x + i * sw + sw/2, y + 2, { align: 'center' });
    }
  }
  y += 3;

  // Quadrati numeri
  for (let i = 0; i < items.length; i++) {
    const [num, lbl] = items[i];
    if (num === null) continue;
    const isSel = num === selectedPunti;
    const cx = x + i * sw + sw/2 - 3;
    if (isSel) {
      doc.setFillColor(...color);
      doc.rect(cx, y, 6, 4, 'F');
      doc.setTextColor(255);
    } else {
      doc.setFillColor(220, 235, 220);
      if (color[0] === 39) doc.setFillColor(220, 240, 220);
      else if (color[0] === 192) doc.setFillColor(245, 220, 215);
      else doc.setFillColor(220, 230, 245);
      doc.rect(cx, y, 6, 4, 'F');
      doc.setTextColor(80);
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(String(num), cx + 3, y + 2.8, { align: 'center' });
  }

  // Etichetta "Punti" e valore a destra
  doc.setTextColor(40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Punti', x + w - 18, y + 2.8);
  doc.setFont('helvetica', 'bold');
  doc.text(selectedPunti ? String(selectedPunti) : '___', x + w - 6, y + 2.8);

  return y + 5;
}

function mapValue(opt) {
  return opt.toLowerCase().replace(/ /g, '_');
}

function norm(s) {
  return String(s).toLowerCase()
    .replace(/_/g, ' ')
    .replace(/à/g, 'a')
    .replace(/è/g, 'e').replace(/é/g, 'e')
    .replace(/ò/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/ì/g, 'i')
    .trim();
}

function formatDateIT(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
