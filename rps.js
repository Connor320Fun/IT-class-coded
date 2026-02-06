const rpsStatus = document.getElementById('rpsStatus');
const rpsDifficultyEl = document.getElementById('rpsDifficulty');
const rpsPlayerScoreEl = document.getElementById('rpsPlayerScore');
const rpsAiScoreEl = document.getElementById('rpsAiScore');
const rpsDrawScoreEl = document.getElementById('rpsDrawScore');
const rpsRockBtn = document.getElementById('rpsRock');
const rpsPaperBtn = document.getElementById('rpsPaper');
const rpsScissorsBtn = document.getElementById('rpsScissors');

let rpsPlayerScore = 0;
let rpsAiScore = 0;
let rpsDrawScore = 0;
let rpsLastPlayerMove = null;
let rpsHistory = [];
let rpsLogs = JSON.parse(localStorage.getItem('rps_admin_logs')||'[]');

function rpsGetAiMove() {
  const difficulty = parseInt(rpsDifficultyEl.value);
  const moves = ['rock','paper','scissors'];
  if(difficulty===1) return moves[Math.floor(Math.random()*3)];
  if(rpsHistory.length<3) return moves[Math.floor(Math.random()*3)];
  // Higher difficulty: predict player's pattern
  const recent = rpsHistory.slice(-3).map(h=>h.player);
  const mostCommon = recent.reduce((a,b,i,arr)=>arr.filter(v=>v===a).length>arr.filter(v=>v===b).length?a:b);
  if(difficulty===5) {
    if(mostCommon==='rock') return 'paper';
    if(mostCommon==='paper') return 'scissors';
    if(mostCommon==='scissors') return 'rock';
  }
  return moves[Math.floor(Math.random()*3)];
}

function rpsPlay(playerMove) {
  const aiMove = rpsGetAiMove();
  let result = 'draw';
  if((playerMove==='rock'&&aiMove==='scissors')||(playerMove==='paper'&&aiMove==='rock')||(playerMove==='scissors'&&aiMove==='paper')) {
    result = 'player';
    rpsPlayerScore++;
    rpsPlayerScoreEl.textContent = rpsPlayerScore;
  } else if(playerMove!==aiMove) {
    result = 'ai';
    rpsAiScore++;
    rpsAiScoreEl.textContent = rpsAiScore;
  } else {
    result = 'draw';
    rpsDrawScore++;
    rpsDrawScoreEl.textContent = rpsDrawScore;
  }
  rpsHistory.push({player:playerMove,ai:aiMove,result});
  rpsStatus.textContent = `You: ${playerMove} | AI: ${aiMove} | ${result==='player'?'🎉 You won!':result==='ai'?'💀 AI won!':'🤝 Draw!'}`;
  rpsLog(`Player played ${playerMove}, AI played ${aiMove} - ${result}`);
}

rpsRockBtn && rpsRockBtn.addEventListener('click', ()=>rpsPlay('rock'));
rpsPaperBtn && rpsPaperBtn.addEventListener('click', ()=>rpsPlay('paper'));
rpsScissorsBtn && rpsScissorsBtn.addEventListener('click', ()=>rpsPlay('scissors'));

// Admin Panel
const rpsAdminBtn = document.getElementById('rpsAdminBtn');
const rpsAdminPanel = document.getElementById('rpsAdminPanel');
const rpsAdminAuth = document.getElementById('rpsAdminAuth');
const rpsAdminPassword = document.getElementById('rpsAdminPassword');
const rpsAdminUnlock = document.getElementById('rpsAdminUnlock');
const rpsAdminContents = document.getElementById('rpsAdminContents');
const rpsAdminDifficulty = document.getElementById('rpsAdminDifficulty');
const rpsClearScoresBtn = document.getElementById('rpsClearScores');
const rpsResetLocalStorageBtn = document.getElementById('rpsResetLocalStorage');
const rpsAdminLogsEl = document.getElementById('rpsAdminLogs');
const rpsCloseAdminBtn = document.getElementById('rpsCloseAdmin');

function rpsUnlock(){ if(rpsAdminPassword.value==='0320'){ rpsAdminAuth.classList.add('hidden'); rpsAdminContents.classList.remove('hidden'); rpsLog('Admin unlocked'); } else { alert('Incorrect code'); rpsLog('Failed admin unlock attempt'); } }

rpsAdminBtn && rpsAdminBtn.addEventListener('click', ()=>{ rpsAdminPanel.classList.toggle('hidden'); if(!rpsAdminPanel.classList.contains('hidden')){ rpsAdminAuth.classList.remove('hidden'); rpsAdminContents.classList.add('hidden'); rpsAdminPassword.value=''; rpsRenderLogs(); } });
rpsAdminUnlock && rpsAdminUnlock.addEventListener('click', rpsUnlock);
rpsAdminDifficulty && rpsAdminDifficulty.addEventListener('change', ()=>{ rpsDifficultyEl.value = rpsAdminDifficulty.value; rpsLog(`Difficulty set to ${rpsAdminDifficulty.value}`); });
rpsClearScoresBtn && rpsClearScoresBtn.addEventListener('click', ()=>{ rpsPlayerScore=0; rpsAiScore=0; rpsDrawScore=0; rpsPlayerScoreEl.textContent=0; rpsAiScoreEl.textContent=0; rpsDrawScoreEl.textContent=0; localStorage.removeItem('rps_scores'); rpsLog('Cleared scores'); });
rpsResetLocalStorageBtn && rpsResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); rpsLogs=[]; rpsSaveLogs(); rpsRenderLogs(); rpsLog('Reset localStorage'); });
rpsCloseAdminBtn && rpsCloseAdminBtn.addEventListener('click', ()=>{ rpsAdminPanel.classList.add('hidden'); rpsAdminAuth.classList.remove('hidden'); rpsAdminContents.classList.add('hidden'); rpsLog('Admin locked'); });

