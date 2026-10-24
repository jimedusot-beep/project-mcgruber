// Validate serialized scenes before allocating Three.js objects or replacing data.
export const SCENE_LIMITS = { bytes: 20 * 1024 * 1024, triangles: 500000, parts: 100 };
const orders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"];
const vector = (v, positive = false) =>
  Array.isArray(v) && v.length === 3 && v.every((n) =>
    typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 1e8 && (!positive || n > 0));
export function validateSceneParts(parts) {
  if (!Array.isArray(parts) || parts.length > SCENE_LIMITS.parts)
    throw Error("Invalid saved scene; use at most 100 parts.");
  let total = 0;
  const ids = new Set();
  for (const p of parts) {
    if (!p || typeof p.name !== "string" || p.name.length > 500 ||
        !vector(p.position) || !vector(p.scale, true) ||
        !Array.isArray(p.rotation) || ![3, 4].includes(p.rotation.length) ||
        !vector(p.rotation.slice(0, 3)) ||
        (p.rotation.length === 4 && !orders.includes(p.rotation[3])) ||
        (p.visible != null && typeof p.visible !== "boolean"))
      throw Error("Invalid saved part transform: use three finite coordinates and positive scales.");
    if (p.id != null) {
      if (typeof p.id !== "string" || !p.id || p.id.length > 200 || ids.has(p.id))
        throw Error("Invalid or duplicate saved part ID.");
      ids.add(p.id);
    }
    const g = p.geometry?.data, a = g?.attributes?.position;
    if (!a || a.itemSize !== 3 || !Array.isArray(a.array) ||
        a.array.length < 9 || a.array.length % 3 ||
        a.array.length > SCENE_LIMITS.triangles * 9 ||
        a.array.some((n) => typeof n !== "number" || !Number.isFinite(n) || Math.abs(n) > 1e8))
      throw Error("Invalid saved mesh coordinates.");
    // Attributes consumed by BufferGeometryLoader must also be finite and bounded.
    const types = ["Float32Array", "Float64Array", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "Int8Array", "Int16Array", "Int32Array"];
    for (const attribute of Object.values(g.attributes)) {
      if (!attribute || !types.includes(attribute.type) ||
          !Number.isInteger(attribute.itemSize) || attribute.itemSize < 1 || attribute.itemSize > 4 ||
          !Array.isArray(attribute.array) || attribute.array.length > SCENE_LIMITS.triangles * 12 ||
          attribute.array.length % attribute.itemSize ||
          attribute.array.some((n) => typeof n !== "number" || !Number.isFinite(n)))
        throw Error("Invalid saved mesh attribute.");
    }
    const indices = g.index?.array, vertices = a.array.length / 3;
    if (g.index && (!Array.isArray(indices) || indices.length < 3 || indices.length % 3 ||
        indices.length > SCENE_LIMITS.triangles * 3 ||
        !["Uint8Array", "Uint16Array", "Uint32Array"].includes(g.index.type) ||
        indices.some((n) => !Number.isInteger(n) || n < 0 || n >= vertices)))
      throw Error("Invalid saved mesh indices.");
    total += (indices ? indices.length : vertices) / 3;
    if (!Number.isInteger(total) || total > SCENE_LIMITS.triangles)
      throw Error("Combined saved scene exceeds 500,000 triangles.");
  }
  return parts;
}
export function validateScene(scene) {
  if (!scene || scene.schema !== 1 || scene.units !== "mm")
    throw Error("Unsupported scene format.");
  validateSceneParts(scene.parts);
  return scene;
}
