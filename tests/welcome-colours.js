import {registry} from '../src/template-registry.js';
import {createPreview} from '../src/preview.js';
import {createDesignStore} from '../src/design-store.js';
import {assetBase} from '../src/assets.js';
import {setHeaderArtwork} from '../src/header-artwork.js';
const frame=document.querySelector('#preview'),editor=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status'),preview=createPreview(frame,()=>{});
const positions=['header','above-header','below-header','status'],viewports=[[320,568],[844,390],[1024,768],[1280,800]],text='Welcome to our lights. Please enjoy the show and leave driveways clear.\nThank you for visiting. '.repeat(3),wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const visible=e=>!!e&&e.getClientRects().length&&e.getBoundingClientRect().height>0&&e.ownerDocument.defaultView.getComputedStyle(e).display!=='none';
const flow=e=>visible(e)&&!['absolute','fixed'].includes(e.ownerDocument.defaultView.getComputedStyle(e).position),rect=e=>e.getBoundingClientRect();
function styles(e){const s=e.ownerDocument.defaultView.getComputedStyle(e);return [s.backgroundColor,s.color];}
function unaffected(panel){return [...panel.querySelectorAll('.section-card:not(.welcome-message),.neighbour-message,.share-brand h1')].filter(e=>visible(e)&&!e.closest('.welcome-message')).map(e=>styles(e));}
function contentWidth(panel){const a=[...panel.querySelectorAll('.cc-lights[aria-hidden="true"],.cc-holly[aria-hidden="true"]')].map(e=>[e,e.getAttribute('style')]);try{for(const[e]of a)e.style.setProperty('display','none','important');return panel.scrollWidth;}finally{for(const[e,s]of a)if(s===null)e.removeAttribute('style');else e.setAttribute('style',s);}}
async function show(t,source,s,o){
 frame.style.width=o.width+'px';frame.style.height=o.height+'px';const html=t.render(source,s);
 if(o.surface==='export'){
  const d=new DOMParser().parseFromString(html.replaceAll(assetBase,new URL('../assets/',import.meta.url).href),'text/html');
  for(const e of d.querySelectorAll('*')){if(e.hasAttribute('{after-hours-message}')&&o.air)e.replaceChildren();if(e.hasAttribute('{jukebox-dynamic-container}')&&(!o.air||o.mode!=='jukebox'))e.replaceChildren();if(e.hasAttribute('{playlist-voting-dynamic-container}')&&(!o.air||o.mode!=='voting'))e.replaceChildren();if(e.hasAttribute('{location-code-dynamic-container}'))e.replaceChildren();}
  await new Promise(r=>{frame.onload=r;frame.srcdoc='<!doctype html>'+d.documentElement.outerHTML;});
 }else await preview.update(html,s,{air:o.air,mode:o.mode,reset:true,templateId:t.id,landing:t.landing});
 const d=frame.contentDocument;if(o.large)d.documentElement.style.fontSize='24px';await d.fonts.ready;await Promise.all([...d.images].map(i=>i.decode().catch(()=>{})));return d;
}
async function pair(t,source,theme,position,surface,index,extra={}){
 const [width,height]=viewports[index%4],s=t.cloneDefaults(theme),o={width,height,surface,air:true,mode:index%2?'voting':'jukebox',...extra};
 Object.assign(s,{showWelcome:true,welcome:text,welcomeStyle:'card',welcomePosition:position,showMainGuidance:true,guidancePosition:position==='header'?'below-header':position,neighbourTitle:'Visitor guidance',neighbourText:'Keep paths clear and radios quiet.',showNameOnHome:true,name:'Our personalised show name',logoMode:['none','seasonal','custom',t.features.headerIconMode][index%4],logo:assetBase+'christmas-header.webp',customWelcomeColours:false,welcomeCardColour:'#17324d',welcomeTextColour:'#ffe6a3',...extra.settings});setHeaderArtwork(s,index%2?'classic':'none');
 const tag=[t.id,theme,position,surface,width+'x'+height,o.mode,o.large?'large':'normal',extra.label||''].join(' ');status.textContent=tag;
 let d=await show(t,source,s,o),h=d.querySelector('.share-brand'),panel=h.parentElement,baseline=unaffected(panel),card=[...panel.querySelectorAll('.welcome-message.section-card')].find(visible);
 const baselineColour=card?styles(card):null,baselineText=card?styles(card.querySelector('p')):null;
 const noFields={...s};delete noFields.customWelcomeColours;delete noFields.welcomeCardColour;delete noFields.welcomeTextColour;
 check(tag+' disabled override preserves default output byte-for-byte',t.render(source,s)===t.render(source,noFields));
 s.customWelcomeColours=true;d=await show(t,source,s,o);h=d.querySelector('.share-brand');panel=h.parentElement;card=[...panel.querySelectorAll('.welcome-message.section-card')].find(visible);
 check(tag+' visitor guidance, other cards and show name keep theme colours',JSON.stringify(unaffected(panel))===JSON.stringify(baseline));
 const expected=s.showWelcome&&s.welcome.trim()&&s.welcomeStyle==='card'&&(position!=='status'||o.air);
 check(tag+' card activation respects style, visibility, text and live status',!!card===!!expected);
 if(card){
  check(tag+' background override beats theme including nested status',styles(card)[0]==='rgb(23, 50, 77)');check(tag+' override removes theme background images',d.defaultView.getComputedStyle(card).backgroundImage==='none');check(tag+' text override beats theme including paragraph rule',styles(card.querySelector('p'))[1]==='rgb(255, 230, 163)');
  const hr=rect(h),cr=rect(card),p=card.querySelector('p');check(tag+' card contains its text',rect(p).top>=cr.top-1&&rect(p).bottom<=cr.bottom+1&&p.scrollWidth<=p.clientWidth+1);
  check(tag+' selected placement remains correct',position==='header'?h.contains(card):position==='above-header'?cr.bottom<=hr.top+1:position==='below-header'?cr.top>=hr.bottom-1:!!card.closest('[\\{jukebox-dynamic-container\\}],[\\{playlist-voting-dynamic-container\\}]'));
  const guides=[...panel.querySelectorAll('.visitor-guidance:not(.welcome-message),.neighbour-message')].filter(e=>visible(e)&&!e.closest('.welcome-message'));
  check(tag+' welcome never overlaps guidance',guides.every(g=>{const r=rect(g);return cr.bottom<=r.top+1||r.bottom<=cr.top+1||cr.right<=r.left+1||r.right<=cr.left+1;}));
  const blocks=[...panel.children].filter(flow);check(tag+' page blocks do not overlap',blocks.every((e,i)=>!i||rect(blocks[i-1]).bottom<=rect(e).top+1));
  check(tag+' header contains its identity and artwork',[...h.children].filter(flow).every(e=>rect(e).top>=hr.top-1&&rect(e).bottom<=hr.bottom+1));
 }
 check(tag+' no page or panel overflow',d.documentElement.scrollWidth<=o.width+1&&contentWidth(panel)<=panel.clientWidth+1);
 if(surface==='export')check(tag+' export remains script-free',!d.querySelector('script,[data-demo-badges]'));
 const retained=t.checkedSettings(s);check(tag+' choices retained through normalization',retained.customWelcomeColours&&retained.welcomeCardColour==='#17324d'&&retained.welcomeTextColour==='#ffe6a3');
 s.customWelcomeColours=false;d=await show(t,source,s,o);card=[...d.querySelectorAll('.welcome-message.section-card')].find(visible);
 check(tag+' disabling restores exact theme background and text',JSON.stringify(card?styles(card):null)===JSON.stringify(baselineColour)&&JSON.stringify(card?styles(card.querySelector('p')):null)===JSON.stringify(baselineText));
}
async function controls(t){
 const store=createDesignStore(localStorage);for(const theme of ['christmas','halloween']){store.select(t.id,theme);const s=t.cloneDefaults(theme);Object.assign(s,{showWelcome:true,welcome:text,welcomeStyle:'card',welcomePosition:'header'});store.save({settings:s,catalogue:null});}store.select(t.id,'christmas');
 const reload=()=>new Promise(r=>{editor.onload=()=>setTimeout(r,550);editor.contentWindow.location.reload();});await reload();
 const q=s=>editor.contentDocument.querySelector(s),read=()=>createDesignStore(localStorage).read().settings;
 const click=async s=>{const e=q(s);if(!e)throw Error('Missing control '+s);e.click();await wait(240);};
 const input=async(s,v)=>{const e=q(s);if(!e)throw Error('Missing field '+s);for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;if(e.type==='checkbox')e.checked=v;else e.value=v;e.dispatchEvent(new editor.contentWindow.Event('input',{bubbles:true}));e.dispatchEvent(new editor.contentWindow.Event('change',{bubbles:true}));await wait(320);};
 await click('[data-editor-group="'+t.landing+'"]');await input('[data-key=customWelcomeColours]',true);await input('[data-key=welcomeCardColour]','#17324d');await input('[data-key=welcomeTextColour]','#ffe6a3');
 check(t.id+' editor saves explicit card and text colours',read().customWelcomeColours&&read().welcomeCardColour==='#17324d'&&read().welcomeTextColour==='#ffe6a3');
 await input('[data-key=welcomeStyle]','plain');await input('[data-key=showWelcome],[data-header-text-master]',false);check(t.id+' plain and hidden retain colour choices',read().customWelcomeColours&&read().welcomeCardColour==='#17324d'&&read().welcomeTextColour==='#ffe6a3');
 await input('[data-key=showWelcome],[data-header-text-master]',true);await input('[data-key=welcomeStyle]','card');await reload();check(t.id+' reload retains overrides',read().customWelcomeColours&&read().welcomeCardColour==='#17324d'&&read().welcomeTextColour==='#ffe6a3');
 await click('[data-editor-group=setup]');await click('[data-season=halloween]');check(t.id+' other theme retains its theme-colour default',!read().customWelcomeColours);await click('[data-season=christmas]');check(t.id+' returning theme restores explicit welcome colours',read().customWelcomeColours&&read().welcomeCardColour==='#17324d');
 await click('[data-editor-group="'+t.landing+'"]');await click('[data-reset-welcome-colours]');check(t.id+' theme-colour reset disables override but keeps choices',!read().customWelcomeColours&&read().welcomeCardColour==='#17324d'&&read().welcomeTextColour==='#ffe6a3');await input('[data-key=customWelcomeColours]',true);
 await click('#reset-settings');await click('#confirm-reset');check(t.id+' current reset restores disabled override and colour defaults',!read().customWelcomeColours&&read().welcomeCardColour==='#263746'&&read().welcomeTextColour==='#ffffff');
}
run.onclick=async()=>{if(location.hostname!=='localhost')throw Error('Disposable localhost only');const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();try{
 for(const t of registry){const source=await(await fetch('../'+t.source)).text();let index=0;
  for(const theme of Object.keys(t.themes))for(const position of positions)for(const surface of ['preview','export'])await pair(t,source,theme,position,surface,index++);
  for(const position of positions)for(const [width,height]of viewports)for(const surface of ['preview','export'])await pair(t,source,'christmas',position,surface,index++,{width,height,label:'edited theme palette',settings:{advancedColours:true,colours:{...t.cloneDefaults('christmas').colours,card:'#684329',text:'#b7edcc',secondary:'#c0c8e8'}}});
  for(const position of positions)for(const surface of ['preview','export'])await pair(t,source,'christmas',position,surface,index++,{width:320,height:568,large:true,label:'enlarged'});
  for(const [label,settings,air]of [['plain',{welcomeStyle:'plain'},true],['hidden',{showWelcome:false},true],['blank',{welcome:''},true],['off-air',{},false]])for(const surface of ['preview','export'])await pair(t,source,'halloween','status',surface,index++,{label,settings,air});
  await controls(t);
 }
 }catch(e){check(e.stack||String(e),false);}finally{localStorage.clear();for(const[k,v]of saved)localStorage.setItem(k,v);run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Welcome colours';}};