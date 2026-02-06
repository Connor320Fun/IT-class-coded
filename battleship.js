const BS_SIZE = 6;
const bsPlayerBoardEl = document.getElementById('bsPlayerBoard');
const bsAiBoardEl = document.getElementById('bsAiBoard');
const bsStatus = document.getElementById('bsStatus');
const bsNewGameBtn = document.getElementById('bsNewGame');
const bsDifficultyEl = document.getElementById('bsDifficulty');
const bsPlayerScoreEl = document.getElementById('bsPlayerScore');
const bsAiScoreEl = document.getElementById('bsAiScore');
const bsDrawScoreEl = document.getElementById('bsDrawScore');

let bsPlayer = [];
let bsAi = [];
let bsPlayerShips = 0;
let bsAiShips = 0;
let bsCurrent = 'P';
let bsGameOver = false;
let bsScores = { player:0, ai:0, draw:0 };

function initBsBoard() {
  bsPlayer = Array.from({length:BS_SIZE},()=>Array(BS_SIZE).fill(0));
  bsAi = Array.from({length:BS_SIZE},()=>Array(BS_SIZE).fill(0));
}

function placeRandomShip(board) {
  // place a few single-cell ships for simplicity
  let count = 0;
  while(count<4){
    const r=Math.floor(Math.random()*BS_SIZE);
    const c=Math.floor(Math.random()*BS_SIZE);
    if(board[r][c]===0){ board[r][c]=1; count++; }
  }
}

function renderBs() {
  bsPlayerBoardEl.innerHTML='';
  bsAiBoardEl.innerHTML='';
  for(let r=0;r<BS_SIZE;r++){
    for(let c=0;c<BS_SIZE;c++){
      const pcell=document.createElement('div'); pcell.className='bs-cell';
      pcell.textContent = bsPlayer[r][c]===2? 'X' : bsPlayer[r][c]===1? 'S' : '';
      bsPlayerBoardEl.appendChild(pcell);
      const acell=document.createElement('div'); acell.className='bs-cell';
      acell.dataset.r=r; acell.dataset.c=c;
      acell.addEventListener('click', ()=>{ if(bsCurrent==='P' && !bsGameOver) bsPlayerFire(r,c); });
      acell.textContent = bsAi[r][c]===2? 'X' : bsAi[r][c]===3? 'O' : '';
      bsAiBoardEl.appendChild(acell);
    }
  }
}

function bsPlayerFire(r,c){
  if(bsAi[r][c]===1){ bsAi[r][c]=2; bsAiShips--; bsStatus.textContent='Hit!'; }
  else if(bsAi[r][c]===0){ bsAi[r][c]=3; bsStatus.textContent='Miss'; }
  renderBs(); checkBsEnd(); if(!bsGameOver){ bsCurrent='A'; setTimeout(bsAiMove,200); }
}

function bsAiMove(){
  const level = parseInt(bsDifficultyEl.value,10);
  let r,c;
  if(level<=1){ r=Math.floor(Math.random()*BS_SIZE); c=Math.floor(Math.random()*BS_SIZE); }
  else { // smarter: prefer neighbors of misses/hits
    const candidates=[]; for(let i=0;i<BS_SIZE;i++) for(let j=0;j<BS_SIZE;j++) if(bsPlayer[i][j]===0 || bsPlayer[i][j]===1) candidates.push([i,j]); const pick=candidates[Math.floor(Math.random()*candidates.length)]; r=pick[0]; c=pick[1]; }
  if(bsPlayer[r][c]===1){ bsPlayer[r][c]=2; bsPlayerShips--; bsStatus.textContent='AI hit'; }
  else if(bsPlayer[r][c]===0){ bsPlayer[r][c]=3; bsStatus.textContent='AI miss'; }
  renderBs(); checkBsEnd(); bsCurrent='P';
}

function checkBsEnd(){
  if(bsAiShips<=0){ bsScores.player++; bsStatus.textContent='Player wins!'; bsGameOver=true; }
  else if(bsPlayerShips<=0){ bsScores.ai++; bsStatus.textContent='AI wins!'; bsGameOver=true; }
  bsPlayerScoreEl.textContent=bsScores.player; bsAiScoreEl.textContent=bsScores.ai; bsDrawScoreEl.textContent=bsScores.draw;
}

function bsNew(){
  initBsBoard(); placeRandomShip(bsPlayer); placeRandomShip(bsAi); bsPlayerShips=4; bsAiShips=4; bsGameOver=false; bsCurrent='P'; bsStatus.textContent='Your turn'; renderBs(); }

