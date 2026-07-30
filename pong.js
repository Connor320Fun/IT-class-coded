const pgCanvas = document.getElementById('pgCanvas');
const pgCtx = pgCanvas.getContext('2d');
const pgDifficulty = document.getElementById('pgDifficulty');
const pgNew = document.getElementById('pgNew');
const pgScoreEl = document.getElementById('pgScore');
let pgWidth = pgCanvas.width, pgHeight = pgCanvas.height;
let scores = {player:0, ai:0};
let ball = {x:pgWidth/2,y:pgHeight/2, vx:4, vy:3, r:6};
let paddleH = 80, paddleW = 10;
let playerY = (pgHeight-paddleH)/2, aiY = (pgHeight-paddleH)/2;
let up=false, down=false, running=false;

function resetBall(){ ball.x=pgWidth/2; ball.y=pgHeight/2; ball.vx = (Math.random()>0.5?1:-1)* (4 + Math.random()*2); ball.vy = (Math.random()*4-2); }

function draw(){ pgCtx.clearRect(0,0,pgWidth,pgHeight);
  // ball
  pgCtx.fillStyle='white'; pgCtx.beginPath(); pgCtx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); pgCtx.fill();
  // paddles
  pgCtx.fillRect(10, playerY, paddleW, paddleH);
  pgCtx.fillRect(pgWidth-20, aiY, paddleW, paddleH);
}

function step(){ if(!running) return; ball.x += ball.vx; ball.y += ball.vy;
  if(ball.y<ball.r || ball.y>pgHeight-ball.r) ball.vy*=-1;
  // player paddle collision
  if(ball.x - ball.r <= 10 + paddleW && ball.y > playerY && ball.y < playerY + paddleH){ ball.vx = Math.abs(ball.vx); ball.vx *= 1.03; }
  // ai paddle collision
  if(ball.x + ball.r >= pgWidth-20 && ball.y > aiY && ball.y < aiY + paddleH){ ball.vx = -Math.abs(ball.vx); ball.vx *= 1.03; }
  // score
  if(ball.x < 0){ scores.ai++; updateScore(); resetBall(); }
  if(ball.x > pgWidth){ scores.player++; updateScore(); resetBall(); }
  // player control
  if(up) playerY = Math.max(0, playerY-6); if(down) playerY = Math.min(pgHeight-paddleH, playerY+6);
  // AI simple follow
  let difficulty = parseInt(pgDifficulty.value,10);
  let aiSpeed = 3 + difficulty*1.5;
  // predictive: move toward ball
  if(aiY + paddleH/2 < ball.y - 6) aiY = Math.min(pgHeight-paddleH, aiY + aiSpeed);
  if(aiY + paddleH/2 > ball.y + 6) aiY = Math.max(0, aiY - aiSpeed);
  draw(); requestAnimationFrame(step);
}

function updateScore(){ pgScoreEl.textContent = `${scores.player} : ${scores.ai}`; }

document.addEventListener('keydown', e=>{ if(e.key==='ArrowUp') up=true; if(e.key==='ArrowDown') down=true; });
document.addEventListener('keyup', e=>{ if(e.key==='ArrowUp') up=false; if(e.key==='ArrowDown') down=false; });
window.addEventListener('resize', ()=>{ /* keep fixed canvas */ });

pgNew.addEventListener('click', ()=>{ scores={player:0,ai:0}; updateScore(); resetBall(); running=true; requestAnimationFrame(step); });
// start auto
resetBall(); running=false; updateScore();

// Admin & Owner wiring
const pgAdminBtn = document.getElementById('pgAdminBtn');
const pgAdminPanel = document.getElementById('pgAdminPanel');
const pgAdminAuth = document.getElementById('pgAdminAuth');
const pgAdminPassword = document.getElementById('pgAdminPassword');
const pgAdminUnlock = document.getElementById('pgAdminUnlock');
const pgAdminContents = document.getElementById('pgAdminContents');
const pgAdminDifficulty = document.getElementById('pgAdminDifficulty');
const pgForcePlayerWin = document.getElementById('pgForcePlayerWin');
const pgForceAiWin = document.getElementById('pgForceAiWin');
const pgClearScores = document.getElementById('pgClearScores');
const pgResetGameBtn = document.getElementById('pgResetGame');
const pgCloseAdmin = document.getElementById('pgCloseAdmin');

const pgOwnerBtn = document.getElementById('pgOwnerBtn');
const pgOwnerPanel = document.getElementById('pgOwnerPanel');
const pgOwnerAuth = document.getElementById('pgOwnerAuth');
const pgOwnerPassword = document.getElementById('pgOwnerPassword');
const pgOwnerUnlock = document.getElementById('pgOwnerUnlock');
const pgOwnerContents = document.getElementById('pgOwnerContents');
const pgOwnerNewGame = document.getElementById('pgOwnerNewGame');
const pgOwnerReloadApp = document.getElementById('pgOwnerReloadApp');
const pgOwnerKillSwitch = document.getElementById('pgOwnerKillSwitch');
const pgOwnerForcePlayerWin = document.getElementById('pgOwnerForcePlayerWin');
const pgOwnerForceAiWin = document.getElementById('pgOwnerForceAiWin');
const pgOwnerViewLS = document.getElementById('pgOwnerViewLS');
const pgOwnerClearLS = document.getElementById('pgOwnerClearLS');
const pgOwnerLocalStorageEl = document.getElementById('pgOwnerLocalStorage');
const pgOwnerClose = document.getElementById('pgOwnerClose');

