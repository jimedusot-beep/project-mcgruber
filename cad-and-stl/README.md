# CAD and STL staging

**New digital-only starter asset:** [parametric L-support](prototype-angle-support.scad), [ASCII STL](prototype-angle-support.stl), and [SVG illustration](prototype-angle-support.svg).

This is a *generic 40 × 25 × 20 mm L-profile support* with 3 mm wall thickness. It has no fastener holes because no actual sensor/switch dimensions have been measured. Use for geometric learning, not as a validated fit for any device. Digital mesh checks do not constitute physical print, load/strength or accuracy validation.

- Units: **millimeters**
- Intended printing: broad 40 × 20 mm foot on build plate; 25 mm total upright
- Material/nozzle/layer parameters: **not specified** until a printer is chosen
- Fit tests, mechanical strength, tolerances: **not performed**
- License: original hardware design under [CERN-OHL-P-2.0](../LICENSE-HARDWARE)

Before treating an STL as production-ready, measure actual components, update parametric CAD, regenerate STL, run mesh checks and test fit and load on a real print.


## Proposed salvage switch gauge

[Three-clearance, parameterized switch-body fit coupon](switch-fit-gauge.scad) and [OpenSCAD-generated sample STL](switch-fit-gauge.stl) — **60-triangle, watertight digital preview**, 60.6 × 11.2 × 5 mm with unmeasured placeholder switch dimensions. It is intended for adjusting clearance on a **known measured** donor switch and does not contain circuit holes or a finished case. See [the first switch build track](../docs/FIRST_SWITCH_BUILD_TRACK.md). The initial numbers are placeholders, not a physical fit claim. In McGruber's **3D Workshop**, use **Add switch-fit gauge STL** to inspect or export this initial mesh. Changing source parameters requires regenerating the STL before relying on a new preview. No print, real fit or physical strength was tested.
