import { newId } from "./id.js";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SCENE_LIMITS, validateSceneParts } from "./scene-validation.js";
export const MESH_LIMITS = SCENE_LIMITS;
export function inspectGeometry(g) {
  const a = g.getAttribute("position");
  if (!a || a.count < 3 || a.itemSize !== 3)
    throw Error("No mesh triangles found.");
  const count = g.index ? g.index.count : a.count;
  if (count % 3) throw Error("Incomplete triangle data.");
  if (count / 3 > MESH_LIMITS.triangles)
    throw Error("Model exceeds 500,000 triangles. Simplify it for mobile use.");
  for (let i = 0; i < a.array.length; i++)
    if (!Number.isFinite(a.array[i]))
      throw Error("Geometry contains invalid coordinates.");
  if (g.index)
    for (const idx of g.index.array)
      if (idx >= a.count)
        throw Error("Mesh index is outside the vertex range.");
  g.computeBoundingBox();
  const d = g.boundingBox.getSize(new THREE.Vector3());
  if (d.length() === 0 || d.length() > 1e8)
    throw Error(
      "Geometry is empty or has unreasonable dimensions. Check source units.",
    );
  let boundary = null,
    nonmanifold = null,
    degenerate = 0;
  if (count / 3 <= 50000) {
    const edges = new Map();
    const point = (i) =>
      [a.getX(i), a.getY(i), a.getZ(i)]
        .map((x) => Math.round(x * 1e5))
        .join(",");
    for (let i = 0; i < count; i += 3) {
      const ids = [0, 1, 2].map((j) => (g.index ? g.index.getX(i + j) : i + j)),
        keys = ids.map(point);
      if (new Set(keys).size < 3) degenerate++;
      for (let j = 0; j < 3; j++) {
        const edge = [keys[j], keys[(j + 1) % 3]].sort().join("|");
        edges.set(edge, (edges.get(edge) || 0) + 1);
      }
    }
    boundary = [...edges.values()].filter((c) => c === 1).length;
    nonmanifold = [...edges.values()].filter((c) => c > 2).length;
  }
  return {
    triangles: count / 3,
    dimensions: d.toArray(),
    boundary,
    nonmanifold,
    degenerate,
  };
}
export async function parseModel(file, units = "mm", companions = []) {
  if (!file.size) throw Error("The file is empty.");
  if (file.size > MESH_LIMITS.bytes)
    throw Error("Use a model under 20 MB on this mobile workbench.");
  const ext = file.name.split(".").pop().toLowerCase(),
    bytes = await file.arrayBuffer();
  let root;
  if (ext === "stl") root = new THREE.Mesh(new STLLoader().parse(bytes));
  else if (ext === "obj")
    root = new OBJLoader().parse(new TextDecoder().decode(bytes));
  else if (ext === "glb" || ext === "gltf") {
    if (
      ext === "glb" &&
      (bytes.byteLength < 12 ||
        new DataView(bytes).getUint32(0, true) !== 0x46546c67)
    )
      throw Error("Invalid GLB header.");
    const urls = [],
      manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.startsWith("data:") || url.startsWith("blob:")) return url;
      const resource = companions.find(
        (f) => f.name === decodeURIComponent(url.split("/").pop()),
      );
      if (!resource)
        throw Error(
          "Missing local glTF resource: " +
            url +
            ". Select the .bin and textures together, or use GLB. Remote resources are blocked.",
        );
      const local = URL.createObjectURL(resource);
      urls.push(local);
      return local;
    });
    try {
      root = (
        await new GLTFLoader(manager).parseAsync(
          ext === "gltf" ? new TextDecoder().decode(bytes) : bytes,
          "",
        )
      ).scene;
    } finally {
      urls.forEach((u) => URL.revokeObjectURL(u));
    }
  } else throw Error("Supported model formats: STL, OBJ, GLB, glTF.");
  const factor =
    ext === "glb" || ext === "gltf"
      ? 1000
      : { mm: 1, cm: 10, m: 1000, in: 25.4 }[units];
  if (!factor) throw Error("Invalid units.");
  root.scale.multiplyScalar(factor);
  if (ext === "stl") root.rotation.x = -Math.PI / 2;
  root.updateMatrixWorld(true);
  const parts = [];
  root.traverse((node) => {
    if (node.isMesh) {
      if (parts.length >= MESH_LIMITS.parts)
        throw Error("Import exceeds 100 parts.");
      const geometry = node.geometry.clone().applyMatrix4(node.matrixWorld),
        report = inspectGeometry(geometry);
      geometry.computeVertexNormals();
      const center = geometry.boundingBox.getCenter(new THREE.Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
      const material = new THREE.MeshStandardMaterial({
        color: 0xa5d5ad,
        roughness: 0.55,
        metalness: 0.14,
        side: THREE.DoubleSide,
      });
      const part = new THREE.Mesh(geometry, material);
      part.position.copy(center);
      part.name = node.name || file.name;
      part.userData = { id: newId(), source: file.name, report };
      parts.push(part);
    }
  });
  if (!parts.length) throw Error("No visible triangle meshes in this file.");
  if (
    parts.reduce((n, p) => n + p.userData.report.triangles, 0) >
    MESH_LIMITS.triangles
  )
    throw Error("Combined model exceeds the mobile triangle limit.");
  return parts;
}
export function serializeParts(parts) {
  return parts.map((p) => ({
    id: p.userData.id,
    name: p.name,
    source: p.userData.source,
    geometry: p.geometry.toJSON(),
    position: p.position.toArray(),
    rotation: p.rotation.toArray(),
    scale: p.scale.toArray(),
    visible: p.visible,
  }));
}
export function restoreParts(data) {
  validateSceneParts(data);
  const loader = new THREE.BufferGeometryLoader();
  return data.map((d) => {
    if (
      typeof d.name !== "string" ||
      !d.position?.every(Number.isFinite) ||
      !d.scale?.every((x) => Number.isFinite(x) && x > 0) ||
      !Array.isArray(d.rotation) ||
      !d.rotation.slice(0, 3).every(Number.isFinite)
    )
      throw Error("Invalid saved part transform.");
    const geometry = loader.parse(d.geometry),
      report = inspectGeometry(geometry),
      p = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: 0xa5d5ad,
          roughness: 0.55,
          metalness: 0.14,
          side: THREE.DoubleSide,
        }),
      );
    p.position.fromArray(d.position);
    p.rotation.fromArray(d.rotation);
    p.scale.fromArray(d.scale);
    p.visible = d.visible !== false;
    p.name = d.name;
    p.userData = { id: d.id || newId(), source: d.source, report };
    return p;
  });
}
export function interferencePairs(parts) {
  const pairs = [];
  for (let i = 0; i < parts.length; i++)
    for (let j = i + 1; j < parts.length; j++)
      if (
        parts[i].visible &&
        parts[j].visible &&
        new THREE.Box3()
          .setFromObject(parts[i])
          .intersectsBox(new THREE.Box3().setFromObject(parts[j]))
      )
        pairs.push([parts[i].name, parts[j].name]);
  return pairs;
}