function pgLog(msg){ const el = document.getElementById('pgAdminLogs'); if(!el) return; el.innerHTML = `<div>${new Date().toISOString()} - ${msg}</div>` + el.innerHTML; }

function pgUnlock(){ if(pgAdminPassword && pgAdminPassword.value==='0320'){ pgAdminAuth.classList.add('hidden'); pgAdminContents.classList.remove('hidden'); pgLog('Admin unlocked'); } else { alert('Incorrect code'); pgLog('Failed admin unlock attempt'); } }
pgAdminUnlock && pgAdminUnlock.addEventListener('click', pgUnlock);
pgAdminBtn && pgAdminBtn.addEventListener('click', ()=>{ pgAdminPanel.classList.toggle('hidden'); if(!pgAdminPanel.classList.contains('hidden')){ pgAdminAuth.classList.remove('hidden'); pgAdminContents.classList.add('hidden'); if(pgAdminPassword) pgAdminPassword.value=''; } });
pgAdminDifficulty && pgAdminDifficulty.addEventListener('change', ()=>{ pgDifficulty.value = pgAdminDifficulty.value; pgLog('Difficulty set to '+pgAdminDifficulty.value); });
pgForcePlayerWin && pgForcePlayerWin.addEventListener('click', ()=>{ scores.player+=1; updateScore(); resetBall(); pgLog('Forced player win'); });
pgForceAiWin && pgForceAiWin.addEventListener('click', ()=>{ scores.ai+=1; updateScore(); resetBall(); pgLog('Forced AI win'); });
pgClearScores && pgClearScores.addEventListener('click', ()=>{ scores={player:0,ai:0}; updateScore(); pgLog('Cleared scores'); });
pgResetGameBtn && pgResetGameBtn.addEventListener('click', ()=>{ scores={player:0,ai:0}; updateScore(); resetBall(); pgLog('Game reset'); });
pgCloseAdmin && pgCloseAdmin.addEventListener('click', ()=>{ pgAdminPanel.classList.add('hidden'); pgAdminAuth.classList.remove('hidden'); pgAdminContents.classList.add('hidden'); pgLog('Admin locked'); });

function pgOwnerUnlockFn(){ if(pgOwnerPassword && pgOwnerPassword.value==='Bowling320Fun'){ pgOwnerAuth.classList.add('hidden'); pgOwnerContents.classList.remove('hidden'); pgLog('Owner unlocked'); } else { alert('Incorrect owner code'); pgLog('Failed owner unlock attempt'); } }
pgOwnerUnlock && pgOwnerUnlock.addEventListener('click', pgOwnerUnlockFn);
pgOwnerBtn && pgOwnerBtn.addEventListener('click', ()=>{ pgOwnerPanel.classList.toggle('hidden'); if(!pgOwnerPanel.classList.contains('hidden')){ pgOwnerAuth.classList.remove('hidden'); pgOwnerContents.classList.add('hidden'); if(pgOwnerPassword) pgOwnerPassword.value=''; } });
pgOwnerNewGame && pgOwnerNewGame.addEventListener('click', ()=>{ scores={player:0,ai:0}; updateScore(); resetBall(); pgLog('Owner started new game'); });
pgOwnerReloadApp && pgOwnerReloadApp.addEventListener('click', ()=>{ pgLog('Owner reloaded app'); location.reload(); });
pgOwnerKillSwitch && pgOwnerKillSwitch.addEventListener('click', ()=>{ if(!confirm('Owner kill switch: clear all localStorage and reload?')) return; localStorage.clear(); pgLog('Owner used kill switch'); location.reload(); });
pgOwnerForcePlayerWin && pgOwnerForcePlayerWin.addEventListener('click', ()=>{ scores.player+=1; updateScore(); resetBall(); pgLog('Owner forced player win'); });
pgOwnerForceAiWin && pgOwnerForceAiWin.addEventListener('click', ()=>{ scores.ai+=1; updateScore(); resetBall(); pgLog('Owner forced AI win'); });
pgOwnerViewLS && pgOwnerViewLS.addEventListener('click', ()=>{ const obj={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); try{ obj[k]=JSON.parse(localStorage.getItem(k)); }catch(e){ obj[k]=localStorage.getItem(k); } } pgOwnerLocalStorageEl.textContent = JSON.stringify(obj,null,2); pgLog('Owner viewed localStorage'); });
pgOwnerClearLS && pgOwnerClearLS.addEventListener('click', ()=>{ if(!confirm('Clear all localStorage?')) return; localStorage.clear(); pgOwnerLocalStorageEl.textContent=''; pgLog('Owner cleared localStorage'); });
pgOwnerClose && pgOwnerClose.addEventListener('click', ()=>{ pgOwnerPanel.classList.add('hidden'); pgOwnerAuth.classList.remove('hidden'); pgOwnerContents.classList.add('hidden'); pgLog('Owner locked'); });