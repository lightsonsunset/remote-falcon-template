// Optional editor-only setup. No RF connection and no changes until Apply.
import {createSetupDraft,setupSteps} from './setup-model.js';
import {themes,escapeHTML as e} from './template.js';
import {artwork} from './assets.js';
import {completeWebAddress} from './editor-layout.js';

export function createSetupWizard({getSettings,applySettings}){
 const $=id=>document.getElementById(id),dialog=$('setup-wizard'),content=$('setup-content');
 let draft,step=0,returnFocus,scrollStyle='',attempted=false;
 const field=(key,label,{hint='',type='text',max=200,optional=false}={})=>`<label class="field"><span class="field-label">${label}${optional?'<span class="optional">Optional</span>':''}</span>${type==='textarea'?`<textarea id="setup-${key}" data-setup-key="${key}" rows="3" maxlength="${max}" aria-describedby="setup-hint-${key} setup-error-${key}">${e(draft.value[key])}</textarea>`:`<input id="setup-${key}" data-setup-key="${key}" type="${type}" maxlength="${max}" value="${e(draft.value[key])}" aria-describedby="setup-hint-${key} setup-error-${key}" ${type==='url'?'placeholder="https://example.org/logo.png"':''}>`}<span class="hint" id="setup-hint-${key}">${hint}</span><span class="error" id="setup-error-${key}" data-setup-error="${key}"></span></label>`;
 const toggle=(key,label)=>`<label class="toggle"><input type="checkbox" data-setup-key="${key}" ${draft.value[key]?'checked':''}>${label}</label>`;
 function render(){
  const s=draft.value;
  $('setup-title').textContent=setupSteps[step];$('setup-progress').textContent=`Step ${step+1} of 4`;
  $('setup-steps').innerHTML=setupSteps.map((label,i)=>`<span ${i===step?'aria-current="step"':''}>${i+1}. ${label}</span>`).join('');
  $('setup-back').disabled=step===0;$('setup-next').textContent=step===3?'Apply & open editor':'Next';
  $('setup-skip').hidden=step===3;$('setup-skip').textContent=step===1?'I’ll add these later':'Skip this step';
  $('setup-error-summary').hidden=true;attempted=false;
  if(step===0){
   content.innerHTML='<p class="hint">Start with your show’s look and name. Everything can be edited later.</p><div class="season-options">'+Object.entries(themes).map(([key,t])=>`<button type="button" class="season-card ${s.theme===key?'selected':''}" data-setup-theme="${key}" aria-pressed="${s.theme===key}"><span>${key==='christmas'?'✦':'☾'}</span><strong>${t.name}</strong><small>${t.description}</small></button>`).join('')+'</div>'+field('name','Show name',{max:150})+field('welcome','Welcome message',{type:'textarea',optional:true,max:2000})+`<label class="field"><span class="field-label">Logo or seasonal picture</span><select id="setup-logoMode" data-setup-key="logoMode"><option value="icon" ${s.logoMode==='icon'?'selected':''}>Simple seasonal icon</option><option value="seasonal" ${s.logoMode==='seasonal'?'selected':''}>Included ${themes[s.theme].name} picture</option><option value="custom" ${s.logoMode==='custom'?'selected':''}>My own logo</option></select></label><img id="setup-artwork" class="setup-artwork" src="assets/${artwork[s.theme].logo}" alt="Included ${themes[s.theme].name} illustration"><div id="setup-logo-fields">`+field('logo','Logo image link',{type:'url',max:4000,hint:'Use a public HTTPS link directly to your image. A www. address is completed when you leave the field.'})+'<p class="hint">Recommended: 600 × 400 px, or a square 600 × 600 px logo. Images fit without cropping. <a href="https://docs.remotefalcon.com/docs/docs/control-panel/account/image-hosting" target="_blank" rel="noopener">Host an image in RF ↗</a></p></div>';
  }else if(step===1){
   content.innerHTML='<p class="hint">These details appear on Home, off-air Music and the show-times FAQ. They do not change your FPP schedule.</p>'+field('dates','Show dates',{hint:s.theme==='christmas'?'For example: 5–25 December 2026. “To be announced” is fine.':'For example: 24–31 October 2026. “To be announced” is fine.'})+'<div class="row-labels"><span>Days / holiday</span><span>Hours</span></div>'+s.schedule.map((r,i)=>`<div class="schedule-row">${['day','hours'].map(k=>`<label><input data-setup-row="${i}" data-part="${k}" aria-label="${k==='day'?'Days':'Hours'} for row ${i+1}" aria-describedby="setup-row-error-${i}-${k}" maxlength="200" value="${e(r[k])}"><span class="error" id="setup-row-error-${i}-${k}" data-setup-error="schedule.${i}.${k}"></span></label>`).join('')}<button type="button" data-setup-remove="${i}" aria-label="Remove schedule row ${i+1}" ${s.schedule.length===1?'disabled':''}>×</button></div>`).join('')+`<button type="button" id="setup-add-row" ${s.schedule.length===12?'disabled':''}>+ Add hours or holiday</button><p class="hint">Use a separate row for holiday exceptions. Skip leaves your existing dates and hours unchanged.</p>`;
  }else if(step===2){
   content.innerHTML='<p class="hint">Choose how visitors can hear your show. You can use both options.</p>'+toggle('fm','Show an FM frequency')+'<div id="setup-fm-fields">'+field('frequency','FM frequency',{max:20,hint:'For example: 88.7 — FM is added for you.'})+'</div>'+toggle('pulsemesh','Show the Download PulseMesh button')+'<p class="hint">For shows already set up with PulseMesh. This adds the app link; it does not activate the service. <a href="https://pulsemesh.io/docs/setup" target="_blank" rel="noopener">PulseMesh setup guide ↗</a></p>'+field('listening','Other listening instructions',{type:'textarea',optional:true,max:3000,hint:'Shown on Home and in the listening FAQ.'});
  }else{
   const listen=[s.fm?`${s.frequency} FM`:'',s.pulsemesh?'Download PulseMesh button':'',s.listening].filter(Boolean);
   content.innerHTML='<p class="hint">Check your choices, then apply them to the editor. Your other settings stay as they are.</p><dl class="setup-review"><div><dt>Your show</dt><dd>'+e(s.name)+'</dd><dd>'+e(themes[s.theme].name)+' · '+({icon:'Simple seasonal icon',seasonal:'Included seasonal picture',custom:'Your own logo'}[s.logoMode])+'</dd>'+(s.welcome?'<dd>'+e(s.welcome)+'</dd>':'')+(s.logoMode==='custom'?'<dd class="setup-url">'+e(s.logo)+'</dd>':'')+'</div><div><dt>Dates & hours</dt><dd>'+e(s.dates)+'</dd>'+s.schedule.map(r=>'<dd>'+e(r.day)+' · '+e(r.hours)+'</dd>').join('')+'</div><div><dt>Listening</dt>'+ (listen.length?listen.map(v=>'<dd>'+e(v)+'</dd>').join(''):'<dd>No listening options selected. You can add them later.</dd>')+'</div></dl><p class="setup-next-note"><strong>Next, make it yours.</strong> Import your RF song CSV beside the preview to set up category filters and NEW sashes. Add support cards, FAQs and other extras in the page tabs.</p>';
  }
  visibility();dialog.scrollTop=0;$('setup-title').focus({preventScroll:true});
 }
 function visibility(){
  if($('setup-logo-fields'))$('setup-logo-fields').hidden=draft.value.logoMode!=='custom';
  if($('setup-artwork'))$('setup-artwork').hidden=draft.value.logoMode!=='seasonal';
  if($('setup-fm-fields'))$('setup-fm-fields').hidden=!draft.value.fm;
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
  returnFocus=event?.currentTarget||document.activeElement;draft=createSetupDraft(getSettings());scrollStyle=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();show(0);
 }
 content.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset.setupKey)draft.value[el.dataset.setupKey]=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.setupRow!==undefined)draft.value.schedule[+el.dataset.setupRow][el.dataset.part]=el.value;
  visibility();if(attempted)errors();
 });
 content.addEventListener('focusout',event=>{
  const el=event.target;if(el.dataset.setupKey!=='logo')return;
  const value=completeWebAddress(el.value);el.value=value;draft.value.logo=value;if(attempted)errors();
 });
 content.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.dataset.setupTheme){draft.theme(el.dataset.setupTheme);render();content.querySelector('[data-setup-theme="'+el.dataset.setupTheme+'"]')?.focus();}
  if(el.id==='setup-add-row'&&draft.value.schedule.length<12){draft.value.schedule.push({day:'',hours:''});render();content.querySelector('[data-setup-row="'+(draft.value.schedule.length-1)+'"]')?.focus();}
  if(el.dataset.setupRemove!==undefined&&draft.value.schedule.length>1){draft.value.schedule.splice(+el.dataset.setupRemove,1);render();$('setup-add-row').focus();}
 });
 $('setup-next').addEventListener('click',()=>{
  attempted=true;
  if(step<3){if(errors(true))show(step+1);return;}
  // Recheck every setup step in case a previously edited step was left via Back.
  for(let i=0;i<3;i++)if(Object.keys(draft.errors(i)).length){show(i);attempted=true;errors(true);return;}
  const next=draft.finish();close();applySettings(next);
 });
 $('setup-back').addEventListener('click',()=>{if(step>0)show(step-1);});
 $('setup-skip').addEventListener('click',()=>{draft.skip();show(step+1);});
 $('setup-close').addEventListener('click',close);$('setup-cancel').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button,input,textarea,select,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===$('setup-title'))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 $('start-setup').disabled=false;$('start-setup').addEventListener('click',start);
 return {start};
}
