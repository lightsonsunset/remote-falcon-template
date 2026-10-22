// Editor-only carry-over choices. Seasonal content is deliberately opt-in or left behind.
import {isHTTPS} from './shared-settings.js';
export const reuseGroups={
 showName:{label:'Show name',description:'Your show name and whether it is shown. Welcome text stays seasonal.',fields:{name:'Show name',showNameOnHome:'Show name in the header'}},
 logo:{label:'My own logo',description:'Your own logo image. The new theme keeps its seasonal decorations.',fields:{logo:'Logo image link'}},
 listening:{label:'Listening details',description:'FM frequency, PulseMesh and listening instructions.',fields:{fm:'Show FM frequency',frequency:'FM frequency',pulsemesh:'Offer PulseMesh',pulsemeshButtons:'PulseMesh buttons',pulsemeshUrl:'PulseMesh link',listening:'Listening instructions'}},
 socials:{label:'Social links',description:'Your links and where to show them. Seasonal headings stay unchanged.',fields:{socialMain:'Social links on the main page',socialInfo:'Social links on Info',socials:'Social links',youtube:'YouTube button',youtubeLabel:'YouTube button label',youtubeUrl:'YouTube link'}},
 guidance:{label:'Visitor guidance',description:'Neighbour message, on-air visibility and position.',fields:{neighbourTitle:'Visitor guidance heading',neighbourText:'Visitor guidance message',showMainGuidance:'Main-screen visitor guidance',guidancePosition:'Visitor guidance position'}},
 support:{label:'Support information',description:'Chosen causes, descriptions, links and support visibility.',fields:{donations:'Support cards enabled',charity:'Support card name',donationText:'Support card description',donationUrl:'Support link',donationImage:'Support image',donationHome:'Support on the main page',donationInfo:'Support on Info',donationRecipients:'Additional support cards',showSupportTab:'Support menu button'}}
};
export const reusableFields=Object.assign({},...Object.values(reuseGroups).map(g=>g.fields));
export const groupFields=groups=>[...new Set(groups.flatMap(g=>Object.keys(reuseGroups[g]?.fields||{})))];
export const hasReusableLogo=source=>source?.logoMode==='custom'&&isHTTPS(source.logo);
export function reuseChoices(source,template){return Object.entries(reuseGroups).filter(([key])=>key!=='logo'||hasReusableLogo(source)).map(([key,group])=>({key,...group,selected:key==='showName'?!!source?.name.trim()&&source.name!==template.cloneDefaults(source.theme).name:key!=='support'}));}
const clone=x=>structuredClone(x);
export const fieldValue=(settings,key)=>settings[key];
export function carryDetails(source,destination,groups,template){const next=clone(destination),selected=groups.filter(g=>g!=='logo'||hasReusableLogo(source));for(const key of groupFields(selected))next[key]=clone(source[key]);if(selected.includes('logo'))next.logoMode='custom';return template.checkedSettings(next);}
const stable=value=>value&&typeof value==='object'?(Array.isArray(value)?value.map(stable):Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]))):value;
// A comparison fingerprint, not a security token. Keeps linkage metadata small and content-free.
export function fingerprint(value){let hash=14695981039346656037n;for(const character of JSON.stringify(stable(value))??'undefined'){hash^=BigInt(character.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return hash.toString(16).padStart(16,'0');}
export function colourOverrides(template,settings){const defaults=template.cloneDefaults(settings.theme).colours,actual=template.namePreview?.(settings)?.colours||settings.colours;return Object.fromEntries(Object.entries(actual).filter(([key,value])=>value.toLowerCase()!==defaults[key].toLowerCase()));}
export function carryColours(sourceTemplate,source,destinationTemplate,destination){const overrides=colourOverrides(sourceTemplate,source),next=clone(destination);Object.assign(next.colours,overrides);if(destinationTemplate.features.colourPresets&&Object.keys(overrides).length)next.advancedColours=true;return destinationTemplate.checkedSettings(next);}
export function describeValue(value){if(value===undefined||value===null||value==='')return 'Not set';if(typeof value==='boolean')return value?'On':'Off';if(Array.isArray(value))return value.length?value.map(row=>typeof row==='string'?row:Object.entries(row).filter(([,v])=>v!==''&&v!==false).map(([k,v])=>k+': '+v).join(' · ')).join('\n'):'None';return String(value);}
