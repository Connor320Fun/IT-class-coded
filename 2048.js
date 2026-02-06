const twBoardEl = document.getElementById('twBoard');
const twStatus = document.getElementById('twStatus');
const twNewGameBtn = document.getElementById('twNewGame');
const twDifficultyEl = document.getElementById('twDifficulty');
const twPlayerScoreEl = document.getElementById('twPlayerScore');
const twAiScoreEl = document.getElementById('twAiScore');

let twBoard = [];
let twPlayerScore = 0;
let twAiScore = 0;
let twGameOver = false;
let twLogs = JSON.parse(localStorage.getItem('tw_admin_logs')||'[]');

function twInitBoard() {
  twBoard = Array(4).fill(null).map(()=>Array(4).fill(0));
  twAddTile();
  twAddTile();
}

function twAddTile() {
  const empty = [];
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(twBoard[i][j]===0) empty.push({x:i,y:j});
  if(empty.length>0) {
    const pos = empty[Math.floor(Math.random()*empty.length)];
    twBoard[pos.x][pos.y] = Math.random()<0.1?4:2;
  }
}

function twRender() {
  twBoardEl.innerHTML='';
  for(let i=0;i<4;i++) {
    for(let j=0;j<4;j++) {
      const cell = document.createElement('div');
      const val = twBoard[i][j];
      cell.style.width='60px';
      cell.style.height='60px';
      cell.style.background = val===0?'#5a5a5a':val<16?'#d4af37':val<256?'#f4a261':val<512?'#e76f51':val<1024?'#d62828':'#9400d3';
      cell.style.display='flex';
      cell.style.alignItems='center';
      cell.style.justifyContent='center';
      cell.style.fontSize='24px';
      cell.style.fontWeight='bold';
      cell.style.color='white';
      cell.style.borderRadius='4px';
      cell.textContent = val===0?'':val;
      twBoardEl.appendChild(cell);
    }
  }
}

function twCanMove() {
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(twBoard[i][j]===0) return true;
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) {
    if(j<3&&twBoard[i][j]===twBoard[i][j+1]) return true;
    if(i<3&&twBoard[i][j]===twBoard[i+1][j]) return true;
  }
  return false;
}

function twMove(dir) {
  if(twGameOver) return;
  let moved = false;
  const oldBoard = JSON.parse(JSON.stringify(twBoard));
  if(dir==='left'||dir==='right') {
    for(let i=0;i<4;i++) {
      const row = dir==='left'?twBoard[i]:[...twBoard[i]].reverse();
      let newRow = row.filter(v=>v!==0);
      for(let j=0;j<newRow.length-1;j++) {
        if(newRow[j]===newRow[j+1]) {
          newRow[j]*=2;
          twPlayerScore+=newRow[j];
          newRow.splice(j+1,1);
        }
      }
      newRow = [...newRow, ...Array(4-newRow.length).fill(0)];
      if(dir==='right') newRow.reverse();
      twBoard[i] = newRow;
    }
  } else {
    for(let j=0;j<4;j++) {
      const col = [];
      for(let i=0;i<4;i++) col.push(twBoard[i][j]);
      if(dir==='up') {
        let newCol = col.filter(v=>v!==0);
        for(let i=0;i<newCol.length-1;i++) {
          if(newCol[i]===newCol[i+1]) {
            newCol[i]*=2;
            twPlayerScore+=newCol[i];
            newCol.splice(i+1,1);
          }
        }
        newCol = [...newCol, ...Array(4-newCol.length).fill(0)];
        for(let i=0;i<4;i++) twBoard[i][j] = newCol[i];
      }
    }
  }
  moved = JSON.stringify(oldBoard)!==JSON.stringify(twBoard);
  if(moved) {
    twAddTile();
    twPlayerScoreEl.textContent = twPlayerScore;
    if(!twCanMove()) {
      twGameOver = true;
      twStatus.textContent = '💀 Game Over!';
      twAiScore++;
      twAiScoreEl.textContent = twAiScore;
      twLog('Player game over');
    }
  }
  twRender();
}

function twNew() {
  twInitBoard();
  twPlayerScore = 0;
  twGameOver = false;
  twPlayerScoreEl.textContent = 0;
  twStatus.textContent = 'Use arrow keys to move!';
  twRender();
}

twNewGameBtn && twNewGameBtn.addEventListener('click', twNew);
document.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowLeft') twMove('left');
  if(e.key==='ArrowRight') twMove('right');
  if(e.key==='ArrowUp') twMove('up');
  if(e.key==='ArrowDown') twMove('down');
});

// Admin Panel
const twAdminBtn = document.getElementById('twAdminBtn');
const twAdminPanel = document.getElementById('twAdminPanel');
const twAdminAuth = document.getElementById('twAdminAuth');
const twAdminPassword = document.getElementById('twAdminPassword');
const twAdminUnlock = document.getElementById('twAdminUnlock');
const twAdminContents = document.getElementById('twAdminContents');
const twAdminDifficulty = document.getElementById('twAdminDifficulty');
const twClearScoresBtn = document.getElementById('twClearScores');
const twResetGameBtn = document.getElementById('twResetGame');
const twAdminLogsEl = document.getElementById('twAdminLogs');
const twCloseAdminBtn = document.getElementById('twCloseAdmin');

function twUnlock(){ if(twAdminPassword.value==='0320'){ twAdminAuth.classList.add('hidden'); twAdminContents.classList.remove('hidden'); twLog('Admin unlocked'); } else { alert('Incorrect code'); twLog('Failed admin unlock attempt'); } }

