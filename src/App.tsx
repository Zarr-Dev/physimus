import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import katex from "katex";
import {
  Activity, ArrowLeft, ArrowRight, Atom, BookOpen, Check, ChevronDown,
  CircleHelp, Download, FlaskConical, Globe2, Grid3X3, Home as HomeIcon,
  Layers3, Pause, Play, RotateCcw, Save, Settings2, SlidersHorizontal,
  Sparkles, Upload, Waves
} from "lucide-react";

type Language = "ID" | "EN";
type Page = "discover" | "laboratory" | "learn" | "sandbox";
type LabId = "projectile" | "mru" | "mrua" | "circular" | "energy" | "incline" | "spring";
type Param = { key: string; label: string; min: number; max: number; step: number; unit: string; initial: number };
type Point = { x: number; y: number; t: number; vx: number; vy: number; speed: number; kinetic: number; potential: number };
type Lab = {
  id: LabId; category: string; title: string; subtitle: string; description: string;
  formula: string; question: string; params: Param[]; duration: number; color: string;
};

const labs: Lab[] = [
  {
    id: "projectile", category: "KINEMATIKA", title: "Gerak Parabola", subtitle: "Projectile Motion",
    description: "Pelajari gerak dua dimensi dengan memisahkan komponen horizontal dan vertikal. Ubah kecepatan, sudut, ketinggian awal, dan gravitasi.",
    formula: String.raw`x(t)=v_0\cos\theta\,t,\quad y(t)=h_0+v_0\sin\theta\,t-\frac12gt^2`,
    question: "Bagaimana sudut dan ketinggian awal memengaruhi jangkauan serta waktu terbang?",
    params: [
      {key:"speed",label:"Kecepatan awal",min:5,max:50,step:1,unit:"m/s",initial:24},
      {key:"angle",label:"Sudut peluncuran",min:5,max:85,step:1,unit:"°",initial:52},
      {key:"height",label:"Ketinggian awal",min:0,max:30,step:1,unit:"m",initial:0},
      {key:"mass",label:"Massa benda",min:.1,max:20,step:.1,unit:"kg",initial:1},
      {key:"gravity",label:"Gravitasi",min:1,max:20,step:.01,unit:"m/s²",initial:9.81}
    ], duration: 8, color:"#347fd5"
  },
  {
    id: "mru", category: "KINEMATIKA", title: "Gerak Lurus Beraturan", subtitle: "Uniform Linear Motion",
    description: "Amati benda yang bergerak pada lintasan lurus dengan kecepatan konstan dan percepatan nol.",
    formula: String.raw`x(t)=x_0+vt,\quad v(t)=v_0,\quad a(t)=0`,
    question: "Jika kecepatan tetap, bagaimana posisi berubah setiap detik?",
    params: [{key:"speed",label:"Kecepatan",min:1,max:30,step:.5,unit:"m/s",initial:8}],
    duration: 10, color:"#347fd5"
  },
  {
    id: "mrua", category: "KINEMATIKA", title: "Gerak Lurus Berubah Beraturan", subtitle: "Constant Acceleration",
    description: "Eksplorasi gerak satu dimensi dengan percepatan konstan. Coba percepatan positif, negatif, atau kondisi benda mulai diam.",
    formula: String.raw`x(t)=x_0+v_0t+\frac12at^2,\quad v(t)=v_0+at`,
    question: "Apa yang terjadi pada grafik posisi dan kecepatan ketika percepatan berubah tanda?",
    params: [
      {key:"speed",label:"Kecepatan awal",min:0,max:25,step:.5,unit:"m/s",initial:4},
      {key:"acceleration",label:"Percepatan",min:-5,max:5,step:.1,unit:"m/s²",initial:1.5}
    ], duration: 10, color:"#347fd5"
  },
  {
    id: "circular", category: "KINEMATIKA", title: "Gerak Melingkar Beraturan", subtitle: "Uniform Circular Motion",
    description: "Visualisasikan gerak melingkar, kecepatan sudut, kecepatan tangensial, dan percepatan sentripetal.",
    formula: String.raw`\theta(t)=\omega t,\quad v=\omega r,\quad a_c=\omega^2r`,
    question: "Jika jari-jari diperbesar pada kecepatan sudut tetap, bagaimana kelajuan dan percepatan sentripetal berubah?",
    params: [
      {key:"radius",label:"Jari-jari",min:.5,max:10,step:.1,unit:"m",initial:3},
      {key:"omega",label:"Kecepatan sudut",min:.2,max:5,step:.1,unit:"rad/s",initial:1.5}
    ], duration: 8, color:"#8b6bd6"
  },
  {
    id: "energy", category: "DINAMIKA & ENERGI", title: "Kekekalan Energi Mekanik", subtitle: "Mechanical Energy",
    description: "Ikuti perubahan energi potensial gravitasi menjadi energi kinetik saat benda meluncur menuruni bidang miring. Gesekan dapat diatur.",
    formula: String.raw`E_m=E_k+E_p=\frac12mv^2+mgh`,
    question: "Apakah energi mekanik tetap ketika ada gaya gesek? Ke mana energi mekanik berpindah?",
    params: [
      {key:"mass",label:"Massa benda",min:.5,max:20,step:.5,unit:"kg",initial:2},
      {key:"height",label:"Ketinggian awal",min:1,max:20,step:.5,unit:"m",initial:8},
      {key:"friction",label:"Koefisien gesek",min:0,max:.5,step:.01,unit:"μ",initial:0}
    ], duration: 8, color:"#d99a46"
  },
  {
    id: "incline", category: "DINAMIKA & ENERGI", title: "Hukum II Newton", subtitle: "Inclined Plane & Forces",
    description: "Analisis gaya berat, gaya normal, gesekan, dan percepatan balok pada bidang miring.",
    formula: String.raw`\sum F=ma,\quad a=g(\sin\theta-\mu\cos\theta)`,
    question: "Pada sudut dan koefisien gesek berapa benda mulai bergerak menuruni bidang?",
    params: [
      {key:"mass",label:"Massa benda",min:.5,max:20,step:.5,unit:"kg",initial:5},
      {key:"angle",label:"Sudut bidang",min:0,max:60,step:1,unit:"°",initial:30},
      {key:"friction",label:"Koefisien gesek",min:0,max:1,step:.01,unit:"μ",initial:.2},
      {key:"gravity",label:"Gravitasi",min:1,max:20,step:.01,unit:"m/s²",initial:9.81}
    ], duration: 8, color:"#4da786"
  },
  {
    id: "spring", category: "GETARAN", title: "Gerak Harmonik Sederhana", subtitle: "Simple Harmonic Motion",
    description: "Amati osilasi massa-pegas, hubungan gaya pemulih, konstanta pegas, massa, periode, dan frekuensi.",
    formula: String.raw`x(t)=A\cos(\omega t),\quad \omega=\sqrt{\frac{k}{m}}`,
    question: "Bagaimana massa dan konstanta pegas memengaruhi periode osilasi?",
    params: [
      {key:"mass",label:"Massa",min:.2,max:10,step:.1,unit:"kg",initial:1},
      {key:"spring",label:"Konstanta pegas",min:1,max:100,step:1,unit:"N/m",initial:25},
      {key:"amplitude",label:"Amplitudo",min:.1,max:3,step:.1,unit:"m",initial:1.2}
    ], duration: 8, color:"#8b6bd6"
  }
];

