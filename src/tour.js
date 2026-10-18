// Editor-only orientation. Does not read or change show settings or demo interactions.
import {writePreferences} from './storage.js';

export const tourSteps=[
 {title:'Make changes at any time',area:'setup',view:'settings',target:'[data-section="1"]',open:1,text:'Change your theme or edit your show name, dates and listening details in Site setup. Undo and redo are available above the page tabs.'},
 {title:'Find each page’s settings',area:'home',view:'settings',target:'#editor-groups',text:'Home welcomes visitors. Music holds song options and playlists. Support has your charities and thank-yous. Info holds FAQs, facts and useful links.'},
 {title:'Try the preview',view:'preview',target:'.preview-controls-main',text:'Compare phone, tablet and desktop sizes, or expand a phone preview. Try On air / Off air and Jukebox / Voting. These are demo switches; they never change your show.'},
 {title:'Bring your songs and add filters',view:'preview',target:'#catalogue-tools',text:'Import your RF song CSV for titles and artwork. Detect categories adds filter buttons; Set NEW sashes marks new songs. Your catalogue stays in this browser.'},
 {title:'Make the messages yours',area:'messages',view:'settings',target:'[data-section="12"] > summary',open:12,text:'Song messages holds request and voting feedback. Edit the short title and explanation, then use its preview button to see how it looks. RF still decides when each message appears.'},
 {title:'Keep your work and use it in RF',view:'settings',target:'#save-export',text:'Download a settings backup so you can edit again later. Copy HTML or download your finished page, then paste it into a separate RF draft. Save, validate and test there before making it live. Open Help for the illustrated quick-start guide and detailed setup instructions.'}
];

export function createTour({storage,captureContext,showArea,showView,restoreContext,getTemplate=()=>null}){
 const $=id=>document.getElementById(id),dialog=$('quick-tour'),card=$('tour-card'),spot=$('tour-highlight');
 let step=0,context=null,returnFocus=null,scrollStyle='',frame=0;
 const remember=()=>writePreferences(storage,{tourSeen:true});
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
  step=index;const s={...tourSteps[step]};if(getTemplate()?.landing==='music'&&step===1){s.area='music';s.text='Music is the visitor landing view. Info holds schedules, listening help, FAQs and useful links. Support holds optional cards.';}
  if(s.area)showArea(s.area);showView(s.view);
  if(s.open)document.querySelector(`[data-section="${s.open}"]`).open=true;
  $('tour-progress').textContent=`${step+1} of ${tourSteps.length}`;$('tour-title').textContent=s.title;$('tour-text').textContent=s.text;$('tour-visual').hidden=step!==3;
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
  restoreContext(context);const focus=returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:$('open-help');focus.focus({preventScroll:true});
  context=null;
 }
 $('tour-next').addEventListener('click',()=>step===tourSteps.length-1?finish():show(step+1));
 $('tour-back').addEventListener('click',()=>show(Math.max(0,step-1)));$('tour-skip').addEventListener('click',finish);
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const items=focusable(),first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 window.addEventListener('resize',schedulePosition);window.addEventListener('scroll',schedulePosition,{passive:true});
 return {start};
}
