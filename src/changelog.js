// Editor-only release history and public progress. Never imported by viewer renderers.
import {updateStatus} from './update-status.js';

// Only released entries belong in the Released tab; local Unreleased notes stay in the file.
export function parseReleasedChanges(markdown){
 const releases=[];let release=null,group=null;
 for(const line of markdown.split(/\r?\n/)){
  if(line.startsWith('## ')){
   const title=line.slice(3).trim();
   release=/^Unreleased\b/i.test(title)?null:{title,groups:[]};
   if(release)releases.push(release);group=null;
  }else if(release&&line.startsWith('### ')){
   group={title:line.slice(4).trim(),items:[]};release.groups.push(group);
  }else if(release&&line.startsWith('- ')){
   if(!group){group={title:'',items:[]};release.groups.push(group);}
   group.items.push(line.slice(2));
  }
 }
 return releases;
}

export function createChangelog(){
 const dialog=document.getElementById('changelog-dialog'),open=document.getElementById('open-changelog');
 if(!document.getElementById('changelog-styles')){
  const style=document.createElement('link');style.id='changelog-styles';style.rel='stylesheet';
  style.href=new URL('./changelog.css',import.meta.url).href;document.head.append(style);
 }
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 const link=(text,href)=>{const a=el('a',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;};
 const inline=(node,text)=>{
  // Allow only emphasis/code. Embedded HTML remains literal text, never executable markup.
  for(const part of text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)){
   if(part.startsWith('**')&&part.endsWith('**'))node.append(el('strong',part.slice(2,-2)));
   else if(part.startsWith('`')&&part.endsWith('`'))node.append(el('code',part.slice(1,-1)));
   else node.append(document.createTextNode(part));
  }
 };
 const heading=el('div',null,'dialog-heading'),title=el('h2','What’s new'),close=el('button','×');
 title.id='changelog-title';close.id='close-changelog';close.type='button';close.setAttribute('aria-label','Close What’s new');
 heading.append(title,close);
 const tabs=el('div',null,'updates-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Update information');
 const panels={},buttons={};
 for(const [key,label] of [['released','Released'],['progress','In progress']]){
  const button=el('button',label);button.type='button';button.id='updates-tab-'+key;button.setAttribute('role','tab');
  button.setAttribute('aria-controls','updates-panel-'+key);tabs.append(button);buttons[key]=button;
  const panel=el('section');panel.id='updates-panel-'+key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;panels[key]=panel;
 }
 const reminder=el('section',null,'updates-reminder');reminder.setAttribute('aria-labelledby','updates-reminder-title');
 const reminderTitle=el('h3','Already using a template in Remote Falcon?');reminderTitle.id='updates-reminder-title';
 reminder.append(reminderTitle,
  el('p','Your installed RF page doesn’t update automatically. For new viewer features or styling fixes, open your saved design, export fresh HTML and update your RF viewer page. You don’t need to recreate your design.'),
  el('p','Customiser-only improvements don’t need a new export.','updates-small'));
 const content=el('div');content.id='changelog-content';content.setAttribute('aria-live','polite');
 const historyLink=el('p');historyLink.append(link('Read the full changelog ↗','CHANGELOG.md'));
 panels.released.append(reminder,content,historyLink);
 const progressIntro=el('p','A look at what’s being developed and what’s planned. These changes aren’t released yet, and plans may change.','updates-intro');
 const reviewed=el('p',null,'updates-reviewed'),time=el('time');
 time.dateTime=updateStatus.reviewed;time.textContent=new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'long',year:'numeric',timeZone:'Australia/Sydney'}).format(new Date(updateStatus.reviewed+'T00:00:00Z'));
 reviewed.append('Last reviewed ',time);
 panels.progress.append(progressIntro,reviewed);
 const progressSection=el('section',null,'updates-section');progressSection.append(el('h3','In development'));
 if(!updateStatus.inProgress.length)progressSection.append(el('p','No active development items are listed at the moment.'));
 for(const item of updateStatus.inProgress){
  const card=el('article',null,'updates-item');card.append(el('h4',item.title),el('p',item.templates.join(' · '),'updates-scope'),el('p',item.description));progressSection.append(card);
 }
 const themeSection=el('section',null,'updates-section');
 themeSection.append(el('h3','Planned themes'),el('p','For both '+updateStatus.themeTemplates.join(' and ')+'.','updates-scope'));
 const themeList=el('ul',null,'updates-themes');
 for(const theme of updateStatus.plannedThemes)themeList.append(el('li',theme));
 themeSection.append(themeList,el('p','Planned next; release dates haven’t been set.','updates-small'));
 const issues=el('section',null,'updates-section');
 issues.append(el('h3','Known issues'));
 if(!updateStatus.knownIssues.length)issues.append(el('p','No open issues are currently listed here. Found something that isn’t working?'));
 for(const issue of updateStatus.knownIssues){
  const card=el('article',null,'updates-item');card.append(el('h4',issue.title),el('p',issue.templates.join(' · ')+' · '+issue.status,'updates-scope'),el('p',issue.description));
  if(issue.workaround)card.append(el('p','Workaround: '+issue.workaround));issues.append(card);
 }
 issues.append(link('Report a problem ↗','https://github.com/lightsonsunset/remote-falcon-template/issues/new/choose'));
 panels.progress.append(progressSection,themeSection,issues);
 const top=el('div',null,'updates-header');top.append(heading,tabs);
 dialog.replaceChildren(top,panels.released,panels.progress);
 let loaded=false,loading=false;
 async function loadHistory(){
  if(loaded||loading)return;
  loading=true;content.setAttribute('aria-busy','true');content.textContent='Loading released updates…';
  try{
   const response=await fetch('CHANGELOG.md');if(!response.ok)throw Error('Unavailable');
   const releases=parseReleasedChanges(await response.text());if(!releases.length)throw Error('Empty');
   const fragment=document.createDocumentFragment();
   for(const release of releases){
    const article=el('article',null,'updates-release');article.append(el('h3',release.title));
    for(const group of release.groups){
     if(group.title)article.append(el('h4',group.title));
     const list=el('ul');for(const item of group.items){const li=el('li');inline(li,item);list.append(li);}article.append(list);
    }fragment.append(article);
   }
   content.replaceChildren(fragment);loaded=true;
  }catch{
   const message=el('p','Release history couldn’t be loaded. Try again or open the full changelog below.');
   const retry=el('button','Try again');retry.type='button';retry.addEventListener('click',loadHistory);content.replaceChildren(message,retry);
  }finally{loading=false;content.setAttribute('aria-busy','false');}
 }
 function select(key,focus=false){
  for(const name of Object.keys(buttons)){
   const active=name===key;buttons[name].setAttribute('aria-selected',String(active));buttons[name].tabIndex=active?0:-1;panels[name].hidden=!active;
  }
  dialog.scrollTop=0;if(focus)buttons[key].focus({preventScroll:true});
  if(key==='released'&&dialog.open)void loadHistory();
 }
 for(const [key,button] of Object.entries(buttons)){
  button.addEventListener('click',()=>select(key,true));
  button.addEventListener('keydown',event=>{
   const keys=Object.keys(buttons),index=keys.indexOf(key);let next;
   if(event.key==='ArrowRight')next=keys[(index+1)%keys.length];
   if(event.key==='ArrowLeft')next=keys[(index+keys.length-1)%keys.length];
   if(event.key==='Home')next=keys[0];if(event.key==='End')next=keys.at(-1);
   if(next){event.preventDefault();select(next,true);}
  });
 }
 select('released');
 open.addEventListener('click',()=>{dialog.showModal();select('released',true);});
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(open.isConnected&&!open.disabled)open.focus({preventScroll:true});});
}