const words = {
  ID: {
    discover:"Beranda", laboratory:"Laboratorium", learn:"Belajar", sandbox:"Sandbox",
    kicker:"LABORATORIUM FISIKA INTERAKTIF", hero1:"Fisika bukan",hero2:"untuk dihafal.",
    heroText:"Jelajahi fenomena, ubah variabel, dan lihat bagaimana alam bekerja. Satu ruang eksperimen untuk rasa ingin tahu tanpa batas.",
    openLab:"Mulai bereksperimen", browse:"Jelajahi laboratorium", featured:"LABORATORIUM MEKANIKA",
    collection:"Eksplorasi Mekanika", collectionText:"Dari gerak sederhana hingga energi dan gaya. Setiap laboratorium memiliki parameter, simulasi, grafik, dan pengukuran yang saling terhubung.",
    experiments:"laboratorium tersedia", open:"Buka laboratorium", all:"Semua", kinematics:"Kinematika", dynamics:"Dinamika & Energi", oscillation:"Getaran",
    expr:"Persamaan model", parameters:"Parameter eksperimen", graph:"Grafik eksperimen", play:"Mulai", pause:"Jeda", reset:"Reset",
    time:"Waktu simulasi", values:"Pengukuran langsung", export:"Ekspor CSV", save:"Simpan eksperimen", load:"Buka eksperimen",
    grid:"Grid", vectors:"Vektor", trail:"Jejak", model:"MODEL FISIKA", assumptions:"Asumsi model",
    learnTitle:"Pahami sebelum menghitung", learnText:"Mulai dari fenomena, lanjutkan dengan persamaan, kemudian uji prediksi melalui simulasi.",
    sandboxTitle:"Ruang eksperimen bebas", sandboxText:"Pilih model mekanika sebagai titik awal, atur parameternya, lalu buka workspace untuk menguji skenario sendiri.",
    choose:"Pilih laboratorium", launch:"Buka workspace", question:"Pertanyaan eksplorasi", noDrag:"Model ideal tanpa hambatan udara.",
    status:"SIAP", x:"Posisi x", y:"Posisi y", speed:"Kelajuan", acceleration:"Percepatan", kinetic:"Energi kinetik", potential:"Energi potensial",
    total:"Energi mekanik", range:"Jangkauan", maxHeight:"Tinggi maksimum", period:"Periode", angular:"Kecepatan sudut",
    force:"Resultan gaya", normal:"Gaya normal", friction:"Gaya gesek", duration:"Durasi", current:"Saat ini",
    discoverMore:"Kembali ke beranda", projectSaved:"File eksperimen diunduh", projectLoaded:"Eksperimen dimuat", projectError:"File eksperimen tidak valid",
    resetView:"Atur ulang", graphHint:"Gunakan slider untuk mengubah kondisi awal. Grafik dan nilai akan diperbarui otomatis.",
    concept:"Konsep inti", formula:"Persamaan utama", experiment:"Eksperimen", chooseLab:"Pilih laboratorium untuk memulai.",
    language:"Bahasa", height:"Ketinggian", distance:"Jarak", velocity:"Kecepatan", energy:"Energi", graphTitle:"Grafik eksperimen"
  },
  EN: {
    discover:"Discover", laboratory:"Laboratory", learn:"Learn", sandbox:"Sandbox",
    kicker:"INTERACTIVE PHYSICS LABORATORY", hero1:"Physics is not",hero2:"for memorizing.",
    heroText:"Explore phenomena, change variables, and see how nature works. One experimental space for limitless curiosity.",
    openLab:"Start experimenting", browse:"Explore laboratories", featured:"MECHANICS LABORATORIES",
    collection:"Explore Mechanics", collectionText:"From simple motion to energy and forces. Every lab connects parameters, simulation, graphs, and measurements.",
    experiments:"laboratories available", open:"Open laboratory", all:"All", kinematics:"Kinematics", dynamics:"Dynamics & Energy", oscillation:"Oscillations",
    expr:"Model equations", parameters:"Experiment parameters", graph:"Experiment graph", play:"Play", pause:"Pause", reset:"Reset",
    time:"Simulation time", values:"Live measurements", export:"Export CSV", save:"Save experiment", load:"Open experiment",
    grid:"Grid", vectors:"Vectors", trail:"Trail", model:"PHYSICS MODEL", assumptions:"Model assumptions",
    learnTitle:"Understand before calculating", learnText:"Start with the phenomenon, move to equations, then test predictions through simulation.",
    sandboxTitle:"Open experiment space", sandboxText:"Choose a mechanics model as a starting point, tune its parameters, and open the workspace to test your own scenarios.",
    choose:"Choose a laboratory", launch:"Open workspace", question:"Explore this question", noDrag:"Ideal model without air resistance.",
    status:"READY", x:"Position x", y:"Position y", speed:"Speed", acceleration:"Acceleration", kinetic:"Kinetic energy", potential:"Potential energy",
    total:"Mechanical energy", range:"Range", maxHeight:"Maximum height", period:"Period", angular:"Angular velocity",
    force:"Net force", normal:"Normal force", friction:"Friction force", duration:"Duration", current:"Current",
    discoverMore:"Back to discover", projectSaved:"Experiment file downloaded", projectLoaded:"Experiment loaded", projectError:"Invalid experiment file",
    resetView:"Reset", graphHint:"Adjust a slider to change the initial conditions. The graph and values update automatically.",
    concept:"Core concept", formula:"Main equation", experiment:"Experiment", chooseLab:"Choose a laboratory to get started.",
    language:"Language", height:"Height", distance:"Distance", velocity:"Velocity", energy:"Energy", graphTitle:"Experiment graph"
  }
};

