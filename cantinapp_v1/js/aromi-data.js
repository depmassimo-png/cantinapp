// ============================================================
// CantinApp — Database Aromi (Scheda Assosommelier)
// Ricostruito fedelmente dal Manuale Assosommelier pag. 87-95
//
// REGOLE DI CATEGORIZZAZIONE:
// • Fruttato: distingue STATO della frutta (fresca, matura,
//   sotto spirito, confettura, secca, liofilizzata) come sotto-categorie
// • Floreale: tre colori (bianchi, gialli, rossi/rosa) come da manuale
// • Vegetale: positivi (sottobosco, fieno) vs negativi (peperone, erba)
// • Minerale: terreni (gesso, pietra focaia, polvere da sparo, silice)
// • Erbe aromatiche: erbe officinali (basilico, salvia, tiglio...)
// • Speziato: barrique (vaniglia, chiodi di garofano) vs legno grande
//   (liquirizia, noce moscata) vs varietali (pepe nero, anice)
// • Tostato: dalla barrique - include cuoio/tabacco/goudron secondo
//   la classificazione Assosommelier
// • Balsamico: positivi (menta, eucalipto, conifera, incenso)
// • Etereo: positivi (sapone, cera, gommalacca) vs negativi (acetone,
//   vernice, smalto)
// • Sentori diversi: distribuiti nelle famiglie pertinenti (miele in
//   Floreale, tartufo in Vegetale, foxy in Vegetale, gibier in Etereo,
//   crosta di pane in Tostato, pipì di gatto/bosso in Vegetale,
//   legno antiquario in Etereo)
// • Difetti: NON inclusi nel dataset principale (gestiti a parte come
//   sezione "Difetti" nel wizard)
// ============================================================

