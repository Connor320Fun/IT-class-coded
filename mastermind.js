const MM_COLORS = ['🔴','🟢','🔵','🟡','🟣','🟠'];
const mmStatus = document.getElementById('mmStatus');
const mmNewGameBtn = document.getElementById('mmNewGame');
const mmDifficultyEl = document.getElementById('mmDifficulty');
const mmPlayerScoreEl = document.getElementById('mmPlayerScore');
const mmAiScoreEl = document.getElementById('mmAiScore');

let mmCode = [];
let mmGuesses = [];
let mmPlayerScore = 0;
let mmAiScore = 0;
let mmGameOver = false;
let mmLogs = JSON.parse(localStorage.getItem('mm_admin_logs')||'[]');
let mmMode = 'player';

function mmGenerateCode() {
  mmCode = [];
  for(let i=0;i<4;i++) mmCode.push(MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)]);
}

function mmNew() {
  mmGenerateCode();
  mmGuesses = [];
  mmGameOver = false;
  mmMode = 'player';
  mmStatus.textContent = 'Guess the code! (4 colors)';
  mmRenderBoard();
}

function mmRenderBoard() {
  mmStatus.textContent = `Guesses: ${mmGuesses.length} | Code: ${mmMode==='reveal'?mmCode.join(''):mm '****'}`;
}

function mmCheckGuess(guess) {
  let correct = 0, wrongPosition = 0;
  let codeCopy = [...mmCode];
  let guessCopy = [...guess];
  for(let i=0;i<4;i++) if(guessCopy[i]===codeCopy[i]) { correct++; codeCopy[i]=null; guessCopy[i]=null; }
  for(let i=0;i<4;i++) if(guessCopy[i]&&codeCopy.includes(guessCopy[i])) { wrongPosition++; codeCopy[codeCopy.indexOf(guessCopy[i])]=null; }
  return {correct, wrongPosition};
}

function mmMakeGuess() {
  if(mmGameOver) return;
  let guess = [MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)],MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)],MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)],MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)]];
  mmGuesses.push(guess);
  const result = mmCheckGuess(guess);
  if(result.correct===4) {
    mmStatus.textContent = 'AI guessed the code!';
    mmGameOver = true;
    mmAiScore++;
    mmAiScoreEl.textContent = mmAiScore;
    mmLog('AI guessed code');
  } else if(mmGuesses.length >= 12) {
    mmStatus.textContent = 'Game Over! Code was: '+mmCode.join('');
    mmGameOver = true;
    mmPlayerScore++;
    mmPlayerScoreEl.textContent = mmPlayerScore;
    mmLog('AI failed to guess');
  }
  mmRenderBoard();
}

// Admin Panel
const mmAdminBtn = document.getElementById('mmAdminBtn');
const mmAdminPanel = document.getElementById('mmAdminPanel');
const mmAdminAuth = document.getElementById('mmAdminAuth');
const mmAdminPassword = document.getElementById('mmAdminPassword');
const mmAdminUnlock = document.getElementById('mmAdminUnlock');
const mmAdminContents = document.getElementById('mmAdminContents');
const mmAdminDifficulty = document.getElementById('mmAdminDifficulty');
const mmClearScoresBtn = document.getElementById('mmClearScores');
const mmResetGameBtn = document.getElementById('mmResetGame');
const mmAdminLogsEl = document.getElementById('mmAdminLogs');
const mmCloseAdminBtn = document.getElementById('mmCloseAdmin');

function mmUnlock(){ if(mmAdminPassword.value==='0320'){ mmAdminAuth.classList.add('hidden'); mmAdminContents.classList.remove('hidden'); mmLog('Admin unlocked'); } else { alert('Incorrect code'); mmLog('Failed admin unlock attempt'); } }

mmAdminBtn && mmAdminBtn.addEventListener('click', ()=>{ mmAdminPanel.classList.toggle('hidden'); if(!mmAdminPanel.classList.contains('hidden')){ mmAdminAuth.classList.remove('hidden'); mmAdminContents.classList.add('hidden'); mmAdminPassword.value=''; mmRenderLogs(); } });
mmAdminUnlock && mmAdminUnlock.addEventListener('click', mmUnlock);
mmAdminDifficulty && mmAdminDifficulty.addEventListener('change', ()=>{ mmDifficultyEl.value = mmAdminDifficulty.value; mmLog(`Difficulty set to ${mmAdminDifficulty.value}`); });
mmClearScoresBtn && mmClearScoresBtn.addEventListener('click', ()=>{ mmPlayerScore=0; mmAiScore=0; mmPlayerScoreEl.textContent=0; mmAiScoreEl.textContent=0; localStorage.removeItem('mm_scores'); mmLog('Cleared scores'); });
mmResetGameBtn && mmResetGameBtn.addEventListener('click', ()=>{ mmNew(); mmLog('Game reset'); });
mmCloseAdminBtn && mmCloseAdminBtn.addEventListener('click', ()=>{ mmAdminPanel.classList.add('hidden'); mmAdminAuth.classList.remove('hidden'); mmAdminContents.classList.add('hidden'); mmLog('Admin locked'); });

