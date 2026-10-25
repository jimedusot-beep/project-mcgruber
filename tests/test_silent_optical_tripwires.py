"""Evidence and safety guards for P01 Experiment B and P08 Experiment C.

Only validates authored source/blank measurements, never physical performance.
"""
import csv
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / "projects"
B = BASE / "01-light-beam-tripwire"
C = BASE / "08-infrared-tripwire"


class SilentOpticalTripwireTests(unittest.TestCase):
    def test_experiment_b_real_references_and_missing_amplifier_gate(self):
        doc = (B / "EXPERIMENT_B_LED_AS_SENSOR.md").read_text(encoding="utf-8")
        self.assertIn("analog.com", doc)
        self.assertIn("codrey.com", doc)
        self.assertIn("UNPOWERED", doc)
        self.assertIn("2N4401", doc)
        self.assertIn("THRESHOLD", doc)
        self.assertIn("CRITICAL OPEN GAP", doc)
        self.assertIn("NOT COMPLETED", doc)
        self.assertIn("DO NOT infer", doc)

    def test_experiment_c_is_sensor_specific_and_no_computer_required(self):
        doc = (C / "EXPERIMENT_C_SILENT_IR.md").read_text(encoding="utf-8")
        for marker in (
            "Adafruit 2168", "Adafruit 2167", "SEN0523", "TSSP4038",
            "10 kΩ", "1 kΩ", "LOW", "HIGH", "OUT", "4 m", "15 ft",
            "No sound", "NOT ACQUIRED/TESTED", "manufacturer",
        ):
            self.assertIn(marker, doc, marker)
        self.assertIn("do not wire a warning LED yet", doc)
        self.assertIn("C3 remains research-only", doc)
        self.assertIn("No sound, buzzer, laser or phone application", doc)

    def test_unfilled_test_sheets_are_never_prepassed(self):
        for project, name in [
            (B, "EXPERIMENT_B_MEASUREMENTS.csv"),
            (C, "EXPERIMENT_C_MEASUREMENTS.csv"),
        ]:
            with (project / name).open(encoding="utf-8", newline="") as source:
                rows = list(csv.DictReader(source))
            self.assertEqual(len(rows), 10, name)
            self.assertEqual([r["trial"] for r in rows], [str(i) for i in range(1, 11)])
            for row in rows:
                self.assertEqual(row["result"], "NOT_RUN", (name, row))
                for k, v in row.items():
                    self.assertIsNotNone(v, (name, row, k))
                    if k not in ("trial", "result"):
                        self.assertEqual(v, "", (name, k, v))

    def test_silent_adfruit_wiring_svg_is_static_and_5v_specific(self):
        path = C / "diagrams/experiment-c-silent-adafruit-5v.svg"
        content = path.read_text(encoding="utf-8")
        root = ET.fromstring(content)
        self.assertEqual(root.tag, "{http://www.w3.org/2000/svg}svg")
        for required in ("Adafruit", "10 kΩ", "1 kΩ", "+5 V", "OUT LOW", "warning ON"):
            self.assertIn(required, content, required)
        self.assertNotIn("<script", content.lower())
        self.assertNotIn("javascript:", content.lower())
        self.assertNotRegex(content.lower(), r"\bonclick\s*=")
        self.assertNotIn("9 V", content)


if __name__ == "__main__":
    unittest.main()
