# Contributing to Wi24rd Mimir

Thank you for looking. Mimir is maintained by one person in spare time, so
small, focused changes are the ones that get in.

## Before you start

- **A bug:** open an issue with the bug form. Leave out passphrases, tokens and
  app keys; describe them instead.
- **A security problem:** do not open an issue. Use **Report a vulnerability**
  under the Security tab; see [SECURITY.md](SECURITY.md).
- **A new feature:** open an issue first and say what problem it solves. A pull
  request that arrives without one may be declined, however good the code is.

## Setting up

You need git and Node.js 20 or later. There is nothing to install.

```
git clone https://github.com/wi24rd-com/mimir.git
cd mimir
npm test
node src/dashboard.mjs --demo
```

`npm test` runs every test. The last command opens the dashboard with invented
figures, so you can see a change without a GitHub App or real data.

## What a change has to keep

- **No dependencies.** Mimir uses what Node and the browser bring. A change that
  adds a package will be declined.
- **Nothing leaves GitHub.** The dashboard fetches from GitHub only, and the
  collector talks to the GitHub API only.
- **The formats of version 1.** A newer 1.x version must read the `mimir.json`
  and the `data` branch of an older one. `test/format.test.mjs` holds files
  written by 0.1.0; they are never regenerated.
- **Outside data is data.** Repository names, referrers and anything read from
  the `data` branch are shown with DOM nodes, never built into HTML.
- **English first, Danish second.** A new text goes into both languages in
  `docs/lib/i18n.js`.
- **Workflows:** actions locked to a full commit, the smallest permissions that
  work, and a time limit on every job.

## A pull request

- One change per pull request, with a test that fails without it.
- `npm test` passes.
- Say what you ran and what you saw. If something could not be tried, say that
  too; "not tried" is a fine thing to write.
- A change to what the user sees comes with a screenshot of the demo.

Mimir is built with [ASEWAVE](https://asewave.org): the folder `asewave/` holds
the evidence for what has been verified. You do not have to write in that form.

## Licence

By contributing you agree that your contribution is licensed under Apache-2.0,
like the rest of Mimir.
