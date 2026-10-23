// McGruber light-beam tripwire — conceptual space reservation only.
// Units: mm. Placeholder dimensions are illustrative, NOT measured or print-ready.
// Set explode = 0 for assembled, 1 for exploded; show_* toggles components.
$fn=36;
explode=1; // [0:0.05:1]
show_emitter=true;
show_receiver=true;
show_controller=true;
show_power=true;
beam_span=240; // [120:10:500] illustrative emitter-to-receiver distance
module box(x,y,z,c=[0.6,0.7,0.8]) {color(c) cube([x,y,z],center=true);}
module emitter() {
  // Placeholder 90x30x30 mm torch body, removable front LED and battery volume
  translate([-beam_span/2,0,17]) rotate([0,90,0]) color([0.2,0.27,0.31]) cylinder(h=72,d=30,center=true);
  translate([-beam_span/2+43+explode*35,0,17]) rotate([0,90,0]) color([1,0.65,0.45]) cylinder(h=7,d=11,center=true);
  translate([-beam_span/2-5-explode*24,0,17]) box(38,17,15,[0.32,0.48,0.67]);
  translate([-beam_span/2,0,3]) box(66,40,6,[0.36,0.4,0.45]);
}
module receiver() {
  translate([beam_span/2,0,3]) box(58,45,6,[0.36,0.4,0.45]);
  translate([beam_span/2+10,0,28]) box(46,38,42,[0.3,0.39,0.48]);
  translate([beam_span/2-23-explode*27,0,28]) rotate([0,90,0]) color([0.12,0.17,0.21]) difference() {
    cylinder(h=28,d=24,center=true);
    cylinder(h=30,d=16,center=true);
  }
  translate([beam_span/2-5-explode*14,0,28]) rotate([0,90,0]) color([0.82,0.51,0.25]) cylinder(h=4,d=9,center=true);
}
module controller() {
  translate([beam_span/2+14,0,-30-explode*40]) {
    box(30,23,2,[0.05,0.35,0.34]);
    translate([0,0,3]) box(17,16,5,[0.65,0.69,0.71]);
    translate([15,0,2]) box(7,10,5,[0.65,0.69,0.71]);
  }
}
module power() {
  translate([beam_span/2+14,0,-65-explode*60]) box(70,35,15,[0.22,0.26,0.31]);
}
if(show_emitter) emitter();
if(show_receiver) receiver();
if(show_controller) controller();
if(show_power) power();
// Optical path is a visualization, not a physical solid or laser recommendation.
color([1,0.7,0.18,0.35]) translate([0,0,28]) rotate([0,90,0]) cylinder(h=beam_span-80,d=1,center=true);
