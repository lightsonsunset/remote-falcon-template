import {themes} from './themes.js';
// Visitor text only. RF IDs, tokens, rules and navigation destinations are not editable.
// [key, field label, default, long text?] — seasonal defaults may override these.
export const pageCopyGroups=[
 ['Home & listening',[
 ['LISTEN_TITLE','Listening card title','To Hear the Music'],['DATES_TITLE','Dates heading','Show Dates'],['HOURS_TITLE','Hours heading','Show Hours'],['COUNTDOWN_TITLE','Countdown heading','Countdown to Christmas'],['COUNTDOWN_DAYS','Countdown label','days to go'],
 ['HOME_JUKEBOX_HELP','Text below the request button',"See what's playing and add your pick to the queue.",true],['HOME_VOTING_HELP','Text below the voting button','Pick your favourite and help choose what plays next.',true],
 ['COUNTDOWN_DAY_UNIT','Full countdown: days label','Days'],['COUNTDOWN_HOURS','Hours label','Hours'],['COUNTDOWN_MINUTES','Minutes label','Minutes'],['COUNTDOWN_SECONDS','Seconds label','Seconds'],
 ['FM_INTRO','Text before the FM frequency','Tune your car radio to'],['TUNE_SHORT','Short FM reminder on Music','Tune to'],['LISTEN_WAYS','Listening link text','Ways to listen'],['PULSE_INTRO','PulseMesh introduction','At the show? Open PulseMesh and select our display to listen.',true],['PULSE_BUTTON','PulseMesh button text','Download PulseMesh'],['PULSE_PLATFORMS','Text below the download button','For iPhone and Android'],['LISTEN_FALLBACK','Text when no listening details are entered','Listening details will be announced soon.',true]
 ]],
 ['Music',[
 ['JUKEBOX_TITLE','Request heading / Home button','Request a Song'],['JUKEBOX_HELP','Request instructions','Tap a song to add it to the queue.',true],['VOTING_TITLE','Voting heading / Home button','Vote for the Next Song'],['VOTING_HELP','Voting instructions','Tap your favourite. The song with the most votes plays next.',true],
 ['QUEUE_COUNT_LABEL','Queue count label','Songs waiting (including Up Next)'],['ACCESS_CODE_TITLE','Access code heading','Display access code'],['ACCESS_CODE_HELP','Access code instructions','Enter the code shown at the display, then choose a song.',true],
 ['NOW_TITLE','Now Playing heading','Now Playing'],['NEXT_TITLE','Next song heading','Up Next'],['QUEUE_TITLE','Queue heading','Request Queue'],['QUEUE_HELP','Queue instructions (optional)','',true],['MUSIC_CLOSED_TITLE','Music closed heading','Choose the Music During Show Hours'],['MUSIC_CLOSED_TEXT','Music closed explanation','The lights are taking a break. Come back during show hours to choose a favourite.',true],['ABOUT_TITLE','Info link heading','About the Show'],['ABOUT_HELP','Info link explanation','Find show times and ways to listen.',true],['FILTER_ALL','All filter','All'],['FILTER_NEW','NEW filter','New this year'],['VOTES_LABEL','Vote count label','votes']
 ]],
 ['Support & Info',[
 ['SUPPORT_TITLE','Support page heading','Share the Christmas Spirit'],['SUPPORT_TEXT','Support introduction','Thank you for being part of the show. Your smiles, kind words and consideration for our neighbours help make this a special time of year.',true],['DONATION_CALLOUT','Teaser heading','Support {charity} this {season}.',true],['DONATE_BUTTON','Button text','Donate to {charity}'],['DONATE_HINT','Teaser helper text','Tap to donate'],['INFO_TITLE','Info page heading','Show Info'],['INFO_TEXT','Info introduction','Welcome to {show}. Here is how to listen and join in.',true],['FAQ_TITLE','FAQ section heading','FAQ']
 ]],
 ['Navigation',[
 ['NAV_HOME','Home button label','Home'],['NAV_MUSIC','Music button label','Music'],['NAV_SUPPORT','Support button label','Support'],['NAV_INFO','Info button label','Info']
 ]]
];
export const statusCopyGroups=[
 ['Show status',[
 ['ON_AIR','On-air title','On air'],['ON_AIR_HELP','On-air explanation','The show is live'],['OFF_AIR','Off-air title','Off air'],['OFF_AIR_HELP','Off-air explanation','Back during show hours']
 ]],
 ['Waiting & unavailable songs',[
 ['EMPTY_NOW','Nothing playing','Waiting for the next song',true],['EMPTY_NEXT','Nothing queued next','No song queued yet',true],['EMPTY_QUEUE','Empty queue','Queue is open',true],['UNAVAILABLE_ROW_PREFIX','Explanation for unavailable songs','Giving other favourites a turn.',true]
 ]]
];
export const messageCopyGroups=[
 ['Success',[
 ['SUCCESS_TITLE','Title',"You're on the nice list!"],['SUCCESS_JUKEBOX','Jukebox explanation','Great choice! Your song is in the queue. Santa approves of your taste!',true],['SUCCESS_VOTING','Voting explanation','Your vote is in! Santa approves of your taste. The most-voted song plays next.',true]
 ]],
 ['Could not confirm',[
 ['FAILED_TITLE','Title','A little tinsel tangle...'],['FAILED_JUKEBOX','Jukebox explanation',"We couldn't confirm your request. Check the queue before trying again.",true],['FAILED_VOTING','Voting explanation',"We couldn't confirm your vote. Check the song's vote count before trying again.",true]
 ]],
 ['Already playing, queued or limited',[
 ['PLAYING_TITLE','Title','Great minds, great tunes!'],['PLAYING_JUKEBOX','Jukebox explanation','This song is already playing, queued, or at its request limit. Choose another favourite!',true],['PLAYING_VOTING','Voting explanation',"This song is already playing or isn't available for another pick yet. Choose another favourite!",true]
 ]],
 ['Queue full', [['FULL_TITLE','Title',"Santa's playlist is full!"],['FULL_MESSAGE','Explanation',"The queue is full for now. Try again after a song plays and there's room for more cheer.",true]]],
 ['Location could not be confirmed', [['INVALID_LOCATION_TITLE','Title',"Let's get you connected"],['LOCATION_MESSAGE','Explanation',"We couldn't confirm your location. If you're at the display, use the help below to join the festive fun.",true]]],
 ['Incorrect location code', [['CODE_TITLE','Title','Check your Christmas code'],['CODE_MESSAGE','Explanation',"That code wasn't accepted. Check the display code and give it another try.",true]]],
 ['Already voted', [['VOTED_TITLE','Title','Your festive vote is in!'],['VOTED_MESSAGE','Explanation',"You've already voted this round. Enjoy the sparkle and vote again in the next one.",true]]],
 ['Already requested', [['REQUESTED_TITLE','Title','Save a little cheer!'],['REQUESTED_MESSAGE','Explanation','Your request is already in for this round. You can pick again when the next song starts.',true]]],
 ['Song unavailable', [['UNAVAILABLE_TITLE','Title','A little sleigh break'],['UNAVAILABLE_MESSAGE','Explanation',"This song isn't available right now. Pick another favourite to keep the cheer going.",true]]],
 ['Vote limit reached', [['VOTE_LIMIT_TITLE','Title',"That's a wrap for your votes!"],['VOTE_LIMIT_MESSAGE','Explanation',"You've used your votes for this show. Settle in and enjoy the Christmas magic!",true]]]
];
// Retain these saved values without offering an unsupported RF message.
export const legacyCopyFields=[['LOCATION_TITLE','Title','',false],['LOCATION_NOTICE_MESSAGE','Explanation','',true]];
export const copyFields=[...pageCopyGroups,...statusCopyGroups,...messageCopyGroups].flatMap(g=>g[1]);
export const copyDefaults=theme=>({...Object.fromEntries(copyFields.map(f=>[f[0],f[2]])),...themes[theme].copy});
export const copyFor=s=>({...copyDefaults(s.theme),...Object.fromEntries(Object.entries(s.copy).filter(([key])=>copyFields.some(f=>f[0]===key)))});
export const formatCopy=(text,s)=>text.replace(/\{(show|charity|season|frequency)\}/g,(_,key)=>({show:s.name,charity:s.charity,season:themes[s.theme].name,frequency:s.frequency})[key]);