bsNewGameBtn.addEventListener('click', bsNew);

// Admin wiring (inline code 0320)
const bsAdminBtn = document.getElementById('bsAdminBtn');
const bsAdminPanel = document.getElementById('bsAdminPanel');
const bsAdminAuth = document.getElementById('bsAdminAuth');
const bsAdminPassword = document.getElementById('bsAdminPassword');
const bsAdminUnlock = document.getElementById('bsAdminUnlock');
const bsAdminContents = document.getElementById('bsAdminContents');
const bsAdminDifficulty = document.getElementById('bsAdminDifficulty');
const bsForceAiWinBtn = document.getElementById('bsForceAiWin');
const bsForcePlayerWinBtn = document.getElementById('bsForcePlayerWin');
const bsClearScoresBtn = document.getElementById('bsClearScores');
const bsResetGameBtn = document.getElementById('bsResetGame');
const bsResetLocalStorageBtn = document.getElementById('bsResetLocalStorage');
const bsExportStateBtn = document.getElementById('bsExportState');
const bsImportFile = document.getElementById('bsImportFile');
const bsAdminLogsEl = document.getElementById('bsAdminLogs');
const bsCloseAdminBtn = document.getElementById('bsCloseAdmin');

let bsLogs = JSON.parse(localStorage.getItem('bs_admin_logs')||'[]');
let bsOwnerDisabled = false;
const bsOwnerBtn = document.getElementById('bsOwnerBtn');
const bsOwnerPanel = document.getElementById('bsOwnerPanel');
const bsOwnerAuth = document.getElementById('bsOwnerAuth');
const bsOwnerPassword = document.getElementById('bsOwnerPassword');
const bsOwnerUnlock = document.getElementById('bsOwnerUnlock');
const bsOwnerContents = document.getElementById('bsOwnerContents');
const bsOwnerSetStateBtn = document.getElementById('bsOwnerSetState');
const bsOwnerStateInput = document.getElementById('bsOwnerStateInput');
const bsOwnerViewLSBtn = document.getElementById('bsOwnerViewLS');
const bsOwnerLocalStorageEl = document.getElementById('bsOwnerLocalStorage');
const bsOwnerKillSwitchBtn = document.getElementById('bsOwnerKillSwitch');
const bsOwnerCloseBtn = document.getElementById('bsOwnerClose');
const bsOwnerNewGameBtn = document.getElementById('bsOwnerNewGame');
const bsOwnerReloadBtn = document.getElementById('bsOwnerReloadApp');
const bsOwnerForceAiWinBtn2 = document.getElementById('bsOwnerForceAiWin');
const bsOwnerForcePlayerWinBtn2 = document.getElementById('bsOwnerForcePlayerWin');
const bsOwnerSkipTurnBtn = document.getElementById('bsOwnerSkipTurn');
const bsOwnerDifficultyEl = document.getElementById('bsOwnerDifficulty');
const bsOwnerApplyDiffBtn = document.getElementById('bsOwnerApplyDifficulty');
const bsOwnerViewStatsBtn = document.getElementById('bsOwnerViewStats');
const bsOwnerClearScoresBtn = document.getElementById('bsOwnerClearScores');
const bsOwnerClearLogsBtn = document.getElementById('bsOwnerClearLogs');
const bsOwnerExportStateBtn = document.getElementById('bsOwnerExportState');
const bsOwnerClearLSBtn = document.getElementById('bsOwnerClearLS');
const bsOwnerLogsEl = document.getElementById('bsOwnerLogs');

function bsOwnerUnlockFn(){ if(bsOwnerPassword.value==='Bowling320Fun'){ bsOwnerAuth.classList.add('hidden'); bsOwnerContents.classList.remove('hidden'); bsLog('Owner unlocked'); } else { alert('Incorrect owner code'); bsLog('Failed owner unlock attempt'); } }
// also grant admin access to owner
function bsOwnerUnlockAndAdmin(){ if(bsOwnerPassword.value==='Bowling320Fun'){ bsOwnerAuth.classList.add('hidden'); bsOwnerContents.classList.remove('hidden'); bsLog('Owner unlocked'); bsAdminAuth.classList.add('hidden'); bsAdminContents.classList.remove('hidden'); bsRenderLogs(); } else { alert('Incorrect owner code'); bsLog('Failed owner unlock attempt'); } }

