// SPDX-License-Identifier: CERN-OHL-P-2.0
// McGruber generic untested angle support; units mm; no measured hardware fit.
base_length = 40; upright_height = 25; thickness = 3; width = 20;
assert(base_length > thickness && upright_height > thickness && thickness > 0);
linear_extrude(height = width)
    polygon(points = [[0,0],[base_length,0],[base_length,thickness],[thickness,thickness],[thickness,upright_height],[0,upright_height]]);
