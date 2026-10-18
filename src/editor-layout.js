import {copyFields,messageCopyGroups} from './copy.js';

// Editor organisation only: saved field names and RF markup remain independent.
export const editorGroups={
 home:{name:'Home',sections:[11,19,13,20,7,8,26,21],panel:'home'},
 music:{name:'Music',sections:[30,6,32,18,22,23,24,25,15],panel:'music'},
 support:{name:'Support',sections:[16,9],panel:'support'},
 info:{name:'Info',sections:[17,27,28,10,29],panel:'info'},
 setup:{name:'Site setup',sections:[1,2,3,4,5,31,14]},
 messages:{name:'Song messages',sections:[12]}
};
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
 music:[['Requests & voting',fields('JUKEBOX_TITLE','JUKEBOX_HELP','VOTING_TITLE','VOTING_HELP','VOTES_LABEL')],['Now Playing & queue',fields('NOW_TITLE','NEXT_TITLE','QUEUE_TITLE','QUEUE_HELP','EMPTY_NOW','EMPTY_NEXT','EMPTY_QUEUE')],['Filters & unavailable songs',fields('FILTER_ALL','FILTER_NEW','UNAVAILABLE_ROW_PREFIX')],['When the show is off',fields('MUSIC_CLOSED_TITLE','MUSIC_CLOSED_TEXT','ABOUT_TITLE','ABOUT_HELP')]],
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
