// Prepare UI updates automatically; let the reader choose when to apply them.
(()=>{
 const current=window.PIANO_VERSION||{version:'local',date:''};
 const tag=document.createElement('p');tag.className='site-version';tag.textContent=`Version ${current.version}${current.date?' · '+current.date:''}`;
 tag.style.cssText='margin:18px 0 0;font-size:11px;color:#9a9d91;text-align:center';
 const host=document.querySelector('.library-note')||document.querySelector('footer');
 if(host)host.after(tag);else{tag.style.cssText+=';position:fixed;left:8px;bottom:4px;margin:0;opacity:.7;z-index:1;pointer-events:none';document.body.append(tag)}
 window.PIANO_VERSION_LABEL=tag.textContent;
 if(current.version==='local'||location.protocol==='file:')return;
 let checking=false,pending=null,ready=false,accepted=false,applying=false,lastInput=Date.now(),playing=false,lastTime=0,retry=null,notice,snoozedUntil=0,offeredVersion='';
 const status=text=>{if(!notice){notice=document.createElement('div');notice.id='automaticUpdateStatus';notice.setAttribute('role','status');notice.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:999;padding:12px 18px;border-radius:12px;background:#233c35;color:#fff;font:14px system-ui;max-width:90vw;box-shadow:0 4px 20px #0003';document.body.append(notice)}notice.textContent=text};
 const safe=()=>!document.body?.dataset?.personalImporting&&!playing&&document.visibilityState==='visible'&&!document.querySelector('dialog[open]')&&!document.getElementById('align')?.textContent.startsWith('Finish')&&Date.now()-lastInput>2500;
 function offer(){
  if(!ready||accepted||Date.now()<snoozedUntil||document.visibilityState!=='visible')return;
  if(offeredVersion===pending.version&&notice&&!notice.hidden)return;
  offeredVersion=pending.version;status('');notice.hidden=false;notice.replaceChildren();
  notice.style.cssText='position:fixed;bottom:calc(82px + env(safe-area-inset-bottom, 0px));left:50%;transform:translateX(-50%);z-index:9999;box-sizing:border-box;width:calc(100% - 24px);max-width:420px;padding:18px;border-radius:16px;background:#233c35;color:#fff;font:15px system-ui;box-shadow:0 6px 28px #0005';
  notice.setAttribute('role','region');notice.setAttribute('aria-live','polite');notice.setAttribute('aria-label','Piano Library update');
  const title=document.createElement('strong');title.textContent='New version available';
  const detail=document.createElement('p');detail.textContent=`Version ${pending.version} is ready. Your page and playback position will be kept.`;detail.style.cssText='margin:8px 0 14px;line-height:1.5';
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:12px;flex-wrap:wrap';
  const update=document.createElement('button');update.type='button';update.textContent='Update now';update.style.cssText='min-height:44px;padding:10px 20px;border:0;border-radius:10px;background:#fff;color:#233c35;font:600 15px system-ui;cursor:pointer';
  const later=document.createElement('button');later.type='button';later.textContent='Later';later.style.cssText='min-height:44px;padding:10px 20px;border:1px solid #ffffff80;border-radius:10px;background:transparent;color:#fff;font:15px system-ui;cursor:pointer';
  update.addEventListener('click',()=>{accepted=true;apply()});
  later.addEventListener('click',()=>{snoozedUntil=Date.now()+30*60_000;notice.hidden=true});
  actions.append(update,later);notice.append(title,detail,actions);
 }
 function apply(){
  if(!ready||!accepted||applying)return;
  if(!safe()){status('Update queued. It will apply when you finish playing or editing.');clearTimeout(retry);retry=setTimeout(apply,2000);return}
  applying=true;
  try{const file=new URLSearchParams(location.search).get('file');if(file)sessionStorage.setItem('piano-update-restore',JSON.stringify({file,performance:document.getElementById('performance')?.value,time:lastTime,speed:Number(document.getElementById('speed')?.value||1),volume:Number(document.getElementById('volume')?.value||.45)}))}catch{}
  const url=new URL(location.href),page=document.getElementById('page');if(page)url.searchParams.set('page',page.value);url.searchParams.set('v',pending.version);location.replace(url.toString());
 }
 async function check(){
  if(checking||applying||document.visibilityState==='hidden')return;checking=true;
  try{
   const response=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!response.ok)return;const next=await response.json();
   if(!next.version||next.version===current.version)return;
   if(pending?.version===next.version&&ready){offer();return}
   ready=false;accepted=false;offeredVersion='';snoozedUntil=0;
   pending=next;status('Downloading the latest Piano Library interface…');
   const mr=await fetch('update-manifest.json?v='+encodeURIComponent(next.version),{cache:'no-store'});if(!mr.ok)throw Error('Manifest unavailable');const manifest=await mr.json();
   if(manifest.version!==next.version||!Array.isArray(manifest.files))throw Error('Publication not ready');
   // Only small application files, never the complete PDF/audio library.
   for(let n=0;n<manifest.files.length;n+=4)await Promise.all(manifest.files.slice(n,n+4).map(async file=>{
    if(!/^[A-Za-z0-9_-]+\.(?:html|js|css|json|webmanifest|png)$/.test(file)||file==='catalog.json')throw Error('Invalid update asset');
    const r=await fetch(file+'?v='+encodeURIComponent(next.version),{cache:'reload'});if(!r.ok)throw Error('Download incomplete');await r.arrayBuffer();
   }));
   ready=true;offer();
  }catch{if(notice&&!ready)notice.textContent='Update download will retry automatically.'}finally{checking=false}
 }
 window.addEventListener('piano-progress',e=>{playing=!!e.detail.playing;lastTime=e.detail.time||0;if(!playing&&ready)apply()});
 for(const event of ['pointerdown','keydown','input'])document.addEventListener(event,()=>{lastInput=Date.now()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(accepted)apply();check()}});
 window.addEventListener('online',check);window.addEventListener('focus',check);setInterval(check,60_000);check();
})();
