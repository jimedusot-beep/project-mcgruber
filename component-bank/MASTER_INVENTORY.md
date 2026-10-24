# McGruber Rev 4 Master Salvage Inventory

**Source:** *McGruber Lab — Master Salvage Reference*, rev. 4, dated October 23, 2026, 26-page PDF supplied by the equipment owner.

## Scope and provenance

The machine-readable, source-traced inventory is [master-salvage-inventory.json](master-salvage-inventory.json). It contains **23 numbered entries, 22 distinct equipment/parts groups, and 1 linked subassembly**. Entry REF-12 (detached keypad/trim) is part of REF-10 (Amazon R-NZ remote), not a second remote. Page references in each record identify the relevant original PDF page. The source PDF contains photographs, but the binary PDF/photos have **not been published in this public repository**; only descriptive information is included. Do not imply photographs are accessible from the web catalog.

This collection supplements, but **does not replace**, the previously recorded 12 equipment reports in inventory-v2.csv or the 16 design requirements in components.csv. Some physical groups may describe the same underlying stock as older reports; avoid adding those counts together as a count of unique physical devices.

Evidence:
- **Seen:** a pictured item or feature in the PDF; says nothing about electrical performance.
- **Documented:** described by a model reference, package marking or external source; exact unit may vary.
- **Reported:** ownership or likely part not supported by a photograph.
- **Possible / likely:** a hypothesis, not an identification. These qualifiers remain in component descriptions.

None of the Rev 4 items are represented as an electrically proven 6–15-foot optical receiver or matched IR pair. Do not assert that a clear LED is infrared, that an RF fob is an optical source, or that a mouse imaging sensor is a long-distance detector.

## Web app workflow

Open **Component bank → View → 23 Rev 4 reference entries** to search by model, safety note, component marking or source ID. Inspect all components on the expandable cards. The "Add to My inventory" action creates a local record with **Not electrically tested** and no inferred ratings, requirements, or successful trials. "Add missing source groups" copies the 22 standalone groups once, **without overwriting** an existing local part with the same source ID. The linked remote subassembly remains in the reference only.

Private inventory data lives in the current browser’s IndexedDB. Export a full backup if changing devices. GitHub Pages is not cloud storage or synchronization.

## Priority for an eventual visible light-beam experiment

1. Test the R-NZ remote's end for actual infrared emission using a suitable, safe observation method.
2. Check one loose visible LED with known safe current limiting.
3. Investigate an LED-as-detector measurement at close range before trying more distance.
4. Verify optical geometry and shielding before attempting 6–15 feet; no suitable matched detector or retroreflector has been established.

Keep all unknown rechargeable cells and the HyperGear bank intact; unplug any legacy telephone from its line before accessing components. Use manufacturer identification and evidence before powered experiments.

## Later owner-confirmed arrivals

The October 23 Rev 4 PDF is an immutable historic source and intentionally remains 23 entries.
On October 24, 2026 the owner supplied three photographs of a newly delivered Dedeco
SUNBURST No. 1209 Deluxe Radial Discs, Pins & Midgets Assortment, marked 116 pieces.
It is a separate *owned workshop tool kit* (not electronic salvage) in
[owner-new-arrivals.json](owner-new-arrivals.json), item ARR-001. The kit is
visible in photographs, but its 116 individually packaged pieces have not been
counted or assessed for wear or speed ratings.

Open **Component Bank → View → New arrivals · owned kits** to inspect the color/grit
reference and safety notes. The optional **Add this kit to My inventory** action
creates one owned, untested local item and refuses duplicate ARR-001 imports.
Do not tally 116 individually verified spare parts or treat abrasives as a PCB
electronic requirement. The owner's three original photos are **not** published
to public GitHub; the source record is text-only. Local photo attachments can
be added privately later.
