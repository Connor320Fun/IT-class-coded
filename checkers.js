const CH_SIZE = 8;
const chBoardEl = document.getElementById('chBoard');
const chStatus = document.getElementById('chStatus');
const chNewGameBtn = document.getElementById('chNewGame');
const chDifficultyEl = document.getElementById('chDifficulty');
const chPlayerScoreEl = document.getElementById('chPlayerScore');
const chAiScoreEl = document.getElementById('chAiScore');
const chDrawScoreEl = document.getElementById('chDrawScore');

let chBoard = [];
let chSelected = null;
let chCurrent = 'P'; // P player, A ai
let chGameOver = false;
let chScores = { player:0, ai:0, draw:0 };

function initChBoard() {
  chBoard = Array.from({length:CH_SIZE},()=>Array(CH_SIZE).fill(null));
  // place pieces: player at bottom rows (r6,r7) as 'r', ai at top (r0,r1) as 'b'
  for (let r=0;r<CH_SIZE;r++){
    for (let c=0;c<CH_SIZE;c++){
      if ((r+c)%2===1){
        if (r<3) chBoard[r][c]='b';
        else if (r>4) chBoard[r][c]='r';
      }
    }
  }
}

function renderChBoard(){
  chBoardEl.innerHTML='';
  for(let r=0;r<CH_SIZE;r++){
    for(let c=0;c<CH_SIZE;c++){
      const cell=document.createElement('div');
      cell.className='checker-cell';
      cell.dataset.r=r; cell.dataset.c=c;
      const v=chBoard[r][c];
      cell.textContent = v? (v==='r'?'●':'○') : '';
      if (chSelected && chSelected.r==r && chSelected.c==c) cell.style.outline='2px solid #f59e0b';
      cell.addEventListener('click', ()=> onCellClick(r,c));
      chBoardEl.appendChild(cell);
    }
  }
}

function onCellClick(r,c){
  if (chGameOver) return;
  const v = chBoard[r][c];
  if (chCurrent==='P'){
    if (v && v==='r') { chSelected = {r,c}; chStatus.textContent='Piece selected'; renderChBoard(); }
    else if (chSelected){
      if (tryMove(chSelected.r,chSelected.c,r,c,'r')){ chSelected=null; renderChBoard(); const res=checkChWinner(); if(res) return handleChResult(res); chCurrent='A'; chStatus.textContent='AI thinking...'; setTimeout(aiChMove,300); }
      else { chStatus.textContent='Invalid move'; }
    }
  }
}

function inBounds(r,c){ return r>=0 && r<CH_SIZE && c>=0 && c<CH_SIZE; }

function tryMove(sr,sc,tr,tc,symbol){
  // simple move rules: diagonal one forward for player (-1 row), or capture by jumping over opponent
  const dr = tr - sr; const dc = tc - sc;
  if (!inBounds(tr,tc) || chBoard[tr][tc]!==null) return false;
  // player 'r' moves up (decreasing r)
  if (symbol==='r'){
    if (Math.abs(dr)===1 && Math.abs(dc)===1 && dr===-1){ chBoard[tr][tc]=symbol; chBoard[sr][sc]=null; return true; }
    if (Math.abs(dr)===2 && Math.abs(dc)===2 && dr===-2){ const mr=sr+dr/2, mc=sc+dc/2; if (chBoard[mr][mc]=== 'b'){ chBoard[tr][tc]=symbol; chBoard[sr][sc]=null; chBoard[mr][mc]=null; return true; } }
  }
  // AI 'b' moves down (increasing r)
  if (symbol==='b'){
    if (Math.abs(dr)===1 && Math.abs(dc)===1 && dr===1){ chBoard[tr][tc]=symbol; chBoard[sr][sc]=null; return true; }
    if (Math.abs(dr)===2 && Math.abs(dc)===2 && dr===2){ const mr=sr+dr/2, mc=sc+dc/2; if (chBoard[mr][mc]=== 'r'){ chBoard[tr][tc]=symbol; chBoard[sr][sc]=null; chBoard[mr][mc]=null; return true; } }
  }
  return false;
}

function getAllMoves(board, symbol){
  const moves=[];
  for(let r=0;r<CH_SIZE;r++) for(let c=0;c<CH_SIZE;c++) if(board[r][c]===symbol){
    const dirs = symbol==='r'? [[-1,-1],[-1,1],[-2,-2],[-2,2]] : [[1,-1],[1,1],[2,-2],[2,2]];
    for(const d of dirs){ const tr=r+d[0], tc=c+d[1]; if(inBounds(tr,tc) && board[tr][tc]===null){ if(Math.abs(d[0])===1){ if( trySimMove(board,r,c,tr,tc,symbol) ) moves.push({sr:r,sc:c,tr,tc}); } else { if( trySimCapture(board,r,c,tr,tc,symbol) ) moves.push({sr:r,sc:c,tr,tc}); } }
    }
  }
  return moves;
}

function trySimMove(board,sr,sc,tr,tc,symbol){
  // simulate one-step (no captures)
  const dr=tr-sr; if(symbol==='r' && dr!==-1) return false; if(symbol==='b' && dr!==1) return false; return true;
}

