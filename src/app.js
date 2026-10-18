import {createCategoryHelp,missingCategoryNotice} from './category-help.js';
import {categoryIcon,songArtworkMode,renameCategoryArtwork} from './song-artwork.js';
import {updateSongArtworkForm} from './song-artwork-form.js';
import {informationCards,setInformationCards,newInformationCard,informationKey} from './information-cards.js';
import {updateHeaderIdentity} from './header-identity.js';
import {captureViewport,captureField} from './editor-context.js';
import {createIconPicker} from './icon-picker.js';
import {defaultIcon} from './icons.js';
import {seasonOptions} from './season-options.js';
import {createDesignStore,copyDetails,copyGroups} from './design-store.js';
import {registry,templateById,parseBackup} from './template-registry.js';
import {createHistoryBank} from './history.js';
import {updateNameStyleForm} from './name-style-form.js';
import {viewerFilename} from './release-ux.js';
import {createHelp} from './help.js';
import {escapeHTML as e,themes,contrast,namesOf,supportCardDefaults} from './template.js';
import {decorationFile} from './assets.js';
import {copyFields} from './copy.js';
import {listDefinitions} from './visitor-extras.js';
import {completeWebAddress} from './editor-layout.js';
import {settingsForm} from './editor-form.js';
import {readPreferences,writePreferences} from './storage.js';
import {createTour} from './tour.js';
import {createChangelog} from './changelog.js';
import {createSetupWizard} from './setup-wizard.js';
import {createPreview} from './preview.js';
import {viewports,defaultViewports} from './viewports.js';
import {parseCatalogue,categoryNamesOf} from './catalogue.js';
import {detectedCategories,applyCategories,catalogueMatches} from './category-settings.js';
const $=id=>document.getElementById(id);
createChangelog();
createCategoryHelp();
let storage;try{storage=window.localStorage;}catch{storage=null;}
const designStore=createDesignStore(storage),initial=designStore.read();
let settings=initial.settings,catalogue=initial.catalogue,catalogueSource=catalogue?'imported':'samples',catalogueSaved=true;
let source='',currentHTML='',currentDraft=null,device='mobile',air=true,mode='jukebox',updateTimer;
let editorGroups=designStore.template.groups;
const cloneDefaults=theme=>designStore.template.cloneDefaults(theme);
const validate=s=>designStore.template.validate(s);
const render=(source,s)=>designStore.template.render(source,s);
const renderDraft=(source,s)=>designStore.template.renderDraft(source,s);
const changeTheme=(s,theme)=>designStore.template.changeTheme(s,theme);
const settingsFile=()=>designStore.backup();
const savePrivateCatalogue=value=>designStore.saveCatalogue(value);
const histories=createHistoryBank();
const historyKey=()=>designStore.key;
const snapshot=()=>({settings:structuredClone(settings),catalogue:structuredClone(catalogue)});
const history=()=>histories.get(historyKey(),snapshot());
let editAction={label:'Edit settings'},fieldSequence=0;
const fieldGroups=new WeakMap();
function fieldAction(el){
 if(!fieldGroups.has(el))fieldGroups.set(el,'field-'+(++fieldSequence));
 const label=el.closest('label')?.querySelector('.field-label')?.textContent||el.getAttribute('aria-label')||el.dataset.key||el.dataset.part||'field';
 return {label:'Edit '+label.trim(),group:['checkbox','radio'].includes(el.type)||el.tagName==='SELECT'?null:fieldGroups.get(el)};
}
history();
document.addEventListener('click',event=>{const b=event.target.closest('button');if(b){history().endGroup();editAction={label:b.getAttribute('aria-label')||b.textContent.trim()||'Edit settings'};}},true);
document.addEventListener('focusin',event=>{if(event.target.matches('input,textarea,select')){history().endGroup();editAction=fieldAction(event.target);}},true);
function historyUI(){const state=history().status;for(const kind of ['undo','redo']){const b=$('history-'+kind);if(!b)continue;b.disabled=!state[kind==='undo'?'canUndo':'canRedo'];b.title=state[kind+'Label']?kind[0].toUpperCase()+kind.slice(1)+' '+state[kind+'Label']:kind[0].toUpperCase()+kind.slice(1)+' (no changes)';b.setAttribute('aria-label',b.title);}}
function restoreHistory(kind){
 if(document.querySelector('dialog[open]'))return;
 const state=history()[kind]();if(!state)return;
 const open=[...$('settings').querySelectorAll('details[open]')].map(el=>({section:el.dataset.section,faq:el.dataset.faqRow,recipient:el.dataset.recipient,information:el.dataset.informationRow,list:el.dataset.listRow,row:el.dataset.row}));
 settings=state.settings;if(JSON.stringify(catalogue)!==JSON.stringify(state.catalogue))catalogue=state.catalogue;catalogueSource=catalogue?'imported':'samples';catalogueSaved=savePrivateCatalogue(catalogue);
 clearTimeout(updateTimer);form();for(const row of open){const selector=row.section?'[data-section="'+row.section+'"]':row.faq!==undefined?'[data-faq-row="'+row.faq+'"]':row.recipient!==undefined?'[data-recipient="'+row.recipient+'"]':row.information!==undefined?'[data-information-row="'+row.information+'"]':row.list?'[data-list-row="'+row.list+'"][data-row="'+row.row+'"]':null;if(selector){const el=$('settings').querySelector(selector);if(el)el.open=true;}}
 save();refresh();historyUI();designUI();$('history-status').textContent=(kind==='undo'?'Undid':'Redid')+' change for this design.';
}
for(const kind of ['undo','redo'])$('history-'+kind).addEventListener('click',()=>restoreHistory(kind));
document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey)||event.altKey||event.target.closest('input,textarea,select,[contenteditable="true"]')||document.querySelector('dialog[open]'))return;const key=event.key.toLowerCase(),kind=key==='z'?(event.shiftKey?'redo':'undo'):key==='y'?'redo':null;if(kind){event.preventDefault();restoreHistory(kind);}});
const selectedViewports={...defaultViewports};
let editorGroup='setup';
function selectSettingsGroup(group,followPreview=true){if(!editorGroups[group])group=designStore.template.landing;editorGroup=group;document.querySelectorAll('[data-editor-group]').forEach(b=>{b.classList.toggle('selected',b.dataset.editorGroup===group);b.setAttribute('aria-pressed',String(b.dataset.editorGroup===group));});$('settings').querySelectorAll('details[data-section]').forEach(d=>d.hidden=!editorGroups[group].sections.includes(+d.dataset.section)||(d.dataset.seasonOnly&&d.dataset.seasonOnly!==settings.theme));if(followPreview&&editorGroups[group].panel)preview.navigate(editorGroups[group].panel);}
function revealSection(n){const group=Object.keys(editorGroups).find(k=>editorGroups[k].sections.includes(+n));if(group)selectSettingsGroup(group);const d=$('settings').querySelector(`[data-section="${n}"]`);if(d)d.open=true;return d;}
const preview=createPreview($('preview'),text=>{$('preview-status').textContent=text;});
let renderedFAQs=[],renderedRecipients=[],renderedExtraLists={};
function form(){
 const restoreViewport=captureViewport($('settings'),document.activeElement),restoreField=captureField($('settings'));
 const focused=document.activeElement, focusSeason=focused?.dataset?.season;
 const openExtraRows=new Set([...$('settings').querySelectorAll('[data-list-row][open]')].map(d=>renderedExtraLists[d.dataset.listRow]?.[+d.dataset.row]));
 const hadForm=$('settings').children.length>0;
 const open=[...$('settings').querySelectorAll('details[data-section][open]')].map(d=>d.dataset.section);
 const openRecipients=new Set([...$('settings').querySelectorAll('[data-recipient][open]')].map(d=>renderedRecipients[+d.dataset.recipient]));
 const openTeasers=new Set([...$('settings').querySelectorAll('[data-recipient-teaser][open]')].map(d=>renderedRecipients[+d.dataset.recipientTeaser]));
 const openInformation=[...$('settings').querySelectorAll('[data-information-row][open]')].map(d=>d.dataset.informationRow);
 const openCopy=[...$('settings').querySelectorAll('[data-copy-group][open]')].map(d=>d.dataset.copyGroup);
 const openFAQs=new Set([...$('settings').querySelectorAll('[data-faq-row][open]')].map(d=>renderedFAQs[+d.dataset.faqRow]));
 $('settings').innerHTML=settingsForm(settings,designStore.template);
 if(hadForm)$('settings').querySelectorAll('[data-section]').forEach(d=>d.open=open.includes(d.dataset.section));
 $('settings').querySelectorAll('[data-information-row]').forEach(d=>d.open=!hadForm?d.dataset.informationRow==='0':openInformation.includes(d.dataset.informationRow));
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
 selectSettingsGroup(editorGroup,false);features();restoreField();restoreViewport();
}
function features(){
 updateSongArtworkForm($('settings'),settings);
 updateHeaderIdentity($('settings'),settings,designStore.template.features);
 updateNameStyleForm($('settings'),settings,designStore.template.namePreview?.(settings));
 document.querySelectorAll('[data-feature]').forEach(el=>el.hidden=!el.dataset.feature.split('|').some(k=>settings[k])&&!el.querySelector('[data-copy][aria-invalid="true"]')&&!el.contains(document.activeElement));
 document.querySelectorAll('[data-pulsemesh-link]').forEach(el=>el.hidden=settings.pulsemeshButtons==='download');
 document.querySelectorAll('[data-support-menu-note]').forEach(el=>el.hidden=settings.showSupportTab);
 document.querySelectorAll('.decoration-choice').forEach(el=>el.src='assets/'+decorationFile(settings));
 $('settings').querySelectorAll('[data-season-only]').forEach(el=>el.hidden=el.dataset.seasonOnly!==settings.theme||!editorGroups[editorGroup].sections.includes(+el.dataset.section));
}
function setError(text){$('load-error').textContent=text;$('load-error').hidden=!text;}
function restoredSaveStatus(){
 const saved=designStore.isSaved(designStore.template.id,settings.theme),exists=designStore.has(designStore.template.id,settings.theme);
 $('save-status').textContent=saved?'✓ Saved locally':exists?'Not saved locally':'New design — edit to save';
 $('save-status').title=saved?'Settings are saved in this browser.':exists?'These edits are only in this session. Download a settings backup to keep them.':'Changes will be saved in this browser when you edit.';
}
function save(){const saved=designStore.save(snapshot()),ok=saved.settings;catalogueSaved=saved.catalogue;$('save-status').textContent=ok?'✓ Saved locally':'Not saved locally';$('save-status').title=ok?'Settings are saved in this browser.':'Browser storage is unavailable. Save a settings file to keep your work.';return ok;}
function refresh(options={}){
  catalogueUI();
  const errors=validate(settings);document.querySelectorAll('[data-error]').forEach(el=>el.textContent=errors[el.dataset.error]||'');
  document.querySelectorAll('[data-extra-list]').forEach(el=>el.setAttribute('aria-invalid',String(!!errors[el.dataset.extraList])));
  document.querySelectorAll('[data-key],[data-schedule],[data-category],[data-faq],[data-copy],[data-donation],[data-list],[data-information]').forEach(el=>{const k=el.dataset.copy?'copy.'+el.dataset.copy:el.dataset.key||(el.dataset.information!==undefined?informationKey(+el.dataset.information,el.dataset.part):el.dataset.list?`${el.dataset.list}.${el.dataset.row}.${el.dataset.part}`:el.dataset.donation!==undefined?`donationRecipients.${el.dataset.donation}.${el.dataset.part}`:el.dataset.category!==undefined?`categoryNames.${el.dataset.category}`:el.dataset.faq!==undefined?`faq.${el.dataset.faq}.${el.dataset.part}`:`schedule.${el.dataset.schedule}.${el.dataset.part}`);el.setAttribute('aria-invalid',String(!!errors[k]));});
  const labels={name:'Show name',dates:'Show dates',logo:'Logo URL',frequency:'FM frequency',pulsemeshUrl:'PulseMesh display link',noticeTitle:'Notice title',noticeText:'Notice message',charity:'Support card name',donationText:'Support card description',donationUrl:'Support card link',donationImage:'Support card image',newNames:'NEW sequence names',homeCardTitle:'Extra information title',homeCardText:'Extra information message',homeCardLink:'Extra information URL',homeCardLinkLabel:'Extra information button label'};
  informationCards(settings).forEach((_,i)=>{for(const part of ['title','text','image','link','linkLabel'])labels[informationKey(i,part)]='Extra information '+(i+1)+' '+part;});
  for(const [key,label] of copyFields)labels['copy.'+key]=label;
  settings.donationRecipients.forEach((_,i)=>{for(const part of ['name','description','url','image','button','callout','hint'])labels['donationRecipients.'+i+'.'+part]='Support card '+(i+2)+' '+({callout:'teaser heading',hint:'teaser helper',button:'button text'}[part]||part);});
 features();
  const errorCount=Object.keys(errors).length;
  $('validation-summary').hidden=!errorCount;
  $('validation-count').textContent=errorCount+' field'+(errorCount===1?'':'s')+' need'+(errorCount===1?'s':'')+' attention';
  $('validation-list').innerHTML=Object.entries(errors).map(([key,message])=>`<li><button type="button" data-focus-error="${key}">${e(labels[key]||document.querySelector('[data-key="'+key+'"]')?.closest('label')?.querySelector('.field-label')?.textContent|| (key.startsWith('schedule.')?'Schedule row '+(+key.split('.')[1]+1):key.startsWith('categoryNames.')?'Category '+(+key.split('.')[1]+1):key.startsWith('faq.')?'FAQ '+(+key.split('.')[1]+1):Object.keys(listDefinitions).some(k=>key.startsWith(k))?key.split('.').map((p,i)=>i===1?' '+(+p+1)+' ':p).join(''):'Colours'))}</button>: ${e(message)}</li>`).join('');
  $('export-errors').innerHTML=$('validation-list').innerHTML;
  $('export-errors').hidden=!errorCount;
  $('export-status').classList.toggle('export-blocked',!!errorCount);
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
    currentDraft=renderDraft(source,previewSettings);preview.update(currentDraft.html,currentDraft.settings,{air,mode,catalogue:catalogueSource==='imported'?catalogue:null,categoriesMismatch:catalogueSource==='imported'&&!categoriesMatch(),messageId:options.messageId,templateId:designStore.template.id,landing:designStore.template.landing});
    $('export-status').textContent=valid?'RF-ready HTML · Both music modes included · No custom scripts':`Fix ${errorCount} ${errorCount===1?'field':'fields'} below to enable Copy and Download. Your preview is still available.`;
  }
  catch(err){setError(err.message);$('copy').disabled=$('download').disabled=true;$('export-status').textContent='Copy and Download are unavailable: '+err.message;$('export-status').classList.add('export-blocked');}
}
function categoriesMatch(){
  return catalogueMatches(catalogue,settings);
}
function catalogueUI(){
  $('catalogue-source').querySelector('[value="imported"]').disabled=!catalogue;
  $('pick-new').disabled=!catalogue;
  $('pick-new-music').disabled=!catalogue;
  $('pick-moving-music').disabled=!catalogue;
  $('moving-selected-count').textContent=namesOf(settings,'movingHeadNames').length+' selected';
  $('moving-music-help').innerHTML=catalogue?'Choices add Moving heads badges to your exported RF page.':'Import your RF song CSV in Preview catalogue, or enter names below. <button type="button" class="inline-link" data-import-catalogue>Import song CSV</button>';
  $('new-selected-count').textContent=namesOf(settings).length+' selected';
  $('new-music-help').innerHTML=catalogue?'Choices add NEW sashes to your exported RF page.':'Import your RF song CSV in Preview catalogue, or enter names below. <button type="button" class="inline-link" data-import-catalogue>Import song CSV</button>';
  $('pick-new-help').textContent=catalogue?'Choices add NEW sashes to your exported RF page.':'Import your song list to detect categories and choose NEW sashes. Manual entry is under Music.';
  $('detect-categories').disabled=!catalogue;
  $('catalogue-source').value=catalogueSource;$('remove-catalogue').hidden=!catalogue;
  $('catalogue-summary').textContent=catalogue&&catalogueSource==='imported'?`${catalogue.songs.length} imported songs`:'Sample songs';
  const names=catalogue?categoryNamesOf(catalogue):[];
  const mismatch=!!catalogue&&(settings.categories||songArtworkMode(settings)==='category')&&!categoriesMatch();
  for(const id of ['category-warning','catalogue-warning']){const el=$(id);el.hidden=!mismatch;el.textContent='This category list differs from the imported songs. Category buttons are disabled and category icons use the fallback icon in the imported preview. Use Detect categories, edit the list, or import a newer CSV. Export still uses your settings.';}
  if(!catalogue){$('catalogue-status').textContent='Export from RF’s Sequences page. Maximum 2 MB / 2,000 songs.';return;}
  const exactNames=new Set(catalogue.songs.map(s=>s.name)),missing=namesOf(settings).filter(n=>!exactNames.has(n));
  const notes=[`${catalogue.filename}: ${catalogue.songs.length} songs. Categories found: ${names.join(', ')||'none'}.`,catalogueSaved?'Saved only in this browser.':'Loaded for this session only; browser storage was unavailable.'];
  const missingCategory=missingCategoryNotice(catalogue);if(missingCategory)notes.push(missingCategory);
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
    const next=parseCatalogue(await file.text(),file.name);
    $('catalogue-error').hidden=true;openNewPicker(next);
  }catch(err){$('catalogue-error').textContent=err.message;$('catalogue-error').hidden=false;}
  event.target.value='';
});
$('catalogue-source').addEventListener('change',()=>{catalogueSource=$('catalogue-source').value;refresh();$('preview-status').textContent=catalogueSource==='samples'?'Sample songs include labelled message tests.':'Imported CSV snapshot — no live availability or playback information.';});
$('catalogue-options').addEventListener('click',()=>$('catalogue-dialog').showModal());
$('close-catalogue').addEventListener('click',()=>$('catalogue-dialog').close());
$('pick-new').addEventListener('click',()=>openNewPicker());
let pickerKind='new',pickedNew=new Set(),pickedCategories=[],detectedNames=[],pickerCatalogue=null,pendingCatalogue=null,pickerReturnFocus=null;
const categoryList=(names,kind)=>names.map((name,i)=>`<li><span>${e(name)}</span><button type="button" data-${kind}-up="${i}" aria-label="Move ${e(name)} up" ${i===0?'disabled':''}>↑</button><button type="button" data-${kind}-down="${i}" aria-label="Move ${e(name)} down" ${i===names.length-1?'disabled':''}>↓</button></li>`).join('');
function pickerCount(){
 const count=pickedNew.size,withCategories=pickerKind==='new'&&$('picker-setup-categories').checked&&!$('picker-setup-categories').disabled;
 $('new-picker-count').textContent=(pendingCatalogue?pendingCatalogue.songs.length+' songs · ':'')+count+(pickerKind==='moving'?' Moving heads badges':' NEW sashes')+(withCategories?' · '+pickedCategories.length+' category filters':'');
 $('apply-new').textContent=pickerKind==='moving'?'Apply Moving heads badges':pendingCatalogue?'Import & apply choices':withCategories?'Apply NEW sashes & categories':'Apply NEW sashes';
 $('apply-new').disabled=count>200;
 $('new-picker-list').querySelectorAll('[data-pick-new]').forEach(input=>input.closest('label').querySelector('.new-picker-tag').hidden=!input.checked);
}
function pickerCategories(){
  $('picker-category-list').innerHTML=categoryList(pickedCategories,'picker');
}
function openNewPicker(candidate=null,kind='new'){
  pickerKind=kind;
  const next=candidate||catalogue;if(!next)return;
  // Keep an import in memory until catalogue, category and NEW choices are confirmed.
  pendingCatalogue=candidate;pickerCatalogue=next;pickerReturnFocus=candidate?$('catalogue-source'):document.activeElement;
  $('new-picker-title').textContent=kind==='moving'?'Moving heads badges':candidate?'Import song list':'Catalogue & NEW sashes';
  $('cancel-new-bottom').textContent=candidate?'Cancel import':'Cancel';
  $('cancel-new').setAttribute('aria-label',candidate?'Cancel import':'Close without applying changes');
  pickedNew=new Set(namesOf(settings,kind==='moving'?'movingHeadNames':'newNames'));
  $('new-selection-title').textContent=kind==='moving'?'Select songs with moving-head lights':'Select songs to mark as NEW';
  $('new-picker').querySelector('.picker-categories').hidden=kind==='moving';
  $('new-picker').querySelector('[data-category-help-links]').hidden=kind==='moving';
  const present=new Set(pickerCatalogue.songs.map(s=>s.name)),outside=[...pickedNew].filter(n=>!present.has(n));
  $('new-picker-note').textContent=(candidate?candidate.filename+'. Nothing changes until you choose Import & apply choices.':'Nothing changes until you apply your choices.')+(outside.length?' '+outside.length+' names outside this CSV stay selected unless you clear the selection.':'');
  $('new-selection-help').textContent=kind==='moving'?'Tick songs to add a Moving heads badge. Unticked songs stay in your catalogue.':'Tick songs to add a NEW sash to their cards. This is optional; '+(candidate?'all songs will be imported, whether ticked or not.':'unticked songs stay in your catalogue.');
  const missingCategory=missingCategoryNotice(pickerCatalogue);
  $('picker-missing-categories').textContent=missingCategory;$('picker-missing-categories').hidden=kind==='moving'||!missingCategory;
  const detected=categoryNamesOf(pickerCatalogue),proposal=detectedCategories(pickerCatalogue,settings),valid=!proposal.error;
  pickedCategories=proposal.names;
  $('picker-setup-categories').checked=false;$('picker-setup-categories').disabled=!valid;
  $('picker-current-categories').textContent='Current filters: '+(settings.categories?settings.categoryNames.join(' → '):'Off')+'. Detected in CSV: '+(detected.join(', ')||'none')+'.';
  $('picker-category-help').textContent=valid?'Check this order against RF’s Categories tab; the CSV does not include its saved order. Category changes apply with NEW sashes.':proposal.error;
  pickerCategories();
  $('new-picker-search').value='';
  $('new-picker-list').innerHTML=pickerCatalogue.songs.map((s,i)=>`<label class="new-picker-row" data-search="${e((s.displayName+' '+s.name+' '+s.artist+' '+s.category).toLowerCase())}"><input type="checkbox" data-pick-new="${i}" ${pickedNew.has(s.name)?'checked':''}><span><strong>${e(s.displayName||s.name)}</strong><small>${e(s.artist)}</small><small>RF name: ${e(s.name)}</small><small class="picker-song-category">${e(s.category||'No category set')}</small></span><span class="new-picker-tag" ${pickedNew.has(s.name)?'':'hidden'}>${kind==='moving'?'Moving heads':'NEW'}</span></label>`).join('');pickerCount();$('new-picker').showModal();
}
$('picker-setup-categories').addEventListener('change',pickerCount);
$('picker-category-list').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;const up=b.dataset.pickerUp!==undefined,i=+(up?b.dataset.pickerUp:b.dataset.pickerDown),j=i+(up?-1:1);if(j<0||j>=pickedCategories.length)return;[pickedCategories[i],pickedCategories[j]]=[pickedCategories[j],pickedCategories[i]];$('picker-setup-categories').checked=!$('picker-setup-categories').disabled;pickerCategories();pickerCount();});
$('clear-new').addEventListener('click',()=>{pickedNew.clear();$('new-picker-list').querySelectorAll('[data-pick-new]').forEach(el=>el.checked=false);pickerCount();});
$('new-picker-list').addEventListener('change',event=>{const el=event.target;if(el.dataset.pickNew===undefined)return;const name=pickerCatalogue?.songs[+el.dataset.pickNew]?.name;if(name===undefined)return;if(el.checked)pickedNew.add(name);else pickedNew.delete(name);pickerCount();});
$('new-picker-search').addEventListener('input',event=>{const q=event.target.value.toLowerCase().trim();$('new-picker-list').querySelectorAll('[data-search]').forEach(el=>el.hidden=!el.dataset.search.includes(q));});
function closeNewPicker(){
  const target=pickerReturnFocus;
  pendingCatalogue=null;pickerCatalogue=null;pickedNew.clear();pickedCategories=[];
  $('new-picker').close();$('new-picker-list').replaceChildren();$('picker-category-list').replaceChildren();$('new-picker-count').textContent='';
  const focus=target?.isConnected&&target.getClientRects().length?target:$('catalogue-source');focus.focus({preventScroll:true});
}
for(const id of ['cancel-new','cancel-new-bottom'])$(id).addEventListener('click',closeNewPicker);
$('new-picker').addEventListener('cancel',event=>{event.preventDefault();closeNewPicker();});
$('apply-new').addEventListener('click',()=>{
  if(!pickerCatalogue||pickedNew.size>200)return;
  const importing=!!pendingCatalogue;
  const kind=pickerKind;settings[kind==='moving'?'movingHeadNames':'newNames']=[...pickedNew].join('\n');
  if(kind==='new'&&$('picker-setup-categories').checked&&!$('picker-setup-categories').disabled)applyCategories(settings,pickedCategories);
  if(importing){catalogue=pendingCatalogue;catalogueSource='imported';catalogueSaved=savePrivateCatalogue(catalogue);}
  closeNewPicker();form();changed({label:importing?'Import catalogue and choices':kind==='moving'?'Apply Moving heads badges':'Apply NEW and category choices'});
  if(importing){clearTimeout(updateTimer);refresh();$('preview-status').textContent=catalogueSaved?'Song list imported. Your NEW and category choices are applied. Requests and votes stay in this preview.':'Song list imported for this session only; browser storage was unavailable. Keep your original CSV.';}
});
$('remove-catalogue').addEventListener('click',()=>{catalogue=null;catalogueSource='samples';catalogueSaved=savePrivateCatalogue(null);$('catalogue-error').hidden=catalogueSaved;if(!catalogueSaved)$('catalogue-error').textContent='Removed from this preview, but browser storage could not be updated.';changed({label:'Remove imported catalogue'});refresh();});
$('detect-categories').addEventListener('click',()=>{
  if(!catalogue)return;const result=detectedCategories(catalogue,settings);detectedNames=result.names;
  $('detected-error').textContent=result.error;$('apply-categories').disabled=!!result.error;
  $('detected-category-list').innerHTML=categoryList(detectedNames,'detected');$('category-picker').showModal();
});
for(const id of ['cancel-categories','cancel-categories-bottom'])$(id).addEventListener('click',()=>$('category-picker').close());
$('detected-category-list').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;const up=b.dataset.detectedUp!==undefined,i=+(up?b.dataset.detectedUp:b.dataset.detectedDown),j=i+(up?-1:1);if(j<0||j>=detectedNames.length)return;[detectedNames[i],detectedNames[j]]=[detectedNames[j],detectedNames[i]];$('detected-category-list').innerHTML=categoryList(detectedNames,'detected');});
$('apply-categories').addEventListener('click',()=>{
  if($('apply-categories').disabled)return;
  applyCategories(settings,detectedNames);form();changed({label:'Apply detected categories'});$('category-picker').close();
  const section=revealSection(18);
  document.querySelector('.workspace').dataset.view='settings';document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view==='settings'));
  section.scrollIntoView({block:'start',behavior:'smooth'});$('preview-status').textContent='Category names copied. Reorder them to match RF’s saved category order before exporting.';
});
function changed(action=editAction){history().record(snapshot(),action);historyUI();features();const saved=save();designUI();clearTimeout(updateTimer);updateTimer=setTimeout(refresh,250);return saved;}
function download(text,name,type='text/html;charset=utf-8'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function showOutput(result,fallback=false){$('copy-result').textContent=result;$('html-fallback').hidden=!fallback;$('html-fallback').value=currentHTML;$('output-dialog').showModal();if(fallback){$('html-fallback').focus();$('html-fallback').select();}}
function exportNow(){clearTimeout(updateTimer);refresh();return !!currentHTML&&!$('copy').disabled;}
document.querySelector('.settings-pane').addEventListener('click',event=>{
  const button=event.target.closest('[data-focus-error]');if(!button)return;
  const key=button.dataset.focusError,marker=[...document.querySelectorAll('[data-error]')].find(el=>el.dataset.error===key);
  if(marker){revealSection(marker.closest('[data-section]').dataset.section);for(let d=marker;d&&d!==$('settings');d=d.parentElement){d.hidden=false;if(d.tagName==='DETAILS')d.open=true;}const input=marker.closest('label')?.querySelector('input,textarea,select')||marker.closest('[data-extra-list]')?.querySelector('button');input?.focus();input?.scrollIntoView({block:'center',behavior:'smooth'});}
});
document.querySelector('.settings-pane').addEventListener('click',event=>{const button=event.target.closest('[data-editor-group]');if(button)selectSettingsGroup(button.dataset.editorGroup);});
const iconPicker=createIconPicker((target,id)=>{
 if(target.role){settings.icons||={};if(id)settings.icons[target.role]=id;else delete settings.icons[target.role];}
 else if(target.setting)settings[target.setting]=id;
 else if(target.category!==undefined)settings.categoryIcons={...settings.categoryIcons,[settings.categoryNames[target.category]]:id};
 else settings[target.list][target.row].icon=id;
 form();changed({label:'Change '+(target.role||target.setting||(target.category!==undefined?'category':target.list))+' icon'});
 $('settings').querySelector(target.role?`[data-icon-role="${target.role}"]`:target.setting?`[data-icon-setting="${target.setting}"]`:target.category!==undefined?`[data-icon-category="${target.category}"]`:`[data-icon-list="${target.list}"][data-icon-row="${target.row}"]`)?.focus({preventScroll:true});
});
$('settings').addEventListener('click',event=>{const b=event.target.closest('[data-icon-role],[data-icon-list],[data-icon-category],[data-icon-setting]');if(!b)return;const target=b.dataset.iconRole?{role:b.dataset.iconRole}:b.dataset.iconSetting?{setting:b.dataset.iconSetting}:b.dataset.iconCategory!==undefined?{category:+b.dataset.iconCategory}:{list:b.dataset.iconList,row:+b.dataset.iconRow};iconPicker.open(target,target.role?settings.icons?.[target.role]||defaultIcon(target.role,settings,designStore.template.separateSeasons):target.setting?settings[target.setting]:target.category!==undefined?categoryIcon(settings,settings.categoryNames[target.category]):settings[target.list][target.row].icon,b);});
$('settings').addEventListener('submit',event=>event.preventDefault());
$('settings').addEventListener('input',event=>{
  const el=event.target;editAction=fieldAction(el);if(el.dataset.key)settings[el.dataset.key]=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.information!==undefined){const rows=informationCards(settings);rows[+el.dataset.information][el.dataset.part]=el.value;setInformationCards(settings,rows);}
  if(el.dataset.information!==undefined||el.dataset.key==='homeCardTitle'){const row=el.closest('[data-information-row]');if(row)row.querySelector('.information-title').textContent=informationCards(settings)[+row.dataset.informationRow].title||'Extra information';}
  if(el.dataset.colour)settings.colours[el.dataset.colour]=el.value;
  if(el.dataset.schedule!==undefined)settings.schedule[+el.dataset.schedule][el.dataset.part]=el.value;
  if(el.dataset.category!==undefined){const old=settings.categoryNames[+el.dataset.category];renameCategoryArtwork(settings,old,el.value);settings.hiddenCategories=settings.hiddenCategories.map(n=>n===old?el.value:n);settings.categoryNames[+el.dataset.category]=el.value;}
  if(el.dataset.categoryShow!==undefined){const name=settings.categoryNames[+el.dataset.categoryShow];settings.hiddenCategories=settings.hiddenCategories.filter(n=>n!==name);if(!el.checked)settings.hiddenCategories.push(name);}
  if(el.dataset.donation!==undefined){settings.donationRecipients[+el.dataset.donation][el.dataset.part]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.part==='name')el.closest('[data-recipient]').querySelector('.recipient-label').textContent=el.value||'New support card';}
  if(el.dataset.faq!==undefined){settings.faq[+el.dataset.faq][el.dataset.part]=el.value;if(el.dataset.part==='question')el.closest('[data-faq-row]').querySelector('.faq-question-label').textContent=el.value||'New question';}
  if(el.dataset.list){settings[el.dataset.list][+el.dataset.row][el.dataset.part]=el.value;if(['title','label'].includes(el.dataset.part))el.closest('[data-list-row]').querySelector('.extras-row-title').textContent=el.value||listDefinitions[el.dataset.list].label;}
  if(el.dataset.copy){settings.copy[el.dataset.copy]=el.value;$('settings').querySelector(`[data-reset-copy="${el.dataset.copy}"]`).hidden=false;}
  changed();
});
$('settings').addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.dataset.season){if(designStore.template.separateSeasons){switchDesign(designStore.template.id,el.dataset.season);return;}const importedNames=settings.categoryNames,importedIcons=settings.categoryIcons;settings=changeTheme(settings,el.dataset.season);if(catalogue){settings.categoryNames=importedNames;settings.categoryIcons=importedIcons;}form();changed();}
  if(el.dataset.informationAction){
   const restoreViewport=captureViewport(el),rows=informationCards(settings),action=el.dataset.informationAction,i=+el.dataset.row;let next=i;
   if(action==='add'&&rows.length<5){rows.push(newInformationCard());next=rows.length-1;}
   else if(action==='remove'){rows.splice(i,1);next=Math.max(0,i-1);}
   else if(action==='up'||action==='down'){const j=i+(action==='up'?-1:1);if(j>=0&&j<rows.length){[rows[i],rows[j]]=[rows[j],rows[i]];next=j;}}
   setInformationCards(settings,rows);form();changed();const row=$('settings').querySelector('[data-information-row="'+next+'"]');
   if(row&&settings.homeCard){row.open=true;(action==='add'?row.querySelector('input'):row.querySelector('summary'))?.focus({preventScroll:true});}
   else $('settings').querySelector('[data-key="homeCard"]')?.focus({preventScroll:true});restoreViewport();
  }
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
  if(el.id==='pick-moving-music')openNewPicker(null,'moving');
  if(el.hasAttribute('data-import-catalogue'))$('catalogue-file').click();
  if(el.dataset.previewMessage)previewMessage(el.dataset.previewMessage,el.dataset.previewMode);
  if(el.hasAttribute('data-reset-name-colour')){settings.customNameColour=false;$('settings').querySelector('[data-key=customNameColour]').checked=false;$('settings').querySelector('[data-key=customNameColour]').focus();changed();}
  if(el.id==='reset-colours'){settings.colours=structuredClone(designStore.template.presets?.[settings.theme].find(p=>p.id===settings.colourPreset)?.colours||cloneDefaults(settings.theme).colours);form();changed();}
  if(el.id==='add-category'&&settings.categoryNames.length<12){settings.categoryNames.push('');form();changed();}

  if(el.dataset.resetCopy){delete settings.copy[el.dataset.resetCopy];form();changed();}
  if(el.dataset.categoryRemove!==undefined&&settings.categoryNames.length>1){const [removed]=settings.categoryNames.splice(+el.dataset.categoryRemove,1);delete settings.categoryIcons[removed];settings.hiddenCategories=settings.hiddenCategories.filter(n=>n!==removed);form();changed();}
  if(el.dataset.categoryUp!==undefined||el.dataset.categoryDown!==undefined){const up=el.dataset.categoryUp!==undefined,i=+(up?el.dataset.categoryUp:el.dataset.categoryDown),j=i+(up?-1:1);if(j>=0&&j<settings.categoryNames.length){[settings.categoryNames[i],settings.categoryNames[j]]=[settings.categoryNames[j],settings.categoryNames[i]];form();changed();}}
  if(el.id==='add-faq'&&settings.faq.length<20){settings.faq.push({kind:'text',question:'',answer:''});form();const row=$('settings').querySelector('[data-faq-row="'+(settings.faq.length-1)+'"]');row.open=true;row.querySelector('input').focus();changed();}
  if(el.dataset.faqRemove!==undefined){settings.faq.splice(+el.dataset.faqRemove,1);form();changed();}
  if(el.dataset.faqUp!==undefined||el.dataset.faqDown!==undefined){const up=el.dataset.faqUp!==undefined,i=+(up?el.dataset.faqUp:el.dataset.faqDown),j=i+(up?-1:1);if(j>=0&&j<settings.faq.length){[settings.faq[i],settings.faq[j]]=[settings.faq[j],settings.faq[i]];form();changed();}}
  if(el.dataset.restoreFaq&&settings.faq.length<20&&!settings.faq.some(f=>f.kind===el.dataset.restoreFaq)){settings.faq.push(cloneDefaults(settings.theme).faq.find(f=>f.kind===el.dataset.restoreFaq));form();changed();}
  if(el.dataset.goSection){const d=revealSection(el.dataset.goSection);d.scrollIntoView({block:'start',behavior:'smooth'});}
});
$('settings').addEventListener('focusout',event=>{
 const el=event.target;if(el.type!=='url'||(!el.dataset.key&&el.dataset.donation===undefined&&el.dataset.list===undefined&&el.dataset.faq===undefined&&el.dataset.information===undefined))return;
 const completed=completeWebAddress(el.value);
 if(completed!==el.value){el.value=completed;if(el.dataset.information!==undefined){const rows=informationCards(settings);rows[+el.dataset.information][el.dataset.part]=completed;setInformationCards(settings,rows);}else if(el.dataset.donation!==undefined)settings.donationRecipients[+el.dataset.donation][el.dataset.part]=completed;else if(el.dataset.list)settings[el.dataset.list][+el.dataset.row][el.dataset.part]=completed;else if(el.dataset.faq!==undefined)settings.faq[+el.dataset.faq][el.dataset.part]=completed;else settings[el.dataset.key]=completed;const note=el.closest('.field').querySelector('.url-completion');if(note)note.textContent='Using '+completed;changed();}
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
$('download').addEventListener('click',()=>{if(exportNow()){download(currentHTML,viewerFilename(settings,designStore.template));showOutput('Downloaded! Open the file in a text editor and copy all its contents into RF.');}});
$('fallback-download').addEventListener('click',()=>download(currentHTML,viewerFilename(settings,designStore.template)));
$('close-output').addEventListener('click',()=>$('output-dialog').close());
$('save-settings').addEventListener('click',()=>{
  download(settingsFile(settings),designStore.template.name+' settings.json','application/json');setError('');
});
let pendingSettings=null;
const closeSettingsLoad=()=>{$('load-settings-dialog').close();pendingSettings=null;$('load-settings-button').focus({preventScroll:true});};
$('load-settings-button').addEventListener('click',()=>$('load-settings').click());
$('cancel-load-settings').addEventListener('click',closeSettingsLoad);
$('close-load-settings').addEventListener('click',closeSettingsLoad);
$('load-settings-dialog').addEventListener('cancel',event=>{event.preventDefault();closeSettingsLoad();});
$('backup-before-load').addEventListener('click',()=>download(settingsFile(settings),designStore.template.name+' settings.json','application/json'));
$('confirm-load-settings').addEventListener('click',()=>{
 if(!pendingSettings)return;
 const next=pendingSettings;closeSettingsLoad();clearTimeout(updateTimer);const result=designStore.import(next.text,(key,before,after)=>histories.get(key,before).record(after,{label:'Import '+themes[after.settings.theme].name+' settings'}));switchDesign(result.template,result.season);setError(result.saved?'':'Backup loaded for this session; browser storage is unavailable.');
});
$('load-settings').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>1000000)throw Error('That settings file is too large.');const text=await file.text(),next=parseBackup(text);pendingSettings={text,backup:next};const t=templateById(next.template);$('load-settings-title').textContent='Load '+t.name+' settings?';$('load-settings-description').textContent='Load “'+file.name+'” into '+t.name+(t.separateSeasons?' — both Christmas and Halloween designs':'')+'? This replaces those settings. Other templates and imported catalogues stay as they are.';$('load-settings-dialog').showModal();$('cancel-load-settings').focus();setError('');}
  catch(err){setError(err.message);}
  event.target.value='';
});
function finishExport(){
 clearTimeout(updateTimer);refresh();
 document.querySelector('.workspace').dataset.view='settings';document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view==='settings'));
 const hasErrors=!$('validation-summary').hidden,target=hasErrors?$('validation-summary'):$('save-export');
 if(hasErrors)target.open=true;
 target.scrollIntoView({block:'center',behavior:'instant'});
 (hasErrors?$('validation-count'):$('export-heading')).focus({preventScroll:true});
}
document.querySelectorAll('[data-finish-export]').forEach(button=>button.addEventListener('click',finishExport));
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
$('reset-demo').addEventListener('click',()=>{clearTimeout(updateTimer);refresh();if(currentDraft)preview.update(currentDraft.html,currentDraft.settings,{air,mode,reset:true,templateId:designStore.template.id,landing:designStore.template.landing,catalogue:catalogueSource==='imported'?catalogue:null,categoriesMismatch:catalogueSource==='imported'&&!categoriesMatch()});$('preview-status').textContent='Demo queue and votes reset. Your show settings are unchanged.';});
document.querySelectorAll('[data-view]').forEach(el=>{if(el.tagName!=='BUTTON')return;el.addEventListener('click',()=>{document.querySelector('.workspace').dataset.view=el.dataset.view;document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b===el));scale();});});
new ResizeObserver(scale).observe($('preview-stage'));
const previewPane=document.querySelector('.preview-pane'),previewControls=document.querySelector('.preview-controls-grid'),previewFoot=document.querySelector('.preview-foot');
const fitPreview=()=>previewPane.style.setProperty('--preview-chrome',`${previewControls.getBoundingClientRect().height+previewFoot.getBoundingClientRect().height+34}px`);
const previewChromeObserver=new ResizeObserver(fitPreview);previewChromeObserver.observe(previewControls);previewChromeObserver.observe(previewFoot);

