# Changelog

## 1.7.0 — Compact console and shared editing — 18 October 2026

### Shared customiser

- Added a template chooser with Christmas and Halloween previews, a centred phone preview with On air / Off air controls, and direct choices to start setup or open the editor.
- Added Undo/Redo with a separate editing history for each design, plus Copy show details to reuse selected information between designs.
- Simplified setup with shared header and icon choices, clearer spacing, one Apply & open editor action and an optional quick tour. Setup changes remain a draft until applied.
- Preserved editor scroll, focus, caret and preview position during edits and Undo/Redo. Expanded previews share the same rendering and mouse-drag scrolling as the editor preview.
- Added a searchable icon picker organised into seasonal and general categories. Navigation without labels uses larger, centred icons.
- Added up to five extra-information cards with optional images and links, with controls to reorder and remove cards.
- Added optional on-air visitor guidance above the header, below the header or below On air, retaining existing design defaults.
- Added album artwork, category icons and no-artwork choices for song lists, a separate Now Playing artwork switch, and independent artist-name switches for song lists and playback/queue details. Missing artwork or artist information keeps the layout tidy.
- Added editable queue-limit wording using RF’s queue-depth value. Clarified category filters, uncategorised songs and optional NEW-sash selection in the CSV import and Music controls.
- Fixed category filters jumping to the top of the page. Songs without categories retain their fallback icon, voting tally and NEW sash and remain under All rather than named filters.
- Added explanations beside unavailable HTML export buttons, clearer local-save feedback, consistent setting labels, a compact current-design toolbar and more visible reset buttons.
- Added a viewer-template submission form and a private forum-contact option in the chooser and Help.
- Updated the guides, screenshots and manual downloads for both templates, including an offline quick-start guide and the required credits and licences.

### Lights on Sunset

- Added the shared customiser features while retaining the original layout, saved-settings format, seasonal switching and download addresses.
- Fixed navbar artwork alignment when Support is hidden. Extra-information cards remain on Home.

### Compact console

- Added a Music-first layout with separate Info and Support views, a collapsed request queue above the song list, and date-and-hours tiles. Extra-information cards appear on Info.
- Added cosy Christmas and spooky Halloween styles with colour presets, advanced colours, light strands, corner details and an animated hanging spider. Motion respects reduced-motion preferences.
- Added darker page and navigation backgrounds, visible gaps between song cards, and optional seasonal navbar borders: festive stripes for Christmas and cobweb corners for Halloween.
- Added an editable tagline, styled show name, optional icon above the name and custom-logo choice. Main-screen visitor guidance starts off, with guidance also available on Info.
- Saved Christmas and Halloween as separate designs, each with its own content, catalogue and history. Settings backups include both seasons; HTML exports include the selected season.

## 1.6.1 — Mobile schedule alignment

- Centre the hours beneath each day when schedule rows stack on small screens. The shared fix covers Home, off-air Music, the schedule FAQ and the optional on-air schedule in both themes and music modes.
- Wider layouts retain their side-by-side day and hours alignment. Saved settings are unchanged.
- Existing RF pages need freshly exported HTML or the updated manual template to receive this styling fix.

## 1.6.0 — PulseMesh choices and music setup

- Choose a PulseMesh download button, a display-link button, or both. The display link and editable wording appear on Home and in the listening FAQ; existing designs keep the download button.
- The setup wizard's Music & listening step includes the same PulseMesh choices and the album-artwork switch. Cancel and Skip preserve previous settings.
- Added display-link validation and official PulseMesh setup guidance.
- Listening FAQs separate FM, PulseMesh links and extra instructions into spaced blocks, preserving entered line breaks.
- Help and the quick-start guide include a short Remote Falcon introduction, with links to its website and official documentation.
- Support can be hidden from the visitor menu without deleting its page or cards. The remaining three buttons fill the navbar, including seasonal decoration; Home and Info card links continue to work.

## 1.5.2 — Songs without artwork

- Song rows without an assigned image now use the full text width in Jukebox and Voting. Mixed catalogues can keep artwork enabled without squeezing image-free titles into the artwork column.
- Imported catalogue previews omit unassigned images and use RF's available-song title structure, making this layout visible before export.
- Existing RF pages need fresh HTML from the customiser (or the updated manual template) to receive this CSS fix. Saved settings are unchanged.

## 1.5.1 — Preview navigation fix

- Keep preview tabs and filters inside the viewer when a browser follows a native fragment link, fixing the editor appearing inside its own preview on iPhone.
- Exported RF pages and saved settings are unchanged.

## 1.5.0 — Ready to share

- Finish & export shortcuts lead to validation or the existing output controls.
- Settings backups ask before replacing a design and offer a current-settings download.
- HTML downloads include the show name and seasonal theme.
- Clearer category-position guidance, local-saving reminders and CSV privacy wording.
- Home show-name contrast advice in the editor and wizard.
- A scrollable viewer fallback for browsers without CSS :has(); unsupported filter controls are hidden.
- Help links to short public forms for problems, feedback, ideas and questions.
- Includes the artwork, display, help, name-style and import-confirmation improvements listed below.

## 17 October 2026 — Clearer help and show-name styling

- Simpler header with Setup wizard, Help, What’s new and the appearance switch; GitHub moves to the footer.
- A clearer introduction and one download link for the ready-made template and instructions.
- Help brings together the illustrated quick-start guide, tour and detailed setup instructions.
- Five Home show-name styles and an optional independent colour, with a live name sample in the editor and setup wizard. The original style is labelled Default.
- Existing designs keep their current heading style; font files and licences are included in the manual download.
- Optional compact song cards without album artwork, with a direct RF artwork-help link. Existing designs keep artwork enabled.
- Clearer category instructions explain hiding a filter button while keeping its songs under All.
- CSV imports now wait for confirmation. Cancel import, the X or Escape leaves the previous catalogue, categories and NEW sashes unchanged.

## 17 October 2026 — Small customiser improvements

- Show name on Home now sits directly below the show name, including in the setup wizard.
- Optional gentle On air dot glow, respecting reduced-motion preferences.
- Optional icons-only navbar, retaining accessible button names.
- A What’s new screen in the customiser, with this update history.

## 16 October 2026 — Artwork and demo songs

- Five additional navbar decorations and two additional logo designs for each theme, including light-show artwork.
- Editable show names paired with logo artwork, plus an option to hide the visible Home name for uploaded logos that already include it.
- Two additional ordinary sample songs in both themes and music modes.
- Existing settings keep their previous artwork and name visibility.

## 1.4.0 — First public release

- Lights on Sunset template with Christmas and Halloween themes.
- Visual customiser, optional setup wizard and quick tour.
- Mobile, tablet and desktop demo previews with Jukebox/Voting and On air/Off air controls.
- Optional RF CSV preview, category filters and NEW sashes.
- Editable show details, schedules, listening, support cards, FAQs, playlists and resources.
- Native RF countdowns and optional queue/vote counters.
- Local settings backups, script-free RF HTML exports and ready-made manual downloads.
- Illustrated setup instructions and an offline quick-start guide.
