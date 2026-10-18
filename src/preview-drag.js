// Mouse-only swipe affordance for the local device preview. Never exported to RF.
export function installPreviewDrag(doc,isEnabled){
 let gesture=null,suppressClick=false;
 const clear=()=>{gesture=null;doc.documentElement.classList.remove('preview-is-dragging');};
 doc.addEventListener('pointerdown',event=>{
  suppressClick=false;
  if(!isEnabled()||event.pointerType!=='mouse'||event.button!==0||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  const containers=[];
  for(let el=event.target;el&&el!==doc.documentElement;el=el.parentElement){
   const css=doc.defaultView.getComputedStyle(el);
   if(/auto|scroll/.test(css.overflowY)&&el.scrollHeight>el.clientHeight+1)containers.push(el);
  }
  const root=doc.scrollingElement;
  if(root&&root.scrollHeight>root.clientHeight+1&&!containers.includes(root))containers.push(root);
  if(!containers.length)return;
  const box=containers[0].getBoundingClientRect();
  if(event.clientX>=box.left+containers[0].clientWidth)return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,lastY:event.clientY,containers,capture:event.target,dragged:false};
 },true);
 doc.addEventListener('pointermove',event=>{
  const g=gesture;if(!g||g.id!==event.pointerId)return;
  if(!isEnabled()){clear();return;}
  const dy=event.clientY-g.y,dx=event.clientX-g.x;
  if(!g.dragged){
   if(Math.abs(dy)<8||Math.abs(dy)<=Math.abs(dx))return;
   g.dragged=true;doc.documentElement.classList.add('preview-is-dragging');doc.getSelection()?.removeAllRanges();
   try{g.capture.setPointerCapture(g.id);}catch{/* Synthetic check events have no active pointer. */}
  }
  event.preventDefault();
  let remaining=g.lastY-event.clientY;g.lastY=event.clientY;
  for(const el of g.containers){const before=el.scrollTop;el.scrollTo({top:before+remaining,behavior:'instant'});remaining-=el.scrollTop-before;if(Math.abs(remaining)<1)break;}
 },{capture:true,passive:false});
 const end=event=>{if(gesture?.id!==event.pointerId)return;suppressClick=gesture.dragged;const capture=gesture.capture;clear();try{capture.releasePointerCapture(event.pointerId);}catch{/* Already released or synthetic pointer. */}};
 doc.addEventListener('pointerup',end,true);doc.addEventListener('pointercancel',end,true);
 doc.defaultView.addEventListener('blur',clear);
 doc.addEventListener('dragstart',event=>{if(gesture)event.preventDefault();},true);
 doc.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
}
