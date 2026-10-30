(async()=>{
 const $=id=>document.getElementById(id),rows=window.CATALOG?.rows||[],all=window.PERFORMANCES||[];
 $('playerOptions').open=window.matchMedia('(min-width:901px)').matches;const params=new URLSearchParams(location.search),file=params.get('file'),row=rows.find(r=>r.id===params.get('id'))||rows.find(r=>r.file===file);
 const composer=row?.composer||'Fryderyk Chopin';
 const parts=r=>{const ms=[...((r.opus||'')+' '+r.title).matchAll(/(Op(?:us)?\.?|BWV|D\.|S\.|B\.|K[V]?\.?|O)\s*(\d+)(?:\s*[,/.]?\s*(?:No\.?|Nr\.?)\s*(\d+))?/ig)];const m=ms.find(x=>x[3]&&x[2]===ms[0]?.[2])||ms[0];return m?{key:m[1].toLowerCase().replace(/opus|o$/,'op').replace('.','')+m[2],sub:Number(m[3]||0)}:{key:'',sub:0}};const op=r=>parts(r).key;
 const related=rows.filter(r=>r.file===file&&r.opus).map(op);
 const exact=all.filter(p=>p.file===file);
 const reference=all.filter(p=>p.composer===composer&&((row?.opus&&op(p)===op(row)&&(!parts(row).sub||parts(row).sub===parts(p).sub))||(!row?.opus&&related.includes(op(p)))));
 let choices=exact.length?exact:reference;
 // Never substitute an unrelated piece merely because its composer matches.
 const mapping=new Map(choices.map(p=>[p.id,p]));
 for(const p of choices){const opt=document.createElement('option');opt.value=p.id;opt.textContent=(p.opus?p.opus+' · ':'')+p.label;$('performance').append(opt)}
 if(!choices.length){$('audioStatus').textContent='No verified note data is available for this edition. Scanned PDFs need transcription and proofreading.';return}
 $('audioStatus').textContent=exact.length&&exact.every(p=>p.autoOMR)?'Notes auto-recognized from this scan (open-source Audiveris). Not proofread — some notes may be wrong.':exact.some(p=>p.fromMusicXML)?'Plays directly from this edition’s MusicXML notes using sampled grand piano.':exact.length?'Note data matches this source edition.':'Choose a piece. Reference editions may differ from the scan and need alignment.';
 $('play').disabled=false;
 let context,master,buffers=new Map(),data,position=0,startedAt=0,playing=false,timer,cursor=0,active=[],generation=0,loading=false;
 let speed=1;
 const sampleNotes=[21,...Array.from({length:29},(_,i)=>24+i*3)];
 const noteName=n=>['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'][n%12]+(Math.floor(n/12)-1);
 const timeLabel=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 try{const saved=JSON.parse(sessionStorage.getItem('piano-update-restore')||'null');if(saved?.file===file&&mapping.has(saved.performance)){sessionStorage.removeItem('piano-update-restore');$('performance').value=saved.performance;position=Math.max(0,Number(saved.time)||0);speed=Math.max(.4,Math.min(1.6,Number(saved.speed)||1));$('speed').value=speed;$('volume').value=Math.max(0,Math.min(.8,Number(saved.volume)||.45));$('clock').textContent=timeLabel(position)+' / —'}}catch{}
 function current(){return playing?Math.min(data?.duration||0,position+(context.currentTime-startedAt)*speed):position}
 // The render clock leads the sound reaching the speakers. Use the audio
 // device timestamp for the score display; keep scheduling on the render clock.
 function audibleCurrent(){
  if(!playing||!context)return position;
  let audioTime=context.currentTime-(context.outputLatency||context.baseLatency||0);
  try{const stamp=context.getOutputTimestamp?.();if(stamp?.contextTime>0&&stamp.performanceTime>0)audioTime=Math.min(context.currentTime,stamp.contextTime+(performance.now()-stamp.performanceTime)/1000)}catch{}
  return Math.max(0,Math.min(data?.duration||0,position+(audioTime-startedAt)*speed));
 }
 function silence(){for(const voice of active){try{voice.stop()}catch{}}active=[]}
 function pause(){if(playing)position=current();playing=false;clearInterval(timer);silence();$('pause').disabled=true;$('play').disabled=loading;$('play').textContent='▶ Play piano';update()}
 function update(){if(data)$('speedValue').textContent=(data.tempoProvided===false?'Reference tempo ':'Source tempo ')+Math.round(speed*100)+'%';const t=audibleCurrent();$('seek').value=t;$('clock').textContent=timeLabel(t)+' / '+timeLabel(data?.duration||0);const bar=data?.bars?.filter(b=>b.time<=t).at(-1);const tempo=data?.tempos?.filter(b=>b.time<=t).at(-1);if($('tempoNow'))$('tempoNow').textContent=tempo?`${Math.round(tempo.bpm*speed)} BPM${data?.tempoProvided===false?' · Reference tempo (not marked in score)':speed===1?' · Source tempo':''}`:'No explicit BPM in the source';window.dispatchEvent(new CustomEvent('piano-progress',{detail:{time:t,bar:bar?.number||1,performanceId:$('performance').value,playing,barStart:bar?.time||0}}))}
 async function load(){
  if(loading)return false;loading=true;$('play').disabled=true;
  try{
   if(!context){context=new AudioContext();master=context.createGain();master.gain.value=Number($('volume').value);const compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=4;master.connect(compressor);compressor.connect(context.destination)}
   await context.resume();
   const selected=mapping.get($('performance').value);$('audioStatus').textContent='Loading grand-piano samples and score notes…';
   const response=await fetch(selected.events);if(!response.ok)throw Error('Unable to load note data');data=await response.json();
   const needed=[...new Set(data.notes.map(n=>sampleNotes.reduce((a,b)=>Math.abs(a-n.n)<=Math.abs(b-n.n)?a:b)))];
   await Promise.all(needed.map(async n=>{if(buffers.has(n))return;const res=await fetch('audio/piano/'+noteName(n)+'.mp3');if(!res.ok)throw Error('Unable to load piano samples');buffers.set(n,await context.decodeAudioData(await res.arrayBuffer()))}));
   $('seek').max=data.duration;$('audioStatus').textContent='Sampled grand piano · '+selected.composer+' '+selected.title+(selected.autoOMR?' · Auto-recognized scan, may contain wrong notes':exact.some(x=>x.id===selected.id)?' · Matching source notes':' · Reference edition');window.dispatchEvent(new CustomEvent('piano-loaded',{detail:{...data,performanceId:selected.id}}));return true;
  }catch(e){$('audioStatus').textContent=e.message+'；Check your network connection.';window.dispatchEvent(new CustomEvent('piano-unavailable'));return false}
  finally{loading=false;$('play').disabled=false}
 }
 function playNote(n,delay){
  const nearest=sampleNotes.reduce((a,b)=>Math.abs(a-n.n)<=Math.abs(b-n.n)?a:b),buffer=buffers.get(nearest);if(!buffer)return;
  const start=context.currentTime+Math.max(0,delay),duration=Math.max(.03,n.d/speed),source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=2**((n.n-nearest)/12);const amp=Math.max(.01,n.v)**1.6*.72;
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(amp,start+.004);gain.gain.setValueAtTime(amp,start+duration);gain.gain.exponentialRampToValueAtTime(.0001,start+duration+.22);source.connect(gain);gain.connect(master);source.start(start);source.stop(Math.min(start+duration+.25,start+buffer.duration/source.playbackRate.value));active.push(source);source.onended=()=>{active=active.filter(s=>s!==source);source.disconnect();gain.disconnect()};
 }
 function tick(){const t=current();while(cursor<data.notes.length&&data.notes[cursor].t<t+.16*speed){const n=data.notes[cursor++];if(n.t>=t-.03)playNote(n,(n.t-t)/speed)}update();if(t>=data.duration){pause();position=0;update();$('audioStatus').textContent='Playback complete.'}}
 $('play').onclick=async()=>{if(playing)return;if(!data&&!(await load()))return;if(!context)return;await context.resume();if(position>=data.duration)position=0;cursor=data.notes.findIndex(n=>n.t>=position);if(cursor<0)cursor=data.notes.length;startedAt=context.currentTime;playing=true;$('play').disabled=true;$('pause').disabled=false;$('stop').disabled=false;tick();timer=setInterval(tick,35)};
 $('pause').onclick=pause;$('stop').onclick=()=>{pause();position=0;update()};
 $('performance').onchange=()=>{pause();data=null;position=0;speed=1;$('speed').value=1;$('speedValue').textContent='Source tempo 100%';$('audioStatus').textContent='Selected: '+mapping.get($('performance').value).title+'，Press Play piano.';update()};
 $('speed').onchange=()=>{const resume=playing;pause();speed=Number($('speed').value);$('speedValue').textContent=speed.toFixed(2)+'×';if(resume)$('play').click()};
 $('originalTempo').onclick=()=>{const resume=playing;pause();speed=1;$('speed').value=1;$('speedValue').textContent='Source tempo 100%';if(resume)$('play').click()};
 $('volume').oninput=()=>{if(master)master.gain.value=Number($('volume').value)};
 $('seek').oninput=()=>{const target=Number($('seek').value),resume=playing;pause();position=target;update();if(resume)$('play').click()};
 window.addEventListener('piano-seek',e=>{const resume=playing;pause();position=Math.max(0,Math.min(data?.duration||0,Number(e.detail.time)||0));update();if(resume)$('play').click()});
 window.addEventListener('pagehide',()=>{pause();context?.close()});
})();
