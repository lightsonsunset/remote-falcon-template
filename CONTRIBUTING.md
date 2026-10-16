# Working on the Lights on Sunset template

The editor and manual downloads share one canonical viewer renderer. Keep editor-only JavaScript out of the RF export.

## Run locally

Use Node.js 22 or newer. No packages need installing.

```sh
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4188`. Serve over HTTP locally; browsers restrict module loading from file URLs. The downloadable manual guide works directly from disk.

## Source layout

- `templates/christmas.html`: the only canonical viewer source, with renderer placeholders and native RF hooks.
- `src/template.js`: Seasonal settings schema, validation, escaping, rendering and the small template registry.
- `src/themes.js`: Christmas and Halloween colours, default wording and message copy for the same layout.
- `src/visitor-extras.js`, `src/extras-form.js`: optional playlists, videos, facts, resources and seasonal countdown rendering/editor controls.
- `src/copy.js`: editable visitor text, grouped field definitions and safe linked-text substitutions.
- `src/editor-layout.js`: page ownership, preview-message mapping and conservative HTTPS completion.
- `src/editor-form.js`: editor-only form markup, concise help, shared shortcuts and collapsible FAQ controls.
- `src/assets.js`, `assets/`: transparent WebP artwork and its public GitHub Pages URLs. The local preview serves the same artwork locally; exports use the public URLs.
- `src/preview.js`: isolated, parent-controlled demo adapter. Never imported by the renderer or packaging script.
- `src/preview-drag.js`: mouse swipe support for phone/tablet previews only.
- `src/tour.js`, `tour.css`: optional editor-only welcome tour. Its dismissal is an editor preference; it never changes show settings or demo interactions.
- `src/setup-model.js`, `src/setup-wizard.js`, `setup.css`: optional four-step editor setup. Works on a detached draft, uses the existing validator/theme handling, and commits only on Apply. No new settings schema or RF integration.
- `src/catalogue.js`: local RF CSV parsing and storage, used only by the editor and preview.
- `src/app.js`, `editor.css`, `index.html`: editor interface and export actions.
- `src/storage.js`: resilient local autosave, separate from editor preferences and demo state.
- `scripts/package.mjs`: generates both ready-made theme HTML files and one ZIP from the same renderer/defaults.
- `scripts/readme.mjs`: generates the offline README.html from README.md, with embedded screenshots. Rebuild it through npm run build; edit the Markdown source instead of the generated HTML.
- `tests/`: pure renderer/storage tests and browser layout, interaction and clipboard-failure checks.

`npm run build` regenerates committed downloadable files. Commit those changes with template changes. GitHub Actions verifies changes and deploys an allowlisted static site from `main`; `.nojekyll` is included. Tests and development tools are not deployed. No domain or DNS configuration is required. Release checks are recorded in `VERIFICATION.md`.

Settings files use version `2` and template ID `festive`. Version 1 Christmas files migrate without losing personal values. Incomplete but structurally valid drafts can be saved/loaded; invalid URLs still block export and never become preview links. Unsupported versions/templates are rejected without overwriting work. A single template registry entry exposes two seasonal themes.


## Checks and release

Run the Node checks and the relevant browser checks under `tests/` after changes. Browser harnesses use localhost and restore their saved settings. Use an RF draft for validation before activating a generated viewer. Native RF countdowns, votes, location access and actual playback need testing in RF; the isolated demo cannot validate those integrations.

Public asset URLs in `src/assets.js` must be checked after deployment. Keep the original template attribution and GPL licence. Screenshots in `docs/images/` use only generic template values and the illustrative demo. Do not commit imported catalogues or personal settings backups.

## Releases and maintenance

Use a pull request for changes, run `npm run verify`, and commit rebuilt downloads. Required checks must pass before squash-merging. The Pages workflow deploys the same checked commit. Use only public, generic examples in source, screenshots, issues and commit messages; keep private notes and user data outside the repository.

Tag releases as `vMAJOR.MINOR.PATCH` and attach the generated manual ZIP. Keep published `assets/` filenames stable because installed RF viewers can reference them. For rollback, revert the faulty change through a pull request and redeploy; do not rewrite a released tag. Record user-facing changes in CHANGELOG.md.
