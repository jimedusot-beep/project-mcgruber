import {newId} from './id.js';
import {defaultSettings,simulate} from './core.js';
import {escape,$,$$,chart} from './ui.js';
export function experimentHTML(project){return `<div class="section-title"><h2>Try the idea. Watch the response.</h2><span class="pill">LOGIC MODEL</span></div><p class="muted">Interactive, simplified behavior. The values below are modeled inputs and outputs, never physical measurements or a SPICE simulation.</p><div class="experiment-layout"><div class="panel"><h3>Experiment controls</h3><div id="sim-controls"></div><div class="row wrap"><button id="sim-pause" class="primary">Pause</button><button id="sim-step">Step</button><button id="sim-reset">Reset</button><button id="sim-save">Save run to notebook</button></div></div><div class="panel signal-panel"><div class="eyebrow">${escape(project.id)} · SIMULATION OUTPUT</div><div id="sim-output" role="status"></div><div id="sim-chart"></div><p class="small muted">Each sample advances the conceptual clock by 250 ms. Device latency is not modeled. Pausing preserves the current run.</p></div></div>`;}
export function mountExperiment(project,ctx,root=document){
  const get=s=>$(s,root),saved=ctx.workspace.simulations[project.id],s={...defaultSettings(),...saved?.settings};
  let state={ticks:0,consecutive:0,last:-Infinity},samples=[],paused=false,timer,disposed=false;
  function range(key,name,min=0,max=100){return `<label>${escape(name)} <output id="val-${key}">${s[key]}</output><input type="range" data-setting="${key}" min="${min}" max="${max}" value="${s[key]}"></label>`;}
  function checkbox(key,label){return `<label class="check-row"><input type="checkbox" data-setting="${key}" ${s[key]?'checked':''}>${escape(label)}</label>`;}
  let fields=checkbox('armed','Output armed');
  if(['P01','P08'].includes(project.id))fields+=range('ambient','Ambient light (%)')+range('threshold','Threshold (%)')+range('noise','Modeled noise amplitude (%)',0,20)+checkbox('blocked','Beam blocked');
  else if(project.id==='P02')fields+=range('motion','Modeled movement (%)')+range('sensitivity','Movement threshold (%)')+range('frames','Consecutive samples',1,10)+range('cooldown','Cooldown (s)',0,15);
  else if(project.id==='P03')fields+=range('compression','Conceptual spring compression (%)')+checkbox('released','Release latch');
  else if(project.id==='P05')fields+=`<label>Hypothetical command<select data-setting="command">${['None','A · indicator','B · sound','C · actuator'].map((n,i)=>`<option value="${i}" ${Number(s.command)===i?'selected':''}>${n}</option>`).join('')}</select></label><p class="notice">No radio connection is made. The fob, encoding and receiver remain unverified.</p>`;
  else if(project.id==='P09')fields+=checkbox('input','Trigger sound → motor sequence')+'<p class="notice">Conceptual sequencing only; no audio playback, motor, or donor hardware connection.</p>';
  else fields+=checkbox('pressed',project.id==='P04'?'Object pressing switch':'Switch pressed')+`<label>Measured contact behavior (hypothetical)<select data-setting="contact"><option ${s.contact==='NC'?'selected':''}>NC</option><option ${s.contact==='NO'?'selected':''}>NO</option></select></label><p class="small muted">NC is closed at rest (released), opening when pressed. Verify actual terminal pairs with power disconnected.</p>`;
  get('#sim-controls').innerHTML=fields;
  function persist(){ctx.workspace.simulations[project.id]={settings:structuredClone(s)};ctx.save();}
  function tick(){if(disposed)return;const result=simulate(project.id,s,state);state=result.state;samples.push({time:result.time,value:result.value,output:result.output});if(samples.length>120)samples.shift();
    get('#sim-output').innerHTML=`<div class="signal-status ${result.output?'active':''}"><span class="signal-dot"></span>${result.output?'Output active':'Output idle'}</div><div class="sensor-reading">${Number(result.value).toFixed(1)}<small>${escape(result.unit)}</small></div><p>${escape(result.detail)}</p>`;
    get('#sim-chart').innerHTML=chart(samples,['P01','P02'].includes(project.id)?Number(project.id==='P02'?s.sensitivity:s.threshold):null);
  }
  $$('[data-setting]',root).forEach(el=>el.oninput=()=>{const key=el.dataset.setting;s[key]=el.type==='checkbox'?el.checked:el.type==='range'||key==='command'?Number(el.value):el.value;const out=get('#val-'+key);if(out)out.value=s[key];persist();if(paused)tick();});
  get('#sim-pause').onclick=()=>{paused=!paused;get('#sim-pause').textContent=paused?'Resume':'Pause';};get('#sim-step').onclick=()=>{paused=true;get('#sim-pause').textContent='Resume';tick();};
  get('#sim-reset').onclick=()=>{state={ticks:0,consecutive:0,last:-Infinity};samples=[];tick();};
  get('#sim-save').onclick=()=>{
    const record={id:newId(),name:project.name+' · simulated run',project:project.id,date:new Date().toISOString(),evidence:'Simulation data',configuration:{settings:structuredClone(s),samples:structuredClone(samples)},componentIds:'',criteria:'Observe modeled trigger and output behavior',trial:1,voltage:'',current:'',instrument:'',observations:'Logic model output only; no hardware measurements.',result:'Not tested',attachments:[]};ctx.workspace.records.unshift(record);ctx.save();ctx.notify('Simulation saved in your private notebook.');
  };
  tick();timer=setInterval(()=>{if(!paused)tick();},250);
  return ()=>{disposed=true;clearInterval(timer);};
}
