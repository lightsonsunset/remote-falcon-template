// Optional visitor content. Shared by the canonical renderer and editor, never demo data.
export {iconLibrary as linkIcons} from './icons.js';
import {iconLibrary as linkIcons} from './icons.js';
export const listDefinitions={
 playlists:{label:'Playlist',max:12,fields:{icon:'music',title:'',description:'',url:''}},
 facts:{label:'Fact',max:6,fields:{value:'',label:''}},
 resources:{label:'Resource',max:12,fields:{icon:'link',title:'',description:'',url:'',image:''}}
};
export const extraDefaults={
 playlistMusic:false,playlistInfo:false,playlistTitle:'Browse the Playlists',playlistText:'Hear the show music outside show hours.',playlistQuestion:'Can I listen to the playlists outside show hours?',playlistFAQText:'Yes! Browse our playlists below. At the display, use the Music tab to choose what plays.',
 playlists:[{icon:'spotify',title:'Spotify Playlist',description:'Browse the show songs on Spotify.',url:''},{icon:'apple',title:'Apple Music Playlist',description:'Browse the show songs on Apple Music.',url:''}],
 showPreview:false,showPreviewTitle:'Watch a preview of the show',showPreviewText:'A little taste of what to expect when the lights are on.',showPreviewUrl:'',showPreviewButton:'Watch on YouTube',
 youtube:false,youtubeLabel:'YouTube',youtubeUrl:'',
 quickFacts:false,factsTitle:'Quick Facts',facts:[{value:'',label:'LED pixels'},{value:'',label:'Sequenced songs'},{value:'You',label:'Control the show'}],
 resourcesEnabled:false,resourcesTitle:'Resources',resourcesText:'Useful links for learning about animated light displays.',
 resources:[
  {icon:'radio',title:'Remote Falcon',description:'Let visitors request songs and vote at your display.',url:'https://remotefalcon.com/',image:''},
  {icon:'community',title:'AusChristmasLighting',description:'Community forums, guides and a display map.',url:'https://auschristmaslighting.com/',image:''},
  {icon:'lights',title:'xLights',description:'Sequencing software for animated light displays.',url:'https://xlights.org/',image:''},
  {icon:'player',title:'Falcon Player (FPP)',description:'Show player software for schedules and lighting data.',url:'https://github.com/FalconChristmas/fpp',image:''},
  {icon:'headphones',title:'PulseMesh',description:'Synchronized audio for visitors at your show.',url:'https://pulsemesh.io/',image:''}
 ],
 musicAbout:true,countdownFormat:'days',halloweenCountdownFormat:'days'
};
export function checkedExtraLists(input){
 const result={};
 for(const [key,def] of Object.entries(listDefinitions)){
  if(!Array.isArray(input[key])||input[key].length>def.max)throw Error(`Use up to ${def.max} ${key}.`);
  result[key]=input[key].map(row=>{
   if(!row||typeof row!=='object')throw Error(`Invalid ${def.label.toLowerCase()}.`);
   const clean={};for(const part of Object.keys(def.fields)){
    if(typeof row[part]!=='string'||row[part].length>(['url','image'].includes(part)?4000:part==='description'?1000:160)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(row[part]))throw Error(`Invalid ${def.label.toLowerCase()} ${part}.`);
    clean[part]=row[part];
   }
   if('icon' in clean&&!Object.hasOwn(linkIcons,clean.icon))throw Error('Choose a supported link icon.');
   return clean;
  });
 }
 for(const key of ['countdownFormat','halloweenCountdownFormat'])if(!['days','full'].includes(input[key]))throw Error('Choose a supported countdown format.');
 return result;
}
export function validateExtras(s,isHTTPS){
 const errors={},required=(key)=>{if(!s[key].trim())errors[key]='Add this before showing this section.';},url=(key)=>{if(!isHTTPS(s[key]))errors[key]='Use the full link starting with https://.';};
 if(s.playlistMusic||s.playlistInfo){
  if(s.playlistMusic)required('playlistTitle');if(s.playlistInfo)required('playlistQuestion');
 }
 if(s.showPreview){required('showPreviewTitle');required('showPreviewButton');url('showPreviewUrl');}
 if(s.youtube){required('youtubeLabel');url('youtubeUrl');}
 if(s.quickFacts)required('factsTitle');if(s.resourcesEnabled)required('resourcesTitle');
 for(const [key,on] of [['playlists',s.playlistMusic||s.playlistInfo],['facts',s.quickFacts],['resources',s.resourcesEnabled]]){
  if(!on)continue;
  if(!s[key].length)errors[key]='Add an entry, or switch this section off.';
  s[key].forEach((r,i)=>{
   for(const part of key==='facts'?['value','label']:['title'])if(!r[part].trim())errors[`${key}.${i}.${part}`]='Complete this entry, or remove it.';
   if(key!=='facts'&&!isHTTPS(r.url))errors[`${key}.${i}.url`]='Use the full link starting with https://.';
   if(r.image&&!isHTTPS(r.image))errors[`${key}.${i}.image`]='Use a direct image link starting with https://.';
  });
 }
 return errors;
}
export function renderExtras(s,e,isHTTPS,c){
 const external=(url,cls,body)=>isHTTPS(url)?`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${body}</a>`:`<span class="${cls}">${body}</span>`;
 const icon=id=>`<i class="${linkIcons[id][1]}" aria-hidden="true"></i>`;
 const links=rows=>'<div class="visitor-links">'+rows.map(r=>external(r.url,'visitor-link',`<span class="visitor-link-icon">${r.image&&isHTTPS(r.image)?`<img src="${e(r.image)}" alt="" loading="lazy">`:icon(r.icon)}</span><span><strong>${e(r.title||'Your link')}</strong>${r.description?`<span class="visitor-link-description">${e(r.description)}</span>`:''}</span>`)).join('')+'</div>';
 const playlistLinks=links(s.playlists);
 const full=(s.theme==='halloween'?s.halloweenCountdownFormat:s.countdownFormat)==='full',on=s.theme==='halloween'?s.halloweenCountdown:s.countdown;
 const units=full?[['days',c.COUNTDOWN_DAY_UNIT],['hours',c.COUNTDOWN_HOURS],['minutes',c.COUNTDOWN_MINUTES],['seconds',c.COUNTDOWN_SECONDS]]:[['days',c.COUNTDOWN_DAYS]];
 return {
  PLAYLIST_CARD:s.playlistMusic&&s.playlists.length?`<section class="section-card visitor-playlists"><h2>${e(s.playlistTitle)}</h2>${s.playlistText?`<p>${e(s.playlistText)}</p>`:''}${playlistLinks}</section>`:'',
  PLAYLIST_FAQ:s.playlistInfo&&s.playlists.length?`<div class="faq-item playlist-faq"><strong>${e(s.playlistQuestion)}</strong>${s.playlistFAQText?`<p>${e(s.playlistFAQText)}</p>`:''}${playlistLinks}</div>`:'',
  SHOW_PREVIEW:s.showPreview?`<section class="section-card compact show-preview"><h2>${e(s.showPreviewTitle)}</h2><p>${e(s.showPreviewText)}</p>${external(s.showPreviewUrl,'support-action','<i class="[[ICON:showVideo:fa-brands fa-youtube]]" aria-hidden="true"></i> '+e(s.showPreviewButton))}</section>`:'',
  YOUTUBE_LINK:s.youtube?external(s.youtubeUrl,'info-pill youtube-link','<i class="[[ICON:youtube:fa-brands fa-youtube]]" aria-hidden="true"></i> '+e(s.youtubeLabel)):'',
  QUICK_FACTS:s.quickFacts&&s.facts.length?`<section class="section-card info-card quick-facts"><h2>${e(s.factsTitle)}</h2><div class="visitor-facts">${s.facts.map(f=>`<div><strong>${e(f.value||'—')}</strong><span>${e(f.label)}</span></div>`).join('')}</div></section>`:'',
  RESOURCES:s.resourcesEnabled&&s.resources.length?`<section class="section-card info-card visitor-resources"><h2>${e(s.resourcesTitle)}</h2>${s.resourcesText?`<p>${e(s.resourcesText)}</p>`:''}${links(s.resources)}</section>`:'',
  ABOUT_HIDDEN:s.musicAbout?'':'hidden',
  COUNTDOWN:on?`<section class="section-card compact seasonal-countdown ${s.theme}-countdown${full?' countdown-full':''}"><h2>${c.COUNTDOWN_TITLE}</h2><div class="countdownContainer">${units.map(([unit,label])=>`<div class="days-count"><strong id="to-${s.theme}-${unit}">--</strong><span>${label}</span></div>`).join('')}</div></section>`:'',
  VISITOR_EXTRAS_CSS:visitorCSS
 };
}
const visitorCSS=`
/* Optional visitor cards: shared in the viewer and manual edition. */
.info-tab-button[hidden]{display:none!important}
.visitor-links{display:grid;gap:.7rem;text-align:left}
.visitor-link{display:flex;align-items:center;gap:.85rem;padding:.85rem;border-radius:18px;background:var(--panel);border:1px solid var(--surface-border);color:var(--text);text-decoration:none;min-height:56px;box-sizing:border-box}
.visitor-link>span:last-child{min-width:0;overflow-wrap:anywhere;flex:1}.visitor-link strong{display:block;font-size:1rem}
.visitor-link-description{display:block;margin-top:.2rem;color:var(--text-secondary);font-size:.9rem;white-space:pre-line}
.visitor-link-icon{display:grid;place-items:center;flex:0 0 44px;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.05);color:var(--section-accent);font-size:1.5rem}
.visitor-link-icon img{width:100%;height:100%;object-fit:contain;border-radius:8px}.visitor-link-icon .fa-spotify{color:#1ed760}
a.visitor-link:hover{border-color:var(--section-accent)}a.visitor-link:focus-visible,.faq-link:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
.visitor-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,135px),1fr));gap:.75rem}
.visitor-facts>div{padding:1rem .65rem;border-radius:18px;background:var(--panel);border:1px solid var(--surface-border);overflow-wrap:anywhere}
.visitor-facts strong{display:block;font-size:1.6rem;line-height:1.25;color:var(--section-accent);font-variant-numeric:tabular-nums}.visitor-facts span{display:block;margin-top:.4rem;color:var(--text-secondary)}
.show-preview p,.visitor-playlists>p,.visitor-resources>p{white-space:pre-line}.show-preview .support-action{display:inline-flex;gap:.5rem;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}
.youtube-link{display:inline-flex;gap:.4rem;align-items:center;justify-content:center;overflow-wrap:anywhere;max-width:100%;box-sizing:border-box}.playlist-faq .visitor-links{margin-top:.8rem}.faq-link{color:var(--section-accent);overflow-wrap:anywhere}
/* Countdown uses the regular card style with stable, readable digits. */
.seasonal-countdown{flex-shrink:0}
.seasonal-countdown .countdownContainer{display:grid;grid-template-columns:minmax(0,1fr);gap:.65rem;max-width:100%;margin:0}
.seasonal-countdown .days-count{box-sizing:border-box;min-width:0;width:auto;max-width:none;padding:.8rem .45rem;margin:0;border-radius:16px}
.seasonal-countdown .days-count strong{display:block;line-height:1.15;font-variant-numeric:tabular-nums;color:var(--section-accent);font-size:clamp(2.5rem,9vw,3.4rem)}
.seasonal-countdown .days-count span{display:block;overflow-wrap:anywhere;margin-top:.4rem;color:var(--text-secondary);font-size:.8rem}
.seasonal-countdown.countdown-full .countdownContainer{grid-template-columns:repeat(2,minmax(0,1fr))}
.seasonal-countdown.countdown-full .days-count strong{font-size:clamp(1.6rem,5vw,2.6rem)}
@media(min-width:600px){.seasonal-countdown.countdown-full .countdownContainer{grid-template-columns:repeat(4,minmax(0,1fr))}}
`;
