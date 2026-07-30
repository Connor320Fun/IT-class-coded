(function(){
  const CODE = 'Bowling320Fun';
  const unlocked = localStorage.getItem('dev_unlocked') === '1';
  if(unlocked) return; // already unlocked

  const gameName = (document.querySelector('h1') && document.querySelector('h1').textContent.trim()) || document.title || 'This game';

  // build overlay
  const overlay = document.createElement('div');
  overlay.id = 'dev-gate-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
    background: 'rgba(0,0,0,0.85)', color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 99999,
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#0b1220', padding: '24px', borderRadius: '8px', width: 'min(640px, 90%)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', textAlign: 'center'
  });

  const title = document.createElement('h2');
  title.textContent = `${gameName} — Under development (testers only)`;
  title.style.margin = '0 0 12px 0';

  const desc = document.createElement('p');
  desc.textContent = 'This build is for testers only. Enter the tester code to play.';
  desc.style.margin = '0 0 16px 0';

  const input = document.createElement('input');
  input.type = 'password';
  input.placeholder = 'Enter tester code';
  Object.assign(input.style, { padding: '10px 12px', width: '70%', maxWidth: '360px', borderRadius: '6px', border: '1px solid #333', marginRight: '8px' });

  const btn = document.createElement('button');
  btn.textContent = 'Enter';
  Object.assign(btn.style, { padding: '10px 14px', borderRadius: '6px', border: 'none', background: '#2b8cff', color: '#fff', cursor: 'pointer' });

  const hint = document.createElement('div');
  hint.style.marginTop = '12px';
  hint.style.fontSize = '12px';
  hint.style.opacity = '0.9';
  hint.textContent = 'If you are not a tester, you will not be able to play.';

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(input);
  card.appendChild(btn);
  card.appendChild(hint);
  overlay.appendChild(card);
  document.documentElement.appendChild(overlay);

  // prevent interaction with page under overlay
  document.body.style.pointerEvents = 'none';
  overlay.style.pointerEvents = 'auto';

  function unlock(){
    localStorage.setItem('dev_unlocked','1');
    overlay.remove();
    document.body.style.pointerEvents = '';
  }

  btn.addEventListener('click', ()=>{
    const v = input.value || '';
    if(v === CODE){ unlock(); }
    else { alert('Incorrect tester code'); input.value = ''; input.focus(); }
  });

  input.addEventListener('keydown',(e)=>{ if(e.key === 'Enter') btn.click(); });

  // also show a small sticky note letting devs know how to unlock (invisible to normal users unless inspect)
  console.log(`Tester gate active for ${gameName}. Use code: ${CODE}`);
})();