# Standalone silent control box — preliminary circuit specification

**Scope:** a low-voltage physical switch and separate visible status LED. No phone, laptop, audio or motor required.

## Simplest valid series architecture (conditional)

```
measured 9V (+)
   |
tested isolated mechanical switch contact (COM -> NO or COM -> NC)
   |
measured 1 kΩ / adequately rated resistor
   |
status LED anode (+) -> cathode (−)
   |
measured 9V (−)
```

The switch controls circuit continuity. Choose NC or NO based on a **Fluke continuity truth table** under released and pressed conditions. The same design can later be the core of Project 04 object removal alert.

**Example only:** if battery = 9V, LED forward voltage = 2V, resistor = 1kΩ, predicted LED current is 7mA and resistor power 0.049W. Measure the actual V across resistor and calculate `I=V_R/R`. Do not energize a naked LED without a current-limiting resistor.

## Optional verified NPN output stage

After identifying actual 2N4401 E/B/C pins from exact manufacturer/package documentation, the output path may be `9V+ -> 1kΩ -> LED anode -> LED cathode -> transistor C -> transistor E -> 9V−`. A 10kΩ base resistor connected *briefly* to 9V+ controls B. This is an **independent transistor switch test**; the optical receiver remains a separate unverified analog-input design. See [optical circuit interface](../01-light-beam-tripwire/CIRCUIT.md).

The previously illustrated **5V active-buzzer connection** is an **older optional sound experiment**, not the required output for this silent revision. No buzzer should appear on the current minimum BOM. [Conditional silent wiring](diagrams/silent-led-wiring.svg).

## Required pre-power checks
- Supply voltage/polarity; no exposed shorts.
- Switch contact mapping unpowered and contact current rating.
- Identified LED polarity/current rating and resistor power rating.
- Physical strain relief, insulation and mechanical safe mounting.

## Evidence and acceptance
Report actual voltage, measured resistor, calculated current, 20 press/release cycles, any false activations, and enclosure restart behavior. A drawing is not a tested wiring harness.
