import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { AlertTriangle, Download, Eye, EyeOff, Minus, Pause, Play, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";

type Language = "ID" | "EN";
type Row = { id:number; text:string; enabled:boolean };
type Vars = Record<string,number>;
type EditorTab = "equations" | "objects" | "examples" | "graph";
type ObjectKind = "box" | "circle" | "spring" | "rope" | "pulley" | "wheel" | "beam" | "ramp" | "pendulum" | "mass";
type MechanicalObject = {id:number;kind:ObjectKind;x:number;y:number;mass:number;radius:number;stiffness:number;angle:number;length:number;damping:number;friction:number;elasticity:number;enabled:boolean;gravityEnabled:boolean;frictionEnabled:boolean;springEnabled:boolean;rotationEnabled:boolean;pinned:boolean;showLabel:boolean};
type Node = { kind:"num"; n:number } | { kind:"var"; name:string } | { kind:"unary"; op:string; child:Node } | { kind:"binary"; op:string; a:Node; b:Node } | { kind:"call"; name:string; args:Node[] };
type Compiled = { id:number; text:string; target:"y(x)"|"x(t)"|"y(t)"|"scalar"; root:Node; error?:string };
type Motion = { x:number;y:number;vx:number;vy:number;ax:number;ay:number;speed:number;acceleration:number;energy:number;potential:number;mechanical:number;momentum:number;force:number;weight:number };

const allowedFunctions = new Set(["sin","cos","tan","asin","acos","atan","sec","csc","cot","sinh","cosh","tanh","sqrt","abs","exp","ln","log","log2","min","max","floor","ceil","sign","int","sum","diff"]);
const copy = {
 ID:{title:"Physimus Sandbox",subtitle:"Ruang eksperimen persamaan mekanika",hint:"Buat persamaan sendiri. Bentuk kurva atau lintasan benda, jalankan waktu, dan amati besaran fisik yang muncul.",math:"Ekspresi matematika",delete:"Hapus",hide:"Sembunyikan",show:"Tampilkan",gravity:"Gravitasi",amplitude:"Amplitudo A",initialSpeed:"Kecepatan awal v₀",angularSpeed:"Kecepatan sudut ω",stiffness:"Konstanta pegas k",phase:"Sudut/fase θ (rad)",add:"Tambah persamaan",play:"Jalankan",pause:"Jeda",reset:"Reset",time:"Waktu",duration:"Durasi (s)",mass:"Massa (kg)",object:"Objek",grid:"Grid",axes:"Sumbu",trail:"Jejak",velocity:"Vektor kecepatan",acceleration:"Vektor percepatan",force:"Vektor gaya",energy:"Besaran energi",labels:"Label",view:"Rentang grafik",xmin:"x minimum",xmax:"x maksimum",ymin:"y minimum",ymax:"y maksimum",examples:"Contoh cepat",syntax:"Sintaks",syntaxText:"+, -, *, /, pangkat, tanda kurung, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Sudut dalam radian.",status:"Validasi model",ok:"Persamaan lolos uji sintaks dan kestabilan pada titik sampel. Ini belum membuktikan kesesuaian dimensi atau semua hukum fisika; pastikan model dan satuan SI konsisten.",bad:"Persamaan salah sintaks atau menghasilkan nilai tidak hingga/tidak stabil. Grafik dapat terputus.",empty:"Tambahkan persamaan di panel kiri untuk mulai menggambar.",inspector:"Arahkan kursor ke grafik untuk membaca koordinat.",motion:"Analisis gerak langsung",notMotion:"Tambahkan x(t) dan/atau y(t) untuk membentuk objek bergerak.",parametric:"Lintasan parametrik",function:"Kurva y = f(x)",particle:"Partikel",ball:"Bola",cart:"Kereta",satellite:"Satelit",rocket:"Roket",export:"Ekspor CSV",zoom:"Zoom",noBackend:"Berjalan lokal di browser; tidak ada data yang dikirim ke backend.",warning:"Turunan dihitung dengan beda hingga pusat. Pemeriksaan dimensi dan penegakan semua hukum fisika belum otomatis; periksa konsistensi satuan dan model.",tabEquations:"Persamaan",tabObjects:"Objek mekanika",tabExamples:"Contoh",tabGraph:"Grafik",variables:"Variabel persamaan",noVariables:"Variabel yang digunakan persamaan akan muncul di sini.",addObject:"Tambah objek",objectPosition:"Posisi objek",objectMass:"Massa",objectRadius:"Jari-jari / ukuran",objectSpring:"Konstanta pegas",objectAngle:"Sudut",enabled:"Tampil",objectNames:{box:"Kotak / balok",circle:"Lingkaran",spring:"Pegas",rope:"Tali",pulley:"Katrol",wheel:"Roda",beam:"Batang",ramp:"Bidang miring",pendulum:"Bandul",mass:"Balok massa"},panHint:"Seret grafik untuk menggeser. Gunakan roda mouse untuk zoom."},
 EN:{title:"Physimus Sandbox",subtitle:"A mechanics equation playground",hint:"Create your own equations. Shape a curve or an object's trajectory, run time, and inspect the physical quantities that emerge.",math:"Mathematical expressions",delete:"Delete",hide:"Hide",show:"Show",gravity:"Gravity g",amplitude:"Amplitude A",initialSpeed:"Initial speed v₀",angularSpeed:"Angular speed ω",stiffness:"Spring constant k",phase:"Angle/phase θ (rad)",add:"Add equation",play:"Run",pause:"Pause",reset:"Reset",time:"Time",duration:"Duration (s)",mass:"Mass (kg)",object:"Object",grid:"Grid",axes:"Axes",trail:"Trail",velocity:"Velocity vector",acceleration:"Acceleration vector",force:"Force vector",energy:"Energy quantities",labels:"Labels",view:"Graph range",xmin:"x minimum",xmax:"x maximum",ymin:"y minimum",ymax:"y maximum",examples:"Quick examples",syntax:"Syntax",syntaxText:"+, -, *, /, powers, parentheses, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Angles are radians.",status:"Model validation",ok:"Expressions pass syntax and numerical-stability checks at sampled points. This does not prove dimensional consistency or compliance with every physics law; check the model and SI units.",bad:"Invalid syntax or non-finite/unstable values were found. Curves may break.",empty:"Add an equation in the left panel to start plotting.",inspector:"Move the pointer over the graph to inspect coordinates.",motion:"Live motion analysis",notMotion:"Add x(t) and/or y(t) to create a moving object.",parametric:"Parametric trajectory",function:"Curve y = f(x)",particle:"Particle",ball:"Ball",cart:"Cart",satellite:"Satellite",rocket:"Rocket",export:"Export CSV",zoom:"Zoom",noBackend:"Runs locally in your browser; no data is sent to a backend.",warning:"Derivatives use central finite differences. Dimensional analysis and enforcement of all physics laws are not automatic; check model and unit consistency.",tabEquations:"Equations",tabObjects:"Mechanics objects",tabExamples:"Examples",tabGraph:"Graph",variables:"Equation variables",noVariables:"Variables used in the equations will appear here.",addObject:"Add object",objectPosition:"Object position",objectMass:"Mass",objectRadius:"Radius / size",objectSpring:"Spring constant",objectAngle:"Angle",enabled:"Visible",objectNames:{box:"Box / block",circle:"Circle",spring:"Spring",rope:"Rope",pulley:"Pulley",wheel:"Wheel",beam:"Beam",ramp:"Inclined plane",pendulum:"Pendulum",mass:"Mass block"},panHint:"Drag the graph to pan. Use the mouse wheel to zoom."}
};

function tokenize(source:string):string[] {
 const aliases:[RegExp,string][]=[[/[θϑ]/g,"theta"],[/ω/g,"omega"],[/α/g,"alpha"],[/β/g,"beta"],[/γ/g,"gamma"],[/[φϕ]/g,"phi"],[/μ/g,"mu"],[/π/g,"pi"],[/ρ/g,"rho"],[/λ/g,"lambda"],[/σ/g,"sigma"],[/[Σ∑]/g,"sum"],[/∫/g,"int"],[/[×·]/g,"*"],[/÷/g,"/"],[/−/g,"-"]];
 source=aliases.reduce((value,[pattern,replacement])=>value.replace(pattern,replacement),source);
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
   if(allowedFunctions.has(token)){need("(");const args:Node[]=[];if(peek()!==")"){args.push(add());while(peek()===","){take();args.push(add());}}need(")");const validArgs=(token==="min"||token==="max")?args.length>=2:token==="int"?(args.length===2||args.length===4):token==="sum"?args.length===4:token==="diff"?args.length===2:args.length===1;if(!validArgs)throw new Error("Jumlah argumen "+token+" tidak sesuai");if((token==="int"||token==="sum"||token==="diff")&&args[1]?.kind!=="var")throw new Error("Variabel operator harus berupa simbol, misalnya x atau i");return {kind:"call",name:token,args};}
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
 if(n.name==="int"){
  const [integrand,indexNode,lowerNode,upperNode]=n.args;
  if(indexNode.kind!=="var")return NaN;
  const lower=n.args.length===2?0:calc(lowerNode,v),upper=n.args.length===2?(v[indexNode.name]??0):calc(upperNode,v),steps=200;
  if(!Number.isFinite(lower)||!Number.isFinite(upper)||Math.abs(upper-lower)>1e6)return NaN;
  if(lower===upper)return 0;
  const dx=(upper-lower)/steps;let total=calc(integrand,{...v,[indexNode.name]:lower})+calc(integrand,{...v,[indexNode.name]:upper});
  for(let i=1;i<steps;i++){const value=calc(integrand,{...v,[indexNode.name]:lower+i*dx});if(!Number.isFinite(value)||Math.abs(value)>1e12)return NaN;total+=(i%2===0?2:4)*value;}
  return total*dx/3;
 }
 if(n.name==="sum"){
  const [expression,indexNode,lowerNode,upperNode]=n.args;
  if(indexNode.kind!=="var")return NaN;
  const lower=calc(lowerNode,v),upper=calc(upperNode,v);
  if(!Number.isFinite(lower)||!Number.isFinite(upper)||Math.abs(upper-lower)>10000)return NaN;
  const lo=Math.ceil(lower),hi=Math.floor(upper);
  if(hi<lo)return 0;
  if(hi-lo>10000)return NaN;
  let total=0;for(let i=lo;i<=hi;i++){const value=calc(expression,{...v,[indexNode.name]:i});if(!Number.isFinite(value))return NaN;total+=value;}
  return total;
 }
 if(n.name==="diff"){
  const [expression,indexNode]=n.args;if(indexNode.kind!=="var")return NaN;
  const at=v[indexNode.name]??0,h=1e-5*Math.max(1,Math.abs(at));
  return (calc(expression,{...v,[indexNode.name]:at+h})-calc(expression,{...v,[indexNode.name]:at-h}))/(2*h);
 }
 const a=n.args.map(x=>calc(x,v)),q=a[0];
 switch(n.name){case "sin":return Math.sin(q);case "cos":return Math.cos(q);case "tan":return Math.tan(q);case "asin":return Math.asin(q);case "acos":return Math.acos(q);case "atan":return Math.atan(q);case "sec":return 1/Math.cos(q);case "csc":return 1/Math.sin(q);case "cot":return 1/Math.tan(q);case "sinh":return Math.sinh(q);case "cosh":return Math.cosh(q);case "tanh":return Math.tanh(q);case "sqrt":return Math.sqrt(q);case "abs":return Math.abs(q);case "exp":return Math.exp(q);case "ln":return Math.log(q);case "log":return Math.log10(q);case "log2":return Math.log2(q);case "min":return Math.min(...a);case "max":return Math.max(...a);case "floor":return Math.floor(q);case "ceil":return Math.ceil(q);case "sign":return Math.sign(q);default:return NaN;}
}
function compile(rows:Row[]):Compiled[]{
 return rows.filter(r=>r.enabled&&r.text.trim()).map(row=>{
  try{
   const source=row.text.trim();
   const graph=source.match(/^(y\s*\(x\)\s*=|y\s*=|x\s*\(t\)\s*=|y\s*\(t\)\s*=)\s*(.+)$/i);
   if(graph){
    const lhs=graph[1].replace(/\s/g,"").toLowerCase();
    return {id:row.id,text:row.text,target:lhs==="x(t)="?"x(t)":lhs==="y(t)="?"y(t)":"y(x)",root:parse(graph[2])};
   }
   const scalar=source.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
   if(scalar)return {id:row.id,text:row.text,target:"scalar" as const,root:parse(scalar[2])};
   throw new Error("Gunakan y=..., x(t)=..., y(t)=..., atau persamaan skalar seperti F=ma");
  }catch(e){return {id:row.id,text:row.text,target:"scalar" as const,root:{kind:"num",n:0} as Node,error:e instanceof Error?e.message:"Syntax error"};}
 });
}
function collectVariables(node:Node,result:Set<string>){
 if(node.kind==="var"){result.add(node.name);return;}
 if(node.kind==="unary"){collectVariables(node.child,result);return;}
 if(node.kind==="binary"){collectVariables(node.a,result);collectVariables(node.b,result);return;}
 if(node.kind==="call"){if(["int","sum","diff"].includes(node.name)&&node.args[1]?.kind==="var"){collectVariables(node.args[0],result);node.args.slice(2).forEach(child=>collectVariables(child,result));return;}node.args.forEach(child=>collectVariables(child,result));}
}
function variableDefaults(name:string){
 const defaults:Record<string,number>={m:1,g:9.81,a:2,v0:5,omega:1,k:10,theta:Math.PI/4,r:3,e:1,mu:.2,f:10,h:2,sigma:1,alpha:1,beta:1,phi:0,lambda:1};
 return defaults[name]??1;
}
function variableDescription(name:string,language:Language){
 const labels:Record<string,{id:string;en:string;unit:string}>={m:{id:"Massa",en:"Mass",unit:"kg"},g:{id:"Gravitasi",en:"Gravity",unit:"m/s²"},a:{id:"Amplitudo / percepatan",en:"Amplitude / acceleration",unit:"m atau m/s²"},v0:{id:"Kecepatan awal",en:"Initial velocity",unit:"m/s"},omega:{id:"Kecepatan sudut",en:"Angular velocity",unit:"rad/s"},k:{id:"Konstanta pegas",en:"Spring constant",unit:"N/m"},theta:{id:"Sudut / fase",en:"Angle / phase",unit:"rad"},r:{id:"Jari-jari",en:"Radius",unit:"m"},e:{id:"Restitusi",en:"Restitution",unit:"—"},mu:{id:"Koefisien gesek",en:"Friction coefficient",unit:"—"},f:{id:"Gaya",en:"Force",unit:"N"},h:{id:"Ketinggian",en:"Height",unit:"m"}};
 const item=labels[name];
 return item?{label:language==="ID"?item.id:item.en,unit:item.unit}:{label:name,unit:language==="ID"?"nilai bebas":"custom"};
}


function variableLatex(name:string){
 const greek:Record<string,string>={theta:"\\theta",omega:"\\omega",alpha:"\\alpha",beta:"\\beta",gamma:"\\gamma",phi:"\\phi",mu:"\\mu",pi:"\\pi",sigma:"\\sigma",rho:"\\rho",lambda:"\\lambda"};
 if(greek[name])return greek[name];
 const sub=name.match(/^([a-zA-Z]+)(?:_|)([0-9]+)$/);
 if(sub)return sub[1]+"_{"+sub[2]+"}";
 const symbolSub=name.match(/^([a-zA-Z]+)_([a-zA-Z0-9]+)$/);
 if(symbolSub)return symbolSub[1]+"_{"+symbolSub[2]+"}";
 return name.length===1?name:"\\mathrm{"+name+"}";
}
function equationToLatex(source:string){
 const clean=source.trim();
 const target=clean.match(/^(y\s*\(x\)\s*=|y\s*=|x\s*\(t\)\s*=|y\s*\(t\)\s*=)\s*(.+)$/i);
 const assignment=!target?clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*(?:\s*\([^)]*\))?)\s*=\s*(.+)$/):null;
 const lhs=target?target[1].replace(/\s/g,"").replace(/([xy])\(/g,"$1\\left(").replace(/\)/g,"\\right)"):assignment?variableLatex(assignment[1].replace(/\s/g,""))+"=":"";
 const expression=target?target[2]:assignment?assignment[2]:clean;
 const root=parse(expression);
 const render=(node:Node):string=>{
  if(node.kind==="num")return String(node.n);
  if(node.kind==="var")return variableLatex(node.name);
  if(node.kind==="unary")return node.op==="-"?"-\\left("+render(node.child)+"\\right)":render(node.child);
  if(node.kind==="binary"){
   if(node.op==="/")return "\\frac{"+render(node.a)+"}{"+render(node.b)+"}";
   if(node.op==="^")return "{"+render(node.a)+"}^{"+render(node.b)+"}";
   if(node.op==="*")return render(node.a)+"\\,\\cdot\\,"+render(node.b);
   return "\\left("+render(node.a)+node.op+render(node.b)+"\\right)";
  }
  const name=node.name;
  if(name==="sqrt")return "\\sqrt{"+render(node.args[0])+"}";
  if(name==="abs")return "\\left|"+render(node.args[0])+"\\right|";
  if(name==="int"){
   const variable=variableLatex((node.args[1] as Extract<Node,{kind:"var"}>).name);
   return node.args.length===2?"\\int "+render(node.args[0])+"\\,d"+variable:"\\int_{"+render(node.args[2])+"}^{"+render(node.args[3])+"} "+render(node.args[0])+"\\,d"+variable;
  }
  if(name==="sum"){
   const variable=variableLatex((node.args[1] as Extract<Node,{kind:"var"}>).name);
   return "\\sum_{"+variable+"="+render(node.args[2])+"}^{"+render(node.args[3])+"} "+render(node.args[0]);
  }
  if(name==="diff"){
   const variable=variableLatex((node.args[1] as Extract<Node,{kind:"var"}>).name);
   return "\\frac{d}{d"+variable+"}\\left("+render(node.args[0])+"\\right)";
  }
  const operators:Record<string,string>={sin:"\\sin",cos:"\\cos",tan:"\\tan",asin:"\\arcsin",acos:"\\arccos",atan:"\\arctan",sec:"\\sec",csc:"\\csc",cot:"\\cot",sinh:"\\sinh",cosh:"\\cosh",tanh:"\\tanh",ln:"\\ln",log:"\\log",log2:"\\log_2",exp:"\\exp",min:"\\min",max:"\\max"};
  return (operators[name]??("\\operatorname{"+name+"}"))+"\\left("+node.args.map(render).join(", ")+"\\right)";
 };
 return lhs+render(root);
}
function equationPreviewHtml(source:string){
 try{return katex.renderToString(equationToLatex(source),{throwOnError:false,strict:"ignore",trust:false,displayMode:true});}
 catch{return katex.renderToString("\\text{Complete expression to preview}",{throwOnError:false,strict:"ignore",trust:false,displayMode:true});}
}

