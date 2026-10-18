# Working on the Lights on Sunset template

Each registered template uses the same canonical rendering path for its editor export and manual downloads; common settings, controls and preview services are shared. Keep editor-only JavaScript out of the RF export.

## Share a viewer template

Have a viewer page you love? [Share it for consideration as a community template](https://github.com/lightsonsunset/remote-falcon-template/issues/new?template=viewer-template.yml). Include the HTML code, original author and licence or permission to reuse it. Only submit pages you have permission to share and adapt, not purchased templates. Remove private information before posting; issues and attachments are public. Submissions are reviewed for suitability and RF compatibility, and inclusion is not guaranteed.

Prefer to discuss your viewer page privately? Message [christmasdave on AusChristmasLighting](https://auschristmaslighting.com/members/christmasdave.33949/). The same permission requirements apply.

Attach a cleaned copy of the viewer HTML as a `.txt` or `.zip` file, or link to a public source repository. Include a screenshot or public preview if available, and describe what makes the layout useful. Keep original credits and licence notices. List any images, fonts or other assets that need separate permission or replacement. Do not include credentials, private settings, full catalogues or personal visitor information.

This project is distributed under GPL-3.0. Accepted contributions need compatible reuse permissions and may need changes to work with the shared customiser. The submission form starts a review; it does not automatically import a page or change anyone’s live viewer.

## Run locally

Use Node.js 22 or newer. No packages need installing.

```sh
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4188`. Serve over HTTP locally; browsers restrict module loading from file URLs. The downloadable manual guide works directly from disk.

## Source layout

- `templates/christmas.html`: the original canonical viewer source, with renderer placeholders and native RF hooks.
- `src/template.js`: compatibility entry point for the original settings and rendering API. Shared validation and rendering live in `src/shared-settings.js`; registrations live in `src/template-registry.js`.
- `src/themes.js`: Christmas and Halloween colours, default wording and message copy for the same layout.
- `src/visitor-extras.js`, `src/extras-form.js`: optional social links, playlists, videos, facts, resources and seasonal countdown rendering/editor controls.
- `src/song-artwork.js` and `src/song-artwork-form.js`: shared artwork migration, category mappings, script-free viewer CSS and editor/setup controls. Preserve the legacy artwork checkbox through inherited defaults; explicit list and Now Playing choices are independent. Category glyph metadata in `src/icons.js` must match the pinned Font Awesome 6.6 Free stylesheet.
- `src/song-badges.js`: shared exact-sequence Moving spotlights pills, with a separate NEW corner treatment. The existing NEW selectors also drive the embedded sash background when both labels are present, leaving the artwork pseudo-element available. The shared Music → Song badges controls keep NEW and Moving heads assignments together; the latter renders as Moving spotlights. The shared catalogue picker keeps both badge lists pending until Apply; assignments never change RF categories.
- `src/copy.js`: editable visitor text, grouped field definitions and safe linked-text substitutions.
- `src/editor-layout.js`: page ownership, preview-message mapping and conservative HTTPS completion.
- `src/editor-form.js`: editor-only form markup, concise help, shared shortcuts and collapsible FAQ controls.
- `src/assets.js`, `assets/`: transparent WebP artwork and its public GitHub Pages URLs. The local preview serves the same artwork locally; exports use the public URLs.
- `src/preview.js`: isolated, parent-controlled demo adapter. Never imported by the renderer or packaging script.
- `src/preview-drag.js`: mouse swipe support for phone/tablet previews only.
- `src/tour.js`, `tour.css`: optional editor-only welcome tour. Its dismissal is an editor preference; it never changes show settings or demo interactions.
- `src/setup-model.js`, `src/setup-wizard.js`, `setup.css`: optional four-step editor setup. Works on a detached draft, uses the existing validator/theme handling, and commits only on Apply. Uses the selected template’s settings adapter; no RF integration.
- `src/catalogue.js`: local RF CSV parsing and storage, used only by the editor and preview.
- `src/rf-export-help.js`: shared editor-only CSV export instructions, linked from catalogue controls and Song badges. Help returns focus to its opener without changing settings or imports.
- `src/category-help.js`: shared editor-only category guidance and missing-category notices, available from import review and Music settings without committing pending choices.
- `src/app.js`, `editor.css`, `index.html`: editor interface and export actions.
- `src/storage.js`: resilient local autosave, separate from editor preferences and demo state.
- `scripts/package.mjs`: generates two seasonal HTML starters and a ZIP for every registered template, using its canonical renderer/defaults.
- `scripts/readme.mjs`: generates the offline README.html from README.md, with embedded screenshots. Rebuild it through npm run build; edit the Markdown source instead of the generated HTML.
- `tests/`: pure renderer/storage tests and browser layout, interaction and clipboard-failure checks.

`npm run build` regenerates committed downloadable files. Commit those changes with template changes. GitHub Actions verifies changes and deploys an allowlisted static site from `main`; `.nojekyll` is included. Tests and development tools are not deployed. No domain or DNS configuration is required. Release checks are recorded in `VERIFICATION.md`.

Settings files use version `2` and template ID `festive`. Version 1 Christmas files migrate without losing personal values. Incomplete but structurally valid drafts can be saved/loaded; invalid URLs still block export and never become preview links. Unsupported versions/templates are rejected without overwriting work. The original adapter retains this format. Other registered templates have their own versioned formats.


## Checks and release

Run the Node checks and the relevant browser checks under `tests/` after changes. Browser harnesses use localhost and restore their saved settings. Use an RF draft for validation before activating a generated viewer. Native RF countdowns, votes, location access and actual playback need testing in RF; the isolated demo cannot validate those integrations.

Public asset URLs in `src/assets.js` must be checked after deployment. Keep the original template attribution and GPL licence. Screenshots in `docs/images/` use only generic template values and the illustrative demo. Do not commit imported catalogues or personal settings backups.

## Releases and maintenance

Use a pull request for changes, run `npm run verify`, and commit rebuilt downloads. Required checks must pass before squash-merging. The Pages workflow deploys the same checked commit. Use only public, generic examples in source, screenshots, issues and commit messages; keep private notes and user data outside the repository.

Before merging a release, update the product version in package.json, the release heading in CHANGELOG.md and both template edition headers, then rebuild the downloads. Tag the checked merge commit as `vMAJOR.MINOR.PATCH` and attach both generated manual ZIPs. Keep published `assets/` filenames stable because installed RF viewers can reference them. For rollback, revert the faulty change through a pull request and redeploy; do not rewrite a released tag. Record user-facing changes in CHANGELOG.md.

## Adding templates

Register each template in `src/template-registry.js`. A registration supplies identity, source, seasonal storage policy, defaults, structural checks, validation, backup parsing, canonical render/draft render, supported feature flags, editor groups, assets and download names. The editor, design store, history and packaging are shared. Keep the original `festive` adapter and settings format compatible.

`src/history.js` stores session transactions; `src/design-store.js` owns isolated designs and private catalogues. `src/shared-settings.js` contains existing reusable content validation and RF substitutions; `src/template.js` preserves the original module interface. `src/compact-console.js` adds seasonal settings and tile rendering without changing the original saved schema.

Use one CHANGELOG.md and product version. Group new entries under Shared customiser and the affected template names. Changelog entries describe delivered features and fixes only; keep plans, deferred ideas and remaining work in private planning notes. Preserve published historical entries.

Run `npm run start:review` for the local review on port 4198. For another isolated port, pass it to the server script or set PORT before starting. The default remains 4188. Use disposable browser contexts for automated checks.

Shared identity controls are in `src/header-identity.js`; both the editor and detached setup draft use them. `src/information-cards.js` retains the legacy first-card keys while presenting one ordered list, and `src/information-form.js` owns its shared controls. `src/visitor-guidance.js` generates placement tokens using native RF availability containers. The registry supplies supported header choices and content placement.

Preview context restoration belongs to `src/preview.js` and the editor-only `src/editor-context.js`. Keep this code out of viewer renderers. When changing shared behaviour, exercise both registered templates; do not copy these services into a second preview or wizard. `tests/refinements.html` covers the shared additions with the labelled local demo.
