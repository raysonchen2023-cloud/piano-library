(()=>{
 const isReader=!!document.getElementById('canvas');
 if(isReader){
  const setMobile=()=>document.body.classList.toggle('reader-mobile',matchMedia('(max-width:1100px), (pointer:coarse)').matches);setMobile();window.addEventListener('resize',setMobile);
  const focus=document.getElementById('focusMode'),exit=document.getElementById('focusExit');
  const navigation=document.createElement('nav');navigation.id='focusNavigation';navigation.setAttribute('aria-label','Full-screen page controls');
  const before=document.createElement('button');before.textContent='‹ Previous';before.onclick=()=>document.getElementById('prev').click();
  const after=document.createElement('button');after.textContent='Next ›';after.onclick=()=>document.getElementById('next').click();
  navigation.append(before,after);document.body.append(navigation);
  const refresh=()=>{before.disabled=document.getElementById('prev').disabled;after.disabled=document.getElementById('next').disabled};
  new MutationObserver(refresh).observe(document.getElementById('prev'),{attributes:true,attributeFilter:['disabled']});new MutationObserver(refresh).observe(document.getElementById('next'),{attributes:true,attributeFilter:['disabled']});refresh();
  const toggle=on=>{document.body.classList.toggle('score-focus',on);focus.setAttribute('aria-pressed',String(on));window.dispatchEvent(new Event('reader-resize'))};
  focus.onclick=async()=>{toggle(true);if(document.documentElement.requestFullscreen){try{await document.documentElement.requestFullscreen()}catch{}}};
  exit.onclick=()=>{toggle(false);if(document.fullscreenElement)document.exitFullscreen?.()};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
 }
 const button=document.getElementById('shareMobile');if(!button)return;
 button.setAttribute('aria-label','Share the piano library');
 const url=window.PIANO_HOSTING?.url||location.origin;
 const dialog=document.createElement('dialog');dialog.id='shareDialog';
 const title=document.createElement('h2');title.textContent='Share Piano Library';
 const img=document.createElement('img');img.src='mobile-entry-qr.png';img.alt='QR code for the piano library';
 const info=document.createElement('p');info.textContent='Anyone can scan this QR code with an iPhone, iPad or Android camera. No sign-in is needed, on Wi-Fi or mobile data.';
 const link=document.createElement('a');link.href=url;link.textContent=url;link.target='_blank';link.rel='noopener';
 const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
 const mk=(text,fn,primary)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;if(primary)b.style.cssText='background:#233c35;color:#fff;border:0;border-radius:10px';row.append(b);return b};
 if(navigator.share)mk('Share…',async()=>{try{await navigator.share({title:'Piano Library',text:'Piano Library — free piano scores with playback',url})}catch{}},true);
 mk('Send via LINE',()=>window.open('https://line.me/R/share?text='+encodeURIComponent('Piano Library 鋼琴譜 '+url),'_blank','noopener'),!navigator.share);
 const copy=mk('Copy link',async()=>{try{await navigator.clipboard.writeText(url);copy.textContent='Copied'}catch{copy.textContent='Press and hold the link to copy it'}});
 if(window.PIANO_VISIT_LOG?.action)mk('Change my name',()=>{dialog.close();window.PIANO_CHANGE_VISITOR_ID?.()});
 const owner=document.createElement('a');owner.href='online.html';owner.textContent='Online viewers (owner)';owner.style.cssText='display:block;margin-top:14px';
 mk('Close',()=>dialog.close());
 const version=document.createElement('p');version.style.cssText='font-size:12px;color:#8a8d80;margin:14px 0 0';
 dialog.append(title,img,info,link,row,version,owner);document.body.append(dialog);
 button.onclick=()=>{version.textContent=window.PIANO_VERSION_LABEL||'';dialog.showModal()};
})();
