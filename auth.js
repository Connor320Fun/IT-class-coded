// Simple client-side auth and leaderboard module
(() => {
  const USERS_KEY = 'game_auth_users';
  const CURRENT_KEY = 'game_auth_current_user';
  const LEADERBOARD_PREFIX = 'game_leaderboard_';

  function loadUsers() {
    const data = localStorage.getItem(USERS_KEY);
    try {
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function hashPass(pwd) {
    // Not secure; just for demo.
    return btoa(pwd);
  }

  function currentUser() {
    return localStorage.getItem(CURRENT_KEY) || null;
  }

  function setCurrentUser(username) {
    if (username) {
      localStorage.setItem(CURRENT_KEY, username);
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
    updateAuthUI();
  }

  function normalizedUsername(username) {
    return username.trim().toLowerCase();
  }

  function getCurrentGameId() {
    let name = (window.location.pathname || 'index.html').split('/').pop();
    if (name === '' || name === 'index.html') return 'tictactoe';
    if (name.endsWith('.html')) name = name.slice(0, -5);
    return name === '2048' ? '2048' : name;
  }

  const SCORE_SELECTORS = {
    tictactoe: '#playerScore',
    connect: '#cfPlayerScore',
    battleship: '#bsPlayerScore',
    hangman: '#hgPlayerScore',
    checkers: '#chPlayerScore',
    chess: '#chessPlayerScore',
    minesweeper: '#msPlayerScore',
    snake: '#snPlayerScore',
    mastermind: '#mmPlayerScore',
    rps: '#rpsPlayerScore',
    '2048': '#twPlayerScore',
  };

  function getPlayerScoreFromUI() {
    const gameId = getCurrentGameId();
    const selector = SCORE_SELECTORS[gameId];
    if (!selector) return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    const value = parseInt(el.textContent, 10);
    if (Number.isNaN(value)) return null;
    return value;
  }

  function isLoggedIn() {
    return !!currentUser();
  }

  function updateAuthUI() {
    const user = currentUser();
    const overlay = document.getElementById('authOverlay');
    const status = document.getElementById('authStatus');
    const loginForm = document.getElementById('authLoginContainer');
    const welcome = document.getElementById('authWelcome');
    const leaderboard = document.getElementById('authLeaderboard');

    if (user) {
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }
      if (status) status.textContent = `Logged in as ${user}`;
      if (loginForm) loginForm.classList.add('hidden');
      if (welcome) welcome.textContent = `Welcome, ${user}!`;
      if (leaderboard) renderLeaderboard(getCurrentGameId());
      document.body.classList.remove('no-user');

      // Ensure game UI is interactable as soon as login completes.
      const appNode = document.querySelector('.app');
      if (appNode) {
        appNode.style.pointerEvents = 'auto';
        appNode.style.filter = 'none';
      }
    } else {
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
      }
      if (status) status.textContent = 'Please log in or sign up to play';
      if (loginForm) loginForm.classList.remove('hidden');
      if (welcome) welcome.textContent = 'Please log in to enable game controls';
      if (leaderboard) leaderboard.innerHTML = '<p>Leaderboard locked until login</p>';
      document.body.classList.add('no-user');

      const usernameInput = document.getElementById('authUsername');
      if (usernameInput) {
        usernameInput.focus();
      }
    }
  }

  function showMessage(msg) {
    const msgEl = document.getElementById('authMessage');
    if (msgEl) msgEl.textContent = msg;
  }

  function navigateToLeaderBoard() {
    const gameId = getCurrentGameId();
    renderLeaderboard(gameId);
  }

  function createPlayerPanel() {
    if (document.getElementById('authOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.className = 'auth-overlay';

    const panel = document.createElement('div');
    panel.className = 'auth-panel';

    const title = document.createElement('h2');
    title.textContent = 'Member Login Required';
    panel.appendChild(title);

    const welcome = document.createElement('div');
    welcome.id = 'authWelcome';
    welcome.className = 'auth-welcome';
    welcome.textContent = 'Please log in or sign up to play.';
    panel.appendChild(welcome);

    const status = document.createElement('div');
    status.id = 'authStatus';
    status.className = 'auth-status';
    status.textContent = 'Please log in or sign up to play.';
    panel.appendChild(status);

    const loginContainer = document.createElement('div');
    loginContainer.id = 'authLoginContainer';
    loginContainer.className = 'auth-login';

    const usernameInput = document.createElement('input');
    usernameInput.id = 'authUsername';
    usernameInput.type = 'text';
    usernameInput.placeholder = 'Username';
    usernameInput.autofocus = true;

    const passwordInput = document.createElement('input');
    passwordInput.id = 'authPassword';
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';

    const loginBtn = document.createElement('button');
    loginBtn.id = 'authLogin';
    loginBtn.textContent = 'Login';

    const signupBtn = document.createElement('button');
    signupBtn.id = 'authSignup';
    signupBtn.textContent = 'Sign Up';

    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'authLogout';
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'hidden';

    const msg = document.createElement('div');
    msg.id = 'authMessage';
    msg.className = 'auth-message';

    loginContainer.appendChild(usernameInput);
    loginContainer.appendChild(passwordInput);
    loginContainer.appendChild(loginBtn);
    loginContainer.appendChild(signupBtn);
    loginContainer.appendChild(logoutBtn);
    loginContainer.appendChild(msg);

    panel.appendChild(loginContainer);

    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.id = 'authLeaderboard';
    leaderboardContainer.className = 'auth-leaderboard';
    panel.appendChild(leaderboardContainer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    loginBtn.addEventListener('click', () => {
      const username = normalizedUsername(usernameInput.value);
      const password = passwordInput.value;
      if (!username || !password) { showMessage('Enter username and password.'); return; }
      const users = loadUsers();
      if (!users[username] || users[username] !== hashPass(password)) {
        showMessage('Invalid credentials');
        return;
      }
      setCurrentUser(username);
      showMessage('Logged in.');
      status.textContent = `Welcome back, ${username}`;
      loginContainer.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      navigateToLeaderBoard();
    });

    signupBtn.addEventListener('click', () => {
      const username = normalizedUsername(usernameInput.value);
      const password = passwordInput.value;
      if (!username || !password) { showMessage('Enter username and password.'); return; }
      const users = loadUsers();
      if (users[username]) { showMessage('Username already exists'); return; }
      users[username] = hashPass(password);
      saveUsers(users);
      setCurrentUser(username);
      showMessage('Account created and logged in.');
      loginContainer.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      navigateToLeaderBoard();
    });

    logoutBtn.addEventListener('click', () => {
      setCurrentUser(null);
      loginContainer.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
      usernameInput.value = '';
      passwordInput.value = '';
      showMessage('Logged out.');
    });

    document.body.addEventListener('mouseup', (e) => {
      if (!isLoggedIn() && e.target !== usernameInput && e.target !== passwordInput && e.target !== loginBtn && e.target !== signupBtn && e.target !== logoutBtn) {
        if (overlay.classList.contains('hidden')) overlay.classList.remove('hidden');
      }
    });

    // keyboard lock when not logged in, but allow text input in auth fields
    document.addEventListener('keydown', (e) => {
      if (!isLoggedIn()) {
        const target = e.target;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isInput) {
          // allow typing in auth fields and block game handlers
          e.stopPropagation();
          return;
        }
        const allowed = ['Tab', 'Enter', 'Escape'];
        if (!allowed.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }, true);

    // update overlay state when storage changes
    window.addEventListener('storage', () => updateAuthUI());
  }

  function getLeaderboard(gameId) {
    const key = `${LEADERBOARD_PREFIX}${gameId}`;
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLeaderboard(gameId, list) {
    const key = `${LEADERBOARD_PREFIX}${gameId}`;
    localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
  }

  function submitScore(gameId, score) {
    const user = currentUser();
    if (!user || typeof score !== 'number' || Number.isNaN(score)) return;

    let board = getLeaderboard(gameId);
    const existing = board.find(e => e.user === user);
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.timestamp = new Date().toISOString();
      }
    } else {
      board.push({ user, score, timestamp: new Date().toISOString() });
    }

    board.sort((a, b) => b.score - a.score);
    saveLeaderboard(gameId, board);
    renderLeaderboard(gameId);
  }

  function renderLeaderboard(gameId) {
    const board = getLeaderboard(gameId);
    const container = document.getElementById('authLeaderboard');
    if (!container) return;

    const title = `${gameId.toUpperCase()} leaderboard`;
    if (board.length === 0) {
      container.innerHTML = `<h3>${title}</h3><p>No scores yet.</p>`;
      return;
    }

    const rows = board.map((entry, idx) => `<tr><td>${idx + 1}</td><td>${entry.user}</td><td>${entry.score}</td><td>${new Date(entry.timestamp).toLocaleString()}</td></tr>`).join('');
    container.innerHTML = `<h3>${title}</h3><table class="auth-table"><thead><tr><th>#</th><th>User</th><th>Score</th><th>Updated</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  window.auth = {
    currentUser,
    login: function (username, password) {
      const users = loadUsers();
      username = normalizedUsername(username);
      if (!username || !password || !users[username] || users[username] !== hashPass(password)) {
        return false;
      }
      setCurrentUser(username);
      return true;
    },
    signup: function (username, password) {
      const users = loadUsers();
      username = normalizedUsername(username);
      if (!username || !password || users[username]) {
        return false;
      }
      users[username] = hashPass(password);
      saveUsers(users);
      setCurrentUser(username);
      return true;
    },
    logout: function () { setCurrentUser(null); },
    isLoggedIn,
    getCurrentUser: currentUser,
    submitScore,
    getLeaderboard,
    getCurrentGameId,
  };

  document.addEventListener('DOMContentLoaded', () => {
    createPlayerPanel();
    updateAuthUI();
    // Auto-update leaderboard for current game on load if logged in
    if (isLoggedIn()) {
      renderLeaderboard(getCurrentGameId());
    }

    // keep latest player score tracked in leaderboard
    setInterval(() => {
      if (!isLoggedIn()) return;
      const gameId = getCurrentGameId();
      const score = getPlayerScoreFromUI();
      if (score !== null) {
        submitScore(gameId, score);
      }
    }, 1500);
  });
})();