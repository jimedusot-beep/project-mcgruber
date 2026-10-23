# Validation status

## Known real CI result
On **October 20, 2026**, the structural GitHub Actions workflow for commit `7f0b91f6d8f2d374060cdb78996ee05399d87082` completed successfully: https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39515004018

This verifies **only documented structure and programmatic checks**, not the electronics or mechanical builds.

The improved workflow covers:
- Nine project folders, nine BOMs, guides, diagram SVGs and test logs.
- Required shared inventories and compatibility matrix coverage.
- Presence of license guidance and starter CAD/STL assets.
- 3D mesh basic manifold edge consistency and programmatically computed bounds.

**No physically measured currents, distances, forces, photographs, printed STL fit tests, or demo video results are claimed.** See [measurement protocol](MEASUREMENT_PROTOCOL.md).


## McGruber Lab software validation — October 21, 2026

The [full application CI run](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39669349415) passed 19 web tests, all 14 original Python tests, 13 desktop/iPhone-emulated browser workflows, the static build/asset checks and a dependency audit with zero reported vulnerabilities. One headless Linux WebKit 3D test is explicitly skipped; software-rendered Chromium exercised actual STL loading, transforms, multipart explosion, save/reload and STL export.

Browser workflows also cover all nine routes, narrow-phone overflow, favorites/theme persistence, component search and inventory, guided progress, simulation evidence, notebook repetition, uploaded-media backup/restore and circuit calculations. A manual cloud-browser check independently saved records across reloads and opened an original starter in the real external CircuitJS engine. The cloud preview's WebGL context is unavailable; that limitation is not represented as a rendering pass.

These are software results. No physical iPhone, electronics, RF link or printed-part fit is certified. See [acceptance report](LAB_ACCEPTANCE.md) for remaining limits and [user guide](LAB_USER_GUIDE.md) for save/restore instructions.

## Local reliability and colorful background — October 22, 2026

The [passing milestone CI](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39854363616) verifies 24 web unit/integration tests, all 14 original Python tests, 17 browser workflows, the production asset build and a zero-vulnerability audit. One Linux WebKit 3D workflow remains explicitly excluded. Added checks reject stale saves, preserve conflicting drafts, upgrade legacy revision metadata, share identical secure-context uploads, remap imported media IDs and protect recovery attachments during cleanup.

Chromium and iPhone-sized WebKit both passed two-tab recovery, invalid-backup preservation and cached source/notebook use with the network disabled, including offline reload after saving a record. Public build assets match precache entries across `Vary: Origin` request variants; installation fetches complete files without stale HTTP-cache revalidation. Playwright 1.64.1 includes the upstream WebKit offline-navigation correction. CI uses its matching official prebuilt image to avoid repeated slow Ubuntu dependency downloads; the suite has a five-minute global timeout with time left for reports.

A manual two-tab check retained both versions and restored the original draft's name and notes. The new yellow/coral/lavender/blue/mint light background and purple/blue/teal dark background were previewed manually; browser checks verify both theme choices survive reload. [Colorful preview](screenshots/colorful-workshop.jpg). New workspaces default to light, while saved choices are preserved. These checks do not certify actual iPhone hardware behavior or physical inventions.
