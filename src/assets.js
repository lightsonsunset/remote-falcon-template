// Public asset URLs are shared by exports. Preview serves these same files locally.
export const assetBase='https://lightsonsunset.github.io/remote-falcon-template/assets/';
export const artwork={christmas:{logo:'christmas-header.webp',detail:'santa-hat.webp'},halloween:{logo:'halloween-header.webp',detail:'spider.webp'}};
export const logoChoices={
 christmas:[{id:'classic',label:'Santa & friends',file:'christmas-header.webp'},{id:'lights',label:'Pixel trees & light arches',file:'christmas-lights-logo.webp'},{id:'crest',label:'Starlight garland',file:'christmas-wreath-logo.webp'}],
 halloween:[{id:'classic',label:'Halloween friends',file:'halloween-header.webp'},{id:'lights',label:'Haunted light show',file:'halloween-lights-logo.webp'},{id:'crest',label:'Moonlight & pumpkins',file:'halloween-moon-logo.webp'}]
};
export const decorationChoices={
 christmas:[{id:'default',label:'Santa hat',file:'santa-hat.webp'},{id:'holly',label:'Holly & berries',file:'nav-holly.webp'},{id:'bells',label:'Christmas bells',file:'nav-bells.webp'},{id:'tree',label:'Christmas tree',file:'nav-tree.webp'}],
 halloween:[{id:'default',label:'Hanging spider',file:'spider.webp'},{id:'pumpkin',label:'Glowing pumpkin',file:'nav-pumpkin.webp'},{id:'bat',label:'Friendly bat',file:'nav-bat.webp'}]
};
for(const theme of ['thanksgiving','australia-day']){
 logoChoices[theme]=['classic','lights','crest'].map((id,i)=>({id,label:(theme==='thanksgiving'?['Harvest gathering','Amber light garland','Harvest wreath']:['Aussie summer','Flag bunting','Southern stars crest'])[i],file:'seasonal/'+theme+'-'+(id==='lights'?'lights-logo':id)+'.webp'}));
 decorationChoices[theme]=[{id:'default',label:theme==='thanksgiving'?'Autumn leaf':'Southern Cross',file:'seasonal/'+(theme==='thanksgiving'?'autumn-leaf':'southern-cross')+'.svg'}];
}
export const logoFile=s=>logoChoices[s.theme].find(c=>c.id===s.logoStyle).file;
export const decorationFile=s=>decorationChoices[s.theme].find(c=>c.id===(s[s.theme+'Decoration']||'default')).file;
export const allArtworkFiles=[...new Set([...Object.values(logoChoices),...Object.values(decorationChoices)].flat().map(c=>c.file))];
export const assetURL=(theme,kind)=>assetBase+artwork[theme][kind];
