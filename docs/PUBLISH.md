# Publishing guidance

## Current release: October 31, 2026

**GitHub Pages has been enabled and deployed successfully.** [Main-branch run 41197585759](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/41197585759) passed validation and Pages deployment at commit `f1bff5a13347b15e8ff09295b4e5aee00425f39b`. The old Pages permission blocker is resolved.

- Workshop: https://jimedusot-beep.github.io/project-mcgruber/
- Tripwire 3D: https://jimedusot-beep.github.io/project-mcgruber/#/tripwire-3d
- Release workflow: https://github.com/jimedusot-beep/project-mcgruber/actions/workflows/web-lab.yml

A successful Actions deployment is **not** a physical-device test. A real iPhone/Safari smoke test of navigation, 13-part selection, exploded view, simulation, GLB export, saved records, backups and offline reload remains outstanding. Document any failures separately; do not claim physical hardware tests from browser software.

## Release procedure

1. On `main`, confirm that both `validate` and `deploy` succeeded for the **same commit**.
2. Open the public root and 3D route, check controls and source links, then test on a real iPhone.
3. Export a full notebook backup, reload offline after a successful online first visit, then restore a test backup. Do not clear real user data for smoke testing.
4. Preserve test evidence and open an issue for reproducible problems.

The build in `web/` uses `npm ci && npm run build`. Unit and browser checks, dependency audit, geometry/asset verification and deployment are automated. The install-time cache includes the workshop and source guides, **not** the 35 full-resolution original donor JPEGs or their 35 annotated SVGs. Those images are online-only and lazy-loaded behind a collapsed photo gallery. This reduces required first-use phone storage, but not the total hosted archive size.

The public repository must not contain secrets, private correspondence, personal addresses or unapproved third-party works. The application keeps ordinary workshop data in local IndexedDB. Optional encrypted Supabase cloud backups require separate user configuration, authentication and a passphrase; GitHub Pages does not host private records.

## Historical deployment problem: resolved

[October 23 run 39996218874](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39996218874) failed Pages creation with `Resource not accessible by integration` even though validation passed. [Issue #21](https://github.com/jimedusot-beep/project-mcgruber/issues/21) recorded the former one-time setup steps. Those steps should no longer be required. Close #21 after real-device smoke testing or revise it to track that remaining work; do not label Pages as blocked merely because a physical device was not tested.

The separate [3D Vision tripwire](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-tripwire-exploded) remains an educational model, not physical electrical evidence.
