// Editor-only enhancement. Clearing uses the same input path as typing.
const selector='textarea,input:not([type]),input[type="text"],input[type="url"],input[type="email"],input[type="tel"],input[type="search"]';
const controls=new WeakMap();
function fieldName(field){
 const labelled=(field.getAttribute('aria-labelledby')||'').split(/\s+/).map(id=>{const node=field.ownerDocument.getElementById(id)?.cloneNode(true);node?.querySelectorAll('.optional').forEach(n=>n.remove());return node?.textContent||'';}).join(' ').trim();
 const label=field.closest('label'),heading=label?.querySelector('.field-label')?.cloneNode(true);heading?.querySelector('.optional')?.remove();
 return field.getAttribute('aria-label')||labelled||heading?.textContent.trim()||[...(label?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||field.placeholder||'text';
}
function sync(field){const button=controls.get(field);if(button)button.disabled=!field.value||field.matches(':disabled')||field.readOnly;}
export function enhanceTextFields(root){
 const fields=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
 for(const field of fields){
  if(controls.has(field)){sync(field);continue;}
  if(field.readOnly||!field.parentNode)continue;
  const doc=field.ownerDocument,label=field.parentElement.tagName==='LABEL'?field.parentElement:null,anchor=label||field;
  const wrapper=doc.createElement('div');wrapper.className=(label?.className||'')+' clearable-field';
  const button=doc.createElement('button');button.type='button';button.className='clear-text';button.textContent='Clear';button.setAttribute('aria-label','Clear '+fieldName(field));
  if(field.id)button.setAttribute('aria-controls',field.id);
  field.classList.add('text-clear-input');
  // Keep the button outside the label so it does not become part of the field name.
  if(label){let after=false;for(const child of label.children){if(after)child.classList.add('text-clear-after');if(child===field)after=true;}}
  anchor.before(wrapper);wrapper.append(anchor,button);controls.set(field,button);sync(field);
  button.addEventListener('click',event=>{
   event.preventDefault();if(button.disabled||field.matches(':disabled')||field.readOnly)return;
   field.focus({preventScroll:true});field.value='';if(field.selectionStart!==null)field.setSelectionRange(0,0);
   field.dispatchEvent(new Event('input',{bubbles:true}));sync(field);
  });
 }
}
export function installTextClearButtons(root=document){
 enhanceTextFields(root);
 root.addEventListener('input',event=>sync(event.target));root.addEventListener('change',event=>sync(event.target));root.addEventListener('focusin',event=>sync(event.target));
 const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'){sync(record.target);continue;}for(const node of record.addedNodes)if(node.nodeType===1)enhanceTextFields(node);}});
 observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','readonly','value']});
}
