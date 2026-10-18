# Changelog

## Unreleased — More templates, shared editing

### Shared customiser

- Make optional NEW-sash selection clear with a prominent heading directly above the song search and list. Import guidance explains that unticked songs are still imported, shared by both templates.

- Explain category filters in one shared help dialog, linked from import and Music settings alongside RF’s category guide. Import review counts uncategorised songs and recommends category assignments without blocking import or changing pending choices.

- Handle songs without categories consistently: retain the music-note artwork fallback, exclude them from named category filters, and preserve their Voting tallies and NEW badges. CSV category detection accepts mixed catalogues, and the local preview follows RF’s ungrouped markup.

- Invite viewer-page submissions from the template chooser and Help feedback flow. A dedicated public issue form collects source code, credits and reuse permissions for consideration as future community templates, with an optional AusChristmasLighting forum contact for private discussion.

- Independently show artist names in song lists and in Now Playing, Up Next and the queue. Both templates share the controls, setup drafts, backups, copying and Undo/Redo. Older designs keep artists enabled, and missing artists leave no blank artist line.

- Share non-scrolling category targets so All, category and NEW filters retain the viewer position and native browser history.

- Refresh both template guides, manual-editing instructions and screenshots. Verify the exact contents and offline guide links in every manual ZIP through shared packaging checks.
- Restore the correct local-save status after loading or changing designs, including session edits that could not be saved.

- Make Reset to defaults and Reset demo easier to find with warm warning-coloured pill buttons. The design-reset confirmation names the template and season being reset. Organise the shared icon picker into Christmas, Halloween, Lights & magic, Music & media and General, with category filters and search.

- Use the same Welcome section and Welcome message label across templates, with shared controls for the common content.

- Explain disabled Copy/Download HTML actions beside the buttons, with links straight to the fields needing attention in either template.

- Choose album artwork, category icons or no artwork for the song list, with a separate Now Playing artwork switch. Both templates share the icon picker and category mappings; existing artwork settings keep their appearance. Choices are included in setup, backups, copying and Undo/Redo.

- Keep editor scroll, focus, caret and preview context while editing or using Undo/Redo. Header appearance and icon choices use the same controls in setup and the editor; setup choices remain a draft until Apply.
- Add up to five extra-information cards with optional pictures, links, reordering and removal. Existing cards keep their saved content and placement.
- Choose on-air visitor guidance above the header, below it or below On air. Existing designs retain their previous defaults.
- Expand the shared Font Awesome Free library with seasonal icons and seasonal search terms. Icons-only navigation uses larger, centred 24px icons.

- Template previews open as a centred phone with detached On air / Off air and Close controls. Thumbnail backgrounds stay dark on hover. The editor and expanded previews share the same renderer and mouse-drag scrolling.
- Season buttons now look consistent across templates. Start setup or go straight to the editor from the template chooser; finish setup with one Apply & open editor button and an optional Take a quick tour after setup checkbox. The checkbox starts unchecked each time and retains its choice during Back/Next navigation. The shorter shared tour includes a visual category-filter example.
- Choose navigation, page-action and message icons from one searchable library, also used by playlists and resources. Older designs retain their default icons.
- Tighten shared setup spacing: keep explanation text beside its related control, remove extra textarea margins, and retain comfortable checkbox tap targets. Remove the duplicate export shortcut from the temporary setup summary; Finish & export remains in the editor header.
- Group the current design and template actions in a compact shared toolbar with a uniform border, distinguish compact undo/redo controls, align wizard schedule columns, and clarify extra-information placeholders.

- Show maximum queue length above Jukebox song choices in either template, using RF’s native value and editable wording. Existing designs keep the option off. Keep the default message brief, with one concise editor explanation linking to RF’s queue settings guide.
- Choose a template from seasonal previews and resume each saved design independently.
- Undo and redo edits, setup, resets and applied catalogue imports during the editing session. Each design has its own history.
- Copy selected show details between designs after review. Keep appearance and imported catalogues separate.
- Backups, setup, validation, preview and downloads use shared template registration.
- Update the introduction and action labels for multiple templates.

### Lights on Sunset

- Align optional navbar artwork with the selected button when Support is hidden.

- Gains the shared editor features while preserving its layout, original settings format, theme behaviour and download addresses. Existing RF HTML does not need replacing for editor-only improvements.

### Compact console

- Add seasonal navbar framing under Decorations: a fine candy-cane stripe for Christmas and a violet edge with cobweb corners for Halloween. The dark surface, selected buttons and tap areas stay consistent; decorations can be switched off.

- Deepen the Fireside glow and Haunted violet page backgrounds so seasonal song cards and controls stand out more clearly. Advanced colour choices remain unchanged. Give both Compact navigation bars a darker base, accent outline and stronger shadow to separate them from the cards.

- Keep a visible 12px gap between song cards in request and voting lists, including category filters and NEW results. Preserve the grid when RF supplies an inline category layout.

- Keep RF-supplied Up Next and queued-song artwork hidden so the compact text rows fit narrow phones.

- Edit the line above the show name in Music → Welcome → Tagline, or leave it blank to hide it. Existing designs retain “Lights · Music · Together”.

- Optionally place a simple icon above the show name. Extra-information cards stay on Info; main-screen guidance is optional and off by default.

- Adds a Music-first layout with separate Info and Support views, a collapsed queue directly above Request a Song, and date-and-hours tiles.
- Includes cosy Christmas and spooky Halloween styles, colour presets, advanced colours, light strands, corner details and a hanging spider. Motion respects reduced-motion preferences.
- Saves complete Christmas and Halloween designs separately. Backups include both seasons; HTML export includes the selected season.
- Local previews illustrate RF states. Actual playback, requests, votes and location integration still require an RF draft check before live use.

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
