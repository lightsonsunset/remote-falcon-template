import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const port=Number(process.argv[2]||process.env.PORT||4188);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Choose a local port from 1024 to 65535.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.json':'application/json','.zip':'application/zip','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'),path=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
    let file=path;if((await stat(file)).isDirectory())file=resolve(file,'index.html');
    res.setHeader('Content-Type',types[extname(file)]||'text/plain');res.setHeader('Cache-Control','no-store');res.end(await readFile(file));
  }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`RF Template Builder: http://127.0.0.1:${port}`));
