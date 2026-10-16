import {registry,cloneDefaults,validate,render,renderDraft,escapeHTML as e,settingsFile,parseSettings,themes,changeTheme,contrast,namesOf,supportCardDefaults} from './template.js';
import {copyFields} from './copy.js';
import {listDefinitions} from './visitor-extras.js';
import {editorGroups,completeWebAddress} from './editor-layout.js';
import {settingsForm} from './editor-form.js';
import {restore,persist,readPreferences,writePreferences} from './storage.js';
import {createTour} from './tour.js';
import {createSetupWizard} from './setup-wizard.js';
import {createPreview} from './preview.js';
import {viewports,defaultViewports} from './viewports.js';
import {parseCatalogue,categoryNamesOf,saveCatalogue,restoreCatalogue} from './catalogue.js';
import {detectedCategories,applyCategories,catalogueMatches} from './category-settings.js';
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{storage=null;}
const restored=restore(storage);
const restoredCatalogue=restoreCatalogue(storage);
let catalogue=restoredCatalogue.catalogue,catalogueSource=catalogue?'imported':'samples',catalogueSaved=true;
let settings=restored.settings||cloneDefaults(), source='', currentHTML='', currentDraft=null, device='mobile', air=true, mode='jukebox', updateTimer;
const selectedViewports={...defaultViewports};
let editorGroup='setup';
function selectSettingsGroup(group,followPreview=true){editorGroup=group;document.querySelectorAll('[data-editor-group]').forEach(b=>{b.classList.toggle('selected',b.dataset.editorGroup===group);b.setAttribute('aria-pressed',String(b.dataset.editorGroup===group));});$('settings').querySelectorAll('details[data-section]').forEach(d=>d.hidden=!editorGroups[group].sections.includes(+d.dataset.section)||(d.dataset.seasonOnly&&d.dataset.seasonOnly!==settings.theme));if(followPreview&&editorGroups[group].panel)preview.navigate(editorGroups[group].panel);}
function revealSection(n){const group=Object.keys(editorGroups).find(k=>editorGroups[k].sections.includes(+n));if(group)selectSettingsGroup(group);const d=$('settings').querySelector(`[data-section="${n}"]`);if(d)d.open=true;return d;}
const preview=createPreview($('preview'),text=>{$('preview-status').textContent=text;});
let renderedFAQs=[],renderedRecipients=[],renderedExtraLists={};
function form(){
 const focused=document.activeElement, focusSeason=focused?.dataset?.season;
 const openExtraRows=new Set([...$('settings').querySelectorAll('[data-list-row][open]')].map(d=>renderedExtraLists[d.dataset.listRow]?.[+d.dataset.row]));
 const hadForm=$('settings').children.length>0;
 const open=[...$('settings').querySelectorAll('details[data-section][open]')].map(d=>d.dataset.section);
 const openRecipients=new Set([...$('settings').querySelectorAll('[data-recipient][open]')].map(d=>renderedRecipients[+d.dataset.recipient]));
 const openTeasers=new Set([...$('settings').querySelectorAll('[data-recipient-teaser][open]')].map(d=>renderedRecipients[+d.dataset.recipientTeaser]));
 const openCopy=[...$('settings').querySelectorAll('[data-copy-group][open]')].map(d=>d.dataset.copyGroup);
 const openFAQs=new Set([...$('settings').querySelectorAll('[data-faq-row][open]')].map(d=>renderedFAQs[+d.dataset.faqRow]));
 $('settings').innerHTML=settingsForm(settings);
 if(hadForm)$('settings').querySelectorAll('[data-section]').forEach(d=>d.open=open.includes(d.dataset.section));
 $('settings').querySelectorAll('[data-copy-group]').forEach(d=>d.open=openCopy.includes(d.dataset.copyGroup));
 $('settings').querySelectorAll('[data-faq-row]').forEach(d=>d.open=openFAQs.has(settings.faq[+d.dataset.faqRow]));
 $('settings').querySelectorAll('[data-recipient]').forEach(d=>d.open=openRecipients.has(settings.donationRecipients[+d.dataset.recipient]));
 $('settings').querySelectorAll('[data-recipient-teaser]').forEach(d=>d.open=openTeasers.has(settings.donationRecipients[+d.dataset.recipientTeaser]));
 $('settings').querySelectorAll('[data-list-row]').forEach(d=>d.open=openExtraRows.has(settings[d.dataset.listRow][+d.dataset.row]));
 for(const key of Object.keys(listDefinitions))renderedExtraLists[key]=[...settings[key]];
 if(focusSeason)$('settings').querySelector('[data-season="'+focusSeason+'"]')?.focus({preventScroll:true});
 renderedRecipients=[...settings.donationRecipients];
 renderedFAQs=[...settings.faq];
 if(!$('editor-groups'))$('validation-summary').insertAdjacentHTML('beforebegin','<div class="editor-groups" id="editor-groups" role="group" aria-label="Settings categories">'+Object.entries(editorGroups).map(([key,g])=>'<button type="button" data-editor-group="'+key+'">'+g.name+'<span class="group-alert" hidden></span></button>').join('')+'</div>');
 selectSettingsGroup(editorGroup,false);features();
}
function features(){
 document.querySelectorAll('[data-feature]').forEach(el=>el.hidden=!el.dataset.feature.split('|').some(k=>settings[k])&&!el.querySelector('[data-copy][aria-invalid="true"]')&&!el.contains(document.activeElement));
 document.querySelectorAll('[data-logo-field]').forEach(el=>el.hidden=settings.logoMode!=='custom');
 document.querySelectorAll('.artwork-choice').forEach(el=>el.hidden=settings.logoMode!=='seasonal');
 $('settings').querySelectorAll('[data-season-only]').forEach(el=>el.hidden=el.dataset.seasonOnly!==settings.theme||!editorGroups[editorGroup].sections.includes(+el.dataset.section));
}
function setError(text){$('load-error').textContent=text;$('load-error').hidden=!text;}
function save(){const ok=persist(storage,settings);$('save-status').textContent=ok?'✓ Saved locally':'Not saved locally';$('save-status').title=ok?'Settings are saved in this browser.':'Browser storage is unavailable. Save a settings file to keep your work.';}
function refresh(options={}){
  catalogueUI();
  const errors=validate(settings);document.querySelectorAll('[data-error]').forEach(el=>el.textContent=errors[el.dataset.error]||'');
  document.querySelectorAll('[data-extra-list]').forEach(el=>el.setAttribute('aria-invalid',String(!!errors[el.dataset.extraList])));
  document.querySelectorAll('[data-key],[data-schedule],[data-category],[data-faq],[data-copy],[data-donation],[data-list]').forEach(el=>{const k=el.dataset.copy?'copy.'+el.dataset.copy:el.dataset.key||(el.dataset.list?`${el.dataset.list}.${el.dataset.row}.${el.dataset.part}`:el.dataset.donation!==undefined?`donationRecipients.${el.dataset.donation}.${el.dataset.part}`:el.dataset.category!==undefined?`categoryNames.${el.dataset.category}`:el.dataset.faq!==undefined?`faq.${el.dataset.faq}.${el.dataset.part}`:`schedule.${el.dataset.schedule}.${el.dataset.part}`);el.setAttribute('aria-invalid',String(!!errors[k]));});
  const labels={name:'Show name',dates:'Show dates',logo:'Logo URL',frequency:'FM frequency',noticeTitle:'Notice title',noticeText:'Notice message',charity:'Support card name',donationText:'Support card description',donationUrl:'Support card link',donationImage:'Support card image',newNames:'NEW sequence names',homeCardTitle:'Home card title',homeCardText:'Home card message',homeCardLink:'Home card URL',homeCardLinkLabel:'Home card button label'};
  for(const [key,label] of copyFields)labels['copy.'+key]=label;
  settings.donationRecipients.forEach((_,i)=>{for(const part of ['name','description','url','image','button','callout','hint'])labels['donationRecipients.'+i+'.'+part]='Support card '+(i+2)+' '+({callout:'teaser heading',hint:'teaser helper',button:'button text'}[part]||part);});
 features();
  const errorCount=Object.keys(errors).length;
  $('validation-summary').hidden=!errorCount;
  $('validation-count').textContent=errorCount+' field'+(errorCount===1?'':'s')+' need'+(errorCount===1?'s':'')+' attention';
  $('validation-list').innerHTML=Object.entries(errors).map(([key,message])=>`<li><button type="button" data-focus-error="${key}">${e(labels[key]||document.querySelector('[data-key="'+key+'"]')?.closest('label')?.querySelector('.field-label')?.textContent|| (key.startsWith('schedule.')?'Schedule row '+(+key.split('.')[1]+1):key.startsWith('categoryNames.')?'Category '+(+key.split('.')[1]+1):key.startsWith('faq.')?'FAQ '+(+key.split('.')[1]+1):Object.keys(listDefinitions).some(k=>key.startsWith(k))?key.split('.').map((p,i)=>i===1?' '+(+p+1)+' ':p).join(''):'Colours'))}</button>: ${e(message)}</li>`).join('');
  $('settings').querySelectorAll('details[data-section]').forEach(d=>d.querySelector('.section-error').hidden=!d.querySelector('[aria-invalid="true"]'));
  document.querySelectorAll('[data-editor-group]').forEach(b=>{const count=editorGroups[b.dataset.editorGroup].sections.reduce((n,id)=>n+$('settings').querySelector('[data-section="'+id+'"]').querySelectorAll('[aria-invalid="true"]').length,0);const badge=b.querySelector('.group-alert');badge.hidden=!count;badge.textContent=count;badge.setAttribute('aria-label',count+' fields need attention');});
  const low=['text','secondary','gold'].filter(k=>contrast(settings.colours[k],settings.colours.card)<4.5);
  $('colour-advice').textContent=low.length?'Readability check: '+low.map(k=>({text:'main text',secondary:'secondary text',gold:'accent colour'})[k]).join(', ')+' has low contrast on your cards. Try a lighter colour or darker cards.':'Text and accent colours have good contrast on your cards.';
  const valid=!Object.keys(errors).length;
  $('copy').disabled=$('download').disabled=!source||!valid;
  if(!source)return;
  try{
    currentHTML=valid?render(source,settings):'';
    const previewSettings=structuredClone(settings);
    currentDraft=renderDraft(source,previewSettings);preview.update(currentDraft.html,currentDraft.settings,{air,mode,catalogue:catalogueSource==='imported'?catalogue:null,categoriesMismatch:catalogueSource==='imported'&&!categoriesMatch(),messageId:options.messageId});
    $('export-status').textContent=valid?'RF-ready HTML · Both music modes included · No custom scripts':'Preview is still active. Complete the fields listed above before copying or downloading HTML.';
  }
  catch(err){setError(err.message);$('copy').disabled=$('download').disabled=true;}
}
function categoriesMatch(){
  return catalogueMatches(catalogue,settings);
}
function catalogueUI(){
  $('catalogue-source').querySelector('[value="imported"]').disabled=!catalogue;
  $('pick-new').disabled=!catalogue;
  $('pick-new-music').disabled=!catalogue;
  $('new-selected-count').textContent=namesOf(settings).length+' selected';
  $('new-music-help').innerHTML=catalogue?'Choices add NEW sashes to your exported RF page.':'Import your RF song CSV in Preview catalogue, or enter names below. <button type="button" class="inline-link" data-import-catalogue>Import song CSV</button>';
  $('pick-new-help').textContent=catalogue?'Choices add NEW sashes to your exported RF page.':'Import your song list to detect categories and choose NEW sashes. Manual entry is under Music.';
  $('detect-categories').disabled=!catalogue;
  $('catalogue-source').value=catalogueSource;$('remove-catalogue').hidden=!catalogue;
  $('catalogue-summary').textContent=catalogue&&catalogueSource==='imported'?`${catalogue.songs.length} imported songs`:'Sample songs';
  const names=catalogue?categoryNamesOf(catalogue):[];
  const mismatch=!!catalogue&&settings.categories&&!categoriesMatch();
  for(const id of ['category-warning','catalogue-warning']){const el=$(id);el.hidden=!mismatch;el.textContent='This category list differs from the imported songs. Category buttons are disabled in the imported preview. Use Detect categories, edit the list, or import a newer CSV. Export still uses your settings.';}
  if(!catalogue){$('catalogue-status').textContent='Export from RF’s Sequences page. Maximum 2 MB / 2,000 songs.';return;}
  const exactNames=new Set(catalogue.songs.map(s=>s.name)),missing=namesOf(settings).filter(n=>!exactNames.has(n));
  const notes=[`${catalogue.filename}: ${catalogue.songs.length} songs. Categories found: ${names.join(', ')||'none'}.`,catalogueSaved?'Saved only in this browser.':'Loaded for this session only; browser storage was unavailable.'];
  if(catalogue.songs.some(s=>!s.category))notes.push('Some songs have no category. Assign those in RF before enabling category filters.');
  if(names.some(n=>n.length>100))notes.push('A category name exceeds the 100-character filter limit. Shorten it in RF and export again to use automatic category setup.');
  if(names.length>12)notes.push('This customiser supports up to 12 category filters. All songs can still be previewed.');
  if(missing.length)notes.push(`${missing.length} NEW name(s) are not in this CSV. Check exact sequence names or import a newer file.`);
  const noImage=catalogue.songs.filter(s=>!s.imageUrl).length;if(noImage)notes.push(`${noImage} song(s) have no usable HTTPS artwork URL. Missing or failed artwork is labelled in the preview.`);
  $('catalogue-status').textContent=notes.join(' ');
}
$('catalogue-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>2000000)throw Error('Choose an RF CSV export smaller than 2 MB.');
    const next=parseCatalogue(await file.text(),file.name);catalogue=next;catalogueSource='imported';catalogueSaved=saveCatalogue(storage,catalogue);
    $('catalogue-error').hidden=true;refresh();$('preview-status').textContent='Imported CSV snapshot. Artwork loads from its image hosts; requests and votes stay in this preview.';openNewPicker();
  }catch(err){$('catalogue-error').textContent=err.message;$('catalogue-error').hidden=false;}
  event.target.value='';
});
$('catalogue-source').addEventListener('change',()=>{catalogueSource=$('catalogue-source').value;refresh();$('preview-status').textContent=catalogueSource==='samples'?'Sample songs include labelled message tests.':'Imported CSV snapshot — no live availability or playback information.';});
$('catalogue-options').addEventListener('click',()=>$('catalogue-dialog').showModal());
$('close-catalogue').addEventListener('click',()=>$('catalogue-dialog').close());
$('pick-new').addEventListener('click',openNewPicker);
let pickedNew=new Set(),pickedCategories=[],detectedNames=[];
const categoryList=(names,kind)=>names.map((name,i)=>`<li><span>${e(name)}</span><button type="button" data-${kind}-up="${i}" aria-label="Move ${e(name)} up" ${i===0?'disabled':''}>↑</button><button type="button" data-${kind}-down="${i}" aria-label="Move ${e(name)} down" ${i===names.length-1?'disabled':''}>↓</button></li>`).join('');
function pickerCount(){const count=pickedNew.size;const withCategories=$('picker-setup-categories').checked&&!$('picker-setup-categories').disabled;$('new-picker-count').textContent=count+' NEW sashes'+(withCategories?' · '+pickedCategories.length+' category filters':'');$('apply-new').textContent=withCategories?'Apply NEW sashes & categories':'Apply NEW sashes';$('apply-new').disabled=count>200;$('new-picker-list').querySelectorAll('[data-pick-new]').forEach(input=>input.closest('label').querySelector('.new-picker-tag').hidden=!input.checked);}
function pickerCategories(){
  $('picker-category-list').innerHTML=categoryList(pickedCategories,'picker');
}
function openNewPicker(){
  if(!catalogue)return;pickedNew=new Set(namesOf(settings));const present=new Set(catalogue.songs.map(s=>s.name)),outside=[...pickedNew].filter(n=>!present.has(n));
  $('new-picker-note').textContent='Tick songs to give them a NEW sash on your exported RF page.'+(outside.length?' '+outside.length+' names outside this CSV stay selected unless you clear the selection.':'');
  const detected=categoryNamesOf(catalogue),proposal=detectedCategories(catalogue,settings),valid=!proposal.error;
  pickedCategories=proposal.names;
  $('picker-setup-categories').checked=false;$('picker-setup-categories').disabled=!valid;
  $('picker-current-categories').textContent='Current filters: '+(settings.categories?settings.categoryNames.join(' → '):'Off')+'. Detected in CSV: '+(detected.join(', ')||'none')+'.';
  $('picker-category-help').textContent=valid?'Check this order against RF’s Categories tab; the CSV does not include its saved order. Category changes apply with NEW sashes.':!detected.length?'No categories found. Assign categories in RF, then export again.':catalogue.songs.some(s=>!s.category)?'Some songs have no category. Assign those in RF before automatic setup.':'Automatic setup supports up to 12 categories, each up to 100 characters.';
  pickerCategories();
  $('new-picker-search').value='';
  $('new-picker-list').innerHTML=catalogue.songs.map((s,i)=>`<label class="new-picker-row" data-search="${e((s.displayName+' '+s.name+' '+s.artist+' '+s.category).toLowerCase())}"><input type="checkbox" data-pick-new="${i}" ${pickedNew.has(s.name)?'checked':''}><span><strong>${e(s.displayName||s.name)}</strong><small>${e(s.artist)}</small><small>RF name: ${e(s.name)}</small><small class="picker-song-category">${e(s.category||'No category set')}</small></span><span class="new-picker-tag" ${pickedNew.has(s.name)?'':'hidden'}>NEW</span></label>`).join('');pickerCount();$('new-picker').showModal();
}
$('picker-setup-categories').addEventListener('change',pickerCount);
$('picker-category-list').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;const up=b.dataset.pickerUp!==undefined,i=+(up?b.dataset.pickerUp:b.dataset.pickerDown),j=i+(up?-1:1);if(j<0||j>=pickedCategories.length)return;[pickedCategories[i],pickedCategories[j]]=[pickedCategories[j],pickedCategories[i]];$('picker-setup-categories').checked=!$('picker-setup-categories').disabled;pickerCategories();pickerCount();});
$('clear-new').addEventListener('click',()=>{pickedNew.clear();$('new-picker-list').querySelectorAll('[data-pick-new]').forEach(el=>el.checked=false);pickerCount();});
$('new-picker-list').addEventListener('change',event=>{const el=event.target;if(el.dataset.pickNew===undefined)return;const name=catalogue.songs[+el.dataset.pickNew].name;if(el.checked)pickedNew.add(name);else pickedNew.delete(name);pickerCount();});
$('new-picker-search').addEventListener('input',event=>{const q=event.target.value.toLowerCase().trim();$('new-picker-list').querySelectorAll('[data-search]').forEach(el=>el.hidden=!el.dataset.search.includes(q));});
$('cancel-new').addEventListener('click',()=>$('new-picker').close());
$('apply-new').addEventListener('click',()=>{if(pickedNew.size>200)return;settings.newNames=[...pickedNew].join('\n');if($('picker-setup-categories').checked&&!$('picker-setup-categories').disabled)applyCategories(settings,pickedCategories);form();changed();$('new-picker').close();});
$('remove-catalogue').addEventListener('click',()=>{catalogue=null;catalogueSource='samples';catalogueSaved=saveCatalogue(storage,null);$('catalogue-error').hidden=catalogueSaved;if(!catalogueSaved)$('catalogue-error').textContent='Removed from this preview, but browser storage could not be updated.';refresh();});
$('detect-categories').addEventListener('click',()=>{
  if(!catalogue)return;const result=detectedCategories(catalogue,settings);detectedNames=result.names;
  $('detected-error').textContent=result.error;$('apply-categories').disabled=!!result.error;
  $('detected-category-list').innerHTML=categoryList(detectedNames,'detected');$('category-picker').showModal();
});
for(const id of ['cancel-categories','cancel-categories-bottom'])$(id).addEventListener('click',()=>$('category-picker').close());
$('detected-category-list').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;const up=b.dataset.detectedUp!==undefined,i=+(up?b.dataset.detectedUp:b.dataset.detectedDown),j=i+(up?-1:1);if(j<0||j>=detectedNames.length)return;[detectedNames[i],detectedNames[j]]=[detectedNames[j],detectedNames[i]];$('detected-category-list').innerHTML=categoryList(detectedNames,'detected');});
$('apply-categories').addEventListener('click',()=>{
  if($('apply-categories').disabled)return;
  applyCategories(settings,detectedNames);form();changed();$('category-picker').close();
  const section=revealSection(18);
  document.querySelector('.workspace').dataset.view='settings';document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view==='settings'));
  section.scrollIntoView({block:'start',behavior:'smooth'});$('preview-status').textContent='Category names copied. Reorder them to match RF’s saved category order before exporting.';
});
function changed(){features();save();clearTimeout(updateTimer);updateTimer=setTimeout(refresh,250);}
function download(text,name,type='text/html;charset=utf-8'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function showOutput(result,fallback=false){$('copy-result').textContent=result;$('html-fallback').hidden=!fallback;$('html-fallback').value=currentHTML;$('output-dialog').showModal();if(fallback){$('html-fallback').focus();$('html-fallback').select();}}
function exportNow(){clearTimeout(updateTimer);refresh();return !!currentHTML&&!$('copy').disabled;}
$('validation-summary').addEventListener('click',event=>{
  const button=event.target.closest('[data-focus-error]');if(!button)return;
  const key=button.dataset.focusError,marker=[...document.querySelectorAll('[data-error]')].find(el=>el.dataset.error===key);
  if(marker){revealSection(marker.closest('[data-section]').dataset.section);for(let d=marker;d&&d!==$('settings');d=d.parentElement){d.hidden=false;if(d.tagName==='DETAILS')d.open=true;}const input=marker.closest('label')?.querySelector('input,textarea,select')||marker.closest('[data-extra-list]')?.querySelector('button');input?.focus();input?.scrollIntoView({block:'center',behavior:'smooth'});}
});
document.querySelector('.settings-pane').addEventListener('click',event=>{const button=event.target.closest('[data-editor-group]');if(button)selectSettingsGroup(button.dataset.editorGroup);});
$('settings').addEventListener('submit',event=>event.preventDefault());
$('settings').addEventListener('input',event=>{
  const el=event.target;if(el.dataset.key)settings[el.dataset.key]=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.colour)settings.colours[el.dataset.colour]=el.value;
  if(el.dataset.schedule!==undefined)settings.schedule[+el.dataset.schedule][el.dataset.part]=el.value;
  if(el.dataset.category!==undefined){const old=settings.categoryNames[+el.dataset.category];settings.hiddenCategories=settings.hiddenCategories.map(n=>n===old?el.value:n);settings.categoryNames[+el.dataset.category]=el.value;}
  if(el.dataset.categoryShow!==undefined){const name=settings.categoryNames[+el.dataset.categoryShow];settings.hiddenCategories=settings.hiddenCategories.filter(n=>n!==name);if(!el.checked)settings.hiddenCategories.push(name);}
  if(el.dataset.donation!==undefined){settings.donationRecipients[+el.dataset.donation][el.dataset.part]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.part==='name')el.closest('[data-recipient]').querySelector('.recipient-label').textContent=el.value||'New support card';}
  if(el.dataset.faq!==undefined){settings.faq[+el.dataset.faq][el.dataset.part]=el.value;if(el.dataset.part==='question')el.closest('[data-faq-row]').querySelector('.faq-question-label').textContent=el.value||'New question';}
  if(el.dataset.list){settings[el.dataset.list][+el.dataset.row][el.dataset.part]=el.value;if(['title','label'].includes(el.dataset.part))el.closest('[data-list-row]').querySelector('.extras-row-title').textContent=el.value||listDefinitions[el.dataset.list].label;}
  if(el.dataset.copy){settings.copy[el.dataset.copy]=el.value;$('settings').querySelector(`[data-reset-copy="${el.dataset.copy}"]`).hidden=false;}
  changed();
});
$('settings').addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.dataset.season){const importedNames=settings.categoryNames;settings=changeTheme(settings,el.dataset.season);if(catalogue)settings.categoryNames=importedNames;form();changed();}
  if(el.dataset.listAction){
   const key=el.dataset.listName,def=listDefinitions[key],rows=settings[key],i=+el.dataset.row,action=el.dataset.listAction;
   if(action==='add'&&rows.length<def.max)rows.push({...def.fields});
   else if(action==='remove')rows.splice(i,1);
   else if(action==='up'||action==='down'){const j=i+(action==='up'?-1:1);if(j>=0&&j<rows.length)[rows[i],rows[j]]=[rows[j],rows[i]];}
   form();changed();if(action==='add'){const row=$('settings').querySelector('[data-list-row="'+key+'"][data-row="'+(rows.length-1)+'"]');if(row){row.open=true;row.querySelector('input,select')?.focus();}}
  }
  if(el.id==='add-row'&&settings.schedule.length<12){settings.schedule.push({day:'',hours:''});form();changed();}
  if(el.id==='add-donation-recipient'&&settings.donationRecipients.length<4){settings.donationRecipients.push({name:'',description:'',url:'',image:'',...supportCardDefaults,home:false,info:false});form();changed();const field=$('settings').querySelector(`[data-donation="${settings.donationRecipients.length-1}"]`);if(field){field.closest('[data-recipient]').open=true;field.focus();}}
  if(el.dataset.donationRemove!==undefined){settings.donationRecipients.splice(+el.dataset.donationRemove,1);form();changed();}
  if(el.dataset.remove!==undefined&&settings.schedule.length>1){settings.schedule.splice(+el.dataset.remove,1);form();changed();}
  if(el.id==='pick-new-music')openNewPicker();
  if(el.hasAttribute('data-import-catalogue'))$('catalogue-file').click();
  if(el.dataset.previewMessage)previewMessage(el.dataset.previewMessage,el.dataset.previewMode);
  if(el.id==='reset-colours'){settings.colours=cloneDefaults(settings.theme).colours;form();changed();}
  if(el.id==='add-category'&&settings.categoryNames.length<12){settings.categoryNames.push('');form();changed();}

  if(el.dataset.resetCopy){delete settings.copy[el.dataset.resetCopy];form();changed();}
  if(el.dataset.categoryRemove!==undefined&&settings.categoryNames.length>1){const [removed]=settings.categoryNames.splice(+el.dataset.categoryRemove,1);settings.hiddenCategories=settings.hiddenCategories.filter(n=>n!==removed);form();changed();}
  if(el.dataset.categoryUp!==undefined||el.dataset.categoryDown!==undefined){const up=el.dataset.categoryUp!==undefined,i=+(up?el.dataset.categoryUp:el.dataset.categoryDown),j=i+(up?-1:1);if(j>=0&&j<settings.categoryNames.length){[settings.categoryNames[i],settings.categoryNames[j]]=[settings.categoryNames[j],settings.categoryNames[i]];form();changed();}}
  if(el.id==='add-faq'&&settings.faq.length<20){settings.faq.push({kind:'text',question:'',answer:''});form();const row=$('settings').querySelector('[data-faq-row="'+(settings.faq.length-1)+'"]');row.open=true;row.querySelector('input').focus();changed();}
  if(el.dataset.faqRemove!==undefined){settings.faq.splice(+el.dataset.faqRemove,1);form();changed();}
  if(el.dataset.faqUp!==undefined||el.dataset.faqDown!==undefined){const up=el.dataset.faqUp!==undefined,i=+(up?el.dataset.faqUp:el.dataset.faqDown),j=i+(up?-1:1);if(j>=0&&j<settings.faq.length){[settings.faq[i],settings.faq[j]]=[settings.faq[j],settings.faq[i]];form();changed();}}
  if(el.dataset.restoreFaq&&settings.faq.length<20&&!settings.faq.some(f=>f.kind===el.dataset.restoreFaq)){settings.faq.push(cloneDefaults(settings.theme).faq.find(f=>f.kind===el.dataset.restoreFaq));form();changed();}
  if(el.dataset.goSection){const d=revealSection(el.dataset.goSection);d.scrollIntoView({block:'start',behavior:'smooth'});}
});
$('settings').addEventListener('focusout',event=>{
 const el=event.target;if(el.type!=='url'||(!el.dataset.key&&el.dataset.donation===undefined&&el.dataset.list===undefined&&el.dataset.faq===undefined))return;
 const completed=completeWebAddress(el.value);
 if(completed!==el.value){el.value=completed;if(el.dataset.donation!==undefined)settings.donationRecipients[+el.dataset.donation][el.dataset.part]=completed;else if(el.dataset.list)settings[el.dataset.list][+el.dataset.row][el.dataset.part]=completed;else if(el.dataset.faq!==undefined)settings.faq[+el.dataset.faq][el.dataset.part]=completed;else settings[el.dataset.key]=completed;const note=el.closest('.field').querySelector('.url-completion');if(note)note.textContent='Using '+completed;changed();}
});
function previewMessage(id,requestedMode){
 clearTimeout(updateTimer);if(requestedMode!=='current')mode=requestedMode;air=true;
 document.querySelectorAll('[data-air],[data-mode]').forEach(b=>{const selected=b.hasAttribute('data-air')?b.dataset.air==='on':b.dataset.mode===mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 preview.navigate('music');refresh({messageId:id});
 document.querySelector('.workspace').dataset.view='preview';document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view==='preview'));
 scale();$('preview-status').textContent='Message preview only — no request or vote was sent.';
}
$('copy').addEventListener('click',async()=>{
  if(!exportNow())return;
  try{await navigator.clipboard.writeText(currentHTML);showOutput('Copied! Your complete viewer page is on the clipboard.');}
  catch{showOutput('Clipboard access was unavailable. Select and copy the HTML below, or download the same file.',true);}
});
$('download').addEventListener('click',()=>{if(exportNow()){download(currentHTML,'My RF Viewer.html');showOutput('Downloaded! Open the file in a text editor and copy all its contents into RF.');}});
$('fallback-download').addEventListener('click',()=>download(currentHTML,'My RF Viewer.html'));
$('close-output').addEventListener('click',()=>$('output-dialog').close());
$('save-settings').addEventListener('click',()=>{
  download(settingsFile(settings),'Lights on Sunset template settings.json','application/json');setError('');
});
$('load-settings').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>1000000)throw Error('That settings file is too large.');const next=parseSettings(await file.text(),true);settings=next;form();changed();setError('');}
  catch(err){setError(err.message);}
  event.target.value='';
});
$('reset-settings').addEventListener('click',()=>$('reset-dialog').showModal());
$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
$('confirm-reset').addEventListener('click',()=>{settings=cloneDefaults(settings.theme);form();changed();setError('');$('reset-dialog').close();});
function theme(value){document.documentElement.dataset.theme=value;$('theme').textContent=value==='dark'?'☀':'☾';$('theme').setAttribute('aria-label',`Switch to ${value==='dark'?'light':'dark'} editor`);}
theme(readPreferences(storage).theme==='dark'?'dark':'light');
$('theme').addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(value);writePreferences(storage,{theme:value});});
function scale(){
  preview.setDragScrolling(device!=='desktop');
  const preset=viewports[device].find(p=>p.id===selectedViewports[device]);
  const {width:w,height:h}=preset,stage=$('preview-stage'),r=stage.getBoundingClientRect();if(!r.width)return;
  const factor=Math.min(1,(r.width-48)/w,(r.height-44)/h);
  Object.assign($('preview').style,{width:w+'px',height:h+'px',transform:`scale(${factor})`});
  Object.assign($('device-wrap').style,{width:w*factor+'px',height:h*factor+'px'});$('device-wrap').classList.toggle('desktop',device==='desktop');
  $('dimensions').textContent=`${w} × ${h} · ${preset.label}`;
  $('device-wrap').title=device==='desktop'?'Desktop layout preview':'Drag up or down to scroll, or use your mouse wheel. Click a song to try it.';
}
function presetOptions(){
  $('viewport-preset').innerHTML=viewports[device].map(p=>`<option value="${p.id}">${p.label} · ${p.width} × ${p.height}</option>`).join('');
  $('viewport-preset').value=selectedViewports[device];$('device-options').hidden=device==='desktop';
}
$('viewport-preset').addEventListener('change',()=>{selectedViewports[device]=$('viewport-preset').value;scale();});
document.querySelectorAll('[data-device],[data-air],[data-mode]').forEach(button=>button.addEventListener('click',()=>{
  const attr=button.hasAttribute('data-device')?'device':button.hasAttribute('data-air')?'air':'mode';
  document.querySelectorAll(`[data-${attr}]`).forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
  if(attr==='device'){device=button.dataset.device;presetOptions();scale();}else{if(attr==='air')air=button.dataset.air==='on';else mode=button.dataset.mode;refresh();}
}));
$('reset-demo').addEventListener('click',()=>{clearTimeout(updateTimer);refresh();if(currentDraft)preview.update(currentDraft.html,currentDraft.settings,{air,mode,reset:true,catalogue:catalogueSource==='imported'?catalogue:null,categoriesMismatch:catalogueSource==='imported'&&!categoriesMatch()});$('preview-status').textContent='Demo queue and votes reset. Your show settings are unchanged.';});
document.querySelectorAll('[data-view]').forEach(el=>{if(el.tagName!=='BUTTON')return;el.addEventListener('click',()=>{document.querySelector('.workspace').dataset.view=el.dataset.view;document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b===el));scale();});});
new ResizeObserver(scale).observe($('preview-stage'));
const previewPane=document.querySelector('.preview-pane'),previewControls=document.querySelector('.preview-controls-grid'),previewFoot=document.querySelector('.preview-foot');
const fitPreview=()=>previewPane.style.setProperty('--preview-chrome',`${previewControls.getBoundingClientRect().height+previewFoot.getBoundingClientRect().height+34}px`);
const previewChromeObserver=new ResizeObserver(fitPreview);previewChromeObserver.observe(previewControls);previewChromeObserver.observe(previewFoot);
form();presetOptions();save();catalogueUI();if(restored.error)setError(restored.error);if(restoredCatalogue.error){$('catalogue-error').textContent=restoredCatalogue.error;$('catalogue-error').hidden=false;}
try{const response=await fetch(registry[0].source);if(!response.ok)throw Error('Template could not be loaded. Refresh to try again.');source=await response.text();refresh();scale();if(catalogueSource==='imported')$('preview-status').textContent='Imported CSV snapshot — requests and votes stay in this preview. No live playback.';}
catch(err){setError(err.message);$('export-status').textContent='The manual ZIP download is still available above.';}
if(source){
 const showView=view=>{document.querySelector('.workspace').dataset.view=view;document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));scale();};
 const wizard=createSetupWizard({getSettings:()=>settings,applySettings:next=>{
  settings=next;clearTimeout(updateTimer);form();save();selectSettingsGroup('home');showView('settings');refresh();
  $('setup-result').hidden=false;$('setup-result').scrollIntoView({block:'center',behavior:'instant'});$('setup-result').focus({preventScroll:true});
 }});
 $('close-setup-result').addEventListener('click',()=>{$('setup-result').hidden=true;$('start-setup').focus({preventScroll:true});});
 createTour({storage,startSetup:()=>wizard.start(),
  captureContext:()=>({group:editorGroup,view:document.querySelector('.workspace').dataset.view,x:window.scrollX,y:window.scrollY,details:[...document.querySelectorAll('.settings-pane details')].map(el=>[el,el.open])}),
  showArea:group=>selectSettingsGroup(group,false),showView,
  restoreContext:context=>{selectSettingsGroup(context.group,false);for(const [el,open] of context.details)el.open=open;showView(context.view);window.scrollTo({left:context.x,top:context.y,behavior:'instant'});}
 });
}
