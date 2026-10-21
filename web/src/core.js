import {newId} from './id.js';
export const SCHEMA=1;
export const evidenceTypes=['Simulation data','Reported observation','Physically measured result','Independently reproduced result'];
export function finite(value,label='Value',min=-Infinity,max=Infinity){
  if(value===''||value===null||typeof value==='boolean'||!Number.isFinite(Number(value)))throw Error(label+' must be a finite number.');
  const n=Number(value);if(n<min||n>max)throw Error(`${label} must be between ${min} and ${max}.`);return n;
}
export const positive=(x,label)=>finite(x,label,Number.MIN_VALUE);
const e24=[1,1.1,1.2,1.3,1.5,1.6,1.8,2,2.2,2.4,2.7,3,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1,10];
export function preferredResistor(r){r=positive(r,'Resistance');const decade=10**Math.floor(Math.log10(r));return e24.find(n=>n*decade>=r*(1-1e-12))*decade;}
export const calculators={
  ohm:{name:'Ohm’s law',formula:'V = I × R; I = V ÷ R; R = V ÷ I',fields:[['voltage','Voltage (V)',5],['current','Current (A)',''],['resistance','Resistance (Ω)',470]],run:p=>{
    const entries=['voltage','current','resistance'].filter(k=>p[k]!==''&&p[k]!=null);if(entries.length!==2)throw Error('Enter exactly two values; leave the value to solve blank.');
    const v=p.voltage===''?null:finite(p.voltage,'Voltage',0),i=p.current===''?null:finite(p.current,'Current',0),r=p.resistance===''?null:positive(p.resistance,'Resistance');
    if(v===null)return {'Voltage (V)':i*r};if(i===null)return {'Current (A)':v/r};return {'Resistance (Ω)':v/positive(i,'Current')};}},
  led:{name:'LED resistor',formula:'R = (Vs − Vf) ÷ I; P = (Vs − Vf)² ÷ R',fields:[['source','Supply voltage (V)',5],['forward','LED forward voltage (V)',2],['current','Desired current (mA)',8],['rating','Resistor rating (W)',0.25]],run:p=>{
    const vs=positive(p.source,'Supply'),vf=positive(p.forward,'LED voltage'),ma=positive(p.current,'LED current'),rating=positive(p.rating,'Resistor power rating');if(vs<=vf)throw Error('Supply must exceed LED forward voltage.');
    const ideal=(vs-vf)/(ma/1000),r=preferredResistor(ideal),power=(vs-vf)**2/r;
    return {'Minimum resistance (Ω)':ideal,'Next E24 resistance (Ω)':r,'Modeled current (mA)':(vs-vf)/r*1000,'Resistor power (W)':power,'Suggested minimum rating with 2× margin (W)':2*power,warning:rating<2*power?'Selected resistor rating is below the 2× design margin.':'Check actual LED Vf, tolerances, current rating and loaded supply.'};}},
  resistance:{name:'Series & parallel',formula:'Rseries = ΣR; Rparallel = 1 ÷ Σ(1/R)',fields:[['values','Resistances in Ω (comma separated)','100, 220, 470']],run:p=>{const rs=String(p.values).split(',').map(x=>positive(x.trim(),'Resistance'));if(rs.length<2||rs.length>100)throw Error('Enter 2–100 resistor values.');return {'Series (Ω)':rs.reduce((a,b)=>a+b,0),'Parallel (Ω)':1/rs.reduce((a,b)=>a+1/b,0)};}},
  divider:{name:'Voltage divider',formula:'Vout = Vin × Rbottom ÷ (Rtop + Rbottom)',fields:[['voltage','Input (V)',5],['top','Top resistor (Ω)',10000],['bottom','Bottom resistor (Ω)',10000]],run:p=>{const v=finite(p.voltage,'Input',0),t=positive(p.top,'Top resistance'),b=positive(p.bottom,'Bottom resistance');return {'Unloaded output (V)':v*b/(t+b),'Divider current (mA)':v/(t+b)*1000,warning:'Assumes an unloaded output. A load changes the divider voltage.'};}},
  power:{name:'Power dissipation',formula:'P = V × I; R = V ÷ I',fields:[['voltage','Voltage across load (V)',5],['current','Current (A)',0.02]],run:p=>{const v=finite(p.voltage,'Voltage',0),i=positive(p.current,'Current');return {'Power (W)':v*i,'Equivalent resistance (Ω)':v/i,'2× design margin (W)':2*v*i};}},
  battery:{name:'Battery runtime',formula:'Hours ≈ capacity (mAh) × derating ÷ load (mA)',fields:[['capacity','Capacity (mAh)',1000],['load','Average battery current (mA)',100],['derating','Usable capacity fraction (0–1)',0.7]],run:p=>({'Estimated runtime (h)':positive(p.capacity,'Capacity')*finite(p.derating,'Usable fraction',Number.MIN_VALUE,1)/positive(p.load,'Load'),warning:'Constant average battery-side current; ignores temperature, aging, cutoff and regulator losses unless included in inputs.'})},
  transistor:{name:'BJT switching check',formula:'Ib = Ic ÷ forced β; Rb = (Vdrive − Vbe) ÷ Ib',fields:[['drive','Drive voltage (V)',3.3],['vbe','Assumed Vbe (V)',0.7],['load','Collector load (mA)',20],['beta','Forced beta',10],['limit','GPIO current limit (mA)',4]],run:p=>{const v=positive(p.drive,'Drive'),b=positive(p.vbe,'Vbe'),i=positive(p.load,'Load')/positive(p.beta,'Forced beta');if(v<=b)throw Error('Drive must exceed assumed Vbe.');const max=positive(p.limit,'GPIO limit');return {'Required base current (mA)':i,'Maximum base resistance (Ω)':(v-b)/(i/1000),warning:i>max?'Required base current exceeds entered GPIO limit.':'Check transistor datasheet, Vce(sat), dissipation, GPIO limits and flyback protection. Not a MOSFET calculation.'};}},
  pwm:{name:'PWM timing',formula:'Period = 1/f; Ton = duty × period',fields:[['frequency','Frequency (Hz)',1000],['duty','Duty (%)',50]],run:p=>{const f=positive(p.frequency,'Frequency'),d=finite(p.duty,'Duty',0,100);return {'Period (µs)':1e6/f,'On time (µs)':d/100*1e6/f,'Off time (µs)':(1-d/100)*1e6/f};}},
  servo:{name:'Servo pulse mapping',formula:'Pulse = min + (angle ÷ range) × (max − min)',fields:[['angle','Requested angle (°)',90],['range','Assumed travel (°)',180],['min','Minimum pulse (µs)',1000],['max','Maximum pulse (µs)',2000]],run:p=>{const range=positive(p.range,'Travel'),a=finite(p.angle,'Angle',0,range),min=positive(p.min,'Minimum pulse'),max=positive(p.max,'Maximum pulse');if(max<=min)throw Error('Maximum pulse must exceed minimum.');return {'Pulse (µs)':min+a/range*(max-min),warning:'Illustrative linear mapping only. Use actual servo limits; unknown travel can cause binding.'};}},
  motor:{name:'DC motor estimate',formula:'Torque = force × radius; Pmechanical = torque × RPM × 2π/60',fields:[['force','Tangential force (N)',1],['radius','Lever radius (mm)',10],['rpm','Speed (RPM)',60],['voltage','Motor supply (V)',5],['efficiency','Assumed efficiency (0–1)',0.5]],run:p=>{const t=finite(p.force,'Force',0)*positive(p.radius,'Radius')/1000,power=t*finite(p.rpm,'Speed',0)*2*Math.PI/60;return {'Required torque (N·m)':t,'Mechanical power (W)':power,'Idealized running current (A)':power/positive(p.voltage,'Supply')/finite(p.efficiency,'Efficiency',Number.MIN_VALUE,1),warning:'Does not estimate startup or stall current. Measure those and size the supply and driver separately.'};}},
  units:{name:'Electrical units',formula:'Base units × metric prefix',fields:[['value','Value',10],['from','Input prefix (p,n,u,m,base,k,M)','m'],['to','Output prefix (p,n,u,m,base,k,M)','base']],run:p=>{const m={p:1e-12,n:1e-9,u:1e-6,m:1e-3,base:1,k:1e3,M:1e6};if(!(p.from in m)||!(p.to in m))throw Error('Use p, n, u, m, base, k or M. Prefixes are case-sensitive.');return {'Converted value':finite(p.value)*m[p.from]/m[p.to]};}}
};
export function calculate(type,p){if(!Object.hasOwn(calculators,type))throw Error('Unknown calculator');const result=calculators[type].run(p);if(Object.values(result).some(x=>typeof x==='number'&&!Number.isFinite(x)))throw Error('Inputs produce a value outside the numeric range.');return result;}
export const defaultSettings=()=>({ambient:15,threshold:45,noise:0,blocked:false,pressed:true,contact:'NC',armed:true,motion:80,sensitivity:40,frames:3,cooldown:3,command:0,compression:30,released:false,input:false});
export function simulate(id,s,state={ticks:0,consecutive:0,last:-Infinity},dt=0.25){
  const next={...state,ticks:(state.ticks||0)+1},time=next.ticks*dt;
  let value=0,output=false,detail='',unit='logic';
  if(id==='P01'||id==='P08'){
    const noise=(Math.sin(next.ticks*12.9898)*43758.5453%1)*Number(s.noise);
    value=Math.max(0,Math.min(100,Number(s.ambient)+(s.blocked?0:70)+noise));
    output=s.armed&&(id==='P08'?s.blocked:value<Number(s.threshold));unit='% modeled signal';detail=s.blocked?'Beam interrupted':'Beam present';
  }else if(id==='P02'){
    value=Number(s.motion);next.consecutive=value>=Number(s.sensitivity)?(state.consecutive||0)+1:0;
    output=!!s.armed&&next.consecutive>=Number(s.frames)&&time-(state.last??-Infinity)>=Number(s.cooldown);
    if(output){next.last=time;next.consecutive=0;}unit='% modeled movement';detail=output?'Sound event triggered':time-(state.last??-Infinity)<Number(s.cooldown)?'Cooldown':`${next.consecutive}/${s.frames} consecutive samples`;
  }else if(id==='P03'){value=s.released?0:Number(s.compression);output=!!s.released&&Number(s.compression)>0;detail=output?'Latch released · conceptual pop-up':'Latch held · conceptual stored spring';unit='% conceptual compression';
  }else if(id==='P05'){value=Number(s.command);output=!!s.armed&&value>0;detail=['No command','Command A → indicator','Command B → hypothetical sound','Command C → hypothetical actuator'][value]||'No command';unit='command';
  }else if(id==='P09'){value=s.input?next.ticks%12:0;output=!!s.input&&value>0;detail=!s.input?'Waiting for input':value<4?'Input → sound':value<9?'Sound → motor':'Motor → idle';unit='sequence tick';
  }else{
    value=(s.contact==='NC'?!s.pressed:!!s.pressed)?1:0;output=!!s.armed&&!!value;
    detail=`${s.contact} contact ${value?'closed':'open'} · ${s.pressed?'pressed':'released'}`;
  }
  return {state:next,time,value,output,detail,unit};
}
export function csvExport(rows){
  if(!rows.length)return '';
  const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const cell=v=>{let s=typeof v==='object'?JSON.stringify(v):String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  return [keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n');
}
export function repeatExperiment(record){const {samples,results,outputs,...inputs}=structuredClone(record.configuration||{});return {id:newId(),date:new Date().toISOString(),project:record.project,name:record.name+' (repeat)',evidence:record.evidence,configuration:inputs,componentIds:record.componentIds||'',criteria:record.criteria||'',trial:Number(record.trial||0)+1,voltage:'',current:'',instrument:'',observations:'',result:'Not tested',attachments:[],parentId:record.id};}
export function freshWorkspace(){return {id:'current',schema:SCHEMA,updated:null,favorites:[],recent:[],progress:{},records:[],inventory:[],simulations:{},circuit:{},theme:'dark'};}
export function validateRecord(r){
  if(!r||typeof r.id!=='string'||typeof r.name!=='string'||!/^P0[1-9]$/.test(r.project)||!evidenceTypes.includes(r.evidence)||!Array.isArray(r.attachments)||r.attachments.length>20)throw Error('Invalid experiment record.');
  for(const k of ['name','observations','instrument','criteria','componentIds'])if(r[k]!==undefined&&(typeof r[k]!=='string'||r[k].length>20000))throw Error('Invalid experiment text.');
  for(const k of ['voltage','current'])if(r[k]!==''&&r[k]!=null)finite(r[k],k);
  if(r.date!==undefined&&(typeof r.date!=='string'||Number.isNaN(new Date(r.date).getTime())))throw Error('Invalid experiment date.');
  if(r.trial!==undefined&&(!Number.isInteger(r.trial)||r.trial<1||r.trial>1000000))throw Error('Invalid trial number.');
  if(r.configuration?.samples&&(!Array.isArray(r.configuration.samples)||r.configuration.samples.length>10000||r.configuration.samples.some(s=>!Number.isFinite(s.value)||!Number.isFinite(s.time)||typeof s.output!=='boolean')))throw Error('Invalid simulation samples.');
  if(!['Not tested','Pass','Fail','Inconclusive'].includes(r.result))throw Error('Invalid experiment result.');
  if(!r.attachments.every(a=>typeof a==='string'))throw Error('Invalid attachment references.');
  return r;
}
export function validateWorkspace(w){
  if(!w||w.schema!==SCHEMA||!Array.isArray(w.records)||!Array.isArray(w.inventory)||!Array.isArray(w.favorites)||!Array.isArray(w.recent)||!w.progress||typeof w.progress!=='object'||!w.simulations||typeof w.simulations!=='object'||!w.circuit||typeof w.circuit!=='object'||w.records.length>5000)throw Error('Not a supported McGruber Lab backup.');
  w.records.forEach(validateRecord);
  if(w.inventory.length>5000||w.inventory.some(c=>!c||typeof c.id!=='string'||typeof c.name!=='string'||typeof c.status!=='string'||!Array.isArray(c.projects)))throw Error('Invalid inventory records.');
  for(const arr of [w.favorites,w.recent])if(arr.some(p=>typeof p!=='string'||!/^P0[1-9]$/.test(p)))throw Error('Invalid project references.');
  for(const [id,p] of Object.entries(w.progress))if(!/^P0[1-9]$/.test(id)||!p||!Array.isArray(p.steps)||p.steps.length>100||p.steps.some(x=>x!=null&&typeof x!=='boolean')||!Number.isInteger(Number(p.stage||0))||Number(p.stage||0)<0||Number(p.stage||0)>3)throw Error('Invalid build progress; verified stages require separate evidence review.');
  if(w.circuit.type&&!Object.hasOwn(circuitTypes,w.circuit.type))throw Error('Invalid circuit template.');
  if(w.circuit.positions)for(const [name,point] of Object.entries(w.circuit.positions))if(!['source','control','load'].includes(name)||!Array.isArray(point)||point.length!==2||point.some(n=>!Number.isFinite(n)||Math.abs(n)>10000))throw Error('Invalid circuit layout.');
  for(const [id,sim] of Object.entries(w.simulations)){
    if(!/^P0[1-9]$/.test(id)||!sim||!sim.settings||typeof sim.settings!=='object')throw Error('Invalid simulation settings.');
    for(const [key,value] of Object.entries(sim.settings)){
      const sample=defaultSettings()[key];
      if(sample===undefined||typeof sample!==typeof value||typeof value==='number'&&(!Number.isFinite(value)||Math.abs(value)>10000)||key==='contact'&&!['NO','NC'].includes(value))throw Error('Invalid simulation setting: '+key);
    }
  }
  if(JSON.stringify(w).length>80*1024*1024)throw Error('Backup exceeds 80 MB workspace limit.');
  return {...freshWorkspace(),...w,id:'current'};
}
export const circuitTypes={switch:'5V switch + resistive load',divider:'Light-sensor divider (fixed example)',timer:'RC timing example'};
export function falstadCircuit(type){
  const header='$ 1 0.000005 10.20027730826997 50 5 50\n';
  const source='v 96 240 96 80 0 0 40 5 0 0 0.5\n';
  if(type==='switch')return header+source+'s 96 80 224 80 0 0 false\nr 224 80 352 80 0 1000\nw 352 80 352 240 0\nw 352 240 96 240 0\ng 96 240 96 272 0\n';
  if(type==='divider')return header+source+'w 96 80 240 80 0\nr 240 80 240 160 0 10000\nr 240 160 240 240 0 10000\nw 240 240 96 240 0\ng 96 240 96 272 0\n';
  if(type==='timer')return header+source+'s 96 80 176 80 0 0 false\nr 176 80 304 80 0 10000\nc 304 80 304 240 0 0.0001 0\nw 304 240 96 240 0\ng 96 240 96 272 0\n';
  throw Error('Unknown CircuitJS starter');
}
export function falstadURL(type){return 'https://www.falstad.com/circuit/circuitjs.html?cct='+encodeURIComponent(falstadCircuit(type));}
