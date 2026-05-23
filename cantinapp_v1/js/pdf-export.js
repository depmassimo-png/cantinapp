// ============================================================
// CantinApp — Export PDF scheda Assosommelier
// Replica fedele del layout ufficiale del quaderno
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
  const W = 210;
  const H = 297;
  const M = 12;
  const CW = W - M*2;

  // ===== PALETTE (fedele alla scheda Assosommelier) =====
  const C = {
    headerDark: [42, 56, 86],    // blu scuro header
    rosso: [196, 86, 50],         // arancione/rosso esame visivo
    verde: [127, 161, 76],        // verde olfatto
    bluS: [70, 105, 145],         // blu gusto
    bluDark: [42, 56, 86],        // blu intenso (per selezioni gusto)
    verdeChiaro: [200, 215, 165], // chip olfatto chiara
    verdeMedio: [165, 185, 110],  // chip olfatto media
    verdeScuro: [127, 161, 76],   // chip olfatto scura
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

  // Helper checkbox
  function checkBox(x, y, sel, color) {
    color = color || C.grigioChiaro;
    if (sel) {
      doc.setFillColor(...color);
      doc.rect(x, y, 2.5, 2.5, 'F');
    } else {
      doc.setFillColor(...C.grigioMolto);
      doc.setDrawColor(...C.bordo);
      doc.setLineWidth(0.2);
      doc.rect(x, y, 2.5, 2.5, 'FD');
    }
  }

  // Helper riga di opzioni con checkbox
  function checkboxRow(x, y, options, selected, color, totalWidth) {
    const cw = totalWidth / options.length;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optKey = typeof opt === 'string' ? opt.toLowerCase() : opt.key;
      const optLabel = typeof opt === 'string' ? opt : opt.label;
      const isSel = matchOption(selected, optKey);
      const cx = x + i * cw;
      checkBox(cx, y, isSel, color);
      doc.setTextColor(...C.nero);
      doc.setFont('helvetica', isSel ? 'bold' : 'normal');
      doc.text(optLabel, cx + 3.5, y + 2);
    }
  }

  function matchOption(selected, opt) {
    if (!selected) return false;
    const s = String(selected).toLowerCase().replace(/[_\s]/g, '');
    const o = String(opt).toLowerCase().replace(/[_\s]/g, '');
    return s === o || s.includes(o) || o.includes(s);
  }

  function isInArray(arr, opt) {
    if (!arr || !arr.length) return false;
    const o = String(opt).toLowerCase().replace(/[_\s]/g, '');
    return arr.some(s => {
      const ss = String(s).toLowerCase().replace(/[_\s]/g, '');
      return ss === o || ss.includes(o) || o.includes(ss);
    });
  }

  // Helper scala numerica con quadrati colorati
  function scalaPunti(x, y, items, selected, palette, totalWidth) {
    // items: [[num, label], ...]
    const sw = totalWidth / items.length;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    // Etichette in cima
    for (let i = 0; i < items.length; i++) {
      const [num, lbl] = items[i];
      if (lbl) {
        doc.setTextColor(...C.nero);
        const w = doc.getTextWidth(lbl);
        doc.text(lbl, x + i * sw + sw/2 - w/2, y);
      }
    }
    // Caselle numeri
    const boxY = y + 1.5;
    const boxH = 4.5;
    for (let i = 0; i < items.length; i++) {
      const [num] = items[i];
      const cx = x + i * sw;
      const isSel = num != null && num === selected;
      // Gradiente di palette dal chiaro allo scuro
      const colorIdx = Math.min(palette.length - 1, Math.floor(i * palette.length / items.length));
      const col = isSel ? palette[palette.length - 1] : palette[colorIdx];
      doc.setFillColor(...col);
      doc.rect(cx + 0.3, boxY, sw - 0.6, boxH, 'F');
      doc.setTextColor(isSel ? 255 : 255);
      doc.setFont('helvetica', isSel ? 'bold' : 'normal');
      doc.setFontSize(8);
      if (num != null) {
        const ntxt = String(num);
        const nw = doc.getTextWidth(ntxt);
        doc.text(ntxt, cx + sw/2 - nw/2, boxY + boxH - 1.3);
      }
    }
    return y + boxH + 3;
  }

  let y = M;

  // ===== HEADER nero/blu =====
  doc.setFillColor(...C.headerDark);
  doc.rect(M, y, CW, 10, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SCHEDA DI DEGUSTAZIONE', M + 3, y + 6.5);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Assosommelier', W - M - 3, y + 6.5, { align: 'right' });
  y += 14;

  // ===== INTESTAZIONE =====
  const nome = d.bottiglia?.nome_vino || d.nome_vino_esterno || '';
  const prod = d.bottiglia?.produttore || d.produttore_esterno || '';
  const annata = d.bottiglia?.annata || d.annata_esterna || '';
  const grado = d.bottiglia?.gradazione || '';

  doc.setTextColor(...C.nero);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Luogo + Data
  doc.text('Luogo', M, y);
  drawUnderline(doc, M + 10, y + 0.5, M + 95);
  doc.setFont('helvetica', 'bold');
  doc.text(d.luogo || '', M + 12, y - 0.5);
  doc.setFont('helvetica', 'normal');

  doc.text('Data', M + 100, y);
  drawUnderline(doc, M + 108, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDateIT(d.data_degustazione), M + 110, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 6;

  // Vino
  doc.text('Vino', M, y);
  drawUnderline(doc, M + 10, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  const vinoLine = `${nome}${prod ? ' · ' + prod : ''}${annata ? ' · ' + annata : ''}`;
  doc.text(vinoLine, M + 12, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 6;

  // Alcol
  doc.text('Alcol % vol', M, y);
  drawUnderline(doc, M + 18, y + 0.5, W - M);
  doc.setFont('helvetica', 'bold');
  if (grado) doc.text(String(grado), M + 20, y - 0.5);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // ===== SEZIONE COLORE (barra rosso/arancione) =====
  sezioneBarra(doc, M, y, CW, 'COLORE', C.rosso);
  y += 6;
  const colori = ['Paglierino', 'Dorato', 'Aranciato', 'Cerasuolo', 'Ramato', 'Porpora', 'Rubino', 'Granato'];
  checkboxRow(M, y, colori, d.colore, C.rossoChiaro, CW);
  y += 6;

  // RIFLESSO
  sezioneSottoTitolo(doc, M, y, 'RIFLESSO', C.rosso);
  y += 4.5;
  const riflessi = ['Non rilevato', 'Verdolino', 'Dorato', 'Aranciato', 'Porpora', 'Granato'];
  checkboxRow(M, y, riflessi, d.riflesso, C.rossoChiaro, CW);
  y += 6;

  // DENSITÀ/LIMPIDEZZA/VIVACITÀ/PERLAGE in 4 colonne
  const colW = CW / 4;
  sezioneSottoTitolo(doc, M, y, 'DENSITÀ CROMATICA', C.rosso, '(vini rossi)');
  sezioneSottoTitolo(doc, M + colW, y, 'LIMPIDEZZA', C.rosso);
  sezioneSottoTitolo(doc, M + colW * 2, y, 'VIVACITÀ', C.rosso);
  sezioneSottoTitolo(doc, M + colW * 3, y, 'PERLAGE GRANA BOLLICINE', C.rosso);
  y += 4.5;

  // Linee verticali separatrici
  doc.setDrawColor(...C.bordo);
  doc.setLineWidth(0.2);
  doc.line(M + colW, y - 4, M + colW, y + 5);
  doc.line(M + colW * 2, y - 4, M + colW * 2, y + 5);
  doc.line(M + colW * 3, y - 4, M + colW * 3, y + 5);

  checkboxRow(M, y, ['Trasparente', 'Compatto'], d.densita_cromatica, C.rossoChiaro, colW - 2);
  checkboxRow(M + colW, y, ['Opaco', 'Limpido'], d.limpidezza, C.rossoChiaro, colW - 2);
  checkboxRow(M + colW * 2, y, ['Cupo', 'Vivace', 'Luminoso'], d.vivacita, C.rossoChiaro, colW - 2);
  checkboxRow(M + colW * 3, y, ['Grandi', 'Fini'], d.perlage_grana, C.rossoChiaro, colW - 2);
  y += 8;

  // ===== SEZIONE OLFATTO (barra verde) =====
  sezioneBarra(doc, M, y, CW, 'OLFATTO', C.verde);
  y += 6;
  const famOlfatto = ['Fruttato', 'Floreale', 'Vegetale', 'Minerale', 'Erbe aromatiche', 'Speziato', 'Tostato', 'Balsamico', 'Etereo'];
  const famKeys = ['fruttato', 'floreale', 'vegetale', 'minerale', 'erbe_aromatiche', 'speziato', 'tostato', 'balsamico', 'etereo'];
  const famOlfattoOpts = famOlfatto.map((label, i) => ({ key: famKeys[i], label }));
  const familigieSelezionate = d.olfatto_descrittori || [];
  doc.setFontSize(7);
  const fcw = CW / famOlfatto.length;
  for (let i = 0; i < famOlfatto.length; i++) {
    const isSel = isInArray(familigieSelezionate, famKeys[i]);
    checkBox(M + i * fcw, y, isSel, C.verdeChiaro);
    doc.setTextColor(...C.nero);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(famOlfatto[i], M + i * fcw + 3.5, y + 2);
  }
  y += 5;

  // Note olfattive con sentori specifici
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
  y += 7;

  // COMPLESSITÀ + QUALITÀ (gradiente verde 5 livelli e 7 livelli)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('COMPLESSITÀ', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Facile', M, y + 4);
  doc.text('Complesso', M + 30, y + 4);
  doc.text('Più che complesso', M + 55, y + 4);
  doc.text('Ampio', M + 95, y + 4);
  y += 5;
  // Punti complessità 12-16
  const complPalette = [C.verdeChiaro, [180,195,135], [165,185,110], [145,170,90], C.verdeScuro];
  y = scalaPuntiSemplice(doc, M, y, [12,13,14,15,16], d.olfatto_complessita_punti, complPalette, CW - 25);
  // Punti sul lato destro
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.text(d.olfatto_complessita_punti ? String(d.olfatto_complessita_punti) : '___', W - M - 8, y - 3);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('QUALITÀ', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Accettabile', M, y + 4);
  doc.text('Fine', M + 50, y + 4);
  doc.text('Più che fine', M + 90, y + 4);
  doc.text('Eccellente', M + 130, y + 4);
  y += 5;
  const qualPalette = [C.verdeChiaro, [195,210,150], [180,200,130], [165,190,110], [150,180,95], [135,170,85], C.verdeScuro];
  y = scalaPuntiSemplice(doc, M, y, [14,15,16,17,18,19,20], d.olfatto_qualita_punti, qualPalette, CW - 25);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.text(d.olfatto_qualita_punti ? String(d.olfatto_qualita_punti) : '___', W - M - 8, y - 3);
  y += 3;

  // ===== SEZIONE GUSTO (barra blu) =====
  sezioneBarra(doc, M, y, CW, 'GUSTO', C.bluS);
  y += 6;

  // 4 colonne: Zucchero, Alcol, Acidità, Tannino
  const gcw = CW / 4;
  // Header con sfondo grigio
  doc.setFillColor(...C.grigioChiaro);
  doc.rect(M, y, gcw - 1, 4.5, 'F');
  doc.rect(M + gcw, y, gcw - 1, 4.5, 'F');
  doc.rect(M + gcw * 2, y, gcw - 1, 4.5, 'F');
  doc.rect(M + gcw * 3, y, gcw - 1, 4.5, 'F');
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ZUCCHERO', M + gcw/2, y + 3, { align: 'center' });
  doc.text('ALCOL (percepito)', M + gcw + gcw/2, y + 3, { align: 'center' });
  doc.text('ACIDITÀ (percepita)', M + gcw * 2 + gcw/2, y + 3, { align: 'center' });
  doc.text('TANNINO', M + gcw * 3 + gcw/2, y + 3, { align: 'center' });
  y += 6;

  // 4 colonne di chip verticali
  drawColumnChecks(doc, M, y, gcw, ['Secco', 'Tendente al dolce', 'Dolce', 'Molto dolce'], d.gusto_zucchero, C.bluChiaro);
  drawColumnChecks(doc, M + gcw, y, gcw, ['Contenuto', 'Caldo', 'Più che Caldo', 'Molto Caldo'], d.gusto_alcol, C.bluChiaro);
  drawColumnChecks(doc, M + gcw * 2, y, gcw, ['Contenuto', 'Fresco', 'Più che Fresco', 'Molto Fresco'], d.gusto_acidita, C.bluChiaro);
  drawColumnChecks(doc, M + gcw * 3, y, gcw, ['Amaro', 'Vegetale', 'Maturo', 'Raffinato'], d.gusto_tannino, C.bluChiaro);
  y += 18;

  // EQUILIBRIO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('EQUILIBRIO', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Squilibrato', M, y + 4);
  doc.text('In fase di equilibrio', M + 40, y + 4);
  doc.text('Bilanciato', M + 90, y + 4);
  doc.text('Equilibrato', M + 135, y + 4);
  y += 5;
  const equiPalette = [C.bluChiaro, [165,185,210], [140,165,195], [115,145,180], [90,125,165], [70,105,145], C.bluDark];
  y = scalaPuntiSemplice(doc, M, y, [12,13,14,15,16,17,18], d.gusto_equilibrio_punti, equiPalette, CW - 25);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.text(d.gusto_equilibrio_punti ? String(d.gusto_equilibrio_punti) : '___', W - M - 8, y - 3);
  y += 2;

  // PERSISTENZA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PERSISTENZA', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Accettabile', M, y + 4);
  doc.text('Persistente', M + 40, y + 4);
  doc.text('Più che persistente', M + 80, y + 4);
  doc.text('Lungo', M + 130, y + 4);
  y += 5;
  y = scalaPuntiSemplice(doc, M, y, [10,11,12,13,14,15,16], d.gusto_persistenza_punti, equiPalette, CW - 25);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.text(d.gusto_persistenza_punti ? String(d.gusto_persistenza_punti) : '___', W - M - 8, y - 3);
  y += 3;

  // SAPIDITÀ + CHIUSURA DI BOCCA in 2 colonne
  const halfW = CW / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('SAPIDITÀ PERCEPITA', M, y);
  doc.text('CHIUSURA DI BOCCA', M + halfW, y);
  y += 4;
  checkboxRow(M, y, ['Non avvertibile', 'Contenuta', 'Sapida', 'Più che sapida'], d.gusto_sapidita, C.bluChiaro, halfW - 2);
  checkboxRow(M + halfW, y, ['Imprecisa', 'Buona', 'Precisa', 'Elegante'], d.gusto_chiusura, C.bluChiaro, halfW - 2);
  y += 7;

  // QUALITÀ GUSTATIVA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('QUALITÀ GUSTATIVA', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Accettabile', M, y + 4);
  doc.text('Fine', M + 50, y + 4);
  doc.text('Più che fine', M + 90, y + 4);
  doc.text('Eccellente', M + 135, y + 4);
  y += 5;
  y = scalaPuntiSemplice(doc, M, y, [18,19,20,21,22,23,24], d.gusto_qualita_punti, equiPalette, CW - 25);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.text(d.gusto_qualita_punti ? String(d.gusto_qualita_punti) : '___', W - M - 8, y - 3);
  y += 2;

  // DIMENSIONE (4 caselle 3/3/5/6)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DIMENSIONE', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Strutturato', M, y + 4);
  doc.text('Sottile', M + 45, y + 4);
  doc.text('Distinto', M + 95, y + 4);
  doc.text('Suggestivo', M + 140, y + 4);
  y += 5;
  const dimPunti = d.gusto_dimensioni_punti;
  const dimLabel = d.gusto_dimensioni_label;
  const dimItems = [
    { label: 'strutturato', punti: 3 },
    { label: 'sottile', punti: 3 },
    { label: 'distinto', punti: 5 },
    { label: 'suggestivo', punti: 6 }
  ];
  const dimSw = (CW - 25) / 4;
  doc.setFontSize(8);
  for (let i = 0; i < dimItems.length; i++) {
    const it = dimItems[i];
    const isSel = dimLabel === it.label;
    const col = isSel ? C.bluDark : (i < 2 ? C.bluChiaro : (i === 2 ? C.bluMedio : C.bluScuro));
    doc.setFillColor(...col);
    doc.rect(M + i * dimSw + 0.3, y, dimSw - 0.6, 4.5, 'F');
    doc.setTextColor(isSel ? 255 : 255);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    const nt = String(it.punti);
    const nw = doc.getTextWidth(nt);
    doc.text(nt, M + i * dimSw + dimSw/2 - nw/2, y + 3.2);
  }
  doc.setFontSize(7);
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'normal');
  doc.text('Punti', W - M - 22, y + 3);
  doc.setFont('helvetica', 'bold');
  doc.text(dimPunti ? String(dimPunti) : '___', W - M - 8, y + 3);
  y += 8;

  // PROSPETTIVE DI CONSUMO
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
  y += 7;

  // CONCLUSIONI + TOTALE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.nero);
  doc.text('CONCLUSIONI', M, y);
  doc.text('Totale', W - M - 22, y);
  y += 3;

  const punteggio = d.punteggio_totale || 0;
  const fasce = [
    ['Accettabile - 70/77', 70, 77, C.bluChiaro],
    ['Buono - 78/85', 78, 85, [140,165,195]],
    ['Ottimo - 86/90', 86, 90, [115,145,180]],
    ['Eccellente - 91/96', 91, 96, [90,125,165]],
    ['Memorabile - 97/100', 97, 100, C.bluDark],
  ];
  const fascW = (CW - 25) / 5;
  for (let i = 0; i < 5; i++) {
    const [lbl, min, max, col] = fasce[i];
    const isSel = punteggio >= min && punteggio <= max;
    doc.setFillColor(...col);
    doc.rect(M + i * fascW + 0.3, y, fascW - 0.6, 4.5, 'F');
    if (isSel) {
      // Bordo evidenziato
      doc.setDrawColor(...C.headerDark);
      doc.setLineWidth(0.8);
      doc.rect(M + i * fascW + 0.3, y, fascW - 0.6, 4.5);
      doc.setLineWidth(0.2);
    }
    doc.setTextColor(255);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    const lw = doc.getTextWidth(lbl);
    doc.text(lbl, M + i * fascW + (fascW - 0.6)/2 - lw/2, y + 3);
  }
  // Totale
  doc.setTextColor(...C.nero);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(String(punteggio), W - M - 14, y + 3.5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('/100', W - M - 6, y + 3.5);
  y += 8;

  // Note conclusive
  if (d.note_conclusive) {
    doc.setFontSize(7);
    doc.setTextColor(...C.headerDark);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTE CONCLUSIVE', M, y);
    y += 3.5;
    doc.setTextColor(...C.nero);
    doc.setFont('helvetica', 'italic');
    const wrap = doc.splitTextToSize('"' + d.note_conclusive + '"', CW);
    doc.text(wrap, M, y);
    y += wrap.length * 3.5;
  }

  // Footer
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
  // Barra orizzontale colorata a destra
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

function drawColumnChecks(doc, x, y, w, opts, selected, color) {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  for (let i = 0; i < opts.length; i++) {
    const optKey = normalizeKey(opts[i]);
    const isSel = selected && (normalizeKey(selected) === optKey);
    if (isSel) {
      doc.setFillColor(...color);
    } else {
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(180);
      doc.setLineWidth(0.2);
    }
    doc.rect(x + 1.5, y + i * 3.7, 2.5, 2.5, isSel ? 'F' : 'FD');
    doc.setTextColor(40);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.text(opts[i], x + 5.5, y + i * 3.7 + 2);
  }
}

function scalaPuntiSemplice(doc, x, y, numeri, selectedPunti, palette, totalWidth) {
  const sw = totalWidth / numeri.length;
  const boxH = 4.5;
  for (let i = 0; i < numeri.length; i++) {
    const num = numeri[i];
    const cx = x + i * sw;
    const isSel = num === selectedPunti;
    // Gradiente dal chiaro allo scuro a seconda della posizione
    const colorIdx = Math.min(palette.length - 1, i);
    const col = isSel ? palette[palette.length - 1] : palette[colorIdx];
    doc.setFillColor(...col);
    doc.rect(cx + 0.3, y, sw - 0.6, boxH, 'F');
    if (isSel) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.6);
      doc.rect(cx + 0.3, y, sw - 0.6, boxH);
      doc.setLineWidth(0.2);
    }
    doc.setTextColor(255);
    doc.setFont('helvetica', isSel ? 'bold' : 'normal');
    doc.setFontSize(8);
    const nt = String(num);
    const nw = doc.getTextWidth(nt);
    doc.text(nt, cx + sw/2 - nw/2, y + boxH - 1.3);
  }
  return y + boxH + 3;
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
