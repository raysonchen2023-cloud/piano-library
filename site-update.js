// Prepare UI updates automatically; let the reader choose when to apply them.
(()=>{
 const current=window.PIANO_VERSION||{version:'local',date:''};
 const tag=document.createElement('p');tag.className='site-version';tag.textContent=`Version ${current.version}${current.date?' · '+current.date:''}`;
 tag.style.cssText='margin:18px 0 0;font-size:11px;color:#9a9d91;text-align:center';
 const host=document.querySelector('.library-note')||document.querySelector('footer');
 if(host)host.after(tag);else{tag.style.cssText+=';position:fixed;left:8px;bottom:4px;margin:0;opacity:.7;z-index:1;pointer-events:none';document.body.append(tag)}
 window.PIANO_VERSION_LABEL=tag.textContent;
 if(current.version==='local'||location.protocol==='file:')return;
 const zh=()=>{try{return localStorage.getItem('piano-ui-language')==='zh-TW'}catch{return false}},L=(c,e)=>zh()?c:e;
 // Centered card like the xiangqi app: 🆕 title, release notes, version, buttons.
 function modal(title,note,version,buttons){
  const back=document.createElement('div');back.className='piano-update-modal';back.dataset.noTranslate='';back.setAttribute('role','dialog');back.setAttribute('aria-modal','true');
  back.style.cssText='position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;background:#0007';
  const card=document.createElement('div');card.style.cssText='box-sizing:border-box;width:100%;max-width:400px;max-height:85vh;overflow:auto;padding:24px 22px 18px;border-radius:20px;background:#fffdf8;color:#233c35;font:16px -apple-system,"Segoe UI","Microsoft JhengHei",sans-serif;text-align:center;box-shadow:0 10px 40px #0005';
  const em=document.createElement('div');em.textContent='🆕';em.style.cssText='font-size:44px;line-height:1';
  const h=document.createElement('h2');h.textContent=title;h.style.cssText='margin:10px 0 8px;font-size:21px';card.append(em,h);
  if(note){const n=document.createElement('p');n.textContent=note;n.style.cssText='margin:0 0 10px;text-align:left;white-space:pre-wrap;line-height:1.6';card.append(n)}
  const v=document.createElement('p');v.textContent=version;v.style.cssText='margin:0 0 16px;color:#6b776f;font-size:14px;line-height:1.5;white-space:pre-wrap';card.append(v);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
  const close=()=>back.remove();
  buttons.forEach(([text,act,plain])=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='min-height:46px;min-width:120px;padding:10px 18px;border-radius:12px;font:600 16px inherit;cursor:pointer;'+(plain?'border:1px solid #cfcabd;background:transparent;color:#233c35':'border:0;background:#233c35;color:#fff');b.onclick=()=>{close();act&&act()};row.append(b)});
  card.append(row);back.append(card);document.body.append(back);return back;
 }
 const vText=x=>L('版本 ','Version ')+x.version+(x.date?' · '+x.date:'');
 // Home-screen apps load the newest files straight away, so tell the reader once when the version changed.
 try{
  const u=new URL(location.href),fromButton=u.searchParams.get('v')===current.version;
  if(fromButton){u.searchParams.delete('v');history.replaceState(history.state,'',u.toString())}
  const seen=localStorage.getItem('piano-seen-version');localStorage.setItem('piano-seen-version',current.version);
  if(seen&&seen!==current.version)setTimeout(()=>modal(L('已更新到新版本','Updated to the new version'),current.note||'',vText(current)+'\n'+L('你的收藏、閱讀位置和設定都保留著。','Your favorites, reading places and settings are kept.'),[[L('好','OK')]]),600);
 }catch{}
 let checking=false,pending=null,ready=false,accepted=false,applying=false,lastInput=Date.now(),playing=false,lastTime=0,retry=null,notice,snoozedUntil=0,offeredVersion='';
 const status=text=>{if(!notice){notice=document.createElement('div');notice.id='automaticUpdateStatus';notice.setAttribute('role','status');notice.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:999;padding:12px 18px;border-radius:12px;background:#233c35;color:#fff;font:14px system-ui;max-width:90vw;box-shadow:0 4px 20px #0003';document.body.append(notice)}notice.textContent=text};
 const safe=()=>!document.body?.dataset?.personalImporting&&!document.body?.dataset?.feedbackSending&&!playing&&document.visibilityState==='visible'&&!document.querySelector('dialog[open]')&&document.getElementById('align')?.dataset?.editing!=='true'&&!document.getElementById('align')?.textContent.startsWith('Finish')&&Date.now()-lastInput>2500;
 function offer(){
  if(!ready||accepted||Date.now()<snoozedUntil||document.visibilityState!=='visible')return;
  if(offeredVersion===pending.version&&document.querySelector('.piano-update-modal'))return;
  offeredVersion=pending.version;if(notice)notice.hidden=true;
  modal(L('有新版本','New version available'),pending.note||'',vText(pending)+'\n'+L('更新後會回到現在這一頁，收藏和設定都保留。','You will return to this page. Favorites and settings are kept.'),
   [[L('立即更新','Update now'),()=>{accepted=true;apply()}],[L('稍後','Later'),()=>{snoozedUntil=Date.now()+30*60_000},true]]);
 }
 function apply(){
  if(!ready||!accepted||applying)return;
  if(!safe()){status(L('播放或編輯結束後會自動更新。','Update queued. It will apply when you finish playing or editing.'));clearTimeout(retry);retry=setTimeout(apply,2000);return}
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
   pending=next;status(L('正在下載新版本…','Downloading the latest Piano Library interface…'));
   const mr=await fetch('update-manifest.json?v='+encodeURIComponent(next.version),{cache:'no-store'});if(!mr.ok)throw Error('Manifest unavailable');const manifest=await mr.json();
   if(manifest.version!==next.version||!Array.isArray(manifest.files))throw Error('Publication not ready');
   // Only small application files, never the complete PDF/audio library.
   for(let n=0;n<manifest.files.length;n+=4)await Promise.all(manifest.files.slice(n,n+4).map(async file=>{
    if(!/^[A-Za-z0-9_-]+\.(?:html|js|css|json|webmanifest|png)$/.test(file)||file==='catalog.json')throw Error('Invalid update asset');
    const r=await fetch(file+'?v='+encodeURIComponent(next.version),{cache:'reload'});if(!r.ok)throw Error('Download incomplete');await r.arrayBuffer();
   }));
   ready=true;offer();
  }catch{if(notice&&!ready)notice.textContent=L('稍後會自動再試一次下載新版。','Update download will retry automatically.')}finally{checking=false}
 }
 window.addEventListener('piano-progress',e=>{playing=!!e.detail.playing;lastTime=e.detail.time||0;if(!playing&&ready)apply()});
 for(const event of ['pointerdown','keydown','input'])document.addEventListener(event,()=>{lastInput=Date.now()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(accepted)apply();check()}});
 window.addEventListener('online',check);window.addEventListener('pageshow',check);window.addEventListener('focus',check);setInterval(check,60_000);check();
})();
