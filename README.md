<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/mimir-banner-dark.jpg">
    <img src="assets/mimir-banner-light.jpg" alt="Wi24rd Mimir - GH Insights-tracker" width="800">
  </picture>
</h1>

Keeps the history of your GitHub traffic and release downloads, in your own account.

GitHub shows repository traffic for the last 14 days only, and it does not show
how often a release file was downloaded. Mimir collects both twice a day with a
GitHub Actions workflow and stores them in a `data` branch of your own copy of
this repository. Nothing is sent to Wi24rd or to any third party.

**Status: in development. Not released.** Collection, setup, the terminal view
and the dashboard exist and are tested. Publishing the dashboard on GitHub Pages,
the phone setup and the badges are built but have not been run for real. See [`asewave/`](asewave/) for what has been
verified and what has not.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/screens/overview-dark.png">
  <img src="assets/screens/overview-light.png" alt="The Mimir dashboard: a sentence with the totals for the last 14 days, and a table with views, clones, downloads and stars for three repositories" width="800">
</picture>

*Every picture on this page shows the demo with invented figures (`node src/dashboard.mjs --demo`).*

## A look around

Mimir runs in a browser, on any computer and on a phone.

| The Well | One repository over time |
|---|---|
| <img src="assets/screens/well-dark.png" alt="The Well: a ring with one stone per day, a line for views per day, and one point per repository with rings for views" width="400"> | <img src="assets/screens/traffic-light.png" alt="A line chart of views and clones per day for one repository" width="400"> |
| The same figures as one picture, with the table beside it. | Views and clones per day, kept beyond GitHub's 14 days. |

| On a phone | What a visitor sees | Open on phone |
|---|---|---|
| <img src="assets/screens/phone-well-dark.png" alt="The Well on a phone" width="240"> | <img src="assets/screens/phone-front-light.png" alt="The front page: the figures the owner chose to publish, and a button that leads to the lock" width="240"> | <img src="assets/screens/phone-dialog-light.png" alt="A dialog with a QR code that holds the address of the dashboard" width="320"> |
| Light and dark, English and Danish. | Only what you chose to publish. The rest is encrypted. | A QR code with the address, nothing else. |

## What it collects

| Figure | Source | What you get |
|---|---|---|
| Views and clones | Traffic API | One figure per day, kept beyond 14 days |
| Referrers and popular paths | Traffic API | GitHub's top 10 for the last 14 days, saved once per day |
| Release downloads | Releases API | The counter per file, saved when it changes |
| Stars, forks, watchers | Repository API | Saved when they change |

Unique visitors cannot be added up across days. GitHub only reports them per
day, and the same person on two days counts twice.

## Three modes

Set `visibility` in [`mimir.json`](mimir.json).

| Mode | Who can read the figures | Repository |
|---|---|---|
| `encrypted` (default) | Whoever has the passphrase | Public, content encrypted |
| `public` | Anyone | Public |
| `private` | You | Private |

In `encrypted` mode everything is stored as AES-256-GCM files. The key is
derived from your passphrase with PBKDF2-SHA256 (600,000 rounds). File names do
not reveal which repositories you track. What stays visible: that a tracker
exists, when it runs, and roughly how much data it holds.

Changing from an open mode to `encrypted` does not remove figures that are
already in the git history. Mimir refuses that change unless you ask for it.

## Access

Traffic figures require the "Administration: read" permission. The built-in
Actions token cannot have it. Instead of a long-lived personal access token,
setup registers a GitHub App that belongs to you, with that one read
permission. Each run asks for a token that expires after an hour.

## Setup

