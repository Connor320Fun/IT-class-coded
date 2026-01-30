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