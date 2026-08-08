const wdWords = ['ABOUT','ACUTE','ADMIT','ADOPT','ADULT','AFTER','AGAIN','AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT','ALIKE','ALIVE','ALLOW','ALONE','ALONG','ALTER','ANGEL','ANGER','ANGLE','ANGRY','APART','APPLE','APPLY','ARENA','ARGUE','ARISE','ARRAY','ARROW','ASIDE','ASSET','ATLAS','AUDIO','AUDIT','AVOID','AWAKE','AWARD','AWARE','BADLY'];

const wdGrid = document.getElementById('wdGrid');
const wdInput = document.getElementById('wdInput');
const wdSubmit = document.getElementById('wdSubmit');
const wdStatus = document.getElementById('wdStatus');
const wdKeyboard = document.getElementById('wdKeyboard');

let wdState = { word: '', guesses: [], attempts: 0, maxAttempts: 6, playerWins: 0, aiWins: 0, gameOver: false, result: '' };

function wdLog(msg){ const logs = JSON.parse(localStorage.getItem('wdLogs') || '[]'); logs.push({ts: new Date().toISOString(), msg}); localStorage.setItem('wdLogs', JSON.stringify(logs.slice(-50))); }

function wdSaveState(){ localStorage.setItem('wdState', JSON.stringify(wdState)); }

function wdLoadState(){ const s = localStorage.getItem('wdState'); if(s){ wdState = JSON.parse(s); } const p = localStorage.getItem('wdPlayerWins'); if(p){ wdState.playerWins = parseInt(p); } const a = localStorage.getItem('wdAiWins'); if(a){ wdState.aiWins = parseInt(a); } }

function wdRender(){
  wdGrid.innerHTML = '';
  for(let i = 0; i < wdState.guesses.length; i++){
    const g = wdState.guesses[i];
    for(let j = 0; j < 5; j++){
      const c = g[j];
      const correct = c === wdState.word[j];
      const present = !correct && wdState.word.includes(c);
      const tile = document.createElement('div');
      tile.className = 'wdTile';
      if(correct) tile.classList.add('correct');
      else if(present) tile.classList.add('present');
      else tile.classList.add('absent');
      tile.textContent = c;
      wdGrid.appendChild(tile);
    }
  }
  document.getElementById('wdPlayerWins').textContent = wdState.playerWins;
  document.getElementById('wdAiWins').textContent = wdState.aiWins;
}

function wdRenderKeyboard(){
  wdKeyboard.innerHTML = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'wdKey';
    btn.textContent = letter;
    for(const guess of wdState.guesses){
      if(!guess.includes(letter)) continue;
      if(wdState.word[guess.indexOf(letter)] === letter){ btn.classList.add('correct'); break; }
      else if(wdState.word.includes(letter)){ btn.classList.add('present'); }
      else { btn.classList.add('used'); }
    }
    wdKeyboard.appendChild(btn);
  });
}

function wdNewGame(){
  wdState.word = wdWords[Math.floor(Math.random() * wdWords.length)];
  wdState.guesses = [];
  wdState.attempts = 0;
  wdState.gameOver = false;
  wdState.result = '';
  wdSaveState();
  wdRender();
  wdRenderKeyboard();
  wdInput.value = '';
  wdInput.focus();
  wdStatus.textContent = 'Guess the word (6 attempts)';
  wdLog('New game started: ' + wdState.word);
}

function wdCheckGuess(){
  const guess = wdInput.value.trim().toUpperCase();
  if(guess.length !== 5){ wdStatus.textContent = 'Must be 5 letters'; return; }
  if(wdState.gameOver){ wdStatus.textContent = 'Game over. Press New Game'; return; }
  if(wdState.guesses.includes(guess)){ wdStatus.textContent = 'Already guessed'; return; }
  
  wdState.guesses.push(guess);
  wdState.attempts++;
  
  if(guess === wdState.word){
    wdState.playerWins++;
    wdState.gameOver = true;
    wdState.result = 'Win!';
    localStorage.setItem('wdPlayerWins', wdState.playerWins);
    wdStatus.textContent = `Won in ${wdState.attempts} guesses!`;
    wdLog('Player won: ' + wdState.word);
  } else if(wdState.attempts >= wdState.maxAttempts){
    wdState.aiWins++;
    wdState.gameOver = true;
    wdState.result = 'Lose';
    localStorage.setItem('wdAiWins', wdState.aiWins);
    wdStatus.textContent = `Game over. Word was: ${wdState.word}`;
    wdLog('AI won: ' + wdState.word);
  } else {
    wdStatus.textContent = `${wdState.maxAttempts - wdState.attempts} attempts left`;
  }
  
  wdInput.value = '';
  wdSaveState();
  wdRender();
  wdRenderKeyboard();
}

wdInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') wdCheckGuess(); });
wdSubmit.addEventListener('click', wdCheckGuess);
document.getElementById('wdNew').addEventListener('click', wdNewGame);

