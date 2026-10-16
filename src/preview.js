// Illustrative product demo only. This module is never used by the exporter.
import {namesOf,themes} from './template.js';
import {categoryNamesOf} from './catalogue.js';
import {assetBase} from './assets.js';
import {installPreviewDrag} from './preview-drag.js';
const catalogue = [
  {id:'Winter Starlight',category:0,colour:'#a54550',demoNew:true},
  {id:'Sleigh Bells at Sunset',category:0,colour:'#2e7860',demoNew:true},
  {id:'A Little Christmas Sparkle',category:0,colour:'#a87c32',unavailable:true},
  {id:'Dance Under the Lights',category:1,colour:'#4f6eae'},
  {id:'One More Rainbow',category:1,colour:'#84629d'},
  {id:'Twinkling Together',category:0,colour:'#397b83'},
  {id:'The Christmas Light Parade',category:1,colour:'#b25c41'}
];
// Deliberate message fixtures, labelled in the UI; never an RF request/response.
export const messageExamples=[
  {id:'requestFailed',label:'Request could not be confirmed',modes:['jukebox','voting']},
  {id:'requestPlaying',label:'Song already playing / unavailable',modes:['jukebox','voting']},
  {id:'queueFull',label:'Queue full',modes:['jukebox']},
  {id:'invalidLocation',label:'Location could not be confirmed',modes:['jukebox','voting']},
  {id:'invalidLocationCode',label:'Incorrect location code',modes:['jukebox','voting']},
  {id:'alreadyVoted',label:'Already voted this round',modes:['voting']},
  {id:'alreadyRequested',label:'Already requested this round',modes:['jukebox']},
  {id:'sequenceUnavailable',label:'Song limit / cooldown reached',modes:['jukebox','voting']},
  {id:'dailyVoteLimitReached',label:'Vote limit reached',modes:['voting']}
];
function artwork(colour) {return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="20" fill="${colour}"/><path d="m60 22 9 25 27 1-21 17 7 26-22-15-22 15 7-26-21-17 27-1z" fill="#fff3ce"/></svg>`);}
const element=(doc,tag,cls,text)=>{const el=doc.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
export function holidayDays(theme,now=new Date()){
  return holidayTime(theme,now).days;
}
export function holidayTime(theme,now=new Date()){
  const [month,day]=theme==='halloween'?[9,31]:[11,25];
  const year=now.getFullYear()+(now>new Date(now.getFullYear(),month,day+1)?1:0);
  const seconds=Math.max(0,Math.floor((new Date(year,month,day)-now)/1000));
  return {days:Math.floor(seconds/86400),hours:String(Math.floor(seconds/3600)%24).padStart(2,'0'),minutes:String(Math.floor(seconds/60)%60).padStart(2,'0'),seconds:String(seconds%60).padStart(2,'0')};
}
export const christmasDays=(now=new Date())=>holidayDays('christmas',now);
export function demoState(){return {queue:[],votes:Object.create(null),message:null};}
export function createPreview(iframe, notify) {
  let state=demoState(), settings, imported=null, mode='jukebox', air=true, generation=0, timer, countdownTimer, lastHash='#home-panel',dragEnabled=true;
  function updateCountdown(doc){for(const [unit,value] of Object.entries(holidayTime(settings.theme))){const el=doc.getElementById('to-'+settings.theme+'-'+unit);if(el)el.textContent=String(value);}}
  const scrollPositions=()=>{
    const d=iframe.contentDocument;if(!d)return [];
    return [...d.querySelectorAll('[id]')].filter(e=>e.scrollTop||e.scrollLeft).map(e=>[e.id,e.scrollTop,e.scrollLeft]);
  };
  function navigate(panel){
    if(!['home','music','support','info'].includes(panel))return;
    const hash='#'+panel+'-panel',d=iframe.contentDocument;
    if(d?.getElementById(lastHash.slice(1))?.closest('.content__body')?.id===panel+'-panel')return;
    lastHash=hash;
    if(!d?.getElementById(panel+'-panel'))return;
    const focused=document.activeElement;
    iframe.contentWindow.location.hash=hash;
    requestAnimationFrame(()=>{if(document.activeElement===iframe&&focused&&focused!==iframe&&focused.isConnected)focused.focus({preventScroll:true});});
  }
  function songs(){
    if(imported)return imported.songs.map(s=>({id:s.name,title:s.displayName||s.name,artist:s.artist,imageUrl:s.imageUrl,category:groupNames().indexOf(s.category||'Uncategorised')}));
    const demo=catalogue.map((s,i)=>({...s,id:themes[settings.theme].demoSongs[i],category:Math.min(s.category,settings.categoryNames.length-1)}));
    for(let i=2;i<settings.categoryNames.length;i++)demo.push({id:settings.categoryNames[i]+' · Preview example',category:i,colour:'#84629d'});
    const messages=messageExamples.filter(m=>m.modes.includes(mode)).map(m=>({id:'Demo: '+m.label,category:settings.categoryNames.length-1,colour:'#6b547d',messageId:m.id}));
    return [...demo,...namesOf(settings).filter(id=>!demo.some(s=>s.id===id)).map(id=>({id,category:0,colour:'#a87c32',custom:true})),...messages];
  }
  function groupNames(){
    if(!imported)return settings.categoryNames;
    const present=categoryNamesOf(imported),ordered=settings.categoryNames.filter(n=>present.includes(n));
    return [...ordered,...present.filter(n=>!ordered.includes(n)),...(imported.songs.some(s=>!s.category)?['Uncategorised']:[])];
  }
  function message(doc,id){
    clearTimeout(timer);doc.querySelectorAll('.request-feedback').forEach(el=>el.style.display='none');
    const el=doc.getElementById(id);if(!el)return;
    el.style.display='block';state.message={id,until:Date.now()+2700};
    timer=setTimeout(()=>{el.style.display='none';state.message=null;},2700);
  }
  function populate(doc){
    const container=doc.getElementById(mode==='jukebox'?'playlists_container':'voting_playlists_container');
    if(!container)return;
    container.replaceChildren();
    for(let category=0;category<groupNames().length;category++){
      const group=element(doc,'div','category-section');group.append(element(doc,'div','category-label',groupNames()[category]));
      const list=songs().filter(s=>s.category===category).sort((a,b)=>mode==='voting'?(state.votes[b.id]||0)-(state.votes[a.id]||0):0);
      for(const s of list){
        const cls=mode==='jukebox'?'jukebox-list':'cell-vote-playlist';
        const card=element(doc,'div',cls+(s.unavailable?' sequence-unavailable':''));card.dataset.key=s.id;
        if(s.demoNew)card.dataset.demoNew='';
        card.setAttribute('role','button');card.tabIndex=s.unavailable?-1:0;card.setAttribute('aria-disabled',String(!!s.unavailable));
        const img=element(doc,'img','');img.alt='';
        if(imported){
          img.loading='lazy';img.referrerPolicy='no-referrer';
          const missing=()=>{img.removeAttribute('src');img.alt='Artwork unavailable';img.classList.add('preview-artwork-placeholder');};
          img.addEventListener('error',missing,{once:true});if(s.imageUrl)img.src=s.imageUrl;else missing();
        }else img.src=artwork(s.colour);
        card.append(img,element(doc,'span','',s.title||s.id),element(doc,'span',cls+'-artist',imported?s.artist:s.messageId?'Message test only · no request or vote':s.custom?'Your NEW sash preview example':'Illustrative demo song'));
        if(s.messageId)card.dataset.demoMessage=s.messageId;
        if(s.unavailable)card.append(element(doc,'span','sequence-unavailable-hint','Back next show'));
        const activate=()=>{
          if(s.unavailable||state.message)return;
          if(s.messageId){message(doc,s.messageId);return;}
          if(mode==='jukebox'&&state.queue.includes(s.id)){message(doc,'requestPlaying');return;}
          if(mode==='jukebox')state.queue.push(s.id);else state.votes[s.id]=(state.votes[s.id]||0)+1;
          populate(doc);message(doc,'requestSuccessful');
        };
        card.addEventListener('click',activate);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
        if(mode==='voting'){const row=element(doc,'div','cell-vote-row');row.append(card,element(doc,'div','cell-vote',String(state.votes[s.id]||0)));group.append(row);}else group.append(card);
      }
      container.append(group);
    }
    const songFor=id=>songs().find(s=>s.id===id)||{id};
    const label=(parent,id,queue=false)=>{const s=songFor(id);parent.append(element(doc,'span',queue?'jukebox-queue-title':'',s.title||s.id),element(doc,'div',queue?'jukebox-list-artist jukebox-queue-artist':'jukebox-list-artist',s.artist||(imported?'':'Illustrative demo song')));};
    // RF shows Up Next separately from the remaining request queue.
    const queue=doc.querySelector('.jukebox-queue-container');if(queue){queue.replaceChildren();for(const id of state.queue.slice(1)){const row=element(doc,'div','jukebox-queue');label(row,id,true);queue.append(row);}}
    const next=doc.querySelector('.next-playlist');if(next){next.replaceChildren();if(state.queue.length)label(next,state.queue[0]);}
    doc.querySelectorAll('.rf-queue-size').forEach(el=>el.textContent=String(state.queue.length));
    doc.querySelectorAll('.votes-remaining').forEach(el=>{el.textContent=mode==='voting'?`${Math.max(0,5-Object.values(state.votes).reduce((n,v)=>n+v,0))} of 5 votes left this show`:'';el.title='Illustrative demo limit; RF supplies the real value.';});
  }
  function attach(doc){
    installPreviewDrag(doc,()=>dragEnabled&&!state.message);
    doc.addEventListener('submit',e=>e.preventDefault(),true);
    doc.addEventListener('click',e=>{
      const a=e.target.closest('a');if(!a)return;e.preventDefault();
      if(a.getAttribute('aria-disabled')==='true')return;
      const href=a.getAttribute('href');
      if(href?.startsWith('#')&&doc.getElementById(href.slice(1))){lastHash=href;iframe.contentWindow.location.hash=href;}
      else notify('External links are disabled in this demo. They work in your exported page.');
    });
    iframe.contentWindow.addEventListener('hashchange',()=>{lastHash=iframe.contentWindow.location.hash||'#home-panel';});
    populate(doc);
  }
  function update(html,s,options={}){
    clearInterval(countdownTimer);
    if(imported!==(options.catalogue||null)){state=demoState();clearTimeout(timer);}imported=options.catalogue||null;
    if(settings&&settings.theme!==s.theme){state=demoState();clearTimeout(timer);}
    settings=s;const myGeneration=++generation;
    if(options.mode&&options.mode!==mode){mode=options.mode;state=demoState();clearTimeout(timer);}
    if(options.air!==undefined)air=options.air;
    if(options.reset){state=demoState();clearTimeout(timer);}
    const positions=scrollPositions(), y=iframe.contentWindow?.scrollY||0;
    html=html.replaceAll(assetBase,new URL('../assets/',import.meta.url).href);
    const doc=new DOMParser().parseFromString(html,'text/html');
    for(const el of [...doc.querySelectorAll('*')]){
      if(el.hasAttribute('{after-hours-message}')&&air)el.replaceChildren();
      if(el.hasAttribute('{jukebox-dynamic-container}')&&(!air||mode!=='jukebox'))el.replaceChildren();
      if(el.hasAttribute('{playlist-voting-dynamic-container}')&&(!air||mode!=='voting'))el.replaceChildren();
      if(el.hasAttribute('{location-code-dynamic-container}')){
        if(!air||options.locationMode!=='code')el.replaceChildren();
        else {const input=doc.createElement('input');input.type='number';input.setAttribute('aria-label','Demo display access code');input.placeholder='Demo code entry';el.querySelector('.location-code-input')?.replaceChildren(input);}
      }
    }
    doc.querySelectorAll('.playing-now').forEach(el=>{
      const song=imported?.songs[0],img=element(doc,'img','sequence-image');img.alt='';
      if(imported){img.referrerPolicy='no-referrer';if(song?.imageUrl)img.src=song.imageUrl;else{img.alt='Artwork unavailable';img.classList.add('preview-artwork-placeholder');}}
      else img.src=artwork('#a54550');
      el.replaceChildren(img,element(doc,'span','',song?(song.displayName||song.name):themes[settings.theme].demoSongs[0]),element(doc,'div',mode==='voting'?'cell-vote-playlist-artist':'jukebox-list-artist',song?song.artist:'Illustrative demo song'),element(doc,'small','preview-playback-label',settings.showAlbumArtwork?'Artwork preview only · no live playback':'Song preview only · no live playback'));
    });
    doc.querySelectorAll('.next-playlist,.jukebox-queue-container,.los-song-list,.request-feedback__location').forEach(el=>el.replaceChildren());
    updateCountdown(doc);
    if(options.categoriesMismatch){
      doc.querySelectorAll('.category-filter-link').forEach(a=>{a.setAttribute('aria-disabled','true');a.title='Match your category list to this CSV to preview filtering.';});
      doc.querySelectorAll('.category-filter-target').forEach(el=>el.classList.remove('category-filter-target'));
      // Disarm positional rules as well as the highlight until the mapping is valid.
      const sheet=doc.querySelector('style');sheet.textContent=sheet.textContent.replace(/body:has\(#show-options\.has-categories\):has\(#songs-category-\d+:target\)[^{]+\{[^}]*\}/g,'');
    }
    doc.querySelectorAll('.rf-queue-depth').forEach(el=>{el.textContent='10';el.title='Demo queue limit. RF uses your real setting.';});
    // No scripts run in the iframe. All demonstration interactions are parent-owned.
    const style=element(doc,'style','');style.textContent='.sequence-unavailable{pointer-events:none}.category-filter-link[aria-disabled="true"]{opacity:.45;cursor:not-allowed}.los-song-list [role=button]:focus-visible{outline:3px solid var(--gold);outline-offset:3px}.preview-artwork-placeholder{font-size:10px;line-height:1.2;background:#ffffff12;color:var(--text-secondary);text-align:center}.preview-playback-label{display:block;font-size:11px;font-weight:400;line-height:1.5;color:var(--text-secondary);margin-top:8px}.preview-is-dragging,.preview-is-dragging *{user-select:none!important;cursor:grabbing!important}';doc.head.append(style);
    iframe.onload=()=>{
      if(myGeneration!==generation)return;
      const d=iframe.contentDocument;
      if(!imported){
        // Reuse the canonical sash/filter styling, only inside the sample iframe.
        // Saved NEW names and exported HTML never receive these demo assignments.
        const newRule=[...d.querySelector('style').sheet.cssRules].find(rule=>rule.style?.getPropertyValue('--los-new-sash'));
        if(newRule)newRule.selectorText+=', .jukebox-list[data-demo-new], .cell-vote-row:has(> .cell-vote-playlist[data-demo-new])';
      }
      attach(d);
      if(d.querySelector('.seasonal-countdown'))countdownTimer=setInterval(()=>{if(!iframe.isConnected){clearInterval(countdownTimer);return;}updateCountdown(d);},1000);
      d.querySelectorAll('.playing-now img').forEach(img=>img.addEventListener('error',()=>{img.removeAttribute('src');img.alt='Artwork unavailable';img.classList.add('preview-artwork-placeholder');},{once:true}));
      // Capture the current editor focus immediately before restoring the frame hash.
      // An earlier render may have started before the user moved to another field.
      const focused=document.activeElement;
      const selection=focused instanceof HTMLInputElement||focused instanceof HTMLTextAreaElement?[focused.selectionStart,focused.selectionEnd]:null;
      if(!d.getElementById(lastHash.slice(1)))lastHash=lastHash.startsWith('#songs-')?'#music-panel':'#home-panel';
      iframe.contentWindow.location.hash=lastHash;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        iframe.contentWindow.scrollTo(0,y);for(const [id,top,left] of positions){const el=d.getElementById(id);if(el){el.scrollTop=top;el.scrollLeft=left;}}
        if(document.activeElement===iframe){
          if(focused&&focused!==iframe&&focused!==document.body&&focused.isConnected){focused.focus({preventScroll:true});if(selection&&selection[0]!==null)focused.setSelectionRange(...selection);}
          else if(focused===document.body||focused===iframe){d.activeElement?.blur();iframe.blur();}
        }
      }));
      if(options.messageId){message(d,options.messageId);}
      else if(state.message&&state.message.until>Date.now()){
        const el=d.getElementById(state.message.id);el.style.display='block';clearTimeout(timer);timer=setTimeout(()=>{el.style.display='none';state.message=null;},state.message.until-Date.now());
      }
    };
    iframe.srcdoc='<!doctype html>\n'+doc.documentElement.outerHTML;
  }
  return {update,navigate,setDragScrolling:enabled=>{dragEnabled=enabled;}};
}
