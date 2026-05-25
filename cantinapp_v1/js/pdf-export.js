// ============================================================
// CantinApp — Export PDF scheda Assosommelier (v2)
// Layout migliorato: checkbox più grandi, X nette, allineamenti
// precisi, nessuna sovrapposizione di testi
// ============================================================

async function esportaPDF() {
  if (!scheda) { showToast('Scheda non caricata', true); return; }
  showToast('Genero il PDF...');

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
  const W = 210;
  const H = 297;
  const M = 12;
  const CW = W - M*2;

  const BOX = 3.5;
  const SCALE_H = 6;
  const ROW_H = 5.5;

  const C = {
    headerDark: [42, 56, 86],
    rosso: [196, 86, 50],
    verde: [127, 161, 76],
    bluS: [70, 105, 145],
    bluDark: [42, 56, 86],
    verdeChiaro: [200, 215, 165],
    verdeMedio: [165, 185, 110],
    verdeScuro: [127, 161, 76],
    bluChiaro: [185, 200, 220],
    bluMedio: [125, 150, 185],
    bluScuro: [70, 105, 145],
    rossoChiaro: [240, 200, 185],
    grigio: [120, 120, 120],
    grigioChiaro: [220, 220, 220],
    grigioMolto: [240, 240, 240],
    nero: [40, 40, 40],
    bordo: [180, 180, 180],
  };

  function checkBox(x, y, sel, fillColor) {
    fillColor = fillColor || C.grigioChiaro;
    if (sel) {
      doc.setFillColor(...fillColor);
      doc.setDrawColor(...C.nero);
      doc.setLineWidth(0.4);
      doc.rect(x, y, BOX, BOX, 'FD');
      doc.setDrawColor(...C.nero);
      doc.setLineWidth(0.9);
      const pad = 0.6;
      doc.line(x + pad, y + pad, x + BOX - pad, y + BOX - pad);
      doc.line(x + BOX - pad, y + pad, x + pad, y + BOX - pad);
      doc.setLineWidth(0.2);
    } else {
      doc.setFillColor(255);
      doc.setDrawColor(...C.bordo);
      doc.setLineWidth(0.3);
      doc.rect(x, y, BOX, BOX, 'FD');
    }
  }

  function checkboxRow(x, y, options, selected, color, totalWidth) {
    const cw = totalWidth / options.length;
    doc.setFontSize(7.5);
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optKey = typeof opt === 'string' ? opt : opt.key;
      const optLabel = typeof opt === 'string' ? opt : opt.label;
      const isSel = matchOption(selected, optKey);
      const cx = x + i * cw;
      checkBox(cx, y, isSel, color);
      doc.setTextColor(...C.nero);
      doc.setFont('helvetica', isSel ? 'bold' : 'normal');
      const maxLblWidth = cw - BOX - 1.5;
      let lblToDraw = optLabel;
      while (doc.getTextWidth(lblToDraw) > maxLblWidth && lblToDraw.length > 3) {
        lblToDraw = lblToDraw.slice(0, -1);
      }
      if (lblToDraw !== optLabel) lblToDraw = lblToDraw.slice(0, -1) + '…';
      doc.text(lblToDraw, cx + BOX + 1.2, y + BOX - 0.8);
    }
  }

  function matchOption(selected, opt) {
    if (!selected) return false;
    return normalizeKey(selected) === normalizeKey(opt);
  }

  function isInArray(arr, opt) {
    if (!arr || !arr.length) return false;
    const o = normalizeKey(opt);
    return arr.some(s => normalizeKey(s) === o);
  }

  function scalaNumerica(x, y, numeri, selectedPunti, palette, totalWidth, labelGroups) {
    const sw = totalWidth / numeri.length;

    if (labelGroups) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.nero);
      let acc = 0;
      for (const g of labelGroups) {
        const groupCenterX = x + (acc + g.count / 2) * sw;
        let lbl = g.label;
        const maxW = g.count * sw - 1;
        while (doc.getTextWidth(lbl) > maxW && lbl.length > 3) lbl = lbl.slice(0, -1);
        if (lbl !== g.label) lbl = lbl.slice(0, -1) + '…';
        doc.text(lbl, groupCenterX - doc.getTextWidth(lbl) / 2, y);
        acc += g.count;
      }
      y += 1.5;
    }

    const boxY = y + 0.5;
    for (let i = 0; i < numeri.length; i++) {
      const num = numeri[i];
      const cx = x + i * sw;
      const isSel = num === selectedPunti;
      const colorIdx = Math.min(palette.length - 1, i);
      const col = isSel ? palette[palette.length - 1] : palette[colorIdx];
      doc.setFillColor(...col);
      doc.rect(cx + 0.3, boxY, sw - 0.6, SCALE_H, 'F');

      if (isSel) {
        doc.setDrawColor(...C.nero);
        doc.setLineWidth(1.2);
        doc.rect(cx + 0.3, boxY, sw - 0.6, SCALE_H);
        // X bianca CENTRATA con dimensione fissa (non deformata dalla larghezza del box)
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1.2);
        const xSize = 2.0; // semi-lato della X (fissa)
        const xcx = cx + sw / 2;
        const xcy = boxY + SCALE_H / 2;
        doc.line(xcx - xSize, xcy - xSize, xcx + xSize, xcy + xSize);
        doc.line(xcx + xSize, xcy - xSize, xcx - xSize, xcy + xSize);
        doc.setLineWidth(0.2);
      }
      doc.setTextColor(255);
      doc.setFont('helvetica', isSel ? 'bold' : 'normal');
      doc.setFontSize(9);
      const nt = String(num);
      const nw = doc.getTextWidth(nt);
      doc.text(nt, cx + sw / 2 - nw / 2, boxY + SCALE_H / 2 + 1.2);
    }
    return boxY + SCALE_H;
  }

  // Larghezza riservata alla colonna "Punti" sulla destra
  const PUNTI_W = 22;
  const SCALE_W = CW - PUNTI_W - 2;  // -2 per separatore visivo

  // Disegna il box "Punti" verticale a destra di una scala numerica
  // Va chiamato DOPO aver disegnato la scala, allineato alla stessa y
  function boxPuntiVerticale(valore, yTop, hScala) {
    const xCol = M + CW - PUNTI_W;
    // Sfondo grigio chiaro
    doc.setFillColor(...C.grigioMolto);
    doc.setDrawColor(...C.bordo);
    doc.setLineWidth(0.3);
    doc.rect(xCol, yTop, PUNTI_W, hScala, 'FD');
    // Etichetta "Punti" in alto, valore grande in basso
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.grigio);
    doc.text('PUNTI', xCol + PUNTI_W / 2, yTop + 2.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.headerDark);
    const v = valore != null ? String(valore) : '—';
    doc.text(v, xCol + PUNTI_W / 2, yTop + hScala - 1.5, { align: 'center' });
  }

  function drawColumnChecks(x, y, w, opts, selected, color) {
    doc.setFontSize(7.5);
    for (let i = 0; i < opts.length; i++) {
      const optKey = normalizeKey(opts[i]);
      const isSel = selected && (normalizeKey(selected) === optKey);
      const rowY = y + i * (BOX + 1.5);
      checkBox(x + 1.5, rowY, isSel, color);
      doc.setTextColor(...C.nero);
      doc.setFont('helvetica', isSel ? 'bold' : 'normal');
      doc.text(opts[i], x + 1.5 + BOX + 1.2, rowY + BOX - 0.8);
    }
  }

  // ============================================================
  // INIZIO DOCUMENTO
  // ============================================================
  let y = M;

  doc.setFillColor(...C.headerDark);
  doc.rect(M, y, CW, 11, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SCHEDA DI DEGUSTAZIONE', M + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Assosommelier', W - M - 4, y + 7, { align: 'right' });
  y += 15;

  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || '';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';
  const grado = d.bottiglia?.gradazione || '';

  doc.setTextColor(...C.nero);
  doc.setFontSize(8);

  doc.setFont('helvetica', 'normal');
  doc.text('Luogo', M, y);
  drawUnderline(doc, M + 11, y + 0.5, M + 95);
  doc.setFont('helvetica', 'bold');
  doc.text(d.luogo || '', M + 13, y - 0.5);
  doc.setFont('helvetica', 'normal');

  doc.text('Data', M + 100, y);
  drawUnderline(doc, M + 109, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDateIT(d.data_degustazione), M + 111, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 6;

  doc.text('Vino', M, y);
  drawUnderline(doc, M + 10, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  const vinoLine = `${nome}${prod ? ' · ' + prod : ''}${annata ? ' · ' + annata : ''}`;
  doc.text(vinoLine, M + 12, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 6;

  doc.text('Alcol % vol', M, y);
  drawUnderline(doc, M + 18, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  if (grado) doc.text(String(grado), M + 20, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // ===== COLORE =====
  sezioneBarra(doc, M, y, CW, 'COLORE', C.rosso);
  y += 7;
  const colori = ['Paglierino', 'Dorato', 'Aranciato', 'Cerasuolo', 'Ramato', 'Porpora', 'Rubino', 'Granato'];
  checkboxRow(M, y, colori, d.colore, C.rossoChiaro, CW);
  y += ROW_H + 1;

  sezioneSottoTitolo(doc, M, y, 'RIFLESSO', C.rosso);
  y += 5;
  const riflessi = ['Non rilevato', 'Verdolino', 'Dorato', 'Aranciato', 'Porpora', 'Granato'];
  checkboxRow(M, y, riflessi, d.riflesso, C.rossoChiaro, CW);
  y += ROW_H + 2;

  const colW = CW / 4;
  sezioneSottoTitolo(doc, M, y, 'DENSITÀ CROMATICA', C.rosso);
  doc.setFontSize(6);
  doc.setTextColor(120);
  doc.text('(vini rossi)', M + 27, y + 2);
  doc.setTextColor(...C.nero);
  sezioneSottoTitolo(doc, M + colW, y, 'LIMPIDEZZA', C.rosso);
  sezioneSottoTitolo(doc, M + colW * 2, y, 'VIVACITÀ', C.rosso);
  sezioneSottoTitolo(doc, M + colW * 3, y, 'PERLAGE', C.rosso);
  y += 5;

  doc.setDrawColor(...C.bordo);
  doc.setLineWidth(0.25);
  doc.line(M + colW, y - 5, M + colW, y + 6);
  doc.line(M + colW * 2, y - 5, M + colW * 2, y + 6);
  doc.line(M + colW * 3, y - 5, M + colW * 3, y + 6);

  checkboxRow(M, y, ['Trasparente', 'Compatto'], d.densita_cromatica, C.rossoChiaro, colW - 1);
  checkboxRow(M + colW, y, ['Opaco', 'Limpido'], d.limpidezza, C.rossoChiaro, colW - 1);
  checkboxRow(M + colW * 2, y, ['Cupo', 'Vivace', 'Luminoso'], d.vivacita, C.rossoChiaro, colW - 1);
  checkboxRow(M + colW * 3, y, ['Grandi', 'Fini'], d.perlage_grana, C.rossoChiaro, colW - 1);
  y += 9;

  // ===== OLFATTO =====
  sezioneBarra(doc, M, y, CW, 'OLFATTO', C.verde);
  y += 7;
  const famOlfatto = ['Fruttato', 'Floreale', 'Vegetale', 'Minerale', 'Erbe arom.', 'Speziato', 'Tostato', 'Balsamico', 'Etereo'];
  const famKeys = ['fruttato', 'floreale', 'vegetale', 'minerale', 'erbe_aromatiche', 'speziato', 'tostato', 'balsamico', 'etereo'];
  const familigieSelezionate = d.olfatto_descrittori || [];
  doc.setFontSize(7);
  const fcw = CW / famOlfatto.length;
  for (let i = 0; i < famOlfatto.length; i++) {
    const isSel = isInArray(familigieSelezionate, famKeys[i]);
    checkBox(M + i * fcw, y, isSel, C.verdeChiaro);
    doc.setTextColor(...C.nero);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    let lbl = famOlfatto[i];
    const maxW = fcw - BOX - 1;
    while (doc.getTextWidth(lbl) > maxW && lbl.length > 3) lbl = lbl.slice(0, -1);
    if (lbl !== famOlfatto[i]) lbl = lbl.slice(0, -1) + '…';
    doc.text(lbl, M + i * fcw + BOX + 0.8, y + BOX - 0.8);
  }
  y += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'normal');
  doc.text('Note', M, y);
  drawUnderline(doc, M + 8, y + 0.5, W - M);
  if (d.olfatto_sentori && d.olfatto_sentori.length) {
    doc.setFont('helvetica', 'italic');
    const noteText = d.olfatto_sentori.join(', ') + (d.olfatto_note ? ' — ' + d.olfatto_note : '');
    const lines = doc.splitTextToSize(noteText, W - M - M - 10);
    doc.text(lines[0] || '', M + 10, y - 0.5);
  } else if (d.olfatto_note) {
    doc.setFont('helvetica', 'italic');
    doc.text(d.olfatto_note.substring(0, 80), M + 10, y - 0.5);
  }
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('COMPLESSITÀ', M, y);
  y += 2;
  const yScalaStart = y;
  const complPalette = [C.verdeChiaro, [180,195,135], [165,185,110], [145,170,90], C.verdeScuro];
  const complLabels = [
    {label:'Facile', count:1},
    {label:'Complesso', count:1},
    {label:'Più che complesso', count:2},
    {label:'Ampio', count:1}
  ];
  y = scalaNumerica(M, y, [12,13,14,15,16], d.olfatto_complessita_punti, complPalette, SCALE_W, complLabels);
  boxPuntiVerticale(d.olfatto_complessita_punti, yScalaStart, y - yScalaStart);
  y += 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('QUALITÀ OLFATTIVA', M, y);
  y += 2;
  const yQualStart = y;
  const qualPalette = [C.verdeChiaro, [195,210,150], [180,200,130], [165,190,110], [150,180,95], [135,170,85], C.verdeScuro];
  const qualLabels = [
    {label:'Accettabile', count:1},
    {label:'Fine', count:2},
    {label:'Più che fine', count:2},
    {label:'Eccellente', count:2}
  ];
  y = scalaNumerica(M, y, [14,15,16,17,18,19,20], d.olfatto_qualita_punti, qualPalette, SCALE_W, qualLabels);
  boxPuntiVerticale(d.olfatto_qualita_punti, yQualStart, y - yQualStart);
  y += 4;

  // ===== GUSTO =====
  sezioneBarra(doc, M, y, CW, 'GUSTO', C.bluS);
  y += 7;

  const gcw = CW / 4;
  doc.setFillColor(...C.grigioChiaro);
  for (let i = 0; i < 4; i++) {
    doc.rect(M + i * gcw, y, gcw - 1, 5, 'F');
  }
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ZUCCHERO', M + gcw/2, y + 3.3, { align: 'center' });
  doc.text('ALCOL (perc.)', M + gcw + gcw/2, y + 3.3, { align: 'center' });
  doc.text('ACIDITÀ (perc.)', M + gcw * 2 + gcw/2, y + 3.3, { align: 'center' });
  doc.text('TANNINO', M + gcw * 3 + gcw/2, y + 3.3, { align: 'center' });
  y += 7;

  drawColumnChecks(M, y, gcw, ['Secco', 'Tendente al dolce', 'Dolce', 'Molto dolce'], d.gusto_zucchero, C.bluChiaro);
  drawColumnChecks(M + gcw, y, gcw, ['Contenuto', 'Caldo', 'Più che Caldo', 'Molto Caldo'], d.gusto_alcol, C.bluChiaro);
  drawColumnChecks(M + gcw * 2, y, gcw, ['Contenuto', 'Fresco', 'Più che Fresco', 'Molto Fresco'], d.gusto_acidita, C.bluChiaro);
  drawColumnChecks(M + gcw * 3, y, gcw, ['Amaro', 'Vegetale', 'Maturo', 'Raffinato'], d.gusto_tannino, C.bluChiaro);
  y += 4 * (BOX + 1.5) + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('EQUILIBRIO', M, y);
  y += 2;
  const yEquiStart = y;
  const equiPalette = [C.bluChiaro, [165,185,210], [140,165,195], [115,145,180], [90,125,165], [70,105,145], C.bluDark];
  const equiLabels = [
    {label:'Squilibrato', count:1},
    {label:'In fase eq.', count:2},
    {label:'Bilanciato', count:2},
    {label:'Equilibrato', count:2}
  ];
  y = scalaNumerica(M, y, [12,13,14,15,16,17,18], d.gusto_equilibrio_punti, equiPalette, SCALE_W, equiLabels);
  boxPuntiVerticale(d.gusto_equilibrio_punti, yEquiStart, y - yEquiStart);
  y += 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PERSISTENZA', M, y);
  y += 2;
  const yPersStart = y;
  const persLabels = [
    {label:'Accettabile', count:1},
    {label:'Persistente', count:2},
    {label:'Più che persistente', count:2},
    {label:'Lungo', count:2}
  ];
  y = scalaNumerica(M, y, [10,11,12,13,14,15,16], d.gusto_persistenza_punti, equiPalette, SCALE_W, persLabels);
  boxPuntiVerticale(d.gusto_persistenza_punti, yPersStart, y - yPersStart);
  y += 3;

  const halfW = CW / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('SAPIDITÀ PERCEPITA', M, y);
  doc.text('CHIUSURA DI BOCCA', M + halfW, y);
  y += 4;
  checkboxRow(M, y, ['Non avvert.', 'Contenuta', 'Sapida', 'Più che sapida'], d.gusto_sapidita, C.bluChiaro, halfW - 2);
  checkboxRow(M + halfW, y, ['Imprecisa', 'Buona', 'Precisa', 'Elegante'], d.gusto_chiusura, C.bluChiaro, halfW - 2);
  y += ROW_H + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('QUALITÀ GUSTATIVA', M, y);
  y += 2;
  const yQGStart = y;
  const qgLabels = [
    {label:'Accettabile', count:1},
    {label:'Fine', count:2},
    {label:'Più che fine', count:2},
    {label:'Eccellente', count:2}
  ];
  y = scalaNumerica(M, y, [18,19,20,21,22,23,24], d.gusto_qualita_punti, equiPalette, SCALE_W, qgLabels);
  boxPuntiVerticale(d.gusto_qualita_punti, yQGStart, y - yQGStart);
  y += 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DIMENSIONE', M, y);
  y += 2;
  const yDimStart = y;
  const dimLabel = d.gusto_dimensioni_label;
  const dimItems = [
    { label: 'strutturato', display:'Strutturato', punti: 3 },
    { label: 'sottile', display:'Sottile', punti: 3 },
    { label: 'distinto', display:'Distinto', punti: 5 },
    { label: 'suggestivo', display:'Suggestivo', punti: 6 }
  ];
  const dimSw = SCALE_W / 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.nero);
  for (let i = 0; i < dimItems.length; i++) {
    const it = dimItems[i];
    const lblW = doc.getTextWidth(it.display);
    doc.text(it.display, M + i * dimSw + dimSw/2 - lblW/2, y);
  }
  y += 1.5;
  for (let i = 0; i < dimItems.length; i++) {
    const it = dimItems[i];
    const isSel = dimLabel === it.label;
    const col = isSel ? C.bluDark : (i < 2 ? C.bluChiaro : (i === 2 ? C.bluMedio : C.bluScuro));
    doc.setFillColor(...col);
    doc.rect(M + i * dimSw + 0.3, y, dimSw - 0.6, SCALE_H, 'F');
    if (isSel) {
      doc.setDrawColor(...C.nero);
      doc.setLineWidth(1.2);
      doc.rect(M + i * dimSw + 0.3, y, dimSw - 0.6, SCALE_H);
      doc.setDrawColor(255);
      doc.setLineWidth(1.2);
      const xSize = 2.0;
      const xcx = M + i * dimSw + dimSw / 2;
      const xcy = y + SCALE_H / 2;
      doc.line(xcx - xSize, xcy - xSize, xcx + xSize, xcy + xSize);
      doc.line(xcx + xSize, xcy - xSize, xcx - xSize, xcy + xSize);
      doc.setLineWidth(0.2);
    }
    doc.setTextColor(255);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.setFontSize(10);
    const nt = String(it.punti);
    const nw = doc.getTextWidth(nt);
    doc.text(nt, M + i * dimSw + dimSw/2 - nw/2, y + SCALE_H/2 + 1.5);
  }
  // Colonna Punti dedicata
  boxPuntiVerticale(d.gusto_dimensioni_punti, yDimStart, (y + SCALE_H) - yDimStart);
  y += SCALE_H + 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('PROSPETTIVE DI CONSUMO', M, y);
  y += 4;
  const pros = [
    { key: 'da_bere_subito', label: 'Da bere subito' },
    { key: 'brevi_prospettive', label: 'Brevi prospettive' },
    { key: 'medie_prospettive', label: 'Medie prospettive' },
    { key: 'lunghe_prospettive', label: 'Lunghe prospettive' },
  ];
  checkboxRow(M, y, pros, d.prospettive_consumo, C.bluChiaro, CW);
  y += ROW_H + 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.nero);
  doc.text('CONCLUSIONI', M, y);
  doc.text('Totale', W - M - 25, y);
  y += 2;

  const punteggio = d.punteggio_totale || 0;
  const fasce = [
    ['Accettabile 70-77', 70, 77, C.bluChiaro],
    ['Buono 78-85', 78, 85, [140,165,195]],
    ['Ottimo 86-90', 86, 90, [115,145,180]],
    ['Eccellente 91-96', 91, 96, [90,125,165]],
    ['Memorabile 97-100', 97, 100, C.bluDark],
  ];
  const fascW = (CW - 28) / 5;
  for (let i = 0; i < 5; i++) {
    const [lbl, min, max, col] = fasce[i];
    const isSel = punteggio >= min && punteggio <= max;
    doc.setFillColor(...col);
    doc.rect(M + i * fascW + 0.3, y, fascW - 0.6, SCALE_H, 'F');
    if (isSel) {
      doc.setDrawColor(...C.nero);
      doc.setLineWidth(1.2);
      doc.rect(M + i * fascW + 0.3, y, fascW - 0.6, SCALE_H);
      doc.setDrawColor(255);
      doc.setLineWidth(1.2);
      const xSize = 2.0;
      const xcx = M + i * fascW + fascW / 2;
      const xcy = y + SCALE_H / 2;
      doc.line(xcx - xSize, xcy - xSize, xcx + xSize, xcy + xSize);
      doc.line(xcx + xSize, xcy - xSize, xcx - xSize, xcy + xSize);
      doc.setLineWidth(0.2);
    }
    doc.setTextColor(255);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    const lw = doc.getTextWidth(lbl);
    doc.text(lbl, M + i * fascW + (fascW - 0.6)/2 - lw/2, y + SCALE_H/2 + 1);
  }
  doc.setTextColor(...C.headerDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(String(punteggio), W - M - 16, y + SCALE_H - 1);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.grigio);
  doc.text('/100', W - M - 5, y + SCALE_H - 1, { align: 'right' });
  y += SCALE_H + 3;

  if (d.note_conclusive) {
    doc.setFontSize(7);
    doc.setTextColor(...C.headerDark);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTE CONCLUSIVE', M, y);
    y += 3.5;
    doc.setTextColor(...C.nero);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    const wrap = doc.splitTextToSize('"' + d.note_conclusive + '"', CW);
    doc.text(wrap, M, y);
    y += wrap.length * 3.5;
  }

  doc.setFontSize(6);
  doc.setTextColor(...C.grigio);
  doc.setFont('helvetica', 'italic');
  doc.text('Generato da CantinApp · ' + formatDateIT(new Date().toISOString().split('T')[0]),
    W/2, H - 8, { align: 'center' });

  const filename = `degustazione_${(nome || 'vino').replace(/[^a-zA-Z0-9]/g,'_')}_${d.data_degustazione || ''}.pdf`;
  doc.save(filename);
}

// ===== HELPERS =====

function sezioneBarra(doc, x, y, w, label, color) {
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(label, x, y + 2);
  const tw = doc.getTextWidth(label) + 3;
  doc.setFillColor(...color);
  doc.rect(x + tw, y, w - tw, 2, 'F');
}

function sezioneSottoTitolo(doc, x, y, label, color, sub) {
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(label, x, y + 2);
  if (sub) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120);
    const w = doc.getTextWidth(label);
    doc.text(sub, x + w + 1.5, y + 2);
  }
}

function drawUnderline(doc, x1, y, x2) {
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.line(x1, y, x2, y);
}

function normalizeKey(s) {
  return String(s).toLowerCase()
    .replace(/[_\s]/g, '')
    .replace(/à/g, 'a').replace(/è/g, 'e').replace(/é/g, 'e')
    .replace(/ò/g, 'o').replace(/ù/g, 'u').replace(/ì/g, 'i');
}

function formatDateIT(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
