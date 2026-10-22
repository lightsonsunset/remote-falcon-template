// Editor-only transfer policy. Compare with the SOURCE theme, never the destination.
// Every saved setting has an explicit policy, including aliases and theme-owned values.
import {copyFields,copyDefaults,messageCopyGroups} from './copy.js';
import {iconRoles,defaultIcon,availableIconRoles,iconLibrary} from './icons.js';
import {songArtworkMode,nowPlayingArtwork} from './song-artwork.js';
import {headerArtworkValue,setHeaderArtwork} from './header-artwork.js';
import {logoChoices} from './assets.js';
import {colourOverrides,fingerprint} from './reusable-details.js';

export const transferGroups={
 identity:'Header, logo & show name',display:'Navigation & display',listening:'Listening & visitor guidance',
 social:'Social links',information:'FAQs & extra information',support:'Support information',
 messages:'Messages & wording',season:'Dates & song selections',colours:'Custom colours'
};
const sections={
 identity:{headerArtwork:'Header artwork',name:'Show name',showNameOnHome:'Show name in the header',logoMode:'Logo',logo:'Own logo link',logoStyle:'Included logo style',combineLogoName:'Combine logo and show name',nameFont:'Show-name font'},
 display:{showMenuLabels:'Show navigation labels',showSupportTab:'Show Support in navigation',songArtwork:'Song-list artwork',showNowPlayingArtwork:'Now playing artwork',showSongArtists:'Show artists in song choices',showQueueArtists:'Show artists in the player and queue',onAirPulse:'Pulse the On air indicator',decorations:'Navigation decorations',headerBottomDecorations:'Lower header artwork',navbarDetails:'Seasonal navigation details',seasonalMotion:'Seasonal motion',decorationMotion:'Compact decoration motion',homeLiveSchedule:'Show dates and hours on the main page',homeMusicLink:'Show the Music link on Home',musicAbout:'Show the Info link on Music',musicFM:'FM reminder on Music',queueCount:'Show queue count',showQueueLimit:'Show queue limit',votesRemaining:'Show remaining votes',movingHeadAnimation:'Animate moving-head badges',uncategorisedIcon:'Icon for uncategorised songs',newFilter:'Show the New this year filter'},
 listening:{fm:'Show FM frequency',frequency:'FM frequency',pulsemesh:'Offer PulseMesh',pulsemeshButtons:'PulseMesh buttons',pulsemeshUrl:'PulseMesh link',listening:'Listening instructions',neighbourTitle:'Visitor guidance heading',neighbourText:'Visitor guidance message',showMainGuidance:'Show guidance on the main screen',guidancePosition:'Guidance position'},
 social:{socialMain:'Social links on the main page',socialInfo:'Social links on Info',socialTitle:'Social heading',socialText:'Social introduction',socials:'Social links',youtube:'Show YouTube button',youtubeLabel:'YouTube button label',youtubeUrl:'YouTube link'},
 information:{faq:'FAQ list',homeCard:'Show extra information',homeCardTitle:'First information card heading',homeCardText:'First information card message',homeCardImage:'First information card image',homeCardLink:'First information card link',homeCardLinkLabel:'First information card button',extraInfoCards:'Additional information cards',playlistMusic:'Show playlists on Music',playlistInfo:'Show playlists on Info',playlistTitle:'Playlist heading',playlistText:'Playlist introduction',playlistQuestion:'Playlist FAQ question',playlistFAQText:'Playlist FAQ answer',playlists:'Playlist links',showPreview:'Show off-air video',showPreviewTitle:'Video heading',showPreviewText:'Video introduction',showPreviewUrl:'Video link',showPreviewButton:'Video button label',quickFacts:'Show quick facts',factsTitle:'Quick facts heading',facts:'Quick facts',resourcesEnabled:'Show resources',resourcesTitle:'Resources heading',resourcesText:'Resources introduction',resources:'Resource links'},
 support:{donations:'Show support cards',charity:'First support card name',donationText:'First support card description',donationUrl:'First support card link',donationImage:'First support card image',donationHome:'Support on the main page',donationInfo:'Support on Info',donationRecipients:'Additional support cards'},
 messages:{welcome:'Welcome message',headerTagline:'Header tagline',notice:'Show announcement',noticeTitle:'Announcement heading',noticeText:'Announcement message'},
 season:{dates:'Show dates',schedule:'Hours and holiday rows',categorySetup:'Category filters & artwork',newNames:'Songs marked NEW',movingHeadNames:'Songs marked Moving heads',countdown:'Christmas countdown',halloweenCountdown:'Halloween countdown',countdownFormat:'Christmas countdown format',halloweenCountdownFormat:'Halloween countdown format',christmasDecoration:'Christmas navbar ornament',halloweenDecoration:'Halloween navbar ornament'},
 colours:{nameColourChoice:'Custom show-name colour'}
};
const bundles={headerArtwork:['headerArtwork','headerTopDecorations'],categorySetup:['categories','categoryNames','hiddenCategories','categoryIcons'],nameColourChoice:['customNameColour','nameColour']};
export const transferPolicy=Object.fromEntries(Object.entries(sections).flatMap(([group,fields])=>Object.entries(fields).map(([id,label])=>[id,{id,label,group,keys:bundles[id]||[id]}])));
// Retained for old backups, or applied through a resolved field above. Never copy IDs/preset IDs.
export const excludedTransferSettings={theme:'Destination identity',headerDecorations:'Legacy upper/lower artwork fallback',flagPlacement:'Retired decoration choice',showAlbumArtwork:'Resolved into the two artwork choices',colours:'Effective colour overrides',colourPreset:'Resolved into effective colour overrides',advancedColours:'Set when applying colours',copy:'Compared one wording override at a time',icons:'Compared one supported icon at a time'};
export function coveredTransferSettings(){return new Set([...Object.keys(excludedTransferSettings),...Object.values(transferPolicy).flatMap(p=>p.keys)]);}
const clone=value=>structuredClone(value);
const equal=(a,b)=>fingerprint(a)===fingerprint(b);
const read=(s,id)=>id==='headerArtwork'?headerArtworkValue(s):id==='songArtwork'?songArtworkMode(s):id==='showNowPlayingArtwork'?nowPlayingArtwork(s):bundles[id]?Object.fromEntries(bundles[id].map(k=>[k,s[k]])):s[id];
const modes={none:'No logo',icon:'Simple seasonal icon',symbol:'Icon above show name',seasonal:'Included seasonal picture',custom:'My own logo'};
const messageLabels=Object.fromEntries(messageCopyGroups.flatMap(([group,fields])=>fields.map(([key,label])=>[key,group+' - '+label.toLowerCase()])));
const enumLabels={headerArtwork:{theme:'Theme default',none:'No header artwork',classic:'First included picture',lights:'Second included picture',crest:'Third included picture'},nameFont:{current:'Theme default',rounded:'Rounded',elegant:'Elegant',festive:'Festive',spooky:'Spooky'},songArtwork:{album:'Album artwork',category:'Category icons',none:'No artwork'},guidancePosition:{'above-header':'Above the header','below-header':'Below the header',status:'Below On air'},pulsemeshButtons:{download:'Download app',listen:'Listen to this show',both:'Download and listen'}};
export function transferValue(item,value){
 if(value===undefined)return 'Not available';
 if(item.artworkLabels)return value===item.value?item.artworkLabels.incoming:item.artworkLabels.current;
 if(item.id==='logoMode')return value==='icon'&&item.compactHeader?'Styled show name':modes[value]||value;
 if(item.id==='catalogue')return value?`${value.filename} (${value.songs.length} songs)`:'No imported catalogue';
 if(item.id.startsWith('icons.')||item.id==='uncategorisedIcon')return iconLibrary[value]?.[0]||'Theme default';
 if(enumLabels[item.id])return enumLabels[item.id][value]||String(value);
 if(typeof value==='boolean')return value?'On':'Off';
 if(value==='')return 'Empty (cleared)';
 if(item.id==='faq')return value.length?value.map((row,i)=>`${i+1}. ${row.question}\n${row.answer||({schedule:'Uses this design’s dates and hours',listening:'Uses this design’s listening details'})[row.kind]||'Empty answer'}${row.linkUrl?'\n'+(row.linkLabel||'Link')+': '+row.linkUrl:''}`).join('\n\n'):'Empty list';
 if(Array.isArray(value))return value.length?value.map((row,i)=>typeof row==='string'?row:`${i+1}. `+Object.values(row).filter(v=>v!==''&&v!==false).map(v=>typeof v==='object'?JSON.stringify(v):v).join(' · ')).join('\n'):'Empty list';
 if(value&&typeof value==='object')return Object.entries(value).map(([key,v])=>`${sections.season[key]||sections.colours[key]||({categories:'Filters enabled',categoryNames:'Category names',hiddenCategories:'Hidden categories',categoryIcons:'Category icons',customNameColour:'Use custom colour',nameColour:'Colour'})[key]||key}: ${typeof v==='object'?JSON.stringify(v):v}`).join('\n');
 return String(value);
}
function supported(p,source,target,destination){
 if(p.keys.some(key=>!(key in destination)))return false;
 if(p.id==='combineLogoName'&&target.features.combineLogoName===false)return false;
 if(['logoStyle','combineLogoName'].includes(p.id)&&!target.features.includedArtwork)return false;
 if(p.id==='logoMode'&&source.logoMode==='seasonal'&&!target.features.includedArtwork)return false;
 if(['christmasDecoration','countdown','countdownFormat'].includes(p.id)&&destination.theme!=='christmas')return false;
 if(['halloweenDecoration','halloweenCountdown','halloweenCountdownFormat'].includes(p.id)&&destination.theme!=='halloween')return false;
 if(p.id==='homeMusicLink'&&target.features.homeMusicLink===false)return false;
 return true;
}
function project(item,sourceTemplate,target){
 if(item.id==='logoMode'){
  item.compactHeader=target.features.headerIconMode==='symbol';
  if(item.value===sourceTemplate.features.headerIconMode)item.value=target.features.headerIconMode;
  else if(item.value==='icon'&&sourceTemplate.features.headerIconMode==='symbol')item.value='none';
 }
 // Compact date-tile captions are layout-specific, and are not guessed on reuse.
 if(item.id==='schedule')item.value=item.value.map(row=>target.features.dateTiles?{...row,tile:row.tile||'',caption:row.caption||''}:Object.fromEntries(Object.entries(row).filter(([k])=>!['tile','caption'].includes(k))));
 return item;
}

