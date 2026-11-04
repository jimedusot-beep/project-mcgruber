// SPDX-License-Identifier: CERN-OHL-P-2.0
// McGruber M3D-002 - open electronics tray (DIGITAL CONCEPT ONLY)
// All dimensions are example values in millimeters, NOT measured hardware.
// Use only for low-voltage, supervised prototype storage; not a rated case.
inner_length = 65;
inner_width = 36;
inner_height = 12;
clearance_per_side = 0.5;
wall = 2.4;
floor_thickness = 2.4;
cable_notch_width = 10;
cable_notch_depth = 5;

assert(inner_length >= 10 && inner_width >= 10 && inner_height >= 5);
assert(clearance_per_side >= 0 && clearance_per_side <= 2);
assert(wall >= 1.6 && floor_thickness >= 1.6);
assert(cable_notch_width > 0 && cable_notch_width < inner_width);
assert(cable_notch_depth > 0 && cable_notch_depth < inner_height);

outer_length = inner_length + 2 * (wall + clearance_per_side);
outer_width = inner_width + 2 * (wall + clearance_per_side);
outer_height = floor_thickness + inner_height;

difference() {
    cube([outer_length, outer_width, outer_height]);
    // The inside is open at the top; this is NOT a weatherproof enclosure.
    translate([wall, wall, floor_thickness])
        cube([inner_length + 2 * clearance_per_side,
              inner_width + 2 * clearance_per_side,
              inner_height + 0.2]);
    // Shallow cable route in the front wall, not a connector-specific cutout.
    translate([-0.1, (outer_width - cable_notch_width) / 2,
               outer_height - cable_notch_depth])
        cube([wall + 0.2, cable_notch_width, cable_notch_depth + 0.2]);
}
