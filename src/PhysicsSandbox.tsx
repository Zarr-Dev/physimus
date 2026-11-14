import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { Activity, AlertTriangle, Download, Eye, EyeOff, Grid3X3, Minus, Pause, Play, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";

type Language = "ID" | "EN";
type Row = { id:number; text:string; enabled:boolean };
type Vars = { x:number; t:number; m:number; g:number };
type Node = { kind:"num"; n:number } | { kind:"var"; name:string } | { kind:"unary"; op:string; child:Node } | { kind:"binary"; op:string; a:Node; b:Node } | { kind:"call"; name:string; args:Node[] };
type Compiled = { id:number; text:string; target:"y(x)"|"x(t)"|"y(t)"; root:Node; error?:string };
type Motion = { x:number;y:number;vx:number;vy:number;ax:number;ay:number;speed:number;acceleration:number;energy:number;momentum:number;force:number };

const allowedFunctions = new Set(["sin","cos","tan","asin","acos","atan","sqrt","abs","exp","ln","log","min","max","floor","ceil","sign"]);
const copy = {
 ID:{title:"Physimus Sandbox",subtitle:"Ruang eksperimen persamaan mekanika",hint:"Buat persamaan sendiri. Bentuk kurva atau lintasan benda, jalankan waktu, dan amati besaran fisik yang muncul.",add:"Tambah persamaan",play:"Jalankan",pause:"Jeda",reset:"Reset",time:"Waktu",duration:"Durasi (s)",mass:"Massa (kg)",object:"Objek",grid:"Grid",axes:"Sumbu",trail:"Jejak",velocity:"Vektor kecepatan",acceleration:"Vektor percepatan",force:"Vektor gaya",energy:"Besaran energi",labels:"Label",view:"Rentang grafik",xmin:"x minimum",xmax:"x maksimum",ymin:"y minimum",ymax:"y maksimum",examples:"Contoh cepat",syntax:"Sintaks",syntaxText:"+, -, *, /, pangkat, tanda kurung, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Sudut dalam radian.",status:"Validasi model",ok:"Persamaan valid pada titik sampel. Pastikan penggunaannya konsisten dengan satuan SI.",bad:"Persamaan salah sintaks atau menghasilkan nilai tidak hingga/tidak stabil. Grafik dapat terputus.",empty:"Tambahkan persamaan di panel kiri untuk mulai menggambar.",inspector:"Arahkan kursor ke grafik untuk membaca koordinat.",motion:"Analisis gerak langsung",notMotion:"Tambahkan x(t) dan/atau y(t) untuk membentuk objek bergerak.",parametric:"Lintasan parametrik",function:"Kurva y = f(x)",particle:"Partikel",ball:"Bola",cart:"Kereta",satellite:"Satelit",rocket:"Roket",export:"Ekspor CSV",zoom:"Zoom",noBackend:"Berjalan lokal di browser; tidak ada data yang dikirim ke backend.",warning:"Turunan numerik memakai beda hingga pusat. Pemeriksaan satuan otomatis belum tersedia."},
 EN:{title:"Physimus Sandbox",subtitle:"A mechanics equation playground",hint:"Create your own equations. Shape a curve or an object's trajectory, run time, and inspect the physical quantities that emerge.",add:"Add equation",play:"Run",pause:"Pause",reset:"Reset",time:"Time",duration:"Duration (s)",mass:"Mass (kg)",object:"Object",grid:"Grid",axes:"Axes",trail:"Trail",velocity:"Velocity vector",acceleration:"Acceleration vector",force:"Force vector",energy:"Energy quantities",labels:"Labels",view:"Graph range",xmin:"x minimum",xmax:"x maximum",ymin:"y minimum",ymax:"y maximum",examples:"Quick examples",syntax:"Syntax",syntaxText:"+, -, *, /, powers, parentheses, sin, cos, tan, sqrt, abs, exp, ln, log, min, max, pi, e. Angles are radians.",status:"Model validation",ok:"Expressions are valid at sampled points. Keep their use consistent with SI units.",bad:"Invalid syntax or non-finite/unstable values were found. Curves may break.",empty:"Add an equation in the left panel to start plotting.",inspector:"Move the pointer over the graph to inspect coordinates.",motion:"Live motion analysis",notMotion:"Add x(t) and/or y(t) to create a moving object.",parametric:"Parametric trajectory",function:"Curve y = f(x)",particle:"Particle",ball:"Ball",cart:"Cart",satellite:"Satellite",rocket:"Rocket",export:"Export CSV",zoom:"Zoom",noBackend:"Runs locally in your browser; no data is sent to a backend.",warning:"Numerical derivatives use central finite differences. Automatic unit checking is not available yet."}
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
   if(["x","t","m","g","pi","e"].includes(token))return {kind:"var",name:token};
   throw new Error("Variabel tidak dikenal: "+token);
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
 if(n.kind==="var")return n.name==="pi"?Math.PI:n.name==="e"?Math.E:v[n.name as keyof Vars];
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
function motionAt(list:Compiled[],t:number,m:number):Motion|null {
 const fx=list.find(q=>q.target==="x(t)"&&!q.error),fy=list.find(q=>q.target==="y(t)"&&!q.error);if(!fx&&!fy)return null;
 const at=(time:number)=>({x:fx?calc(fx.root,{x:0,t:time,m,g:9.81}):time,y:fy?calc(fy.root,{x:0,t:time,m,g:9.81}):0});
 const h=.001,p=at(t),a=at(t-h),b=at(t+h);const vx=(b.x-a.x)/(2*h),vy=(b.y-a.y)/(2*h),ax=(b.x-2*p.x+a.x)/(h*h),ay=(b.y-2*p.y+a.y)/(h*h);
 const result={x:p.x,y:p.y,vx,vy,ax,ay,speed:Math.hypot(vx,vy),acceleration:Math.hypot(ax,ay),energy:.5*m*(vx*vx+vy*vy),momentum:m*Math.hypot(vx,vy),force:m*Math.hypot(ax,ay)};
 return Object.values(result).every(Number.isFinite)&&Object.values(result).every(q=>Math.abs(q)<1e6)?result:null;
}
function arrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string){const a=Math.atan2(y2-y1,x2-x1);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-9*Math.cos(a-.45),y2-9*Math.sin(a-.45));ctx.lineTo(x2-9*Math.cos(a+.45),y2-9*Math.sin(a+.45));ctx.closePath();ctx.fill();}
function math(value:string){return katex.renderToString(value,{throwOnError:false});}

