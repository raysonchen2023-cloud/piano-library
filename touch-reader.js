(()=>{
 const params=new URLSearchParams(location.search);if(params.get('mode')!=='app')return;
 document.body.classList.add('app-reading','score-focus');
 const $=id=>document.getElementById(id),row=(window.CATALOG?.rows||[]).find(r=>r.id===params.get('id'));
 const bar=document.createElement('nav');bar.id='touchReaderToolbar';bar.setAttribute('aria-label','Score controls');
 const home=document.createElement('a');home.href='app.html';home.textContent='‹ Library';
 const prev=document.createElement('button');prev.textContent='Previous';prev.onclick=()=>$('prev').click();
 const play=document.createElement('button');play.textContent='Play';play.onclick=()=>{if($('performance').options.length===0){$('play').click();return}if(!$('pause').disabled)$('pause').click();else $('play').click()};
 const next=document.createElement('button');next.textContent='Next';next.onclick=()=>$('next').click();
 const tools=document.createElement('button');tools.textContent='Tools';tools.onclick=()=>sheet(!$('surface').classList.contains('sheet-visible'));
 bar.append(home,prev,play,next,tools);document.body.append(bar);
 const heading=document.createElement('div');heading.id='touchReaderHeading';heading.textContent=row?.title||'Score';document.body.append(heading);
 const page=document.createElement('small');page.id='touchReaderPage';document.body.append(page);
 const close=document.createElement('button');close.textContent='Close panel ⌄';close.className='close-reader-sheet';close.onclick=()=>sheet(false);document.querySelector('.player').prepend(close);
 function sheet(open){document.querySelector('.player').classList.toggle('sheet-open',open);$('surface').classList.toggle('sheet-visible',open);tools.setAttribute('aria-expanded',String(open))}
 function refresh(){prev.disabled=$('prev').disabled;next.disabled=$('next').disabled;play.textContent=$('performance').options.length===0?'YouTube':!$('pause').disabled?'Pause':'Play';page.textContent=$('page').value+' / '+$('total').textContent}
 for(const id of ['prev','next','play','pause'])new MutationObserver(refresh).observe($(id),{attributes:true,attributeFilter:['disabled']});
 window.addEventListener('score-rendered',e=>{refresh();if(!row)return;try{let recent=JSON.parse(localStorage.getItem('piano-reader-history')||'[]');recent=recent.filter(r=>r.id!==row.id);recent.unshift({id:row.id,page:e.detail.page,at:Date.now()});localStorage.setItem('piano-reader-history',JSON.stringify(recent.slice(0,30)))}catch{}});
 refresh();window.dispatchEvent(new Event('reader-resize'));
 let start=null;
 $('surface').addEventListener('touchstart',e=>{if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};else start=null},{passive:true});
 $('surface').addEventListener('touchend',e=>{if(!start||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>80&&Math.abs(dy)<45){if(dx<0)$('next').click();else $('prev').click()}},{passive:true});
})();
