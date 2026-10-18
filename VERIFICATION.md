# Verification and compatibility

## 1.9.0 release preparation — 18 October 2026

The combined editor/menu and update-dialog changes passed 126 Node tests, package/privacy verification and the allowlisted site build. The release-dialog matrix was rerun for both templates in light/dark modes at 320px, 390px and desktop widths, including doubled text, keyboard navigation, focus restoration, unchanged saved designs and local history-fetch recovery. Released history identifies 1.9.0; completed menu work is absent from In progress while approved themes remain planned. Both canonical templates and all four manual starters carry matching version/date headers; viewer changes are limited to that metadata. The existing seven menu-related browser suites and compact-invitation checks are recorded below. These remain local checks, with no new hosted RF or physical-device rehearsal.

## Shared editor menu organisation — local verification, 18 October 2026

- Seven affected browser suites passed, totalling 1,120 assertions: shared menu organisation (404), editor (56), setup (56), tour (63), extras (93), listening (374) and release readiness (74). The new menu suite covers both templates and seasons, page/general navigation, every shortcut, moved control ownership, validation reveal/focus, icons, typing/scroll/caret, Undo/Redo, reload and 320/390/1280px layouts.
- Corrected older assertions that expected the previous section locations. The icon check now waits for the debounced preview to finish rendering. No browser JavaScript errors were reported. Browsing sections leaves saved designs untouched; HTML exports still match the canonical renderer for the saved settings.
- Inspected the desktop and phone editor layouts. Updated quick-start/detailed-guide directions and three generic screenshots for the shared menu names and groupings. Existing settings keys, backup formats, template renderers and canonical starter appearance are unchanged.
- All 126 Node tests and the package/privacy audit passed. Both manual ZIPs contain the current guides and exact canonical starters (40 files for Lights on Sunset, 27 for Compact console), with verified CRCs and offline links. No preview scripts or demo catalogue enter the exported HTML.

These are local customiser and authorised illustrative-preview checks. No hosted RF/FPP page, setting, mode, request, vote or schedule was changed; no physical-device or live integration claim is made.

## Song badges and social links — local verification, 18 October 2026

- All 124 Node tests passed, including older-backup defaults, independent seasonal settings, shared copy groups, Undo/Redo, safe links and CSS escaping for exact sequence names.
- Initial feature verification passed six browser suites / 2,782 assertions: the new shared-song/social editor suite (292), the expanded uncategorised-song stylesheet fixture (1,176), setup (56), category artwork (1,102), registered templates (82) and release readiness (74). Both templates and seasons were checked at 320px, 390px and desktop widths, with local Jukebox/Voting and on/off-air layouts.
- The subsequent shared-picker refinement passed 334 editor assertions and 1,392 stylesheet assertions. Both badge choices now appear together on import and later editing. Music uses one Song badges section with separate counts and manual lists; the builder calls the choice Moving heads and the viewer badge reads Moving spotlights. Validation reveals the combined manual field, and manual edits undo without changing the other list. Checks cover import cancellation by Cancel/X/Escape, reimport, independent selection, search, Clear badges, reload and transactional Undo/Redo. The stylesheet fixture covers neither/NEW/Moving spotlights/both selections, separate corner sashes, category icons, missing images/artists, grouped and ungrouped songs, availability hints, category/NEW filters, narrow title clearance and Voting tallies.
- Shared RF CSV export help passed the expanded editor suite: 376 assertions across both templates, including 320px, 390px and desktop layouts, both entry points, use before import, nested help, unchanged saved designs/catalogues and focus restoration. Native Escape and the help layout were also checked in the browser. The instructions use RF’s observed Sequences → Export action; its official sequence guide is linked for background.
- Visually inspected separate NEW corner sashes and Moving spotlights pills in both layouts and seasonal styles, including narrow artwork and category-icon Voting views. The earlier social review checked labelled Facebook, Instagram, YouTube and TikTok links. The social row wraps on phones and retains accessible labels and tap areas; exported links use HTTPS and open separately. Optional features start disabled and the uncategorised icon retains its music-note default.
- Rebuilt the offline README, four canonical starters and both manual ZIPs for 1.8.0. Package checks verified exact contents, CRCs, offline links, attribution and licences: 40 files for Lights on Sunset and 27 for Compact console. Exports contain no preview scripts, demo catalogue or loopback URLs.

These are local editor, illustrative-preview and pure stylesheet checks. They do not establish a new hosted RF request/voting/playback rehearsal. No RF/FPP page, setting, mode, request, vote or schedule was changed. Real-device and hosted behaviour still require separate checks when authorised.

