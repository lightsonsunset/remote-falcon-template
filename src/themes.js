// One viewer layout, two seasonal treatments. GPL-3.0-only.
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
