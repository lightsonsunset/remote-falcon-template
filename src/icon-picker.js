// One editor-only picker for template roles and individual resource/playlist rows.
import {iconLibrary,iconRoles,defaultIcon,availableIconRoles,iconKeywords} from './icons.js';
export function iconButton(id,attributes,label){const [name,css]=iconLibrary[id];return `<button type="button" class="icon-choice-button" ${attributes} aria-label="Choose ${label.replace(/ icon$/i,'')} icon"><i class="${css}" aria-hidden="true"></i><span>${name}</span><small>Choose icon</small></button>`;}
export function iconSettings(s,compact){
 const roles=availableIconRoles(compact);
 return '<div class="viewer-icons"><h3>Choose your icons</h3><p class="hint">Use the shared library for navigation, links and messages. Template defaults keep the original look. Playlist and resource icons are chosen on their own cards.</p>'+['Navigation','Page details','Song messages'].map(group=>`<details class="copy-group" data-copy-group="icons-${group}"><summary>${group}</summary><div class="copy-fields icon-role-list">${roles.filter(([,r])=>r[2]===group).map(([role,[label]])=>`<div class="icon-role"><span>${label}</span>${iconButton(s.icons?.[role]||defaultIcon(role,s,compact),`data-icon-role="${role}"`,label)}<small class="hint">${s.icons?.[role]?'Custom choice':'Template default'}</small></div>`).join('')}</div></details>`).join('')+'</div>';
}
// Presentation groups only: saved icon IDs and the shared allowlist stay unchanged.
export const iconCategories=[
 {id:'christmas',name:'Christmas',icons:['tree','star','snowflake','snowman','candyCane','holly','sleigh','bell','gift','gifts','mitten','icicles','cookie']},
 {id:'halloween',name:'Halloween',icons:['ghost','hat','spider','skull','skullCrossbones','moon','broom','cat','crow','bone','flask','dungeon','mask']},
 {id:'lights',name:'Lights & magic',icons:['lights','wand','bolt','fire']},
 {id:'music',name:'Music & media',icons:['music','headphones','radio','volume','player','spotify','apple','youtube','video','camera']},
 {id:'general',name:'General',icons:['home','info','heart','support','link','calendar','clock','hourglass','download','notice','warning','queue','location','key','check','doubleCheck','vote','ticket','community']}
];
export function createIconPicker(onChoose,{id='icon-picker'}={}){
 const dialog=document.createElement('dialog');dialog.id=id;dialog.className='icon-picker';dialog.setAttribute('aria-labelledby',id+'-title');
 const searchId=id==='icon-picker'?'icon-search':id+'-search',defaultId=id==='icon-picker'?'default-icon':id+'-default',emptyId=id==='icon-picker'?'icon-empty':id+'-empty';
 dialog.innerHTML=`<div class="dialog-heading"><h2 id="${id}-title">Choose an icon</h2><button type="button" id="close-${id}" aria-label="Cancel icon choice">×</button></div><div class="icon-picker-tools"><label class="field"><span class="field-label">Search the library</span><input id="${searchId}" type="search" placeholder="Try lights, music or ghost"></label><div class="icon-categories" role="group" aria-label="Icon categories">${[{id:'all',name:'All icons'},...iconCategories].map(c=>`<button type="button" data-icon-category-filter="${c.id}" aria-pressed="false">${c.name}</button>`).join('')}</div><div class="icon-picker-summary"><p class="hint icon-count" role="status" aria-live="polite"></p><button id="${defaultId}" type="button">Use template default</button></div></div><div class="icon-results"><div class="icon-library" role="group" aria-label="Icon choices"></div><p id="${emptyId}" class="hint icon-empty" hidden>No matching icons. Try another word or choose All icons.</p></div>`;
 document.body.append(dialog);
 const search=dialog.querySelector('input'),grid=dialog.querySelector('.icon-library'),empty=dialog.querySelector('.icon-empty'),defaultButton=dialog.querySelector('#'+defaultId),results=dialog.querySelector('.icon-results');let target,current,focus,category='all';
 function paint(){
  const query=search.value.toLowerCase().trim();let count=0;
  grid.innerHTML=iconCategories.filter(c=>category==='all'||c.id===category).map(c=>{
   const rows=c.icons.filter(icon=>(icon+' '+iconLibrary[icon][0]+' '+(iconKeywords[icon]||'')+' '+c.name).toLowerCase().includes(query));count+=rows.length;
   return rows.length?`<section class="icon-category-section" aria-labelledby="${id}-group-${c.id}"><h3 id="${id}-group-${c.id}">${c.name}<span>${rows.length}</span></h3><div class="icon-grid">${rows.map(icon=>{const [name,css]=iconLibrary[icon];return `<button type="button" data-pick-icon="${icon}" aria-pressed="${current===icon}" class="${current===icon?'selected':''}"><i class="${css}" aria-hidden="true"></i><span>${name}</span></button>`;}).join('')}</div></section>`:'';
  }).join('');
  dialog.querySelectorAll('[data-icon-category-filter]').forEach(button=>{const active=button.dataset.iconCategoryFilter===category;button.setAttribute('aria-pressed',String(active));button.classList.toggle('selected',active);});
  dialog.querySelector('.icon-count').textContent=count+' '+(count===1?'icon':'icons');empty.hidden=!!count;results.scrollTop=0;
 }
 function choose(icon){dialog.close();onChoose(target,icon);}
 search.addEventListener('input',paint);
 dialog.querySelector('.icon-categories').addEventListener('click',event=>{const button=event.target.closest('[data-icon-category-filter]');if(button){category=button.dataset.iconCategoryFilter;paint();}});
 grid.addEventListener('click',event=>{const b=event.target.closest('[data-pick-icon]');if(b)choose(b.dataset.pickIcon);});
 defaultButton.addEventListener('click',()=>choose(null));dialog.querySelector('.dialog-heading button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(focus?.isConnected)focus.focus({preventScroll:true});});
 return {open(next,icon,button){target=next;current=icon;focus=button;search.value='';category='all';defaultButton.hidden=!next.role;dialog.querySelector('h2').textContent=next.role?'Choose '+iconRoles[next.role][0].toLowerCase().replace(/ icon$/, '')+' icon':next.category!==undefined?'Choose category icon':'Choose '+next.list.replace(/s$/,'')+' icon';paint();dialog.showModal();search.focus();}};
}