## Final local release audit — 18 October 2026

- All 115 Node tests and 23 browser suites passed, totalling 9,080 browser assertions. Coverage includes both templates and seasons, Jukebox/Voting and on/off-air local previews, narrow layouts, category/NEW navigation, uncategorised songs, artwork and artist visibility, setup drafts, the tour, history, extra cards, guidance, backups, validation and exports. Empty-import guidance and the real browser clipboard-permissions fallback also passed separately.
- Updated one legacy category-help assertion for the shared help dialog. Corrected the export fallback test to account for the browser’s native textarea line-ending normalisation on Windows; Copy and both download paths still require identical HTML bytes. An initial validation-focus failure passed on an isolated rerun. No viewer or editor behaviour changed during this audit.
- Corrected the guides’ seasonal-storage and backup explanations, Compact console’s visitor-guidance location, queue-control labels and countdown placement. NEW selection explicitly says unticked songs are still imported. The contributor source map includes the shared category-help module.
- Rebuilt README.html and both manual ZIPs. All four starters match their canonical renderer. Exact archive contents, CRCs, attribution, licences and offline guide links passed: 40 files for Lights on Sunset and 27 for Compact console. Extracted archive contents were checked; current guides were inspected over local HTTP, including 320/390/1280px detailed-guide layouts. Direct file-URL rendering was not rerun in this environment.
- All 39 source modules pass JavaScript syntax and relative-import checks. The guides have 32 valid local links/assets. Release privacy scanning excludes private records and catalogues; exports contain no preview JavaScript, sample songs or loopback URLs. The allowlisted site build and local whitespace check passed.
- RF and PulseMesh documentation links were checked read-only. The public forum contact URL was retained; automated access returned HTTP 403, so that destination was not independently verified in this pass.

**Scope and remaining checks:** This is local verification, not a fresh RF integration rehearsal. No page, RF/FPP setting, request, vote or schedule was changed. Earlier hosted observations remain dated above/below as recorded. Real-device iPhone/Safari and any unverified live request, voting, off-air or conditional recovery paths still need their own real-service check. Moving-head badges and a configurable uncategorised-song icon remain deferred. No commit, push, GitHub upload, release or deployment was made.


## Hosted uncategorised-song follow-up — 18 October 2026

- With explicit owner approval, updated the already-active Compact Halloween review page with the current canonical export, preserving its existing content, category icons, palette and NEW assignments. The prior source was backed up privately before editing.
- Reloaded the saved RF HTML and confirmed it matched the intended export after RF sanitisation. RF reported No problems — looks good. The real Jukebox viewer showed music-note fallback icons for uncategorised songs; named filters excluded them, All retained the full catalogue and NEW retained the existing marked song.
- Community Builder Check remains active. No RF/FPP settings, mode, schedule, request, vote or personal-page content changed. Voting/off-air and real-device checks were not rerun. Private source backups and observations remain outside the repository and packages; the public customiser was not deployed.

## Uncategorised songs — shared local fix, 18 October 2026

- Category detection accepts a mixture of named and empty categories. Empty categories do not create a filter or shift the named section positions. Category artwork retains its music-note fallback; no new setting or backup migration is needed.
- Named filters hide ungrouped songs. NEW filtering and badges cover RF's direct Voting card/tally siblings as well as grouped rows. Shared CSS aligns each unwrapped tally with its song; the preview now renders uncategorised songs before named sections without inventing a category heading.
- The pure stylesheet fixture passed 996 checks across both templates, both seasons, Jukebox/Voting, 320/390/1280px and album/category/no-art choices. It covers filters, fallback icons, NEW badges, availability hints, missing images/artists, tally alignment, text bounds and wholly uncategorised lists. Existing artwork and category-navigation suites passed 1,102 and 252 checks respectively.
- An owner-supplied RF CSV was imported through the actual local customiser UI into both templates on a disposable loopback origin. In both music modes, All retained every song, each named filter selected its own group, and NEW retained a locally marked uncategorised song with its tally. The source catalogue and private song names remain outside the repository and downloads.
- Current RF source and the actual live Jukebox DOM were inspected read-only: uncategorised rows precede named category sections. This confirms the category-position assumption, not an RF-hosted test of the updated CSS. No RF page, setting, mode, request or vote was changed. Live Voting and real-device checks were not rerun.
- All 115 Node tests and both manual-package audits passed. The manual NEW instructions now cover all four assignment selectors; rebuilt starters and ZIPs contain no preview scripts or catalogue data. Saved review designs and the public deployment are unchanged.

