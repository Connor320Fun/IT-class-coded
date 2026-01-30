const boardEl = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.getElementById("status");
const difficultyEl = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGame");
const resetScoresBtn = document.getElementById("resetScores");

let board = Array(9).fill(null); // 'X', 'O', or null
let currentPlayer = "X";
let gameOver = false;

// Scores in localStorage
let scores = {
  player: 0,
  ai: 0,
  draw: 0,
};

function loadScores() {
  const saved = localStorage.getItem("ttt_scores");
  if (saved) {
    scores = JSON.parse(saved);
  }
  updateScoreboard();
}

function saveScores() {
  localStorage.setItem("ttt_scores", JSON.stringify(scores));
}

function updateScoreboard() {
  document.getElementById("playerScore").textContent = scores.player;
  document.getElementById("aiScore").textContent = scores.ai;
  document.getElementById("drawScore").textContent = scores.draw;
}

function resetScores() {
  scores = { player: 0, ai: 0, draw: 0 };
  saveScores();
  updateScoreboard();
}

resetScoresBtn.addEventListener("click", resetScores);

// Game logic
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(b) {
  for (const [a, c, d] of winningCombos) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return b[a];
    }
  }
  if (b.every((cell) => cell !== null)) return "draw";
  return null;
}

function renderBoard() {
  board.forEach((val, idx) => {
    cells[idx].textContent = val ? val : "";
  });
}

function setStatus(message) {
  statusEl.textContent = message;
}

function handleResult(result) {
  gameOver = true;
  if (result === "X") {
    scores.player++;
    setStatus("You win!");
  } else if (result === "O") {
    scores.ai++;
    setStatus("AI wins!");
  } else {
    scores.draw++;
    setStatus("It's a draw.");
  }
  saveScores();
  updateScoreboard();
}

function playerMove(index) {
  if (gameOver || board[index] !== null) return;
  board[index] = "X";
  renderBoard();
  const result = checkWinner(board);
  if (result) {
    handleResult(result);
    return;
  }
  currentPlayer = "O";
  setStatus("AI thinking...");
  disableBoard(true);
  setTimeout(() => {
    aiMove();
    disableBoard(false);
  }, 300);
}

function disableBoard(disabled) {
  cells.forEach((cell) => {
    if (disabled) {
      cell.classList.add("disabled");
    } else {
      cell.classList.remove("disabled");
    }
  });
}

// AI difficulty levels
function getAvailableMoves(b) {
  return b.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
}

function randomMove(b) {
  const moves = getAvailableMoves(b);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Simple heuristic: win if possible, block if needed, else random
function heuristicMove(b) {
  const moves = getAvailableMoves(b);

  // 1. Try to win
  for (const move of moves) {
    const copy = [...b];
    copy[move] = "O";
    if (checkWinner(copy) === "O") return move;
  }

  // 2. Block player win
  for (const move of moves) {
    const copy = [...b];
    copy[move] = "X";
    if (checkWinner(copy) === "X") return move;
  }

  // 3. Center if free
  if (b[4] === null) return 4;

  // 4. Random
  return randomMove(b);
}

// Minimax with depth limit
function minimax(b, isMaximizing, depth, maxDepth) {
  const result = checkWinner(b);
  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;
  if (depth >= maxDepth) return 0; // cut off

  const moves = getAvailableMoves(b);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      const copy = [...b];
      copy[move] = "O";
      const score = minimax(copy, false, depth + 1, maxDepth);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      const copy = [...b];
      copy[move] = "X";
      const score = minimax(copy, true, depth + 1, maxDepth);
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

function bestMoveWithDepth(b, maxDepth) {
  const moves = getAvailableMoves(b);
  let bestScore = -Infinity;
  let moveChosen = null;

  for (const move of moves) {
    const copy = [...b];
    copy[move] = "O";
    const score = minimax(copy, false, 0, maxDepth);
    if (score > bestScore) {
      bestScore = score;
      moveChosen = move;
    }
  }
  return moveChosen;
}

function aiMove() {
  if (gameOver) return;

  const level = parseInt(difficultyEl.value, 10);
  let move = null;

  switch (level) {
    case 1:
      // Very easy: pure random
      move = randomMove(board);
      break;
    case 2:
      // Easy: mostly random, sometimes heuristic
      move = Math.random() < 0.3 ? heuristicMove(board) : randomMove(board);
      break;
    case 3:
      // Medium: heuristic only
      move = heuristicMove(board);
      break;
    case 4:
      // Hard: minimax with medium depth
      move = bestMoveWithDepth(board, 3);
      break;
    case 5:
      // Impossible: full-depth minimax (tic-tac-toe is small)
      move = bestMoveWithDepth(board, 9);
      break;
    default:
      move = heuristicMove(board);
  }

  if (move === null) return;

  board[move] = "O";
  renderBoard();
  const result = checkWinner(board);
  if (result) {
    handleResult(result);
    return;
  }
  currentPlayer = "X";
  setStatus("Your turn (X)");
}

function newGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  renderBoard();
  setStatus("Your turn (X)");
  disableBoard(false);
}

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = parseInt(cell.getAttribute("data-index"), 10);
    if (currentPlayer === "X") {
      playerMove(index);
    }
  });
});