function trySimCapture(board,sr,sc,tr,tc,symbol){
  const dr=tr-sr; const dc=tc-sc; if(Math.abs(dr)!==2){} // not used
  const mr=sr+dr/2, mc=sc+dc/2; if(!inBounds(mr,mc)) return false; const opp = symbol==='r'?'b':'r'; return board[mr][mc]===opp;
}

function aiChMove(){
  if (chGameOver) return;
  const level = parseInt(chDifficultyEl.value,10);
  const moves = getAllMoves(chBoard,'b');
  if (moves.length===0){ const res=checkChWinner(); if(res) return handleChResult(res); return; }
  let choice = moves[Math.floor(Math.random()*moves.length)];
  if (level>=2){ // prefer captures (2-step moves)
    const caps = moves.filter(m => Math.abs(m.tr-m.sr)===2);
    if (caps.length) choice = caps[0];
  }
  tryMove(choice.sr,choice.sc,choice.tr,choice.tc,'b');
  renderChBoard();
  const res = checkChWinner(); if(res) return handleChResult(res);
  chCurrent='P'; chStatus.textContent='Your move';
}

function countPieces(){ let r=0,b=0; for(let i=0;i<CH_SIZE;i++) for(let j=0;j<CH_SIZE;j++){ if(chBoard[i][j]==='r') r++; if(chBoard[i][j]==='b') b++; } return {r,b}; }

function checkChWinner(){ const c = countPieces(); if(c.r===0) return 'O'; if(c.b===0) return 'X'; return null; }

function handleChResult(res){ chGameOver=true; if(res==='X'){ chScores.player++; chStatus.textContent='Player wins!'; } else if (res==='O'){ chScores.ai++; chStatus.textContent='AI wins!'; } chPlayerScoreEl.textContent=chScores.player; chAiScoreEl.textContent=chScores.ai; }

function chNew(){ initChBoard(); chSelected=null; chCurrent='P'; chGameOver=false; chStatus.textContent='Your move'; renderChBoard(); }

chNewGameBtn.addEventListener('click', chNew);

// Admin panel wiring (inline code 0320)
const chAdminBtn = document.getElementById('chAdminBtn');
const chAdminPanel = document.getElementById('chAdminPanel');
const chAdminAuth = document.getElementById('chAdminAuth');
const chAdminPassword = document.getElementById('chAdminPassword');
const chAdminUnlock = document.getElementById('chAdminUnlock');
const chAdminContents = document.getElementById('chAdminContents');
const chAdminDifficulty = document.getElementById('chAdminDifficulty');
const chForceAiWinBtn = document.getElementById('chForceAiWin');
const chForcePlayerWinBtn = document.getElementById('chForcePlayerWin');
const chClearScoresBtn = document.getElementById('chClearScores');
const chResetGameBtn = document.getElementById('chResetGame');
const chResetLocalStorageBtn = document.getElementById('chResetLocalStorage');
const chExportStateBtn = document.getElementById('chExportState');
const chImportFile = document.getElementById('chImportFile');
const chAdminLogsEl = document.getElementById('chAdminLogs');
const chCloseAdminBtn = document.getElementById('chCloseAdmin');

let chLogs = JSON.parse(localStorage.getItem('ch_admin_logs')||'[]');
let chOwnerDisabled = false;
const chOwnerBtn = document.getElementById('chOwnerBtn');
const chOwnerPanel = document.getElementById('chOwnerPanel');
const chOwnerAuth = document.getElementById('chOwnerAuth');
const chOwnerPassword = document.getElementById('chOwnerPassword');
const chOwnerUnlock = document.getElementById('chOwnerUnlock');
const chOwnerContents = document.getElementById('chOwnerContents');
const chOwnerSetStateBtn = document.getElementById('chOwnerSetState');
const chOwnerStateInput = document.getElementById('chOwnerStateInput');
const chOwnerViewLSBtn = document.getElementById('chOwnerViewLS');
const chOwnerLocalStorageEl = document.getElementById('chOwnerLocalStorage');
const chOwnerKillSwitchBtn = document.getElementById('chOwnerKillSwitch');
const chOwnerCloseBtn = document.getElementById('chOwnerClose');

function chOwnerUnlockFn(){ if(chOwnerPassword.value==='Bowling320Fun'){ chOwnerAuth.classList.add('hidden'); chOwnerContents.classList.remove('hidden'); chLog('Owner unlocked'); } else { alert('Incorrect owner code'); chLog('Failed owner unlock attempt'); } }
// also unlock admin for owner
function chOwnerUnlockAndAdmin(){ if(chOwnerPassword.value==='Bowling320Fun'){ chOwnerAuth.classList.add('hidden'); chOwnerContents.classList.remove('hidden'); chLog('Owner unlocked'); chAdminAuth.classList.add('hidden'); chAdminContents.classList.remove('hidden'); chRenderLogs(); } else { alert('Incorrect owner code'); chLog('Failed owner unlock attempt'); } }

