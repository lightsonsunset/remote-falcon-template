import {cloneDefaults,settingsFile} from '../src/template.js';
import {SETTINGS_KEY} from '../src/storage.js';
import {restoreCatalogue} from '../src/catalogue.js';
const frame=document.getElementById('editor'),results=document.getElementById('results'),run=document.getElementById('run');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
const load=()=>new Promise(resolve=>{frame.onload=()=>setTimeout(resolve,450);frame.contentWindow.location.reload();});
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use the isolated localhost test origin.');
 run.disabled=true;results.replaceChildren();const original=localStorage.getItem(SETTINGS_KEY),cat=restoreCatalogue(localStorage).catalogue;
 try{
  localStorage.setItem(SETTINGS_KEY,settingsFile(cloneDefaults()));await load();
  let d=frame.contentDocument;
  const q=s=>d.querySelector(s),p=()=>q('#preview').contentDocument;
  const input=async(selector,value)=>{const el=q(selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await wait(450);};
  const click=async selector=>{q(selector).click();await wait(450);};
  const shown=el=>!!el&&el.getClientRects().length>0&&el.ownerDocument.defaultView.getComputedStyle(el).display!=='none';
  for(const mode of ['jukebox','voting'])for(const air of ['on','off']){
   await click(`[data-mode="${mode}"]`);await click(`[data-air="${air}"]`);await click('[data-editor-group="home"]');
   check(`Countdown visible on Home: ${mode}/${air}`,shown(p().querySelector('.christmas-countdown'))&&/^\d+$/.test(p().querySelector('#to-christmas-days')?.textContent));
  }
  await input('[data-key="countdown"]',false);check('Countdown toggle removes preview card',!p().querySelector('.christmas-countdown'));
  await input('[data-key="countdown"]',true);await click('[data-editor-group="setup"]');await click('[data-season="halloween"]');check('Halloween starts off with its own control',!p().querySelector('.seasonal-countdown')&&!!q('[data-key="halloweenCountdown"]'));await click('[data-season="christmas"]');
  await input('[data-key="fm"]',true);await input('[data-key="frequency"]','101.2');await click('[data-air="on"]');
  for(const mode of ['jukebox','voting']){
   await click(`[data-mode="${mode}"]`);await click('[data-editor-group="music"]');await input('[data-key="musicFM"]',true);check(`FM reminder visible: ${mode}`,shown(p().querySelector('.music-listen-reminder'))&&p().querySelector('.music-listen-reminder').textContent.includes('101.2'));
   await input('[data-key="musicFM"]',false);check(`FM reminder hidden: ${mode}`,!shown(p().querySelector('.music-listen-reminder')));await click('[data-editor-group="home"]');check(`Home listening retained: ${mode}`,p().querySelector('.radio-frequency')?.textContent==='101.2 FM');
  }
  await click('[data-mode="jukebox"]');await click('[data-editor-group="music"]');await click('#reset-demo');
  await input('[data-copy="EMPTY_NEXT"]','No pick waiting');await input('[data-copy="EMPTY_QUEUE"]','Room for your favourite');
  check('Up Next uses edited empty wording',p().defaultView.getComputedStyle(p().querySelector('.next-playlist'),'::after').content.includes('No pick waiting'));
  check('Request Queue uses edited empty wording',p().defaultView.getComputedStyle(p().querySelector('.jukebox-queue-container'),'::after').content.includes('Room for your favourite'));
  await input('[data-copy="QUEUE_HELP"]','The queue holds up to {queueLimit} songs.');await input('[data-copy="JUKEBOX_HELP"]','Choose a song (limit {queueLimit}).');
  check('Queue/request instructions resolve the demo limit',p().querySelector('.queue-instructions').textContent==='The queue holds up to 10 songs.'&&p().querySelector('.request-copy').textContent.includes('limit 10'));
  if(cat){
   const rows=()=>[...p().querySelectorAll('#playlists_container [data-key]')];
   const first=cat.songs[0],second=cat.songs[1];
   check('Imported Now Playing artist matches CSV',p().querySelector('.playing-now .jukebox-list-artist')?.textContent===first.artist);
   rows().find(el=>el.dataset.key===first.name).click();await wait(2900);
   check('First request appears Up Next with its artist',p().querySelector('.next-playlist').textContent===(first.displayName||first.name)+first.artist);
   check('Up Next is excluded from remaining queue',p().querySelector('.jukebox-queue-container').children.length===0);
   if(second){rows().find(el=>el.dataset.key===second.name).click();await wait(2900);check('Remaining queue uses title and artist from CSV',p().querySelector('.jukebox-queue-title')?.textContent===(second.displayName||second.name)&&p().querySelector('.jukebox-queue-artist')?.textContent===second.artist);}
   await click('#pick-new');check('Unselected songs have no NEW tag',[...d.querySelectorAll('.new-picker-tag')].every(el=>el.hidden));
   const firstPick=q('[data-pick-new="0"]');firstPick.checked=true;firstPick.dispatchEvent(new Event('change',{bubbles:true}));check('Only selected row gains NEW',!firstPick.closest('label').querySelector('.new-picker-tag').hidden&&[...d.querySelectorAll('.new-picker-tag:not([hidden])')].length===1);
   check('Picker includes CSV category for each row',[...d.querySelectorAll('.picker-song-category')].every((el,i)=>el.textContent===(cat.songs[i].category||'No category set')));
   await click('#clear-new');check('Clear selection removes every pending sash',q('#new-picker-count').textContent.startsWith('0 NEW sashes')&&[...d.querySelectorAll('[data-pick-new]')].every(el=>!el.checked));
   firstPick.checked=true;firstPick.dispatchEvent(new Event('change',{bubbles:true}));q('#picker-setup-categories').checked=!q('#picker-setup-categories').disabled;await click('#cancel-new');check('Cancel preserves existing names/categories',q('[data-key="newNames"]').value===''&&!q('[data-key="categories"]').checked);
   await click('#pick-new');q('[data-pick-new="0"]').checked=true;q('[data-pick-new="0"]').dispatchEvent(new Event('change',{bubbles:true}));const canCategories=!q('#picker-setup-categories').disabled;q('#picker-setup-categories').checked=canCategories;await click('#apply-new');
   check('Apply NEW sashes saves exact RF sequence name',q('[data-key="newNames"]').value===first.name);
   if(canCategories)check('Category setup applies from same picker',q('[data-key="categories"]').checked&&[...d.querySelectorAll('[data-category]')].every(el=>cat.songs.some(s=>s.category===el.value)));
  }else check('No catalogue: picker disabled with guidance',q('#pick-new').disabled&&q('#pick-new-help').textContent.includes('Import'));
  await click('[data-editor-group="support"]');q('[data-section="9"]').open=true;await input('[data-key="donations"]',true);await input('[data-key="donationUrl"]','https://example.org/give');await click('#add-donation-recipient');
  check('Add recipient opens new fields and validation',q('[data-recipient="0"]').open&&q('#copy').disabled);
  await input('[data-donation="0"][data-part="name"]','Our community helper');await input('[data-donation="0"][data-part="description"]','Thank you for helping the show.');await input('[data-donation="0"][data-part="button"]','Visit our helper');await input('[data-donation="0"][data-part="url"]','www.example.org/helper');q('[data-donation="0"][data-part="url"]').dispatchEvent(new FocusEvent('focusout',{bubbles:true}));await wait(450);
  check('Recipient URL completes HTTPS and export recovers',q('[data-donation="0"][data-part="url"]').value==='https://www.example.org/helper'&&!q('#copy').disabled);
  check('Separate Support card has its own description and button',p().querySelector('#support-panel .additional-donation h3')?.textContent==='Our community helper'&&p().querySelector('#support-panel .additional-donation .support-action')?.textContent.trim()==='Visit our helper');
  check('Additional recipient is inside Support panel',p().querySelectorAll('#support-panel .support-card').length===2);
  await input('[data-donation="0"][data-part="name"]','A community supporter with a longer name');
  for(const width of [320,390,768,1280]){
   q('#preview').style.width=width+'px';await wait(100);
   const doc=p(),card=doc.querySelector('.additional-donation');doc.documentElement.style.fontSize='150%';
   check(`Recipient card fits ${width}px with enlarged text`,card.scrollWidth<=card.clientWidth+1&&doc.documentElement.scrollWidth<=width+1);
   check(`No-image recipient uses full width at ${width}px`,card.firstElementChild.getBoundingClientRect().width>card.clientWidth*.7);
   doc.documentElement.style.fontSize='';
  }
  await click('[data-device="mobile"]');
  await input('[data-donation="0"][data-part="home"]',true);await input('[data-donation="0"][data-part="info"]',true);
  check('Recipient placement is independent of original switches',!q('[data-key="donationHome"]').checked&&p().querySelectorAll('#home-panel .additional-donation').length===1&&p().querySelectorAll('#info-panel .additional-donation').length===1);
  await input('[data-key="donationHome"]',true);await input('[data-key="donationInfo"]',true);
  await input('[data-copy="DONATION_CALLOUT"]','Help our local cause');await input('[data-copy="DONATE_HINT"]','Tap to donate');await input('[data-copy="DONATE_BUTTON"]','Donate to our cause');
  await input('[data-donation="0"][data-part="callout"]','Listen to our community stories');await input('[data-donation="0"][data-part="hint"]','Tap to listen');
  check('Support buttons use independent wording',p().querySelector('#support-panel .share-donation .support-action').textContent.trim()==='Donate to our cause'&&p().querySelector('#support-panel .additional-donation .support-action').textContent.trim()==='Visit our helper');
  for(const mode of ['jukebox','voting'])for(const air of ['on','off'])for(const panel of ['home','info']){
   await click(`[data-mode="${mode}"]`);await click(`[data-air="${air}"]`);await click(`[data-editor-group="${panel}"]`);
   const extra=p().querySelector(`#${panel}-panel .additional-donation`),primary=p().querySelector(`#${panel}-panel .share-donation`);
   check(`Independent ${panel} teaser ${mode}/${air}`,shown(extra)&&extra.textContent.includes('Listen to our community stories')&&extra.textContent.includes('Tap to listen')&&!extra.textContent.includes('Tap to donate')&&primary.textContent.includes('Help our local cause'));
  }
  await input('[data-donation="0"][data-part="callout"]','');q('#validation-list').closest('details').open=true;await click('[data-focus-error="donationRecipients.0.callout"]');
  check('Teaser validation reveals the right Support card',q('[data-editor-group="support"]').getAttribute('aria-pressed')==='true'&&q('[data-recipient="0"]').open&&q('[data-recipient-teaser="0"]').open&&d.activeElement===q('[data-donation="0"][data-part="callout"]'));
  await input('[data-donation="0"][data-part="callout"]','Listen to our community stories');await click('[data-reset-copy="DONATE_BUTTON"]');
  check('Resetting primary wording preserves the other open teaser',q('[data-recipient-teaser="0"]').open&&q('[data-donation="0"][data-part="hint"]').value==='Tap to listen');
  await input('[data-donation="0"][data-part="url"]','javascript:alert(1)');check('Unsafe recipient link blocks export, not preview',q('#copy').disabled&&!!p().querySelector('.additional-donation')&&![...p().querySelectorAll('a')].some(a=>a.getAttribute('href')?.startsWith('javascript:')));
  await input('[data-key="donations"]',false);check('Disabled donations ignore incomplete recipient fields',!q('#copy').disabled&&!p().querySelector('.additional-donation'));await input('[data-key="donations"]',true);await input('[data-donation="0"][data-part="url"]','https://example.org/helper');
  await load();d=frame.contentDocument;check('Settings restore recipients, FM and queue wording',q('[data-donation="0"][data-part="button"]').value==='Visit our helper'&&!q('[data-key="musicFM"]').checked&&q('[data-copy="QUEUE_HELP"]').value.includes('{queueLimit}'));
  check('Card-specific teaser wording restores',q('[data-donation="0"][data-part="callout"]').value==='Listen to our community stories'&&q('[data-donation="0"][data-part="hint"]').value==='Tap to listen');
  await click('[data-editor-group="support"]');q('[data-section="9"]').open=true;q('[data-recipient="0"]').open=true;await click('[data-donation-remove="0"]');check('Remove recipient leaves original donation intact',!q('[data-recipient]')&&q('[data-key="donationUrl"]').value==='https://example.org/give');
  check('No custom scripts enter iframe export markup',!q('#preview').srcdoc.includes('<script'));
 }catch(error){check(error.stack,false);}finally{if(original===null)localStorage.removeItem(SETTINGS_KEY);else localStorage.setItem(SETTINGS_KEY,original);await load();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Review additions':'PASS — Review additions';}
};
