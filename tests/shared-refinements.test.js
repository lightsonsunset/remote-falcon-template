import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/template-registry.js';
import {informationCards,setInformationCards,newInformationCard} from '../src/information-cards.js';
import {copyDetails} from '../src/design-store.js';
import {createSetupDraft} from '../src/setup-model.js';
import {iconLibrary,iconKeywords} from '../src/icons.js';

test('older designs get compatible additive fields without losing personalised cards',()=>{
 for(const t of registry){const s=t.cloneDefaults();s.homeCard=true;s.homeCardTitle='Photo spot';s.homeCardText='Beside the lights';for(const k of ['homeCardImage','extraInfoCards','showMainGuidance','guidancePosition'])delete s[k];
  const next=t.checkedSettings(s);assert.equal(next.showMainGuidance,!t.separateSeasons);assert.equal(next.guidancePosition,'status');assert.equal(next.homeCardTitle,'Photo spot');assert.deepEqual(next.extraInfoCards,[]);assert.equal(next.homeCardImage,'');
 }
});
test('ordered cards promote into legacy keys and deleting the last restores disabled starter',()=>{
 const s=registry[0].cloneDefaults();s.homeCard=true;
 const rows=Array.from({length:5},(_,i)=>({...newInformationCard(),title:'Card '+i,text:'Details '+i,image:i===1?'https://example.org/picture.png':''}));setInformationCards(s,rows);assert.deepEqual(informationCards(s),rows);
 [rows[0],rows[1]]=[rows[1],rows[0]];setInformationCards(s,rows);assert.equal(s.homeCardImage,'https://example.org/picture.png');assert.equal(s.homeCardTitle,'Card 1');
 rows.splice(0,1);setInformationCards(s,rows);assert.equal(s.homeCardTitle,'Card 0');
 setInformationCards(s,[]);assert.equal(s.homeCard,false);assert.equal(s.homeCardTitle,'A little extra magic');assert.equal(s.homeCardImage,'');assert.deepEqual(s.extraInfoCards,[]);
 assert.throws(()=>setInformationCards(s,Array(6).fill(newInformationCard())));
});
test('five cards, images and guidance survive backups and selective copy in both templates',()=>{
 for(const t of registry){const s=t.cloneDefaults('halloween');s.homeCard=true;s.showMainGuidance=true;s.guidancePosition='above-header';setInformationCards(s,Array.from({length:5},(_,i)=>({...newInformationCard(),title:'Card '+i,text:'Details',image:i%2?'https://example.org/image.png':''})));
 const file=t.separateSeasons?t.settingsFile({christmas:t.cloneDefaults(),halloween:s}):t.settingsFile(s),restored=t.parseSettings(file);assert.deepEqual(t.separateSeasons?restored.halloween:restored,s);
 for(const target of registry){const copied=copyDetails(s,target.cloneDefaults(),['info'],target);assert.deepEqual(informationCards(copied),informationCards(s));assert.equal(copied.guidancePosition,'above-header');}
 }
});
test('card export validates HTTPS and text, while drafts remain escaped and usable',async()=>{
 for(const t of registry){const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8'),s=t.cloneDefaults();s.homeCard=true;setInformationCards(s,[{...newInformationCard(),title:'<img onerror=bad>',text:'<script>bad</script>',image:'https://example.org/p.png'},{...newInformationCard(),title:'More',text:'Details',link:'https://example.org',linkLabel:'Visit'}]);
 let html=t.render(source,s);assert.equal((html.match(/class="section-card home-extra/g)||[]).length,2);assert.match(html,/&lt;script&gt;/);assert.match(html,/extra-info-image/);assert.doesNotMatch(html,/<script|preview-is-dragging|Illustrative demo/);
 s.extraInfoCards[0].image='javascript:alert(1)';s.extraInfoCards[0].text='';assert(t.validate(s)['extraInfoCards.0.image']);assert(t.validate(s)['extraInfoCards.0.text']);assert.throws(()=>t.render(source,s));html=t.renderDraft(source,s).html;assert.doesNotMatch(html,/javascript:/);assert.match(html,/Your extra information message/);
 assert.throws(()=>t.checkedSettings({...s,extraInfoCards:Array(5).fill(newInformationCard())}));
 }
});
test('wizard icons remain detached and each template offers a visible header icon mode',async()=>{
 for(const t of registry){const s=t.cloneDefaults('halloween'),draft=createSetupDraft(s,t);draft.value.logoMode=t.features.headerIconMode;draft.value.icons.brand='crow';assert.deepEqual(s.icons,{});assert.equal(draft.finish().icons.brand,'crow');const source=await readFile(new URL('../'+t.source,import.meta.url),'utf8');assert.match(t.render(source,draft.finish()),/fa-crow/);}
 for(const id of ['candyCane','holly','sleigh','snowman','mitten','gifts','icicles','cookie','broom','cat','crow','bone','skullCrossbones','flask','dungeon','mask']){assert(iconLibrary[id]);assert.match(iconKeywords[id],/christmas|halloween/i);}
});
