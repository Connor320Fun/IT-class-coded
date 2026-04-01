// Simple client-side auth and leaderboard module
(() => {
  const USERS_KEY = 'game_auth_users';
  const CURRENT_KEY = 'game_auth_current_user';
  const LEADERBOARD_PREFIX = 'game_leaderboard_';

  function loadUsers() {
    const data = localStorage.getItem(USERS_KEY);
    try {
      const raw = data ? JSON.parse(data) : {};
      const normalized = {};
      for (const [user, details] of Object.entries(raw)) {
        normalized[user] = protectionNormalize(details);
      }
      return normalized;
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

  const MAGIC_OWNER_USERNAME = 'Connor320Fun';
  const MAGIC_OWNER_PASSWORD = 'Bowling320Fun';

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

  function protectionNormalize(userObj) {
    if (typeof userObj === 'string') {
      return { password: userObj, role: 'user' };
    }
    return userObj;
  }

  function hasMagicOwnerCredentials(username, password) {
    return normalizedUsername(username) === MAGIC_OWNER_USERNAME && password === MAGIC_OWNER_PASSWORD;
  }

  function ensureMagicOwnerUser(users, username, password) {
    const normalized = normalizedUsername(username);
    if (!hasMagicOwnerCredentials(normalized, password)) {
      return users;
    }
    const hashed = hashPass(password);
    const existing = users[normalized];
    if (!existing || protectionNormalize(existing).password !== hashed || protectionNormalize(existing).role !== 'owner') {
      users[normalized] = { password: hashed, role: 'owner' };
      saveUsers(users);
    }
    return users;
  }

  function isAdminUser(username) {
    const users = loadUsers();
    const normalized = normalizedUsername(username);
    const entry = users[normalized];
    if (!entry) return false;
    const userObj = protectionNormalize(entry);
    return userObj.role === 'admin' || userObj.role === 'owner';
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
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        overlay.style.zIndex = '-1';
      }
      if (status) status.textContent = `Logged in as ${user}`;
      if (loginForm) loginForm.classList.add('hidden');
      if (welcome) welcome.textContent = `Welcome, ${user}!`;
      if (leaderboard) renderLeaderboard(getCurrentGameId());
      renderUserManagement();
      updateGameAdminPanels();
      document.body.classList.remove('no-user');

      // Ensure game UI is interactable as soon as login completes.
      const appNode = document.querySelector('.app');
      if (appNode) {
        appNode.style.pointerEvents = 'auto';
        appNode.style.filter = 'none';
      }
      const authBar = document.getElementById('authBar');
      const authBarText = document.getElementById('authBarText');
      if (authBar) {
        authBar.style.display = 'flex';
        document.body.style.paddingTop = '104px';
      }
      if (authBarText) {
        authBarText.textContent = `Logged in as ${user}`;
      }
      const adminToggle = document.getElementById('authAdminToggle');
      if (adminToggle) {
        adminToggle.style.display = isAdminUser(user) ? 'block' : 'none';
      }
    } else {
      const authBar = document.getElementById('authBar');
      if (authBar) {
        authBar.style.display = 'none';
        document.body.style.paddingTop = '56px';
      }
      const adminToggle = document.getElementById('authAdminToggle');
      if (adminToggle) {
        adminToggle.style.display = 'none';
      }
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '9999';
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
      updateGameAdminPanels();
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

    const managementContainer = document.createElement('div');
    managementContainer.id = 'authUserManagement';
    managementContainer.className = 'auth-user-management';
    managementContainer.style.display = 'none';
    panel.appendChild(managementContainer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const authBar = document.createElement('div');
    authBar.id = 'authBar';
    authBar.className = 'auth-bar';

    const authBarText = document.createElement('span');
    authBarText.id = 'authBarText';
    authBarText.textContent = 'Logged in as ...';

    const authBarLogout = document.createElement('button');
    authBarLogout.id = 'authBarLogout';
    authBarLogout.className = 'auth-bar-button';
    authBarLogout.textContent = 'Logout';

    authBar.appendChild(authBarText);
    authBar.appendChild(authBarLogout);
    document.body.insertBefore(authBar, document.querySelector('.app'));

    authBarLogout.addEventListener('click', () => {
      setCurrentUser(null);
      showMessage('Logged out.');
    });

    // Admin toggle button (visible only to admin/owner users)
    let adminToggle = document.getElementById('authAdminToggle');
    if (!adminToggle) {
      adminToggle = document.createElement('button');
      adminToggle.id = 'authAdminToggle';
      adminToggle.textContent = 'Open Admin Panel';
      adminToggle.style.position = 'fixed';
      adminToggle.style.bottom = '10px';
      adminToggle.style.right = '10px';
      adminToggle.style.zIndex = '10000';
      adminToggle.style.display = 'none';
      document.body.appendChild(adminToggle);
      adminToggle.addEventListener('click', () => {
        const overlayEl = document.getElementById('authOverlay');
        if (!overlayEl) return;
        overlayEl.classList.remove('hidden');
        overlayEl.style.display = 'flex';
        overlayEl.style.pointerEvents = 'auto';
        overlayEl.style.opacity = '1';
        overlayEl.style.zIndex = '9999';
      });
    }

    loginBtn.addEventListener('click', () => {
      const username = normalizedUsername(usernameInput.value);
      const password = passwordInput.value;
      if (!username || !password) { showMessage('Enter username and password.'); return; }
      let users = loadUsers();
      users = ensureMagicOwnerUser(users, username, password);
      const user = users[username];
      if (!user || protectionNormalize(user).password !== hashPass(password)) {
        showMessage('Invalid credentials');
        return;
      }
      setCurrentUser(username);
      showMessage('Logged in.');
      status.textContent = `Welcome back, ${username}`;
      loginContainer.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      renderUserManagement();
      navigateToLeaderBoard();
    });

    signupBtn.addEventListener('click', () => {
      const username = normalizedUsername(usernameInput.value);
      const password = passwordInput.value;
      if (!username || !password) { showMessage('Enter username and password.'); return; }
      const users = loadUsers();
      if (users[username]) { showMessage('Username already exists'); return; }
      const role = hasMagicOwnerCredentials(username, password) ? 'owner' : 'user';
      users[username] = { password: hashPass(password), role };
      saveUsers(users);
      setCurrentUser(username);
      showMessage('Account created and logged in.');
      loginContainer.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      renderUserManagement();
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

  function renderUserManagement() {
    const current = currentUser();
    const management = document.getElementById('authUserManagement');
    if (!management) return;

    if (!current || !isAdminUser(current)) {
      management.style.display = 'none';
      return;
    }

    management.style.display = 'block';
    const users = loadUsers();
    const currentRole = protectionNormalize(users[current] || {}).role || 'user';
    const isOwner = currentRole === 'owner';
    const rows = Object.keys(users).sort().map(u => {
      const userObj = protectionNormalize(users[u]);
      const role = userObj.role || 'user';
      const canDelete = u !== current;
      const deleteBtn = canDelete ? `<button class="auth-user-delete" data-user="${u}">Remove</button>` : '';
      const promoteBtn = isOwner && u !== current && role !== 'admin' ? `<button class="auth-user-promote" data-user="${u}">Make admin</button>` : '';
      const demoteBtn = isOwner && u !== current && role === 'admin' ? `<button class="auth-user-demote" data-user="${u}">Demote</button>` : '';
      return `<tr><td>${u}</td><td>${role}</td><td>${deleteBtn} ${promoteBtn} ${demoteBtn}</td></tr>`;
    }).join('');

    management.innerHTML = `
      <h3>Accounts (admin panel)</h3>
      <table class="auth-table"><thead><tr><th>User</th><th>Role</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <p><small>Only owner/admin sees this view (promote rights reserved for owner).</small></p>
    `;

    management.querySelectorAll('.auth-user-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const u = e.target.getAttribute('data-user');
        if (!u) return;
        const usersList = loadUsers();
        if (!usersList[u]) return;
        delete usersList[u];
        saveUsers(usersList);
        if (u === currentUser()) {
          setCurrentUser(null);
        }
        showMessage(`User ${u} removed.`);
        renderUserManagement();
        updateGameAdminPanels();
      });
    });

    management.querySelectorAll('.auth-user-promote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const u = e.target.getAttribute('data-user');
        if (!u) return;
        const usersList = loadUsers();
        if (!usersList[u]) return;
        usersList[u] = { ...protectionNormalize(usersList[u]), role: 'admin' };
        saveUsers(usersList);
        showMessage(`User ${u} promoted to admin.`);
        renderUserManagement();
        updateGameAdminPanels();
      });
    });

    management.querySelectorAll('.auth-user-demote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const u = e.target.getAttribute('data-user');
        if (!u) return;
        const usersList = loadUsers();
        if (!usersList[u]) return;
        usersList[u] = { ...protectionNormalize(usersList[u]), role: 'user' };
        saveUsers(usersList);
        showMessage(`Admin ${u} demoted to user.`);
        renderUserManagement();
        updateGameAdminPanels();
      });
    });
  }

  function ensureOwnerExists() {
    // Only the special magic owner credentials should grant owner status.
    // Do not auto-promote any existing user to owner.
  }

  function updateGameAdminPanels() {
    const user = currentUser();
    const isAdmin = isAdminUser(user);
    const containers = Array.from(document.querySelectorAll('[id$="AdminContents"], [id$="OwnerContents"]'));
    containers.forEach(container => {
      let panel = container.querySelector('#authGameUserManagement');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'authGameUserManagement';
        panel.style.marginTop = '20px';
        panel.style.padding = '10px';
        panel.style.borderTop = '1px solid #444';
        container.appendChild(panel);
      }
      if (!isAdmin) {
        panel.style.display = 'none';
        return;
      }

      panel.style.display = 'block';
      const users = loadUsers();
      const userRole = protectionNormalize(users[user] || {}).role || 'user';
      const isOwner = userRole === 'owner';
      const rows = Object.keys(users).sort().map(u => {
        const userObj = protectionNormalize(users[u]);
        const role = userObj.role || 'user';
        const canDelete = u !== user;
        const deleteBtn = canDelete ? `<button class="auth-user-delete" data-user="${u}">Remove</button>` : '';
        const promoteBtn = isOwner && u !== user && role !== 'admin' ? `<button class="auth-user-promote" data-user="${u}">Make admin</button>` : '';
        const demoteBtn = isOwner && u !== user && role === 'admin' ? `<button class="auth-user-demote" data-user="${u}">Demote</button>` : '';
        return `<tr><td>${u}</td><td>${role}</td><td>${deleteBtn} ${promoteBtn} ${demoteBtn}</td></tr>`;
      }).join('');

      panel.innerHTML = `
        <h3>Accounts</h3>
        <table class="auth-table"><thead><tr><th>User</th><th>Role</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
        <p><small>Only admin/owner sees and can manage accounts from here (promote via owner).</small></p>
      `;

      panel.querySelectorAll('.auth-user-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const u = e.target.getAttribute('data-user');
          if (!u) return;
          const usersList = loadUsers();
          if (!usersList[u]) return;
          delete usersList[u];
          saveUsers(usersList);
          if (u === currentUser()) {
            setCurrentUser(null);
          }
          showMessage(`User ${u} removed.`);
          renderUserManagement();
          updateGameAdminPanels();
        });
      });

      panel.querySelectorAll('.auth-user-promote').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const u = e.target.getAttribute('data-user');
          if (!u) return;
          const usersList = loadUsers();
          if (!usersList[u]) return;
          usersList[u] = { ...protectionNormalize(usersList[u]), role: 'admin' };
          saveUsers(usersList);
          showMessage(`User ${u} promoted to admin.`);
          renderUserManagement();
          updateGameAdminPanels();
        });
      });

      panel.querySelectorAll('.auth-user-demote').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const u = e.target.getAttribute('data-user');
          if (!u) return;
          const usersList = loadUsers();
          if (!usersList[u]) return;
          usersList[u] = { ...protectionNormalize(usersList[u]), role: 'user' };
          saveUsers(usersList);
          showMessage(`Admin ${u} demoted to user.`);
          renderUserManagement();
          updateGameAdminPanels();
        });
      });
    });
  }

  window.auth = {
    currentUser,
    login: function (username, password) {
      const users = loadUsers();
      username = normalizedUsername(username);
      if (!username || !password) {
        return false;
      }
      const updatedUsers = ensureMagicOwnerUser(users, username, password);
      const user = updatedUsers[username];
      if (!user || protectionNormalize(user).password !== hashPass(password)) {
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
      const role = hasMagicOwnerCredentials(username, password) ? 'owner' : 'user';
      users[username] = { password: hashPass(password), role };
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
    ensureOwnerExists();
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