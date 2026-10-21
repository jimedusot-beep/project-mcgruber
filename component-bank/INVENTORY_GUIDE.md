# Inventory V2

[Actual inventory V2](inventory-v2.csv) contains 12 **reported** item groups. [Requirements](components.csv) contains 16 categories; do not conflate them. [Compatibility](compatibility.csv) maps proposed uses. [Intake log](intake-log.csv) captures newly donated, found, borrowed, purchased or salvaged equipment.

## Intake workflow
1. Assign a new asset ID (never reuse IDs).
2. Record source type, real cost and shipping (zero only when actually zero).
3. Exclude personal addresses and donor contact details from the public repository.
4. Photograph part labels without exposing serial numbers, home locations or persons.
5. Record ownership separately from working condition.
6. Use formal test status `NOT_TESTED`, `FAILED`, `MEASURED` or `PASS_DOCUMENTED` only with actual dated evidence.
7. Attach each asset ID to project BOM records as builds develop.

Unknown quantity, voltage or cost must remain **unknown/blank**, never silently set to zero.
