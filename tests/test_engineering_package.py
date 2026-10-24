"""Static engineering-package checks; not physical validation."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
PHONE=ROOT/"web/public/beam-detector"

class EngineeringPackageTest(unittest.TestCase):
    def test_full_nine_project_audit(self):
        text=(ROOT/"docs/ENGINEERING_MASTER_PLAN_2026-10-24.md").read_text(encoding="utf-8")
        for i in range(1,10):
            self.assertIn(f"{i:02d}",text)
        for phrase in ("2N4401","2N4403","hysteresis","NOT", "Fluke","9V","30/30","15-minute","IR"):
            self.assertIn(phrase,text)
        self.assertIn("0.6–0.8 V",text)
        self.assertIn("cannot",text.lower())
    def test_ui_links_and_content(self):
        for name in ("index.html","engineering-hub.html","standalone-lab.html","build-guide.html","app.mjs","beam-core.mjs","test-panel.mjs"):
            self.assertTrue((PHONE/name).is_file(),name)
        index=(PHONE/"index.html").read_text(encoding="utf-8")
        self.assertIn("./engineering-hub.html",index)
        self.assertIn("ARM AUTOMATIC DETECTION",index)
        lab=(PHONE/"standalone-lab.html").read_text(encoding="utf-8")
        self.assertIn("./engineering-hub.html",lab)
        self.assertIn("9-stage hands-on roadmap",lab)
        hub=(PHONE/"engineering-hub.html").read_text(encoding="utf-8")
        for key in ("Visible Light Tripwire","Object-Removal Alarm","Invisible Infrared Tripwire","Moving / Talking Robot"):
            self.assertIn(key,hub)
        self.assertIn("cannot",hub.lower())
    def test_main_navigation_and_circuit_reminders(self):
        main=(ROOT/"web/src/main.js").read_text(encoding="utf-8")
        self.assertIn("Engineering handbook",main)
        self.assertIn("engineering-hub.html",main)
        for p in ("docs/PROJECT_STATUS.md","docs/SAFETY.md","component-bank/MASTER_INVENTORY.md"):
            self.assertTrue((ROOT/p).is_file())
    def test_false_certification_prevention(self):
        status=(ROOT/"docs/PROJECT_STATUS.md").read_text(encoding="utf-8")
        self.assertIn("No standalone no-phone tripwire is verified",status)
        self.assertIn("OWNER-REPORTED",status)

if __name__=="__main__": unittest.main()
