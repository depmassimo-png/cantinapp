// ============================================================
// CantinApp — Auth
// ============================================================

// Mostra un toast temporaneo
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Spinner su un bottone
function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .7s linear infinite;font-size:18px"></i>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.origText;
    btn.disabled = false;
  }
}

// Guard: se non loggato redirect al login
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

// Guard inversa: se già loggato redirect alla cantina
async function redirectIfLogged() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) window.location.href = 'cantina.html';
}

// Logout
async function logout() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// Le funzioni specifiche della pagina di login (login, registrazione, toggle
// dei pannelli) vivono ora in index.html, per evitare doppioni e ID duplicati.

