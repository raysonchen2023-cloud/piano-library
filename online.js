(()=>{
 const $=id=>document.getElementById(id);let key='',api=window.PIANO_PRESENCE?.api,busy=false;
 async function refresh(){
  if(!key||!api||busy||document.visibilityState==='hidden')return;busy=true;
  try{
   const r=await fetch(api+'/online',{headers:{Authorization:'Bearer '+key},credentials:'omit',cache:'no-store'});
   if(!r.ok)throw Error(r.status===401?'Owner access key was not accepted.':'Unable to load online viewers ('+r.status+').');
   const data=await r.json();$('count').textContent=data.count;$('viewers').replaceChildren();
   for(const v of data.viewers){const tr=document.createElement('tr');for(const text of [v.name,v.device,v.title+(v.page?' · p. '+v.page:''),Math.max(0,Math.round((data.asOf-v.lastSeen)/1000))+'s ago']){const td=document.createElement('td');td.textContent=text;tr.append(td)}$('viewers').append(tr)}
   $('empty').hidden=!!data.count;$('status').textContent='Updated '+new Date(data.asOf).toLocaleTimeString()+(data.truncated?' · Partial list; refresh again.':'');$('dashboard').hidden=false;$('login').hidden=true;
  }catch(e){$('dashboard').hidden=false;$('count').textContent='—';$('viewers').replaceChildren();$('status').textContent=e.message;$('login').hidden=false}finally{busy=false}
 }
 $('login').onsubmit=e=>{e.preventDefault();key=$('ownerKey').value.trim();refresh()};$('refresh').onclick=refresh;
 $('disconnect').onclick=()=>{key='';$('ownerKey').value='';$('dashboard').hidden=true;$('login').hidden=false};
 $('copyKey').onclick=async()=>{try{await navigator.clipboard.writeText(key);$('status').textContent='Owner key copied. Keep it private.'}catch{$('status').textContent='Copy is unavailable; use the owner access key from the local configuration.'}};
 document.addEventListener('visibilitychange',refresh);setInterval(refresh,10_000);
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname))fetch('/_presence/owner-config',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(c=>{key=c.key;api=c.api;refresh()}).catch(()=>{$('status').textContent='Owner connection is not configured on this computer.'});
})();
