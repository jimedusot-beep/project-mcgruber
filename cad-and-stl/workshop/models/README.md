# First model — M3D-002 open electronics tray

- [Editable OpenSCAD source](open-electronics-tray.scad)
- [Generated sample STL](open-electronics-tray.stl)

**Digitally checked, unprinted.** Example outside size **70.8 × 41.8 × 14.4 mm**, 2.4 mm wall/floor and a shallow cable notch; all internal dimensions are placeholders, not an ESP32 or any other board fit specification.

The OpenSCAD default-parameter STL was rendered locally with OpenSCAD and checked using Trimesh on November 4, 2026: **44 triangles; watertight; approximately 13,192 mm³ mesh volume**. This is a basic geometric check, not a slicer result, print trial, water ingress test, heat test, or strength rating. The tray is **open-top** and has no mounting or battery retention hardware.

Change dimensions in the .scad source only after measuring a donor; regenerate the STL, recheck and label the new export. See [workshop test card](../PRINT_TEST_TEMPLATE.md).
