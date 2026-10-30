// Who uses the library: asks for a name / ID once per device, then sends
// ID + device + page + version to the owner's Google Form (at most once a day).
// Configure in hosting-config.js:
//   window.PIANO_VISIT_LOG={action:'https://docs.google.com/forms/d/e/…/formResponse',
//                           fields:{id:'entry.1',device:'entry.2',version:'entry.3'}};
(()=>{
 if((new URLSearchParams(location.search).get('file')||'').startsWith('scores/personal/'))return;
 const cfg=window.PIANO_VISIT_LOG;
 if(!cfg||!cfg.action||!cfg.fields?.id)return;                                // not set up yet
 if(location.protocol==='file:'||/^(127\.0\.0\.1|localhost)$/.test(location.hostname))return;   // owner's own computer
 const read=k=>{try{return localStorage.getItem(k)||''}catch{return''}};
 const write=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 const device=()=>{const u=navigator.userAgent;
  if(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))return'iPad';
  if(/iPhone/.test(u))return'iPhone';if(/Android/.test(u))return/Mobile/.test(u)?'Android phone':'Android tablet';
  if(/Windows/.test(u))return'Windows';if(/Macintosh/.test(u))return'Mac';return'Other'};

 function send(id){
  window.dispatchEvent(new Event('piano-visitor-changed'));
  const today=new Date().toISOString().slice(0,10);
  if(read('piano-visit-day')===today+'|'+id)return;
  const body=new URLSearchParams();
  body.append(cfg.fields.id,id);
  if(cfg.fields.device)body.append(cfg.fields.device,device());
  if(cfg.fields.version)body.append(cfg.fields.version,(window.PIANO_VERSION?.version||'')+' · '+location.pathname.split('/').pop());
  fetch(cfg.action,{method:'POST',mode:'no-cors',body}).then(()=>write('piano-visit-day',today+'|'+id)).catch(()=>{});
 }

 function ask(onDone){
  const d=document.createElement('dialog');d.id='visitorDialog';
  d.style.cssText='border:0;border-radius:18px;padding:22px;max-width:min(92vw,420px);background:#fffdf8;color:#233c35;font:16px -apple-system,"Segoe UI","Microsoft JhengHei",sans-serif';
  d.innerHTML='<h2 style="margin:0 0 8px;font-size:20px">Welcome to Piano Library</h2>'+
   '<p style="line-height:1.7;margin:0 0 14px;color:#5d6b62">Please enter your name or ID. The library owner records visits and can see your name, device and current score while you are online. You can skip your name or pause online status sharing. You only need to do this once on this device.</p>'+
   '<input id="visitorId" maxlength="40" autocomplete="nickname" placeholder="Name or ID" style="width:100%;box-sizing:border-box;padding:14px;border:1px solid #d6d2c6;border-radius:10px;font-size:16px">'+
   '<div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end"><button id="visitorSkip" type="button" style="min-height:44px;padding:10px 14px;border:1px solid #d6d2c6;border-radius:10px;background:none;color:#233c35">Skip</button>'+
   '<button id="visitorOk" type="button" style="min-height:44px;padding:10px 16px;border:0;border-radius:10px;background:#233c35;color:#fff;font-weight:700">Continue</button></div>';
  document.body.append(d);
  const input=d.querySelector('#visitorId');input.value=read('piano-visitor-id');
  const finish=id=>{id=(id||'').trim().slice(0,40)||'(anonymous)';write('piano-visitor-id',id);d.close();d.remove();onDone(id)};
  d.querySelector('#visitorOk').onclick=()=>finish(input.value);
  d.querySelector('#visitorSkip').onclick=()=>finish('');
  input.onkeydown=e=>{if(e.key==='Enter')finish(input.value)};
  d.addEventListener('cancel',e=>e.preventDefault());
  d.showModal();setTimeout(()=>input.focus(),50);
 }
 window.PIANO_CHANGE_VISITOR_ID=()=>ask(send);

 const id=read('piano-visitor-id');
 if(id)send(id);else ask(send);
})();