## Shared artist visibility — local checks, 18 October 2026

- Song appearance has independent artist-name switches for song lists and for Now Playing, Up Next and the request queue. Both templates use shared controls and exported CSS; both switches default on. Older settings retain their existing appearance, and invalid values are rejected.
- Save/reload, both backup formats, cross-template Music copying, setup drafts, Skip and Undo/Redo passed the model checks. Mounted local editor checks covered both templates: Back retained setup selections, Cancel discarded them, Apply used the selected combination, and editor Undo/Redo and reload retained the intended choices.
- The pure stylesheet fixture matrix passed 2,592 checks across both templates, both seasons, Jukebox/Voting, 320/390/1280px, all three song-artwork choices and all four artist-visibility combinations. Empty and absent artist elements had identical layout, titles fitted, and NEW sashes, availability hints and votes stayed visible. These are local CSS fixtures, not simulated RF integration.
- The existing illustrative artwork browser suite passed 1,102 checks. All 113 Node tests and both manual package audits passed. Manual instructions describe the switches and optional feature classes; generated starters include the shared CSS and contain no preview scripts or sample songs.
- Actual RF artist-container markup was inspected read-only to confirm the selectors. No RF page, mode, setting, request or vote was changed, and the public customiser was not deployed. Real RF playback/empty-artist integration was not rerun for this addition.

## Compact seasonal navbar framing — 18 October 2026

- Compact's existing Decorations switch now controls seasonal navbar framing: a fine cranberry/cream/green stripe for Christmas, and a violet edge with two small cobweb corners for Halloween. The dark base and active-button colours are retained. Decorative pseudo-elements have no pointer events and add no animation or exported JavaScript.
- Both border styles were inspected on the actual RF Jukebox viewer at 390px and checked for horizontal overflow at 320px and 1280px. Menu buttons remained 52px tall. Halloween's Info link navigated and received its amber highlight normally.
- Saved/reloaded sources matched the intended exports after RF normalisation. The final Halloween page passed RF's Problems check and remains active. The original viewer page, RF/FPP settings and schedules were not edited; no requests or votes were submitted.
- All 109 Node tests and both package audits passed. Editor help and manual instructions describe the seasonal frame and how to disable it. Private backups/evidence remain outside the repository and downloads; the public customiser was not deployed.

## Compact background and navigation contrast — 18 October 2026

- Deepened the Haunted violet background from #130d20 to #08050f, retaining its purple cards. Fireside glow keeps the deeper green from the preceding check. Preset edits do not overwrite advanced colour values.
- Both Compact seasons share one navigation rule: a darker card-tinted base, 50% accent outline and stronger shadow. Selected-button colours, accessible names, tap areas and original-template styles are unchanged.
- With explicit owner approval, checked both seasonal exports on the actual RF Jukebox viewer at 390px. Backgrounds, cards and navigation remain visually distinct, and no horizontal overflow appeared. Halloween navigation also fitted 320px and 1280px; its three buttons retained 52px heights and Info received the correct amber highlight after navigation.
- Both RF saved sources were reloaded and matched the intended exports after RF normalisation. The final Halloween page reports no validation problems and remains active. No requests, votes, RF/FPP settings or original Test Page edits were made.
- All 109 Node tests passed; both local manual packages passed the exact-manifest, CRC, starter and offline-link audit. Private source backups and screenshots remain outside the repository and packages. No public customiser deployment was made.

## Fireside contrast and Halloween review — 18 October 2026

- Deepened Compact Christmas's Fireside glow background from #10251e to #071710, keeping its #1b3429 cards and existing gold accents. Advanced colour choices and the other presets are unchanged.
- With explicit owner approval, saved and reloaded the darker Christmas review export in RF, then left the Compact Halloween review export active. Both saved sources matched the intended HTML after RF's normal formatting/sanitisation and passed its Problems check.
- Checked the actual on-air Christmas viewer and real song cards at 390px. Halloween rendered its hanging spider, heading font and real RF content without horizontal overflow at 320px, 390px and 1280px. This was a visual check; no requests or votes were submitted and RF/FPP settings were not changed.
- All 109 Node tests passed. Rebuilt both manual ZIPs; exact manifests, CRCs, canonical starters and offline guide links passed (40 original-template entries and 27 Compact entries). Neither export contains preview scripts or illustrative songs. No public customiser deployment was performed.
- Exact review source backups and screenshots remain private, outside source control and packages.

## Hosted category/spacing follow-up — 18 October 2026

With explicit owner approval, the two CSS fixes were installed in the already-active Compact Christmas review page. Its exact pre-edit source was backed up privately; saved source was reloaded and verified. Only CSS changed.

