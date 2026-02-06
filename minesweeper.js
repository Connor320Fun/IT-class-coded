const MS_SIZE = 8;
const MS_MINES = 10;
const msBoardEl = document.getElementById('msBoard');
const msStatus = document.getElementById('msStatus');
const msNewGameBtn = document.getElementById('msNewGame');
const msDifficultyEl = document.getElementById('msDifficulty');
const msPlayerScoreEl = document.getElementById('msPlayerScore');
const msAiScoreEl = document.getElementById('msAiScore');
const msDrawScoreEl = document.getElementById('msDrawScore');

let msBoard = [];
let msRevealed = [];
let msFlags = [];
let msCurrent = 'P';
let msGameOver = false;
let msScores = { player:0, ai:0, draw:0 };
let msLogs = JSON.parse(localStorage.getItem('ms_admin_logs')||'[]');

function initMsBoard() {
  msBoard = Array(MS_SIZE).fill(null).map(()=>Array(MS_SIZE).fill(0));
  msRevealed = Array(MS_SIZE).fill(null).map(()=>Array(MS_SIZE).fill(false));
  msFlags = Array(MS_SIZE).fill(null).map(()=>Array(MS_SIZE).fill(false));
  let mines = 0;
  while(mines < MS_MINES) {
    const r = Math.floor(Math.random()*MS_SIZE);
    const c = Math.floor(Math.random()*MS_SIZE);
    if(msBoard[r][c] !== 'M') { msBoard[r][c]='M'; mines++; }
  }
  for(let r=0;r<MS_SIZE;r++) {
    for(let c=0;c<MS_SIZE;c++) {
      if(msBoard[r][c] !== 'M') {
        let count = 0;
        for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
          const nr=r+dr, nc=c+dc;
          if(nr>=0 && nr<MS_SIZE && nc>=0 && nc<MS_SIZE && msBoard[nr][nc]==='M') count++;
        }
        msBoard[r][c] = count;
      }
    }
  }
}

function renderMs() {
  msBoardEl.innerHTML='';
  for(let r=0;r<MS_SIZE;r++) {
    for(let c=0;c<MS_SIZE;c++) {
      const cell=document.createElement('div');
      cell.className='ms-cell';
      if(msRevealed[r][c]) {
        cell.textContent = msBoard[r][c]==='M' ? '💣' : msBoard[r][c]===0 ? '' : msBoard[r][c];
        cell.style.background = msBoard[r][c]==='M' ? '#991b1b' : '#0f172a';
      } else {
        cell.textContent = msFlags[r][c] ? '🚩' : '';
        cell.style.background = '#374151';
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', ()=>{ if(!msGameOver) msReveal(r,c); });
        cell.addEventListener('contextmenu', (e)=>{ e.preventDefault(); if(!msGameOver) msToggleFlag(r,c); });
      }
      msBoardEl.appendChild(cell);
    }
  }
}

function msReveal(r, c) {
  if(msRevealed[r][c] || msFlags[r][c]) return;
  if(msBoard[r][c]==='M') { msStatus.textContent='💣 Game Over! You hit a mine!'; msGameOver=true; msScores.ai++; msAiScoreEl.textContent=msScores.ai; msLog('Player hit mine'); } else {
    if(msBoard[r][c]===0) { for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) { const nr=r+dr,nc=c+dc; if(nr>=0&&nr<MS_SIZE&&nc>=0&&nc<MS_SIZE&&!msRevealed[nr][nc]) msReveal(nr,nc); } }
    msRevealed[r][c]=true;
    checkMsEnd();
  }
  renderMs();
}

function msToggleFlag(r, c) {
  msFlags[r][c]=!msFlags[r][c];
  renderMs();
}

function checkMsEnd() {
  let allSafe=true;
  for(let r=0;r<MS_SIZE;r++) for(let c=0;c<MS_SIZE;c++) if(msBoard[r][c]!=='M' && !msRevealed[r][c]) allSafe=false;
  if(allSafe) { msStatus.textContent='🎉 You won!'; msGameOver=true; msScores.player++; msPlayerScoreEl.textContent=msScores.player; msLog('Player won'); }
}

