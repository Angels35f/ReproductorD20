Audio file organization for the app

Place audio files here under the category folders below. Files placed in `public/assets/audio` will be served as-is at `/assets/audio/...`.

Recommended folder structure:

- public/assets/audio/excellent/
- public/assets/audio/good/
- public/assets/audio/normal/
- public/assets/audio/bad/
- public/assets/audio/terrible/

Filename convention (recommended):
  "Title - Artist.mp3"

Example URL usage in the app:
  { url: '/assets/audio/good/At the Risk of Feeling Dumb - Twenty-one Pilots.mp3' }

Notes:
- Use `public/` for static media so Vite serves files directly.
- If you prefer importing audio into the bundle, place them in `src/assets` and import, but dynamic discovery is simpler with `public/`.
