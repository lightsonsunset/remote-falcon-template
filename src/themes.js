// Shared seasonal identity and starter content. GPL-3.0-only.
export const themes = {
  christmas: {
    name: 'Christmas', description: 'Evergreen, cranberry & warm gold', icon: 'fa-star',
    showName: 'Your Christmas Show', welcome: 'A little Christmas magic, shared with you.',
    categories: ['Christmas', 'Non Christmas'], holiday: 'Christmas Eve / Day',
    colours: {home:'#da3049',music:'#1b9b56',support:'#316dcb',info:'#b8841e',card:'#1b1b24',gold:'#f3d995',text:'#f6f4f8',secondary:'#c4c3cf'},
    accents: ['#ffb3bd','#8be9b4','#a8c7ff','#ffe08b'],
    copy: {
      SEASON: 'Christmas', SUPPORT_TITLE: 'Share the Christmas Spirit',
      SUCCESS_TITLE: "You're on the nice list!", SUCCESS_JUKEBOX: 'Great choice! Your song is in the queue. Santa approves of your taste!',
      SUCCESS_VOTING: 'Your vote is in! Santa approves of your taste. The most-voted song plays next.',
      FAILED_TITLE: 'A little tinsel tangle...', FULL_TITLE: "Santa's playlist is full!",
      FULL_MESSAGE: "The queue is full for now. Try again after a song plays and there's room for more cheer.",
      LOCATION_MESSAGE: "We couldn't confirm your location. If you're at the display, use the help below to join the festive fun.",
      CODE_TITLE: 'Check your Christmas code', VOTED_TITLE: 'Your festive vote is in!',
      VOTED_MESSAGE: "You've already voted this round. Enjoy the sparkle and vote again in the next one.",
      REQUESTED_TITLE: 'Save a little cheer!', LOCATION_TITLE: 'One step before the sparkle',
      UNAVAILABLE_TITLE: 'A little sleigh break', UNAVAILABLE_MESSAGE: "This song isn't available right now. Pick another favourite to keep the cheer going.",
      VOTE_LIMIT_MESSAGE: "You've used your votes for this show. Settle in and enjoy the Christmas magic!"
    },
    demoSongs: ['Winter Starlight','Sleigh Bells at Sunset','A Little Christmas Sparkle','Dance Under the Lights','One More Rainbow','Twinkling Together','The Christmas Light Parade']
  },
  halloween: {
    name: 'Halloween', description: 'Pumpkin orange, violet & eerie green', icon: 'fa-ghost',
    showName: 'Your Halloween Show', welcome: 'A little spooky magic, shared with you.',
    categories: ['Halloween', 'Party favourites'], holiday: 'Halloween night',
    colours: {home:'#e27826',music:'#864ac9',support:'#45a87d',info:'#b65892',card:'#211c2d',gold:'#ffba71',text:'#faf4ff',secondary:'#d0c4dd'},
    accents: ['#ffc58d','#d4b1ff','#9ce6bb','#f2b2d8'],
    copy: {
      SEASON: 'Halloween', COUNTDOWN_TITLE:'Countdown to Halloween', SUPPORT_TITLE: 'A Little Kindness, a Little Magic',
      SUCCESS_TITLE: 'A frightfully good choice!', SUCCESS_JUKEBOX: 'Your song is in the queue. Let the spooky soundtrack begin!',
      SUCCESS_VOTING: 'Your vote is in! The most-voted song gets the next turn to haunt the speakers.',
      FAILED_TITLE: 'A little ghost in the machine...', FULL_TITLE: 'A full house of haunting tunes!',
      FULL_MESSAGE: "The queue is full for now. Try again after a song plays and there's room for another treat.",
      LOCATION_MESSAGE: "We couldn't confirm your location. If you're at the display, use the help below to join the spooky fun.",
      CODE_TITLE: 'Check your Halloween code', VOTED_TITLE: 'Your spooky vote is in!',
      VOTED_MESSAGE: "You've already voted this round. Enjoy the spooky lights and vote again in the next one.",
      REQUESTED_TITLE: 'Save a little spooky magic!', LOCATION_TITLE: 'One step before the spooky fun',
      UNAVAILABLE_TITLE: 'Taking a little ghost break', UNAVAILABLE_MESSAGE: "This song isn't available right now. Pick another favourite to keep the spooky fun going.",
      VOTE_LIMIT_MESSAGE: "You've used your votes for this show. Settle in and enjoy the Halloween magic!"
    },
    demoSongs: ['Moonlit Mischief','Pumpkin Parade','A Little Midnight Magic','Dance Under the Lights','One More Rainbow','Lanterns After Dark','The Monster Light Parade']
  }
};

