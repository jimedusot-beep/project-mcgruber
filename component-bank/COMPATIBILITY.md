# Component-to-project compatibility

See [machine-readable matrix](compatibility.csv) and [the 16-category bank](README.md).

**Codes:** `R` = required for **the proposed route** (not necessarily for every future variant), `O` = optional enhancement, `A` = alternative route, `-` = not part of current route. These are **design planning classifications, not validated electrical compatibility**.

Projects P01–P09 follow the numbered project folders. Before reusing a part, check:
1. Supply voltage and maximum/startup current.
2. Logic polarity, protocol and voltage level.
3. Contact/driver capability and inductive suppression.
4. Connector pinout, grounding, physical size and mounting.
5. Real trials logged by physical item ID.

Reusing **one** buzzer or PIR across multiple *designs* requires individually verifying its ratings and intended circuit. A generic 433 MHz receiver and fob cannot be assumed compatible. A mouse optical sensor cannot be assumed to function as PIR.