const englishLabText: Record<LabId,{description:string;question:string}> = {
  projectile: {description:"Explore two-dimensional motion by separating horizontal and vertical components. Adjust launch speed, angle, initial height, and gravity.",question:"How do launch angle and initial height affect range and flight time?"},
  mru: {description:"Observe an object moving in a straight line at constant velocity and zero acceleration.",question:"If velocity stays constant, how does position change each second?"},
  mrua: {description:"Explore one-dimensional motion with constant acceleration. Try positive acceleration, negative acceleration, or an object starting from rest.",question:"How do position and velocity graphs change when acceleration changes sign?"},
  circular: {description:"Visualize circular motion, angular velocity, tangential speed, and centripetal acceleration.",question:"If radius increases while angular velocity stays constant, what happens to speed and centripetal acceleration?"},
  energy: {description:"Track gravitational potential energy converting into kinetic energy as an object slides down an inclined plane. Friction is adjustable.",question:"Does mechanical energy stay constant when friction acts? Where does the mechanical energy go?"},
  incline: {description:"Analyze weight, normal force, friction, and the acceleration of a block on an inclined plane.",question:"At what angle and friction coefficient does the block begin to slide?"},
  spring: {description:"Explore a mass-spring oscillator and the relationship between restoring force, spring stiffness, mass, period, and frequency.",question:"How do mass and spring stiffness affect the oscillation period?"}
};

function parameterText(language:Language,key:string,fallback:string) {
  if(language==="ID") return fallback;
  const en:Record<string,string> = {
    speed:"Initial speed",angle:"Launch angle",height:"Initial height",gravity:"Gravity",
    acceleration:"Acceleration",radius:"Radius",omega:"Angular velocity",mass:"Mass",
    friction:"Friction coefficient",spring:"Spring constant",amplitude:"Amplitude"
  };
  return en[key]??fallback;
}

function categoryText(language:Language,category:string) {
  if(language==="ID") return category;
  if(category==="KINEMATIKA") return "KINEMATICS";
  if(category==="GETARAN") return "OSCILLATIONS";
  return "DYNAMICS & ENERGY";
}

function tLabel(language: Language, lab: Lab) {
  if (language === "EN") return {title:lab.subtitle, description:englishLabText[lab.id].description, question:englishLabText[lab.id].question};
  return {title:lab.title, description:lab.description, question:lab.question};
}

function Equation({ value, display = false }: { value: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(value, {throwOnError:false, displayMode:display}), [value,display]);
  return <span className={display ? "math-display" : "math-inline"} dangerouslySetInnerHTML={{__html:html}} />;
}

function Brand() {
  return <span className="brand"><span className="brand-mark"><Atom size={22}/></span><span>physimus<span>.</span></span></span>;
}

function LanguageSwitch({language,onChange}:{language:Language;onChange:(v:Language)=>void}) {
  return <div className="language-switch" aria-label="Language">
    <Globe2 size={17}/>
    <button className={language==="ID"?"chosen":""} onClick={()=>onChange("ID")} aria-pressed={language==="ID"}>ID</button>
    <button className={language==="EN"?"chosen":""} onClick={()=>onChange("EN")} aria-pressed={language==="EN"}>EN</button>
  </div>;
}

function Header({page,setPage,language,onLanguage}:{page:Page;setPage:(p:Page)=>void;language:Language;onLanguage:(v:Language)=>void}) {
  const w=words[language];
  const items: {id:Page;label:string;icon:typeof HomeIcon}[]=[
    {id:"discover",label:w.discover,icon:HomeIcon},
    {id:"laboratory",label:w.laboratory,icon:FlaskConical},
    {id:"learn",label:w.learn,icon:BookOpen},
    {id:"sandbox",label:w.sandbox,icon:Layers3}
  ];
  return <header className="topbar">
    <button className="brand-button" onClick={()=>setPage("discover")} aria-label="Physimus home"><Brand/></button>
    <nav className="main-nav" aria-label="Main navigation">
      {items.map(item=><button key={item.id} className={page===item.id?"nav-link active":"nav-link"} onClick={()=>setPage(item.id)}><item.icon size={17}/><span>{item.label}</span></button>)}
    </nav>
    <LanguageSwitch language={language} onChange={onLanguage}/>
  </header>;
}

function Hero({language,onOpen}:{language:Language;onOpen:()=>void}) {
  const w=words[language];
  return <section className="hero">
    <div className="hero-content">
      <span className="eyebrow"><i/>{w.kicker}</span>
      <h1>{w.hero1}<br/><em>{w.hero2}</em></h1>
      <p>{w.heroText}</p>
      <button className="primary-button" onClick={onOpen}>{w.openLab}<ArrowRight size={19}/></button>
      <div className="hero-foot"><span>01</span><span className="hero-rule"/><span>LEARN · EXPERIMENT · DISCOVER</span></div>
    </div>
    <div className="hero-art">
      <div className="art-caption"><span>PHYSIMUS / MECHANICS</span><span>01 — 07</span></div>
      <svg viewBox="0 0 660 470" role="img" aria-label="Scientific illustration of a projectile and circular motion">
        <defs><linearGradient id="pathBlue" x1="0" x2="1"><stop stopColor="#347fd5"/><stop offset="1" stopColor="#a3cdf4"/></linearGradient></defs>
        <g className="art-grid">{Array.from({length:8},(_,i)=><line key={"h"+i} x1="35" x2="635" y1={55+i*48} y2={55+i*48}/>)}{Array.from({length:11},(_,i)=><line key={"v"+i} y1="35" y2="425" x1={45+i*57} x2={45+i*57}/>)}</g>
        <path d="M45 390H625" className="art-axis"/>
        <path d="M45 390 Q335 -120 625 390" className="art-curve"/>
        <path d="M45 390L175 165" className="art-vector"/>
        <circle cx="45" cy="390" r="7" className="art-dot"/><circle cx="335" cy="135" r="7" className="art-dot"/><circle cx="625" cy="390" r="7" className="art-dot"/>
        <circle cx="470" cy="245" r="82" fill="none" stroke="#b7a5e8" strokeWidth="2" strokeDasharray="5 8"/>
        <circle cx="470" cy="245" r="7" fill="#8b6bd6"/>
        <path d="M470 245L535 195" stroke="#8b6bd6" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="350" y="115">APEX</text><text x="60" y="420">ORIGIN</text><text x="540" y="420">RANGE</text><text x="495" y="280">r</text>
      </svg>
      <div className="art-note"><Sparkles size={17}/> Explore. Change. Understand.</div>
    </div>
  </section>;
}

