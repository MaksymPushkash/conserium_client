# Conserium Clipper

Browser extension for saving the current page or selected text into Conserium through the public ingest API.

## Local install

1. Run `npm run package:extension` from the frontend repository.
2. Open Chrome or a Chromium browser at `chrome://extensions`.
3. Enable Developer mode.
4. Load `extensions/browser` as an unpacked extension for local development.

## Release package

`npm run package:extension` writes `dist/conserium-clipper.zip` with only runtime extension files:

- `manifest.json`
- `popup.html`
- `popup.css`
- `popup.js`

## Required API key scopes

- `ingest:write` to save pages and selections.
- `collections:read` to load the collection picker.
- `status:read` for downstream status polling flows.

Keys must use the `con_` prefix. Legacy `ctx_` keys are rejected by this release.

## Validation

Run extension tests with:

```bash
npm run test -- extensions/browser/__tests__/popup.test.js
```

Create a fresh `con_` key before installing this version if the browser still stores a legacy `ctx_` key.