const AROMI = {
  fruttato: {
    label: 'Fruttato',
    color: '#C0392B',
    subcategories: {
      // ---- BIANCHI / ROSATI / SPUMANTI BIANCHI ----
      agrumi: {
        label: 'Agrumi',
        compat: ['bianco', 'spumante', 'rosato', 'passito'],
        sentori: ['limone', 'lime', 'pompelmo', 'pompelmo rosa', 'arancia', "scorza d'arancia", 'cedro', 'mandarino', 'bergamotto', 'agrumi canditi']
      },
      polpa_bianca: {
        label: 'Frutta a polpa bianca',
        compat: ['bianco', 'spumante', 'rosato'],
        sentori: ['mela', 'mela verde', 'mela golden', 'pera', 'pera williams', 'pesca bianca', 'uva spina', 'cotogna', 'cotognata', 'fico bianco', 'kiwi']
      },
      polpa_gialla: {
        label: 'Frutta a polpa gialla',
        compat: ['bianco', 'spumante', 'rosato', 'passito'],
        sentori: ['pesca gialla', 'albicocca', 'susina gialla', 'nespola', 'melone', 'melone bianco']
      },
      frutti_tropicali: {
        label: 'Frutti tropicali',
        compat: ['bianco', 'spumante', 'passito'],
        sentori: ['ananas', 'banana', 'mango', 'papaia', 'guaiava', 'frutto della passione', 'litchi', 'maracuja']
      },
      // ---- ROSSI / ROSATI / SPUMANTI ROSSI ----
      frutti_rossi: {
        label: 'Frutti rossi',
        compat: ['rosso', 'rosato', 'spumante'],
        sentori: ['ciliegia', 'lampone', 'fragola', 'fragolina di bosco', 'ribes rosso', 'melograno', 'amarena']
      },
      frutti_scuri: {
        label: 'Frutti scuri / Bacche nere',
        compat: ['rosso', 'rosato', 'spumante'],
        sentori: ['mora', 'mora di rovo', 'ribes nero', 'cassis', 'mirtillo', 'mirtillo nero', 'sambuco', 'gelso nero']
      },
      drupacee_rosse: {
        label: 'Drupacee scure',
        compat: ['rosso', 'rosato', 'passito'],
        sentori: ['prugna', 'prugna nera', 'marasca', 'visciola']
      },
      // ---- STATI / EVOLUZIONI DEL FRUTTO ----
      frutta_matura: {
        label: 'Frutta matura',
        compat: ['rosso', 'bianco', 'rosato', 'passito', 'liquoroso'],
        sentori: ['frutta matura', 'frutta surmatura', 'frutta a maturazione spinta']
      },
      frutta_sotto_spirito: {
        label: 'Frutta sotto spirito',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['ciliegia sotto spirito', 'amarena sotto spirito', 'prugna sotto spirito', 'frutta sotto spirito']
      },
      confetture: {
        label: 'Confetture',
        compat: ['rosso', 'passito', 'liquoroso', 'bianco'],
        sentori: ['confettura di prugne', 'confettura di mirtilli', 'confettura di ciliegie', 'confettura di lamponi', 'marmellata di agrumi', 'marmellata di pesche']
      },
      frutta_secca: {
        label: 'Frutta secca',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['fico secco', 'dattero', 'uva passa', 'prugna secca', 'albicocca secca', 'frutta candita']
      },
      frutta_liofilizzata: {
        label: 'Frutta liofilizzata',
        compat: ['passito', 'liquoroso'],
        sentori: ['frutta liofilizzata', 'lampone liofilizzato', 'fragola liofilizzata']
      },
      frutti_guscio: {
        label: 'Frutti col guscio',
        compat: ['bianco', 'rosso', 'passito', 'liquoroso'],
        sentori: ['mandorla', 'nocciola', 'noce', 'pinolo', 'pistacchio']
      }
    }
  },

  floreale: {
    label: 'Floreale',
    color: '#E8A0BF',
    subcategories: {
      fiori_bianchi: {
        label: 'Fiori bianchi',
        compat: ['bianco', 'spumante', 'rosato', 'passito'],
        sentori: ['iris bianco', 'giglio', 'gardenia', 'gelsomino', 'magnolia', 'biancospino', 'fiori di mandorlo', 'fiori di pesco', 'mughetto', 'sambuco']
      },
      fiori_gialli: {
        label: 'Fiori gialli',
        compat: ['bianco', 'spumante', 'rosato', 'passito'],
        sentori: ['acacia', 'mimosa', 'ginestra', 'tiglio', 'camomilla', "fiori d'arancio", 'caprifoglio']
      },
      fiori_rossi: {
        label: 'Fiori rossi e rosa',
        compat: ['rosso', 'rosato', 'spumante'],
        sentori: ['rosa', 'rosa rossa', 'violetta', 'peonia', 'ibisco', 'glicine', 'lavanda']
      },
      fiori_appassiti: {
        label: 'Fiori appassiti',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['rosa appassita', 'violetta appassita', 'fiori appassiti', 'potpourri']
      },
      fiori_campo: {
        label: 'Fiori di campo',
        compat: ['bianco', 'rosato', 'spumante', 'rosso'],
        sentori: ['fiori di campo', 'fiori freschi']
      },
      miele: {
        label: 'Miele',
        compat: ['bianco', 'passito', 'liquoroso'],
        sentori: ['miele di acacia', 'miele millefiori', 'miele di castagno', 'miele', 'cera d\'api']
      }
    }
  },

  vegetale: {
    label: 'Vegetale',
    color: '#27AE60',
    subcategories: {
      vegetale_positivo: {
        label: 'Vegetali positivi',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['fieno', 'paglia', 'sottobosco', 'muschio', 'felce', 'foglia di tè', 'tè verde', 'tè nero']
      },
      vegetale_negativo: {
        label: 'Vegetali da scarsa maturità',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['peperone verde', 'erba tagliata', 'pomodoro fresco', 'foglia di pomodoro', 'foglia di ribes nero', 'melanzana', 'foglia di violetta']
      },
      ortaggi: {
        label: 'Ortaggi',
        compat: ['bianco', 'rosato', 'spumante', 'rosso'],
        sentori: ['asparago', 'carciofo', 'finocchio', 'piselli', 'cetriolo', 'passata di pomodoro']
      },
      sottobosco_evoluto: {
        label: 'Sottobosco evoluto',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['fungo', 'fungo porcino', 'tartufo', 'tartufo bianco', 'tartufo nero', 'humus', 'terra umida']
      },
      bosso: {
        label: 'Bosso e solforati varietali',
        compat: ['bianco', 'spumante'],
        sentori: ['bosso', 'pipì di gatto']
      },
      sentori_animali: {
        label: 'Sentori vinosi/animali (specifici)',
        compat: ['rosso'],
        sentori: ['foxy', 'vinoso']
      }
    }
  },

  minerale: {
    label: 'Minerale',
    color: '#7F8C8D',
    subcategories: {
      pietre_terreni: {
        label: 'Pietre e terreni',
        compat: ['rosso', 'bianco', 'rosato', 'spumante', 'passito'],
        sentori: ['pietra focaia', 'silice', 'gesso', 'grafite', 'pietra bagnata', 'pietra di fiume', 'ardesia', 'tufo']
      },
      ossidanti: {
        label: 'Note ossidanti',
        compat: ['rosso', 'bianco', 'rosato', 'spumante', 'passito'],
        sentori: ['polvere da sparo', 'fumé', 'fumo di candela', 'idrocarburi', 'cherosene', 'nafta']
      },
      marini: {
        label: 'Note marine',
        compat: ['bianco', 'spumante', 'rosato'],
        sentori: ['iodio', 'salmastro', 'salato', 'alga', 'conchiglia']
      }
    }
  },

  erbe_aromatiche: {
    label: 'Erbe aromatiche',
    color: '#7AAB45',
    subcategories: {
      erbe_fresche: {
        label: 'Erbe fresche (terpenico-aromatiche)',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['basilico', 'salvia', 'timo', 'rosmarino', 'maggiorana', 'origano fresco', 'menta', 'menta piperita', 'erba luigia', 'verbena']
      },
      erbe_officinali: {
        label: 'Erbe officinali ed essiccate',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['alloro', 'origano secco', 'tè', 'erbe officinali', 'macchia mediterranea', 'erbe alpine']
      }
    }
  },

  speziato: {
    label: 'Speziato',
    color: '#A06B30',
    subcategories: {
      spezie_dolci: {
        label: 'Spezie dolci (barrique)',
        compat: ['rosso', 'bianco', 'passito', 'spumante', 'liquoroso'],
        sentori: ['vaniglia', 'cannella', 'chiodi di garofano', 'noce moscata', 'cardamomo', 'anice', 'anice stellato']
      },
      spezie_legno_grande: {
        label: 'Spezie da legno grande',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['liquirizia', 'noce moscata', 'macis']
      },
      spezie_piccanti: {
        label: 'Spezie piccanti',
        compat: ['rosso', 'rosato', 'liquoroso', 'bianco'],
        sentori: ['pepe nero', 'pepe bianco', 'pepe verde', 'pepe rosa', 'paprika', 'peperoncino', 'zenzero', 'ginepro']
      },
      spezie_orientali: {
        label: 'Spezie orientali/colorate',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso'],
        sentori: ['curcuma', 'zafferano', 'curry', 'pimento']
      }
    }
  },

  tostato: {
    label: 'Tostato',
    color: '#6B4226',
    subcategories: {
      tostature_barrique: {
        label: 'Tostature da barrique',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso', 'spumante'],
        sentori: ['vaniglia tostata', 'cioccolato', 'cioccolato fondente', 'cacao', 'caffè', 'caffè tostato', 'caramello', 'crème brûlée']
      },
      affumicato: {
        label: 'Affumicati',
        compat: ['rosso', 'liquoroso', 'bianco'],
        sentori: ['fumo', 'affumicato', 'fumo di legna', 'fumo di candela', 'arrosto']
      },
      empireumatici: {
        label: 'Sentori empireumatici (legno tostato)',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['goudron', 'catrame', 'pece', 'creosoto', 'bitume', 'asfalto']
      },
      tabacco_cuoio: {
        label: 'Tabacco e cuoio',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['tabacco', 'tabacco dolce', 'tabacco da pipa', 'cuoio', 'cuoio conciato', 'pellame']
      },
      frutta_secca_tostata: {
        label: 'Frutta secca tostata',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso', 'spumante'],
        sentori: ['mandorla tostata', 'nocciola tostata', 'noce tostata', 'arachide tostata', 'pinolo tostato']
      },
      pane_lieviti: {
        label: 'Pane e lieviti (metodo classico)',
        compat: ['spumante', 'bianco'],
        sentori: ['crosta di pane', 'pane tostato', 'lievito', 'pasticceria', 'burro', 'biscotto', 'pan brioche']
      }
    }
  },

  balsamico: {
    label: 'Balsamico',
    color: '#16A085',
    subcategories: {
      balsamici_giovani: {
        label: 'Balsamici (vini giovani)',
        compat: ['rosso', 'bianco', 'rosato', 'spumante'],
        sentori: ['menta', 'menta piperita', 'eucalipto', 'eucalipto fresco']
      },
      balsamici_evoluti: {
        label: 'Balsamici (evolutivi)',
        compat: ['rosso', 'passito', 'liquoroso'],
        sentori: ['incenso', 'mirra', 'resina', 'pino', 'conifera', 'abete', 'ginepro']
      }
    }
  },

  etereo: {
    label: 'Etereo',
    color: '#9B59B6',
    subcategories: {
      etereo_evolutivo: {
        label: 'Etereo evolutivo (positivi)',
        compat: ['rosso', 'bianco', 'passito', 'liquoroso', 'spumante'],
        sentori: ['sapone', 'sapone di Marsiglia', 'cera', 'cera d\'api', 'gommalacca', 'ceralacca', 'legno antico', 'legno antiquario']
      },
      etereo_negativo: {
        label: 'Etereo da alcol poco integrato (negativi)',
        compat: ['rosso', 'bianco', 'rosato', 'spumante', 'passito', 'liquoroso'],
        sentori: ['acetone', 'vernice', 'smalto', 'colla', 'solvente']
      },
      animali_selvaggina: {
        label: 'Animali / Selvaggina',
        compat: ['rosso', 'passito'],
        sentori: ['gibier', 'selvaggina', 'sugo di carne', 'salumi', 'sangue', 'rustico']
      }
    }
  }
};// ============================================================
// PROFILI VITIGNO — sentori tipici evidenziati con ★
// ============================================================

