const hmDifficultyEl = document.getElementById('hmDifficulty');
const hmNewGameBtn = document.getElementById('hmNewGame');
const hmStatus = document.getElementById('hmStatus');
const hmWordEl = document.getElementById('hmWord');
const hmLettersEl = document.getElementById('hmLetters');
const hmPlayerScoreEl = document.getElementById('hmPlayerScore');
const hmAiScoreEl = document.getElementById('hmAiScore');
const hmDrawScoreEl = document.getElementById('hmDrawScore');

let hmWords = ['apple','banana','orange','grape','elephant','giraffe','javascript','coding','netlify','computer'];
let hmWord = '';
let hmDisplay = [];
let hmAttempts = 6;
let hmGuessed = new Set();
let hmGameOver = false;
let hmScores = { player:0, ai:0, draw:0 };

function pickWord(level) {
  // choose by length roughly
  const min = Math.max(3, level + 2);
  const candidates = hmWords.filter(w=>w.length>=min && w.length<=min+6);
  return candidates.length? candidates[Math.floor(Math.random()*candidates.length)] : hmWords[Math.floor(Math.random()*hmWords.length)];
}

function renderHm() {
  hmWordEl.textContent = hmDisplay.join(' ');
  hmLettersEl.textContent = `Attempts: ${hmAttempts}  Guessed: ${[...hmGuessed].join(', ')}`;
}

function hmNew() {
  hmWord = pickWord(parseInt(hmDifficultyEl.value,10));
  hmDisplay = Array.from(hmWord).map(_=>'_');
  hmAttempts = 6;
  hmGuessed = new Set();
  hmGameOver = false;
  hmStatus.textContent = 'Guess a letter (press a key)';
  renderHm();
}

function hmGuess(letter) {
  if (hmGameOver) return;
  letter = letter.toLowerCase();
  if (hmGuessed.has(letter)) return;
  hmGuessed.add(letter);
  if (hmWord.includes(letter)) {
    for (let i=0;i<hmWord.length;i++) if (hmWord[i]===letter) hmDisplay[i]=letter;
    if (!hmDisplay.includes('_')) { hmScores.player++; hmGameOver=true; hmStatus.textContent='You win!'; }
  } else {
    hmAttempts--;
    if (hmAttempts<=0) { hmScores.ai++; hmGameOver=true; hmStatus.textContent=`AI wins! Word: ${hmWord}`; }
  }
  hmPlayerScoreEl.textContent = hmScores.player;
  hmAiScoreEl.textContent = hmScores.ai;
  renderHm();
}

document.addEventListener('keydown',(e)=>{
  const k = e.key;
  if (/^[a-zA-Z]$/.test(k)) hmGuess(k);
});

hmNewGameBtn.addEventListener('click', hmNew);

// basic admin wiring
const hmAdminBtn = document.getElementById('hmAdminBtn');
const hmAdminPanel = document.getElementById('hmAdminPanel');
const hmAdminAuth = document.getElementById('hmAdminAuth');
const hmAdminPassword = document.getElementById('hmAdminPassword');
const hmAdminUnlock = document.getElementById('hmAdminUnlock');
const hmAdminContents = document.getElementById('hmAdminContents');
const hmAdminDifficulty = document.getElementById('hmAdminDifficulty');
const hmForcePlayerWinBtn = document.getElementById('hmForcePlayerWin');
const hmForceAiWinBtn = document.getElementById('hmForceAiWin');
const hmClearScoresBtn = document.getElementById('hmClearScores');
const hmResetLocalStorageBtn = document.getElementById('hmResetLocalStorage');
const hmExportStateBtn = document.getElementById('hmExportState');
const hmImportFile = document.getElementById('hmImportFile');
const hmResetGameBtn = document.getElementById('hmResetGame');
const hmAdminLogsEl = document.getElementById('hmAdminLogs');
const hmCloseAdminBtn = document.getElementById('hmCloseAdmin');

