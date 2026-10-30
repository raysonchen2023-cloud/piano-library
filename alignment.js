(()=>{
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),file=params.get('file');
 const overlay=$('barOverlay'),NS='http://www.w3.org/2000/svg';let page=1,state={time:0,bar:1,barStart:0},marks={},editing=false,corner=null,activeId='',currentKey='';
 try{marks=JSON.parse(localStorage.getItem('piano-bar-alignments-v1')||'{}')||{}}catch{}

 const display={hideGuides:true,highlight:true};
 try{const saved=JSON.parse(localStorage.getItem('piano-measure-display-v1')||'{}');if(typeof saved.hideGuides==='boolean')display.hideGuides=saved.hideGuides;if(typeof saved.highlight==='boolean')display.highlight=saved.highlight}catch{}
 $('hideMeasureGuides').checked=display.hideGuides;$('highlightMeasure').checked=display.highlight;
 function displayChanged(){display.hideGuides=$('hideMeasureGuides').checked;display.highlight=$('highlightMeasure').checked;try{localStorage.setItem('piano-measure-display-v1',JSON.stringify(display))}catch{}paint()}
 $('hideMeasureGuides').onchange=displayChanged;$('highlightMeasure').onchange=displayChanged;
 const key=()=>JSON.stringify([file,$('performance').value]);
 let timeline=new Map(),timelineId='',lastScrolledId='';
 const entries=()=>{
  const list=marks[key()]||window.AUTO_ALIGNMENTS?.[key()]||[];
  return list.map(m=>m.auto&&timelineId===$('performance').value&&timeline.has(m.number)?{...m,time:timeline.get(m.number)}:m);
 };
 window.addEventListener('piano-loaded',e=>{timelineId=e.detail.performanceId;timeline=new Map((e.detail.bars||[]).map(b=>[b.number,b.time]));activeId='';paint()});
 function save(){try{localStorage.setItem('piano-bar-alignments-v1',JSON.stringify(marks))}catch{$('alignStatus').textContent='Unable to save locally. Export an alignment backup.'}}
 function paint(){
  overlay.replaceChildren();
  // Repeats revisit the same printed box. Draw it once so a later blue
  // repeat marker cannot paint over the active orange cursor.
  const boxes=new Map();
  for(const m of entries().filter(m=>m.page===page)){
   const k=[m.x,m.y,m.w,m.h].map(n=>Number(n).toFixed(5)).join(',');const prior=boxes.get(k);
   if(!prior||m.id===activeId||(prior.id!==activeId&&Math.abs(m.time-state.time)<Math.abs(prior.time-state.time)))boxes.set(k,m);
  }
  const list=[...boxes.values()];
  for(const m of list){
   const active=display.highlight&&m.id===activeId;
   const rect=document.createElementNS(NS,'rect');rect.setAttribute('x',m.x*1000);rect.setAttribute('y',m.y*1000);rect.setAttribute('width',m.w*1000);rect.setAttribute('height',m.h*1000);rect.setAttribute('fill','transparent');rect.setAttribute('stroke',editing?'#5f8c7c':active?'#d74a00':'none');rect.setAttribute('stroke-width',active?'1.5':'1');rect.setAttribute('vector-effect','non-scaling-stroke');rect.style.mixBlendMode='multiply';rect.style.cursor='pointer';rect.onclick=e=>{if(editing)return;e.stopPropagation();window.dispatchEvent(new CustomEvent('piano-seek',{detail:{time:m.time}}))};overlay.append(rect);
   if(!editing&&display.hideGuides&&!active)continue;
   const line=document.createElementNS(NS,'line');line.setAttribute('x1',m.x*1000);line.setAttribute('x2',m.x*1000);line.setAttribute('y1',m.y*1000);line.setAttribute('y2',(m.y+m.h)*1000);line.setAttribute('stroke',active?'#d74a00':'#24709b');line.setAttribute('stroke-width',active?'1.5':'1');line.setAttribute('stroke-dasharray',active?'':'7 5');line.setAttribute('vector-effect','non-scaling-stroke');line.style.pointerEvents='none';line.style.mixBlendMode='multiply';line.setAttribute('opacity',active?'.8':'.45');if(active)line.setAttribute('data-active','true');overlay.append(line);
  }
  overlay.style.pointerEvents=editing||list.length?'auto':'none';
  followCursor();
 }
 function followCursor(){
  if(!state.playing||editing||!$('followPage').checked||!activeId||activeId===lastScrolledId)return;
  const line=overlay.querySelector('[data-active]');if(!line)return;
  lastScrolledId=activeId;const r=line.getBoundingClientRect();
  if(r.top<85||r.bottom>window.innerHeight-90)line.scrollIntoView({block:'center',behavior:'smooth'});
 }
 function progress(detail){
  state=detail;const list=entries().slice().sort((a,b)=>a.time-b.time);let current=list.filter(m=>m.time<=detail.time+.001).at(-1);
  const id=current?.id||'';
  $('barNow').textContent=current?'Measure '+(current.printedNumber??current.number)+'（'+(/^(oa-|auto-)/.test(current.id||'')?'Estimated scan alignment':current.auto?'Auto-aligned':'Aligned')+'）':'Reference measure '+detail.bar+' measure（Not aligned to this edition）';
  const readout=$('measureReadout');if(readout)readout.textContent=$('barNow').textContent;
  window.dispatchEvent(new CustomEvent('score-measure-state',{detail:{number:current?.printedNumber??current?.number??null,referenceNumber:detail.bar}}));
  if(current&&$('followPage').checked&&current.page!==page&&!editing){window.dispatchEvent(new CustomEvent('score-goto',{detail:{page:current.page}}))}
  if(id!==activeId||currentKey!==key()){activeId=id;currentKey=key();paint()}
 followCursor();
 if(!editing){$('alignBar').value=current?.number||detail.bar;$('alignTime').value=Number(detail.barStart||0).toFixed(2)}
 }
 window.addEventListener('piano-progress',e=>progress(e.detail));
 window.addEventListener('score-rendered',e=>{page=e.detail.page;paint()});
 $('performance').addEventListener('change',()=>{activeId='';currentKey=key();paint()});
 $('align').onclick=()=>{editing=!editing;corner=null;$('align').textContent=editing?'Finish marking':'Mark a measure';$('alignStatus').textContent=editing?'Set the measure number and start time, then select its top-left and bottom-right corners, including both staves.':'Measure marking closed.';paint()};
 overlay.onclick=e=>{
  if(!editing)return;const r=overlay.getBoundingClientRect(),p={x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};
  if(!corner){corner=p;$('alignStatus').textContent='Top-left selected. Now select the bottom-right corner.';return}
  const x=Math.min(corner.x,p.x),y=Math.min(corner.y,p.y),w=Math.abs(corner.x-p.x),h=Math.abs(corner.y-p.y);corner=null;
  if(w<.01||h<.01){$('alignStatus').textContent='Selection too small. Please mark the measure again.';return}
  const number=Math.max(1,Math.round(Number($('alignBar').value)||1)),time=Math.max(0,Number($('alignTime').value)||0);
  const list=entries();list.push({id:String(Date.now())+'-'+Math.random().toString(36).slice(2),number,time,page,x,y,w,h});marks[key()]=list;save();paint();$('alignStatus').textContent=`Saved measure ${number} measure，${page} page, start ${time.toFixed(2)}  seconds. Continue marking Other worksmeasure。`;$('alignBar').value=number+1;
 };
 $('undoAlign').onclick=()=>{const list=entries();list.pop();marks[key()]=list;save();paint();$('alignStatus').textContent='Last measure marker removed.'};
 $('exportAlign').onclick=()=>{const data={version:1,file,performanceId:$('performance').value,markers:entries()};const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='piano-measure-alignment.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 $('importAlign').onclick=()=>$('alignmentFile').click();
 $('alignmentFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(data.file!==file||data.performanceId!==$('performance').value||!Array.isArray(data.markers)||data.markers.some(m=>!Number.isFinite(m.time)||!Number.isInteger(m.page)||m.page<1||!Number.isFinite(m.x)||m.x<0||m.x>1||!Number.isFinite(m.y)||m.y<0||m.y>1||!Number.isFinite(m.w)||m.w<=0||m.w>1||!Number.isFinite(m.h)||m.h<=0||m.h>1||!Number.isInteger(m.number)||m.number<1))throw Error();marks[key()]=data.markers;save();paint();$('alignStatus').textContent='Alignment imported.'}catch{$('alignStatus').textContent='This alignment does not match the selected score and playback edition.'}e.target.value=''};
 paint();
})();
