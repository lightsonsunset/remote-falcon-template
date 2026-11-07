import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registry} from '../src/template-registry.js';
test('navigation clearance is script-free, noninteractive and follows visible menu choices',()=>{
 for(const t of registry)for(const theme of Object.keys(t.themes))for(const support of [true,false]){
  const s=t.cloneDefaults(theme);s.showSupportTab=support;s.copy={NAV_MUSIC:'Music & lights'};const html=t.render(readFileSync(new URL('../'+t.source,import.meta.url),'utf8'),s);
  const spacers=[...html.matchAll(/<div class="nav-clearance" aria-hidden="true">([\s\S]*?)<\/div>/g)];
  assert.equal(spacers.length,t.id==='festive'?4:1);
  for(const [,body] of spacers){assert.doesNotMatch(body,/<(?:a|button|input)\b|\b(?:id|tabindex)=/);assert.match(body,/Music &amp; lights/);assert.equal((body.match(/class="nav-clearance__item"/g)||[]).length,(t.id==='festive'?4:3)-(support?0:1));}
  assert.doesNotMatch(html,/<script\b|\[\[NAV_CLEARANCE\]\]/);assert.match(html,/\{PLAYLISTS\}/);
 }
});