let hmLogs = JSON.parse(localStorage.getItem('hm_admin_logs')||'[]');
let hmOwnerDisabled = false;
const hmOwnerBtn = document.getElementById('hmOwnerBtn');
const hmOwnerPanel = document.getElementById('hmOwnerPanel');
const hmOwnerAuth = document.getElementById('hmOwnerAuth');
const hmOwnerPassword = document.getElementById('hmOwnerPassword');
const hmOwnerUnlock = document.getElementById('hmOwnerUnlock');
const hmOwnerContents = document.getElementById('hmOwnerContents');
const hmOwnerSetStateBtn = document.getElementById('hmOwnerSetState');
const hmOwnerStateInput = document.getElementById('hmOwnerStateInput');
const hmOwnerViewLSBtn = document.getElementById('hmOwnerViewLS');
const hmOwnerLocalStorageEl = document.getElementById('hmOwnerLocalStorage');
const hmOwnerKillSwitchBtn = document.getElementById('hmOwnerKillSwitch');
const hmOwnerCloseBtn = document.getElementById('hmOwnerClose');
const hmOwnerNewGameBtn = document.getElementById('hmOwnerNewGame');
const hmOwnerReloadBtn = document.getElementById('hmOwnerReloadApp');
const hmOwnerForcePlayerWinBtn2 = document.getElementById('hmOwnerForcePlayerWin');
const hmOwnerForceAiWinBtn2 = document.getElementById('hmOwnerForceAiWin');
const hmOwnerSkipTurnBtn = document.getElementById('hmOwnerSkipTurn');
const hmOwnerDifficultyEl = document.getElementById('hmOwnerDifficulty');
const hmOwnerApplyDiffBtn = document.getElementById('hmOwnerApplyDifficulty');
const hmOwnerViewStatsBtn = document.getElementById('hmOwnerViewStats');
const hmOwnerClearScoresBtn = document.getElementById('hmOwnerClearScores');
const hmOwnerClearLogsBtn = document.getElementById('hmOwnerClearLogs');
const hmOwnerExportStateBtn = document.getElementById('hmOwnerExportState');
const hmOwnerClearLSBtn = document.getElementById('hmOwnerClearLS');
const hmOwnerLogsEl = document.getElementById('hmOwnerLogs');

function hmOwnerUnlockFn(){ if(hmOwnerPassword.value==='Bowling320Fun'){ hmOwnerAuth.classList.add('hidden'); hmOwnerContents.classList.remove('hidden'); hmLog('Owner unlocked'); } else { alert('Incorrect owner code'); hmLog('Failed owner unlock attempt'); } }
// also open admin panel for owner
function hmOwnerUnlockAndAdmin(){ if(hmOwnerPassword.value==='Bowling320Fun'){ hmOwnerAuth.classList.add('hidden'); hmOwnerContents.classList.remove('hidden'); hmLog('Owner unlocked'); hmAdminAuth.classList.add('hidden'); hmAdminContents.classList.remove('hidden'); hmRenderLogs(); } else { alert('Incorrect owner code'); hmLog('Failed owner unlock attempt'); } }

hmOwnerBtn && hmOwnerBtn.addEventListener('click', ()=>{ hmOwnerPanel.classList.toggle('hidden'); if(!hmOwnerPanel.classList.contains('hidden')){ hmOwnerAuth.classList.remove('hidden'); hmOwnerContents.classList.add('hidden'); hmOwnerPassword.value=''; } });
hmOwnerUnlock && hmOwnerUnlock.addEventListener('click', hmOwnerUnlockAndAdmin);

hmOwnerSetStateBtn && hmOwnerSetStateBtn.addEventListener('click', ()=>{ const txt = hmOwnerStateInput.value; if(!txt) return alert('Paste JSON state'); try{ const state = JSON.parse(txt); if(state.word) hmWord=state.word; if(state.display) hmDisplay=state.display; if(state.attempts!==undefined) hmAttempts=state.attempts; if(state.guessed) hmGuessed=new Set(state.guessed); if(state.scores) hmScores=state.scores; if(state.logs) hmLogs=state.logs; renderHm(); hmPlayerScoreEl.textContent=hmScores.player; hmAiScoreEl.textContent=hmScores.ai; hmDrawScoreEl.textContent=hmScores.draw; hmSaveLogs(); hmRenderLogs(); hmLog('Owner applied state'); }catch(err){ alert('Invalid JSON'); } });

