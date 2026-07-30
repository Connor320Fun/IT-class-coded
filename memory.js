const mmGrid = document.getElementById('mmGrid');
const mmNew = document.getElementById('mmNew');
const mmStatus = document.getElementById('mmStatus');
let symbols = ['🍎','🍌','🍇','🍒','🍓','🍍','🍑','🥝'];
let cards = [], revealed = [], matched = new Set();
let turn = 'player'; // player then ai
let seen = {}; // memory for AI
let playerPairs=0, aiPairs=0;

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
function build(){ cards = symbols.concat(symbols); shuffle(cards); revealed = Array(cards.length).fill(false); matched = new Set(); playerPairs=0; aiPairs=0; seen = {}; render(); mmStatus.textContent='Your turn'; turn='player'; }

function render(){ mmGrid.innerHTML = '';
  cards.forEach((s,i)=>{
    const el = document.createElement('div'); el.className='card'; el.dataset.i=i;
    el.textContent = revealed[i]||matched.has(i)? cards[i] : '';
    el.style.background = matched.has(i)? '#074' : '#0b2';
    el.addEventListener('click', ()=>{ if(turn!=='player') return; if(matched.has(i)||revealed[i]) return; playerFlip(i); });
    mmGrid.appendChild(el);
  });
}

let first=null;
function playerFlip(i){
  revealed[i]=true;
  // let AI remember what player revealed
  seen[i]=cards[i];
  render();
  if(first===null){
    first=i;
  } else {
    // remember the first flip too
    seen[first]=cards[first];
    if(cards[first]===cards[i]){
      matched.add(first);
      matched.add(i);
      // matched cards should be removed from AI memory
      delete seen[first];
      delete seen[i];
      playerPairs++;
      mmStatus.textContent='You found a pair!';
      render();
      checkEnd();
      first=null;
      return;
    } else {
      // keep seen entries so AI can learn from player's reveals
      setTimeout(()=>{
        revealed[first]=false;
        revealed[i]=false;
        render();
        turn='ai';
        mmStatus.textContent='AI thinking...';
        setTimeout(aiTurn,600);
      },800);
    }
    first=null;
    checkEnd();
  }
}

function aiTurn(){ // simple memory based AI
  // if AI knows a pair, take it
  for(let a in seen){ for(let b in seen){ if(a!==b && seen[a]===seen[b] && !matched.has(parseInt(a)) && !matched.has(parseInt(b))){ // take this pair
      matched.add(parseInt(a)); matched.add(parseInt(b)); aiPairs++; mmStatus.textContent='AI found a pair'; render(); turn='player'; checkEnd(); return; } }}
  // otherwise reveal two cards randomly (prefer unseen)
  const candidates = cards.map((_,i)=>i).filter(i=>!matched.has(i) && !revealed[i]);
  if(candidates.length===0){ turn='player'; return; }
  const pick = candidates[Math.floor(Math.random()*candidates.length)]; revealed[pick]=true; seen[pick]=cards[pick]; render(); setTimeout(()=>{
    // try to find match in seen
    let matchIdx = Object.keys(seen).find(k=>seen[k]===cards[pick] && parseInt(k)!==pick && !matched.has(parseInt(k)));
    if(matchIdx!==undefined){ // take known match
      matched.add(pick); matched.add(parseInt(matchIdx)); aiPairs++; mmStatus.textContent='AI found a match using memory'; render(); turn='player'; checkEnd(); return;
    }
    // pick second random
    const rem = candidates.filter(x=>x!==pick);
    if(rem.length===0){ revealed[pick]=false; render(); turn='player'; return; }
    const pick2 = rem[Math.floor(Math.random()*rem.length)]; revealed[pick2]=true; seen[pick2]=cards[pick2]; render(); setTimeout(()=>{
      if(cards[pick]===cards[pick2]){ matched.add(pick); matched.add(pick2); aiPairs++; mmStatus.textContent='AI lucked a pair'; }
      else { revealed[pick]=false; revealed[pick2]=false; mmStatus.textContent='AI did not match'; }
      render(); turn='player'; checkEnd();
    },700);
  },700);
}

function checkEnd(){ if(matched.size===cards.length){ if(playerPairs>aiPairs) mmStatus.textContent='You win the match'; else if(aiPairs>playerPairs) mmStatus.textContent='AI wins the match'; else mmStatus.textContent='Draw'; } }

mmNew.addEventListener('click', ()=>{ build(); });
build();

// Admin & Owner wiring for Memory Match
const mmAdminBtn = document.getElementById('mmAdminBtn');
const mmAdminPanel = document.getElementById('mmAdminPanel');
const mmAdminAuth = document.getElementById('mmAdminAuth');
const mmAdminPassword = document.getElementById('mmAdminPassword');
const mmAdminUnlock = document.getElementById('mmAdminUnlock');
const mmAdminContents = document.getElementById('mmAdminContents');
const mmAdminDifficulty = document.getElementById('mmAdminDifficulty');
const mmForcePlayerWin = document.getElementById('mmForcePlayerWin');
const mmForceAiWin = document.getElementById('mmForceAiWin');
const mmClearScores = document.getElementById('mmClearScores');
const mmResetGameBtn = document.getElementById('mmResetGame');
const mmCloseAdmin = document.getElementById('mmCloseAdmin');

