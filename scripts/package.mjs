import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
import {resolve} from 'node:path';
import {render,cloneDefaults} from '../src/template.js';
import {allArtworkFiles} from '../src/assets.js';
import {buildReadme} from './readme.mjs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'downloads');await mkdir(out,{recursive:true});
await buildReadme(root);
const source=await readFile(resolve(root,'templates/christmas.html'),'utf8');
const html=render(source,cloneDefaults()),halloween=render(source,cloneDefaults('halloween'));
await writeFile(resolve(out,'Festive RF Template.html'),html);
await writeFile(resolve(out,'Halloween RF Template.html'),halloween);
// A small dependency-free ZIP writer with stable timestamps and UTF-8 names.
function crc32(buffer){let crc=0xffffffff;for(const b of buffer){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
const files=new Map([['Festive RF Template.html',Buffer.from(html)],['Halloween RF Template.html',Buffer.from(halloween)]]);
for(const name of ['START-HERE.html','editor.css','README.md','README.html','CONTRIBUTING.md','CREDITS.md','LICENSE','CHANGELOG.md','docs/images/editor-overview.jpg','docs/images/quick-tour.jpg','docs/images/export-to-rf.jpg','docs/images/category-tour.jpg','docs/images/welcome-modal.jpg','docs/images/setup-wizard.jpg'])files.set(name,await readFile(resolve(root,name)));
for(const name of allArtworkFiles)files.set('assets/'+name,await readFile(resolve(root,'assets',name)));
files.set('assets/README.md',await readFile(resolve(root,'assets/README.md')));
const local=[],central=[];let offset=0;
for(const [name,data] of files){
 const filename=Buffer.from(name),compressed=deflateRawSync(data),crc=crc32(data),header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(0x5d4f,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
 local.push(header,filename,compressed);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);header.copy(c,6,4,30);c.writeUInt32LE(offset,42);central.push(c,filename);offset+=header.length+filename.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await writeFile(resolve(out,'Festive-RF-Template.zip'),Buffer.concat([...local,directory,end]));
console.log(`Built manual package: ${files.size} files, same canonical renderer as the editor.`);
