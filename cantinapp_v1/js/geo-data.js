// ============================================================
// CantinApp — Dataset Nazioni e Regioni vinicole
// ============================================================

// Nazioni vinicole più rilevanti, ordinate per tradizione enologica.
// Posso aggiungere "Altro" alla fine per casi non coperti.
const NAZIONI = [
  { code: 'IT', name: 'Italia',        flag: '🇮🇹' },
  { code: 'FR', name: 'Francia',       flag: '🇫🇷' },
  { code: 'ES', name: 'Spagna',        flag: '🇪🇸' },
  { code: 'PT', name: 'Portogallo',    flag: '🇵🇹' },
  { code: 'DE', name: 'Germania',      flag: '🇩🇪' },
  { code: 'AT', name: 'Austria',       flag: '🇦🇹' },
  { code: 'CH', name: 'Svizzera',      flag: '🇨🇭' },
  { code: 'GR', name: 'Grecia',        flag: '🇬🇷' },
  { code: 'HU', name: 'Ungheria',      flag: '🇭🇺' },
  { code: 'SI', name: 'Slovenia',      flag: '🇸🇮' },
  { code: 'HR', name: 'Croazia',       flag: '🇭🇷' },
  { code: 'GE', name: 'Georgia',       flag: '🇬🇪' },
  { code: 'US', name: 'Stati Uniti',   flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina',     flag: '🇦🇷' },
  { code: 'CL', name: 'Cile',          flag: '🇨🇱' },
  { code: 'AU', name: 'Australia',     flag: '🇦🇺' },
  { code: 'NZ', name: 'Nuova Zelanda', flag: '🇳🇿' },
  { code: 'ZA', name: 'Sudafrica',     flag: '🇿🇦' },
  { code: 'OTHER', name: 'Altro',      flag: '🌍' },
];

// 20 regioni italiane (ordine alfabetico)
const REGIONI_IT = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  "Valle d'Aosta",
  'Veneto',
];

// Helper: genera options HTML per il select Nazione
function nazioniOptionsHtml(selectedName) {
  let html = '<option value="">— Scegli nazione —</option>';
  for (const n of NAZIONI) {
    const sel = n.name === selectedName ? ' selected' : '';
    html += `<option value="${n.name}"${sel}>${n.flag} ${n.name}</option>`;
  }
  return html;
}

// Helper: genera options HTML per il select Regione italiana
function regioniOptionsHtml(selectedRegione) {
  let html = '<option value="">— Scegli regione —</option>';
  for (const r of REGIONI_IT) {
    const sel = r === selectedRegione ? ' selected' : '';
    html += `<option value="${r}"${sel}>${r}</option>`;
  }
  // Se la regione corrente non è in lista, la aggiunge come "personalizzata" per non perderla
  if (selectedRegione && !REGIONI_IT.includes(selectedRegione)) {
    html += `<option value="${selectedRegione}" selected>${selectedRegione} (personalizzata)</option>`;
  }
  return html;
}