// Admin panel wiring (admin code: 0320)
const wdAdminBtn = document.getElementById('wdAdminBtn');
const wdAdminPanel = document.getElementById('wdAdminPanel');
const wdAdminAuth = document.getElementById('wdAdminAuth');
const wdAdminContents = document.getElementById('wdAdminContents');
const wdAdminPassword = document.getElementById('wdAdminPassword');
const wdAdminLogs = document.getElementById('wdAdminLogs');

function wdRenderAdminLogs(){
  const logs = JSON.parse(localStorage.getItem('wdLogs') || '[]');
  wdAdminLogs.textContent = logs.map(l => `[${l.ts}] ${l.msg}`).join('\n');
}

wdAdminBtn.addEventListener('click', () => { wdAdminPanel.classList.toggle('hidden'); });
document.getElementById('wdAdminUnlock').addEventListener('click', () => {
  if(wdAdminPassword.value === '0320'){
    wdAdminAuth.classList.add('hidden');
    wdAdminContents.classList.remove('hidden');
    wdRenderAdminLogs();
  } else { alert('Incorrect admin code'); }
});
document.getElementById('wdForcePlayerWin').addEventListener('click', () => { wdState.playerWins++; wdState.gameOver = true; localStorage.setItem('wdPlayerWins', wdState.playerWins); wdRender(); wdLog('Admin: forced player win'); wdRenderAdminLogs(); });
document.getElementById('wdForceAiWin').addEventListener('click', () => { wdState.aiWins++; wdState.gameOver = true; localStorage.setItem('wdAiWins', wdState.aiWins); wdRender(); wdLog('Admin: forced AI win'); wdRenderAdminLogs(); });
document.getElementById('wdClearScores').addEventListener('click', () => { wdState.playerWins = 0; wdState.aiWins = 0; localStorage.setItem('wdPlayerWins', '0'); localStorage.setItem('wdAiWins', '0'); wdRender(); wdLog('Admin: cleared scores'); wdRenderAdminLogs(); });
document.getElementById('wdResetGame').addEventListener('click', () => { wdNewGame(); wdLog('Admin: reset game'); wdRenderAdminLogs(); });
document.getElementById('wdCloseAdmin').addEventListener('click', () => { wdAdminAuth.classList.remove('hidden'); wdAdminContents.classList.add('hidden'); wdAdminPassword.value = ''; });

// Owner panel wiring (owner code: Bowling320Fun)
const wdOwnerBtn = document.getElementById('wdOwnerBtn');
const wdOwnerPanel = document.getElementById('wdOwnerPanel');
const wdOwnerAuth = document.getElementById('wdOwnerAuth');
const wdOwnerContents = document.getElementById('wdOwnerContents');
const wdOwnerPassword = document.getElementById('wdOwnerPassword');
const wdOwnerLogs = document.getElementById('wdOwnerLogs');
const wdOwnerLocalStorage = document.getElementById('wdOwnerLocalStorage');

wdOwnerBtn.addEventListener('click', () => { wdOwnerPanel.classList.toggle('hidden'); });
document.getElementById('wdOwnerUnlock').addEventListener('click', () => {
  if(wdOwnerPassword.value === 'Bowling320Fun'){
    wdOwnerAuth.classList.add('hidden');
    wdOwnerContents.classList.remove('hidden');
  } else { alert('Incorrect owner code'); }
});
document.getElementById('wdOwnerNewGame').addEventListener('click', wdNewGame);
document.getElementById('wdOwnerReloadApp').addEventListener('click', () => { setTimeout(() => location.reload(), 250); });
document.getElementById('wdOwnerKillSwitch').addEventListener('click', () => { if(confirm('Clear localStorage?')){ localStorage.clear(); location.reload(); } });
document.getElementById('wdOwnerForcePlayerWin').addEventListener('click', () => { wdState.playerWins++; localStorage.setItem('wdPlayerWins', wdState.playerWins); wdRender(); });
document.getElementById('wdOwnerForceAiWin').addEventListener('click', () => { wdState.aiWins++; localStorage.setItem('wdAiWins', wdState.aiWins); wdRender(); });
document.getElementById('wdOwnerViewLS').addEventListener('click', () => { const obj = {}; for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); obj[k] = localStorage.getItem(k); } wdOwnerLocalStorage.textContent = JSON.stringify(obj, null, 2); });
document.getElementById('wdOwnerClearLS').addEventListener('click', () => { if(confirm('Clear localStorage?')){ localStorage.clear(); wdOwnerLocalStorage.textContent = 'Cleared'; } });
document.getElementById('wdOwnerClose').addEventListener('click', () => { wdOwnerAuth.classList.remove('hidden'); wdOwnerContents.classList.add('hidden'); wdOwnerPassword.value = ''; });

wdLoadState();
wdRender();
wdRenderKeyboard();