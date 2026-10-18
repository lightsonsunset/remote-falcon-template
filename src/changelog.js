// Editor-only update history, sourced from the public changelog.
export function createChangelog(){
 const dialog=document.getElementById('changelog-dialog'),content=document.getElementById('changelog-content'),open=document.getElementById('open-changelog');
 let loaded=false;
 open.addEventListener('click',async()=>{
  dialog.showModal();
  if(loaded)return;
  content.textContent='Loading updates…';
  try{
   const response=await fetch('CHANGELOG.md');if(!response.ok)throw Error('Unavailable');
   const markdown=await response.text(),fragment=document.createDocumentFragment();let list=null;
   for(const line of markdown.split(/\r?\n/)){
    if(line.startsWith('## ')){const h=document.createElement('h3');h.textContent=line.slice(3);fragment.append(h);list=null;}
    else if(line.startsWith('### ')){const h=document.createElement('h4');h.textContent=line.slice(4);fragment.append(h);list=null;}
    else if(line.startsWith('- ')){if(!list){list=document.createElement('ul');fragment.append(list);}const li=document.createElement('li');li.textContent=line.slice(2);list.append(li);}
   }
   if(!fragment.childNodes.length)throw Error('Empty');
   content.replaceChildren(fragment);loaded=true;
  }catch{content.textContent='Updates could not be loaded. Try again, or open the full changelog below.';}
 });
 document.getElementById('close-changelog').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>open.focus({preventScroll:true}));
}
