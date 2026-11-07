// Welcome is independent of visitor guidance. Only status follows native RF availability.
export const welcomeDefaults={welcomeStyle:'plain',welcomePosition:'header',customWelcomeColours:false,welcomeCardColour:'#263746',welcomeTextColour:'#ffffff'};
export const welcomeStyles=['plain','card'];
export const welcomePositions=['header','above-header','below-header','status'];
export function welcomeTokens(s,e){
 const visible=s.showWelcome&&s.welcome.trim();
 // Keep the legacy header paragraph byte-for-byte, including intentional blank text.
 const legacy=s.welcomeStyle==='plain'&&s.welcomePosition==='header';
 const block=visible?(s.welcomeStyle==='card'?
  `<section class="section-card visitor-guidance cc-visitor-guidance welcome-message"><p class="neighbour-message">${e(s.welcome)}</p></section>`:
  `<p class="welcome-message welcome-message--plain">${e(s.welcome)}</p>`):'';
 return {WELCOME:s.showWelcome?e(s.welcome):'',WELCOME_BLOCK:legacy?(s.showWelcome?`<p>${e(s.welcome)}</p>`:''):s.welcomePosition==='header'?block:'',WELCOME_ABOVE:s.welcomePosition==='above-header'?block:'',WELCOME_BELOW:s.welcomePosition==='below-header'?block:'',WELCOME_STATUS:s.welcomePosition==='status'?block:''};
}
export function welcomeCSS(s){
 if(!s.showWelcome||!s.welcome.trim()||(s.welcomeStyle==='plain'&&s.welcomePosition==='header'))return '';
 return '.content__body:has(.welcome-message)>*{flex-shrink:0}.content__body .welcome-message{position:relative;flex-shrink:0;min-width:0;max-width:100%;overflow-wrap:anywhere;white-space:pre-line}.content__body>.welcome-message{width:100%;max-width:620px}.content__body .welcome-message--plain{margin:1rem 0;text-align:center}#show-options .content__body .share-brand .welcome-message p{font-size:1rem;line-height:1.6}#show-options.compact-console .share-brand .welcome-message{text-align:start}#show-options.compact-console .share-brand .welcome-message p{line-height:1.55;color:var(--text)}'+welcomeColourCSS(s);
}

// Colours stay local to this card: never change shared theme variables or guidance.
export function welcomeColourCSS(s){
 if(!s.customWelcomeColours||!s.showWelcome||!s.welcome.trim()||s.welcomeStyle!=='card')return '';
 for(const key of ['welcomeCardColour','welcomeTextColour'])if(typeof s[key]!=='string'||!/^#[a-f0-9]{6}$/i.test(s[key]))throw Error('Choose a six-digit welcome colour.');
 return '#show-options .content__body .section-card.welcome-message{background:'+s.welcomeCardColour+';color:'+s.welcomeTextColour+'}#show-options .content__body .section-card.welcome-message>.neighbour-message{color:'+s.welcomeTextColour+'}';
}