type EquationSuggestion={title:string;description:string;insert:string;trigger:string};
function equationSuggestions(source:string,language:Language):EquationSuggestion[]{
 const match=source.match(/([a-zA-Z]+)$/);if(!match)return [];
 const token=match[1].toLowerCase(),labels=language==="ID";
 const catalog:Record<string,EquationSuggestion[]> = {
  int:[
   {title:labels?"Integral tak tentu":"Indefinite integral",description:"\\\\int f(x)\\\\,dx",insert:"int(x^2, x)",trigger:token},
   {title:labels?"Integral tentu":"Definite integral",description:"\\\\int_a^b f(x)\\\\,dx",insert:"int(x^2, x, 0, 1)",trigger:token}
  ],
  sum:[{title:labels?"Notasi sigma / jumlah":"Sigma summation",description:"\\\\sum_{i=1}^{n}f(i)",insert:"sum(i^2, i, 1, 5)",trigger:token}],
  sigma:[{title:labels?"Huruf sigma":"Greek sigma",description:"\\\\sigma",insert:"sigma",trigger:token},{title:labels?"Operator jumlah":"Summation operator",description:"\\\\sum",insert:"sum(i^2, i, 1, 5)",trigger:token}],
  theta:[{title:labels?"Huruf theta":"Greek theta",description:"\\\\theta",insert:"theta",trigger:token}],
  omega:[{title:labels?"Huruf omega":"Greek omega",description:"\\\\omega",insert:"omega",trigger:token}],
  alpha:[{title:labels?"Huruf alpha":"Greek alpha",description:"\\\\alpha",insert:"alpha",trigger:token}],
  beta:[{title:labels?"Huruf beta":"Greek beta",description:"\\\\beta",insert:"beta",trigger:token}],
  pi:[{title:labels?"Konstanta pi":"Pi constant",description:"\\\\pi",insert:"pi",trigger:token}],
  diff:[{title:labels?"Turunan numerik":"Numerical derivative",description:"\\\\frac{d}{dx}f(x)",insert:"diff(x^2, x)",trigger:token}],
  sqrt:[{title:labels?"Akar kuadrat":"Square root",description:"\\\\sqrt{x}",insert:"sqrt(x)",trigger:token}]
 };
 return catalog[token]??[];
}
function acceptSuggestion(source:string,suggestion:EquationSuggestion){
 return source.replace(new RegExp(suggestion.trigger+"$","i"),suggestion.insert);
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

export default function PhysicsSandbox({language,theme,motionLevel,renderMode}:{language:Language;theme:"light"|"dark";motionLevel:"low"|"medium"|"high";renderMode:"auto"|"performance"|"detail"}){
 const w=copy[language];
 const [rows,setRows]=useState<Row[]>([{id:1,text:"",enabled:true}]);const [nextId,setNextId]=useState(2);
 const [time,setTime]=useState(0);const [duration,setDuration]=useState(12);const [mass,setMass]=useState(1);const [customVariables,setCustomVariables]=useState<Record<string,number>>({});const [gravity,setGravity]=useState(9.81);const [amplitude,setAmplitude]=useState(2);const [initialSpeed,setInitialSpeed]=useState(5);const [angularSpeed,setAngularSpeed]=useState(1);const [stiffness,setStiffness]=useState(10);const [phase,setPhase]=useState(Math.PI/4);const [playing,setPlaying]=useState(false);
 const [showGrid,setShowGrid]=useState(true);const [showAxes,setShowAxes]=useState(true);const [showTrail,setShowTrail]=useState(true);const [showVelocity,setShowVelocity]=useState(true);const [showAcceleration,setShowAcceleration]=useState(true);const [showForce,setShowForce]=useState(false);const [showWeight,setShowWeight]=useState(true);const [showMomentum,setShowMomentum]=useState(true);const [showEnergy,setShowEnergy]=useState(true);const [showLabels,setShowLabels]=useState(true);
 const [object,setObject]=useState("particle");const [expandedMeasurements,setExpandedMeasurements]=useState<string[]>([]);const [scale,setScale]=useState(1);const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);const [view,setView]=useState({xmin:-10,xmax:10,ymin:-10,ymax:10});const [canvasSize,setCanvasSize]=useState(0);
 const [editorTab,setEditorTab]=useState<EditorTab>("equations");const [focusedEquationId,setFocusedEquationId]=useState(1);const [sceneObjects,setSceneObjects]=useState<MechanicalObject[]>([]);const [nextObjectId,setNextObjectId]=useState(1);const [selectedObjectId,setSelectedObjectId]=useState<number|null>(null);
 const canvasRef=useRef<HTMLCanvasElement>(null);const objectPropertiesRef=useRef<HTMLDivElement>(null);const timeRef=useRef(0);const dragRef=useRef<{x:number;y:number;view:{xmin:number;xmax:number;ymin:number;ymax:number}}|null>(null);const dragFrameRef=useRef<number|null>(null);const cursorFrameRef=useRef<number|null>(null);const pendingViewRef=useRef<typeof view|null>(null);const pendingCursorRef=useRef<{x:number;y:number}|null>(null);
 const parsed=useMemo(()=>compile(rows),[rows]);const valid=useMemo(()=>parsed.filter(x=>!x.error),[parsed]);const errors=useMemo(()=>parsed.filter(x=>x.error),[parsed]);
 const hasMotion=valid.some(x=>x.target==="x(t)"||x.target==="y(t)");
 const usedVariables=useMemo(()=>{const result=new Set<string>();valid.forEach(item=>collectVariables(item.root,result));return Array.from(result).filter(name=>!["x","t","pi","e"].includes(name)).sort();},[valid]);
 const knownVariables=useMemo(()=>({m:mass,g:gravity,a:amplitude,v0:initialSpeed,omega:angularSpeed,k:stiffness,theta:phase}),[mass,gravity,amplitude,initialSpeed,angularSpeed,stiffness,phase]);
 const parameterSet=useMemo<Vars>(()=>({x:0,t:0,...Object.fromEntries(usedVariables.map(name=>[name,customVariables[name]??knownVariables[name as keyof typeof knownVariables]??variableDefaults(name)])),...knownVariables}),[usedVariables,customVariables,knownVariables]);
  const scalarResults=useMemo(()=>valid.filter(item=>item.target==="scalar").map(item=>({id:item.id,value:calc(item.root,parameterSet)})),[valid,parameterSet]);
 const current=useMemo(()=>motionAt(valid,time,parameterSet),[valid,time,parameterSet]);const constrainedDevice=typeof navigator!=="undefined"&&((Number((navigator as Navigator&{deviceMemory?:number}).deviceMemory)||8)<=4||(navigator.hardwareConcurrency||8)<=4);const effectiveMotionLevel=constrainedDevice&&motionLevel==="high"?"medium":motionLevel;const motionBudget=effectiveMotionLevel==="low"?{fps:12,trail:120}:effectiveMotionLevel==="medium"?{fps:24,trail:240}:{fps:40,trail:360};const renderQuality={...motionBudget,dpr:renderMode==="performance"?1:renderMode==="detail"?(constrainedDevice?1.5:2):effectiveMotionLevel==="low"?1:effectiveMotionLevel==="medium"?1.25:1.5,samples:renderMode==="performance"?120:renderMode==="detail"?(constrainedDevice?360:520):effectiveMotionLevel==="low"?150:effectiveMotionLevel==="medium"?260:400};const functionCurves=useMemo(()=>{const halfSpan=(view.xmax-view.xmin)/(2*scale),mid=(view.xmin+view.xmax)/2,lo=mid-halfSpan,hi=mid+halfSpan;return valid.filter(item=>item.target==="y(x)").map((item,index)=>({id:item.id,color:["#347fd5","#4da786","#d99a46","#8b6bd6"][index%4],points:Array.from({length:renderQuality.samples+1},(_,i)=>{const x=lo+(hi-lo)*i/renderQuality.samples;return {x,y:calc(item.root,{...parameterSet,x,t:0})};})}));},[valid,parameterSet,view,scale,renderQuality.samples]);const motionTrail=useMemo(()=>hasMotion?Array.from({length:renderQuality.trail+1},(_,i)=>{const t=duration*i/renderQuality.trail,p=motionAt(valid,t,{...parameterSet,t});return p?{x:p.x,y:p.y}:{x:Number.NaN,y:Number.NaN};}):[],[hasMotion,valid,duration,parameterSet,renderQuality.trail]);
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
    ctx.save();ctx.translate(px,py);ctx.rotate(-item.angle);ctx.shadowColor=theme==="dark"?"#00000088":"#32465a33";ctx.shadowBlur=9;ctx.shadowOffsetY=3;
    if(item.kind==="box"){
      ctx.fillStyle="#d99a46";ctx.strokeStyle=theme==="dark"?"#f1d2a4":"#94652e";ctx.lineWidth=2;
      ctx.fillRect(-radius,-radius*.72,radius*2,radius*1.44);ctx.strokeRect(-radius,-radius*.72,radius*2,radius*1.44);
      ctx.fillStyle=theme==="dark"?"#25384c":"#fff";ctx.font="600 10px DM Sans";ctx.textAlign="center";ctx.fillText(item.mass+" kg",0,4);
    }else if(item.kind==="circle"){
      ctx.fillStyle="#72a9d8";ctx.strokeStyle=theme==="dark"?"#b8d9f7":"#356e9e";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();
    }else if(item.kind==="spring"){
      const wPx=Math.max(45,item.length*radius),omega=Math.sqrt(item.stiffness/Math.max(item.mass,.01)),damping=item.frictionEnabled?item.damping:0,displacement=item.springEnabled?radius*.55*Math.exp(-damping*time)*Math.cos(omega*time):0;
      const anchor=-wPx,blockX=displacement+wPx*.42;
      ctx.strokeStyle="#91a5b8";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(anchor,0);ctx.lineTo(anchor,0);
      for(let i=0;i<=12;i++){const q=i/12;const xx=anchor+(blockX-12-anchor)*q;const yy=i===0||i===12?0:(i%2===0?-1:1)*Math.min(8,radius*.22);ctx.lineTo(xx,yy);}
      ctx.stroke();ctx.fillStyle="#8b6bd6";ctx.fillRect(blockX-12,-11,24,22);ctx.strokeStyle="#fff";ctx.strokeRect(blockX-12,-11,24,22);
    }else if(item.kind==="rope"){
      const length=Math.max(45,item.length*radius);ctx.strokeStyle="#4da786";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-length/2,0);ctx.quadraticCurveTo(0,Math.max(5,item.damping*radius*1.8),length/2,0);ctx.stroke();
      ctx.fillStyle="#4da786";ctx.beginPath();ctx.arc(length/2,0,4,0,Math.PI*2);ctx.fill();
    }else if(item.kind==="pulley"){
      const r=Math.max(10,radius*.7),turn=(item.rotationEnabled?time*Math.sqrt((item.gravityEnabled?gravity:0)/Math.max(item.radius,.05)):0)+item.angle;
      ctx.strokeStyle="#8b9caf";ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#d99a46";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(turn)*r,Math.sin(turn)*r);ctx.moveTo(0,0);ctx.lineTo(-Math.cos(turn)*r,-Math.sin(turn)*r);ctx.stroke();
      ctx.fillStyle="#d99a46";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#4da786";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r,-r);ctx.lineTo(-r,-r*2.3);ctx.moveTo(r,-r);ctx.lineTo(r,-r*2.3);ctx.stroke();
    }else if(item.kind==="wheel"){
      const r=Math.max(10,radius*.9),grad=ctx.createRadialGradient(-r*.3,-r*.3,2,0,0,r);grad.addColorStop(0,"#c7dced");grad.addColorStop(1,"#355e82");ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8eaac3";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle="#f1f6fb";ctx.lineWidth=2;for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.82,Math.sin(a)*r*.82);ctx.stroke();}ctx.fillStyle="#d99a46";ctx.beginPath();ctx.arc(0,0,Math.max(4,r*.14),0,Math.PI*2);ctx.fill();
    }else if(item.kind==="beam"){
      const length=Math.max(42,item.length*radius);ctx.fillStyle="#c28c51";ctx.strokeStyle="#76512e";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-length/2,-5,length,10,4);ctx.fill();ctx.stroke();ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-11,25);ctx.lineTo(11,25);ctx.closePath();ctx.fill();ctx.strokeStyle="#8b9caf";ctx.beginPath();ctx.moveTo(-length/2,15);ctx.lineTo(length/2,15);ctx.stroke();
    }else if(item.kind==="ramp"){
      const length=Math.max(42,item.length*radius),rise=Math.min(length*.8,Math.max(16,radius));ctx.fillStyle="#dbe5ef";ctx.strokeStyle="#7c91a7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-length/2,rise/2);ctx.lineTo(length/2,-rise/2);ctx.lineTo(length/2,rise/2);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle="#a9bbcc";ctx.lineWidth=1;for(let i=0;i<8;i++){const x=-length/2+i*length/8;ctx.beginPath();ctx.moveTo(x,rise/2);ctx.lineTo(Math.min(length/2,x+rise/2),Math.max(-rise/2,rise/2-(x+length/2)*rise/length));ctx.stroke();}
    }else if(item.kind==="pendulum"){
      const length=Math.max(30,item.length*radius),swing=item.angle+(item.gravityEnabled?Math.sin(time*Math.sqrt(gravity/Math.max(item.length,.1)))*.18:0),bx=Math.sin(swing)*length,by=Math.cos(swing)*length;ctx.strokeStyle="#a0afbd";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(bx,by);ctx.stroke();const grad=ctx.createRadialGradient(bx-5,by-5,2,bx,by,Math.max(9,radius*.36));grad.addColorStop(0,"#eaf3fb");grad.addColorStop(1,"#4f7ea8");ctx.fillStyle=grad;ctx.beginPath();ctx.arc(bx,by,Math.max(9,radius*.36),0,Math.PI*2);ctx.fill();ctx.strokeStyle="#d3e3f1";ctx.stroke();
    }else if(item.kind==="mass"){
      const side=Math.max(14,radius*1.25),grad=ctx.createLinearGradient(-side,-side,side,side);grad.addColorStop(0,"#8bc5b2");grad.addColorStop(1,"#276e5a");ctx.fillStyle=grad;ctx.strokeStyle="#d2eee4";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-side/2,-side/2,side,side,4);ctx.fill();ctx.stroke();ctx.fillStyle="#f4fffb";ctx.font="600 10px DM Sans";ctx.textAlign="center";ctx.fillText(item.mass+" kg",0,4);
    }
    ctx.restore();
    if(item.id===selectedObjectId){ctx.save();ctx.strokeStyle=theme==="dark"?"#9dccf5":"#347fc5";ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(px,py,radius+7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
    if(showLabels&&item.showLabel){ctx.fillStyle=theme==="dark"?"#d3dfeb":"#536b83";ctx.font="600 11px DM Sans";ctx.textAlign="center";ctx.fillText(item.kind+" · "+item.mass+" kg",px,py-radius-9);}
    if(item.pinned){ctx.fillStyle=theme==="dark"?"#d9e5f0":"#647a90";ctx.beginPath();ctx.arc(px,py-radius-22,4,0,Math.PI*2);ctx.fill();}
  });

  functionCurves.forEach(curve=>drawLine(curve.points,curve.color));
  if(hasMotion){const endIndex=Math.max(1,Math.round(time/duration*(motionTrail.length-1)));const seen=showTrail?motionTrail.slice(0,endIndex+1):motionTrail;drawLine(seen,showTrail?"#347fd5":"#b7c9dc",!showTrail);
   if(current){const px=X(current.x),py=Y(current.y);if(showVelocity)arrow(ctx,px,py,X(current.x+current.vx*.28),Y(current.y+current.vy*.28),"#347fd5","v");if(showAcceleration)arrow(ctx,px,py,X(current.x+current.ax*.07),Y(current.y+current.ay*.07),"#d99a46","a");if(showForce)arrow(ctx,px,py,X(current.x+current.ax*mass*.07),Y(current.y+current.ay*mass*.07),"#d36f72","F");if(showWeight)arrow(ctx,px,py,X(current.x),Y(current.y-gravity*.07),"#d36f72","mg");if(showMomentum)arrow(ctx,px,py,X(current.x+current.vx*.24*mass),Y(current.y+current.vy*.24*mass),"#8b6bd6","p");
    ctx.save();ctx.translate(px,py);if(object==="cart"){ctx.fillStyle="#4d83b7";ctx.fillRect(-17,-9,34,15);ctx.fillStyle="#344b64";ctx.beginPath();ctx.arc(-10,8,4,0,Math.PI*2);ctx.arc(10,8,4,0,Math.PI*2);ctx.fill();}else if(object==="satellite"){ctx.fillStyle="#d99a46";ctx.fillRect(-7,-7,14,14);ctx.fillStyle="#8ba5bd";ctx.fillRect(-24,-5,13,10);ctx.fillRect(11,-5,13,10);}else if(object==="rocket"){ctx.fillStyle="#8b6bd6";ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(9,8);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(0,19);ctx.lineTo(4,8);ctx.fill();}else{ctx.fillStyle=object==="ball"?"#4da786":"#347fd5";ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();}ctx.restore();
    if(showLabels){ctx.fillStyle="#405a72";ctx.font="600 11px DM Sans";ctx.textAlign="left";ctx.fillText("t = "+time.toFixed(2)+" s",px+13,py-15);}
   }
  }
  ctx.fillStyle="#8292a4";ctx.font="11px DM Sans";ctx.textAlign="right";ctx.fillText("x (m)",width-18,height-12);ctx.save();ctx.translate(15,top+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("y (m)",0,0);ctx.restore();
 },[parsed,valid,view,scale,showGrid,showAxes,hasMotion,time,duration,mass,parameterSet,showTrail,showVelocity,showAcceleration,showForce,showWeight,showMomentum,gravity,showLabels,current,object,canvasSize,renderQuality.dpr,functionCurves,motionTrail,sceneObjects,selectedObjectId]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(()=>setCanvasSize(v=>v+1));observer.observe(canvas);return()=>observer.disconnect();},[]);
 useEffect(()=>{timeRef.current=time;},[time]);
  useEffect(()=>{if(editorTab!=="objects"||!selectedSceneObject)return;const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;objectPropertiesRef.current?.scrollIntoView({behavior:reduced||motionLevel==="low"?"auto":"smooth",block:"nearest"});},[editorTab,selectedObjectId,motionLevel]);
 const add=()=>{setRows(old=>[...old,{id:nextId,text:"",enabled:true}]);setFocusedEquationId(nextId);setNextId(v=>v+1);};
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
  const slot=nextObjectId-1;const item:MechanicalObject={id:nextObjectId,kind,x:(slot%5)*2.2-4.4,y:-Math.floor(slot/5)*2.1,mass:1,radius:1,stiffness:20,angle:0,length:2,damping:.08,friction:.2,elasticity:.8,enabled:true,gravityEnabled:true,frictionEnabled:false,springEnabled:true,rotationEnabled:true,pinned:false,showLabel:true};
  setSceneObjects(old=>[...old,item]);setSelectedObjectId(nextObjectId);setNextObjectId(value=>value+1);
 };
 const updateSceneObject=(id:number,key:keyof MechanicalObject,value:number|boolean)=>{
  if(typeof value==="number"&&!Number.isFinite(value))return;
  const limits:Partial<Record<keyof MechanicalObject,[number,number]>>={x:[-1e4,1e4],y:[-1e4,1e4],mass:[.01,1e4],radius:[.05,100],stiffness:[0,1e5],angle:[-Math.PI*8,Math.PI*8],length:[.1,100],damping:[0,1],friction:[0,2],elasticity:[0,1]};
  const safe=typeof value==="number"&&limits[key]?[Math.max(limits[key]![0],Math.min(limits[key]![1],value))][0]:value;
  setSceneObjects(old=>old.map(item=>item.id===id?{...item,[key]:safe}:item));
 };
 const selectedSceneObject=sceneObjects.find(item=>item.id===selectedObjectId)??null;

 const update=(id:number,text:string)=>setRows(old=>old.map(r=>r.id===id?{...r,text}:r));
 const insertToken=(token:string)=>{const row=rows.find(item=>item.id===focusedEquationId)??rows[rows.length-1];if(!row)return;const trimmed=row.text.trim();const join=trimmed&&!["=","+","-","*","/","^","(",","].some(symbol=>trimmed.endsWith(symbol))?"*":"";update(row.id,row.text+join+token);setFocusedEquationId(row.id);};
 const reset=()=>{setTime(0);timeRef.current=0;setPlaying(false);};
 const preset=(kind:string)=>{
  const data:Record<string,string[]>={
   circle:["x(t)=A*cos(omega*t)","y(t)=A*sin(omega*t)"],
   projectile:["x(t)=v0*cos(theta)*t","y(t)=v0*sin(theta)*t-0.5*g*t^2"],
   spring:["x(t)=A*cos(sqrt(k/m)*t)","y(t)=0"],
   curve:["y=0.2*x^2-2"],
   mru:["x(t)=x0+v0*t","y(t)=0"],
   mrua:["x(t)=x0+v0*t+0.5*accel*t^2","y(t)=0"],
   pendulum:["x(t)=L*sin(theta*cos(sqrt(g/L)*t))","y(t)=-L*cos(theta*cos(sqrt(g/L)*t))"],
   incline:["x(t)=0.5*g*(sin(theta)-mu*cos(theta))*cos(theta)*t^2","y(t)=-0.5*g*(sin(theta)-mu*cos(theta))*sin(theta)*t^2"],
   energy:["x(t)=0.5*g*(sin(theta)-mu*cos(theta))*cos(theta)*t^2","y(t)=h-0.5*g*(sin(theta)-mu*cos(theta))*sin(theta)*t^2"],
   integral:["y=int(u^2,u,0,x)"],
   summation:["y=sum(i^2,i,1,floor(x))"],
   derivative:["y=diff(sin(x),x)"]
  };
  const list=data[kind]||[];if(!list.length)return;
  setRows(list.map((text,i)=>({id:i+1,text,enabled:true})));setNextId(list.length+1);setFocusedEquationId(1);setEditorTab("equations");setPlaying(false);setTime(0);timeRef.current=0;setCustomVariables({});
  if(kind==="circle"){setAmplitude(4);setAngularSpeed(1);}
  if(kind==="projectile"){setInitialSpeed(12);setPhase(Math.PI/4);setGravity(9.81);}
  if(kind==="spring"){setAmplitude(2);setStiffness(25);setMass(1);}
  if(kind==="mru"){setInitialSpeed(4);setCustomVariables({x0:0});}
  if(kind==="mrua"){setInitialSpeed(2);setCustomVariables({x0:0,accel:1.5});}
  if(kind==="pendulum"){setCustomVariables({l:2});setPhase(.22);setGravity(9.81);}
  if(kind==="incline"){setCustomVariables({mu:.18});setPhase(35*Math.PI/180);setGravity(9.81);}
  if(kind==="energy"){setCustomVariables({mu:.12,h:8});setPhase(Math.PI/6);setGravity(9.81);setMass(2);}
  if(kind==="integral"){setView({xmin:0,xmax:5,ymin:0,ymax:40});setScale(1);}
  if(kind==="summation"){setView({xmin:0,xmax:10,ymin:0,ymax:400});setScale(1);}
  if(kind==="derivative"){setView({xmin:-10,xmax:10,ymin:-1.5,ymax:1.5});setScale(1);}
 };
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
 const measurementFormula=(id:string)=>{
  if(!current)return "";
  const n=(v:number)=>Number.isFinite(v)?v.toFixed(2):"\\\\text{undefined}";
  const x=n(current.x),y=n(current.y),vx=n(current.vx),vy=n(current.vy),ax=n(current.ax),ay=n(current.ay),m=n(mass),g=n(gravity);
  if(id==="position")return "\\\\vec r=x\\\\hat i+y\\\\hat j=("+x+")\\\\hat i+("+y+")\\\\hat j\\\\;\\\\mathrm{m}";
  if(id==="velocity")return "v=\\\\sqrt{v_x^2+v_y^2}=\\\\sqrt{("+vx+")^2+("+vy+")^2}="+n(current.speed)+"\\\\;\\\\mathrm{m/s}";
  if(id==="acceleration")return "a=\\\\sqrt{a_x^2+a_y^2}=\\\\sqrt{("+ax+")^2+("+ay+")^2}="+n(current.acceleration)+"\\\\;\\\\mathrm{m/s^2}";
  if(id==="kinetic")return "E_k=\\\\frac12m(v_x^2+v_y^2)=\\\\frac12("+m+")[("+vx+")^2+("+vy+")^2]="+n(current.energy)+"\\\\;\\\\mathrm{J}";
  if(id==="potential")return "E_p=mgy=("+m+")("+g+")("+y+")="+n(current.potential)+"\\\\;\\\\mathrm{J}";
  if(id==="mechanical")return "E_m=E_k+E_p="+n(current.energy)+"+"+n(current.potential)+"="+n(current.mechanical)+"\\\\;\\\\mathrm{J}";
  if(id==="momentum")return "p=mv=m\\\\sqrt{v_x^2+v_y^2}=("+m+")\\\\sqrt{("+vx+")^2+("+vy+")^2}="+n(current.momentum)+"\\\\;\\\\mathrm{kg\\\\,m/s}";
  if(id==="force")return "F=ma=m\\\\sqrt{a_x^2+a_y^2}=("+m+")\\\\sqrt{("+ax+")^2+("+ay+")^2}="+n(current.force)+"\\\\;\\\\mathrm{N}";
  if(id==="weight")return "W=mg=("+m+")("+g+")="+n(current.weight)+"\\\\;\\\\mathrm{N}";
  return "";
 };
 return <main className="sandbox-workspace">
  <header className="sandbox-heading"><div><span className="eyebrow">PHYSIMUS / EQUATION SANDBOX</span><h1>{w.title}</h1><p>{w.hint}</p></div><div className="sandbox-heading-actions"><button className="secondary-button" onClick={exportCsv}><Download size={16}/>{w.export}</button><button className="secondary-button" onClick={()=>{setRows([{id:1,text:"",enabled:true}]);setNextId(2);reset();}}><RotateCcw size={16}/>{w.reset}</button></div></header>
  <div className="sandbox-top-tabs" role="tablist" aria-label={w.title}>
    {(["equations","objects","examples","graph"] as EditorTab[]).map(tab=><button key={tab} role="tab" aria-selected={editorTab===tab} className={editorTab===tab?"active":""} onClick={()=>setEditorTab(tab)}>{tab==="equations"?w.tabEquations:tab==="objects"?w.tabObjects:tab==="examples"?w.tabExamples:w.tabGraph}</button>)}
  </div>
  <div className="sandbox-studio">
   <aside className="sandbox-editor">
    {editorTab==="equations"&&<>
      <div className="sandbox-editor-heading"><strong>{w.math}</strong><button onClick={add}><Plus size={15}/>{w.add}</button></div>
      <p className="sandbox-section-intro">{language==="ID"?"Ketik seperti notasi matematika. LaTeX akan terbentuk otomatis; gunakan saran operator untuk integral, sigma, dan turunan.":"Type in mathematical notation. LaTeX is generated automatically; use operator suggestions for integrals, summation and derivatives."}</p>
      <div className="sandbox-math-palette" aria-label={language==="ID"?"Simbol matematika":"Math symbols"}>{[{label:"θ",token:"theta"},{label:"ω",token:"omega"},{label:"α",token:"alpha"},{label:"π",token:"pi"},{label:"σ",token:"sigma"},{label:"∫",token:"int(x^2, x)"},{label:"∫ₐᵇ",token:"int(x^2, x, 0, 1)"},{label:"Σ",token:"sum(i^2, i, 1, 5)"},{label:"d/dx",token:"diff(x^2, x)"},{label:"√",token:"sqrt(x)"},{label:"sin",token:"sin(x)"},{label:"cos",token:"cos(x)"},{label:"ln",token:"ln(x)"}].map(item=><button key={item.label} type="button" onClick={()=>insertToken(item.token)} title={item.token}>{item.label}</button>)}</div>
      <div className="sandbox-equations">{rows.map((row,index)=>{const suggestions=equationSuggestions(row.text,language),scalar=scalarResults.find(result=>result.id===row.id);return <div className={row.enabled?"sandbox-equation-item":"sandbox-equation-item disabled"} key={row.id}><div className="sandbox-equation-row"><span>{index+1}</span><button title={row.enabled?w.hide:w.show} onClick={()=>setRows(old=>old.map(q=>q.id===row.id?{...q,enabled:!q.enabled}:q))}>{row.enabled?<Eye size={14}/>:<EyeOff size={14}/>}</button><input aria-label={"Equation "+(index+1)} value={row.text} onFocus={()=>setFocusedEquationId(row.id)} onChange={e=>update(row.id,e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&suggestions.length){e.preventDefault();update(row.id,acceptSuggestion(row.text,suggestions[0]));}}} placeholder="x(t)=A*cos(omega*t)"/><button title={w.delete} onClick={()=>{setRows(old=>old.filter(q=>q.id!==row.id));if(focusedEquationId===row.id)setFocusedEquationId(rows.find(q=>q.id!==row.id)?.id??0);}}><Trash2 size={14}/></button></div><div className="sandbox-equation-preview"><span>{language==="ID"?"LaTeX otomatis":"Live LaTeX"}</span><div dangerouslySetInnerHTML={{__html:row.text.trim()?equationPreviewHtml(row.text):""}}/></div>{scalar&&<div className="sandbox-scalar-result"><span>{language==="ID"?"Nilai saat ini":"Current value"}</span><strong>{Number.isFinite(scalar.value)?scalar.value.toPrecision(6):"—"}</strong></div>}{suggestions.length>0&&<div className="sandbox-math-suggestions" role="listbox">{suggestions.map(item=><button type="button" key={item.title} onClick={()=>update(row.id,acceptSuggestion(row.text,item))}><span dangerouslySetInnerHTML={{__html:katex.renderToString(item.description,{throwOnError:false,strict:"ignore",trust:false})}}/><strong>{item.title}</strong><small>{item.insert}</small></button>)}</div>}</div>;})}</div>
      <section className="sandbox-variable-panel">
        <div className="sandbox-panel-title"><strong>{w.variables}</strong><span>{usedVariables.length}</span></div>
        {usedVariables.length===0?<p className="sandbox-variable-empty">{w.noVariables}</p>:<div className="sandbox-variable-grid">{usedVariables.map(name=>{const meta=variableDescription(name,language);return <label key={name}><span>{meta.label} <code>{name}</code></span><div><input type="number" step="any" value={parameterSet[name]??variableDefaults(name)} onChange={e=>setVariable(name,Number(e.target.value))}/><small>{meta.unit}</small></div></label>;})}</div>}
        <p className="sandbox-variable-help">{language==="ID"?"Nilai variabel langsung mengubah evaluasi persamaan dan lintasan saat ini. x dan t adalah variabel independen; pi dan e adalah konstanta.":"Changing a variable recalculates the expressions and trajectory. x and t are independent variables; pi and e are constants."}</p>
      </section>
    </>}
    {editorTab==="objects"&&<>
      <div className="sandbox-editor-heading"><strong>{w.tabObjects}</strong></div>
      <p className="sandbox-section-intro">{language==="ID"?"Tambahkan alat mekanika ke bidang koordinat. Setiap benda memiliki posisi dan properti sendiri.":"Add mechanics apparatus to the coordinate plane. Each item has its own position and properties."}</p>
      <div className="sandbox-object-library">{(["box","circle","spring","rope","pulley","wheel","beam","ramp","pendulum","mass"] as ObjectKind[]).map(kind=><button key={kind} onClick={()=>addSceneObject(kind)}><span className={"sandbox-object-icon "+kind}>{kind==="box"?"▰":kind==="circle"?"○":kind==="spring"?"∿":kind==="rope"?"⌁":kind==="pulley"?"◉":kind==="wheel"?"⊙":kind==="beam"?"▬":kind==="ramp"?"◢":kind==="pendulum"?"●":"▣"}</span><strong>{w.objectNames[kind]}</strong><Plus size={14}/></button>)}</div>
      <div className="sandbox-panel-title"><strong>{language==="ID"?"Objek pada bidang":"Objects on canvas"}</strong><span>{sceneObjects.length}</span></div>
      {sceneObjects.length===0?<p className="sandbox-variable-empty">{language==="ID"?"Belum ada objek. Pilih alat di atas untuk menambahkan.":"No objects yet. Choose an item above to add it."}</p>:<>
        <div className="sandbox-object-list">{sceneObjects.map(item=><div className={item.id===selectedObjectId?"sandbox-object-item selected":"sandbox-object-item"} key={item.id} onContextMenu={e=>{e.preventDefault();setSelectedObjectId(item.id);}}><button className="sandbox-object-select" onClick={()=>setSelectedObjectId(item.id)}><span>{w.objectNames[item.kind]}</span><small>#{item.id}</small></button><button className="sandbox-object-visibility" title={w.enabled} onClick={()=>updateSceneObject(item.id,"enabled",!item.enabled)}>{item.enabled?<Eye size={14}/>:<EyeOff size={14}/>}</button><button className="sandbox-object-remove" title={w.delete} onClick={()=>{setSceneObjects(old=>old.filter(v=>v.id!==item.id));if(selectedObjectId===item.id)setSelectedObjectId(null);}}><Trash2 size={14}/></button></div>)}</div>
        {selectedSceneObject&&<div className="sandbox-object-properties" ref={objectPropertiesRef}><strong>{w.objectNames[selectedSceneObject.kind]} #{selectedSceneObject.id}</strong>
          <div className="sandbox-object-switch-grid">
            <Toggle label={language==="ID"?"Tampilkan objek":"Show object"} value={selectedSceneObject.enabled} onClick={()=>updateSceneObject(selectedSceneObject.id,"enabled",!selectedSceneObject.enabled)}/>
            <Toggle label={language==="ID"?"Label nama/massa":"Name and mass label"} value={selectedSceneObject.showLabel} onClick={()=>updateSceneObject(selectedSceneObject.id,"showLabel",!selectedSceneObject.showLabel)}/>
            <Toggle label={language==="ID"?"Kunci posisi":"Pin position"} value={selectedSceneObject.pinned} onClick={()=>updateSceneObject(selectedSceneObject.id,"pinned",!selectedSceneObject.pinned)}/>
            <Toggle label={language==="ID"?"Gravitasi aktif":"Gravity enabled"} value={selectedSceneObject.gravityEnabled} onClick={()=>updateSceneObject(selectedSceneObject.id,"gravityEnabled",!selectedSceneObject.gravityEnabled)}/>
            {(selectedSceneObject.kind==="spring"||selectedSceneObject.kind==="rope")&&<Toggle label={language==="ID"?"Elemen elastis aktif":"Elastic element active"} value={selectedSceneObject.springEnabled} onClick={()=>updateSceneObject(selectedSceneObject.id,"springEnabled",!selectedSceneObject.springEnabled)}/>}
            {(selectedSceneObject.kind==="pulley"||selectedSceneObject.kind==="wheel")&&<Toggle label={language==="ID"?"Rotasi aktif":"Rotation enabled"} value={selectedSceneObject.rotationEnabled} onClick={()=>updateSceneObject(selectedSceneObject.id,"rotationEnabled",!selectedSceneObject.rotationEnabled)}/>}
            <Toggle label={language==="ID"?"Gesekan / redaman":"Friction / damping"} value={selectedSceneObject.frictionEnabled} onClick={()=>updateSceneObject(selectedSceneObject.id,"frictionEnabled",!selectedSceneObject.frictionEnabled)}/>
          </div>
          <div className="sandbox-property-grid">
            <label>{language==="ID"?"Posisi x (m)":"Position x (m)"}<input type="number" step=".1" value={selectedSceneObject.x} onChange={e=>updateSceneObject(selectedSceneObject.id,"x",Number(e.target.value))}/></label>
            <label>{language==="ID"?"Posisi y (m)":"Position y (m)"}<input type="number" step=".1" value={selectedSceneObject.y} onChange={e=>updateSceneObject(selectedSceneObject.id,"y",Number(e.target.value))}/></label>
          </div>
          <details className="sandbox-object-advanced"><summary>{language==="ID"?"Parameter numerik lanjutan":"Advanced numeric parameters"}</summary>
            <label className="sandbox-property-slider"><span>{w.objectMass} <output>{selectedSceneObject.mass.toFixed(1)} kg</output></span><input type="range" min=".1" max="50" step=".1" value={Math.min(50,selectedSceneObject.mass)} onChange={e=>updateSceneObject(selectedSceneObject.id,"mass",Number(e.target.value))}/></label>
            <label className="sandbox-property-slider"><span>{w.objectRadius} <output>{selectedSceneObject.radius.toFixed(2)} m</output></span><input type="range" min=".1" max="5" step=".05" value={Math.min(5,selectedSceneObject.radius)} onChange={e=>updateSceneObject(selectedSceneObject.id,"radius",Number(e.target.value))}/></label>
            {(selectedSceneObject.kind==="spring"||selectedSceneObject.kind==="rope")&&<label className="sandbox-property-slider"><span>{w.objectSpring} <output>{selectedSceneObject.stiffness.toFixed(0)} N/m</output></span><input type="range" min="0" max="300" step="1" value={selectedSceneObject.stiffness} onChange={e=>updateSceneObject(selectedSceneObject.id,"stiffness",Number(e.target.value))}/></label>}
            <label className="sandbox-property-slider"><span>{w.objectAngle} <output>{(selectedSceneObject.angle*180/Math.PI).toFixed(0)}°</output></span><input type="range" min="-180" max="180" step="1" value={selectedSceneObject.angle*180/Math.PI} onChange={e=>updateSceneObject(selectedSceneObject.id,"angle",Number(e.target.value)*Math.PI/180)}/></label>
            <label className="sandbox-property-slider"><span>{language==="ID"?"Panjang":"Length"} <output>{selectedSceneObject.length.toFixed(1)} m</output></span><input type="range" min=".1" max="10" step=".1" value={Math.min(10,selectedSceneObject.length)} onChange={e=>updateSceneObject(selectedSceneObject.id,"length",Number(e.target.value))}/></label>
            <label className="sandbox-property-slider"><span>{language==="ID"?"Redaman":"Damping"} <output>{selectedSceneObject.damping.toFixed(2)}</output></span><input type="range" min="0" max="1" step=".01" value={selectedSceneObject.damping} onChange={e=>updateSceneObject(selectedSceneObject.id,"damping",Number(e.target.value))}/></label>
            <label className="sandbox-property-slider"><span>{language==="ID"?"Koefisien gesek":"Friction coefficient"} <output>{selectedSceneObject.friction.toFixed(2)}</output></span><input type="range" min="0" max="1" step=".01" value={selectedSceneObject.friction} onChange={e=>updateSceneObject(selectedSceneObject.id,"friction",Number(e.target.value))}/></label>
            <label className="sandbox-property-slider"><span>{language==="ID"?"Koefisien restitusi":"Restitution coefficient"} <output>{selectedSceneObject.elasticity.toFixed(2)}</output></span><input type="range" min="0" max="1" step=".01" value={selectedSceneObject.elasticity} onChange={e=>updateSceneObject(selectedSceneObject.id,"elasticity",Number(e.target.value))}/></label>
          </details>
          <p>{language==="ID"?"Switch mengaktifkan perilaku visual objek. Parameter massa, ukuran, sudut, dan konstanta tetap dapat disetel. Properti belum menjadi constraint/gaya yang menghubungkan semua benda dalam satu solver mekanika.":"Switches control visual object behaviour. Mass, size, angle and constants remain adjustable. These properties are not yet constraints or forces in a unified multi-body mechanics solver."}</p>
        </div>}
      </>}
    </>}
    {editorTab==="examples"&&<>
      <div className="sandbox-editor-heading"><strong>{w.examples}</strong></div>
      <p className="sandbox-section-intro">{language==="ID"?"Pilih contoh untuk memuat persamaan, variabel, dan kondisi awal.":"Load a starter model with equations, variables and initial conditions."}</p>
      <div className="sandbox-example-list">
        <button onClick={()=>preset("circle")}><strong>01 · {language==="ID"?"Gerak melingkar beraturan":"Uniform circular motion"}</strong><code>x(t)=A cos(ωt), y(t)=A sin(ωt)</code></button>
        <button onClick={()=>preset("projectile")}><strong>02 · {language==="ID"?"Gerak parabola":"Projectile motion"}</strong><code>x(t)=v₀ cos(θ)t, y(t)=v₀ sin(θ)t − ½gt²</code></button>
        <button onClick={()=>preset("spring")}><strong>03 · {language==="ID"?"Osilasi harmonik pegas":"Mass–spring SHM"}</strong><code>x(t)=A cos(√(k/m)t)</code></button>
        <button onClick={()=>preset("mru")}><strong>04 · {language==="ID"?"Gerak lurus beraturan":"Uniform linear motion"}</strong><code>x(t)=x₀+v₀t</code></button>
        <button onClick={()=>preset("mrua")}><strong>05 · {language==="ID"?"Gerak lurus berubah beraturan":"Constant acceleration"}</strong><code>x(t)=x₀+v₀t+½at²</code></button>
        <button onClick={()=>preset("pendulum")}><strong>06 · {language==="ID"?"Bandul sudut kecil":"Small-angle pendulum"}</strong><code>x(t)=L sin(θ cos(√(g/L)t))</code></button>
        <button onClick={()=>preset("incline")}><strong>07 · {language==="ID"?"Balok pada bidang miring":"Block on an incline"}</strong><code>a=g(sin θ−μ cos θ)</code></button>
        <button onClick={()=>preset("energy")}><strong>08 · {language==="ID"?"Energi pada bidang miring":"Energy on an incline"}</strong><code>Eₘ=Eₖ+Eₚ</code></button>
        <button onClick={()=>preset("curve")}><strong>09 · {language==="ID"?"Kurva fungsi kuadrat":"Quadratic function"}</strong><code>y=0.2x²−2</code></button>
        <button onClick={()=>preset("integral")}><strong>10 · {language==="ID"?"Integral tentu akumulasi":"Definite integral accumulation"}</strong><code>y=∫₀ˣ u² du</code></button>
        <button onClick={()=>preset("summation")}><strong>11 · {language==="ID"?"Jumlah deret sigma":"Sigma series"}</strong><code>y=Σᵢ₌₁ⁿ i²</code></button>
        <button onClick={()=>preset("derivative")}><strong>12 · {language==="ID"?"Turunan fungsi sinus":"Derivative of sine"}</strong><code>y=d(sin x)/dx</code></button>
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
      onPointerMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const active=dragRef.current;if(active){const dx=e.clientX-active.x,dy=e.clientY-active.y,spanX=(active.view.xmax-active.view.xmin)/scale,spanY=(active.view.ymax-active.view.ymin)/scale,shiftX=-dx/Math.max(1,rect.width-78)*spanX,shiftY=dy/Math.max(1,rect.height-62)*spanY;pendingViewRef.current={xmin:active.view.xmin+shiftX,xmax:active.view.xmax+shiftX,ymin:active.view.ymin+shiftY,ymax:active.view.ymax+shiftY};if(dragFrameRef.current===null)dragFrameRef.current=requestAnimationFrame(()=>{if(pendingViewRef.current)setView(pendingViewRef.current);pendingViewRef.current=null;dragFrameRef.current=null;});}
        const spanX=(view.xmax-view.xmin)/scale,spanY=(view.ymax-view.ymin)/scale,minX=(view.xmin+view.xmax)/2-spanX/2,minY=(view.ymin+view.ymax)/2-spanY/2;pendingCursorRef.current={x:minX+(e.clientX-rect.left-58)/Math.max(1,rect.width-78)*spanX,y:minY+spanY-(e.clientY-rect.top-22)/Math.max(1,rect.height-62)*spanY};if(cursorFrameRef.current===null)cursorFrameRef.current=requestAnimationFrame(()=>{setCursor(pendingCursorRef.current);cursorFrameRef.current=null;});}}
      onPointerUp={e=>{dragRef.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
      onPointerCancel={()=>{dragRef.current=null;}}
      onContextMenu={e=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect(),spanX=(view.xmax-view.xmin)/scale,spanY=(view.ymax-view.ymin)/scale,minX=(view.xmin+view.xmax)/2-spanX/2,minY=(view.ymin+view.ymax)/2-spanY/2,worldX=minX+(e.clientX-rect.left-58)/Math.max(1,rect.width-78)*spanX,worldY=minY+spanY-(e.clientY-rect.top-22)/Math.max(1,rect.height-62)*spanY;const nearest=sceneObjects.filter(item=>item.enabled).map(item=>({item,distance:Math.hypot(item.x-worldX,item.y-worldY)})).sort((a,b)=>a.distance-b.distance)[0];if(nearest&&nearest.distance<Math.max(spanX,spanY)*.08){setSelectedObjectId(nearest.item.id);setEditorTab("objects");}}}
      onWheel={e=>{e.preventDefault();zoom(e.deltaY<0?1.12:.89);}}
      onPointerLeave={()=>{if(!dragRef.current)setCursor(null);}}/><span className="sandbox-canvas-badge">{hasMotion?w.parametric:w.function} · SI</span><span className="sandbox-cursor">{cursor?"x "+cursor.x.toFixed(2)+" · y "+cursor.y.toFixed(2):w.inspector}</span><span className="sandbox-pan-hint">{w.panHint}</span><span className="sandbox-context-hint">{language==="ID"?"Klik kanan objek untuk membuka propertinya":"Right-click an object to edit its properties"}</span></div>
    <div className="sandbox-playback"><button className="play-control" disabled={!hasMotion||warning} onClick={()=>{if(time>=duration)reset();setPlaying(v=>!v);}}>{playing?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}</button><button className="reset-control" onClick={reset}><RotateCcw size={16}/></button><div className="sandbox-timeline"><div><span>{w.time}</span><strong>{time.toFixed(2)} / {duration.toFixed(1)} s</strong></div><input type="range" min="0" max={duration} step=".01" value={time} onChange={e=>{setTime(Number(e.target.value));timeRef.current=Number(e.target.value);}}/></div><label>{w.duration}<input type="number" min="1" max="120" value={duration} onChange={e=>setDuration(Math.max(1,Math.min(120,Number(e.target.value)||1)))}/></label><label>{w.mass}<input type="number" min=".01" max="10000" step=".1" value={mass} onChange={e=>setMass(Math.max(.01,Math.min(10000,Number(e.target.value)||1)))}/></label><label>{w.object}<select value={object} onChange={e=>setObject(e.target.value)}><option value="particle">{w.particle}</option><option value="ball">{w.ball}</option><option value="cart">{w.cart}</option><option value="satellite">{w.satellite}</option><option value="rocket">{w.rocket}</option></select></label></div>
    <div className="sandbox-analysis">
      <strong>{language==="ID"?"Pengukuran langsung · klik untuk melihat persamaan":"Live measurements · click to inspect equations"}</strong>
      {current ? (
        <div className="sandbox-analysis-grid">
          <button type="button" className={expandedMeasurements.includes("position")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("position")?old.filter(id=>id!=="position"):[...old,"position"])} aria-expanded={expandedMeasurements.includes("position")}><span>{language==="ID"?"Posisi":"Position"}</span><b>{current.x.toFixed(2)}, {current.y.toFixed(2)} m</b>{expandedMeasurements.includes("position")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("position"))}/>}</button>
          <button type="button" className={expandedMeasurements.includes("velocity")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("velocity")?old.filter(id=>id!=="velocity"):[...old,"velocity"])} aria-expanded={expandedMeasurements.includes("velocity")}><span>{language==="ID"?"Kelajuan":"Speed"}</span><b>{current.speed.toFixed(2)} m/s</b>{expandedMeasurements.includes("velocity")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("velocity"))}/>}</button>
          <button type="button" className={expandedMeasurements.includes("acceleration")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("acceleration")?old.filter(id=>id!=="acceleration"):[...old,"acceleration"])} aria-expanded={expandedMeasurements.includes("acceleration")}><span>{language==="ID"?"Percepatan":"Acceleration"}</span><b>{current.acceleration.toFixed(2)} m/s²</b>{expandedMeasurements.includes("acceleration")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("acceleration"))}/>}</button>
          {showEnergy && <>
            <button type="button" className={expandedMeasurements.includes("kinetic")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("kinetic")?old.filter(id=>id!=="kinetic"):[...old,"kinetic"])} aria-expanded={expandedMeasurements.includes("kinetic")}><span>{language==="ID"?"Energi kinetik":"Kinetic energy"}</span><b>{current.energy.toFixed(2)} J</b>{expandedMeasurements.includes("kinetic")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("kinetic"))}/>}</button>
            <button type="button" className={expandedMeasurements.includes("potential")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("potential")?old.filter(id=>id!=="potential"):[...old,"potential"])} aria-expanded={expandedMeasurements.includes("potential")}><span>{language==="ID"?"Energi potensial":"Potential energy"}</span><b>{current.potential.toFixed(2)} J</b>{expandedMeasurements.includes("potential")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("potential"))}/>}</button>
            <button type="button" className={expandedMeasurements.includes("mechanical")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("mechanical")?old.filter(id=>id!=="mechanical"):[...old,"mechanical"])} aria-expanded={expandedMeasurements.includes("mechanical")}><span>{language==="ID"?"Energi mekanik":"Mechanical energy"}</span><b>{current.mechanical.toFixed(2)} J</b>{expandedMeasurements.includes("mechanical")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("mechanical"))}/>}</button>
          </>}
          {showMomentum && <button type="button" className={expandedMeasurements.includes("momentum")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("momentum")?old.filter(id=>id!=="momentum"):[...old,"momentum"])} aria-expanded={expandedMeasurements.includes("momentum")}><span>Momentum</span><b>{current.momentum.toFixed(2)} kg·m/s</b>{expandedMeasurements.includes("momentum")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("momentum"))}/>}</button>}
          {showForce && <button type="button" className={expandedMeasurements.includes("force")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("force")?old.filter(id=>id!=="force"):[...old,"force"])} aria-expanded={expandedMeasurements.includes("force")}><span>{language==="ID"?"Resultan gaya":"Net force"}</span><b>{current.force.toFixed(2)} N</b>{expandedMeasurements.includes("force")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("force"))}/>}</button>}
          {showWeight && <button type="button" className={expandedMeasurements.includes("weight")?"sandbox-measurement expanded":"sandbox-measurement"} onClick={()=>setExpandedMeasurements(old=>old.includes("weight")?old.filter(id=>id!=="weight"):[...old,"weight"])} aria-expanded={expandedMeasurements.includes("weight")}><span>{language==="ID"?"Berat":"Weight"}</span><b>{current.weight.toFixed(2)} N</b>{expandedMeasurements.includes("weight")&&<small dangerouslySetInnerHTML={mathHtml(measurementFormula("weight"))}/>}</button>}
        </div>
      ) : <p className="sandbox-empty">{w.notMotion}</p>}
      <p className="sandbox-footnote">{w.warning} {w.noBackend}</p>
    </div>
   </section>
  </div>
 </main>;
}
