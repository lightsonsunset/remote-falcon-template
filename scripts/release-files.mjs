import {readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
export const root=resolve(import.meta.dirname,'..');
export const publicRootFiles=['.nojekyll','index.html','editor.css','tour.css','setup.css','icon.svg','README.md','README.html','START-HERE.html','CONTRIBUTING.md','CREDITS.md','LICENSE','VERIFICATION.md','CHANGELOG.md','SECURITY.md'];
export const publicDirectories=['assets','docs','downloads','src','templates'];
export const sourceRootFiles=[...publicRootFiles,'.gitignore','.gitattributes','package.json'];
export const sourceDirectories=[...publicDirectories,'.github','scripts','tests'];
export async function within(directory){
 const files=[];
 for(const e of await readdir(join(root,directory),{withFileTypes:true})){
  if(e.isSymbolicLink())throw Error('Symlinks are not allowed in release files: '+directory+'/'+e.name);
  const p=directory+'/'+e.name;if(e.isDirectory())files.push(...await within(p));else files.push(p);
 }return files;
}
export async function releaseFiles(site=false){
 const files=[...(site?publicRootFiles:sourceRootFiles)];
 for(const d of site?publicDirectories:sourceDirectories)files.push(...await within(d));
 return files.sort();
}
