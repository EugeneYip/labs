# Maintenance check

P11 of the autonomous queue, 2026-10-12: dependencies, warnings, and whether the site builds the same from a clean checkout.

## Found

- **Vulnerabilities:** `npm audit` finds none.
- **Packages:** 10 direct ones, all used: React and React DOM; Vite with its React and Tailwind plugins; Tailwind; TypeScript; and the type definitions for React and Node. 42 packages are installed in all.
- **Out of date:** two.
  - `@types/node` 24.19.1, with 24.19.2 available. A patch to type definitions, not worth a change on its own.
  - TypeScript 6.0.3, with 7.0.2 available. A new major version, the compiler rewritten; nothing here needs it.
- **GitHub actions:** checkout, setup-node, configure-pages, upload-pages-artifact, and deploy-pages are all on their latest major versions.
- **Warnings:**
  - The local build gives none.
  - The deploy log has two, neither from Labs. GitHub's own `deploy-pages` action prints Node's "`punycode` is deprecated" warning, and git prints a hint about default branch names when checking out.
  - The third was GitHub's notice that `ubuntu-latest` moves to Ubuntu 26.04 from 2026-10-19. That's dealt with below.
- **Clean checkout:** GitHub builds every deploy from a fresh checkout with `npm ci`, on Linux with Node 24. All 61 files it published are byte-identical to a local build on macOS with Node 22, so the build doesn't depend on the machine.

## Changed

- **Ubuntu 26.04, named** (commit b7f82f7). Both workflows now name `ubuntu-26.04` instead of `ubuntu-latest`. The move happens now, while it can be checked, and the system changes again only when someone chooses to.
  - The next deploy ran on Ubuntu 26.04.1 and succeeded (run 38325368394). Its 61 files are still byte-identical to the local build.
  - The daily check passed there too (run 38325487870, 11 of 11).
- `.github/scripts` is type-checked with the site (P10).

## How to check again

```bash
npm audit
npm outdated
npm ls --depth=0
```

Then build the commit that's deployed (`npm run build`), and compare every file in `dist` with production. Nothing should print:

```bash
cd dist && for f in $(find . -type f | sed 's|^\./||'); do [ "$(shasum -a 256 < "$f")" = "$(curl -s "https://labs.eugeneyip.net/$f" | shasum -a 256)" ] || echo "differs: $f"; done
```

The deploy log's warnings: `gh run view <id> --repo EugeneYip/labs --log | grep -i -E 'warn|deprecat|notice'`.
