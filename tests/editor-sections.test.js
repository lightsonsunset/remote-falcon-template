import test from 'node:test';
import assert from 'node:assert/strict';
import {settingsForm} from '../src/editor-form.js';
import {registry} from '../src/template-registry.js';
const section=(html,id)=>html.split('<details data-section="'+id+'"')[1]?.split('<details data-section="')[0]||'';
for(const t of registry)for(const theme of Object.keys(t.themes)){
 test(t.id+' '+theme+' sections start collapsed and grouping preserves settings',()=>{
  const s=t.cloneDefaults(theme),before=JSON.stringify(s),html=settingsForm(s,t);
  assert.equal(JSON.stringify(s),before);
  const top=[...html.matchAll(/<details data-section="\d+"[^>]*>/g)];assert.ok(top.length>5);assert.ok(top.every(([tag])=>!(/\sopen(?:\s|>)/.test(tag))));
  assert.doesNotMatch(section(html,11),/data-key="homeMusicLink"|data-icon-role="musicLink"|data-copy="HOME_(?:JUKEBOX|VOTING)_HELP"/);
  if(t.features.homeMusicLink===false){assert.equal(section(html,34),'');assert.ok(!Object.values(t.groups).some(g=>g.sections.includes(34)));return;}
  assert.ok(t.groups.home.sections.includes(34));const music=section(html,34);assert.match(music,/<summary>Music link on Home/);
  for(const selector of ['data-key="homeMusicLink"','data-icon-role="musicLink"','data-copy="HOME_JUKEBOX_HELP"','data-copy="HOME_VOTING_HELP"']){assert.equal(html.split(selector).length-1,1);assert.ok(music.includes(selector));}
  assert.match(music,/data-go-section="15"/);assert.match(music,/also used on the Music page/);assert.equal(s.homeMusicLink,true);assert.match(music,/fa-solid fa-music/);
 });
 test(t.id+' '+theme+' hidden Music shortcut retains custom wording and icon',()=>{
  const s=t.cloneDefaults(theme);s.homeMusicLink=false;s.icons.musicLink='headphones';s.copy.HOME_JUKEBOX_HELP='Custom request';s.copy.HOME_VOTING_HELP='Custom vote';const before=JSON.stringify(s),html=settingsForm(s,t);assert.equal(JSON.stringify(s),before);
  if(t.features.homeMusicLink!==false){const music=section(html,34);assert.match(music,/Custom request/);assert.match(music,/Custom vote/);assert.match(music,/fa-headphones/);assert.doesNotMatch(music,/<input[^>]*data-key="homeMusicLink"[^>]*checked/);}
 });
}
