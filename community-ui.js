(()=>{
 const cfg=window.PIANO_FEEDBACK||{};
 const $=id=>document.getElementById(id),read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}},save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
 const settings=document.createElement('dialog');settings.id='settingsDialog';settings.className='community-dialog';settings.setAttribute('aria-labelledby','settingsTitle');
 settings.innerHTML='<div class="community-head"><h2 id="settingsTitle">Settings</h2><button type="button" class="community-button" data-close>Close</button></div><label>Language<select id="guiLanguage" aria-label="Language"><option value="en" data-no-translate>English</option><option value="zh-TW" data-no-translate>繁體中文</option></select></label><p>Language is saved on this device. Score and composer names stay in their original language.</p><div class="community-actions"><button type="button" class="community-button community-primary" id="settingsFeedback">Feedback &amp; score requests</button><button type="button" class="community-button" id="settingsRequests">My requests</button></div><div id="devArea"></div>';
 document.body.append(settings);settings.querySelector('[data-close]').onclick=()=>settings.close();$('guiLanguage').value=window.PIANO_I18N?.language||'en';$('guiLanguage').onchange=()=>window.PIANO_I18N?.setLanguage($('guiLanguage').value);
 const feedback=document.createElement('dialog');feedback.id='feedbackDialog';feedback.className='community-dialog';feedback.setAttribute('aria-labelledby','feedbackTitle');
 feedback.innerHTML=`<div class="community-head"><h2 id="feedbackTitle">Feedback &amp; score requests</h2><button type="button" class="community-button" data-close>Close</button></div><form id="feedbackForm"><label>Type<select name="kind" id="feedbackKind"><option value="score_request">Score request</option><option value="bug">Bug report</option><option value="other">Other feedback</option></select></label><label>Title<input name="title" id="feedbackSubject" required maxlength="160" placeholder="Song title, composer or problem"></label><label>Details<textarea name="message" id="feedbackMessage" maxlength="4000" placeholder="Edition, arrangement, difficulty, or steps to reproduce"></textarea></label><label>Reference link (optional)<input name="link" id="feedbackLink" type="url" maxlength="1000" placeholder="https://"></label><label>Your name (optional)<input name="name" id="feedbackName" maxlength="60" autocomplete="nickname"></label><label for="feedbackPhotos">Photo (optional)</label><input id="feedbackPhotos" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple><p id="photoStatus" role="status">No photos selected</p><div class="community-photos" id="feedbackPreviews"></div><label class="community-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><p>Your feedback and photos are sent to the library owner for handling. Photos are private and are not published with the scores.</p><p>The developer is notified right away. Replies appear in My requests.</p><p id="feedbackStatus" class="community-status" role="status" aria-live="polite"></p><div class="community-actions"><button type="submit" class="community-button community-primary" id="sendFeedback">Send feedback</button><button type="button" class="community-button" id="feedbackMyRequests">View my requests</button></div></form>`;
 document.body.append(feedback);feedback.querySelector('[data-close]').onclick=()=>feedback.close();
 const requests=document.createElement('dialog');requests.id='myRequestsDialog';requests.className='community-dialog';requests.setAttribute('aria-labelledby','requestsTitle');requests.innerHTML='<div class="community-head"><h2 id="requestsTitle">My requests</h2><button type="button" class="community-button" data-close>Close</button></div><button type="button" class="community-button" id="refreshRequests">Refresh status</button><p id="requestsStatus" role="status"></p><div id="myRequestList"></div>';document.body.append(requests);requests.querySelector('[data-close]').onclick=()=>requests.close();
 let photos=[],preparing=false,sending=false,attempt=null;const revoke=()=>photos.forEach(p=>URL.revokeObjectURL(p.url));
 function preview(){const host=$('feedbackPreviews');host.replaceChildren();photos.forEach((p,index)=>{const figure=document.createElement('figure'),img=document.createElement('img'),remove=document.createElement('button');img.src=p.url;img.alt='Photo '+(index+1);remove.type='button';remove.className='community-button';remove.textContent='Remove';remove.onclick=()=>{URL.revokeObjectURL(p.url);photos.splice(index,1);attempt=null;preview()};figure.append(img,remove);host.append(figure)});$('photoStatus').textContent=photos.length?photos.length+' photo(s) ready':'No photos selected'}
 async function prepare(file){
  if(file.size>20*1024*1024)throw Error('Photo is too large. Use an image smaller than 20 MB.');
  let image,url;try{url=URL.createObjectURL(file);image=new Image();image.src=url;await image.decode();const ratio=Math.min(1,1800/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.86));if(!blob||blob.size>2*1024*1024)throw Error();return {blob,url:URL.createObjectURL(blob)}}catch{throw Error('Use JPEG, PNG or WebP. For HEIC photos, use a screenshot or export to JPEG.')}finally{if(url)URL.revokeObjectURL(url)}
 }
 $('feedbackPhotos').onchange=async e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(files.length+photos.length>1){$('photoStatus').textContent='Attach one photo.';return}preparing=true;$('sendFeedback').disabled=true;$('photoStatus').textContent='Preparing photos…';try{for(const file of files)photos.push(await prepare(file));attempt=null;preview()}catch(error){preview();$('photoStatus').textContent=error.message}finally{preparing=false;$('sendFeedback').disabled=false}};
 const draftKey='piano-feedback-draft-v1',draft=read(draftKey,{});for(const name of ['kind','title','message','link','name'])if(typeof draft[name]==='string')$('feedbackForm').elements.namedItem(name).value=draft[name];
 $('feedbackForm').addEventListener('input',()=>{attempt=null;const data={};for(const name of ['kind','title','message','link','name'])data[name]=$('feedbackForm').elements.namedItem(name).value;save(draftKey,data)});
 const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 // Feedback goes to the owner's Google Form (same approach as the xiangqi app); offline entries wait on the device.
 const kinds={score_request:'🎵 求譜',bug:'🐞 問題回報',other:'💬 其他'};
 const isDev=()=>read('piano-dev-mode',false)===true;
 const deviceName=()=>{const u=navigator.userAgent;return /iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)?'iPad':/iPhone/.test(u)?'iPhone':/Android/.test(u)?'Android':'Computer'};
 async function shrink(blob){
  const url=URL.createObjectURL(blob);
  try{
   const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas'),cx=cv.getContext('2d');
   for(const [side,q] of [[1100,.5],[960,.42],[860,.36],[780,.32],[720,.28],[640,.25],[560,.22],[480,.2]]){
    const k=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight));cv.width=Math.round(im.naturalWidth*k);cv.height=Math.round(im.naturalHeight*k);
    cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(im,0,0,cv.width,cv.height);
    const d=cv.toDataURL('image/jpeg',q);if(d.length<=30000)return d;
   }
   return '';
  }finally{URL.revokeObjectURL(url)}
 }
 function post(rec){
  const f=cfg.fields||{},body=new URLSearchParams();
  for(const k in f)if(f[k]&&rec[k]!=null)body.append(f[k],String(rec[k]).slice(0,k==='img'?31000:k==='text'?45000:2000));
  if(navigator.sendBeacon&&navigator.sendBeacon(cfg.action,body))return Promise.resolve();
  return fetch(cfg.action,{method:'POST',mode:'no-cors',body});
 }
 // Content-free alert so the developer's computer knows to read the sheet.
 function ping(rec){
  if(!cfg.notify)return;
  try{const m=rec.type+(rec.img?' · photo':'')+' · '+rec.role;if(!(navigator.sendBeacon&&navigator.sendBeacon(cfg.notify,m)))fetch(cfg.notify,{method:'POST',body:m,mode:'no-cors'}).catch(()=>{})}catch{}
 }
 async function deliver(rec){await post(rec);ping(rec)}
 async function flush(){
  const q=read('piano-feedback-queue-v2',[]);if(!q.length||!navigator.onLine||!cfg.action)return;
  const left=[];for(const r of q){try{await deliver(r)}catch{left.push(r)}}save('piano-feedback-queue-v2',left);
 }
 window.addEventListener('online',flush);setTimeout(flush,3000);
 $('feedbackForm').onsubmit=async event=>{
  event.preventDefault();if(sending||preparing)return;
  if(!$('feedbackSubject').value.trim()){$('feedbackStatus').textContent='Please enter a title.';return}
  if(!cfg.action){$('feedbackStatus').textContent='Feedback is not set up yet.';return}
  sending=true;document.body.dataset.feedbackSending='true';$('sendFeedback').disabled=true;$('feedbackStatus').textContent='Sending…';
  try{
   const el=n=>$('feedbackForm').elements.namedItem(n).value.trim();
   if(el('website'))throw Error('Unable to send feedback.');
   const params=new URLSearchParams(location.search),row=window.CATALOG?.rows?.find(r=>r.id===params.get('id'));
   const ticket='P'+Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>(b%36).toString(36)).join('').toUpperCase();
   let visitor='';try{visitor=localStorage.getItem('piano-visitor-id')||''}catch{}
   const who=el('name')||visitor;
   const text=[el('title'),el('message'),el('link')?'Link: '+el('link'):'','Ticket: '+ticket].filter(Boolean).join('\n\n');
   const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
   const rec={type:kinds[el('kind')]||kinds.other,text,contact:who,id:who||'(anonymous)',
    device:deviceName()+' · '+innerWidth+'x'+innerHeight+(standalone?' · home screen':' · browser'),
    version:(window.PIANO_VERSION?.version||'local')+' · '+(location.pathname.split('/').pop()||'app.html'),
    page:row?[row.title,row.composer||'','p.'+($('page')?.value||''),row.id].join(' · '):(location.pathname.split('/').pop()||'app.html'),
    role:isDev()?'開發者':'訪客',img:photos[0]?await shrink(photos[0].blob):''};
   let queued=false;
   if(navigator.onLine){try{await deliver(rec)}catch{queued=true}}else queued=true;
   if(queued){const q=read('piano-feedback-queue-v2',[]);q.push(rec);save('piano-feedback-queue-v2',q.slice(-20))}
   const history=read('piano-feedback-tickets-v1',[]);history.unshift({id:ticket,title:el('title'),at:Date.now(),form:true});save('piano-feedback-tickets-v1',history.slice(0,30));
   save(draftKey,{});revoke();photos=[];preview();$('feedbackForm').reset();
   $('feedbackStatus').textContent=queued?'Saved on this device. It will be sent when you are online.':'Feedback sent. Replies appear in My requests.';
   const number=document.createElement('p');number.textContent='Ticket: '+ticket;$('feedbackStatus').append(number);
  }catch(error){$('feedbackStatus').textContent=error.message||'Unable to send feedback.'}
  finally{sending=false;delete document.body.dataset.feedbackSending;$('sendFeedback').disabled=false}
 };
 const statusNames={new:'New',in_progress:'In progress',completed:'Completed',needs_info:'Needs information',unavailable:'Unavailable'};
 // Replies are published as feedback-replies.json: {ticket:{status,reply,links}}. Ticket codes are random, so only the sender's device knows them.
 async function refreshRequests(){
  const list=$('myRequestList'),history=read('piano-feedback-tickets-v1',[]);list.replaceChildren();
  $('requestsStatus').textContent=history.length?'Checking replies…':'No requests on this device yet.';
  let replies={};try{const r=await fetch('feedback-replies.json?t='+Date.now(),{cache:'no-store'});if(r.ok)replies=await r.json()}catch{}
  for(const ticket of history){
   const article=document.createElement('article');article.className='community-ticket';
   const title=document.createElement('strong');title.textContent=ticket.title;title.dataset.noTranslate='';article.append(title);
   const data=replies[ticket.id]||null,status=document.createElement('span');status.className='ticket-state';
   status.textContent=data?(statusNames[data.status]||data.status):(ticket.form?'Sent':'Earlier request');article.append(status);
   if(data?.reply){const reply=document.createElement('p');reply.textContent=data.reply;reply.dataset.noTranslate='';article.append(reply)}
   for(const url of data?.links||[]){if(!/^https:\/\//i.test(url))continue;const a=document.createElement('a');a.href=url;a.textContent=url;a.target='_blank';a.rel='noopener noreferrer';article.append(a)}
   const id=document.createElement('p');id.textContent='Ticket: '+ticket.id;article.append(id);list.append(article);
  }
  if(history.length)$('requestsStatus').textContent='';
 }
 // Developer login: same account as the xiangqi app. Only a hash is stored here; the feedback sheet itself needs the owner's Google sign-in.
 const DEV_HASH='4e72cb09c4ef78623b6da77400fb8f31c53bf87f847fd4659e8e1c4c4c1a48ed';
 async function devHash(u,p){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('xqlab-dev:'+u+':'+p));return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('')}
 const devDialog=document.createElement('dialog');devDialog.className='community-dialog';
 devDialog.innerHTML='<div class="community-head"><h2>Developer login</h2><button type="button" class="community-button" data-close>Close</button></div><form id="devForm"><label>Account<input id="devUser" autocomplete="username" autocapitalize="off"></label><label>Password<input id="devPass" type="password" autocomplete="current-password"></label><p id="devError" class="community-status" role="status"></p><div class="community-actions"><button type="submit" class="community-button community-primary">Log in</button></div></form>';
 document.body.append(devDialog);devDialog.querySelector('[data-close]').onclick=()=>devDialog.close();
 devDialog.querySelector('#devForm').onsubmit=async e=>{
  e.preventDefault();const u=$('devUser').value.trim(),pw=$('devPass').value;if(!u||!pw)return;
  let h='';try{h=await devHash(u,pw)}catch{}$('devPass').value='';
  if(h===DEV_HASH){save('piano-dev-mode',true);devDialog.close();paintDev();settings.showModal()}else $('devError').textContent='Wrong account or password.';
 };
 function paintDev(){
  const host=$('devArea');if(!host)return;host.replaceChildren();const row=document.createElement('div');row.className='community-actions';
  if(isDev()){
   const note=document.createElement('p');note.textContent='Developer mode is on. Your feedback is marked as developer.';
   const sheet=document.createElement('a');sheet.className='community-button';sheet.href=cfg.sheet||'#';sheet.target='_blank';sheet.rel='noopener';sheet.textContent='Feedback sheet';
   row.append(sheet,button('Log out',()=>{save('piano-dev-mode',false);paintDev()}));host.append(note,row);
  }else{
   row.append(button('Developer login',()=>{settings.close();$('devError').textContent='';devDialog.showModal();setTimeout(()=>$('devUser').focus(),50)}));host.append(row);
  }
 }
 function openFeedback(kind){if(settings.open)settings.close();if(requests.open)requests.close();if(kind)$('feedbackKind').value=kind;feedback.showModal()}
 function openRequests(){if(settings.open)settings.close();if(feedback.open)feedback.close();requests.showModal();refreshRequests()}
 $('settingsFeedback').onclick=()=>openFeedback();$('settingsRequests').onclick=$('feedbackMyRequests').onclick=openRequests;$('refreshRequests').onclick=refreshRequests;
 const button=(text,action)=>{const b=document.createElement('button');b.type='button';b.className='community-button';b.textContent=text;b.onclick=action;return b};
 paintDev();
 const openSettings=()=>{$('guiLanguage').value=window.PIANO_I18N?.language||'en';settings.showModal()};
 const nav=document.querySelector('.bottom-tabs');if(nav){const b=button('Settings',openSettings);const icon=document.createElement('span');icon.textContent='⚙';b.prepend(icon);nav.append(b);const home=document.querySelector('#homePanel .welcome');if(home){const row=document.createElement('div');row.className='community-actions';row.append(button('Request a score / Report a problem',()=>openFeedback()));home.after(row)}}
 else {const host=document.querySelector('.player')||document.querySelector('main');if(host){const row=document.createElement('div');row.className='community-actions reader-community-actions';row.append(button('Settings',openSettings),button('Feedback',()=>openFeedback()));host.prepend(row)}}
 window.PIANO_COMMUNITY={openSettings,openFeedback,openRequests};
})();
