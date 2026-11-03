# Real iPhone / Safari acceptance protocol (issue #21)

The mobile-first [on-device acceptance worksheet](../web/public/iphone-qa/index.html) is served at /iphone-qa/ on the McGruber GitHub Pages site.

The worksheet is an **owner-entered QA record**, not a screen-sharing connection or automatic Safari test. It includes thirteen manual checks: Pages/nine inventions, 13-part tripwire WebGL render, orbit/pinch/pan, explode/assemble, part selection/isolation, simulated beam crossing, GLB export, original model editor save/reload, real donor photo gallery, offline cache reload, notebook autosave, disposable backup/restore, and accessibility/orientation.

## On the physical iPhone

1. Open the worksheet in Safari and enter the iPhone model and iOS version from Settings, browser version, date and tester reference. Automatic user-agent parsing cannot certify an iPhone model.
2. For each check, use the direct "Open feature" link in a new tab, perform the instruction, then return to mark Pass, Fail, Blocked or Not tested. Add your actual observations, including any blank WebGL canvas or fallback illustration.
3. For offline testing, first load the relevant pages while online so service-worker caching can complete. Toggle Airplane Mode, reload the cached app and notebook, then turn connectivity back on. External engines and photographs may require an online connection.
4. For notebook and backup/restore, use throwaway QA entries, protect your real user data and export your existing backup before importing anything.
5. Take genuine screenshots or screen recordings that support your conclusions. Avoid sharing personal Apple IDs, device serial numbers or private workspace information.
6. Download a Markdown report and add it, together with actual media, to [issue #21](https://github.com/jimedusot-beep/project-mcgruber/issues/21). A human reviews the report and reproduction steps before closing the issue.

## Truth boundaries

- Browser CI running Chromium and iPhone-sized WebKit emulation verifies the **worksheet's behavior** but is not a physical iPhone Safari test.
- The optional browser snapshot (user agent, viewport, pixel ratio, WebGL2 context, online flag and reduced motion) is software diagnostic data; it cannot establish a specific iPhone model, real GPU performance, or whether the 13-part assembly actually rendered.
- The report is always labeled OWNER_ENTERED_UNVERIFIED, including when all tests are marked pass. "Ready for human review" means required fields and manual outcomes were entered, not that those outcomes were independently confirmed.
- Drafts save to localStorage in the same browser; no records are sent to GitHub or any server automatically. Safari storage may be cleared; export the report before clearing data.

The main [software acceptance matrix](LAB_ACCEPTANCE.md) remains authoritative about automated checks; physical Safari acceptance remains pending until real observations are supplied.
