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
 const dialog=document.createElement('dialog');dialog.id='shareDialog';
 const title=document.createElement('h2');title.textContent='Phone / iPad Open score library';
 const img=document.createElement('img');img.src='mobile-entry-qr.png';img.alt='QR code for the score app';
 const link=document.createElement('a');link.href=window.PIANO_HOSTING?.url||location.origin;link.textContent=link.href;link.target='_blank';link.rel='noopener';
 const info=document.createElement('p');info.textContent='Scan with your iPhone or iPad camera. No sign-in is needed. Use Wi-Fi or mobile data; this computer does not need to stay on.';
 const copy=document.createElement('button');copy.textContent='Copy link';copy.onclick=async()=>{try{await navigator.clipboard.writeText(link.href);copy.textContent='Copied'}catch{copy.textContent='Press and hold the link to copy it'}};
 const close=document.createElement('button');close.textContent='Close';close.onclick=()=>dialog.close();
 dialog.append(title,img,link,info,copy,close);document.body.append(dialog);button.onclick=()=>dialog.showModal();
})();
