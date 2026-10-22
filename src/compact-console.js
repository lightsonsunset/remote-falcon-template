import * as shared from './shared-settings.js';
import {assetBase,logoFile} from './assets.js';
import {headerArtworkValue} from './header-artwork.js';
import {isNewSeason,themes} from './themes.js';
import {nameFonts} from './name-style.js';
export const compactId='compact-console';
const defaultTagline='Lights · Music · Together';
const palette=(background,card,text,gold,lights)=>({home:background,music:lights,support:lights,info:gold,card,gold,text,secondary:text==='#fff2dc'?'#d2c5ad':'#d7c6df'});
export const presets={
 christmas:[{id:'fireside',name:'Fireside glow',colours:palette('#071710','#1b3429','#fff2dc','#edc581','#c8674d')},{id:'candlelight',name:'Candlelit cranberry',colours:palette('#29151c','#3b222b','#fff2dc','#e7c797','#db7472')},{id:'winter',name:'Winter evergreen',colours:palette('#10292d','#1c3b40','#fff2dc','#d5dcb7','#82b6ad')}],
 halloween:[{id:'haunted',name:'Haunted violet',colours:palette('#08050f','#261733','#f6edf9','#ffad62','#a37cff')},{id:'pumpkin',name:'Pumpkin lantern',colours:palette('#201016','#351e27','#f6edf9','#ffb36a','#c78dff')},{id:'spectral',name:'Spectral green',colours:palette('#101d1d','#203031','#f6edf9','#b5e986','#b195df')}]
};
presets.thanksgiving=[{id:'harvest',name:'Harvest glow',colours:{...palette('#18100d','#34241c','#fff3df','#f5c27b','#cc8046'),secondary:'#dcc7b1'}}];
presets['australia-day']=[{id:'green-gold',name:'Green & gold',colours:{...palette('#071b38','#063c26','#f4f8f9','#ffcd00','#00843d'),secondary:'#d0dfd5'}}];
for(const [theme,id,name] of [['us-patriotic','stars-stripes','Stars & stripes'],['valentines-day','cherry-chocolate','Cherry & chocolate']])presets[theme]=[{id,name,colours:{...themes[theme].colours}}];
export function cloneDefaults(theme='christmas'){
 const s=shared.cloneDefaults(theme);Object.assign(s,{colours:{...presets[theme][0].colours},colourPreset:presets[theme][0].id,headerTagline:defaultTagline,advancedColours:false,decorationMotion:true,decorations:true,countdown:false,halloweenCountdown:false,homeLiveSchedule:true,homeMusicLink:false,musicAbout:false,showMainGuidance:false,logoMode:'icon',nameFont:'current'});
 s.schedule=s.schedule.map((r,i)=>({...r,tile:i===0?'SUN–THU':i===1?'FRI–SAT':theme==='christmas'?'24–25':theme==='halloween'?'31':themes[theme].tile,caption:i<2?'WEEKLY':theme==='christmas'?'DEC':theme==='halloween'?'OCT':themes[theme].caption}));return s;
}
export function checkedSettings(input){
 const s=shared.checkedSettings({...input,showMainGuidance:input.showMainGuidance??false});
 s.headerTagline=input.headerTagline===undefined?defaultTagline:input.headerTagline;
 if(typeof s.headerTagline!=='string'||s.headerTagline.length>160||/[\u0000-\u001f]/.test(s.headerTagline))throw Error('Invalid header tagline.');
 for(const key of ['advancedColours','decorationMotion']){if(typeof input[key]!=='boolean')throw Error('Invalid '+key);s[key]=input[key];}
 if(!presets[s.theme].some(p=>p.id===input.colourPreset))throw Error('Choose a supported colour preset.');s.colourPreset=input.colourPreset;
 // Older Compact designs used decorations to hide the entire original header.
 if(input.headerArtwork===undefined&&!isNewSeason(s.theme)&&input.decorations===false)s.headerTopDecorations=false;
 s.schedule=s.schedule.map((r,i)=>{const row={...r};for(const key of ['tile','caption']){const value=input.schedule[i][key]??'';if(typeof value!=='string'||value.length>80||/[\u0000-\u001f]/.test(value))throw Error('Invalid schedule tile.');row[key]=value;}return row;});return s;
}
export const validate=shared.validate;
export function parseSettings(text,allowIncomplete=false){
 const f=JSON.parse(text);if(f?.version!==1||f.template!==compactId||!f.designs||Array.isArray(f.designs))throw Error('Unsupported Compact console backup.');
 if(!f.designs.christmas||!f.designs.halloween||Object.keys(f.designs).some(k=>!Object.hasOwn(presets,k)))throw Error('Unsupported seasonal designs in backup.');
 const designs={};for(const season of Object.keys(f.designs)){const s=checkedSettings(f.designs[season]);if(s.theme!==season)throw Error('The seasonal design does not match its saved slot.');if(!allowIncomplete&&Object.keys(validate(s)).length)throw Error('Complete the highlighted settings before export.');designs[season]=s;}return designs;
}
export const settingsFile=designs=>JSON.stringify({version:1,template:compactId,designs},null,2)+'\n';
const e=shared.escapeHTML;
function scheduleRows(s){return s.schedule.map(r=>r.tile.trim()?`<div class="cc-date-row"><div class="cc-date-tile"><small>${e(r.caption)}</small><strong>${e(r.tile)}</strong></div><div><strong class="cc-hours">${e(r.hours)}</strong><span class="cc-day">${e(r.day)}</span></div></div>`:`<div class="hours-row"><span>${e(r.day)}</span><strong>${e(r.hours)}</strong></div>`).join('');}
function extras(s){
 const colours=s.advancedColours?s.colours:presets[s.theme].find(p=>p.id===s.colourPreset).colours;
 const heading=themes[s.theme].defaultFont==='rounded'?'"LOS Nunito", Arial, sans-serif':s.theme==='halloween'?'"LOS Creepster", Georgia, serif':'"LOS Playfair Display", Georgia, serif';
 const body=s.theme==='halloween'?'Arial, sans-serif':'"LOS Nunito", Arial, sans-serif';
 const legs='<span class="cc-spider-leg"></span>'.repeat(4);
 const decor=isNewSeason(s.theme)||headerArtworkValue(s)!=='theme'?'':s.theme==='halloween'?`<div class="cc-web" aria-hidden="true"></div><div class="cc-hanger" aria-hidden="true">${legs}<div class="cc-spider-right">${legs}</div><span class="cc-spider-body"></span></div>`:`<div class="cc-lights" aria-hidden="true">${'<span></span>'.repeat(12)}</div><div class="cc-holly" aria-hidden="true"><span></span></div>`;
 return {COMPACT_TAGLINE:s.headerTagline.trim()?`<p class="cc-eyebrow">${e(s.headerTagline)}</p>`:'',GUIDANCE_CARD_STATUS:true,COMPACT_CLASSES:`cc-${s.theme}${s.decorations?' cc-decorated':''}${s.decorationMotion?' cc-motion':''}`,COMPACT_DECOR:decor,COMPACT_LOGO:s.logoMode==='symbol'?`<i class="cc-brand-icon [[ICON:brand:fa-solid ${themes[s.theme].icon}]]" aria-hidden="true"></i>`:s.logoMode==='seasonal'?`<img class="show-logo" src="${assetBase+logoFile(s)}" alt="${e(s.name)} logo">`:s.logoMode==='custom'&&s.logo?`<img class="show-logo" src="${e(s.logo)}" alt="${e(s.name)} logo">`:'',
 COMPACT_CSS:`${!s.showSupportTab?'body:has(#show-options.compact-console) .cc-menu{grid-template-columns:repeat(2,minmax(0,1fr))}':''}@font-face{font-family:"LOS Nunito";src:url("${assetBase}fonts/nunito.ttf") format("truetype");font-weight:100 900;font-display:swap}@font-face{font-family:"LOS Playfair Display";src:url("${assetBase}fonts/playfair-display.ttf") format("truetype");font-weight:400 900;font-display:swap}@font-face{font-family:"LOS Creepster";src:url("${assetBase}fonts/creepster.ttf") format("truetype");font-weight:400;font-display:swap}#show-options.compact-console{--cc-background:${colours.home};--cc-lights:${colours.music};--heading-font:${heading};--body-font:${body};--radius:${s.theme==='halloween'?'7px':'19px'};--panel:${colours.card};--gold:${colours.gold};--text:${colours.text};--text-secondary:${colours.secondary};--section-accent:${colours.gold}}`,
 SCHEDULE_ROWS:scheduleRows(s),SCHEDULE_FAQ:'<div class="cc-date-list">'+scheduleRows(s)+'</div>'};
}
function prepared(input,draft){
 let s=checkedSettings(input);if(!draft&&Object.keys(validate(s)).length)throw Error('Complete the highlighted settings before exporting.');
 if(draft){const clean=shared.renderDraft('',s).settings;s={...s,...clean,schedule:clean.schedule.map((r,i)=>({...s.schedule[i],...r}))};}
 if(!s.advancedColours)s.colours={...presets[s.theme].find(p=>p.id===s.colourPreset).colours};
 // Compact uses its own coordinated decoration. Other shared options retain their behaviour.
 return s;
}
export function render(source,input){const s=prepared(input,false);return shared.renderDocument(source,{...s,decorations:false},extras(s));}
export function renderDraft(source,input){const s=prepared(input,true);return {html:shared.renderDocument(source,{...s,decorations:false},extras(s)),settings:s};}

export function namePreview(s){const colours=s.advancedColours?s.colours:presets[s.theme].find(p=>p.id===s.colourPreset).colours;return {colours,background:colours.home,defaultFont:{...nameFonts.find(f=>f.id===(themes[s.theme].defaultFont||(s.theme==='halloween'?'spooky':'elegant'))),id:'compact-default-'+s.theme,weight:themes[s.theme].defaultFont?nameFonts.find(f=>f.id===themes[s.theme].defaultFont).weight:400}};}
