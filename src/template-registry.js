// A template supplies presentation and settings policy; the editor owns shared services.
import * as festive from './template.js';
import * as compact from './compact-console.js';
import {editorGroups,createEditorGroups} from './editor-layout.js';
import {fontPackageFiles} from './name-style.js';
import {seasonalAssetFiles} from './seasonal-style.js';
import {allArtworkFiles} from './assets.js';
const {registry:legacyRegistry,...festiveAdapter}=festive;
const common={history:true,identity:true,listening:true,schedule:true,catalogue:true,support:true,info:true,messages:true,preview:true};
const compactGroups=createEditorGroups({landing:'music',extraInformationPage:'Info',guidanceInfo:true,playlistPage:'info'});
export const registry=[
 {id:'festive',name:'Lights on Sunset',description:'A welcoming Home page, separate Music, Info and Support, and a floating seasonal menu.',source:'templates/christmas.html',separateSeasons:false,storageKey:'rf-template-builder:show:v1',catalogueKey:'rf-template-builder:catalogue:v1',groups:editorGroups,landing:'home',features:{...common,includedArtwork:true,headerIconMode:'icon',extraInformationPage:'Home',guidanceInfo:false,liveSchedule:true,seasonalNavbar:true},...festiveAdapter,assets:[...new Set([...allArtworkFiles,...seasonalAssetFiles,...fontPackageFiles])],downloads:{christmas:'Festive RF Template.html',halloween:'Halloween RF Template.html',thanksgiving:'Thanksgiving RF Template.html','australia-day':'Australia Day RF Template.html','us-patriotic':'US Patriotic RF Template.html','valentines-day':'Valentines Day RF Template.html'},package:'Festive-RF-Template.zip'},
 {id:'compact-console',name:'Compact console',description:'Music first, with a compact player, date tiles and seasonal artwork.',source:'templates/compact-console.html',separateSeasons:true,storageKey:'rf-template-builder:compact-console:v1',catalogueKey:'rf-template-builder:catalogue:compact-console:v1',groups:compactGroups,landing:'music',features:{...common,includedArtwork:true,combineLogoName:false,headerIconMode:'symbol',headerTagline:true,homeMusicLink:false,extraInformationPage:'Info',guidanceInfo:true,liveSchedule:false,seasonalNavbar:false,colourPresets:true,dateTiles:true,decorationMotion:true},...compact,themes:festive.themes,assets:[...new Set([...allArtworkFiles,...fontPackageFiles,...seasonalAssetFiles])],downloads:{christmas:'Compact Console Christmas.html',halloween:'Compact Console Halloween.html',thanksgiving:'Compact Console Thanksgiving.html','australia-day':'Compact Console Australia Day.html','us-patriotic':'Compact Console US Patriotic.html','valentines-day':'Compact Console Valentines Day.html'},package:'Compact-Console.zip'}
];
export function templateById(id){const t=registry.find(t=>t.id===id);if(!t)throw Error('Unknown template. Your saved designs have not changed.');return t;}
export const designKey=(t,season)=>t.id+':'+season;
// separateSeasons describes the legacy adapter backup format; all editor designs now save by theme.
export function parseBackup(text){
 if(text.length>1000000)throw Error('That settings file is too large.');let f;try{f=JSON.parse(text);}catch{throw Error('Choose a valid settings JSON file.');}
 const t=templateById(f?.template==='christmas'?'festive':f?.template);
 if(f.format==='seasonal-designs'){
  if(f.version!==1||!f.designs||typeof f.designs!=='object'||Array.isArray(f.designs)||!Object.keys(f.designs).length)throw Error('Unsupported seasonal settings backup.');
  const designs={};for(const [season,input] of Object.entries(f.designs)){if(!Object.hasOwn(t.themes,season))throw Error('Unknown theme in settings backup.');const s=t.checkedSettings(input);if(s.theme!==season)throw Error('The design does not match its theme.');designs[season]=s;}
  return {template:t.id,designs,reuse:f.reuse||{},seasonal:true};
 }
 const value=t.parseSettings(text,true);return {template:t.id,designs:t.separateSeasons?value:{[value.theme]:value},reuse:{},seasonal:false};
}