bsOwnerBtn && bsOwnerBtn.addEventListener('click', ()=>{ bsOwnerPanel.classList.toggle('hidden'); if(!bsOwnerPanel.classList.contains('hidden')){ bsOwnerAuth.classList.remove('hidden'); bsOwnerContents.classList.add('hidden'); bsOwnerPassword.value=''; } });
bsOwnerUnlock && bsOwnerUnlock.addEventListener('click', bsOwnerUnlockAndAdmin);

bsOwnerSetStateBtn && bsOwnerSetStateBtn.addEventListener('click', ()=>{ const txt = bsOwnerStateInput.value; if(!txt) return alert('Paste JSON state'); try{ const state = JSON.parse(txt); if(state.player) bsPlayer=state.player; if(state.ai) bsAi=state.ai; if(state.scores) bsScores=state.scores; if(state.logs) bsLogs=state.logs; renderBs(); bsPlayerScoreEl.textContent=bsScores.player; bsAiScoreEl.textContent=bsScores.ai; bsDrawScoreEl.textContent=bsScores.draw; bsSaveLogs(); bsRenderLogs(); bsLog('Owner applied state'); }catch(err){ alert('Invalid JSON'); } });

bsOwnerViewLSBtn && bsOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } bsOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); bsLog('Owner viewed localStorage'); });

bsOwnerKillSwitchBtn && bsOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); bsLog('Owner used kill switch'); location.reload(); });

bsOwnerCloseBtn && bsOwnerCloseBtn.addEventListener('click', ()=>{ bsOwnerPanel.classList.add('hidden'); bsOwnerAuth.classList.remove('hidden'); bsOwnerContents.classList.add('hidden'); bsLog('Owner locked'); });
bsOwnerNewGameBtn && bsOwnerNewGameBtn.addEventListener('click', ()=>{ bsNew(); bsLog('Owner started new game'); });
bsOwnerReloadBtn && bsOwnerReloadBtn.addEventListener('click', ()=>{ bsLog('Owner reloaded app'); location.reload(); });
bsOwnerForceAiWinBtn2 && bsOwnerForceAiWinBtn2.addEventListener('click', ()=>{ for(let r=0;r<BS_SIZE;r++) for(let c=0;c<BS_SIZE;c++) if(bsPlayer[r][c]===1) bsPlayer[r][c]=2; bsPlayerShips=0; renderBs(); checkBsEnd(); bsLog('Owner forced AI win'); });
bsOwnerForcePlayerWinBtn2 && bsOwnerForcePlayerWinBtn2.addEventListener('click', ()=>{ for(let r=0;r<BS_SIZE;r++) for(let c=0;c<BS_SIZE;c++) if(bsAi[r][c]===1) bsAi[r][c]=2; bsAiShips=0; renderBs(); checkBsEnd(); bsLog('Owner forced player win'); });
bsOwnerSkipTurnBtn && bsOwnerSkipTurnBtn.addEventListener('click', ()=>{ if(bsCurrent==='P') bsCurrent='A'; else bsCurrent='P'; bsStatus.textContent = bsCurrent==='P' ? 'Your turn' : 'AI thinking...'; if(bsCurrent==='A' && !bsGameOver) setTimeout(bsAiFire, 300); renderBs(); bsLog('Owner skipped turn'); });
bsOwnerApplyDiffBtn && bsOwnerApplyDiffBtn.addEventListener('click', ()=>{ bsDifficultyEl.value = bsOwnerDifficultyEl.value; bsLog(`Owner set difficulty to ${bsOwnerDifficultyEl.value}`); alert('Difficulty updated'); });
bsOwnerViewStatsBtn && bsOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { player: bsPlayerShips, ai: bsAiShips, gameOver: bsGameOver, current: bsCurrent, scores: bsScores }; alert(JSON.stringify(stats, null, 2)); bsLog('Owner viewed stats'); });
bsOwnerClearScoresBtn && bsOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; bsScores={player:0,ai:0,draw:0}; bsPlayerScoreEl.textContent=0; bsAiScoreEl.textContent=0; bsDrawScoreEl.textContent=0; localStorage.removeItem('bs_scores'); bsLog('Owner cleared scores'); });
bsOwnerClearLogsBtn && bsOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; bsLogs=[]; bsSaveLogs(); bsRenderLogs(); bsOwnerLogsEl.innerHTML=''; bsLog('Owner cleared logs'); });
bsOwnerExportStateBtn && bsOwnerExportStateBtn.addEventListener('click', ()=>{ const state={player:bsPlayer,ai:bsAi,scores:bsScores,logs:bsLogs}; bsOwnerStateInput.value = JSON.stringify(state); bsLog('Owner exported state'); });
bsOwnerClearLSBtn && bsOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); bsLog('Owner cleared localStorage'); alert('Storage cleared'); });
function bsSaveLogs(){ localStorage.setItem('bs_admin_logs', JSON.stringify(bsLogs)); }
function bsLog(a){ bsLogs.unshift(`${new Date().toISOString()} - ${a}`); if(bsLogs.length>200) bsLogs.pop(); bsSaveLogs(); bsRenderLogs(); if(bsOwnerLogsEl) bsOwnerLogsEl.innerHTML = bsLogs.map(l=>`<div>${l}</div>`).join(''); }
function bsRenderLogs(){ if(bsAdminLogsEl) bsAdminLogsEl.innerHTML = bsLogs.map(l=>`<div>${l}</div>`).join(''); }

