(()=>{
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),file=params.get('file');
 const overlay=$('barOverlay'),NS='http://www.w3.org/2000/svg';let page=1,state={time:0,bar:1,barStart:0},marks={},editing=false,corner=null,activeId='',currentKey='';
 try{marks=JSON.parse(localStorage.getItem('piano-bar-alignments-v1')||'{}')||{}}catch{}
 const key=()=>JSON.stringify([file,$('performance').value]);
 const entries=()=>marks[key()]||window.AUTO_ALIGNMENTS?.[key()]||[];
 function save(){try{localStorage.setItem('piano-bar-alignments-v1',JSON.stringify(marks))}catch{$('alignStatus').textContent='Unable to save locally. Export an alignment backup.'}}
 function paint(){
  overlay.replaceChildren();
  const list=entries().filter(m=>m.page===page);
  for(const m of list){
   const rect=document.createElementNS(NS,'rect');rect.setAttribute('x',m.x*1000);rect.setAttribute('y',m.y*1000);rect.setAttribute('width',m.w*1000);rect.setAttribute('height',m.h*1000);rect.setAttribute('fill',m.id===activeId?'#ffd84d55':'transparent');rect.setAttribute('stroke',editing?'#5f8c7c':'none');rect.setAttribute('stroke-width',m.id===activeId?'3':'1');rect.style.cursor='pointer';rect.onclick=e=>{if(editing)return;e.stopPropagation();window.dispatchEvent(new CustomEvent('piano-seek',{detail:{time:m.time}}))};overlay.append(rect);
   const label=document.createElementNS(NS,'text');label.setAttribute('x',m.x*1000+4);label.setAttribute('y',m.y*1000+14);label.setAttribute('font-size','13');label.setAttribute('fill','#72500e');label.textContent='m. '+(m.printedNumber??m.number);overlay.append(label);
   const line=document.createElementNS(NS,'line');line.setAttribute('x1',m.x*1000);line.setAttribute('x2',m.x*1000);line.setAttribute('y1',m.y*1000);line.setAttribute('y2',(m.y+m.h)*1000);line.setAttribute('stroke',m.id===activeId?'#d74a00':'#24709b');line.setAttribute('stroke-width',m.id===activeId?'4':'2');line.setAttribute('stroke-dasharray',m.id===activeId?'':'7 5');line.setAttribute('vector-effect','non-scaling-stroke');line.style.pointerEvents='none';overlay.append(line);
   label.setAttribute('paint-order','stroke');label.setAttribute('stroke','white');label.setAttribute('stroke-width','4');label.setAttribute('font-weight','bold');label.setAttribute('fill',m.id===activeId?'#ad3500':'#165779');
  }
  overlay.style.pointerEvents=editing||list.length?'auto':'none';
 }
 function progress(detail){
  state=detail;const list=entries().slice().sort((a,b)=>a.time-b.time);let current=list.filter(m=>m.time<=detail.time+.02).at(-1);
  const id=current?.id||'';
  $('barNow').textContent=current?'Measure '+(current.printedNumber??current.number)+'（'+(current.auto?'Auto-aligned':'Aligned')+'）':'Reference measure '+detail.bar+' measure（Not aligned to this edition）';
  if(current&&$('followPage').checked&&current.page!==page&&!editing){window.dispatchEvent(new CustomEvent('score-goto',{detail:{page:current.page}}))}
  if(id!==activeId||currentKey!==key()){activeId=id;currentKey=key();paint()}
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
