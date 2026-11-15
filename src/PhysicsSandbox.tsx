import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { AlertTriangle, Download, Eye, EyeOff, Minus, Pause, Play, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";

type Language = "ID" | "EN";
type Row = { id:number; text:string; enabled:boolean };
type Vars = Record<string,number>;
type EditorTab = "equations" | "objects" | "examples" | "graph";
type ObjectKind = "box" | "circle" | "spring" | "rope" | "pulley" | "wheel" | "beam" | "ramp" | "pendulum" | "mass";
type MechanicalObject = {id:number;kind:ObjectKind;x:number;y:number;mass:number;radius:number;stiffness:number;angle:number;length:number;damping:number;friction:number;elasticity:number;enabled:boolean};
type Node = { kind:"num"; n:number } | { kind:"var"; name:string } | { kind:"unary"; op:string; child:Node } | { kind:"binary"; op:string; a:Node; b:Node } | { kind:"call"; name:string; args:Node[] };
type Compiled = { id:number; text:string; target:"y(x)"|"x(t)"|"y(t)"; root:Node; error?:string };
type Motion = { x:number;y:number;vx:number;vy:number;ax:number;ay:number;speed:number;acceleration:number;energy:number;potential:number;mechanical:number;momentum:number;force:number;weight:number };

const allowedFunctions = new Set(["sin","cos","tan","asin","acos","atan","sqrt","abs","exp","ln","log","min","max","floor","ceil","sign"]);
const copy = {
 ID:{title:"Physimus Sandbox",subtitle:"Ruang eksperimen persamaan mekanika",hint:"Buat persamaan sendiri. Bentuk kurva atau lintasan benda, jalankan waktu, dan amati besaran fisik yang muncul.",math:"Ekspresi matematika",delete:"Hapus",hide:"Sembunyikan",show:"Tampilkan",gravity:"Gravitasi",amplitude:"Amplitudo A",initialSpeed:"Kecepatan awal v₀",angularSpeed:"Kecepatan sudut ω",stiffness:"Konstanta pegas k",phase:"Sudut/fase θ (rad)",add:"Tambah persamaan",play:"Jalankan",pause:"Jeda",reset:"Reset",time:"Waktu",duration:"Durasi (s)",mass:"Massa (kg)",object:"Objek",grid:"Grid",axes:"Sumbu",trail:"Jejak",velocity:"Vektor kecepatan",acceleration:"Vektor percepatan",force:"Vektor gaya",energy:"Besaran energi",labels:"Label",view:"Rentang grafik",xmin:"x minimum",xmax:"x maksimum",ymin:"y minimum",ymax:"y maksimum",examples:"Contoh cepat",syntax:"Sintaks",syntaxText:"+, -, *, /, pangkat, tanda kurung, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Sudut dalam radian.",status:"Validasi model",ok:"Persamaan lolos uji sintaks dan kestabilan pada titik sampel. Ini belum membuktikan kesesuaian dimensi atau semua hukum fisika; pastikan model dan satuan SI konsisten.",bad:"Persamaan salah sintaks atau menghasilkan nilai tidak hingga/tidak stabil. Grafik dapat terputus.",empty:"Tambahkan persamaan di panel kiri untuk mulai menggambar.",inspector:"Arahkan kursor ke grafik untuk membaca koordinat.",motion:"Analisis gerak langsung",notMotion:"Tambahkan x(t) dan/atau y(t) untuk membentuk objek bergerak.",parametric:"Lintasan parametrik",function:"Kurva y = f(x)",particle:"Partikel",ball:"Bola",cart:"Kereta",satellite:"Satelit",rocket:"Roket",export:"Ekspor CSV",zoom:"Zoom",noBackend:"Berjalan lokal di browser; tidak ada data yang dikirim ke backend.",warning:"Turunan dihitung dengan beda hingga pusat. Pemeriksaan dimensi dan penegakan semua hukum fisika belum otomatis; periksa konsistensi satuan dan model.",tabEquations:"Persamaan",tabObjects:"Objek mekanika",tabExamples:"Contoh",tabGraph:"Grafik",variables:"Variabel persamaan",noVariables:"Variabel yang digunakan persamaan akan muncul di sini.",addObject:"Tambah objek",objectPosition:"Posisi objek",objectMass:"Massa",objectRadius:"Jari-jari / ukuran",objectSpring:"Konstanta pegas",objectAngle:"Sudut",enabled:"Tampil",objectNames:{box:"Kotak / balok",circle:"Lingkaran",spring:"Pegas",rope:"Tali",pulley:"Katrol",wheel:"Roda",beam:"Batang",ramp:"Bidang miring",pendulum:"Bandul",mass:"Balok massa"},panHint:"Seret grafik untuk menggeser. Gunakan roda mouse untuk zoom."},
 EN:{title:"Physimus Sandbox",subtitle:"A mechanics equation playground",hint:"Create your own equations. Shape a curve or an object's trajectory, run time, and inspect the physical quantities that emerge.",math:"Mathematical expressions",delete:"Delete",hide:"Hide",show:"Show",gravity:"Gravity g",amplitude:"Amplitude A",initialSpeed:"Initial speed v₀",angularSpeed:"Angular speed ω",stiffness:"Spring constant k",phase:"Angle/phase θ (rad)",add:"Add equation",play:"Run",pause:"Pause",reset:"Reset",time:"Time",duration:"Duration (s)",mass:"Mass (kg)",object:"Object",grid:"Grid",axes:"Axes",trail:"Trail",velocity:"Velocity vector",acceleration:"Acceleration vector",force:"Force vector",energy:"Energy quantities",labels:"Labels",view:"Graph range",xmin:"x minimum",xmax:"x maximum",ymin:"y minimum",ymax:"y maximum",examples:"Quick examples",syntax:"Syntax",syntaxText:"+, -, *, /, powers, parentheses, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Angles are radians.",status:"Model validation",ok:"Expressions pass syntax and numerical-stability checks at sampled points. This does not prove dimensional consistency or compliance with every physics law; check the model and SI units.",bad:"Invalid syntax or non-finite/unstable values were found. Curves may break.",empty:"Add an equation in the left panel to start plotting.",inspector:"Move the pointer over the graph to inspect coordinates.",motion:"Live motion analysis",notMotion:"Add x(t) and/or y(t) to create a moving object.",parametric:"Parametric trajectory",function:"Curve y = f(x)",particle:"Particle",ball:"Ball",cart:"Cart",satellite:"Satellite",rocket:"Rocket",export:"Export CSV",zoom:"Zoom",noBackend:"Runs locally in your browser; no data is sent to a backend.",warning:"Derivatives use central finite differences. Dimensional analysis and enforcement of all physics laws are not automatic; check model and unit consistency.",tabEquations:"Equations",tabObjects:"Mechanics objects",tabExamples:"Examples",tabGraph:"Graph",variables:"Equation variables",noVariables:"Variables used in the equations will appear here.",addObject:"Add object",objectPosition:"Object position",objectMass:"Mass",objectRadius:"Radius / size",objectSpring:"Spring constant",objectAngle:"Angle",enabled:"Visible",objectNames:{box:"Box / block",circle:"Circle",spring:"Spring",rope:"Rope",pulley:"Pulley",wheel:"Wheel",beam:"Beam",ramp:"Inclined plane",pendulum:"Pendulum",mass:"Mass block"},panHint:"Drag the graph to pan. Use the mouse wheel to zoom."}
};

function tokenize(source:string):string[] {
 const tokens:string[]=[];
 const re=/\s*([0-9]+(?:\.[0-9]*)?(?:e[+-]?[0-9]+)?|\.[0-9]+(?:e[+-]?[0-9]+)?|[a-zA-Z_][a-zA-Z0-9_]*|\*\*|[+\-*/^(),])/gy;
 let pos=0;
 while(pos<source.length){re.lastIndex=pos;const match=re.exec(source);if(!match)throw new Error("Karakter tidak dikenal: "+source[pos]);tokens.push(match[1].toLowerCase());pos=re.lastIndex;}
 const out:string[]=[];
 const isEnd=(v:string)=>/^([0-9]|\.)/.test(v)||/^[a-z_]/.test(v)||v===")";
 const isStart=(v:string)=>/^([0-9]|\.)/.test(v)||/^[a-z_]/.test(v)||v==="(";
 for(const token of tokens){const previous=out[out.length-1];const call=previous&&allowedFunctions.has(previous)&&token==="(";if(previous&&isEnd(previous)&&isStart(token)&&!call)out.push("*");out.push(token==="**"?"^":token);}
 return out;
}
function parse(source:string):Node {
 const tokens=tokenize(source);let i=0;const peek=()=>tokens[i];const take=()=>tokens[i++];
 const need=(token:string)=>{if(take()!==token)throw new Error("Diharapkan "+token);};
 const primary=():Node=>{
  const token=take();if(!token)throw new Error("Ekspresi belum lengkap");
  if(token==="("){const n=add();need(")");return n;}
  if(/^([0-9]|\.)/.test(token))return {kind:"num",n:Number(token)};
  if(/^[a-z_]/.test(token)){
   if(allowedFunctions.has(token)){need("(");const args:Node[]=[];if(peek()!==")"){args.push(add());while(peek()===","){take();args.push(add());}}need(")");if((token==="min"||token==="max")?args.length<2:args.length!==1)throw new Error("Jumlah argumen "+token+" tidak sesuai");return {kind:"call",name:token,args};}
   return {kind:"var",name:token};
  }
  throw new Error("Token tidak valid: "+token);
 };
 const power=():Node=>{const a=primary();if(peek()==="^"){take();return {kind:"binary",op:"^",a,b:unary()};}return a;};
 const unary=():Node=>{if(peek()==="+"||peek()==="-"){const op=take();return {kind:"unary",op,child:unary()};}return power();};
 const mul=():Node=>{let n=unary();while(peek()==="*"||peek()==="/"){const op=take();n={kind:"binary",op,a:n,b:unary()};}return n;};
 const add=():Node=>{let n=mul();while(peek()==="+"||peek()==="-"){const op=take();n={kind:"binary",op,a:n,b:mul()};}return n;};
 const root=add();if(i!==tokens.length)throw new Error("Bagian ekspresi tidak terbaca");return root;
}
function calc(n:Node,v:Vars):number {
 if(n.kind==="num")return n.n;
 if(n.kind==="var")return n.name==="pi"?Math.PI:n.name==="e"?Math.E:(v[n.name]??Number.NaN);
 if(n.kind==="unary"){const q=calc(n.child,v);return n.op==="-"?-q:q;}
 if(n.kind==="binary"){const a=calc(n.a,v),b=calc(n.b,v);if(n.op==="+")return a+b;if(n.op==="-")return a-b;if(n.op==="*")return a*b;if(n.op==="/")return b===0?NaN:a/b;return Math.pow(a,b);}
 const a=n.args.map(x=>calc(x,v)),q=a[0];
 switch(n.name){case "sin":return Math.sin(q);case "cos":return Math.cos(q);case "tan":return Math.tan(q);case "asin":return Math.asin(q);case "acos":return Math.acos(q);case "atan":return Math.atan(q);case "sqrt":return Math.sqrt(q);case "abs":return Math.abs(q);case "exp":return Math.exp(q);case "ln":return Math.log(q);case "log":return Math.log10(q);case "min":return Math.min(...a);case "max":return Math.max(...a);case "floor":return Math.floor(q);case "ceil":return Math.ceil(q);case "sign":return Math.sign(q);default:return NaN;}
}
function compile(rows:Row[]):Compiled[]{
 return rows.filter(r=>r.enabled&&r.text.trim()).map(row=>{
  try{const m=row.text.trim().match(/^(y\s*\(x\)\s*=|y\s*=|x\s*\(t\)\s*=|y\s*\(t\)\s*=)\s*(.+)$/i);if(!m)throw new Error("Gunakan y=..., x(t)=..., atau y(t)=...");const lhs=m[1].replace(/\s/g,"").toLowerCase();return {id:row.id,text:row.text,target:lhs==="x(t)="?"x(t)":lhs==="y(t)="?"y(t)":"y(x)",root:parse(m[2])};}
  catch(e){return {id:row.id,text:row.text,target:"y(x)" as const,root:{kind:"num",n:0} as Node,error:e instanceof Error?e.message:"Syntax error"};}
 });
}
function collectVariables(node:Node,result:Set<string>){
 if(node.kind==="var"){result.add(node.name);return;}
 if(node.kind==="unary"){collectVariables(node.child,result);return;}
 if(node.kind==="binary"){collectVariables(node.a,result);collectVariables(node.b,result);return;}
 if(node.kind==="call")node.args.forEach(child=>collectVariables(child,result));
}
function variableDefaults(name:string){
 const defaults:Record<string,number>={m:1,g:9.81,a:2,v0:5,omega:1,k:10,theta:Math.PI/4,r:3,e:1,mu:.2,F:10,h:2};
 return defaults[name]??1;
}
function variableDescription(name:string,language:Language){
 const labels:Record<string,{id:string;en:string;unit:string}>={m:{id:"Massa",en:"Mass",unit:"kg"},g:{id:"Gravitasi",en:"Gravity",unit:"m/s²"},a:{id:"Amplitudo / percepatan",en:"Amplitude / acceleration",unit:"m atau m/s²"},v0:{id:"Kecepatan awal",en:"Initial velocity",unit:"m/s"},omega:{id:"Kecepatan sudut",en:"Angular velocity",unit:"rad/s"},k:{id:"Konstanta pegas",en:"Spring constant",unit:"N/m"},theta:{id:"Sudut / fase",en:"Angle / phase",unit:"rad"},r:{id:"Jari-jari",en:"Radius",unit:"m"},e:{id:"Restitusi",en:"Restitution",unit:"—"},mu:{id:"Koefisien gesek",en:"Friction coefficient",unit:"—"},F:{id:"Gaya",en:"Force",unit:"N"},h:{id:"Ketinggian",en:"Height",unit:"m"}};
 const item=labels[name];
 return item?{label:language==="ID"?item.id:item.en,unit:item.unit}:{label:name,unit:language==="ID"?"nilai bebas":"custom"};
}

function motionAt(list:Compiled[],t:number,vars:Vars):Motion|null {
 const m=vars.m;
 const fx=list.find(q=>q.target==="x(t)"&&!q.error),fy=list.find(q=>q.target==="y(t)"&&!q.error);if(!fx&&!fy)return null;
 const at=(time:number)=>({x:fx?calc(fx.root,{...vars,x:0,t:time}):time,y:fy?calc(fy.root,{...vars,x:0,t:time}):0});
 const h=.001,p=at(t),a=at(t-h),b=at(t+h);const vx=(b.x-a.x)/(2*h),vy=(b.y-a.y)/(2*h),ax=(b.x-2*p.x+a.x)/(h*h),ay=(b.y-2*p.y+a.y)/(h*h);
 const energy=.5*m*(vx*vx+vy*vy),potential=m*vars.g*p.y;
 const result={x:p.x,y:p.y,vx,vy,ax,ay,speed:Math.hypot(vx,vy),acceleration:Math.hypot(ax,ay),energy,potential,mechanical:energy+potential,momentum:m*Math.hypot(vx,vy),force:m*Math.hypot(ax,ay),weight:m*vars.g};
 return Object.values(result).every(Number.isFinite)&&Object.values(result).every(q=>Math.abs(q)<1e6)?result:null;
}
function arrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,label?:string){const a=Math.atan2(y2-y1,x2-x1);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.7;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-10*Math.cos(a-.45),y2-10*Math.sin(a-.45));ctx.lineTo(x2-10*Math.cos(a+.45),y2-10*Math.sin(a+.45));ctx.closePath();ctx.fill();if(label){ctx.font="700 13px DM Sans";ctx.lineWidth=3;ctx.strokeStyle=getComputedStyle(ctx.canvas).getPropertyValue("--plot-bg").trim()||"#fff";ctx.strokeText(label,x2+7,y2-7);ctx.fillStyle=color;ctx.fillText(label,x2+7,y2-7);}}