export function transferChoices(source,sourceTemplate,destination,target,{catalogue=null,destinationCatalogue=null,existing=false}={}){
 const defaults=sourceTemplate.checkedSettings(sourceTemplate.cloneDefaults(source.theme));
 const items=[];
 function add(item){
  if(existing&&equal(item.value,item.current))return;
  item.selected=!existing&&!['season','colours'].includes(item.group);
  items.push(item);
 }
 for(const p of Object.values(transferPolicy)){
  if(!supported(p,source,target,destination))continue;
  const value=read(source,p.id);if(value===undefined||equal(value,read(defaults,p.id)))continue;
  if(p.id==='nameColourChoice'&&!source.customNameColour)continue;
  const item=project({...p,value:clone(value),current:clone(read(destination,p.id))},sourceTemplate,target);
  if(['headerArtwork','logoStyle'].includes(p.id)){
   const label=(theme,choice)=>logoChoices[theme].find(c=>c.id===choice)?.label||({theme:'Theme default',none:'No header artwork'})[choice];
   const from=label(source.theme,item.value),to=label(destination.theme,item.value);
   item.artworkLabels={incoming:from===to?from:from+' → '+to+' (destination theme)',current:label(destination.theme,item.current)};
  }
  add(item);
 }
 const wording=copyDefaults(source.theme),targetWording=copyDefaults(destination.theme);
 for(const [key,label] of copyFields){
  if(!Object.hasOwn(source.copy,key)||source.copy[key]===wording[key])continue;
  if(key==='NAV_HOME'&&target.landing==='music')continue;
  add({id:'copy.'+key,label:messageLabels[key]||label,group:key.startsWith('NAV_')?'display':'messages',keys:['copy'],value:source.copy[key],current:destination.copy[key]??targetWording[key]});
 }
 const allowedIcons=new Set(availableIconRoles(target.id==='compact-console').map(([key])=>key));
 for(const [key,value] of Object.entries(source.icons)){
  if(!allowedIcons.has(key)||value===defaultIcon(key,source,sourceTemplate.id==='compact-console'))continue;
  const label=iconRoles[key][0];
  add({id:'icons.'+key,label:/\bicon$/i.test(label)?label:label+' icon',group:key==='brand'?'identity':iconRoles[key][2]==='Request messages'?'messages':'display',keys:['icons'],value,current:destination.icons[key]??defaultIcon(key,destination,target.id==='compact-console')});
 }
 const actualColours=target.namePreview?.(destination)?.colours||destination.colours;
 for(const [key,value] of Object.entries(colourOverrides(sourceTemplate,source)))add({id:'colours.'+key,label:({home:'Background / Home',music:'Music accent',support:'Support accent',info:'Info accent',card:'Card surface',gold:'Main accent',text:'Primary text',secondary:'Secondary text'})[key],group:'colours',keys:['colours'],value,current:actualColours[key]});
 if(catalogue)add({id:'catalogue',label:'Imported song catalogue',group:'season',keys:[],value:clone(catalogue),current:clone(destinationCatalogue)});
 return Object.entries(transferGroups).map(([id,label])=>({id,label,items:items.filter(item=>item.group===id)})).filter(g=>g.items.length);
}

export function applyTransfer(destination,target,groups,selected){
 const next=clone(destination),options={},ids=new Set(selected);
 for(const item of groups.flatMap(g=>g.items).filter(item=>ids.has(item.id))){
  if(item.id==='catalogue'){options.catalogue=clone(item.value);continue;}
  if(item.id.includes('.')){const [key,part]=item.id.split('.');if(key==='colours'&&target.features.colourPresets&&!next.advancedColours){next.colours=clone(target.namePreview(next).colours);next.advancedColours=true;}next[key][part]=clone(item.value);}
  else if(item.id==='headerArtwork')setHeaderArtwork(next,item.value);
  else if(bundles[item.id])Object.assign(next,clone(item.value));
  else next[item.id]=clone(item.value);
 }
 return {settings:target.checkedSettings(next),options};
}
