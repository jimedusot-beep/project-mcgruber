# Publishing guidance

This repository is public. Review every proposed file for secrets, private correspondence, personal addresses, third-party copyrighted material and unverified safety claims. Release fabricated CAD only with clear source geometry and validation status. GitHub visibility is not a substitute for an explicit appropriate license.

## McGruber Lab static deployment

The application lives in `web/`. `.github/workflows/web-lab.yml` checks the original Python suite, Node tests, dependency audit, production assets and desktop/iPhone-emulated browser workflows. After successful checks on `main`, it uploads `web/dist` and deploys with GitHub's official Pages actions. Relative assets and hash routes support the repository URL without a custom domain or paid hosting.

If initial automatic enablement is refused by GitHub, the repository owner must open **Settings → Pages → Build and deployment → Source → GitHub Actions**. The app's GitHub connector does not expose Pages configuration; an installation's source-write permission does not imply Pages-administration access. Re-run the workflow only after configuration changes. Check the workflow's exact error before treating this as the blocker.

No PAT, OAuth secret, private experiment, imported model or user attachment belongs in the static output. IndexedDB data is never collected by the build. Do not publish a user's exported workspace without a separate explicit review.


### Observed first deployment attempt

[Release run 39669645464](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39669645464) completed all application checks and uploaded the site artifact. `actions/configure-pages@v5` could not create the previously absent Pages site: **Resource not accessible by integration**. The exact remaining action is for the signed-in repository owner to select **Settings → Pages → Build and deployment → Source → GitHub Actions**, then rerun the latest workflow. No live site or URL has been confirmed.


### Confirmed production blocker — 2026-10-23

The [main-branch run #39996218874](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39996218874) **passed** Python tests, Node tests, dependency audit, Vite production build, desktop Chromium, iPhone WebKit emulation, and artifact upload. The **deploy** job failed at `actions/configure-pages@v5` with:

```
Get Pages site failed: Not Found
Create Pages site failed: Resource not accessible by integration
```

This is a GitHub Pages **site-initialization/permission blocker**, not evidence of an app build failure. A code change cannot grant an installation token the missing repository administration permission. The updated workflow checks for a Pages site **before** deploying and stops with an actionable error instead of repeatedly attempting to create the site.

**Owner-only one-time action** (on GitHub, while signed in as repository owner):

1. Open [Project McGruber → Settings → Pages](https://github.com/jimedusot-beep/project-mcgruber/settings/pages).
2. Under **Build and deployment**, choose **Source: GitHub Actions**; enable Pages if prompted, then save.
3. Open [McGruber Lab workflow](https://github.com/jimedusot-beep/project-mcgruber/actions/workflows/web-lab.yml), choose **Run workflow** on `main`, and wait for both `validate` and `deploy` to succeed.
4. Only when deployment succeeds, check `https://jimedusot-beep.github.io/project-mcgruber/#/tripwire-3d` in a real browser, including component selection, slider and export. Do **not** describe the Pages URL as live before checking.
5. To inspect the built site **without** Pages, download `mcgruber-lab-static-preview` from the successful workflow's Artifacts section, extract it, and serve it from a local HTTP server (opening `index.html` directly as a file may block JavaScript imports). No account credentials are needed in source code.

**Already-deployed alternative for the same 13-part educational study:** [3D Vision exploded model](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-tripwire-exploded). This is a separate 3D viewer; it does not replicate every feature of McGruber Lab's custom beam simulator.

The workflow must continue failing deployment when Pages is disabled: marking an unavailable public website as successfully deployed would be misleading.