- Actual Jukebox category clicks (All, both configured categories and NEW) retained the viewer scroll position at 320px, 390px and 1280px. Direct pointer clicks avoided the test driver's automatic centring of locator clicks. Browser Back/Forward restored the correct filter without jumping.
- Real RF song cards showed a 12px gap both in All and filtered results. RF retained the shared fixed-target and scroll-anchor CSS and Compact's category grid.
- The active Compact review page was retained. The normal personal page, RF settings, mode, viewer control and FPP schedule were unchanged; no requests or votes were submitted. This follow-up did not switch to Voting or recheck real-device Safari. Both modes and seasons were already covered by the local CSS checks below.
- Private source backups, measurements and screenshot evidence remain outside the public source and packages. The public customiser was not deployed.

## Category scroll and song spacing — local follow-up, 18 October 2026

- Shared filter styling now uses fixed fragment targets for All, category and NEW navigation, and excludes the Music panel from browser scroll anchoring when filtered content changes. The original template retains its card layout.
- Compact console uses a 12px song-row gap. Its category grid survives selected-category CSS and RF-style inline voting category display; NEW results retain the same gap.
- The isolated native-anchor/layout harness passed 252 checks across both templates, both seasons, Jukebox/Voting and 320px/390px/1280px widths. It bypasses preview click interception and checks scroll retention (allowing unavoidable clamping when content gets shorter), filtering, Back/Forward, row gaps and horizontal overflow. The inline-display fixture is a CSS regression check, not a real RF interaction.
- Existing registered-template checks passed 82 assertions and preview-link checks passed 152. All 109 Node tests passed; both manual ZIPs and canonical starters were rebuilt and passed the package/CRC/offline-link audit. No scripts or demo data enter exports.
- Initial verification was local only. The separately authorised hosted follow-up below subsequently installed these two CSS fixes.

## Hosted Remote Falcon check — 18 October 2026

With explicit owner approval, the validation draft was temporarily made live during an existing FPP schedule in Jukebox mode. Tests used RF's real public viewer and production song feed. The normal page's HTML was never edited; no requests, votes, settings or schedule changes were made.

- Feature-enabled Christmas and Halloween exports passed RF save/reload validation and hosted rendering for both templates. Compact Christmas and Lights on Sunset Halloween manual starters were also checked with actual album artwork.
- Actual Now Playing and Up Next changed with scheduled songs. RF supplied queue limits and unavailable-song reasons. Category icons replaced real song-row artwork, independently of Now Playing artwork. Category and NEW filters selected the intended real rows. No unresolved native tokens appeared in the inspected on-air views.
- Five extra cards retained their correct Home/Info placement, with three loaded 64px contained images and two text-only cards. Icons-only navigation retained accessible names and 24px icons. Compact's queue started collapsed and expanded through its summary control. All three main-guidance positions were represented across the exports; Compact Halloween retained its heading font and animated hanging spider.
- Music and the information views fitted 320px, 390px and 1280px browser viewports after the correction below. Nested listening links and browser Back/Forward worked in both layouts. Support views were also checked at those widths. Scrollbars reduce Compact's available content width.
- RF's actual Up Next response exposed an unbounded image in Compact console that the illustrative preview had omitted. Compact now hides Up Next and queued-row artwork, keeping those rows compact like the original template. The corrected export passed the real Up Next image check at all three widths. The empty request queue did not exercise populated queue-row artwork.
- The normal page was restored as live and the draft restored to its original contents. Both page sources exactly matched their private backups. The final dashboard showed Jukebox, viewer control enabled, FPP connected and no requests submitted. There was no customiser deployment.
- After the CSS correction, all 109 Node tests and package verification passed. Both manual ZIPs were rebuilt and checked against canonical starters and exact manifests: 40 original-template entries and 27 Compact entries. Generated exports contain no preview scripts or illustrative catalogue content.

**Limits:** This pass covers on-air Jukebox rendering and navigation, not request submission, populated request queues, voting, off-air transitions, location/code recovery, PulseMesh playback or real-device iPhone/Safari. Those conditional paths still require an authorised rehearsal against the real service. Private backups, catalogue observations and restoration screenshots remain outside public source and packages.

## Non-live Remote Falcon draft validation — 18 October 2026

Eight current exports were saved to a separate non-live RF draft and passed RF's validator with **No problems — looks good**: Lights on Sunset and Compact console, each in Christmas and Halloween, using both the manual starter and a feature-enabled export. Saved HTML was reloaded and revalidated for seven exports; the Compact Halloween starter was checked after saving, and its feature-enabled version was also reloaded.

