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
 const fit=document.createElement('button');fit.id='touchReaderFit';const fitLabel=()=>{fit.textContent=$('zoom').value==='page'?'Fit width':'Whole page'};fit.onclick=()=>{$('zoom').value=$('zoom').value==='page'?'fit':'page';$('zoom').dispatchEvent(new Event('change'));fitLabel()};
 bar.append(home,prev,play,next,fit,tools);fitLabel();$('zoom').addEventListener('change',fitLabel);document.body.append(bar);
 const heading=document.createElement('div');heading.id='touchReaderHeading';const headingTitle=document.createElement('span');headingTitle.textContent=row?.title||'Score';headingTitle.className='reader-title';heading.append(headingTitle);document.body.append(heading);
 const measure=document.createElement('strong');measure.id='touchReaderMeasure';measure.textContent='m. —';measure.setAttribute('aria-live','polite');heading.append(measure);
 window.addEventListener('score-measure-state',e=>{const text=e.detail.number!==null?'m. '+e.detail.number:'Ref. m. '+e.detail.referenceNumber;if(measure.textContent!==text)measure.textContent=text});
 const page=document.createElement('small');page.id='touchReaderPage';heading.append(page);
 const close=document.createElement('button');close.textContent='Close panel ⌄';close.className='close-reader-sheet';close.onclick=()=>sheet(false);document.querySelector('.player').prepend(close);
 const fitRow=document.createElement('label');fitRow.className='reader-fit';fitRow.style.cssText='display:flex;align-items:center;gap:8px;margin:6px 0 12px;font-size:14px';fitRow.textContent='Page view ';const fitSel=document.createElement('select');fitSel.style.cssText='min-height:40px;padding:6px 8px;border-radius:8px';for(const [v,t] of [['page','Whole page'],['fit','Fit width'],['1.5','150%']]){fitSel.append(new Option(t,v))}fitSel.value=$('zoom').value;fitSel.onchange=()=>{$('zoom').value=fitSel.value;$('zoom').dispatchEvent(new Event('change'))};fitRow.append(fitSel);close.after(fitRow);window.addEventListener('score-rendered',()=>{fitSel.value=$('zoom').value;fitLabel()});
 function sheet(open){document.querySelector('.player').classList.toggle('sheet-open',open);$('surface').classList.toggle('sheet-visible',open);tools.setAttribute('aria-expanded',String(open))}
 function refresh(){prev.disabled=$('prev').disabled;next.disabled=$('next').disabled;play.textContent=$('performance').options.length===0?'YouTube':!$('pause').disabled?'Pause':'Play';page.textContent=$('page').value+' / '+$('total').textContent}
 for(const id of ['prev','next','play','pause'])new MutationObserver(refresh).observe($(id),{attributes:true,attributeFilter:['disabled']});
 window.addEventListener('score-rendered',e=>{refresh();if(!row)return;try{let recent=JSON.parse(localStorage.getItem('piano-reader-history')||'[]');recent=recent.filter(r=>r.id!==row.id);recent.unshift({id:row.id,page:e.detail.page,at:Date.now()});localStorage.setItem('piano-reader-history',JSON.stringify(recent.slice(0,30)))}catch{}});
 refresh();window.dispatchEvent(new Event('reader-resize'));
 if(window.ResizeObserver){let last='';new ResizeObserver(()=>{const s=$('surface'),k=s.clientWidth+'x'+s.clientHeight;if(k!==last){const first=!last;last=k;if(!first)window.dispatchEvent(new Event('reader-resize'))}}).observe($('surface'))}
 let start=null;
 $('surface').addEventListener('touchstart',e=>{if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};else start=null},{passive:true});
 $('surface').addEventListener('touchend',e=>{if(!start||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>80&&Math.abs(dy)<45){if(dx<0)$('next').click();else $('prev').click()}},{passive:true});
})();
