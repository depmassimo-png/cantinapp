// ============================================================
// CantinApp — Supabase client
// ============================================================

// Versione corrente dell'app (mostrata in piccolo nel footer)
const APP_VERSION = 'v0.67';

const SUPABASE_URL = 'https://cihnssnqlqydnckwispb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaG5zc25xbHF5ZG5ja3dpc3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDM3NjksImV4cCI6MjA5NTAxOTc2OX0.ptxM667Y1d8fOqpVwD4HhX87zsHzo-oAh45M8MP2Bwc';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inietta la versione in tutte le pagine, in piccolo accanto al brand
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mostra accanto al brand-name (se presente)
  const brandName = document.querySelector('.brand-name');
  if (brandName && !brandName.querySelector('.app-version')) {
    const span = document.createElement('span');
    span.className = 'app-version';
    span.textContent = APP_VERSION;
    span.style.cssText = 'font-size:9px;color:rgba(201,168,76,0.55);font-weight:500;margin-left:6px;vertical-align:middle;letter-spacing:0.3px';
    brandName.appendChild(span);
  }
  // 2. Versione in footer per pagine senza header (es. statistiche)
  if (!brandName && !document.getElementById('appVersionFooter')) {
    const div = document.createElement('div');
    div.id = 'appVersionFooter';
    div.textContent = 'CantinApp ' + APP_VERSION;
    div.style.cssText = 'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.4px;z-index:50;pointer-events:none';
    document.body.appendChild(div);
  }
});