- Feature-enabled exports include five extra-information cards with image and text-only variants, seasonal header icons, 24px icon-only menu buttons with accessible names, visitor guidance above/below the header, category-artwork declarations, independent Now Playing artwork, queue-limit/count and vote-counter hooks, and countdown/schedule options.
- RF's saved preview retains the card placement (Home for Lights on Sunset, Info for Compact console), 64px contained images, HTTPS links with their new-tab protections, icon choices, native placeholders and category CSS mappings. Public card images load successfully. No custom scripts are present in the inspected RF preview documents.
- Compact console's two seasonal starters render at RF's 375px mobile preset without horizontal overflow. Christmas lights and the Halloween hanging-spider animation appear with their intended heading fonts. The original template's feature-enabled Christmas page also fits the 375px preset and a 1232px desktop preview. This is a targeted RF rendering check, not another full responsive matrix.
- The original draft HTML was backed up before editing, restored afterwards, and confirmed byte-for-byte identical after saving and reloading. The existing live page remained selected as live. No RF/FPP settings, requests, votes or schedules were changed, and the customiser was not deployed.

**Scope:** RF's editor preview explicitly renders all mode containers regardless of viewer-control settings and leaves native values as placeholders. Viewer control was disabled and the FPP plugin was offline. These checks establish draft save/validation and static preview compatibility; they do not verify real song/category rendering, native counters, on/off-air visibility, requests, voting, playback or countdown updates. The embedded preview rejected automated mouse and keyboard actions, so hosted fragment navigation/Back/Forward was not verified in this pass. Earlier local navigation checks remain separate evidence. A real-device iPhone/Safari check is also outstanding. Private draft backups and account screenshots are excluded from source and packages.

## Local pre-publication review — both templates

The current local review covers Lights on Sunset and Compact console, Christmas and Halloween, without publishing or connecting the editor demo to RF.

- 109 Node checks pass, covering compatibility, saved designs, migrations, rendering and validation. The saved-state check also covers failed browser-storage writes and recovery across template changes.
- 21 existing browser harnesses pass with 5,241 assertions. Coverage includes narrow/enlarged layouts, both music modes and availability states, preview navigation and restoration, setup and tour, shared information/guidance controls, artwork modes, filters, request feedback, menu options and import cancellation. Legacy artwork checks now use RF-style unwrapped titles and the current artwork selector; sample NEW expectations include the two labelled demonstration assignments.
- Focused browser checks confirm correct save status on load, reload, failed writes, switching designs and successful recovery in both templates. Original optional navbar artwork follows the correct button with Support shown or hidden.
- All four manual HTML starters match their registered canonical renderer. Their IDs are unique, internal links resolve, and no editor scripts or demonstration data enter exports.
- Both ZIPs are rebuilt and checked against an exact shared manifest, including byte-for-byte source equality, duplicate/missing entry rejection, lengths and CRCs: 40 entries for Lights on Sunset and 27 for Compact console. Fonts, original licences, credits and generic guide images are included as appropriate to each layout.
- The extracted quick-start and detailed guides load offline in both packages at 320px, 390px and 1440px: 12 combinations with no broken images, horizontal page overflow or script errors. Local guide links and anchors are verified. Online RF content and external links still require internet access.
- The static website build contains 91 allowlisted public files. Development tests, private catalogues, backups and local review records are excluded.

The guides and screenshots reflect the current template chooser, single setup completion action, page placements, artwork controls and separate Compact console seasons. Those checks were local-only. The later RF sections above distinguish non-live draft validation from authorised on-air Jukebox rendering; untested conditional paths and real-device checks remain explicit.

The customiser is tested at three separate levels:

- Automated Node tests cover settings migrations, rendering, escaping, URL validation, catalogue parsing and export safety.
- Local browser checks cover the illustrative demo, both seasonal themes, Jukebox/Voting, On air/Off air, navigation, category filters, NEW sashes, messages, narrow layouts, enlarged text, keyboard focus, setup, tour and settings persistence.
- Previously released Lights on Sunset pages have passed Remote Falcon’s validator in a separate non-live draft. That validates markup compatibility; it does not establish live playback, location-code acceptance, vote limits or live countdown updates.

Device presets check layout, not a particular phone operating system. Test your own exported page in an RF draft and with your show before making it live. The demo never sends RF requests or votes.

The v1.5 release checks also cover backup confirmation and cancellation, export navigation and filenames, clipboard fallback, Help focus, and show-name contrast advice. A local CSS simulation checks the simple scrollable layout when `:has()` is unavailable; it is not a test on an actual older device. Recent browsers retain the normal panel navigation and filters.

