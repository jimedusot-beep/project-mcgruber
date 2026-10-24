import { test, expect } from '@playwright/test';
// Synthetic frames exercise real canvas scoring and UI, not physical hardware.
async function syntheticCamera(page) {
  await page.addInitScript(() => {
    window.testLight = true; window.testFrozen = false;
    const vp = HTMLVideoElement.prototype;
    Object.defineProperty(vp,'srcObject',{get(){return this._stream;},set(s){this._stream=s;}});
    Object.defineProperty(vp,'videoWidth',{get:()=>640});Object.defineProperty(vp,'videoHeight',{get:()=>480});
    Object.defineProperty(vp,'readyState',{get:()=>4});Object.defineProperty(vp,'currentTime',{get:()=>window.testFrozen?0:performance.now()/1000});
    vp.play=async()=>{};vp.pause=()=>{};
    const track={stop(){},addEventListener(){},getSettings:()=>({facingMode:'environment'}),label:'SYNTHETIC TEST CAMERA'};
    Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>({getTracks:()=>[track],getVideoTracks:()=>[track]}),enumerateDevices:async()=>[]}});
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(source,...args){
      if(!(source instanceof HTMLVideoElement))return draw.call(this,source,...args);
      this.fillStyle='#202020';this.fillRect(0,0,this.canvas.width,this.canvas.height);
      if(window.testLight){this.fillStyle='#ff2020';this.beginPath();this.arc(this.canvas.width/2,this.canvas.height/2,9,0,Math.PI*2);this.fill();}
    };
  });
}
test('V5 automatically counts ten synthetic crossings and invalidates a running range test on stop',async({page})=>{
  await syntheticCamera(page);await page.goto('/beam-detector/');
  await expect(page.locator('#build-version')).toHaveText('V5 · Camera + Standalone Engineering Lab');
  await page.locator('#start').click();await page.waitForTimeout(600);await page.locator('#arm').click();
  await expect(page.locator('#state')).toHaveText('BEAM DETECTED');await page.locator('#begin-test').click();
  for(let i=0;i<10;i++){
    await page.evaluate(()=>window.testLight=false);
    await expect(page.locator('#state')).toHaveText('BEAM BROKEN');
    await expect(page.locator('#trip-count')).toHaveText(String(i+1));
    await page.evaluate(()=>window.testLight=true);
    await expect(page.locator('#state')).toHaveText('BEAM DETECTED');
  }
  await expect(page.locator('#trip-count')).toHaveText('10');
  await page.locator('#crossings-confirm').check();await page.locator('#finish-crossings').click();await expect(page.locator('#test-status')).toContainText('IDLE');
  await page.locator('#start').click();await expect(page.locator('#test-status')).toContainText('INTERRUPTED');
  await page.locator('#start').click();await expect(page.locator('#state')).toHaveText('READY TO ARM');await expect(page.locator('#trip-count')).toHaveText('10');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('frozen camera cannot continue to claim a detected beam',async({page})=>{
  await syntheticCamera(page);await page.goto('/beam-detector/');await page.locator('#start').click();await page.waitForTimeout(600);await page.locator('#arm').click();await expect(page.locator('#state')).toHaveText('BEAM DETECTED');
  await page.evaluate(()=>window.testFrozen=true);await expect(page.locator('#state')).toHaveText('CAMERA STALLED');await expect(page.locator('#begin-test')).toBeDisabled();
});
test('permission failure displays recovery instructions and tests remain disabled',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{throw new DOMException('Denied','NotAllowedError');}}}));
  await page.goto('/beam-detector/');await page.locator('#start').click();await expect(page.locator('#error')).toContainText('permission was denied');await expect(page.locator('#begin-test')).toBeDisabled();
});
test('hiding while camera permission is pending cancels that start',async({page})=>{
  await syntheticCamera(page);await page.goto('/beam-detector/');
  await page.evaluate(()=>{window.pendingStops=0;navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.finishPermission=()=>resolve({getTracks:()=>[{stop(){window.pendingStops++;}}],getVideoTracks:()=>[{stop(){window.pendingStops++;},addEventListener(){},getSettings:()=>({}),label:'PENDING'}]}));});
  await page.locator('#start').click();await expect(page.locator('#state')).toHaveText('STARTING CAMERA');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));window.finishPermission();});
  await expect(page.locator('#state')).toHaveText('CAMERA PAUSED');
  await expect.poll(()=>page.evaluate(()=>window.pendingStops)).toBe(1);
});
test('guided test completes its timed check and exports operator-labelled evidence',async({page})=>{
  test.setTimeout(90000);
  await syntheticCamera(page);const initial=new Date('2026-10-23T12:00:00Z');await page.clock.install({time:initial});await page.clock.pauseAt(new Date(initial.getTime()+1000));
  await page.goto('/beam-detector/');await page.locator('#start').click();await page.clock.runFor(600);await page.locator('#arm').click();await page.clock.runFor(1600);await expect(page.locator('#state')).toHaveText('BEAM DETECTED');
  await page.locator('#begin-test').click();
  for(let i=0;i<10;i++){await page.evaluate(()=>window.testLight=false);await page.clock.runFor(350);await page.evaluate(()=>window.testLight=true);await page.clock.runFor(350);}
  await page.locator('#crossings-confirm').check();await page.locator('#finish-crossings').click();await page.clock.runFor(300);
  await expect(page.locator('#test-status')).toContainText('IDLE');await page.clock.runFor(119000);await expect(page.locator('#test-status')).toContainText('IDLE');await page.clock.runFor(1500);await expect(page.locator('#test-status')).toContainText('PASSED');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mcgruber-beam-v4-tests')));expect(saved).toHaveLength(1);expect(saved[0]).toMatchObject({phase:'passed',observedBreaks:10,operatorConfirmed:true});expect(saved[0].idleElapsedMs).toBeGreaterThanOrEqual(120000);
  const download=page.waitForEvent('download');await page.locator('#export-tests').click();expect((await download).suggestedFilename()).toBe('mcgruber-beam-test-results.json');
});
test('ARM waits for fresh camera readings before becoming available',async({page})=>{
  await syntheticCamera(page);await page.goto('/beam-detector/');await page.evaluate(()=>window.testFrozen=true);
  await page.locator('#start').click();await expect(page.locator('#state')).toHaveText('READY TO ARM');expect(await page.locator('#arm').isDisabled()).toBe(true);
  await page.evaluate(()=>window.testFrozen=false);await expect(page.locator('#arm')).toBeEnabled();
});
