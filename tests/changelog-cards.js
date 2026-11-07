import {registry} from '../src/template-registry.js';
import {createDesignStore} from '../src/design-store.js';
import {parseReleasedChanges,releaseHeading,needsNewHTML} from '../src/changelog.js';
const frame=document.querySelector('#editor'),run=document.querySelector('#run'),results=document.querySelector('#results'),q=s=>frame.contentDocument.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms));
const check=(label,ok)=>{const li=document.createElement('li');li.className=ok?'pass':'fail';li.textContent=(ok?'PASS - ':'FAIL - ')+label;results.append(li);};
const reload=()=>new Promise(r=>{frame.onload=()=>setTimeout(r,500);frame.contentWindow.location.reload();});
run.onclick=async()=>{run.disabled=true;results.replaceChildren();const original={...localStorage};try{
 const actual=parseReleasedChanges(await(await fetch('../CHANGELOG.md')).text());
 for(const t of registry){localStorage.clear();const store=createDesignStore(localStorage);store.select(t.id,'christmas');store.save(store.read());await reload();const before=JSON.stringify({...localStorage});q('#open-changelog').click();
 for(let i=0;i<100&&!q('.updates-release');i++)await wait(50);
 const cards=[...frame.contentDocument.querySelectorAll('.updates-release')],first=cards[0],meta=releaseHeading(actual[0].title);
 check(t.id+' actual release count and newest metadata',cards.length===actual.length&&first.querySelector('h3').firstChild.textContent===meta.title&&first.querySelector('.updates-release-version').textContent===meta.version&&first.querySelector('.updates-release-date').textContent===meta.date);
 check(t.id+' exact audited badge scopes match real release groups',cards.every((card,index)=>{const release=actual[index],expected=release.groups.filter(g=>g.title&&needsNewHTML(release,g.title)).length+(needsNewHTML(release)?1:0);return card.querySelectorAll('.updates-export-badge').length===expected;}));
 check(t.id+' exact approved export guidance uses inline badge',q('.updates-reminder p').textContent==="Your Remote Falcon page won't update automatically. Changes marked Update HTML require you to export fresh HTML from the customiser and replace the existing HTML in Remote Falcon to apply those updates or fixes."&&q('.updates-reminder').querySelectorAll('p').length===1&&q('.updates-reminder p .updates-export-badge').textContent==='Update HTML');
 check(t.id+' only newest starts open',first.open&&cards.slice(1).every(c=>!c.open));
 check(t.id+' exactly one Latest badge',frame.contentDocument.querySelectorAll('.updates-latest').length===1);
 check(t.id+' native semantic disclosure',first.tagName==='DETAILS'&&first.firstElementChild.tagName==='SUMMARY');
 first.firstElementChild.click();check(t.id+' latest collapses',!first.open);first.firstElementChild.click();check(t.id+' latest reopens',first.open);
 cards[1].firstElementChild.click();check(t.id+' older opens independently',cards[1].open&&first.open);
 check(t.id+' groups and complete real release bullets retained',first.querySelectorAll('li').length===actual[0].groups.reduce((n,g)=>n+g.items.length,0));
 q('#updates-tab-progress').click();check(t.id+' progress and known issues retained',q('#updates-panel-released').hidden&&!q('#updates-panel-progress').hidden&&q('#updates-panel-progress').textContent.includes('Known issues'));
 q('#updates-tab-released').click();check(t.id+' tab return preserves disclosures',first.open&&cards[1].open);
 q('#close-changelog').click();await wait(40);check(t.id+' close returns focus',frame.contentDocument.activeElement===q('#open-changelog'));
 q('#open-changelog').click();check(t.id+' reopen preserves loaded cards',q('.updates-release')===first);q('#close-changelog').click();
 check(t.id+' browsing never changes saved state',JSON.stringify({...localStorage})===before);
 }
}catch(e){check(e.stack,false);}finally{localStorage.clear();for(const [k,v] of Object.entries(original))localStorage.setItem(k,v);run.disabled=false;document.querySelector('#status').textContent=results.children.length+' checks, '+results.querySelectorAll('.fail').length+' failures';}};
