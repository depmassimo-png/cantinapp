// ============================================================
// CantinApp — Supabase client
// ============================================================

// Versione corrente dell'app (mostrata in piccolo nel footer)
const APP_VERSION = 'v1.15';

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

  // 3. Inietta la voce di ruolo nella bottom-nav:
  //    Admin (con badge richieste aperte) se admin, altrimenti Contatta.
  setTimeout(() => setupNavRuolo(), 500);
});

// Stile del badge numerico sull'icona Admin (iniettato una sola volta)
function ensureNavRuoloStyle() {
  if (document.getElementById('nav-ruolo-style')) return;
  const st = document.createElement('style');
  st.id = 'nav-ruolo-style';
  st.textContent = `
    .nav-ruolo-icon { position: relative; display: inline-flex; }
    .nav-badge {
      position: absolute; top: -6px; right: -10px;
      min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box;
      background: var(--bordeaux, #8B2635); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 999px; pointer-events: none;
    }
  `;
  document.head.appendChild(st);
}

// Aggiunge alla bottom-nav la voce giusta in base al ruolo dell'utente:
//  - amministratore  -> "Admin" (icona scudo) con badge del numero di richieste aperte
//  - utente normale   -> "Contatta" (icona scialuppa) verso contatta.html
async function setupNavRuolo() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) return;

    // Trova la bottom-nav (stesso criterio di prima)
    const navContainers = document.querySelectorAll('nav, .bottom-nav, .nav-bar');
    let nav = null;
    for (const c of navContainers) {
      if (c.querySelector('.nav-item')) { nav = c; break; }
    }
    if (!nav) return;

    // Idempotenza: rimuovi una eventuale voce di ruolo già iniettata
    nav.querySelectorAll('.nav-ruolo').forEach(el => el.remove());

    // È admin?
    let isAdmin = false;
    const { data: profile } = await sb
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle();
    isAdmin = !!(profile && profile.is_admin);

    ensureNavRuoloStyle();

    const path = window.location.pathname;
    const a = document.createElement('a');

    if (isAdmin) {
      const isActive = path.endsWith('admin.html');
      a.href = 'admin.html';
      // mantengo anche la classe .nav-admin per retrocompatibilità
      a.className = 'nav-item nav-ruolo nav-admin' + (isActive ? ' active' : '');
      a.innerHTML =
        '<span class="nav-ruolo-icon">' +
          '<i class="ti ti-shield-lock" aria-hidden="true"></i>' +
          '<span class="nav-badge" data-nav-badge style="display:none">0</span>' +
        '</span>Admin';
      nav.appendChild(a);
      aggiornaBadgeMessaggiNav();
      console.log('[nav-ruolo] Voce Admin aggiunta');
    } else {
      const isActive = path.endsWith('contatta.html');
      a.href = 'contatta.html';
      a.className = 'nav-item nav-ruolo nav-contatta' + (isActive ? ' active' : '');
      a.innerHTML = '<i class="ti ti-lifebuoy" aria-hidden="true"></i>Contatta';
      nav.appendChild(a);
      console.log('[nav-ruolo] Voce Contatta aggiunta');
    }
  } catch (e) {
    console.warn('[nav-ruolo] Errore:', e);
  }
}

// Aggiorna il badge sull'icona Admin col numero di richieste ancora aperte
async function aggiornaBadgeMessaggiNav() {
  const badge = document.querySelector('[data-nav-badge]');
  if (!badge) return;
  try {
    const { count } = await sb
      .from('messaggi_admin')
      .select('id', { count: 'exact', head: true })
      .eq('stato', 'aperta');
    const n = count || 0;
    if (n > 0) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  } catch (e) {
    // Tabella messaggi_admin non ancora creata: nessun badge
    badge.style.display = 'none';
  }
}
