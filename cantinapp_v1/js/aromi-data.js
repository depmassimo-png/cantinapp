// ============================================================
// CantinApp — Database Aromi (Scheda Assosommelier)
// Le 9 famiglie olfattive ufficiali della scheda di degustazione,
// arricchite con i sentori della Ruota degli Aromi
// ============================================================

const AROMI = {
  fruttato: {
    label: 'Fruttato',
    color: '#C0392B',
    subcategories: {
      agrumi: {
        label: 'Agrumi',
        compat: ['bianco', 'spumante', 'rosato'],
        sentori: ['limone', 'lime', 'pompelmo', "scorza d'arancia"]
      },
      bacche_bianche: {
        label: 'Bacche bianche',
        compat: ['bianco', 'spumante'],
        sentori: ['uva spina']
      },
      pomacee: {
        label: 'Pomacee',
        compat: ['bianco', 'spumante', 'rosato'],
        sentori: ['pera', 'mela', 'mela verde', 'cotognata']
      },
      drupacee_bianche: {
        label: 'Drupacee (bianchi)',
        compat: ['bianco', 'spumante', 'rosato', 'passito'],
        sentori: ['pesca', 'albicocca', 'albicocca secca', 'melone']
      },
      frutti_tropicali: {
        label: 'Frutti tropicali',
        compat: ['bianco', 'spumante', 'passito'],
        sentori: ['ananas', 'guaiava', 'frutto della passione', 'litchi', 'banana', 'mango']
      },
      bacche_rosse: {
        label: 'Bacche rosse',
        compat: ['rosso', 'rosato', 'spumante'],
        sentori: ['lampone', 'ribes nero', 'fragola', 'mora', 'ciliegia']
      },
      drupacee_rosse: {
        label: 'Drupacee (rossi)',
        compat: ['rosso', 'rosato', 'passito', 'liquoroso'],
        sentori: ['prugna', 'prugna secca', 'amarena']
      }
    }
  },

  floreale: {
    label: 'Floreale',
    color: '#E8A0BF',
    subcategories: {
      fiori_bianchi: {
        label: 'Fiori bianchi',
        compat: ['rosso', 'bianco', 'rosato', 'spumante', 'passito'],
        sentori: ['caprifoglio', 'biancospino', "fiori d'arancio", 'tiglio', 'gelsomino', 'acacia', 'sambuco']
      },
      fiori_colorati: {
        label: 'Fiori colorati',
        compat: ['rosso', 'rosato', 'bianco', 'spumante'],
        sentori: ['rosa', 'lavanda', 'violetta', 'glicine', 'iris', 'geranio']
      },
      fiori_appassiti: {
        label: 'Fiori appassiti',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['rosa appassita', 'fiori secchi']
      }
    }
  },

  vegetale: {
    label: 'Vegetale',
    color: '#27AE60',
    subcategories: {
      foglie: {
        label: 'Foglie',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['foglia di ribes nero', 'foglia di pomodoro', 'foglia di tè', 'felce']
      },
      ortaggi: {
        label: 'Ortaggi',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['peperone', 'pomodoro', 'finocchio', 'erba tagliata', 'asparago', 'carciofo']
      },
      sottobosco: {
        label: 'Sottobosco',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['fungo', 'tartufo', 'muschio', 'humus']
      }
    }
  },

  minerale: {
    label: 'Minerale',
    color: '#2E5FA3',
    subcategories: {
      minerale_gen: {
        label: 'Minerali',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['pietra focaia', 'iodio', 'gesso', 'grafite', 'pietra bagnata', 'cherosene']
      }
    }
  },

  erbe_aromatiche: {
    label: 'Erbe aromatiche',
    color: '#7DB342',
    subcategories: {
      erbe_fresche: {
        label: 'Erbe fresche',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['menta', 'basilico', 'salvia', 'timo', 'rosmarino', 'eucalipto']
      },
      erbe_essiccate: {
        label: 'Erbe essiccate',
        compat: ['rosso', 'passito', 'liquoroso', 'bianco'],
        sentori: ['fieno', 'tè nero', 'tabacco', 'origano', 'alloro']
      }
    }
  },

  speziato: {
    label: 'Speziato',
    color: '#D35400',
    subcategories: {
      spezie_dolci: {
        label: 'Spezie dolci',
        compat: ['rosso', 'bianco', 'passito', 'spumante', 'liquoroso'],
        sentori: ['vaniglia', 'cannella', 'noce moscata', 'anice', 'cardamomo', 'zenzero']
      },
      spezie_piccanti: {
        label: 'Spezie piccanti',
        compat: ['rosso', 'rosato', 'liquoroso'],
        sentori: ['pepe nero', 'pepe bianco', 'pepe rosa', 'chiodi di garofano', 'paprika']
      },
      altre_spezie: {
        label: 'Altre',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['liquirizia', 'curry', 'zafferano']
      }
    }
  },

  tostato: {
    label: 'Tostato',
    color: '#6B4226',
    subcategories: {
      tostatura: {
        label: 'Tostatura',
        compat: ['rosso', 'bianco', 'spumante', 'passito', 'liquoroso'],
        sentori: ['pane tostato', 'caffè', 'cacao', 'cioccolato', 'caramello']
      },
      affumicato: {
        label: 'Affumicato',
        compat: ['rosso', 'liquoroso'],
        sentori: ['fumo', 'catrame', 'bacon']
      },
      frutta_secca: {
        label: 'Frutta secca',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['mandorla', 'nocciola', 'noce', 'noce di cocco']
      }
    }
  },

  balsamico: {
    label: 'Balsamico',
    color: '#16A085',
    subcategories: {
      balsamici: {
        label: 'Balsamici',
        compat: ['rosso', 'bianco', 'spumante', 'passito'],
        sentori: ['eucalipto', 'mentolo', 'resina', 'pino', 'incenso']
      }
    }
  },

  etereo: {
    label: 'Etereo',
    color: '#9B59B6',
    subcategories: {
      eterei: {
        label: 'Eterei / Animali',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['smalto', 'cera', 'cuoio', 'sugo di carne', 'pellame', 'goudron', 'idrocarburi']
      }
    }
  }
};