Run `npm run verify` for automated release checks. Browser harnesses in `tests/` are local development tools and are excluded from the published website. Publication checks verify the final URLs, artwork, documentation and downloads separately.

The v1.5.1 preview-link regression checks cover resolved link addresses, intercepted and native anchor clicks, CSS targets, Back/Forward, external-link blocking and panel retention after edits across both themes, music modes and availability states. The preview-only base URL does not enter generated RF pages. Desktop browser checks are not a substitute for the reported iPhone path being rechecked on the device.

The v1.5.2 artwork regression was confirmed against a live RF page: rows without images placed the unwrapped title in the artwork grid column. Local CSS fixtures check image-present and image-absent rows, the artwork switch, titles/artists, unavailable hints and NEW sashes in both themes and modes at 320px, 390px and 1280px, with normal and enlarged text. Separate illustrative-preview checks verify that an unset imported image is omitted. The updated Halloween export passed RF's validator in a non-live draft, whose original contents were then restored. These checks do not establish live requests or votes with the patched page.

The v1.6.0 PulseMesh update passed 81 Node tests, 51 mounted wizard checks and 374 illustrative listening-layout checks. Coverage includes download-only, display-link-only and both buttons; URL validation and escaping; legacy defaults and settings backups; wizard Apply, Cancel and Skip; and separate FAQ blocks for FM, links and multiline instructions. Layout checks cover both themes, both music modes, On air/Off air, 320px/390px/1280px widths and enlarged text. Preview links remain blocked. The 39-file manual package matches the canonical renderer and passes its content/CRC audit. A representative export with both PulseMesh buttons and the Support menu hidden was saved in a non-live RF draft and passed its validator after reload. RF normalised HTML spacing and entities on save. The original non-live draft was restored and confirmed identical after reload; the live page and show settings were unchanged. This is a markup-compatibility check, not a real PulseMesh listening session; service routing, plan eligibility and proximity rules are controlled by PulseMesh.

The optional Support menu setting brings the automated suite to 81 passing tests. Its 546 local illustrative checks cover three/four-button layouts, seasonal decoration on panels and nested fragments, direct Support links, Home/Info recipient destinations, both themes and modes, availability states, 320px/390px/1280px widths, enlarged text, focusability and Back/Forward. The current browser motion preference is checked; these runs do not emulate a different operating-system preference. Editor checks confirm that hiding and restoring the menu entry retains Support wording and survives reload. Older backups retain the visible Support menu by default. Help's new official RF links and keyboard focus restoration were also checked locally.

The v1.6.1 schedule CSS fix passed 81 Node tests and 768 local illustrative browser checks. Targeted checks confirm centred stacked hours at 320px and 390px, longer hours text without horizontal overflow, both themes, and retained side-by-side alignment at 1280px. The canonical renderer and both manual templates contain the same correction; the 39-file ZIP passed its content and CRC audit. This change affects CSS alignment only and leaves RF hooks unchanged; no new live RF validation or playback check was performed for this patch.

## Unreleased multiple-template local checks

The local development edition adds Compact console and shared customiser history. At that stage, no Compact console page had been installed or validated in Remote Falcon. See the later non-live draft validation above.

- Original settings migrations and rendered starter HTML remain compatible. The original template retains its saved-file format, seasonal switching and public asset addresses.
- Node checks cover per-template storage, independent seasonal designs, backup routing, selective copying, history grouping and limits, draft validation, native RF hooks and script-free exports.
- Browser checks cover the original viewer, both registered layouts in both seasons and music modes, 320px/390px layouts, enlarged text, artwork-free rows, category/NEW filters, hidden Support navigation, direct links and reduced motion.
- Shared editor checks cover ordinary edits, wizard Apply, URL completion, catalogue cancellation/application, Undo/Redo, separate histories, copied details, backup imports, reload and the single changelog.
- Manual downloads use the registered canonical renderer. Package checks verify assets, licences, attribution, CRCs and private-data exclusions.

These are local illustrative checks, not evidence of live RF requests, playback, voting, location or a real-device Safari test. The later RF draft validation is recorded above; actual live behaviour remains a separate check before live installation.


## Local shared-editor refinements

The refinement batch adds shared season controls, direct chooser-to-wizard/editor entry, explicit edit/tour setup actions, expanded previews, document and panel drag scrolling, and an allowlisted icon library. Default Lights on Sunset exports still match the existing downloads byte for byte. Older backups without icon settings retain their previous appearance; chosen icons round-trip through both template backup formats and reset to their original defaults.

