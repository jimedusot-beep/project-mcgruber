# Phone tripwire V4 — verification record

Date: 2026-10-23. Owner roadmap: silent camera receiver, existing parts first, flashlight before DIY LED, ten crossings and measured stability, separate range milestones.

## Evidence categories

| Category | Status |
|---|---|
| iPhone automatic red-light detection at nominal 1, 3, 6, 10 and 15 ft | Owner field report added during development; raw measurements and app revision unavailable |
| Core detector and qualification logic | Automated Node tests using numerical signals and synthetic time |
| Canvas scoring and mobile controls | Automated Chromium 153, mobile viewport, synthetic video delivery |
| Existing workshop behavior | Chromium regression suite using the existing browser tests |
| Actual iPhone Safari / WebKit | Not run locally; committed Playwright configuration retains iPhone WebKit CI project |
| LED identity, rating, holder wiring, current | NOT_MEASURED |
| Independently measured crossings/range, mounts, lighting reliability, restart | NOT_RUN; preserve existing PASS_REPORTED field outcomes separately |
| Public V4 deployment | Not established by a feature-branch commit or open PR |

## Commands and coverage

- `npm ci` in `web`: completed. No dependency changes were required.
- `npm test`: all 38 Node tests passed (28 existing plus 10 detector/qualification tests).
- `npm run build`: passed; static source/catalog and subpath/offline asset verification completed.
- `python -m unittest discover -s tests -v` from repository root: all 14 passed.
- Browser regression cases include ten synthetic crossings, restored detection, test cancellation on camera stop, preserved count through restart, frozen-video shutdown, permission denial, delayed camera permission cancellation on backgrounding, and timed qualification with local saving/JSON download. Final local run: all 16 browser cases passed.
- The normal Playwright browser archive download failed in this environment. Local browser verification used an independently installed Chromium 153 binary, with existing Playwright 1.64.1, and a temporary configuration. This did not alter package.json, lockfiles or the committed CI configuration. WebKit was not locally available.

## Independent review

A separate read-only code review inspected detector state, range qualification, camera lifecycle, storage/export and electrical instructions. It found one important startup cancellation race: backgrounding while permission was pending could allow late camera startup. A failing browser regression reproduced it, then unconditional visibility/pagehide cancellation fixed it. Existing token checks discard late acquisition/metadata/play completions. No other critical or important finding remained. A misleading stale-frame unit-test name was narrowed to the actual five-minute duration behavior; stale-video behavior is exercised by the browser test.

## Physical test still required

1. Flashlight in White mode: ten actual one-second interruptions and two minutes clear, without screen touches during crossings.
2. Verify holder voltage/polarity, resistance, LED rating/polarity, and resistor voltage/current before the DIY source.
3. Repeat at each distance; no 15-foot claim follows from a shorter pass.
4. At the intended mounted setup pass ten crossings, five minutes uninterrupted, restoration, and stop/restart/re-arm recovery.
5. Record daylight/artificial/dim conditions separately. Retain failures and export results.

A synthetic pass does not constitute optical, electrical, hardware or safety certification. See [PHONE_BUILD_TEST.md](PHONE_BUILD_TEST.md) and the printable in-app guide for the actual procedure.
