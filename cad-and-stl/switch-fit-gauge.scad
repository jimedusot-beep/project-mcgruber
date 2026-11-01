// SPDX-License-Identifier: CERN-OHL-P-2.0
// McGruber three-clearance switch-body FIT GAUGE, not a finished device.
// UNMEASURED defaults: change to caliper measurements before printing.
// Does NOT include holes, screws, solder pads, wiring, or a button actuator.
switch_body_length = 13; // mm — placeholder
switch_body_width = 6;   // mm — placeholder
switch_body_height = 6;  // mm — placeholder (choose pocket depth below)
floor_thickness = 2;
wall_thickness = 2;
gap_between_pockets = 3;
clearances = [0.20, 0.40, 0.60]; // per-side clearance trials

assert(switch_body_length > 1 && switch_body_width > 1 && switch_body_height > 1);
assert(floor_thickness >= 1 && wall_thickness >= 1.2 && gap_between_pockets >= 1);
assert(len(clearances) == 3 && min(clearances) >= 0 && max(clearances) < wall_thickness);
max_clearance = max(clearances);
pitch = switch_body_length + 2 * (wall_thickness + max_clearance) + gap_between_pockets;
total_length = 3 * pitch - gap_between_pockets;
total_width = switch_body_width + 2 * (wall_thickness + max_clearance);
pocket_depth = min(switch_body_height, 3); // shallow, open test pockets
total_height = floor_thickness + pocket_depth;

difference() {
  cube([total_length, total_width, total_height]);
  for (i = [0 : 2]) {
    c = clearances[i];
    translate([
      i * pitch + wall_thickness + max_clearance - c,
      wall_thickness + max_clearance - c,
      floor_thickness
    ])
      cube([
        switch_body_length + 2 * c,
        switch_body_width + 2 * c,
        pocket_depth + 0.1
      ]);
  }
}