Local browser checks cover the expanded preview's availability controls and mouse input, wizard column alignment, consistent season buttons, Info placeholders, icon undo/redo and narrow dialogs. These use the labelled illustrative preview in disposable browser contexts, without contacting an RF account or changing any live page. RF playback and real-device checks remain outside this local refinement batch.


The next local refinement pass passed 97 Node tests and 1,101 mounted browser checks (52 setup, 59 tour, 140 navigation, 82 registered-template and 768 original-viewer checks). Queue capacity defaults off for older backups, retains RF’s native token in a dedicated wrapper, appears only in Jukebox, and is absent off air. Compact console’s queue remains collapsed above the request heading.

Targeted disposable-browser checks also covered dark thumbnail hover, centred phone dimensions, detached availability/close controls, mouse drag, queue-limit Undo/Redo and reload, repeated Apply & edit without a tour, explicit Apply & take tour, the category-filter illustration, uniform toolbar borders, and dialogs at 320px, 390px and a short 900 × 600 viewport. Generic screenshots were visually reviewed locally. This pass changes no live RF page or RF settings and does not claim a new live RF integration test.


The shared setup completion now uses one Apply & open editor action and a final-step tour checkbox. The checkbox is unchecked on each opening, retains its choice through Back/Next, and is not part of saved show settings. The tour starts only after validation and a successful settings save. Local checks passed: 97 Node tests, 56 mounted setup checks and 63 mounted tour checks, plus targeted checks for both templates, cancellation/Close/Escape, keyboard toggling, a 44px checkbox label target and 320px/390px/desktop layouts. Simulated browser-storage failure leaves the applied design editable, reports it as unsaved and suppresses the tour. Desktop and phone screenshots were reviewed locally.


The shared wizard spacing pass keeps help text directly beneath its control, removes inherited textarea margins and retains 44px checkbox label targets. Targeted disposable-browser checks covered both templates, expanded name-style and custom-logo controls, schedule columns, collapsed/expanded FM and PulseMesh options, and 320px/390px/desktop widths without horizontal overflow. Generic screenshots were reviewed locally, and all 56 mounted setup checks passed without browser errors. This is an editor-only CSS change; saved designs and RF exports are unaffected.


## Shared identity, information and preview-context checks

The local shared refinement checks cover both templates, both seasons, Jukebox/Voting and On air/Off air at 320px, 390px and desktop widths. All 624 checks in `tests/refinements.html` pass: three guidance positions, empty guidance, five cards with image/text layouts, icons-only size and accessible labels, nested preview targets, document and panel scroll preservation, focused-field selection, overlapping renders, and native Back/Forward. Restoration uses instant scrolling and retains the last stable context while a render is pending.

Targeted disposable-browser editor checks pass for both templates: setup icon selection and Back retention; Cancel, Close and Escape discard the detached draft; Apply saves the choice. Header controls and the nested picker fit 320px/390px/desktop layouts. Ordinary edits, toggles, reset and Undo/Redo retain outer scroll and the nested preview context; text focus/caret survive updates. Tour wording uses concise page descriptions.

Card checks cover one through five, Add limits, images and text-only layouts, HTTPS validation/completion, moving the first card, first-card promotion on deletion, disabling/resetting after the last removal, Undo/Redo and reload. The actual Copy show details controls, backup download/import and reload retain all five cards, their images and main-screen guidance settings. Older designs receive compatible defaults: original guidance stays enabled below On air, Compact console's main-screen guidance stays off, existing first-card content remains unchanged, and additional cards start empty. Generic setup and card screenshots were visually reviewed.

These checks exercise the labelled local demo and editor only. No live RF service, page, mode or settings were changed. RF-hosted behaviour and real-device Safari remain separate checks before any live installation.


## Shared category artwork — local review

Both templates offer album artwork, category icons or no artwork for song lists, independently of Now Playing. Older artwork settings retain their prior appearance. The category renderer uses CSS and the existing Font Awesome 6.6 Free font; exports contain no artwork JavaScript.

- Node coverage checks legacy migration, independent choices, backups, category mapping/reordering/renaming, hidden filters, detection, invalid icon input, setup drafts, copying and Undo/Redo. All 107 Node tests passed.
- The category-artwork browser harness passed 1,102 local preview/layout checks across both templates, both seasons, Jukebox/Voting and 320px/390px/1440px widths. It checks the three list modes, both Now Playing choices, no unused image columns, missing images, category/NEW filters, decorative glyphs, diagonal NEW-sash/vote-count clearance and script-free mapping fallbacks. Enlarged-text checks at 320px also passed for both templates and seasons.
- Existing song-artwork, setup and navigation harnesses passed 772, 56 and 140 checks respectively. Direct editor checks covered icon selection, categories with filters off, rename/reorder, Undo/Redo, reload, draft cancellation and Apply, plus narrow-screen controls and icon pickers.
- These are local illustrative preview and CSS checks, not live RF integration or playback verification. No RF page or settings were changed.

