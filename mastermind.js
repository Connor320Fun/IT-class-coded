const MM_COLORS = ['🔴','🟢','🔵','🟡','🟣','🟠'];
const mmStatus = document.getElementById('mmStatus');
const mmNewGameBtn = document.getElementById('mmNewGame');
const mmDifficultyEl = document.getElementById('mmDifficulty');
const mmPlayerScoreEl = document.getElementById('mmPlayerScore');
const mmAiScoreEl = document.getElementById('mmAiScore');
const mmPlayerCodeEl = document.getElementById('mmPlayerCode');
const mmColorPickerEl = document.getElementById('mmColorPicker');
const mmSetCodeBtn = document.getElementById('mmSetCode');
const mmGuessHistoryEl = document.getElementById('mmGuessHistory');

let mmPlayerCode = [];
let mmGuesses = [];
let mmPlayerScore = 0;
let mmAiScore = 0;
let mmGameOver = false;
let mmCodeSet = false;
let mmLogs = JSON.parse(localStorage.getItem('mm_admin_logs')||'[]');

function mmRenderColorPicker() {
  mmColorPickerEl.innerHTML = '';
  MM_COLORS.forEach(color => {
    const btn = document.createElement('button');
    btn.textContent = color;
    btn.style.padding = '10px 15px';
    btn.style.fontSize = '20px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      if(mmPlayerCode.length < 4) {
        mmPlayerCode.push(color);
        mmRenderPlayerCode();
      }
    });
    mmColorPickerEl.appendChild(btn);
  });
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.padding = '10px 15px';
  clearBtn.style.backgroundColor = '#ff4444';
  clearBtn.addEventListener('click', () => {
    mmPlayerCode = [];
    mmRenderPlayerCode();
  });
  mmColorPickerEl.appendChild(clearBtn);
}

function mmRenderPlayerCode() {
  mmPlayerCodeEl.innerHTML = '';
  for(let i = 0; i < 4; i++) {
    const cell = document.createElement('div');
    cell.textContent = mmPlayerCode[i] || '?';
    cell.style.width = '40px';
    cell.style.height = '40px';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.fontSize = '24px';
    cell.style.border = '2px solid #333';
    cell.style.borderRadius = '4px';
    cell.style.backgroundColor = '#1a1a1a';
    mmPlayerCodeEl.appendChild(cell);
  }
  mmSetCodeBtn.disabled = mmPlayerCode.length !== 4;
}

function mmSetCode() {
  if(mmPlayerCode.length !== 4) {
    alert('Pick exactly 4 colors');
    return;
  }
  mmCodeSet = true;
  mmSetCodeBtn.disabled = true;
  mmColorPickerEl.style.display = 'none';
  mmStatus.textContent = 'Code locked! AI is guessing...';
  mmLog('Player set code');
  setTimeout(mmAiMakeGuess, 500);
}

function mmCheckGuess(guess) {
  let correct = 0, wrongPosition = 0;
  let codeCopy = [...mmPlayerCode];
  let guessCopy = [...guess];
  for(let i=0;i<4;i++) if(guessCopy[i]===codeCopy[i]) { correct++; codeCopy[i]=null; guessCopy[i]=null; }
  for(let i=0;i<4;i++) if(guessCopy[i]&&codeCopy.includes(guessCopy[i])) { wrongPosition++; codeCopy[codeCopy.indexOf(guessCopy[i])]=null; }
  return {correct, wrongPosition};
}

function mmAiMakeGuess() {
  if(mmGameOver || !mmCodeSet) return;
  const difficulty = parseInt(mmDifficultyEl.value, 10);
  let guess = [];
  
  if(difficulty === 1) {
    for(let i=0;i<4;i++) guess.push(MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)]);
  } else {
    if(mmGuesses.length === 0) {
      guess = ['🔴','🔴','🟢','🟢'];
    } else {
      for(let i=0;i<4;i++) guess.push(MM_COLORS[Math.floor(Math.random()*MM_COLORS.length)]);
    }
  }
  
  mmGuesses.push(guess);
  const result = mmCheckGuess(guess);
  
  const guessDiv = document.createElement('div');
  guessDiv.innerHTML = `<strong>Guess ${mmGuesses.length}:</strong> ${guess.join('')} | Correct: ${result.correct}, Wrong position: ${result.wrongPosition}`;
  guessDiv.style.padding = '8px';
  guessDiv.style.borderBottom = '1px solid #333';
  mmGuessHistoryEl.appendChild(guessDiv);
  mmGuessHistoryEl.scrollTop = mmGuessHistoryEl.scrollHeight;
  
  if(result.correct === 4) {
    mmStatus.textContent = 'AI guessed the code!';
    mmGameOver = true;
    mmAiScore++;
    mmAiScoreEl.textContent = mmAiScore;
    mmLog('AI guessed code');
    localStorage.setItem('mm_scores', JSON.stringify({player: mmPlayerScore, ai: mmAiScore}));
  } else if(mmGuesses.length >= 12) {
    mmStatus.textContent = 'AI failed! Your code was: ' + mmPlayerCode.join('');
    mmGameOver = true;
    mmPlayerScore++;
    mmPlayerScoreEl.textContent = mmPlayerScore;
    mmLog('AI failed to guess');
    localStorage.setItem('mm_scores', JSON.stringify({player: mmPlayerScore, ai: mmAiScore}));
  } else {
    setTimeout(mmAiMakeGuess, 800);
  }
}

