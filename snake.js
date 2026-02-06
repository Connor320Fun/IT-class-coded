const SN_SIZE = 16;
const snBoardEl = document.getElementById('snBoard');
const snStatus = document.getElementById('snStatus');
const snNewGameBtn = document.getElementById('snNewGame');
const snDifficultyEl = document.getElementById('snDifficulty');
const snPlayerScoreEl = document.getElementById('snPlayerScore');
const snAiScoreEl = document.getElementById('snAiScore');

let snPlayerSnake = [{x:8,y:8}];
let snPlayerFood = {x:10,y:10};
let snPlayerDir = 'right';
let snPlayerNextDir = 'right';
let snAiSnake = [{x:5,y:5}];
let snAiFood = {x:3,y:3};
let snAiDir = 'left';
let snPlayerScore = 0;
let snAiScore = 0;
let snGameOver = false;
let snLogs = JSON.parse(localStorage.getItem('sn_admin_logs')||'[]');
let snGameRunning = false;

function renderSn() {
  snBoardEl.innerHTML='';
  for(let y=0;y<SN_SIZE;y++) {
    for(let x=0;x<SN_SIZE;x++) {
      const cell = document.createElement('div');
      cell.className='sn-cell';
      let isPlayer = snPlayerSnake.some(s=>s.x===x && s.y===y);
      let isAi = snAiSnake.some(s=>s.x===x && s.y===y);
      if(isPlayer) cell.style.background = '#10b981';
      else if(isAi) cell.style.background = '#f59e0b';
      else if(snPlayerFood.x===x && snPlayerFood.y===y) cell.style.background = '#ef4444';
      else if(snAiFood.x===x && snAiFood.y===y) cell.style.background = '#f97316';
      else cell.style.background = '#0f172a';
      snBoardEl.appendChild(cell);
    }
  }
}

function snUpdate() {
  if(snGameOver) return;
  snPlayerDir = snPlayerNextDir;
  const head = snPlayerSnake[0];
  let newHead = {x:head.x, y:head.y};
  if(snPlayerDir==='right') newHead.x++;
  if(snPlayerDir==='left') newHead.x--;
  if(snPlayerDir==='up') newHead.y--;
  if(snPlayerDir==='down') newHead.y++;
  if(newHead.x<0||newHead.x>=SN_SIZE||newHead.y<0||newHead.y>=SN_SIZE||snPlayerSnake.some(s=>s.x===newHead.x&&s.y===newHead.y)) {
    snStatus.textContent='💀 Game Over!';
    snGameOver=true;
    snAiScore++;
    snAiScoreEl.textContent=snAiScore;
    snLog('Player collided');
  } else {
    snPlayerSnake.unshift(newHead);
    if(newHead.x===snPlayerFood.x&&newHead.y===snPlayerFood.y) {
      snPlayerScore++;
      snPlayerScoreEl.textContent=snPlayerScore;
      snPlayerFood = {x:Math.floor(Math.random()*SN_SIZE), y:Math.floor(Math.random()*SN_SIZE)};
    } else snPlayerSnake.pop();
    snAiMove();
  }
  renderSn();
  if(!snGameOver) setTimeout(snUpdate, 200/parseInt(snDifficultyEl.value));
}

function snAiMove() {
  const head = snAiSnake[0];
  let newHead = {x:head.x, y:head.y};
  if(snAiDir==='right') newHead.x++;
  if(snAiDir==='left') newHead.x--;
  if(snAiDir==='up') newHead.y--;
  if(snAiDir==='down') newHead.y++;
  if(newHead.x<0||newHead.x>=SN_SIZE||newHead.y<0||newHead.y>=SN_SIZE||snAiSnake.some(s=>s.x===newHead.x&&s.y===newHead.y)) {
    snPlayerScore++;
    snPlayerScoreEl.textContent=snPlayerScore;
    snLog('AI collided');
  } else {
    snAiSnake.unshift(newHead);
    if(newHead.x===snAiFood.x&&newHead.y===snAiFood.y) {
      snAiScore++;
      snAiScoreEl.textContent=snAiScore;
      snAiFood = {x:Math.floor(Math.random()*SN_SIZE), y:Math.floor(Math.random()*SN_SIZE)};
    } else snAiSnake.pop();
  }
}

function snNew() {
  snPlayerSnake = [{x:8,y:8}];
  snPlayerFood = {x:10,y:10};
  snPlayerDir = 'right';
  snPlayerNextDir = 'right';
  snAiSnake = [{x:5,y:5}];
  snAiFood = {x:3,y:3};
  snAiDir = 'left';
  snGameOver = false;
  snStatus.textContent='Use arrow keys to move!';
  renderSn();
  if(!snGameRunning) {
    snGameRunning = true;
    snUpdate();
  }
}

