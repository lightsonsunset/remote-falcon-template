import {themes,escapeHTML as e} from './template.js';
import {templateById} from './template-registry.js';
import {reusableFields,describeValue} from './reusable-details.js';
import {transferChoices,applyTransfer,transferValue} from './reuse-policy.js';

export function createThemeFlow({store,getSettings,onSwitch,onApply,onSetup,onError}){
 const dialog=document.getElementById('copy-design-dialog');
 dialog.classList.add('reuse-dialog');
 dialog.innerHTML='<div class="dialog-heading"><h2 id="copy-details-title"></h2><button type="button" id="cancel-copy-details" aria-label="Close without applying">×</button></div><div class="reuse-body" id="reuse-body"></div><p id="reuse-error" role="alert" hidden></p><div class="reuse-footer" id="reuse-footer"></div>';
 const body=dialog.querySelector('#reuse-body'),footer=dialog.querySelector('#reuse-footer'),title=dialog.querySelector('h2'),error=dialog.querySelector('#reuse-error');
 const notice=document.createElement('section');notice.className='design-update-notice';notice.hidden=true;notice.setAttribute('aria-label','Saved design updates');
 document.querySelector('.intro').after(notice);
 const status=document.createElement('div');status.className='design-switch-status';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');notice.after(status);
 const lastSources=new Map();
 let pending=null,returnFocus=null,busy=false,statusTimer;
 const designName=d=>d.name+' · '+themes[d.season].name;
 function close(){if(dialog.open)dialog.close();pending=null;}
 dialog.querySelector('#cancel-copy-details').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else document.getElementById('choose-template').focus({preventScroll:true});});
 function open(){error.hidden=true;dialog.showModal();dialog.querySelector('#cancel-copy-details').focus({preventScroll:true});}
 function fail(err){error.textContent=err.message;error.hidden=false;busy=false;footer.querySelectorAll('button').forEach(b=>b.disabled=false);}
 function clearStatus(){clearTimeout(statusTimer);status.replaceChildren();}
 function setStatus(message,source){clearStatus();status.classList.toggle('design-switch-toast',!source);const text=document.createElement('p');text.textContent=message;status.append(text);if(source){const button=document.createElement('button');button.type='button';button.className='text-action';button.textContent='Reuse more from '+themes[source.season].name;button.addEventListener('click',()=>reuse(source.key));status.append(button);}else statusTimer=setTimeout(clearStatus,6000);}
 function sourceState(){const {target,newDesign,sources,sourceIndex}=pending,from=sources[sourceIndex];if(!from)return {groups:[],selected:new Set()};
  if(!pending.choices.has(from.key)){const destination=newDesign?target.template.cloneDefaults(target.theme):getSettings(),groups=transferChoices(from.settings,templateById(from.template),destination,target.template,{catalogue:from.catalogue,destinationCatalogue:newDesign?null:store.read().catalogue,existing:!newDesign});pending.choices.set(from.key,{groups,selected:new Set(groups.flatMap(g=>g.items.filter(item=>item.selected).map(item=>item.id)))});}
  return pending.choices.get(from.key);
 }
 function renderGroup(group,index){const {selected}=sourceState(),colour=group.id==='colours';return `<section class="reuse-group" data-transfer-section="${group.id}"><div class="reuse-group-heading">${colour?`<strong>${group.label}</strong>`:`<label class="toggle"><input type="checkbox" data-transfer-group="${group.id}"><strong>${group.label}</strong></label>`}<span class="hint">${group.items.length} ${group.items.length===1?'change':'changes'}</span><button type="button" class="text-action" data-transfer-review="${index}" aria-expanded="false" aria-controls="transfer-panel-${index}" aria-label="Review ${group.label}">Review</button></div>${colour?`<div class="reuse-colours"><label class="toggle"><input type="radio" name="reuse-colours" value="theme" checked>${pending.newDesign?'Use '+e(themes[pending.target.theme].name)+' colours':'Keep this design’s colours'}</label><label class="toggle"><input type="radio" name="reuse-colours" value="custom">Keep selected custom colours</label></div>`:''}<div id="transfer-panel-${index}" class="transfer-panel" hidden>${group.id==='season'?'<p class="hint">Dates, songs and category names can be seasonal. Choose the ones you want to reuse. Category names, order, filters and their artwork are copied together.</p>':''}${group.items.map(item=>`<label class="transfer-field"><span class="toggle"><input type="checkbox" data-transfer-field="${item.id}" aria-label="${e(item.label)}" ${selected.has(item.id)?'checked':''}><strong>${e(item.label)}</strong></span><span class="reuse-comparison"><span><small>${pending.newDesign?'New theme default':'Current design'}</small><span>${e(transferValue(item,item.current))}</span></span><span><small>From ${e(themes[pending.sources[pending.sourceIndex].season].name)}</small><span>${e(transferValue(item,item.value))}</span></span></span>${item.id==='logo'?'<small class="hint">This image appears when Logo is set to My own logo.</small>':''}${item.id==='faq'?'<small class="hint">Replaces the FAQ list, including its order and any removed questions. Schedule and listening questions still use this design’s details.</small>':''}</label>`).join('')}</div></section>`;}
 function renderCopy(){
  const {target,newDesign,sources}=pending,{groups}=sourceState();
  title.textContent=newDesign?'Start your '+themes[target.theme].name+' design':'Reuse details from another saved design';
  body.innerHTML=`<p>${newDesign?'Choose the customisations to keep. Everything else uses '+e(themes[target.theme].name)+' defaults. You can bring across more later.':'Choose details to replace in '+e(target.template.name+' · '+themes[target.theme].name)+'. Review the current and incoming values before applying.'}</p><label class="field"><span class="field-label">Reuse from</span><select id="copy-source">${sources.map((d,i)=>`<option value="${i}" ${i===pending.sourceIndex?'selected':''}>${e(designName(d))}</option>`).join('')}</select></label><div id="copy-groups">${groups.map(renderGroup).join('')||'<p>No different customisations to reuse from this design.</p>'}</div><details class="more-help"><summary>How these choices work</summary><p class="hint">Only changes from the source theme’s defaults are shown. Unchanged wording, icons and artwork follow the new theme. Cleared fields and removed list entries count as changes. Lists are reused as a whole. Dates, songs and custom colours start unchecked. Choices unsupported by this layout are omitted.</p><p class="hint">Sources are designs saved in this browser. This does not import your existing Remote Falcon page. The source stays unchanged; later edits do not automatically change another design.</p></details>`;
  footer.innerHTML='<span id="transfer-count" role="status"></span><button type="button" data-reuse-cancel>Cancel</button>'+(newDesign?'<button type="button" data-start-fresh>Start fresh</button>':'')+'<button id="apply-copy-details" type="button" class="primary">'+(newDesign?'Create '+e(themes[target.theme].name)+' design':'Apply selected details')+'</button>';
  updateSelection();
 }
 function updateSelection(){const {groups,selected}=sourceState();for(const box of body.querySelectorAll('[data-transfer-field]'))box.checked=selected.has(box.dataset.transferField);for(const box of body.querySelectorAll('[data-transfer-group]')){const items=groups.find(g=>g.id===box.dataset.transferGroup).items,count=items.filter(item=>selected.has(item.id)).length;box.checked=count===items.length;box.indeterminate=count>0&&count<items.length;}
  const custom=groups.find(g=>g.id==='colours')?.items.some(item=>selected.has(item.id));for(const radio of body.querySelectorAll('[name="reuse-colours"]'))radio.checked=radio.value===(custom?'custom':'theme');
  footer.querySelector('#transfer-count').textContent=selected.size+' '+(selected.size===1?'change':'changes')+' selected';footer.querySelector('#apply-copy-details').disabled=!pending.newDesign&&!selected.size;
 }
 body.addEventListener('click',event=>{const button=event.target.closest('[data-transfer-review]');if(!button)return;const open=button.getAttribute('aria-expanded')!=='true';for(const b of body.querySelectorAll('[data-transfer-review]')){const active=b===button&&open;b.setAttribute('aria-expanded',String(active));body.querySelector('#'+b.getAttribute('aria-controls')).hidden=!active;} });
 body.addEventListener('change',event=>{if(pending?.kind!=='copy')return;const el=event.target;if(el.id==='copy-source'){pending.sourceIndex=+el.value;renderCopy();body.querySelector('#copy-source').focus({preventScroll:true});return;}const {groups,selected}=sourceState();
  if(el.dataset.transferField)el.checked?selected.add(el.dataset.transferField):selected.delete(el.dataset.transferField);
  else if(el.dataset.transferGroup||el.name==='reuse-colours'){const group=groups.find(g=>g.id===(el.dataset.transferGroup||'colours')),on=el.name==='reuse-colours'?el.value==='custom':el.checked;for(const item of group.items)on?selected.add(item.id):selected.delete(item.id);}
  updateSelection();
 });
 async function finishCopy(fresh=false){if(busy||!pending)return;busy=true;footer.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const task=pending,{target,newDesign}=task,from=task.sources[task.sourceIndex],{groups,selected}=sourceState(),ids=fresh?[]:[...selected];
   const destination=newDesign?target.template.cloneDefaults(target.theme):getSettings(),{settings:next,options}=applyTransfer(destination,target.template,groups,ids);
   const fields=ids.filter(key=>Object.hasOwn(reusableFields,key));
   close();if(newDesign)await onSwitch(target.template.id,target.theme);
   const saved=onApply(next,newDesign?'Start '+themes[target.theme].name+' design':'Reuse selected details',options);
   if(from&&fields.length&&!store.connect(from.key,fields))onError('Details applied for this session, but the update reminders could not be saved. Download a settings backup to keep your work.');
   if(from)lastSources.set(store.key,from.key);setStatus(newDesign?'Your '+themes[target.theme].name+' design is ready. Want to bring across anything else?':'Selected details applied to '+themes[target.theme].name+'.',from);
   refreshNotice();if(task.setup)onSetup();if(!saved)onError('This design is available for this session. Browser storage is unavailable; download a settings backup to keep your work.');
  }catch(err){if(dialog.open)fail(err);else onError(err.message);}finally{busy=false;}
 }
 function showCopy(target,newDesign,setup=false,preferred){const sources=store.all().filter(d=>d.template!==target.template.id||d.season!==target.theme);returnFocus=document.activeElement;const current=preferred||store.key;pending={kind:'copy',target,newDesign,setup,sources,sourceIndex:Math.max(0,sources.findIndex(d=>d.key===current)),choices:new Map()};
  if(newDesign&&!sourceState().groups.length)return finishCopy(true);
  renderCopy();open();
 }
 function openReview(){const update=store.pending()[0];if(!update)return;returnFocus=document.activeElement;pending={kind:'review',update};title.textContent='Review changes from '+themes[update.theme].name;
  body.innerHTML=`<p>Choose which updates to use in ${e(store.template.name+' · '+themes[store.season].name)}. Other settings stay as saved.</p><p class="hint">Source: ${e(templateById(update.template).name+' · '+themes[update.theme].name)}. Details also edited in this design start unchecked.</p><div class="reuse-differences">${update.changes.map((change,i)=>`<label class="reuse-difference"><span class="toggle"><input type="checkbox" data-review-field="${i}" ${change.conflict?'':'checked'}><strong>${e(change.label)}</strong></span>${change.conflict?'<span class="hint">Also edited in this design</span>':''}<span class="reuse-comparison"><span><small>Saved ${e(themes[store.season].name)}</small><span>${e(describeValue(change.current))}</span></span><span><small>Updated ${e(themes[update.theme].name)}</small><span>${e(describeValue(change.incoming))}</span></span></span></label>`).join('')}</div>`;
  footer.innerHTML='<button type="button" data-reuse-cancel>Cancel</button><button type="button" data-keep-details>Keep saved details</button><button type="button" class="primary" data-apply-review>Apply selected updates</button>';open();
 }
 function keepDetails(peer){if(!store.acknowledge(peer))onError('Your choice is remembered for this session, but could not be saved in this browser.');refreshNotice();}
 function refreshNotice(){const update=store.pending()[0];notice.hidden=!update;if(!update){notice.replaceChildren();return;}notice.innerHTML=`<div><strong>Details changed in ${e(themes[update.theme].name)}</strong><p>Your ${e(themes[store.season].name)} design still uses its saved details.</p></div><div class="small-actions"><button type="button" data-review-updates>Review changes</button><button type="button" data-dismiss-updates>Keep ${e(themes[store.season].name)} details</button></div>`;}
 notice.addEventListener('click',event=>{if(event.target.closest('[data-review-updates]')){openReview();refreshNotice();}if(event.target.closest('[data-dismiss-updates]')){const update=store.pending()[0];if(update)keepDetails(update.peer);else refreshNotice();}});
 footer.addEventListener('click',event=>{if(event.target.closest('[data-reuse-cancel]'))close();if(event.target.closest('[data-start-fresh]'))finishCopy(true);if(event.target.closest('#apply-copy-details'))finishCopy();if(event.target.closest('[data-keep-details]')){const peer=pending.update.peer;close();keepDetails(peer);}if(event.target.closest('[data-apply-review]')){
   const update=pending.update,next=structuredClone(getSettings());for(const el of body.querySelectorAll('[data-review-field]:checked')){const change=update.changes[+el.dataset.reviewField];next[change.field]=structuredClone(change.incoming);}try{const checked=store.template.checkedSettings(next);close();const saved=onApply(checked,'Apply reviewed details');keepDetails(update.peer);setStatus('Selected updates applied.');if(!saved)onError('Updates applied for this session, but could not be saved. Download a settings backup to keep your work.');}catch(err){if(dialog.open)fail(err);else onError(err.message);}
  }});
 async function request(id,theme,{setup=false}={}){if(busy||dialog.open)return;const template=templateById(id);
  if(store.has(id,theme)){busy=true;try{await onSwitch(id,theme);setStatus('Your saved '+themes[theme].name+' design has been restored.');refreshNotice();if(setup)onSetup();}finally{busy=false;}}
  else if(store.all().length)await showCopy({template,theme},true,setup);
  else{await onSwitch(id,theme);onApply(template.cloneDefaults(theme),'Start '+themes[theme].name+' design');refreshNotice();if(setup)onSetup();}
 }
 function reuse(preferred){showCopy({template:store.template,theme:store.season},false,false,preferred||lastSources.get(store.key));}
 document.addEventListener('click',event=>{if(event.target.closest('[data-reuse-details]'))reuse();});
 return {request,reuse,refreshNotice,resetNotice(){lastSources.clear();clearStatus();refreshNotice();}};
}
