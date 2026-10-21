# Engineering integration assessment

Research checked against primary sources during implementation. This application remains independent of the other user repositories and has no paid service dependency.

| Tool | Implemented route | Limits / rationale |
| --- | --- | --- |
| CircuitJS / Falstad | Original ideal switch/load, divider and RC starters; `cct` URL launch, text export, optional user-loaded iframe | Actual electrical engine runs externally. Cross-origin parent JavaScript cannot read engine state. External engine requires internet and its touch UI is not optimized here. |
| KiCad / ngspice | Original standalone `.cir` netlist export for the three ideal examples; documentation link | KiCad is a desktop schematic/SPICE workflow. This app does not import arbitrary schematics or execute ngspice. Actual parts need valid device models. |
| Wokwi | Direct new Arduino Uno workspace and documented format reference | No account access, arbitrary project upload, automatic code/diagram import or embed is claimed. Wokwi documents digital simulation with limited analog support. |
| Three.js | Bundled lazy viewer, controls and original file-import pipeline | STL, OBJ, uncompressed GLB/glTF. OBJ materials and glTF animation are flattened/not preserved. Local companion resources only. No universal CAD support. |
| OpenSCAD | Original `.scad` source accessible in Source Library | Editing/rendering requires OpenSCAD separately. Browser app does not claim parametric editing. |
| GitHub | Real project files, original issues, branch/PR development and static Pages workflow | App saves are private local drafts. No GitHub secret or publishing token is embedded. |
| 3D Vision / H.E.R.B.I.E. | Compared accessible 3D Vision package and local MIT-licensed source patterns; compatible STL/GLB and documented scene assumptions | McGruber uses its own independent code and storage namespace. No shared private account state, tested physical fit, electrical compatibility or complete scene-JSON interchange is assumed. |

The original repository's conceptual SVGs are retained. The object-alarm and standalone-buzzer illustrations are conditional connection-order references, not fabricated pin-numbered schematics. Identifying real terminals, voltage/current limits and measured circuit revisions remains physical engineering work.

## Primary sources

- [CircuitJS source, GPL-2.0](https://github.com/pfalstad/circuitjs1) — the engine is linked/embedded, not redistributed into the MIT application.
- [CircuitJS JavaScript interface](https://www.falstad.com/circuit/doc/js-interface.html) and [same-origin integration notes](https://www.falstad.com/circuit/jsinterface.html).
- [Wokwi diagram format](https://docs.wokwi.com/diagram-format) and [analog limitations](https://docs.wokwi.com/chips-api/analog).
- [KiCad simulator manual](https://docs.kicad.org/9.0/en/eeschema/eeschema.html#simulator).
- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) and [TransformControls](https://threejs.org/docs/pages/TransformControls.html).
- [OpenSCAD documentation](https://openscad.org/documentation.html).
- [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
- [User 3D Vision source](https://github.com/jimedusot-beep/3D-vision), [H.E.R.B.I.E. software](https://github.com/jimedusot-beep/Herbie), and [hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware). Links do not establish implementation or physical compatibility.