snNewGameBtn && snNewGameBtn.addEventListener('click', snNew);
document.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowRight'&&snPlayerDir!=='left') snPlayerNextDir='right';
  if(e.key==='ArrowLeft'&&snPlayerDir!=='right') snPlayerNextDir='left';
  if(e.key==='ArrowUp'&&snPlayerDir!=='down') snPlayerNextDir='up';
  if(e.key==='ArrowDown'&&snPlayerDir!=='up') snPlayerNextDir='down';
});

// Admin Panel
const snAdminBtn = document.getElementById('snAdminBtn');
const snAdminPanel = document.getElementById('snAdminPanel');
const snAdminAuth = document.getElementById('snAdminAuth');
const snAdminPassword = document.getElementById('snAdminPassword');
const snAdminUnlock = document.getElementById('snAdminUnlock');
const snAdminContents = document.getElementById('snAdminContents');
const snAdminDifficulty = document.getElementById('snAdminDifficulty');
const snForcePlayerWinBtn = document.getElementById('snForcePlayerWin');
const snForceAiWinBtn = document.getElementById('snForceAiWin');
const snClearScoresBtn = document.getElementById('snClearScores');
const snResetGameBtn = document.getElementById('snResetGame');
const snResetLocalStorageBtn = document.getElementById('snResetLocalStorage');
const snAdminLogsEl = document.getElementById('snAdminLogs');
const snCloseAdminBtn = document.getElementById('snCloseAdmin');

function snUnlock(){ if(snAdminPassword.value==='0320'){ snAdminAuth.classList.add('hidden'); snAdminContents.classList.remove('hidden'); snLog('Admin unlocked'); } else { alert('Incorrect code'); snLog('Failed admin unlock attempt'); } }

snAdminBtn && snAdminBtn.addEventListener('click', ()=>{ snAdminPanel.classList.toggle('hidden'); if(!snAdminPanel.classList.contains('hidden')){ snAdminAuth.classList.remove('hidden'); snAdminContents.classList.add('hidden'); snAdminPassword.value=''; snRenderLogs(); } });
snAdminUnlock && snAdminUnlock.addEventListener('click', snUnlock);
snAdminDifficulty && snAdminDifficulty.addEventListener('change', ()=>{ snDifficultyEl.value = snAdminDifficulty.value; snLog(`Difficulty set to ${snAdminDifficulty.value}`); });
snForcePlayerWinBtn && snForcePlayerWinBtn.addEventListener('click', ()=>{ snGameOver=true; snPlayerScore+=10; snPlayerScoreEl.textContent=snPlayerScore; snStatus.textContent='🎉 You won!'; renderSn(); snLog('Forced player win'); });
snForceAiWinBtn && snForceAiWinBtn.addEventListener('click', ()=>{ snGameOver=true; snAiScore+=10; snAiScoreEl.textContent=snAiScore; snStatus.textContent='💀 AI won!'; renderSn(); snLog('Forced AI win'); });
snClearScoresBtn && snClearScoresBtn.addEventListener('click', ()=>{ snPlayerScore=0; snAiScore=0; snPlayerScoreEl.textContent=0; snAiScoreEl.textContent=0; localStorage.removeItem('sn_scores'); snLog('Cleared scores'); });
snResetGameBtn && snResetGameBtn.addEventListener('click', ()=>{ snNew(); snLog('Game reset'); });
snResetLocalStorageBtn && snResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); snLogs=[]; snSaveLogs(); snRenderLogs(); snLog('Reset localStorage'); });
snCloseAdminBtn && snCloseAdminBtn.addEventListener('click', ()=>{ snAdminPanel.classList.add('hidden'); snAdminAuth.classList.remove('hidden'); snAdminContents.classList.add('hidden'); snLog('Admin locked'); });

// Owner Panel
const snOwnerBtn = document.getElementById('snOwnerBtn');
const snOwnerPanel = document.getElementById('snOwnerPanel');
const snOwnerAuth = document.getElementById('snOwnerAuth');
const snOwnerPassword = document.getElementById('snOwnerPassword');
const snOwnerUnlock = document.getElementById('snOwnerUnlock');
const snOwnerContents = document.getElementById('snOwnerContents');
const snOwnerViewLSBtn = document.getElementById('snOwnerViewLS');
const snOwnerLocalStorageEl = document.getElementById('snOwnerLocalStorage');
const snOwnerKillSwitchBtn = document.getElementById('snOwnerKillSwitch');
const snOwnerCloseBtn = document.getElementById('snOwnerClose');
const snOwnerNewGameBtn = document.getElementById('snOwnerNewGame');
const snOwnerReloadBtn = document.getElementById('snOwnerReloadApp');
const snOwnerForcePlayerWinBtn2 = document.getElementById('snOwnerForcePlayerWin');
const snOwnerForceAiWinBtn2 = document.getElementById('snOwnerForceAiWin');
const snOwnerDifficultyEl = document.getElementById('snOwnerDifficulty');
const snOwnerApplyDiffBtn = document.getElementById('snOwnerApplyDifficulty');
const snOwnerViewStatsBtn = document.getElementById('snOwnerViewStats');
const snOwnerClearScoresBtn = document.getElementById('snOwnerClearScores');
const snOwnerClearLogsBtn = document.getElementById('snOwnerClearLogs');
const snOwnerClearLSBtn = document.getElementById('snOwnerClearLS');
const snOwnerLogsEl = document.getElementById('snOwnerLogs');

