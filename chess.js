// Minimal chess: player is White (uppercase), AI is black (lowercase).
const chessBoardEl = document.getElementById('chessBoard');
const chessStatus = document.getElementById('chessStatus');
const chessNewGameBtn = document.getElementById('chessNewGame');
const chessDifficultyEl = document.getElementById('chessDifficulty');
const chessPlayerScoreEl = document.getElementById('chessPlayerScore');
const chessAiScoreEl = document.getElementById('chessAiScore');
const chessDrawScoreEl = document.getElementById('chessDrawScore');

let chessBoard = [];
let chessSelected = null;
let chessCurrent = 'W'; // 'W' player white, 'B' ai black
let chessGameOver = false;
let chessScores = { player:0, ai:0, draw:0 };

const initialFEN = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

function initChess() {
  chessBoard = JSON.parse(JSON.stringify(initialFEN));
  chessSelected = null;
  chessCurrent = 'W';
  chessGameOver = false;
  chessStatus.textContent = 'Your turn (White)';
  renderChess();
}

function renderChess() {
  chessBoardEl.innerHTML = '';
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      const cell = document.createElement('div');
      cell.className = 'chess-cell';
      cell.dataset.r = r; cell.dataset.c = c;
      const p = chessBoard[r][c];
      cell.textContent = p ? p : '';
      cell.addEventListener('click', ()=> onCellClick(r,c));
      if (chessSelected && chessSelected.r===r && chessSelected.c===c) cell.style.outline='2px solid #f59e0b';
      chessBoardEl.appendChild(cell);
    }
  }
}

function isWhite(piece){ return piece && piece === piece.toUpperCase(); }
function isBlack(piece){ return piece && piece === piece.toLowerCase(); }

function onCellClick(r,c){
  if (chessGameOver) return;
  const p = chessBoard[r][c];
  if (chessCurrent==='W'){
    if (p && isWhite(p)) { chessSelected = {r,c}; chessStatus.textContent='Piece selected'; renderChess(); }
    else if (chessSelected) { if (tryMove(chessSelected.r,chessSelected.c,r,c)) { chessSelected=null; renderChess(); const res=checkKingCaptured(); if(res) return handleChessResult(res); chessCurrent='B'; chessStatus.textContent='AI thinking...'; setTimeout(aiChessMove, 300); } else { chessStatus.textContent='Invalid move'; } }
  }
}

function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }

function tryMove(sr,sc,tr,tc){
  const piece = chessBoard[sr][sc];
  if (!piece) return false;
  const target = chessBoard[tr][tc];
  const dirR = tr - sr; const dirC = tc - sc;
  const absR = Math.abs(dirR), absC = Math.abs(dirC);
  const pLower = piece.toLowerCase();
  // Pawn
  if (pLower === 'p'){
    if (isWhite(piece)){
      if (dirR === -1 && dirC === 0 && !target) { chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; promoteIfNeeded(tr,tc); return true; }
      if (dirR === -1 && absC===1 && target && isBlack(target)){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; promoteIfNeeded(tr,tc); return true; }
      // double step
      if (sr===6 && dirR===-2 && dirC===0 && !target && !chessBoard[sr-1][sc]){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; return true; }
    } else {
      if (dirR === 1 && dirC === 0 && !target) { chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; promoteIfNeeded(tr,tc); return true; }
      if (dirR === 1 && absC===1 && target && isWhite(target)){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; promoteIfNeeded(tr,tc); return true; }
      if (sr===1 && dirR===2 && dirC===0 && !target && !chessBoard[sr+1][sc]){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; return true; }
    }
    return false;
  }
  // Knight
  if (pLower==='n'){
    if ((absR===2 && absC===1) || (absR===1 && absC===2)){
      if (!target || (isWhite(piece) ? isBlack(target) : isWhite(target))){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; return true; }
    }
    return false;
  }
  // King
  if (pLower==='k'){
    if (Math.max(absR,absC)===1){ if (!target || (isWhite(piece) ? isBlack(target) : isWhite(target))){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; return true; } }
    return false;
  }
  // Sliding pieces: bishop, rook, queen
  if (pLower==='b' || pLower==='r' || pLower==='q'){
    const stepR = Math.sign(dirR); const stepC = Math.sign(dirC);
    if (dirR!==0 && dirC!==0 && pLower==='r') return false;
    if ((dirR===0 || dirC===0) && pLower==='b') return false;
    if (pLower==='b' && absR!==absC) return false;
    if (pLower==='q'){
      if (!(absR===absC || dirR===0 || dirC===0)) return false;
    }
    let rcur=sr+stepR, ccur=sc+stepC;
    while(rcur!==tr || ccur!==tc){ if (!inBounds(rcur,ccur)) return false; if (chessBoard[rcur][ccur]) return false; rcur+=stepR; ccur+=stepC; }
    if (!target || (isWhite(piece) ? isBlack(target) : isWhite(target))){ chessBoard[tr][tc]=piece; chessBoard[sr][sc]=null; return true; }
    return false;
  }
  return false;
}

