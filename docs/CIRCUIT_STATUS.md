# Circuit diagram validation status

Every project has an SVG **block diagram** and a CIRCUIT.md explaining what actual pin-level diagram needs to be built after verifying exact components. All schematics are **preliminary**, not certified wiring for unknown parts.

Projects **04 object-removal alarm** and **07 standalone control box** also include text netlists showing **conditional** direct low-voltage switch circuits. They require a verified supply, switch contact rating, resistor/buzzer selection and current measurement before assembly.

A released wiring schematic must carry:
- Exact source, polarity and output current;
- Component and package part numbers including actual pin indices;
- Current-limiting, motor drivers/protection and grounding;
- Revision ID tied to specific measured hardware;
- Field test log including pass/fail observations.

Do not call an architecture diagram a component-level circuit schematic.