Requires [GitHub CLI](https://cli.github.com) and Node.js 20 or later.

1. Click **Use this template** at the top of this page and create your own
   repository from it. Make it public for the `encrypted` and `public` modes,
   private for `private`. Then clone it.
2. Edit `mimir.json`: your repositories and the mode. Commit and push.
3. Run `node src/setup.mjs` in the clone.

Use the template, not a fork. Each copy keeps its own figures in its own `data`
branch, and nothing is collected in a copy until setup has run there. A copy
does not follow this repository: to take a newer version, copy the files over
your own and keep your `mimir.json`.

You confirm twice in the browser: once to create the app, once to choose the
repositories it may read. The app's key goes straight into the repository's
secrets. It is not written to disk and not shown on screen.

## See your figures

In your clone:

```
node src/show.mjs          # a summary in the terminal
node src/dashboard.mjs     # the dashboard, served on this computer only
```

Both read the `data` branch of your clone. In `encrypted` mode they ask for your
passphrase; the dashboard decrypts in the browser and keeps the passphrase in
that tab's memory only. Add `--demo` to either command to try it with invented
figures, and `--lang da` for Danish in the terminal. `--front` shows the page a
visitor would meet on GitHub Pages.

The dashboard is in English and Danish, light and dark, and works on a phone.
It has four tabs with tables and charts (Overview, Traffic, Downloads, Sources),
a filter for one repository, and a fifth tab, The Well, that draws the same
figures as one picture: a stone per day around the rim and a point per
repository on the water. A settings dialog writes a
new `mimir.json` for you to save on GitHub. The page itself cannot change your
repository, and it loads nothing from other sites.

It is built with [Wi24rd UI Kit 2](docs/kit/), the design system shared by the
Wi24rd programs, copied unchanged into `docs/kit/`.

## On your phone

Not yet tried on a real phone or on GitHub Pages; see [`asewave/`](asewave/).

When the repository is public and GitHub Pages serves the `docs/` folder, the
dashboard has an address of its own. Turn it on under Settings, Pages: deploy
from the `main` branch, folder `/docs`. "Open on phone" in the dashboard shows a QR
code with that address and nothing else. On the phone, "Add to Home Screen"
(iPhone) or "Install app" (Android) gives Mimir its own icon and opens it in
full screen. It needs a connection; nothing is kept for offline use.

**What a visitor sees.** In `encrypted` mode a visitor meets a front page with
the figures you chose to publish, if any, and a button that leads to the lock.
Everything else stays encrypted. In `public` mode a visitor sees the whole
dashboard.

**Remember on this device.** Off unless you tick it on the lock screen. There
are two ways:

- *With a check*: Mimir creates a passkey on the device, and your passphrase is
  stored encrypted under a secret that the passkey only gives out after Face ID,
  a fingerprint or the device PIN. Not every phone and password manager can do
  this; Mimir says so and remembers nothing when they cannot.
- *Without a check*: the passphrase is stored encrypted under a key the browser
  will not hand out. Anyone holding the unlocked device can open the figures.

Either way, what is remembered belongs to the web address, not to Mimir. On
GitHub Pages every site of one account shares the address
`<account>.github.io`, so another Pages site of yours can reach it. Use it only
when the sites on that address are your own. "Forget this device" removes it; a
passkey stays in your password manager until you delete it there.

Browsers refuse passkeys on a numeric address. The local dashboard also answers
on `http://localhost:<port>/`, where they work.

## Badges and published figures

`public_badges` in `mimir.json` lists what is published in the open, in every
mode: `total_downloads`, `stars` and `repo_downloads` (one figure per
repository). Views and clones cannot be published this way. Each collection
writes one small JSON file per figure to `badges/` on the `data` branch, removes
the files for figures you no longer list, and writes `public.json` for the front
page.

The settings dialog gives the Markdown and HTML for each badge, ready to paste
into a README. The picture is drawn by [shields.io](https://shields.io), a
service outside GitHub that reads the figure from your `data` branch; readers of
your README load the picture from there. The repository has to be public.

## Limits

- GitHub may disable scheduled workflows in a public repository after 60 days
  without activity. A disabled workflow cannot report its own stop. The
  dashboard and the terminal view warn when nothing has been collected for 36 hours.
- A failed collection opens an issue in the repository. The next successful one closes it.
- Commits on the `data` branch carry the day only, not the time. The list of
  runs under Actions still shows when each collection ran.
- Solo-maintained in spare time. No support promise, no response times.

## Development

```
npm test
```

No dependencies. Built with [ASEWAVE](https://asewave.org).

## License

Apache License 2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE). The fonts in
`docs/kit/fonts/` are under the SIL Open Font License 1.1.