function snOwnerUnlockAndAdmin(){ if(snOwnerPassword.value==='Bowling320Fun'){ snOwnerAuth.classList.add('hidden'); snOwnerContents.classList.remove('hidden'); snLog('Owner unlocked'); snAdminAuth.classList.add('hidden'); snAdminContents.classList.remove('hidden'); snRenderLogs(); } else { alert('Incorrect owner code'); snLog('Failed owner unlock attempt'); } }

snOwnerBtn && snOwnerBtn.addEventListener('click', ()=>{ snOwnerPanel.classList.toggle('hidden'); if(!snOwnerPanel.classList.contains('hidden')){ snOwnerAuth.classList.remove('hidden'); snOwnerContents.classList.add('hidden'); snOwnerPassword.value=''; } });
snOwnerUnlock && snOwnerUnlock.addEventListener('click', snOwnerUnlockAndAdmin);
snOwnerCloseBtn && snOwnerCloseBtn.addEventListener('click', ()=>{ snOwnerPanel.classList.add('hidden'); snOwnerAuth.classList.remove('hidden'); snOwnerContents.classList.add('hidden'); snLog('Owner locked'); });
snOwnerNewGameBtn && snOwnerNewGameBtn.addEventListener('click', ()=>{ snNew(); snLog('Owner started new game'); });
snOwnerReloadBtn && snOwnerReloadBtn.addEventListener('click', ()=>{ snLog('Owner reloaded app'); location.reload(); });
snOwnerForcePlayerWinBtn2 && snOwnerForcePlayerWinBtn2.addEventListener('click', ()=>{ snGameOver=true; snPlayerScore+=10; snPlayerScoreEl.textContent=snPlayerScore; snStatus.textContent='🎉 You won!'; renderSn(); snLog('Owner forced player win'); });
snOwnerForceAiWinBtn2 && snOwnerForceAiWinBtn2.addEventListener('click', ()=>{ snGameOver=true; snAiScore+=10; snAiScoreEl.textContent=snAiScore; snStatus.textContent='💀 AI won!'; renderSn(); snLog('Owner forced AI win'); });
snOwnerApplyDiffBtn && snOwnerApplyDiffBtn.addEventListener('click', ()=>{ snDifficultyEl.value = snOwnerDifficultyEl.value; snLog(`Owner set difficulty to ${snOwnerDifficultyEl.value}`); alert('Difficulty updated'); });
snOwnerViewStatsBtn && snOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { playerScore: snPlayerScore, aiScore: snAiScore }; alert(JSON.stringify(stats, null, 2)); snLog('Owner viewed stats'); });
snOwnerClearScoresBtn && snOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; snPlayerScore=0; snAiScore=0; snPlayerScoreEl.textContent=0; snAiScoreEl.textContent=0; localStorage.removeItem('sn_scores'); snLog('Owner cleared scores'); });
snOwnerClearLogsBtn && snOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; snLogs=[]; snSaveLogs(); snRenderLogs(); snOwnerLogsEl.innerHTML=''; snLog('Owner cleared logs'); });
snOwnerViewLSBtn && snOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } snOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); snLog('Owner viewed localStorage'); });
snOwnerKillSwitchBtn && snOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); snLog('Owner used kill switch'); location.reload(); });
snOwnerClearLSBtn && snOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); snLog('Owner cleared localStorage'); alert('Storage cleared'); });

function snSaveLogs(){ localStorage.setItem('sn_admin_logs', JSON.stringify(snLogs)); }
function snLog(a){ snLogs.unshift(`${new Date().toISOString()} - ${a}`); if(snLogs.length>200) snLogs.pop(); snSaveLogs(); snRenderLogs(); if(snOwnerLogsEl) snOwnerLogsEl.innerHTML = snLogs.map(l=>`<div>${l}</div>`).join(''); }
function snRenderLogs(){ if(snAdminLogsEl) snAdminLogsEl.innerHTML = snLogs.map(l=>`<div>${l}</div>`).join(''); }

// init
snNew();