function msNew() {
  initMsBoard();
  msCurrent='P';
  msGameOver=false;
  msStatus.textContent='Click to reveal cells (right-click to flag)';
  renderMs();
}

msNewGameBtn && msNewGameBtn.addEventListener('click', msNew);
msDifficultyEl && msDifficultyEl.addEventListener('change', ()=>msLog(`Difficulty set to ${msDifficultyEl.value}`));

// Admin Panel
let msAdminDisabled = false;
const msAdminBtn = document.getElementById('msAdminBtn');
const msAdminPanel = document.getElementById('msAdminPanel');
const msAdminAuth = document.getElementById('msAdminAuth');
const msAdminPassword = document.getElementById('msAdminPassword');
const msAdminUnlock = document.getElementById('msAdminUnlock');
const msAdminContents = document.getElementById('msAdminContents');
const msAdminDifficulty = document.getElementById('msAdminDifficulty');
const msForcePlayerWinBtn = document.getElementById('msForcePlayerWin');
const msForceAiWinBtn = document.getElementById('msForceAiWin');
const msClearScoresBtn = document.getElementById('msClearScores');
const msResetGameBtn = document.getElementById('msResetGame');
const msResetLocalStorageBtn = document.getElementById('msResetLocalStorage');
const msExportStateBtn = document.getElementById('msExportState');
const msImportFile = document.getElementById('msImportFile');
const msAdminLogsEl = document.getElementById('msAdminLogs');
const msCloseAdminBtn = document.getElementById('msCloseAdmin');

function msUnlock(){ if(msAdminPassword.value==='0320'){ msAdminAuth.classList.add('hidden'); msAdminContents.classList.remove('hidden'); msLog('Admin unlocked'); } else { alert('Incorrect code'); msLog('Failed admin unlock attempt'); } }