function LabCard({lab,language,onOpen,index}:{lab:Lab;language:Language;onOpen:(id:LabId)=>void;index:number}) {
  const label=tLabel(language,lab);
  const category=categoryText(language,lab.category);
  return <button className="lab-card" onClick={()=>onOpen(lab.id)}>
    <div className="lab-card-top"><span className="lab-index">{String(index+1).padStart(2,"0")}</span><span className="lab-category">{category}</span><span className="lab-arrow"><ArrowRight size={19}/></span></div>
    <div className="lab-card-icon" style={{"--lab-color":lab.color} as CSSProperties}><Activity size={28}/></div>
    <h3>{language==="ID"?lab.title:lab.subtitle}</h3><p className="lab-subtitle">{language==="ID"?lab.subtitle:lab.title}</p>
    <p className="lab-description">{label.description}</p>
    <div className="lab-formula"><Equation value={lab.formula}/></div>
  </button>;
}

function Discover({language,onOpen}:{language:Language;onOpen:(id:LabId)=>void}) {
  const w=words[language];
  return <main className="page-shell">
    <Hero language={language} onOpen={()=>onOpen("projectile")}/>
    <section className="lab-collection" id="laboratories">
      <div className="section-heading"><div><span className="eyebrow">{w.featured}</span><h2>{w.collection}</h2><p>{w.collectionText}</p></div><span className="lab-count">{labs.length} {w.experiments}</span></div>
      <div className="lab-grid">{labs.map((lab,i)=><LabCard key={lab.id} lab={lab} language={language} index={i} onOpen={onOpen}/>)}</div>
    </section>
    <footer className="page-footer"><Brand/><span>Physics Laboratory for Anyone.</span><span>IMAGINE · EXPERIMENT · DISCOVER</span></footer>
  </main>;
}

function Slider({param,value,onChange}:{param:Param;value:number;onChange:(v:number)=>void}) {
  const digits=param.step<1? (String(param.step).split(".")[1]?.length??1):0;
  return <label className="slider-control">
    <span className="slider-heading"><span>{param.label}</span><strong>{value.toFixed(digits)} <small>{param.unit}</small></strong></span>
    <input type="range" min={param.min} max={param.max} step={param.step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
    <span className="slider-limits"><span>{param.min}</span><span>{param.max}</span></span>
  </label>;
}

function makePoints(lab:Lab,values:Record<string,number>):Point[] {
  const p=(key:string)=>values[key]??0;
  const g=p("gravity")||9.81;
  let duration=lab.duration;
  if(lab.id==="projectile") {
    const a=p("angle")*Math.PI/180, vy=p("speed")*Math.sin(a);
    duration=(vy+Math.sqrt(vy*vy+2*g*p("height")))/g;
  }
  if(lab.id==="circular") duration=2*Math.PI/p("omega");
  const energyAngle=Math.PI/6;
  const energyAcceleration=g*(Math.sin(energyAngle)-p("friction")*Math.cos(energyAngle));
  if(lab.id==="energy"&&energyAcceleration>0) duration=Math.sqrt(2*(p("height")/Math.sin(energyAngle))/energyAcceleration);
  if(lab.id==="spring") duration=2*Math.PI/Math.sqrt(p("spring")/p("mass"))*2;
  const count=240;
  const points:Point[]=[];
  const angle=p("angle")*Math.PI/180;
  const omega=lab.id==="spring"?Math.sqrt(p("spring")/p("mass")):p("omega");
  const inclineAngle=lab.id==="energy"?Math.PI/6:angle;
  const totalDistance=lab.id==="energy"?p("height")/Math.sin(inclineAngle):0;
  const accel=lab.id==="incline"?Math.max(0,g*(Math.sin(angle)-p("friction")*Math.cos(angle))):0;
  for(let i=0;i<=count;i++) {
    const time=duration*i/count;
    let x=0,y=0,vx=0,vy=0,kinetic=0,potential=0;
    const mass=p("mass")||1;
    if(lab.id==="projectile") {
      const v=p("speed"),theta=angle;
      vx=v*Math.cos(theta);vy=v*Math.sin(theta)-g*time;
      x=v*Math.cos(theta)*time;
      y=Math.max(0,p("height")+v*Math.sin(theta)*time-.5*g*time*time);
      const h=p("height")+v*Math.sin(theta)*time-.5*g*time*time;
      kinetic=.5*mass*(vx*vx+vy*vy);potential=mass*g*Math.max(0,h);
    } else if(lab.id==="mru") {
      vx=p("speed");x=vx*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="mrua") {
      vx=p("speed")+p("acceleration")*time;x=p("speed")*time+.5*p("acceleration")*time*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="circular") {
      const theta=omega*time,r=p("radius");
      x=r*Math.cos(theta);y=r*Math.sin(theta);
      vx=-r*omega*Math.sin(theta);vy=r*omega*Math.cos(theta);kinetic=.5*mass*(r*omega)**2;
    } else if(lab.id==="energy") {
      const s=Math.min(totalDistance,.5*Math.max(0,energyAcceleration)*time*time);
      const h=Math.max(0,p("height")-s*Math.sin(inclineAngle));
      const v=Math.max(0,energyAcceleration)*time;
      x=s;y=h;vx=v;kinetic=.5*mass*v*v;potential=mass*g*h;
    } else if(lab.id==="incline") {
      const a=accel;
      x=.5*a*time*time;vx=a*time;kinetic=.5*mass*vx*vx;
      y=0;potential=0;
    } else if(lab.id==="spring") {
      const a=p("amplitude"),w=omega;
      x=a*Math.cos(w*time);vx=-a*w*Math.sin(w*time);
      y=0;kinetic=.5*mass*vx*vx;potential=.5*p("spring")*x*x;
    }
    points.push({x,y,t:time,vx,vy,speed:Math.hypot(vx,vy),kinetic,potential});
  }
  return points;
}

function metricsFor(lab:Lab,values:Record<string,number>,point:Point,points:Point[],language:Language) {
  const labels=language==="ID"
    ? {x:"Posisi x",y:"Posisi y",speed:"Kelajuan",range:"Jangkauan",max:"Tinggi maksimum",flight:"Waktu terbang",position:"Posisi",velocity:"Kecepatan",acceleration:lab.id==="projectile"?"Percepatan vertikal":"Percepatan",time:"Waktu",period:"Periode",omega:"Kecepatan sudut",centripetal:"Percepatan sentripetal",kinetic:"Energi kinetik",potential:"Energi potensial",mechanical:"Energi mekanik",height:"Ketinggian",initial:"Energi awal",net:"Resultan gaya",distance:"Jarak",mass:"Massa"}
    : {x:"Position x",y:"Position y",speed:"Speed",range:"Range",max:"Maximum height",flight:"Flight time",position:"Position",velocity:"Velocity",acceleration:lab.id==="projectile"?"Vertical acceleration":"Acceleration",time:"Time",period:"Period",omega:"Angular velocity",centripetal:"Centripetal acceleration",kinetic:"Kinetic energy",potential:"Potential energy",mechanical:"Mechanical energy",height:"Height",initial:"Initial energy",net:"Net force",distance:"Distance",mass:"Mass"};
  const peak=points.reduce((best,p)=>p.y>best.y?p:best,points[0]);
  const total=point.kinetic+point.potential;
  const mass=values.mass??1;
  const g=values.gravity??9.81;
  if(lab.id==="projectile") return [
    [labels.x,point.x,"m"],[labels.y,point.y,"m"],[labels.speed,point.speed,"m/s"],
    [labels.range,points[points.length-1].x,"m"],[labels.max,peak.y,"m"],[labels.flight,points[points.length-1].t,"s"]
  ] as [string,number,string][];
  if(lab.id==="mru"||lab.id==="mrua") return [
    [labels.position,point.x,"m"],[labels.velocity,point.vx,"m/s"],[labels.acceleration,lab.id==="mrua"?values.acceleration:0,"m/s²"],
    [labels.speed,point.speed,"m/s"],[labels.kinetic,point.kinetic,"J"],[labels.time,point.t,"s"]
  ] as [string,number,string][];
  if(lab.id==="circular") return [
    [labels.x,point.x,"m"],[labels.y,point.y,"m"],[labels.speed,point.speed,"m/s"],
    [labels.period,2*Math.PI/values.omega,"s"],[labels.omega,values.omega,"rad/s"],[labels.centripetal,values.omega**2*values.radius,"m/s²"]
  ] as [string,number,string][];
  if(lab.id==="energy") return [
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.mechanical,total,"J"],
    [language==="ID"?"Energi terdisipasi":"Dissipated energy",Math.max(0,mass*g*values.height-total),"J"],
    [labels.height,point.y,"m"],[labels.speed,point.speed,"m/s"]
  ] as [string,number,string][];
  if(lab.id==="incline") {
    const acceleration=Math.max(0,values.gravity*(Math.sin(values.angle*Math.PI/180)-values.friction*Math.cos(values.angle*Math.PI/180)));
    return [
      [labels.acceleration,acceleration,"m/s²"],[labels.net,mass*acceleration,"N"],
      [language==="ID"?"Gaya normal":"Normal force",mass*values.gravity*Math.cos(values.angle*Math.PI/180),"N"],
      [language==="ID"?"Gaya gesek":"Friction force",Math.min(values.friction*mass*values.gravity*Math.cos(values.angle*Math.PI/180),mass*values.gravity*Math.sin(values.angle*Math.PI/180)),"N"],
      [labels.velocity,point.vx,"m/s"],[labels.distance,point.x,"m"]
    ] as [string,number,string][];
  }
  return [
    [labels.position,point.x,"m"],[labels.velocity,point.vx,"m/s"],[labels.acceleration,-(values.spring/values.mass)*point.x,"m/s²"],
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.period,2*Math.PI*Math.sqrt(values.mass/values.spring),"s"]
  ] as [string,number,string][];
}

function drawArrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string) {
  const angle=Math.atan2(y2-y1,x2-x1);
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-9*Math.cos(angle-.45),y2-9*Math.sin(angle-.45));ctx.lineTo(x2-9*Math.cos(angle+.45),y2-9*Math.sin(angle+.45));ctx.closePath();ctx.fill();
}

function downloadFile(name:string,data:string,mime:string) {
  const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function Laboratory({labId,language,onBack,onChoose}:{labId:LabId;language:Language;onBack:()=>void;onChoose:(id:LabId)=>void}) {
  const lab=labs.find(item=>item.id===labId)??labs[0];
  const w=words[language];
  const [values,setValues]=useState<Record<string,number>>(()=>Object.fromEntries(lab.params.map(p=>[p.key,p.initial])));
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speedFactor,setSpeedFactor]=useState(1);
  const [showGrid,setShowGrid]=useState(true);
  const [showVectors,setShowVectors]=useState(true);
  const [showTrail,setShowTrail]=useState(true);
  const [notice,setNotice]=useState("");
  const [drawerTab,setDrawerTab]=useState<"model"|"parameters"|"equations"|"tools">("parameters");
  const [showRuler,setShowRuler]=useState(false);
  const [graphMode,setGraphMode]=useState<"trajectory"|"position-time"|"velocity-time"|"acceleration-time">("trajectory");
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const drawRef=useRef<()=>void>(()=>{});
  const timeRef=useRef(0);
  const fileRef=useRef<HTMLInputElement>(null);
  const points=useMemo(()=>makePoints(lab,values),[lab,values]);
  const duration=points[points.length-1]?.t??1;
  const current=points[Math.min(points.length-1,Math.round(time/duration*(points.length-1)))]??points[0];
  const metrics=metricsFor(lab,values,current,points,language);

  useEffect(()=>{
    const initial=Object.fromEntries(lab.params.map(p=>[p.key,p.initial]));
    setValues(initial);setTime(0);timeRef.current=0;setPlaying(false);setNotice("");
  },[lab.id]);

  useEffect(()=>{
    if(!playing)return;
    let frame=0,last=0;
    const tick=(now:number)=>{
      if(!last)last=now;
      const next=timeRef.current+Math.min((now-last)/1000,.05)*speedFactor;
      last=now;timeRef.current=Math.min(next,duration);setTime(timeRef.current);
      if(next>=duration){setPlaying(false);return;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[playing,duration,speedFactor]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const render=()=>{
      const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const cw=Math.round(rect.width*dpr),ch=Math.round(rect.height*dpr);
      if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const width=rect.width,height=rect.height,left=76,right=34,top=36,bottom=65;
      const pw=width-left-right,ph=height-top-bottom;
      ctx.clearRect(0,0,width,height);ctx.fillStyle="#fff";ctx.fillRect(0,0,width,height);
      const plotted=graphMode==="trajectory"?points:points.map((p,i)=>{
        const acceleration=lab.id==="mru"?0:lab.id==="mrua"?values.acceleration??0:lab.id==="incline"?Math.max(0,(values.gravity??9.81)*(Math.sin((values.angle??0)*Math.PI/180)-(values.friction??0)*Math.cos((values.angle??0)*Math.PI/180))):lab.id==="spring"?-(values.spring??0)/(values.mass??1)*p.x:lab.id==="circular"?-((values.omega??0)**2)*p.x:lab.id==="energy"?(values.gravity??9.81)*(Math.sin(Math.PI/6)-(values.friction??0)*Math.cos(Math.PI/6)):lab.id==="projectile"?-(values.gravity??9.81):(i===0?0:(points[i].vx-points[i-1].vx)/Math.max(.000001,points[i].t-points[i-1].t));
        return graphMode==="position-time"?{...p,x:p.t,y:p.x}:graphMode==="velocity-time"?{...p,x:p.t,y:p.vx}:{...p,x:p.t,y:acceleration};
      });
      const plottedCurrent=graphMode==="trajectory"?current:plotted[Math.min(plotted.length-1,Math.round(time/duration*(plotted.length-1)))];
      let minX=Math.min(...plotted.map(p=>p.x)),maxX=Math.max(...plotted.map(p=>p.x));
      let minY=Math.min(...plotted.map(p=>p.y)),maxY=Math.max(...plotted.map(p=>p.y));
      if(graphMode==="trajectory"){
        if(lab.id==="circular"){minX=-values.radius*1.3;maxX=values.radius*1.3;minY=-values.radius*1.3;maxY=values.radius*1.3;}
        if(lab.id==="spring"){minX=-values.amplitude*1.35;maxX=values.amplitude*1.35;minY=-.5;maxY=.5;}
        if(lab.id==="mru"||lab.id==="mrua"||lab.id==="incline"){minY=-1;maxY=1;}
        if(lab.id==="energy"){minY=0;maxY=values.height*1.2;}
        if(lab.id==="projectile"){minY=0;maxY=Math.max(1,maxY*1.18);}
      }
      const padX=Math.max((maxX-minX)*.08,.5),padY=Math.max((maxY-minY)*.08,.5);
      minX-=padX;maxX+=padX;minY-=padY;maxY+=padY;
      const sx=(maxX-minX)||1,sy=(maxY-minY)||1;
      const X=(x:number)=>left+(x-minX)/sx*pw;
      const Y=(y:number)=>top+ph-(y-minY)/sy*ph;
      const x0=X(Math.max(minX,Math.min(maxX,0))),y0=Y(Math.max(minY,Math.min(maxY,0)));
      if(showGrid){
        ctx.strokeStyle="#e9eef4";ctx.lineWidth=1;
        for(let i=0;i<=8;i++){const gx=left+pw*i/8,gy=top+ph*i/6;ctx.beginPath();ctx.moveTo(gx,top);ctx.lineTo(gx,top+ph);ctx.stroke();ctx.beginPath();ctx.moveTo(left,gy);ctx.lineTo(left+pw,gy);ctx.stroke();}
      }
      ctx.strokeStyle="#8b9bad";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(left,Math.min(top+ph,Math.max(top,y0)));ctx.lineTo(left+pw,Math.min(top+ph,Math.max(top,y0)));ctx.stroke();
      ctx.beginPath();ctx.moveTo(Math.min(left+pw,Math.max(left,x0)),top);ctx.lineTo(Math.min(left+pw,Math.max(left,x0)),top+ph);ctx.stroke();
      ctx.fillStyle="#77889b";ctx.font="12px Inter, sans-serif";ctx.textAlign="center";
      for(let i=0;i<=4;i++){const val=minX+sx*i/4;ctx.fillText(val.toFixed(1),left+pw*i/4,top+ph+25);}
      ctx.textAlign="right";
      for(let i=0;i<=4;i++){const val=minY+sy*i/4;ctx.fillText(val.toFixed(1),left-12,top+ph-ph*i/4+4);}
      ctx.fillStyle="#60758c";ctx.font="600 12px Inter, sans-serif";ctx.textAlign="center";
      ctx.fillText(graphMode==="trajectory"?(lab.id==="circular"||lab.id==="spring"?"x (m)":lab.id==="energy"?(language==="ID"?"Jarak sepanjang bidang (m)":"Distance along slope (m)"):(language==="ID"?"Posisi / jarak (m)":"Position / distance (m)")):(language==="ID"?"Waktu (s)":"Time (s)"),left+pw/2,height-14);
      ctx.save();ctx.translate(19,top+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(graphMode==="trajectory"?(lab.id==="energy"?(language==="ID"?"Ketinggian (m)":"Height (m)"):lab.id==="circular"?"y (m)":lab.id==="spring"?"—":(language==="ID"?"Posisi vertikal (m)":"Vertical position (m)")):graphMode==="position-time"?(language==="ID"?"Posisi (m)":"Position (m)"):graphMode==="velocity-time"?(language==="ID"?"Kecepatan (m/s)":"Velocity (m/s)"):(language==="ID"?"Percepatan (m/s²)":"Acceleration (m/s²)"),0,0);ctx.restore();

      if(graphMode==="trajectory"&&lab.id==="circular"){
        const r=values.radius;
        ctx.beginPath();ctx.arc(X(0),Y(0),r*Math.min(pw/sx,ph/sy),0,Math.PI*2);ctx.strokeStyle="#d8cfee";ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.stroke();ctx.setLineDash([]);
      }
      if(showTrail){
        ctx.beginPath();
        const end=Math.max(1,Math.round(time/duration*(points.length-1)));
        plotted.slice(0,end+1).forEach((p,i)=>{if(i===0)ctx.moveTo(X(p.x),Y(p.y));else ctx.lineTo(X(p.x),Y(p.y));});
        ctx.strokeStyle=lab.color;ctx.lineWidth=3.5;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
      }else if(points.length>1){
        ctx.beginPath();plotted.forEach((p,i)=>{if(i===0)ctx.moveTo(X(p.x),Y(p.y));else ctx.lineTo(X(p.x),Y(p.y));});
        ctx.strokeStyle="#c6d4e3";ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.stroke();ctx.setLineDash([]);
      }
      const px=X(plottedCurrent.x),py=Y(plottedCurrent.y);
      if(showRuler){
        ctx.strokeStyle="#d99a46";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,top+ph);ctx.moveTo(left,py);ctx.lineTo(left+pw,py);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="#9b6b27";ctx.font="11px DM Sans";ctx.textAlign="left";ctx.fillText(`${plottedCurrent.x.toFixed(2)}, ${plottedCurrent.y.toFixed(2)}`,Math.min(px+9,left+pw-100),Math.max(top+14,py-9));
      }
      if(showVectors&&graphMode==="trajectory"){
        if(lab.id==="projectile"||lab.id==="circular"){
          const scale=.22;
          drawArrow(ctx,px,py,px+current.vx*scale/sx*pw,py-current.vy*scale/sy*ph,"#d99a46");
        }else if(lab.id==="spring"||lab.id==="mru"||lab.id==="mrua"){
          drawArrow(ctx,px,py,px+current.vx*.25/sx*pw,py,"#d99a46");
        }
      }
      ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fillStyle=lab.color;ctx.shadowColor=lab.color+"55";ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();
      if(graphMode==="trajectory"&&lab.id==="projectile"){ctx.strokeStyle="#b6d3ef";ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,Y(0));ctx.stroke();ctx.setLineDash([]);}
      if(graphMode==="trajectory"&&lab.id==="projectile"){ctx.strokeStyle="#b9ddcf";ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(X(0),py);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle="#8494a6";ctx.font="11px Inter";ctx.textAlign="left";ctx.fillText("t = "+time.toFixed(2)+" s",left+12,top+20);
    };
    drawRef.current=render;render();
  },[lab,values,points,time,current,showGrid,showVectors,showTrail,showRuler,graphMode]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const observer=new ResizeObserver(()=>drawRef.current());observer.observe(canvas);
    return()=>observer.disconnect();
  },[]);

  const changeParam=(key:string,value:number)=>{
    setValues(prev=>({...prev,[key]:value}));timeRef.current=0;setTime(0);setPlaying(false);
  };
  const reset=()=>{timeRef.current=0;setTime(0);setPlaying(false);};
  const togglePlay=()=>{
    if(playing){setPlaying(false);return;}
    if(timeRef.current>=duration){timeRef.current=0;setTime(0);}
    setPlaying(true);
  };
  const seek=(value:number)=>{const next=Math.max(0,Math.min(duration,value));timeRef.current=next;setTime(next);if(next>=duration)setPlaying(false);};

  const exportCsv=()=>{
    const rows=["time_s,x_m,y_m,vx_m_s,vy_m_s,speed_m_s,kinetic_J,potential_J"];
    points.forEach(p=>rows.push([p.t,p.x,p.y,p.vx,p.vy,p.speed,p.kinetic,p.potential].map(n=>n.toFixed(7)).join(",")));
    downloadFile("physimus-"+lab.id+".csv",rows.join("\n"),"text/csv;charset=utf-8");setNotice(language==="ID"?"CSV siap diunduh":"CSV ready");
  };
  const saveProject=()=>{
    downloadFile("physimus-"+lab.id+".physimus.json",JSON.stringify({format:"physimus-lab-v1",labId:lab.id,values},null,2),"application/json");
    setNotice(words[language].projectSaved);
  };
  const loadProject=(event:ChangeEvent<HTMLInputElement>)=>{
    const input=event.currentTarget,file=input.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(String(reader.result)) as {format?:string;labId?:string;values?:Record<string,number>};
        if(data.format!=="physimus-lab-v1"||data.labId!==lab.id||!data.values)throw new Error("Invalid");
        const next:Record<string,number>={};
        for(const param of lab.params){
          const n=data.values[param.key];
          if(typeof n!=="number"||!Number.isFinite(n))throw new Error("Invalid parameter");
          next[param.key]=Math.max(param.min,Math.min(param.max,n));
        }
        setValues(next);reset();setNotice(words[language].projectLoaded);
      }catch{setNotice(words[language].projectError);}
      input.value="";
    };
    reader.readAsText(file);
  };
  const activeLabLabel=tLabel(language,lab);
  return <main className="workspace-page">
    <div className="workspace-heading">
      <div><button className="breadcrumb" onClick={onBack}><ArrowLeft size={16}/>{words[language].discoverMore}</button><div className="workspace-title-line"><span className="eyebrow">{categoryText(language,lab.category)}</span><span className="model-pill">{w.model}</span></div><h1>{language==="ID"?lab.title:lab.subtitle}</h1><p>{activeLabLabel.description}</p></div>
      <div className="workspace-actions">
        <button className="secondary-button" onClick={()=>onChoose(lab.id)}><ChevronDown size={17}/>{w.laboratory}</button>
        <button className="secondary-button" onClick={()=>fileRef.current?.click()}><Upload size={17}/>{w.load}</button>
        <button className="secondary-button" onClick={saveProject}><Save size={17}/>{w.save}</button>
        <input ref={fileRef} className="hidden-file" type="file" accept=".json,.physimus.json,application/json" onChange={loadProject}/>
      </div>
    </div>
    <div className="lab-studio">
      <aside className="control-drawer">
        <nav className="drawer-rail" aria-label={language==="ID"?"Panel laboratorium":"Laboratory panels"}>
          <button className={drawerTab==="parameters"?"selected":""} onClick={()=>setDrawerTab("parameters")} title={w.parameters}><SlidersHorizontal/><span>{language==="ID"?"Atur":"Setup"}</span></button>
          <button className={drawerTab==="equations"?"selected":""} onClick={()=>setDrawerTab("equations")} title={w.expr}><Atom/><span>{language==="ID"?"Rumus":"Math"}</span></button>
          <button className={drawerTab==="tools"?"selected":""} onClick={()=>setDrawerTab("tools")} title={language==="ID"?"Alat grafik":"Graph tools"}><Settings2/><span>{language==="ID"?"Alat":"Tools"}</span></button>
          <button className={drawerTab==="model"?"selected":""} onClick={()=>setDrawerTab("model")} title={w.question}><CircleHelp/><span>{language==="ID"?"Model":"Model"}</span></button>
        </nav>
        <div className="drawer-content">
          {drawerTab==="parameters"&&<><div className="panel-title"><span>01</span><h2>{w.parameters}</h2></div><div className="parameter-list">{lab.params.map(param=><Slider key={param.key} param={{...param,label:parameterText(language,param.key,param.label)}} value={values[param.key]} onChange={v=>changeParam(param.key,v)}/>)}</div></>}
          {drawerTab==="equations"&&<><div className="panel-title"><span>02</span><h2>{w.expr}</h2></div><div className="formula-box"><Equation value={lab.formula} display/></div><p className="drawer-help">{language==="ID"?"Persamaan ditampilkan dalam notasi LaTeX. Variabel mengikuti parameter eksperimen yang aktif.":"Equations are rendered from LaTeX. Variables follow the active experiment parameters."}</p><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div></>}
          {drawerTab==="tools"&&<><div className="panel-title"><span>03</span><h2>{language==="ID"?"Alat grafik":"Graph tools"}</h2></div><label className="tool-select-label">{language==="ID"?"Jenis grafik":"Graph type"}<select value={graphMode} onChange={e=>setGraphMode(e.target.value as typeof graphMode)}><option value="trajectory">{language==="ID"?"Lintasan / bidang":"Trajectory / plane"}</option><option value="position-time">{language==="ID"?"Posisi–waktu (x–t)":"Position–time (x–t)"}</option><option value="velocity-time">{language==="ID"?"Kecepatan–waktu (v–t)":"Velocity–time (v–t)"}</option><option value="acceleration-time">{language==="ID"?"Percepatan–waktu (a–t)":"Acceleration–time (a–t)"}</option></select></label><button className={showRuler?"drawer-tool active": "drawer-tool"} onClick={()=>setShowRuler(v=>!v)}>{language==="ID"?"Penggaris koordinat":"Coordinate ruler"}<span>{showRuler?"ON":"OFF"}</span></button><button className={showGrid?"drawer-tool active":"drawer-tool"} onClick={()=>setShowGrid(v=>!v)}>{w.grid}<span>{showGrid?"ON":"OFF"}</span></button><button className={showVectors?"drawer-tool active":"drawer-tool"} onClick={()=>setShowVectors(v=>!v)}>{w.vectors}<span>{showVectors?"ON":"OFF"}</span></button><button className={showTrail?"drawer-tool active":"drawer-tool"} onClick={()=>setShowTrail(v=>!v)}>{w.trail}<span>{showTrail?"ON":"OFF"}</span></button><p className="drawer-help">{language==="ID"?"Penggaris menampilkan garis bantu dan koordinat titik saat ini. Grafik waktu memakai sumbu horizontal t.":"The ruler shows guide lines and the current point coordinates. Time plots use t on the horizontal axis."}</p></>}
          {drawerTab==="model"&&<><div className="panel-title"><span>04</span><h2>{w.assumptions}</h2></div><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div><p className="drawer-help">{lab.id==="projectile"?w.noDrag:language==="ID"?"Model menggunakan parameter ideal. Batasan dan asumsi disederhanakan untuk pembelajaran.":"This is an idealized teaching model. Some real-world effects are intentionally simplified."}</p></>}
        </div>
      </aside>
      <section className="graph-panel">
        <div className="graph-header"><div><span className="eyebrow">{w.graph}</span><strong>{language==="ID"?"Visualisasi sistem":"System visualization"}</strong></div><div className="graph-tools">
          <button className={showGrid?"tool-active":""} onClick={()=>setShowGrid(v=>!v)} title={w.grid}><Grid3X3 size={18}/><span>{w.grid}</span></button>
          <button className={showVectors?"tool-active":""} onClick={()=>setShowVectors(v=>!v)} title={w.vectors}><Activity size={18}/><span>{w.vectors}</span></button>
          <button className={showTrail?"tool-active":""} onClick={()=>setShowTrail(v=>!v)} title={w.trail}><Waves size={18}/><span>{w.trail}</span></button>
        </div></div>
        <div className="canvas-area"><canvas ref={canvasRef} aria-label="Interactive physics simulation graph"/><div className="canvas-label">{(language==="ID"?lab.title:lab.subtitle).toUpperCase()} · {language==="ID"?"SATUAN SI":"SI UNITS"}</div></div>
        <div className="playback-bar">
          <button className="play-control" onClick={togglePlay} aria-label={playing?w.pause:w.play}>{playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor"/>}</button>
          <button className="reset-control" onClick={reset} aria-label={w.reset}><RotateCcw size={19}/></button>
          <div className="timeline"><div><span>{w.time}</span><strong>{time.toFixed(2)} s <small>/ {duration.toFixed(2)} s</small></strong></div><input type="range" min="0" max={duration} step={duration/600} value={time} onChange={e=>seek(Number(e.target.value))}/></div>
          <div className="play-speeds">{[.5,1,2].map(v=><button key={v} className={speedFactor===v?"selected":""} onClick={()=>setSpeedFactor(v)}>{v}×</button>)}</div>
        </div>
        <div className="measurement-area"><div className="measurement-heading"><span>03</span><strong>{w.values}</strong></div><div className="measurement-grid">{metrics.map(([label,value,unit])=><div className="measurement" key={label}><span>{label}</span><strong>{Number.isFinite(value)?value.toFixed(2):"—"} <small>{unit}</small></strong></div>)}</div></div>
        <div className="graph-footer"><span className="ready-dot"/>{w.status}<span className="footer-spacer"/><button onClick={exportCsv}><Download size={16}/>{w.export}</button><button onClick={reset}><RotateCcw size={15}/>{w.resetView}</button>{notice&&<span className="notice"><Check size={15}/>{notice}</span>}</div>
      </section>
    </div>
  </main>;
}