let sourceGeneration=0,startChosenWizard=()=>{},copySources=[];
const sources=new Map();
async function templateSource(t){if(!sources.has(t.id)){const response=await fetch(t.source);if(!response.ok)throw Error('Template could not be loaded. Try again.');sources.set(t.id,await response.text());}return sources.get(t.id);}
function designUI(){const t=designStore.template;$('active-design').textContent=t.name+' · '+themes[settings.theme].name;$('reset-dialog').querySelector('h2').textContent='Reset '+t.name+' · '+themes[settings.theme].name+' to its defaults?';$('reset-settings').textContent='Reset to defaults';$('save-settings').textContent=t.separateSeasons?'Back up both seasons':'Download settings backup';$('copy-design-details').disabled=designStore.all().length===0;$('manual-template').href='downloads/'+t.package;$('manual-template').textContent='↓ Download '+t.name+' + instructions';}
async function switchDesign(id,season){
 const generation=++sourceGeneration;histories.endGroups();clearTimeout(updateTimer);
 const next=designStore.select(id,season);settings=next.settings;catalogue=next.catalogue;catalogueSource=catalogue?'imported':'samples';editorGroups=designStore.template.groups;editorGroup='setup';source='';$('editor-groups')?.remove();histories.seed(historyKey(),snapshot());history();form();historyUI();designUI();refresh();preview.navigate(designStore.template.landing);
 try{const loaded=await templateSource(designStore.template);if(generation!==sourceGeneration)return;source=loaded;refresh();scale();restoredSaveStatus();}catch(err){if(generation===sourceGeneration)setError(err.message);}
}
const chooser=$('template-dialog');let candidate=designStore.template.id,chooserSeason=settings.theme;
const chooserPreviews=new Map();
function paintTemplateChoices(){
 $('template-season').innerHTML=seasonOptions(chooserSeason,'data-chooser-season');
 for(const t of registry){const button=$('template-choice-'+t.id),selected=candidate===t.id;button.classList.toggle('selected',selected);button.closest('article').classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));button.querySelector('small').textContent=(selected?'✓ Selected · ':'')+(designStore.has(t.id,chooserSeason)?'Resume saved design':'Start a new design');}
}
async function refreshTemplatePreviews(){const season=chooserSeason;for(const t of registry){const html=await templateSource(t);if(season!==chooserSeason)return;const s=t.cloneDefaults(season);chooserPreviews.get(t.id).update(t.render(html,s),s,{reset:true,thumbnail:true,landing:t.landing,templateId:t.id});}}
function openTemplates(){candidate=designStore.template.id;chooserSeason=settings.theme;paintTemplateChoices();chooser.showModal();chooser.scrollTop=0;$('cancel-template').focus({preventScroll:true});refreshTemplatePreviews().catch(err=>setError(err.message));}
$('template-cards').innerHTML=registry.map(t=>`<article class="template-choice"><button type="button" class="template-thumb" data-expand-template="${t.id}" aria-label="Explore ${e(t.name)} phone preview"><iframe id="template-preview-${t.id}" sandbox="allow-same-origin" tabindex="-1" aria-hidden="true" title="${e(t.name)} illustrative preview"></iframe><span>⤢ Explore full preview</span></button><h3>${e(t.name)}</h3><p>${e(t.description)}</p><button id="template-choice-${t.id}" type="button" data-template-choice="${t.id}">Choose ${e(t.name)}<small></small></button></article>`).join('');
for(const t of registry)chooserPreviews.set(t.id,createPreview($('template-preview-'+t.id),()=>{}));
const thumbnailSizer=new ResizeObserver(entries=>{for(const {target} of entries)target.style.setProperty('--thumb-scale',String(Math.min(.7,target.clientWidth/390)));});
chooser.querySelectorAll('.template-thumb').forEach(el=>thumbnailSizer.observe(el));
$('choose-template').addEventListener('click',openTemplates);
$('template-cards').addEventListener('click',event=>{const b=event.target.closest('[data-template-choice]');if(b){candidate=b.dataset.templateChoice;paintTemplateChoices();}const expand=event.target.closest('[data-expand-template]');if(expand){const t=registry.find(t=>t.id===expand.dataset.expandTemplate);openExpanded(t,t.cloneDefaults(chooserSeason));}});
$('template-season').addEventListener('click',event=>{const b=event.target.closest('[data-chooser-season]');if(!b)return;chooserSeason=b.dataset.chooserSeason;paintTemplateChoices();$('template-season').querySelector(`[data-chooser-season="${chooserSeason}"]`).focus();refreshTemplatePreviews().catch(err=>setError(err.message));});
$('cancel-template').addEventListener('click',()=>chooser.close());
async function chooseDesign(setup){chooser.close();await switchDesign(candidate,chooserSeason);if(setup)startChosenWizard();}
$('apply-template').addEventListener('click',()=>chooseDesign(false));
$('setup-template').addEventListener('click',()=>chooseDesign(true));
const expanded=$('expanded-preview'),expandedAdapter=createPreview($('expanded-preview-frame'),()=>{});
let expandedDesign=null,expandedAir=true,expandedGeneration=0,expandedFocus=null;
expandedAdapter.setDragScrolling(true);
async function refreshExpanded(reset=false){
 const generation=++expandedGeneration,view=expandedDesign;if(!view)return;
 const html=await templateSource(view.template);if(generation!==expandedGeneration||!expanded.open)return;
 const draft=view.template.renderDraft(html,view.settings);
 await expandedAdapter.update(draft.html,draft.settings,{reset,startAtLanding:reset,air:expandedAir,mode:view.mode,templateId:view.template.id,landing:view.template.landing,catalogue:view.catalogue,categoriesMismatch:view.categoriesMismatch});
}
function openExpanded(template,value,options={}){
 expandedFocus=document.activeElement;expandedDesign={template,settings:structuredClone(value),mode:'jukebox',catalogue:null,...options};expandedAir=options.air??true;
 $('expanded-preview-title').textContent=template.name+' · '+themes[value.theme].name;
 expanded.querySelectorAll('[data-expanded-air]').forEach(b=>{const on=(b.dataset.expandedAir==='on')===expandedAir;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 expanded.showModal();refreshExpanded(true).catch(err=>setError(err.message));
}
expanded.querySelectorAll('[data-expanded-air]').forEach(button=>button.addEventListener('click',()=>{expandedAir=button.dataset.expandedAir==='on';expanded.querySelectorAll('[data-expanded-air]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});refreshExpanded().catch(err=>setError(err.message));}));
$('close-expanded-preview').addEventListener('click',()=>expanded.close());
expanded.addEventListener('close',()=>{expandedGeneration++;expandedFocus?.focus({preventScroll:true});});
$('expand-preview').addEventListener('click',()=>openExpanded(designStore.template,settings,{air,mode,catalogue:catalogueSource==='imported'?catalogue:null,categoriesMismatch:catalogueSource==='imported'&&!categoriesMatch()}));
$('copy-design-details').addEventListener('click',()=>{copySources=designStore.all().filter(d=>d.template!==designStore.template.id||d.season!==settings.theme);$('copy-source').innerHTML=copySources.map((d,i)=>`<option value="${i}">${e(d.name+' · '+themes[d.season].name+' · '+d.settings.name)}</option>`).join('');$('copy-groups').innerHTML=Object.keys(copyGroups).map(group=>`<label class="toggle"><input type="checkbox" value="${group}" ${['identity','listening'].includes(group)?'checked':''}>${group[0].toUpperCase()+group.slice(1)}</label>`).join('');$('apply-copy-details').disabled=!copySources.length;$('copy-review').textContent='Copy only the selected groups into '+designStore.template.name+' · '+themes[settings.theme].name+'. Appearance and imported CSVs remain separate. Existing values in these groups will be replaced.';updateCopyReview();$('copy-design-dialog').showModal();});
function updateCopyReview(){const from=copySources[+$('copy-source').value];const groups=[...$('copy-groups').querySelectorAll('input:checked')].map(el=>el.value);$('apply-copy-details').disabled=!from||!groups.length;if(!from){$('copy-details-preview').textContent='Save another design first to copy its details.';return;}const s=from.settings;const summaries={identity:s.name,listening:[s.fm?s.frequency+' FM':'',s.pulsemesh?'PulseMesh':'',s.listening].filter(Boolean).join(' · ')||'No listening options enabled',schedule:s.dates+' · '+s.schedule.map(r=>r.day+': '+r.hours).join('; '),music:s.categoryNames.length+' category rows · '+namesOf(s).length+' NEW assignments · '+namesOf(s,'movingHeadNames').length+' Moving heads badges',info:(s.homeCard?informationCards(s).length+' extra-information cards':'Extra-information cards off')+' · '+(s.showMainGuidance?'main-screen guidance on':'main-screen guidance off')+' · '+s.faq.length+' FAQs · '+s.playlists.length+' playlist entries · '+s.resources.length+' resource entries · '+s.socials.length+' social links',support:s.donations?(1+s.donationRecipients.length)+' support cards':'Support cards disabled'};$('copy-details-preview').replaceChildren(...groups.map(group=>{const row=document.createElement('p');const label=document.createElement('strong');label.textContent=group[0].toUpperCase()+group.slice(1)+': ';row.append(label,document.createTextNode(summaries[group]));return row;}));}
$('copy-source').addEventListener('change',updateCopyReview);$('copy-groups').addEventListener('change',updateCopyReview);
$('cancel-copy-details').addEventListener('click',()=>$('copy-design-dialog').close());
$('apply-copy-details').addEventListener('click',()=>{const from=copySources[+$('copy-source').value];if(!from)return;const groups=[...$('copy-groups').querySelectorAll('input:checked')].map(el=>el.value);settings=copyDetails(from.settings,settings,groups,designStore.template);$('copy-design-dialog').close();form();changed({label:'Copy '+groups.join(', ')+' from '+from.name});designUI();});
designUI();
form();presetOptions();historyUI();catalogueUI();if(designStore.errors.length)setError(designStore.errors.join(' '));
try{const response=await fetch(designStore.template.source);if(!response.ok)throw Error('Template could not be loaded. Refresh to try again.');source=await response.text();refresh();scale();restoredSaveStatus();if(catalogueSource==='imported')$('preview-status').textContent='Imported CSV snapshot — requests and votes stay in this preview. No live playback.';}
catch(err){setError(err.message);$('export-status').textContent='Copy and Download are unavailable because the viewer template could not load. Reload to try again, or use the manual ZIP download above.';$('export-status').classList.add('export-blocked');}
if(source){
 const showView=view=>{document.querySelector('.workspace').dataset.view=view;document.querySelectorAll('.narrow-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));scale();};
 const wizard=createSetupWizard({getTemplate:()=>designStore.template,getSettings:()=>settings,applySettings:(next,{takeTour=false}={})=>{
  settings=next;clearTimeout(updateTimer);form();const saved=changed({label:'Apply setup wizard'});selectSettingsGroup(designStore.template.landing);showView('settings');refresh();
  $('setup-result').hidden=false;$('setup-result').scrollIntoView({block:'center',behavior:'instant'});$('setup-result').focus({preventScroll:true});if(takeTour&&saved)tour.start({currentTarget:$('start-setup')});
 }});
 $('close-setup-result').addEventListener('click',()=>{$('setup-result').hidden=true;$('start-setup').focus({preventScroll:true});});
 const tour=createTour({storage,getTemplate:()=>designStore.template,
  captureContext:()=>({group:editorGroup,view:document.querySelector('.workspace').dataset.view,x:window.scrollX,y:window.scrollY,details:[...document.querySelectorAll('.settings-pane details')].map(el=>[el,el.open])}),
  showArea:group=>selectSettingsGroup(group,false),showView,
  restoreContext:context=>{selectSettingsGroup(context.group,false);for(const [el,open] of context.details)el.open=open;showView(context.view);window.scrollTo({left:context.x,top:context.y,behavior:'instant'});}
 });
 createHelp({startTour:()=>tour.start({currentTarget:$('open-help')})});
 startChosenWizard=()=>wizard.start();
 if(designStore.firstVisit)openTemplates();
}