// ============================================================
// PROFILI VITIGNO — sentori tipici evidenziati con ★
// ============================================================

const PROFILI_VITIGNO = {
  'sangiovese': { tipologia: 'rosso', sentori_tipici: ['ciliegia','lampone','fragola','mora','prugna','amarena','violetta','rosa','tabacco','tè nero','alloro','liquirizia','pepe nero','cannella','cuoio'] },
  'nebbiolo': { tipologia: 'rosso', sentori_tipici: ['ciliegia','lampone','prugna','prugna secca','amarena','rosa','rosa appassita','violetta','tabacco','tè nero','alloro','liquirizia','cannella','pepe nero','noce moscata','cuoio','tartufo','fungo','catrame','caffè','cacao','goudron'] },
  'cabernet_sauvignon': { tipologia: 'rosso', sentori_tipici: ['ribes nero','mora','ciliegia','prugna','violetta','peperone','foglia di ribes nero','eucalipto','menta','tabacco','vaniglia','pepe nero','liquirizia','caffè','cacao','pane tostato'] },
  'merlot': { tipologia: 'rosso', sentori_tipici: ['prugna','mora','ciliegia','fragola','ribes nero','violetta','rosa','alloro','cacao','cioccolato','caffè','vaniglia','cannella','noce moscata','cuoio','tabacco'] },
  'cabernet_franc': { tipologia: 'rosso', sentori_tipici: ['lampone','fragola','ribes nero','peperone','foglia di ribes nero','tabacco','violetta','pepe nero','cannella','liquirizia'] },
  'pinot_nero': { tipologia: 'rosso', sentori_tipici: ['ciliegia','fragola','lampone','mora','amarena','rosa','violetta','fungo','tartufo','muschio','cuoio','caffè','cacao','pane tostato','vaniglia','noce moscata'] },
  'syrah': { tipologia: 'rosso', sentori_tipici: ['mora','ribes nero','prugna','violetta','rosa','pepe nero','pepe bianco','cannella','liquirizia','chiodi di garofano','cuoio','tabacco','cacao','caffè','fumo','catrame','bacon'] },
  'gamay': { tipologia: 'rosso', sentori_tipici: ['fragola','lampone','ciliegia','mora','amarena','violetta','rosa','pepe nero','cannella','banana'] },
  'malbec': { tipologia: 'rosso', sentori_tipici: ['mora','prugna','ribes nero','ciliegia','violetta','cacao','cioccolato','caffè','pepe nero','cannella','liquirizia','cuoio','tabacco','vaniglia'] },
  'grenache': { tipologia: 'rosso', sentori_tipici: ['fragola','lampone','ciliegia','mora','prugna','rosa','lavanda','pepe nero','cannella','liquirizia','cuoio','tabacco','fieno'] },
  'tempranillo': { tipologia: 'rosso', sentori_tipici: ['ciliegia','fragola','prugna','prugna secca','rosa','tabacco','alloro','vaniglia','cannella','pepe nero','liquirizia','cuoio','cacao','caffè'] },
  'chardonnay': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca','melone','ananas','limone','pompelmo','caprifoglio','biancospino','acacia','pietra focaia','iodio','vaniglia','noce di cocco','mandorla','nocciola','cannella','pane tostato','caramello'] },
  'sauvignon_blanc': { tipologia: 'bianco', sentori_tipici: ['lime','limone','pompelmo','uva spina','mela verde','pesca','frutto della passione','biancospino',"fiori d'arancio",'sambuco','foglia di ribes nero','erba tagliata','peperone','asparago','menta','eucalipto','foglia di pomodoro','pietra focaia','iodio'] },
  'riesling': { tipologia: 'bianco', sentori_tipici: ['lime','limone','pompelmo','mela verde','pera','pesca','albicocca secca','litchi','caprifoglio','gelsomino','tiglio','cotognata','pietra focaia','cherosene','iodio'] },
  'pinot_grigio': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca','limone','biancospino','acacia','mandorla','nocciola','cotognata'] },
  'gewurztraminer': { tipologia: 'bianco', sentori_tipici: ['litchi','frutto della passione','ananas','mela','pesca','albicocca secca','rosa',"fiori d'arancio",'gelsomino','caprifoglio','cannella','chiodi di garofano','noce moscata','pepe bianco','zenzero'] },
  'viognier': { tipologia: 'bianco', sentori_tipici: ['pesca','albicocca secca','mango','ananas',"fiori d'arancio",'caprifoglio','gelsomino','vaniglia','cannella'] },
  'chenin_blanc': { tipologia: 'bianco', sentori_tipici: ['mela','mela verde','pera','pesca','albicocca secca','limone','caprifoglio',"fiori d'arancio",'cotognata','pietra focaia','iodio','fieno'] },
  'semillon': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca','limone',"scorza d'arancia",'biancospino','caprifoglio','cotognata','albicocca secca','fieno','cera','vaniglia'] }
};

