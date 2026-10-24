// Pure, offline control-logic simulator. There is deliberately no hardware transport,
// pin mapping, network command, eval, dynamic code, or physical output path.
export const channels = {
  light: "Simulated light (%)", motion: "Simulated motion (%)",
  contact: "Simulated contact (%)", button: "Simulated button (%)",
};
export const outputs = {
  led: "Virtual status LED", buzzer: "Virtual buzzer indicator (silent)",
  relay: "Virtual relay indicator", motor: "Virtual motor indicator",
};
export const circuitLinks = { switch: "Switch / load starter", divider: "Sensor divider starter", timer: "RC timing starter" };
const bounds = (n, min, max) => typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
const str = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function condition(input = "contact", comparator = "above", threshold = 50) {
  return { input, comparator, threshold };
}
export function makeRule(id, template = "removal") {
  const base = {
    id, name: "Object removal indicator", enabled: true,
    first: condition("contact", "below", 50), second: null,
    combine: "all", debounce: 2, hold: 0, output: "led",
    projectId: "P04", circuit: "switch",
  };
  if (template === "beam")
    return { ...base, name: "Broken-beam indicator", first: condition("light","below",35), debounce:3, projectId:"P01", circuit:"divider" };
  if (template === "motion")
    return { ...base, name:"Motion with armed switch", first:condition("motion","above",65),
      second:condition("button","above",50), combine:"all", debounce:2, hold:3, projectId:"P02", circuit:"timer" };
  if (template === "timed")
    return { ...base, name:"Held manual test", first:condition("button","above",50),
      debounce:3, hold:5, projectId:"P07", circuit:"switch" };
  if (template !== "removal") throw Error("Unknown starter recipe.");
  return base;
}

export function validateCondition(c) {
  if (!obj(c) || !Object.hasOwn(channels,c.input) ||
      !["above","below"].includes(c.comparator) ||
      !bounds(c.threshold,0,100)) throw Error("Invalid simulated input condition.");
  return c;
}
export function validateRule(rule) {
  if (!obj(rule) || !str(rule.id,100) || !str(rule.name,100) ||
      typeof rule.enabled !== "boolean" ||
      !["all","any"].includes(rule.combine) ||
      !Number.isInteger(rule.debounce) || rule.debounce < 1 || rule.debounce > 20 ||
      !Number.isInteger(rule.hold) || rule.hold < 0 || rule.hold > 40 ||
      !Object.hasOwn(outputs,rule.output) ||
      !Object.hasOwn(circuitLinks,rule.circuit) ||
      !/^P0[1-9]$/.test(rule.projectId)) throw Error("Invalid automation recipe.");
  validateCondition(rule.first);
  if (rule.second !== null) validateCondition(rule.second);
  return rule;
}
export function validateBrain(brain) {
  if (!obj(brain) || !Array.isArray(brain.rules) || brain.rules.length > 24)
    throw Error("Invalid Device Brain workspace.");
  const ids = new Set();
  for(const r of brain.rules) {
    validateRule(r);
    if (ids.has(r.id)) throw Error("Duplicate automation recipe ID.");
    ids.add(r.id);
  }
  return brain;
}
export function initialInputs() { return {light:80,motion:0,contact:100,button:0}; }
export function validateInputs(inputs) {
  if (!obj(inputs) || Object.keys(inputs).length !== 4 ||
      Object.keys(channels).some(k=>!bounds(inputs[k],0,100)))
    throw Error("Simulation inputs must be between 0 and 100.");
  return inputs;
}
export function evaluateCondition(c, inputs) {
  return c.comparator === "above" ? inputs[c.input] >= c.threshold : inputs[c.input] < c.threshold;
}
export function stepBrain(brain, inputs, previous = {}) {
  validateBrain(brain); validateInputs(inputs);
  const state = {}, frames = [];
  for (const rule of brain.rules) {
    const prior = previous[rule.id] || {streak:0,held:0,active:false,events:0};
    const first = evaluateCondition(rule.first, inputs);
    const second = rule.second ? evaluateCondition(rule.second, inputs) : null;
    const conditionMet = rule.second ? (rule.combine === "all" ? first && second : first || second) : first;
    const eligible = rule.enabled && conditionMet;
    const streak = eligible ? Math.min(rule.debounce, prior.streak + 1) : 0;
    const reached = eligible && streak >= rule.debounce;
    const held = reached ? rule.hold : (rule.enabled ? Math.max(0,prior.held-1) : 0);
    const active = rule.enabled && (reached || held > 0);
    const rising = active && !prior.active, falling = !active && !!prior.active;
    const events = prior.events + (rising ? 1 : 0);
    state[rule.id] = {streak,held,active,events};
    frames.push({id:rule.id,output:rule.output,active,conditionMet:eligible,rising,falling,events});
  }
  return {state,frames};
}
export function makeRecipeExport(rule) {
  validateRule(rule);
  return JSON.stringify({application:"mcgruber-device-recipe",version:1,rule},null,2);
}
export function parseRecipeImport(text,newId) {
  if(typeof text !== "string" || text.length > 12000) throw Error("Recipe file exceeds limit.");
  const data = JSON.parse(text);
  if (!obj(data) || data.application !== "mcgruber-device-recipe" || data.version !== 1)
    throw Error("Not a McGruber recipe export.");
  validateRule(data.rule);
  if(!str(newId,100)) throw Error("New recipe ID required.");
  return {...structuredClone(data.rule),id:newId,name:data.rule.name+" (imported)"};
}