function Learn({language,onOpen}:{language:Language;onOpen:(id:LabId)=>void}) {
  const w=words[language];
  return <main className="secondary-page"><div className="secondary-intro"><span className="eyebrow">PHYSIMUS ACADEMY</span><h1>{w.learnTitle}</h1><p>{w.learnText}</p></div>
    <div className="learning-list">{labs.map(lab=><article className="learning-row" key={lab.id}><div><span className="eyebrow">{lab.category}</span><h2>{language==="ID"?lab.title:lab.subtitle}</h2><p>{tLabel(language,lab).description}</p><div className="learning-formula"><Equation value={lab.formula}/></div></div><button className="secondary-button" onClick={()=>onOpen(lab.id)}>{w.experiment}<ArrowRight size={17}/></button></article>)}</div>
  </main>;
}

function Sandbox({language,onOpen}:{language:Language;onOpen:(id:LabId)=>void}) {
  const w=words[language];
  const [selected,setSelected]=useState<LabId>("projectile");
  const lab=labs.find(item=>item.id===selected)??labs[0];
  return <main className="secondary-page sandbox-page"><div className="secondary-intro"><span className="eyebrow">PHYSIMUS SANDBOX / MECHANICS</span><h1>{w.sandboxTitle}</h1><p>{w.sandboxText}</p></div>
    <section className="sandbox-builder"><div className="sandbox-preview"><div className="sandbox-preview-grid"/><div className="sandbox-orbit"/><div className="sandbox-ball"/></div><div className="sandbox-config"><span className="eyebrow">{w.choose}</span><h2>{language==="ID"?lab.title:lab.subtitle}</h2><p>{tLabel(language,lab).description}</p><select value={selected} onChange={e=>setSelected(e.target.value as LabId)}>{labs.map(item=><option key={item.id} value={item.id}>{language==="ID"?item.title:item.subtitle}</option>)}</select><button className="primary-button" onClick={()=>onOpen(selected)}>{w.launch}<ArrowRight size={18}/></button></div></section>
  </main>;
}

export default function App() {
  const [page,setPage]=useState<Page>("discover");
  const [language,setLanguage]=useState<Language>("ID");
  const [selectedLab,setSelectedLab]=useState<LabId>("projectile");
  const openLab=(id:LabId)=>{setSelectedLab(id);setPage("laboratory");};
  return <div className="app-root">
    <Header page={page} setPage={setPage} language={language} onLanguage={setLanguage}/>
    {page==="discover"&&<Discover language={language} onOpen={openLab}/>}
    {page==="laboratory"&&<Laboratory key={selectedLab} labId={selectedLab} language={language} onBack={()=>setPage("discover")} onChoose={()=>setPage("discover")}/>}
    {page==="learn"&&<Learn language={language} onOpen={openLab}/>}
    {page==="sandbox"&&<Sandbox language={language} onOpen={openLab}/>}
  </div>;
}
