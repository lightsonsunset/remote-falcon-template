import {mkdir,copyFile,readdir,rm} from 'node:fs/promises';
import {join,resolve,dirname,relative} from 'node:path';
import {root,releaseFiles} from './release-files.mjs';
const out=resolve(root,'_site');
if(relative(root,out)!=='_site')throw Error('Invalid website output directory.');
// The fixed, verified build directory contains generated website files only.
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const files=await releaseFiles(true);
for(const name of files){const dest=join(out,name);await mkdir(dirname(dest),{recursive:true});await copyFile(join(root,name),dest);}
const excluded=['tests','scripts','.github','.git'];
for(const name of await readdir(out))if(excluded.includes(name))throw Error('Unexpected development files in website.');
console.log('Prepared '+files.length+' public website files in _site.');