export default function PhysicsSandbox({language,theme,motionLevel}:{language:Language;theme:"light"|"dark";motionLevel:"low"|"medium"|"high"}){
 const w=copy[language];
 const [rows,setRows]=useState<Row[]>([{id:1,text:"",enabled:true}]);const [nextId,setNextId]=useState(2);
 const [time,setTime]=useState(0);const [duration,setDuration]=useState(12);const [mass,setMass]=useState(1);const [customVariables,setCustomVariables]=useState<Record<string,number>>({});const [gravity,setGravity]=useState(9.81);const [amplitude,setAmplitude]=useState(2);const [initialSpeed,setInitialSpeed]=useState(5);const [angularSpeed,setAngularSpeed]=useState(1);const [stiffness,setStiffness]=useState(10);const [phase,setPhase]=useState(Math.PI/4);const [playing,setPlaying]=useState(false);
 const [showGrid,setShowGrid]=useState(true);const [showAxes,setShowAxes]=useState(true);const [showTrail,setShowTrail]=useState(true);const [showVelocity,setShowVelocity]=useState(true);const [showAcceleration,setShowAcceleration]=useState(true);const [showForce,setShowForce]=useState(false);const [showWeight,setShowWeight]=useState(true);const [showMomentum,setShowMomentum]=useState(true);const [showEnergy,setShowEnergy]=useState(true);const [showLabels,setShowLabels]=useState(true);
 const [object,setObject]=useState("particle");const [expandedMeasurements,setExpandedMeasurements]=useState<string[]>([]);const [scale,setScale]=useState(1);const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);const [view,setView]=useState({xmin:-10,xmax:10,ymin:-10,ymax:10});const [canvasSize,setCanvasSize]=useState(0);
 const [editorTab,setEditorTab]=useState<EditorTab>("equations");const [sceneObjects,setSceneObjects]=useState<MechanicalObject[]>([]);const [nextObjectId,setNextObjectId]=useState(1);const [selectedObjectId,setSelectedObjectId]=useState<number|null>(null);
 const canvasRef=useRef<HTMLCanvasElement>(null);const timeRef=useRef(0);const dragRef=useRef<{x:number;y:number;view:{xmin:number;xmax:number;ymin:number;ymax:number}}|null>(null);const dragFrameRef=useRef<number|null>(null);const cursorFrameRef=useRef<number|null>(null);const pendingViewRef=useRef<typeof view|null>(null);const pendingCursorRef=useRef<{x:number;y:number}|null>(null);
 const parsed=useMemo(()=>compile(rows),[rows]);const valid=useMemo(()=>parsed.filter(x=>!x.error),[parsed]);const errors=useMemo(()=>parsed.filter(x=>x.error),[parsed]);
 const hasMotion=valid.some(x=>x.target==="x(t)"||x.target==="y(t)");
 const usedVariables=useMemo(()=>{const result=new Set<string>();valid.forEach(item=>collectVariables(item.root,result));return Array.from(result).filter(name=>!["x","t","pi","e"].includes(name)).sort();},[valid]);
 const knownVariables=useMemo(()=>({m:mass,g:gravity,a:amplitude,v0:initialSpeed,omega:angularSpeed,k:stiffness,theta:phase}),[mass,gravity,amplitude,initialSpeed,angularSpeed,stiffness,phase]);
 const parameterSet=useMemo<Vars>(()=>({x:0,t:0,...Object.fromEntries(usedVariables.map(name=>[name,customVariables[name]??knownVariables[name as keyof typeof knownVariables]??variableDefaults(name)])),...knownVariables}),[usedVariables,customVariables,knownVariables]);
 const current=useMemo(()=>motionAt(valid,time,parameterSet),[valid,time,parameterSet]);const renderQuality=motionLevel==="low"?{fps:12,dpr:1,samples:150,trail:120}:motionLevel==="medium"?{fps:24,dpr:1.5,samples:300,trail:240}:{fps:40,dpr:2,samples:520,trail:360};const functionCurves=useMemo(()=>valid.filter(item=>item.target==="y(x)").map((item,index)=>({id:item.id,color:["#347fd5","#4da786","#d99a46","#8b6bd6"][index%4],points:Array.from({length:renderQuality.samples+1},(_,i)=>{const x=view.xmin+(view.xmax-view.xmin)*i/renderQuality.samples;return {x,y:calc(item.root,{...parameterSet,x,t:0})};})})),[valid,parameterSet,view,renderQuality.samples]);const motionTrail=useMemo(()=>hasMotion?Array.from({length:renderQuality.trail+1},(_,i)=>{const t=duration*i/renderQuality.trail,p=motionAt(valid,t,{...parameterSet,t});return p?{x:p.x,y:p.y}:{x:Number.NaN,y:Number.NaN};}):[],[hasMotion,valid,duration,parameterSet,renderQuality.trail]);
 const badSample=useMemo(()=>{for(const item of valid){for(let i=0;i<=100;i++){const q=item.target==="y(x)"?calc(item.root,{...parameterSet,x:view.xmin+(view.xmax-view.xmin)*i/100,t:0}):calc(item.root,{...parameterSet,x:0,t:duration*i/100});if(!Number.isFinite(q)||Math.abs(q)>1e6)return true;}}return false;},[valid,view,duration,parameterSet]);
 const warning=errors.length>0||badSample||(hasMotion&&!current);
 useEffect(()=>{if(!playing)return;let frame=0,last=0,lastUi=0;const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;const fps=reduced?8:renderQuality.fps;const interval=1000/fps;const tick=(now:number)=>{if(!last)last=now;const next=timeRef.current+Math.min((now-last)/1000,.05);last=now;timeRef.current=Math.min(duration,next);if(now-lastUi>=interval||next>=duration){lastUi=now;setTime(timeRef.current);}if(next>=duration){setPlaying(false);return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,duration,renderQuality.fps]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const dpr=Math.min(window.devicePixelRatio||1,renderQuality.dpr),width=rect.width,height=rect.height;const backingWidth=Math.round(width*dpr),backingHeight=Math.round(height*dpr);if(canvas.width!==backingWidth||canvas.height!==backingHeight){canvas.width=backingWidth;canvas.height=backingHeight;}ctx.setTransform(dpr,0,0,dpr,0,0);const canvasStyle=getComputedStyle(canvas),plotBg=canvasStyle.getPropertyValue("--plot-bg").trim()||(theme==="dark"?"#111d2b":"#fff"),gridMajor=canvasStyle.getPropertyValue("--plot-grid").trim()||(theme==="dark"?"#26384b":"#edf1f5"),axisColor=canvasStyle.getPropertyValue("--plot-axis").trim()||(theme==="dark"?"#70869d":"#627b94");ctx.clearRect(0,0,width,height);ctx.fillStyle=plotBg;ctx.fillRect(0,0,width,height);
  const spanX=(view.xmax-view.xmin)/scale,spanY=(view.ymax-view.ymin)/scale,mx=(view.xmax+view.xmin)/2,my=(view.ymax+view.ymin)/2,xmin=mx-spanX/2,xmax=mx+spanX/2,ymin=my-spanY/2,ymax=my+spanY/2;const left=58,right=20,top=22,bottom=40,pw=width-left-right,ph=height-top-bottom;const X=(x:number)=>left+(x-xmin)/(xmax-xmin)*pw,Y=(y:number)=>top+ph-(y-ymin)/(ymax-ymin)*ph;
  const nice=(span:number)=>{const raw=span/9,p=10**Math.floor(Math.log10(Math.max(raw,1e-9))),q=raw/p;return (q<=1?1:q<=2?2:q<=5?5:10)*p;};const dx=nice(xmax-xmin),dy=nice(ymax-ymin);
  if(showGrid){
  ctx.lineWidth=.8;ctx.strokeStyle=gridMajor;
  for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx){for(let sub=1;sub<5;sub++){const minor=x+dx*sub/5;if(minor<xmax){ctx.strokeStyle=theme==="dark"?"#1c2c3e":"#f5f7f9";ctx.beginPath();ctx.moveTo(X(minor),top);ctx.lineTo(X(minor),top+ph);ctx.stroke();}}ctx.strokeStyle=Math.abs(x)<1e-9?axisColor:gridMajor;ctx.lineWidth=Math.abs(x)<1e-9?1.3:.8;ctx.beginPath();ctx.moveTo(X(x),top);ctx.lineTo(X(x),top+ph);ctx.stroke();}
  for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy){for(let sub=1;sub<5;sub++){const minor=y+dy*sub/5;if(minor<ymax){ctx.strokeStyle=theme==="dark"?"#1c2c3e":"#f5f7f9";ctx.beginPath();ctx.moveTo(left,Y(minor));ctx.lineTo(left+pw,Y(minor));ctx.stroke();}}ctx.strokeStyle=Math.abs(y)<1e-9?axisColor:gridMajor;ctx.lineWidth=Math.abs(y)<1e-9?1.3:.8;ctx.beginPath();ctx.moveTo(left,Y(y));ctx.lineTo(left+pw,Y(y));ctx.stroke();}
}
  if(showAxes){ctx.strokeStyle=axisColor;ctx.lineWidth=1.6;if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),top);ctx.lineTo(X(0),top+ph);ctx.stroke();}if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(left,Y(0));ctx.lineTo(left+pw,Y(0));ctx.stroke();}}
  ctx.fillStyle=theme==="dark"?"#91a4b7":"#8795a5";ctx.font="12px DM Sans";ctx.textAlign="center";for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx)ctx.fillText(Number(x.toPrecision(4)).toString(),X(x),top+ph+18);ctx.textAlign="right";for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy)ctx.fillText(Number(y.toPrecision(4)).toString(),left-8,Y(y)+4);
  const drawLine=(points:{x:number;y:number}[],color:string,dashed=false)=>{ctx.beginPath();let open=false;points.forEach(p=>{if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.y)>1e6){open=false;return;}if(!open){ctx.moveTo(X(p.x),Y(p.y));open=true;}else ctx.lineTo(X(p.x),Y(p.y));});ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash(dashed?[5,6]:[]);ctx.stroke();ctx.setLineDash([]);};

  sceneObjects.filter(item=>item.enabled).forEach(item=>{
    const px=X(item.x),py=Y(item.y),radius=Math.max(6,Math.min(70,Math.abs(X(item.x+item.radius)-px)));
    ctx.save();ctx.translate(px,py);ctx.rotate(-item.angle);
    if(item.kind==="box"){
      ctx.fillStyle="#d99a46";ctx.strokeStyle=theme==="dark"?"#f1d2a4":"#94652e";ctx.lineWidth=2;
      ctx.fillRect(-radius,-radius*.72,radius*2,radius*1.44);ctx.strokeRect(-radius,-radius*.72,radius*2,radius*1.44);
      ctx.fillStyle=theme==="dark"?"#25384c":"#fff";ctx.font="600 10px DM Sans";ctx.textAlign="center";ctx.fillText(item.mass+" kg",0,4);
    }else if(item.kind==="circle"){
      ctx.fillStyle="#72a9d8";ctx.strokeStyle=theme==="dark"?"#b8d9f7":"#356e9e";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();
    }else if(item.kind==="spring"){
      const wPx=Math.max(45,radius*2),omega=Math.sqrt(item.stiffness/Math.max(item.mass,.01)),displacement=radius*.55*Math.cos(omega*time);
      const anchor=-wPx,blockX=displacement+wPx*.42;
      ctx.strokeStyle="#91a5b8";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(anchor,0);ctx.lineTo(anchor,0);
      for(let i=0;i<=12;i++){const q=i/12;const xx=anchor+(blockX-12-anchor)*q;const yy=i===0||i===12?0:(i%2===0?-1:1)*Math.min(8,radius*.22);ctx.lineTo(xx,yy);}
      ctx.stroke();ctx.fillStyle="#8b6bd6";ctx.fillRect(blockX-12,-11,24,22);ctx.strokeStyle="#fff";ctx.strokeRect(blockX-12,-11,24,22);
    }else if(item.kind==="rope"){
      const length=Math.max(45,radius*4);ctx.strokeStyle="#4da786";ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.beginPath();ctx.moveTo(-length/2,0);ctx.lineTo(length/2,0);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle="#4da786";ctx.beginPath();ctx.arc(length/2,0,4,0,Math.PI*2);ctx.fill();
    }else if(item.kind==="pulley"){
      const r=Math.max(10,radius*.7),turn=time*Math.sqrt(gravity/Math.max(item.radius,.05))+item.angle;
      ctx.strokeStyle="#8b9caf";ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#d99a46";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(turn)*r,Math.sin(turn)*r);ctx.moveTo(0,0);ctx.lineTo(-Math.cos(turn)*r,-Math.sin(turn)*r);ctx.stroke();
      ctx.fillStyle="#d99a46";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#4da786";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r,-r);ctx.lineTo(-r,-r*2.3);ctx.moveTo(r,-r);ctx.lineTo(r,-r*2.3);ctx.stroke();
    }
    ctx.restore();
    if(showLabels){ctx.fillStyle=theme==="dark"?"#d3dfeb":"#536b83";ctx.font="600 11px DM Sans";ctx.textAlign="center";ctx.fillText(item.kind+" · "+item.mass+" kg",px,py-radius-9);}
  });

  valid.filter(x=>x.target==="y(x)").forEach((item,index)=>{const pts=Array.from({length:501},(_,i)=>{const x=xmin+(xmax-xmin)*i/500;return {x,y:calc(item.root,{...parameterSet,x,t:0})};});drawLine(pts,["#347fd5","#4da786","#d99a46","#8b6bd6"][index%4]);});
  if(hasMotion){const at=(t:number)=>motionAt(valid,t,{...parameterSet,t});const all=Array.from({length:401},(_,i)=>{const p=at(duration*i/400);return p?{x:p.x,y:p.y}:{x:NaN,y:NaN};});const seen=all.filter((_,i)=>i<=Math.round(time/duration*400));drawLine(showTrail?seen:all,showTrail?"#347fd5":"#b7c9dc",!showTrail);
   if(current){const px=X(current.x),py=Y(current.y);if(showVelocity)arrow(ctx,px,py,X(current.x+current.vx*.28),Y(current.y+current.vy*.28),"#347fd5","v");if(showAcceleration)arrow(ctx,px,py,X(current.x+current.ax*.07),Y(current.y+current.ay*.07),"#d99a46","a");if(showForce)arrow(ctx,px,py,X(current.x+current.ax*mass*.07),Y(current.y+current.ay*mass*.07),"#d36f72","F");if(showWeight)arrow(ctx,px,py,X(current.x),Y(current.y-gravity*.07),"#d36f72","mg");if(showMomentum)arrow(ctx,px,py,X(current.x+current.vx*.24*mass),Y(current.y+current.vy*.24*mass),"#8b6bd6","p");
    ctx.save();ctx.translate(px,py);if(object==="cart"){ctx.fillStyle="#4d83b7";ctx.fillRect(-17,-9,34,15);ctx.fillStyle="#344b64";ctx.beginPath();ctx.arc(-10,8,4,0,Math.PI*2);ctx.arc(10,8,4,0,Math.PI*2);ctx.fill();}else if(object==="satellite"){ctx.fillStyle="#d99a46";ctx.fillRect(-7,-7,14,14);ctx.fillStyle="#8ba5bd";ctx.fillRect(-24,-5,13,10);ctx.fillRect(11,-5,13,10);}else if(object==="rocket"){ctx.fillStyle="#8b6bd6";ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(9,8);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(0,19);ctx.lineTo(4,8);ctx.fill();}else{ctx.fillStyle=object==="ball"?"#4da786":"#347fd5";ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();}ctx.restore();
    if(showLabels){ctx.fillStyle="#405a72";ctx.font="600 11px DM Sans";ctx.textAlign="left";ctx.fillText("t = "+time.toFixed(2)+" s",px+13,py-15);}
   }
  }
  ctx.fillStyle="#8292a4";ctx.font="11px DM Sans";ctx.textAlign="right";ctx.fillText("x (m)",width-18,height-12);ctx.save();ctx.translate(15,top+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("y (m)",0,0);ctx.restore();
 },[parsed,valid,view,scale,showGrid,showAxes,hasMotion,time,duration,mass,parameterSet,showTrail,showVelocity,showAcceleration,showForce,showWeight,showMomentum,gravity,showLabels,current,object,canvasSize,renderQuality.dpr,functionCurves,motionTrail]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(()=>setCanvasSize(v=>v+1));observer.observe(canvas);return()=>observer.disconnect();},[]);
 useEffect(()=>{timeRef.current=time;},[time]);
 const add=()=>{setRows(old=>[...old,{id:nextId,text:"",enabled:true}]);setNextId(v=>v+1);};
 const setVariable=(name:string,value:number)=>{
  if(!Number.isFinite(value))return;
  if(name==="m")setMass(Math.max(.01,Math.min(10000,value)));
  else if(name==="g")setGravity(Math.max(0,Math.min(1000,value)));
  else if(name==="a")setAmplitude(Math.max(-1000,Math.min(1000,value)));
  else if(name==="v0")setInitialSpeed(Math.max(-1000,Math.min(1000,value)));
  else if(name==="omega")setAngularSpeed(Math.max(-1000,Math.min(1000,value)));
  else if(name==="k")setStiffness(Math.max(0,Math.min(100000,value)));
  else if(name==="theta")setPhase(Math.max(-1000,Math.min(1000,value)));
  else setCustomVariables(old=>({...old,[name]:Math.max(-1e6,Math.min(1e6,value))}));
  reset();
 };
 const addSceneObject=(kind:ObjectKind)=>{
  const item:MechanicalObject={id:nextObjectId,kind,x:0,y:0,mass:1,radius:1,stiffness:20,angle:0,length:2,damping:.08,friction:.2,elasticity:.8,enabled:true};
  setSceneObjects(old=>[...old,item]);setSelectedObjectId(nextObjectId);setNextObjectId(value=>value+1);
 };
 const updateSceneObject=(id:number,key:keyof MechanicalObject,value:number|boolean)=>{
  setSceneObjects(old=>old.map(item=>item.id===id?{...item,[key]:value}:item));
 };
 const selectedSceneObject=sceneObjects.find(item=>item.id===selectedObjectId)??null;

 const update=(id:number,text:string)=>setRows(old=>old.map(r=>r.id===id?{...r,text}:r));
 const reset=()=>{setTime(0);timeRef.current=0;setPlaying(false);};
 const preset=(kind:string)=>{const data:Record<string,string[]>={circle:["x(t)=A*cos(omega*t)","y(t)=A*sin(omega*t)"],projectile:["x(t)=v0*cos(theta)*t","y(t)=v0*sin(theta)*t-0.5*g*t^2"],spring:["x(t)=A*cos(omega*t)","y(t)=0"],curve:["y=0.2x^2-2"]};const list=data[kind]||[];setRows(list.map((text,i)=>({id:i+1,text,enabled:true})));setNextId(list.length+1);if(kind==="circle"){setAmplitude(4);setAngularSpeed(1);}if(kind==="projectile"){setInitialSpeed(12);setPhase(Math.PI/4);setGravity(9.81);}if(kind==="spring"){setAmplitude(2);setAngularSpeed(2);}reset();};
 const updateBound=(key:"xmin"|"xmax"|"ymin"|"ymax",value:number)=>{
  if(!Number.isFinite(value))return;
  setView(old=>{
   const next={...old,[key]:Math.max(-1e6,Math.min(1e6,value))};
   if(key==="xmin"&&next.xmin>=next.xmax)next.xmin=next.xmax-1;
   if(key==="xmax"&&next.xmax<=next.xmin)next.xmax=next.xmin+1;
   if(key==="ymin"&&next.ymin>=next.ymax)next.ymin=next.ymax-1;
   if(key==="ymax"&&next.ymax<=next.ymin)next.ymax=next.ymin+1;
   return next;
  });
 };
 const zoom=(n:number)=>setScale(v=>Math.max(.2,Math.min(12,v*n)));
 const exportCsv=()=>{const lines=["t_s,x_m,y_m,vx_m_s,vy_m_s,ax_m_s2,ay_m_s2,kinetic_energy_J,potential_energy_J,mechanical_energy_J,momentum_kg_m_s,net_force_N,weight_N"];for(let i=0;i<=300;i++){const t=duration*i/300,p=motionAt(valid,t,{...parameterSet,t});lines.push([t,p?.x??"",p?.y??"",p?.vx??"",p?.vy??"",p?.ax??"",p?.ay??"",p?.energy??"",p?.potential??"",p?.mechanical??"",p?.momentum??"",p?.force??"",p?.weight??""].join(","));}const url=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="physimus-sandbox.csv";a.click();URL.revokeObjectURL(url);};
 const Toggle=({label,value,onClick}:{label:string;value:boolean;onClick:()=>void})=><button className={value?"sandbox-toggle active":"sandbox-toggle"} onClick={onClick}>{label}<span>{value?"ON":"OFF"}</span></button>;
 const mathHtml=(value:string)=>{try{return {__html:katex.renderToString(value,{throwOnError:false,strict:"ignore",trust:false})};}catch{return {__html:"<span class=\"math-render-error\">LaTeX error</span>"};}};
 return <main className="sandbox-workspace">
  <header className="sandbox-heading"><div><span className="eyebrow">PHYSIMUS / EQUATION SANDBOX</span><h1>{w.title}</h1><p>{w.hint}</p></div><div className="sandbox-heading-actions"><button className="secondary-button" onClick={exportCsv}><Download size={16}/>{w.export}</button><button className="secondary-button" onClick={()=>{setRows([{id:1,text:"",enabled:true}]);setNextId(2);reset();}}><RotateCcw size={16}/>{w.reset}</button></div></header>
  <div className="sandbox-top-tabs" role="tablist" aria-label={w.title}>
    {(["equations","objects","examples","graph"] as EditorTab[]).map(tab=><button key={tab} role="tab" aria-selected={editorTab===tab} className={editorTab===tab?"active":""} onClick={()=>setEditorTab(tab)}>{tab==="equations"?w.tabEquations:tab==="objects"?w.tabObjects:tab==="examples"?w.tabExamples:w.tabGraph}</button>)}
  </div>
  <div className="sandbox-studio">
   <aside className="sandbox-editor">
    {editorTab==="equations"&&<>
      <div className="sandbox-editor-heading"><strong>{w.math}</strong><button onClick={add}><Plus size={15}/>{w.add}</button></div>
      <div className="sandbox-equations">{rows.map((row,index)=><div className="sandbox-equation-row" key={row.id}><span>{index+1}</span><button title={row.enabled?w.hide:w.show} onClick={()=>setRows(old=>old.map(q=>q.id===row.id?{...q,enabled:!q.enabled}:q))}>{row.enabled?<Eye size={14}/>:<EyeOff size={14}/>}</button><input aria-label={"Equation "+(index+1)} value={row.text} onChange={e=>update(row.id,e.target.value)} placeholder="x(t)=A*cos(omega*t)"/><button title={w.delete} onClick={()=>setRows(old=>old.filter(q=>q.id!==row.id))}><Trash2 size={14}/></button></div>)}</div>
      <section className="sandbox-variable-panel">
        <div className="sandbox-panel-title"><strong>{w.variables}</strong><span>{usedVariables.length}</span></div>
        {usedVariables.length===0?<p className="sandbox-variable-empty">{w.noVariables}</p>:<div className="sandbox-variable-grid">{usedVariables.map(name=>{const meta=variableDescription(name,language);return <label key={name}><span>{meta.label} <code>{name}</code></span><div><input type="number" step="any" value={parameterSet[name]??variableDefaults(name)} onChange={e=>setVariable(name,Number(e.target.value))}/><small>{meta.unit}</small></div></label>;})}</div>}
        <p className="sandbox-variable-help">{language==="ID"?"Nilai variabel langsung mengubah evaluasi persamaan dan lintasan saat ini. x dan t adalah variabel independen; pi dan e adalah konstanta.":"Changing a variable recalculates the expressions and trajectory. x and t are independent variables; pi and e are constants."}</p>
      </section>
    </>}
    {editorTab==="objects"&&<>
      <div className="sandbox-editor-heading"><strong>{w.tabObjects}</strong></div>
      <p className="sandbox-section-intro">{language==="ID"?"Tambahkan alat mekanika ke bidang koordinat. Setiap benda memiliki posisi dan properti sendiri.":"Add mechanics apparatus to the coordinate plane. Each item has its own position and properties."}</p>
      <div className="sandbox-object-library">{(["box","circle","spring","rope","pulley"] as ObjectKind[]).map(kind=><button key={kind} onClick={()=>addSceneObject(kind)}><span className={"sandbox-object-icon "+kind}>{kind==="box"?"▰":kind==="circle"?"○":kind==="spring"?"∿":kind==="rope"?"⌁":"◉"}</span><strong>{w.objectNames[kind]}</strong><Plus size={14}/></button>)}</div>
      <div className="sandbox-panel-title"><strong>{language==="ID"?"Objek pada bidang":"Objects on canvas"}</strong><span>{sceneObjects.length}</span></div>
      {sceneObjects.length===0?<p className="sandbox-variable-empty">{language==="ID"?"Belum ada objek. Pilih alat di atas untuk menambahkan.":"No objects yet. Choose an item above to add it."}</p>:<>
        <div className="sandbox-object-list">{sceneObjects.map(item=><div className={item.id===selectedObjectId?"sandbox-object-item selected":"sandbox-object-item"} key={item.id}><button className="sandbox-object-select" onClick={()=>setSelectedObjectId(item.id)}><span>{w.objectNames[item.kind]}</span><small>#{item.id}</small></button><button className="sandbox-object-visibility" title={w.enabled} onClick={()=>updateSceneObject(item.id,"enabled",!item.enabled)}>{item.enabled?<Eye size={14}/>:<EyeOff size={14}/>}</button><button className="sandbox-object-remove" title={w.delete} onClick={()=>{setSceneObjects(old=>old.filter(v=>v.id!==item.id));if(selectedObjectId===item.id)setSelectedObjectId(null);}}><Trash2 size={14}/></button></div>)}</div>
        {selectedSceneObject&&<div className="sandbox-object-properties"><strong>{w.objectNames[selectedSceneObject.kind]} #{selectedSceneObject.id}</strong>
          <div className="sandbox-property-grid">
            <label>{language==="ID"?"Posisi x (m)":"Position x (m)"}<input type="number" step=".1" value={selectedSceneObject.x} onChange={e=>updateSceneObject(selectedSceneObject.id,"x",Number(e.target.value))}/></label>
            <label>{language==="ID"?"Posisi y (m)":"Position y (m)"}<input type="number" step=".1" value={selectedSceneObject.y} onChange={e=>updateSceneObject(selectedSceneObject.id,"y",Number(e.target.value))}/></label>
            <label>{w.objectMass} (kg)<input type="number" min=".01" step=".1" value={selectedSceneObject.mass} onChange={e=>updateSceneObject(selectedSceneObject.id,"mass",Math.max(.01,Number(e.target.value)||.01))}/></label>
            <label>{w.objectRadius} (m)<input type="number" min=".05" step=".1" value={selectedSceneObject.radius} onChange={e=>updateSceneObject(selectedSceneObject.id,"radius",Math.max(.05,Number(e.target.value)||.05))}/></label>
            <label>{w.objectSpring} (N/m)<input type="number" min="0" step="1" value={selectedSceneObject.stiffness} onChange={e=>updateSceneObject(selectedSceneObject.id,"stiffness",Math.max(0,Number(e.target.value)||0))}/></label>
            <label>{w.objectAngle} (°)<input type="number" step="1" value={selectedSceneObject.angle*180/Math.PI} onChange={e=>updateSceneObject(selectedSceneObject.id,"angle",Number(e.target.value)*Math.PI/180)}/></label>
          </div>
          <p>{language==="ID"?"Pegas berosilasi menggunakan √(k/m), katrol berputar mengikuti waktu simulasi. Objek lain menjadi alat bantu geometri. Properti massa/konstanta dicatat sebagai parameter benda, bukan otomatis menjadi gaya pada objek partikel.":"Springs oscillate with √(k/m); pulleys rotate with simulation time. Other items are geometric apparatus. Mass and stiffness are stored properties, not automatically coupled forces on the moving particle."}</p>
        </div>}
      </>}
    </>}
    {editorTab==="examples"&&<>
      <div className="sandbox-editor-heading"><strong>{w.examples}</strong></div>
      <p className="sandbox-section-intro">{language==="ID"?"Pilih contoh untuk memuat persamaan, variabel, dan kondisi awal.":"Load a starter model with equations, variables and initial conditions."}</p>
      <div className="sandbox-example-list">
        <button onClick={()=>preset("circle")}><strong>01 · Gerak melingkar beraturan</strong><code>x(t)=A cos(ωt), y(t)=A sin(ωt)</code></button>
        <button onClick={()=>preset("projectile")}><strong>02 · Gerak parabola</strong><code>x(t)=v₀ cos(θ)t, y(t)=v₀ sin(θ)t − ½gt²</code></button>
        <button onClick={()=>preset("spring")}><strong>03 · Osilasi harmonik</strong><code>x(t)=A cos(ωt)</code></button>
        <button onClick={()=>preset("curve")}><strong>04 · Kurva fungsi</strong><code>y = 0.2x² − 2</code></button>
      </div>
    </>}
    {editorTab==="graph"&&<>
      <div className="sandbox-editor-heading"><strong>{w.tabGraph}</strong></div>
      <div className="sandbox-viewport"><span className="eyebrow">{w.view}</span>{([["xmin",w.xmin],["xmax",w.xmax],["ymin",w.ymin],["ymax",w.ymax]] as const).map(([key,label])=><label key={key}>{label}<input type="number" value={view[key]} step="1" onChange={e=>updateBound(key,Number(e.target.value))}/></label>)}</div>
      <details className="sandbox-syntax" open><summary>{w.syntax}</summary><p>{w.syntaxText}</p><p>y=f(x), x(t)=..., y(t)=...</p></details>
      <div className="sandbox-toolbar-options">
        <Toggle label={w.grid} value={showGrid} onClick={()=>setShowGrid(v=>!v)}/>
        <Toggle label={w.axes} value={showAxes} onClick={()=>setShowAxes(v=>!v)}/>
        <Toggle label={w.trail} value={showTrail} onClick={()=>setShowTrail(v=>!v)}/>
      </div>
    </>}
    <div className="sandbox-validation"><span className="eyebrow">{w.status}</span><p className={warning?"bad":"good"}>{warning?<><AlertTriangle size={14}/>{w.bad}</>:<><Sparkles size={14}/>{w.ok}</>}</p>{errors.map(e=><small key={e.id}>{e.text}: {e.error}</small>)}{parsed.length===0&&<small>{w.empty}</small>}</div>
   </aside>   <section className="sandbox-main">
    <div className="sandbox-toolbar"><div className="sandbox-switches">
     <Toggle label={w.grid} value={showGrid} onClick={()=>setShowGrid(v=>!v)}/><Toggle label={w.axes} value={showAxes} onClick={()=>setShowAxes(v=>!v)}/><Toggle label={w.trail} value={showTrail} onClick={()=>setShowTrail(v=>!v)}/><Toggle label={w.velocity} value={showVelocity} onClick={()=>setShowVelocity(v=>!v)}/><Toggle label={w.acceleration} value={showAcceleration} onClick={()=>setShowAcceleration(v=>!v)}/><Toggle label={w.force} value={showForce} onClick={()=>setShowForce(v=>!v)}/><Toggle label={language==="ID"?"Berat":"Weight"} value={showWeight} onClick={()=>setShowWeight(v=>!v)}/><Toggle label={language==="ID"?"Momentum":"Momentum"} value={showMomentum} onClick={()=>setShowMomentum(v=>!v)}/><Toggle label={w.energy} value={showEnergy} onClick={()=>setShowEnergy(v=>!v)}/><Toggle label={w.labels} value={showLabels} onClick={()=>setShowLabels(v=>!v)}/>
    </div><div className="sandbox-zoom"><button title="Zoom in" onClick={()=>zoom(1.25)}><Plus size={15}/></button><button title="Zoom out" onClick={()=>zoom(.8)}><Minus size={15}/></button><button title="Reset zoom" onClick={()=>{setScale(1);setView({xmin:-10,xmax:10,ymin:-10,ymax:10});}}><RotateCcw size={15}/></button></div></div>
    <div className="sandbox-canvas-wrap"><canvas ref={canvasRef}
      onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={x:e.clientX,y:e.clientY,view:{...view}};}}
      onPointerMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const active=dragRef.current;if(active){const dx=e.clientX-active.x,dy=e.clientY-active.y,spanX=(active.view.xmax-active.view.xmin)/scale,spanY=(active.view.ymax-active.view.ymin)/scale,shiftX=-dx/Math.max(1,rect.width-78)*spanX,shiftY=dy/Math.max(1,rect.height-62)*spanY;setView({xmin:active.view.xmin+shiftX,xmax:active.view.xmax+shiftX,ymin:active.view.ymin+shiftY,ymax:active.view.ymax+shiftY});}
        const spanX=(view.xmax-view.xmin)/scale,spanY=(view.ymax-view.ymin)/scale,minX=(view.xmin+view.xmax)/2-spanX/2,minY=(view.ymin+view.ymax)/2-spanY/2;setCursor({x:minX+(e.clientX-rect.left-58)/Math.max(1,rect.width-78)*spanX,y:minY+spanY-(e.clientY-rect.top-22)/Math.max(1,rect.height-62)*spanY});}}
      onPointerUp={e=>{dragRef.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
      onPointerCancel={()=>{dragRef.current=null;}}
      onWheel={e=>{e.preventDefault();zoom(e.deltaY<0?1.12:.89);}}
      onPointerLeave={()=>{if(!dragRef.current)setCursor(null);}}/><span className="sandbox-canvas-badge">{hasMotion?w.parametric:w.function} · SI</span><span className="sandbox-cursor">{cursor?"x "+cursor.x.toFixed(2)+" · y "+cursor.y.toFixed(2):w.inspector}</span><span className="sandbox-pan-hint">{w.panHint}</span></div>
    <div className="sandbox-playback"><button className="play-control" disabled={!hasMotion||warning} onClick={()=>{if(time>=duration)reset();setPlaying(v=>!v);}}>{playing?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}</button><button className="reset-control" onClick={reset}><RotateCcw size={16}/></button><div className="sandbox-timeline"><div><span>{w.time}</span><strong>{time.toFixed(2)} / {duration.toFixed(1)} s</strong></div><input type="range" min="0" max={duration} step=".01" value={time} onChange={e=>{setTime(Number(e.target.value));timeRef.current=Number(e.target.value);}}/></div><label>{w.duration}<input type="number" min="1" max="120" value={duration} onChange={e=>setDuration(Math.max(1,Math.min(120,Number(e.target.value)||1)))}/></label><label>{w.mass}<input type="number" min=".01" max="10000" step=".1" value={mass} onChange={e=>setMass(Math.max(.01,Math.min(10000,Number(e.target.value)||1)))}/></label><label>{w.object}<select value={object} onChange={e=>setObject(e.target.value)}><option value="particle">{w.particle}</option><option value="ball">{w.ball}</option><option value="cart">{w.cart}</option><option value="satellite">{w.satellite}</option><option value="rocket">{w.rocket}</option></select></label></div>
    <div className="sandbox-analysis">
      <strong>{w.motion}</strong>
      {current ? (
        <div className="sandbox-analysis-grid">
          <div><span>r · Position</span><b>{current.x.toFixed(2)}, {current.y.toFixed(2)} m</b><small dangerouslySetInnerHTML={mathHtml("x(t),\\;y(t)")}/></div>
          <div><span>v · Velocity</span><b>{current.speed.toFixed(2)} m/s</b><small dangerouslySetInnerHTML={mathHtml("|\\vec v|=\\sqrt{v_x^2+v_y^2}")}/></div>
          <div><span>a · Acceleration</span><b>{current.acceleration.toFixed(2)} m/s²</b><small dangerouslySetInnerHTML={mathHtml("|\\vec a|=\\sqrt{a_x^2+a_y^2}")}/></div>
          {showEnergy && <>
            <div><span>Kinetic energy</span><b>{current.energy.toFixed(2)} J</b><small dangerouslySetInnerHTML={mathHtml("K=\\frac12m|\\vec v|^2")}/></div>
            <div><span>Gravitational potential (y = 0)</span><b>{current.potential.toFixed(2)} J</b><small dangerouslySetInnerHTML={mathHtml("U=mgy")}/></div>
            <div><span>Mechanical energy</span><b>{current.mechanical.toFixed(2)} J</b><small dangerouslySetInnerHTML={mathHtml("E_m=K+U")}/></div>
          </>}
          {showMomentum && <div><span>Momentum</span><b>{current.momentum.toFixed(2)} kg·m/s</b><small dangerouslySetInnerHTML={mathHtml("|\\vec p|=m|\\vec v|")}/></div>}
          {showForce && <div><span>Net force</span><b>{current.force.toFixed(2)} N</b><small dangerouslySetInnerHTML={mathHtml("|\\vec F|=m|\\vec a|")}/></div>}
          {showWeight && <div><span>Weight</span><b>{current.weight.toFixed(2)} N</b><small dangerouslySetInnerHTML={mathHtml("W=mg")}/></div>}
        </div>
      ) : <p className="sandbox-empty">{w.notMotion}</p>}
      <p className="sandbox-footnote">{w.warning} {w.noBackend}</p>
    </div>
   </section>
  </div>
 </main>;
}
