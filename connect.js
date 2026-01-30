// Simple Connect Four with 5 AI difficulty levels
const ROWS = 6;
const COLS = 7;

const cfBoardEl = document.getElementById('cfBoard');
const cfStatusEl = document.getElementById('cfStatus');
const cfDifficultyEl = document.getElementById('cfDifficulty');
const cfNewGameBtn = document.getElementById('cfNewGame');
const cfPlayerScoreEl = document.getElementById('cfPlayerScore');
const cfAiScoreEl = document.getElementById('cfAiScore');
const cfDrawScoreEl = document.getElementById('cfDrawScore');

let cfBoard = [];
let cfCurrent = 'P'; // 'P' player, 'A' ai
let cfGameOver = false;
let cfScores = { player: 0, ai: 0, draw: 0 };

function initCfBoard() {
  cfBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function renderCfBoard() {
  cfBoardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cf-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      const v = cfBoard[r][c];
      cell.textContent = v === 'P' ? '●' : v === 'A' ? '○' : '';
      // Only attach column-click to top row visuals for convenience
      if (r === 0) {
        cell.addEventListener('click', () => {
          if (cfCurrent === 'P' && !cfGameOver) playerCfDrop(c);
        });
      }
      cfBoardEl.appendChild(cell);
    }
  }
}

function updateCfStatus(msg) {
  cfStatusEl.textContent = msg;
}

function getAvailableCols(board) {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === null) cols.push(c);
  return cols;
}

function dropInCol(board, col, symbol) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      board[r][col] = symbol;
      return { r, c: col };
    }
  }
  return null;
}

function checkCfWinner(board) {
  // horizontal, vertical, diag
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = board[r][c];
      if (!s) continue;
      // horiz
      if (c + 3 < COLS && s === board[r][c+1] && s === board[r][c+2] && s === board[r][c+3]) return s;
      // vert
      if (r + 3 < ROWS && s === board[r+1][c] && s === board[r+2][c] && s === board[r+3][c]) return s;
      // diag down-right
      if (r + 3 < ROWS && c + 3 < COLS && s === board[r+1][c+1] && s === board[r+2][c+2] && s === board[r+3][c+3]) return s;
      // diag down-left
      if (r + 3 < ROWS && c - 3 >= 0 && s === board[r+1][c-1] && s === board[r+2][c-2] && s === board[r+3][c-3]) return s;
    }
  }
  // draw
  if (board[0].every(v => v !== null)) return 'draw';
  return null;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function playerCfDrop(col) {
  const pos = dropInCol(cfBoard, col, 'P');
  if (!pos) return;
  renderCfBoard();
  const res = checkCfWinner(cfBoard);
  if (res) return handleCfResult(res);
  cfCurrent = 'A';
  updateCfStatus('AI thinking...');
  setTimeout(() => { aiCfMove(); }, 250);
}

function handleCfResult(result) {
  cfGameOver = true;
  if (result === 'P') { cfScores.player++; updateCfStatus('Player wins!'); }
  else if (result === 'A') { cfScores.ai++; updateCfStatus('AI wins!'); }
  else { cfScores.draw++; updateCfStatus("It's a draw."); }
  cfPlayerScoreEl.textContent = cfScores.player;
  cfAiScoreEl.textContent = cfScores.ai;
  cfDrawScoreEl.textContent = cfScores.draw;
}

// AI helpers
function randomCf(board) { const cols = getAvailableCols(board); if (cols.length===0) return null; return cols[Math.floor(Math.random()*cols.length)]; }

function immediateWinningMove(board, symbol) {
  for (const c of getAvailableCols(board)) {
    const copy = cloneBoard(board);
    dropInCol(copy, c, symbol);
    if (checkCfWinner(copy) === symbol) return c;
  }
  return null;
}

