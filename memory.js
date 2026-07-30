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
function playerFlip(i){ revealed[i]=true; render(); if(first===null){ first=i; } else { if(cards[first]===cards[i]){ matched.add(first); matched.add(i); playerPairs++; mmStatus.textContent='You found a pair!'; } else { setTimeout(()=>{ revealed[first]=false; revealed[i]=false; render(); turn='ai'; mmStatus.textContent='AI thinking...'; setTimeout(aiTurn,600); },800); } first=null; checkEnd(); }}

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