import {songBadgeCSS} from './song-badges.js';
import {artworkDefaults,checkedArtwork,artworkCSS,songArtworkMode,renameCategoryArtwork} from './song-artwork.js';
import {checkedInformationCards,validateInformation,renderInformation,informationCSS} from './information-cards.js';
import {guidanceDefaults,guidanceTokens} from './visitor-guidance.js';
import {checkedIcons,applyIconTokens} from './icons.js';
// GPL-3.0-only. Canonical viewer renderer; no preview dependency.
import {nameFonts,nameStyleDefaults,nameStyleCSS} from './name-style.js';
import {themes,isNewSeason} from './themes.js';
import {seasonalDefaults,seasonalClasses,seasonalTokens} from './seasonal-style.js';
import {assetBase,logoChoices,decorationChoices,logoFile,decorationFile} from './assets.js';
import {copyFields,legacyCopyFields,copyFor,formatCopy} from './copy.js';
import {extraDefaults,listDefinitions,checkedExtraLists,validateExtras,renderExtras} from './visitor-extras.js';
export {themes};
export const templateId = 'festive';
// New cards start neutral; existing donation wording is retained when migrating.
export const supportCardDefaults={button:'Visit {charity}',callout:'Discover {charity}.',hint:'Tap to find out more'};
const starterFAQ=[
  {kind:'schedule',question:'When is the show running?',answer:''},
  {kind:'listening',question:'How do I hear the music?',answer:''},
  {kind:'text',question:'Can I choose a song?',answer:'Yes. Open the Music tab during show hours. In Jukebox mode, picks join the queue. On voting nights, the song with the most votes plays next.'},
  {kind:'text',question:'Why can I not choose a particular song?',answer:'Some songs take a break to give other favourites a turn. The message under a song tells you when it will be available again.'},
  {kind:'text',question:'How do you build a show like this?',answer:'Planning, props, wiring, controllers, sequencing, testing and a suspicious number of zip ties all come together before opening night.'}
];
export const defaults = {
  ...seasonalDefaults,...extraDefaults,...nameStyleDefaults,...guidanceDefaults,...artworkDefaults,movingHeadNames:'',movingHeadAnimation:false,
  name: 'Your Christmas Show', logo: '', welcome: 'A little Christmas magic, shared with you.',
  logoMode:'icon',logoStyle:'classic',combineLogoName:false,showNameOnHome:true,showMenuLabels:true,showAlbumArtwork:true,showSongArtists:true,showQueueArtists:true,onAirPulse:false,christmasDecoration:'default',halloweenDecoration:'default',decorations:false,homeLiveSchedule:false,countdown:true,halloweenCountdown:false,homeMusicLink:true,musicFM:true,queueCount:false,showQueueLimit:false,votesRemaining:false,
  neighbourTitle:'Please help us be a good neighbour.',neighbourText:'Keep radios at a reasonable volume.\nDo not park in or block driveways.\nWhen stopped, please dim headlights and leave running lights on.',
  dates: 'To be announced',
  schedule: [{day:'Sunday–Thursday',hours:'To be announced'}, {day:'Friday–Saturday',hours:'To be announced'}, {day:'Christmas Eve / Day',hours:'To be announced'}],
  fm: false, frequency: '88.7', pulsemesh: false, pulsemeshButtons: 'download', pulsemeshUrl: '', listening: '',
  theme: 'christmas', colours: {...themes.christmas.colours},
  newNames: '', newFilter: false, categories: false, categoryNames: [...themes.christmas.categories], hiddenCategories:[],
  notice: false, noticeTitle: 'Show update', noticeText: '',
  donations: false, charity: 'Your chosen charity', donationText: 'Support a cause close to our community.', donationUrl: '', donationImage: '',
  donationHome:false,donationInfo:false,donationRecipients:[],showSupportTab:true,
  homeCardImage:'',extraInfoCards:[],homeCard:false,homeCardTitle:'A little extra magic',homeCardText:'',homeCardLink:'',homeCardLinkLabel:'Find out more',
  faq:starterFAQ,copy:{},icons:{}
};
export const cloneDefaults = (theme='christmas') => {
  const s=structuredClone(defaults),t=themes[theme];if(!t)throw Error('Unknown theme.');
  Object.assign(s,{theme,name:t.showName,welcome:t.welcome,colours:{...t.colours},categoryNames:[...t.categories]});s.schedule[2].day=t.holiday;if(theme==='halloween')s.homeCardTitle='Something spooktacular';return s;
};
// Preserve personal values; only replace values still matching the old theme defaults.
export function changeTheme(input,theme){
  const s=checkedSettings(input),old=cloneDefaults(s.theme),next=cloneDefaults(theme);
  for(const key of ['name','welcome','homeCardTitle'])if(s[key]===old[key])s[key]=next[key];
  for(const key of Object.keys(s.colours))if(s.colours[key]===old.colours[key])s.colours[key]=next.colours[key];
  if(JSON.stringify(s.categoryNames)===JSON.stringify(old.categoryNames)){s.categoryNames.forEach((name,i)=>renameCategoryArtwork(s,name,next.categoryNames[i]));s.categoryNames=next.categoryNames;}
  s.schedule=s.schedule.map(r=>({...r,day:r.day===themes[s.theme].holiday?themes[theme].holiday:r.day}));
  s.theme=theme;return s;
}
export const namesOf = (settings,key='newNames') => [...new Set((settings[key]||'').split(/\r?\n/).filter(s=>s.trim()))];
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const escapeCSS = value => String(value).replace(/[\\"\n\r\f<>\u0000]/g, c=>c==='\u0000'?'\\fffd ':`\\${c.codePointAt(0).toString(16)} `);
export function isHTTPS(value) {
  try { const u = new URL(value); return u.protocol==='https:' && !!u.hostname && !u.username && !u.password; } catch {return false;}
}
export function validate(s) {
  const errors = validateExtras(s,isHTTPS);
  for(const [key,,defaultValue,long] of copyFields){const value=s.copy[key];if(value!==undefined&&!long&&!value.trim())errors['copy.'+key]='Enter a label or reset this text to its theme default.';}
  for (const key of ['name','dates']) if (!s[key].trim()) errors[key]='Please enter a value.';
  if (s.logoMode==='custom' && !isHTTPS(s.logo)) errors.logo='Start with https:// and use a direct image link, for example https://example.org/logo.png.';
  if (s.fm && !/^\d{2,3}(\.\d{1,2})?$/.test(s.frequency.trim())) errors.frequency='Enter a frequency, for example 88.7 (without FM).';
  if (s.pulsemesh && s.pulsemeshButtons!=='download' && !isHTTPS(s.pulsemeshUrl)) errors.pulsemeshUrl='Paste your full PulseMesh display link starting with https://, or choose Download app only.';
  if (s.notice) for (const key of ['noticeTitle','noticeText']) if (!s[key].trim()) errors[key]='Add this before enabling your notice.';
  if (s.donations) {
    for (const key of ['charity','donationText']) if (!s[key].trim()) errors[key]='Add this before showing support cards.';
    if (!isHTTPS(s.donationUrl)) errors.donationUrl='Include https://, for example https://example.org/donate. A bare www. address is incomplete.';
    if (s.donationImage && !isHTTPS(s.donationImage)) errors.donationImage='Use a direct image URL starting with https://, for example https://example.org/charity.png.';
    s.donationRecipients.forEach((recipient,i)=>{
      for(const key of ['name','description'])if(!recipient[key].trim())errors[`donationRecipients.${i}.${key}`]='Complete this card, or remove it.';
      if(recipient.callout!==undefined){
        if(!recipient.button.trim())errors[`donationRecipients.${i}.button`]='Add a short button label.';
        if((recipient.home||recipient.info)&&!recipient.callout.trim())errors[`donationRecipients.${i}.callout`]='Add a heading for this Home / Info teaser.';
      }
      if(!isHTTPS(recipient.url))errors[`donationRecipients.${i}.url`]='Include https://, for example https://example.org/support.';
      if(recipient.image&&!isHTTPS(recipient.image))errors[`donationRecipients.${i}.image`]='Use a direct image link starting with https://.';
    });
  }
  if(s.categories||songArtworkMode(s)==='category'){
    const seen=new Set();s.categoryNames.forEach((name,i)=>{
      if(!name.trim())errors[`categoryNames.${i}`]='Enter the RF category name, or remove this row.';
      else if(seen.has(name.trim().toLowerCase()))errors[`categoryNames.${i}`]='Use each category once.';
      seen.add(name.trim().toLowerCase());
    });
  }
  Object.assign(errors,validateInformation(s,isHTTPS));
  s.faq.forEach((f,i)=>{
    if(!f.question.trim())errors[`faq.${i}.question`]='Add a question, or remove this item.';
    if(f.kind==='text'&&!f.answer.trim())errors[`faq.${i}.answer`]='Add an answer, or remove this item.';
    if(f.kind==='text'&&f.linkUrl&&!isHTTPS(f.linkUrl))errors[`faq.${i}.linkUrl`]='Use the full link starting with https://.';
    if(f.kind==='text'&&f.linkUrl&&!f.linkLabel?.trim())errors[`faq.${i}.linkLabel`]='Add a short link label.';
  });
  s.schedule.forEach((r,i)=>{for(const key of ['day','hours']) if(!r[key].trim())errors[`schedule.${i}.${key}`]='Please complete this row, or remove it.';});
  for(const [key,v] of Object.entries(s.colours)) if(!/^#[a-f\d]{6}$/i.test(v)) errors[`colours.${key}`]='Choose a six-digit hex colour.';
  for(const key of ['newNames','movingHeadNames'])if(namesOf(s,key).length>200)errors[key]='Use at most 200 sequence names.';
  return errors;
}
export function checkedSettings(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw Error('Settings must be an object.');
  const s=cloneDefaults();
  Object.assign(s,checkedArtwork(input));
  s.icons=checkedIcons(input.icons);
  s.extraInfoCards=checkedInformationCards(input.extraInfoCards);
  for(const [k,v] of Object.entries(s)) {
    if ([...Object.keys(artworkDefaults),'extraInfoCards','icons','schedule','colours','categoryNames','hiddenCategories','faq','copy','donationRecipients',...Object.keys(listDefinitions)].includes(k)) continue;
    if([...Object.keys(seasonalDefaults),'movingHeadNames','movingHeadAnimation','socialMain','socialInfo','socialTitle','socialText','showQueueLimit','showSongArtists','showQueueArtists','homeCardImage',...Object.keys(guidanceDefaults)].includes(k) && input[k]===undefined) continue; // Additive fields keep their compatible defaults in older backups.
    if(typeof input[k]!==typeof v) throw Error(`Invalid or missing setting: ${k}.`);
    if(typeof v==='string' && (input[k].length>20000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input[k]))) throw Error(`Invalid text in ${k}.`);
    s[k]=input[k];
  }
  // Older designs used one header-art switch. New choices are independent and take priority.
  for(const key of ['headerTopDecorations','headerBottomDecorations'])if(input[key]===undefined)s[key]=input.headerDecorations??true;
  if(!['header','edges'].includes(s.flagPlacement))throw Error('Choose a supported flag placement.');
  if(!['status','above-header','below-header'].includes(s.guidancePosition))throw Error('Choose a supported guidance position.');
  if(!Object.hasOwn(themes,s.theme))throw Error('Unknown seasonal theme.');
  if(!['download','listen','both'].includes(s.pulsemeshButtons))throw Error('Choose supported PulseMesh buttons.');
  Object.assign(s,checkedExtraLists(input));
  if(!['icon','symbol','seasonal','custom'].includes(s.logoMode))throw Error('Choose a supported logo option.');
  if(!logoChoices[s.theme].some(c=>c.id===s.logoStyle))throw Error('Choose a supported logo design.');
  for(const theme of ['christmas','halloween'])if(!decorationChoices[theme].some(c=>c.id===s[theme+'Decoration']))throw Error('Choose a supported navbar decoration.');
  if(!nameFonts.some(f=>f.id===s.nameFont))throw Error('Choose a supported show-name font.');
  if(!/^#[a-f0-9]{6}$/i.test(s.nameColour))throw Error('Choose a six-digit show-name colour.');
  if(!input.copy||typeof input.copy!=='object'||Array.isArray(input.copy))throw Error('Invalid visitor text settings.');
  s.copy={};for(const [key,,,long] of [...copyFields,...legacyCopyFields]){if(!Object.hasOwn(input.copy,key))continue;const value=input.copy[key];if(typeof value!=='string'||value.length>(key.startsWith('NAV_')?16:long?1000:160)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error('Invalid visitor text: '+key);s.copy[key]=value;}
  if(!Array.isArray(input.donationRecipients)||input.donationRecipients.length>4)throw Error('Use up to five support cards.');
  const previousCopy=copyFor(s);
  s.donationRecipients=input.donationRecipients.map(recipient=>{
    if(!recipient||typeof recipient.home!=='boolean'||typeof recipient.info!=='boolean')throw Error('Invalid support card.');
    const legacy=!Object.hasOwn(recipient,'callout')&&!Object.hasOwn(recipient,'hint');
    const values={...recipient};
    if(legacy){values.button=recipient.button||previousCopy.DONATE_BUTTON;values.callout=previousCopy.DONATION_CALLOUT;values.hint=previousCopy.DONATE_HINT;}
    const result={home:recipient.home,info:recipient.info};
    for(const key of ['name','description','url','image','button','callout','hint']){
      const value=values[key],max=['name','button','hint'].includes(key)?160:key==='callout'?1000:4000;
      if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error('Invalid support card '+key);
      result[key]=value;
    }
    return result;
  });
  if(!Array.isArray(input.categoryNames)||input.categoryNames.length<1||input.categoryNames.length>12||input.categoryNames.some(n=>typeof n!=='string'||n.length>100||/[\u0000-\u001f]/.test(n)))throw Error('Use 1–12 category names, each up to 100 characters.');
  s.categoryNames=[...input.categoryNames];
  if(!Array.isArray(input.hiddenCategories)||input.hiddenCategories.length>12||input.hiddenCategories.some(n=>typeof n!=='string'||n.length>100||/[\u0000-\u001f]/.test(n)))throw Error('Invalid category button choices.');
  s.hiddenCategories=[...new Set(input.hiddenCategories)];
  if(!Array.isArray(input.faq)||input.faq.length>20)throw Error('Use at most 20 FAQ items.');
  const linked=new Set();s.faq=input.faq.map(f=>{
    if(!f||!['text','schedule','listening'].includes(f.kind)||typeof f.question!=='string'||typeof f.answer!=='string'||f.question.length>300||f.answer.length>3000)throw Error('Invalid FAQ item.');
    if(f.kind!=='text'){if(linked.has(f.kind))throw Error('Use each linked FAQ answer once.');linked.add(f.kind);}
    const row={kind:f.kind,question:f.question,answer:f.answer};
    for(const key of ['linkLabel','linkUrl'])if(key in f){if(typeof f[key]!=='string'||f[key].length>(key==='linkUrl'?4000:160)||/[\u0000-\u001f]/.test(f[key]))throw Error('Invalid FAQ link.');row[key]=f[key];}
    return row;
  });
  if(!Array.isArray(input.schedule)||input.schedule.length<1||input.schedule.length>12) throw Error('Use between 1 and 12 schedule rows.');
  s.schedule=input.schedule.map(r=>{
    if(!r||typeof r.day!=='string'||typeof r.hours!=='string'||r.day.length>200||r.hours.length>200) throw Error('Invalid schedule row.');
    return {day:r.day,hours:r.hours};
  });
  if(!input.colours)throw Error('Missing colour settings.');
  for(const k of Object.keys(s.colours)) {
    if(typeof input.colours[k]!=='string') throw Error(`Missing colour: ${k}.`);
    s.colours[k]=input.colours[k];
  }
  return s;
}
export const settingsFile = s => JSON.stringify({version:2,template:templateId,settings:s},null,2)+'\n';
export function parseSettings(text, allowIncomplete=false) {
  if(text.length>1000000)throw Error('That settings file is too large.');
  let f;try{f=JSON.parse(text);}catch{throw Error('That file is not valid JSON. Choose a template customiser settings file.');}
  if(f?.version===1&&f.template==='christmas'&&f.settings&&typeof f.settings==='object'){
    f.settings={...f.settings,theme:'christmas',categoryNames:[...themes.christmas.categories],donationImage:'',donationHome:true,donationInfo:true,colours:{...f.settings.colours,text:defaults.colours.text,secondary:defaults.colours.secondary}};
    f.version=2;f.template=templateId;
  }
  if(!f||typeof f!=='object'||f.version!==2||f.template!==templateId)throw Error('This file uses an unsupported version or template. Your current work has not changed.');
  // Preserve older settings created before Home cards and FAQ editing.
  if(f.settings&&typeof f.settings==='object'){
    if(!('pulsemeshUrl' in f.settings))f.settings.pulsemeshUrl='';
    if(!('pulsemeshButtons' in f.settings))f.settings.pulsemeshButtons='download';
    if(!('showSupportTab' in f.settings))f.settings.showSupportTab=true;
    for(const [key,value] of Object.entries({...extraDefaults,...nameStyleDefaults}))if(!(key in f.settings))f.settings[key]=structuredClone(value);
    if(!('logoMode' in f.settings))f.settings.logoMode=f.settings.logo?'custom':'icon';
    for(const key of ['showMenuLabels','showAlbumArtwork','onAirPulse','logoStyle','combineLogoName','showNameOnHome','christmasDecoration','halloweenDecoration','copy','decorations','homeLiveSchedule','countdown','halloweenCountdown','homeMusicLink','queueCount','votesRemaining','hiddenCategories','musicFM','donationRecipients','neighbourTitle','neighbourText','homeCard','homeCardTitle','homeCardText','homeCardLink','homeCardLinkLabel','faq','donationHome','donationInfo'])if(!(key in f.settings))f.settings[key]=structuredClone(defaults[key]);
  }
  const s=checkedSettings(f.settings);
  if(!allowIncomplete && Object.keys(validate(s)).length)throw Error('That file has incomplete or invalid settings. Your current work has not changed.');
  return s;
}
export function render(source, input) {
  const s=checkedSettings(input), errors=validate(s);
  if(Object.keys(errors).length) throw Error('Complete the highlighted settings before exporting.');
  return renderDocument(source,s);
}
// Draft rendering is only for the local editor. Unsafe URLs never enter its markup.
// Copy/download always use the strict render() entry point above.
export function renderDraft(source,input){
  const s=checkedSettings(input),d=cloneDefaults(s.theme);
  for(const [key,,,long] of copyFields)if(!long&&s.copy[key]!==undefined&&!s.copy[key].trim())delete s.copy[key];
  for(const key of ['name','dates','noticeTitle','charity','donationText','homeCardTitle','homeCardLinkLabel'])if(!s[key].trim())s[key]=d[key];
  if(s.notice&&!s.noticeText.trim())s.noticeText='Your notice message will appear here.';
  if(!isHTTPS(s.logo))s.logo='';
  if(!isHTTPS(s.pulsemeshUrl))s.pulsemeshUrl='';
  if(!isHTTPS(s.donationImage))s.donationImage='';
  if(!isHTTPS(s.homeCardLink))s.homeCardLink='';
  if(s.homeCard&&!s.homeCardText.trim())s.homeCardText='Your extra information message will appear here.';
  s.faq=s.faq.map(f=>({...f,question:f.question.trim()||'Your question',answer:f.answer.trim()||(f.kind==='text'?'Your answer will appear here.':'')}));
  if(s.fm&&!/^\d{2,3}(\.\d{1,2})?$/.test(s.frequency.trim()))s.frequency='—';
  s.schedule=s.schedule.map(r=>({day:r.day.trim()||'Show day',hours:r.hours.trim()||'To be announced'}));
  s.categoryNames=s.categoryNames.map((name,i)=>name.trim()||`Category ${i+1}`);
  for(const key of Object.keys(s.colours))if(!/^#[a-f\d]{6}$/i.test(s.colours[key]))s.colours[key]=d.colours[key];
  return {html:renderDocument(source,s),settings:s};
}
function filterCSS(s){
  const active='body:has(#show-options.has-categories)';
  // Fixed fragment targets select a filter without moving the viewer's scroll position.
  // Keep this shared by every template, including All/NEW when categories are disabled.
  // Do not anchor to disappearing songs or surrounding content as the list changes.
  return `.music-filter-targets { position:static;width:0;height:0;overflow:hidden; }
.music-filter-targets span { position:fixed;top:0;left:0;width:1px;height:1px;overflow:hidden; }
#music-panel { overflow-anchor:none; }
/* RF emits uncategorised Voting cards and tallies as adjacent siblings,
   without a category-section or cell-vote-row wrapper. Keep each pair aligned. */
.content__body .los-song-list:has(> .cell-vote-playlist) { display:grid;grid-template-columns:minmax(0,1fr) 3.1rem;gap:12px 6px;align-items:stretch; }
.content__body .los-song-list:has(> .cell-vote-playlist) > .category-section,
.content__body .los-song-list:has(> .cell-vote-playlist) .cell-vote-row { grid-column:1 / -1; }
.content__body .los-song-list > .cell-vote-playlist { grid-column:1;margin-bottom:0;min-width:0;align-content:var(--los-new-vote-align,normal);padding-right:calc(.78em + var(--los-new-text-gutter,0px)); }
.content__body .los-song-list > .cell-vote-playlist + .cell-vote { grid-column:2;display:flex;flex-direction:column;align-items:center;justify-content:center;align-self:stretch;margin:0;padding:4px;min-width:0;border:1px solid color-mix(in srgb,var(--gold) 24%,transparent);border-radius:9px;color:var(--gold);font-weight:750;pointer-events:none; }
/* NEW applies to the unwrapped card and its own tally as well as grouped rows. */
body:has(#show-options.has-new-songs):has(#songs-new:target) .los-song-list > :is(.cell-vote-playlist,.cell-vote) { display:var(--los-new-display,none)!important; }
`+s.categoryNames.map((name,i)=>{
    if(s.hiddenCategories.includes(name))return '';
    const target=`#songs-category-${i+1}`,base=`${active}:has(${target}:target)`;
    return `${base} .music-filter a[href="${target}"] { background:var(--gold);color:var(--accent-ink); }
${base} .los-song-list > :is(.category-section,.jukebox-list,.cell-vote-playlist,.cell-vote,.cell-vote-row) { display:none !important; }
${base} .los-song-list > .category-section:nth-child(${i+1} of .category-section) { display:var(--los-category-display,block) !important; }`;
  }).join('\n');
}
const rgb=hex=>hex.slice(1).match(/../g).map(n=>parseInt(n,16)).join(', ');
export function renderDocument(source,s,extra={}){
  const e=escapeHTML,names=namesOf(s),t=themes[s.theme],copy=copyFor(s),c=Object.fromEntries(Object.entries(copy).map(([k,v])=>[k,e(formatCopy(v,s))]));
  const flags=[!s.showSongArtists&&'hide-song-artists',!s.showQueueArtists&&'hide-queue-artists',s.fm&&'has-fm',s.pulsemesh&&'has-pulsemesh',(s.fm||s.pulsemesh||s.listening.trim())&&'has-listening',s.donations&&'has-donations',s.categories&&s.categoryNames.some(n=>!s.hiddenCategories.includes(n))&&'has-categories',s.newFilter&&'has-new-songs',s.donationHome&&'has-donations-home',s.donationInfo&&'has-donations-info'].filter(Boolean).join(' ');
  const v={
    SHOW_NAME:e(s.name),FEATURE_CLASSES:flags+seasonalClasses(s),...seasonalTokens(s),WELCOME:e(s.welcome),SHOW_DATES:e(s.dates),
    LOGO:s.logoMode==='seasonal'?`<img class="show-logo" src="${assetBase+logoFile(s)}" alt="">`:s.logoMode==='custom'&&s.logo?`<img class="show-logo" src="${e(s.logo)}" alt="${e(s.name)} logo">`:`<i class="[[ICON:brand:fa-solid ${t.icon}]]" aria-hidden="true"></i>`,
    BRAND_CLASS:s.logoMode==='seasonal'&&s.combineLogoName&&s.showNameOnHome?'brand-combined':'',
    NAME_CLASS:s.showNameOnHome?'':'show-name-hidden',
    DECORATION_CSS:s.decorations&&!isNewSeason(s.theme)?decorationCSS(s):'',
    VIEWER_OPTIONS_CSS:viewerOptionsCSS(s),
    NOTICE_HIDDEN:s.notice?'':'hidden',NOTICE_TITLE:e(s.noticeTitle||'Show update'),NOTICE_TEXT:e(s.noticeText),
    SCHEDULE_ROWS:s.schedule.map(r=>`<div class="hours-row"><span>${e(r.day)}</span><span>${e(r.hours)}</span></div>`).join('\n'),
    SCHEDULE_FAQ:'<div class="hours-list">'+s.schedule.map(r=>`<div class="hours-row"><span>${e(r.day)}</span><span>${e(r.hours)}</span></div>`).join('')+'</div>',
    FM_FREQUENCY:e(s.frequency),
    PULSE_DISPLAY_LINK:s.pulsemesh&&s.pulsemeshButtons!=='download'&&isHTTPS(s.pulsemeshUrl)?`<a class="pulsemesh-download pulsemesh-listen" href="${e(s.pulsemeshUrl)}" target="_blank" rel="noopener noreferrer"><i class="[[ICON:pulseListen:fa-solid fa-headphones]]" aria-hidden="true"></i><span>${c.PULSE_LISTEN_BUTTON}</span></a>`:'',
    PULSE_DOWNLOAD_CONTENT:s.pulsemeshButtons!=='listen'?`<a class="pulsemesh-download" href="https://pulsemesh.io/download" target="_blank" rel="noopener noreferrer"><i class="[[ICON:pulseDownload:fa-solid fa-download]]" aria-hidden="true"></i><span>${c.PULSE_BUTTON}</span></a><span class="pulsemesh-platforms">${c.PULSE_PLATFORMS}</span>`:'',
    OTHER_LISTENING:s.listening.trim()?`<div class="music-option other-listening">${e(s.listening)}</div>`:'',
    OTHER_LISTENING_FAQ:s.listening.trim()?`<p class="other-listening">${e(s.listening)}</p>`:'',
    CHARITY_NAME:e(s.charity||'Your chosen charity'),DONATION_DESCRIPTION:e(s.donationText||'Support a cause close to our community.'),DONATION_URL:s.donations&&isHTTPS(s.donationUrl)?e(s.donationUrl):'#support-panel',
    DONATION_ICON:s.donations&&s.donationImage?`<img class="donation-image donation-image--compact" src="${e(s.donationImage)}" alt="">`:'<i class="[[ICON:support:fa-solid fa-hand-holding-heart]]" aria-hidden="true"></i>',
    DONATION_IMAGE:s.donations&&s.donationImage?`<img class="donation-image" src="${e(s.donationImage)}" alt="">`:'',
    CATEGORY_TARGETS:s.categoryNames.map((n,i)=>`<span class="${s.hiddenCategories.includes(n)?'inactive-category-target':'category-filter-target'}" id="songs-category-${i+1}"></span>`).join(''),
    CATEGORY_LINKS:s.categoryNames.map((n,i)=>s.hiddenCategories.includes(n)?'':`<a class="category-filter-link" href="#songs-category-${i+1}">${e(n)}</a>`).join(''),
    CATEGORY_CSS:filterCSS(s),
    ...renderExtras(s,e,isHTTPS,c),
    HOME_MUSIC_HIDDEN:s.homeMusicLink?'':'hidden',
    QUEUE_COUNT:s.queueCount?`<p class="queue-count">${c.QUEUE_COUNT_LABEL}: <span class="rf-queue-size">{QUEUE_SIZE}</span></p>`:'',
    VOTES_REMAINING:s.votesRemaining?'<div class="votes-remaining">{VOTES_REMAINING}</div>':'',
    LOCATION_CODE_BLOCK:`<div {location-code-dynamic-container}><div class="location-code-card"><h3>${c.ACCESS_CODE_TITLE}</h3><p>${c.ACCESS_CODE_HELP}</p><div class="location-code-input">{LOCATION_CODE}</div></div></div>`,
    MUSIC_FM_HIDDEN:s.musicFM?'':'hidden',
    THEME_CSS:s.theme==='halloween'?halloweenCSS:'',
    SUCCESS_ICON:isNewSeason(s.theme)?t.icon:s.theme==='halloween'?'fa-ghost':'fa-gift',
    HOME_CARD:renderInformation(s,e,isHTTPS),
    ...guidanceTokens(s,e,{cardAtStatus:extra.GUIDANCE_CARD_STATUS===true}),
    NEW_SELECTORS:names.length?names.map(n=>`[data-key="${escapeCSS(n)}"]`).join(', '):':not(*)',
    CARD_COLOUR:s.colours.card,GOLD_COLOUR:s.colours.gold,TEXT_COLOUR:s.colours.text,SECONDARY_COLOUR:s.colours.secondary,
    ACCENT_INK:accentInk(s.colours.gold),...c,
    ...Object.fromEntries(['EMPTY_NOW','EMPTY_NEXT','EMPTY_QUEUE','UNAVAILABLE_ROW_PREFIX','LISTEN_FALLBACK','VOTES_LABEL'].map(k=>[k+'_CSS',escapeCSS(formatCopy(copy[k],s))]))
  };
  Object.assign(v,extra);
  // Give RF's single-value parser its own first-text-child wrapper.
  const queueCopy=text=>text.split(/(\{(?:queueLimit|queuelength|QUEUE_DEPTH)\})/g).map(part=>/^\{(?:queueLimit|queuelength|QUEUE_DEPTH)\}$/.test(part)?'<span class="rf-queue-depth">{QUEUE_DEPTH}</span>':e(formatCopy(part,s))).join('');
  v.JUKEBOX_HELP=queueCopy(copy.JUKEBOX_HELP);
  v.QUEUE_LIMIT=s.showQueueLimit?`<p class="queue-instructions queue-limit">${queueCopy(copy.QUEUE_LIMIT_TEXT)}</p>`:'';
  v.QUEUE_HELP=copy.QUEUE_HELP.trim()?`<p class="queue-instructions">${queueCopy(copy.QUEUE_HELP)}</p>`:'';
  const recipientCard=(recipient,compact)=>{
    const scoped={...s,charity:recipient.name.trim()||'Support card'},button=e(formatCopy(recipient.button.trim()||supportCardDefaults.button,scoped)),url=isHTTPS(recipient.url)?e(recipient.url):'#support-panel';
    const image=isHTTPS(recipient.image)?`<img class="donation-image${compact?' donation-image--compact':''}" src="${e(recipient.image)}" alt="">`:'';
    if(compact)return `<a class="section-card compact donation-card compact-live additional-donation" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${button}">${image||'<i class="[[ICON:support:fa-solid fa-hand-holding-heart]]" aria-hidden="true"></i>'}<p><strong>${e(formatCopy(recipient.callout.trim()||supportCardDefaults.callout,scoped))}</strong>${recipient.hint.trim()?`<span class="tap-note">${e(formatCopy(recipient.hint,scoped))}</span>`:''}</p></a>`;
    return `<div class="section-card support-card additional-donation">${image}<div><h3>${e(scoped.charity)}</h3><p>${e(recipient.description.trim()||'Your recipient description')}</p><a class="support-action" href="${url}" target="_blank" rel="noopener noreferrer"><i class="[[ICON:support:fa-solid fa-hand-holding-heart]]" aria-hidden="true"></i> ${button}</a></div></div>`;
  };
  for(const place of ['home','info','support'])v['EXTRA_DONATIONS_'+place.toUpperCase()]=s.donations?s.donationRecipients.filter(r=>place==='support'||r[place]).map(r=>recipientCard(r,place!=='support')).join('\n'):'';
  v.LIVE_SCHEDULE=s.homeLiveSchedule?`<div class="section-card compact live-schedule"><h2>${c.DATES_TITLE}</h2><p>${v.SHOW_DATES}</p><h3>${c.HOURS_TITLE}</h3><div class="hours-list">${v.SCHEDULE_ROWS}</div></div>`:'';
  const pulseFAQ=[s.pulsemesh&&s.pulsemeshButtons!=='download'&&isHTTPS(s.pulsemeshUrl)?`<div class="faq-pulse-option"><a class="pulsemesh-listen" href="${e(s.pulsemeshUrl)}" target="_blank" rel="noopener noreferrer">${c.PULSE_LISTEN_BUTTON}</a></div>`:'',s.pulsemeshButtons!=='listen'?`<div class="faq-pulse-option"><a href="https://pulsemesh.io/download" target="_blank" rel="noopener noreferrer">${c.PULSE_BUTTON}</a><small>${c.PULSE_PLATFORMS}</small></div>`:''].filter(Boolean).join('');
  const listening=`<p class="share-fm">${c.FM_INTRO} ${v.FM_FREQUENCY} FM.</p><div class="share-pulsemesh">${pulseFAQ}</div>${v.OTHER_LISTENING_FAQ}`;
  v.FAQ_ITEMS=s.faq.map(f=>`<div class="faq-item"${f.kind==='listening'?' id="info-listening"':''}><strong>${e(f.question)}</strong>${f.kind==='schedule'?`<p>${v.SHOW_DATES}</p>${v.SCHEDULE_FAQ}`:f.kind==='listening'?`<div class="linked-listening">${listening}</div>`:''}${f.answer?`<p class="faq-answer">${e(f.answer)}</p>`:''}${f.kind==='text'&&isHTTPS(f.linkUrl)?`<p><a class="faq-link" href="${e(f.linkUrl)}" target="_blank" rel="noopener noreferrer">${e(f.linkLabel||'Find out more')}</a></p>`:''}</div>`).join('\n')+v.PLAYLIST_FAQ;
  if(!s.faq.some(f=>f.kind==='listening'))v.FAQ_ITEMS='<span id="info-listening"></span>'+v.FAQ_ITEMS;
  v.FAQ_SECTION=s.faq.length||v.PLAYLIST_FAQ?`<div class="section-card info-card"><h2>${c.FAQ_TITLE}</h2><div class="info-faq">${v.FAQ_ITEMS}</div></div>`:'<span id="info-listening"></span>';
  for(const [i,k] of ['home','music','support','info'].entries()){
    v[`${k.toUpperCase()}_RGB`]=rgb(s.colours[k]);v[`${k.toUpperCase()}_ACCENT`]=t.accents[i];v[`${k.toUpperCase()}_ACCENT_RGB`]=rgb(t.accents[i]);
  }
  Object.assign(v,extra);
  return applyIconTokens(source.replace(/\[\[([A-Z_]+)\]\]/g,(_,key)=>{if(!(key in v))throw Error(`Unknown template marker ${key}`);return v[key];}),s);
}
export function contrast(a,b){
  const luminance=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function accentInk(colour){return contrast(colour,'#17131e')>=contrast(colour,'#ffffff')?'#17131e':'#ffffff';}
const halloweenCSS=`
/* Halloween treatment: the same four panels and floating navigation. */
:root { --page-bg:#130f1b; }
.show-status--live { color:#ffd2a8;background:linear-gradient(145deg,#ef8c3026,transparent),#3a241a;border-color:#ed984f99;box-shadow:inset 0 0 0 4px #ed984f0a,0 0 24px #ed984f1f; }
.show-status--live .show-status__label::before { background:#ffb978;box-shadow:0 0 0 4px #ffb9781f,0 0 12px #ffb97866; }
.show-status--live .show-status__detail { color:#efd0b8; }
.content__body { background-image:radial-gradient(ellipse at 12% 4%,rgba(var(--section-wash),.38),transparent 62%),radial-gradient(ellipse at 100% 90%,rgba(var(--section-wash),.19),transparent 70%),linear-gradient(150deg,rgba(var(--section-wash),.18),transparent); }
.share-brand > i { filter:drop-shadow(0 0 18px #ffba7166); }
.innerRequestSuccessful::before,.failed_Info_Box::before { background:repeating-linear-gradient(135deg,#ed8737 0 12px,#392448 12px 24px,#bb8ce5 24px 36px,#392448 36px 48px); }
.request-feedback { --feedback-accent:#ffca95;--feedback-rgb:255,202,149;--feedback-bg:#291b30; }
.request-feedback--success { --feedback-accent:#d6b8ff;--feedback-rgb:214,184,255;--feedback-bg:#251b35; }
.request-feedback--error { --feedback-accent:#ffc1ca;--feedback-rgb:255,193,202;--feedback-bg:#2b1e25; }
.music-tab-button.primary-cta { border-color:#b584e344;background:linear-gradient(135deg,#b584e31e,transparent),var(--panel); }
.music-tab-button.primary-cta i { background:#d4b1ff;color:#29133f; }
.music-tab-button.primary-cta strong { color:#d4b1ff; }
.los-menu__item.tab-red { --nav-tint:#4a2a1d;--nav-accent:#ffc58d; }
.los-menu__item.tab-green { --nav-tint:#35234b;--nav-accent:#d4b1ff; }
.los-menu__item.tab-blue { --nav-tint:#193d30;--nav-accent:#9ce6bb; }
.los-menu__item.tab-yellow { --nav-tint:#45233c;--nav-accent:#f2b2d8; }
`;
function viewerOptionsCSS(s){return [
  nameStyleCSS(s),
  s.homeCard&&informationCSS,
  artworkCSS(s),
  songBadgeCSS(s,escapeCSS,accentInk(s.colours.gold)),
  !s.showMenuLabels&&'.los-menu__label { display:none; } .los-menu .los-menu__item i { font-size:24px;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;line-height:1; }',
  !s.showSupportTab&&`
/* Hide only the menu entry; retain Support for direct links and editor preview. */
.los-menu { grid-template-columns:repeat(3,minmax(0,1fr)); }
.los-menu__item[data-tab-target="support"] { display:none; }
`,
  s.onAirPulse&&`
/* Optional gentle live-status glow; no change to RF availability. */
.show-status--live { --live-dot-rgb:${s.theme==='halloween'?'255,185,120':'139,233,180'}; }
.show-status--live .show-status__label::before { animation:los-live-glow 2.8s ease-in-out infinite; }
@keyframes los-live-glow {
  0%,100% { box-shadow:0 0 0 3px rgba(var(--live-dot-rgb),.1),0 0 7px rgba(var(--live-dot-rgb),.3); }
  50% { box-shadow:0 0 0 5px rgba(var(--live-dot-rgb),.16),0 0 15px rgba(var(--live-dot-rgb),.65); }
}
@media(prefers-reduced-motion:reduce) { .show-status--live .show-status__label::before { animation:none; } }
`
].filter(Boolean).join('\n');}
function decorationCSS(s){const count=s.showSupportTab?4:3;return `
/* One optional seasonal ornament follows the selected menu item.
   Match the menu’s 6px padding and 4px gaps for either three or four columns. */
.los-menu { --nav-decoration-index:0; }
body:has(#music-panel:target) .los-menu, body:has(#music-panel :target) .los-menu { --nav-decoration-index:1; }
body:has(#support-panel:target) .los-menu { --nav-decoration-index:2; }
body:has(#info-panel:target) .los-menu, body:has(#info-panel :target) .los-menu { --nav-decoration-index:${count-1}; }
.los-menu::after { content:"";position:absolute;width:34px;height:34px;top:-6px;left:calc(-36px + (100% - 8px) / ${count} * (var(--nav-decoration-index) + 1));background:url("${assetBase+decorationFile(s)}") center / contain no-repeat;pointer-events:none;z-index:2;transition:left 180ms ease; }
${s.showSupportTab?'':'body:has(#support-panel:target) .los-menu::after, body:has(#support-panel :target) .los-menu::after { content:none; }'}
@media(prefers-reduced-motion:reduce) { .los-menu::after { transition:none; } }
`;}
export const registry = [{id:templateId,name:'Lights on Sunset',defaults,themes,source:'templates/christmas.html',supportedSettings:Object.keys(defaults),render}];
