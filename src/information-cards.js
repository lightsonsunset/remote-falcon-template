// One ordered model, retaining the original first-card keys in saved designs.
export const informationFields={title:'homeCardTitle',text:'homeCardText',image:'homeCardImage',link:'homeCardLink',linkLabel:'homeCardLinkLabel'};
export const newInformationCard=()=>({title:'',text:'',image:'',link:'',linkLabel:'Find out more'});
export function informationCards(s){return [Object.fromEntries(Object.entries(informationFields).map(([part,key])=>[part,s[key]||''])),...(s.extraInfoCards||[]).map(row=>({...row}))];}
export function setInformationCards(s,rows){
 if(rows.length>5)throw Error('Use up to five extra-information cards.');
 if(!rows.length){s.homeCard=false;rows=[{...newInformationCard(),title:s.theme==='halloween'?'Something spooktacular':'A little extra magic'}];}
 for(const [part,key] of Object.entries(informationFields))s[key]=rows[0][part]||'';
 s.extraInfoCards=rows.slice(1).map(row=>({...row}));return s;
}
export const informationKey=(i,part)=>i===0?informationFields[part]:`extraInfoCards.${i-1}.${part}`;
export function checkedInformationCards(rows=[]){
 if(!Array.isArray(rows)||rows.length>4)throw Error('Use up to five extra-information cards.');
 return rows.map(row=>Object.fromEntries(Object.keys(informationFields).map(part=>{
  const value=row?.[part];if(typeof value!=='string'||value.length>20000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error('Invalid extra-information '+part);return [part,value];
 })));
}
export function validateInformation(s,isHTTPS){
 const errors={};if(!s.homeCard)return errors;
 informationCards(s).forEach((row,i)=>{
  for(const part of ['title','text'])if(!row[part].trim())errors[informationKey(i,part)]='Complete this card, or remove it.';
  for(const part of ['link','image'])if(row[part]&&!isHTTPS(row[part]))errors[informationKey(i,part)]='Use a full HTTPS '+(part==='image'?'image ':'')+'link.';
  if(row.link&&!row.linkLabel.trim())errors[informationKey(i,'linkLabel')]='Add a short button label.';
 });return errors;
}
export function renderInformation(s,e,isHTTPS){
 if(!s.homeCard)return '';
 return informationCards(s).map(row=>{
  const image=isHTTPS(row.image)?`<img class="extra-info-image" src="${e(row.image)}" alt="">`:'';
  const content=`<h2>${e(row.title.trim()||'Extra information')}</h2><p>${e(row.text.trim()||'Your extra information message will appear here.')}</p>${isHTTPS(row.link)?`<a class="support-action" href="${e(row.link)}" target="_blank" rel="noopener noreferrer">${e(row.linkLabel.trim()||'Find out more')}</a>`:''}`;
  return `<div class="section-card home-extra${image?' extra-info-with-image':''}">${image}${image?'<div class="extra-info-content">'+content+'</div>':content}</div>`;
 }).join('');
}
export const informationCSS='.extra-info-with-image{display:flex;align-items:flex-start;gap:14px}.extra-info-with-image .extra-info-image{width:64px;height:64px;flex:0 0 64px;object-fit:contain;border-radius:8px}.extra-info-content{min-width:0;flex:1}.home-extra p{white-space:pre-line;overflow-wrap:anywhere}';
