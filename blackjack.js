function deck(){ const suits=['♠','♥','♦','♣']; const vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K']; let d=[]; suits.forEach(s=>vals.forEach(v=>d.push(v+s))); return d; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
function valueOf(cards){ let total=0, aces=0; for(const c of cards){ let v=c.slice(0,-1); if(v==='A'){aces++; total+=11;} else if(['J','Q','K'].includes(v)){ total+=10;} else total+=parseInt(v,10); } while(total>21 && aces>0){ total-=10; aces--; } return total; }

const bjPlayerEl = document.getElementById('bjPlayer');
const bjDealerEl = document.getElementById('bjDealer');
const bjStatus = document.getElementById('bjStatus');
const bjNew = document.getElementById('bjNew');
const bjHit = document.getElementById('bjHit');
const bjStand = document.getElementById('bjStand');

let bjDeck=[], playerCards=[], dealerCards=[];

function start(){ bjDeck=deck(); shuffle(bjDeck); playerCards=[bjDeck.pop(), bjDeck.pop()]; dealerCards=[bjDeck.pop(), bjDeck.pop()]; render(); bjStatus.textContent='Your turn'; }
function render(){ bjPlayerEl.textContent = playerCards.join(' ')+ ' ('+valueOf(playerCards)+')'; bjDealerEl.textContent = dealerCards[0] + ' ??'; }
function checkEnd(){ const pv=valueOf(playerCards); if(pv>21){ bjStatus.textContent='Bust! Dealer wins'; return true; } return false; }

bjHit.addEventListener('click', ()=>{ playerCards.push(bjDeck.pop()); render(); if(checkEnd()) disableButtons(); });

bjStand.addEventListener('click', ()=>{ disableButtons(); // dealer AI: hit until 17
  while(valueOf(dealerCards) < 17){ dealerCards.push(bjDeck.pop()); }
  const dv=valueOf(dealerCards), pv=valueOf(playerCards);
  bjDealerEl.textContent = dealerCards.join(' ') + ' ('+dv+')';
  if(dv>21 || pv>dv) bjStatus.textContent='You win!'; else if(pv===dv) bjStatus.textContent='Push'; else bjStatus.textContent='Dealer wins';
});

function disableButtons(){ bjHit.disabled=true; bjStand.disabled=true; }
function enableButtons(){ bjHit.disabled=false; bjStand.disabled=false; }

bjNew.addEventListener('click', ()=>{ enableButtons(); bjStatus.textContent=''; start(); });
start();

// Admin & Owner wiring for Blackjack
const bjAdminBtn = document.getElementById('bjAdminBtn');
const bjAdminPanel = document.getElementById('bjAdminPanel');
const bjAdminAuth = document.getElementById('bjAdminAuth');
const bjAdminPassword = document.getElementById('bjAdminPassword');
const bjAdminUnlock = document.getElementById('bjAdminUnlock');
const bjAdminContents = document.getElementById('bjAdminContents');
const bjAdminDifficulty = document.getElementById('bjAdminDifficulty');
const bjForcePlayerWin = document.getElementById('bjForcePlayerWin');
const bjForceAiWin = document.getElementById('bjForceAiWin');
const bjClearScores = document.getElementById('bjClearScores');
const bjResetGameBtn = document.getElementById('bjResetGame');
const bjCloseAdmin = document.getElementById('bjCloseAdmin');

const bjOwnerBtn = document.getElementById('bjOwnerBtn');
const bjOwnerPanel = document.getElementById('bjOwnerPanel');
const bjOwnerAuth = document.getElementById('bjOwnerAuth');
const bjOwnerPassword = document.getElementById('bjOwnerPassword');
const bjOwnerUnlock = document.getElementById('bjOwnerUnlock');
const bjOwnerContents = document.getElementById('bjOwnerContents');
const bjOwnerNewGame = document.getElementById('bjOwnerNewGame');
const bjOwnerReloadApp = document.getElementById('bjOwnerReloadApp');
const bjOwnerKillSwitch = document.getElementById('bjOwnerKillSwitch');
const bjOwnerForcePlayerWin = document.getElementById('bjOwnerForcePlayerWin');
const bjOwnerForceAiWin = document.getElementById('bjOwnerForceAiWin');
const bjOwnerViewLS = document.getElementById('bjOwnerViewLS');
const bjOwnerClearLS = document.getElementById('bjOwnerClearLS');
const bjOwnerLocalStorageEl = document.getElementById('bjOwnerLocalStorage');
const bjOwnerClose = document.getElementById('bjOwnerClose');

function bjLog(msg){ const el = document.getElementById('bjAdminLogs'); if(!el) return; el.innerHTML = `<div>${new Date().toISOString()} - ${msg}</div>` + el.innerHTML; }

function bjUnlock(){ if(bjAdminPassword && bjAdminPassword.value==='0320'){ bjAdminAuth.classList.add('hidden'); bjAdminContents.classList.remove('hidden'); bjLog('Admin unlocked'); } else { alert('Incorrect code'); bjLog('Failed admin unlock attempt'); } }
bjAdminUnlock && bjAdminUnlock.addEventListener('click', bjUnlock);
bjAdminBtn && bjAdminBtn.addEventListener('click', ()=>{ bjAdminPanel.classList.toggle('hidden'); if(!bjAdminPanel.classList.contains('hidden')){ bjAdminAuth.classList.remove('hidden'); bjAdminContents.classList.add('hidden'); if(bjAdminPassword) bjAdminPassword.value=''; } });

bjForcePlayerWin && bjForcePlayerWin.addEventListener('click', ()=>{ playerCards = [ 'A♠' ]; dealerCards = []; render(); bjLog('Forced player win'); });
bjForceAiWin && bjForceAiWin.addEventListener('click', ()=>{ dealerCards = ['A♠','K♠','Q♠']; render(); bjLog('Forced AI win'); });
bjClearScores && bjClearScores.addEventListener('click', ()=>{ bjLog('Cleared scores'); });
bjResetGameBtn && bjResetGameBtn.addEventListener('click', ()=>{ start(); bjLog('Game reset'); });
bjCloseAdmin && bjCloseAdmin.addEventListener('click', ()=>{ bjAdminPanel.classList.add('hidden'); bjAdminAuth.classList.remove('hidden'); bjAdminContents.classList.add('hidden'); bjLog('Admin locked'); });

function bjOwnerUnlockFn(){ if(bjOwnerPassword && bjOwnerPassword.value==='Bowling320Fun'){ bjOwnerAuth.classList.add('hidden'); bjOwnerContents.classList.remove('hidden'); bjLog('Owner unlocked'); } else { alert('Incorrect owner code'); bjLog('Failed owner unlock attempt'); } }
bjOwnerUnlock && bjOwnerUnlock.addEventListener('click', bjOwnerUnlockFn);
bjOwnerBtn && bjOwnerBtn.addEventListener('click', ()=>{ bjOwnerPanel.classList.toggle('hidden'); if(!bjOwnerPanel.classList.contains('hidden')){ bjOwnerAuth.classList.remove('hidden'); bjOwnerContents.classList.add('hidden'); if(bjOwnerPassword) bjOwnerPassword.value=''; } });
bjOwnerNewGame && bjOwnerNewGame.addEventListener('click', ()=>{ start(); bjLog('Owner started new game'); });
bjOwnerReloadApp && bjOwnerReloadApp.addEventListener('click', ()=>{ bjLog('Owner reloaded app'); location.reload(); });
bjOwnerKillSwitch && bjOwnerKillSwitch.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); bjLog('Owner used kill switch'); location.reload(); });
bjOwnerForcePlayerWin && bjOwnerForcePlayerWin.addEventListener('click', ()=>{ playerCards = ['A♠','K♠']; render(); bjLog('Owner forced player win'); });
bjOwnerForceAiWin && bjOwnerForceAiWin.addEventListener('click', ()=>{ dealerCards = ['A♠','K♠','Q♠']; render(); bjLog('Owner forced AI win'); });
bjOwnerViewLS && bjOwnerViewLS.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } bjOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); bjLog('Owner viewed localStorage'); });
bjOwnerClearLS && bjOwnerClearLS.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); bjOwnerLocalStorageEl.textContent=''; bjLog('Owner cleared localStorage'); });
bjOwnerClose && bjOwnerClose.addEventListener('click', ()=>{ bjOwnerPanel.classList.add('hidden'); bjOwnerAuth.classList.remove('hidden'); bjOwnerContents.classList.add('hidden'); bjLog('Owner locked'); });