const mmOwnerBtn = document.getElementById('mmOwnerBtn');
const mmOwnerPanel = document.getElementById('mmOwnerPanel');
const mmOwnerAuth = document.getElementById('mmOwnerAuth');
const mmOwnerPassword = document.getElementById('mmOwnerPassword');
const mmOwnerUnlock = document.getElementById('mmOwnerUnlock');
const mmOwnerContents = document.getElementById('mmOwnerContents');
const mmOwnerNewGame = document.getElementById('mmOwnerNewGame');
const mmOwnerReloadApp = document.getElementById('mmOwnerReloadApp');
const mmOwnerKillSwitch = document.getElementById('mmOwnerKillSwitch');
const mmOwnerForcePlayerWin = document.getElementById('mmOwnerForcePlayerWin');
const mmOwnerForceAiWin = document.getElementById('mmOwnerForceAiWin');
const mmOwnerViewLS = document.getElementById('mmOwnerViewLS');
const mmOwnerClearLS = document.getElementById('mmOwnerClearLS');
const mmOwnerLocalStorageEl = document.getElementById('mmOwnerLocalStorage');
const mmOwnerClose = document.getElementById('mmOwnerClose');

function mmLog(msg){ const el = document.getElementById('mmAdminLogs'); if(!el) return; el.innerHTML = `<div>${new Date().toISOString()} - ${msg}</div>` + el.innerHTML; }

function mmUnlock(){ if(mmAdminPassword && mmAdminPassword.value==='0320'){ mmAdminAuth.classList.add('hidden'); mmAdminContents.classList.remove('hidden'); mmLog('Admin unlocked'); } else { alert('Incorrect code'); mmLog('Failed admin unlock attempt'); } }
mmAdminUnlock && mmAdminUnlock.addEventListener('click', mmUnlock);
mmAdminBtn && mmAdminBtn.addEventListener('click', ()=>{ mmAdminPanel.classList.toggle('hidden'); if(!mmAdminPanel.classList.contains('hidden')){ mmAdminAuth.classList.remove('hidden'); mmAdminContents.classList.add('hidden'); if(mmAdminPassword) mmAdminPassword.value=''; } });

mmForcePlayerWin && mmForcePlayerWin.addEventListener('click', ()=>{ playerPairs = Math.ceil(cards.length/4); mmLog('Forced player major win'); render(); });
mmForceAiWin && mmForceAiWin.addEventListener('click', ()=>{ aiPairs = Math.ceil(cards.length/4); mmLog('Forced AI major win'); render(); });
mmClearScores && mmClearScores.addEventListener('click', ()=>{ playerPairs=0; aiPairs=0; mmLog('Cleared scores'); render(); });
mmResetGameBtn && mmResetGameBtn.addEventListener('click', ()=>{ build(); mmLog('Game reset'); });
mmCloseAdmin && mmCloseAdmin.addEventListener('click', ()=>{ mmAdminPanel.classList.add('hidden'); mmAdminAuth.classList.remove('hidden'); mmAdminContents.classList.add('hidden'); mmLog('Admin locked'); });

function mmOwnerUnlockFn(){ if(mmOwnerPassword && mmOwnerPassword.value==='Bowling320Fun'){ mmOwnerAuth.classList.add('hidden'); mmOwnerContents.classList.remove('hidden'); mmLog('Owner unlocked'); } else { alert('Incorrect owner code'); mmLog('Failed owner unlock attempt'); } }
mmOwnerUnlock && mmOwnerUnlock.addEventListener('click', mmOwnerUnlockFn);
mmOwnerBtn && mmOwnerBtn.addEventListener('click', ()=>{ mmOwnerPanel.classList.toggle('hidden'); if(!mmOwnerPanel.classList.contains('hidden')){ mmOwnerAuth.classList.remove('hidden'); mmOwnerContents.classList.add('hidden'); if(mmOwnerPassword) mmOwnerPassword.value=''; } });
mmOwnerNewGame && mmOwnerNewGame.addEventListener('click', ()=>{ build(); mmLog('Owner started new game'); });
mmOwnerReloadApp && mmOwnerReloadApp.addEventListener('click', ()=>{ mmLog('Owner reloaded app'); location.reload(); });
mmOwnerKillSwitch && mmOwnerKillSwitch.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); mmLog('Owner used kill switch'); location.reload(); });
mmOwnerForcePlayerWin && mmOwnerForcePlayerWin.addEventListener('click', ()=>{ playerPairs = Math.ceil(cards.length/4); render(); mmLog('Owner forced player win'); });
mmOwnerForceAiWin && mmOwnerForceAiWin.addEventListener('click', ()=>{ aiPairs = Math.ceil(cards.length/4); render(); mmLog('Owner forced AI win'); });
mmOwnerViewLS && mmOwnerViewLS.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } mmOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); mmLog('Owner viewed localStorage'); });
mmOwnerClearLS && mmOwnerClearLS.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); mmOwnerLocalStorageEl.textContent=''; mmLog('Owner cleared localStorage'); });
mmOwnerClose && mmOwnerClose.addEventListener('click', ()=>{ mmOwnerPanel.classList.add('hidden'); mmOwnerAuth.classList.remove('hidden'); mmOwnerContents.classList.add('hidden'); mmLog('Owner locked'); });