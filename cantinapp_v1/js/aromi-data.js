// ============================================================
// CantinApp — Database Ruota degli Aromi del Vino
// Basato sulla Ruota Assosommelier
// ============================================================

// Struttura: famiglie → sottocategorie → sentori specifici
// Ogni famiglia ha un colore (palette Assosommelier) e una compatibilità
// con le tipologie di vino (rosso, bianco, rosato, spumante, passito, liquoroso)

const AROMI = {
  fruttato_vino_bianco: {
    label: 'Fruttato (vino bianco)',
    family: 'fruttato',
    color: '#F4D03F',
    compatible: ['bianco', 'spumante', 'passito'],
    subcategories: {
      agrumi: {
        label: 'Agrumi',
        sentori: ['limone', 'lime', 'pompelmo']
      },
      bacche_bianche: {
        label: 'Bacche bianche',
        sentori: ['uva spina']
      },
      pomacee: {
        label: 'Pomacee',
        sentori: ['pera', 'mela', 'mela verde']
      },
      drupacee: {
        label: 'Drupacee',
        sentori: ['pesca', 'melone']
      },
      frutti_tropicali: {
        label: 'Frutti tropicali',
        sentori: ['guaiava', 'ananas', 'frutto della passione', 'litchi']
      },
      botritizzato: {
        label: 'Botritizzato',
        sentori: ['albicocca secca', 'scorza d\'arancia']
      }
    }
  },
  fruttato_vino_rosso: {
    label: 'Fruttato (vino rosso)',
    family: 'fruttato',
    color: '#C0392B',
    compatible: ['rosso', 'rosato', 'passito', 'liquoroso'],
    subcategories: {
      frutti_tropicali_rosso: {
        label: 'Frutti tropicali',
        sentori: ['banana']
      },
      bacche_rosse: {
        label: 'Bacche rosse',
        sentori: ['lampone', 'ribes nero', 'fragola', 'mora']
      },
      drupacee_rosso: {
        label: 'Drupacee',
        sentori: ['ciliegia']
      },
      fortificato: {
        label: 'Fortificato',
        sentori: ['prugna', 'prugna secca']
      }
    }
  },
  floreali: {
    label: 'Floreali',
    family: 'floreali',
    color: '#E8A0BF',
    compatible: ['rosso', 'bianco', 'rosato', 'spumante', 'passito'],
    subcategories: {
      fiori_bianchi: {
        label: 'Fiori bianchi',
        sentori: ['caprifoglio', 'biancospino', 'fiori d\'arancio', 'tiglio', 'gelsomino', 'acacia']
      },
      fiori_colorati: {
        label: 'Fiori colorati',
        sentori: ['rosa', 'lavanda', 'violetta']
      }
    }
  },
  vegetali: {
    label: 'Vegetali',
    family: 'vegetali',
    color: '#27AE60',
    compatible: ['rosso', 'bianco', 'rosato', 'spumante'],
    subcategories: {
      ortaggi: {
        label: 'Ortaggi',
        sentori: ['peperone', 'finocchio', 'pomodoro', 'erba tagliata', 'aneto']
      },
      erbe_fresche: {
        label: 'Erbe fresche',
        sentori: ['timo', 'felce', 'menta']
      },
      erbe_essiccate: {
        label: 'Erbe essiccate',
        sentori: ['fieno', 'tè nero', 'tabacco']
      },
      foglie: {
        label: 'Foglie',
        sentori: ['foglia di ribes nero', 'foglia di alloro', 'eucalipto']
      }
    }
  },
  minerale: {
    label: 'Minerale',
    family: 'minerale',
    color: '#2E5FA3',
    compatible: ['rosso', 'bianco', 'rosato', 'spumante'],
    subcategories: {
      minerale_gen: {
        label: 'Minerali',
        sentori: ['iodio', 'pietra focaia', 'cherosene']
      }
    }
  },
  affinamento_botte: {
    label: 'Affinamento botte',
    family: 'affinamento',
    color: '#6B4226',
    compatible: ['rosso', 'bianco', 'spumante', 'passito', 'liquoroso'],
    subcategories: {
      lievito: {
        label: 'Lievito / Malolattica',
        sentori: ['pane', 'burro']
      },
      tostato: {
        label: 'Tostato',
        sentori: ['caramello', 'cioccolato', 'pane tostato', 'caffè', 'bacon', 'fumo', 'catrame']
      },
      spezie: {
        label: 'Spezie',
        sentori: ['vaniglia', 'pepe', 'cannella', 'liquirizia', 'noce moscata', 'chiodi di garofano']
      },
      noci: {
        label: 'Noci',
        sentori: ['noce di cocco', 'nocciola', 'mandorla']
      },
      legno: {
        label: 'Legno',
        sentori: ['quercia', 'cedro', 'cèdre', 'pino']
      }
    }
  },
  vino_bianco_vecchio: {
    label: 'Vino bianco vecchio',
    family: 'evoluzione',
    color: '#8B7355',
    compatible: ['bianco', 'passito', 'liquoroso'],
    subcategories: {
      evoluzione_bianco: {
        label: 'Evoluzione',
        sentori: ['cotognata', 'miele', 'salsa di soia']
      }
    }
  },
  vino_rosso_vecchio: {
    label: 'Vino rosso vecchio',
    family: 'evoluzione',
    color: '#722F37',
    compatible: ['rosso', 'passito', 'liquoroso'],
    subcategories: {
      animale: {
        label: 'Animale',
        sentori: ['cuoio', 'sugo di carne']
      },
      sottobosco: {
        label: 'Sottobosco',
        sentori: ['tartufo', 'fungo', 'albero di muschio']
      }
    }
  }
};

