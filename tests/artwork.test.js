import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cloneDefaults,render,parseSettings,settingsFile,changeTheme,validate} from '../src/template.js';
import {logoChoices,decorationChoices,allArtworkFiles,assetBase} from '../src/assets.js';
const source=await readFile(new URL('../templates/christmas.html',import.meta.url),'utf8');
test('older settings retain their original logo and navbar appearance',()=>{
 const s=cloneDefaults();s.logoMode='seasonal';s.decorations=true;s.name='Our custom show';
 for(const key of ['logoStyle','combineLogoName','showNameOnHome','christmasDecoration','halloweenDecoration'])delete s[key];
 const next=parseSettings(settingsFile(s));
 assert.equal(next.logoStyle,'classic');assert.equal(next.combineLogoName,false);assert.equal(next.showNameOnHome,true);assert.equal(next.christmasDecoration,'default');assert.equal(next.halloweenDecoration,'default');assert.equal(next.name,s.name);
});
test('every bundled design exports a public asset and survives settings round trips',async()=>{
 assert.equal(allArtworkFiles.length,13);
 for(const file of allArtworkFiles){const b=await readFile(new URL('../assets/'+file,import.meta.url));assert.equal(b.subarray(8,12).toString(),'WEBP');assert(b.length<150000);}
 for(const theme of ['christmas','halloween']){
  const s=cloneDefaults(theme);s.logoMode='seasonal';s.decorations=true;s.combineLogoName=true;
  for(const c of logoChoices[theme]){s.logoStyle=c.id;const html=render(source,s);assert(html.includes(assetBase+c.file));assert(html.includes('share-brand brand-combined'));assert.deepEqual(parseSettings(settingsFile(s)),s);}
  for(const c of decorationChoices[theme]){s[theme+'Decoration']=c.id;assert(render(source,s).includes(assetBase+c.file));}
 }
});
test('hiding the Home name preserves identity and avoids unsafe logo choices',()=>{
 const s=cloneDefaults();s.name='A & B "Lights"';s.showNameOnHome=false;s.logoMode='seasonal';s.logoStyle='lights';s.combineLogoName=true;
 const h=render(source,s);assert(h.includes('<title>A &amp; B &quot;Lights&quot;</title>'));assert(h.includes('<h1 class="show-name-hidden">A &amp; B &quot;Lights&quot;</h1>'));assert(!h.includes('share-brand brand-combined'));assert(!/<script\b|\son\w+=/.test(h));
 s.name='';assert(validate(s).name);s.name='Lights';s.logoStyle='../../bad';assert.throws(()=>render(source,s));
 s.logoStyle='lights';s.christmasDecoration='bad';assert.throws(()=>render(source,s));
});
test('theme changes preserve both decoration choices and name layout',()=>{
 const s=cloneDefaults();Object.assign(s,{logoStyle:'lights',combineLogoName:true,showNameOnHome:false,christmasDecoration:'bells',halloweenDecoration:'bat'});
 const next=changeTheme(s,'halloween');assert.equal(next.logoStyle,'lights');assert.equal(next.showNameOnHome,false);assert.equal(next.combineLogoName,true);assert.equal(next.halloweenDecoration,'bat');assert.equal(changeTheme(next,'christmas').christmasDecoration,'bells');
});