// Owner Panel
const rpsOwnerBtn = document.getElementById('rpsOwnerBtn');
const rpsOwnerPanel = document.getElementById('rpsOwnerPanel');
const rpsOwnerAuth = document.getElementById('rpsOwnerAuth');
const rpsOwnerPassword = document.getElementById('rpsOwnerPassword');
const rpsOwnerUnlock = document.getElementById('rpsOwnerUnlock');
const rpsOwnerContents = document.getElementById('rpsOwnerContents');
const rpsOwnerViewLSBtn = document.getElementById('rpsOwnerViewLS');
const rpsOwnerLocalStorageEl = document.getElementById('rpsOwnerLocalStorage');
const rpsOwnerCloseBtn = document.getElementById('rpsOwnerClose');
const rpsOwnerViewStatsBtn = document.getElementById('rpsOwnerViewStats');
const rpsOwnerClearScoresBtn = document.getElementById('rpsOwnerClearScores');
const rpsOwnerClearLogsBtn = document.getElementById('rpsOwnerClearLogs');
const rpsOwnerClearLSBtn = document.getElementById('rpsOwnerClearLS');
const rpsOwnerLogsEl = document.getElementById('rpsOwnerLogs');

function rpsOwnerUnlockAndAdmin(){ if(rpsOwnerPassword.value==='Bowling320Fun'){ rpsOwnerAuth.classList.add('hidden'); rpsOwnerContents.classList.remove('hidden'); rpsLog('Owner unlocked'); rpsAdminAuth.classList.add('hidden'); rpsAdminContents.classList.remove('hidden'); rpsRenderLogs(); } else { alert('Incorrect owner code'); rpsLog('Failed owner unlock attempt'); } }

rpsOwnerBtn && rpsOwnerBtn.addEventListener('click', ()=>{ rpsOwnerPanel.classList.toggle('hidden'); if(!rpsOwnerPanel.classList.contains('hidden')){ rpsOwnerAuth.classList.remove('hidden'); rpsOwnerContents.classList.add('hidden'); rpsOwnerPassword.value=''; } });
rpsOwnerUnlock && rpsOwnerUnlock.addEventListener('click', rpsOwnerUnlockAndAdmin);
rpsOwnerCloseBtn && rpsOwnerCloseBtn.addEventListener('click', ()=>{ rpsOwnerPanel.classList.add('hidden'); rpsOwnerAuth.classList.remove('hidden'); rpsOwnerContents.classList.add('hidden'); rpsLog('Owner locked'); });
rpsOwnerViewStatsBtn && rpsOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { playerScore: rpsPlayerScore, aiScore: rpsAiScore, draws: rpsDrawScore }; alert(JSON.stringify(stats, null, 2)); rpsLog('Owner viewed stats'); });
rpsOwnerClearScoresBtn && rpsOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; rpsPlayerScore=0; rpsAiScore=0; rpsDrawScore=0; rpsPlayerScoreEl.textContent=0; rpsAiScoreEl.textContent=0; rpsDrawScoreEl.textContent=0; localStorage.removeItem('rps_scores'); rpsLog('Owner cleared scores'); });
rpsOwnerClearLogsBtn && rpsOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; rpsLogs=[]; rpsSaveLogs(); rpsRenderLogs(); rpsOwnerLogsEl.innerHTML=''; rpsLog('Owner cleared logs'); });
rpsOwnerViewLSBtn && rpsOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } rpsOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); rpsLog('Owner viewed localStorage'); });
rpsOwnerClearLSBtn && rpsOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); rpsLog('Owner cleared localStorage'); alert('Storage cleared'); });

function rpsSaveLogs(){ localStorage.setItem('rps_admin_logs', JSON.stringify(rpsLogs)); }
function rpsLog(a){ rpsLogs.unshift(`${new Date().toISOString()} - ${a}`); if(rpsLogs.length>200) rpsLogs.pop(); rpsSaveLogs(); rpsRenderLogs(); if(rpsOwnerLogsEl) rpsOwnerLogsEl.innerHTML = rpsLogs.map(l=>`<div>${l}</div>`).join(''); }
function rpsRenderLogs(){ if(rpsAdminLogsEl) rpsAdminLogsEl.innerHTML = rpsLogs.map(l=>`<div>${l}</div>`).join(''); }

rpsStatus.textContent = 'Click a button to play!';