newGameBtn.addEventListener("click", newGame);

// Init
loadScores();
newGame();

// Admin panel logic
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const adminAuth = document.getElementById('adminAuth');
const adminPassword = document.getElementById('adminPassword');
const adminUnlock = document.getElementById('adminUnlock');
const adminContents = document.getElementById('adminContents');
const adminDifficulty = document.getElementById('adminDifficulty');
const adminStarter = document.getElementById('adminStarter');
const forceAiWinBtn = document.getElementById('forceAiWin');
const forcePlayerWinBtn = document.getElementById('forcePlayerWin');
const forceDrawBtn = document.getElementById('forceDraw');
const clearBoardBtn = document.getElementById('clearBoard');
const clearScoresBtn = document.getElementById('clearScores');
const resetLocalStorageBtn = document.getElementById('resetLocalStorage');
const exportStateBtn = document.getElementById('exportState');
const importFileInput = document.getElementById('importFile');
const clearLogsBtn = document.getElementById('clearLogs');
const exportLogsBtn = document.getElementById('exportLogs');
const closeAdminBtn = document.getElementById('closeAdmin');
const adminLogsEl = document.getElementById('adminLogs');
const liveBoardEl = document.getElementById('liveBoard');
const liveScoresEl = document.getElementById('liveScores');

let adminUnlocked = false;
let adminLogs = JSON.parse(localStorage.getItem('ttt_admin_logs') || '[]');

function saveAdminLogs() {
  localStorage.setItem('ttt_admin_logs', JSON.stringify(adminLogs));
}

function logAdmin(action) {
  const entry = `${new Date().toISOString()} - ${action}`;
  adminLogs.unshift(entry);
  if (adminLogs.length > 200) adminLogs.pop();
  saveAdminLogs();
  renderAdminLogs();
}

function renderAdminLogs() {
  if (!adminLogsEl) return;
  adminLogsEl.innerHTML = adminLogs.map(l => `<div>${l}</div>`).join('');
}

function renderLiveStats() {
  if (liveBoardEl) {
    liveBoardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.textContent = board[i] ? board[i] : '';
      liveBoardEl.appendChild(el);
    }
  }
  if (liveScoresEl) {
    liveScoresEl.textContent = `Player: ${scores.player}  AI: ${scores.ai}  Draws: ${scores.draw}`;
  }
}

function unlockAdmin() {
  if (adminPassword.value === '0320') {
    adminUnlocked = true;
    adminAuth.classList.add('hidden');
    adminContents.classList.remove('hidden');
    logAdmin('Admin unlocked');
  } else {
    alert('Incorrect code');
    logAdmin('Failed admin unlock attempt');
  }
}

adminBtn && adminBtn.addEventListener('click', () => {
  adminPanel.classList.toggle('hidden');
  if (!adminPanel.classList.contains('hidden')) {
    // show auth by default
    adminAuth.classList.remove('hidden');
    adminContents.classList.add('hidden');
    adminPassword.value = '';
    renderAdminLogs();
    renderLiveStats();
  }
});

