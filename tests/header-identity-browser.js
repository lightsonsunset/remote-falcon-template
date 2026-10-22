import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {assetBase} from '../src/assets.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),status=document.querySelector('#status');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),q=s=>frame.contentDocument.querySelector(s),read=()=>createDesignStore(localStorage).read().settings;
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+name;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
const click=async selector=>{q(selector).click();await wait(45);};
const input=async(selector,value,delay=350)=>{const el=q(selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(delay);};
const openIdentity=async()=>{await click('[data-editor-group="setup"]');q('[data-section="2"]').open=true;};
const header=()=>q('#preview').contentDocument.querySelector('.share-brand');
const fits=()=>{const d=q('#setup-wizard'),r=d.getBoundingClientRect();return r.left>=0&&r.right<=frame.clientWidth+1&&d.scrollWidth<=d.clientWidth+1;};
run.onclick=async()=>{
 if(location.hostname!=='localhost'||['4188','4198'].includes(location.port))throw Error('Use a disposable localhost port.');
 const saved=Object.entries(localStorage);run.disabled=true;results.replaceChildren();
 try{for(const t of registry)for(const theme of Object.keys(t.themes)){
  const tag=t.id+' '+theme;status.textContent=tag;frame.style.width='1280px';frame.style.height='1000px';
  const s=t.cloneDefaults(theme);s.logo=assetBase+'christmas-header.webp';s.icons.brand='crow';s.name='Our personal show';s.welcome='Welcome to our own lights';
  const store=createDesignStore(localStorage);store.select(t.id,theme);store.save({settings:s,catalogue:null});await reload();await openIdentity();
  check(tag+' existing header option selected',q('#identity-logoMode').value===(t.separateSeasons?'none':'icon'));
  check(tag+' existing storage unchanged',read().logoMode===s.logoMode);
  await input('[data-key="headerArtwork"]','classic');await input('#identity-logoMode','seasonal');await input('[data-key="logoStyle"]','crest');
  check(tag+' included header and logo are separate',!!header().querySelector('.header-artwork-picture img')&&!!header().querySelector('img.show-logo'));
  await input('[data-key="headerArtwork"]','none');check(tag+' hiding top retains logo',!header().querySelector('.header-artwork-picture')&&!!header().querySelector('img.show-logo'));
  await click('#history-undo');await wait(350);check(tag+' Undo restores upper choice only',read().headerArtwork==='classic'&&read().logoStyle==='crest');
  await click('#history-redo');await wait(350);check(tag+' Redo hides only upper choice',read().headerArtwork==='none'&&read().logoStyle==='crest');
  await reload();await openIdentity();check(tag+' upper choice reloads',q('[data-key="headerArtwork"]').value==='none'&&q('#identity-logoMode').value==='seasonal');
  await input('[data-key="headerArtwork"]','theme');
  await input('#identity-logoMode','custom');await input('#identity-logoMode','none');
  check(tag+' no logo in preview',!header().querySelector(':scope > img.show-logo,:scope > i'));
  check(tag+' saved logo and icon retained',read().logo===s.logo&&read().icons.brand==='crow');
  check(tag+' name and welcome remain',header().textContent.includes(s.name)&&header().textContent.includes(s.welcome));
  check(tag+' hidden logo controls and clear help',q('[data-logo-field]').hidden&&q('[data-header-icon]').hidden&&q('[data-seasonal-logo]')?.hidden!==false&&!q('[data-no-logo]').hidden);
  check(tag+' optional decorations remain independent',!!header().querySelector('.season-header-art')===!['christmas','halloween'].includes(theme));
  await click('#history-undo');await wait(350);check(tag+' Undo restores custom logo',read().logoMode==='custom'&&!!header().querySelector('.show-logo'));
  await click('#history-redo');await wait(350);check(tag+' Redo removes logo',read().logoMode==='none'&&!header().querySelector(':scope > img.show-logo,:scope > i'));
  await input('[data-key="showNameOnHome"]',false);check(tag+' name can be hidden separately',header().querySelector('h1').classList.contains('show-name-hidden'));
  await input('[data-key="showNameOnHome"]',true);await reload();await openIdentity();check(tag+' reload restores No logo',q('#identity-logoMode').value==='none');
  await input('#identity-logoMode','custom');
  for(const close of ['#setup-cancel','#setup-close','escape']){
   await click('#start-setup');await input('#setup-logoMode','none',40);await input('[data-setup-key=headerArtwork]','lights',40);check(tag+' wizard draft leaves saved mode unchanged',read().logoMode==='custom');
   if(close==='escape'){q('#setup-wizard').dispatchEvent(new Event('cancel',{cancelable:true}));await wait(40);}else await click(close);
   check(tag+' '+close+' discards draft and returns focus',read().logoMode==='custom'&&read().headerArtwork==='theme'&&!q('#setup-wizard').open&&frame.contentDocument.activeElement===q('#start-setup'));
  }
  await click('#start-setup');await input('#setup-logoMode','none',40);await input('[data-setup-key=headerArtwork]','lights',40);await click('#setup-next');await click('#setup-back');check(tag+' Back keeps No logo draft',q('#setup-logoMode').value==='none'&&q('[data-setup-key=headerArtwork]').value==='lights');
  for(const width of [320,390,1280]){frame.style.width=width+'px';frame.style.height=width===320?'568px':'1000px';await wait(35);check(tag+' '+width+' wizard fits',fits());}
  for(let i=0;i<4;i++)await click('#setup-next');check(tag+' review names No logo',q('.setup-review').textContent.includes('No logo'));
  await click('#setup-next');await wait(350);check(tag+' Apply saves No logo',read().logoMode==='none'&&read().headerArtwork==='lights'&&read().name===s.name&&read().welcome===s.welcome&&read().logo===s.logo);
 }}catch(error){check(error.stack,false);}finally{localStorage.clear();for(const [k,v]of saved)localStorage.setItem(k,v);await reload();run.disabled=false;const failed=results.querySelectorAll('.fail').length;status.textContent=results.children.length+' checks, '+failed+' failures';document.title=failed+' failures - Header identity';}
};
