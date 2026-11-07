import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
const frame=document.querySelector('#preview'),button=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status'),adapter=createPreview(frame,()=>{});
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const wait=ms=>new Promise(r=>setTimeout(r,ms)),rect=e=>e.getBoundingClientRect(),shown=e=>e.checkVisibility({checkVisibilityCSS:true});
const labels={NAV_HOME:'Welcome visitors',NAV_MUSIC:'Christmas music',NAV_INFO:'Show information',NAV_SUPPORT:'Community causes'};
const longMessage='Please make sure you are near the display and that location permission is enabled in your browser. If the request still does not work, refresh the page and try again, or ask a member of our team for help. '.repeat(3);
const additional=new URLSearchParams(location.search).has('additional-sizes');
const moreSizes=[[768,1024,1],[820,1180,2],[1024,768,1.5],[844,390,1],[844,390,2]];
const sizes=additional?moreSizes:[[320,568,1],[320,568,1.5],[320,568,2],[390,844,1],[1280,800,1],[568,320,2],...moreSizes];
async function draw(t,source,s,[width,height,scale],extra={}){
 frame.style.width=width+'px';frame.style.height=height+'px';
 await adapter.update(t.render(source,s),s,{air:true,mode:'jukebox',reset:true,templateId:t.id,landing:t.landing,startAtLanding:true,...extra});
 const d=frame.contentDocument;d.documentElement.style.fontSize=scale*100+'%';await d.fonts.ready;
 await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));return d;
}
function textRects(d,card){
 const out=[],walk=d.createTreeWalker(card,NodeFilter.SHOW_TEXT);
 while(walk.nextNode()){const n=walk.currentNode;if(!n.textContent.trim()||!shown(n.parentElement))continue;const r=d.createRange();r.selectNode(n);out.push(...r.getClientRects());}
 return out;
}
button.onclick=async()=>{button.disabled=true;results.replaceChildren();try{
 for(const t of new URLSearchParams(location.search).has('voting-only')?[]:registry){const source=await(await fetch('../'+t.source)).text();
 for(const theme of Object.keys(t.themes))for(const size of sizes)for(const support of [true,false]){
  const s=t.cloneDefaults(theme);s.showSupportTab=support;s.copy={...labels,LOCATION_MESSAGE:longMessage};
  const d=await draw(t,source,s,size),label=[t.id,theme,size.join('x'),support?'support':'no-support'].join(' '),menu=d.querySelector('.los-menu'),mr=rect(menu),items=[...menu.querySelectorAll('a')].filter(shown);
  status.textContent=label;
  check(label+' labels remain inside their buttons and viewport',mr.top>=0&&mr.bottom<=size[1]+1&&items.every(a=>{const ar=rect(a),lr=rect(a.querySelector('.los-menu__label'));return lr.left>=ar.left-1&&lr.right<=ar.right+1&&lr.top>=ar.top-1&&lr.bottom<=ar.bottom+1;}));
  check(label+' spacers are noninteractive and hidden from accessibility', [...d.querySelectorAll('.nav-clearance')].every(e=>e.getAttribute('aria-hidden')==='true'&&!e.querySelector('a,button,input,[tabindex],[id]')&&getComputedStyle(e).visibility==='hidden'));
  adapter.navigate('info');await wait(400);
  const panel=d.getElementById('info-panel'),last=[...panel.children].filter(e=>!e.classList.contains('nav-clearance')&&shown(e)).at(-1);
  d.documentElement.style.scrollBehavior='auto';panel.scrollTop=panel.scrollHeight;d.defaultView.scrollTo({top:d.documentElement.scrollHeight,behavior:'instant'});await wait(20);
  const spacer=t.id==='festive'?panel.querySelector('.nav-clearance'):d.querySelector('.nav-clearance');
  check(label+' actual menu height is reserved after final content',rect(spacer).height>=rect(menu).height-1&&(!last||rect(last).bottom<=rect(menu).top-8));
  check(label+' no horizontal document overflow',d.documentElement.scrollWidth<=frame.clientWidth+1);
  const modal=d.getElementById('invalidLocation'),box=modal.firstElementChild;modal.style.display='block';box.scrollTop=0;
  const br=rect(box),title=rect(modal.querySelector('.request-feedback__title'));
  check(label+' long popup starts inside the viewport',br.top>=15&&br.bottom<=size[1]-15&&title.top>=br.top);
  box.scrollTop=box.scrollHeight;
  const message=modal.querySelector('.request-feedback__message');
  check(label+' full popup can be scrolled to its end',rect(message).bottom<=rect(box).bottom&&(t.id==='festive'||getComputedStyle(modal).touchAction!=='none'));
  modal.style.display='none';
 }
 // Icon-only menus retain the same clearance contract.
 for(const support of [true,false]){
  const s=t.cloneDefaults();s.showMenuLabels=false;s.showSupportTab=support;const d=await draw(t,source,s,[320,568,2]);
  check(t.id+' icons-only spacer matches menu', [...d.querySelectorAll('.nav-clearance')].every(e=>rect(e).height>=rect(d.querySelector('.los-menu')).height-1));
 }
 }
 // Resizing the same loaded viewer models a phone turning without resetting it.
 for(const t of registry){
  const source=await(await fetch('../'+t.source)).text(),s=t.cloneDefaults();s.copy={...labels,LOCATION_MESSAGE:longMessage};
  const d=await draw(t,source,s,[390,844,1.5]);adapter.navigate('info');await wait(400);
  for(const [width,height] of [[844,390],[568,320],[390,844]]){
   frame.style.width=width+'px';frame.style.height=height+'px';await wait(60);
   const menu=rect(d.querySelector('.los-menu'));
   check(t.id+' rotation '+width+'x'+height+' retains page and reachable menu',d.defaultView.location.hash==='#info-panel'&&menu.top>=0&&menu.bottom<=height+1&&d.documentElement.scrollWidth<=width+1);
   const modal=d.getElementById('invalidLocation');modal.style.display='block';const box=rect(modal.firstElementChild);
   check(t.id+' rotation '+width+'x'+height+' keeps popup in view',box.top>=15&&box.bottom<=height-15);modal.style.display='none';
  }
 }
 const t=registry.find(t=>t.id==='festive'),source=await(await fetch('../'+t.source)).text();
 const names=['One More Rainbow','A long sequence title shared by our neighbourhood and friends','A brand new song for a wonderful evening'];
 const image='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="purple"/></svg>');
 for(const theme of additional?[]:Object.keys(t.themes))for(const size of [[320,568,1],[320,568,2],[390,844,1],[1280,800,1]])for(const artwork of ['album','category','none'])for(const grouped of [true,false]){
  const s=t.cloneDefaults(theme);s.songArtwork=artwork;s.newNames=names[1]+'\n'+names[2];s.movingHeadNames=names[1];s.categories=grouped;
  const catalogue={songs:names.map(name=>({name,displayName:name,artist:'An illustrative artist with a long descriptive name',imageUrl:image,category:grouped?s.categoryNames[0]:''}))};
  const d=await draw(t,source,s,size,{mode:'voting',catalogue,landing:'music'});adapter.navigate('music');await wait(60);
  const label=[theme,size.join('x'),artwork,grouped?'grouped':'ungrouped'].join(' '),cards=[...d.querySelectorAll('.los-song-list .cell-vote-playlist')].filter(shown);
  status.textContent=label;
  check(label+' RF song text does not overlap its tally',cards.length===3&&cards.every(card=>{const tally=card.nextElementSibling,tr=rect(tally);return textRects(d,card).every(r=>Math.min(r.right,tr.right)-Math.max(r.left,tr.left)<=1||Math.min(r.bottom,tr.bottom)-Math.max(r.top,tr.top)<=1);}));
  check(label+' song text is not clipped horizontally',cards.every(card=>{const cr=rect(card);return textRects(d,card).every(r=>r.left>=cr.left-1&&r.right<=cr.right+1);}));
  const font=parseFloat(getComputedStyle(d.documentElement).fontSize),narrow=rect(d.querySelector('.los-song-list')).width<=16*font;
  check(label+' narrow NEW and combined badges stay above song text',!narrow||cards.filter(c=>names.slice(1).includes(c.dataset.key)).every(c=>textRects(d,c).every(r=>r.top>=rect(c).top+5*font-1)));
  check(label+' native voting markup and tap targets remain intact',cards.every(c=>c.getAttribute('role')==='button'&&c.nextElementSibling.classList.contains('cell-vote')&&getComputedStyle(c.nextElementSibling).pointerEvents==='none'));
 }
}catch(error){check(error.stack,false);}finally{button.disabled=false;status.textContent='Finished';document.title=results.querySelectorAll('.fail').length+' failures - Responsive overflow checks';}};
