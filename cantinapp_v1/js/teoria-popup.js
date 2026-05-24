// ============================================================
// CantinApp - Sistema bottom-sheet teoria
// Aggiunge icone ⓘ accanto ai chip e gestisce il popup
// ============================================================

(function() {
  'use strict';

  // ---- Crea elementi UI bottom-sheet (una sola volta) ----
  function ensureBottomSheet() {
    if (document.getElementById('teoria-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'teoria-overlay';
    overlay.className = 'teoria-overlay';
    overlay.innerHTML = `
      <div class="teoria-sheet" id="teoria-sheet">
        <div class="teoria-handle"></div>
        <div class="teoria-content">
          <h3 id="teoria-titolo">Titolo</h3>
          <div class="teoria-sezione">
            <div class="teoria-label">Definizione Assosommelier</div>
            <div id="teoria-definizione" class="teoria-testo"></div>
          </div>
          <div class="teoria-sezione" id="teoria-cosa-significa-wrap">
            <div class="teoria-label">In pratica</div>
            <div id="teoria-cosa-significa" class="teoria-testo"></div>
          </div>
          <div class="teoria-pagina" id="teoria-pagina"></div>
        </div>
        <button class="teoria-close" id="teoria-close">Chiudi</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Eventi chiusura
    document.getElementById('teoria-close').addEventListener('click', closeTeoria);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeTeoria();
    });

    // Swipe down per chiudere
    let startY = 0, currentY = 0, dragging = false;
    const sheet = document.getElementById('teoria-sheet');
    const handle = sheet.querySelector('.teoria-handle');
    handle.addEventListener('touchstart', function(e) {
      startY = e.touches[0].clientY;
      dragging = true;
    });
    handle.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const dy = currentY - startY;
      if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
    });
    handle.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      const dy = currentY - startY;
      sheet.style.transform = '';
      if (dy > 80) closeTeoria();
    });
  }

  // ---- Apri popup ----
  function openTeoria(key) {
    ensureBottomSheet();
    const data = window.TEORIA && window.TEORIA[key];
    if (!data) {
      console.warn('[teoria] chiave non trovata:', key);
      return;
    }
    document.getElementById('teoria-titolo').textContent = data.titolo;
    document.getElementById('teoria-definizione').textContent = data.definizione || '';
    const csWrap = document.getElementById('teoria-cosa-significa-wrap');
    if (data.cosa_significa) {
      csWrap.style.display = 'block';
      document.getElementById('teoria-cosa-significa').textContent = data.cosa_significa;
    } else {
      csWrap.style.display = 'none';
    }
    const pg = document.getElementById('teoria-pagina');
    pg.textContent = data.pagina ? `Manuale Assosommelier — pagina ${data.pagina}` : '';

    document.getElementById('teoria-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTeoria() {
    const overlay = document.getElementById('teoria-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Esponi globalmente per uso da pagina teoria
  window.openTeoria = openTeoria;
  window.closeTeoria = closeTeoria;

  // ---- Aggiunge ⓘ ai chip secondo la mappa ----
  function decorateChips() {
    if (!window.TEORIA_MAP) return;

    // CHIPS (data-v) — cerca tutti i contenitori .chips con id che inizia con "chips"
    document.querySelectorAll('.chips').forEach(container => {
      const id = container.id || '';
      // mappiamo l'id contenitore alla chiave del tipo
      let tipo = null;
      const idMap = {
        chipsColore: 'colore',
        chipsRiflesso: 'riflesso',
        chipsDensita: 'densita',
        chipsLimpidezza: 'limpidezza',
        chipsVivacita: 'vivacita',
        chipsPerlage: 'perlage_grana',
        chipsZucchero: 'zucchero',
        chipsAlcol: 'alcol',
        chipsAcidita: 'acidita',
        chipsTannino: 'tannino',
        chipsSapidita: 'sapidita',
        chipsChiusura: 'chiusura',
        chipsProspettive: 'prospettive',
      };
      tipo = idMap[id];
      if (!tipo) return;

      container.querySelectorAll('.chip').forEach(chip => {
        const v = chip.getAttribute('data-v');
        if (!v) return;
        const mapKey = `${tipo}:${v}`;
        const teoriaKey = window.TEORIA_MAP[mapKey];
        if (!teoriaKey || !window.TEORIA[teoriaKey]) return;
        addInfoIcon(chip, teoriaKey);
      });
    });

    // SCALE NUMERICHE — cerca .scale-row
    const scaleIdMap = {
      scaleComplessita: 'complessita',
      scaleOlfattoQualita: 'qualita_olf',
      scaleEquilibrio: 'equilibrio',
      scalePersistenza: 'persistenza',
      scaleGustoQualita: 'qualita_gust',
      scaleDimensioni: 'dimensione',
    };
    document.querySelectorAll('.scale-row').forEach(container => {
      const tipo = scaleIdMap[container.id];
      if (!tipo) return;
      container.querySelectorAll('.scale-btn').forEach(btn => {
        const v = btn.getAttribute('data-v');
        const lbl = btn.getAttribute('data-lbl');
        let teoriaKey = null;
        // Per dimensione usiamo il label, per le altre il valore numerico
        if (tipo === 'dimensione' && lbl) {
          teoriaKey = window.TEORIA_SCALA[`${tipo}:${lbl}`];
        } else if (v) {
          teoriaKey = window.TEORIA_SCALA[`${tipo}:${v}`];
        }
        if (!teoriaKey || !window.TEORIA[teoriaKey]) return;
        addInfoIcon(btn, teoriaKey, 'scale');
      });
    });

    // FAMIGLIE OLFATTIVE (fam-chip con data-key)
    document.querySelectorAll('.fam-chip[data-key]').forEach(el => {
      const fam = el.getAttribute('data-key');
      const mapKey = `olfatto:${fam}`;
      const teoriaKey = window.TEORIA_MAP[mapKey];
      if (!teoriaKey || !window.TEORIA[teoriaKey]) return;
      addInfoIcon(el, teoriaKey);
    });

    // FAMIGLIE OLFATTIVE legacy (data-fam, mantenuto per compatibilità)
    document.querySelectorAll('[data-fam]').forEach(el => {
      const fam = el.getAttribute('data-fam');
      const mapKey = `olfatto:${fam}`;
      const teoriaKey = window.TEORIA_MAP[mapKey];
      if (!teoriaKey || !window.TEORIA[teoriaKey]) return;
      addInfoIcon(el, teoriaKey);
    });

    // FIELD-LABELS principali (titoli di sezione)
    const labelMap = {
      'Equilibrio': 'equilibrio.intro',
      'Persistenza': 'persistenza.intro',
      'Sapidità': 'sapidita.intro',
      'Chiusura di bocca': 'chiusura.intro',
      'Qualità gustativa': 'qualita_gust.intro',
      'Dimensioni': 'dimensione.intro',
      'Prospettive di consumo': 'prospettive.intro',
      'Acidità': 'acidita.intro',
      'Tannino': 'tannino.descrizione_generale',
      'Densità cromatica': 'densita_cromatica.intro',
      'Limpidezza': 'limpidezza.intro',
      'Vivacità': 'vivacita.intro',
      'Perlage': 'perlage.intro',
      'Riflesso': 'riflesso.intro',
      'Colore': 'visivo.colore_intro',
    };
    document.querySelectorAll('.field-label').forEach(lbl => {
      const txt = lbl.textContent.trim();
      const key = labelMap[txt];
      if (key && window.TEORIA[key]) {
        addInfoIcon(lbl, key, 'label');
      }
    });
  }

  function addInfoIcon(target, teoriaKey, mode) {
    if (target.querySelector('.teoria-info-icon')) return; // già aggiunto
    const icon = document.createElement('span');
    icon.className = 'teoria-info-icon';
    icon.textContent = 'ⓘ';
    icon.title = 'Cosa significa?';
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      openTeoria(teoriaKey);
    });
    target.appendChild(icon);
  }

  // ---- Avvio dopo DOMContentLoaded e dopo ogni mutation della scheda ----
  function init() {
    decorateChips();
    // Re-decora periodicamente per coprire elementi aggiunti dinamicamente
    const observer = new MutationObserver(decorateChips);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