function bsUnlock(){ if(bsAdminPassword.value==='0320'){ bsAdminAuth.classList.add('hidden'); bsAdminContents.classList.remove('hidden'); bsLog('Admin unlocked'); } else { alert('Incorrect code'); bsLog('Failed admin unlock attempt'); } }

bsAdminBtn && bsAdminBtn.addEventListener('click', ()=>{ bsAdminPanel.classList.toggle('hidden'); if(!bsAdminPanel.classList.contains('hidden')){ bsAdminAuth.classList.remove('hidden'); bsAdminContents.classList.add('hidden'); bsAdminPassword.value=''; bsRenderLogs(); } });
bsAdminUnlock && bsAdminUnlock.addEventListener('click', bsUnlock);
bsAdminDifficulty && bsAdminDifficulty.addEventListener('change', ()=>{ bsDifficultyEl.value = bsAdminDifficulty.value; bsLog(`Difficulty set to ${bsAdminDifficulty.value}`); });
bsForceAiWinBtn && bsForceAiWinBtn.addEventListener('click', ()=>{ // force AI win by clearing player ships
  for(let r=0;r<BS_SIZE;r++) for(let c=0;c<BS_SIZE;c++) if(bsPlayer[r][c]===1) bsPlayer[r][c]=2; bsPlayerShips=0; renderBs(); checkBsEnd(); bsLog('Forced AI win');
});
bsForcePlayerWinBtn && bsForcePlayerWinBtn.addEventListener('click', ()=>{ for(let r=0;r<BS_SIZE;r++) for(let c=0;c<BS_SIZE;c++) if(bsAi[r][c]===1) bsAi[r][c]=2; bsAiShips=0; renderBs(); checkBsEnd(); bsLog('Forced player win'); });
bsClearScoresBtn && bsClearScoresBtn.addEventListener('click', ()=>{ bsScores={player:0,ai:0,draw:0}; bsPlayerScoreEl.textContent=0; bsAiScoreEl.textContent=0; bsDrawScoreEl.textContent=0; localStorage.removeItem('bs_scores'); bsLog('Cleared scores'); });
bsResetLocalStorageBtn && bsResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); bsLogs=[]; bsSaveLogs(); bsRenderLogs(); bsLog('Reset localStorage'); });
bsResetGameBtn && bsResetGameBtn.addEventListener('click', ()=>{ bsNew(); bsLog('Game reset'); });
bsExportStateBtn && bsExportStateBtn.addEventListener('click', ()=>{ const state={player:bsPlayer,ai:bsAi,scores:bsScores,logs:bsLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','battleship_state.json'); document.body.appendChild(a); a.click(); a.remove(); bsLog('Exported state'); });
bsImportFile && bsImportFile.addEventListener('change',(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.player) bsPlayer=state.player; if(state.ai) bsAi=state.ai; if(state.scores) bsScores=state.scores; if(state.logs) bsLogs=state.logs; renderBs(); bsPlayerScoreEl.textContent=bsScores.player; bsAiScoreEl.textContent=bsScores.ai; bsDrawScoreEl.textContent=bsScores.draw; bsSaveLogs(); bsRenderLogs(); bsLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); });
bsCloseAdminBtn && bsCloseAdminBtn.addEventListener('click', ()=>{ bsAdminPanel.classList.add('hidden'); bsAdminAuth.classList.remove('hidden'); bsAdminContents.classList.add('hidden'); bsLog('Admin locked'); });

// init
bsNew();
