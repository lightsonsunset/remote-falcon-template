import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {inflateRawSync} from 'node:zlib';
import {root,releaseFiles,sourceRootFiles,sourceDirectories} from './release-files.mjs';
import {render,cloneDefaults} from '../src/template.js';
import {assetBase,artwork} from '../src/assets.js';
const files=await releaseFiles();
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
const zip=await readFile(join(root,'downloads/Festive-RF-Template.zip'));
const allowed=new Set(['Festive RF Template.html','Halloween RF Template.html','START-HERE.html','editor.css','README.md','README.html','CONTRIBUTING.md','CREDITS.md','LICENSE','docs/images/editor-overview.jpg','docs/images/quick-tour.jpg','docs/images/export-to-rf.jpg','docs/images/category-tour.jpg','docs/images/welcome-modal.jpg','docs/images/setup-wizard.jpg','assets/README.md',...Object.values(artwork).flatMap(a=>Object.values(a)).map(n=>'assets/'+n)]);
let offset=0,count=0;
while(zip.readUInt32LE(offset)===0x04034b50){
 const nameLen=zip.readUInt16LE(offset+26),extraLen=zip.readUInt16LE(offset+28),size=zip.readUInt32LE(offset+18);
 const name=zip.subarray(offset+30,offset+30+nameLen).toString();assert(allowed.delete(name),'Unexpected or duplicate ZIP entry: '+name);
 const start=offset+30+nameLen+extraLen,data=inflateRawSync(zip.subarray(start,start+size));
 assert.equal(crc32(data),zip.readUInt32LE(offset+14),'ZIP CRC failed: '+name);
 const actual=await readFile(join(root,/^(Festive|Halloween) RF Template\.html$/.test(name)?'downloads/'+name:name));
 assert(data.equals(actual),'ZIP differs from source: '+name);
 offset=start+size;count++;
}
assert.equal(allowed.size,0,'ZIP entries missing');assert.equal(count,20);
console.log('Release audit passed: '+files.length+' source files; both exports; '+count+' ZIP entries and CRCs.');