function heuristicCf(board) {
  // If AI can win, do it. If player can win next, block. Else prefer center.
  const win = immediateWinningMove(board, 'A');
  if (win !== null) return win;
  const block = immediateWinningMove(board, 'P');
  if (block !== null) return block;
  // prefer center column
  const center = Math.floor(COLS/2);
  if (board[0][center] === null) return center;
  // else pick random near center
  const cols = getAvailableCols(board).sort((a,b) => Math.abs(center-a)-Math.abs(center-b));
  return cols[0] || null;
}

// Simple evaluation for minimax: score windows of 4
function evaluateBoard(board) {
  const SCORE_WIN = 1000000;
  let score = 0;
  const lines = [];
  // collect all 4-length windows
  for (let r=0;r<ROWS;r++){
    for (let c=0;c<COLS;c++){
      if (c+3<COLS) lines.push([board[r][c],board[r][c+1],board[r][c+2],board[r][c+3]]);
      if (r+3<ROWS) lines.push([board[r][c],board[r+1][c],board[r+2][c],board[r+3][c]]);
      if (r+3<ROWS && c+3<COLS) lines.push([board[r][c],board[r+1][c+1],board[r+2][c+2],board[r+3][c+3]]);
      if (r+3<ROWS && c-3>=0) lines.push([board[r][c],board[r+1][c-1],board[r+2][c-2],board[r+3][c-3]]);
    }
  }
  for (const w of lines) {
    const countA = w.filter(x=>x==='A').length;
    const countP = w.filter(x=>x==='P').length;
    if (countA===4) return SCORE_WIN;
    if (countP===4) return -SCORE_WIN;
    if (countA===3 && countP===0) score += 100;
    if (countA===2 && countP===0) score += 10;
    if (countP===3 && countA===0) score -= 80;
    if (countP===2 && countA===0) score -= 8;
  }
  return score;
}

function minimax(board, depth, maximizing) {
  const winner = checkCfWinner(board);
  if (winner==='A') return { score: 1000000 };
  if (winner==='P') return { score: -1000000 };
  const avail = getAvailableCols(board);
  if (depth===0 || avail.length===0) return { score: evaluateBoard(board) };
  if (maximizing) {
    let best = { score: -Infinity, col: null };
    for (const c of avail) {
      const copy = cloneBoard(board);
      dropInCol(copy, c, 'A');
      const res = minimax(copy, depth-1, false);
      if (res.score > best.score) best = { score: res.score, col: c };
    }
    return best;
  } else {
    let best = { score: Infinity, col: null };
    for (const c of avail) {
      const copy = cloneBoard(board);
      dropInCol(copy, c, 'P');
      const res = minimax(copy, depth-1, true);
      if (res.score < best.score) best = { score: res.score, col: c };
    }
    return best;
  }
}

function aiCfMove() {
  if (cfGameOver) return;
  const level = parseInt(cfDifficultyEl.value,10);
  let chosen = null;
  switch(level) {
    case 1: chosen = randomCf(cfBoard); break;
    case 2: chosen = heuristicCf(cfBoard); break;
    case 3: chosen = (function(){ const m = minimax(cfBoard,3,true); return m.col ?? heuristicCf(cfBoard); })(); break;
    case 4: chosen = (function(){ const m = minimax(cfBoard,5,true); return m.col ?? heuristicCf(cfBoard); })(); break;
    case 5: chosen = (function(){ const m = minimax(cfBoard,7,true); return m.col ?? heuristicCf(cfBoard); })(); break;
    default: chosen = heuristicCf(cfBoard);
  }
  if (chosen === null) return;
  dropInCol(cfBoard, chosen, 'A');
  renderCfBoard();
  const res = checkCfWinner(cfBoard);
  if (res) return handleCfResult(res);
  cfCurrent = 'P';
  updateCfStatus('Your turn');
}

function cfNewGame() {
  initCfBoard();
  cfCurrent = 'P';
  cfGameOver = false;
  renderCfBoard();
  updateCfStatus('Your turn');
}

cfNewGameBtn.addEventListener('click', cfNewGame);

