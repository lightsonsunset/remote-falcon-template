import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {checkedIcons,iconRoles,iconLibrary,availableIconRoles} from '../src/icons.js';

test('legacy designs retain their default icons and optional choices survive backups',async()=>{
 for(const t of registry){for(const season of ['christmas','halloween']){
  const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8'),s=t.cloneDefaults(season);delete s.icons;
  const legacy=t.checkedSettings(s);assert.deepEqual(legacy.icons,{});const old=t.render(source,legacy);assert.doesNotMatch(old,/\[\[ICON:/);
  const updated={...legacy,icons:{navMusic:'star',success:'lights'}};const html=t.render(source,updated);assert.match(html,/data-tab-target="music"[^>]*>\s*<i class="fa-solid fa-star"/);assert.match(html,/fa-solid fa-lightbulb status-icon/);assert.doesNotMatch(html,/<script|\[\[ICON:/);
  const file=t.separateSeasons?t.settingsFile({christmas:season==='christmas'?updated:t.cloneDefaults(),halloween:season==='halloween'?updated:t.cloneDefaults('halloween')}):t.settingsFile(updated);
  const restored=t.parseSettings(file,true);assert.deepEqual((t.separateSeasons?restored[season]:restored).icons,updated.icons);
  assert.equal(t.render(source,{...updated,icons:{}}),old);
 }}
});
test('icon settings reject arbitrary classes, markup, unknown roles and malformed values',()=>{
 for(const icons of [null,[],{navMusic:'fa-solid fa-star'},{navMusic:'<script>'},{navMusic:['star']},{navMusic:{}},{unknown:'star'}])assert.throws(()=>checkedIcons(icons));
 for(const id of Object.keys(iconLibrary))assert.deepEqual(checkedIcons({navMusic:id}),{navMusic:id});
});
test('every offered template icon role has a rendered target',async()=>{
 for(const t of registry){const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8'),s=t.cloneDefaults();Object.assign(s,{notice:true,noticeText:'Show note',fm:true,pulsemesh:true,pulsemeshButtons:'both',pulsemeshUrl:'https://example.org/listen',donations:true,donationUrl:'https://example.org/support',donationHome:true,donationInfo:true,showPreview:true,showPreviewUrl:'https://example.org/video',youtube:true,youtubeUrl:'https://example.org/youtube'});
 for(const [role] of availableIconRoles(t.separateSeasons)){assert(Object.hasOwn(iconRoles,role));const html=t.render(source,{...s,logoMode:role==='brand'?t.features.headerIconMode:s.logoMode,icons:{[role]:'camera'}});assert.match(html,/fa-solid fa-camera/,t.id+' '+role);}
 }
});
