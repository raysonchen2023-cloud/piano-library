const allRows=window.CATALOG?.rows||[];
const rows=allRows.filter(r=>r.downloaded&&r.file&&!r.linkOnly&&r.scoreFormat?.status==='accepted');
const $=id=>document.getElementById(id);
let category='',onlyFav=false,favs=new Set(),visibleLimit=60,restoringView=true;
try{const saved=JSON.parse(localStorage.getItem('chopin-favorites')||'[]');if(Array.isArray(saved))favs=new Set(saved)}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>s.toLocaleLowerCase().replace(/卡[農农]|kanon/g,'canon').replace(/opus/g,'op').replace(/[\s.]/g,'');
function viewState(selected=''){return {composer:$('composer').value,q:$('q').value,source:$('source').value,topic:$('topic').value,sort:$('sort').value,category,favorites:onlyFav?'1':'0',limit:String(visibleLimit),scroll:String(Math.round(window.scrollY)),selected}}
function saveView(updateUrl=true,selected=''){
 if(restoringView)return;
 const state=viewState(selected);try{localStorage.setItem('piano-library-view-v1',JSON.stringify(state))}catch{}
 if(updateUrl){const url=new URL(location.href);url.search=new URLSearchParams(state).toString();history.replaceState(null,'',url)}
}
const downloadHref=r=>window.PDF_PARTS?.[r.file]?.[0]?.file||r.file;
const readerHref=r=>(location.protocol==='file:'?'http://127.0.0.1:18849/':'')+'viewer.html?file='+encodeURIComponent(r.file)+'&id='+encodeURIComponent(r.id)+(r.startPage?'&page='+r.startPage:'')+'&return='+encodeURIComponent('index.html?'+new URLSearchParams(viewState(r.id)).toString());
const composerOrder=[...new Set(['Fryderyk Chopin','Liszt Ferenc','Robert Schumann','Franz Schubert','Johann Sebastian Bach','Ludwig van Beethoven','Сергей Рахманинов','Wolfgang Amadeus Mozart','Charles-Louis Hanon','Carl Czerny',...allRows.map(r=>r.composer||'Fryderyk Chopin')])];
function opusKey(r){
  const text=(r.opus||'')+' '+r.title;
  const matches=[...text.matchAll(/\b(Op(?:us)?\.?|BWV|D\.|S\.|B\.|WoO|Hess)\s*(\d+)(?:\s*[,/:.-]?\s*(?:No\.?|Nr\.?|n[º°])\s*(\d+))?/ig)];
  const m=matches.find(x=>x[3]&&x[2]===matches[0]?.[2])||matches[0];
  if(!m)return [99,Infinity,Infinity];
  const system=m[1].toLowerCase().replace(/\./g,'');
  return [({op:0,opus:0,bwv:0,d:0,s:0,woo:1,hess:2,b:3})[system]??9,Number(m[2]),Number(m[3]||0)];
}
function compareOpus(a,b){const ak=opusKey(a),bk=opusKey(b);for(let i=0;i<ak.length;i++){if(ak[i]!==bk[i])return ak[i]<bk[i]?-1:1}return (b.quality==='Digital engraving')-(a.quality==='Digital engraving')||a.title.localeCompare(b.title,'en',{numeric:true})||a.id.localeCompare(b.id)}
// Expose pure sorting helpers for validation without a browser.
if(typeof module!=='undefined')module.exports={opusKey,compareOpus};
function composer(r){return r.composer||'Fryderyk Chopin'}
const withYears=c=>window.composerWithYears?window.composerWithYears(c):c;
$('composer').innerHTML='<option value="">All composers</option>'+composerOrder.filter(c=>rows.some(r=>composer(r)===c)).map(c=>`<option value="${esc(c)}">${esc(withYears(c))}</option>`).join('');
$('composer').value='Fryderyk Chopin';
const sources=[...new Set(rows.map(r=>r.source))];
$('source').innerHTML='<option value="">All sources</option>'+sources.map(s=>`<option>${esc(s)}</option>`).join('');
function scoped(){return rows.filter(r=>!$('composer').value||composer(r)===$('composer').value)}
// The catalog has ~35 overlapping categories; readers see 17 clear groups (data unchanged).
const CATEGORY_GROUPS={'Sonatas':'Sonatas','Concertos':'Concertos & chamber','Chamber music with piano':'Concertos & chamber','Variations':'Variations','Preludes':'Preludes','Fugues':'Fugues & inventions','Inventions & sinfonias':'Fugues & inventions','Suites':'Suites','Études':'Études & exercises','Studies & technique':'Études & exercises','Nocturnes':'Nocturnes','Waltzes':'Waltzes','Mazurkas':'Mazurkas & polonaises','Polonaises':'Mazurkas & polonaises','Ballades':'Ballades & scherzos','Scherzos & fantasias':'Ballades & scherzos','Impromptus':'Impromptus','Fantasias':'Rhapsodies & fantasias','Rhapsodies':'Rhapsodies & fantasias','Concert pieces':'Rhapsodies & fantasias','Rondos':'Rhapsodies & fantasias','Keyboard works':'Piano pieces','Piano pieces':'Piano pieces','Short pieces':'Piano pieces','Song transcriptions':'Piano pieces','Opera transcriptions':'Piano pieces','Collected editions':'Complete volumes','Piano collections':'Complete volumes','Collections':'Complete volumes','Nursery rhymes':'Nursery rhymes','Film music':'Film & TV','Anime & TV':'Film & TV','Canon':'Canon','New age & lyrical':'Modern & new age','Contemporary piano':'Modern & new age'};
const GROUP_ORDER=['Sonatas','Concertos & chamber','Variations','Preludes','Fugues & inventions','Suites','Études & exercises','Nocturnes','Waltzes','Mazurkas & polonaises','Ballades & scherzos','Impromptus','Rhapsodies & fantasias','Piano pieces','Nursery rhymes','Film & TV','Canon','Modern & new age','Complete volumes'];
const cat=r=>CATEGORY_GROUPS[r.category]||r.category||'Piano pieces';
// Collections span many composers, so they get their own row of chips.
const COLLECTIONS={'Nursery rhymes':['Nursery rhymes'],'Film & TV':['Film music','Anime & TV'],'Canon':['Canon'],'Modern & new age':['New age & lyrical','Contemporary piano'],'Cuppix':['Cuppix']};
const inCollection=(r,t)=>(COLLECTIONS[t]||[t]).some(x=>(r.tags||[]).includes(x)||r.category===x);
const collectionNames=Object.keys(COLLECTIONS).filter(t=>rows.some(r=>inCollection(r,t)));
for(const c of collectionNames)if(![...$('topic').options].some(o=>o.value===c))$('topic').append(new Option(c,c));
function collectionChips(){
 let box=$('collections');if(!box){box=document.createElement('nav');box.id='collections';box.className='chips';box.setAttribute('aria-label','Collections');$('categories').before(box)}
 const t=$('topic').value;
 box.innerHTML=collectionNames.length?'<strong style="align-self:center;margin-right:4px">Collections</strong>'+collectionNames.map(c=>`<button class="chip ${t===c?'active':''}" data-collection="${esc(c)}" aria-pressed="${t===c}">${esc(c)} <small>${rows.filter(r=>inCollection(r,c)).length}</small></button>`).join(''):'';
}
function chips(){collectionChips();const t=$('topic').value,rs=scoped().filter(r=>!t||inCollection(r,t)),cats=['',...[...new Set(rs.map(cat))].sort((a,b)=>(GROUP_ORDER.indexOf(a)+1||99)-(GROUP_ORDER.indexOf(b)+1||99))];if(!cats.includes(category))category='';$('categories').innerHTML=cats.map(c=>`<button class="chip ${category===c?'active':''}" data-category="${esc(c)}" aria-pressed="${category===c}">${esc(c||'All categories')} <small>${c?rs.filter(r=>cat(r)===c).length:rs.length}</small></button>`).join('')}
function persist(){try{localStorage.setItem('chopin-favorites',JSON.stringify([...favs]))}catch{$('status').textContent='Unable to save favorites. Export a backup.'}}
function render(){
 const rs=scoped(),q=normalize($('q').value),src=$('source').value,topic=$('topic').value;
 const unique=[...new Map(rs.filter(r=>r.downloaded).map(r=>[r.file,r])).values()];
 $('fileCount').textContent=unique.length;$('workCount').textContent=rs.filter(r=>cat(r)!=='Complete volumes').length;$('size').textContent=(unique.reduce((n,r)=>n+(r.bytes||0),0)/1e6).toFixed(1);
 let filtered=rs.filter(r=>(!topic||inCollection(r,topic))&&(!category||cat(r)===category)&&(!src||r.source===src)&&(!onlyFav||favs.has(r.id))&&normalize([r.title,r.opus,r.category,cat(r),r.source,...(r.tags||[]),composer(r),withYears(composer(r))].join(' ')).includes(q));
 const sort=$('sort').value;
 const matchesScope=r=>(!$('composer').value||composer(r)===$('composer').value)&&(!topic||(r.tags||[]).includes(topic))&&(!src||r.source===src)&&(!onlyFav||favs.has(r.id))&&normalize([r.title,r.opus,r.category,cat(r),r.source,...(r.tags||[]),composer(r),withYears(composer(r))].join(' ')).includes(q);
 const pending=allRows.filter(r=>!r.downloaded&&matchesScope(r));
 const review=allRows.filter(r=>r.downloaded&&r.scoreFormat?.status!=='accepted'&&matchesScope(r));
 $('formatReview').hidden=!review.length;$('formatReviewTitle').textContent=`Other instrumentation / pending review (${review.length}  editions, not in the grand-staff list)`;
 $('formatReviewList').innerHTML=review.map(r=>`<li><strong>${esc(r.title)}</strong><br><small>${esc(r.scoreFormat?.label)} · ${esc(r.scoreFormat?.reason||'Grand-staff notation needs review')}</small></li>`).join('');
 $('pending').hidden=!pending.length;$('pendingTitle').textContent=`Awaiting files (${pending.length}  editions, no readable file yet)`;
 $('pendingList').innerHTML=pending.slice(0,100).map(r=>`<li><strong>${esc(r.title)}</strong> · ${esc(composer(r))}<br><small>Awaiting the complete score${r.access?' · '+esc(r.access):''}</small></li>`).join('')+(pending.length>100?`<li>Remaining: ${pending.length-100}  entries. Refine your search.</li>`:'');
 filtered.sort((a,b)=>{if($('topic').value==='Canon'){const rank=(a.curationRank??1000)-(b.curationRank??1000);if(rank)return rank;}const comp=composerOrder.indexOf(composer(a))-composerOrder.indexOf(composer(b));if(comp)return comp;if(sort==='opus')return compareOpus(a,b);if(sort==='category')return cat(a).localeCompare(cat(b),'en')||compareOpus(a,b);return a.title.localeCompare(b.title,'en',{numeric:true})});
 $('status').textContent=`Readable: ${filtered.length} entries / in this composer selection: ${rs.length} entries${pending.length?` · plus ${pending.length}  awaiting files`:''} · Collection entries share volume PDFs`;
 $('empty').hidden=filtered.length>0;
 $('more').hidden=filtered.length<=visibleLimit;$('more').textContent='Show more ('+Math.max(0,filtered.length-visibleLimit)+'  remaining)';$('grid').innerHTML=filtered.slice(0,visibleLimit).map(r=>{
   const info=r.infoFile||(r.id.match(/^mutopia-\d+$/)?`sources/mutopia-${r.id.split('-')[1].padStart(3,'0')}-info.html`:'');
   return `<article class="card" id="score-${esc(r.id)}"><div class="card-top"><span class="tag">${esc(withYears(composer(r)))} · ${esc(cat(r))}</span><button class="star" data-id="${esc(r.id)}" aria-label="${favs.has(r.id)?'Remove favorite':'Add favorite'} ${esc(r.title)}" aria-pressed="${favs.has(r.id)}">${favs.has(r.id)?'★':'☆'}</button></div><h2><a data-open-score="${esc(r.id)}" href="${esc(readerHref(r))}" style="text-decoration:none">${esc(r.title)}</a></h2><div class="meta">${esc(r.opus)}${r.opus?' · ':''}${esc(r.source)}${r.volume?` · ${r.volume} volume`:''}<br>${r.downloaded?'● Downloaded':r.linkOnly?'↗ Source edition':'○ Not downloaded'}${r.pages?` · ${r.pages} pages`:''}${r.collection?' · Open volume':''}${r.edition?`<br>${esc(r.edition)}`:''}${r.notes?`<br>${esc(r.notes)}`:''}</div><div class="actions">${r.downloaded?`<a class="primary" data-open-score="${esc(r.id)}" href="${esc(readerHref(r))}">${r.collection?'Open volume':'Open score'} ↗</a><a class="download" href="${esc(downloadHref(r))}" download>${window.PDF_PARTS?.[r.file]?'Download PDF part':'Download PDF'}</a>`:''}</div><details><summary>Edition, instrumentation & license</summary><p>Source: ${esc(r.sourceUrl)}</p><p>${esc(r.license)}${r.regionNotice?`<br>${esc(r.regionNotice)}`:''}<br>${esc(r.credit)}${r.instrumentation?`<br>${esc(r.instrumentation)}`:''}</p>${info?`<a href="${esc(info)}" target="_blank">Saved attribution</a>`:''}${r.licenseFile?`<br><a href="${esc(r.licenseFile)}" target="_blank">Edition license</a>`:''}</details></article>`;
 }).join('');saveView();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-collection]');if(!b)return;const c=b.dataset.collection;$('topic').value=$('topic').value===c?'':c;if($('topic').value)$('composer').value='';category='';visibleLimit=60;chips();render()});
