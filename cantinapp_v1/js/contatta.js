// ============================================================
// CantinApp — Contatta l'amministratore
// ============================================================

let currentUser = null;
let mioProfilo = null;

(async function init() {
  const session = await requireAuth();
  if (!session) return;
  currentUser = session.user;

  const { data } = await sb.from('profiles').select('username').eq('id', currentUser.id).maybeSingle();
  mioProfilo = data || null;

  await caricaMieRichieste();
})();

async function inviaMessaggio() {
  const btn = document.getElementById('btnInvia');
  const oggetto = document.getElementById('oggetto').value.trim();
  const testo = document.getElementById('testo').value.trim();
  if (!testo) { showToast('Scrivi un messaggio', true); return; }

  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .7s linear infinite"></i> Invio...';

  const { error } = await sb.from('messaggi_admin').insert({
    user_id: currentUser.id,
    username: (mioProfilo && mioProfilo.username) || null,
    email: currentUser.email || null,
    oggetto: oggetto || null,
    testo: testo,
    stato: 'aperta',
  });

  btn.disabled = false;
  btn.innerHTML = orig;

  if (error) { showToast('Errore: ' + error.message, true); console.error(error); return; }

  showToast('Richiesta inviata!');
  document.getElementById('oggetto').value = '';
  document.getElementById('testo').value = '';
  await caricaMieRichieste();
}

async function caricaMieRichieste() {
  const box = document.getElementById('miePrecedenti');
  const { data, error } = await sb.from('messaggi_admin')
    .select('id, oggetto, testo, stato, created_at, risposta, risposta_at')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    box.innerHTML = `<div class="muted">Errore: ${esc(error.message)}</div>`;
    return;
  }
  if (!data || !data.length) {
    box.innerHTML = '<div class="muted">Non hai ancora inviato richieste.</div>';
    return;
  }

  box.innerHTML = data.map(m => {
    const dt = new Date(m.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    const chiusa = m.stato === 'chiusa';
    const risposta = m.risposta ? `
        <div class="risposta-admin">
          <div class="risposta-label"><i class="ti ti-message-reply"></i> Risposta dell'amministratore</div>
          <div class="risposta-txt">${esc(m.risposta)}</div>
        </div>` : '';
    return `
      <div class="msg-card">
        ${m.oggetto ? `<div class="ogg">${esc(m.oggetto)}</div>` : ''}
        <div class="txt">${esc(m.testo)}</div>
        ${risposta}
        <div class="row">
          <span class="data">${dt}</span>
          <span class="stato-pill ${chiusa ? 'stato-chiusa' : 'stato-aperta'}">${chiusa ? 'Chiusa' : 'Aperta'}</span>
        </div>
      </div>`;
  }).join('');
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