const PROFILI_VITIGNO = {
  'sangiovese': { tipologia: 'rosso', sentori_tipici: ['ciliegia','lampone','fragola','mora','prugna','amarena','violetta','rosa','tabacco','tè nero','alloro','liquirizia','pepe nero','cannella','cuoio'] },
  'nebbiolo': { tipologia: 'rosso', sentori_tipici: ['ciliegia','lampone','prugna','prugna secca','amarena','rosa','rosa appassita','violetta','tabacco','tè nero','alloro','liquirizia','cannella','pepe nero','noce moscata','cuoio','tartufo','fungo','catrame','caffè','cacao','goudron'] },
  'cabernet_sauvignon': { tipologia: 'rosso', sentori_tipici: ['ribes nero','mora','ciliegia','prugna','violetta','peperone verde','foglia di ribes nero','eucalipto','menta','tabacco','vaniglia','pepe nero','liquirizia','caffè','cacao','pane tostato'] },
  'merlot': { tipologia: 'rosso', sentori_tipici: ['prugna','mora','ciliegia','fragola','ribes nero','violetta','rosa','alloro','cacao','cioccolato','caffè','vaniglia','cannella','noce moscata','cuoio','tabacco'] },
  'cabernet_franc': { tipologia: 'rosso', sentori_tipici: ['lampone','fragola','ribes nero','peperone verde','foglia di ribes nero','tabacco','violetta','pepe nero','cannella','liquirizia'] },
  'pinot_nero': { tipologia: 'rosso', sentori_tipici: ['ciliegia','fragola','lampone','mora','amarena','rosa','violetta','fungo','tartufo','muschio','cuoio','caffè','cacao','pane tostato','vaniglia','noce moscata'] },
  'syrah': { tipologia: 'rosso', sentori_tipici: ['mora','ribes nero','prugna','violetta','rosa','pepe nero','pepe bianco','cannella','liquirizia','chiodi di garofano','cuoio','tabacco','cacao','caffè','fumo','catrame','fumo'] },
  'gamay': { tipologia: 'rosso', sentori_tipici: ['fragola','lampone','ciliegia','mora','amarena','violetta','rosa','pepe nero','cannella','banana'] },
  'malbec': { tipologia: 'rosso', sentori_tipici: ['mora','prugna','ribes nero','ciliegia','violetta','cacao','cioccolato','caffè','pepe nero','cannella','liquirizia','cuoio','tabacco','vaniglia'] },
  'grenache': { tipologia: 'rosso', sentori_tipici: ['fragola','lampone','ciliegia','mora','prugna','rosa','lavanda','pepe nero','cannella','liquirizia','cuoio','tabacco','fieno'] },
  'tempranillo': { tipologia: 'rosso', sentori_tipici: ['ciliegia','fragola','prugna','prugna secca','rosa','tabacco','alloro','vaniglia','cannella','pepe nero','liquirizia','cuoio','cacao','caffè'] },
  'chardonnay': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca gialla','pesca bianca','melone','ananas','limone','pompelmo','caprifoglio','biancospino','acacia','pietra focaia','iodio','vaniglia','noce tostata','mandorla','nocciola','cannella','pane tostato','caramello'] },
  'sauvignon_blanc': { tipologia: 'bianco', sentori_tipici: ['lime','limone','pompelmo','uva spina','mela verde','pesca gialla','frutto della passione','biancospino',"fiori d'arancio",'sambuco','foglia di ribes nero','erba tagliata','peperone verde','asparago','menta','eucalipto','foglia di pomodoro','pietra focaia','iodio'] },
  'riesling': { tipologia: 'bianco', sentori_tipici: ['lime','limone','pompelmo','mela verde','pera','pesca gialla','albicocca secca','litchi','caprifoglio','gelsomino','tiglio','cotognata','pietra focaia','cherosene','iodio'] },
  'pinot_grigio': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca gialla','limone','biancospino','acacia','mandorla','nocciola','cotognata'] },
  'gewurztraminer': { tipologia: 'bianco', sentori_tipici: ['litchi','frutto della passione','ananas','mela','pesca gialla','albicocca secca','rosa',"fiori d'arancio",'gelsomino','caprifoglio','cannella','chiodi di garofano','noce moscata','pepe bianco','zenzero'] },
  'viognier': { tipologia: 'bianco', sentori_tipici: ['pesca gialla','albicocca secca','mango','ananas',"fiori d'arancio",'caprifoglio','gelsomino','vaniglia','cannella'] },
  'chenin_blanc': { tipologia: 'bianco', sentori_tipici: ['mela','mela verde','pera','pesca gialla','albicocca secca','limone','caprifoglio',"fiori d'arancio",'cotognata','pietra focaia','iodio','fieno'] },
  'semillon': { tipologia: 'bianco', sentori_tipici: ['mela','pera','pesca gialla','limone',"scorza d'arancia",'biancospino','caprifoglio','cotognata','albicocca secca','fieno','cera','vaniglia'] }
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
