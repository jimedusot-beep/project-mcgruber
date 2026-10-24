# Phone tripwire V4 build and test plan

User-supplied roadmap is the scope and authorization: silent iPhone receiver, existing parts first, one-tap detection, measured range progression, physical transmitter and qualification instructions. Continue in existing static JavaScript app; no paid service or receiver board is needed.

1. Extract an independently testable detector with fixed arming reference, hysteresis and elapsed-time debounce. Test ten interruptions, noise, weak/unstable arming, long blockage, stale/invalid samples and restore.
2. Add an evidence-oriented qualification state machine and mobile controls: six distances, source/lighting metadata, ten operator-reported crossings, timed 2/5 minute no-trip test, configuration interruption invalidation, JSON export and local retention.
3. Add existing-parts BOM, voltage/resistance/current measurement instructions, accurate wiring SVG, mount/alignment steps, troubleshooting and blank evidence sheet. Distinguish conditional electrical examples from verified parts.
4. Exercise actual browser pixel processing with a synthetic camera source, restart and denial cases; run existing Node suite/build. Commit focused branches and open PRs in McGruber and its public 3D Vision mirror. Do not claim deployed or physical success without evidence.

Review focus: camera freezes, backgrounding, controls during an experiment, state leakage on re-arm and accidental qualification without ten physical crossings. Browser tests are synthetic; only the owner can validate actual crossing truth, distance and hardware.
