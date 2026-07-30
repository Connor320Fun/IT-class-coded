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