import {manualFiles} from './package-files.mjs';
import {registry} from '../src/template-registry.js';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join,posix} from 'node:path';
import {inflateRawSync} from 'node:zlib';
import {root,releaseFiles,sourceRootFiles,sourceDirectories} from './release-files.mjs';
import {render,cloneDefaults} from '../src/template.js';
import {assetBase,artwork} from '../src/assets.js';
const files=await releaseFiles();
const {version}=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
assert(/^\d+\.\d+\.\d+$/.test(version),'Product version must use MAJOR.MINOR.PATCH');
const changelog=await readFile(join(root,'CHANGELOG.md'),'utf8');
const releaseHeading=changelog.split(/\r?\n/).find(line=>line.startsWith('## '));
assert(releaseHeading?.startsWith('## '+version+' — '),'Current changelog release must match package version');
const releaseDate=releaseHeading.split(' — ').at(-1);
assert(/^\d{1,2} [A-Z][a-z]+ \d{4}$/.test(releaseDate),'Release needs a publication date');

for(const e of await readdir(root)){
 if(![...sourceRootFiles,...sourceDirectories,'.git','_site','node_modules'].includes(e))throw Error('Unreviewed file at repository root: '+e);
}
for(const path of files){
 assert(!/AGENTS\.md|PROMPTS\.txt|\.csv$|\.bak$|(?:^|\/)(?:outputs|backups)\//i.test(path),'Private file in release: '+path);
 if(!/\.(?:html|md|txt|mjs|js|json|yml|css)$/.test(path))continue;
 const text=await readFile(join(root,path),'utf8');
 const privateData=[/\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{30,}/,/\b192\.168\.\d+\.\d+\b/,/[A-Z]:[\\/]Users[\\/][^\s"<>]+/i,/\bcodex-clipboard-[a-f0-9-]+/i,new RegExp('<send_'+'user_message_question_reply>'),/lightsonsunset\.remotefalcon\.com/];
 for(const pattern of privateData)assert(!pattern.test(text),'Private or environment-specific data in '+path);
 assert(!text.includes('https://'+'davecollections.github.io/'+'rf-template-builder/'),'Old release URL in '+path);
}
assert.equal(assetBase,'https://lightsonsunset.github.io/remote-falcon-template/assets/');
const template=await readFile(join(root,'templates/christmas.html'),'utf8');
for(const theme of ['christmas','halloween']){
 const file=theme==='christmas'?'Festive RF Template.html':'Halloween RF Template.html';
 const html=render(template,cloneDefaults(theme));
 assert.equal(await readFile(join(root,'downloads',file),'utf8'),html,'Generated template is stale');
 assert(!/<script\b|\son\w+\s*=|Demo:|Winter Starlight|localhost|127\.0\.0\.1|SETUP_|@@/i.test(html),'Unsafe or demo content in export');
 assert(html.includes('Dynamic Menu by Matt Orelup')&&html.includes('GPL'),'Attribution missing');
 const s=cloneDefaults(theme);s.logoMode='seasonal';s.decorations=true;
 const decorated=render(template,s);
 for(const file of Object.values(artwork[theme]))assert(decorated.includes(assetBase+file),'Hosted artwork URL missing');
}
function crc32(data){let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}

let totalEntries=0;
for(const template of registry){
 const source=await readFile(join(root,template.source),'utf8');
 assert(source.includes('customiser edition '+version+' / '+releaseDate),'Template release metadata differs: '+template.name);
 for(const [season,name] of Object.entries(template.downloads)){
  const html=template.render(source,template.cloneDefaults(season));
  assert.equal(await readFile(join(root,'downloads',name),'utf8'),html,'Stale manual starter: '+name);
  assert(!/<script\b|\son\w+\s*=|Demo:|Winter Starlight|Moonlit Mischief|localhost|127\.0\.0\.1|SETUP_|@@|\[\[/i.test(html),'Unsafe or demo content: '+name);
  assert(html.includes('Dynamic Menu by Matt Orelup')&&html.includes('GPL'),'Attribution missing: '+name);
 }
 const expected=new Set([...Object.values(template.downloads),...manualFiles,'assets/README.md',...template.assets.map(n=>'assets/'+n)]);
 const entryCount=expected.size,zip=await readFile(join(root,'downloads',template.package)),entries=new Map();let offset=0;
 while(zip.readUInt32LE(offset)===0x04034b50){
  const nameLen=zip.readUInt16LE(offset+26),extraLen=zip.readUInt16LE(offset+28),size=zip.readUInt32LE(offset+18);
  const name=zip.subarray(offset+30,offset+30+nameLen).toString('utf8');
  assert(expected.delete(name),'Unexpected or duplicate entry in '+template.package+': '+name);
  assert.equal(zip.readUInt16LE(offset+8),8,'Unsupported ZIP compression');
  const start=offset+30+nameLen+extraLen,data=inflateRawSync(zip.subarray(start,start+size));
  assert.equal(data.length,zip.readUInt32LE(offset+22),'ZIP length failed: '+name);
  assert.equal(crc32(data),zip.readUInt32LE(offset+14),'ZIP CRC failed: '+name);
  const sourceName=Object.values(template.downloads).includes(name)?'downloads/'+name:name;
  assert(data.equals(await readFile(join(root,sourceName))),'ZIP differs from source: '+name);
  entries.set(name,data);offset=start+size;
 }
 assert.equal(expected.size,0,'Missing entries: '+[...expected].join(', '));
 assert.equal(entries.size,entryCount);
 assert.equal(zip.readUInt32LE(offset),0x02014b50,'Missing ZIP central directory');
 assert.equal(zip.readUInt32LE(zip.length-22),0x06054b50,'Missing ZIP end record');
 assert.equal(zip.readUInt16LE(zip.length-12),entryCount,'ZIP directory entry count differs');
 // Offline guide dependencies must exist in each independently extracted package.
 for(const name of ['README.html','START-HERE.html']){
  const html=entries.get(name).toString('utf8');
  for(const tag of html.match(/<[a-z][^>]*>/gi)||[])for(const [,raw] of tag.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(?:https?:|data:|mailto:)/i.test(raw))continue;
   const [target,fragment]=raw.split('#');const resolved=target?posix.normalize(posix.join(posix.dirname(name),decodeURIComponent(target))):name;
   assert(entries.has(resolved),'Missing offline guide target: '+name+' → '+raw);
   if(fragment&&resolved.endsWith('.html'))assert(entries.get(resolved).toString('utf8').includes('id="'+fragment+'"'),'Missing guide anchor: '+raw);
  }
 }
 totalEntries+=entryCount;
 console.log(template.name+': '+Object.keys(template.downloads).length+' canonical starters; '+entryCount+' exact ZIP entries, CRCs and offline guide links verified.');
}
console.log('Release audit passed: '+files.length+' allowlisted source files; '+totalEntries+' packaged entries across '+registry.length+' templates.');
