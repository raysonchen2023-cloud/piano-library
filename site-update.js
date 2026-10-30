// Download UI updates automatically, then reload only when the reader is idle.
(()=>{
 const current=window.PIANO_VERSION||{version:'local',date:''};
 const tag=document.createElement('p');tag.className='site-version';tag.textContent=`Version ${current.version}${current.date?' · '+current.date:''}`;
 tag.style.cssText='margin:18px 0 0;font-size:11px;color:#9a9d91;text-align:center';
 const host=document.querySelector('.library-note')||document.querySelector('footer');
 if(host)host.after(tag);else{tag.style.cssText+=';position:fixed;left:8px;bottom:4px;margin:0;opacity:.7;z-index:1;pointer-events:none';document.body.append(tag)}
 window.PIANO_VERSION_LABEL=tag.textContent;
 if(current.version==='local'||location.protocol==='file:')return;
 let checking=false,pending=null,ready=false,applying=false,lastInput=Date.now(),playing=false,lastTime=0,retry=null,notice;
 const status=text=>{if(!notice){notice=document.createElement('div');notice.id='automaticUpdateStatus';notice.setAttribute('role','status');notice.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:999;padding:12px 18px;border-radius:12px;background:#233c35;color:#fff;font:14px system-ui;max-width:90vw;box-shadow:0 4px 20px #0003';document.body.append(notice)}notice.textContent=text};
 const safe=()=>!playing&&document.visibilityState==='visible'&&!document.querySelector('dialog[open]')&&!document.getElementById('align')?.textContent.startsWith('Finish')&&Date.now()-lastInput>2500;
 function apply(){
  if(!ready||applying)return;
  if(!safe()){status('Update downloaded. It will apply automatically when you finish playing or editing.');clearTimeout(retry);retry=setTimeout(apply,2000);return}
  applying=true;
  try{const file=new URLSearchParams(location.search).get('file');if(file)sessionStorage.setItem('piano-update-restore',JSON.stringify({file,performance:document.getElementById('performance')?.value,time:lastTime,speed:Number(document.getElementById('speed')?.value||1),volume:Number(document.getElementById('volume')?.value||.45)}))}catch{}
  const url=new URL(location.href),page=document.getElementById('page');if(page)url.searchParams.set('page',page.value);url.searchParams.set('v',pending.version);location.replace(url.toString());
 }
 async function check(){
  if(checking||applying||document.visibilityState==='hidden')return;checking=true;
  try{
   const response=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!response.ok)return;const next=await response.json();
   if(!next.version||next.version===current.version)return;
   pending=next;status('Downloading the latest Piano Library interface…');
   const mr=await fetch('update-manifest.json?v='+encodeURIComponent(next.version),{cache:'no-store'});if(!mr.ok)throw Error('Manifest unavailable');const manifest=await mr.json();
   if(manifest.version!==next.version||!Array.isArray(manifest.files))throw Error('Publication not ready');
   // Only small application files, never the complete PDF/audio library.
   for(let n=0;n<manifest.files.length;n+=4)await Promise.all(manifest.files.slice(n,n+4).map(async file=>{
    if(!/^[A-Za-z0-9_-]+\.(?:html|js|css|json|webmanifest|png)$/.test(file)||file==='catalog.json')throw Error('Invalid update asset');
    const r=await fetch(file+'?v='+encodeURIComponent(next.version),{cache:'reload'});if(!r.ok)throw Error('Download incomplete');await r.arrayBuffer();
   }));
   ready=true;apply();
  }catch{if(notice)notice.textContent='Update download will retry automatically.'}finally{checking=false}
 }
 window.addEventListener('piano-progress',e=>{playing=!!e.detail.playing;lastTime=e.detail.time||0;if(!playing&&ready)apply()});
 for(const event of ['pointerdown','keydown','input'])document.addEventListener(event,()=>{lastInput=Date.now()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(ready)apply();else check()}});
 window.addEventListener('online',check);window.addEventListener('focus',check);setInterval(check,60_000);check();
})();
