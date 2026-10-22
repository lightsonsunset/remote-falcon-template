import test from 'node:test';
import assert from 'node:assert/strict';
import {registry} from '../src/template-registry.js';
import {copyDefaults,copyFields} from '../src/copy.js';
import {parseCatalogue} from '../src/catalogue.js';
import {transferChoices,applyTransfer,coveredTransferSettings,transferPolicy,excludedTransferSettings} from '../src/reuse-policy.js';
const flat=groups=>groups.flatMap(g=>g.items);
const chosen=groups=>flat(groups).filter(i=>i.selected).map(i=>i.id);
const choices=(t,s,d=t.cloneDefaults('halloween'),options={})=>transferChoices(s,t,d,t,options);

test('every saved setting has one transfer policy, alias policy or explicit theme ownership',()=>{
 const keys=[...Object.values(transferPolicy).flatMap(p=>p.keys),...Object.keys(excludedTransferSettings)];assert.equal(keys.length,new Set(keys).size);
 for(const t of registry)for(const theme of Object.keys(t.themes))assert.deepEqual(Object.keys(t.checkedSettings(t.cloneDefaults(theme))).filter(k=>!coveredTransferSettings().has(k)),[]);
});
test('untouched designs produce no transfer choices across all templates and seasons',()=>{
 for(const source of registry)for(const target of registry)for(const a of Object.keys(source.themes))for(const b of Object.keys(target.themes))assert.deepEqual(transferChoices(source.checkedSettings(source.cloneDefaults(a)),source,target.cloneDefaults(b),target),[]);
});
test('selected customisation transfers are granular and never import untouched seasonal copy or icons',()=>{
 for(const t of registry){const s=t.cloneDefaults(),d=t.cloneDefaults('halloween');s.name='Example Lane';s.showMenuLabels=false;s.showSongArtists=false;s.icons.navMusic='headphones';s.copy.NAV_MUSIC='Songs';s.copy.SUCCESS_TITLE='Excellent taste, human!';s.copy.FAILED_TITLE=copyDefaults(s.theme).FAILED_TITLE;s.welcome='';s.faq.pop();s.newNames='A song';s.dates='December';s.colours.card='#123456';if(t.features.colourPresets)s.advancedColours=true;
  const g=choices(t,s,d),ids=chosen(g);for(const key of ['name','showMenuLabels','showSongArtists','icons.navMusic','copy.NAV_MUSIC','copy.SUCCESS_TITLE','welcome','faq'])assert(ids.includes(key));for(const key of ['newNames','dates','colours.card','copy.FAILED_TITLE'])assert(!ids.includes(key));
  const {settings:n}=applyTransfer(d,t,g,ids.filter(k=>k!=='welcome'));assert.equal(n.name,s.name);assert.equal(n.showMenuLabels,false);assert.equal(n.copy.SUCCESS_TITLE,s.copy.SUCCESS_TITLE);assert.equal(n.copy.NAV_MUSIC,'Songs');assert(!Object.hasOwn(n.copy,'FAILED_TITLE'));assert.deepEqual(n.icons,{navMusic:'headphones'});assert.equal(n.welcome,d.welcome);assert.deepEqual(n.faq,s.faq);assert.deepEqual(n.colours,d.colours);assert.equal(n.newNames,'');assert.equal(n.theme,'halloween');assert.equal(s.theme,'christmas');
 }
});
test('every edited wording field is independently selectable; unchanged overrides are not suggestions',()=>{
 for(const t of registry){const s=t.cloneDefaults();for(const [key] of copyFields)s.copy[key]='Edited text';const groups=choices(t,s);for(const [key] of copyFields){if(key==='NAV_HOME'&&t.landing==='music')continue;assert(flat(groups).some(i=>i.id==='copy.'+key));const next=applyTransfer(t.cloneDefaults('halloween'),t,groups,['copy.'+key]).settings;assert.deepEqual(next.copy,{[key]:'Edited text'});}
  s.copy=copyDefaults('christmas');assert(!flat(choices(t,s)).some(i=>i.id.startsWith('copy.')));
 }
});
test('cleared text, deleted lists, changed order and display preferences remain deliberate choices',()=>{
 for(const t of registry){const s=t.cloneDefaults();s.welcome='';s.faq=[];s.resources.reverse();s.headerTopDecorations=false;s.showSupportTab=false;s.songArtwork='none';s.showNowPlayingArtwork=false;const g=choices(t,s),n=applyTransfer(t.cloneDefaults('halloween'),t,g,chosen(g)).settings;assert.equal(n.welcome,'');assert.deepEqual(n.faq,[]);assert.deepEqual(n.resources,s.resources);assert.equal(n.headerTopDecorations,false);assert.equal(n.showSupportTab,false);assert.equal(n.songArtwork,'none');assert.equal(n.showNowPlayingArtwork,false);}
});
test('legacy artwork aliases and equivalent explicit defaults do not cause false changes',()=>{
 for(const t of registry){const s=t.cloneDefaults();s.songArtwork='album';s.showNowPlayingArtwork=true;assert.deepEqual(choices(t,s),[]);s.showAlbumArtwork=false;s.songArtwork=null;s.showNowPlayingArtwork=null;assert.deepEqual(flat(choices(t,s)).map(i=>i.id),['songArtwork','showNowPlayingArtwork']);}
});
test('header choices map by capability, preserve no-logo and keep own logo independent of name',()=>{
 for(const source of registry)for(const target of registry){const s=source.cloneDefaults();Object.assign(s,{name:'Personal name',logoMode:'custom',logo:'https://example.org/own.png'});const d=target.cloneDefaults('halloween'),g=transferChoices(s,source,d,target),n=applyTransfer(d,target,g,['logoMode','logo']).settings;assert.equal(n.logoMode,'custom');assert.equal(n.logo,s.logo);assert.equal(n.name,d.name);assert.equal(n.welcome,d.welcome);
  s.logoMode='none';const none=transferChoices(s,source,d,target);assert.equal(applyTransfer(d,target,none,['logoMode']).settings.logoMode,'none');
 }
 const compact=registry[1],original=registry[0],s=compact.cloneDefaults();s.logoMode='symbol';const d=original.cloneDefaults('halloween'),g=transferChoices(s,compact,d,original);assert.equal(applyTransfer(d,original,g,['logoMode']).settings.logoMode,'icon');
});
test('category settings and catalogues require opt-in and copy without mutating the source',()=>{
 for(const t of registry){const s=t.cloneDefaults();Object.assign(s,{categories:true,categoryNames:['Personal'],hiddenCategories:['Personal'],categoryIcons:{Personal:'cat'},newNames:'One',movingHeadNames:'One'});const cat=parseCatalogue('name,displayName,artist,group,imageUrl,category\nOne,One,,,,Personal','unit.csv'),d=t.cloneDefaults('halloween'),g=choices(t,s,d,{catalogue:cat});assert(flat(g).filter(i=>['categorySetup','catalogue','newNames','movingHeadNames'].includes(i.id)).every(i=>!i.selected));const result=applyTransfer(d,t,g,['categorySetup','catalogue']);assert.deepEqual(result.settings.categoryIcons,{Personal:'cat'});assert.deepEqual(result.settings.categoryNames,['Personal']);assert.equal(result.settings.newNames,'');assert.deepEqual(result.options.catalogue,cat);result.options.catalogue.songs[0].name='Changed';assert.equal(cat.songs[0].name,'One');assert.deepEqual(applyTransfer(d,t,g,[]).options,{});}
});
test('colour choices keep the target palette and apply only selected overrides, including presets',()=>{
 for(const source of registry)for(const target of registry){const s=source.cloneDefaults(),d=target.cloneDefaults('halloween');s.colours.card='#123456';s.colours.gold='#abcdef';s.customNameColour=true;s.nameColour='#334455';if(source.features.colourPresets)s.advancedColours=true;const g=transferChoices(s,source,d,target);assert(flat(g).filter(i=>i.group==='colours').every(i=>!i.selected));const n=applyTransfer(d,target,g,['colours.card']).settings;assert.equal(n.colours.card,s.colours.card);assert.equal(n.colours.gold,d.colours.gold);assert.equal(n.customNameColour,false);if(target.features.colourPresets)assert.equal(n.advancedColours,true);}
 const t=registry[1],s=t.cloneDefaults();s.colourPreset='candlelight';assert(flat(choices(t,s)).some(i=>i.id.startsWith('colours.')));
 const source=registry[0].cloneDefaults('halloween');source.colours.card='#123456';const g=transferChoices(source,registry[0],s,t,{existing:true}),n=applyTransfer(s,t,g,['colours.card']).settings;
 assert.deepEqual(n.colours,{...t.namePreview(s).colours,card:'#123456'});
});
test('later reuse shows differing source customisations with no replacements preselected',()=>{
 for(const t of registry){const s=t.cloneDefaults(),d=t.cloneDefaults('halloween');s.welcome='Personal welcome';s.copy.SUCCESS_TITLE='Personal humour';s.faq=[];d.welcome='Halloween edit';d.faq=[];const g=choices(t,s,d,{existing:true});assert.deepEqual(chosen(g),[]);assert(!flat(g).some(i=>i.id==='faq'));const n=applyTransfer(d,t,g,['copy.SUCCESS_TITLE']).settings;assert.equal(n.welcome,d.welcome);assert.equal(n.copy.SUCCESS_TITLE,s.copy.SUCCESS_TITLE);assert.deepEqual(n.faq,[]);}
});
