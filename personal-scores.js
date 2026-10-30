window.PERSONAL_SCORE_PRESETS=[{"id": "gangqinpu-canon-939025", "filenames": ["gangqinpu-939025.pdf"], "metadata": {"title": "Variations on the Kanon (George Winston version)", "composer": "Johann Pachelbel", "arranger": "George Winston / 寒风 (transcription)", "opus": "", "category": "Canon", "tags": ["Canon", "Intermediate & advanced"], "pages": 6, "difficulty": "Intermediate–advanced", "curationRank": 10, "credit": "Complete score pages viewed through the signed-in account; original page images preserved in a local PDF.", "notes": "Intermediate–advanced (editorial estimate). Longer variation arc, independent inner voices, chromatic details and fingerings. Transcription attribution follows the source; not verified as an official publisher edition."}, "sha256": "ab467e39a3aaa249ca5a3c07f36f684a8005148cae04e4453b473288059ddacc"}, {"id": "gangqinpu-canon-939021", "filenames": ["brian-crain-author-canon.pdf", "gangqinpu-939021.pdf"], "metadata": {"title": "Canon in D (Brian Crain)", "composer": "Johann Pachelbel", "arranger": "Brian Crain", "opus": "", "category": "Canon", "tags": ["Canon", "Intermediate & advanced"], "pages": 5, "difficulty": "Intermediate", "curationRank": 20, "credit": "Free original PDF linked by Brian Crain on his official YouTube channel. The author also confirms free sheet music and classroom printing on briancrain.com.", "notes": "Intermediate (editorial estimate). Flowing arpeggios, lyrical voicing and a quiet ending. Original author PDF in D major; replaces the transposed source transcription."}, "sha256": "59ed1b3b6fc569a76057eea16d8b82e16f8801668fff69c9bf2a4b801fe4ab77"}, {"id": "gangqinpu-canon-892760", "filenames": ["gangqinpu-892760.pdf"], "metadata": {"title": "Canon (Emotion 100%)", "composer": "Johann Pachelbel", "arranger": ".伊dên", "opus": "", "category": "Canon", "tags": ["Canon", "Intermediate & advanced"], "pages": 5, "difficulty": "Upper intermediate", "curationRank": 30, "credit": "Complete score pages viewed through the signed-in account; original page images preserved in a local PDF.", "notes": "Upper intermediate (editorial estimate). Lyrical variations with fast melodic passagework and broken-chord accompaniment. Transcription attribution follows the source; not verified as an official publisher edition."}, "sha256": "41f5d4ae9138e5fbfc3f1dd4724ff7e98d6f2f37ea1dd3ff0f2c89a57df98eb2"}, {"id": "gangqinpu-canon-905739", "filenames": ["gangqinpu-905739.pdf"], "metadata": {"title": "Canon Rock (Piano arrangement)", "composer": "Johann Pachelbel", "arranger": "黑白键卧龙", "opus": "", "category": "Canon", "tags": ["Canon", "Intermediate & advanced"], "pages": 11, "difficulty": "Advanced", "curationRank": 40, "credit": "Complete score pages viewed through the signed-in account; original page images preserved in a local PDF.", "notes": "Advanced (editorial estimate). Extended rock-style piano solo, rapid repeated patterns, dense runs and octave/chord passages. Transcription attribution follows the source; not verified as an official publisher edition."}, "sha256": "2779d1b9c66ac066b4c359472b2dd80ac09a4f5f5435d46218e56b28f6db8bfb"}];
// Personal PDFs stay in this browser's IndexedDB. No upload endpoint is used.
(()=>{
 const KEY='piano-personal-scores-v1',DB='piano-personal-pdfs';
 const PRESETS=window.PERSONAL_SCORE_PRESETS||[];
 function read(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(r=>r&&/^scores\/personal\/[A-Za-z0-9_-]+\.pdf$/.test(r.file)&&typeof r.id==='string'&&typeof r.title==='string'):[]}catch{return[]}}
 const stored=read(),catalog=window.CATALOG;
 if(catalog?.rows)for(const row of stored)if(!catalog.rows.some(r=>r.id===row.id))catalog.rows.push(row);
 function database(){return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('pdfs');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('Personal PDF storage is unavailable.'));
 })}
 async function transaction(mode,action){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('pdfs',mode),request=action(tx.objectStore('pdfs'));let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('Unable to save this PDF.'));tx.onabort=()=>reject(tx.error||Error('PDF save cancelled.'))})}finally{db.close()}}
 window.getPersonalPdf=async file=>{const result=await transaction('readonly',s=>s.get(file));if(!(result instanceof Blob))throw Error('This personal PDF is not saved on this device. Return to the library and use Import PDFs.');return result};
 window.importPersonalPdfs=async files=>{
  const next=read();let count=0;
  for(const file of files){
   if(file.size>80*1024*1024)throw Error('Each PDF must be smaller than 80 MB.');
   const header=new Uint8Array(await file.slice(0,5).arrayBuffer());if(String.fromCharCode(...header)!=='%PDF-')throw Error(file.name+' is not a PDF.');
   let preset=PRESETS.find(p=>p.filenames.includes(file.name.toLowerCase()));
   if(preset){const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());const hash=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==preset.sha256)preset=null;}
   const id=preset?.id||'personal-'+crypto.randomUUID(),path='scores/personal/'+id+'.pdf';
   const row={...(preset?.metadata||{}),id,title:preset?.metadata.title||file.name.replace(/\.pdf$/i,''),composer:preset?.metadata.composer||'Personal PDFs',file:path,downloaded:true,linkOnly:false,source:'Personal PDF · this device',bytes:file.size,personal:true,license:'Personal device copy; no public redistribution',tags:[...new Set([...(preset?.metadata.tags||[]),'Personal PDFs'])],scoreFormat:{status:'accepted',label:preset?'Piano grand staff':'Personal PDF',evidence:preset?'Previously reviewed personal edition.':'Imported by this device’s user; notation not automatically reviewed.'}};
   const blob=new Blob([file],{type:'application/pdf'});await transaction('readwrite',s=>s.put(blob,path));
   const index=next.findIndex(r=>r.id===id);if(index<0)next.push(row);else next[index]=row;
   localStorage.setItem(KEY,JSON.stringify(next));count++;
  }
  return count;
 };
 // The importer is available in both the desktop list and touch library.
 if(/\/(?:app|index)\.html$/.test(location.pathname)){
  const host=document.querySelector('.filter-line')||document.getElementById('composer')?.parentElement;if(!host)return;
  const button=document.createElement('button');button.type='button';button.textContent='Import PDFs';button.setAttribute('aria-label','Import personal PDFs');button.className='text-button';host.append(button);
  const input=document.createElement('input');input.type='file';input.accept='application/pdf,.pdf';input.multiple=true;input.hidden=true;input.setAttribute('aria-label','Personal PDF files');document.body.append(input);
  const note=document.createElement('p');note.style.cssText='font:12px system-ui;color:#657469;line-height:1.5';note.textContent='Personal PDFs stay in this browser. Keep the originals. Import George Winston and other personal editions here.';host.after(note);
  button.onclick=()=>input.click();input.onchange=async()=>{
   if(!input.files.length)return;document.body.dataset.personalImporting='true';button.disabled=true;note.textContent='Saving personal PDFs on this device…';
   try{const count=await window.importPersonalPdfs([...input.files]);note.textContent=count+' PDFs saved on this device.';location.reload()}
   catch(e){note.textContent=e.message+' Any PDFs already saved are kept. Reload to view them.';button.disabled=false}
   finally{delete document.body.dataset.personalImporting;input.value=''}
  };
 }
})();