function promoteIfNeeded(r,c){ const p = chessBoard[r][c]; if (!p) return; if (p==='P' && r===0) chessBoard[r][c]='Q'; if (p==='p' && r===7) chessBoard[r][c]='q'; }

function generateMovesFor(color){
  const moves = [];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p = chessBoard[r][c]; if (!p) continue; if (color==='W' && !isWhite(p)) continue; if (color==='B' && !isBlack(p)) continue; for(let tr=0;tr<8;tr++) for(let tc=0;tc<8;tc++){ const target = chessBoard[tr][tc]; // try move
        const copy = copyBoard(chessBoard); if (tryMoveSim(copy,r,c,tr,tc,color)) moves.push({sr:r,sc:c,tr,tc,cap: target?1:0}); }}
  return moves;
}

function tryMoveSim(board,sr,sc,tr,tc,color){
  // similar to tryMove but operates on provided board
  const piece = board[sr][sc]; if(!piece) return false; const target = board[tr][tc]; const dirR = tr - sr; const dirC = tc - sc; const absR = Math.abs(dirR), absC = Math.abs(dirC); const pLower = piece.toLowerCase();
  function isW(x){ return x && x===x.toUpperCase(); }
  function isB(x){ return x && x===x.toLowerCase(); }
  if (pLower==='p'){
    if (isW(piece)){
      if (dirR === -1 && dirC === 0 && !target) { board[tr][tc]=piece; board[sr][sc]=null; return true; }
      if (dirR === -1 && absC===1 && target && isB(target)){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
      if (sr===6 && dirR===-2 && dirC===0 && !target && !board[sr-1][sc]){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
    } else {
      if (dirR === 1 && dirC === 0 && !target) { board[tr][tc]=piece; board[sr][sc]=null; return true; }
      if (dirR === 1 && absC===1 && target && isW(target)){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
      if (sr===1 && dirR===2 && dirC===0 && !target && !board[sr+1][sc]){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
    }
    return false;
  }
  if (pLower==='n'){
    if ((absR===2 && absC===1) || (absR===1 && absC===2)){
      if (!target || (isW(piece)? isB(target): isW(target))){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
    }
    return false;
  }
  if (pLower==='k'){
    if (Math.max(absR,absC)===1){ if (!target || (isW(piece)? isB(target): isW(target))){ board[tr][tc]=piece; board[sr][sc]=null; return true; } }
    return false;
  }
  if (pLower==='b' || pLower==='r' || pLower==='q'){
    const stepR = Math.sign(dirR); const stepC = Math.sign(dirC);
    if (dirR!==0 && dirC!==0 && pLower==='r') return false;
    if ((dirR===0 || dirC===0) && pLower==='b') return false;
    if (pLower==='b' && absR!==absC) return false;
    if (pLower==='q'){ if (!(absR===absC || dirR===0 || dirC===0)) return false; }
    let rcur=sr+stepR, ccur=sc+stepC;
    while(rcur!==tr || ccur!==tc){ if (!inBounds(rcur,ccur)) return false; if (board[rcur][ccur]) return false; rcur+=stepR; ccur+=stepC; }
    if (!target || (isW(piece)? isB(target): isW(target))){ board[tr][tc]=piece; board[sr][sc]=null; return true; }
    return false;
  }
  return false;
}

function copyBoard(b){ return b.map(r=>r.slice()); }

function evaluateBoard(board){
  const values = {p:1,n:3,b:3,r:5,q:9,k:1000}; let score=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=board[r][c]; if(!p) continue; const v = values[p.toLowerCase()]||0; if (p===p.toUpperCase()) score += v; else score -= v; }
  return score;
}

function generateMoves(board,color){
  const moves = [];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=board[r][c]; if(!p) continue; if (color==='W' && !isWhite(p)) continue; if (color==='B' && !isBlack(p)) continue; for(let tr=0;tr<8;tr++) for(let tc=0;tc<8;tc++){ const copy = copyBoard(board); if (tryMoveSim(copy,r,c,tr,tc,color)) moves.push({sr:r,sc:c,tr,tc}); } }
  return moves;
}

function aiChessMove(){
  if (chessGameOver) return;
  const level = parseInt(chessDifficultyEl.value,10);
  const moves = generateMoves(chessBoard,'B');
  if (moves.length===0) return;
  let choice = null;
  if (level===1) choice = moves[Math.floor(Math.random()*moves.length)];
  else if (level===2){ // prefer captures
    const caps = moves.filter(m=> chessBoard[m.tr][m.tc]); choice = (caps.length? caps[0] : moves[Math.floor(Math.random()*moves.length)]);
  } else { // heuristic/minimax depth 2
    let best = {score:-Infinity,move:null};
    const depth = level<=3?2: level===4?3:4;
    for(const m of moves){ const bcopy = copyBoard(chessBoard); tryMoveSim(bcopy,m.sr,m.sc,m.tr,m.tc,'B'); const val = minimax(bcopy, depth-1, false); if (val>best.score){ best.score=val; best.move=m; } }
    choice = best.move || moves[0];
  }
  if (choice){ tryMove(choice.sr,choice.sc,choice.tr,choice.tc); renderChess(); const res = checkKingCaptured(); if(res) return handleChessResult(res); chessCurrent='W'; chessStatus.textContent='Your turn (White)'; }
}

function minimax(board, depth, maximizing){ const winner = kingCaptured(board); if (winner==='W') return -10000; if (winner==='B') return 10000; if (depth===0) return evaluateBoard(board); const moves = generateMoves(board, maximizing? 'B':'W'); if (moves.length===0) return evaluateBoard(board); if (maximizing){ let best=-Infinity; for(const m of moves){ const b=copyBoard(board); tryMoveSim(b,m.sr,m.sc,m.tr,m.tc,maximizing?'B':'W'); const val = minimax(b,depth-1,false); best=Math.max(best,val);} return best; } else { let best=Infinity; for(const m of moves){ const b=copyBoard(board); tryMoveSim(b,m.sr,m.sc,m.tr,m.tc,maximizing?'B':'W'); const val = minimax(b,depth-1,true); best=Math.min(best,val);} return best; } }

function kingCaptured(board){ let w=false,b=false; for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=board[r][c]; if(p==='K') w=true; if(p==='k') b=true; } if(!w) return 'B'; if(!b) return 'W'; return null; }

function checkKingCaptured(){ return kingCaptured(chessBoard); }

function handleChessResult(res){ chessGameOver=true; if (res==='W'){ chessScores.player++; chessStatus.textContent='Player wins!'; } else if (res==='B'){ chessScores.ai++; chessStatus.textContent='AI wins!'; } chessPlayerScoreEl.textContent=chessScores.player; chessAiScoreEl.textContent=chessScores.ai; }

// Admin wiring (inline code 0320) - similar pattern used across other games
const chessAdminBtn = document.getElementById('chessAdminBtn');
const chessAdminPanel = document.getElementById('chessAdminPanel');
const chessAdminAuth = document.getElementById('chessAdminAuth');
const chessAdminPassword = document.getElementById('chessAdminPassword');
const chessAdminUnlock = document.getElementById('chessAdminUnlock');
const chessAdminContents = document.getElementById('chessAdminContents');
const chessAdminDifficulty = document.getElementById('chessAdminDifficulty');
const chessForceAiWinBtn = document.getElementById('chessForceAiWin');
const chessForcePlayerWinBtn = document.getElementById('chessForcePlayerWin');
const chessClearScoresBtn = document.getElementById('chessClearScores');
const chessResetGameBtn = document.getElementById('chessResetGame');
const chessResetLocalStorageBtn = document.getElementById('chessResetLocalStorage');
const chessExportStateBtn = document.getElementById('chessExportState');
const chessImportFile = document.getElementById('chessImportFile');
const chessAdminLogsEl = document.getElementById('chessAdminLogs');
const chessCloseAdminBtn = document.getElementById('chessCloseAdmin');

let chessAdminLogs = JSON.parse(localStorage.getItem('ch_admin_logs')||'[]');
let chessOwnerDisabled = false;
const chessOwnerBtn = document.getElementById('chessOwnerBtn');
const chessOwnerPanel = document.getElementById('chessOwnerPanel');
const chessOwnerAuth = document.getElementById('chessOwnerAuth');
const chessOwnerPassword = document.getElementById('chessOwnerPassword');
const chessOwnerUnlock = document.getElementById('chessOwnerUnlock');
const chessOwnerContents = document.getElementById('chessOwnerContents');
const chessOwnerSetStateBtn = document.getElementById('chessOwnerSetState');
const chessOwnerStateInput = document.getElementById('chessOwnerStateInput');
const chessOwnerViewLSBtn = document.getElementById('chessOwnerViewLS');
const chessOwnerLocalStorageEl = document.getElementById('chessOwnerLocalStorage');
const chessOwnerKillSwitchBtn = document.getElementById('chessOwnerKillSwitch');
const chessOwnerCloseBtn = document.getElementById('chessOwnerClose');

function chessOwnerUnlockFn(){ if(chessOwnerPassword.value==='Bowling320Fun'){ chessOwnerAuth.classList.add('hidden'); chessOwnerContents.classList.remove('hidden'); chessLog('Owner unlocked'); } else { alert('Incorrect owner code'); chessLog('Failed owner unlock attempt'); } }
// also unlock admin for owner
function chessOwnerUnlockAndAdmin(){ if(chessOwnerPassword.value==='Bowling320Fun'){ chessOwnerAuth.classList.add('hidden'); chessOwnerContents.classList.remove('hidden'); chessLog('Owner unlocked'); chessAdminAuth.classList.add('hidden'); chessAdminContents.classList.remove('hidden'); chessRenderLogs(); } else { alert('Incorrect owner code'); chessLog('Failed owner unlock attempt'); } }

chessOwnerBtn && chessOwnerBtn.addEventListener('click', ()=>{ chessOwnerPanel.classList.toggle('hidden'); if(!chessOwnerPanel.classList.contains('hidden')){ chessOwnerAuth.classList.remove('hidden'); chessOwnerContents.classList.add('hidden'); chessOwnerPassword.value=''; } });
chessOwnerUnlock && chessOwnerUnlock.addEventListener('click', chessOwnerUnlockAndAdmin);

chessOwnerSetStateBtn && chessOwnerSetStateBtn.addEventListener('click', ()=>{ const txt = chessOwnerStateInput.value; if(!txt) return alert('Paste JSON state'); try{ const state=JSON.parse(txt); if(state.board) chessBoard=state.board; if(state.scores) chessScores=state.scores; if(state.current) chessCurrent=state.current; chessGameOver=!!state.gameOver; if(state.logs) chessAdminLogs=state.logs; chessSaveLogs(); renderChess(); chessPlayerScoreEl.textContent=chessScores.player; chessAiScoreEl.textContent=chessScores.ai; chessDrawScoreEl.textContent=chessScores.draw; chessRenderLogs(); chessLog('Owner applied state'); }catch(err){ alert('Invalid JSON'); } });

chessOwnerViewLSBtn && chessOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } chessOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); chessLog('Owner viewed localStorage'); });

