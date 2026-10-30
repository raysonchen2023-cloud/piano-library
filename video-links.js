// Human-checked recording links. No audio/video is downloaded or substituted for score events.
window.PIANO_VIDEOS=[
{"composer": "Сергей Рахманинов", "work": "Op.23", "number": 5, "title": "Prelude in G minor, Op.23 No.5", "artist": "Yuja Wang", "url": "https://www.youtube.com/watch?v=GhBXx-2PadM", "note": "Deutsche Grammophon · The Berlin Recital, 2018. Same work; edition may differ.", "checked": "2026-10-30"},
{"composer": "Сергей Рахманинов", "work": "Op.32", "number": 10, "title": "Prelude in B minor, Op.32 No.10", "artist": "Yuja Wang", "url": "https://www.youtube.com/watch?v=pk-3JBnjdAY", "note": "Official Deutsche Grammophon performance video · Berlin, 2018.", "checked": "2026-10-30"},
{"composer": "Сергей Рахманинов", "work": "Op.39", "number": 1, "title": "Étude-tableau in C minor, Op.39 No.1", "artist": "Yuja Wang", "url": "https://www.youtube.com/watch?v=mAEM5q5YFtg", "note": "Official Deutsche Grammophon performance video · Berlin, 2018.", "checked": "2026-10-30"},
{"composer": "Fryderyk Chopin", "work": "Op.64", "number": 2, "title": "Waltz in C-sharp minor, Op.64 No.2", "artist": "Yuja Wang", "url": "https://www.youtube.com/watch?v=vB7_l8wSpz8", "note": "Graduation recital, 2006; uploader identifies Yuja Wang. Reference performance; edition may differ.", "checked": "2026-10-30"},
 {rowId:'gangqinpu-canon-939025',composer:'Johann Pachelbel',title:'Variations on the Kanon',artist:'George Winston',url:'https://www.youtube.com/watch?v=1wAGacczNho',note:'Official George Winston performance video. The transcription may differ in details.',checked:'2026-10-30'},
 {composer:'Fryderyk Chopin',work:'Op.23',title:'Ballade No.1, Op.23',artist:'Yuja Wang',url:'https://www.youtube.com/watch?v=3L6ASlLTuks',note:'Wuhan, Qintai Concert Hall, 15 December 2023; encore performance',checked:'2026-10-30'},
 {composer:'Fryderyk Chopin',work:'Op.10',number:4,title:'Étude, Op.10 No.4',artist:'Yuja Wang',url:'https://www.youtube.com/watch?v=_HuhVfue5wo',note:'Piano performance of the same work; recording edition may differ',checked:'2026-10-30'},
 {composer:'Fryderyk Chopin',work:'Op.28',number:4,title:'Prélude, Op.28 No.4',artist:'Yuja Wang',url:'https://www.youtube.com/watch?v=E4Ra8-kbCZQ',note:'Piano performance of the same work; recording edition may differ',checked:'2026-10-30'},
 {composer:'Liszt Ferenc',work:'S.566',title:'Widmung (Schumann–Liszt)',artist:'Evgeny Kissin',url:'https://www.youtube.com/watch?v=-5_jzx1mPLA',note:'Verbier, July 2010; piano solo',checked:'2026-10-30'},
 {composer:'Сергей Рахманинов',work:'Op.3',number:1,title:'Élégie, Op.3 No.1',artist:'Yuja Wang',url:'https://www.youtube.com/watch?v=92dwRnGZIRY',note:'Yuja Wang piano recording; reference performance of the same work',checked:'2026-10-30'}
];
(()=>{
 const params=new URLSearchParams(location.search),rows=window.CATALOG?.rows||[];
 const row=rows.find(r=>r.id===params.get('id'))||rows.find(r=>r.file===params.get('file'));
 const panel=document.getElementById('recordingFallback');if(!row||!panel)return;
 const clean=s=>String(s||'').replace(/[\s.]/g,'').toLowerCase();
 const text=(row.opus||'')+' '+row.title;
 const matches=window.PIANO_VIDEOS.filter(v=>{
  if(v.composer!==row.composer||/(?:lang\s*lang|朗朗)/i.test(v.artist))return false;
  if(v.rowId)return v.rowId===row.id;
  const work=clean(v.work).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(!new RegExp(work+'(?!\\d)').test(clean(text)))return false;
  const number=text.match(/\b(?:No\.?|Nr\.?)\s*(\d+)\b/i);
  return !v.number||!number||Number(number[1])===v.number;
 });
 matches.sort((a,b)=>(a.artist==='Yuja Wang'?-1:0)-(b.artist==='Yuja Wang'?-1:0));
 const list=document.getElementById('recordingLinks');
 for(const video of matches){const p=document.createElement('p'),a=document.createElement('a');a.href=video.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='▶ '+(video.artist==='Yuja Wang'?'Yuja Wang':video.artist)+' · '+video.title;p.append(a,document.createElement('br'));const small=document.createElement('small');small.textContent=video.note;p.append(small);list.append(p)}
 document.getElementById('recordingNote').textContent=matches.length?'Piece and performer checked. Yuja Wang is preferred; Lang Lang is excluded. Recordings do not synchronize with this edition.':'No verified recording for this piece yet. Prefer Yuja Wang, then other renowned pianists; exclude Lang Lang.';
 // Keep recordings accessible even when sampled playback is available.
 panel.hidden=false;
 const search=document.createElement('a');
 const query=[row.composer,row.title,row.arranger||'', 'piano solo performance', '-Lang Lang'].join(' ');
 search.href='https://www.youtube.com/results?search_query='+encodeURIComponent(query);
 search.target='_blank';search.rel='noopener noreferrer';search.textContent='Search YouTube performances';
 list.append(search);
 const button=document.getElementById('play');
 if(document.getElementById('performance').options.length===0){
  button.disabled=false;button.textContent=matches.length?'▶ Watch piano performance':'▶ Find piano performance';
  button.onclick=()=>window.open(matches[0]?.url||search.href,'_blank','noopener,noreferrer');
  document.getElementById('audioStatus').textContent=matches.length?'A real pianist recording is available. Play opens YouTube; score tracking is unavailable for recordings.':'No checked recording or score note data yet. Find piano performance opens a YouTube search; results are not verified.';
 }
 window.addEventListener('piano-unavailable',()=>{panel.hidden=false});
})();
