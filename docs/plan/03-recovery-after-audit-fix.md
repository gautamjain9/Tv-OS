# 03 — Recovery after a bad `npm audit fix --force`

If you accidentally run `npm audit fix --force` in `app/`, it will upgrade
`@enact/cli` from the pinned `6.x` to `7.x`, which is incompatible with the
webOS 22 target. Run the steps below to reset.

**Run every command from inside the `app/` folder.**

```bash
cd ~/Tv-OS/app

# 1. Pull the latest fixes from the remote (includes the .npmrc that allows
#    install scripts and the pinned package.json).
git fetch origin
git checkout research/phase-0-feasibility
git reset --hard origin/research/phase-0-feasibility

# 2. Delete the polluted dependency tree.
rm -rf node_modules package-lock.json

# 3. Reinstall. The project's .npmrc sets ignore-scripts=false plus an
#    allow-scripts list, so the @webos-tools/cli postinstall + native deps
#    (ssh2, cpu-features, fsevents) build without any "approve" dance.
npm install

# 4. Make sure the global ares tool is on your PATH (one-time, if you did
#    not already do it earlier).
npm install -g @webos-tools/cli
ares -V            # should print a version like 3.x.x
```

If `ares -V` still fails after step 4:

```bash
# macOS/Linux: find where npm puts global binaries
# (`npm bin -g` was removed in npm 9; use the prefix instead)
echo "$(npm prefix -g)/bin"
# add that directory to PATH in ~/.zshrc (macOS default) or ~/.bashrc:
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc
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
compatibility. Not today.

## What NOT to do

- `npm audit fix --force` — breaks the Enact CLI pin.
- Globally changing npm's `ignore-scripts` — the project's `.npmrc` scopes
  that override to this directory only, which is intentional.
