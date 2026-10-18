// Editor-only viewport snapshots. Never imported by a viewer renderer.
export function captureViewport(...nodes){
 const positions=new Map();
 for(const node of nodes)for(let el=node?.parentElement;el;el=el.parentElement)if(!positions.has(el))positions.set(el,[el.scrollLeft,el.scrollTop]);
 const x=window.scrollX,y=window.scrollY;
 return ()=>{for(const [el,[left,top]] of positions)if(el.isConnected&&(el.scrollLeft!==left||el.scrollTop!==top))el.scrollTo({left,top,behavior:'instant'});if(window.scrollX!==x||window.scrollY!==y)window.scrollTo({left:x,top:y,behavior:'instant'});};
}
export function captureField(root){
 const el=document.activeElement;if(!root.contains(el)||!el.matches('input,textarea,select'))return ()=>{};
 const attrs=[...el.attributes].filter(a=>a.name.startsWith('data-'));const id=el.id;
 const selection=el.matches('input,textarea')&&el.selectionStart!==null?[el.selectionStart,el.selectionEnd,el.selectionDirection]:null;
 return ()=>{const next=id?root.querySelector('#'+CSS.escape(id)):[...root.querySelectorAll(el.tagName)].find(n=>attrs.every(a=>n.getAttribute(a.name)===a.value));if(next&&!next.hidden&&next.getClientRects().length){next.focus({preventScroll:true});if(selection)next.setSelectionRange(...selection);}};
}
