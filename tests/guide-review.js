import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {carryDetails,groupFields} from '../src/reusable-details.js';
import {assetBase} from '../src/assets.js';
const frame=document.querySelector('#editor'),status=document.querySelector('#status');
const capture=document.createElement('button');capture.textContent='Capture this view';document.querySelector('nav').append(capture);capture.onclick=()=>{document.querySelector('nav').style.display='none';document.documentElement.style.overflow='hidden';frame.style.width='100%';frame.style.height='100vh';window.scrollTo(0,0);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function prepare(id){
 if(!['localhost','127.0.0.1'].includes(location.hostname)||['4188','4198'].includes(location.port))throw Error('Use a disposable review origin.');
 status.textContent='Preparing';
 const template=registry.find(t=>t.id===id),store=createDesignStore(localStorage);
 store.select(id,'christmas');store.save({settings:template.cloneDefaults('christmas'),catalogue:null});
 await new Promise(resolve=>{frame.onload=()=>setTimeout(resolve,700);frame.contentWindow.location.reload();});
 const d=frame.contentDocument;d.querySelector('[data-editor-group="setup"]').click();d.querySelector('[data-section="1"]').open=true;
 await d.fonts.ready;await wait(300);
 frame.contentWindow.scrollTo({top:d.querySelector('.workspace').getBoundingClientRect().top+frame.contentWindow.scrollY-16,behavior:'instant'});
 status.textContent='Ready';
}
document.querySelectorAll('[data-template]').forEach(button=>button.onclick=()=>prepare(button.dataset.template));
document.querySelector('#tour').onclick=async()=>{await prepare('festive');frame.contentDocument.querySelector('#open-help').click();frame.contentDocument.querySelector('#start-tour').click();await wait(150);status.textContent='Ready';};
for(const [id,label] of [['clear-fields','Clear fields'],['setup','Setup guidance']]){const button=document.createElement('button');button.id=id;button.textContent=label;document.querySelector('nav').append(button);button.onclick=async()=>{await prepare(id==='setup'?'festive':'compact-console');const d=frame.contentDocument;if(id==='setup'){d.querySelector('#start-setup').click();for(let i=0;i<3;i++){d.querySelector('#setup-next').click();await wait(50);}}else{d.querySelector('[data-editor-group="music"]').click();d.querySelector('[data-key="welcome"]').closest('details').open=true;}status.textContent='Ready';};}
for(const [id,label] of [['reuse','Theme reuse'],['updates','Review updates'],['chooser','Chooser'],['help','Help'],['export','Export'],['categories','Category tour']]){
 const button=document.createElement('button');button.id=id;button.textContent=label;document.querySelector('nav').append(button);
 button.onclick=async()=>{
  await prepare('festive');
  if(['reuse','updates'].includes(id)){
   for(const key of Object.keys(localStorage))if(key.startsWith('rf-template-builder:'))localStorage.removeItem(key);
   const t=registry[0],store=createDesignStore(localStorage),s=t.cloneDefaults();s.fm=true;s.frequency='88.7';s.colours.card='#16374a';if(id==='reuse'){s.name='Example Lane Lights';s.logoMode='custom';s.logo=assetBase+'christmas-wreath-logo.webp';s.showMenuLabels=false;s.copy.SUCCESS_TITLE='Great choice!';s.copy.SUCCESS_JUKEBOX='Your song is in the queue. Enjoy the lights while you wait.';s.neighbourText='Please keep driveways clear and take any rubbish home.';s.dates='5-25 December';}store.save({settings:s,catalogue:null});
   if(id==='updates'){store.select(t.id,'halloween');store.save({settings:carryDetails(s,t.cloneDefaults('halloween'),['listening'],t),catalogue:null});store.connect(t.id+':christmas',groupFields(['listening']));const other=store.read();other.settings.frequency='90.1';store.save(other);store.select(t.id,'christmas');}
   await new Promise(resolve=>{frame.onload=()=>setTimeout(resolve,700);frame.contentWindow.location.reload();});
  }
  const d=frame.contentDocument;
  if(id==='reuse'){d.querySelector('[data-section="1"]').open=true;d.querySelector('[data-season="halloween"]').focus();d.querySelector('[data-season="halloween"]').click();}
  if(id==='updates')d.querySelector('[data-review-updates]').click();
  if(id==='chooser')d.querySelector('#choose-template').click();
  if(id==='help')d.querySelector('#open-help').click();
  if(id==='export')d.querySelector('#download').click();
  if(id==='categories'){d.querySelector('#open-help').click();d.querySelector('#start-tour').click();for(let i=0;i<3;i++){d.querySelector('#tour-next').click();await wait(50);}}
  status.textContent='Ready';
 };
}