function mmNew() {
  mmPlayerCode = [];
  mmGuesses = [];
  mmGameOver = false;
  mmCodeSet = false;
  mmSetCodeBtn.disabled = false;
  mmColorPickerEl.style.display = 'flex';
  mmGuessHistoryEl.innerHTML = '';
  mmStatus.textContent = 'Pick 4 colors for your secret code';
  mmRenderPlayerCode();
  mmRenderColorPicker();
  mmLog('New game started');
}

function mmLoadScores() {
  const saved = localStorage.getItem('mm_scores');
  if(saved) {
    const scores = JSON.parse(saved);
    mmPlayerScore = scores.player;
    mmAiScore = scores.ai;
    mmPlayerScoreEl.textContent = mmPlayerScore;
    mmAiScoreEl.textContent = mmAiScore;
  }
}

mmNewGameBtn && mmNewGameBtn.addEventListener('click', mmNew);
mmSetCodeBtn && mmSetCodeBtn.addEventListener('click', mmSetCode);

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
const mmOwnerForceAiWinBtn = document.getElementById('mmOwnerForceAiWin');
const mmOwnerForcePlayerWinBtn = document.getElementById('mmOwnerForcePlayerWin');
const mmOwnerDifficultyEl = document.getElementById('mmOwnerDifficulty');
const mmOwnerApplyDifficultyBtn = document.getElementById('mmOwnerApplyDifficulty');
const mmOwnerStateInputEl = document.getElementById('mmOwnerStateInput');
const mmOwnerSetStateBtn = document.getElementById('mmOwnerSetState');
const mmOwnerExportStateBtn = document.getElementById('mmOwnerExportState');

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
mmOwnerForceAiWinBtn && mmOwnerForceAiWinBtn.addEventListener('click', ()=>{ mmGameOver = true; mmAiScore++; mmAiScoreEl.textContent = mmAiScore; mmStatus.textContent = 'AI wins (forced by owner)'; mmLog('Owner forced AI win'); });
mmOwnerForcePlayerWinBtn && mmOwnerForcePlayerWinBtn.addEventListener('click', ()=>{ mmGameOver = true; mmPlayerScore++; mmPlayerScoreEl.textContent = mmPlayerScore; mmStatus.textContent = 'Player wins (forced by owner)'; mmLog('Owner forced player win'); });
mmOwnerApplyDifficultyBtn && mmOwnerApplyDifficultyBtn.addEventListener('click', ()=>{ mmDifficultyEl.value = mmOwnerDifficultyEl.value; mmLog(`Owner set difficulty to ${mmOwnerDifficultyEl.value}`); });
mmOwnerSetStateBtn && mmOwnerSetStateBtn.addEventListener('click', ()=>{ try{ const state = JSON.parse(mmOwnerStateInputEl.value); if(state.playerCode) mmPlayerCode = state.playerCode; if(state.guesses) mmGuesses = state.guesses; if(state.playerScore !== undefined) mmPlayerScore = state.playerScore; if(state.aiScore !== undefined) mmAiScore = state.aiScore; mmPlayerScoreEl.textContent = mmPlayerScore; mmAiScoreEl.textContent = mmAiScore; mmLog('Owner applied state'); alert('State applied'); }catch(e){ alert('Invalid JSON'); } });
mmOwnerExportStateBtn && mmOwnerExportStateBtn.addEventListener('click', ()=>{ const state = { playerCode: mmPlayerCode, guesses: mmGuesses, playerScore: mmPlayerScore, aiScore: mmAiScore }; mmOwnerStateInputEl.value = JSON.stringify(state, null, 2); mmLog('Owner exported state'); });

function mmSaveLogs(){ localStorage.setItem('mm_admin_logs', JSON.stringify(mmLogs)); }
function mmLog(a){ mmLogs.unshift(`${new Date().toISOString()} - ${a}`); if(mmLogs.length>200) mmLogs.pop(); mmSaveLogs(); mmRenderLogs(); if(mmOwnerLogsEl) mmOwnerLogsEl.innerHTML = mmLogs.map(l=>`<div>${l}</div>`).join(''); }
function mmRenderLogs(){ if(mmAdminLogsEl) mmAdminLogsEl.innerHTML = mmLogs.map(l=>`<div>${l}</div>`).join(''); }

mmLoadScores();
mmNew();