msAdminBtn && msAdminBtn.addEventListener('click', ()=>{ msAdminPanel.classList.toggle('hidden'); if(!msAdminPanel.classList.contains('hidden')){ msAdminAuth.classList.remove('hidden'); msAdminContents.classList.add('hidden'); msAdminPassword.value=''; msRenderLogs(); } });
msAdminUnlock && msAdminUnlock.addEventListener('click', msUnlock);
msAdminDifficulty && msAdminDifficulty.addEventListener('change', ()=>{ msDifficultyEl.value = msAdminDifficulty.value; msLog(`Difficulty set to ${msAdminDifficulty.value}`); });
msForcePlayerWinBtn && msForcePlayerWinBtn.addEventListener('click', ()=>{ for(let r=0;r<MS_SIZE;r++) for(let c=0;c<MS_SIZE;c++) if(msBoard[r][c]!=='M') msRevealed[r][c]=true; checkMsEnd(); renderMs(); msLog('Forced player win'); });
msForceAiWinBtn && msForceAiWinBtn.addEventListener('click', ()=>{ for(let r=0;r<MS_SIZE;r++) for(let c=0;c<MS_SIZE;c++) if(msBoard[r][c]==='M') msRevealed[r][c]=true; msStatus.textContent='💣 You hit a mine!'; msGameOver=true; msScores.ai++; msAiScoreEl.textContent=msScores.ai; renderMs(); msLog('Forced AI win'); });
msClearScoresBtn && msClearScoresBtn.addEventListener('click', ()=>{ msScores={player:0,ai:0,draw:0}; msPlayerScoreEl.textContent=0; msAiScoreEl.textContent=0; msDrawScoreEl.textContent=0; localStorage.removeItem('ms_scores'); msLog('Cleared scores'); });
msResetGameBtn && msResetGameBtn.addEventListener('click', ()=>{ msNew(); msLog('Game reset'); });
msResetLocalStorageBtn && msResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); msLogs=[]; msSaveLogs(); msRenderLogs(); msLog('Reset localStorage'); });
msExportStateBtn && msExportStateBtn.addEventListener('click', ()=>{ const state={board:msBoard,scores:msScores,logs:msLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','minesweeper_state.json'); document.body.appendChild(a); a.click(); a.remove(); msLog('Exported state'); });
msImportFile && msImportFile.addEventListener('change',(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.board) msBoard=state.board; if(state.scores) msScores=state.scores; if(state.logs) msLogs=state.logs; renderMs(); msPlayerScoreEl.textContent=msScores.player; msAiScoreEl.textContent=msScores.ai; msDrawScoreEl.textContent=msScores.draw; msSaveLogs(); msRenderLogs(); msLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); });
msCloseAdminBtn && msCloseAdminBtn.addEventListener('click', ()=>{ msAdminPanel.classList.add('hidden'); msAdminAuth.classList.remove('hidden'); msAdminContents.classList.add('hidden'); msLog('Admin locked'); });

// Owner Panel
let msOwnerDisabled = false;
const msOwnerBtn = document.getElementById('msOwnerBtn');
const msOwnerPanel = document.getElementById('msOwnerPanel');
const msOwnerAuth = document.getElementById('msOwnerAuth');
const msOwnerPassword = document.getElementById('msOwnerPassword');
const msOwnerUnlock = document.getElementById('msOwnerUnlock');
const msOwnerContents = document.getElementById('msOwnerContents');
const msOwnerSetStateBtn = document.getElementById('msOwnerSetState');
const msOwnerStateInput = document.getElementById('msOwnerStateInput');
const msOwnerViewLSBtn = document.getElementById('msOwnerViewLS');
const msOwnerLocalStorageEl = document.getElementById('msOwnerLocalStorage');
const msOwnerKillSwitchBtn = document.getElementById('msOwnerKillSwitch');
const msOwnerCloseBtn = document.getElementById('msOwnerClose');
const msOwnerNewGameBtn = document.getElementById('msOwnerNewGame');
const msOwnerReloadBtn = document.getElementById('msOwnerReloadApp');
const msOwnerForcePlayerWinBtn2 = document.getElementById('msOwnerForcePlayerWin');
const msOwnerForceAiWinBtn2 = document.getElementById('msOwnerForceAiWin');
const msOwnerDifficultyEl = document.getElementById('msOwnerDifficulty');
const msOwnerApplyDiffBtn = document.getElementById('msOwnerApplyDifficulty');
const msOwnerViewStatsBtn = document.getElementById('msOwnerViewStats');
const msOwnerClearScoresBtn = document.getElementById('msOwnerClearScores');
const msOwnerClearLogsBtn = document.getElementById('msOwnerClearLogs');
const msOwnerExportStateBtn = document.getElementById('msOwnerExportState');
const msOwnerClearLSBtn = document.getElementById('msOwnerClearLS');
const msOwnerLogsEl = document.getElementById('msOwnerLogs');

function msOwnerUnlockAndAdmin(){ if(msOwnerPassword.value==='Bowling320Fun'){ msOwnerAuth.classList.add('hidden'); msOwnerContents.classList.remove('hidden'); msLog('Owner unlocked'); msAdminAuth.classList.add('hidden'); msAdminContents.classList.remove('hidden'); msRenderLogs(); } else { alert('Incorrect owner code'); msLog('Failed owner unlock attempt'); } }

msOwnerBtn && msOwnerBtn.addEventListener('click', ()=>{ msOwnerPanel.classList.toggle('hidden'); if(!msOwnerPanel.classList.contains('hidden')){ msOwnerAuth.classList.remove('hidden'); msOwnerContents.classList.add('hidden'); msOwnerPassword.value=''; } });
msOwnerUnlock && msOwnerUnlock.addEventListener('click', msOwnerUnlockAndAdmin);
msOwnerCloseBtn && msOwnerCloseBtn.addEventListener('click', ()=>{ msOwnerPanel.classList.add('hidden'); msOwnerAuth.classList.remove('hidden'); msOwnerContents.classList.add('hidden'); msLog('Owner locked'); });
msOwnerNewGameBtn && msOwnerNewGameBtn.addEventListener('click', ()=>{ msNew(); msLog('Owner started new game'); });
msOwnerReloadBtn && msOwnerReloadBtn.addEventListener('click', ()=>{ msLog('Owner reloaded app'); location.reload(); });
msOwnerForcePlayerWinBtn2 && msOwnerForcePlayerWinBtn2.addEventListener('click', ()=>{ for(let r=0;r<MS_SIZE;r++) for(let c=0;c<MS_SIZE;c++) if(msBoard[r][c]!=='M') msRevealed[r][c]=true; checkMsEnd(); renderMs(); msLog('Owner forced player win'); });
msOwnerForceAiWinBtn2 && msOwnerForceAiWinBtn2.addEventListener('click', ()=>{ for(let r=0;r<MS_SIZE;r++) for(let c=0;c<MS_SIZE;c++) if(msBoard[r][c]==='M') msRevealed[r][c]=true; msStatus.textContent='💣 You hit a mine!'; msGameOver=true; msScores.ai++; msAiScoreEl.textContent=msScores.ai; renderMs(); msLog('Owner forced AI win'); });
msOwnerApplyDiffBtn && msOwnerApplyDiffBtn.addEventListener('click', ()=>{ msDifficultyEl.value = msOwnerDifficultyEl.value; msLog(`Owner set difficulty to ${msOwnerDifficultyEl.value}`); alert('Difficulty updated'); });
msOwnerViewStatsBtn && msOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { gameOver: msGameOver, current: msCurrent, scores: msScores }; alert(JSON.stringify(stats, null, 2)); msLog('Owner viewed stats'); });
msOwnerClearScoresBtn && msOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; msScores={player:0,ai:0,draw:0}; msPlayerScoreEl.textContent=0; msAiScoreEl.textContent=0; msDrawScoreEl.textContent=0; localStorage.removeItem('ms_scores'); msLog('Owner cleared scores'); });
msOwnerClearLogsBtn && msOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; msLogs=[]; msSaveLogs(); msRenderLogs(); msOwnerLogsEl.innerHTML=''; msLog('Owner cleared logs'); });
msOwnerExportStateBtn && msOwnerExportStateBtn.addEventListener('click', ()=>{ const state={board:msBoard,scores:msScores,logs:msLogs}; msOwnerStateInput.value = JSON.stringify(state); msLog('Owner exported state'); });
msOwnerSetStateBtn && msOwnerSetStateBtn.addEventListener('click', ()=>{ const txt = msOwnerStateInput.value; if(!txt) return alert('Paste JSON state'); try{ const state = JSON.parse(txt); if(state.board) msBoard=state.board; if(state.scores) msScores=state.scores; if(state.logs) msLogs=state.logs; msSaveLogs(); renderMs(); msPlayerScoreEl.textContent=msScores.player; msAiScoreEl.textContent=msScores.ai; msDrawScoreEl.textContent=msScores.draw; msRenderLogs(); msLog('Owner applied state'); }catch(err){ alert('Invalid JSON'); } });
msOwnerViewLSBtn && msOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } msOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); msLog('Owner viewed localStorage'); });
msOwnerKillSwitchBtn && msOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); msLog('Owner used kill switch'); location.reload(); });
msOwnerClearLSBtn && msOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); msLog('Owner cleared localStorage'); alert('Storage cleared'); });

function msSaveLogs(){ localStorage.setItem('ms_admin_logs', JSON.stringify(msLogs)); }
function msLog(a){ msLogs.unshift(`${new Date().toISOString()} - ${a}`); if(msLogs.length>200) msLogs.pop(); msSaveLogs(); msRenderLogs(); if(msOwnerLogsEl) msOwnerLogsEl.innerHTML = msLogs.map(l=>`<div>${l}</div>`).join(''); }
function msRenderLogs(){ if(msAdminLogsEl) msAdminLogsEl.innerHTML = msLogs.map(l=>`<div>${l}</div>`).join(''); }

// init
msNew();
