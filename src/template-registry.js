// A template supplies presentation and settings policy; the editor owns shared services.
import * as festive from './template.js';
import * as compact from './compact-console.js';
import {editorGroups} from './editor-layout.js';
import {fontPackageFiles} from './name-style.js';
import {allArtworkFiles} from './assets.js';
const {registry:legacyRegistry,...festiveAdapter}=festive;
const common={history:true,identity:true,listening:true,schedule:true,catalogue:true,support:true,info:true,messages:true,preview:true};
const compactGroups={music:{name:'Music',panel:'music',sections:[11,13,20,7,26,21,30,6,18,22,23,24,15]},info:{name:'Info',panel:'info',sections:[17,8,19,25,27,28,10,29]},support:editorGroups.support,setup:editorGroups.setup,messages:editorGroups.messages};
export const registry=[
 {id:'festive',name:'Lights on Sunset',description:'A welcoming Home page, separate Music, Info and Support, and a floating seasonal menu.',source:'templates/christmas.html',separateSeasons:false,storageKey:'rf-template-builder:show:v1',catalogueKey:'rf-template-builder:catalogue:v1',groups:editorGroups,landing:'home',features:{...common,includedArtwork:true,headerIconMode:'icon',extraInformationPage:'Home',guidanceInfo:false,seasonalNavbar:true},...festiveAdapter,assets:[...allArtworkFiles,...fontPackageFiles],downloads:{christmas:'Festive RF Template.html',halloween:'Halloween RF Template.html'},package:'Festive-RF-Template.zip'},
 {id:'compact-console',name:'Compact console',description:'Music first, with a compact player, date tiles and cosy Christmas or spooky Halloween details.',source:'templates/compact-console.html',separateSeasons:true,storageKey:'rf-template-builder:compact-console:v1',catalogueKey:'rf-template-builder:catalogue:compact-console:v1',groups:compactGroups,landing:'music',features:{...common,includedArtwork:false,headerIconMode:'symbol',headerTagline:true,homeMusicLink:false,extraInformationPage:'Info',guidanceInfo:true,seasonalNavbar:false,colourPresets:true,dateTiles:true,decorationMotion:true},...compact,themes:festive.themes,assets:fontPackageFiles,downloads:{christmas:'Compact Console Christmas.html',halloween:'Compact Console Halloween.html'},package:'Compact-Console.zip'}
];
export function templateById(id){const t=registry.find(t=>t.id===id);if(!t)throw Error('Unknown template. Your saved designs have not changed.');return t;}
export const designKey=(t,season)=>t.separateSeasons?t.id+':'+season:t.id;
export function parseBackup(text){if(text.length>1000000)throw Error('That settings file is too large.');let f;try{f=JSON.parse(text);}catch{throw Error('Choose a valid settings JSON file.');}const t=templateById(f.template==='christmas'?'festive':f.template);const value=t.parseSettings(text,true);return {template:t.id,designs:t.separateSeasons?value:{shared:value}};}
