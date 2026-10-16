// Editor-only guide navigation. The tour retains its own context restoration.
export function createHelp({startTour}){
 const button=document.getElementById('open-help'),dialog=document.getElementById('help-dialog');
 const close=()=>{dialog.close();button.focus({preventScroll:true});};
 button.disabled=false;button.addEventListener('click',()=>dialog.showModal());
 document.getElementById('close-help').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 document.getElementById('start-tour').addEventListener('click',()=>{close();startTour();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button,a[href]')],first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
}