chOwnerBtn && chOwnerBtn.addEventListener('click', ()=>{ chOwnerPanel.classList.toggle('hidden'); if(!chOwnerPanel.classList.contains('hidden')){ chOwnerAuth.classList.remove('hidden'); chOwnerContents.classList.add('hidden'); chOwnerPassword.value=''; } });
chOwnerUnlock && chOwnerUnlock.addEventListener('click', chOwnerUnlockAndAdmin);

chOwnerSetStateBtn && chOwnerSetStateBtn.addEventListener('click', ()=>{ const txt = chOwnerStateInput.value; if(!txt) return alert('Paste JSON state'); try{ const state=JSON.parse(txt); if(state.board) chBoard=state.board; if(state.scores) chScores=state.scores; if(state.current) chCurrent=state.current; chGameOver=!!state.gameOver; if(state.logs) chLogs=state.logs; chSaveLogs(); renderChBoard(); chPlayerScoreEl.textContent=chScores.player; chAiScoreEl.textContent=chScores.ai; chDrawScoreEl.textContent=chScores.draw; chRenderLogs(); chLog('Owner applied state'); }catch(err){ alert('Invalid JSON'); } });

chOwnerViewLSBtn && chOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } chOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); chLog('Owner viewed localStorage'); });

chOwnerKillSwitchBtn && chOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); chLog('Owner used kill switch'); location.reload(); });

chOwnerCloseBtn && chOwnerCloseBtn.addEventListener('click', ()=>{ chOwnerPanel.classList.add('hidden'); chOwnerAuth.classList.remove('hidden'); chOwnerContents.classList.add('hidden'); chLog('Owner locked'); });
function chSaveLogs(){ localStorage.setItem('ch_admin_logs', JSON.stringify(chLogs)); }
function chLog(a){ chLogs.unshift(`${new Date().toISOString()} - ${a}`); if(chLogs.length>200) chLogs.pop(); chSaveLogs(); chRenderLogs(); }
function chRenderLogs(){ if(chAdminLogsEl) chAdminLogsEl.innerHTML = chLogs.map(l=>`<div>${l}</div>`).join(''); }

function chUnlock(){ if(chAdminPassword.value==='0320'){ chAdminAuth.classList.add('hidden'); chAdminContents.classList.remove('hidden'); chLog('Admin unlocked'); } else { alert('Incorrect code'); chLog('Failed admin unlock attempt'); } }

chAdminBtn && chAdminBtn.addEventListener('click', ()=>{ chAdminPanel.classList.toggle('hidden'); if(!chAdminPanel.classList.contains('hidden')){ chAdminAuth.classList.remove('hidden'); chAdminContents.classList.add('hidden'); chAdminPassword.value=''; chRenderLogs(); } });
chAdminUnlock && chAdminUnlock.addEventListener('click', chUnlock);
chAdminDifficulty && chAdminDifficulty.addEventListener('change', ()=>{ chDifficultyEl.value = chAdminDifficulty.value; chLog(`Difficulty set to ${chAdminDifficulty.value}`); });
chForceAiWinBtn && chForceAiWinBtn.addEventListener('click', ()=>{ // clear player pieces
  for(let r=0;r<CH_SIZE;r++) for(let c=0;c<CH_SIZE;c++) if(chBoard[r][c]==='r') chBoard[r][c]=null; renderChBoard(); handleChResult('O'); chLog('Forced AI win'); });
chForcePlayerWinBtn && chForcePlayerWinBtn.addEventListener('click', ()=>{ for(let r=0;r<CH_SIZE;r++) for(let c=0;c<CH_SIZE;c++) if(chBoard[r][c]==='b') chBoard[r][c]=null; renderChBoard(); handleChResult('X'); chLog('Forced player win'); });
chClearScoresBtn && chClearScoresBtn.addEventListener('click', ()=>{ chScores={player:0,ai:0,draw:0}; chPlayerScoreEl.textContent=0; chAiScoreEl.textContent=0; chDrawScoreEl.textContent=0; localStorage.removeItem('ch_scores'); chLog('Cleared scores'); });
chResetLocalStorageBtn && chResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); chLogs=[]; chSaveLogs(); chRenderLogs(); chLog('Reset localStorage'); });
chResetGameBtn && chResetGameBtn.addEventListener('click', ()=>{ chNew(); chLog('Game reset'); });
chExportStateBtn && chExportStateBtn.addEventListener('click', ()=>{ const state={board:chBoard,scores:chScores,logs:chLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','checkers_state.json'); document.body.appendChild(a); a.click(); a.remove(); chLog('Exported state'); });
chImportFile && chImportFile.addEventListener('change',(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.board) chBoard=state.board; if(state.scores) chScores=state.scores; if(state.logs) chLogs=state.logs; renderChBoard(); chPlayerScoreEl.textContent=chScores.player; chAiScoreEl.textContent=chScores.ai; chDrawScoreEl.textContent=chScores.draw; chSaveLogs(); chRenderLogs(); chLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); });
chCloseAdminBtn && chCloseAdminBtn.addEventListener('click', ()=>{ chAdminPanel.classList.add('hidden'); chAdminAuth.classList.remove('hidden'); chAdminContents.classList.add('hidden'); chLog('Admin locked'); });

// init
chNew();
