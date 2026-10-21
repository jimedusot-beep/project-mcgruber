from collections import Counter
import csv
from pathlib import Path
import re
import unittest
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ["01-light-beam-tripwire","02-motion-prank","03-pop-up-surprise-box",
            "04-object-removal-alarm","05-wireless-clicker","06-mouse-powered-gadgets",
            "07-standalone-control-box","08-infrared-tripwire","09-talking-prank-robot"]

def read_csv(path):
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))

class AssetsTests(unittest.TestCase):
    def test_nine_build_packages(self):
        self.assertEqual(sorted(x.name for x in (ROOT/"projects").iterdir() if x.is_dir()), PROJECTS)
        for name in PROJECTS:
            folder=ROOT/"projects"/name
            for item in ("README.md","BUILD.md","BOM.csv","CIRCUIT.md","TEST_LOG.csv","diagrams/architecture.svg"):
                self.assertTrue((folder/item).is_file(), str(folder/item))
            self.assertGreaterEqual(len(read_csv(folder/"BOM.csv")),4)
            test_log=read_csv(folder/"TEST_LOG.csv")
            self.assertEqual(test_log[0]["value"],"NOT_RUN")
            ElementTree.parse(folder/"diagrams/architecture.svg")
    def test_compatibility_and_inventory(self):
        matrix=read_csv(ROOT/"component-bank/compatibility.csv")
        self.assertEqual(len(matrix),16)
        self.assertEqual(len(read_csv(ROOT/"component-bank/inventory-v2.csv")),12)
        for row in matrix:
            for i in range(1,10):
                self.assertIn(row[f"P{i:02d}"],("R","O","A","-"))
    def test_authentic_media(self):
        media=read_csv(ROOT/"media/manifest.csv")
        self.assertEqual(len(media),18)
        self.assertTrue(all(r["status"]=="NOT_PROVIDED" for r in media))
        ElementTree.parse(ROOT/"cad-and-stl/prototype-angle-support.svg")
    def test_cad_and_license(self):
        self.assertIn("CERN-OHL-P-2.0",(ROOT/"docs/LICENSE_GUIDE.md").read_text(encoding="utf-8"))
        self.assertGreater((ROOT/"LICENSE-HARDWARE").stat().st_size,1000)
        source=(ROOT/"cad-and-stl/prototype-angle-support.scad").read_text(encoding="utf-8")
        self.assertIn("linear_extrude",source)
        stl=(ROOT/"cad-and-stl/prototype-angle-support.stl").read_text(encoding="utf-8")
        faces=[]
        for line in stl.splitlines():
            if line.strip().startswith("vertex "):
                coords=tuple(float(v) for v in line.split()[1:])
                self.assertEqual(len(coords),3)
                faces.append(coords)
        self.assertEqual(len(faces)%3,0)
        self.assertGreater(len(faces),0)
        self.assertEqual([max(x[i] for x in faces)-min(x[i] for x in faces) for i in range(3)],[40,25,20])
        counts=Counter()
        for i in range(0,len(faces),3):
            a,b,c=faces[i:i+3]
            for x,y in ((a,b),(b,c),(c,a)):
                counts[tuple(sorted((x,y)))]+=1
        self.assertTrue(all(count==2 for count in counts.values()))

if __name__ == "__main__": unittest.main()