adminUnlock && adminUnlock.addEventListener('click', unlockAdmin);

adminDifficulty && adminDifficulty.addEventListener('change', () => {
  difficultyEl.value = adminDifficulty.value;
  logAdmin(`Difficulty set to ${adminDifficulty.value}`);
});

adminStarter && adminStarter.addEventListener('change', () => {
  const starter = adminStarter.value;
  logAdmin(`Starter set to ${starter}`);
});

function setStarterAndNew(starter) {
  currentPlayer = starter;
  newGame(starter);
  logAdmin(`New game started with starter ${starter}`);
}

function forceWinFor(symbol) {
  const combo = winningCombos[0];
  const opposite = symbol === 'O' ? 'X' : 'O';
  board = Array(9).fill(opposite);
  combo.forEach((i) => (board[i] = symbol));
  renderBoard();
  handleResult(symbol);
  logAdmin(`Forced ${symbol} win`);
}

forceAiWinBtn && forceAiWinBtn.addEventListener('click', () => forceWinFor('O'));
forcePlayerWinBtn && forcePlayerWinBtn.addEventListener('click', () => forceWinFor('X'));

forceDrawBtn && forceDrawBtn.addEventListener('click', () => {
  board = ['X','O','X','X','O','O','O','X','X'];
  renderBoard();
  handleResult('draw');
  logAdmin('Forced draw');
});

clearBoardBtn && clearBoardBtn.addEventListener('click', () => {
  newGame();
  logAdmin('Cleared board (new game)');
});

clearScoresBtn && clearScoresBtn.addEventListener('click', () => {
  resetScores();
  logAdmin('Cleared scores');
});

resetLocalStorageBtn && resetLocalStorageBtn.addEventListener('click', () => {
  localStorage.clear();
  scores = { player: 0, ai: 0, draw: 0 };
  adminLogs = [];
  saveScores();
  saveAdminLogs();
  renderAdminLogs();
  renderLiveStats();
  logAdmin('Reset localStorage');
});

exportStateBtn && exportStateBtn.addEventListener('click', () => {
  const state = { board, scores, currentPlayer, gameOver, adminLogs };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'ttt_state.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
  logAdmin('Exported state');
});

importFileInput && importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const state = JSON.parse(ev.target.result);
      if (state.board) board = state.board;
      if (state.scores) scores = state.scores;
      if (state.currentPlayer) currentPlayer = state.currentPlayer;
      gameOver = !!state.gameOver;
      if (state.adminLogs) adminLogs = state.adminLogs;
      saveScores();
      saveAdminLogs();
      renderBoard();
      updateScoreboard();
      renderAdminLogs();
      renderLiveStats();
      logAdmin('Imported state');
    } catch (err) {
      alert('Invalid file');
    }
  };
  reader.readAsText(file);
});

clearLogsBtn && clearLogsBtn.addEventListener('click', () => {
  adminLogs = [];
  saveAdminLogs();
  renderAdminLogs();
  logAdmin('Cleared logs');
});

exportLogsBtn && exportLogsBtn.addEventListener('click', () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adminLogs));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'ttt_admin_logs.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
  logAdmin('Exported logs');
});

closeAdminBtn && closeAdminBtn.addEventListener('click', () => {
  adminPanel.classList.add('hidden');
  adminUnlocked = false;
  adminAuth.classList.remove('hidden');
  adminContents.classList.add('hidden');
  logAdmin('Admin locked');
});

const resetGameBtn = document.getElementById('resetGame');
resetGameBtn && resetGameBtn.addEventListener('click', () => {
  newGame();
  logAdmin('Game reset');
});

// Ensure live stats update on key events
const originalRenderBoard = renderBoard;
renderBoard = function() {
  originalRenderBoard();
  renderLiveStats();
};

const originalUpdateScoreboard = updateScoreboard;
updateScoreboard = function() {
  originalUpdateScoreboard();
  renderLiveStats();
};