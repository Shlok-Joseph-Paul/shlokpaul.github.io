# Shot Lab — Espresso Shot Journal

A small, dependency-free espresso journal installed at \`/espresso/\` in the \`shlokpaul.github.io\` repository.

## Features
- Save timestamp, coffee beans, grinder, grind setting, dose, beverage yield, extraction time (from pressing the brew button), basket, taste, rating, and notes.
- One-click reuse of the latest recipe; edit, delete, and search shots.
- Dashboard with total shots, average time, ratio, rating, and recent extraction trend.
- Private on-device IndexedDB storage (falls back to localStorage where necessary).
- Export CSV to analyze in Excel / Google Sheets, and export/import JSON as a lossless backup.
- Responsive layout for iPhone, including adding the webpage to the home screen.

## Important: storage and privacy

**The GitHub repository contains only app code. Your shots are NOT saved into GitHub and are NOT cloud-synced.**

Shots are saved in the local browser database for the website's origin. This means:
- Entries persist across ordinary page reloads and browser restarts on that device.
- Safari on an iPhone and Chrome on a laptop maintain *different* shot histories.
- Clearing website data or using a private browsing mode can delete them.
- Use **Backup JSON** regularly and **Restore backup** to move records between devices.
- CSV export is suitable for analysis but does not include lossless import support.

Cloud sync would require a separate authenticated backend (e.g. Supabase) with server-side access policies; do not embed a GitHub token or secret key in public GitHub Pages JavaScript.

## Publication

GitHub Pages must be enabled for this repository under **Settings → Pages → Deploy from a branch → main / (root)**. Since the repository is named \`shlokpaul.github.io\` but the GitHub username is \`Shlok-Joseph-Paul\`, GitHub treats it as a **project Pages site** by default:

\`https://shlok-joseph-paul.github.io/shlokpaul.github.io/espresso/\`

Actual URL can differ if a custom domain / different Pages configuration is used.

## Dial-in defaults

18 g dose / 36 g yield / 30 s total (including Bambino Plus preinfusion) / Baratza Encore grind setting 8. Defaults are illustrative; adjust based on coffee, basket and grinder calibration. Use the nonpressurized double basket for meaningful grind dialing.

## Testing suggestions

1. Enter a first shot and save it. Reload the browser; the shot should remain.
2. Try Edit, Repeat and Delete.
3. Download JSON; add a test shot; reload; import the backup (it should merge without duplicating IDs).
4. Export CSV and open in Google Sheets/Excel.
5. Test the mobile viewport, including Safari on an iPhone.
