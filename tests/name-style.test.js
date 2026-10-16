import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,parseSettings,settingsFile,render,changeTheme} from '../src/template.js';
import {nameFonts,nameStyleCSS,nameStyleDefaults} from '../src/name-style.js';
import {createSetupDraft} from '../src/setup-model.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('older settings retain exact automatic name styling; new choices survive themes and backups',()=>{
 const old=cloneDefaults();old.logoMode='seasonal';old.combineLogoName=true;old.name='Our saved show';for(const k of Object.keys(nameStyleDefaults))delete old[k];
 const migrated=parseSettings(settingsFile(old));assert.equal(nameStyleCSS(migrated),'');assert.equal(migrated.name,old.name);
 Object.assign(migrated,{nameFont:'spooky',nameColour:'#123abc',customNameColour:true});const next=changeTheme(parseSettings(settingsFile(migrated)),'halloween');
 assert.equal(next.nameFont,'spooky');assert.equal(next.nameColour,'#123abc');assert(next.customNameColour);
});
test('heading CSS only loads the selected font and never targets countdowns or other text',()=>{
 for(const font of nameFonts){const s=cloneDefaults();s.nameFont=font.id;const html=render(source,s),css=nameStyleCSS(s);
  assert.equal((css.match(/@font-face/g)||[]).length,font.file?1:0);if(font.file){assert(css.includes(font.file));assert(css.includes('font-display:swap'));assert(css.includes('.content__body .share-brand.brand-combined h1'));}
  assert(!css.includes('countdown'));assert(!/<script\b|\son\w+\s*=|localhost|127\.0\.0\.1/.test(html));
  s.showNameOnHome=false;assert.equal(nameStyleCSS(s),'');s.showNameOnHome=true;s.customNameColour=true;s.nameColour='#abc123';assert(nameStyleCSS(s).includes('color:#abc123'));
 }
});
test('font and colour injection are rejected even through imported settings',()=>{
 for(const [key,value] of [['nameFont','current; color:red'],['nameColour','#fff;}</style><script>']]){const s=cloneDefaults();s[key]=value;assert.throws(()=>parseSettings(settingsFile(s)));assert.throws(()=>render(source,s));}
});
test('wizard name style changes stay detached, skip restores and Apply preserves unrelated settings',()=>{
 const s=cloneDefaults();s.copy.SUCCESS_TITLE='Our success';const draft=createSetupDraft(s);draft.enter();draft.value.nameFont='festive';draft.value.customNameColour=true;draft.value.nameColour='#abcd12';
 assert.equal(s.nameFont,'current');draft.skip();assert.equal(draft.value.nameFont,'current');draft.value.nameFont='elegant';const next=draft.finish();assert.equal(next.nameFont,'elegant');assert.equal(next.copy.SUCCESS_TITLE,'Our success');assert.equal(s.nameFont,'current');
});
test('bundled font binaries and original OFL notices are present',async()=>{
 for(const font of nameFonts.filter(f=>f.file)){const data=await readFile(new URL('../assets/fonts/'+font.file,import.meta.url));assert.equal(data.readUInt32BE(0),0x00010000);const licence=await readFile(new URL('../assets/fonts/'+font.id+'-OFL.txt',import.meta.url),'utf8');assert(licence.includes('SIL OPEN FONT LICENSE Version 1.1'));}
});