const gatheringCopy = {
 SUCCESS_TITLE:'A lovely choice!', SUCCESS_JUKEBOX:'Your song is in the queue. Enjoy the lights together!',
 SUCCESS_VOTING:'Your vote is in! The most-voted song plays next.', FAILED_TITLE:'A little hiccup…',
 FULL_TITLE:'The playlist is full for now', FULL_MESSAGE:'Try again after a song plays and there is room for another favourite.',
 LOCATION_MESSAGE:'We could not confirm your location. If you are at the display, use the help below to join in.',
 CODE_TITLE:'Check your display code', VOTED_TITLE:'Your vote is already in!',
 VOTED_MESSAGE:'Enjoy the lights and vote again in the next round.', REQUESTED_TITLE:'Your request is already in!',
 LOCATION_TITLE:'One step before the lights', UNAVAILABLE_TITLE:'Taking a short break',
 UNAVAILABLE_MESSAGE:'This song is not available right now. Pick another favourite to keep the music going.',
 VOTE_LIMIT_MESSAGE:'You have used your votes for this show. Settle in and enjoy the lights!'
};
themes.thanksgiving={
 name:'Thanksgiving',description:'Turkey, autumn leaves & a warm welcome',symbol:'❧',icon:'fa-leaf',brandIcon:'leaf',defaultFont:'elegant',
 showName:'Your Thanksgiving Show',welcome:'Gather together. Give thanks. Enjoy the lights.',
 categories:['Harvest favourites','Party favourites'],holiday:'Thanksgiving',dateExample:'Your November show dates',tile:'',caption:'',
 colours:{home:'#412818',music:'#28382a',support:'#39232b',info:'#3f301b',card:'#302018',gold:'#f5c27b',text:'#fff3df',secondary:'#dcc7b1'},
 accents:['#ffd29b','#f6d68e','#e6b5b3','#d5dfac'],
 copy:{...gatheringCopy,SEASON:'Thanksgiving',
   ON_AIR_HELP:'Gather round and enjoy the lights',OFF_AIR_HELP:'Thanks for stopping by - see you next show',
   LISTEN_TITLE:'Settle In for the Music',LISTEN_FALLBACK:'Listening details are coming soon. Thanks for joining us.',
   HOME_JUKEBOX_HELP:'Choose a favourite to share with everyone.',HOME_VOTING_HELP:'Vote for a favourite and enjoy the lights together.',
   MUSIC_CLOSED_TITLE:'More Lights to Share Next Show',MUSIC_CLOSED_TEXT:'The lights are resting for now. Check our show hours and join us for another evening together.',
   INFO_TEXT:'Welcome to {show}! Gather your favourite people and enjoy the lights together. Here is how to join in.',
   SUPPORT_TITLE:'Share a Little Kindness',SUPPORT_TEXT:'Thank you for sharing this evening with us. Your smiles, kindness and care for our neighbours help make the show special.',
   SUCCESS_TITLE:'A little more to be thankful for!'
  },
 demoSongs:['Harvest Moonlight','Lanterns in the Leaves','Together at the Table','Dance Under the Lights','Golden Evening','A Little Gratitude','The Autumn Light Parade']
};
themes['australia-day']={
 name:'Australia Day',description:'Flag blue, green & gold, Aussie summer fun',symbol:'☀',icon:'fa-sun',brandIcon:'sun',defaultFont:'rounded',
 showName:'Your Australia Day Show',welcome:'G’day! Bring your mates and enjoy the lights.',
 categories:['Aussie favourites','Party favourites'],holiday:'Australia Day',dateExample:'For example: 24–26 January',tile:'26',caption:'JAN',
 colours:{home:'#072349',music:'#082e20',support:'#102b52',info:'#073226',card:'#063c26',gold:'#ffcd00',text:'#f4f8f9',secondary:'#d0dfd5'},
 accents:['#ffcd00','#ffcd00','#ffcd00','#ffcd00'],
 copy:{...gatheringCopy,SEASON:'Australia Day',
   ON_AIR_HELP:'Snags are cooking, enjoy the tunes',OFF_AIR_HELP:'Knocked off for the day',
   LISTEN_TITLE:'Get the Tunes Going',LISTEN_FALLBACK:'Hang tight, mate. Listening details are coming soon.',
   HOME_JUKEBOX_HELP:'See what’s playing and pop a favourite in the queue.',HOME_VOTING_HELP:'Give your favourite a vote and help pick the next tune.',
   JUKEBOX_TITLE:'Request a Tune',JUKEBOX_HELP:'Tap a tune to pop it in the queue.',
   VOTING_TITLE:'Vote for the Next Tune',VOTING_HELP:'Give your favourite a vote. The tune with the most votes plays next.',
   MUSIC_CLOSED_TITLE:'More Tunes Next Show',MUSIC_CLOSED_TEXT:'We’ll be back for another round of lights and tunes. Check the show hours and swing by, mate.',
   ABOUT_TITLE:'The Show Lowdown',ABOUT_HELP:'Show hours and how to hear the tunes.',
   INFO_TITLE:'The Show Lowdown',INFO_TEXT:'G’day and welcome to {show}! Here’s how to tune in and join the fun.',
   SUPPORT_TITLE:'Give a Little, Help a Mate',SUPPORT_TEXT:'Cheers for being part of the show. A friendly wave and a bit of care for the neighbours go a long way.',
   SUCCESS_TITLE:'Good on ya!',SUCCESS_JUKEBOX:'Your song is in the queue. Settle in for a ripper light show!',SUCCESS_VOTING:'Good choice, mate! Your vote is in. The most-voted tune plays next.',
   FULL_TITLE:'Chock-a-block for now',FULL_MESSAGE:'The queue is full for now. Try again after a song plays and there’s room for another favourite.',
   VOTED_TITLE:'Your vote’s already in, mate!',REQUESTED_TITLE:'Your pick’s already in!',
   UNAVAILABLE_TITLE:'This tune’s having a breather',UNAVAILABLE_MESSAGE:'This tune isn’t available right now. Have a go at another favourite.'
  },
 demoSongs:['Under Southern Stars','Summer at Sunset','Green and Golden','Dance Under the Lights','Backyard Celebration','G’day, Starlight','The Aussie Light Parade']
};
themes['us-patriotic']={
 name:'US Patriotic',description:'Stars, stripes & Fourth of July celebrations',symbol:'★',icon:'fa-star',brandIcon:'star',defaultFont:'rounded',
 showName:'Your Patriotic Show',welcome:'Stars, stripes and favourite tunes.',
 categories:['Patriotic favourites','Party favourites'],holiday:'Fourth of July',dateExample:'For example: 3-5 July',tile:'4',caption:'JUL',
 colours:{home:'#091b3b',music:'#102b52',support:'#391827',info:'#14294c',card:'#173765',gold:'#d6e7ff',text:'#f7f5ef',secondary:'#dbe5f4'},
 accents:['#d6e7ff','#d6e7ff','#ffd3d9','#d6e7ff'],
 copy:{...gatheringCopy,SEASON:'US Patriotic',ON_AIR_HELP:'Let the celebration shine',OFF_AIR_HELP:'More stars and tunes next show',
  LISTEN_TITLE:'Tune In to the Celebration',LISTEN_FALLBACK:'Listening details are coming soon. Get ready for lights and favourite tunes.',
  HOME_JUKEBOX_HELP:'Pick a favourite and join the celebration.',HOME_VOTING_HELP:'Vote for your favourite and let it shine.',
  MUSIC_CLOSED_TITLE:'The Next Celebration Is Coming',MUSIC_CLOSED_TEXT:'Check the show hours and join us for another evening of stars, stripes and music.',
  INFO_TEXT:'Welcome to {show}! Bring your favourite people and enjoy the celebration. Here is how to join in.',
  SUPPORT_TITLE:'Share the Spirit',SUPPORT_TEXT:'Thanks for celebrating with us. Your kindness and care for our neighbours help make the show special.',
  SUCCESS_TITLE:'A star-spangled choice!',SUCCESS_JUKEBOX:'Your song is in the queue. Let the celebration shine!'},
 demoSongs:['Stars at Sunset','Red White and Brilliant','A Sky Full of Sparkles','Dance Under the Lights','Summer Celebration','Together We Shine','The Starlight Parade']
};
themes['valentines-day']={
 name:'Valentine’s Day',description:'Roses, chocolate & a little love in lights',symbol:'♥',icon:'fa-heart',brandIcon:'heart',defaultFont:'elegant',
 showName:'Your Valentine’s Show',welcome:'A little love, a little light, and your favourite songs.',
 categories:['Love songs','Party favourites'],holiday:'Valentine’s Day',dateExample:'For example: 12-14 February',tile:'14',caption:'FEB',
 colours:{home:'#321322',music:'#3c182b',support:'#3b2028',info:'#422039',card:'#5a233a',gold:'#ffb7ca',text:'#fff8f4',secondary:'#f1d0d9'},
 accents:['#ffb7ca','#ffb7ca','#ffd6c3','#f0c4e6'],
 copy:{...gatheringCopy,SEASON:'Valentine’s Day',ON_AIR_HELP:'Love is in the lights',OFF_AIR_HELP:'Saving a little sparkle for next time',
  LISTEN_TITLE:'A Soundtrack to Share',LISTEN_FALLBACK:'Listening details are coming soon. Stay for a little love and light.',
  HOME_JUKEBOX_HELP:'Choose a song to share with someone special.',HOME_VOTING_HELP:'Give your favourite a little love with a vote.',
  MUSIC_CLOSED_TITLE:'More Love and Lights Next Show',MUSIC_CLOSED_TEXT:'Our lights are resting for now. Check the show hours and join us for another evening together.',
  INFO_TEXT:'Welcome to {show}! Share a little joy with the people you love. Here is how to join in.',
  SUPPORT_TITLE:'Share a Little Love',SUPPORT_TEXT:'Thank you for sharing the lights with us. A little kindness and care for our neighbours make the evening sweeter.',
  SUCCESS_TITLE:'Love that choice!',SUCCESS_JUKEBOX:'Your song is in the queue. A little more love in the lights!'},
 demoSongs:['Love in the Lights','Roses at Sunset','Chocolate Hearts','Dance Under the Lights','A Song to Share','Together Tonight','The Sweetheart Parade']
};
export const isNewSeason=theme=>!['christmas','halloween'].includes(theme)&&Object.hasOwn(themes,theme);
export const hasCountdown=theme=>['christmas','halloween'].includes(theme);
export const dateExample=theme=>themes[theme].dateExample||(theme==='christmas'?'For example: 5–25 December':'For example: 24–31 October');
