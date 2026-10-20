# 03 — Recovery after a bad `npm audit fix --force`

> **v0.1-only history (Enact, abandoned).** Everything below is about the v0.1 Enact
> app, whose `@enact/cli` pin no longer exists. v0.2 has one devDependency
> (`@webos-tools/cli`) and nothing to recover. If `npm install` in `app/` ever goes
> wrong on v0.2, deleting `app/node_modules` (and `app/package-lock.json`, which is not
> committed) and running `npm install` again is the whole fix.
>
> **Do not use the old step 1 as written.** It said `git reset --hard origin/...`, which
> destroys any local commits that have not been pushed. That nearly wiped real work on
> 2026-10-20 (see `docs/HANDOFF.md` §9). It is replaced below with a merge.

If you accidentally run `npm audit fix --force` in `app/`, it will upgrade
`@enact/cli` from the pinned `6.x` to `7.x`, which is incompatible with the
webOS 22 target. Run the steps below to reset.

**Run every command from inside the `app/` folder.** The command boxes are safe to
paste into macOS zsh (no `#` comments, no apostrophes).

**1. Get the latest fixes from the remote** (includes the `.npmrc` that allows install
scripts and the pinned `package.json`). Originally this step was a
`git reset --hard origin/research/phase-0-feasibility`; use a merge instead, so local
commits survive:

```bash
cd ~/Tv-OS/app
git fetch origin
git checkout research/phase-0-feasibility
git merge origin/research/phase-0-feasibility
```

**2. Delete the polluted dependency tree:**

```bash
rm -rf node_modules package-lock.json
```

**3. Reinstall.** The project's `.npmrc` sets `ignore-scripts=false` plus an
`allow-scripts` list, so the `@webos-tools/cli` postinstall and native deps
(`ssh2`, `cpu-features`, `fsevents`) build without any "approve" dance:

```bash
npm install
```

**4. Make sure the global `ares` tool is on your PATH** (one-time, if you did not
already do it earlier). The last line should print a version like `3.x.x`:

```bash
npm install -g @webos-tools/cli
ares -V
```

If `ares -V` still fails after step 4: on macOS/Linux, find where npm puts global
binaries (`npm bin -g` was removed in npm 9; use the prefix instead). The first line
prints that folder. The second adds it to your PATH in `~/.zshrc` (macOS default; use
`~/.bashrc` on Linux) — it writes the folder as it is right now, which is what you want.
The third reloads the file:

```bash
echo "$(npm prefix -g)/bin"
echo "export PATH=$(npm prefix -g)/bin:\$PATH" >> ~/.zshrc
source ~/.zshrc
```

## Why this happens

`npm audit` lists ~45 "vulnerabilities" in this project's dev dependencies.
**They are not exploitable in our use case.** They are transitive deps of the
local build toolchain (webpack, jest, eslint) that only run on your laptop
during `npm run pack-p`. They never ship to the TV. The listed CVEs are DoS
patterns in regex / sprintf parsers; they'd matter if we were parsing hostile
input in production, which we're not.

The real fix for those warnings is to wait for `@enact/cli` 6.x to receive
a backport (unlikely — it's a maintenance branch), or to migrate the whole
project to the newer Enact toolchain **after** verifying webOS 22
compatibility. Not today. (Resolved differently: v0.2 dropped Enact entirely.)

## What NOT to do

- `npm audit fix --force` — breaks the Enact CLI pin.
- Globally changing npm's `ignore-scripts` — the project's `.npmrc` scopes
  that override to this directory only, which is intentional.
- `git reset --hard` on a branch with unpushed local commits — merge instead.
