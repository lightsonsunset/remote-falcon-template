import {registry} from '../src/template-registry.js';import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#preview'),button=document.querySelector('#run'),results=document.querySelector('#results'),adapter=createPreview(frame,()=>{}),wait=ms=>new Promise(r=>setTimeout(r,ms));
const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none';
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
button.onclick=async()=>{button.disabled=true;results.replaceChildren();try{
 for(const template of registry){const source=await (await fetch('../'+template.source)).text();for(const season of Object.keys(template.themes))for(const mode of ['jukebox','voting']){
  const s=template.cloneDefaults(season);s.newFilter=true;s.categories=true;s.showSupportTab=false;s.showAlbumArtwork=false;s.showQueueLimit=true;
  frame.style.width='320px';frame.style.height='844px';await adapter.update(template.render(source,s),s,{air:true,mode,reset:true,templateId:template.id,landing:'music'});adapter.navigate('music');await wait(50);let doc=frame.contentDocument;const label=template.name+' '+season+' '+mode;
  check(label+': no horizontal overflow',doc.body.scrollWidth<=doc.documentElement.clientWidth+1);
  const limit=doc.querySelector('.queue-limit');check(label+': capacity only in Jukebox',mode==='jukebox'?visible(limit)&&limit.textContent.includes('10 songs'):!visible(limit));
  if(template.features.dateTiles&&mode==='jukebox'){const queue=doc.querySelector('.cc-queue'),picker=doc.querySelector('.music-request-card');check(label+': queue starts collapsed above song choices',!queue.open&&!!(queue.compareDocumentPosition(picker)&Node.DOCUMENT_POSITION_FOLLOWING));}
  check(label+': Support menu hidden',!visible(doc.querySelector('[data-tab-target="support"]')));
  check(label+': artwork hidden',![...doc.querySelectorAll('.los-song-list img')].some(visible));
  const container=doc.getElementById(mode==='voting'?'voting_playlists_container':'playlists_container'),rows=()=>[...container.querySelectorAll(mode==='voting'?'.cell-vote-row':'.jukebox-list')].filter(visible);
  doc.querySelector('#music-panel a[href="#songs-new"]').click();await wait(50);check(label+': NEW filter uses sash assignments',rows().length===2);
  doc.querySelector('#music-panel a[href="#songs-category-2"]').click();await wait(50);check(label+': positional category filter',visible(container.querySelectorAll('.category-section')[1])&&!visible(container.querySelectorAll('.category-section')[0]));
  adapter.navigate('support');await wait(30);check(label+': direct Support still available',visible(doc.getElementById('support-panel')));
  if(template.features.dateTiles){adapter.navigate('music');await wait(30);doc.documentElement.style.fontSize='24px';check(label+': enlarged text fits',doc.body.scrollWidth<=doc.documentElement.clientWidth+1);const spider=doc.querySelector('.cc-hanger');check(label+': seasonal decoration',season==='halloween'?!!spider:season==='christmas'?!!doc.querySelector('.cc-lights'):!!doc.querySelector('.season-header-art'));
   await adapter.update(template.render(source,s),s,{air:false,mode,templateId:template.id,landing:'music'});adapter.navigate('music');await wait(30);doc=frame.contentDocument;check(label+': one off-air schedule', [...doc.querySelectorAll('#music-panel .cc-schedule')].filter(visible).length===1);check(label+': no active off-air song controls',![...doc.querySelectorAll('.los-song-list')].some(visible));
  }
  await adapter.update(template.render(source,s),s,{air:false,mode,templateId:template.id,landing:'music'});check(label+': capacity absent off air',!visible(frame.contentDocument.querySelector('.queue-limit')));
 }}
}catch(e){check(e.stack,false);}finally{button.disabled=false;document.title=results.querySelectorAll('.fail').length+' failures · Registered template checks';}};
