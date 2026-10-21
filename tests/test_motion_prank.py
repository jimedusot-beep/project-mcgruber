from pathlib import Path
import runpy
import unittest

ROOT = Path(__file__).resolve().parents[1]
MotionGate = runpy.run_path(str(ROOT / "projects/02-motion-prank/motion_prank.py"))["MotionGate"]

class MotionGateTests(unittest.TestCase):
    def test_debounce(self):
        gate=MotionGate(threshold=.2,min_frames=3,cooldown_seconds=5)
        self.assertFalse(gate.observe(.3,0))
        self.assertFalse(gate.observe(.3,1))
        self.assertTrue(gate.observe(.3,2))
        self.assertFalse(gate.observe(.1,3))
    def test_cooldown(self):
        gate=MotionGate(threshold=.2,min_frames=2,cooldown_seconds=5)
        self.assertFalse(gate.observe(.3,0))
        self.assertTrue(gate.observe(.3,1))
        self.assertFalse(gate.observe(.3,2))
        self.assertFalse(gate.observe(.3,3))
        self.assertTrue(gate.observe(.3,6))
    def test_reset_and_invalid(self):
        gate=MotionGate(threshold=.2,min_frames=2)
        self.assertFalse(gate.observe(.3,0))
        self.assertFalse(gate.observe(.0,1))
        self.assertFalse(gate.observe(.3,2))
        self.assertTrue(gate.observe(.3,3))
        with self.assertRaises(ValueError):
            gate.observe(2.0,4)
        for kw in ({"threshold":0},{"threshold":1.1},{"min_frames":0},{"cooldown_seconds":-1}):
            with self.assertRaises(ValueError): MotionGate(**kw)

if __name__ == "__main__": unittest.main()
