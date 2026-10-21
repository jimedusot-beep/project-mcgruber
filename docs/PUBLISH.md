# Publishing guidance

This repository is public. Review every proposed file for secrets, private correspondence, personal addresses, third-party copyrighted material and unverified safety claims. Release fabricated CAD only with clear source geometry and validation status. GitHub visibility is not a substitute for an explicit appropriate license.

## McGruber Lab static deployment

The application lives in `web/`. `.github/workflows/web-lab.yml` checks the original Python suite, Node tests, dependency audit, production assets and desktop/iPhone-emulated browser workflows. After successful checks on `main`, it uploads `web/dist` and deploys with GitHub's official Pages actions. Relative assets and hash routes support the repository URL without a custom domain or paid hosting.

If initial automatic enablement is refused by GitHub, the repository owner must open **Settings → Pages → Build and deployment → Source → GitHub Actions**. The app's GitHub connector does not expose Pages configuration; an installation's source-write permission does not imply Pages-administration access. Re-run the workflow only after configuration changes. Check the workflow's exact error before treating this as the blocker.

No PAT, OAuth secret, private experiment, imported model or user attachment belongs in the static output. IndexedDB data is never collected by the build. Do not publish a user's exported workspace without a separate explicit review.
