# SUBMISSION_CHECKLIST.md — Final Gate (only 3 attempts exist; verify before submitting)

## A. Repository rules
- [ ] Repository is **public** (open the URL in a private/incognito window to confirm).
- [ ] Only **one branch** exists.
  ```
  git branch -a                 # expect only: * main  and  remotes/origin/main
  git ls-remote --heads origin  # expect exactly one line: refs/heads/main
  ```
  If any other branch exists: delete it locally (`git branch -D <name>`) and remotely (`git push origin --delete <name>`).
- [ ] Repository size **< 10 MB**.
  ```
  git count-objects -vH         # check size-pack + size (loose)
  du -sh .git
  git ls-files -z | xargs -0 du -ch | tail -1   # tracked files total
  ```
  Remember GitHub's reported size can include history; keep a safe margin (aim < 3 MB).
- [ ] No tracked: `node_modules`, `.next`, `coverage`, build output, large images (> 100 KB), archives, videos, logs.
  ```
  git ls-files | grep -E '(^|/)(node_modules|\.next|coverage|dist)/' && echo "BAD" || echo "ok"
  git ls-files -z | xargs -0 ls -l | sort -k5 -n -r | head -10   # biggest tracked files
  ```
- [ ] Complete project code is in the repository (nothing only on the local machine).
- [ ] Commit history is clean, conventional, and shows regular progress.

## B. Secrets
- [ ] No keys or secrets in the working tree or history.
  ```
  git grep -nE "AIza[0-9A-Za-z_-]{20,}|GEMINI_API_KEY=.+" -- . ':!.env.example' || echo "ok"
  git log -p --all | grep -nE "AIza[0-9A-Za-z_-]{20,}" || echo "ok"
  ```
- [ ] `.env.local` is ignored and untracked; `.env.example` has empty values only.
- [ ] If a key was ever committed: revoke it, rotate it, and rewrite history **before** submitting (while keeping a single branch).

## C. Clean-clone verification
```
rm -rf /tmp/verify && git clone <public-url> /tmp/verify && cd /tmp/verify
npm ci
npm run verify
```
- [ ] Passes with **no** `GEMINI_API_KEY` set.
- [ ] App starts (`npm run dev`) and the full flow works in fallback mode.
- [ ] With a key set locally, the AI path works.

## D. README content (required by the challenge)
- [ ] Chosen vertical
- [ ] Approach and logic
- [ ] How the solution works
- [ ] Assumptions made
- [ ] Plus: security, testing, accessibility, efficiency sections, setup steps, limitations.
- [ ] No placeholder text, no broken links, no claims the code does not back.

## E. Evaluation-area evidence map
| Area | Evidence the evaluator can find quickly |
|---|---|
| Code quality | `ARCHITECTURE.md` structure followed; strict TS; lint clean; small modules; no dead code |
| Security | `docs/SECURITY_CHECKLIST.md` with file/test per item; headers; rate limit; validation; injection tests |
| Efficiency | Cache + dedupe; token and size caps; lazy-loaded chat; bundle size noted in README |
| Testing | `npm run test:coverage` meets gates; `docs/TEST_REPORT.md`; golden scenarios |
| Accessibility | `docs/A11Y_CHECKLIST.md`; axe tests; Lighthouse score in README |
| Problem alignment | README mapping table; three plan categories always present; impact shown per action |

## F. Submission
- [ ] Read the official submission guide document once more and follow its exact format for submitting the link.
- [ ] Submit the repository URL (not a fork of someone else's repo; not a private link).
- [ ] After submitting, do not push further changes unless you intentionally use another attempt. Note attempt number: ___ / 3.
