// Only a visible public-library tab reports its user-chosen display name.
(()=>{
 if((new URLSearchParams(location.search).get('file')||'').startsWith('scores/personal/'))return;
 const api=window.PIANO_PRESENCE?.api;if(!api||/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.protocol!=='https:')return;
 const read=k=>{try{return localStorage.getItem(k)||''}catch{return''}};
 const random=()=>crypto.randomUUID().replaceAll('-','');
 let session;try{session=sessionStorage.getItem('piano-presence-session')||random();sessionStorage.setItem('piano-presence-session',session)}catch{session=random()}
 const instance=random();let paused=read('piano-presence-paused')==='1',sent=false,connected=false;
 const params=new URLSearchParams(location.search),row=(window.CATALOG?.rows||[]).find(r=>r.id===params.get('id'));
 const device=()=>/iPad/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1)?'iPad':/iPhone/.test(navigator.userAgent)?'iPhone':/Android/.test(navigator.userAgent)?'Android':/Windows/.test(navigator.userAgent)?'Windows':'Computer';
 function body(leave=false){return JSON.stringify({session,instance,leave,name:read('piano-visitor-id'),device:device(),title:row?.title||'Score library',page:row?Number(document.getElementById('page')?.value||1):0})}
 function leave(){if(!sent)return;sent=false;try{navigator.sendBeacon(api+'/heartbeat',new Blob([body(true)],{type:'text/plain;charset=UTF-8'}))}catch{}}
 async function heartbeat(){
  if(paused||document.visibilityState!=='visible'||!read('piano-visitor-id'))return;
  try{const r=await fetch(api+'/heartbeat',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:body(),credentials:'omit',cache:'no-store'});sent=r.ok;connected=r.ok;paint();if(document.visibilityState!=='visible')leave()}catch{connected=false;paint()}
 }
 const note=document.createElement('p');note.id='presenceNotice';note.style.cssText='font-size:11px;color:#737b70;text-align:center;margin:8px 12px';
 const text=document.createElement('span'),toggle=document.createElement('button');toggle.type='button';toggle.style.cssText='font:inherit;border:0;background:none;color:#315d50;text-decoration:underline;min-height:32px';
 function paint(){text.textContent=paused?'Online status sharing paused. ':connected?'Online status connected · visible only to the library owner. ':'Connecting online status… ';toggle.textContent=paused?'Resume':'Pause sharing'}
 toggle.onclick=()=>{paused=!paused;try{localStorage.setItem('piano-presence-paused',paused?'1':'0')}catch{}if(paused)leave();else heartbeat();paint()};note.append(text,toggle);document.body.append(note);paint();
 window.addEventListener('piano-visitor-changed',heartbeat);
 document.addEventListener('visibilitychange',()=>document.visibilityState==='visible'?heartbeat():leave());
 window.addEventListener('pagehide',leave);window.addEventListener('pageshow',heartbeat);
 window.addEventListener('online',heartbeat);setInterval(heartbeat,20_000);heartbeat();
})();
