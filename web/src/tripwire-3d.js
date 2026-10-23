import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { download } from "./storage.js";
import { escape } from "./ui.js";
import { TRIPWIRE_ASSEMBLY, TRIPWIRE_PARTS, getPart, explosionPosition, beamStatus } from "./tripwire-kit.js";

// Original illustration-only geometry: not a physical or licensed robot-parts import.
function partGeometry(part) {
  const root = new THREE.Group();
  root.name = part.id + " " + part.name;
  root.userData.partId = part.id;
  root.position.fromArray(part.pos);
  const colors = { emitter: 0xf07866, receiver: 0x66c8db, control: 0x74cca2 };
  const put = (geometry, color = colors[part.side], xyz = [0, 0, 0], options = {}) => {
    const o = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color, metalness: .1, roughness: .55, transparent: options.opacity < 1,
      opacity: options.opacity ?? 1, side: options.open ? THREE.DoubleSide : THREE.FrontSide,
    }));
    o.position.set(...xyz);
    o.userData.partId = part.id;
    root.add(o);
    return o;
  };
  const box = (w, h, d, color, at = [0, 0, 0], o = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const tube = (r, length, color, at = [0, 0, 0], open = false) => {
    const obj = put(new THREE.CylinderGeometry(r, r, length, 24, 1, open), color, at, { open });
    obj.rotation.z = Math.PI / 2;
    return obj;
  };
  const metal = 0xa9b8c9, dark = 0x293b4f;
  switch (part.type) {
    case "mount":
      box(65, 5, 57, dark);
      put(new THREE.CylinderGeometry(4, 5, 33, 12), metal, [0, 19, 0]);
      box(36, 5, 32, 0x53687c, [0, 37, 0]);
      break;
    case "housing":
      tube(19, 65, dark);
      tube(21, 5, metal, [33, 0, 0]);
      box(67, 35, 35, metal, [0, 0, 0], { opacity: .18 });
      break;
    case "battery":
      box(53, 18, 32, dark);
      for (const z of [-8, 8]) {
        tube(6, 44, 0x8dc5eb, [0, 2, z]);
        tube(6, 2, metal, [23, 2, z]);
      }
      break;
    case "switch":
      box(22, 11, 17, dark);
      box(11, 6, 12, 0xf4b47d, [3, 7, 0]);
      break;
    case "resistor":
      tube(1.2, 45, metal);
      tube(4, 22, 0xe8c68e);
      for (const x of [-6, -2, 4, 7]) tube(4.2, 1.2, x < 0 ? 0xb85b4c : 0x6a58a0, [x, 0, 0]);
      break;
    case "led":
      tube(4, 13, metal, [-9, 0, 0]);
      tube(6, 6, 0xf6dfc7, [-2, 0, 0]);
      put(new THREE.SphereGeometry(8, 20, 14), 0xffbd75, [5, 0, 0], { opacity: .85 });
      break;
    case "tube":
      tube(14, 39, dark, [0, 0, 0], true);
      for (const x of [-20, 20]) {
        const ring = put(new THREE.TorusGeometry(14, 1.5, 8, 28), metal, [x, 0, 0]);
        ring.rotation.y = Math.PI / 2;
      }
      break;
    case "ldr":
      tube(11, 5, 0xc47c46);
      tube(9, 6, 0xeeb67c, [-3, 0, 0]);
      for (let i = 0; i < 5; i++) box(1, 14, 1, 0x6e3b27, [-6, 0, -7 + i * 3.5]);
      break;
    case "divider":
      box(40, 3, 27, 0x3d936f);
      for (let i = 0; i < 5; i++) {
        box(4, 2, 3, metal, [-14 + i * 7, 3, -9]);
        box(5, 3, 6, i % 2 ? 0xb58a59 : dark, [-14 + i * 7, 4, 5]);
      }
      break;
    case "receiver":
      box(55, 50, 51, metal, [0, 0, 0], { opacity: .22 });
      box(55, 3, 51, dark, [0, -26, 0]);
      box(55, 3, 51, dark, [0, 26, 0]);
      break;
    case "controller":
      box(59, 3, 36, 0x236b56);
      box(28, 4, 25, metal, [0, 3, 0]);
      box(20, 2, 17, dark, [0, 6, 0]);
      box(12, 5, 14, metal, [31, 0, 0]);
      for (const z of [-15, 15])
        for (let i = -4; i <= 4; i++) box(2, 2, 2, 0xe0bd69, [i * 6, 3, z]);
      break;
    case "power":
      box(54, 20, 29, dark);
      box(22, 1, 5, metal, [-8, 11, 0]);
      box(9, 5, 13, metal, [-27, 0, 0]);
      break;
    default: throw new Error("Unknown concept geometry " + part.type);
  }
  return root;
}
function cable(scene, points, color) {
  const geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 18, 1.1, 6, false);
  const material = new THREE.MeshStandardMaterial({ color });
  const object = new THREE.Mesh(geometry, material);
  scene.add(object);
  return object;
}
export async function mountTripwire3D(host, notify = () => {}) {
  host.innerHTML = [
    "<div class='tw3d-intro'><a class='back-link' href='#/project/P01'>← Back to tripwire</a>",
    "<div class='eyebrow'>PROJECT McGRUBER · 3D CONCEPT WORKSHOP</div>",
    "<h1>Take the tripwire apart—in 3D.</h1>",
    "<p>Rotate, zoom, explode, hide and select individual pieces. Geometry is illustrative, not measured CAD or a tested circuit.</p></div>",
    "<div class='tw3d-layout'><section class='panel tw3d-canvas-panel'>",
    "<div class='tw3d-caption'><strong>UNTESTED CONCEPT MODEL</strong><span id='tw-scene-note'>Assembled</span></div>",
    "<div id='tw-viewport' role='application' tabindex='0' aria-label='3D tripwire. Drag to orbit, pinch to zoom. Part list offers keyboard controls.'></div>",
    "<label class='tw-range'>Explode assembly <output id='tw-amount'>0%</output>",
    "<input id='tw-explode' type='range' min='0' max='100' value='0' step='1'></label>",
    "<div class='row wrap'><button id='tw-assemble'>Assemble</button><button id='tw-explode-all'>Explode fully</button><button id='tw-reset-camera'>Reset view</button></div>",
    "<div class='row wrap'><label><input id='tw-show-beam' type='checkbox' checked> Show beam</label>",
    "<button id='tw-trigger' aria-pressed='false'>Simulate crossing beam</button></div>",
    "<p id='tw-beam-status' class='tw-beam-status' role='status'>SIMULATION: beam detected</p></section>",
    "<aside class='panel tw3d-components'><h2>Component inspection</h2>",
    "<p class='small muted'>Select a part to highlight it. Untick a part to hide it.</p>",
    "<div id='tw-partlist' class='tw3d-partlist'></div>",
    "<div id='tw-detail' class='tw3d-detail' aria-live='polite'></div>",
    "<div class='row wrap'><button id='tw-show-all'>Show all</button><button id='tw-isolate'>Isolate selected</button></div></aside></div>",
    "<section class='panel tw3d-next'><h2>Continue in 3D Vision</h2>",
    "<p>Export visible placeholders as GLB, then import that file into the existing 3D Vision workshop for more detailed inspection. Do not assume robot parts from H.E.R.B.I.E. fit this device.</p>",
    "<div class='row wrap'><button id='tw-export'>Export visible GLB</button>",
    "<a class='button' href='https://jimedusot-beep.github.io/3D-vision/' target='_blank' rel='noopener'>Open 3D Vision ↗</a>",
    "<a class='button' href='#/docs/projects/01-light-beam-tripwire/BUILD_WORKBOOK.md'>Assembly workbook</a></div>",
    "<p class='small muted'>No physical dimensions, clearances, pinouts, prototype tests or real sensor connections are claimed. Model data stays local until you choose to export.</p></section>",
  ].join("");
  const $ = (selector) => host.querySelector(selector);
  const viewport = $("#tw-viewport");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    viewport.innerHTML = "<p>WebGL unavailable. The part information and the static exploded drawing are still available.</p><a href='./repository/projects/01-light-beam-tripwire/diagrams/exploded-assembly.svg'>View exploded drawing</a>";
    for (const selector of ["#tw-explode", "#tw-assemble", "#tw-explode-all", "#tw-reset-camera", "#tw-isolate", "#tw-export"])
      $(selector).disabled = true;
    $("#tw-partlist").innerHTML = TRIPWIRE_PARTS.map((p) =>
      "<div class='tw3d-fallback-item'><strong>" + escape(p.name) + "</strong>: " + escape(p.explain) + "</div>").join("");
    return () => {};
  }
  let disposed = false, explosion = 0, blocked = false, selected = null, showBeam = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setClearColor(0x14253b);
  viewport.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 3000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x456078, 2.7));
  const lamp = new THREE.DirectionalLight(0xffffff, 3);
  lamp.position.set(-120, 260, 150);
  scene.add(lamp);
  const grid = new THREE.GridHelper(600, 30, 0x48687f, 0x253b51);
  grid.position.y = -1;
  scene.add(grid);
  const entries = TRIPWIRE_PARTS.map((part) => {
    const root = partGeometry(part);
    scene.add(root);
    return { part, root };
  });
  const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xffd965, transparent: true, opacity: .75, depthWrite: false });
  const beams = [];
  function beam(x1, x2) {
    const obj = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, x2 - x1, 10), beamMaterial);
    obj.rotation.z = Math.PI / 2;
    obj.position.set((x1 + x2) / 2, 43, 0);
    scene.add(obj);
    beams.push(obj);
  }
  beam(-105, 111);
  beam(-105, -14);
  beam(14, 111);
  const blocker = new THREE.Mesh(new THREE.BoxGeometry(20, 90, 22),
    new THREE.MeshStandardMaterial({ color: 0xed6c79, transparent: true, opacity: .5, depthWrite: false }));
  blocker.position.set(0, 43, 0);
  scene.add(blocker);
  const cables = [
    cable(scene, [[168, 18, 66], [174, 28, 58], [177, 39, 37], [154, 39, 25]], 0x7bb3ec),
    cable(scene, [[178, 15, 74], [189, 13, 74]], 0x8c9cb4),
  ];
  const render = () => { if (!disposed && !document.hidden) renderer.render(scene, camera); };
  function resetCamera() {
    camera.position.set(360, 260, 640);
    controls.target.set(0, 35, 20);
    camera.lookAt(controls.target);
    controls.update();
    render();
  }
  controls.addEventListener("change", render);
  function updateBeam() {
    const visible = showBeam && explosion === 0;
    beams[0].visible = visible && !blocked;
    beams[1].visible = beams[2].visible = visible && blocked;
    blocker.visible = visible && blocked;
    cables.forEach((c) => (c.visible = explosion === 0));
    const result = beamStatus({ blocked });
    $("#tw-beam-status").textContent = "SIMULATION: " + result.label +
      (explosion > 0 ? " · beam hidden while exploded" : "");
    $("#tw-beam-status").classList.toggle("tripped", result.alarm);
    $("#tw-trigger").textContent = blocked ? "Restore simulated beam" : "Simulate crossing beam";
    $("#tw-trigger").setAttribute("aria-pressed", String(blocked));
    render();
  }
  function applyExplosion(value) {
    explosion = Number(value) / 100;
    entries.forEach(({ part, root }) => root.position.fromArray(explosionPosition(part, explosion)));
    $("#tw-amount").textContent = value + "%";
    $("#tw-scene-note").textContent = explosion > 0 ? "Exploded · connections hidden" : "Assembled";
    updateBeam();
  }
  function selectPart(id) {
    selected = getPart(id);
    for (const { part, root } of entries) root.traverse((obj) => {
      if (obj.isMesh && obj.material.emissive)
        obj.material.emissive.setHex(part.id === id ? 0x252814 : 0x000000);
    });
    $("#tw-partlist").querySelectorAll("[data-part]").forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.part === id)));
    $("#tw-detail").innerHTML = selected
      ? "<div class='eyebrow'>" + escape(selected.id) + "</div><h3>" + escape(selected.name) +
        "</h3><p>" + escape(selected.explain) + "</p><p><strong>Salvage:</strong> " +
        escape(selected.salvage) + "</p><p><strong>Verify:</strong> " + escape(selected.verify) +
        "</p><p class='small muted'>Part requirement: " +
        (selected.required === true ? "required" : selected.required === false ? "optional" : "conditional") +
        " · physical fit unverified</p>"
      : "<h3>Choose a part</h3>";
    render();
  }
  $("#tw-partlist").innerHTML = TRIPWIRE_PARTS.map((p) =>
    "<div class='tw3d-part'><button type='button' data-part='" + p.id +
    "' aria-pressed='false'><span class='tw3d-part-name'>" + escape(p.name) +
    "</span><span class='tw3d-part-id'>" + escape(p.id) +
    "</span></button><label><input type='checkbox' data-visible='" + p.id +
    "' checked aria-label='Show " + escape(p.name) + "'></label></div>").join("");
  $("#tw-partlist").addEventListener("click", (e) => {
    const button = e.target.closest("[data-part]");
    if (button) selectPart(button.dataset.part);
  });
  $("#tw-partlist").addEventListener("change", (e) => {
    const check = e.target.closest("[data-visible]");
    if (!check) return;
    const entry = entries.find((x) => x.part.id === check.dataset.visible);
    if (entry) entry.root.visible = check.checked;
    render();
  });
  function showAll() {
    entries.forEach((e) => (e.root.visible = true));
    $("#tw-partlist").querySelectorAll("[data-visible]").forEach((input) => (input.checked = true));
    render();
  }
  $("#tw-show-all").onclick = showAll;
  $("#tw-isolate").onclick = () => {
    if (!selected) { notify("Select a part first."); return; }
    entries.forEach((e) => (e.root.visible = e.part.id === selected.id));
    $("#tw-partlist").querySelectorAll("[data-visible]").forEach((input) => (input.checked = input.dataset.visible === selected.id));
    render();
  };
  $("#tw-explode").oninput = (e) => applyExplosion(e.target.value);
  $("#tw-explode-all").onclick = () => { $("#tw-explode").value = 100; applyExplosion(100); };
  $("#tw-assemble").onclick = () => { $("#tw-explode").value = 0; applyExplosion(0); };
  $("#tw-reset-camera").onclick = resetCamera;
  $("#tw-show-beam").onchange = (e) => { showBeam = e.target.checked; updateBeam(); };
  $("#tw-trigger").onclick = () => { blocked = !blocked; updateBeam(); };
  $("#tw-export").onclick = async () => {
    const button = $("#tw-export");
    button.disabled = true;
    try {
      const group = new THREE.Group();
      entries.filter((e) => e.root.visible).forEach((e) => group.add(e.root.clone(true)));
      if (!group.children.length) throw new Error("Show at least one part first.");
      group.scale.setScalar(.001); // illustrative millimeters converted to standard GLB metres
      group.updateMatrixWorld(true);
      const data = await new GLTFExporter().parseAsync(group, { binary: true });
      if (disposed) return;
      download(new Blob([data], { type: "model/gltf-binary" }), "mcgruber-tripwire-concept.glb");
      notify("Concept GLB exported. Import into 3D Vision manually.");
    } catch (error) { if (!disposed) notify("Could not export GLB: " + error.message); }
    finally { if (!disposed) button.disabled = false; }
  };
  const raycaster = new THREE.Raycaster();
  let start;
  const down = (e) => { start = [e.clientX, e.clientY]; };
  const up = (e) => {
    if (!start || Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 8) return;
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    raycaster.setFromCamera(new THREE.Vector2(
      2 * (e.clientX - rect.left) / rect.width - 1,
      1 - 2 * (e.clientY - rect.top) / rect.height), camera);
    const hit = raycaster.intersectObjects(entries.filter((e) => e.root.visible).map((e) => e.root), true)[0];
    if (hit?.object.userData.partId) selectPart(hit.object.userData.partId);
  };
  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointerup", up);
  const observer = new ResizeObserver(() => {
    const width = Math.max(1, viewport.clientWidth), height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  });
  observer.observe(viewport);
  const visibility = () => { if (!document.hidden) render(); };
  document.addEventListener("visibilitychange", visibility);
  resetCamera();
  selectPart("TW-R-LDR");
  updateBeam();
  return () => {
    disposed = true;
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    controls.removeEventListener("change", render);
    controls.dispose();
    renderer.domElement.removeEventListener("pointerdown", down);
    renderer.domElement.removeEventListener("pointerup", up);
    entries.forEach(({ root }) => root.traverse((obj) => {
      if (obj.isMesh) { obj.geometry.dispose(); obj.material.dispose(); }
    }));
    beams.forEach((mesh) => mesh.geometry.dispose());
    beamMaterial.dispose();
    blocker.geometry.dispose();
    blocker.material.dispose();
    cables.forEach((mesh) => { mesh.geometry.dispose(); mesh.material.dispose(); });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
