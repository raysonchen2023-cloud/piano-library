(()=>{
 const $=id=>document.getElementById(id),all=window.CATALOG?.rows||[];
 (window.normalizeComposers||(x=>x))(all);const rows=all.filter(r=>r.downloaded&&r.file&&r.scoreFormat?.status==='accepted');
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
 let favorites=new Set(read('chopin-favorites',[])),recent=read('piano-reader-history',[]),screen='home',composer='',topic='',limit=40;
 const previous=read('piano-touch-view',{});composer=window.NATIVE_COMPOSER_NAMES?.[previous.composer]||previous.composer||'';topic=previous.topic||'';$('touchSearch').value=previous.q||'';
 const href=(row,page)=>'viewer.html?mode=app&id='+encodeURIComponent(row.id)+'&file='+encodeURIComponent(row.file)+'&page='+(page||row.startPage||1)+'&return=app.html';
 const rowHtml=(r,page)=>`<article class="score-row"><a class="score-open" href="${esc(href(r,page))}"><span class="score-icon" aria-hidden="true">♫</span><span><span class="score-name">${esc(r.title)}</span><small class="score-info">${esc((window.composerWithYears||(x=>x))(r.composer))}${r.opus?' · '+esc(r.opus):''}${r.difficulty?' · '+esc(r.difficulty):''}${r.quality?' · '+esc(r.quality):''}${page?' · '+page+' pages':''}</small></span></a><button class="favorite-toggle" data-favorite="${esc(r.id)}" aria-label="${favorites.has(r.id)?'Remove favorite':'Favorite'} ${esc(r.title)}" aria-pressed="${favorites.has(r.id)}">${favorites.has(r.id)?'♥':'♡'}</button></article>`;
function opusKey(r){
  const text=(r.opus||'')+' '+r.title;
  const matches=[...text.matchAll(/\b(Op(?:us)?\.?|BWV|D\.|S\.|B\.|WoO|Hess)\s*(\d+)(?:\s*[,/:.-]?\s*(?:No\.?|Nr\.?|n[º°])\s*(\d+))?/ig)];
  const m=matches.find(x=>x[3]&&x[2]===matches[0]?.[2])||matches[0];
  if(!m)return [99,Infinity,Infinity];
  const system=m[1].toLowerCase().replace(/\./g,'');
  return [({op:0,opus:0,bwv:0,d:0,s:0,woo:1,hess:2,b:3})[system]??9,Number(m[2]),Number(m[3]||0)];
}
function compareOpus(a,b){const ak=opusKey(a),bk=opusKey(b);for(let i=0;i<ak.length;i++){if(ak[i]!==bk[i])return ak[i]<bk[i]?-1:1}return (b.quality==='Digital engraving')-(a.quality==='Digital engraving')||a.title.localeCompare(b.title,'en',{numeric:true})||a.id.localeCompare(b.id)}
 function paint(){
  const recentRows=recent.map(x=>({row:rows.find(r=>r.id===x.id),page:x.page})).filter(x=>x.row).slice(0,4);$('recentList').innerHTML=recentRows.map(x=>rowHtml(x.row,x.page)).join('');$('recentEmpty').hidden=!!recentRows.length;
  const favRows=rows.filter(r=>favorites.has(r.id));$('homeFavorites').innerHTML=favRows.slice(0,4).map(r=>rowHtml(r)).join('');$('favoriteResults').innerHTML=favRows.map(r=>rowHtml(r)).join('');$('favoritesEmpty').hidden=$('allFavoritesEmpty').hidden=!!favRows.length;
  const q=$('touchSearch').value.trim().toLowerCase().replace(/卡[農农]|kanon/g,'canon');const filtered=rows.filter(r=>(!composer||r.composer===composer)&&(!topic||(r.tags||[]).includes(topic))&&(!q||[r.title,r.composer,(window.composerSearchText||window.composerWithYears||(x=>x))(r.composer),r.opus,r.arranger,...(r.tags||[])].join(' ').toLowerCase().replace(/卡[農农]|kanon/g,'canon').includes(q)));
  filtered.sort((a,b)=>{if(topic==='Canon'){const rank=(a.curationRank??1000)-(b.curationRank??1000);if(rank)return rank;}return composer?compareOpus(a,b):a.title.localeCompare(b.title,'en',{numeric:true})});$('touchResults').innerHTML=filtered.slice(0,limit).map(r=>rowHtml(r)).join('');$('touchEmpty').hidden=!!filtered.length;$('touchMore').hidden=filtered.length<=limit;$('resultCount').textContent=filtered.length+'  scores / editions';$('listHeading').textContent=topic||'All scores';$('chooseComposer').textContent=(composer?(window.composerWithYears||(x=>x))(composer):'All composers')+' ▾';
  const topics=['','Nursery rhymes','Film music','Canon','New age & lyrical','Studies & technique','Clear editions'];$('topicChips').innerHTML=topics.map(t=>`<button data-topic="${esc(t)}" class="${t===topic?'selected':''}" aria-pressed="${t===topic}">${t||'All'}</button>`).join('');
  try{localStorage.setItem('piano-touch-view',JSON.stringify({composer,topic,q:$('touchSearch').value,screen}))}catch{}
 }
 function show(name){screen=name;for(const n of ['home','library','favorites'])$(n+'Panel').hidden=n!==name;document.querySelectorAll('[data-screen]').forEach(b=>b.getAttribute('data-screen')===name?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));$('screenTitle').textContent=({home:'My Scores',library:'Find a score',favorites:'Favorites'})[name];paint();window.scrollTo(0,0)}
 document.querySelector('.bottom-tabs').onclick=e=>{const b=e.target.closest('[data-screen]');if(b)show(b.dataset.screen)};$('findMusic').onclick=()=>{show('library');$('touchSearch').focus()};$('seeFavorites').onclick=()=>show('favorites');
 document.querySelector('main').onclick=e=>{const b=e.target.closest('[data-favorite]');if(!b)return;favorites.has(b.dataset.favorite)?favorites.delete(b.dataset.favorite):favorites.add(b.dataset.favorite);try{localStorage.setItem('chopin-favorites',JSON.stringify([...favorites]))}catch{}paint()};
 $('topicChips').onclick=e=>{const b=e.target.closest('[data-topic]');if(b){topic=b.dataset.topic;limit=40;paint()}};$('touchSearch').oninput=()=>{limit=40;paint()};$('touchMore').onclick=()=>{limit+=40;paint()};$('clearFilters').onclick=()=>{composer=topic='';$('touchSearch').value='';limit=40;paint()};
 const composers=[...new Set(rows.map(r=>r.composer))].sort(window.byComposerBirth||undefined);function composerButtons(){const q=$('composerSearch').value.toLowerCase();$('composerButtons').innerHTML=['',...composers].filter(c=>!q||(window.composerSearchText?window.composerSearchText(c):c).toLowerCase().includes(q)).map(c=>`<button data-composer="${esc(c)}">${esc(c?(window.composerWithYears||(x=>x))(c):'All composers')}</button>`).join('')}
 $('chooseComposer').onclick=()=>{composerButtons();$('composerSheet').showModal()};$('composerSearch').oninput=composerButtons;$('closeComposer').onclick=()=>$('composerSheet').close();$('composerButtons').onclick=e=>{const b=e.target.closest('[data-composer]');if(b){composer=b.dataset.composer;limit=40;$('composerSheet').close();paint()}};
 show(['home','library','favorites'].includes(previous.screen)?previous.screen:'home');
})();