// init
initCfBoard();
renderCfBoard();

// Connect Four admin logic
const cfAdminBtn = document.getElementById('cfAdminBtn');
const cfAdminPanel = document.getElementById('cfAdminPanel');
const cfAdminAuth = document.getElementById('cfAdminAuth');
const cfAdminPassword = document.getElementById('cfAdminPassword');
const cfAdminUnlock = document.getElementById('cfAdminUnlock');
const cfAdminContents = document.getElementById('cfAdminContents');
const cfAdminDifficulty = document.getElementById('cfAdminDifficulty');
const cfForceAiWinBtn = document.getElementById('cfForceAiWin');
const cfForcePlayerWinBtn = document.getElementById('cfForcePlayerWin');
const cfForceDrawBtn = document.getElementById('cfForceDraw');
const cfClearBoardBtn = document.getElementById('cfClearBoard');
const cfClearScoresBtn = document.getElementById('cfClearScores');
const cfResetLocalStorageBtn = document.getElementById('cfResetLocalStorage');
const cfExportStateBtn = document.getElementById('cfExportState');
const cfImportFileInput = document.getElementById('cfImportFile');
const cfClearLogsBtn = document.getElementById('cfClearLogs');
const cfExportLogsBtn = document.getElementById('cfExportLogs');
const cfCloseAdminBtn = document.getElementById('cfCloseAdmin');
const cfAdminLogsEl = document.getElementById('cfAdminLogs');
const cfLiveBoardEl = document.getElementById('cfLiveBoard');
const cfLiveScoresEl = document.getElementById('cfLiveScores');

let cfAdminUnlocked = false;
let cfAdminLogs = JSON.parse(localStorage.getItem('cf_admin_logs') || '[]');

function cfSaveAdminLogs() { localStorage.setItem('cf_admin_logs', JSON.stringify(cfAdminLogs)); }
function cfLog(action) { const entry = `${new Date().toISOString()} - ${action}`; cfAdminLogs.unshift(entry); if (cfAdminLogs.length>200) cfAdminLogs.pop(); cfSaveAdminLogs(); cfRenderAdminLogs(); }
function cfRenderAdminLogs() { if(!cfAdminLogsEl) return; cfAdminLogsEl.innerHTML = cfAdminLogs.map(l=>`<div>${l}</div>`).join(''); }
function cfRenderLiveStats() {
  if (cfLiveBoardEl) { cfLiveBoardEl.innerHTML=''; for(let i=0;i<ROWS*COLS;i++){ const el=document.createElement('div'); el.className='cell'; const r=Math.floor(i/COLS), c=i%COLS; el.textContent = cfBoard[r][c]? (cfBoard[r][c]==='P'?'●':'○') : ''; cfLiveBoardEl.appendChild(el);} }
  if (cfLiveScoresEl) cfLiveScoresEl.textContent = `Player: ${cfScores.player}  AI: ${cfScores.ai}  Draws: ${cfScores.draw}`;
}

function cfUnlockAdmin() {
  if (cfAdminPassword.value === '0320') {
    cfAdminUnlocked = true;
    cfAdminAuth.classList.add('hidden');
    cfAdminContents.classList.remove('hidden');
    cfLog('Admin unlocked');
  } else {
    alert('Incorrect code'); cfLog('Failed admin unlock attempt');
  }
}

cfAdminBtn && cfAdminBtn.addEventListener('click', ()=>{
  cfAdminPanel.classList.toggle('hidden');
  if (!cfAdminPanel.classList.contains('hidden')) { cfAdminAuth.classList.remove('hidden'); cfAdminContents.classList.add('hidden'); cfAdminPassword.value=''; cfRenderAdminLogs(); cfRenderLiveStats(); }
});
cfAdminUnlock && cfAdminUnlock.addEventListener('click', cfUnlockAdmin);

