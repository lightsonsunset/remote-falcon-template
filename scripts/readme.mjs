// Build the offline reading copy from the same Markdown used on GitHub.
// Supports this repository's headings, paragraphs, tables, links and images.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildReadme(root){
 const markdown=await readFile(resolve(root,'README.md'),'utf8'),images=new Map();
 for(const match of markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)){
  const file=match[2];if(!file.startsWith('docs/images/'))throw Error('README images must be bundled locally');
  const bytes=await readFile(resolve(root,file));images.set(file,'data:image/jpeg;base64,'+bytes.toString('base64'));
 }
 function inline(text){
  const pattern=/!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;let html='',last=0;
  for(const m of text.matchAll(pattern)){
   html+=escape(text.slice(last,m.index));
   if(m[1]!==undefined)html+=`<img src="${images.get(m[2])}" alt="${escape(m[1])}" loading="lazy">`;
   else if(m[3]!==undefined){const href=m[4].replace('https://lightsonsunset.github.io/remote-falcon-template/START-HERE.html','START-HERE.html');html+=`<a href="${escape(href)}"${href.startsWith('https://')?' target="_blank" rel="noopener"':''}>${escape(m[3])}</a>`;}
   else if(m[5]!==undefined)html+='<strong>'+escape(m[5])+'</strong>';
   else html+='<code>'+escape(m[6])+'</code>';
   last=m.index+m[0].length;
  }
  return html+escape(text.slice(last));
 }
 const lines=markdown.trim().split(/\r?\n/),blocks=[];
 for(let i=0;i<lines.length;){
  if(!lines[i].trim()){i++;continue;}
  const heading=lines[i].match(/^(#{1,3}) (.+)$/);
  if(heading){const n=heading[1].length;blocks.push(`<h${n}>${inline(heading[2])}</h${n}>`);i++;continue;}
  if(lines[i].startsWith('|')){
   const rows=[];while(i<lines.length&&lines[i].startsWith('|'))rows.push(lines[i++]);
   const cells=row=>row.slice(1,-1).split('|').map(c=>c.trim());
   blocks.push('<div class="table-wrap"><table><thead><tr>'+cells(rows[0]).map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(2).map(r=>'<tr>'+cells(r).map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;
  }
  const paragraph=[];while(i<lines.length&&lines[i].trim())paragraph.push(lines[i++]);blocks.push('<p>'+inline(paragraph.join(' '))+'</p>');
 }
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lights on Sunset · Quick-start guide</title><style>
 :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f6f5ef;color:#243d33;font:16px/1.75 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:960px;margin:auto;padding:35px 28px 70px}h1{font-size:36px;line-height:1.2;letter-spacing:-1px;margin:24px 0 12px}h2{font-size:26px;line-height:1.35;margin:52px 0 18px}h3{font-size:21px;margin:36px 0 14px}p{margin:16px 0}a{color:#215b45;text-underline-offset:3px}img{display:block;max-width:100%;height:auto;border:1px solid #dce3d9;border-radius:12px;margin:26px auto}table{width:100%;border-collapse:collapse;background:#fffefa;font-size:15px}th,td{padding:12px 16px;border:1px solid #dce3d9;text-align:left;vertical-align:top}th{background:#e8eee3}.table-wrap{overflow:auto}.offline-note{padding:15px 18px;border:1px solid #dce3d9;border-radius:12px;background:#fffefa;font-size:13px;color:#5b6c61}.offline-note strong{color:#243d33}code{background:#e8eee3;padding:2px 4px;border-radius:4px}footer{border-top:1px solid #dce3d9;margin-top:40px;padding-top:18px;font-size:13px;color:#5b6c61}@media(max-width:500px){main{padding:22px 18px 40px}h1{font-size:29px}h2{font-size:23px}th,td{padding:9px}}@media print{body{background:white;color:black}main{max-width:none;padding:0}.offline-note{display:none}h2,h3{break-after:avoid}img,tr{break-inside:avoid}}
 </style></head><body><main><aside class="offline-note"><strong>Quick-start guide</strong><br>Use this guide online or open the downloaded copy offline. All screenshots are included. Website and RF links need internet access. <a href="START-HERE.html">Open the detailed setup guide</a>.</aside>${blocks.join('\n')}<footer>Generated from README.md. Keep the downloaded package together to use its local setup, credit and licence links.</footer></main></body></html>`;
 await writeFile(resolve(root,'README.html'),html);return html;
}
