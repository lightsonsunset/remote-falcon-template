// Editor-only orientation. Does not read or change show settings or demo interactions.
import {readPreferences,writePreferences} from './storage.js';

export const tourSteps=[
 {title:'Start with your show',area:'setup',view:'settings',target:'[data-section="1"]',open:1,text:'Choose Christmas or Halloween, then add your show name, dates and listening details in Site setup. You are personalising one ready-made layout.'},
 {title:'Find each page’s settings',area:'home',view:'settings',target:'#editor-groups',text:'Home welcomes visitors. Music holds song options and playlists. Support has your charities and thank-yous. Info holds FAQs, facts and useful links. Outside this tour, selecting a page also opens it in the preview.'},
 {title:'Try the preview',view:'preview',target:'.preview-controls-main',text:'Check phone, tablet and desktop sizes. Try On air / Off air and Jukebox / Voting. The preview is a demo: it never connects to your show or changes your RF settings.'},
 {title:'Bring your songs and add filters',view:'preview',target:'#catalogue-tools',text:'Import your RF song CSV to preview your titles and artwork. Detect categories sets up filter buttons, so visitors can browse groups of songs. Check that their names and order match RF; this does not change your categories in RF. Set NEW sashes marks your new songs. Your imported catalogue stays in this browser.'},
 {title:'Make the messages yours',area:'messages',view:'settings',target:'[data-section="12"] > summary',open:12,text:'Song messages holds request and voting feedback. Edit the short title and explanation, then use its preview button to see how it looks. RF still decides when each message appears.'},
 {title:'Keep your work and use it in RF',view:'settings',target:'#save-export',text:'Download a settings backup so you can edit again later. Copy HTML or download your finished page, then paste it into a separate RF draft. Save, validate and test there before making it live. Setup help has the full instructions.'}
];

export function createTour({storage,captureContext,showArea,showView,restoreContext,startSetup}){
 const $=id=>document.getElementById(id),welcome=$('tour-welcome'),dialog=$('quick-tour'),card=$('tour-card'),spot=$('tour-highlight');
 let step=0,context=null,returnFocus=null,scrollStyle='',welcomeScrollStyle='',frame=0;
 const remember=()=>{writePreferences(storage,{tourSeen:true});if(welcome.open){welcome.close();document.body.style.overflow=welcomeScrollStyle;}};
 const dismissWelcome=()=>{remember();$('start-tour').focus({preventScroll:true});};
 const focusable=()=>[...card.querySelectorAll('button')].filter(b=>!b.disabled&&!b.hidden);
 function position(){
  if(!dialog.open)return;
  const target=document.querySelector(tourSteps[step].target);if(!target)return;
  const r=target.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight,gap=18,pad=12;
  const x=Math.max(pad,r.left-5),y=Math.max(pad,r.top-5),right=Math.min(vw-pad,r.right+5),bottom=Math.min(vh-pad,r.bottom+5);
  Object.assign(spot.style,{left:x+'px',top:y+'px',width:Math.max(0,right-x)+'px',height:Math.max(0,bottom-y)+'px'});
  const c=card.getBoundingClientRect(),clamp=(v,max)=>Math.max(pad,Math.min(v,max-pad));
  let left,top;
  if(vw-right>=c.width+gap+pad){left=right+gap;top=clamp(y,vh-c.height);}
  else if(x>=c.width+gap+pad){left=x-c.width-gap;top=clamp(y,vh-c.height);}
  else if(vh-bottom>=c.height+gap+pad){left=clamp(x,vw-c.width);top=bottom+gap;}
  else if(y>=c.height+gap+pad){left=clamp(x,vw-c.width);top=y-c.height-gap;}
  else{left=clamp((vw-c.width)/2,vw-c.width);top=vh-c.height-pad;}
  Object.assign(card.style,{left:left+'px',top:Math.max(pad,top)+'px'});
 }
 function schedulePosition(){cancelAnimationFrame(frame);frame=requestAnimationFrame(position);}
 function show(index){
  step=index;const s=tourSteps[step];
  if(s.area)showArea(s.area);showView(s.view);
  if(s.open)document.querySelector(`[data-section="${s.open}"]`).open=true;
  $('tour-progress').textContent=`${step+1} of ${tourSteps.length}`;$('tour-title').textContent=s.title;$('tour-text').textContent=s.text;
  $('tour-back').disabled=step===0;$('tour-next').textContent=step===tourSteps.length-1?'Finish tour':'Next';
  $('tour-dots').replaceChildren(...tourSteps.map((_,i)=>{const dot=document.createElement('span');dot.classList.toggle('current',i===step);return dot;}));
  document.querySelector(s.target)?.scrollIntoView({block:'center',behavior:'instant'});
  position();schedulePosition();$('tour-next').focus({preventScroll:true});
 }
 function start(event){
  if(dialog.open)return;
  returnFocus=event?.currentTarget||document.activeElement;remember();context=captureContext();scrollStyle=document.body.style.overflow;document.body.style.overflow='hidden';
  dialog.showModal();show(0);
 }
 function finish(){
  if(!dialog.open)return;
  dialog.close();cancelAnimationFrame(frame);document.body.style.overflow=scrollStyle;
  restoreContext(context);const focus=returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:$('start-tour');focus.focus({preventScroll:true});
  context=null;
 }
 $('start-tour').disabled=false;
 $('start-tour').addEventListener('click',start);$('welcome-tour').addEventListener('click',start);
 $('welcome-setup').addEventListener('click',()=>{remember();startSetup();});
 $('welcome-skip').addEventListener('click',dismissWelcome);$('welcome-close').addEventListener('click',dismissWelcome);
 welcome.addEventListener('cancel',event=>{event.preventDefault();dismissWelcome();});
 welcome.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  if(event.shiftKey&&document.activeElement===$('welcome-close')){event.preventDefault();$('welcome-tour').focus();}
  else if(!event.shiftKey&&document.activeElement===$('welcome-tour')){event.preventDefault();$('welcome-close').focus();}
 });
 $('tour-next').addEventListener('click',()=>step===tourSteps.length-1?finish():show(step+1));
 $('tour-back').addEventListener('click',()=>show(Math.max(0,step-1)));$('tour-skip').addEventListener('click',finish);
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const items=focusable(),first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 window.addEventListener('resize',schedulePosition);window.addEventListener('scroll',schedulePosition,{passive:true});
 if(readPreferences(storage).tourSeen!==true){welcomeScrollStyle=document.body.style.overflow;document.body.style.overflow='hidden';welcome.showModal();}
 return {start};
}
