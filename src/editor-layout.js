import {copyFields,messageCopyGroups} from './copy.js';

// Editor organisation only: saved field names and RF markup remain independent.
// Shared section ownership; templates specify their page placements.
export function createEditorGroups({landing='home',extraInformationPage='Home',guidanceInfo=false,playlistPage='music'}={}){
 const main=[11,13,7,26,21],music=[30,6,18,15,23,24,33],info=[17,28,10,29];
 if(extraInformationPage==='Info')info.splice(1,0,8);else main.splice(3,0,8);
 if(guidanceInfo)info.splice(2,0,19);else main.splice(1,0,19);
 if(playlistPage==='info')info.splice(3,0,25);else music.splice(-1,0,25);
 const groups=landing==='music'?{
  music:{name:'Music',panel:'music',sections:[...main,...music],description:'Music is your starting page in this template.'},
  info:{name:'Info',panel:'info',sections:info},
  support:{name:'Support',panel:'support',sections:[16,9]}
 }:{
  home:{name:'Home',panel:'home',sections:main},
  music:{name:'Music',panel:'music',sections:music},
  support:{name:'Support',panel:'support',sections:[16,9]},
  info:{name:'Info',panel:'info',sections:info}
 };
 return {...groups,setup:{name:'Site setup',sections:[1,2,3,4,14,31]},messages:{name:'Request messages',sections:[12],description:'Messages visitors see when requesting a song or voting.'}};
}
export const editorGroups=createEditorGroups();
export function editorNavigation(groups){
 const row=(page,title)=>{
  const items=Object.entries(groups).filter(([,g])=>!!g.panel===page);
  return `<div class="editor-group-row" role="group" aria-label="${title}"><span class="editor-group-label">${title}</span><div class="editor-group-buttons" style="--group-columns:${items.length}">${items.map(([key,g])=>`<button type="button" data-editor-group="${key}" aria-pressed="false">${g.name}<span class="group-alert" hidden></span></button>`).join('')}</div></div>`;
 };
 return '<div class="editor-groups" id="editor-groups">'+row(true,'Edit a viewer page')+row(false,'General settings')+'</div><p class="editor-area-help hint" id="editor-area-help" hidden></p>';
}
const fields=(...keys)=>keys.map(key=>{
 const field=copyFields.find(f=>f[0]===key);if(!field)throw Error('Unknown text field '+key);return field;
});
export const editorCopy={
 schedule:[['Schedule headings',fields('DATES_TITLE','HOURS_TITLE')]],
 listening:[['Listening heading & links',fields('LISTEN_TITLE','LISTEN_WAYS','LISTEN_FALLBACK')],['FM wording',fields('FM_INTRO','TUNE_SHORT')],['PulseMesh wording',fields('PULSE_INTRO','PULSE_BUTTON','PULSE_LISTEN_BUTTON','PULSE_PLATFORMS')]],
 navigation:[['Navigation labels',fields('NAV_HOME','NAV_MUSIC','NAV_SUPPORT','NAV_INFO')]],
 home:[['Link to Music on Home',fields('HOME_JUKEBOX_HELP','HOME_VOTING_HELP')],['Seasonal countdown',fields('COUNTDOWN_TITLE','COUNTDOWN_DAYS')]],
 countdownUnits:[['Full countdown labels',fields('COUNTDOWN_DAY_UNIT','COUNTDOWN_HOURS','COUNTDOWN_MINUTES','COUNTDOWN_SECONDS')]],
 status:[['On air / Off air',fields('ON_AIR','ON_AIR_HELP','OFF_AIR','OFF_AIR_HELP')]],
 songSelection:[['Request headings & instructions',fields('JUKEBOX_TITLE','JUKEBOX_HELP')],['Voting headings & instructions',fields('VOTING_TITLE','VOTING_HELP','VOTES_LABEL')],['Unavailable songs',fields('UNAVAILABLE_ROW_PREFIX')]],
 player:[['Now playing & Up next',fields('NOW_TITLE','NEXT_TITLE','EMPTY_NOW','EMPTY_NEXT')],['Request queue',fields('QUEUE_TITLE','QUEUE_HELP','EMPTY_QUEUE')]],
 filters:[['Filter wording',fields('FILTER_ALL')]],
 newFilter:[['New-song filter wording',fields('FILTER_NEW')]],
 offAir:[['Off-air message',fields('MUSIC_CLOSED_TITLE','MUSIC_CLOSED_TEXT')],['About the show link',fields('ABOUT_TITLE','ABOUT_HELP')]],
 queueLimit:[['Queue limit wording',fields('QUEUE_LIMIT_TEXT')]],
 counters:[['Queue count wording',fields('QUEUE_COUNT_LABEL')]],
 access:[['Display access code',fields('ACCESS_CODE_TITLE','ACCESS_CODE_HELP')]],
 support:[['Support introduction',fields('SUPPORT_TITLE','SUPPORT_TEXT')]],
 donations:[['Support button',fields('DONATE_BUTTON')],['Home & Info teaser',fields('DONATION_CALLOUT','DONATE_HINT')]],
 info:[['Info introduction',fields('INFO_TITLE','INFO_TEXT')]],
 faq:[['FAQ heading',fields('FAQ_TITLE')]],
 messages:messageCopyGroups
};

// Only complete a familiar bare www address. Never rewrite an explicit scheme.
export function completeWebAddress(value){
 const text=value.trim();
 if(!/^www\.[^\s]+$/i.test(text))return text;
 try{const url=new URL('https://'+text);if(!url.username&&!url.password&&/^www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(url.hostname))return 'https://'+text;}catch{}
 return text;
}

export const messagePreviews={
 SUCCESS_TITLE:{id:'requestSuccessful',modes:['jukebox','voting'],separate:true},
 FAILED_TITLE:{id:'requestFailed',modes:['jukebox','voting'],separate:true},
 PLAYING_TITLE:{id:'requestPlaying',modes:['jukebox','voting'],separate:true},
 FULL_TITLE:{id:'queueFull',modes:['jukebox']},
 INVALID_LOCATION_TITLE:{id:'invalidLocation',modes:['jukebox','voting'],location:true},
 CODE_TITLE:{id:'invalidLocationCode',modes:['jukebox','voting'],location:true},
 VOTED_TITLE:{id:'alreadyVoted',modes:['voting']},
 REQUESTED_TITLE:{id:'alreadyRequested',modes:['jukebox']},
 UNAVAILABLE_TITLE:{id:'sequenceUnavailable',modes:['jukebox','voting']},
 VOTE_LIMIT_TITLE:{id:'dailyVoteLimitReached',modes:['voting']}
};