hmOwnerViewLSBtn && hmOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } hmOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); hmLog('Owner viewed localStorage'); });

hmOwnerKillSwitchBtn && hmOwnerKillSwitchBtn.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); hmLog('Owner used kill switch'); location.reload(); });

hmOwnerCloseBtn && hmOwnerCloseBtn.addEventListener('click', ()=>{ hmOwnerPanel.classList.add('hidden'); hmOwnerAuth.classList.remove('hidden'); hmOwnerContents.classList.add('hidden'); hmLog('Owner locked'); });
hmOwnerNewGameBtn && hmOwnerNewGameBtn.addEventListener('click', ()=>{ hmNewGame(); hmLog('Owner started new game'); });
hmOwnerReloadBtn && hmOwnerReloadBtn.addEventListener('click', ()=>{ hmLog('Owner reloaded app'); location.reload(); });
hmOwnerForcePlayerWinBtn2 && hmOwnerForcePlayerWinBtn2.addEventListener('click', ()=>{ hmDisplay = hmWord; hmAttempts = 10; renderHm(); hmGameOver = true; hmScores.player++; hmPlayerScoreEl.textContent = hmScores.player; hmLog('Owner forced player win'); });
hmOwnerForceAiWinBtn2 && hmOwnerForceAiWinBtn2.addEventListener('click', ()=>{ hmAttempts = 0; renderHm(); hmGameOver = true; hmScores.ai++; hmAiScoreEl.textContent = hmScores.ai; hmLog('Owner forced AI win'); });
hmOwnerSkipTurnBtn && hmOwnerSkipTurnBtn.addEventListener('click', ()=>{ hmLog('Owner skipped turn'); });
hmOwnerApplyDiffBtn && hmOwnerApplyDiffBtn.addEventListener('click', ()=>{ hmDifficultyEl.value = hmOwnerDifficultyEl.value; hmLog(`Owner set difficulty to ${hmOwnerDifficultyEl.value}`); alert('Difficulty updated'); });
hmOwnerViewStatsBtn && hmOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { word: hmWord, display: hmDisplay, attempts: hmAttempts, scores: hmScores }; alert(JSON.stringify(stats, null, 2)); hmLog('Owner viewed stats'); });
hmOwnerClearScoresBtn && hmOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; hmScores={player:0,ai:0,draw:0}; hmPlayerScoreEl.textContent=0; hmAiScoreEl.textContent=0; hmDrawScoreEl.textContent=0; localStorage.removeItem('hm_scores'); hmLog('Owner cleared scores'); });
hmOwnerClearLogsBtn && hmOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; hmLogs=[]; hmSaveLogs(); hmRenderLogs(); hmOwnerLogsEl.innerHTML=''; hmLog('Owner cleared logs'); });
hmOwnerExportStateBtn && hmOwnerExportStateBtn.addEventListener('click', ()=>{ const state={word:hmWord,display:hmDisplay,attempts:hmAttempts,scores:hmScores,logs:hmLogs}; hmOwnerStateInput.value = JSON.stringify(state); hmLog('Owner exported state'); });
hmOwnerClearLSBtn && hmOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); hmLog('Owner cleared localStorage'); alert('Storage cleared'); });
function hmSaveLogs(){ localStorage.setItem('hm_admin_logs', JSON.stringify(hmLogs)); }
function hmLog(action){ hmLogs.unshift(`${new Date().toISOString()} - ${action}`); if(hmLogs.length>200) hmLogs.pop(); hmSaveLogs(); hmRenderLogs(); if(hmOwnerLogsEl) hmOwnerLogsEl.innerHTML = hmLogs.map(l=>`<div>${l}</div>`).join(''); }
function hmRenderLogs(){ if(hmAdminLogsEl) hmAdminLogsEl.innerHTML = hmLogs.map(l=>`<div>${l}</div>`).join(''); }