// Owner Panel
const mmOwnerBtn = document.getElementById('mmOwnerBtn');
const mmOwnerPanel = document.getElementById('mmOwnerPanel');
const mmOwnerAuth = document.getElementById('mmOwnerAuth');
const mmOwnerPassword = document.getElementById('mmOwnerPassword');
const mmOwnerUnlock = document.getElementById('mmOwnerUnlock');
const mmOwnerContents = document.getElementById('mmOwnerContents');
const mmOwnerViewLSBtn = document.getElementById('mmOwnerViewLS');
const mmOwnerLocalStorageEl = document.getElementById('mmOwnerLocalStorage');
const mmOwnerKillSwitchBtn = document.getElementById('mmOwnerKillSwitch');
const mmOwnerCloseBtn = document.getElementById('mmOwnerClose');
const mmOwnerNewGameBtn = document.getElementById('mmOwnerNewGame');
const mmOwnerReloadBtn = document.getElementById('mmOwnerReloadApp');
const mmOwnerViewStatsBtn = document.getElementById('mmOwnerViewStats');
const mmOwnerClearScoresBtn = document.getElementById('mmOwnerClearScores');
const mmOwnerClearLogsBtn = document.getElementById('mmOwnerClearLogs');
const mmOwnerClearLSBtn = document.getElementById('mmOwnerClearLS');
const mmOwnerLogsEl = document.getElementById('mmOwnerLogs');

function mmOwnerUnlockAndAdmin(){ if(mmOwnerPassword.value==='Bowling320Fun'){ mmOwnerAuth.classList.add('hidden'); mmOwnerContents.classList.remove('hidden'); mmLog('Owner unlocked'); mmAdminAuth.classList.add('hidden'); mmAdminContents.classList.remove('hidden'); mmRenderLogs(); } else { alert('Incorrect owner code'); mmLog('Failed owner unlock attempt'); } }

mmOwnerBtn && mmOwnerBtn.addEventListener('click', ()=>{ mmOwnerPanel.classList.toggle('hidden'); if(!mmOwnerPanel.classList.contains('hidden')){ mmOwnerAuth.classList.remove('hidden'); mmOwnerContents.classList.add('hidden'); mmOwnerPassword.value=''; } });
mmOwnerUnlock && mmOwnerUnlock.addEventListener('click', mmOwnerUnlockAndAdmin);
mmOwnerCloseBtn && mmOwnerCloseBtn.addEventListener('click', ()=>{ mmOwnerPanel.classList.add('hidden'); mmOwnerAuth.classList.remove('hidden'); mmOwnerContents.classList.add('hidden'); mmLog('Owner locked'); });
mmOwnerNewGameBtn && mmOwnerNewGameBtn.addEventListener('click', ()=>{ mmNew(); mmLog('Owner started new game'); });
mmOwnerReloadBtn && mmOwnerReloadBtn.addEventListener('click', ()=>{ mmLog('Owner reloaded app'); location.reload(); });
mmOwnerViewStatsBtn && mmOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { playerScore: mmPlayerScore, aiScore: mmAiScore }; alert(JSON.stringify(stats, null, 2)); mmLog('Owner viewed stats'); });
mmOwnerClearScoresBtn && mmOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; mmPlayerScore=0; mmAiScore=0; mmPlayerScoreEl.textContent=0; mmAiScoreEl.textContent=0; localStorage.removeItem('mm_scores'); mmLog('Owner cleared scores'); });
mmOwnerClearLogsBtn && mmOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; mmLogs=[]; mmSaveLogs(); mmRenderLogs(); mmOwnerLogsEl.innerHTML=''; mmLog('Owner cleared logs'); });
mmOwnerViewLSBtn && mmOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } mmOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); mmLog('Owner viewed localStorage'); });
mmOwnerKillSwitchBtn && mmOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); mmLog('Owner used kill switch'); location.reload(); });
mmOwnerClearLSBtn && mmOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); mmLog('Owner cleared localStorage'); alert('Storage cleared'); });

function mmSaveLogs(){ localStorage.setItem('mm_admin_logs', JSON.stringify(mmLogs)); }
function mmLog(a){ mmLogs.unshift(`${new Date().toISOString()} - ${a}`); if(mmLogs.length>200) mmLogs.pop(); mmSaveLogs(); mmRenderLogs(); if(mmOwnerLogsEl) mmOwnerLogsEl.innerHTML = mmLogs.map(l=>`<div>${l}</div>`).join(''); }
function mmRenderLogs(){ if(mmAdminLogsEl) mmAdminLogsEl.innerHTML = mmLogs.map(l=>`<div>${l}</div>`).join(''); }

mmNew();
