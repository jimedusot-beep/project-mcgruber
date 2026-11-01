"""Digital-only regression for the generated, example-dimension OpenSCAD fit gauge."""
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class SwitchGaugeSTLTest(unittest.TestCase):
    def test_original_generated_ascii_stl_has_expected_sample_bounds_and_three_pockets(self):
        stl=(ROOT/"cad-and-stl"/"switch-fit-gauge.stl").read_text()
        self.assertIn("solid McGruber_switch_fit_gauge",stl)
        self.assertEqual(stl.count("facet normal"),60)
        verts=[]
        for line in stl.splitlines():
            if line.strip().startswith("vertex "):
                verts.append(tuple(map(float,line.strip().split()[1:])))
        self.assertEqual(len(verts),180)
        self.assertEqual(tuple(round(max(v[i] for v in verts)-min(v[i] for v in verts),2) for i in range(3)),(60.6,11.2,5.0))
        # Distinct bottom surfaces of the pockets at z=2; not three solid cubes.
        for left,right in ((2.4,15.8),(23.4,37.2),(44.4,58.6)):
            self.assertTrue(any(a[0]==left and a[2]==2 for a in verts))
            self.assertTrue(any(a[0]==right and a[2]==2 for a in verts))
if __name__=="__main__":unittest.main()
