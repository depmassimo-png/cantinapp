// ============================================================
// CantinApp — Reimposta password (landing del link di recupero)
// Supporta tre flussi:
//   1) token_hash + verifyOtp()  -> consigliato, immune al prefetch dei link
//   2) PKCE (?code=...)          -> exchangeCodeForSession
//   3) implicito (#access_token) -> detectSessionInUrl + PASSWORD_RECOVERY
// ============================================================

let recoveryPronto = false;

function abilitaForm() {
  if (recoveryPronto) return;
  recoveryPronto = true;
  document.getElementById('statoVerifica').style.display = 'none';
  document.getElementById('statoErrore').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
}

function mostraErrore(msg) {
  if (recoveryPronto) return; // form già attivo: non sovrascrivere
  document.getElementById('statoVerifica').style.display = 'none';
  document.getElementById('formReset').style.display = 'none';
  const box = document.getElementById('statoErrore');
  if (msg) document.getElementById('erroreMsg').textContent = msg;
  box.style.display = 'block';
}

// Flusso implicito: detectSessionInUrl elabora l'hash ed emette PASSWORD_RECOVERY
sb.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') abilitaForm();
});

(async function verifica() {
  const urlObj = new URL(window.location.href);
  const hash = window.location.hash || '';

  // 1) Errore esplicito nell'URL (es. otp_expired dal flusso verify)
  const errDesc = urlObj.searchParams.get('error_description') ||
                  new URLSearchParams(hash.replace(/^#/, '')).get('error_description');
  if (errDesc) { mostraErrore(decodeURIComponent(errDesc.replace(/\+/g, ' '))); return; }

  // 2) Flusso token_hash (consigliato): ?token_hash=...&type=recovery
  const tokenHash = urlObj.searchParams.get('token_hash');
  const tipo = urlObj.searchParams.get('type') || 'recovery';
  if (tokenHash) {
    const { error } = await sb.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (error) {
      mostraErrore('Link non valido o scaduto. Richiedine uno nuovo dalla pagina di login.');
      return;
    }
    abilitaForm();
    return;
  }

  const haContestoRecovery = /type=recovery/.test(hash) || urlObj.searchParams.has('code');

  // Diamo un attimo a detectSessionInUrl di processare l'hash (flusso implicito)
  await new Promise(r => setTimeout(r, 400));

  let { data: { session } } = await sb.auth.getSession();

  // 3) Flusso PKCE: scambio del code se non c'è ancora sessione
  if (!session) {
    const code = urlObj.searchParams.get('code');
    if (code) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) {
        mostraErrore('Link non valido o scaduto. Richiedine uno nuovo dalla pagina di login.');
        return;
      }
      ({ data: { session } } = await sb.auth.getSession());
    }
  }

  if (session && haContestoRecovery) {
    abilitaForm();
  } else if (session && !haContestoRecovery) {
    mostraErrore('Apri questa pagina dal link ricevuto via email per reimpostare la password.');
  } else if (!recoveryPronto) {
    mostraErrore('Link non valido o scaduto. Richiedine uno nuovo dalla pagina di login.');
  }
})();

async function aggiornaPassword() {
  const btn = document.getElementById('btnSalva');
  const p1 = document.getElementById('pwd1').value;
  const p2 = document.getElementById('pwd2').value;

  if (!p1 || !p2) { showToast('Compila entrambi i campi', true); return; }
  if (p1.length < 6) { showToast('La password deve avere almeno 6 caratteri', true); return; }
  if (p1 !== p2) { showToast('Le password non coincidono', true); return; }

  setLoading(btn, true);
  const { error } = await sb.auth.updateUser({ password: p1 });
  setLoading(btn, false);

  if (error) { showToast(error.message, true); return; }

  showToast('Password aggiornata! Ora puoi accedere.');
  await sb.auth.signOut();
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}
