import { newId } from "./id.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import {
  parseModel,
  inspectGeometry,
  serializeParts,
  restoreParts,
  interferencePairs,
  MESH_LIMITS,
} from "./mesh.js";
import { download } from "./storage.js";
export async function mountViewer(host, saved, onSave, notify) {
  host.innerHTML = `<div class="viewer-toolbar"><label class="button primary">Import models<input id="model-files" type="file" accept=".stl,.obj,.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp" multiple hidden></label><button id="demo-model">Add starter STL</button><button id="duplicate-part">Duplicate part</button><label>Import units<select id="model-units"><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option><option value="in">inches</option></select></label><span class="muted small">glTF / GLB use meters → mm</span></div>
    <div class="viewer-layout"><div><div id="viewport" tabindex="0" role="application" aria-label="3D model viewer. Drag to rotate, two fingers to pan and pinch to zoom. Select a part to edit it numerically."><div class="viewport-label"><span class="live-dot"></span> REAL GEOMETRY · mm</div><div class="viewport-help">Drag to orbit · pinch to zoom · two fingers to pan</div></div><p id="mesh-status" role="status" class="small muted"></p></div>
    <aside class="panel part-panel"><h3>Scene hierarchy</h3><div id="part-list"></div><div id="part-transform"></div><div class="row wrap"><button id="hide-part">Hide / show selected</button><button id="isolate-part">Isolate</button><button id="show-parts">Show all</button><button id="remove-part" class="danger">Remove selected</button></div></aside></div>
    <div class="panel viewer-controls"><div class="row wrap"><label>View<select id="view-preset"><option value="iso">Isometric</option><option value="front">Front</option><option value="rear">Rear</option><option value="right">Right</option><option value="left">Left</option><option value="top">Top</option></select></label><button id="fit-model">Fit scene</button><button id="projection">Orthographic</button><label><input id="wireframe" type="checkbox"> Wireframe</label><label><input id="grid-toggle" type="checkbox" checked> Grid + axes</label><label><input id="snap" type="checkbox"> Snap 1 mm / 15°</label><label>Gizmo<select id="gizmo-mode"><option value="translate">Move</option><option value="rotate">Rotate</option><option value="scale">Scale</option><option value="off">Off</option></select></label></div>
    <div class="control-grid"><label>Explode distance (mm)<input id="explode" type="range" min="0" max="100" value="0"><output id="explode-value">0 mm</output></label><label>Opacity<input id="opacity" type="range" min="0.15" max="1" step="0.05" value="1"></label><label>Section cut X (mm)<input id="clipping" type="range" min="-100" max="100" value="100"><span><input id="clip-enable" type="checkbox"> Enable clipping</span></label></div>
    <div class="row wrap"><button id="align-parts">Align centers to selected</button><button id="interference">Check bounding-box overlaps</button><label><input id="measure-mode" type="checkbox"> Measure two surface points</label><output id="measurement">Select two points</output><label>Display units<select id="display-units"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inches</option></select></label></div>
    <div class="row wrap"><button id="save-scene">Save scene revision</button><button id="export-scene">Export editable scene JSON</button><label class="button">Restore scene JSON<input id="import-scene" type="file" accept=".json" hidden></label><button id="export-stl">Export visible STL</button><button id="export-glb">Export visible GLB</button><button id="screenshot">Screenshot PNG</button></div></div>
    <p class="notice">The generic starter is unprinted and fit-unverified. Arrangement and STL export concatenate meshes; they do not perform Boolean union. Edge checks and bounding-box overlaps do not certify manifoldness, fit, or printability. OBJ materials, glTF animation, compressed meshes and external network resources are not supported.</p>`;
  const $ = (s) => host.querySelector(s),
    viewport = $("#viewport"),
    status = $("#mesh-status");
  let disposed = false;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
  } catch {
    host.innerHTML =
      '<div class="panel"><h2>WebGL is unavailable in this browser</h2><p>Enable hardware graphics or use a current browser with WebGL 2. The source geometry remains available.</p><a class="button" href="./repository/cad-and-stl/prototype-angle-support.stl" download>Download original STL</a><a class="button" href="#/docs/cad-and-stl/README.md">Read CAD documentation</a></div>';
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x14201f);
  renderer.localClippingEnabled = true;
  viewport.append(renderer.domElement);
  const scene = new THREE.Scene(),
    group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xe5f5df, 0x34423e, 2.4));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(60, 100, 50);
  scene.add(light);
  const grid = new THREE.GridHelper(300, 30, 0x547462, 0x293e35),
    axes = new THREE.AxesHelper(35);
  grid.position.y = -0.1;
  scene.add(grid, axes);
  const perspective = new THREE.PerspectiveCamera(42, 1, 0.01, 100000),
    ortho = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.01, 100000);
  let camera = perspective;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  const gizmo = new TransformControls(camera, renderer.domElement);
  gizmo.setSize(0.7);
  scene.add(gizmo.getHelper());
  gizmo.addEventListener(
    "dragging-changed",
    (e) => (controls.enabled = !e.value),
  );
  let parts = [],
    selected = null,
    explode = 0,
    basePositions = new Map(),
    points = [],
    line = null,
    lastDistance = null,
    wire = false,
    opacity = 1,
    revisionTimer;
  const clippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 100);
  let clip = false;
  const getData = () => ({
    schema: 1,
    units: "mm",
    parts: serializeParts(parts).map((d) => ({
      ...d,
      position: (
        basePositions.get(d.id) || new THREE.Vector3(...d.position)
      ).toArray(),
    })),
  });
  const save = () => {
    try {
      onSave(getData());
    } catch (e) {
      notify(e.message);
    }
  };
  const autosave = () => {
    clearTimeout(revisionTimer);
    revisionTimer = setTimeout(save, 400);
  };
  const unitFactor = () =>
    ({ mm: 1, cm: 0.1, in: 1 / 25.4 })[$("#display-units").value];
  function updateDimensions() {
    const box = new THREE.Box3().setFromObject(group),
      size = box.getSize(new THREE.Vector3()).multiplyScalar(unitFactor()),
      unit = $("#display-units").value;
    const report = parts.map((p) => p.userData.report),
      triangles = report.reduce((n, r) => n + r.triangles, 0);
    status.textContent = `${parts.length} parts · ${triangles.toLocaleString()} triangles · scene bounds ${size
      .toArray()
      .map((n) => n.toFixed(2))
      .join(
        " × ",
      )} ${unit}. ${report.some((r) => r.boundary === null) ? "Edge check skipped above 50k triangles." : `${report.reduce((n, r) => n + r.boundary, 0)} boundary edges; ${report.reduce((n, r) => n + r.nonmanifold, 0)} edges with >2 incident faces.`} Not a printability certificate.`;
    if (lastDistance !== null)
      $("#measurement").textContent =
        (lastDistance * unitFactor()).toFixed(3) +
        " " +
        unit +
        " surface distance";
  }
  function appearance() {
    for (const p of parts) {
      p.material.wireframe = wire;
      p.material.opacity = opacity;
      p.material.transparent = opacity < 1;
      p.material.depthWrite = opacity === 1;
      p.material.clippingPlanes = clip ? [clippingPlane] : [];
      p.material.color.set(p === selected ? 0xd8ec97 : 0x8fc8ad);
      p.material.needsUpdate = true;
    }
  }
  function select(p) {
    selected = p;
    gizmo.detach();
    if (p && $("#gizmo-mode").value !== "off" && explode === 0) {
      gizmo.attach(p);
      gizmo.setMode($("#gizmo-mode").value);
    }
    appearance();
    updateList();
  }
  function updateList() {
    const list = $("#part-list");
    list.replaceChildren();
    for (const p of parts) {
      const b = document.createElement("button");
      b.className = "part-item" + (p === selected ? " selected" : "");
      b.textContent = (p.visible ? "◉ " : "○ ") + p.name;
      b.onclick = () => select(p);
      list.append(b);
    }
    if (!parts.length) list.textContent = "Import a model to begin.";
    const fields = $("#part-transform");
    fields.replaceChildren();
    if (selected) {
      const name = document.createElement("label");
      name.textContent = "Part label";
      const input = document.createElement("input");
      input.value = selected.name;
      input.maxLength = 100;
      input.onchange = () => {
        selected.name = input.value || "Part";
        updateList();
        autosave();
      };
      name.append(input);
      fields.append(name);
      for (const [property, title] of [
        ["position", "Position (mm)"],
        ["rotation", "Rotation (°)"],
        ["scale", "Scale"],
      ]) {
        const wrap = document.createElement("fieldset"),
          legend = document.createElement("legend");
        legend.textContent = title;
        wrap.append(legend);
        wrap.className = "xyz-fields";
        for (const axis of ["x", "y", "z"]) {
          const label = document.createElement("label");
          label.textContent = axis.toUpperCase();
          const el = document.createElement("input");
          el.type = "number";
          el.step = property === "scale" ? ".1" : "1";
          el.value = (
            selected[property][axis] *
            (property === "rotation" ? 180 / Math.PI : 1)
          ).toFixed(2);
          el.setAttribute("aria-label", title + " " + axis);
          el.disabled = explode > 0;
          el.onchange = () => {
            let v = Number(el.value);
            if (
              !Number.isFinite(v) ||
              Math.abs(v) > 100000 ||
              (property === "scale" && v <= 0)
            ) {
              notify("Use a finite transform; scale must be positive.");
              updateList();
              return;
            }
            if ($("#snap").checked && property === "position")
              v = Math.round(v);
            selected[property][axis] =
              v * (property === "rotation" ? Math.PI / 180 : 1);
            basePositions.set(selected.userData.id, selected.position.clone());
            selected.updateMatrixWorld(true);
            updateDimensions();
            autosave();
          };
          label.append(el);
          wrap.append(label);
        }
        fields.append(wrap);
      }
    }
  }
  function fit(preset = $("#view-preset").value) {
    const box = new THREE.Box3().setFromObject(group),
      center = box.isEmpty()
        ? new THREE.Vector3()
        : box.getCenter(new THREE.Vector3()),
      size = box.isEmpty()
        ? 60
        : Math.max(1, box.getSize(new THREE.Vector3()).length());
    const direction = {
      iso: [1, 0.8, 1],
      front: [0, 0, 1],
      rear: [0, 0, -1],
      right: [1, 0, 0],
      left: [-1, 0, 0],
      top: [0, 1, 0.00001],
    }[preset];
    camera.position
      .copy(center)
      .add(
        new THREE.Vector3(...direction).normalize().multiplyScalar(size * 1.7),
      );
    camera.near = Math.max(0.001, size / 10000);
    camera.far = size * 100 + 1000;
    const aspect = viewport.clientWidth / viewport.clientHeight;
    if (camera.isOrthographicCamera) {
      camera.left = -size * aspect * 0.7;
      camera.right = size * aspect * 0.7;
      camera.top = size * 0.7;
      camera.bottom = -size * 0.7;
    }
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
    $("#clipping").min = Math.floor(box.min.x || -100);
    $("#clipping").max = Math.ceil(box.max.x || 100);
    clippingPlane.constant = Number($("#clipping").value);
    updateDimensions();
  }
  function applyExplosion(distance) {
    explode = Number(distance);
    const center = new THREE.Vector3();
    for (const p of parts)
      center.add(basePositions.get(p.userData.id) || p.position);
    center.divideScalar(parts.length || 1);
    parts.forEach((p, i) => {
      const base = basePositions.get(p.userData.id) || p.position.clone(),
        dir = base.clone().sub(center);
      if (dir.length() < 0.001)
        dir.set(Math.cos(i * 2.4), 0.3, Math.sin(i * 2.4));
      p.position.copy(base).addScaledVector(dir.normalize(), explode);
    });
    $("#explode-value").textContent = explode + " mm";
    gizmo.detach();
    if (explode === 0) select(selected);
    else updateList();
    updateDimensions();
  }
  function append(newParts) {
    if (
      parts.length + newParts.length > MESH_LIMITS.parts ||
      parts
        .concat(newParts)
        .reduce((sum, p) => sum + p.userData.report.triangles, 0) >
        MESH_LIMITS.triangles
    )
      throw Error("Scene exceeds 100 parts or 500,000 triangles.");
    applyExplosion(0);
    $("#explode").value = 0;
    for (const p of newParts) {
      group.add(p);
      parts.push(p);
      basePositions.set(p.userData.id, p.position.clone());
    }
    appearance();
    select(newParts[0]);
    fit();
    autosave();
  }
  async function importFiles(files) {
    if (files.reduce((n, f) => n + f.size, 0) > 40 * 1024 * 1024)
      throw Error("Selected files exceed 40 MB. Import a smaller assembly.");
    let count = 0;
    for (const file of files) {
      if (!/\.(stl|obj|glb|gltf)$/i.test(file.name)) continue;
      const imported = await parseModel(file, $("#model-units").value, files);
      if (disposed) return;
      append(imported);
      count++;
    }
    if (!count)
      throw Error(
        "Select an STL, OBJ, GLB or glTF model, plus any companion files.",
      );
    notify("Imported and saved to this browser.");
  }
  async function demo() {
    const r = await fetch(
      "./repository/cad-and-stl/prototype-angle-support.stl",
    );
    if (!r.ok) throw Error("Starter STL could not be loaded.");
    append(
      await parseModel(
        new File([await r.arrayBuffer()], "prototype-angle-support.stl"),
        "mm",
      ),
    );
    notify("Generic support: unprinted, fit-unverified.");
  }
  function action(selector, fn) {
    $(selector).onclick = async () => {
      try {
        await fn();
      } catch (e) {
        notify(e.message);
      }
    };
  }
  $("#model-files").onchange = async (e) => {
    try {
      await importFiles([...e.target.files]);
    } catch (err) {
      notify(err.message);
    }
    e.target.value = "";
  };
  viewport.ondragover = (e) => {
    e.preventDefault();
    viewport.classList.add("drop");
  };
  viewport.ondragleave = () => viewport.classList.remove("drop");
  viewport.ondrop = async (e) => {
    e.preventDefault();
    viewport.classList.remove("drop");
    try {
      await importFiles([...e.dataTransfer.files]);
    } catch (err) {
      notify(err.message);
    }
  };
  action("#demo-model", demo);
  action("#duplicate-part", () => {
    if (!selected) throw Error("Select a part first.");
    const p = selected.clone();
    p.geometry = selected.geometry.clone();
    p.material = selected.material.clone();
    p.userData = { ...structuredClone(selected.userData), id: newId() };
    p.name += " copy";
    p.position.x += 20;
    append([p]);
  });
  action("#hide-part", () => {
    if (selected) {
      selected.visible = !selected.visible;
      updateList();
      autosave();
    }
  });
  action("#show-parts", () => {
    parts.forEach((p) => (p.visible = true));
    updateList();
    autosave();
  });
  action("#isolate-part", () => {
    if (selected) {
      parts.forEach((p) => (p.visible = p === selected));
      updateList();
      autosave();
    }
  });
  action("#remove-part", () => {
    if (!selected) return;
    group.remove(selected);
    selected.geometry.dispose();
    selected.material.dispose();
    basePositions.delete(selected.userData.id);
    parts = parts.filter((p) => p !== selected);
    select(parts[0] || null);
    updateDimensions();
    autosave();
  });
  action("#fit-model", () => fit());
  $("#view-preset").onchange = () => fit();
  action("#projection", () => {
    camera = camera === perspective ? ortho : perspective;
    controls.object = camera;
    gizmo.camera = camera;
    $("#projection").textContent = camera.isOrthographicCamera
      ? "Perspective"
      : "Orthographic";
    resize();
    fit();
  });
  $("#wireframe").onchange = (e) => {
    wire = e.target.checked;
    appearance();
  };
  $("#opacity").oninput = (e) => {
    opacity = Number(e.target.value);
    appearance();
  };
  $("#grid-toggle").onchange = (e) =>
    (grid.visible = axes.visible = e.target.checked);
  $("#snap").onchange = (e) => {
    gizmo.setTranslationSnap(e.target.checked ? 1 : null);
    gizmo.setRotationSnap(e.target.checked ? Math.PI / 12 : null);
    gizmo.setScaleSnap(e.target.checked ? 0.1 : null);
  };
  $("#gizmo-mode").onchange = () => select(selected);
  $("#explode").oninput = (e) => applyExplosion(e.target.value);
  $("#clipping").oninput = (e) =>
    (clippingPlane.constant = Number(e.target.value));
  $("#clip-enable").onchange = (e) => {
    clip = e.target.checked;
    appearance();
  };
  $("#display-units").onchange = updateDimensions;
  action("#align-parts", () => {
    if (!selected) throw Error("Select a reference part.");
    applyExplosion(0);
    $("#explode").value = 0;
    for (const p of parts)
      if (p !== selected) {
        p.position.copy(selected.position);
        basePositions.set(p.userData.id, p.position.clone());
      }
    updateList();
    updateDimensions();
    autosave();
    notify(
      "Part centers aligned. This is visual positioning, not Boolean union.",
    );
  });
  action("#interference", () => {
    scene.updateMatrixWorld(true);
    const pairs = interferencePairs(parts);
    status.textContent = pairs.length
      ? pairs.map((p) => p.join(" ↔ ")).join("; ") +
        ". Bounding boxes overlap; this is not a mesh intersection test."
      : "No bounding-box overlaps among visible parts.";
  });
  action("#save-scene", () => {
    save();
    notify("Scene revision queued for local save.");
  });
  action("#export-scene", () =>
    download(JSON.stringify(getData()), "mcgruber-scene.json"),
  );
  $("#import-scene").onchange = async (e) => {
    try {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 60 * 1024 * 1024) throw Error("Scene JSON exceeds 60 MB.");
      const d = JSON.parse(await f.text());
      if (d.schema !== 1 || d.units !== "mm")
        throw Error("Unsupported scene format.");
      const imported = restoreParts(d.parts);
      append(imported);
      notify("Scene imported; existing parts retained.");
    } catch (err) {
      notify(err.message);
    }
    e.target.value = "";
  };
  function visibleCopy() {
    if (!parts.some((p) => p.visible))
      throw Error("No visible geometry to export.");
    const g = new THREE.Group();
    for (const p of parts.filter((p) => p.visible)) g.add(p.clone());
    g.updateMatrixWorld(true);
    return g;
  }
  action("#export-stl", () =>
    download(
      new Blob([new STLExporter().parse(visibleCopy(), { binary: true })]),
      "mcgruber-arrangement-mm.stl",
    ),
  );
  action("#export-glb", async () => {
    const g = visibleCopy();
    g.scale.setScalar(0.001);
    g.updateMatrixWorld(true);
    const data = await new GLTFExporter().parseAsync(g, { binary: true });
    download(
      new Blob([data], { type: "model/gltf-binary" }),
      "mcgruber-arrangement.glb",
    );
  });
  action("#screenshot", () => {
    renderer.render(scene, camera);
    renderer.domElement.toBlob((b) => {
      if (b) download(b, "mcgruber-scene.png");
    }, "image/png");
  });
  gizmo.addEventListener("mouseUp", () => {
    if (selected) {
      basePositions.set(selected.userData.id, selected.position.clone());
      updateList();
      updateDimensions();
      autosave();
    }
  });
  const raycaster = new THREE.Raycaster();
  let start;
  renderer.domElement.addEventListener(
    "pointerdown",
    (e) => (start = [e.clientX, e.clientY]),
  );
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (
      !start ||
      Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 5 ||
      gizmo.dragging
    )
      return;
    const r = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    const hit = raycaster.intersectObjects(parts.filter((p) => p.visible))[0];
    if (!hit) return;
    if ($("#measure-mode").checked) {
      points.push(hit.point.clone());
      if (points.length === 2) {
        lastDistance = points[0].distanceTo(points[1]);
        if (line) {
          scene.remove(line);
          line.geometry.dispose();
          line.material.dispose();
        }
        line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: 0xffdc88, depthTest: false }),
        );
        scene.add(line);
        points = [];
        updateDimensions();
      }
    } else if (!gizmo.axis) select(hit.object);
  });
  function resize() {
    const w = viewport.clientWidth,
      h = viewport.clientHeight;
    renderer.setSize(w, h);
    perspective.aspect = w / h;
    perspective.updateProjectionMatrix();
    if (camera.isOrthographicCamera) {
      const height = ortho.top - ortho.bottom;
      ortho.left = (-height * w) / h / 2;
      ortho.right = (height * w) / h / 2;
      ortho.updateProjectionMatrix();
    }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  resize();
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
  try {
    if (saved?.parts?.length) append(restoreParts(saved.parts));
    else await demo();
  } catch (e) {
    notify(e.message);
    fit();
  }
  return () => {
    disposed = true;
    clearTimeout(revisionTimer);
    save();
    observer.disconnect();
    renderer.setAnimationLoop(null);
    controls.dispose();
    gizmo.dispose();
    parts.forEach((p) => {
      p.geometry.dispose();
      p.material.dispose();
    });
    if (line) {
      line.geometry.dispose();
      line.material.dispose();
    }
    renderer.dispose();
  };
}
