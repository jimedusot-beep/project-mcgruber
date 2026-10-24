# From donor device to a powered project

Open **Salvage workbench** in McGruber Lab. The app keeps the donor, photos, recovered inventory, test summaries and power plans together on this browser. Export a **full backup** before changing devices or clearing browser data. This release does not identify components automatically or connect to hardware.

## Start with a mouse

1. Add a donor and record its exact model. Keep repair or reuse of the complete mouse as an option before harvesting it.
2. Follow the preparation checklist and the exact model's opening procedure. Disconnect USB and removable batteries. Photograph each layer before removing anything. Mark screw positions and connector orientation.
3. In **Photos & labels**, upload your own images. Enter a short label and tap its position, or choose **Add label at photo center** for keyboard access. Labels use normalized coordinates so they survive screen resizing. A label can link to a recovered part; it does not identify that part automatically.
4. Choose **Parts & tests → Recover / identify a part**. Record its markings, quantity, location, donor and type. Select requirement categories explicitly; similar appearance is not compatibility evidence.
5. For a switch, document an isolated, unpowered contact test with the method, instrument, expected behavior, observations and date. A continuity result does not establish the contact voltage or current rating. Keep additional trials and photos in the notebook.
6. The live project shortlist counts categories with available candidates and recorded passing tests. It shows missing categories and candidates still needing tests. It uses the original component-route matrix and does not certify assembly quantities, electrical fit or a completed build.

## Landline phones

Choose **Corded landline phone** or **Cordless phone / handset** so the checklist includes telephone-line isolation. Disconnect the wall line, external adapter and removable batteries before work. Leave the mains adapter sealed. Follow an appropriate service procedure for your exact model; the app does not supply invented fastener locations or unknown connector pinouts.

Candidate keypad, receiver, speaker, microphone and enclosure parts need individual identification. A receiver is not automatically an active buzzer, and a microphone needs its own type and bias identification. No live telephone-line or mains tests are provided.

## Plan battery power

The **Battery & power** stage checks an identified component or powered assembly against a proposed isolated DC supply of at most 24 V:

- Enter the component's operating voltage range, running/peak current, identified supply/return terminals and evidence source in its inventory record.
- Record the proposed battery/finished supply model, lowest loaded and highest voltage, continuous current capability, and supporting evidence. Do not substitute a nominal battery voltage for the full operating range.
- Choose a direct path or an identified buck, boost or buck-boost module. The voltage-range suggestion is a starting point, not a specific module recommendation. For conversion, enter actual module input limits, output tolerance, efficiency and output current at the lowest source voltage. The check also calculates battery-side peak-current demand from output power and efficiency.
- Document protection, a disconnect switch, polarity, supporting circuitry and the first-test plan. LED current limiting, motor drivers/suppression and audio bias/amplification remain separate requirements. Datasheet thermal, transient and layout constraints still require review.
- An eligible result is labeled **Entered checks satisfied — prepare a controlled test**. It is a calculation based on your entries, not measured compatibility. Changed part ratings immediately change the result when the plan is reopened. Export a plan JSON with its input snapshot and assessment to review it elsewhere.

Unknowns stay blank and block a candidate result. Passive switches are not powered by placing a battery across their contacts. Use the included **mouse switch → LED indicator** worked example to understand a series load path; its values are explicitly teaching inputs, never imported as your actual parts.

Runtime is optional and energy-based. Enter the nominal voltage associated with the stated capacity, usable fraction and running current. A battery bank's cell-side mAh is not its output-side mAh. No battery charging circuit or loose-cell pack construction is generated; use the specified charger for a finished rechargeable pack.

## Restore protection

Notebook drafts receive structural validation while allowing unfinished text and incomplete measurement evidence. Committed records use shared evidence rules across forms and imports. Scene transforms, attributes, indices and combined scene limits are checked before restoration. Failed imports leave the current workspace, recovery history and media unchanged.

Teardown photos participate in full backup/restore, reference-aware cleanup and recovery revisions. Imported media IDs are remapped so an older recovery revision cannot have its attachment bytes overwritten.

## References

These are reference examples; use the model-specific documentation for your actual device and components. No third-party teardown photographs or text are bundled.

- [Fluke: unpowered continuity testing](https://www.fluke.com/en-us/learn/blog/digital-multimeters/how-to-test-for-continuity)
- [Andrew Lye and contributors: Microsoft Wheel Mouse Optical 1.1A switch replacement](https://www.ifixit.com/Guide/Microsoft+Wheel+Mouse+Optical+1.1A+Microswitch+Replacement/117288)
- [Making Studio: a Panasonic KX-TGA660 handset teardown](https://makingstudio.blog/2020/09/14/phone-handset/)
- [Texas Instruments: TPS63060 converter operating-limit example](https://www.ti.com/lit/ds/symlink/tps63060.pdf)