cfAdminDifficulty && cfAdminDifficulty.addEventListener('change', ()=>{ cfDifficultyEl.value = cfAdminDifficulty.value; cfLog(`Difficulty set to ${cfAdminDifficulty.value}`); });

function cfForceWinFor(symbol) {
  // place a simple horizontal win on bottom row
  for(let r=ROWS-1;r>=0;r--){ if (r===ROWS-1){ cfBoard = Array.from({length:ROWS},()=>Array(COLS).fill(null)); for(let c=0;c<4;c++){ cfBoard[r][c]=symbol; } renderCfBoard(); handleCfResult(symbol); cfLog(`Forced ${symbol} win`); return; }}
}

cfForceAiWinBtn && cfForceAiWinBtn.addEventListener('click', ()=>cfForceWinFor('A'));
cfForcePlayerWinBtn && cfForcePlayerWinBtn.addEventListener('click', ()=>cfForceWinFor('P'));

cfForceDrawBtn && cfForceDrawBtn.addEventListener('click', ()=>{
  // fill board in a non-winning pattern
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) cfBoard[r][c] = ((r+c)%2===0)?'P':'A';
  renderCfBoard(); handleCfResult('draw'); cfLog('Forced draw');
});

cfClearBoardBtn && cfClearBoardBtn.addEventListener('click', ()=>{ cfNewGame(); cfLog('Cleared board (new game)'); });

cfClearScoresBtn && cfClearScoresBtn.addEventListener('click', ()=>{ cfScores={player:0,ai:0,draw:0}; cfPlayerScoreEl.textContent=0; cfAiScoreEl.textContent=0; cfDrawScoreEl.textContent=0; localStorage.removeItem('cf_scores'); cfLog('Cleared scores'); });

cfResetLocalStorageBtn && cfResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); cfScores={player:0,ai:0,draw:0}; cfAdminLogs=[]; cfSaveAdminLogs(); cfPlayerScoreEl.textContent=0; cfAiScoreEl.textContent=0; cfDrawScoreEl.textContent=0; cfRenderAdminLogs(); cfRenderLiveStats(); cfLog('Reset localStorage'); });

cfExportStateBtn && cfExportStateBtn.addEventListener('click', ()=>{ const state={board:cfBoard,scores:cfScores,current:cfCurrent,gameOver:cfGameOver,logs:cfAdminLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','connect_state.json'); document.body.appendChild(a); a.click(); a.remove(); cfLog('Exported state'); });

cfImportFileInput && cfImportFileInput.addEventListener('change',(e)=>{ const file=e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.board) cfBoard=state.board; if(state.scores) cfScores=state.scores; if(state.current) cfCurrent=state.current; cfGameOver=!!state.gameOver; if(state.logs) cfAdminLogs=state.logs; renderCfBoard(); cfPlayerScoreEl.textContent=cfScores.player; cfAiScoreEl.textContent=cfScores.ai; cfDrawScoreEl.textContent=cfScores.draw; cfSaveAdminLogs(); cfRenderAdminLogs(); cfRenderLiveStats(); cfLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(file); });

cfClearLogsBtn && cfClearLogsBtn.addEventListener('click', ()=>{ cfAdminLogs=[]; cfSaveAdminLogs(); cfRenderAdminLogs(); cfLog('Cleared logs'); });

cfExportLogsBtn && cfExportLogsBtn.addEventListener('click', ()=>{ const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(cfAdminLogs)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','connect_admin_logs.json'); document.body.appendChild(a); a.click(); a.remove(); cfLog('Exported logs'); });

cfCloseAdminBtn && cfCloseAdminBtn.addEventListener('click', ()=>{ cfAdminPanel.classList.add('hidden'); cfAdminUnlocked=false; cfAdminAuth.classList.remove('hidden'); cfAdminContents.classList.add('hidden'); cfLog('Admin locked'); });

// wire live stats updates
const origRenderCfBoard = renderCfBoard;
renderCfBoard = function(){ origRenderCfBoard(); cfRenderLiveStats(); };

