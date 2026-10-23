// Educational geometry manifest inspired by 3D Vision's part-ID/assembly contract
// and H.E.R.B.I.E. Cyborg's explicit unverified compatibility metadata.
// These are VISUAL PLACEHOLDERS, not measured dimensions or shop-ready CAD.
export const TRIPWIRE_ASSEMBLY = Object.freeze({
  schema: 1,
  id: "MCG-TW-P01-CONCEPT-001",
  status: "DIGITAL_CONCEPT_UNTESTED",
  units: "illustrative-mm",
  up: "Y",
  beam: { from: [-105, 43, 0], to: [111, 43, 0] },
  sourceRepos: {
    bodyPatterns: "https://github.com/jimedusot-beep/3D-vision",
    evidencePatterns: "https://github.com/jimedusot-beep/Herbie-cyborg-hardware",
    sourceOfTruth: "https://github.com/jimedusot-beep/project-mcgruber",
  },
  parts: [
    { id: "TW-E-MOUNT", name: "Emitter stand", side: "emitter", type: "mount", required: true, pos: [-166, 3, 0], offset: [-22, -12, -26], explain: "Holds the emitter steady and below eye level.", salvage: "Cardboard support, clamp or stable recycled base.", verify: "Measure beam height, stability and alignment." },
    { id: "TW-E-HOUSING", name: "Emitter housing", side: "emitter", type: "housing", required: false, pos: [-166, 43, 0], offset: [-28, 30, -10], explain: "Protects and aims the light. An intact flashlight can replace this whole set of DIY emitter parts.", salvage: "Low-brightness battery flashlight or toy enclosure.", verify: "Measure actual housing size and safe beam spread." },
    { id: "TW-E-BATTERY", name: "Emitter batteries / holder", side: "emitter", type: "battery", required: true, pos: [-176, 43, 2], offset: [-60, -8, 15], explain: "Supplies the light emitter independently of the receiver.", salvage: "Intact low-voltage battery compartment from a toy.", verify: "Confirm supply polarity, voltage and cell condition." },
    { id: "TW-E-SWITCH", name: "Emitter switch", side: "emitter", type: "switch", required: false, pos: [-158, 52, 15], offset: [-8, 44, 24], explain: "Convenient on/off switch; often already part of a flashlight.", salvage: "Battery toy or holiday light switch.", verify: "Measure continuity with power disconnected." },
    { id: "TW-E-RESISTOR", name: "LED current limiter", side: "emitter", type: "resistor", required: "conditional", pos: [-130, 43, 0], offset: [-6, -38, -14], explain: "A bare LED requires correctly designed current limiting. A complete rated flashlight may already include this.", salvage: "Identified resistor; verify its value.", verify: "Calculate and measure LED current before sustained operation." },
    { id: "TW-E-LED", name: "Diffused visible LED", side: "emitter", type: "led", required: true, pos: [-110, 43, 0], offset: [8, 50, 0], explain: "Emits a low-brightness visible beam toward the sensor. No laser required.", salvage: "Diffused low-power toy LED or complete dim flashlight.", verify: "Avoid looking into the source; mount below eye height." },
    { id: "TW-R-MOUNT", name: "Receiver stand", side: "receiver", type: "mount", required: true, pos: [161, 3, 0], offset: [24, -12, -23], explain: "Keeps the receiving sensor aligned with the emitter.", salvage: "Reused cardboard, clip or adjustable stand.", verify: "Check stability and beam height." },
    { id: "TW-R-SHIELD", name: "Black sensor tube", side: "receiver", type: "tube", required: false, pos: [104, 43, 0], offset: [-12, 39, -10], explain: "Shades the sensor from room light and improves directionality.", salvage: "Short black straw or light-proof small tube.", verify: "Compare sensor response with/without room lighting." },
    { id: "TW-R-LDR", name: "Light detector", side: "receiver", type: "ldr", required: true, pos: [117, 43, 0], offset: [0, 64, 10], explain: "A photoresistor or phototransistor senses the light. This model depicts an LDR.", salvage: "Identified low-voltage light-reactive toy or purchased LDR.", verify: "Measure beam-present versus beam-blocked resistance/signal." },
    { id: "TW-R-DIVIDER", name: "Sensor bias / resistor", side: "receiver", type: "divider", required: "conditional", pos: [143, 39, 23], offset: [37, 38, 30], explain: "For a bare LDR, a resistor divider creates a safe analog voltage. Sensor modules may include it.", salvage: "Identified resistors and small perfboard.", verify: "Check voltage is always within chosen ESP32 ADC limits." },
    { id: "TW-R-HOUSING", name: "Receiver housing", side: "receiver", type: "receiver", required: false, pos: [157, 43, 0], offset: [40, 23, -15], explain: "Holds and protects the sensor wiring. Dimensions are unknown until parts are measured.", salvage: "Small plastic project box.", verify: "Check fit and cable exit clearance." },
    { id: "TW-C-ESP32", name: "ESP32-C3 controller", side: "control", type: "controller", required: true, pos: [150, 17, 74], offset: [50, 35, 38], explain: "Reads the sensor voltage through an appropriate GPIO/ADC pin and can host a Wi-Fi alarm page.", salvage: "Usually easier to buy a known, inexpensive development board.", verify: "Confirm exact pinout and 3.3 V GPIO requirements." },
    { id: "TW-C-USB", name: "USB power supply", side: "control", type: "power", required: true, pos: [205, 16, 74], offset: [70, -12, 32], explain: "A correctly rated USB power bank powers the ESP32. The emitter uses separate batteries.", salvage: "Existing USB power bank and matching cable.", verify: "Check board input requirements, cable and power-bank auto-off." },
  ],
});
export const TRIPWIRE_PARTS = TRIPWIRE_ASSEMBLY.parts;
export function explosionPosition(part, amount) {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) throw new RangeError("Explosion must be 0..1");
  return part.pos.map((v, i) => v + part.offset[i] * amount);
}
export function beamStatus({ blocked = false, armed = true, connected = true } = {}) {
  if (!connected) return { code: "DISCONNECTED", alarm: false, label: "Simulation connection disabled" };
  if (!armed) return { code: "DISARMED", alarm: false, label: "Simulation disarmed" };
  return blocked
    ? { code: "BROKEN", alarm: true, label: "Simulated beam broken" }
    : { code: "CLEAR", alarm: false, label: "Simulated beam detected" };
}
export function getPart(id) {
  return TRIPWIRE_PARTS.find((p) => p.id === id) || null;
}
