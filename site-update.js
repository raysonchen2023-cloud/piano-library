// Version label + "new version available" prompt.
// version.js (loaded before this file) says which version this page is;
// version.json on the server says the newest one. Checked on open, when the app
// comes back to the foreground, and every 10 minutes.
(()=>{
 const current=window.PIANO_VERSION||{version:'local',date:''};
 const label=`Version ${current.version}${current.date?' · '+current.date:''}`;

 // Show the version on every page.
 const tag=document.createElement('p');tag.className='site-version';tag.textContent=label;
 tag.style.cssText='margin:18px 0 0;font-size:11px;color:#9a9d91;text-align:center';
 const host=document.querySelector('.library-note')||document.querySelector('footer');
 if(host)host.after(tag);else{tag.style.cssText+=';position:fixed;left:8px;bottom:4px;margin:0;opacity:.7;z-index:1;pointer-events:none';document.body.append(tag)}
 window.PIANO_VERSION_LABEL=label;

 if(current.version==='local'||location.protocol==='file:')return;   // only the published site updates itself
 let shown=false;
 function banner(next){
  if(shown)return;shown=true;
  const bar=document.createElement('div');bar.setAttribute('role','alert');
  bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:max(10px,env(safe-area-inset-top));z-index:1000;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:94vw;padding:12px 14px;border-radius:14px;background:#233c35;color:#fff;box-shadow:0 8px 30px #0005;font:15px -apple-system,"Segoe UI","Microsoft JhengHei",sans-serif';
  const text=document.createElement('span');text.textContent=`New version ${next.version}${next.date?' ('+next.date+')':''} is available`;
  const go=document.createElement('button');go.textContent='Update now';
  go.style.cssText='border:0;border-radius:10px;padding:10px 14px;background:#f3ead9;color:#233c35;font-weight:700;min-height:44px';
  go.onclick=()=>{const u=new URL(location.href);u.searchParams.set('v',next.version);location.replace(u.toString())};
  const later=document.createElement('button');later.textContent='Later';
  later.style.cssText='border:1px solid #fff6;border-radius:10px;padding:10px 12px;background:none;color:#fff;min-height:44px';
  later.onclick=()=>{bar.remove();shown=false;snoozed=next.version};
  bar.append(text,go,later);document.body.append(bar);
 }
 let snoozed='';
 async function check(){
  try{
   const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
   const next=await r.json();
   if(next.version&&next.version!==current.version&&next.version!==snoozed)banner(next);
  }catch{}
 }
 check();
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
 setInterval(check,10*60*1000);
})();
