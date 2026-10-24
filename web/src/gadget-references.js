
export const gadgetReferences = Object.freeze([
  {
    "id": "G01",
    "title": "Flipper Zero + AWOK Dual C5",
    "group": "Radio & protocols",
    "level": "Advanced",
    "priority": "Later",
    "track": "Simulate first",
    "purpose": "Authorized infrared, NFC, RFID and wireless protocol learning; an ESP32 network-monitoring addon is a distinct subsystem.",
    "ingredients": [
      "ESP32 board or dual-C5 board",
      "CC1101 radio module",
      "PN532 NFC board",
      "IR emitter and suitable receiver",
      "Display, keys, regulated battery supply",
      "Separate hardware-specific firmware"
    ],
    "capability": "Start with a simulated universal remote and owned-device IR command catalog; research NFC card-reader interfaces and RX-only signal inspection.",
    "limits": "The AWOK Dual C5 has its own dual ESP32-C5 design. This ingredient list cannot reproduce all Flipper hardware/software features or legally authorized radio access. RFID/NFC credential emulation and transmissions require explicit permission.",
    "leads": [
      "REF-10",
      "REF-23",
      "REF-17"
    ],
    "related": [
      "P05",
      "P08"
    ],
    "tool": "device-brain",
    "sources": [
      [
        "Flipper Zero documentation",
        "https://docs.flipper.net/"
      ],
      [
        "AWOK Dual C5 product",
        "https://awokdynamics.com/products/dual-c5-touch"
      ]
    ]
  },
  {
    "id": "G02",
    "title": "ESP32 Marauder + Card Skimmer Detector",
    "group": "Radio & protocols",
    "level": "Intermediate",
    "priority": "Start",
    "track": "Simulation + passive research",
    "purpose": "Learn about nearby Wi-Fi/BLE broadcasts and controlled defensive inspections; a skimmer warning is a heuristic, not proof.",
    "ingredients": [
      "Compatible ESP32 board and supported firmware target",
      "Optional screen and controls",
      "USB or protected battery power",
      "Test environment and user-owned peripherals"
    ],
    "capability": "Simulate scanning events with RSSI, sightings and explanations; later import consented observations from a supported adapter.",
    "limits": "ESP32 variants have different Wi-Fi/BLE features. Don't add deauth, spoofing, interception or intrusive scanning automations; detecting a Bluetooth radio near a payment terminal does not establish a skimmer.",
    "leads": [
      "REF-13",
      "REF-17"
    ],
    "related": [
      "P05"
    ],
    "tool": "device-brain",
    "sources": [
      [
        "ESP32 Marauder upstream",
        "https://github.com/justcallmekoko/ESP32Marauder"
      ]
    ]
  },
  {
    "id": "G03",
    "title": "Fanttik E2 Ultra + T1 Max (tool inspiration)",
    "group": "Repair & fabrication",
    "level": "Intermediate",
    "priority": "Start",
    "track": "Practical workshop",
    "purpose": "Make repeatable disassembly, screw organization, tip-care and safe solder inspection easier.",
    "ingredients": [
      "Correctly sized manual screwdriver bits and organizer",
      "Optional gearmotor / bit holder for a powered driver prototype",
      "Properly certified temperature-controlled iron and stand",
      "Suitable tip, fume ventilation and safe power source"
    ],
    "capability": "Build a repair checklist, screw map, solder joint inspection guide and inventory of tools. Prototype the powered screwdriver mechanically first.",
    "limits": "Do not attempt a makeshift high-temperature soldering iron or reuse unidentified lithium cells. Repair documentation is useful now without manufacturing a heater.",
    "leads": [
      "REF-17",
      "REF-18",
      "REF-22"
    ],
    "related": [
      "P03",
      "P06"
    ],
    "tool": "salvage",
    "sources": [
      [
        "Fanttik tools",
        "https://fanttik.com/"
      ]
    ]
  },
  {
    "id": "G04",
    "title": "nyanBOX tracker / wireless awareness",
    "group": "Privacy & sensing",
    "level": "Intermediate",
    "priority": "Start",
    "track": "Simulation + passive research",
    "purpose": "Understand BLE broadcasts and investigate unfamiliar wireless activity around your own property.",
    "ingredients": [
      "Supported ESP32-WROOM platform",
      "Optional nRF24L01 modules for supported experiments",
      "Small OLED, buttons and enclosure",
      "USB / protected battery supply",
      "Audited passive discovery firmware"
    ],
    "capability": "Create a synthetic nearby-device ledger and explain why signal strength and changing BLE IDs make proximity uncertain.",
    "limits": "nyanBOX is broader than a tracker detector; its RF security functions are not all benign. Passive BLE observations alone cannot conclusively identify an unwanted tracker or its owner; avoid collecting bystander identifiers.",
    "leads": [
      "REF-13",
      "REF-17"
    ],
    "related": [
      "P05"
    ],
    "tool": "device-brain",
    "sources": [
      [
        "nyanBOX source",
        "https://github.com/jbohack/nyanBOX"
      ],
      [
        "nRFBox maker project",
        "https://github.com/cifertech/nrfbox"
      ]
    ]
  },
  {
    "id": "G05",
    "title": "EFF Rayhunter cellular privacy research",
    "group": "Privacy & sensing",
    "level": "Advanced",
    "priority": "Later",
    "track": "Supported-device study",
    "purpose": "Study unusual cellular modem behavior and potential cell-site simulator signals without claiming certainty.",
    "ingredients": [
      "Rayhunter-compatible hotspot (check official model list)",
      "USB cable and computer",
      "Rayhunter official firmware/software",
      "Optional SIM; service subscription not always required"
    ],
    "capability": "Add a read-only privacy-evidence case log and links to official setup and supported-device criteria.",
    "limits": "Rayhunter runs on particular cellular modems, not a generic ESP32. An alert is not proof of a cell-site simulator; interpretation is nuanced. Never promise detection of every cellular surveillance technique.",
    "leads": [],
    "related": [
      "P05"
    ],
    "tool": "notebook",
    "sources": [
      [
        "EFF Rayhunter project",
        "https://github.com/EFForg/rayhunter"
      ],
      [
        "Supported hardware",
        "https://efforg.github.io/rayhunter/supported-devices.html"
      ]
    ]
  },
  {
    "id": "G06",
    "title": "M5Stack Cardputer ADV pocket lab",
    "group": "Microcontrollers & robots",
    "level": "Intermediate",
    "priority": "Start",
    "track": "Simulation first",
    "purpose": "Pocket user interface for experiments, inventory checking, sensors, and owned-device remote routines.",
    "ingredients": [
      "ESP32-S3 / Stamp-S3A compatible controller",
      "Small LCD and miniature keyboard",
      "Optional microSD, IMU, speaker and microphone",
      "Protected supply and enclosure",
      "Firmware based on documented pinouts"
    ],
    "capability": "Simulate a pocket menu driving virtual sensors, a countdown timer and current McGruber automation recipes.",
    "limits": "The Cardputer ADV has specific peripherals and pin mappings; a pile of similar parts is not a drop-in equivalent. The Cardputer ADV has an IR emitter, not a documented built-in IR receiver.",
    "leads": [
      "REF-13",
      "REF-17",
      "REF-23"
    ],
    "related": [
      "P02",
      "P07"
    ],
    "tool": "device-brain",
    "sources": [
      [
        "M5Stack Cardputer ADV documentation",
        "https://docs.m5stack.com/en/core/Cardputer-Adv"
      ]
    ]
  },
  {
    "id": "G07",
    "title": "M5Stack StickS3 compact controller",
    "group": "Microcontrollers & robots",
    "level": "Beginner",
    "priority": "Start",
    "track": "Simulation first",
    "purpose": "Compact sensor reader, miniature control panel and eventual isolated interface to owned robotics projects.",
    "ingredients": [
      "ESP32-S3 controller or genuine StickS3",
      "Display / buttons and connectors",
      "IMU or chosen sensor",
      "IR transmit/receive stage where explicitly supported",
      "Regulated and protected power"
    ],
    "capability": "Use the existing Device Brain for sensor → logic → virtual LED/relay flow before documenting exact firmware and GPIO boundaries.",
    "limits": "A StickS3's integrated IR receiver and transmitter are specific to that product. Motors and relays require appropriate drivers, independent power limits and explicit user permission.",
    "leads": [
      "REF-17",
      "REF-19",
      "REF-23"
    ],
    "related": [
      "P04",
      "P07",
      "P09"
    ],
    "tool": "device-brain",
    "sources": [
      [
        "M5Stack StickS3 documentation",
        "https://docs.m5stack.com/en/core/StickS3"
      ]
    ]
  },
  {
    "id": "G08",
    "title": "RTL-SDR receive-only radio lab",
    "group": "Radio & protocols",
    "level": "Beginner",
    "priority": "Start",
    "track": "Passive receive",
    "purpose": "Explore radio spectra and permitted public broadcasts by visualizing and interpreting received signals.",
    "ingredients": [
      "Compatible RTL-SDR USB dongle",
      "Suitable antenna for band",
      "Computer and driver/software",
      "Documentation of expected frequencies and signal type"
    ],
    "capability": "Begin with offline spectral sample files, frequency labels, and legal receive-only signal exercises.",
    "limits": "An RTL-SDR does not transmit. Computer driver compatibility matters. RTL-SDR Blog V4 is end-of-line, so this is a receiver class rather than a specific V4 shopping recommendation.",
    "leads": [
      "REF-13"
    ],
    "related": [
      "P05"
    ],
    "tool": "notebook",
    "sources": [
      [
        "RTL-SDR information",
        "https://www.rtl-sdr.com/"
      ],
      [
        "RTL-SDR V4 lifecycle update",
        "https://www.rtl-sdr.com/rtl-sdr-blog-v4-end-of-line/"
      ]
    ]
  },
  {
    "id": "G09",
    "title": "HackRF One + PortaPack H4 radio lab",
    "group": "Radio & protocols",
    "level": "Advanced",
    "priority": "Later",
    "track": "RX-only learning first",
    "purpose": "Advanced software-defined-radio receiver experiments and properly authorized transmitter testing.",
    "ingredients": [
      "Genuine compatible HackRF-class SDR board",
      "Matching PortaPack H4 interface and firmware",
      "Supported antenna, shielded RF setup",
      "Appropriate USB power or protected pack",
      "Computer for analysis and compliance review"
    ],
    "capability": "Import offline IQ sample metadata, analyze simulated spectra and create experiment notes without transmitting.",
    "limits": "HackRF One is a half-duplex transmitter/receiver. Treat TX as disabled by default; transmission and signal replay require explicit authorization, suitable laboratory controls and regulatory compliance.",
    "leads": [
      "REF-13"
    ],
    "related": [
      "P05"
    ],
    "tool": "notebook",
    "sources": [
      [
        "HackRF One manufacturer documentation",
        "https://greatscottgadgets.com/hackrf/one/"
      ]
    ]
  },
  {
    "id": "G10",
    "title": "Quansheng UV-K5 custom firmware study",
    "group": "Radio & protocols",
    "level": "Intermediate",
    "priority": "Later",
    "track": "Firmware research",
    "purpose": "Learn embedded firmware backup, version control, receive modes and legal radio configuration.",
    "ingredients": [
      "Owned UV-K5 compatible radio",
      "Model-specific programming cable",
      "Computer and original firmware backup",
      "Model-verified community firmware and recovery process"
    ],
    "capability": "Maintain a verified firmware-version log, read-only feature matrix and recovery checklist before any change.",
    "limits": "Custom firmware may enable unsupported frequency options; actual transmit authority depends on region, hardware certification and operator licensing. Never transmit simply because the menu permits it.",
    "leads": [],
    "related": [
      "P05"
    ],
    "tool": "notebook",
    "sources": [
      [
        "Community firmware example",
        "https://github.com/egzumer/uv-k5-firmware-custom"
      ]
    ]
  },
  {
    "id": "G11",
    "title": "Nothing Phone (3) + Nothing Ear (design inspiration)",
    "group": "Microcontrollers & robots",
    "level": "Very advanced",
    "priority": "Later",
    "track": "Interface inspiration",
    "purpose": "Learn from mobile interface, indicator lighting, wireless audio and compact packaging aesthetics.",
    "ingredients": [
      "Single-board computer or controller",
      "Touch display and UI",
      "Proper audio codec, speaker, microphone",
      "Protected battery subsystem and thermal design",
      "3D printed enclosure / accessory mounts"
    ],
    "capability": "Prototype a status-light interface and portable dashboard in 3D Vision and McGruber without cloning a commercial handset.",
    "limits": "A cellular phone and sealed wireless earbuds require difficult RF, software, radio certification, small-cell safety and mechanical engineering. Treat as modular UI and enclosure inspiration, not a near-term faithful replica.",
    "leads": [
      "REF-04",
      "REF-03",
      "REF-23"
    ],
    "related": [
      "P07",
      "P09"
    ],
    "tool": "viewer",
    "sources": [
      [
        "Nothing manufacturer",
        "https://nothing.tech/"
      ]
    ]
  },
  {
    "id": "G12",
    "title": "JimyLongs lockpick-inspired trainer",
    "group": "Mechanical security",
    "level": "Intermediate",
    "priority": "Later",
    "track": "Owned training locks only",
    "purpose": "Understand pin-tumbler geometry, force control, materials, and mechanical troubleshooting.",
    "ingredients": [
      "Purpose-made practice picks / training tools",
      "Clear or cutaway practice lock",
      "Training stand and parts tray",
      "Documentation of rules and ownership"
    ],
    "capability": "Build a mechanical pin-stack visualization and wear/force notebook for authorized practice locks.",
    "limits": "Never practice on locks in service or without permission. Improvised sharp picks can injure hands and damage property; buying safe, purpose-made training tools is preferable.",
    "leads": [
      "REF-16",
      "REF-18"
    ],
    "related": [
      "P03"
    ],
    "tool": "viewer",
    "sources": [
      [
        "JimyLongs official catalog",
        "https://jimylongs.com/"
      ]
    ]
  },
  {
    "id": "G13",
    "title": "ABUS 72/40 padlock mechanism study",
    "group": "Mechanical security",
    "level": "Intermediate",
    "priority": "Later",
    "track": "Owned training locks only",
    "purpose": "Study keyways, pins, springs, tolerances, and non-destructive mechanical security education.",
    "ingredients": [
      "Owned ABUS 72/40 or purpose-built training cylinder",
      "Correct service tools and training jig",
      "Pinning tray, documented pins/springs",
      "Keys and practice log"
    ],
    "capability": "Create a 3D annotated lock cylinder cutaway and practice checklist on a non-installed lock.",
    "limits": "Do not alter or defeat active locks, shared property, or security-critical access. Use a dedicated owned practice cylinder to avoid losing access or damaging a working lock.",
    "leads": [
      "REF-18"
    ],
    "related": [
      "P03"
    ],
    "tool": "viewer",
    "sources": [
      [
        "ABUS padlocks",
        "https://www.abus.com/"
      ]
    ]
  }
]);
export const gadgetCategories = Object.freeze([...new Set(gadgetReferences.map(x=>x.group))]);
export const gadgetPriorities = Object.freeze(["Start","Later"]);
export function validateGadgetReferences(catalog=gadgetReferences) {
 if(!Array.isArray(catalog) || catalog.length!==13) throw Error("Expected thirteen separate inspiration records.");
 const ids=new Set();
 for(const x of catalog) {
   if(!/^G(0[1-9]|1[0-3])$/.test(x.id)||ids.has(x.id)) throw Error("Duplicate or invalid gadget ID.");
   ids.add(x.id);
   if(!x.title||!gadgetCategories.includes(x.group)||!gadgetPriorities.includes(x.priority) ||
      !Array.isArray(x.ingredients)||x.ingredients.length<3 ||
      !Array.isArray(x.related) || !x.related.every(r=>/^P0[1-9]$/.test(r)) ||
      !Array.isArray(x.leads) || !x.leads.every(r=>/^REF-(0[1-9]|1\d|2[0-3])$/.test(r)) ||
      !["assistant","device-brain","salvage","notebook","viewer","circuit"].includes(x.tool) ||
      !x.capability || !x.limits || !x.purpose ||
      !Array.isArray(x.sources) || !x.sources.length ||
      !x.sources.every(s=>s.length===2 && /^https:\/\//.test(s[1]))) throw Error("Invalid gadget entry: "+x.id);
 }
 return true;
}
export function filterGadgets({query="",group="all",priority="all"}={},catalog=gadgetReferences) {
 const q=String(query).toLowerCase().trim();
 return catalog.filter(x=>(group==="all"||x.group===group)&&(priority==="all"||x.priority===priority) &&
    (!q || [x.title,x.purpose,x.capability,x.limits,x.group,x.level,...x.ingredients,...x.leads].join(" ").toLowerCase().includes(q)));
}
export function gadgetWorksheet(x) {
 if(!x || !gadgetReferences.some(i=>i.id===x.id)) throw Error("Unknown gadget.");
 return [
 "# McGruber research investigation — "+x.id+" "+x.title,"",
 "Status: Research inspiration only. Not an owned item, tested build, schematic, or purchase order.","",
 "## Purpose",x.purpose,"","## DIY starting ingredients (NOT an approved bill of materials)",
 ...x.ingredients.map(s=>"- "+s),"","## First safe capability to prototype",x.capability,"",
 "## Evidence limitations, safety, permission",x.limits,"",
 "## Potential existing salvage leads (unverified)",...(x.leads.length?x.leads.map(s=>"- "+s):["- None identified"]),
 "","## Existing project references",...x.related.map(s=>"- "+s),"",
 "## Research sources",...x.sources.map(([name,url])=>"- "+name+": "+url),"",
 "## Before marking it build-ready","- [ ] Exact owned parts and documentation verified",
 "- [ ] Physical electrical ratings / mechanical dimensions checked",
 "- [ ] Prototype simulated, failure paths tested, permissions established",
 "- [ ] Actual observations recorded in Notebook, with failures",
 "- [ ] Privacy, safety and regulatory constraints reviewed","",
 "No firmware, transmitter, interface or physical tests were run by this worksheet."
 ].join("\n");
}