// ============================================================
// PROFILI VITIGNO - aromi tipici evidenziati nella ruota dedicata
// Estratti dalle ruote vitigno-specifiche Assosommelier
// ============================================================

const PROFILI_VITIGNO = {
  // ===== ROSSI =====
  'sangiovese': {
    tipologia: 'rosso',
    sentori_tipici: [
      'ciliegia', 'lampone', 'fragola', 'mora', 'prugna',
      'violetta', 'rosa',
      'tabacco', 'tè nero', 'foglia di alloro',
      'spezie', 'liquirizia', 'pepe', 'cannella',
      'tostato', 'tabacco', 'cuoio',
      'minerale_gen'
    ]
  },
  'nebbiolo': {
    tipologia: 'rosso',
    sentori_tipici: [
      'ciliegia', 'lampone', 'prugna', 'prugna secca',
      'rosa', 'violetta',
      'tabacco', 'tè nero', 'foglia di alloro',
      'liquirizia', 'cannella', 'pepe', 'noce moscata',
      'cuoio', 'tartufo', 'fungo',
      'catrame', 'caffè', 'cioccolato',
      'goudron', 'cedro'
    ]
  },
  'cabernet_sauvignon': {
    tipologia: 'rosso',
    sentori_tipici: [
      'ribes nero', 'mora', 'ciliegia',
      'violetta', 'caprifoglio',
      'peperone', 'foglia di ribes nero', 'eucalipto', 'menta',
      'cedro', 'tabacco',
      'vaniglia', 'pepe', 'liquirizia',
      'tostato', 'caffè', 'cioccolato', 'pane tostato'
    ]
  },
  'merlot': {
    tipologia: 'rosso',
    sentori_tipici: [
      'prugna', 'mora', 'ciliegia', 'fragola', 'ribes nero',
      'violetta', 'rosa',
      'foglia di alloro',
      'cioccolato', 'cacao', 'caffè',
      'vaniglia', 'cannella', 'noce moscata',
      'cuoio', 'tabacco'
    ]
  },
  'cabernet_franc': {
    tipologia: 'rosso',
    sentori_tipici: [
      'lampone', 'fragola', 'ribes nero',
      'peperone', 'foglia di ribes nero', 'tabacco',
      'violetta',
      'pepe', 'cannella', 'liquirizia',
      'cedro', 'matita'
    ]
  },
  'pinot_nero': {
    tipologia: 'rosso',
    sentori_tipici: [
      'ciliegia', 'fragola', 'lampone', 'mora',
      'rosa', 'violetta',
      'fungo', 'tartufo', 'sottobosco',
      'cuoio', 'spezie',
      'caffè', 'cioccolato', 'pane tostato',
      'vaniglia', 'noce moscata'
    ]
  },
  'syrah': {
    tipologia: 'rosso',
    sentori_tipici: [
      'mora', 'ribes nero', 'prugna',
      'violetta', 'rosa',
      'pepe', 'pepe nero', 'cannella', 'liquirizia', 'chiodi di garofano',
      'cuoio', 'tabacco',
      'cioccolato', 'caffè',
      'fumo', 'catrame', 'bacon'
    ]
  },
  'gamay': {
    tipologia: 'rosso',
    sentori_tipici: [
      'fragola', 'lampone', 'ciliegia', 'mora',
      'violetta', 'rosa',
      'pepe', 'cannella',
      'banana', 'caramella'
    ]
  },
  'malbec': {
    tipologia: 'rosso',
    sentori_tipici: [
      'mora', 'prugna', 'ribes nero', 'ciliegia',
      'violetta',
      'cacao', 'cioccolato', 'caffè',
      'pepe', 'cannella', 'liquirizia',
      'cuoio', 'tabacco', 'vaniglia'
    ]
  },
  'grenache': {
    tipologia: 'rosso',
    sentori_tipici: [
      'fragola', 'lampone', 'ciliegia', 'mora', 'prugna',
      'rosa', 'lavanda',
      'pepe', 'cannella', 'liquirizia', 'erbe essiccate',
      'cuoio', 'tabacco'
    ]
  },
  'tempranillo': {
    tipologia: 'rosso',
    sentori_tipici: [
      'ciliegia', 'fragola', 'prugna', 'prugna secca',
      'rosa',
      'tabacco', 'foglia di alloro',
      'vaniglia', 'cannella', 'pepe', 'liquirizia',
      'cuoio', 'cioccolato', 'caffè',
      'cedro'
    ]
  },

  // ===== BIANCHI =====
  'chardonnay': {
    tipologia: 'bianco',
    sentori_tipici: [
      'mela', 'pera', 'pesca', 'melone', 'ananas',
      'limone', 'pompelmo',
      'caprifoglio', 'biancospino', 'acacia',
      'pietra focaia', 'iodio',
      'burro', 'pane',
      'vaniglia', 'noce di cocco', 'mandorla',
      'cannella', 'pane tostato', 'cioccolato'
    ]
  },
  'sauvignon_blanc': {
    tipologia: 'bianco',
    sentori_tipici: [
      'lime', 'limone', 'pompelmo', 'uva spina',
      'mela verde', 'pesca', 'frutto della passione',
      'biancospino', 'fiori d\'arancio',
      'foglia di ribes nero', 'erba tagliata', 'peperone',
      'menta', 'eucalipto', 'foglia di pomodoro',
      'pietra focaia', 'iodio'
    ]
  },
  'riesling': {
    tipologia: 'bianco',
    sentori_tipici: [
      'lime', 'limone', 'pompelmo',
      'mela verde', 'pera', 'pesca', 'albicocca secca',
      'litchi',
      'caprifoglio', 'gelsomino', 'tiglio',
      'miele', 'cotognata',
      'pietra focaia', 'cherosene', 'iodio'
    ]
  },
  'pinot_grigio': {
    tipologia: 'bianco',
    sentori_tipici: [
      'mela', 'pera', 'pesca',
      'limone',
      'biancospino', 'acacia',
      'mandorla', 'nocciola',
      'miele', 'cotognata'
    ]
  },
  'gewurztraminer': {
    tipologia: 'bianco',
    sentori_tipici: [
      'litchi', 'frutto della passione', 'ananas',
      'mela', 'pesca', 'albicocca secca',
      'rosa', 'fiori d\'arancio', 'gelsomino', 'caprifoglio',
      'cannella', 'chiodi di garofano', 'noce moscata', 'pepe',
      'miele'
    ]
  },
  'viognier': {
    tipologia: 'bianco',
    sentori_tipici: [
      'pesca', 'albicocca secca', 'mango', 'ananas',
      'fiori d\'arancio', 'caprifoglio', 'gelsomino',
      'miele',
      'vaniglia', 'cannella'
    ]
  },
  'chenin_blanc': {
    tipologia: 'bianco',
    sentori_tipici: [
      'mela', 'mela verde', 'pera', 'pesca', 'albicocca secca',
      'limone',
      'caprifoglio', 'fiori d\'arancio',
      'miele', 'cotognata',
      'pietra focaia', 'iodio',
      'fieno'
    ]
  },
  'semillon': {
    tipologia: 'bianco',
    sentori_tipici: [
      'mela', 'pera', 'pesca',
      'limone', 'scorza d\'arancia',
      'biancospino', 'caprifoglio',
      'miele', 'cotognata', 'albicocca secca',
      'fieno', 'cera d\'api',
      'vaniglia', 'tostato'
    ]
  }
};

// ============================================================
// HELPER: dato un vino, restituisce famiglie compatibili filtrate
// ============================================================

function getFamiglieCompatibili(tipologia) {
  const result = {};
  for (const [key, fam] of Object.entries(AROMI)) {
    if (fam.compatible.includes(tipologia)) {
      result[key] = fam;
    }
  }
  return result;
}

// Restituisce i sentori tipici di un vitigno (normalizza nome)
function getProfiloVitigno(nomeVitigno) {
  if (!nomeVitigno) return null;
  const key = nomeVitigno.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/'/g, '')
    .replace(/è/g, 'e').replace(/é/g, 'e')
    .replace(/à/g, 'a').replace(/ò/g, 'o');
  return PROFILI_VITIGNO[key] || null;
}

// Verifica se un sentore è "tipico" del vitigno dato
function isSentoreTipico(sentore, profili) {
  if (!profili || profili.length === 0) return false;
  return profili.some(p => p.sentori_tipici.includes(sentore));
}
