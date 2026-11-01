import { falstadCircuit, falstadURL, circuitTypes, calculate } from "./core.js";
import { download } from "./storage.js";
import { escape, $, $$, heading, projectOptions } from "./ui.js";
import { experimentHTML, mountExperiment } from "./experiments.js";
export function circuitHTML(ctx) {
  return `${heading("The virtual workbench", "Circuit lab", "Start with a compatible example, inspect its connections, and explore how it behaves.")}<div class="panel"><div class="row wrap"><label>Electrical starter<select id="circuit-type">${Object.entries(
    circuitTypes,
  )
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join(
      "",
    )}</select></label><a id="circuit-open" class="button primary" target="_blank" rel="noopener">Open in CircuitJS ↗</a><button id="circuit-download">Download CircuitJS text</button><button id="spice-download">Download SPICE netlist</button><button id="circuit-embed">Load CircuitJS here</button></div><p class="small muted">Original starter circuits run in the external CircuitJS electrical engine. The editable diagram below is a connection-order aid with an ideal DC calculation. It is not a general circuit solver. Drag a symbol to arrange it; tap a wire to trace it.</p><div class="schematic-wrap"><svg id="schematic" viewBox="0 0 800 320" role="img" aria-label="Draggable source, switch or resistor, and load connected in a loop"></svg></div><div class="row wrap"><label>Supply (V)<input id="circuit-voltage" type="number" min="0.01" max="24" step="0.1" value="5"></label><label>Load / bottom resistor (Ω)<input id="circuit-resistance" type="number" min="1" value="1000"></label><label>Top resistor (Ω)<input id="circuit-top" type="number" min="1" value="10000"></label><label><input type="checkbox" id="circuit-closed" checked> Ideal switch closed</label><button id="circuit-reset">Reset layout</button></div><div id="circuit-result" class="notice" role="status"></div><div id="circuit-property" class="small muted"></div><div id="circuit-frame"></div></div>
  <div class="section-title"><h2>Invention behavior models</h2><label>Choose invention<select id="lab-project">${projectOptions(ctx.catalog.projects, "P04")}</select></label></div><div id="lab-experiment"></div><div class="integration-grid"><a class="panel integration" href="https://wokwi.com/projects/new/arduino-uno" target="_blank" rel="noopener"><h3>Wokwi ↗</h3><p>Open a new Arduino workspace. Digital MCU simulation with limited analog support; no automatic import claimed.</p></a><a class="panel integration" href="https://www.kicad.org/" target="_blank" rel="noopener"><h3>KiCad + ngspice ↗</h3><p>Desktop schematic and SPICE workflow. Download the simple netlist above; actual devices require valid SPICE models.</p></a><a class="panel integration" href="#/docs/docs/ENGINEERING_INTEGRATIONS.md"><h3>Integration notes →</h3><p>Supported formats, licenses, mobile limitations, and the pathway to a measured circuit revision.</p></a></div>`;
}
export function mountCircuit(ctx) {
  const svg = $("#schematic");
  let type = ctx.workspace.circuit.type || "switch",
    positions = ctx.workspace.circuit.positions || {
      source: [100, 150],
      control: [380, 80],
      load: [650, 150],
    },
    selectedWire = null,
    drag = null,
    simCleanup;
  $("#circuit-type").value = type;
  $("#circuit-voltage").value = type === "alarm" ? "9" : "5";
  const persist = () => {
    ctx.workspace.circuit = { type, positions };
    ctx.save();
  };
  function draw() {
    const source = positions.source,
      control = positions.control,
      load = positions.load;
    const p = [
      `M${source[0]},${source[1] - 30}V${control[1]}H${control[0] - 45}`,
      `M${control[0] + 45},${control[1]}H${load[0]}V${load[1] - 30}`,
      `M${load[0]},${load[1] + 30}V270H${source[0]}V${source[1] + 30}`,
    ];
    svg.innerHTML = `<defs><pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--line)"/></pattern></defs><rect width="800" height="320" fill="url(#circuit-grid)"/>${p.map((d, i) => `<path data-wire="${i}" d="${d}" fill="none" stroke="${i === selectedWire ? "var(--amber)" : "var(--accent)"}" stroke-width="${i === selectedWire ? 5 : 3}" tabindex="0" role="button" aria-label="Trace wire ${i + 1}"/>`).join("")}<g data-node="source" transform="translate(${source})" tabindex="0" role="button" aria-label="Inspect ideal DC supply"><circle r="30" fill="var(--panel)" stroke="var(--ink)" stroke-width="2"/><text y="-7" text-anchor="middle" fill="var(--ink)">+</text><text y="16" text-anchor="middle" fill="var(--ink)">−</text><text y="-46" text-anchor="middle" fill="var(--muted)">DC SUPPLY</text></g><g data-node="control" transform="translate(${control})" tabindex="0" role="button" aria-label="Inspect control element"><rect x="-45" y="-26" width="90" height="52" rx="5" fill="var(--panel)" stroke="var(--ink)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--ink)">${(type === "switch" || type === "alarm") ? "SW" : type === "divider" ? "R top" : "R 10k"}</text><text y="-40" text-anchor="middle" fill="var(--muted)">${(type === "switch" || type === "alarm") ? "IDEAL SWITCH" : "RESISTOR"}</text></g><g data-node="load" transform="translate(${load})" tabindex="0" role="button" aria-label="Inspect load"><rect x="-25" y="-30" width="50" height="60" rx="4" fill="var(--panel)" stroke="var(--ink)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--ink)">${type === "timer" ? "C" : "R"}</text><text y="-46" text-anchor="middle" fill="var(--muted)">${type === "timer" ? "100 µF" : "RESISTIVE LOAD"}</text></g><text x="350" y="305" fill="var(--muted)" font-size="12">Connection-order illustration · unknown physical pinouts</text>`;
    $$("[data-wire]", svg).forEach((el) => {
      const select = () => {
        selectedWire = Number(el.dataset.wire);
        $("#circuit-property").textContent =
          `Wire ${selectedWire + 1} highlighted; endpoints follow connected component symbols.`;
        draw();
      };
      el.onclick = select;
      el.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      };
    });
    $$("[data-node]", svg).forEach((el) => {
      el.onpointerdown = (e) => {
        e.preventDefault();
        drag = el.dataset.node;
        svg.setPointerCapture(e.pointerId);
      };
      const show = () =>
        ($("#circuit-property").textContent =
          el.dataset.node === "source"
            ? "Ideal DC supply: conceptual + / − terminals, not an unidentified physical connector."
            : el.dataset.node === "control"
              ? "Control element: an ideal switch or resistor. Map real switch contacts with power disconnected."
              : "Load: resistor or capacitor, not a modeled buzzer. Actual component ratings and pinouts must be verified.");
      el.onclick = show;
      el.onkeydown = (e) => {
        if (e.key === "Enter") show();
      };
    });
  }
  svg.onpointermove = (e) => {
    if (!drag) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    positions[drag] = [
      Math.max(55, Math.min(745, p.x)),
      Math.max(65, Math.min(225, p.y)),
    ];
    draw();
  };
  svg.onpointerup = () => {
    if (drag) {
      drag = null;
      persist();
    }
  };
  svg.onpointercancel = () => {
    drag = null;
    persist();
  };
  function update() {
    try {
      const v = Number($("#circuit-voltage").value),
        r = Number($("#circuit-resistance").value),
        top = Number($("#circuit-top").value);
      if (
        !Number.isFinite(v) ||
        v <= 0 ||
        v > 24 ||
        !Number.isFinite(r) ||
        r <= 0 ||
        !Number.isFinite(top) ||
        top <= 0
      )
        throw Error("Use a 0–24 V supply and positive finite resistances.");
      const result =
        type === "divider"
          ? calculate("divider", { voltage: v, top, bottom: r })
          : (type === "switch" || type === "alarm")
            ? {
                "Ideal load current (mA)": $("#circuit-closed").checked
                  ? (v / r) * 1000
                  : 0,
                "Load power (W)": $("#circuit-closed").checked
                  ? (v * v) / r
                  : 0,
              }
            : {
                "Time constant τ (s)": top * 0.0001,
                "Steady-state capacitor voltage (V)": v,
              };
      $("#circuit-result").textContent =
        (type === "alarm" ? "Resistor-only proxy: NOT an LED model. " : "") +
        Object.entries(result)
          .map(
            ([k, v]) =>
              k + ": " + (typeof v === "number" ? v.toPrecision(4) : v),
          )
          .join(" · ") +
        ". Ideal example only; external starter files use their fixed documented values.";
    } catch (e) {
      $("#circuit-result").textContent = e.message;
    }
    $("#circuit-open").href = falstadURL(type);
    draw();
  }
  $("#circuit-type").onchange = (e) => {
    type = e.target.value;
    if (type === "alarm" || type === "switch") {
      $("#circuit-voltage").value = type === "alarm" ? "9" : "5";
      $("#circuit-resistance").value = "1000";
    }
    persist();
    update();
  };
  for (const s of [
    "#circuit-voltage",
    "#circuit-resistance",
    "#circuit-top",
    "#circuit-closed",
  ])
    $(s).oninput = update;
  $("#circuit-download").onclick = () =>
    download(
      falstadCircuit(type),
      `mcgruber-${type}-circuitjs.txt`,
      "text/plain",
    );
  $("#spice-download").onclick = () => {
    const netlist = {
      switch: "V1 supply 0 DC 5\nRcontact supply out 0.01\nRload out 0 1k\n.op",
      alarm: "V1 supply 0 DC 9\nRcontact supply out 0.01\nRproxy out 0 1k\n.op",
      divider: "V1 supply 0 DC 5\nRtop supply out 10k\nRbottom out 0 10k\n.op",
      timer:
        "V1 supply 0 PULSE(0 5 0 1u 1u 1 2)\nR1 supply out 10k\nC1 out 0 100u\n.tran 1m 5",
    }[type];
    download(
      "* McGruber original ideal example. Not measured hardware.\n" +
        netlist +
        "\n.end\n",
      `mcgruber-${type}.cir`,
      "text/plain",
    );
  };
  $("#circuit-embed").onclick = () => {
    $("#circuit-frame").innerHTML =
      `<p class="muted">External CircuitJS engine. If unavailable or cramped on a phone, use “Open in CircuitJS.” Results are not read back into McGruber Lab.</p><iframe title="CircuitJS electrical simulator" src="${escape(falstadURL(type))}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-downloads" referrerpolicy="no-referrer"></iframe>`;
  };
  $("#circuit-reset").onclick = () => {
    positions = { source: [100, 150], control: [380, 80], load: [650, 150] };
    persist();
    draw();
  };
  function mountSim() {
    if (simCleanup) simCleanup();
    const p = ctx.catalog.projects.find(
      (p) => p.id === $("#lab-project").value,
    );
    $("#lab-experiment").innerHTML = experimentHTML(p);
    simCleanup = mountExperiment(p, ctx, $("#lab-experiment"));
  }
  $("#lab-project").onchange = mountSim;
  mountSim();
  update();
  return () => simCleanup?.();
}
