# Field test — visible red-beam / iPhone receiver (owner-reported)

**Report received:** 2026-10-23  
**Evidence classification:** **OWNER-REPORTED**, not independently instrumented, witnessed, or reproduced by repository maintainers.  
**Project:** 01 Light-Beam Tripwire, silent smartphone prototype.  
**Experiment:** User-operated red light directed toward iPhone camera with browser-based beam-break detector.

## Observations from user

- Confirmed in conversation that the phone app opens and its camera works.
- Confirmed that the app automatically shows a beam present and broken; earlier the user observed live brightness values.
- When asked which light produced the successful detection, replied **“Red.”**
- Submitted the following range form responses:

| Requested separation | Submitted outcome |
| --- | --- |
| 1 ft | PASS |
| 3 ft | PASS |
| 6 ft | PASS |
| 10 ft | PASS |
| 15 ft | PASS |

The form instructed ten crossings at each distance and a PASS only if all ten were counted correctly. **The individual readings, counts, measured distances, and false-positive logs were not supplied**, so these are self-reported form outcomes, not a set of externally verified 50 crossings. It is not established whether measured distance was exact. The exact red-light module, resistor, power source, phone model/camera lens, room lighting, app revision used and physical arrangement have not been recorded. Do not infer electrical ratings or eye safety from this report.

## Current technical conclusion

A **silent camera-based prototype has been demonstrated by owner report through a nominal 15 ft**. This does **not** establish a certified outdoor/security alarm, dependable unattended use, a direct electrical photodiode receiver, or a standalone no-phone version. A visible red LED normally appears as a point; an illuminated line in free air has not been demonstrated.

## Next physical engineering gate: fixed 15-foot bench/doorway rig

1. **Record the hardware.** Photograph the working emitter and how it is powered (without sensitive information), identify voltage and LED current safely, and record the actual app URL/revision and camera lens.
2. **Fix alignment.** Secure the red emitter and phone on separate stable nonconductive mounts roughly 15 ft apart. Do not tape over or scratch the camera lens. Route leads away from walking areas. Keep the illuminated source away from eye level. Prefer a normal low-power LED; do not use a laser.
3. **Re-arm once.** Place the camera target over the red point; hold the phone stationary; arm once with the light fully on. Note the baseline brightness score.
4. **Block and unblock 30 times.** Let the app automatically count; manually tally valid crossings. Record misses, duplicate counts and time to resume. Capture the screen if desired, without including people's faces.
5. **False-alarm soak.** Leave the light steady for 15 minutes and count triggers while no person obstructs the path. Phone must stay awake and the app in foreground.
6. **Lighting challenge.** Repeat short crossing + idle tests under daytime room lighting, electric lighting and dim lighting, re-arming where needed; log every result rather than assuming all three will work.
7. **Disturbance recovery.** Briefly move an emitter mount, restore alignment, and verify detection recovers after re-arming. Stop if exposure/white balance causes unstable readings.
8. **Power check.** Verify the exact supply configuration; measure voltage and resistor resistance before connecting anything new. Never connect a loose LED directly across an unverified battery pack.

### Acceptance criteria for the fixed rig

- 30 out of 30 intentional beam breaks are detected once each.
- Zero false trips during a 15-minute stationary period in the chosen room lighting.
- Normal light restoration changes state back without tapping BLOCKED.
- Restarts, misalignment, and loss-of-camera permissions are visibly reported (do not silently imply a functioning detector).
- Electrical supply, optical layout, camera settings, and outcomes logged.

**Not yet run:** The acceptance gates above. Mark them completed only after the owner submits outcomes. Failures and environmental limits are useful data.

## Companion software

- [Mobile phone detector source (Project McGruber)](../../web/public/beam-detector/index.html)
- [Hosted phone detector (3D Vision Pages)](https://jimedusot-beep.github.io/3D-vision/beam-detector/)
- [Original test log](TEST_LOG.csv) — retains the NOT_RUN sentinel for independently documented measurements, followed by owner-reported distance results.
