import {createDesignStore} from '../src/design-store.js';
import {cloneDefaults,render,settingsFile} from '../src/template.js';
import {SETTINGS_KEY,PREFS_KEY} from '../src/storage.js';
import {createPreview} from '../src/preview.js';
const editor=document.querySelector('#editor'),viewer=document.querySelector('#viewer'),run=document.querySelector('#run'),results=document.querySelector('#results');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),visible=el=>!!el&&el.getBoundingClientRect().height>0&&el.ownerDocument.defaultView.getComputedStyle(el).display!=='none';
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS — ':'FAIL — ')+label;results.append(li);};
const reload=()=>new Promise(r=>{editor.onload=()=>setTimeout(r,450);editor.contentWindow.location.reload();});
run.onclick=async()=>{
 if(location.hostname!=='localhost')throw Error('Use isolated localhost.');
 run.disabled=true;results.replaceChildren();const original=[SETTINGS_KEY,PREFS_KEY].map(k=>[k,localStorage.getItem(k)]);
 try{
  localStorage.setItem(SETTINGS_KEY,settingsFile(cloneDefaults()));localStorage.setItem(PREFS_KEY,JSON.stringify({tourSeen:true}));await reload();let d=editor.contentDocument;
  const q=s=>d.querySelector(s);q('[data-editor-group=music]').click();q('[data-section="30"]').open=true;
  const field=q('[data-key=songArtwork]');check('Album artwork starts selected in Music',field.value==='album'&&visible(field));
  check('RF setup help is a visible link',!!q('[data-section="30"] a[href$="look-up-artist--album-art"]'));
  check('Category help distinguishes hidden buttons from removed rows',q('[data-section="18"]').textContent.includes('Keep all categories shown on your RF page')&&!!q('[data-section="18"] [data-category-help]')&&d.querySelector('#category-help-dialog').textContent.includes('Keep rows; hide buttons'));
  field.value='none';field.dispatchEvent(new Event('input',{bubbles:true}));await wait(450);await reload();d=editor.contentDocument;
  check('Artwork choice restores from saved settings',q('[data-key=songArtwork]').value==='none'&&createDesignStore(localStorage).read().settings.songArtwork==='none');
  const source=await(await fetch('../templates/christmas.html')).text(),demo=createPreview(viewer,()=>{}),v=()=>viewer.contentDocument;
  const update=async(s,mode)=>{demo.update(render(source,s),s,{mode,air:true,reset:true});await wait(180);demo.navigate('music');await wait(50);};
  for(const theme of ['christmas','halloween'])for(const mode of ['jukebox','voting']){
   const s=cloneDefaults(theme);s.newNames='A Very Long New Song Title for the Neighbourhood Light Show';s.newFilter=true;
   await update(s,mode);const normal=()=>[...v().querySelectorAll('.los-song-list [role=button]:not([data-demo-new]):not([data-demo-message]):not(.sequence-unavailable)')].find(card=>card.dataset.key!==s.newNames);
   const originalHeight=normal().getBoundingClientRect().height;
   check(theme+'/'+mode+' artwork appears by default',visible(v().querySelector('.playing-now img'))&&visible(normal().querySelector('img')));
   s.showAlbumArtwork=false;await update(s,mode);
   check(theme+'/'+mode+' artwork hidden without blank columns',[...v().querySelectorAll('.playing-now img,.los-song-list img')].every(el=>!visible(el))&&v().defaultView.getComputedStyle(normal()).gridTemplateColumns.split(' ').length===1);
   check(theme+'/'+mode+' ordinary cards become shorter but stay tappable',normal().getBoundingClientRect().height<originalHeight&&normal().getBoundingClientRect().height>=64);
   const fresh=v().querySelector('[data-key="'+s.newNames+'"]');check(theme+'/'+mode+' NEW sash retained',v().defaultView.getComputedStyle(fresh,'::after').content==='"NEW"');
   check(theme+'/'+mode+' unavailable reason retained',visible(v().querySelector('.sequence-unavailable-hint'))&&v().querySelector('.sequence-unavailable').getAttribute('aria-disabled')==='true');
   for(const width of [320,390,768,1280]){
    viewer.style.width=width+'px';v().documentElement.style.fontSize='150%';await wait(50);
    const cards=[...v().querySelectorAll('.los-song-list [role=button]')];
    check(theme+'/'+mode+' cards fit '+width+'px with enlarged text',v().documentElement.scrollWidth<=width+1&&cards.every(c=>[...c.querySelectorAll('span')].every(text=>text.scrollWidth<=text.clientWidth+1)));
    const title=[...fresh.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||fresh.querySelector('span'),range=v().createRange();range.selectNodeContents(title);const box=range.getBoundingClientRect(),card=fresh.getBoundingClientRect();check(theme+'/'+mode+' long NEW title fits without a blank artwork column at '+width+'px',box.right<=card.right+1&&box.left>=card.left);
    if(mode==='voting'){const vote=fresh.parentElement.querySelector('.cell-vote').getBoundingClientRect();check(theme+' vote count stays beside text at '+width+'px',box.right<=vote.left&&vote.bottom<=card.bottom);}
   }
   viewer.style.width='390px';v().documentElement.style.fontSize='100%';normal().click();await wait(40);check(theme+'/'+mode+' confirmation still blocks taps',visible(v().querySelector('#requestSuccessful'))&&!!v().elementFromPoint(20,20)?.closest('.request-feedback'));
   s.showAlbumArtwork=true;await update(s,mode);check(theme+'/'+mode+' switching back restores artwork',visible(v().querySelector('.playing-now img'))&&visible(normal().querySelector('img')));
  }
 }catch(e){check(e.stack,false);}finally{for(const[k,value]of original)value===null?localStorage.removeItem(k):localStorage.setItem(k,value);await reload();run.disabled=false;document.title=results.querySelector('.fail')?'FAIL — Artwork':'PASS — Artwork';}
};
