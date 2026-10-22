import {songArtworkForm,updateSongArtworkForm} from './song-artwork-form.js';
import {enhanceTextFields} from './text-clear.js';
import {artworkChoices,songArtworkMode,nowPlayingArtwork} from './song-artwork.js';
import {headerIdentity,headerLabel,updateHeaderIdentity} from './header-identity.js';
import {headerArtworkLabel,setHeaderArtwork} from './header-artwork.js';
import {createIconPicker,iconButton} from './icon-picker.js';
import {defaultIcon} from './icons.js';
import {nameStyleForm,updateNameStyleForm} from './name-style-form.js';
import {visitorGuidanceForm,guidancePositions} from './visitor-guidance-form.js';
// Optional editor-only setup. No RF connection and no changes until Apply.
import {createSetupDraft,setupSteps} from './setup-model.js';
import {dateExample} from './themes.js';
import {themes,escapeHTML as e} from './template.js';
import {completeWebAddress} from './editor-layout.js';

export function createSetupWizard({getSettings,applySettings,getTemplate=()=>null}){
 const $=id=>document.getElementById(id),dialog=$('setup-wizard'),content=$('setup-content');
 let draft,step=0,returnFocus,scrollStyle='',attempted=false;
 const reviewStep=setupSteps.length-1;
 const field=(key,label,{hint='',type='text',max=200,optional=false,placeholder='https://example.org/logo.png'}={})=>`<label class="field"><span class="field-label">${label}${optional?'<span class="optional">Optional</span>':''}</span>${type==='textarea'?`<textarea id="setup-${key}" data-setup-key="${key}" rows="3" maxlength="${max}" aria-describedby="setup-hint-${key} setup-error-${key}">${e(draft.value[key])}</textarea>`:`<input id="setup-${key}" data-setup-key="${key}" type="${type}" maxlength="${max}" value="${e(draft.value[key])}" aria-describedby="setup-hint-${key} setup-error-${key}" ${type==='url'?`placeholder="${e(placeholder)}"`:''}>`}<span class="hint" id="setup-hint-${key}">${hint}</span><span class="error" id="setup-error-${key}" data-setup-error="${key}"></span></label>`;
 const setupIcons=createIconPicker((target,id)=>{if(!draft)return;if(id)draft.value.icons.brand=id;else delete draft.value.icons.brand;const container=content.querySelector('[data-header-icon]');container.innerHTML=iconButton(draft.value.icons.brand||defaultIcon('brand',draft.value),'data-setup-icon="brand"','show');container.querySelector('button').focus({preventScroll:true});},{id:'setup-icon-picker'});
 const toggle=(key,label)=>`<label class="toggle"><input type="checkbox" data-setup-key="${key}" ${draft.value[key]?'checked':''}>${label}</label>`;
 const select=(key,label,choices)=>`<label class="field"><span class="field-label">${label}</span><select id="setup-${key}" data-setup-key="${key}">${choices.map(({id,label})=>`<option value="${id}" ${draft.value[key]===id?'selected':''}>${label}</option>`).join('')}</select></label>`;
 function render(){
  const s=draft.value;
  $('setup-design').textContent=(getTemplate()?.name||'Lights on Sunset')+' · '+themes[s.theme].name;
  $('setup-title').textContent=setupSteps[step];$('setup-progress').textContent=`Step ${step+1} of ${setupSteps.length}`;
  $('setup-steps').style.setProperty('--setup-step-count',setupSteps.length);
  $('setup-steps').innerHTML=setupSteps.map((label,i)=>`<span ${i===step?'aria-current="step"':''}><b aria-hidden="true">${i+1}</b> ${label}</span>`).join('');
  $('setup-back').disabled=step===0;$('setup-next').textContent=step===reviewStep?'Apply & open editor':'Next';$('setup-tour-choice').hidden=step!==reviewStep;dialog.dataset.step=String(step);
  $('setup-skip').hidden=step===reviewStep;$('setup-skip').textContent=step===1?'I’ll add these later':'Skip this step';
  $('setup-error-summary').hidden=true;attempted=false;
  if(step===0){
   content.innerHTML='<p class="hint">Start with your show’s look and name. Everything can be edited later.</p>'+field('name','Show name',{max:150})+headerIdentity(s,{features:getTemplate()?.features,setup:true})+toggle('showNameOnHome','Show name in the header')+'<p class="hint">Untick if your own logo already includes the name. The page title still uses it.</p>'+nameStyleForm(s,true)+field('welcome','Welcome message',{type:'textarea',optional:true,max:2000});
  }else if(step===1){
   content.innerHTML='<p class="hint">These details appear on Home, off-air Music and the show-times FAQ. They do not change your FPP schedule.</p>'+field('dates','Show dates',{hint:dateExample(s.theme)+'. “To be announced” is fine.'})+'<div class="row-labels"><span>Days / holiday</span><span>Hours</span></div>'+s.schedule.map((r,i)=>`<div class="schedule-row">${['day','hours'].map(k=>`<label><input data-setup-row="${i}" data-part="${k}" aria-label="${k==='day'?'Days':'Hours'} for row ${i+1}" aria-describedby="setup-row-error-${i}-${k}" maxlength="200" value="${e(r[k])}"><span class="error" id="setup-row-error-${i}-${k}" data-setup-error="schedule.${i}.${k}"></span></label>`).join('')}<button type="button" data-setup-remove="${i}" aria-label="Remove schedule row ${i+1}" ${s.schedule.length===1?'disabled':''}>×</button></div>`).join('')+`<button type="button" id="setup-add-row" ${s.schedule.length===12?'disabled':''}>+ Add hours or holiday</button><p class="hint">Use a separate row for holiday exceptions. Skip leaves your existing dates and hours unchanged.</p>`;
  }else if(step===2){
   content.innerHTML='<p class="hint">Choose how visitors can hear your show. You can offer FM and PulseMesh together.</p>'+toggle('fm','Show an FM frequency')+'<div id="setup-fm-fields">'+field('frequency','FM frequency',{max:20,hint:'For example: 88.7 — FM is added for you.'})+'</div>'+toggle('pulsemesh','Offer PulseMesh listening')+'<p class="hint">For shows already set up with PulseMesh. These buttons do not activate the service. <a href="https://pulsemesh.io/docs/setup" target="_blank" rel="noopener">Setup guide ↗</a></p><div id="setup-pulsemesh-fields">'+`<label class="field"><span class="field-label">Buttons to show</span><select id="setup-pulsemeshButtons" data-setup-key="pulsemeshButtons">${[['download','Download app only'],['listen','Listen on PulseMesh only'],['both','Both buttons']].map(([value,label])=>`<option value="${value}" ${s.pulsemeshButtons===value?'selected':''}>${label}</option>`).join('')}</select></label>`+'<div id="setup-pulsemesh-link">'+field('pulsemeshUrl','Your PulseMesh display link',{type:'url',max:4000,placeholder:'https://psm.sh/…',hint:'Used on Home and in the listening FAQ. Paste the full public link from your PulseMesh dashboard.'})+'<details class="more-help"><summary>Where to find your PulseMesh link</summary><p>Copy the full public display link from your PulseMesh dashboard. Web Player links open in the browser; Smart links can open the installed app. Display-code links require a supported PulseMesh plan. <a href="https://pulsemesh.io/docs/topics/display-codes" target="_blank" rel="noopener">Display links &amp; codes ↗</a></p></details></div></div>'+field('listening','Other listening instructions',{type:'textarea',optional:true,max:3000,hint:'Shown on Home and in the listening FAQ.'})+'<h3>Song appearance</h3>'+songArtworkForm(s,{setup:true});
  }else if(step===3){
   content.innerHTML='<p class="hint">Help visitors enjoy your show and be considerate of your neighbours. Keep the suggested wording or make it your own.</p>'+visitorGuidanceForm({toggle,select,feature:(key,html)=>`<div data-setup-feature="${key}">${html}</div>`,field:(key,label,hint,type,optional)=>field(key,label,{hint,type,optional,max:20000})},getTemplate()?.features);
  }else{
   const listen=[s.fm?`${s.frequency} FM`:'',s.pulsemesh&&s.pulsemeshButtons!=='listen'?'Download PulseMesh button':'',s.pulsemesh&&s.pulsemeshButtons!=='download'?'Listen on PulseMesh: '+s.pulsemeshUrl:'',s.listening].filter(Boolean);
   content.innerHTML='<p class="hint">Check your details, then start editing or take a quick tour. Your design is saved in this browser; download a settings backup to keep a portable copy.</p><dl class="setup-review"><div><dt>Your show</dt><dd>'+e(s.name)+'</dd><dd>'+e(themes[s.theme].name)+'</dd><dd>Header artwork: '+e(headerArtworkLabel(s))+'</dd><dd>Logo: '+e(headerLabel(s,getTemplate()?.features))+'</dd>'+(s.welcome?'<dd>'+e(s.welcome)+'</dd>':'')+(s.logoMode==='custom'?'<dd class="setup-url">'+e(s.logo)+'</dd>':'')+'</div><div><dt>Dates & hours</dt><dd>'+e(s.dates)+'</dd>'+s.schedule.map(r=>'<dd>'+e(r.day)+' · '+e(r.hours)+'</dd>').join('')+'</div><div><dt>Music &amp; listening</dt>'+ (listen.length?listen.map(v=>'<dd class="setup-url">'+e(v)+'</dd>').join(''):'<dd>No listening options selected. You can add them later.</dd>')+'<dd>Song list: '+artworkChoices.find(([id])=>id===songArtworkMode(s))[1]+'</dd><dd>Now Playing artwork: '+(nowPlayingArtwork(s)?'shown where available':'hidden')+'</dd><dd>Artist names: '+(s.showSongArtists&&s.showQueueArtists?'song list and queue':s.showSongArtists?'song list only':s.showQueueArtists?'Now Playing, Up Next and queue only':'hidden')+'</dd></div></dl><p class="setup-next-note"><strong>Next, make it yours.</strong> Import your RF song CSV beside the preview to set up category filters and NEW sashes. Add support cards, FAQs and other extras in the page tabs.</p>';
  }
  if(step===reviewStep){
   const s=draft.value,hasMessage=!!(s.neighbourTitle.trim()||s.neighbourText.trim());
   const placement=!hasMessage?'No guidance message.':s.showMainGuidance?'Main screen while on air · '+guidancePositions.find(p=>p.id===s.guidancePosition).label:'Hidden on the main screen.';
   content.querySelector('.setup-review').insertAdjacentHTML('beforeend','<div class="setup-guidance-review"><dt>Visitor guidance</dt><dd>'+e(placement)+'</dd>'+(hasMessage&&getTemplate()?.features.guidanceInfo?'<dd>Also shown on Info.</dd>':'')+(s.neighbourTitle.trim()?'<dd>'+e(s.neighbourTitle)+'</dd>':'')+(s.neighbourText.trim()?'<dd>'+e(s.neighbourText)+'</dd>':'')+'</div>');
  }
  if(getTemplate()?.separateSeasons){
   const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.textContent=walker.currentNode.textContent.replace(/\bHome\b/g,'Music');
  }
  enhanceTextFields(content);visibility();dialog.scrollTop=0;$('setup-title').focus({preventScroll:true});
 }
 function visibility({deferContrast=false}={}){
  updateSongArtworkForm(content,draft.value);
  updateHeaderIdentity(content,draft.value,getTemplate()?.features);
  updateNameStyleForm(content,draft.value,getTemplate()?.namePreview?.(draft.value),{deferContrast});
  content.querySelectorAll('[data-setup-feature]').forEach(el=>el.hidden=!draft.value[el.dataset.setupFeature]);
  if($('setup-fm-fields'))$('setup-fm-fields').hidden=!draft.value.fm;
  if($('setup-pulsemesh-fields'))$('setup-pulsemesh-fields').hidden=!draft.value.pulsemesh;
  if($('setup-pulsemesh-link'))$('setup-pulsemesh-link').hidden=draft.value.pulsemeshButtons==='download';
 }
 function errors(focus=false){
  const items=draft.errors(step);
  content.querySelectorAll('[data-setup-error]').forEach(el=>{const message=items[el.dataset.setupError]||'';el.textContent=message;el.closest('label').querySelector('input,textarea')?.setAttribute('aria-invalid',String(!!message));});
  $('setup-error-summary').hidden=!Object.keys(items).length;
  $('setup-error-summary').textContent='Complete the highlighted fields, or skip this step to keep its previous settings.';
  if(focus)content.querySelector('[aria-invalid="true"]')?.focus();
  return Object.keys(items).length===0;
 }
 function show(next){step=next;draft.enter();render();}
 function close(){
  if(!dialog.open)return;
  dialog.close();document.body.style.overflow=scrollStyle;draft=null;
  const target=returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:$('start-setup');target.focus({preventScroll:true});
 }
 function start(event){
  if(dialog.open)return;
  $('setup-take-tour').checked=false;
  returnFocus=event?.currentTarget||document.activeElement;draft=createSetupDraft(getSettings(),getTemplate()||undefined);scrollStyle=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();show(0);
 }
 content.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset.setupKey)draft.value[el.dataset.setupKey]=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.setupKey==='headerArtwork')setHeaderArtwork(draft.value,el.value);
  if(el.dataset.setupRow!==undefined)draft.value.schedule[+el.dataset.setupRow][el.dataset.part]=el.value;
  visibility({deferContrast:el.type==='color'});if(attempted)errors();
 });
 content.addEventListener('change',event=>{if(event.target.type==='color'&&draft)visibility();});
 content.addEventListener('focusout',event=>{
  const el=event.target;if(!['logo','pulsemeshUrl'].includes(el.dataset.setupKey))return;
  const value=completeWebAddress(el.value);el.value=value;draft.value[el.dataset.setupKey]=value;if(attempted)errors();
 });
 content.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.dataset.setupIcon){setupIcons.open({role:'brand'},draft.value.icons.brand||defaultIcon('brand',draft.value),el);return;}
  if(el.hasAttribute('data-reset-name-colour')){draft.value.customNameColour=false;const input=content.querySelector('[data-setup-key=customNameColour]');input.checked=false;input.focus();visibility();}
  if(el.id==='setup-add-row'&&draft.value.schedule.length<12){draft.value.schedule.push({day:'',hours:''});render();content.querySelector('[data-setup-row="'+(draft.value.schedule.length-1)+'"]')?.focus();}
  if(el.dataset.setupRemove!==undefined&&draft.value.schedule.length>1){draft.value.schedule.splice(+el.dataset.setupRemove,1);render();$('setup-add-row').focus();}
 });
 function apply(){
  if(step!==reviewStep||!draft)return;
  // Validate the whole draft before committing it once; the tour is editor-only.
  for(let i=0;i<reviewStep;i++)if(Object.keys(draft.errors(i)).length){show(i);attempted=true;errors(true);return;}
  const next=draft.finish(),takeTour=$('setup-take-tour').checked;close();applySettings(next,{takeTour});
 }
 $('setup-next').addEventListener('click',()=>{
  attempted=true;
  if(step<reviewStep){if(errors(true))show(step+1);return;}
  apply();
 });
 $('setup-back').addEventListener('click',()=>{if(step>0)show(step-1);});
 $('setup-skip').addEventListener('click',()=>{draft.skip();show(step+1);});
 $('setup-close').addEventListener('click',close);$('setup-cancel').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button,input,textarea,select,a[href],summary')].filter(el=>!el.matches(':disabled')&&el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===$('setup-title'))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 $('start-setup').disabled=false;$('start-setup').addEventListener('click',start);
 return {start};
}
