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