## Welcome wording and export feedback — local review

Both templates use the same Welcome controls and Welcome message label. Compact console also offers an optional Tagline, with compatible defaults for older backups. Local checks cover escaped wording, blank removal, separate seasons, setup retention, copying, reload and Undo/Redo. Both unchanged Compact starter designs render identically to their previous HTML.

Copy/Download HTML keep their existing validation gate. The shared export area now explains blockers and links directly to the corresponding fields, including collapsed sections in other tabs. Disposable-browser checks passed for both templates at 320px, 390px and 1440px, including re-enabling the actions after correction. Narrow-screen feedback was visually reviewed. No review-browser settings or RF pages were changed.

The existing sticky-navigation layout check now waits for preview navigation to finish before performing its separate scroll assertion; the prior timing failure was also reproduced against the pre-change editor.
Final checks passed: 108 Node tests, 56 editor browser checks and 74 release-readiness browser checks, plus the targeted two-template checks above. Package verification and the local static-site build passed; exports contain no preview scripts or demo data.


## Shared reset actions and icon categories — local review

Reset this design and Reset demo use the same warm warning pill treatment in both editor colour schemes. Their behaviour is unchanged: design reset still opens confirmation, cancelling retains the design, and Reset demo retains saved settings.

The shared icon picker groups all 59 existing IDs exactly once across Christmas, Halloween, Lights & magic, Music & media and General. All icons, category filtering, search, empty results, selected state, template-default restoration, Escape/focus return, setup draft cancellation and category-artwork selection passed disposable-browser checks in both templates. Light/dark screenshots and 320px, 390px and 1440px layouts were checked. Search and category controls remain available while the icon results scroll. The existing 108 Node tests and package verification passed. No live RF service or owner review storage was changed.


## Shared category-help refinement (local review)

- One editor-only category help dialog is available from Music → Categories, import review, detected categories and import details in both templates. Direct links use RF’s official Sequences category guide.
- A real RF CSV containing three uncategorised songs displayed the counted advisory in both templates; import remained enabled. The advisory recommends assigning every song a category and explains All / NEW and music-note fallback behaviour.
- Opening and closing help with Escape, Close or Got it retained pending NEW selections, category order and the import checkbox. Cancel import discarded those pending changes; the existing catalogue and settings remained intact. Focus returned to the help trigger.
- Checked desktop, 390px and 320px layouts. The dialog fits without horizontal overflow and scrolls at narrow heights. Checked shared settings access in Lights on Sunset and Compact console, plus nested detected-category help. No console errors were reported.
- Existing 115 Node checks passed; both manual ZIPs and generated offline README were rebuilt and verified (40 original-template entries, 27 Compact entries; 182 source files). No viewer renderer or saved-setting changes; no RF or hosted-customiser publication.

## Local update-dialog checks — 18 October 2026

The Released / In progress dialog passed isolated local checks in both templates, light/dark appearances and 320px, 390px and desktop widths, including doubled text size, keyboard tab selection, Escape and close-button focus restoration. Opening, switching and closing preserved stored designs. The release-history fetch failure was tested against the local documentation endpoint; the progress tab remained available and a retry recovered. This is an editor-only check, not a hosted RF, playback or physical-device test.

The local Node suite passed 126 tests. Both manual packages passed canonical starter, exact ZIP-content and offline-guide-link checks; the allowlisted site build passed. Pending changes remain under Unreleased and are excluded from the Released tab. The progress summary must be reviewed again before publication.

The template chooser invitation also passed local light/dark checks at 320px, 390px and desktop widths, including doubled text size, keyboard access and unchanged saved designs after closing. Its separate idea and viewer-submission links match the repository forms, open a new tab and retain the existing public-submission and permission guidance. The card uses a uniform border with no side accent.
The chooser invitation was subsequently compacted into text links with a collapsed submission/contact disclosure, preserving both GitHub destinations and the forum contact. Checked 320px, 390px and desktop widths in light/dark modes at normal and doubled text sizes; collapsed and expanded content fits, links retain 44px tap height, keyboard activation and Escape work, and browsing leaves stored designs unchanged.
