# Security

## Reporting a vulnerability

Please report it privately: open the **Security** tab of this repository and
choose **Report a vulnerability**. Do not open a public issue for it.

Say what you found, how to reproduce it and what an attacker gains. Leave out
real passphrases, tokens and keys; describe them instead.

Mimir is maintained by one person in spare time. Reports are read, but there is
no promised response time.

## What Mimir protects, and what it does not

- In `encrypted` mode the figures are stored as AES-256-GCM files, with a key
  derived from your passphrase (PBKDF2-SHA256, 600,000 rounds). The encrypted
  files are public when the repository is. Their protection is the passphrase:
  keep the generated one, or choose one that is as hard to guess.
- The workflow reads traffic figures with a token that lives for one hour and
  has one read permission. It writes only to the `data` branch of its own
  repository. A second job may switch the Collect workflow on again
  (`actions: write`) and does nothing else; it holds neither the app key nor
  the passphrase.
- The dashboard fetches from GitHub only. When nothing has been collected for
  36 hours it asks `api.github.com` once whether the collecting workflow is
  switched on. That request carries the repository's name and no figures.
- `node src/update.mjs` takes Mimir's files from a tagged version of
  `wi24rd-com/mimir`. It replaces only the paths that version lists, refuses
  paths outside Mimir's own files, and commits nothing.
- "Remember on this device" stores your passphrase in the browser. Read
  [On your phone](README.md#on-your-phone) before you use it on an address you
  share with other pages.
- The figures you list in `public_badges` are public by your choice.

## Supported versions

Only the newest version on the `main` branch.