$('categories').onclick=e=>{let b=e.target.closest('[data-category]');if(b){category=b.dataset.category;chips();render()}};
$('grid').onclick=e=>{const a=e.target.closest('[data-open-score]');if(a){const r=rows.find(r=>r.id===a.dataset.openScore);if(r){saveView(true,r.id);a.href=readerHref(r)}return}let b=e.target.closest('[data-id]');if(b){favs.has(b.dataset.id)?favs.delete(b.dataset.id):favs.add(b.dataset.id);render();persist()}};
$('q').oninput=()=>{visibleLimit=60;render()};$('source').onchange=render;$('topic').onchange=()=>{if($('topic').value)$('composer').value='';chips();render()};$('sort').onchange=render;
$('composer').onchange=()=>{category='';visibleLimit=60;$('topic').value='';chips();render()};$('more').onclick=()=>{visibleLimit+=60;render()};
$('favorites').onclick=()=>{onlyFav=!onlyFav;$('favorites').setAttribute('aria-pressed',onlyFav);$('favorites').textContent=onlyFav?'★ Show all':'☆ Favorites only';render()};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify([...favs],null,2)],{type:'application/json'}));let a=document.createElement('a');a.href=url;a.download='piano-favorites.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('import').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{try{let data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data)||data.some(x=>typeof x!=='string'))throw Error();favs=new Set([...favs,...data.filter(id=>allRows.some(r=>r.id===id))]);render();persist()}catch{alert('Choose a favorites JSON exported from this library.')}e.target.value=''};
let initialView={};
try{initialView=JSON.parse(localStorage.getItem('piano-library-view-v1')||'{}')||{}}catch{}
const queryView=new URLSearchParams(location.search);if(queryView.has('composer'))initialView=Object.fromEntries(queryView);initialView.composer=window.NATIVE_COMPOSER_NAMES?.[initialView.composer]||initialView.composer;
for(const id of ['composer','source','topic','sort']){if(typeof initialView[id]==='string'&&[...$(id).options].some(o=>o.value===initialView[id]))$(id).value=initialView[id]}
if(typeof initialView.q==='string')$('q').value=initialView.q;
category=typeof initialView.category==='string'?initialView.category:'';onlyFav=initialView.favorites==='1';visibleLimit=Math.min(Math.max(60,Number(initialView.limit)||60),Math.max(60,rows.length));
$('favorites').setAttribute('aria-pressed',onlyFav);$('favorites').textContent=onlyFav?'★ Show all':'☆ Favorites only';
chips();render();requestAnimationFrame(()=>{const y=Number(initialView.scroll);if(Number.isFinite(y))window.scrollTo(0,Math.max(0,y));else if(initialView.selected)document.getElementById('score-'+initialView.selected)?.scrollIntoView({block:'center'});restoringView=false;saveView()});
let scrollSaveTimer;window.addEventListener('scroll',()=>{clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(()=>saveView(false),150)},{passive:true});window.addEventListener('pagehide',()=>saveView(false));
