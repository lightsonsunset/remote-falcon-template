const frame=document.getElementById('editor'),results=document.getElementById('results'),button=document.getElementById('run');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
const check=(name,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+name;results.append(li);};
button.onclick=async()=>{
 button.disabled=true;results.replaceChildren();
 try{
  const d=frame.contentDocument;
  if(d.querySelector('#tour-welcome')?.open)d.querySelector('#welcome-skip').click();
  frame.style.width='720px';await wait(100);
  check('Narrow editor has Settings / Preview tabs',visible(d.querySelector('.narrow-tabs')));
  d.querySelector('.narrow-tabs [data-view="preview"]').click();await wait(100);
  check('Preview tab exposes preview and hides settings',visible(d.querySelector('.preview-pane'))&&!visible(d.querySelector('.settings-pane')));
  check('Narrow catalogue stays inside the pane',d.querySelector('.preview-pane').scrollWidth<=d.querySelector('.preview-pane').clientWidth+1);
  d.querySelector('.narrow-tabs [data-view="settings"]').click();
  check('Settings tab restores settings',visible(d.querySelector('.settings-pane'))&&!visible(d.querySelector('.preview-pane')));
  const preview=d.getElementById('preview');
  for(const [group,section] of [['home',11],['music',6],['support',16],['info',17],['setup',2],['messages',12]]){
   const before=preview.contentWindow.location.hash;
   d.querySelector(`[data-editor-group="${group}"]`).click();
   await wait(50);
   check(`${group}: correct section is available`,!d.querySelector(`[data-section="${section}"]`).hidden&&d.querySelector(`[data-editor-group="${group}"]`).getAttribute('aria-pressed')==='true');
   check(`${group}: preview navigation follows only page tabs`,preview.contentWindow.location.hash===(['setup','messages'].includes(group)?before:'#'+group+'-panel'));
  }
  preview.contentDocument.querySelector('.los-menu a[href="#home-panel"]').click();await wait(50);
  check('Preview navbar does not change the editor area',d.querySelector('[data-editor-group="messages"]').getAttribute('aria-pressed')==='true');
  const welcome=d.querySelector('[data-key="welcome"]'),welcomeBefore=welcome.value;
  d.querySelector('[data-editor-group="home"]').click();preview.contentDocument.getElementById('home-panel').scrollTop=100;const top=preview.contentDocument.getElementById('home-panel').scrollTop;
  welcome.value=welcomeBefore+' — preview check';welcome.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  check('Ordinary edits preserve preview page and scroll',preview.contentWindow.location.hash==='#home-panel'&&Math.abs(preview.contentDocument.getElementById('home-panel').scrollTop-top)<2);
  welcome.value=welcomeBefore;welcome.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  d.querySelector('[data-section="20"] [data-go-section="3"]').click();check('Home schedule shortcut opens the shared Setup field',!d.querySelector('[data-section="3"]').hidden&&d.querySelector('[data-section="3"]').open);
  const title=d.querySelector('[data-copy="LISTEN_TITLE"]'),titleBefore=title.value;
  title.value='';title.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  d.querySelector('[data-editor-group="info"]').click();
  check('Validation is compact until expanded',!d.getElementById('validation-summary').open&&d.getElementById('validation-count').textContent.includes('1 field'));
  d.getElementById('validation-summary').open=true;d.querySelector('[data-focus-error="copy.LISTEN_TITLE"]').click();
  check('Validation opens the correct shared field',d.querySelector('[data-editor-group="setup"]').getAttribute('aria-pressed')==='true'&&visible(title)&&d.activeElement===title&&d.querySelector('#copy').disabled);
  title.value=titleBefore;title.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  check('Correcting a shared field restores export',!d.querySelector('#copy').disabled);
  const songNames=d.querySelector('[data-key="newNames"]').value;
  check('NEW sash picker lives in catalogue controls',d.querySelector('.catalogue-tools #pick-new')!==null);
  if(!d.getElementById('pick-new').disabled){d.getElementById('pick-new').click();check('Catalogue button opens the existing NEW picker',d.getElementById('new-picker').open);d.getElementById('cancel-new').click();check('Cancelling NEW picker keeps exact names',d.querySelector('[data-key="newNames"]').value===songNames);}
  else check('NEW picker explains missing import',d.getElementById('pick-new-help').textContent.includes('Import'));
  const live=d.querySelector('[data-key="homeLiveSchedule"]'),liveBefore=live.checked;
  d.querySelector('[data-editor-group="home"]').click();live.checked=true;live.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  check('Home live-schedule toggle updates the preview',preview.contentDocument.querySelectorAll('.live-schedule').length===1);
  live.checked=liveBefore;live.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  check('Seasonal countdown offers the current theme control',!d.querySelector('[data-section="21"]').hidden&&!!d.querySelector('[data-key="'+(d.querySelector('[data-season="halloween"]').getAttribute('aria-pressed')==='true'?'halloweenCountdown':'countdown')+'"]'));
  check('Basic Support text is not behind a nested disclosure',d.querySelector('[data-copy="SUPPORT_TITLE"]').closest('.copy-group')===null);
  check('Basic Info text is not behind a nested disclosure',d.querySelector('[data-copy="INFO_TITLE"]').closest('.copy-group')===null);
  check('Site setup puts hours and listening before visual tweaks',[...d.querySelectorAll('[data-section]')].filter(el=>['1','2','3','4','5','14'].includes(el.dataset.section)).map(el=>el.dataset.section).join(',')==='1,2,3,4,5,14');
  const faq=d.querySelector('[data-faq-row="0"]'),question=faq.querySelector('[data-part="question"]'),questionBefore=question.value;
  d.querySelector('[data-editor-group="info"]').click();d.querySelector('[data-section="10"]').open=true;faq.open=true;
  question.value=questionBefore+' — check';question.dispatchEvent(new Event('input',{bubbles:true}));await wait(350);
  check('FAQ summary uses the edited question',faq.querySelector('.faq-question-label').textContent===question.value);
  faq.querySelector('[data-faq-down]').click();await wait(350);
  check('Expanded FAQ follows its question when reordered',d.querySelector('[data-faq-row="1"]').open&&d.querySelector('[data-faq-row="1"] .faq-question-label').textContent===questionBefore+' — check');
  d.querySelector('[data-faq-row="1"] [data-faq-up]').click();
  const restoredQuestion=d.querySelector('[data-faq-row="0"] [data-part="question"]');restoredQuestion.value=questionBefore;restoredQuestion.dispatchEvent(new Event('input',{bubbles:true}));await wait(350);
  const donations=d.querySelector('[data-key="donations"]'),donationsBefore=donations.checked,url=d.querySelector('[data-key="donationUrl"]'),urlBefore=url.value;
  d.querySelector('[data-editor-group="support"]').click();d.querySelector('[data-section="9"]').open=true;donations.checked=true;donations.dispatchEvent(new Event('input',{bubbles:true}));
  url.value='www.example.org/donate';url.dispatchEvent(new Event('input',{bubbles:true}));url.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));await wait(650);
  check('Bare www link visibly completes and restores export',url.value==='https://www.example.org/donate'&&!d.getElementById('download').disabled);
  url.value=urlBefore;url.dispatchEvent(new Event('input',{bubbles:true}));donations.checked=donationsBefore;donations.dispatchEvent(new Event('input',{bubbles:true}));await wait(650);
  d.querySelector('[data-editor-group="music"]').click();
  check('Music picker shares import availability and selection count',d.getElementById('pick-new-music').disabled===d.getElementById('pick-new').disabled&&d.getElementById('new-selected-count').textContent.includes('selected'));
  if(!d.getElementById('pick-new-music').disabled){d.getElementById('pick-new-music').click();check('Music opens the same NEW picker',d.getElementById('new-picker').open);d.getElementById('cancel-new').click();}
  const catalogueChoice=d.getElementById('catalogue-source').value;
  d.querySelector('[data-mode="jukebox"]').click();await wait(350);
  const queueBefore=preview.contentDocument.querySelector('.jukebox-queue-container').textContent;
  d.querySelector('[data-editor-group="messages"]').click();
  for(const button of d.querySelectorAll('[data-preview-message]')){
   button.click();await wait(400);
   const message=preview.contentDocument.getElementById(button.dataset.previewMessage);
   check('Direct message preview: '+button.dataset.previewMessage+' / '+button.dataset.previewMode,visible(message)&&d.getElementById('catalogue-source').value===catalogueChoice&&d.querySelector('[data-editor-group="messages"]').getAttribute('aria-pressed')==='true');
   if(button.dataset.previewMessage==='requestSuccessful'&&button.dataset.previewMode==='jukebox'){
    const row=preview.contentDocument.querySelector('.jukebox-list'),r=row.getBoundingClientRect(),hit=preview.contentDocument.elementFromPoint(r.left+r.width/2,Math.min(r.top+r.height/2,780));
    check('Direct success preview leaves queue intact and blocks underlying taps',preview.contentDocument.querySelector('.jukebox-queue-container').textContent===queueBefore&&!!hit?.closest('.request-feedback'));
   }
  }
  d.querySelector('.narrow-tabs [data-view="settings"]').click();
  const openSections=[...d.querySelectorAll('[data-section][open]')].map(el=>el.dataset.section);
  d.querySelectorAll('[data-section]').forEach(el=>el.open=false);
  d.getElementById('add-row').click();
  check('Form rebuild preserves all-collapsed sections',[...d.querySelectorAll('[data-section]')].every(el=>!el.open));
  [...d.querySelectorAll('[data-remove]')].at(-1).click();
  for(const id of openSections)d.querySelector(`[data-section="${id}"]`).open=true;
  await wait(650);
  frame.style.width='1280px';await wait(100);
  const controls=d.querySelector('.preview-controls-main').getBoundingClientRect(),catalogue=d.querySelector('.catalogue-tools').getBoundingClientRect();
  check('Desktop catalogue sits beside preview controls',catalogue.x>=controls.right-1&&Math.abs(catalogue.y-controls.y)<30);
  check('Desktop editor fits its width',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
  d.querySelector('#catalogue-options').click();check('Catalogue options open without extending the header',d.querySelector('#catalogue-dialog').open);d.querySelector('#close-catalogue').click();
  const scheme=d.documentElement.dataset.theme;d.querySelector('#theme').click();check('Editor theme toggles independently',d.documentElement.dataset.theme!==scheme);d.querySelector('#theme').click();
  d.querySelector('[data-editor-group="info"]').click();d.querySelector('[data-section="10"]').open=true;
  d.querySelectorAll('[data-faq-row]').forEach(el=>el.open=true);frame.contentWindow.scrollTo(0,d.querySelector('[data-section="10"]').offsetTop+300);await wait(100);
  check('Area buttons remain visible while scrolling FAQ',d.getElementById('editor-groups').getBoundingClientRect().top>=0&&d.getElementById('editor-groups').getBoundingClientRect().top<30);
  const actual=d.querySelector('.preview-pane').getBoundingClientRect();check('Desktop preview fits the available height',actual.height<=900-28);
  frame.style.width='390px';await wait(150);
  check('Compact editor keeps long FAQs inside its width',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
  d.querySelector('[data-editor-group="messages"]').click();await wait(100);
  check('Compact message labels fit the editor',d.documentElement.scrollWidth<=d.documentElement.clientWidth+1);
  frame.style.width='1280px';
 }catch(err){check(err.stack,false);}finally{button.disabled=false;document.title=`${results.querySelectorAll('.fail').length} failures · Editor checks`;}
};
