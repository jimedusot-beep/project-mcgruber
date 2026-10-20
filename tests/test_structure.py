from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class TestStructure(unittest.TestCase):
    def test_projects_present(self):
        project_dir = ROOT / "projects"
        self.assertEqual(len(list(project_dir.glob("*/README.md"))), 9)
    def test_component_bank(self):
        self.assertTrue((ROOT / "component-bank/components.csv").is_file())
    def test_safety(self):
        self.assertTrue((ROOT / "docs/SAFETY.md").is_file())

if __name__ == "__main__":
    unittest.main()
