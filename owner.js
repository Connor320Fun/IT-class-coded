// Owner panel client-side gate (NOT secure) - owner code: Bowling320Fun
(function(){
  const OWNER_CODE = 'Bowling320Fun';
  const authEl = document.getElementById('ownerAuth');
  const contents = document.getElementById('ownerContents');
  const output = document.getElementById('ownerOutput');

  function show(msg){
    output.textContent = msg;
  }

  function showObject(obj){
    output.textContent = JSON.stringify(obj,null,2);
  }

  function unlockUI(){
    authEl.classList.add('hidden');
    contents.classList.remove('hidden');
    localStorage.setItem('owner_unlocked','1');
    show('Owner unlocked');
  }

  function lockUI(){
    authEl.classList.remove('hidden');
    contents.classList.add('hidden');
    localStorage.removeItem('owner_unlocked');
    show('Locked');
  }

  // Init: if previously unlocked, show contents
  if(localStorage.getItem('owner_unlocked') === '1'){
    unlockUI();
  }

  document.getElementById('ownerUnlock').addEventListener('click', ()=>{
    const v = document.getElementById('ownerPassword').value || '';
    if(v === OWNER_CODE){ unlockUI(); }
    else { show('Invalid owner code'); }
  });

  // actions
  document.getElementById('ownerReload').addEventListener('click', ()=>{
    show('Reloading...');
    setTimeout(()=>location.reload(),250);
  });

  document.getElementById('ownerKill').addEventListener('click', ()=>{
    if(!confirm('Kill switch will clear localStorage and reload. Continue?')) return;
    localStorage.clear();
    show('localStorage cleared â€” reloading');
    setTimeout(()=>location.reload(),200);
  });

  document.getElementById('ownerViewLS').addEventListener('click', ()=>{
    const obj = {};
    for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); obj[k]=localStorage.getItem(k); }
    showObject(obj);
  });

  document.getElementById('ownerClearLS').addEventListener('click', ()=>{
    if(!confirm('Clear all localStorage?')) return; localStorage.clear(); show('localStorage cleared');
  });

  document.getElementById('ownerExportLS').addEventListener('click', ()=>{
    const obj = {}; for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); obj[k]=localStorage.getItem(k); }
    const data = JSON.stringify(obj,null,2);
    const blob = new Blob([data],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='localStorage-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    show('Export started');
  });

  document.getElementById('ownerSaveBroadcast').addEventListener('click', ()=>{
    const txt = document.getElementById('ownerBroadcastText').value || '';
    localStorage.setItem('owner_broadcast', txt);
    show('Broadcast saved');
  });
  document.getElementById('ownerClearBroadcast').addEventListener('click', ()=>{ localStorage.removeItem('owner_broadcast'); show('Broadcast cleared'); });

  document.getElementById('ownerSetBroadcast').addEventListener('click', ()=>{ const b = localStorage.getItem('owner_broadcast') || ''; show('Broadcast: '+b); });

  document.getElementById('ownerLock').addEventListener('click', ()=>{ lockUI(); });
})();

