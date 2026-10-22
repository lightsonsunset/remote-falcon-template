import {registry,templateById,designKey,parseBackup} from './template-registry.js';
import {restoreCatalogue,saveCatalogue} from './catalogue.js';
import {readPreferences,writePreferences} from './storage.js';
import {reusableFields,fingerprint,fieldValue,hasReusableLogo} from './reusable-details.js';
const clone=x=>structuredClone(x);
export function createDesignStore(storage){
 const designs=new Map(),existing=new Set(),savedDesigns=new Set(),links=new Map(),legacyRaw=new Map(),errors=[],pref=readPreferences(storage);
 const validKeys=new Set(registry.flatMap(t=>Object.keys(t.themes).map(theme=>designKey(t,theme))));
 function cleanLinks(input){const result={};if(!input||typeof input!=='object'||Array.isArray(input))return result;for(const [peer,fields] of Object.entries(input)){if(!validKeys.has(peer)||!fields||typeof fields!=='object')continue;const checked={};for(const [key,value] of Object.entries(fields)){if(Object.hasOwn(reusableFields,key)&&/^[a-f0-9]{16}$/.test(value?.seen)&&/^[a-f0-9]{16}$/.test(value?.own))checked[key]={seen:value.seen,own:value.own};}if(Object.keys(checked).length)result[peer]=checked;}return result;}
 const catalogueStorage=(t,season,fallback=false)=>({getItem:()=>storage?.getItem(t.catalogueKey+':'+season)||(fallback?storage?.getItem(t.catalogueKey):null),setItem:(_,v)=>{if(!storage)throw Error('Storage unavailable');storage.setItem(t.catalogueKey+':'+season,v);},removeItem:()=>{if(!storage)throw Error('Storage unavailable');storage.removeItem(t.catalogueKey+':'+season);}});
 let legacyActive;
 for(const t of registry){
  let loaded=null;try{const raw=storage?.getItem(t.storageKey);if(raw){loaded=parseBackup(raw);if(loaded.template!==t.id)throw Error('Saved template does not match its storage slot.');if(!loaded.seasonal)legacyRaw.set(t.id,raw);if(!t.separateSeasons&&!loaded.seasonal)legacyActive=Object.keys(loaded.designs)[0];}}catch(error){loaded=null;errors.push(t.name+': '+error.message);}
  for(const season of Object.keys(t.themes)){
   const restored=loaded?.designs[season],settings=restored||t.cloneDefaults(season),key=designKey(t,season),catalogue=restoreCatalogue(catalogueStorage(t,season,!!restored&&!t.separateSeasons&&!loaded.seasonal));
   links.set(key,cleanLinks(loaded?.reuse?.[season]));
   designs.set(key,{settings,catalogue:catalogue.catalogue});if(restored){existing.add(key);savedDesigns.add(key);}if(catalogue.error)errors.push(catalogue.error);
  }
 }
 let active=registry.find(t=>t.id===pref.activeTemplate)||registry[0];let season=Object.hasOwn(active.themes,pref.activeSeason)?pref.activeSeason:(active.id===registry[0].id&&legacyActive)||'christmas';
 function read(){return clone(designs.get(designKey(active,season)));}
 function backup(t,includeCurrent=false){const seasons=Object.keys(t.themes).filter(s=>existing.has(designKey(t,s))||(includeCurrent&&t===active&&s===season));return JSON.stringify({format:'seasonal-designs',version:1,template:t.id,designs:Object.fromEntries(seasons.map(s=>[s,designs.get(designKey(t,s)).settings])),reuse:Object.fromEntries(seasons.map(s=>[s,links.get(designKey(t,s))]))},null,2)+'\n';}
 function persistTemplate(t){try{if(!storage)return false;if(legacyRaw.has(t.id)&&!storage.getItem(t.storageKey+':before-seasonal-designs'))storage.setItem(t.storageKey+':before-seasonal-designs',legacyRaw.get(t.id));
  // Preserve the original catalogue before retiring the one-design storage shape.
  if(!t.separateSeasons&&legacyRaw.has(t.id)){const old=parseBackup(legacyRaw.get(t.id)),theme=Object.keys(old.designs)[0],cat=designs.get(designKey(t,theme)).catalogue;if(!saveCatalogue(catalogueStorage(t,theme),cat))return false;}
  storage.setItem(t.storageKey,backup(t));legacyRaw.delete(t.id);for(const theme of Object.keys(t.themes))if(existing.has(designKey(t,theme)))savedDesigns.add(designKey(t,theme));return true;}catch{return false;}}
 function acknowledge(peer){const key=designKey(active,season),own=designs.get(key).settings,other=designs.get(peer)?.settings;for(const [field,value] of Object.entries(links.get(key)?.[peer]||{})){value.seen=fingerprint(fieldValue(other,field));value.own=fingerprint(fieldValue(own,field));}return persistTemplate(active);}
 return {
  errors,firstVisit:!pref.activeTemplate&&!existing.size,
  get template(){return active;},get season(){return season;},get key(){return designKey(active,season);},
  read,isSaved(id,theme){return savedDesigns.has(designKey(templateById(id),theme));},has(id,theme){return existing.has(designKey(templateById(id),theme));},
  select(id,theme){const next=templateById(id);if(!Object.hasOwn(next.themes,theme))throw Error('Unknown season.');active=next;season=theme;writePreferences(storage,{activeTemplate:active.id,activeSeason:season});return read();},
  save(value){if(value.settings.theme!==season)throw Error('The design does not match its active theme.');designs.set(designKey(active,season),clone(value));existing.add(designKey(active,season));savedDesigns.delete(designKey(active,season));const ok=persistTemplate(active),cat=saveCatalogue(catalogueStorage(active,season),value.catalogue);writePreferences(storage,{activeTemplate:active.id,activeSeason:season});return {settings:ok,catalogue:cat};},
  saveCatalogue(value){const state=read();state.catalogue=clone(value);designs.set(designKey(active,season),state);return saveCatalogue(catalogueStorage(active,season),value);},
  backup(){return backup(active,true);},
  resetAll(onChange=()=>{}){
   const affected=new Set();let count=0;
   for(const t of registry)for(const theme of Object.keys(t.themes)){
    const key=designKey(t,theme);links.set(key,{});
    if(!existing.has(key)&&key!==designKey(active,season))continue;
    const before=clone(designs.get(key)),after={settings:t.cloneDefaults(theme),catalogue:clone(before.catalogue)};
    onChange(key,before,after);designs.set(key,after);existing.add(key);savedDesigns.delete(key);affected.add(t);count++;
   }
   let saved=true;for(const t of affected)if(!persistTemplate(t))saved=false;
   if(!writePreferences(storage,{activeTemplate:active.id,activeSeason:season}))saved=false;
   return {saved,count};
  },
  all(){return registry.flatMap(t=>Object.keys(t.themes).filter(season=>existing.has(designKey(t,season))).map(season=>({key:designKey(t,season),template:t.id,season,name:t.name,...clone(designs.get(designKey(t,season)))})));},
  connect(peer,fields){const key=designKey(active,season);if(peer===key||!existing.has(peer))return false;
   for(const [a,b] of [[key,peer],[peer,key]]){const map=links.get(a);map[b]||={};for(const field of fields.filter(f=>Object.hasOwn(reusableFields,f)))map[b][field]={seen:fingerprint(fieldValue(designs.get(b).settings,field)),own:fingerprint(fieldValue(designs.get(a).settings,field))};}
   const sourceTemplate=templateById(peer.split(':')[0]),saved=persistTemplate(active);return (sourceTemplate===active||persistTemplate(sourceTemplate))&&saved;
  },
  pending(){const own=read().settings;return Object.entries(links.get(designKey(active,season))||{}).flatMap(([peer,fields])=>{if(!existing.has(peer))return [];const other=designs.get(peer).settings,changes=Object.entries(fields).flatMap(([field,baseline])=>{if(field==='logo'&&!hasReusableLogo(other))return [];const incoming=fingerprint(fieldValue(other,field)),current=fingerprint(fieldValue(own,field));return incoming!==baseline.seen&&incoming!==current?[{field,label:reusableFields[field],current:clone(fieldValue(own,field)),incoming:clone(fieldValue(other,field)),conflict:current!==baseline.own}]:[];});return changes.length?[{peer,template:peer.split(':')[0],theme:other.theme,changes}]:[];});},
  acknowledge,
  import(text,onChange=()=>{}){const loaded=parseBackup(text),t=templateById(loaded.template);for(const [slot,settings] of Object.entries(loaded.designs)){const key=designKey(t,slot),before=clone(designs.get(key)),after={...before,settings};onChange(key,before,after);designs.set(key,clone(after));links.set(key,cleanLinks(loaded.reuse[slot]));existing.add(key);savedDesigns.delete(key);}const saved=persistTemplate(t);return {template:t.id,season:Object.values(loaded.designs)[0].theme,saved};}
 };
}
export const copyGroups={welcome:['welcome'],identity:['name','welcome','logo','logoMode','logoStyle','combineLogoName','showNameOnHome'],header:['headerArtwork','headerTopDecorations'],listening:['fm','frequency','pulsemesh','pulsemeshButtons','pulsemeshUrl','listening'],schedule:['dates','schedule'],music:['showAlbumArtwork','songArtwork','showNowPlayingArtwork','showSongArtists','showQueueArtists','categoryIcons','uncategorisedIcon','movingHeadNames','movingHeadAnimation','newNames','newFilter','categories','categoryNames','hiddenCategories','musicFM','queueCount','showQueueLimit','votesRemaining'],info:['socialMain','socialInfo','socialTitle','socialText','socials','showMainGuidance','guidancePosition','homeCardImage','extraInfoCards','faq','neighbourTitle','neighbourText','homeCard','homeCardTitle','homeCardText','homeCardLink','homeCardLinkLabel','playlists','playlistMusic','playlistInfo','playlistTitle','playlistText','playlistQuestion','playlistFAQText','showPreview','showPreviewTitle','showPreviewText','showPreviewUrl','showPreviewButton','youtube','youtubeLabel','youtubeUrl','quickFacts','factsTitle','facts','resourcesEnabled','resourcesTitle','resourcesText','resources'],support:['donations','charity','donationText','donationUrl','donationImage','donationHome','donationInfo','donationRecipients','showSupportTab']};
export function copyDetails(source,destination,groups,template){const next=clone(destination);for(const group of groups)for(const key of copyGroups[group]||[])next[key]=clone(source[key]);if(groups.includes('support')){for(const key of ['DONATE_BUTTON','DONATION_CALLOUT','DONATE_HINT','SUPPORT_TITLE','SUPPORT_TEXT']){if(Object.hasOwn(source.copy,key))next.copy[key]=source.copy[key];else delete next.copy[key];}}if(groups.includes('welcome')&&template.features.headerTagline&&Object.hasOwn(source,'headerTagline'))next.headerTagline=source.headerTagline;if(groups.includes('identity')){if(template.features.headerTagline&&Object.hasOwn(source,'headerTagline'))next.headerTagline=source.headerTagline;if(source.icons?.brand)next.icons.brand=source.icons.brand;else delete next.icons.brand;if(source.logoMode==='symbol'&&template.features.headerIconMode==='icon')next.logoMode='icon';if(source.logoMode==='icon'&&Object.hasOwn(source,'headerTagline'))next.logoMode='none';}if(!template.features.includedArtwork&&next.logoMode==='seasonal')next.logoMode='icon';return template.checkedSettings(next);}
