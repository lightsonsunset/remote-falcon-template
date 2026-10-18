import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {songArtworkMode,nowPlayingArtwork,categoryIcon,renameCategoryArtwork,artworkCSS} from '../src/song-artwork.js';
import {iconLibrary,iconGlyphs} from '../src/icons.js';
import {applyCategories} from '../src/category-settings.js';
import {copyDetails} from '../src/design-store.js';
import {createSetupDraft} from '../src/setup-model.js';
import {createHistoryBank} from '../src/history.js';
const sources=Object.fromEntries(await Promise.all(registry.map(async t=>[t.id,await readFile(new URL('../'+t.source,import.meta.url),'utf8')])));
function backup(t,s){return t.settingsFile(t.separateSeasons?{christmas:s.theme==='christmas'?s:t.cloneDefaults(),halloween:s.theme==='halloween'?s:t.cloneDefaults('halloween')}:s);}
function restore(t,text,theme){const value=t.parseSettings(text,true);return t.separateSeasons?value[theme]:value;}
test('older artwork choices still control both areas until each new option is set',()=>{
 for(const t of registry)for(const theme of ['christmas','halloween'])for(const enabled of [false,true]){
  const old=t.cloneDefaults(theme);delete old.songArtwork;delete old.showNowPlayingArtwork;delete old.categoryIcons;old.showAlbumArtwork=enabled;old.name='My saved show';
  const s=restore(t,backup(t,old),theme);assert.equal(songArtworkMode(s),enabled?'album':'none');assert.equal(nowPlayingArtwork(s),enabled);assert.equal(s.name,old.name);
  s.songArtwork='category';assert.equal(nowPlayingArtwork(s),enabled);s.showNowPlayingArtwork=!enabled;assert.equal(songArtworkMode(s),'category');assert.equal(nowPlayingArtwork(s),!enabled);
 }
});
test('all list modes and Now Playing choices round-trip and share safe exports',()=>{
 for(const t of registry)for(const theme of ['christmas','halloween'])for(const songArtwork of ['album','category','none'])for(const showNowPlayingArtwork of [false,true]){
  const s=t.cloneDefaults(theme);Object.assign(s,{songArtwork,showNowPlayingArtwork,categoryIcons:{[s.categoryNames[0]]:'tree',[s.categoryNames[1]]:'snowman'}});
  assert.deepEqual(restore(t,backup(t,s),theme),s);const html=t.render(sources[t.id],s);assert.doesNotMatch(html,/<script\b|Demo:|localhost|preview-category/i);
  assert.equal(html.includes('Decorative category icons'),songArtwork==='category');assert.equal(artworkCSS(s).includes('.playing-now img'),!showNowPlayingArtwork);
  if(songArtwork==='category'){assert.match(html,/nth-child\(1 of \.category-section\)/);assert.match(html,/\\f1bb/);assert.match(html,/\\f7d0/);assert.equal(s.categories,false);}
 }
});
test('icons follow category names through reordering, renaming, detection and hidden filters',()=>{
 const s=registry[0].cloneDefaults();s.categoryIcons={Christmas:'tree','Non Christmas':'snowman'};s.songArtwork='category';s.hiddenCategories=['Christmas'];
 s.categoryNames.reverse();let css=artworkCSS(s);assert.match(css,/nth-child\(1 of \.category-section\) \{ --los-category-glyph:"\\f7d0"/);
 renameCategoryArtwork(s,'Non Christmas','Everyday favourites');s.categoryNames[0]='Everyday favourites';assert.equal(categoryIcon(s,'Everyday favourites'),'snowman');
 applyCategories(s,['Christmas','Everyday favourites','New group']);assert.equal(categoryIcon(s,'Christmas'),'tree');assert.equal(categoryIcon(s,'New group'),'music');assert.deepEqual(s.hiddenCategories,['Christmas']);
 applyCategories(s,['Everyday favourites','New group']);assert.equal(Object.hasOwn(s.categoryIcons,'Christmas'),false);assert.equal(categoryIcon(s,'Everyday favourites'),'snowman');
});
test('invalid category icons and modes cannot inject classes or markup into exports',()=>{
 const t=registry[0],base=t.cloneDefaults();for(const fields of [{songArtwork:'other'},{songArtwork:[]},{showNowPlayingArtwork:'false'},{categoryIcons:null},{categoryIcons:[]},{categoryIcons:{Christmas:'<script>'}},{categoryIcons:{Christmas:'fa-solid fa-star'}},{categoryIcons:{Christmas:{}}}])assert.throws(()=>t.checkedSettings({...base,...fields}));
 const s={...base,songArtwork:'category',categories:false,categoryNames:['','']};assert.ok(t.validate(s)['categoryNames.0']);assert.ok(t.renderDraft(sources[t.id],s).html);
 assert.deepEqual(Object.keys(iconGlyphs).sort(),Object.keys(iconLibrary).sort());for(const code of Object.values(iconGlyphs))assert.match(code,/^[a-f0-9]{4,6}$/);
 for(const id of Object.keys(iconLibrary))assert.doesNotThrow(()=>t.render(sources[t.id],{...base,songArtwork:'category',categoryIcons:{Christmas:id}}));
});
test('shared copy, setup drafts and Undo/Redo preserve independent artwork and mappings',()=>{
 for(const t of registry){const before=t.cloneDefaults(),s=structuredClone(before);Object.assign(s,{songArtwork:'category',showNowPlayingArtwork:false,categoryIcons:{[s.categoryNames[0]]:'ghost'}});
  const other=registry.find(x=>x.id!==t.id),copied=copyDetails(s,other.cloneDefaults(),['music'],other);assert.equal(copied.songArtwork,'category');assert.equal(copied.showNowPlayingArtwork,false);assert.deepEqual(copied.categoryIcons,s.categoryIcons);
  const d=createSetupDraft(s,t);d.enter();d.value.songArtwork='none';d.value.showNowPlayingArtwork=true;assert.equal(s.songArtwork,'category');d.skip();assert.deepEqual(d.finish(),s);
  const bank=createHistoryBank(),history=bank.get(t.id,{settings:before,catalogue:null});history.record({settings:s,catalogue:null},{label:'Artwork'});assert.deepEqual(history.undo().settings,before);assert.deepEqual(history.redo().settings,s);
 }
});