// ============================================================
// MAPPATURA COLORE → TIPOLOGIA
// Usata in degustazione alla cieca per dedurre la tipologia dal colore
// e filtrare di conseguenza i sentori
// ============================================================

const COLORE_TIPOLOGIA = {
  // Bianchi
  'paglierino': 'bianco',
  'dorato': 'bianco',
  'aranciato': 'bianco',     // bianco evoluto / passito
  // Rosati
  'cerasuolo': 'rosato',
  'ramato': 'rosato',
  // Rossi
  'porpora': 'rosso',
  'rubino': 'rosso',
  'granato': 'rosso',
};

function tipologiaDaColore(colore) {
  if (!colore) return null;
  return COLORE_TIPOLOGIA[colore.toLowerCase()] || null;
}

// Restituisce le 9 famiglie SEMPRE complete (fedele alla scheda Assosommelier),
// ma all'interno mantiene solo le sottocategorie compatibili con la tipologia.
// Una famiglia che non ha sottocategorie compatibili viene mostrata vuota (consente comunque la selezione manuale).
function getFamiglieCompatibili(tipologia) {
  if (!tipologia) return AROMI;

  // Gli spumanti specifici (spumante_bianco/rosato/rosso) si comportano come
  // i loro corrispondenti fermi, perché i sentori dipendono dal vino base
  // e non dalla presenza di anidride carbonica.
  let tipoFiltro = tipologia;
  if (tipologia === 'spumante_bianco') tipoFiltro = 'bianco';
  else if (tipologia === 'spumante_rosato') tipoFiltro = 'rosato';
  else if (tipologia === 'spumante_rosso') tipoFiltro = 'rosso';

  const result = {};
  for (const [key, fam] of Object.entries(AROMI)) {
    const newFam = { label: fam.label, color: fam.color, subcategories: {} };
    for (const [subKey, sub] of Object.entries(fam.subcategories)) {
      if (sub.compat && !sub.compat.includes(tipoFiltro)) continue;
      newFam.subcategories[subKey] = sub;
    }
    // Includi SEMPRE la famiglia (anche se vuota) — fedeltà alla scheda Assosommelier
    result[key] = newFam;
  }
  return result;
}

function getProfiloVitigno(nomeVitigno) {
  if (!nomeVitigno) return null;
  const key = nomeVitigno.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/'/g, '')
    .replace(/è/g, 'e').replace(/é/g, 'e')
    .replace(/à/g, 'a').replace(/ò/g, 'o');
  return PROFILI_VITIGNO[key] || null;
}

function isSentoreTipico(sentore, profili) {
  if (!profili || profili.length === 0) return false;
  return profili.some(p => p.sentori_tipici.includes(sentore));
}