twAdminBtn && twAdminBtn.addEventListener('click', ()=>{ twAdminPanel.classList.toggle('hidden'); if(!twAdminPanel.classList.contains('hidden')){ twAdminAuth.classList.remove('hidden'); twAdminContents.classList.add('hidden'); twAdminPassword.value=''; twRenderLogs(); } });
twAdminUnlock && twAdminUnlock.addEventListener('click', twUnlock);
twAdminDifficulty && twAdminDifficulty.addEventListener('change', ()=>{ twDifficultyEl.value = twAdminDifficulty.value; twLog(`Difficulty set to ${twAdminDifficulty.value}`); });
twClearScoresBtn && twClearScoresBtn.addEventListener('click', ()=>{ twPlayerScore=0; twAiScore=0; twPlayerScoreEl.textContent=0; twAiScoreEl.textContent=0; localStorage.removeItem('tw_scores'); twLog('Cleared scores'); });
twResetGameBtn && twResetGameBtn.addEventListener('click', ()=>{ twNew(); twLog('Game reset'); });
twCloseAdminBtn && twCloseAdminBtn.addEventListener('click', ()=>{ twAdminPanel.classList.add('hidden'); twAdminAuth.classList.remove('hidden'); twAdminContents.classList.add('hidden'); twLog('Admin locked'); });

// Owner Panel
const twOwnerBtn = document.getElementById('twOwnerBtn');
const twOwnerPanel = document.getElementById('twOwnerPanel');
const twOwnerAuth = document.getElementById('twOwnerAuth');
const twOwnerPassword = document.getElementById('twOwnerPassword');
const twOwnerUnlock = document.getElementById('twOwnerUnlock');
const twOwnerContents = document.getElementById('twOwnerContents');
const twOwnerViewLSBtn = document.getElementById('twOwnerViewLS');
const twOwnerLocalStorageEl = document.getElementById('twOwnerLocalStorage');
const twOwnerCloseBtn = document.getElementById('twOwnerClose');
const twOwnerViewStatsBtn = document.getElementById('twOwnerViewStats');
const twOwnerClearScoresBtn = document.getElementById('twOwnerClearScores');
const twOwnerClearLogsBtn = document.getElementById('twOwnerClearLogs');
const twOwnerClearLSBtn = document.getElementById('twOwnerClearLS');
const twOwnerLogsEl = document.getElementById('twOwnerLogs');

function twOwnerUnlockAndAdmin(){ if(twOwnerPassword.value==='Bowling320Fun'){ twOwnerAuth.classList.add('hidden'); twOwnerContents.classList.remove('hidden'); twLog('Owner unlocked'); twAdminAuth.classList.add('hidden'); twAdminContents.classList.remove('hidden'); twRenderLogs(); } else { alert('Incorrect owner code'); twLog('Failed owner unlock attempt'); } }

twOwnerBtn && twOwnerBtn.addEventListener('click', ()=>{ twOwnerPanel.classList.toggle('hidden'); if(!twOwnerPanel.classList.contains('hidden')){ twOwnerAuth.classList.remove('hidden'); twOwnerContents.classList.add('hidden'); twOwnerPassword.value=''; } });
twOwnerUnlock && twOwnerUnlock.addEventListener('click', twOwnerUnlockAndAdmin);
twOwnerCloseBtn && twOwnerCloseBtn.addEventListener('click', ()=>{ twOwnerPanel.classList.add('hidden'); twOwnerAuth.classList.remove('hidden'); twOwnerContents.classList.add('hidden'); twLog('Owner locked'); });
twOwnerViewStatsBtn && twOwnerViewStatsBtn.addEventListener('click', ()=>{ const stats = { playerScore: twPlayerScore, aiScore: twAiScore }; alert(JSON.stringify(stats, null, 2)); twLog('Owner viewed stats'); });
twOwnerClearScoresBtn && twOwnerClearScoresBtn.addEventListener('click', ()=>{ if(!confirm('Clear all scores?')) return; twPlayerScore=0; twAiScore=0; twPlayerScoreEl.textContent=0; twAiScoreEl.textContent=0; localStorage.removeItem('tw_scores'); twLog('Owner cleared scores'); });
twOwnerClearLogsBtn && twOwnerClearLogsBtn.addEventListener('click', ()=>{ if(!confirm('Clear all logs?')) return; twLogs=[]; twSaveLogs(); twRenderLogs(); twOwnerLogsEl.innerHTML=''; twLog('Owner cleared logs'); });
twOwnerViewLSBtn && twOwnerViewLSBtn.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } twOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); twLog('Owner viewed localStorage'); });
twOwnerClearLSBtn && twOwnerClearLSBtn.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); twLog('Owner cleared localStorage'); alert('Storage cleared'); });

function twSaveLogs(){ localStorage.setItem('tw_admin_logs', JSON.stringify(twLogs)); }
function twLog(a){ twLogs.unshift(`${new Date().toISOString()} - ${a}`); if(twLogs.length>200) twLogs.pop(); twSaveLogs(); twRenderLogs(); if(twOwnerLogsEl) twOwnerLogsEl.innerHTML = twLogs.map(l=>`<div>${l}</div>`).join(''); }
function twRenderLogs(){ if(twAdminLogsEl) twAdminLogsEl.innerHTML = twLogs.map(l=>`<div>${l}</div>`).join(''); }

twNew();