function hmUnlock(){ if(hmAdminPassword.value==='0320'){ hmAdminAuth.classList.add('hidden'); hmAdminContents.classList.remove('hidden'); hmLog('Admin unlocked'); } else { alert('Incorrect code'); hmLog('Failed admin unlock attempt'); } }

hmAdminBtn && hmAdminBtn.addEventListener('click', ()=>{ hmAdminPanel.classList.toggle('hidden'); if(!hmAdminPanel.classList.contains('hidden')){ hmAdminAuth.classList.remove('hidden'); hmAdminContents.classList.add('hidden'); hmAdminPassword.value=''; hmRenderLogs(); } });
hmAdminUnlock && hmAdminUnlock.addEventListener('click', hmUnlock);
hmAdminDifficulty && hmAdminDifficulty.addEventListener('change', ()=>{ hmDifficultyEl.value = hmAdminDifficulty.value; hmLog(`Difficulty set to ${hmAdminDifficulty.value}`); });
hmForcePlayerWinBtn && hmForcePlayerWinBtn.addEventListener('click', ()=>{ hmDisplay = Array.from(hmWord); renderHm(); hmScores.player++; hmPlayerScoreEl.textContent=hmScores.player; hmLog('Forced player win'); hmStatus.textContent='You win!'; hmGameOver=true; });
hmForceAiWinBtn && hmForceAiWinBtn.addEventListener('click', ()=>{ hmAttempts=0; renderHm(); hmScores.ai++; hmAiScoreEl.textContent=hmScores.ai; hmLog('Forced AI win'); hmStatus.textContent=`AI wins! Word: ${hmWord}`; hmGameOver=true; });
hmClearScoresBtn && hmClearScoresBtn.addEventListener('click', ()=>{ hmScores = {player:0,ai:0,draw:0}; hmPlayerScoreEl.textContent=0; hmAiScoreEl.textContent=0; hmDrawScoreEl.textContent=0; localStorage.removeItem('hm_scores'); hmLog('Cleared scores'); });
hmResetLocalStorageBtn && hmResetLocalStorageBtn.addEventListener('click', ()=>{ localStorage.clear(); hmLogs=[]; hmSaveLogs(); hmRenderLogs(); hmLog('Reset localStorage'); });
hmResetGameBtn && hmResetGameBtn.addEventListener('click', ()=>{ hmNew(); hmLog('Game reset'); });
hmExportStateBtn && hmExportStateBtn.addEventListener('click', ()=>{ const state={word:hmWord,display:hmDisplay,attempts:hmAttempts,guessed:[...hmGuessed],scores:hmScores,logs:hmLogs}; const dataStr='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state)); const a=document.createElement('a'); a.setAttribute('href',dataStr); a.setAttribute('download','hangman_state.json'); document.body.appendChild(a); a.click(); a.remove(); hmLog('Exported state'); });
hmImportFile && hmImportFile.addEventListener('change',(e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ try{ const state=JSON.parse(ev.target.result); if(state.word) hmWord=state.word; if(state.display) hmDisplay=state.display; if(state.attempts!==undefined) hmAttempts=state.attempts; if(state.guessed) hmGuessed=new Set(state.guessed); if(state.scores) hmScores=state.scores; if(state.logs) hmLogs=state.logs; renderHm(); hmPlayerScoreEl.textContent=hmScores.player; hmAiScoreEl.textContent=hmScores.ai; hmDrawScoreEl.textContent=hmScores.draw; hmSaveLogs(); hmRenderLogs(); hmLog('Imported state'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); });
hmCloseAdminBtn && hmCloseAdminBtn.addEventListener('click', ()=>{ hmAdminPanel.classList.add('hidden'); hmAdminAuth.classList.remove('hidden'); hmAdminContents.classList.add('hidden'); hmLog('Admin locked'); });

// initialize
hmNew();
