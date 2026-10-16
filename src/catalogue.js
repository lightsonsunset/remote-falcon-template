// CSV snapshots for preview only. Never imported by the RF document renderer.
export const CATALOGUE_KEY='rf-template-builder:catalogue:v1';
const columns=['name','displayName','artist','group','imageUrl','category'];
export function parseCSV(text){
  if(typeof text!=='string'||text.length>2000000)throw Error('Choose an RF CSV export smaller than 2 MB.');
  text=text.replace(/^\ufeff/,'');const rows=[];let row=[],field='',quoted=false,closed=false;
  const cell=()=>{row.push(field);field='';closed=false;};
  const line=()=>{cell();if(row.some(v=>v.trim()))rows.push(row);row=[];};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
    if(c===','){cell();continue;}
    if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;line();continue;}
    if(closed){if(c===' '||c==='\t')continue;throw Error('This CSV has unexpected text after a quoted field. Export a fresh copy from RF.');}
    if(c==='"'){if(field.length)throw Error('This CSV contains an unescaped quote. Export a fresh copy from RF.');quoted=true;}else field+=c;
  }
  if(quoted)throw Error('This CSV ends inside a quoted field. Export a fresh copy from RF.');
  if(row.length||field.length||closed)line();return rows;
}
const secureImage=url=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function parseCatalogue(text,filename='RF export.csv'){
  const [headers,...rows]=parseCSV(text);if(!headers)throw Error('This file is empty.');
  const header=headers.map(h=>h.trim());
  if(new Set(header).size!==header.length)throw Error('This CSV has duplicate column names.');
  const missing=columns.filter(c=>!header.includes(c));if(missing.length)throw Error('This is not a supported RF sequence export. Missing: '+missing.join(', ')+'.');
  if(!rows.length||rows.length>2000)throw Error('Use an export containing 1–2,000 songs.');
  const seen=new Set();let ignoredImages=0;
  const songs=rows.map((values,index)=>{
    if(values.length!==header.length)throw Error(`CSV row ${index+2} has the wrong number of columns.`);
    const song=Object.fromEntries(columns.map(c=>[c,c==='name'?values[header.indexOf(c)]:values[header.indexOf(c)].trim()]));
    if(!song.name.trim())throw Error(`CSV row ${index+2} is missing its exact sequence name.`);
    if(seen.has(song.name))throw Error('Duplicate sequence name: '+song.name+'. Export a fresh copy from RF.');seen.add(song.name);
    if(Object.values(song).some(v=>v.length>4000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)))throw Error(`CSV row ${index+2} has unsupported text.`);
    if(song.imageUrl&&!secureImage(song.imageUrl)){song.imageUrl='';ignoredImages++;}
    return song;
  });
  return {version:1,filename:String(filename).slice(0,200),songs,ignoredImages};
}
export const categoryNamesOf=cat=>[...new Set(cat.songs.map(s=>s.category).filter(Boolean))];
export function saveCatalogue(storage,catalogue){try{if(catalogue)storage.setItem(CATALOGUE_KEY,JSON.stringify(catalogue));else storage.removeItem(CATALOGUE_KEY);return true;}catch{return false;}}
export function restoreCatalogue(storage){
  try{
    const raw=storage?.getItem(CATALOGUE_KEY);if(!raw)return {catalogue:null,error:''};
    const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.songs)||typeof data.filename!=='string')throw Error();
    const csv=[columns,...data.songs.map(s=>columns.map(c=>{if(typeof s[c]!=='string')throw Error();return s[c];}))].map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\n');
    return {catalogue:parseCatalogue(csv,data.filename),error:''};
  }catch{return {catalogue:null,error:'The saved catalogue could not be read. Import your RF CSV again; your show settings are unchanged.'};}
}
