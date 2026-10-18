import {manualFiles} from './package-files.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
import {resolve} from 'node:path';
import {registry} from '../src/template-registry.js';
import {buildReadme} from './readme.mjs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'downloads');await mkdir(out,{recursive:true});
await buildReadme(root);
// A small dependency-free ZIP writer with stable timestamps and UTF-8 names.
function crc32(buffer){let crc=0xffffffff;for(const b of buffer){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
for(const template of registry){
const source=await readFile(resolve(root,template.source),'utf8'),files=new Map();
for(const [season,name] of Object.entries(template.downloads)){const html=template.render(source,template.cloneDefaults(season));await writeFile(resolve(out,name),html);files.set(name,Buffer.from(html));}
for(const name of manualFiles)files.set(name,await readFile(resolve(root,name)));
for(const name of template.assets)files.set('assets/'+name,await readFile(resolve(root,'assets',name)));
files.set('assets/README.md',await readFile(resolve(root,'assets/README.md')));
const local=[],central=[];let offset=0;
for(const [name,data] of files){
 const filename=Buffer.from(name),compressed=deflateRawSync(data),crc=crc32(data),header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(0x5d4f,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
 local.push(header,filename,compressed);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);header.copy(c,6,4,30);c.writeUInt32LE(offset,42);central.push(c,filename);offset+=header.length+filename.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await writeFile(resolve(out,template.package),Buffer.concat([...local,directory,end]));
console.log(`Built ${template.name}: ${files.size} package files, canonical renderer.`);
}