chessOwnerKillSwitchBtn && chessOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); chessLog('Owner used kill switch'); location.reload(); });

chessOwnerCloseBtn && chessOwnerCloseBtn.addEventListener('click', ()=>{ chessOwnerPanel.classList.add('hidden'); chessOwnerAuth.classList.remove('hidden'); chessOwnerContents.classList.add('hidden'); chessLog('Owner locked'); });
function chessSaveLogs(){ localStorage.setItem('ch_admin_logs', JSON.stringify(chessAdminLogs)); }
function chessLog(a){ chessAdminLogs.unshift(`${new Date().toISOString()} - ${a}`); if(chessAdminLogs.length>200) chessAdminLogs.pop(); chessSaveLogs(); chessRenderLogs(); }
function chessRenderLogs(){ if(chessAdminLogsEl) chessAdminLogsEl.innerHTML = chessAdminLogs.map(l=>`<div>${l}</div>`).join(''); }

function chessUnlock(){ if(chessAdminPassword.value==='0320'){ chessAdminAuth.classList.add('hidden'); chessAdminContents.classList.remove('hidden'); chessLog('Admin unlocked'); } else { alert('Incorrect code'); chessLog('Failed admin unlock attempt'); } }

chessAdminBtn && chessAdminBtn.addEventListener('click', ()=>{ chessAdminPanel.classList.toggle('hidden'); if(!chessAdminPanel.classList.contains('hidden')){ chessAdminAuth.classList.remove('hidden'); chessAdminContents.classList.add('hidden'); chessAdminPassword.value=''; chessRenderLogs(); } });
chessAdminUnlock && chessAdminUnlock.addEventListener('click', chessUnlock);
chessAdminDifficulty && chessAdminDifficulty.addEventListener('change', ()=>{ chessDifficultyEl.value = chessAdminDifficulty.value; chessLog(`Difficulty set to ${chessAdminDifficulty.value}`); });
chessForceAiWinBtn && chessForceAiWinBtn.addEventListener('click', ()=>{ // remove white king to force AI win
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(chessBoard[r][c]==='K') chessBoard[r][c]=null; renderChess(); chessGameOver=true; handleChessResult('B'); chessLog('Forced AI win'); });
chessForcePlayerWinBtn && chessForcePlayerWinBtn.addEventListener('click', ()=>{ for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(chessBoard[r][c]==='k') chessBoard[r][c]=null; renderChess(); chessGameOver=true; handleChessResult('W'); chessLog('Forced player win'); });
chessClearScoresBtn && chessClearScoresBtn.addEventListener('click', ()=>{ chessScores={player:0,ai:0,draw:0}; chessPlayerScoreEl.textContent=0; chessAiScoreEl.textContent=0; chessDrawScoreEl.textContent=0; localStorage.removeItem('chess_scores'); chessLog('Cleared scores'); });
chessResetLocalStorageBtn && chessResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); chessAdminLogs=[]; chessSaveLogs(); chessRenderLogs(); chessLog('Reset localStorage'); });
chessResetGameBtn && chessResetGameBtn.addEventListener('click', ()=>{ initChess(); chessLog('Game reset'); });
chessExportStateBtn && chessExportStateBtn.addEventListener('click', ()=>{ const state={board:chessBoard,scores:chessScores,current:chessCurrent,gameOver:chessGameOver,logs:chessAdminLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','chess_state.json'); document.body.appendChild(a); a.click(); a.remove(); chessLog('Exported state'); });
chessImportFile && chessImportFile.addEventListener('change',(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.board) chessBoard=state.board; if(state.scores) chessScores=state.scores; if(state.current) chessCurrent=state.current; chessGameOver=!!state.gameOver; if(state.logs) chessAdminLogs=state.logs; renderChess(); chessPlayerScoreEl.textContent=chessScores.player; chessAiScoreEl.textContent=chessScores.ai; chessDrawScoreEl.textContent=chessScores.draw; chessSaveLogs(); chessRenderLogs(); chessLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); });
chessCloseAdminBtn && chessCloseAdminBtn.addEventListener('click', ()=>{ chessAdminPanel.classList.add('hidden'); chessAdminAuth.classList.remove('hidden'); chessAdminContents.classList.add('hidden'); chessLog('Admin locked'); });

// Hook new game button
chessNewGameBtn && chessNewGameBtn.addEventListener('click', initChess);

// start
initChess();
