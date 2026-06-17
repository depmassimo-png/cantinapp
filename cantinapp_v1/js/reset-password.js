// ============================================================
// CantinApp — Reimposta password (landing del link di recupero)
// ============================================================

let recoveryPronto = false;

// Mostra il form della nuova password
function abilitaForm() {
  if (recoveryPronto) return;
  recoveryPronto = true;
  document.getElementById('statoVerifica').style.display = 'none';
  document.getElementById('statoErrore').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
}

function mostraErrore(msg) {
  if (recoveryPronto) return; // se il form è già attivo, non sovrascrivere
  document.getElementById('statoVerifica').style.display = 'none';
  document.getElementById('formReset').style.display = 'none';
  const box = document.getElementById('statoErrore');
  if (msg) document.getElementById('erroreMsg').textContent = msg;
  box.style.display = 'block';
}

// Supabase, con detectSessionInUrl attivo, elabora il token e
// (in flusso implicito) emette l'evento PASSWORD_RECOVERY.
sb.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
    abilitaForm();
  }
});

// Verifica al caricamento (gestisce errori, sessione già pronta, flusso PKCE)
(async function verifica() {
  const urlObj = new URL(window.location.href);
  const hash = window.location.hash || '';

  // Errore esplicito nel link (es. otp_expired)
  const errDesc = urlObj.searchParams.get('error_description') ||
                  new URLSearchParams(hash.replace(/^#/, '')).get('error_description');
  if (errDesc) { mostraErrore(decodeURIComponent(errDesc.replace(/\+/g, ' '))); return; }

  const haContestoRecovery = /type=recovery/.test(hash) || urlObj.searchParams.has('code');

  // Diamo un attimo a detectSessionInUrl di processare l'hash
  await new Promise(r => setTimeout(r, 400));

  let { data: { session } } = await sb.auth.getSession();

  // Flusso PKCE: scambio del code se non c'è ancora sessione
  if (!session) {
    const code = urlObj.searchParams.get('code');
    if (code) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) { mostraErrore('Link non valido o scaduto. Richiedi un nuovo reset.'); return; }
      ({ data: { session } } = await sb.auth.getSession());
    }
  }

  if (session && haContestoRecovery) {
    abilitaForm();
  } else if (session && !haContestoRecovery) {
    // sessione presente ma pagina aperta senza link di recupero
    mostraErrore('Apri questa pagina dal link ricevuto via email per reimpostare la password.');
  } else if (!recoveryPronto) {
    mostraErrore('Link non valido o scaduto. Richiedi un nuovo reset.');
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
  // Chiudo la sessione di recupero e torno al login pulito
  await sb.auth.signOut();
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}
