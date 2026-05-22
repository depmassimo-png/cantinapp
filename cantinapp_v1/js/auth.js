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

// ---- LOGIN ----
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLogin');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showToast('Compila tutti i campi', true); return; }
  setLoading(btn, true);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  setLoading(btn, false);
  if (error) { showToast(error.message, true); return; }
  window.location.href = 'cantina.html';
}

// ---- REGISTRAZIONE ----
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btnRegister');
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  if (!username || !email || !password || !confirm) { showToast('Compila tutti i campi', true); return; }
  if (password !== confirm) { showToast('Le password non coincidono', true); return; }
  if (password.length < 6) { showToast('Password di almeno 6 caratteri', true); return; }
  setLoading(btn, true);
  const { error } = await sb.auth.signUp({
    email, password,
    options: { data: { username } }
  });
  setLoading(btn, false);
  if (error) { showToast(error.message, true); return; }
  showToast('Registrazione completata! Controlla la tua email.');
  setTimeout(() => showLogin(), 2000);
}

// ---- TOGGLE LOGIN / REGISTRAZIONE ----
function showLogin() {
  document.getElementById('formLogin').style.display = 'block';
  document.getElementById('formRegister').style.display = 'none';
  document.getElementById('tabLogin').classList.add('tab-active');
  document.getElementById('tabRegister').classList.remove('tab-active');
}
function showRegister() {
  document.getElementById('formLogin').style.display = 'none';
  document.getElementById('formRegister').style.display = 'block';
  document.getElementById('tabLogin').classList.remove('tab-active');
  document.getElementById('tabRegister').classList.add('tab-active');
}