export default function PhysicsSandbox({language}:{language:Language}){
 const w=copy[language];
 const [rows,setRows]=useState<Row[]>([{id:1,text:"",enabled:true}]);const [nextId,setNextId]=useState(2);
 const [time,setTime]=useState(0);const [duration,setDuration]=useState(12);const [mass,setMass]=useState(1);const [playing,setPlaying]=useState(false);
 const [showGrid,setShowGrid]=useState(true);const [showAxes,setShowAxes]=useState(true);const [showTrail,setShowTrail]=useState(true);const [showVelocity,setShowVelocity]=useState(true);const [showAcceleration,setShowAcceleration]=useState(true);const [showForce,setShowForce]=useState(false);const [showEnergy,setShowEnergy]=useState(true);const [showLabels,setShowLabels]=useState(true);
 const [object,setObject]=useState("particle");const [scale,setScale]=useState(1);const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);const [view,setView]=useState({xmin:-10,xmax:10,ymin:-10,ymax:10});const [canvasSize,setCanvasSize]=useState(0);
 const canvasRef=useRef<HTMLCanvasElement>(null);const timeRef=useRef(0);
 const parsed=useMemo(()=>compile(rows),[rows]);const valid=parsed.filter(x=>!x.error);const errors=parsed.filter(x=>x.error);
 const hasMotion=valid.some(x=>x.target==="x(t)"||x.target==="y(t)");const current=motionAt(valid,time,mass);
 const badSample=useMemo(()=>{for(const item of valid){for(let i=0;i<=100;i++){const q=item.target==="y(x)"?calc(item.root,{x:view.xmin+(view.xmax-view.xmin)*i/100,t:0,m:mass,g:9.81}):calc(item.root,{x:0,t:duration*i/100,m:mass,g:9.81});if(!Number.isFinite(q)||Math.abs(q)>1e6)return true;}}return false;},[valid,view,duration,mass]);
 const warning=errors.length>0||badSample||(hasMotion&&!current);
 useEffect(()=>{if(!playing)return;let frame=0,last=0;const tick=(now:number)=>{if(!last)last=now;const next=timeRef.current+Math.min((now-last)/1000,.05);last=now;timeRef.current=Math.min(duration,next);setTime(timeRef.current);if(next>=duration){setPlaying(false);return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,duration]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const dpr=Math.min(devicePixelRatio||1,2),width=rect.width,height=rect.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle="#fff";ctx.fillRect(0,0,width,height);
  const spanX=(view.xmax-view.xmin)/scale,spanY=(view.ymax-view.ymin)/scale,mx=(view.xmax+view.xmin)/2,my=(view.ymax+view.ymin)/2,xmin=mx-spanX/2,xmax=mx+spanX/2,ymin=my-spanY/2,ymax=my+spanY/2;const left=58,right=20,top=22,bottom=40,pw=width-left-right,ph=height-top-bottom;const X=(x:number)=>left+(x-xmin)/(xmax-xmin)*pw,Y=(y:number)=>top+ph-(y-ymin)/(ymax-ymin)*ph;
  const nice=(span:number)=>{const raw=span/9,p=10**Math.floor(Math.log10(Math.max(raw,1e-9))),q=raw/p;return (q<=1?1:q<=2?2:q<=5?5:10)*p;};const dx=nice(xmax-xmin),dy=nice(ymax-ymin);
  if(showGrid){for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx){ctx.strokeStyle=Math.abs(x)<1e-9?"#aebdca":"#edf1f5";ctx.beginPath();ctx.moveTo(X(x),top);ctx.lineTo(X(x),top+ph);ctx.stroke();}for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy){ctx.strokeStyle=Math.abs(y)<1e-9?"#aebdca":"#edf1f5";ctx.beginPath();ctx.moveTo(left,Y(y));ctx.lineTo(left+pw,Y(y));ctx.stroke();}}
  if(showAxes){ctx.strokeStyle="#627b94";ctx.lineWidth=1.6;if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),top);ctx.lineTo(X(0),top+ph);ctx.stroke();}if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(left,Y(0));ctx.lineTo(left+pw,Y(0));ctx.stroke();}}
  ctx.fillStyle="#8795a5";ctx.font="11px DM Sans";ctx.textAlign="center";for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx)ctx.fillText(Number(x.toPrecision(4)).toString(),X(x),top+ph+18);ctx.textAlign="right";for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy)ctx.fillText(Number(y.toPrecision(4)).toString(),left-8,Y(y)+4);
  const drawLine=(points:{x:number;y:number}[],color:string,dashed=false)=>{ctx.beginPath();let open=false;points.forEach(p=>{if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.y)>1e6){open=false;return;}if(!open){ctx.moveTo(X(p.x),Y(p.y));open=true;}else ctx.lineTo(X(p.x),Y(p.y));});ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash(dashed?[5,6]:[]);ctx.stroke();ctx.setLineDash([]);};
  valid.filter(x=>x.target==="y(x)").forEach((item,index)=>{const pts=Array.from({length:501},(_,i)=>{const x=xmin+(xmax-xmin)*i/500;return {x,y:calc(item.root,{x,t:0,m:mass,g:9.81})};});drawLine(pts,["#347fd5","#4da786","#d99a46","#8b6bd6"][index%4]);});
  if(hasMotion){const at=(t:number)=>motionAt(valid,t,mass);const all=Array.from({length:401},(_,i)=>{const p=at(duration*i/400);return p?{x:p.x,y:p.y}:{x:NaN,y:NaN};});const seen=all.filter((_,i)=>i<=Math.round(time/duration*400));drawLine(showTrail?seen:all,showTrail?"#347fd5":"#b7c9dc",!showTrail);
   if(current){const px=X(current.x),py=Y(current.y);if(showVelocity)arrow(ctx,px,py,X(current.x+current.vx*.28),Y(current.y+current.vy*.28),"#347fd5");if(showAcceleration)arrow(ctx,px,py,X(current.x+current.ax*.07),Y(current.y+current.ay*.07),"#d99a46");if(showForce)arrow(ctx,px,py,X(current.x+current.ax*mass*.07),Y(current.y+current.ay*mass*.07),"#d36f72");
    ctx.save();ctx.translate(px,py);if(object==="cart"){ctx.fillStyle="#4d83b7";ctx.fillRect(-17,-9,34,15);ctx.fillStyle="#344b64";ctx.beginPath();ctx.arc(-10,8,4,0,Math.PI*2);ctx.arc(10,8,4,0,Math.PI*2);ctx.fill();}else if(object==="satellite"){ctx.fillStyle="#d99a46";ctx.fillRect(-7,-7,14,14);ctx.fillStyle="#8ba5bd";ctx.fillRect(-24,-5,13,10);ctx.fillRect(11,-5,13,10);}else if(object==="rocket"){ctx.fillStyle="#8b6bd6";ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(9,8);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(0,19);ctx.lineTo(4,8);ctx.fill();}else{ctx.fillStyle=object==="ball"?"#4da786":"#347fd5";ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();}ctx.restore();
    if(showLabels){ctx.fillStyle="#405a72";ctx.font="600 11px DM Sans";ctx.textAlign="left";ctx.fillText("t = "+time.toFixed(2)+" s",px+13,py-15);}
   }
  }
  ctx.fillStyle="#8292a4";ctx.font="11px DM Sans";ctx.textAlign="right";ctx.fillText("x (m)",width-18,height-12);ctx.save();ctx.translate(15,top+ph/2);ctx.rotate(-Math.PI/2);ctx.textAlign="center";ctx.fillText("y (m)",0,0);ctx.restore();
 },[parsed,valid,view,scale,showGrid,showAxes,hasMotion,time,duration,mass,showTrail,showVelocity,showAcceleration,showForce,showLabels,current,object,canvasSize]);
 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(()=>setCanvasSize(v=>v+1));observer.observe(canvas);return()=>observer.disconnect();},[]);
 useEffect(()=>{timeRef.current=time;},[time]);
 const add=()=>{setRows(old=>[...old,{id:nextId,text:"",enabled:true}]);setNextId(v=>v+1);};
 const update=(id:number,text:string)=>setRows(old=>old.map(r=>r.id===id?{...r,text}:r));
 const reset=()=>{setTime(0);timeRef.current=0;setPlaying(false);};
 const preset=(kind:string)=>{const data:Record<string,string[]>={circle:["x(t)=4cos(t)","y(t)=4sin(t)"],projectile:["x(t)=12cos(pi/4)*t","y(t)=12sin(pi/4)*t-0.5*9.81*t^2"],spring:["x(t)=2cos(2t)","y(t)=0"],curve:["y=0.2x^2-2"]};const list=data[kind]||[];setRows(list.map((text,i)=>({id:i+1,text,enabled:true})));setNextId(list.length+1);reset();};
 const zoom=(n:number)=>setScale(v=>Math.max(.25,Math.min(8,v*n)));
 const exportCsv=()=>{const lines=["t_s,x_m,y_m,vx_m_s,vy_m_s,ax_m_s2,ay_m_s2,kinetic_energy_J,momentum_kg_m_s,net_force_N"];for(let i=0;i<=300;i++){const t=duration*i/300,p=motionAt(valid,t,mass);lines.push([t,p?.x??"",p?.y??"",p?.vx??"",p?.vy??"",p?.ax??"",p?.ay??"",p?.energy??"",p?.momentum??"",p?.force??""].join(","));}const url=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="physimus-sandbox.csv";a.click();URL.revokeObjectURL(url);};
 const Toggle=({label,value,onClick}:{label:string;value:boolean;onClick:()=>void})=><button className={value?"sandbox-toggle active":"sandbox-toggle"} onClick={onClick}>{label}<span>{value?"ON":"OFF"}</span></button>;
 const mathHtml=(value:string)=>({__html:katex.renderToString(value,{throwOnError:false})});
 return <main className="sandbox-workspace">
  <header className="sandbox-heading"><div><span className="eyebrow">PHYSIMUS / EQUATION SANDBOX</span><h1>{w.title}</h1><p>{w.hint}</p></div><div className="sandbox-heading-actions"><button className="secondary-button" onClick={exportCsv}><Download size={16}/>{w.export}</button><button className="secondary-button" onClick={()=>{setRows([{id:1,text:"",enabled:true}]);setNextId(2);reset();}}><RotateCcw size={16}/>{w.reset}</button></div></header>
  <div className="sandbox-studio">
   <aside className="sandbox-editor">
    <div className="sandbox-editor-heading"><strong>{w.math}</strong><button onClick={add}><Plus size={15}/>{w.add}</button></div>
    <div className="sandbox-equations">{rows.map((row,index)=><div className="sandbox-equation-row" key={row.id}><span>{index+1}</span><button title={row.enabled?"Hide":"Show"} onClick={()=>setRows(old=>old.map(q=>q.id===row.id?{...q,enabled:!q.enabled}:q))}>{row.enabled?<Eye size={14}/>:<EyeOff size={14}/>}</button><input value={row.text} onChange={e=>update(row.id,e.target.value)} placeholder="e.g. x(t)=4cos(t)"/><button title={w.delete} onClick={()=>setRows(old=>old.filter(q=>q.id!==row.id))}><Trash2 size={14}/></button></div>)}</div>
    <div className="sandbox-presets"><span className="eyebrow">{w.examples}</span><div><button onClick={()=>preset("circle")}>GMB</button><button onClick={()=>preset("projectile")}>Projectile</button><button onClick={()=>preset("spring")}>Spring</button><button onClick={()=>preset("curve")}>Curve</button></div></div>
    <details className="sandbox-syntax"><summary>{w.syntax}</summary><p>{w.syntaxText}</p><p>y=f(x), x(t)=..., y(t)=...</p></details>
    <div className="sandbox-validation"><span className="eyebrow">{w.status}</span><p className={warning?"bad":"good"}>{warning?<><AlertTriangle size={14}/>{w.bad}</>:<><Sparkles size={14}/>{w.ok}</>}</p>{errors.map(e=><small key={e.id}>{e.text}: {e.error}</small>)}{parsed.length===0&&<small>{w.empty}</small>}</div>
    <div className="sandbox-viewport"><span className="eyebrow">{w.view}</span>{([["xmin",w.xmin],["xmax",w.xmax],["ymin",w.ymin],["ymax",w.ymax]] as const).map(([key,label])=><label key={key}>{label}<input type="number" value={view[key]} step="1" onChange={e=>setView(v=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div>
   </aside>
   <section className="sandbox-main">
    <div className="sandbox-toolbar"><div className="sandbox-switches">
     <Toggle label={w.grid} value={showGrid} onClick={()=>setShowGrid(v=>!v)}/><Toggle label={w.axes} value={showAxes} onClick={()=>setShowAxes(v=>!v)}/><Toggle label={w.trail} value={showTrail} onClick={()=>setShowTrail(v=>!v)}/><Toggle label={w.velocity} value={showVelocity} onClick={()=>setShowVelocity(v=>!v)}/><Toggle label={w.acceleration} value={showAcceleration} onClick={()=>setShowAcceleration(v=>!v)}/><Toggle label={w.force} value={showForce} onClick={()=>setShowForce(v=>!v)}/><Toggle label={w.energy} value={showEnergy} onClick={()=>setShowEnergy(v=>!v)}/><Toggle label={w.labels} value={showLabels} onClick={()=>setShowLabels(v=>!v)}/>
    </div><div className="sandbox-zoom"><button title="Zoom in" onClick={()=>zoom(1.25)}><Plus size={15}/></button><button title="Zoom out" onClick={()=>zoom(.8)}><Minus size={15}/></button><button title="Reset zoom" onClick={()=>{setScale(1);setView({xmin:-10,xmax:10,ymin:-10,ymax:10});}}><RotateCcw size={15}/></button></div></div>
    <div className="sandbox-canvas-wrap"><canvas ref={canvasRef} onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();setCursor({x:view.xmin+(e.clientX-rect.left-58)/(rect.width-78)*(view.xmax-view.xmin)/scale,y:view.ymax-(e.clientY-rect.top-22)/(rect.height-62)*(view.ymax-view.ymin)/scale});}} onMouseLeave={()=>setCursor(null)}/><span className="sandbox-canvas-badge">{hasMotion?w.parametric:w.function} · SI</span><span className="sandbox-cursor">{cursor?"x "+cursor.x.toFixed(2)+" · y "+cursor.y.toFixed(2):w.inspector}</span></div>
    <div className="sandbox-playback"><button className="play-control" disabled={!hasMotion||warning} onClick={()=>{if(time>=duration)reset();setPlaying(v=>!v);}}>{playing?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}</button><button className="reset-control" onClick={reset}><RotateCcw size={16}/></button><div className="sandbox-timeline"><div><span>{w.time}</span><strong>{time.toFixed(2)} / {duration.toFixed(1)} s</strong></div><input type="range" min="0" max={duration} step=".01" value={time} onChange={e=>{setTime(Number(e.target.value));timeRef.current=Number(e.target.value);}}/></div><label>{w.duration}<input type="number" min="1" max="120" value={duration} onChange={e=>setDuration(Math.max(1,Math.min(120,Number(e.target.value)||1)))}/></label><label>{w.mass}<input type="number" min=".01" max="10000" step=".1" value={mass} onChange={e=>setMass(Math.max(.01,Math.min(10000,Number(e.target.value)||1)))}/></label><label>{w.object}<select value={object} onChange={e=>setObject(e.target.value)}><option value="particle">{w.particle}</option><option value="ball">{w.ball}</option><option value="cart">{w.cart}</option><option value="satellite">{w.satellite}</option><option value="rocket">{w.rocket}</option></select></label></div>
    <div className="sandbox-analysis"><strong>{w.motion}</strong>{current?<div className="sandbox-analysis-grid"><div><span>r · Position</span><b>{current.x.toFixed(2)}, {current.y.toFixed(2)} m</b><small dangerouslySetInnerHTML={mathHtml("x(t),\\;y(t)")}/></div><div><span>v · Velocity</span><b>{current.speed.toFixed(2)} m/s</b><small dangerouslySetInnerHTML={mathHtml("|\\vec v|=\\sqrt{v_x^2+v_y^2}")}/></div><div><span>a · Acceleration</span><b>{current.acceleration.toFixed(2)} m/s²</b><small dangerouslySetInnerHTML={mathHtml("|\\vec a|=\\sqrt{a_x^2+a_y^2}")}/></div>{showEnergy&&<><div><span>Kinetic energy</span><b>{current.energy.toFixed(2)} J</b><small dangerouslySetInnerHTML={mathHtml("K=\\frac12m|\\vec v|^2")}/></div><div><span>Momentum</span><b>{current.momentum.toFixed(2)} kg·m/s</b><small dangerouslySetInnerHTML={mathHtml("|\\vec p|=m|\\vec v|")}/></div><div><span>Net force</span><b>{current.force.toFixed(2)} N</b><small dangerouslySetInnerHTML={mathHtml("|\\vec F|=m|\\vec a|")}/></div></>}</div>:<p className="sandbox-empty">{w.notMotion}</p>}<p className="sandbox-footnote">{w.warning} {w.noBackend}</p></div>
   </section>
  </div>
 </main>;
}
