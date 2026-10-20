from pathlib import Path
import csv
import unittest

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = [
    "01-light-beam-tripwire", "02-motion-prank",
    "03-pop-up-surprise-box", "04-object-removal-alarm",
    "05-wireless-clicker", "06-mouse-powered-gadgets",
    "07-standalone-control-box", "08-infrared-tripwire",
    "09-talking-prank-robot",
]

class CoverageTest(unittest.TestCase):
    def test_nine_project_folders(self):
        self.assertEqual(sorted(p.name for p in (ROOT / "projects").iterdir() if p.is_dir()), EXPECTED)
        for folder in EXPECTED:
            self.assertTrue((ROOT / "projects" / folder / "README.md").is_file())
    def test_sixteen_requirements(self):
        with (ROOT / "component-bank/components.csv").open(newline="") as f:
            rows = list(csv.DictReader(f))
        self.assertEqual(len(rows), 16)
        self.assertEqual(set(r["category"] for r in rows), {"Detection", "Control", "Outputs", "Power and Construction"})
    def test_equipment_is_separate(self):
        with (ROOT / "component-bank/inventory.csv").open(newline="") as f:
            rows = list(csv.DictReader(f))
        self.assertEqual(len(rows), 12)
    def test_reports_present(self):
        for doc in ["EXISTING_EQUIPMENT.md", "ACCOMPLISHMENTS.md", "SYSTEM_ARCHITECTURE.md", "ROADMAP.md", "PROJECT_STATUS.md"]:
            self.assertTrue((ROOT / "docs" / doc).is_file(), doc)
if __name__ == "__main__":
    unittest.main()
