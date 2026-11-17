import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import katex from "katex";
const PhysicsSandbox = lazy(() => import("./PhysicsSandbox"));
import {
  Activity, ArrowLeft, ArrowRight, Atom, BookOpen, Check, ChevronDown,
  CircleHelp, Copy, Download, FlaskConical, Globe2, Grid3X3, Home as HomeIcon,
  Layers3, Pause, Play, RotateCcw, Save, Settings2, SlidersHorizontal,
  Sparkles, Upload, Waves, Maximize2, Minimize2, ZoomIn, ZoomOut, Sun, Moon
} from "lucide-react";

type Language = "ID" | "EN";
type Page = "discover" | "laboratory" | "learn" | "sandbox";
type Theme = "light" | "dark";
type MotionLevel = "low" | "medium" | "high";
type RenderMode = "auto" | "performance" | "detail";
type LayoutDensity = "comfortable" | "compact";
type LabId = "projectile" | "mru" | "mrua" | "circular" | "energy" | "incline" | "collision" | "spring";
type Param = { key: string; label: string; min: number; max: number; step: number; unit: string; initial: number };
type Point = { x: number; y: number; t: number; vx: number; vy: number; speed: number; kinetic: number; potential: number; x2?:number; vx2?:number; collisionOccurred?:boolean };
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
    params: [{key:"speed",label:"Kecepatan",min:1,max:30,step:.5,unit:"m/s",initial:8},{key:"x0",label:"Posisi awal",min:-50,max:50,step:.5,unit:"m",initial:0},{key:"mass",label:"Massa benda",min:.1,max:20,step:.1,unit:"kg",initial:1}],
    duration: 10, color:"#347fd5"
  },
  {
    id: "mrua", category: "KINEMATIKA", title: "Gerak Lurus Berubah Beraturan", subtitle: "Constant Acceleration",
    description: "Eksplorasi gerak satu dimensi dengan percepatan konstan. Coba percepatan positif, negatif, atau kondisi benda mulai diam.",
    formula: String.raw`x(t)=x_0+v_0t+\frac12at^2,\quad v(t)=v_0+at`,
    question: "Apa yang terjadi pada grafik posisi dan kecepatan ketika percepatan berubah tanda?",
    params: [
      {key:"speed",label:"Kecepatan awal",min:0,max:25,step:.5,unit:"m/s",initial:4},
      {key:"acceleration",label:"Percepatan",min:-5,max:5,step:.1,unit:"m/s²",initial:1.5},
      {key:"x0",label:"Posisi awal",min:-50,max:50,step:.5,unit:"m",initial:0},
      {key:"mass",label:"Massa benda",min:.1,max:20,step:.1,unit:"kg",initial:1}
    ], duration: 10, color:"#347fd5"
  },
  {
    id: "circular", category: "KINEMATIKA", title: "Gerak Melingkar Beraturan", subtitle: "Uniform Circular Motion",
    description: "Visualisasikan gerak melingkar, kecepatan sudut, kecepatan tangensial, dan percepatan sentripetal.",
    formula: String.raw`\theta(t)=\omega t,\quad v=\omega r,\quad a_c=\omega^2r`,
    question: "Jika jari-jari diperbesar pada kecepatan sudut tetap, bagaimana kelajuan dan percepatan sentripetal berubah?",
    params: [
      {key:"radius",label:"Jari-jari",min:.5,max:10,step:.1,unit:"m",initial:3},
      {key:"omega",label:"Kecepatan sudut",min:.2,max:5,step:.1,unit:"rad/s",initial:1.5},
      {key:"mass",label:"Massa benda",min:.1,max:20,step:.1,unit:"kg",initial:1}
    ], duration: 8, color:"#8b6bd6"
  },
  {
    id: "energy", category: "DINAMIKA & ENERGI", title: "Usaha dan Energi", subtitle: "Work and Energy",
    description: "Analisis usaha oleh gaya, perubahan energi kinetik, energi potensial, dan neraca energi ketika gesekan atau gaya nonkonservatif bekerja.",
    formula: String.raw`W_{\mathrm{net}}=\Delta K,\quad E_{m,f}=E_{m,i}+W_{\mathrm{nc}}`,
    question: "Bagaimana usaha total mengubah energi kinetik, dan ke mana energi mekanik berpindah ketika gesekan bekerja?",
    params: [
      {key:"mass",label:"Massa benda",min:.5,max:20,step:.5,unit:"kg",initial:2},
      {key:"height",label:"Ketinggian awal",min:1,max:20,step:.5,unit:"m",initial:8},
      {key:"friction",label:"Koefisien gesek kinetis μk",min:0,max:.5,step:.01,unit:"μk",initial:0},
      {key:"staticFriction",label:"Koefisien gesek statis μs",min:0,max:.8,step:.01,unit:"μs",initial:.3}
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
      {key:"friction",label:"Koefisien gesek kinetis μk",min:0,max:1,step:.01,unit:"μk",initial:.2},
      {key:"staticFriction",label:"Koefisien gesek statis μs",min:0,max:1,step:.01,unit:"μs",initial:.3},
      {key:"gravity",label:"Gravitasi",min:1,max:20,step:.01,unit:"m/s²",initial:9.81}
    ], duration: 8, color:"#4da786"
  },
  {
    id: "collision", category: "MOMENTUM & IMPULS", title: "Tumbukan Satu Dimensi", subtitle: "One-Dimensional Collisions",
    description: "Bandingkan tumbukan lenting sempurna hingga tidak lenting. Amati kekekalan momentum, impuls, koefisien restitusi, dan perubahan energi kinetik dua benda.",
    formula: String.raw`m_1u_1+m_2u_2=m_1v_1+m_2v_2,\quad e=\frac{v_2-v_1}{u_1-u_2}`,
    question: "Bagaimana koefisien restitusi memengaruhi kecepatan akhir dan energi kinetik setelah tumbukan?",
    params: [
      {key:"mass1",label:"Massa benda 1",min:.5,max:10,step:.1,unit:"kg",initial:2},
      {key:"mass2",label:"Massa benda 2",min:.5,max:10,step:.1,unit:"kg",initial:2},
      {key:"velocity1",label:"Kecepatan awal benda 1",min:0,max:12,step:.1,unit:"m/s",initial:6},
      {key:"velocity2",label:"Kecepatan awal benda 2",min:-6,max:6,step:.1,unit:"m/s",initial:0},
      {key:"separation",label:"Jarak awal antarbenda",min:2,max:12,step:.5,unit:"m",initial:6},
      {key:"restitution",label:"Koefisien restitusi",min:0,max:1,step:.05,unit:"e",initial:1}
    ], duration: 8, color:"#d99a46"
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

// Basic parameters are the high-impact controls. Advanced exposes all base values plus model-specific controls.
const basicParamKeys:Record<LabId,string[]>={projectile:["speed","angle","height","gravity"],mru:["x0","speed"],mrua:["x0","speed","acceleration"],circular:["radius","omega","mass"],energy:["mass","height","friction","staticFriction"],incline:["mass","angle","friction","staticFriction"],collision:["mass1","mass2","velocity1","velocity2","restitution"],spring:["mass","spring","amplitude"]};
const advancedParams:Record<LabId,Param[]>={
 projectile:[{key:"x0",label:"Posisi horizontal awal",min:-50,max:50,step:.1,unit:"m",initial:0},{key:"dragBeta",label:"Koefisien hambatan linear per massa β",min:0,max:1,step:.01,unit:"s⁻¹",initial:0}],mru:[],mrua:[],
 circular:[{key:"phaseDegrees",label:"Sudut fase awal",min:-360,max:360,step:1,unit:"°",initial:0}],
 energy:[{key:"inclineAngle",label:"Sudut bidang miring",min:1,max:60,step:1,unit:"°",initial:30},{key:"initialSpeed",label:"Kelajuan awal sepanjang bidang",min:0,max:15,step:.1,unit:"m/s",initial:0}],
 incline:[{key:"appliedForce",label:"Gaya luar sejajar bidang (+ menuruni bidang)",min:-100,max:100,step:.5,unit:"N",initial:0}],
 collision:[{key:"impactDuration",label:"Durasi kontak tumbukan",min:.005,max:.5,step:.005,unit:"s",initial:.05}],
 spring:[{key:"phaseDegrees",label:"Fase awal",min:-360,max:360,step:1,unit:"°",initial:0},{key:"dampingRatio",label:"Rasio redaman ζ",min:0,max:.95,step:.01,unit:"—",initial:0}]
};
function allLabParams(lab:Lab):Param[]{return [...lab.params,...advancedParams[lab.id]];}

type EquationEntry = { id:string; titleID:string; titleEN:string; formula:string; noteID:string; noteEN:string };
const equationLibrary: Record<LabId, EquationEntry[]> = {
 projectile:[
  {id:"components",titleID:"Komponen kecepatan",titleEN:"Velocity components",formula:String.raw`v_x=v_0\cos\theta,\quad v_y=v_0\sin\theta-gt`,noteID:"Komponen horizontal tetap, sedangkan komponen vertikal berubah karena gravitasi.",noteEN:"The horizontal component stays constant while the vertical component changes under gravity."},
  {id:"coordinates",titleID:"Posisi",titleEN:"Position",formula:String.raw`x(t)=x_0+v_0\cos\theta\,t,\quad y(t)=h_0+v_0\sin\theta\,t-\frac12gt^2`,noteID:"Posisi diperoleh dengan mengintegralkan komponen kecepatan terhadap waktu.",noteEN:"Position follows by integrating each velocity component over time."},
  {id:"flight",titleID:"Waktu hingga menyentuh tanah",titleEN:"Time to reach the ground",formula:String.raw`t_f=\frac{v_0\sin\theta+\sqrt{(v_0\sin\theta)^2+2gh_0}}{g}`,noteID:"Akar positif dipilih karena waktu fisik tidak negatif.",noteEN:"Choose the positive root because physical flight time cannot be negative."},
  {id:"peak",titleID:"Tinggi maksimum",titleEN:"Maximum height",formula:String.raw`H_{\max}=h_0+\frac{v_0^2\sin^2\theta}{2g}`,noteID:"Di titik tertinggi, kecepatan vertikal sesaat sama dengan nol.",noteEN:"At the apex, vertical velocity is momentarily zero."},
  {id:"range",titleID:"Jangkauan horizontal",titleEN:"Horizontal range",formula:String.raw`R=v_0\cos\theta\,t_f`,noteID:"Bentuk ini berlaku untuk ketinggian awal umum, termasuk h₀ bukan nol.",noteEN:"This form supports a nonzero launch height."}

 ],
 mru:[
  {id:"position",titleID:"Posisi",titleEN:"Position",formula:String.raw`x(t)=x_0+vt`,noteID:"Grafik x–t berupa garis lurus; gradiennya adalah kecepatan.",noteEN:"The x–t graph is a straight line whose slope is velocity."},
  {id:"velocity",titleID:"Kecepatan konstan",titleEN:"Constant velocity",formula:String.raw`v=\frac{\Delta x}{\Delta t}=\text{konstan}`,noteID:"Perpindahan per selang waktu selalu sama.",noteEN:"Displacement per time interval remains constant."},
  {id:"acceleration",titleID:"Percepatan",titleEN:"Acceleration",formula:String.raw`a=\frac{\Delta v}{\Delta t}=0`,noteID:"Karena kecepatan tidak berubah, percepatannya nol.",noteEN:"Since velocity does not change, acceleration is zero."}

 ],
 mrua:[
  {id:"position",titleID:"Posisi",titleEN:"Position",formula:String.raw`x=x_0+v_0t+\frac12at^2`,noteID:"Grafik posisi terhadap waktu berbentuk parabola jika percepatan tidak nol.",noteEN:"Position versus time is parabolic when acceleration is nonzero."},
  {id:"velocity",titleID:"Kecepatan",titleEN:"Velocity",formula:String.raw`v=v_0+at`,noteID:"Gradien grafik v–t sama dengan percepatan.",noteEN:"The slope of a velocity–time graph equals acceleration."},
  {id:"torricelli",titleID:"Relasi tanpa waktu",titleEN:"Time-independent relation",formula:String.raw`v^2=v_0^2+2a(x-x_0)`,noteID:"Berguna ketika waktu tidak diketahui atau tidak diperlukan.",noteEN:"Useful when time is unknown or not needed."},
  {id:"displacement",titleID:"Kecepatan rata-rata",titleEN:"Average velocity",formula:String.raw`\Delta x=\frac{v_0+v}{2}\,t`,noteID:"Berlaku untuk percepatan konstan satu dimensi.",noteEN:"Valid for constant one-dimensional acceleration."}

 ],
 circular:[
  {id:"angular",titleID:"Posisi sudut",titleEN:"Angular position",formula:String.raw`\theta(t)=\theta_0+\omega t`,noteID:"Kecepatan sudut konstan menghasilkan perubahan sudut linear terhadap waktu.",noteEN:"Constant angular velocity gives a linear change in angle over time."},
  {id:"linear",titleID:"Hubungan linear dan sudut",titleEN:"Linear–angular relation",formula:String.raw`v=\omega r,\quad s=r\theta`,noteID:"Sudut θ harus dinyatakan dalam radian pada persamaan panjang busur.",noteEN:"Angle θ must be in radians in the arc-length relation."},
  {id:"period",titleID:"Periode dan frekuensi",titleEN:"Period and frequency",formula:String.raw`T=\frac{2\pi}{\omega},\quad f=\frac1T=\frac{\omega}{2\pi}`,noteID:"Periode adalah waktu untuk satu putaran penuh.",noteEN:"The period is the time required for one complete revolution."},
  {id:"centripetal",titleID:"Percepatan sentripetal",titleEN:"Centripetal acceleration",formula:String.raw`a_c=\frac{v^2}{r}=\omega^2r`,noteID:"Arah percepatan selalu menuju pusat lintasan.",noteEN:"Acceleration always points toward the center of the path."}

 ],
 energy:[
  {id:"mechanical",titleID:"Energi mekanik",titleEN:"Mechanical energy",formula:String.raw`E_m=E_k+E_p=\frac12mv^2+mgh`,noteID:"Energi mekanik adalah jumlah energi kinetik dan potensial gravitasi.",noteEN:"Mechanical energy is the sum of kinetic and gravitational potential energy."},
  {id:"work",titleID:"Usaha oleh gesekan",titleEN:"Work done by friction",formula:String.raw`W_f=-f_ks=-\mu_kmg\cos\alpha\,s`,noteID:"Tanda negatif menunjukkan gaya gesek berlawanan arah dengan perpindahan.",noteEN:"The negative sign indicates friction acts opposite to displacement."},
  {id:"energybalance",titleID:"Teorema usaha–energi",titleEN:"Work–energy theorem",formula:String.raw`K_f-K_i=W_{\mathrm{net}}`,noteID:"Usaha total sama dengan perubahan energi kinetik.",noteEN:"Net work equals the change in kinetic energy."},
  {id:"conservation",titleID:"Energi dan gaya nonkonservatif",titleEN:"Energy and non-conservative work",formula:String.raw`E_{m,f}=E_{m,i}+W_{\mathrm{nc}}`,noteID:"Gesekan dapat mengurangi energi mekanik dan mentransfer energi menjadi energi termal.",noteEN:"Friction can reduce mechanical energy and transfer energy into thermal energy."}

 ],
 incline:[
  {id:"weight",titleID:"Komponen gaya berat",titleEN:"Weight components",formula:String.raw`F_{\parallel}=mg\sin\theta,\quad F_{\perp}=mg\cos\theta`,noteID:"Gaya berat diuraikan sejajar dan tegak lurus bidang miring.",noteEN:"Resolve weight into components parallel and perpendicular to the incline."},
  {id:"normal",titleID:"Gaya normal",titleEN:"Normal force",formula:String.raw`N=mg\cos\theta`,noteID:"Berlaku jika tidak ada percepatan tegak lurus bidang dan tidak ada gaya normal tambahan.",noteEN:"Applies when there is no perpendicular acceleration or additional normal force."},
  {id:"friction",titleID:"Gaya gesek kinetik",titleEN:"Kinetic friction",formula:String.raw`f_k=\mu_kN`,noteID:"Gesekan statis memerlukan analisis ambang gerak tersendiri.",noteEN:"Static friction requires a separate threshold analysis."},
  {id:"acceleration",titleID:"Percepatan sepanjang bidang",titleEN:"Acceleration along the incline",formula:String.raw`a=g(\sin\theta-\mu_k\cos\theta)`,noteID:"Berlaku saat balok meluncur turun dan arah positif dipilih menuruni bidang.",noteEN:"Valid for downhill sliding with downhill chosen as positive."},
  {id:"threshold",titleID:"Ambang mulai meluncur",titleEN:"Threshold for sliding",formula:String.raw`\tan\theta>\mu_s`,noteID:"Untuk mulai bergerak dari diam, gunakan koefisien gesek statis μs, bukan μk.",noteEN:"For motion to begin from rest, use static friction μs, not kinetic friction μk."}

 ],
 collision:[
  {id:"momentum",titleID:"Kekekalan momentum",titleEN:"Conservation of momentum",formula:String.raw`m_1u_1+m_2u_2=m_1v_1+m_2v_2`,noteID:"Momentum total sistem dua benda tetap jika resultan impuls eksternal dapat diabaikan.",noteEN:"Total system momentum is conserved when external impulse is negligible."},
  {id:"restitution",titleID:"Koefisien restitusi",titleEN:"Coefficient of restitution",formula:String.raw`e=\frac{v_2-v_1}{u_1-u_2},\quad 0\le e\le1`,noteID:"e = 1 lenting sempurna; e = 0 tidak lenting sama sekali pada arah normal tumbukan.",noteEN:"e = 1 is perfectly elastic; e = 0 is perfectly inelastic along the collision axis."},
  {id:"impulse",titleID:"Impuls pada benda 1",titleEN:"Impulse on body 1",formula:String.raw`J_1=\Delta p_1=m_1(v_1-u_1)`,noteID:"Impuls adalah perubahan momentum dan sama dengan integral gaya terhadap waktu.",noteEN:"Impulse is the change in momentum and equals the time integral of force."},
  {id:"kinetic",titleID:"Energi kinetik total",titleEN:"Total kinetic energy",formula:String.raw`K=\frac12m_1v_1^2+\frac12m_2v_2^2`,noteID:"Momentum selalu kekal pada sistem terisolasi, tetapi energi kinetik hanya kekal pada tumbukan lenting sempurna.",noteEN:"Momentum is conserved in an isolated system, while kinetic energy is conserved only in an elastic collision."},
  {id:"final",titleID:"Kecepatan akhir",titleEN:"Final velocities",formula:String.raw`v_1=\frac{m_1u_1+m_2u_2-m_2e(u_1-u_2)}{m_1+m_2},\quad v_2=v_1+e(u_1-u_2)`,noteID:"Hasil diperoleh dari gabungan kekekalan momentum dan definisi koefisien restitusi.",noteEN:"These results combine momentum conservation with the coefficient-of-restitution definition."}

 ],
 spring:[
  {id:"hooke",titleID:"Hukum Hooke",titleEN:"Hooke's law",formula:String.raw`F=-kx`,noteID:"Tanda negatif menunjukkan gaya pegas mengarah menuju posisi setimbang.",noteEN:"The negative sign means spring force points toward equilibrium."},
  {id:"motion",titleID:"Gerak",titleEN:"Motion",formula:String.raw`x(t)=A\cos(\omega t+\phi)`,noteID:"Fase awal φ menentukan posisi dan arah gerak pada t = 0.",noteEN:"Initial phase φ determines position and direction at t = 0."},
  {id:"frequency",titleID:"Frekuensi sudut",titleEN:"Angular frequency",formula:String.raw`\omega=\sqrt{\frac{k}{m}}`,noteID:"Pegas lebih kaku meningkatkan frekuensi; massa lebih besar menurunkannya.",noteEN:"A stiffer spring increases frequency; a larger mass decreases it."},
  {id:"period",titleID:"Periode dan frekuensi",titleEN:"Period and frequency",formula:String.raw`T=2\pi\sqrt{\frac{m}{k}},\quad f=\frac1T`,noteID:"Periode adalah waktu satu osilasi penuh pada model pegas ideal.",noteEN:"The period is the time for one full oscillation in the ideal spring model."},
  {id:"energy",titleID:"Energi osilasi",titleEN:"Oscillation energy",formula:String.raw`E=\frac12mv^2+\frac12kx^2=\frac12kA^2`,noteID:"Tanpa redaman, energi mekanik total tetap.",noteEN:"Without damping, total mechanical energy remains constant."}
 ]
};


type CalcField = { key:string; labelID:string; labelEN:string; unit:string; initial:number; min?:number; max?:number; step?:number };
type CalcResult = { substitution:string; value:string; unit:string };
type CalcDefinition = { id:string; titleID:string; titleEN:string; formula:string; noteID:string; noteEN:string; fields:CalcField[]; evaluate:(v:Record<string,number>)=>CalcResult };
const calculatorDefinitions: Record<LabId, CalcDefinition[]> = {
 projectile:[
  {id:"range",titleID:"Jangkauan horizontal",titleEN:"Horizontal range",formula:"R=v_0\\cos\\theta\\,t_f",noteID:"Waktu terbang dihitung dari persamaan vertikal. Sudut masukan dalam derajat.",noteEN:"Flight time comes from the vertical equation. Angle input is in degrees.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial speed",unit:"m/s",initial:24,min:0,step:.1},{key:"theta",labelID:"Sudut",labelEN:"Angle",unit:"°",initial:52,min:0,max:90,step:1},{key:"h0",labelID:"Ketinggian awal",labelEN:"Initial height",unit:"m",initial:0,min:0,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01}],evaluate:v=>{const vy=v.v0*Math.sin(v.theta*Math.PI/180),tf=(vy+Math.sqrt(vy*vy+2*v.g*v.h0))/v.g,r=v.v0*Math.cos(v.theta*Math.PI/180)*tf;return{substitution:"R=("+v.v0.toFixed(2)+") cos("+v.theta.toFixed(1)+"°) ("+tf.toFixed(3)+" s)",value:r.toFixed(3),unit:"m"};}},
  {id:"peak",titleID:"Tinggi maksimum",titleEN:"Maximum height",formula:"H_{\\max}=h_0+\\frac{v_0^2\\sin^2\\theta}{2g}",noteID:"Di titik tertinggi, komponen kecepatan vertikal sama dengan nol.",noteEN:"At the apex, the vertical velocity component is zero.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial speed",unit:"m/s",initial:24,min:0,step:.1},{key:"theta",labelID:"Sudut",labelEN:"Angle",unit:"°",initial:52,min:0,max:90,step:1},{key:"h0",labelID:"Ketinggian awal",labelEN:"Initial height",unit:"m",initial:0,min:0,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01}],evaluate:v=>{const h=v.h0+(v.v0*Math.sin(v.theta*Math.PI/180))**2/(2*v.g);return{substitution:"H = "+v.h0.toFixed(2)+" + ("+v.v0.toFixed(2)+")² sin²("+v.theta.toFixed(1)+"°) / (2 × "+v.g.toFixed(2)+")",value:h.toFixed(3),unit:"m"};}}
  ,{id:"flightTime",titleID:"Waktu terbang",titleEN:"Time of flight",formula:"t_f=\\frac{v_0\\sin\\theta+\\sqrt{(v_0\\sin\\theta)^2+2gh_0}}{g}",noteID:"Waktu sampai benda kembali ke ketinggian acuan. Model mengabaikan hambatan udara.",noteEN:"Time until the projectile returns to the reference height. Air resistance is neglected.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial speed",unit:"m/s",initial:24,min:0,step:.1},{key:"theta",labelID:"Sudut",labelEN:"Angle",unit:"°",initial:52,min:0,max:90,step:1},{key:"h0",labelID:"Ketinggian awal",labelEN:"Initial height",unit:"m",initial:0,min:0,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01}],evaluate:v=>{const vy=v.v0*Math.sin(v.theta*Math.PI/180),t=(vy+Math.sqrt(vy*vy+2*v.g*v.h0))/v.g;return{substitution:"t_f = ["+vy.toFixed(3)+" + √("+vy.toFixed(3)+"² + 2("+v.g.toFixed(2)+")("+v.h0.toFixed(2)+"))] / "+v.g.toFixed(2),value:t.toFixed(3),unit:"s"};}}
 ],
 mru:[
  {id:"position",titleID:"Posisi akhir",titleEN:"Final position",formula:"x=x_0+vt",noteID:"Gerak lurus beraturan memiliki kecepatan konstan dan percepatan nol.",noteEN:"Uniform linear motion has constant velocity and zero acceleration.",fields:[{key:"x0",labelID:"Posisi awal",labelEN:"Initial position",unit:"m",initial:0,step:.1},{key:"v",labelID:"Kecepatan",labelEN:"Velocity",unit:"m/s",initial:8,step:.1},{key:"t",labelID:"Waktu",labelEN:"Time",unit:"s",initial:5,min:0,step:.1}],evaluate:v=>({substitution:"x = "+v.x0.toFixed(2)+" + ("+v.v.toFixed(2)+")("+v.t.toFixed(2)+")",value:(v.x0+v.v*v.t).toFixed(3),unit:"m"})},
  {id:"velocity",titleID:"Kecepatan rata-rata",titleEN:"Average velocity",formula:"v=\\frac{\\Delta x}{\\Delta t}",noteID:"Gunakan perpindahan bertanda, bukan selalu jarak total.",noteEN:"Use signed displacement, not necessarily total distance.",fields:[{key:"dx",labelID:"Perpindahan",labelEN:"Displacement",unit:"m",initial:40,step:.1},{key:"dt",labelID:"Selang waktu",labelEN:"Time interval",unit:"s",initial:5,min:.01,step:.1}],evaluate:v=>({substitution:"v = "+v.dx.toFixed(2)+" / "+v.dt.toFixed(2),value:(v.dx/v.dt).toFixed(3),unit:"m/s"})}
  ,{id:"time",titleID:"Waktu tempuh",titleEN:"Elapsed time",formula:"t=\\frac{\\Delta x}{v}",noteID:"Untuk gerak lurus beraturan dengan kecepatan konstan dan tidak nol.",noteEN:"For uniform motion with constant, non-zero velocity.",fields:[{key:"dx",labelID:"Perpindahan",labelEN:"Displacement",unit:"m",initial:40,step:.1},{key:"v",labelID:"Kecepatan",labelEN:"Velocity",unit:"m/s",initial:8,min:.01,step:.1}],evaluate:v=>({substitution:"t = "+v.dx.toFixed(2)+" / "+v.v.toFixed(2),value:(v.dx/v.v).toFixed(3),unit:"s"})}
 ],
 mrua:[
  {id:"velocity",titleID:"Kecepatan akhir",titleEN:"Final velocity",formula:"v=v_0+at",noteID:"Percepatan konstan mengubah kecepatan secara linear terhadap waktu.",noteEN:"Constant acceleration changes velocity linearly with time.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial velocity",unit:"m/s",initial:4,step:.1},{key:"a",labelID:"Percepatan",labelEN:"Acceleration",unit:"m/s²",initial:1.5,step:.1},{key:"t",labelID:"Waktu",labelEN:"Time",unit:"s",initial:5,min:0,step:.1}],evaluate:v=>({substitution:"v = "+v.v0.toFixed(2)+" + ("+v.a.toFixed(2) + ")("+v.t.toFixed(2)+")",value:(v.v0+v.a*v.t).toFixed(3),unit:"m/s"})},
  {id:"displacement",titleID:"Perpindahan",titleEN:"Displacement",formula:"\\Delta x=v_0t+\\frac12at^2",noteID:"Berlaku untuk percepatan konstan pada satu dimensi.",noteEN:"Valid for constant acceleration in one dimension.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial velocity",unit:"m/s",initial:4,step:.1},{key:"a",labelID:"Percepatan",labelEN:"Acceleration",unit:"m/s²",initial:1.5,step:.1},{key:"t",labelID:"Waktu",labelEN:"Time",unit:"s",initial:5,min:0,step:.1}],evaluate:v=>({substitution:"Δx = ("+v.v0.toFixed(2)+")("+v.t.toFixed(2)+") + ½("+v.a.toFixed(2)+")("+v.t.toFixed(2)+")²",value:(v.v0*v.t+.5*v.a*v.t*v.t).toFixed(3),unit:"m"})}
  ,{id:"acceleration",titleID:"Percepatan rata-rata",titleEN:"Average acceleration",formula:"a=\\frac{v-v_0}{t}",noteID:"Perubahan kecepatan per selang waktu. Waktu harus lebih besar dari nol.",noteEN:"Change in velocity per time interval. Time must be greater than zero.",fields:[{key:"v0",labelID:"Kecepatan awal",labelEN:"Initial velocity",unit:"m/s",initial:4,step:.1},{key:"v",labelID:"Kecepatan akhir",labelEN:"Final velocity",unit:"m/s",initial:11.5,step:.1},{key:"t",labelID:"Waktu",labelEN:"Time",unit:"s",initial:5,min:.01,step:.1}],evaluate:v=>({substitution:"a = ("+v.v.toFixed(2)+" − "+v.v0.toFixed(2)+") / "+v.t.toFixed(2),value:((v.v-v.v0)/v.t).toFixed(3),unit:"m/s²"})}
 ],
 circular:[
  {id:"speed",titleID:"Kecepatan tangensial",titleEN:"Tangential speed",formula:"v=\\omega r",noteID:"Kecepatan sudut dalam rad/s dikalikan jari-jari menghasilkan kelajuan tangensial.",noteEN:"Angular speed multiplied by radius gives tangential speed.",fields:[{key:"omega",labelID:"Kecepatan sudut",labelEN:"Angular speed",unit:"rad/s",initial:1.5,min:0,step:.1},{key:"r",labelID:"Jari-jari",labelEN:"Radius",unit:"m",initial:3,min:0,step:.1}],evaluate:v=>({substitution:"v = ("+v.omega.toFixed(2)+")("+v.r.toFixed(2)+")",value:(v.omega*v.r).toFixed(3),unit:"m/s"})},
  {id:"centripetal",titleID:"Percepatan sentripetal",titleEN:"Centripetal acceleration",formula:"a_c=\\omega^2r",noteID:"Arah percepatan selalu menuju pusat lintasan melingkar.",noteEN:"Acceleration always points toward the centre of the circular path.",fields:[{key:"omega",labelID:"Kecepatan sudut",labelEN:"Angular speed",unit:"rad/s",initial:1.5,min:0,step:.1},{key:"r",labelID:"Jari-jari",labelEN:"Radius",unit:"m",initial:3,min:0,step:.1}],evaluate:v=>({substitution:"a_c = ("+v.omega.toFixed(2)+")²("+v.r.toFixed(2)+")",value:(v.omega*v.omega*v.r).toFixed(3),unit:"m/s²"})}
  ,{id:"period",titleID:"Periode gerak melingkar",titleEN:"Circular period",formula:"T=\\frac{2\\pi}{\\omega}",noteID:"Waktu untuk satu putaran penuh. Kecepatan sudut harus lebih besar dari nol.",noteEN:"Time for one complete revolution. Angular speed must be greater than zero.",fields:[{key:"omega",labelID:"Kecepatan sudut",labelEN:"Angular speed",unit:"rad/s",initial:1.5,min:.01,step:.1}],evaluate:v=>({substitution:"T = 2π / "+v.omega.toFixed(2),value:(2*Math.PI/v.omega).toFixed(3),unit:"s"})}
 ],
 energy:[
  {id:"kinetic",titleID:"Energi kinetik",titleEN:"Kinetic energy",formula:"E_k=\\frac12mv^2",noteID:"Energi kinetik bergantung pada massa dan kuadrat kelajuan.",noteEN:"Kinetic energy depends on mass and the square of speed.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:2,min:.01,step:.1},{key:"v",labelID:"Kelajuan",labelEN:"Speed",unit:"m/s",initial:5,min:0,step:.1}],evaluate:v=>({substitution:"E_k = ½("+v.m.toFixed(2)+")("+v.v.toFixed(2)+")²",value:(.5*v.m*v.v*v.v).toFixed(3),unit:"J"})},
  {id:"potential",titleID:"Energi potensial gravitasi",titleEN:"Gravitational potential energy",formula:"E_p=mgh",noteID:"Tinggi diukur relatif terhadap titik acuan yang dipilih.",noteEN:"Height is measured relative to the chosen reference level.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:2,min:.01,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01},{key:"h",labelID:"Ketinggian",labelEN:"Height",unit:"m",initial:8,min:0,step:.1}],evaluate:v=>({substitution:"E_p = ("+v.m.toFixed(2)+")("+v.g.toFixed(2)+")("+v.h.toFixed(2)+")",value:(v.m*v.g*v.h).toFixed(3),unit:"J"})}
  ,{id:"mechanical",titleID:"Energi mekanik total",titleEN:"Total mechanical energy",formula:"E_m=\\frac12mv^2+mgh",noteID:"Jumlah energi kinetik dan potensial gravitasi terhadap titik acuan yang dipilih.",noteEN:"Sum of kinetic and gravitational potential energy relative to the chosen reference level.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:2,min:.01,step:.1},{key:"v",labelID:"Kelajuan",labelEN:"Speed",unit:"m/s",initial:5,min:0,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01},{key:"h",labelID:"Ketinggian",labelEN:"Height",unit:"m",initial:8,min:0,step:.1}],evaluate:v=>({substitution:"E_m = ½("+v.m.toFixed(2)+")("+v.v.toFixed(2)+")² + ("+v.m.toFixed(2)+")("+v.g.toFixed(2)+")("+v.h.toFixed(2)+")",value:(.5*v.m*v.v*v.v+v.m*v.g*v.h).toFixed(3),unit:"J"})},
  {id:"work",titleID:"Usaha oleh gaya konstan",titleEN:"Work by a constant force",formula:"W=Fs\\cos\\phi",noteID:"Sudut φ diukur antara arah gaya dan perpindahan. Usaha positif jika komponen gaya searah perpindahan.",noteEN:"Angle φ is measured between force and displacement. Work is positive when the force component is along the displacement.",fields:[{key:"force",labelID:"Besar gaya",labelEN:"Force magnitude",unit:"N",initial:20,min:0,step:.5},{key:"distance",labelID:"Perpindahan",labelEN:"Displacement",unit:"m",initial:5,min:0,step:.1},{key:"phi",labelID:"Sudut antara gaya dan perpindahan",labelEN:"Angle between force and displacement",unit:"°",initial:30,min:0,max:180,step:1}],evaluate:v=>{const W=v.force*v.distance*Math.cos(v.phi*Math.PI/180);return{substitution:"W = ("+v.force.toFixed(2)+")("+v.distance.toFixed(2)+") cos("+v.phi.toFixed(1)+"°)",value:W.toFixed(3),unit:"J"};}},
  {id:"workEnergy",titleID:"Kelajuan dari usaha total",titleEN:"Speed from net work",formula:"v_f=\\sqrt{v_i^2+\\frac{2W_{net}}{m}}",noteID:"Diperoleh dari W_net = ΔK untuk massa tetap. Nilai di dalam akar harus tidak negatif.",noteEN:"Derived from W_net = ΔK for constant mass. The radicand must be non-negative.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:2,min:.01,step:.1},{key:"vi",labelID:"Kelajuan awal",labelEN:"Initial speed",unit:"m/s",initial:3,min:0,step:.1},{key:"work",labelID:"Usaha total",labelEN:"Net work",unit:"J",initial:20,step:.5}],evaluate:v=>{const q=v.vi*v.vi+2*v.work/v.m;return{substitution:"v_f = √(("+v.vi.toFixed(2)+")² + 2("+v.work.toFixed(2)+") / "+v.m.toFixed(2)+")",value:q>=0?Math.sqrt(q).toFixed(3):"NaN",unit:"m/s"};}}
 ],
 incline:[
  {id:"normal",titleID:"Gaya normal",titleEN:"Normal force",formula:"N=mg\\cos\\theta",noteID:"Berlaku tanpa percepatan tegak lurus bidang dan tanpa gaya normal tambahan.",noteEN:"Applies with no perpendicular acceleration or additional normal force.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:5,min:.01,step:.1},{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01},{key:"theta",labelID:"Sudut bidang",labelEN:"Incline angle",unit:"°",initial:30,min:0,max:89,step:1}],evaluate:v=>({substitution:"N = ("+v.m.toFixed(2)+")("+v.g.toFixed(2)+") cos("+v.theta.toFixed(1)+"°)",value:(v.m*v.g*Math.cos(v.theta*Math.PI/180)).toFixed(3),unit:"N"})},
  {id:"acceleration",titleID:"Percepatan saat meluncur turun",titleEN:"Down-slope sliding acceleration",formula:"a=g(\\sin\\theta-\\mu_k\\cos\\theta)",noteID:"Gunakan saat benda sudah meluncur turun. Ambang mulai bergerak ditentukan oleh gesekan statis μs.",noteEN:"Use when the block is already sliding downhill. The onset threshold depends on static friction μs.",fields:[{key:"g",labelID:"Gravitasi",labelEN:"Gravity",unit:"m/s²",initial:9.81,min:.01,step:.01},{key:"theta",labelID:"Sudut bidang",labelEN:"Incline angle",unit:"°",initial:30,min:0,max:89,step:1},{key:"mu",labelID:"Koefisien gesek kinetis",labelEN:"Kinetic friction coefficient",unit:"—",initial:.2,min:0,max:1,step:.01}],evaluate:v=>({substitution:"a = "+v.g.toFixed(2)+" [sin("+v.theta.toFixed(1)+"°) − "+v.mu.toFixed(2)+" cos("+v.theta.toFixed(1)+"°)]",value:(v.g*(Math.sin(v.theta*Math.PI/180)-v.mu*Math.cos(v.theta*Math.PI/180))).toFixed(3),unit:"m/s²"})}
  ,{id:"criticalAngle",titleID:"Sudut kritis mulai meluncur",titleEN:"Critical angle for sliding",formula:"\\theta_c=\\tan^{-1}(\\mu_s)",noteID:"Ambang ideal saat komponen berat sejajar bidang menyamai gesek statis maksimum.",noteEN:"Ideal threshold where the downslope weight equals maximum static friction.",fields:[{key:"mu",labelID:"Koefisien gesek statis",labelEN:"Static friction coefficient",unit:"—",initial:.5,min:0,max:1,step:.01}],evaluate:v=>({substitution:"θ_c = tan⁻¹("+v.mu.toFixed(2)+")",value:(Math.atan(v.mu)*180/Math.PI).toFixed(3),unit:"°"})}
 ],
 collision:[
  {id:"final1",titleID:"Kecepatan akhir benda 1",titleEN:"Final velocity of body 1",formula:"v_1=\\frac{(m_1-em_2)u_1+(1+e)m_2u_2}{m_1+m_2}",noteID:"Menggabungkan kekekalan momentum dan koefisien restitusi untuk tumbukan satu dimensi.",noteEN:"Combines momentum conservation and restitution for a one-dimensional collision.",fields:[{key:"m1",labelID:"Massa benda 1",labelEN:"Mass 1",unit:"kg",initial:2,min:.01,step:.1},{key:"m2",labelID:"Massa benda 2",labelEN:"Mass 2",unit:"kg",initial:2,min:.01,step:.1},{key:"u1",labelID:"Kecepatan awal 1",labelEN:"Initial velocity 1",unit:"m/s",initial:6,step:.1},{key:"u2",labelID:"Kecepatan awal 2",labelEN:"Initial velocity 2",unit:"m/s",initial:0,step:.1},{key:"e",labelID:"Restitusi",labelEN:"Restitution",unit:"—",initial:1,min:0,max:1,step:.05}],evaluate:v=>{const z=((v.m1-v.e*v.m2)*v.u1+(1+v.e)*v.m2*v.u2)/(v.m1+v.m2);return{substitution:"v₁ = [("+v.m1.toFixed(2)+" − "+v.e.toFixed(2)+"×"+v.m2.toFixed(2)+")("+v.u1.toFixed(2)+") + (1+"+v.e.toFixed(2)+")("+v.m2.toFixed(2)+")("+v.u2.toFixed(2)+")] / ("+v.m1.toFixed(2)+"+"+v.m2.toFixed(2)+")",value:z.toFixed(3),unit:"m/s"};}},
  {id:"final2",titleID:"Kecepatan akhir benda 2",titleEN:"Final velocity of body 2",formula:"v_2=\\frac{(1+e)m_1u_1+(m_2-em_1)u_2}{m_1+m_2}",noteID:"Gunakan konvensi arah satu dimensi yang sama untuk kedua benda.",noteEN:"Use the same one-dimensional sign convention for both bodies.",fields:[{key:"m1",labelID:"Massa benda 1",labelEN:"Mass 1",unit:"kg",initial:2,min:.01,step:.1},{key:"m2",labelID:"Massa benda 2",labelEN:"Mass 2",unit:"kg",initial:2,min:.01,step:.1},{key:"u1",labelID:"Kecepatan awal 1",labelEN:"Initial velocity 1",unit:"m/s",initial:6,step:.1},{key:"u2",labelID:"Kecepatan awal 2",labelEN:"Initial velocity 2",unit:"m/s",initial:0,step:.1},{key:"e",labelID:"Restitusi",labelEN:"Restitution",unit:"—",initial:1,min:0,max:1,step:.05}],evaluate:v=>{const z=((1+v.e)*v.m1*v.u1+(v.m2-v.e*v.m1)*v.u2)/(v.m1+v.m2);return{substitution:"v₂ = [(1+"+v.e.toFixed(2)+")("+v.m1.toFixed(2)+")("+v.u1.toFixed(2)+") + ("+v.m2.toFixed(2)+" − "+v.e.toFixed(2)+"×"+v.m1.toFixed(2)+")("+v.u2.toFixed(2)+")] / ("+v.m1.toFixed(2)+"+"+v.m2.toFixed(2)+")",value:z.toFixed(3),unit:"m/s"};}}
  ,{id:"momentum",titleID:"Momentum total awal",titleEN:"Initial total momentum",formula:"p=m_1u_1+m_2u_2",noteID:"Gunakan tanda kecepatan yang konsisten untuk menyatakan arah gerak kedua benda.",noteEN:"Use consistent velocity signs to represent the direction of both bodies.",fields:[{key:"m1",labelID:"Massa benda 1",labelEN:"Mass 1",unit:"kg",initial:2,min:.01,step:.1},{key:"u1",labelID:"Kecepatan awal 1",labelEN:"Initial velocity 1",unit:"m/s",initial:6,step:.1},{key:"m2",labelID:"Massa benda 2",labelEN:"Mass 2",unit:"kg",initial:2,min:.01,step:.1},{key:"u2",labelID:"Kecepatan awal 2",labelEN:"Initial velocity 2",unit:"m/s",initial:0,step:.1}],evaluate:v=>({substitution:"p = ("+v.m1.toFixed(2)+")("+v.u1.toFixed(2)+") + ("+v.m2.toFixed(2)+")("+v.u2.toFixed(2)+")",value:(v.m1*v.u1+v.m2*v.u2).toFixed(3),unit:"kg·m/s"})}
 ],
 spring:[
  {id:"period",titleID:"Periode osilasi",titleEN:"Oscillation period",formula:"T=2\\pi\\sqrt{\\frac{m}{k}}",noteID:"Model massa–pegas ideal tanpa redaman. Massa dalam kg dan konstanta pegas dalam N/m.",noteEN:"Ideal undamped mass–spring model. Mass is in kg and stiffness in N/m.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:1,min:.01,step:.1},{key:"k",labelID:"Konstanta pegas",labelEN:"Spring constant",unit:"N/m",initial:25,min:.01,step:.1}],evaluate:v=>({substitution:"T = 2π √("+v.m.toFixed(2)+" / "+v.k.toFixed(2)+")",value:(2*Math.PI*Math.sqrt(v.m/v.k)).toFixed(3),unit:"s"})},
  {id:"frequency",titleID:"Frekuensi sudut",titleEN:"Angular frequency",formula:"\\omega=\\sqrt{\\frac{k}{m}}",noteID:"Frekuensi sudut bertambah saat pegas lebih kaku dan berkurang saat massa diperbesar.",noteEN:"Angular frequency rises with stiffness and falls as mass increases.",fields:[{key:"m",labelID:"Massa",labelEN:"Mass",unit:"kg",initial:1,min:.01,step:.1},{key:"k",labelID:"Konstanta pegas",labelEN:"Spring constant",unit:"N/m",initial:25,min:.01,step:.1}],evaluate:v=>({substitution:"ω = √("+v.k.toFixed(2)+" / "+v.m.toFixed(2)+")",value:Math.sqrt(v.k/v.m).toFixed(3),unit:"rad/s"})}
  ,{id:"restoringForce",titleID:"Gaya pemulih pegas",titleEN:"Spring restoring force",formula:"F=-kx",noteID:"Tanda negatif menunjukkan gaya selalu berlawanan arah dengan simpangan dari posisi setimbang.",noteEN:"The negative sign means the force always acts opposite to displacement from equilibrium.",fields:[{key:"k",labelID:"Konstanta pegas",labelEN:"Spring constant",unit:"N/m",initial:25,min:.01,step:.1},{key:"x",labelID:"Simpangan",labelEN:"Displacement",unit:"m",initial:.2,step:.01}],evaluate:v=>({substitution:"F = −("+v.k.toFixed(2)+")("+v.x.toFixed(3)+")",value:(-v.k*v.x).toFixed(3),unit:"N"})}

 ]
};

function calcVariableSymbol(key:string) {
 const symbols:Record<string,string>={v0:"v_0",theta:"\\theta",h0:"h_0",g:"g",x0:"x_0",v:"v",t:"t",dx:"\\Delta x",dt:"\\Delta t",a:"a",omega:"\\omega",r:"r",m:"m",k:"k",mu:"\\mu_k",e:"e",m1:"m_1",m2:"m_2",u1:"u_1",u2:"u_2",x:"x"};
 return symbols[key]??key;
}

function calculatorMath(value:string) {
 let out=value
  .replace(/θ_c/g,"\\theta_c").replace(/θ/g,"\\theta").replace(/ω/g,"\\omega")
  .replace(/Δx/g,"\\Delta x").replace(/Δt/g,"\\Delta t")
  .replace(/v₀/g,"v_0").replace(/v₁/g,"v_1").replace(/v₂/g,"v_2")
  .replace(/μₖ/g,"\\mu_k").replace(/μₛ/g,"\\mu_s").replace(/μ/g,"\\mu")
  .replace(/Eₖ/g,"E_k").replace(/Eₚ/g,"E_p").replace(/Eₘ/g,"E_m")
  .replace(/²/g,"^2").replace(/⁻¹/g,"^{-1}")
  .replace(/½/g,"\\frac{1}{2}").replace(/π/g,"\\pi").replace(/×/g,"\\times")
  .replace(/−/g,"-").replace(/√\(/g,"\\sqrt{");
 let start=out.indexOf("\\sqrt{");
 while(start!==-1){
  const open=start+6; let depth=0, close=-1;
  for(let i=open;i<out.length;i++){
   if(out[i]==="(")depth++;
   else if(out[i]===")"){depth--;if(depth===0){close=i;break;}}
  }
  if(close!==-1)out=out.slice(0,open)+out.slice(open,close+1)+"}"+out.slice(close+1);
  start=out.indexOf("\\sqrt{",start+6);
 }
 out=out.replace(/tan\^{-1}\(/g,"\\tan^{-1}(").replace(/\b(sin|cos|tan)\(/g,(_,fn)=>"\\"+fn+"(");
 return out;
}

function EquationCalculatorPanel({labId,language}:{labId:LabId;language:Language}) {
 const definitions=calculatorDefinitions[labId];
 const [selectedId,setSelectedId]=useState(definitions[0].id);
 const createInitialInputs=()=>Object.fromEntries(definitions.map(def=>[def.id,Object.fromEntries(def.fields.map(field=>[field.key,String(field.initial)]))]));
 const [inputs,setInputs]=useState<Record<string,Record<string,string>>>(createInitialInputs);
 useEffect(()=>{setSelectedId(definitions[0].id);setInputs(createInitialInputs());},[labId]);
 const activeIndex=Math.max(0,definitions.findIndex(def=>def.id===selectedId));
 const active=definitions[activeIndex]??definitions[0];
 const raw=inputs[active.id]??{};
 const values=Object.fromEntries(active.fields.map(field=>[field.key,raw[field.key]===undefined?field.initial:Number(raw[field.key])])) as Record<string,number>;
 const invalidField=active.fields.find(field=>{
  const rawValue=raw[field.key]??String(field.initial),value=values[field.key];
  return rawValue.trim()===""||!Number.isFinite(value)||(field.min!==undefined&&value<field.min)||(field.max!==undefined&&value>field.max);
 });
 let result:CalcResult|null=null,calculationFailed=false;
 if(!invalidField){try{const evaluated=active.evaluate(values);if(Number.isFinite(Number(evaluated.value)))result=evaluated;else calculationFailed=true;}catch{calculationFailed=true;}}
 const errorText=invalidField
  ? (raw[invalidField.key]??"").trim()===""
   ? (language==="ID"?"Nilai belum diisi.":"Enter a value.")
   : language==="ID"
    ? `Periksa batas nilai untuk ${invalidField.labelID} (${invalidField.min!==undefined?"min. "+invalidField.min:""}${invalidField.min!==undefined&&invalidField.max!==undefined?", ":""}${invalidField.max!==undefined?"maks. "+invalidField.max:""}).`
    : `Check the allowed range for ${invalidField.labelEN} (${invalidField.min!==undefined?"min. "+invalidField.min:""}${invalidField.min!==undefined&&invalidField.max!==undefined?", ":""}${invalidField.max!==undefined?"max. "+invalidField.max:""}).`
  : calculationFailed?(language==="ID"?"Hasil tidak terdefinisi. Periksa kembali nilai variabel.":"Result is undefined. Check the variable values."):null;
 const reset=()=>setInputs(old=>({...old,[active.id]:Object.fromEntries(active.fields.map(field=>[field.key,String(field.initial)]))}));
 return <section className="equation-calculator-panel" aria-label={language==="ID"?"Kalkulator mekanika":"Mechanics calculator"}>
  <div className="equation-calculator-heading">
   <div><span className="eyebrow">MECHANICS / FORMULA WORKBENCH</span><h2>{language==="ID"?"Kalkulator Mekanika":"Mechanics Calculator"}</h2></div>
   <p>{language==="ID"?"Pilih model dan ubah variabel. Perhitungan serta hasil akan diperbarui otomatis.":"Choose a model and adjust its variables. Calculations and results update automatically."}</p>
  </div>
  <div className="equation-calculator-workspace">
   <div className="equation-calc-selector">
    <label htmlFor="mechanics-equation-select">{language==="ID"?"PILIH PERHITUNGAN":"SELECT A CALCULATION"}</label>
    <select id="mechanics-equation-select" value={active.id} onChange={event=>setSelectedId(event.target.value)}>
     {definitions.map((def,index)=><option key={def.id} value={def.id}>{String(index+1).padStart(2,"0")} · {language==="ID"?def.titleID:def.titleEN}</option>)}
    </select>
    <span>{String(activeIndex+1).padStart(2,"0")} / {String(definitions.length).padStart(2,"0")}</span>
   </div>
   <article className="equation-calculator-card" key={active.id}>
    <div className="equation-calculator-card-head"><div><span className="equation-calculator-index">{String(activeIndex+1).padStart(2,"0")}</span><h3>{language==="ID"?active.titleID:active.titleEN}</h3></div>
     <button type="button" className="equation-calc-reset" onClick={reset} aria-label={language==="ID"?"Reset nilai":"Reset values"} title={language==="ID"?"Kembalikan nilai awal":"Restore defaults"}><RotateCcw size={15}/></button>
    </div>
    <div className="equation-calc-formula"><div className="equation-calc-math"><Equation value={active.formula}/></div></div>
    <div className="equation-calc-input-heading"><strong>{language==="ID"?"Variabel eksperimen":"Experiment variables"}</strong><span>{language==="ID"?"Hasil diperbarui otomatis":"Live calculation"}</span></div>
    <div className="equation-calc-fields">{active.fields.map(field=>{
     const value=raw[field.key]??String(field.initial);
     const fieldInvalid=value.trim()===""||!Number.isFinite(Number(value))||(field.min!==undefined&&Number(value)<field.min)||(field.max!==undefined&&Number(value)>field.max);
     return <label key={field.key}>
      <span className="equation-calc-field-label">{language==="ID"?field.labelID:field.labelEN}<Equation value={calcVariableSymbol(field.key)}/><small>{field.unit}</small></span>
      <input type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step??"any"} value={value} aria-invalid={fieldInvalid} onChange={event=>setInputs(old=>({...old,[active.id]:{...(old[active.id]??{}),[field.key]:event.target.value}}))}/>
      {(field.min!==undefined||field.max!==undefined)&&<small className="equation-calc-range">{field.min!==undefined&&field.max!==undefined?`${field.min} – ${field.max}`:field.min!==undefined?`≥ ${field.min}`:`≤ ${field.max}`}</small>}
     </label>;
    })}</div>
    <div className="equation-calc-substitution"><div className="equation-calc-substitution-math">{result?<Equation value={calculatorMath(result.substitution)}/>:<span>{language==="ID"?"Lengkapi variabel untuk melihat perhitungan.":"Complete the variables to see the calculation."}</span>}</div></div>
    {errorText&&<p className="equation-calc-error" role="status">{errorText}</p>}
    <div className={result?"equation-calc-result":"equation-calc-result is-empty"}><span>{language==="ID"?"HASIL":"RESULT"}</span><strong>{result?<><Equation value={result.value}/>{" "}<small>{result.unit}</small></>:"—"}</strong></div>
    <div className="equation-calc-explanation"><span>{language==="ID"?"PEMAHAMAN KONSEP":"CONCEPT NOTE"}</span><p>{language==="ID"?active.noteID:active.noteEN}</p></div>
   </article>
   <div className="equation-calc-navigation">
    <button type="button" onClick={()=>setSelectedId(definitions[(activeIndex-1+definitions.length)%definitions.length].id)}><ArrowLeft size={15}/>{language==="ID"?"Sebelumnya":"Previous"}</button>
    <span>{language==="ID"?"Ganti perhitungan tanpa meninggalkan kalkulator":"Switch calculations without leaving the calculator"}</span>
    <button type="button" onClick={()=>setSelectedId(definitions[(activeIndex+1)%definitions.length].id)}>{language==="ID"?"Berikutnya":"Next"}<ArrowRight size={15}/></button>
   </div>
  </div>
 </section>;
}

const words = {
  ID: {
    discover:"Beranda", laboratory:"Laboratorium", learn:"Belajar", sandbox:"Sandbox",
    kicker:"LABORATORIUM FISIKA INTERAKTIF", hero1:"Fisika bukan",hero2:"untuk dihafal.",
    heroText:"Jelajahi fenomena, ubah variabel, dan lihat bagaimana alam bekerja. Satu ruang eksperimen untuk rasa ingin tahu tanpa batas.",
    openLab:"Mulai bereksperimen", browse:"Jelajahi laboratorium", featured:"LABORATORIUM MEKANIKA",
    collection:"Eksplorasi Mekanika", collectionText:"Dari gerak sederhana hingga energi dan gaya. Setiap laboratorium memiliki parameter, simulasi, grafik, dan pengukuran yang saling terhubung.",
    experiments:"laboratorium tersedia", open:"Buka laboratorium", all:"Semua", kinematics:"Kinematika", dynamics:"Dinamika & Energi", oscillation:"Getaran",
    expr:"Model matematis", parameters:"Parameter eksperimen", graph:"Grafik eksperimen", play:"Mulai", pause:"Jeda", reset:"Reset",
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
    concept:"Konsep inti", formula:"Model utama", experiment:"Eksperimen", chooseLab:"Pilih laboratorium untuk memulai.",
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
  collision: {description:"Compare elastic, partially inelastic, and perfectly inelastic one-dimensional collisions. Explore momentum conservation, impulse, restitution, and kinetic-energy changes for two bodies.",question:"How does the coefficient of restitution affect final velocities and kinetic energy?"},
  projectile: {description:"Explore two-dimensional motion by separating horizontal and vertical components. Adjust launch speed, angle, initial height, and gravity.",question:"How do launch angle and initial height affect range and flight time?"},
  mru: {description:"Observe an object moving in a straight line at constant velocity and zero acceleration.",question:"If velocity stays constant, how does position change each second?"},
  mrua: {description:"Explore one-dimensional motion with constant acceleration. Try positive acceleration, negative acceleration, or an object starting from rest.",question:"How do position and velocity graphs change when acceleration changes sign?"},
  circular: {description:"Visualize circular motion, angular velocity, tangential speed, and centripetal acceleration.",question:"If radius increases while angular velocity stays constant, what happens to speed and centripetal acceleration?"},
  energy: {description:"Explore work, changes in kinetic energy, gravitational potential energy, and the energy balance when friction or other non-conservative forces act.",question:"How does net work change kinetic energy, and where does mechanical energy go when friction acts?"},
  incline: {description:"Analyze weight, normal force, friction, and the acceleration of a block on an inclined plane.",question:"At what angle and friction coefficient does the block begin to slide?"},
  spring: {description:"Explore a mass-spring oscillator and the relationship between restoring force, spring stiffness, mass, period, and frequency.",question:"How do mass and spring stiffness affect the oscillation period?"}
};

function parameterText(language:Language,key:string,fallback:string) {
  if(language==="ID") return fallback;
  const en:Record<string,string> = {
    speed:"Initial speed",mass1:"Mass of body 1",mass2:"Mass of body 2",velocity1:"Initial velocity of body 1",velocity2:"Initial velocity of body 2",separation:"Initial separation",restitution:"Coefficient of restitution",angle:"Launch angle",height:"Initial height",gravity:"Gravity",
    acceleration:"Acceleration",radius:"Radius",omega:"Angular velocity",mass:"Mass",x0:"Initial horizontal position",dragBeta:"Linear drag coefficient per unit mass β",phaseDegrees:"Initial phase angle",inclineAngle:"Incline angle",initialSpeed:"Initial speed along the plane",appliedForce:"External force along the plane (+ downhill)",impactDuration:"Collision contact duration",dampingRatio:"Damping ratio ζ",
    friction:"Kinetic friction coefficient",staticFriction:"Static friction coefficient",spring:"Spring constant",amplitude:"Amplitude
  };
  return en[key]??fallback;
}

function categoryText(language:Language,category:string) {
  if(language==="ID") return category;
  if(category==="KINEMATIKA") return "KINEMATICS";
  if(category==="GETARAN") return "OSCILLATIONS";
  if(category==="MOMENTUM & IMPULS") return "MOMENTUM & IMPULSE";
  return "DYNAMICS & ENERGY";
}

function tLabel(language: Language, lab: Lab) {
  if (language === "EN") return {title:lab.subtitle, description:englishLabText[lab.id].description, question:englishLabText[lab.id].question};
  return {title:lab.title, description:lab.description, question:lab.question};
}


function MeasurementDerivation({formula,value,unit,language}:{formula:string;value:number;unit:string;language:Language}) {
 const parts=formula.split("=");
 const hasSubstitution=parts.length>=3;
 const general=hasSubstitution?parts.slice(0,2).join("="):formula;
 const substitution=hasSubstitution?parts.slice(2,-1).join("="):"";
 return <div className="measurement-derivation">
  <div className="measurement-derivation-row"><Equation value={general}/></div>
  {substitution&&<div className="measurement-derivation-row"><Equation value={substitution}/></div>}
  <div className="measurement-derivation-result"><span>{language==="ID"?"Hasil":"Result"}</span><strong>{Number.isFinite(value)?<><Equation value={value.toFixed(3)}/>{" "}<small>{unit}</small></>:"—"}</strong></div>
 </div>;
}

function Equation({ value, display = false }: { value: string; display?: boolean }) {
  const html = useMemo(() => {try{return katex.renderToString(value, {throwOnError:false, strict:"ignore", trust:false, displayMode:display});}catch{return `<span class="math-render-error">${value.replace(/[&<>]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[char]??char))}</span>`;}}, [value,display]);
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

function Header({page,setPage,language,onLanguage,theme,onTheme,fontScale,onFontScale,motionLevel,onMotionLevel,renderMode,onRenderMode,density,onDensity,onReset}:{page:Page;setPage:(p:Page)=>void;language:Language;onLanguage:(v:Language)=>void;theme:Theme;onTheme:(v:Theme)=>void;fontScale:number;onFontScale:(v:number)=>void;motionLevel:MotionLevel;onMotionLevel:(v:MotionLevel)=>void;renderMode:RenderMode;onRenderMode:(v:RenderMode)=>void;density:LayoutDensity;onDensity:(v:LayoutDensity)=>void;onReset:()=>void}) {
  const w=words[language];
  const [settingsOpen,setSettingsOpen]=useState(false);
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
    <div className="topbar-tools">
      <LanguageSwitch language={language} onChange={onLanguage}/>
      <button className="theme-quick-toggle" onClick={()=>onTheme(theme==="dark"?"light":"dark")} aria-label={theme==="dark"?(language==="ID"?"Aktifkan tema terang":"Switch to light theme"):(language==="ID"?"Aktifkan tema gelap":"Switch to dark theme")} title={theme==="dark"?(language==="ID"?"Tema terang":"Light theme"):(language==="ID"?"Tema gelap":"Dark theme")}>
        {theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}
      </button>
      <button className={settingsOpen?"settings-trigger active":"settings-trigger"} onClick={()=>setSettingsOpen(v=>!v)} aria-expanded={settingsOpen} aria-label={language==="ID"?"Buka pengaturan Physimus":"Open Physimus settings"}><Settings2 size={18}/></button>
    </div>
    {settingsOpen&&<section className="settings-popover" aria-label={language==="ID"?"Pengaturan Physimus":"Physimus settings"}>
      <div className="settings-popover-head"><div><span className="eyebrow">PHYSIMUS / SETTINGS</span><strong>{language==="ID"?"Pengaturan seluruh Physimus":"Global Physimus settings"}</strong></div><button onClick={()=>setSettingsOpen(false)} aria-label="Close">×</button></div>
      <div className="settings-control"><span>{language==="ID"?"Tema aplikasi":"Application theme"}</span><div className="settings-choice"><button className={theme==="light"?"chosen":""} onClick={()=>onTheme("light")}>{language==="ID"?"Putih":"Light"}</button><button className={theme==="dark"?"chosen":""} onClick={()=>onTheme("dark")}>{language==="ID"?"Hitam":"Dark"}</button></div></div>
      <div className="settings-control"><label htmlFor="font-scale">{language==="ID"?"Skala teks & antarmuka":"Text & interface scale"} <strong>{Math.round(fontScale*100)}%</strong></label><input id="font-scale" type="range" min=".9" max="1.2" step=".05" value={fontScale} onChange={e=>onFontScale(Number(e.target.value))}/><div className="settings-range-labels"><span>{language==="ID"?"Kecil":"Smaller"}</span><span>{language==="ID"?"Besar":"Larger"}</span></div></div>
      <div className="settings-control"><span>{language==="ID"?"Kepadatan tata letak":"Layout density"}</span><div className="settings-choice"><button className={density==="comfortable"?"chosen":""} onClick={()=>onDensity("comfortable")}>{language==="ID"?"Lapang":"Comfort"}</button><button className={density==="compact"?"chosen":""} onClick={()=>onDensity("compact")}>{language==="ID"?"Ringkas":"Compact"}</button></div></div>
      <div className="settings-control"><span>{language==="ID"?"Intensitas animasi":"Animation intensity"}</span><div className="settings-choice three"><button className={motionLevel==="low"?"chosen":""} onClick={()=>onMotionLevel("low")}>{language==="ID"?"Rendah":"Low"}</button><button className={motionLevel==="medium"?"chosen":""} onClick={()=>onMotionLevel("medium")}>{language==="ID"?"Sedang":"Med"}</button><button className={motionLevel==="high"?"chosen":""} onClick={()=>onMotionLevel("high")}>{language==="ID"?"Tinggi":"High"}</button></div></div>
      <div className="settings-control"><span>{language==="ID"?"Kualitas visual simulasi":"Simulation render quality"}</span><div className="settings-choice three"><button className={renderMode==="auto"?"chosen":""} onClick={()=>onRenderMode("auto")}>{language==="ID"?"Otomatis":"Auto"}</button><button className={renderMode==="performance"?"chosen":""} onClick={()=>onRenderMode("performance")}>{language==="ID"?"Performa":"Eco"}</button><button className={renderMode==="detail"?"chosen":""} onClick={()=>onRenderMode("detail")}>{language==="ID"?"Detail":"Detail"}</button></div></div>
      <button className="settings-reset" onClick={onReset}>{language==="ID"?"Pulihkan pengaturan awal":"Restore default settings"}</button>
      <p className="settings-note">{language==="ID"?"Pengaturan berlaku di seluruh halaman dan disimpan pada browser ini. Preferensi Reduce Motion perangkat tetap dihormati.":"Settings apply across all pages and are saved in this browser. Your device's Reduce Motion preference is still respected."}</p>
    </section>}
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
  const digits=param.step<1?(String(param.step).split(".")[1]?.length??1):0;
  const [draft,setDraft]=useState(String(Number.isFinite(value)?Number(value.toFixed(Math.max(0,digits))):param.initial));
  useEffect(()=>{setDraft(String(Number.isFinite(value)?Number(value.toFixed(Math.max(0,digits))):param.initial));},[value,param.initial,digits]);
  const commit=()=>{if(draft.trim()===""){setDraft(String(value));return;}const parsed=Number(draft);if(!Number.isFinite(parsed)){setDraft(String(value));return;}const next=Math.max(param.min,Math.min(param.max,parsed));onChange(next);setDraft(String(next));};
  return <label className="slider-control">
    <span className="slider-heading"><span>{param.label}</span><strong><small>{param.unit}</small></strong></span>
    <div className="parameter-entry-row"><input className="parameter-number-input" type="number" inputMode="decimal" min={param.min} max={param.max} step={param.step} value={draft} onChange={e=>setDraft(e.currentTarget.value)} onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur();}} aria-label={param.label}/></div>
    <input type="range" min={param.min} max={param.max} step={param.step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
    <span className="slider-limits"><span>{param.min}</span><span>{param.max}</span></span>
  </label>;
}

function collisionResults(v:Record<string,number>){
  const m1=v.mass1??2,m2=v.mass2??2,u1=v.velocity1??6,u2=v.velocity2??0,e=Math.max(0,Math.min(1,v.restitution??1));
  const separation=v.separation??6,contactDistance=0.8,impactDuration=v.impactDuration??.05;
  const relative=u1-u2,collisionTime=relative>0?Math.max(0,separation-contactDistance)/relative:Infinity;
  const v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2);
  const v2=((1+e)*m1*u1+(m2-e*m1)*u2)/(m1+m2);
  const impulseMagnitude=Math.abs(m1*(v1-u1));
  return {m1,m2,u1,u2,e,separation,contactDistance,collisionTime,impactDuration,v1,v2,impulseMagnitude,meanContactForce:Number.isFinite(collisionTime)?impulseMagnitude/impactDuration:0,initialMomentum:m1*u1+m2*u2,initialKinetic:.5*m1*u1*u1+.5*m2*u2*u2};
}

function projectileStateAt(time:number,values:Record<string,number>){
  const v0=values.speed??0,theta=(values.angle??0)*Math.PI/180,g=values.gravity??9.81,h0=values.height??0,x0=values.x0??0,beta=Math.max(0,values.dragBeta??0);
  if(beta<1e-8)return {x:x0+v0*Math.cos(theta)*time,y:h0+v0*Math.sin(theta)*time-.5*g*time*time,vx:v0*Math.cos(theta),vy:v0*Math.sin(theta)-g*time};
  const decay=Math.exp(-beta*time),oneMinus=-Math.expm1(-beta*time);
  return {x:x0+v0*Math.cos(theta)*oneMinus/beta,y:h0+(v0*Math.sin(theta)+g/beta)*oneMinus/beta-g*time/beta,vx:v0*Math.cos(theta)*decay,vy:(v0*Math.sin(theta)+g/beta)*decay-g/beta};
}
function projectileFlightTime(values:Record<string,number>){
  const v0=values.speed??0,theta=(values.angle??0)*Math.PI/180,g=values.gravity??9.81,h0=values.height??0,beta=Math.max(0,values.dragBeta??0);
  if(beta<1e-8){const vy=v0*Math.sin(theta);return Math.max(0,(vy+Math.sqrt(vy*vy+2*g*h0))/g);}
  if(h0<=0&&v0*Math.sin(theta)<=0)return 0;
  let lo=0,hi=Math.max(1,(v0*Math.sin(theta)+Math.sqrt((v0*Math.sin(theta))**2+2*g*h0))/g);
  for(let i=0;i<40&&projectileStateAt(hi,values).y>0;i++)hi*=2;
  if(!Number.isFinite(hi)||hi>1e6)return 0;
  for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(projectileStateAt(mid,values).y>0)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
function makePoints(lab:Lab,values:Record<string,number>):Point[] {
  const p=(key:string)=>values[key]??0;
  const g=p("gravity")||9.81;
  let duration=lab.duration;
  if(lab.id==="projectile") duration=projectileFlightTime(values);
  if(lab.id==="circular"&&p("omega")>0) duration=2*Math.PI/p("omega");
  const energyAngle=(p("inclineAngle")??30)*Math.PI/180;
  const energyStaticHolds=p("initialSpeed")<=1e-9&&Math.tan(energyAngle)<=p("staticFriction");
  const energyAcceleration=energyStaticHolds?0:g*(Math.sin(energyAngle)-p("friction")*Math.cos(energyAngle));
  if(lab.id==="energy"){
    const distance=p("height")/Math.max(Math.sin(energyAngle),1e-6),u=p("initialSpeed"),a=energyStaticHolds?0:energyAcceleration,discriminant=u*u+2*a*distance;
    if(a>1e-9)duration=Math.max(.1,(-u+Math.sqrt(discriminant))/a);
    else if(a< -1e-9)duration=Math.max(.1,discriminant>0?(-u+Math.sqrt(discriminant))/a:u/(-a));
    else if(u>1e-9)duration=Math.max(.1,distance/u);
  }
  if(lab.id==="spring") duration=4*Math.PI/Math.max(Math.sqrt(p("spring")/p("mass"))*Math.sqrt(1-Math.max(0,Math.min(.95,p("dampingRatio")))**2),.05);
  if(lab.id==="collision"){
    const collision=collisionResults(values);
    if(Number.isFinite(collision.collisionTime))duration=Math.max(duration,collision.collisionTime+Math.max(2,Math.min(8,1/Math.max(Math.abs(collision.v2-collision.v1),.5))));
  }
  const count=Math.min(1800,Math.max(240,Math.ceil(duration*24)));
  const points:Point[]=[];
  const angle=p("angle")*Math.PI/180;
  const omega=lab.id==="spring"?Math.sqrt(p("spring")/p("mass")):p("omega");
  const inclineAngle=lab.id==="energy"?energyAngle:angle;
  const totalDistance=lab.id==="energy"?p("height")/Math.max(Math.sin(inclineAngle),1e-6):0;
  const parallelGravity=lab.id==="incline"?g*Math.sin(angle)+(p("appliedForce")/Math.max(p("mass"),1e-9)):0;
  const staticHolds=(lab.id==="incline"||lab.id==="energy")&&(lab.id==="energy"?(p("initialSpeed")<=1e-9&&Math.tan(inclineAngle)<=p("staticFriction")):Math.abs(parallelGravity)<=p("staticFriction")*g*Math.cos(angle));
  const accel=lab.id==="incline"&&!staticHolds?(parallelGravity-Math.sign(parallelGravity||1)*p("friction")*g*Math.cos(angle)):0;
  for(let i=0;i<=count;i++) {
    const time=duration*i/count;
    let x=0,y=0,vx=0,vy=0,kinetic=0,potential=0,x2:number|undefined,vx2:number|undefined;
    const mass=p("mass")||1;
    if(lab.id==="projectile") {
      const state=projectileStateAt(time,values);
      vx=state.vx;vy=state.vy;x=state.x;y=Math.max(0,state.y);
      kinetic=.5*mass*(vx*vx+vy*vy);potential=mass*g*Math.max(0,state.y);
    } else if(lab.id==="mru") {
      vx=p("speed");x=p("x0")+vx*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="mrua") {
      vx=p("speed")+p("acceleration")*time;x=p("x0")+p("speed")*time+.5*p("acceleration")*time*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="circular") {
      const theta=omega*time+(p("phaseDegrees")*Math.PI/180),r=p("radius");
      x=r*Math.cos(theta);y=r*Math.sin(theta);
      vx=-r*omega*Math.sin(theta);vy=r*omega*Math.cos(theta);kinetic=.5*mass*(r*omega)**2;
    } else if(lab.id==="collision") {
      const c=collisionResults(values),elapsed=time-c.collisionTime,hasContact=Number.isFinite(c.collisionTime)&&elapsed>=0;
      if(hasContact){
        const contactX1=-c.separation/2+c.u1*c.collisionTime,contactX2=c.separation/2+c.u2*c.collisionTime,tau=Math.min(elapsed,c.impactDuration);
        if(elapsed<c.impactDuration){
          x=contactX1+c.u1*tau+.5*(c.v1-c.u1)*tau*tau/c.impactDuration;
          x2=contactX2+c.u2*tau+.5*(c.v2-c.u2)*tau*tau/c.impactDuration;
          vx=c.u1+(c.v1-c.u1)*tau/c.impactDuration;vx2=c.u2+(c.v2-c.u2)*tau/c.impactDuration;
        }else{
          x=contactX1+.5*(c.u1+c.v1)*c.impactDuration+c.v1*(elapsed-c.impactDuration);
          x2=contactX2+.5*(c.u2+c.v2)*c.impactDuration+c.v2*(elapsed-c.impactDuration);vx=c.v1;vx2=c.v2;
        }
      }else{
        x=-(values.separation??6)/2+c.u1*time;x2=(values.separation??6)/2+c.u2*time;vx=c.u1;vx2=c.u2;
      }
      kinetic=.5*c.m1*vx*vx+.5*c.m2*(vx2??0)**2;
    } else if(lab.id==="energy") {
      const u=p("initialSpeed"),a=staticHolds?0:energyAcceleration,stopTime=a< -1e-9?u/(-a):Infinity,activeTime=Math.min(time,stopTime),rawDistance=u*activeTime+.5*a*activeTime*activeTime,s=Math.min(totalDistance,Math.max(0,rawDistance));
      const h=Math.max(0,p("height")-s*Math.sin(inclineAngle));
      const v=Math.max(0,u+a*activeTime);
      x=s*Math.cos(inclineAngle);y=h;vx=v*Math.cos(inclineAngle);vy=-v*Math.sin(inclineAngle);kinetic=.5*mass*v*v;potential=mass*g*h;
    } else if(lab.id==="incline") {
      const a=accel;
      const distance=.5*a*time*time;
      x=distance*Math.cos(angle);y=-distance*Math.sin(angle);vx=a*time*Math.cos(angle);vy=-a*time*Math.sin(angle);kinetic=.5*mass*(vx*vx+vy*vy);potential=0;
    } else if(lab.id==="spring") {
      const a=p("amplitude"),zeta=Math.max(0,Math.min(.95,p("dampingRatio"))),omega0=omega,omegaD=omega0*Math.sqrt(1-zeta*zeta),beta=zeta*omega0,phase=p("phaseDegrees")*Math.PI/180,argument=omegaD*time+phase,decay=Math.exp(-beta*time);
      x=a*decay*Math.cos(argument);vx=a*decay*(-beta*Math.cos(argument)-omegaD*Math.sin(argument));
      y=0;kinetic=.5*mass*vx*vx;potential=.5*p("spring")*x*x;
    }
    points.push({x,y,t:time,vx,vy,speed:Math.hypot(vx,vy),kinetic,potential,...(lab.id==="collision"?{x2,vx2,collisionOccurred:Number.isFinite(collisionResults(values).collisionTime)&&time>=collisionResults(values).collisionTime}:{})});
  }
  return points;
}

function metricsFor(lab:Lab,values:Record<string,number>,point:Point,points:Point[],language:Language) {
  const labels=language==="ID"
    ? {x:"Posisi x",y:"Posisi y",speed:"Kelajuan",range:"Jangkauan",max:"Tinggi maksimum",flight:"Waktu terbang",position:"Posisi",velocity:"Kecepatan",acceleration:lab.id==="projectile"?"Percepatan vertikal":"Percepatan",time:"Waktu",period:"Periode",omega:"Kecepatan sudut",centripetal:"Percepatan sentripetal",kinetic:"Energi kinetik",potential:"Energi potensial",mechanical:"Energi mekanik",height:"Ketinggian",initial:"Energi awal",net:"Resultan gaya",distance:"Jarak",mass:"Massa"}
    : {x:"Position x",y:"Position y",speed:"Speed",range:"Range",max:"Maximum height",flight:"Flight time",position:"Position",velocity:"Velocity",acceleration:lab.id==="projectile"?"Vertical acceleration":"Acceleration",time:"Time",period:"Period",omega:"Angular velocity",centripetal:"Centripetal acceleration",kinetic:"Kinetic energy",potential:"Potential energy",mechanical:"Mechanical energy",height:"Height",initial:"Initial energy",net:"Net force",distance:"Distance",mass:"Mass"};
  const peak=points.reduce((best,p)=>p.y>best.y?p:best,points[0]);
  const projectileBeta=Math.max(0,values.dragBeta??0),projectileV0y=(values.speed??0)*Math.sin((values.angle??0)*Math.PI/180),projectileG=values.gravity??9.81,projectilePeakTime=projectileBeta>1e-8&&projectileV0y>0?Math.log(1+projectileBeta*projectileV0y/projectileG)/projectileBeta:projectileV0y/projectileG;const exactProjectilePeak=lab.id==="projectile"?(projectileBeta>1e-8?projectileStateAt(Math.max(0,projectilePeakTime),values).y:(values.height??0)+projectileV0y**2/(2*projectileG)):peak.y;
  const total=point.kinetic+point.potential;
  const mass=values.mass??1;
  const g=values.gravity??9.81;
  if(lab.id==="projectile") return [
    [labels.x,point.x,"m"],[labels.y,point.y,"m"],[labels.speed,point.speed,"m/s"],
    [labels.range,points[points.length-1].x-(values.x0??0),"m"],[labels.max,exactProjectilePeak,"m"],[labels.flight,points[points.length-1].t,"s"]
  ] as [string,number,string][];
  if(lab.id==="mru"||lab.id==="mrua") return [
    [labels.position,point.x,"m"],[labels.velocity,point.vx,"m/s"],[labels.acceleration,lab.id==="mrua"?values.acceleration:0,"m/s²"],
    [labels.speed,point.speed,"m/s"],[labels.kinetic,point.kinetic,"J"],[labels.time,point.t,"s"]
  ] as [string,number,string][];
  if(lab.id==="circular") return [
    [labels.x,point.x,"m"],[labels.y,point.y,"m"],[labels.speed,point.speed,"m/s"],
    [labels.period,2*Math.PI/values.omega,"s"],[labels.omega,values.omega,"rad/s"],[labels.centripetal,values.omega**2*values.radius,"m/s²"],[language==="ID"?"Gaya sentripetal":"Centripetal force",mass*values.omega**2*values.radius,"N"]
  ] as [string,number,string][];
  if(lab.id==="collision"){
    const c=collisionResults(values),occurred=point.collisionOccurred??false,v1=point.vx,v2=point.vx2??c.u2;
    return [
      [language==="ID"?"Kecepatan benda 1":"Body 1 velocity",v1,"m/s"],
      [language==="ID"?"Kecepatan benda 2":"Body 2 velocity",v2,"m/s"],
      [language==="ID"?"Momentum total":"Total momentum",c.initialMomentum,"kg·m/s"],
      [language==="ID"?"Energi kinetik sistem":"System kinetic energy",point.kinetic,"J"],
      [language==="ID"?"Impuls benda 1":"Impulse on body 1",c.m1*(v1-c.u1),"N·s"],
      [language==="ID"?"Waktu tumbukan":"Collision time",Number.isFinite(c.collisionTime)?c.collisionTime:NaN,"s"],
      [language==="ID"?"Gaya kontak rata-rata":"Mean contact force",c.meanContactForce,"N"]
    ] as [string,number,string][];
  }
  if(lab.id==="energy") return [
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.mechanical,total,"J"],
    [language==="ID"?"Energi yang berpindah ke lingkungan":"Energy transferred to surroundings",Math.max(0,mass*g*values.height+.5*mass*(values.initialSpeed??0)**2-total),"J"],
    [labels.height,point.y,"m"],[labels.speed,point.speed,"m/s"]
  ] as [string,number,string][];
  if(lab.id==="incline") {
    const angle=values.angle*Math.PI/180;
    const parallel=values.gravity*Math.sin(angle)+(values.appliedForce??0)/Math.max(mass,1e-9),normal=mass*values.gravity*Math.cos(angle);
    const isStatic=Math.abs(parallel)<=values.staticFriction*values.gravity*Math.cos(angle);
    const acceleration=isStatic?0:parallel-Math.sign(parallel||1)*values.friction*values.gravity*Math.cos(angle);
    return [
      [labels.acceleration,acceleration,"m/s²"],[labels.net,mass*acceleration,"N"],
      [language==="ID"?"Gaya normal":"Normal force",mass*values.gravity*Math.cos(angle),"N"],
      [language==="ID"?"Gaya gesek":"Friction force",isStatic?Math.abs(mass*parallel):values.friction*normal,"N"],
      [labels.velocity,point.speed,"m/s"],[labels.distance,Math.hypot(point.x,point.y),"m"]
    ] as [string,number,string][];
  }
  return [
    [labels.position,point.x,"m"],[labels.velocity,point.vx,"m/s"],[labels.acceleration,-(values.spring/values.mass)*point.x-2*(values.dampingRatio??0)*Math.sqrt(values.spring/values.mass)*point.vx,"m/s²"],
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.period,2*Math.PI/(Math.sqrt(values.spring/values.mass)*Math.sqrt(1-(values.dampingRatio??0)**2)),"s"]
  ] as [string,number,string][];
}



function metricFormulaFor(id:LabId,index:number,v:Record<string,number>,p:Point,time:number,duration:number,language:Language){
 const n=(x:number,digits=2)=>Number.isFinite(x)?Number(x.toFixed(digits)).toString():"\\text{—}";
 const qty=(x:number,unit:string)=>"("+n(x)+")\\,\\mathrm{"+unit+"}";
 const m=v.mass??1,g=v.gravity??9.81,theta=(v.angle??0)*Math.PI/180;
 if(id==="projectile"){
  const v0=v.speed??0,h0=v.height??0,angle=v.angle??0,tf=duration,x0=v.x0??0,beta=Math.max(0,v.dragBeta??0),v0x=v0*Math.cos(theta),v0y=v0*Math.sin(theta);
  const peakTime=beta>1e-8&&v0y>0?Math.log(1+beta*v0y/g)/beta:v0y/g;
  const peak=beta>1e-8?projectileStateAt(Math.max(0,peakTime),v).y:h0+v0y*v0y/(2*g);
  const range=p.x-x0;
  if(beta>1e-8)return [
   "x(t)=x_0+\\frac{v_0\\cos\\theta}{\\beta}(1-e^{-\\beta t})="+qty(x0,"m")+"+\\frac{("+n(v0)+"\\,\\mathrm{m/s})\\cos("+n(angle)+"^\\circ)}{"+n(beta)+"\\,\\mathrm{s^{-1}}}(1-e^{-("+n(beta)+"\\,\\mathrm{s^{-1}})("+n(time)+"\\,\\mathrm{s})})="+qty(p.x,"m"),
   "y(t)=h_0+\\frac{v_0\\sin\\theta+g/\\beta}{\\beta}(1-e^{-\\beta t})-\\frac{gt}{\\beta}="+qty(p.y,"m"),
   "v_x=v_0\\cos\\theta\\,e^{-\\beta t}="+qty(p.vx,"m/s")+"\\quad v_y=(v_0\\sin\\theta+g/\\beta)e^{-\\beta t}-g/\\beta="+qty(p.vy,"m/s"),
   "R=x(t_f)-x_0="+qty(range,"m"),
   "t_{\\max}=\\frac{1}{\\beta}\\ln(1+\\frac{\\beta v_0\\sin\\theta}{g})="+qty(Math.max(0,peakTime),"s")+"\\quad H_{\\max}="+qty(peak,"m"),
   "y(t_f)=0\\quad\\text{(akar dicari numerik dengan bisection)}\\quad t_f="+qty(tf,"s")
  ][index];
  return [
   "x(t)=x_0+v_0\\cos\\theta\\,t="+qty(x0,"m")+"+("+qty(v0,"m/s")+")\\cos("+n(angle)+"^\\circ)("+n(time)+"\\,\\mathrm{s})="+qty(p.x,"m"),
   "y(t)=h_0+v_0\\sin\\theta\\,t-\\frac12gt^2="+qty(h0,"m")+"+("+qty(v0,"m/s")+")\\sin("+n(angle)+"^\\circ)("+n(time)+"\\,\\mathrm{s})-\\frac12("+n(g)+"\\,\\mathrm{m/s^2})("+n(time)+"\\,\\mathrm{s})^2="+qty(p.y,"m"),
   "v=\\sqrt{v_x^2+v_y^2}=\\sqrt{("+n(p.vx)+"\\,\\mathrm{m/s})^2+("+n(p.vy)+"\\,\\mathrm{m/s})^2}="+qty(p.speed,"m/s"),
   "R=v_0\\cos\\theta\\,t_f=("+n(v0)+"\\,\\mathrm{m/s})\\cos("+n(angle)+"^\\circ)("+n(tf)+"\\,\\mathrm{s})="+qty(range,"m"),
   "H_{\\max}=h_0+\\frac{v_0^2\\sin^2\\theta}{2g}="+qty(peak,"m"),
   "t_f=\\frac{v_0\\sin\\theta+\\sqrt{(v_0\\sin\\theta)^2+2gh_0}}{g}="+qty(tf,"s")
  ][index];
 }

 if(id==="mru"){
  const x0=v.x0??0,speed=v.speed??0;
  return [
   "x=x_0+vt=("+n(x0)+"\\,\\mathrm{m})+("+n(speed)+"\\,\\mathrm{m/s})("+n(time)+"\\,\\mathrm{s})="+qty(p.x,"m"),
   "v=v_0="+qty(speed,"m/s"),
   "a=0\\;\\mathrm{m/s^2}",
   "|v|=\\sqrt{v_x^2+v_y^2}=\\sqrt{("+n(p.vx)+")^2+0^2}="+qty(p.speed,"m/s"),
   "E_k=\\frac12mv^2=\\frac12("+n(m)+"\\,\\mathrm{kg})("+n(p.speed)+"\\,\\mathrm{m/s})^2="+qty(p.kinetic,"J"),
   "t="+qty(time,"s")
  ][index];
 }
 if(id==="mrua"){
  const v0=v.speed??0,a=v.acceleration??0,x0=v.x0??0;
  return [
   "x=x_0+v_0t+\\frac12at^2="+qty(x0,"m")+"+("+qty(v0,"m/s")+")("+qty(time,"s")+")+\\frac12("+qty(a,"m/s^2")+")("+qty(time,"s")+")^2="+qty(p.x,"m"),
   "v=v_0+at=("+n(v0)+"\\,\\mathrm{m/s})+("+n(a)+"\\,\\mathrm{m/s^2})("+n(time)+"\\,\\mathrm{s})="+qty(p.vx,"m/s"),
   "a="+qty(a,"m/s^2"),
   "|v|=\\sqrt{v_x^2+v_y^2}=\\sqrt{("+n(p.vx)+")^2+0^2}="+qty(p.speed,"m/s"),
   "E_k=\\frac12mv^2=\\frac12("+n(m)+"\\,\\mathrm{kg})("+n(p.speed)+"\\,\\mathrm{m/s})^2="+qty(p.kinetic,"J"),
   "t="+qty(time,"s")
  ][index];
 }
 if(id==="circular"){
  const r=v.radius??0,omega=v.omega??0;
  return [
   "x=r\\cos(\\omega t)=("+n(r)+"\\,\\mathrm{m})\\cos(("+n(omega)+"\\,\\mathrm{rad/s})("+n(time)+"\\,\\mathrm{s}))="+qty(p.x,"m"),
   "y=r\\sin(\\omega t)=("+n(r)+"\\,\\mathrm{m})\\sin(("+n(omega)+"\\,\\mathrm{rad/s})("+n(time)+"\\,\\mathrm{s}))="+qty(p.y,"m"),
   "v=\\omega r=("+n(omega)+"\\,\\mathrm{rad/s})("+n(r)+"\\,\\mathrm{m})="+qty(p.speed,"m/s"),
   omega>0?"T=\\frac{2\\pi}{\\omega}=\\frac{2\\pi}{"+n(omega)+"\\,\\mathrm{rad/s}}="+qty(2*Math.PI/omega,"s"):"T=\\frac{2\\pi}{0}=\\text{undefined for }\\omega=0",
   "\\omega="+qty(omega,"rad/s"),
   "a_c=\\omega^2r=("+n(omega)+"\\,\\mathrm{rad/s})^2("+n(r)+"\\,\\mathrm{m})="+qty(omega*omega*r,"m/s^2")
  ][index];
 }
 if(id==="collision"){
  const c=collisionResults(v),occurred=p.collisionOccurred??false,v1=p.vx,v2=p.vx2??c.u2;
  const impulse=occurred?c.m1*(v1-c.u1):0;
  const contactFraction=Number.isFinite(c.collisionTime)?Math.max(0,Math.min(1,(time-c.collisionTime)/c.impactDuration)):0;
  const tc=Number.isFinite(c.collisionTime)?c.collisionTime:NaN;
  const formulaV1=occurred
   ?"v_1(t)=u_1+(v_{1,f}-u_1)\\lambda=("+qty(c.u1,"m/s")+")+[("+qty(c.v1,"m/s")+")-("+qty(c.u1,"m/s")+")]("+n(contactFraction)+")="+qty(v1,"m/s")
   :"v_1(t)=u_1="+qty(v1,"m/s")+"\\quad(\\text{before impact})";
  const formulaV2=occurred
   ?"v_2(t)=u_2+(v_{2,f}-u_2)\\lambda=("+qty(c.u2,"m/s")+")+[("+qty(c.v2,"m/s")+")-("+qty(c.u2,"m/s")+")]("+n(contactFraction)+")="+qty(v2,"m/s")
   :"v_2(t)=u_2="+qty(v2,"m/s")+"\\quad(\\text{before impact})";
  const tExpression=Number.isFinite(tc)
   ?"t_c=\\frac{s-d}{u_1-u_2}=\\frac{("+n(c.separation)+"-"+n(c.contactDistance)+")\\,\\mathrm{m}}{("+n(c.u1)+"-("+n(c.u2)+"))\\,\\mathrm{m/s}}="+qty(tc,"s")
   :language==="ID"?"\\text{Tidak terjadi kontak: }u_1\\leq u_2":"\\text{No collision: }u_1\\leq u_2";
  return [
   formulaV1,
   formulaV2,
   "p_{total}=m_1u_1+m_2u_2=("+n(c.m1)+"\\,\\mathrm{kg})("+n(c.u1)+"\\,\\mathrm{m/s})+("+n(c.m2)+"\\,\\mathrm{kg})("+n(c.u2)+"\\,\\mathrm{m/s})="+n(c.initialMomentum)+"\\,\\mathrm{kg\\,m/s}",
   "K(t)=\\frac12m_1v_1(t)^2+\\frac12m_2v_2(t)^2=\\frac12("+qty(c.m1,"kg")+")("+qty(v1,"m/s")+")^2+\\frac12("+qty(c.m2,"kg")+")("+qty(v2,"m/s")+")^2="+qty(p.kinetic,"J"),
   occurred?"J_1(t)=m_1[v_1(t)-u_1]=("+qty(c.m1,"kg")+")[("+qty(v1,"m/s")+")-("+qty(c.u1,"m/s")+")]="+qty(impulse,"N\\,s"):"J_1(t)=0\\,\\mathrm{N\\,s}\\quad(\\text{no impact yet})",
   tExpression,
   "F_{\\mathrm{avg}}=\\frac{|J|}{\\Delta t_c}=\\frac{"+qty(c.impulseMagnitude,"N\\,s")+"}{"+qty(c.impactDuration,"s")+"}="+qty(c.meanContactForce,"N")
  ][index];
 }
 if(id==="energy"){
  const h0=v.height??0,mu=v.friction??0,alpha=(v.inclineAngle??30)*Math.PI/180,staticHolds=(v.initialSpeed??0)<=1e-9&&Math.tan(alpha)<=(v.staticFriction??0),a=staticHolds?0:g*(Math.sin(alpha)-mu*Math.cos(alpha)),distance=Math.hypot(p.x,h0-p.y);
  const dissipated=Math.max(0,m*g*h0+.5*m*(v.initialSpeed??0)**2-p.kinetic-p.potential);
  return [
   "E_k=\\frac12mv^2=\\frac12("+n(m)+"\\,\\mathrm{kg})("+n(p.speed)+"\\,\\mathrm{m/s})^2="+qty(p.kinetic,"J"),
   "E_p=mgh=("+n(m)+"\\,\\mathrm{kg})("+n(g)+"\\,\\mathrm{m/s^2})("+n(p.y)+"\\,\\mathrm{m})="+qty(p.potential,"J"),
   "E_m=E_k+E_p="+n(p.kinetic)+"\\,\\mathrm{J}+"+n(p.potential)+"\\,\\mathrm{J}="+qty(p.kinetic+p.potential,"J"),
   "W_{\\mathrm{nc}}=E_{m,f}-E_{m,i}=("+qty(p.kinetic+p.potential,"J")+")-("+qty(.5*m*(v.initialSpeed??0)**2+m*g*h0,"J")+")=-"+qty(dissipated,"J"),
   "h=h_0-s\\sin\\alpha="+qty(h0,"m")+"-("+qty(distance,"m")+")\\sin("+n(v.inclineAngle??30)+"^\\circ)="+qty(p.y,"m"),
   "v=v_0+at=("+n(v.initialSpeed??0)+"\\,\\mathrm{m/s})+("+n(a)+"\\,\\mathrm{m/s^2})("+n(time)+"\\,\\mathrm{s})="+qty(p.speed,"m/s")
  ][index];
 }
 if(id==="incline"){
  const mu=v.friction??0,muS=v.staticFriction??0,external=v.appliedForce??0,parallel=m*g*Math.sin(theta)+external,staticHolds=Math.abs(parallel)<=muS*m*g*Math.cos(theta)/Math.max(m,1e-9);
  const a=staticHolds?0:parallel/m-Math.sign(parallel||1)*mu*g*Math.cos(theta);
  const normal=m*g*Math.cos(theta),friction=staticHolds?Math.abs(parallel):mu*normal;
  const frictionFormula=staticHolds
   ?"f_s=|mg\\sin\\theta+F_{\\parallel}|="+qty(friction,"N")
   :"f_k=\\mu_kN=("+n(mu)+")("+n(normal)+"\\,\\mathrm{N})="+qty(friction,"N");
  return [
   staticHolds?"a=0\\quad(\\text{static friction})":"a=\\frac{mg\\sin\\theta+F_{\\parallel}}{m}-\\operatorname{sgn}(mg\\sin\\theta+F_{\\parallel})\\mu_k g\\cos\\theta="+qty(a,"m/s^2"),
   "\\sum F_{\\parallel}=ma=("+n(m)+"\\,\\mathrm{kg})("+n(a)+"\\,\\mathrm{m/s^2})="+qty(m*a,"N"),
   "N=mg\\cos\\theta=("+n(m)+"\\,\\mathrm{kg})("+n(g)+"\\,\\mathrm{m/s^2})\\cos("+n(v.angle??0)+"^\\circ)="+qty(normal,"N"),
   frictionFormula,
   "v=at=("+n(a)+"\\,\\mathrm{m/s^2})("+n(time)+"\\,\\mathrm{s})="+qty(p.speed,"m/s"),
   "s=\\frac12at^2=\\frac12("+qty(a,"m/s^2")+")("+qty(time,"s")+")^2="+qty(Math.hypot(p.x,p.y),"m")
  ][index];
 }
 const k=v.spring??0,A=v.amplitude??0,omega=Math.sqrt(k/Math.max(m,.01)),zeta=v.dampingRatio??0,beta=zeta*omega,phase=(v.phaseDegrees??0)*Math.PI/180,omegaD=omega*Math.sqrt(1-zeta*zeta),acceleration=-omega*omega*p.x-2*beta*p.vx;
 return [
  "x(t)=Ae^{-\\beta t}\\cos(\\omega_d t+\\phi)=("+n(A)+"\\,\\mathrm{m})e^{-("+n(beta)+"\\,\\mathrm{s^{-1}})("+n(time)+"\\,\\mathrm{s})}\\cos(("+n(omegaD)+"\\,\\mathrm{rad/s})("+n(time)+"\\,\\mathrm{s})+"+n(phase)+"\\,\\mathrm{rad})="+qty(p.x,"m"),
  "v(t)=Ae^{-\\beta t}[-\\beta\\cos(\\omega_dt+\\phi)-\\omega_d\\sin(\\omega_dt+\\phi)]="+qty(p.vx,"m/s"),
  "a(t)=-\\omega_0^2x-2\\beta v="+qty(acceleration,"m/s^2"),
  "E_k=\\frac12mv^2=\\frac12("+qty(m,"kg")+")("+qty(p.speed,"m/s")+")^2="+qty(p.kinetic,"J"),
  "E_p=\\frac12kx^2=\\frac12("+qty(k,"N/m")+")("+qty(p.x,"m")+")^2="+qty(p.potential,"J"),
  k>0?"T_d=\\frac{2\\pi}{\\omega_d}=\\frac{2\\pi}{"+n(omegaD)+"\\,\\mathrm{rad/s}}="+qty(2*Math.PI/Math.max(omegaD,1e-12),"s"):"T=2\\pi\\sqrt{\\frac{m}{0}}=\\text{undefined for }k=0
 ][index];
}
function objectOptionsFor(id:LabId,language:Language):{value:string;label:string}[] {
  const data:Record<LabId,{value:string;id:string;en:string}[]> = {
    projectile:[{value:"ball",id:"Bola",en:"Ball"},{value:"football",id:"Bola sepak",en:"Football"},{value:"rocket",id:"Roket",en:"Rocket"}],
    mru:[{value:"car",id:"Mobil",en:"Car"},{value:"train",id:"Kereta",en:"Train"},{value:"cart",id:"Troli",en:"Cart"}],
    mrua:[{value:"car",id:"Mobil",en:"Car"},{value:"cart",id:"Troli",en:"Cart"},{value:"rocket",id:"Roket",en:"Rocket"}],
    circular:[{value:"satellite",id:"Satelit",en:"Satellite"},{value:"planet",id:"Planet",en:"Planet"},{value:"ball",id:"Bola",en:"Ball"}],
    energy:[{value:"block",id:"Balok",en:"Block"},{value:"sphere",id:"Bola pejal",en:"Solid sphere"},{value:"cart",id:"Troli",en:"Cart"}],
    incline:[{value:"block",id:"Balok",en:"Block"},{value:"sphere",id:"Bola pejal",en:"Solid sphere"},{value:"cart",id:"Troli",en:"Cart"}],
    collision:[{value:"ball",id:"Bola",en:"Ball"},{value:"block",id:"Balok",en:"Block"},{value:"cart",id:"Troli",en:"Cart"}],
    spring:[{value:"mass",id:"Massa pegas",en:"Spring mass"},{value:"ball",id:"Bola",en:"Ball"},{value:"block",id:"Balok",en:"Block"}]
  };
  return data[id].map(v=>({value:v.value,label:language==="ID"?v.id:v.en}));
}

function drawLabObject(ctx:CanvasRenderingContext2D,x:number,y:number,style:string,color:string,orientation=0) {
  ctx.save();
  ctx.translate(x,y);
  if(style==="rocket")ctx.rotate(orientation+Math.PI/2);
  else if(style==="satellite"||style==="block"||style==="car"||style==="cart"||style==="train")ctx.rotate(orientation);
  ctx.shadowColor="#172b3f35";ctx.shadowBlur=8;ctx.shadowOffsetY=3;
  const sphere=(radius:number,base:string,edge:string)=>{
    const grad=ctx.createRadialGradient(-radius*.34,-radius*.38,1,0,0,radius);
    grad.addColorStop(0,"#ffffff");grad.addColorStop(.18,base);grad.addColorStop(1,edge);
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
    ctx.shadowColor="transparent";ctx.strokeStyle="#ffffffaa";ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle="#ffffff80";ctx.beginPath();ctx.ellipse(-radius*.3,-radius*.4,radius*.18,radius*.08,-.5,0,Math.PI*2);ctx.fill();
  };
  if(style==="car"||style==="cart"||style==="train"){
    const body=ctx.createLinearGradient(0,-16,0,12);body.addColorStop(0,"#ffffff");body.addColorStop(.2,style==="train"?"#809ab4":color);body.addColorStop(1,"#203f5f");
    ctx.fillStyle=body;ctx.beginPath();ctx.roundRect(-21,-11,42,19,5);ctx.fill();
    ctx.shadowColor="transparent";
    ctx.fillStyle=style==="train"?"#b8d4e8":"#dcecf8";
    if(style==="train"){ctx.fillRect(-14,-8,8,7);ctx.fillRect(-3,-8,8,7);ctx.fillRect(8,-8,7,7);}
    else{ctx.beginPath();ctx.moveTo(-10,-11);ctx.lineTo(-5,-18);ctx.lineTo(9,-18);ctx.lineTo(15,-11);ctx.closePath();ctx.fill();}
    for(const wx of [-12,12]){
      const wheel=ctx.createRadialGradient(wx-2,5,1,wx,8,6);wheel.addColorStop(0,"#9caebd");wheel.addColorStop(.35,"#35495b");wheel.addColorStop(1,"#111d2b");
      ctx.fillStyle=wheel;ctx.beginPath();ctx.arc(wx,8,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#c8d4dd";ctx.lineWidth=1;ctx.stroke();
    }
    ctx.strokeStyle="#ffffffa8";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-16,-7);ctx.lineTo(14,-7);ctx.stroke();
  }else if(style==="satellite"){
    ctx.shadowColor="transparent";
    const panel=(left:number)=>{const g=ctx.createLinearGradient(0,-7,0,7);g.addColorStop(0,"#8ec9ef");g.addColorStop(1,"#234b71");ctx.fillStyle=g;ctx.fillRect(left,-7,17,14);ctx.strokeStyle="#d7e8f5";ctx.lineWidth=1;ctx.strokeRect(left,-7,17,14);ctx.strokeStyle="#b8d2e7";for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(left+i*4.2,-7);ctx.lineTo(left+i*4.2,7);ctx.stroke();}};
    panel(-29);panel(12);
    const body=ctx.createLinearGradient(-7,-8,7,8);body.addColorStop(0,"#ffe4a2");body.addColorStop(.45,"#c78c3e");body.addColorStop(1,"#754e2c");ctx.fillStyle=body;ctx.fillRect(-7,-8,14,16);ctx.strokeStyle="#fff4d8";ctx.strokeRect(-7,-8,14,16);
    ctx.fillStyle="#dcebf6";ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
  }else if(style==="planet"){
    ctx.save();ctx.rotate(-.3);ctx.strokeStyle="#b7a5e8";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,21,8,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="#fff";ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,21,8,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
    sphere(11,"#a68ce0","#493b82");
  }else if(style==="rocket"){
    const body=ctx.createLinearGradient(-10,0,10,0);body.addColorStop(0,"#374b75");body.addColorStop(.45,"#c4b5ef");body.addColorStop(1,"#6856a7");
    ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(0,-21);ctx.quadraticCurveTo(13,-5,8,12);ctx.lineTo(-8,12);ctx.quadraticCurveTo(-13,-5,0,-21);ctx.fill();
    ctx.shadowColor="transparent";ctx.fillStyle="#dcecf8";ctx.beginPath();ctx.arc(0,-3,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(-5,12);ctx.lineTo(-12,19);ctx.lineTo(-5,17);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,12);ctx.lineTo(12,19);ctx.lineTo(5,17);ctx.closePath();ctx.fill();
    const flame=ctx.createLinearGradient(0,12,0,30);flame.addColorStop(0,"#fff0a8");flame.addColorStop(.45,"#ef9c49");flame.addColorStop(1,"#d45d4a");ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(-4,12);ctx.quadraticCurveTo(-7,23,0,29);ctx.quadraticCurveTo(7,23,4,12);ctx.closePath();ctx.fill();
  }else if(style==="mass"){
    const g=ctx.createLinearGradient(-11,-11,11,11);g.addColorStop(0,"#b6dfd2");g.addColorStop(.5,color);g.addColorStop(1,"#1e5748");ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-10,-10,20,20,3);ctx.fill();ctx.shadowColor="transparent";ctx.strokeStyle="#e3fff3";ctx.strokeRect(-10,-10,20,20);
  }else if(style==="block"){
    const g=ctx.createLinearGradient(-14,-12,14,12);g.addColorStop(0,"#ffffff");g.addColorStop(.25,color);g.addColorStop(1,"#254968");
    ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-13,-12,26,24,3);ctx.fill();ctx.shadowColor="transparent";ctx.strokeStyle="#ffffffc0";ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle="#ffffff40";ctx.beginPath();ctx.moveTo(-13,-12);ctx.lineTo(13,-12);ctx.lineTo(8,-6);ctx.lineTo(-8,-6);ctx.closePath();ctx.fill();
  }else{
    const base=style==="football"?"#4b9b79":style==="sphere"?"#d99a46":color;
    sphere(style==="football"?12:11,base,style==="football"?"#173f32":style==="sphere"?"#84531c":"#214667");
    if(style==="football"){ctx.shadowColor="transparent";ctx.strokeStyle="#f2f8f5";ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(7,7);ctx.moveTo(-7,7);ctx.lineTo(7,-7);ctx.stroke();ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore();
}

type PracticeQuestion={prompt:string;given:string;formula:string;answer:number;unit:string;steps:string[];resultLabel:string};
function makePracticeQuestion(id:LabId,language:Language):PracticeQuestion {
  const r=(min:number,max:number,step:number)=>Math.round((min+Math.random()*(max-min))/step)*step;
  const f=(x:number)=>Number(x.toFixed(2));
  const en=language==="EN",variant=Math.random()<.5;
  if(id==="projectile"){
    const g=9.81;
    if(variant){
      const v=r(14,28,1),angle=r(25,65,1),rad=angle*Math.PI/180,answer=v*v*Math.sin(2*rad)/g;
      return {prompt:en?"A projectile lands at the same height from which it was launched. Calculate its horizontal range.":"Sebuah benda ditembakkan dan mendarat pada ketinggian yang sama. Hitung jangkauan horizontalnya.",given:"v₀ = "+v+" m/s, θ = "+angle+"°, g = 9.81 m/s²",formula:"R=\\frac{v_0^2\\sin(2\\theta)}{g}",answer,unit:"m",resultLabel:en?"Horizontal range":"Jangkauan horizontal",steps:["R=\\frac{("+v+")^2\\sin(2\\times"+angle+"^\\circ)}{9.81}","R="+f(answer)+"\\;\\mathrm{m}"]};
    }
    const v=r(14,28,1),angle=r(25,65,1),rad=angle*Math.PI/180,answer=v*v*Math.sin(rad)**2/(2*g);
    return {prompt:en?"Find the rise above launch point at maximum height.":"Hitung kenaikan ketinggian maksimum dari titik peluncuran.",given:"v₀ = "+v+" m/s, θ = "+angle+"°, g = 9.81 m/s²",formula:"\\Delta h_{max}=\\frac{v_0^2\\sin^2\\theta}{2g}",answer,unit:"m",resultLabel:en?"Maximum rise":"Kenaikan maksimum",steps:["\\Delta h=\\frac{("+v+")^2\\sin^2("+angle+"^\\circ)}{2(9.81)}","\\Delta h="+f(answer)+"\\;\\mathrm{m}"]};
  }
  if(id==="mru"){
    const v=r(3,18,1),t=r(2,12,1);
    if(variant){
      const x0=r(-12,12,1),answer=x0+v*t;
      return {prompt:en?"Determine the final position of the object relative to the origin.":"Tentukan posisi akhir benda terhadap titik asal.",given:"x₀ = "+x0+" m, v = "+v+" m/s, t = "+t+" s",formula:"x=x_0+vt",answer,unit:"m",resultLabel:en?"Final position":"Posisi akhir",steps:["x=("+x0+")+("+v+")("+t+")","x="+f(answer)+"\\;\\mathrm{m}"]};
    }
    const answer=v*t;
    return {prompt:en?"How far does the object travel in the given time?":"Berapa perpindahan benda selama waktu tersebut?",given:"v = "+v+" m/s, t = "+t+" s, x₀ = 0",formula:"\\Delta x=vt",answer,unit:"m",resultLabel:en?"Displacement":"Perpindahan",steps:["\\Delta x=("+v+")("+t+")","\\Delta x="+f(answer)+"\\;\\mathrm{m}"]};
  }
  if(id==="mrua"){
    const v0=r(0,8,1),a=r(.5,3,.5),t=r(2,8,1);
    if(variant){
      const answer=v0*t+.5*a*t*t;
      return {prompt:en?"Find the displacement under constant acceleration.":"Hitung perpindahan benda dengan percepatan konstan.",given:"v₀ = "+v0+" m/s, a = "+a+" m/s², t = "+t+" s",formula:"\\Delta x=v_0t+\\frac12at^2",answer,unit:"m",resultLabel:en?"Displacement":"Perpindahan",steps:["\\Delta x=("+v0+")("+t+")+\\frac12("+a+")("+t+")^2","\\Delta x="+f(answer)+"\\;\\mathrm{m}"]};
    }
    const answer=v0+a*t;
    return {prompt:en?"Determine the velocity after the stated time.":"Tentukan kecepatan setelah selang waktu tersebut.",given:"v₀ = "+v0+" m/s, a = "+a+" m/s², t = "+t+" s",formula:"v=v_0+at",answer,unit:"m/s",resultLabel:en?"Final velocity":"Kecepatan akhir",steps:["v="+v0+"+("+a+")("+t+")","v="+f(answer)+"\\;\\mathrm{m/s}"]};
  }
  if(id==="circular"){
    const omega=r(.5,4,.5),radius=r(1,8,1);
    if(variant){
      const answer=omega*radius;
      return {prompt:en?"Calculate the tangential speed of the rotating object.":"Hitung kelajuan tangensial benda yang bergerak melingkar.",given:"ω = "+omega+" rad/s, r = "+radius+" m",formula:"v=\\omega r",answer,unit:"m/s",resultLabel:en?"Tangential speed":"Kelajuan tangensial",steps:["v=("+omega+")("+radius+")","v="+f(answer)+"\\;\\mathrm{m/s}"]};
    }
    const answer=omega*omega*radius;
    return {prompt:en?"Calculate the centripetal acceleration.":"Hitung percepatan sentripetal benda.",given:"ω = "+omega+" rad/s, r = "+radius+" m",formula:"a_c=\\omega^2r",answer,unit:"m/s²",resultLabel:en?"Centripetal acceleration":"Percepatan sentripetal",steps:["a_c=("+omega+")^2("+radius+")","a_c="+f(answer)+"\\;\\mathrm{m/s^2}"]};
  }
  if(id==="collision"){
    const m1=r(1,4,.5),m2=r(1,4,.5),u1=r(5,10,.5),u2=r(-2,2,.5),e=r(0,1,.1);
    const v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2),v2=((1+e)*m1*u1+(m2-e*m1)*u2)/(m1+m2);
    if(variant){
      const answer=v2;
      return {prompt:en?"Find the final velocity of body 2 after a one-dimensional collision.":"Tentukan kecepatan akhir benda 2 setelah tumbukan satu dimensi.",given:"m₁ = "+m1+" kg, m₂ = "+m2+" kg, u₁ = "+u1+" m/s, u₂ = "+u2+" m/s, e = "+e.toFixed(1),formula:"v_2=\\frac{(1+e)m_1u_1+(m_2-em_1)u_2}{m_1+m_2}",answer,unit:"m/s",resultLabel:en?"Final velocity of body 2":"Kecepatan akhir benda 2",steps:["v_2=\\frac{(1+"+e.toFixed(1)+")("+m1+")("+u1+")+("+m2+"-"+e.toFixed(1)+"("+m1+"))("+u2+")}{"+m1+"+"+m2+"}","v_2="+f(answer)+"\\;\\mathrm{m/s}"]};
    }
    const answer=m1*(v1-u1);
    return {prompt:en?"Find the impulse delivered to body 1 during the collision.":"Tentukan impuls yang diterima benda 1 selama tumbukan.",given:"m₁ = "+m1+" kg, m₂ = "+m2+" kg, u₁ = "+u1+" m/s, u₂ = "+u2+" m/s, e = "+e.toFixed(1),formula:"J_1=m_1(v_1-u_1)",answer,unit:"N·s",resultLabel:en?"Impulse on body 1":"Impuls benda 1",steps:["v_1=\\frac{(m_1-em_2)u_1+(1+e)m_2u_2}{m_1+m_2}","v_1="+f(v1)+"\\;\\mathrm{m/s}","J_1=("+m1+")("+f(v1)+"-"+u1+")","J_1="+f(answer)+"\\;\\mathrm{N\\,s}"]};
  }
  const m=r(.5,5,.5),k=r(10,100,5);
  if(variant){
    const answer=Math.sqrt(k/m)/(2*Math.PI);
    return {prompt:en?"Calculate the natural frequency of an ideal mass–spring oscillator.":"Hitung frekuensi alami osilator massa–pegas ideal.",given:"m = "+m+" kg, k = "+k+" N/m",formula:"f=\\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}",answer,unit:"Hz",resultLabel:en?"Natural frequency":"Frekuensi alami",steps:["f=\\frac{1}{2\\pi}\\sqrt{\\frac{"+k+"}{"+m+"}}","f="+f(answer)+"\\;\\mathrm{Hz}"]};
  }
  const answer=2*Math.PI*Math.sqrt(m/k);
  return {prompt:en?"Calculate the period of an ideal mass–spring oscillator.":"Hitung periode osilasi sistem massa–pegas ideal.",given:"m = "+m+" kg, k = "+k+" N/m",formula:"T=2\\pi\\sqrt{\\frac{m}{k}}",answer,unit:"s",resultLabel:en?"Oscillation period":"Periode osilasi",steps:["T=2\\pi\\sqrt{\\frac{"+m+"}{"+k+"}}","T="+f(answer)+"\\;\\mathrm{s}"]};
}
function practiceGivenLatex(given:string){
 return given.replace(/m₁/g,"m_1").replace(/m₂/g,"m_2").replace(/u₁/g,"u_1").replace(/u₂/g,"u_2").replace(/v₀/g,"v_0").replace(/x₀/g,"x_0").replace(/μₛ/g,"\\mu_s").replace(/μₖ/g,"\\mu_k").replace(/Δh/g,"\\Delta h").replace(/ω/g,"\\omega").replace(/θ/g,"\\theta").replace(/\s*=\s*/g,"=").replace(/,\s*/g,"\\quad ").replace(/([0-9]+(?:\.[0-9]+)?)\s*kg/g,"$1\\,\\mathrm{kg}").replace(/([0-9]+(?:\.[0-9]+)?)\s*m\/s²/g,"$1\\,\\mathrm{m/s^2}").replace(/([0-9]+(?:\.[0-9]+)?)\s*m\/s/g,"$1\\,\\mathrm{m/s}").replace(/([0-9]+(?:\.[0-9]+)?)\s*N\/m/g,"$1\\,\\mathrm{N/m}").replace(/([0-9]+(?:\.[0-9]+)?)\s*rad\/s/g,"$1\\,\\mathrm{rad/s}").replace(/([0-9]+(?:\.[0-9]+)?)\s*Hz/g,"$1\\,\\mathrm{Hz}").replace(/([0-9]+(?:\.[0-9]+)?)\s*°/g,"$1^\\circ").replace(/([0-9]+(?:\.[0-9]+)?)\s*N·s/g,"$1\\,\\mathrm{N\\,s}");
}
function practiceUnitLatex(unit:string){return unit==="m/s²"?"\\mathrm{m/s^2}":unit==="m/s"?"\\mathrm{m/s}":unit==="N·s"?"\\mathrm{N\\,s}":unit==="kg"?"\\mathrm{kg}":unit==="Hz"?"\\mathrm{Hz}":unit==="°"?"^\\circ":unit==="J"?"\\mathrm{J}":unit==="N"?"\\mathrm{N}":"\\mathrm{"+unit+"}";}
function PracticePanel({labId,language,variant="lab"}:{labId:LabId;language:Language;variant?:"lab"|"lesson"}) {
  const en=language==="EN";
  const [question,setQuestion]=useState(()=>makePracticeQuestion(labId,language));
  const [answer,setAnswer]=useState("");const [checked,setChecked]=useState(false);const [showSolution,setShowSolution]=useState(false);
  useEffect(()=>{setQuestion(makePracticeQuestion(labId,language));setAnswer("");setChecked(false);setShowSolution(false);},[labId,language]);
  const numeric=Number(answer);
  const correct=answer.trim()!==""&&Number.isFinite(numeric)&&Math.abs(numeric-question.answer)<=Math.max(.02,Math.abs(question.answer)*.01);
  const replace=()=>{setQuestion(makePracticeQuestion(labId,language));setAnswer("");setChecked(false);setShowSolution(false);};
  return <section className="practice-panel">
    <div className="practice-top"><div><span className="eyebrow">{variant==="lesson"?(en?"LEARNING MODULE PRACTICE":"LATIHAN MODUL BELAJAR"):(en?"PRACTICE LAB":"LATIHAN LABORATORIUM")}</span><h2>{variant==="lesson"?(en?"Topic exercises":"Latihan materi"):(en?"Random challenge":"Tantangan acak")}</h2><p>{variant==="lesson"?(en?"Check your understanding without leaving this lesson.":"Uji pemahaman tanpa meninggalkan materi yang sedang dipelajari."):(en?"Solve a short problem using the active topic.":"Selesaikan soal singkat sesuai materi laboratorium yang sedang dibuka.")}</p></div><button className="secondary-button" onClick={replace}><RotateCcw size={15}/>{en?"New question":"Soal baru"}</button></div>
    <div className="practice-content"><div className="practice-question"><strong>{question.prompt}</strong><div className="practice-given"><Equation value={practiceGivenLatex(question.given)} display/></div><div className="practice-formula"><Equation value={question.formula} display/></div></div>
      <div className="practice-answer"><label>{en?"Your answer":"Jawabanmu"} ({question.unit})<input type="number" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} placeholder={en?"Enter a number":"Masukkan angka"}/></label><button className="primary-button" onClick={()=>setChecked(true)} disabled={!answer.trim()}>{en?"Check answer":"Periksa jawaban"}</button>
      {checked&&<p className={correct?"practice-correct":"practice-incorrect"}>{correct?(en?"Correct — well done!":"Benar — perhitungannya tepat!"):(en?"Not quite. Recheck the substitution and units.":"Belum tepat. Periksa kembali langkah hitung dan satuannya.")}</p>}
      <button className="practice-solution-button" onClick={()=>setShowSolution(v=>!v)}>{showSolution?(en?"Hide solution":"Sembunyikan pembahasan"):(en?"Show worked solution":"Lihat pembahasan")}</button></div>
    </div>
    {showSolution&&<div className="practice-solution"><strong>{question.resultLabel}: <Equation value={question.answer.toFixed(2)+"\\,"+practiceUnitLatex(question.unit)}/></strong>{question.steps.map((step,i)=><div key={i}><span>{i+1}</span><Equation value={step} display/></div>)}</div>}
  </section>;
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

function Laboratory({labId,language,onBack,onChoose,theme,motionLevel,renderMode}:{labId:LabId;language:Language;onBack:()=>void;onChoose:(id:LabId)=>void;theme:Theme;motionLevel:MotionLevel;renderMode:RenderMode}) {
  const lab=labs.find(item=>item.id===labId)??labs[0];
  const w=words[language];
  const [values,setValues]=useState<Record<string,number>>(()=>Object.fromEntries(allLabParams(lab).map(p=>[p.key,p.initial])));
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speedFactor,setSpeedFactor]=useState(1);const [focusMode,setFocusMode]=useState(false);const [expandedMetric,setExpandedMetric]=useState<string|null>(null);const [graphPan,setGraphPan]=useState({x:0,y:0});const [graphZoom,setGraphZoom]=useState(1);
  useEffect(()=>{if(!focusMode)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")setFocusMode(false);};window.addEventListener("keydown",onKeyDown);return()=>window.removeEventListener("keydown",onKeyDown);},[focusMode]);
  const [showGrid,setShowGrid]=useState(true);
  const [showVectors,setShowVectors]=useState(true);
  const [showTrail,setShowTrail]=useState(true);
  const [notice,setNotice]=useState("");
  const [drawerTab,setDrawerTab]=useState<"model"|"parameters"|"equations"|"tools">("parameters");
  const [parameterLevel,setParameterLevel]=useState<"basic"|"advanced">("basic");
  const [showRuler,setShowRuler]=useState(false);
  const [showTangent,setShowTangent]=useState(false);
  const [graphMode,setGraphMode]=useState<"trajectory"|"position-time"|"velocity-time"|"acceleration-time">("trajectory");
  const [selectedObject,setSelectedObject]=useState(()=>objectOptionsFor(lab.id,language)[0].value);
  const [selectedObject2,setSelectedObject2]=useState(()=>objectOptionsFor(lab.id,language)[1]?.value??objectOptionsFor(lab.id,language)[0].value);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const drawRef=useRef<()=>void>(()=>{});
  const timeRef=useRef(0);const labDragRef=useRef<{x:number;y:number;panX:number;panY:number}|null>(null);const panFrameRef=useRef<number|null>(null);const pendingPanRef=useRef<{x:number;y:number}|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const points=useMemo(()=>makePoints(lab,values),[lab,values]);
  const duration=points[points.length-1]?.t??1;
  const current=points[Math.min(points.length-1,Math.round(time/duration*(points.length-1)))]??points[0];
  const metrics=useMemo(()=>metricsFor(lab,values,current,points,language),[lab,values,current,points,language]);
  const plottedPoints=useMemo(()=>graphMode==="trajectory"?points:points.map((p,i)=>{
    const angle=(values.angle??0)*Math.PI/180;
    const inclineNormal=(values.gravity??9.81)*Math.cos(angle),inclineParallel=(values.gravity??9.81)*Math.sin(angle)+(values.appliedForce??0)/Math.max(values.mass??1,.01),inclineStatic=Math.abs(inclineParallel)<= (values.staticFriction??0)*inclineNormal;const energyAngle=(values.inclineAngle??30)*Math.PI/180,energyStatic=(values.initialSpeed??0)<=1e-9&&Math.tan(energyAngle)<=(values.staticFriction??0),energyAccel=energyStatic?0:(values.gravity??9.81)*(Math.sin(energyAngle)-(values.friction??0)*Math.cos(energyAngle));const springOmega0=Math.sqrt((values.spring??0)/Math.max(values.mass??1,.01)),springBeta=(values.dampingRatio??0)*springOmega0;const acceleration=lab.id==="mru"?0:lab.id==="mrua"?values.acceleration??0:lab.id==="incline"?(inclineStatic?0:inclineParallel-Math.sign(inclineParallel||1)*(values.friction??0)*inclineNormal):lab.id==="spring"?-springOmega0**2*p.x-2*springBeta*p.vx:lab.id==="circular"?-((values.omega??0)**2)*p.x:lab.id==="energy"?energyAccel:lab.id==="projectile"?-(values.gravity??9.81):lab.id==="collision"?0:(i===0?0:(points[i].vx-points[i-1].vx)/Math.max(.000001,points[i].t-points[i-1].t));
    return graphMode==="position-time"?{...p,x:p.t,y:(lab.id==="energy"||lab.id==="incline")?Math.hypot(p.x,lab.id==="energy"?(values.height??0)-p.y:p.y):p.x}:graphMode==="velocity-time"?{...p,x:p.t,y:(lab.id==="energy"||lab.id==="incline")?p.speed:p.vx}:{...p,x:p.t,y:acceleration};
  }),[graphMode,points,lab,values]);
  const objectOrientation=lab.id==="energy"?(values.inclineAngle??30)*Math.PI/180:lab.id==="incline"?(values.angle??0)*Math.PI/180:(lab.id==="projectile"||lab.id==="circular")?Math.atan2(-current.vy,current.vx):0;

  useEffect(()=>{
    const initial=Object.fromEntries(allLabParams(lab).map(p=>[p.key,p.initial]));
    setValues(initial);setSelectedObject(objectOptionsFor(lab.id,language)[0].value);setSelectedObject2(objectOptionsFor(lab.id,language)[1]?.value??objectOptionsFor(lab.id,language)[0].value);setTime(0);timeRef.current=0;setPlaying(false);setNotice("");
  },[lab.id]);

  useEffect(()=>{
    if(!playing)return;
    let frame=0,last=0,lastUi=0;
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
    const constrainedDevice=((Number((navigator as Navigator&{deviceMemory?:number}).deviceMemory)||8)<=4||(navigator.hardwareConcurrency||8)<=4);
    const fps=reduced?8:constrainedDevice&&motionLevel==="high"?28:motionLevel==="low"?14:motionLevel==="medium"?28:44;
    const interval=1000/fps;
    const tick=(now:number)=>{
      if(!last)last=now;
      const next=timeRef.current+Math.min((now-last)/1000,.05)*speedFactor;
      last=now;timeRef.current=Math.min(next,duration);
      if(now-lastUi>=interval||next>=duration){lastUi=now;setTime(timeRef.current);}
      if(next>=duration){setPlaying(false);return;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[playing,duration,speedFactor,motionLevel]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const render=()=>{
      const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
      const constrainedDevice=((Number((navigator as Navigator&{deviceMemory?:number}).deviceMemory)||8)<=4||(navigator.hardwareConcurrency||8)<=4);const qualityCap=renderMode==="performance"?1:renderMode==="detail"?(constrainedDevice?1.5:2):(motionLevel==="low"||constrainedDevice?1:motionLevel==="medium"?1.5:2);const dpr=Math.min(window.devicePixelRatio||1,qualityCap);
      const cw=Math.round(rect.width*dpr),ch=Math.round(rect.height*dpr);
      if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const width=rect.width,height=rect.height,left=76,right=34,top=36,bottom=65;
      const pw=width-left-right,ph=height-top-bottom;
      const plotStyle=getComputedStyle(canvas),plotBg=plotStyle.getPropertyValue("--plot-bg").trim()||(theme==="dark"?"#111d2b":"#fff"),gridMajor=plotStyle.getPropertyValue("--plot-grid").trim()||(theme==="dark"?"#26384b":"#edf2f7"),axisColor=plotStyle.getPropertyValue("--plot-axis").trim()||(theme==="dark"?"#70869d":"#748ba2");ctx.clearRect(0,0,width,height);ctx.fillStyle=plotBg;ctx.fillRect(0,0,width,height);
      const plotted=plottedPoints;
      const plottedIndex=Math.min(plotted.length-1,Math.round(time/duration*(plotted.length-1)));
      const plottedCurrent=graphMode==="trajectory"?current:plotted[plottedIndex];
      const slopeBefore=plotted[Math.max(0,plottedIndex-1)];
      const slopeAfter=plotted[Math.min(plotted.length-1,plottedIndex+1)];
      const localSlope=(slopeAfter.y-slopeBefore.y)/Math.max(1e-9,slopeAfter.x-slopeBefore.x);
      let minX=Math.min(...plotted.map(p=>p.x)),maxX=Math.max(...plotted.map(p=>p.x));
      let minY=Math.min(...plotted.map(p=>p.y)),maxY=Math.max(...plotted.map(p=>p.y));
      if(graphMode==="trajectory"&&lab.id==="collision"){const positions=points.flatMap(p=>[p.x,p.x2??p.x]);minX=Math.min(...positions);maxX=Math.max(...positions);minY=-1;maxY=1;}
      if(graphMode!=="trajectory"&&lab.id==="collision"){
        const secondary=points.map(p=>graphMode==="position-time"?(p.x2??0):graphMode==="velocity-time"?(p.vx2??0):0);
        minY=Math.min(minY,...secondary);maxY=Math.max(maxY,...secondary);
      }
      if(graphMode==="trajectory"){
        if(lab.id==="circular"){minX=-values.radius*1.3;maxX=values.radius*1.3;minY=-values.radius*1.3;maxY=values.radius*1.3;}
        if(lab.id==="spring"){minX=-values.amplitude*1.35;maxX=values.amplitude*1.35;minY=-.5;maxY=.5;}
        if(lab.id==="mru"||lab.id==="mrua"){minY=-1;maxY=1;}
        if(lab.id==="energy"){minY=0;maxY=values.height*1.2;}
        if(lab.id==="projectile"){minY=0;maxY=Math.max(1,maxY*1.18);}
      }
      const padX=Math.max((maxX-minX)*.08,.5),padY=Math.max((maxY-minY)*.08,.5);
      minX-=padX;maxX+=padX;minY-=padY;maxY+=padY;
      if(graphMode==="trajectory"&&["projectile","circular","energy","incline","spring"].includes(lab.id)){
        const unitsPerPixel=Math.max((maxX-minX)/pw,(maxY-minY)/ph);
        const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
        minX=centerX-unitsPerPixel*pw/2;maxX=centerX+unitsPerPixel*pw/2;
        minY=centerY-unitsPerPixel*ph/2;maxY=centerY+unitsPerPixel*ph/2;
      }
      const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,spanX=(maxX-minX)/graphZoom,spanY=(maxY-minY)/graphZoom;minX=centerX-spanX/2+graphPan.x*spanX;maxX=centerX+spanX/2+graphPan.x*spanX;minY=centerY-spanY/2+graphPan.y*spanY;maxY=centerY+spanY/2+graphPan.y*spanY;const sx=(maxX-minX)||1,sy=(maxY-minY)||1;
      const X=(x:number)=>left+(x-minX)/sx*pw;
      const Y=(y:number)=>top+ph-(y-minY)/sy*ph;
      const x0=X(Math.max(minX,Math.min(maxX,0))),y0=Y(Math.max(minY,Math.min(maxY,0)));
      const niceStep=(span:number,target=8)=>{
        const raw=span/target,power=Math.pow(10,Math.floor(Math.log10(Math.max(raw,1e-9))));
        const fraction=raw/power,unit=fraction<=1?1:fraction<=2?2:fraction<=5?5:10;
        return unit*power;
      };
      const xStep=niceStep(sx,9),yStep=niceStep(sy,7);
      const xStart=Math.ceil(minX/xStep)*xStep,yStart=Math.ceil(minY/yStep)*yStep;
      if(showGrid){
        for(let value=xStart;value<=maxX+1e-9;value+=xStep){
          for(let sub=1;sub<5;sub++){const minor=value+xStep*sub/5;if(minor<maxX){ctx.strokeStyle=theme==="dark"?"#1c2c3e":"#f4f7fa";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(X(minor),top);ctx.lineTo(X(minor),top+ph);ctx.stroke();}}
          const gx=X(value);ctx.strokeStyle=Math.abs(value)<1e-9?axisColor:gridMajor;ctx.lineWidth=Math.abs(value)<1e-9?1.3:.9;
          ctx.beginPath();ctx.moveTo(gx,top);ctx.lineTo(gx,top+ph);ctx.stroke();
        }
        for(let value=yStart;value<=maxY+1e-9;value+=yStep){
          for(let sub=1;sub<5;sub++){const minor=value+yStep*sub/5;if(minor<maxY){ctx.strokeStyle=theme==="dark"?"#1c2c3e":"#f4f7fa";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(left,Y(minor));ctx.lineTo(left+pw,Y(minor));ctx.stroke();}}
          const gy=Y(value);ctx.strokeStyle=Math.abs(value)<1e-9?axisColor:gridMajor;ctx.lineWidth=Math.abs(value)<1e-9?1.3:.9;
          ctx.beginPath();ctx.moveTo(left,gy);ctx.lineTo(left+pw,gy);ctx.stroke();
        }
      }
      ctx.strokeStyle=axisColor;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(left,Math.min(top+ph,Math.max(top,y0)));ctx.lineTo(left+pw,Math.min(top+ph,Math.max(top,y0)));ctx.stroke();
      ctx.beginPath();ctx.moveTo(Math.min(left+pw,Math.max(left,x0)),top);ctx.lineTo(Math.min(left+pw,Math.max(left,x0)),top+ph);ctx.stroke();
      const decimals=(step:number)=>Math.max(0,Math.min(4,-Math.floor(Math.log10(step))));
      ctx.fillStyle=theme==="dark"?"#91a4b7":"#71849a";ctx.font="12px DM Sans, sans-serif";ctx.textAlign="center";
      for(let value=xStart;value<=maxX+1e-9;value+=xStep){const gx=X(value);ctx.fillText(value.toFixed(decimals(xStep)),gx,top+ph+22);}
      ctx.textAlign="right";
      for(let value=yStart;value<=maxY+1e-9;value+=yStep){const gy=Y(value);ctx.fillText(value.toFixed(decimals(yStep)),left-10,gy+4);}
      ctx.fillStyle=theme==="dark"?"#d1dce8":"#60758c";ctx.font="600 13px Inter, sans-serif";ctx.textAlign="center";
      ctx.fillText(graphMode==="trajectory"?(lab.id==="circular"||lab.id==="spring"?"x (m)":lab.id==="energy"?(language==="ID"?"Jarak sepanjang bidang (m)":"Distance along slope (m)"):(language==="ID"?"Posisi / jarak (m)":"Position / distance (m)")):(language==="ID"?"Waktu (s)":"Time (s)"),left+pw/2,height-14);
      ctx.save();ctx.translate(19,top+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(graphMode==="trajectory"?(lab.id==="energy"?(language==="ID"?"Ketinggian (m)":"Height (m)"):lab.id==="circular"?"y (m)":lab.id==="spring"?"—":(language==="ID"?"Posisi vertikal (m)":"Vertical position (m)")):graphMode==="position-time"?(language==="ID"?"Posisi (m)":"Position (m)"):graphMode==="velocity-time"?(language==="ID"?"Kecepatan (m/s)":"Velocity (m/s)"):(language==="ID"?"Percepatan (m/s²)":"Acceleration (m/s²)"),0,0);ctx.restore();

      if(graphMode==="trajectory"){
        ctx.save();
        if(lab.id==="projectile"||lab.id==="mru"||lab.id==="mrua"||lab.id==="collision"){
          const ground=Y(0);ctx.strokeStyle="#b9c8d7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left,ground);ctx.lineTo(left+pw,ground);ctx.stroke();
          if(lab.id==="projectile"){
            const ox=X(0);ctx.fillStyle="#71879d";ctx.fillRect(ox-17,ground-8,18,8);ctx.beginPath();ctx.arc(ox-8,ground-8,8,Math.PI,Math.PI*1.5);ctx.fill();
            ctx.fillStyle="#d9e5f0";ctx.beginPath();ctx.arc(ox,ground-3,3,0,Math.PI*2);ctx.fill();
          }else{
            ctx.strokeStyle="#d7e0e9";ctx.lineWidth=1;for(let k=0;k<14;k++){const gx=left+k*pw/13;ctx.beginPath();ctx.moveTo(gx,ground);ctx.lineTo(gx,ground+5);ctx.stroke();}
          }
        }else if(lab.id==="energy"){
          const end=points[points.length-1];ctx.fillStyle="#f6f8fb";ctx.beginPath();ctx.moveTo(X(0),Y(values.height));ctx.lineTo(X(end.x),Y(0));ctx.lineTo(X(0),Y(0));ctx.closePath();ctx.fill();
          ctx.strokeStyle="#b6c5d4";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Y(values.height));ctx.lineTo(X(end.x),Y(0));ctx.stroke();
          ctx.strokeStyle="#d5dee8";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(end.x),Y(0));ctx.lineTo(X(end.x)+18,Y(0));ctx.stroke();
        }else if(lab.id==="incline"){
          const end=points[points.length-1];ctx.strokeStyle="#b6c5d4";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(end.x),Y(end.y));ctx.stroke();
          ctx.strokeStyle="#d7e1eb";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(end.x),Y(end.y));ctx.lineTo(X(end.x)+18,Y(end.y));ctx.stroke();
        }else if(lab.id==="spring"){
          const anchor=X(-values.amplitude*1.5),base=Y(0);ctx.fillStyle="#9aabba";ctx.fillRect(anchor-4,base-27,4,54);
          ctx.strokeStyle="#d7e1eb";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(anchor,base-27);ctx.lineTo(anchor,base+27);ctx.stroke();
          ctx.strokeStyle="#e7edf4";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(-values.amplitude*1.4),base+17);ctx.lineTo(X(values.amplitude*1.4),base+17);ctx.stroke();
        }
        ctx.restore();
      }
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
      if(lab.id==="collision"&&graphMode!=="trajectory"){
        const secondValues=points.map(p=>({x:p.t,y:graphMode==="position-time"?(p.x2??0):graphMode==="velocity-time"?(p.vx2??0):0}));
        ctx.beginPath();secondValues.forEach((p,i)=>{if(i===0)ctx.moveTo(X(p.x),Y(p.y));else ctx.lineTo(X(p.x),Y(p.y));});
        ctx.strokeStyle="#d99a46";ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);
        const second=secondValues[plottedIndex];ctx.beginPath();ctx.arc(X(second.x),Y(second.y),5.5,0,Math.PI*2);ctx.fillStyle="#d99a46";ctx.fill();
        if(graphMode==="acceleration-time"){
          const collisionTime=collisionResults(values).collisionTime;
          if(Number.isFinite(collisionTime)&&collisionTime>=minX&&collisionTime<=maxX){
            ctx.strokeStyle="#d36f72";ctx.lineWidth=1.7;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(collisionTime),top);ctx.lineTo(X(collisionTime),top+ph);ctx.stroke();ctx.setLineDash([]);
            ctx.fillStyle="#b55e61";ctx.font="700 10px DM Sans";ctx.textAlign="left";ctx.fillText(language==="ID"?"Impuls / kontak":"Impulse / contact",Math.min(X(collisionTime)+7,left+pw-110),top+18);
          }
        }
      }
      if(lab.id==="collision"&&graphMode==="trajectory"){
        const end=showTrail?Math.max(1,Math.round(time/duration*(points.length-1))):points.length-1;
        ctx.beginPath();points.slice(0,end+1).forEach((p,i)=>{const x=p.x2??p.x;if(i===0)ctx.moveTo(X(x),Y(0));else ctx.lineTo(X(x),Y(0));});
        ctx.strokeStyle="#d99a46";ctx.lineWidth=2.5;ctx.setLineDash(showTrail?[6,4]:[3,6]);ctx.stroke();ctx.setLineDash([]);
      }
      const px=X(plottedCurrent.x),py=Y(plottedCurrent.y);
      if(showTangent&&graphMode!=="trajectory"&&Number.isFinite(localSlope)){
        const halfSpan=sx*.16;
        const xa=Math.max(minX,plottedCurrent.x-halfSpan),xb=Math.min(maxX,plottedCurrent.x+halfSpan);
        const ya=plottedCurrent.y+localSlope*(xa-plottedCurrent.x),yb=plottedCurrent.y+localSlope*(xb-plottedCurrent.x);
        ctx.beginPath();ctx.moveTo(X(xa),Y(ya));ctx.lineTo(X(xb),Y(yb));
        ctx.strokeStyle="#d99a46";ctx.lineWidth=2.2;ctx.setLineDash([7,4]);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="#9b6b27";ctx.font="600 11px DM Sans";ctx.textAlign="left";
        ctx.fillText((language==="ID"?"Gradien: ":"Slope: ")+localSlope.toFixed(3),left+12,top+38);
      }
      if(showRuler){
        ctx.strokeStyle="#d99a46";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,top+ph);ctx.moveTo(left,py);ctx.lineTo(left+pw,py);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle="#9b6b27";ctx.font="11px DM Sans";ctx.textAlign="left";ctx.fillText(`${plottedCurrent.x.toFixed(2)}, ${plottedCurrent.y.toFixed(2)}`,Math.min(px+9,left+pw-100),Math.max(top+14,py-9));
      }
      if(showVectors&&graphMode==="trajectory"){
        const vector=(dx:number,dy:number,color:string,reference=Math.hypot(dx,dy))=>{
          if(Math.hypot(dx,dy)<1e-7)return;
          const scale=.20*Math.min(pw,ph)*Math.max(1e-8,Math.min(sx/pw,sy/ph))/Math.max(reference,1e-7);
          drawArrow(ctx,px,py,px+dx*scale*pw/sx,py-dy*scale*ph/sy,color);
        };
        const tag=(label:string,color:string,x:number,y:number)=>{
          ctx.fillStyle=color;ctx.font="700 14px DM Sans, sans-serif";ctx.textAlign="left";ctx.lineWidth=3;ctx.strokeStyle=theme==="dark"?"#111d2b":"#fff";ctx.strokeText(label,x,y);ctx.fillStyle=color;ctx.fillText(label,x,y);
        };
        if(lab.id==="projectile"){
          vector(current.vx,0,"#347fd5",current.speed);vector(0,current.vy,"#4da786",current.speed);vector(current.vx,current.vy,"#d99a46",current.speed);
          vector(0,-(values.gravity??9.81),"#d36f72",values.gravity??9.81);
          tag("vₓ","#347fd5",px+12,py+18);tag("vᵧ","#4da786",px+12,py-17);tag("v","#d99a46",px+27,py-30);tag("g","#d36f72",px-23,py+34);
        }else if(lab.id==="circular"){
          vector(current.vx,current.vy,"#347fd5",current.speed);vector(-current.x,-current.y,"#d99a46",Math.max((values.omega??0)**2*(values.radius??0),1e-6));
          tag("v","#347fd5",px+12,py-14);tag("aᶜ","#d99a46",px-25,py+24);
        }else if(lab.id==="collision"){
          vector(current.vx,0,"#347fd5",Math.max(Math.abs(current.vx),1e-6));
          if(current.x2!==undefined&&current.vx2!==undefined){
            const secondX=X(current.x2),scale=.20*Math.min(pw,ph)*Math.max(1e-8,Math.min(sx/pw,sy/ph))/Math.max(Math.abs(current.vx2),1e-7);
            if(Math.abs(current.vx2)>1e-7)drawArrow(ctx,secondX,py,secondX+current.vx2*scale*pw/sx,py,"#d99a46");
            tag("v₂","#d99a46",secondX+12,py+25);
          }
          tag("v₁","#347fd5",px+12,py-14);
        }else if(lab.id==="incline"||lab.id==="energy"){
          const theta=lab.id==="energy"?Math.PI/6:(values.angle??0)*Math.PI/180;
          const mass=values.mass??1,g=values.gravity??9.81,mu=values.friction??0;
          const normal=mass*g*Math.cos(theta),parallel=mass*g*Math.sin(theta),staticHolds=Math.tan(theta)<=(values.staticFriction??0),friction=staticHolds?parallel:Math.min(mu*normal,parallel);
          const base=lab.id==="incline"?{x:px,y:py}:{x:px,y:py};
          const unit= Math.min(pw,ph)*.20/Math.max(mass*g,1);
          const forceArrow=(dx:number,dy:number,color:string,label:string,offsetX:number,offsetY:number)=>{
            drawArrow(ctx,base.x,base.y,base.x+dx*unit,base.y-dy*unit,color);
            tag(label,color,base.x+dx*unit+offsetX,base.y-dy*unit+offsetY);
          };
          forceArrow(0,-mass*g,"#d36f72","mg",5,14);
          forceArrow(Math.sin(theta)*normal,Math.cos(theta)*normal,"#4da786","N",8,-5);
          forceArrow(Math.cos(theta)*parallel,-Math.sin(theta)*parallel,"#d99a46","mg∥",5,10);
          if(friction>0)forceArrow(-Math.cos(theta)*friction,Math.sin(theta)*friction,"#8b6bd6","f",-14,12);
        }else{
          vector(current.vx,0,"#347fd5",Math.max(current.speed,1e-6));tag("v","#347fd5",px+12,py-13);
          if(lab.id==="spring"){
            const restoring=-(values.spring??0)*current.x/(values.mass??1);
            vector(restoring,0,"#d99a46",Math.max((values.spring??0)*(values.amplitude??0),1e-6));tag("F","#d99a46",px+12,py+18);
          }else if(lab.id==="mrua"){
            vector(values.acceleration??0,0,"#d36f72",Math.max(Math.abs(values.acceleration??0),1e-6));tag("a","#d36f72",px+12,py+31);
          }
        }
      }
      if(lab.id==="collision"&&current.x2!==undefined)drawLabObject(ctx,X(current.x2),py,selectedObject2,"#d99a46");
      drawLabObject(ctx,px,py,selectedObject,lab.color,objectOrientation);
      if(graphMode==="trajectory"&&lab.id==="projectile"){ctx.strokeStyle="#b6d3ef";ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,Y(0));ctx.stroke();ctx.setLineDash([]);}
      if(graphMode==="trajectory"&&lab.id==="projectile"){ctx.strokeStyle="#b9ddcf";ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(X(0),py);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle="#8494a6";ctx.font="11px Inter";ctx.textAlign="left";ctx.fillText("t = "+time.toFixed(2)+" s",left+12,top+20);
    };
    drawRef.current=render;render();
  },[lab,values,points,time,current,showGrid,showVectors,showTrail,showRuler,showTangent,graphMode,selectedObject,selectedObject2,objectOrientation,theme,graphPan,graphZoom]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const observer=new ResizeObserver(()=>drawRef.current());observer.observe(canvas);
    return()=>observer.disconnect();
  },[]);

  const changeParam=(key:string,value:number)=>{
    setValues(prev=>{
      const next={...prev,[key]:value};
      if((lab.id==="incline"||lab.id==="energy")&&typeof next.friction==="number"&&typeof next.staticFriction==="number"){
        if(key==="friction"&&next.friction>next.staticFriction)next.staticFriction=next.friction;
        if(key==="staticFriction"&&next.staticFriction<next.friction)next.friction=next.staticFriction;
      }
      return next;
    });timeRef.current=0;setTime(0);setPlaying(false);setGraphPan({x:0,y:0});setGraphZoom(1);setExpandedMetric(null);
  };
  const reset=()=>{timeRef.current=0;setTime(0);setPlaying(false);};
  const togglePlay=()=>{
    if(playing){setPlaying(false);return;}
    if(timeRef.current>=duration){timeRef.current=0;setTime(0);}
    setPlaying(true);
  };
  const seek=(value:number)=>{const next=Math.max(0,Math.min(duration,value));timeRef.current=next;setTime(next);if(next>=duration)setPlaying(false);};

  const exportCsv=()=>{
    const rows=["time_s,x1_m,y1_m,v1x_m_s,v1y_m_s,speed1_m_s,kinetic_total_J,potential_J,x2_m,v2x_m_s,collision_occurred"];
    points.forEach(p=>rows.push([p.t,p.x,p.y,p.vx,p.vy,p.speed,p.kinetic,p.potential,p.x2??"",p.vx2??"",p.collisionOccurred?1:0].map(n=>typeof n==="number"?n.toFixed(7):n).join(",")));
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
        for(const param of allLabParams(lab)){
          const n=data.values[param.key];
          if(typeof n!=="number"||!Number.isFinite(n)){
            if(advancedParams[lab.id].some(extra=>extra.key===param.key)){next[param.key]=param.initial;continue;}
            throw new Error("Invalid parameter");
          }
          next[param.key]=Math.max(param.min,Math.min(param.max,n));
        }
        if((lab.id==="incline"||lab.id==="energy")&&typeof next.friction==="number"&&typeof next.staticFriction==="number"&&next.friction>next.staticFriction)next.friction=next.staticFriction;
        setValues(next);reset();setNotice(words[language].projectLoaded);
      }catch{setNotice(words[language].projectError);}
      input.value="";
    };
    reader.readAsText(file);
  };
  const activeLabLabel=tLabel(language,lab);
  const springOmega0=Math.sqrt((values.spring??0)/Math.max(values.mass??1,.01)),springZeta=values.dampingRatio??0,springBeta=springZeta*springOmega0,springOmegaD=springOmega0*Math.sqrt(1-springZeta*springZeta);
  const activeMainFormula=lab.id==="projectile"&&(values.dragBeta??0)>0?String.raw`v_x=v_{0x}e^{-\beta t},\quad v_y=(v_{0y}+g/\beta)e^{-\beta t}-g/\beta`:lab.id==="spring"&&springZeta>0?String.raw`x(t)=Ae^{-\zeta\omega_0t}\cos(\omega_dt+\phi),\quad \omega_d=\omega_0\sqrt{1-\zeta^2}`:lab.id==="circular"&&(values.phaseDegrees??0)!==0?String.raw`\theta(t)=\theta_0+\omega t,\quad \theta_0=${((values.phaseDegrees??0)*Math.PI/180).toFixed(3)}\,\mathrm{rad}`:lab.id==="incline"&&(values.appliedForce??0)!==0?String.raw`a=g\sin\theta+\frac{F_{\parallel}}{m}-\operatorname{sgn}(mg\sin\theta+F_{\parallel})\mu_k g\cos\theta`:lab.formula;
  const assumptions:Record<LabId,{id:string;en:string}> = {
    projectile:{id:"Lintasan 2D ideal tanpa hambatan udara; gravitasi konstan dan permukaan tanah datar.",en:"Ideal 2D trajectory without air drag; gravity is constant and the ground is level."},
    mru:{id:"Gerak satu dimensi pada lintasan lurus; kecepatan konstan dan resultan gaya nol.",en:"One-dimensional straight-line motion; velocity is constant and net force is zero."},
    mrua:{id:"Gerak satu dimensi dengan percepatan konstan; gaya resultan konstan.",en:"One-dimensional motion with constant acceleration; net force is constant."},
    circular:{id:"Gerak melingkar beraturan: jari-jari dan kecepatan sudut konstan; percepatan sentripetal menuju pusat.",en:"Uniform circular motion: fixed radius and angular speed; centripetal acceleration points inward."},
    energy:{id:"Balok meluncur pada bidang dengan sudut dan kelajuan awal yang dapat diatur. Gesekan statis menentukan apakah balok yang diam mulai bergerak; setelah meluncur, gesekan kinetis bekerja. Hambatan udara dan rotasi diabaikan.",en:"A block slides on an incline with adjustable angle and initial speed. Static friction determines whether a resting block starts moving; kinetic friction acts during sliding. Air drag and rotation are omitted."},
    incline:{id:"Balok pada bidang miring; gesekan statis menentukan ambang gerak, gesekan kinetis berlaku selama meluncur. Hambatan udara diabaikan.",en:"A block on an inclined plane; static friction sets the motion threshold, and kinetic friction applies while sliding. Air drag is ignored."},
    collision:{id:"Tumbukan satu dimensi; impuls eksternal selama kontak diabaikan. Kecepatan akhir dihitung dari momentum dan koefisien restitusi. Gaya kontak yang ditampilkan adalah gaya rata-rata selama durasi kontak, bukan gaya puncak.",en:"One-dimensional collision; external impulse during contact is neglected. Final velocities follow from momentum and restitution. Contact force is the mean over contact duration, not peak force."},
    spring:{id:"Pegas dianggap linear dengan redaman viskos linier. Model dibatasi pada redaman kurang (ζ < 1), tanpa gesekan kering, histeresis, atau gaya luar periodik.",en:"The spring is linear with viscous damping. The model is restricted to the underdamped regime (ζ < 1), with no dry friction, hysteresis, or periodic driving force."}
  };

  const modelKnowledge:Record<LabId,{qID:string;aID:string;qEN:string;aEN:string;factID:string;factEN:string}>={
    projectile:{qID:"Mengapa lintasan menjadi parabola?",aID:"Tanpa hambatan udara, komponen horizontal berkecepatan konstan dan komponen vertikal memiliki percepatan −g. Gabungannya menghasilkan lintasan kuadratik.",qEN:"Why is the trajectory parabolic?",aEN:"Without drag, horizontal velocity is constant while vertical acceleration is −g. Their combination produces a quadratic path.",factID:"Pada ketinggian awal nol tanpa hambatan, sudut komplementer θ dan 90°−θ menghasilkan jangkauan sama.",factEN:"From zero launch height without drag, complementary angles θ and 90°−θ give the same range."},
    mru:{qID:"Apakah percepatan nol berarti benda diam?",aID:"Tidak. Benda dapat diam atau bergerak dengan kecepatan tetap; yang penting kecepatannya tidak berubah.",qEN:"Does zero acceleration mean an object is at rest?",aEN:"No. It may be at rest or move at constant velocity; its velocity simply does not change.",factID:"Dua benda dapat melewati posisi yang sama pada waktu yang sama walau kecepatan dan arah geraknya berbeda.",factEN:"Two objects may occupy the same position at the same instant while moving at different velocities and directions."},
    mrua:{qID:"Apakah percepatan negatif selalu berarti melambat?",aID:"Tidak. Tanda negatif hanya menyatakan arah terhadap sumbu pilihan. Benda melambat ketika percepatan berlawanan arah dengan kecepatan.",qEN:"Does negative acceleration always mean slowing down?",aEN:"No. The sign indicates direction relative to the chosen axis. An object slows when acceleration opposes its velocity.",factID:"Di titik tertinggi lemparan vertikal, kecepatan sesaat nol tetapi percepatan gravitasi tetap mengarah ke bawah.",factEN:"At the top of a vertical throw, velocity is momentarily zero but gravitational acceleration still points downward."},
    circular:{qID:"Mengapa gerak melingkar berkelajuan tetap tetap dipercepat?",aID:"Arah vektor kecepatan terus berubah. Percepatan sentripetal mengubah arah tersebut menuju pusat lingkaran.",qEN:"Why is uniform circular motion still accelerated?",aEN:"The velocity direction continually changes. Centripetal acceleration turns it toward the circle's center.",factID:"Gaya sentripetal bukan gaya baru; itu resultan gaya radial yang dapat berasal dari tegangan, gravitasi, gesekan, atau gaya normal.",factEN:"Centripetal force is not a new force; it is the net radial force supplied by tension, gravity, friction, or a normal force."},
    energy:{qID:"Apakah energi mekanik selalu kekal?",aID:"Tidak. Usaha oleh gaya nonkonservatif dapat mengubah energi mekanik sistem. Energi total tetap jika transfer ke lingkungan ikut diperhitungkan.",qEN:"Is mechanical energy always conserved?",aEN:"No. Non-conservative work can change a system's mechanical energy. Total energy remains conserved when transfers to the surroundings are included.",factID:"Gaya yang tegak lurus perpindahan dapat melakukan usaha nol meskipun gayanya tidak nol, seperti gaya sentripetal pada gerak melingkar beraturan.",factEN:"A force perpendicular to displacement does zero work even when nonzero, such as centripetal force in uniform circular motion."},
    incline:{qID:"Apakah gaya gesek statis selalu μₛN?",aID:"Tidak. Gesekan statis menyesuaikan kebutuhan hingga batas maksimum μₛN. Batas maksimum tercapai saat tepat akan slip.",qEN:"Is static friction always μₛN?",aEN:"No. Static friction adjusts as needed up to μₛN, reaching its maximum only at the threshold of slipping.",factID:"Gaya normal tidak selalu sama dengan berat; pada bidang miring sederhana N = mg cos θ.",factEN:"The normal force is not always equal to weight; on a simple incline N = mg cos θ."},
    collision:{qID:"Apakah momentum dan energi kinetik sama-sama kekal?",aID:"Momentum sistem kekal jika impuls eksternal dapat diabaikan. Energi kinetik hanya kekal pada tumbukan lenting sempurna.",qEN:"Are momentum and kinetic energy both conserved?",aEN:"System momentum is conserved when external impulse is negligible. Kinetic energy is conserved only in elastic collisions.",factID:"Gaya kontak kedua benda sama besar dan berlawanan arah, tetapi perubahan kecepatannya dapat berbeda karena massanya berbeda.",factEN:"The contact forces on two bodies are equal and opposite, but their velocity changes can differ because their masses differ."},
    spring:{qID:"Apa pengaruh redaman pada osilasi?",aID:"Redaman mengurangi amplitudo dan energi osilasi dari waktu ke waktu. Pada redaman kurang, frekuensi teredam lebih kecil daripada frekuensi alami.",qEN:"How does damping affect oscillation?",aEN:"Damping reduces amplitude and oscillation energy over time. In an underdamped system, damped frequency is below natural frequency.",factID:"Periode pegas ideal tidak bergantung pada amplitudo selama pegas tetap dalam daerah linear.",factEN:"The ideal spring period is independent of amplitude while the spring remains in its linear regime."}
  };
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
    <div className={focusMode?"lab-studio focus-mode":"lab-studio"}>
      <aside className="lab-topic-sidebar">
        <div className="lab-topic-heading"><span className="eyebrow">{language==="ID"?"MEKANIKA":"MECHANICS"}</span><strong>{language==="ID"?"Laboratorium":"Laboratories"}</strong></div>
        <nav aria-label={language==="ID"?"Daftar laboratorium":"Laboratory list"}>
          {labs.map((item,index)=><button key={item.id} className={item.id===lab.id?"active":""} onClick={()=>onChoose(item.id)}>
            <span className="lab-topic-number">{String(index+1).padStart(2,"0")}</span>
            <span className="lab-topic-label"><strong>{language==="ID"?item.title:item.subtitle}</strong><small>{categoryText(language,item.category)}</small></span>
            <span className="lab-topic-indicator"/>
          </button>)}
        </nav>
      </aside>
      <aside className="control-drawer">
        <nav className="drawer-rail" aria-label={language==="ID"?"Panel laboratorium":"Laboratory panels"}>
          <button className={drawerTab==="parameters"?"selected":""} onClick={()=>setDrawerTab("parameters")} title={w.parameters}><SlidersHorizontal/><span>{language==="ID"?"Atur":"Setup"}</span></button>
          <button className={drawerTab==="equations"?"selected":""} onClick={()=>setDrawerTab("equations")} title={w.expr}><Atom/><span>{language==="ID"?"Rumus":"Math"}</span></button>
          <button className={drawerTab==="tools"?"selected":""} onClick={()=>setDrawerTab("tools")} title={language==="ID"?"Alat grafik":"Graph tools"}><Settings2/><span>{language==="ID"?"Alat":"Tools"}</span></button>
          <button className={drawerTab==="model"?"selected":""} onClick={()=>setDrawerTab("model")} title={w.question}><CircleHelp/><span>{language==="ID"?"Model":"Model"}</span></button>
        </nav>
        <div className="drawer-content">
          {drawerTab==="parameters"&&<><div className="panel-title"><span>01</span><h2>{w.parameters}</h2></div><div className="parameter-mode-switch" role="group" aria-label={language==="ID"?"Tingkat parameter":"Parameter level"}><button type="button" className={parameterLevel==="basic"?"active":""} aria-pressed={parameterLevel==="basic"} onClick={()=>setParameterLevel("basic")}>{language==="ID"?"Dasar":"Basic"}</button><button type="button" className={parameterLevel==="advanced"?"active":""} aria-pressed={parameterLevel==="advanced"} onClick={()=>setParameterLevel("advanced")}>{language==="ID"?"Lanjutan":"Advanced"}</button></div><p className="parameter-mode-help">{parameterLevel==="basic"?(language==="ID"?"Variabel utama untuk memahami pengaruh dasar pada eksperimen.":"Core variables for exploring the main effects."):(language==="ID"?"Seluruh parameter, termasuk kondisi awal dan model spesifik yang mengubah perhitungan serta grafik.":"All parameters, including initial conditions and model-specific settings that change calculations and graphs.")}</p><div className="parameter-list">{(parameterLevel==="basic"?lab.params.filter(param=>basicParamKeys[lab.id].includes(param.key)):allLabParams(lab)).map(param=><Slider key={param.key} param={{...param,label:parameterText(language,param.key,param.label)}} value={values[param.key]??param.initial} onChange={v=>changeParam(param.key,v)}/>)}</div></>}
          {drawerTab==="equations"&&<><div className="panel-title"><span>02</span><h2>{w.expr}</h2></div><div className="equation-feature"><span className="eyebrow">{language==="ID"?"MODEL UTAMA":"MAIN MODEL"}</span><div className="formula-box"><Equation value={activeMainFormula} display/></div><p>{language==="ID"?"Model inti yang digunakan untuk membangun simulasi ini.":"Core model used to build this simulation."}</p></div><div className="equation-list">{equationLibrary[lab.id].map((eq,index)=><article className="equation-card" key={eq.id}><div className="equation-card-head"><span>{String(index+1).padStart(2,"0")}</span><strong>{language==="ID"?eq.titleID:eq.titleEN}</strong><button title={language==="ID"?"Salin LaTeX":"Copy LaTeX"} onClick={()=>{void navigator.clipboard?.writeText(eq.formula);setNotice(language==="ID"?"LaTeX disalin":"LaTeX copied");}}><Copy size={15}/></button></div><div className="equation-math"><Equation value={eq.formula} display/></div><p>{language==="ID"?eq.noteID:eq.noteEN}</p></article>)}</div><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div></>}
          {drawerTab==="tools"&&<><div className="panel-title"><span>03</span><h2>{language==="ID"?"Alat grafik":"Graph tools"}</h2></div><label className="tool-select-label">{language==="ID"?"Jenis grafik":"Graph type"}<select value={graphMode} onChange={e=>setGraphMode(e.target.value as typeof graphMode)}><option value="trajectory">{language==="ID"?"Lintasan / bidang":"Trajectory / plane"}</option><option value="position-time">{language==="ID"?"Posisi–waktu (x–t)":"Position–time (x–t)"}</option><option value="velocity-time">{language==="ID"?"Kecepatan–waktu (v–t)":"Velocity–time (v–t)"}</option><option value="acceleration-time">{language==="ID"?"Percepatan–waktu (a–t)":"Acceleration–time (a–t)"}</option></select></label><button className={showRuler?"drawer-tool active": "drawer-tool"} onClick={()=>setShowRuler(v=>!v)}>{language==="ID"?"Penggaris koordinat":"Coordinate ruler"}<span>{showRuler?"ON":"OFF"}</span></button><button disabled={graphMode==="trajectory"} className={showTangent?"drawer-tool active":"drawer-tool"} onClick={()=>setShowTangent(v=>!v)}>{language==="ID"?"Garis singgung & gradien":"Tangent & slope"}<span>{showTangent?"ON":"OFF"}</span></button><button className={showGrid?"drawer-tool active":"drawer-tool"} onClick={()=>setShowGrid(v=>!v)}>{w.grid}<span>{showGrid?"ON":"OFF"}</span></button><button className={showVectors?"drawer-tool active":"drawer-tool"} onClick={()=>setShowVectors(v=>!v)}>{w.vectors}<span>{showVectors?"ON":"OFF"}</span></button><button className={showTrail?"drawer-tool active":"drawer-tool"} onClick={()=>setShowTrail(v=>!v)}>{w.trail}<span>{showTrail?"ON":"OFF"}</span></button><p className="drawer-help">{language==="ID"?"Penggaris menampilkan garis bantu dan koordinat titik saat ini. Grafik waktu memakai sumbu horizontal t.":"The ruler shows guide lines and the current point coordinates. Time plots use t on the horizontal axis."}</p></>}
          {drawerTab==="model"&&<><div className="panel-title"><span>04</span><h2>{w.assumptions}</h2></div><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div><div className="model-assumption-card"><strong>{language==="ID"?"Batas dan asumsi model":"Model assumptions and limits"}</strong><p>{language==="ID"?assumptions[lab.id].id:assumptions[lab.id].en}</p></div><section className="model-qa-section"><h3>{language==="ID"?"Pertanyaan umum":"Common questions"}</h3><details className="model-qa-item" open><summary>{language==="ID"?modelKnowledge[lab.id].qID:modelKnowledge[lab.id].qEN}</summary><p>{language==="ID"?modelKnowledge[lab.id].aID:modelKnowledge[lab.id].aEN}</p></details></section><aside className="model-fact-card"><span><Sparkles size={14}/>{language==="ID"?"FAKTA FISIKA":"PHYSICS FACT"}</span><p>{language==="ID"?modelKnowledge[lab.id].factID:modelKnowledge[lab.id].factEN}</p></aside></>}
        </div>
      </aside>
      <section className="graph-panel">
        <div className="graph-header"><div><span className="eyebrow">{w.graph}</span><strong>{language==="ID"?"Visualisasi sistem":"System visualization"}</strong></div><div className="graph-tools">
          <label className="object-picker"><span>{language==="ID"?"Objek 1":"Object 1"}</span><select value={selectedObject} onChange={e=>setSelectedObject(e.target.value)}>{objectOptionsFor(lab.id,language).map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{lab.id==="collision"&&<label className="object-picker"><span>{language==="ID"?"Objek 2":"Object 2"}</span><select value={selectedObject2} onChange={e=>setSelectedObject2(e.target.value)}>{objectOptionsFor(lab.id,language).map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
          <button className="focus-toggle" onClick={()=>setFocusMode(v=>!v)} aria-pressed={focusMode} title={focusMode?(language==="ID"?"Keluar dari tab fokus":"Exit focus view"):(language==="ID"?"Tab fokus":"Focus view")}>{focusMode?<Minimize2 size={18}/>:<Maximize2 size={18}/>}<span>{focusMode?(language==="ID"?"Keluar fokus":"Exit focus"):(language==="ID"?"Fokus":"Focus")}</span></button><button className="focus-reset-view" onClick={()=>setGraphZoom(v=>Math.min(8,v*1.2))} title={language==="ID"?"Perbesar grafik":"Zoom graph in"}><ZoomIn size={16}/></button><button className="focus-reset-view" onClick={()=>setGraphZoom(v=>Math.max(.25,v/1.2))} title={language==="ID"?"Perkecil grafik":"Zoom graph out"}><ZoomOut size={16}/></button><button className="focus-reset-view" onClick={()=>{setGraphPan({x:0,y:0});setGraphZoom(1);}} title={language==="ID"?"Reset posisi grafik":"Reset graph view"}><RotateCcw size={16}/></button><button className={showGrid?"tool-active":""} onClick={()=>setShowGrid(v=>!v)} title={w.grid}><Grid3X3 size={18}/><span>{w.grid}</span></button>
          <button className={showVectors?"tool-active":""} onClick={()=>setShowVectors(v=>!v)} title={w.vectors}><Activity size={18}/><span>{w.vectors}</span></button>
          <button className={showTrail?"tool-active":""} onClick={()=>setShowTrail(v=>!v)} title={w.trail}><Waves size={18}/><span>{w.trail}</span></button>
        </div></div>
        <div className="canvas-area" onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);labDragRef.current={x:e.clientX,y:e.clientY,panX:graphPan.x,panY:graphPan.y};}} onPointerMove={e=>{const active=labDragRef.current;if(!active)return;const rect=e.currentTarget.getBoundingClientRect(),dx=e.clientX-active.x,dy=e.clientY-active.y;pendingPanRef.current={x:active.panX-dx/Math.max(1,rect.width-110),y:active.panY+dy/Math.max(1,rect.height-100)};if(panFrameRef.current===null)panFrameRef.current=requestAnimationFrame(()=>{if(pendingPanRef.current)setGraphPan(pendingPanRef.current);pendingPanRef.current=null;panFrameRef.current=null;});}} onPointerUp={e=>{labDragRef.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{labDragRef.current=null;}} onWheel={e=>{e.preventDefault();setGraphZoom(v=>Math.max(.25,Math.min(8,v*(e.deltaY<0?1.12:.89))));}}><canvas ref={canvasRef} aria-label="Interactive physics simulation graph"/><div className="canvas-label">{(language==="ID"?lab.title:lab.subtitle).toUpperCase()} · {language==="ID"?"SATUAN SI":"SI UNITS"}</div></div>
        <div className="playback-bar">
          <button className="play-control" onClick={togglePlay} aria-label={playing?w.pause:w.play}>{playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor"/>}</button>
          <button className="reset-control" onClick={reset} aria-label={w.reset}><RotateCcw size={19}/></button>
          <div className="timeline"><div><span>{w.time}</span><strong>{time.toFixed(2)} s <small>/ {duration.toFixed(2)} s</small></strong></div><input type="range" min="0" max={duration} step={duration/600} value={time} onChange={e=>seek(Number(e.target.value))}/></div>
          <div className="play-speeds">{[.5,1,2].map(v=><button key={v} className={speedFactor===v?"selected":""} onClick={()=>setSpeedFactor(v)}>{v}×</button>)}</div>
        </div>
        <div className="measurement-area"><div className="measurement-heading"><span>03</span><strong>{w.values}</strong></div><div className="measurement-grid">{metrics.map(([label,value,unit],index)=>{const metricId=lab.id+":"+index;const expanded=expandedMetric===metricId;return <button type="button" className={expanded?"measurement expanded":"measurement"} key={metricId} onClick={()=>setExpandedMetric(expanded?null:metricId)} aria-expanded={expanded}><span>{label}</span><strong>{Number.isFinite(value)?value.toFixed(2):"—"} <small>{unit}</small></strong>{expanded&&<div className="measurement-equation" onClick={event=>event.stopPropagation()}><MeasurementDerivation formula={metricFormulaFor(lab.id,index,values,current,time,duration,language)} value={value} unit={unit} language={language}/></div>}</button>;})}</div></div>
        <div className="graph-footer"><span className="ready-dot"/>{w.status}<span className="footer-spacer"/><button onClick={exportCsv}><Download size={16}/>{w.export}</button><button onClick={()=>{reset();setGraphPan({x:0,y:0});setGraphZoom(1);}}><RotateCcw size={15}/>{w.resetView}</button>{notice&&<span className="notice"><Check size={15}/>{notice}</span>}</div>
      </section>
    </div>
    {!focusMode&&<><EquationCalculatorPanel labId={lab.id} language={language}/><PracticePanel labId={lab.id} language={language}/></>}
  </main>;
}


type LocalizedText={id:string;en:string};
type LessonChapter={title:LocalizedText;idea:LocalizedText;steps:LocalizedText[];formula:string;takeaway:LocalizedText};
type LessonModule={overview:LocalizedText;goals:LocalizedText[];chapters:LessonChapter[]};
const lessonModules:Record<LabId,LessonModule>={
 projectile:{
  overview:{id:"Gerak parabola adalah gerak dua dimensi yang merupakan gabungan gerak horizontal berkecepatan konstan dan gerak vertikal dengan percepatan gravitasi. Kedua komponen dianalisis terpisah, tetapi berlangsung pada waktu yang sama.",en:"Projectile motion is two-dimensional motion formed by constant-velocity horizontal motion and vertically accelerated motion under gravity. The components are analysed separately but occur over the same time interval."},
  goals:[{id:"Menguraikan kecepatan awal menjadi komponen horizontal dan vertikal.",en:"Resolve the initial velocity into horizontal and vertical components."},{id:"Menurunkan persamaan posisi dan kecepatan terhadap waktu.",en:"Derive position and velocity as functions of time."},{id:"Menghitung waktu terbang, tinggi maksimum, dan jangkauan.",en:"Calculate flight time, maximum height and horizontal range."}],
  chapters:[
   {title:{id:"Memahami dua komponen gerak",en:"Understanding the two components"},idea:{id:"Bayangkan bola dilempar miring. Secara horizontal, tidak ada percepatan jika hambatan udara diabaikan. Secara vertikal, gravitasi selalu menarik benda ke bawah. Karena itu lintasan gabungannya melengkung.",en:"Imagine a ball thrown at an angle. Horizontally there is no acceleration when air resistance is neglected. Vertically, gravity continuously pulls downward, so the combined path is curved."},steps:[{id:"Pilih sumbu x mendatar dan sumbu y vertikal ke atas.",en:"Choose x as horizontal and y as vertically upward."},{id:"Uraikan vektor kecepatan awal v₀ dengan trigonometri: komponen mendatar memakai cosinus, komponen vertikal memakai sinus.",en:"Resolve the initial velocity vector using trigonometry: the horizontal component uses cosine and the vertical component uses sine."},{id:"Tetapkan percepatan aₓ = 0 dan aᵧ = −g. Tanda minus menunjukkan arah gravitasi berlawanan dengan sumbu y positif.",en:"Set aₓ = 0 and aᵧ = −g. The minus sign indicates gravity points opposite to positive y."}],formula:"v_{0x}=v_0\\cos\\theta,\\quad v_{0y}=v_0\\sin\\theta,\\quad a_x=0,\\quad a_y=-g",takeaway:{id:"Pisahkan komponen terlebih dahulu. Menggabungkannya terlalu cepat sering menyebabkan tanda dan arah kecepatan keliru.",en:"Separate the components first. Combining them too early often causes sign and direction errors."}},
   {title:{id:"Menurunkan persamaan posisi",en:"Deriving the position equations"},idea:{id:"Posisi diperoleh dari kecepatan melalui integrasi waktu. Pada arah x, kecepatan tetap. Pada arah y, kecepatan berubah secara linear karena percepatan konstan.",en:"Position follows from velocity by integration over time. Along x, velocity is constant. Along y, velocity changes linearly because acceleration is constant."},steps:[{id:"Mulai dari vₓ = v₀ cos θ. Integralkan terhadap waktu untuk mendapatkan perpindahan horizontal.",en:"Start with vₓ = v₀ cos θ. Integrate with respect to time to obtain horizontal displacement."},{id:"Mulai dari vᵧ = v₀ sin θ − gt. Integralkan untuk memperoleh posisi vertikal.",en:"Start with vᵧ = v₀ sin θ − gt. Integrate to obtain vertical position."},{id:"Tambahkan posisi awal x₀ dan ketinggian awal h₀ sebagai konstanta integrasi.",en:"Add initial position x₀ and initial height h₀ as integration constants."}],formula:"x(t)=x_0+v_0\\cos\\theta\\,t,\\quad y(t)=h_0+v_0\\sin\\theta\\,t-\\frac12gt^2",takeaway:{id:"Persamaan horizontal linear terhadap waktu, sedangkan persamaan vertikal kuadratik. Inilah alasan lintasan berbentuk parabola.",en:"The horizontal equation is linear in time, while the vertical equation is quadratic. This is why the trajectory is parabolic."}},
   {title:{id:"Waktu terbang dan jangkauan",en:"Flight time and range"},idea:{id:"Di titik tertinggi, komponen kecepatan vertikal bernilai nol, tetapi komponen horizontal tetap ada. Saat benda kembali ke tanah, posisi vertikal sama dengan nol relatif terhadap permukaan tanah.",en:"At the highest point, vertical velocity is zero while horizontal velocity remains. When the projectile returns to the ground, its vertical position relative to the ground is zero."},steps:[{id:"Gunakan vᵧ = 0 untuk mencari waktu menuju puncak.",en:"Use vᵧ = 0 to find the time to the apex."},{id:"Masukkan y = 0 ke model posisi vertikal dan pilih akar waktu yang positif.",en:"Substitute y = 0 into the vertical position equation and choose the positive time root."},{id:"Masukkan waktu terbang ke x(t) untuk mendapatkan jangkauan horizontal.",en:"Substitute the flight time into x(t) to obtain the horizontal range."}],formula:"t_f=\\frac{v_0\\sin\\theta+\\sqrt{(v_0\\sin\\theta)^2+2gh_0}}{g},\\quad R=v_0\\cos\\theta\\,t_f",takeaway:{id:"Rumus jangkauan v₀² sin(2θ)/g hanya berlaku ketika ketinggian awal dan akhir sama.",en:"The range formula v₀² sin(2θ)/g applies only when launch and landing heights are equal."}}
  ]
 },
 mru:{
  overview:{id:"Gerak Lurus Beraturan (GLB) adalah gerak pada lintasan lurus dengan kecepatan vektor konstan. Benda menempuh perpindahan yang sama pada selang waktu yang sama.",en:"Uniform linear motion is motion along a straight path with constant velocity. The object undergoes equal displacements in equal time intervals."},
  goals:[{id:"Membedakan jarak, perpindahan, kelajuan, dan kecepatan.",en:"Distinguish distance, displacement, speed and velocity."},{id:"Menggunakan persamaan posisi GLB.",en:"Use the position equation for uniform motion."},{id:"Membaca kemiringan grafik posisi–waktu.",en:"Interpret the slope of a position–time graph."}],
  chapters:[
   {title:{id:"Posisi dan perpindahan",en:"Position and displacement"},idea:{id:"Posisi selalu diukur terhadap titik acuan. Jarak adalah panjang lintasan yang ditempuh, sedangkan perpindahan adalah perubahan posisi yang memiliki arah.",en:"Position is measured relative to a reference point. Distance is the path length travelled, while displacement is the directional change in position."},steps:[{id:"Tentukan titik asal dan arah positif.",en:"Choose an origin and positive direction."},{id:"Catat posisi awal x₀ dan posisi akhir x.",en:"Record initial position x₀ and final position x."},{id:"Hitung perpindahan sebagai x − x₀. Jangan menyamakan perpindahan dengan jarak untuk lintasan berbalik arah.",en:"Calculate displacement as x − x₀. Do not equate displacement with distance when the path reverses."}],formula:"\\Delta x=x-x_0",takeaway:{id:"Perpindahan dapat bernilai negatif; jarak tidak pernah negatif.",en:"Displacement can be negative; distance cannot."}},
   {title:{id:"Kecepatan konstan",en:"Constant velocity"},idea:{id:"Kecepatan adalah laju perubahan posisi terhadap waktu. Pada GLB, besar dan arah kecepatan tetap sehingga percepatan sama dengan nol.",en:"Velocity is the rate of change of position with time. In uniform motion, both its magnitude and direction remain constant, so acceleration is zero."},steps:[{id:"Hitung v = Δx/Δt untuk setiap selang waktu.",en:"Calculate v = Δx/Δt for each time interval."},{id:"Jika semua nilai v sama, model GLB konsisten.",en:"If all velocity values are equal, the uniform-motion model is consistent."},{id:"Gunakan x = x₀ + vt untuk memprediksi posisi pada waktu tertentu.",en:"Use x = x₀ + vt to predict position at a given time."}],formula:"v=\\frac{\\Delta x}{\\Delta t}=\\text{konstan},\\quad x(t)=x_0+vt",takeaway:{id:"Kecepatan negatif menunjukkan arah gerak negatif, bukan benda bergerak lebih lambat.",en:"Negative velocity indicates motion in the negative direction, not slower motion."}},
   {title:{id:"Membaca grafik GLB",en:"Reading uniform-motion graphs"},idea:{id:"Grafik posisi–waktu berupa garis lurus. Gradiennya menyatakan kecepatan. Grafik kecepatan–waktu berupa garis horizontal, dan luas bertanda di bawahnya menyatakan perpindahan.",en:"A position–time graph is a straight line whose slope is velocity. A velocity–time graph is horizontal, and its signed area gives displacement."},steps:[{id:"Pilih dua titik pada grafik x–t.",en:"Choose two points on the x–t graph."},{id:"Hitung gradien Δx/Δt.",en:"Calculate the slope Δx/Δt."},{id:"Periksa grafik v–t: garis horizontal menunjukkan kecepatan konstan.",en:"Check the v–t graph: a horizontal line indicates constant velocity."}],formula:"\\text{gradien grafik }x-t=\\frac{\\Delta x}{\\Delta t}=v,\\quad \\Delta x=\\text{luas bertanda grafik }v-t",takeaway:{id:"Grafik adalah cara lain menyatakan hukum gerak, bukan sekadar gambar pelengkap.",en:"A graph is another representation of the motion law, not merely a decorative picture."}}
  ]
 },
 mrua:{
  overview:{id:"Gerak Lurus Berubah Beraturan (GLBB) memiliki percepatan konstan. Kecepatan berubah secara teratur terhadap waktu, sehingga grafik v–t berbentuk garis lurus.",en:"Constant-acceleration motion has constant acceleration. Velocity changes uniformly with time, making the v–t graph a straight line."},
  goals:[{id:"Memahami percepatan sebagai perubahan kecepatan.",en:"Understand acceleration as a change in velocity."},{id:"Menurunkan persamaan v(t) dan x(t).",en:"Derive v(t) and x(t)."},{id:"Memilih persamaan yang sesuai dengan informasi soal.",en:"Choose an equation that matches the information in a problem."}],
  chapters:[
   {title:{id:"Konsep percepatan",en:"The concept of acceleration"},idea:{id:"Percepatan menjelaskan seberapa cepat kecepatan berubah, termasuk perubahan arah. Nilainya dapat positif atau negatif bergantung pada sumbu dan perubahan kecepatan.",en:"Acceleration describes how quickly velocity changes, including changes in direction. Its sign depends on the coordinate direction and velocity change."},steps:[{id:"Tentukan kecepatan awal dan akhir pada selang waktu.",en:"Identify initial and final velocities over a time interval."},{id:"Hitung a = (v − v₀)/Δt.",en:"Calculate a = (v − v₀)/Δt."},{id:"Tetapkan tanda berdasarkan arah sumbu positif yang dipilih.",en:"Assign the sign according to the chosen positive axis."}],formula:"a=\\frac{\\Delta v}{\\Delta t}=\\frac{v-v_0}{t}",takeaway:{id:"Percepatan negatif tidak selalu berarti benda melambat; periksa arah kecepatan juga.",en:"Negative acceleration does not always mean slowing down; check the velocity direction too."}},
   {title:{id:"Menurunkan v(t) dan x(t)",en:"Deriving v(t) and x(t)"},idea:{id:"Karena percepatan konstan, integral percepatan menghasilkan perubahan kecepatan linear. Integrasi kecepatan menghasilkan posisi kuadratik.",en:"Because acceleration is constant, integrating it gives a linear velocity change. Integrating velocity gives a quadratic position function."},steps:[{id:"Dari a = dv/dt, integralkan untuk memperoleh v = v₀ + at.",en:"Integrate a = dv/dt to obtain v = v₀ + at."},{id:"Masukkan v(t) ke dx/dt lalu integralkan kembali.",en:"Substitute v(t) into dx/dt and integrate again."},{id:"Gunakan syarat awal x(0)=x₀ untuk menentukan konstanta.",en:"Use the initial condition x(0)=x₀ to determine the constant."}],formula:"v(t)=v_0+at,\\quad x(t)=x_0+v_0t+\\frac12at^2",takeaway:{id:"Persamaan posisi mengandung t² karena kecepatan sendiri berubah terhadap waktu.",en:"The position equation contains t² because velocity itself changes with time."}},
   {title:{id:"Persamaan Torricelli dan jatuh bebas",en:"Torricelli equation and free fall"},idea:{id:"Jika waktu tidak diketahui, eliminasi t dari persamaan kecepatan dan posisi menghasilkan persamaan tanpa waktu. Jatuh bebas adalah kasus khusus GLBB dengan percepatan gravitasi.",en:"When time is unknown, eliminating t from the velocity and position equations gives a time-independent relation. Free fall is a special case with gravitational acceleration."},steps:[{id:"Pilih persamaan v = v₀ + at dan Δx = (v₀+v)t/2.",en:"Start from v = v₀ + at and Δx = (v₀+v)t/2."},{id:"Eliminasi waktu untuk memperoleh v² = v₀² + 2aΔx.",en:"Eliminate time to obtain v² = v₀² + 2aΔx."},{id:"Untuk jatuh bebas, gunakan a = −g jika sumbu positif ke atas.",en:"For free fall, use a = −g when the positive axis points upward."}],formula:"v^2=v_0^2+2a(x-x_0),\\quad a_y=-g",takeaway:{id:"Gunakan satu konvensi tanda dari awal sampai akhir agar hasil tidak berubah arah secara keliru.",en:"Keep one sign convention throughout the solution to avoid incorrect direction changes."}}
  ]
 },
 circular:{
  overview:{id:"Gerak Melingkar Beraturan (GMB) memiliki kelajuan sudut konstan, tetapi arah kecepatan linear terus berubah. Perubahan arah ini menyebabkan percepatan sentripetal menuju pusat lingkaran.",en:"Uniform circular motion has constant angular speed, but the direction of linear velocity continuously changes. This change creates centripetal acceleration toward the centre."},
  goals:[{id:"Memahami sudut dalam radian.",en:"Understand angles in radians."},{id:"Menghubungkan besaran sudut dan linear.",en:"Connect angular and linear quantities."},{id:"Menjelaskan asal percepatan sentripetal.",en:"Explain the origin of centripetal acceleration."}],
  chapters:[
   {title:{id:"Sudut dan radian",en:"Angles and radians"},idea:{id:"Radian membandingkan panjang busur dengan jari-jari. Satu putaran penuh adalah 2π radian. Satuan ini membuat hubungan sudut dan panjang busur sederhana.",en:"A radian compares arc length with radius. One full revolution is 2π radians. This unit makes angular–linear relations simple."},steps:[{id:"Ukur panjang busur s dan jari-jari r.",en:"Measure arc length s and radius r."},{id:"Hitung θ = s/r.",en:"Calculate θ = s/r."},{id:"Konversikan 360° menjadi 2π rad jika diperlukan.",en:"Convert 360° to 2π rad when needed."}],formula:"\\theta=\\frac{s}{r},\\quad 1\\text{ putaran}=2\\pi\\,\\mathrm{rad}",takeaway:{id:"Rumus v=ωr memakai ω dalam rad/s, bukan derajat per sekon.",en:"The relation v=ωr requires ω in rad/s, not degrees per second."}},
   {title:{id:"Periode, frekuensi, dan kecepatan tangensial",en:"Period, frequency and tangential speed"},idea:{id:"Periode adalah waktu satu putaran, frekuensi adalah jumlah putaran per sekon. Kecepatan tangensial mengukur laju sepanjang keliling.",en:"Period is the time for one revolution; frequency is revolutions per second. Tangential speed measures motion along the circumference."},steps:[{id:"Tentukan T dari waktu putaran penuh.",en:"Determine T from the time for one full revolution."},{id:"Gunakan f = 1/T dan ω = 2πf.",en:"Use f = 1/T and ω = 2πf."},{id:"Hitung kelajuan linear v = ωr.",en:"Calculate linear speed v = ωr."}],formula:"f=\\frac1T,\\quad \\omega=2\\pi f=\\frac{2\\pi}{T},\\quad v=\\omega r",takeaway:{id:"Pada ω yang sama, titik yang lebih jauh dari pusat memiliki kelajuan linear lebih besar.",en:"At the same ω, a point farther from the centre has greater linear speed."}},
   {title:{id:"Percepatan sentripetal",en:"Centripetal acceleration"},idea:{id:"Walaupun kelajuan tetap, arah v berubah setiap saat. Vektor percepatan muncul karena perubahan v dan mengarah ke pusat lintasan.",en:"Even at constant speed, the direction of v changes continuously. Acceleration arises from this change and points toward the centre."},steps:[{id:"Bandingkan dua vektor kecepatan yang berdekatan pada lingkaran.",en:"Compare two nearby velocity vectors on the circle."},{id:"Perubahan arah menghasilkan percepatan radial ke pusat.",en:"The change in direction produces radial acceleration toward the centre."},{id:"Gunakan a_c = v²/r atau a_c = ω²r.",en:"Use a_c = v²/r or a_c = ω²r."}],formula:"a_c=\\frac{v^2}{r}=\\omega^2r,\\quad F_c=ma_c",takeaway:{id:"Gaya sentripetal bukan jenis gaya baru; ia adalah resultan gaya yang mengarah ke pusat.",en:"Centripetal force is not a new kind of force; it is the net inward force."}}
  ]
 },
 energy:{
  overview:{id:"Energi mekanik adalah jumlah energi kinetik dan potensial. Tanpa gaya nonkonservatif, jumlahnya tetap. Gesekan mengubah sebagian energi mekanik menjadi energi internal/termal.",en:"Mechanical energy is the sum of kinetic and potential energy. Without non-conservative forces, it remains constant. Friction converts part of mechanical energy into internal/thermal energy."},
  goals:[{id:"Menghitung energi kinetik dan potensial.",en:"Calculate kinetic and potential energy."},{id:"Memahami teorema usaha–energi.",en:"Understand the work–energy theorem."},{id:"Menganalisis peran gesekan dalam neraca energi.",en:"Analyse friction in an energy balance."}],
  chapters:[
   {title:{id:"Usaha dan energi kinetik",en:"Work and kinetic energy"},idea:{id:"Usaha adalah transfer energi oleh gaya sepanjang perpindahan. Gaya searah perpindahan melakukan usaha positif, sedangkan gaya berlawanan arah melakukan usaha negatif.",en:"Work is energy transferred by a force along a displacement. A force along displacement does positive work; an opposing force does negative work."},steps:[{id:"Identifikasi gaya dan perpindahan.",en:"Identify the force and displacement."},{id:"Hitung W = Fs cos φ untuk gaya konstan.",en:"Calculate W = Fs cos φ for a constant force."},{id:"Hubungkan usaha total dengan perubahan energi kinetik.",en:"Relate net work to the change in kinetic energy."}],formula:"W_{net}=\\Delta E_k=\\frac12mv^2-\\frac12mv_0^2",takeaway:{id:"Usaha total positif meningkatkan energi kinetik; usaha total negatif menurunkannya.",en:"Positive net work increases kinetic energy; negative net work decreases it."}},
   {title:{id:"Energi potensial dan energi mekanik",en:"Potential and mechanical energy"},idea:{id:"Energi potensial gravitasi bergantung pada posisi terhadap acuan ketinggian. Energi kinetik bergantung pada kelajuan. Keduanya dapat saling berubah.",en:"Gravitational potential energy depends on height relative to a reference. Kinetic energy depends on speed. They can transform into one another."},steps:[{id:"Pilih tingkat acuan h=0.",en:"Choose a reference level h=0."},{id:"Hitung E_p = mgh dan E_k = ½mv².",en:"Calculate E_p = mgh and E_k = ½mv²."},{id:"Jumlahkan untuk memperoleh energi mekanik E_m.",en:"Add them to obtain mechanical energy E_m."}],formula:"E_m=E_k+E_p=\\frac12mv^2+mgh",takeaway:{id:"Nilai energi potensial dapat berubah jika acuan ketinggian dipilih berbeda, tetapi perubahan energi fisiknya konsisten.",en:"Potential-energy values depend on the chosen height reference, while physical energy changes remain consistent."}},
   {title:{id:"Gesekan dan kekekalan energi",en:"Friction and energy accounting"},idea:{id:"Gesekan kinetis melakukan usaha negatif terhadap gerak. Energi mekanik berkurang, tetapi energi total sistem yang lebih luas tetap terjaga ketika energi termal ikut dihitung.",en:"Kinetic friction does negative work on motion. Mechanical energy decreases, but total energy of a broader system remains conserved when thermal energy is included."},steps:[{id:"Hitung gaya gesek fₖ = μₖN.",en:"Calculate friction fₖ = μₖN."},{id:"Hitung usaha gesekan W_f = −fₖs.",en:"Calculate friction work W_f = −fₖs."},{id:"Gunakan E_m,akhir = E_m,awal + W_f.",en:"Use E_m,final = E_m,initial + W_f."}],formula:"E_{m,f}=E_{m,i}+W_f,\\quad W_f=-\\mu_kNs",takeaway:{id:"Jangan menyatakan energi hilang; energi mekanik berubah bentuk menjadi energi internal.",en:"Do not say energy disappears; mechanical energy is transformed into internal energy."}},
   {title:{id:"Daya dan laju transfer energi",en:"Power and the rate of energy transfer"},idea:{id:"Daya menyatakan seberapa cepat usaha dilakukan atau energi ditransfer. Dua gaya dapat melakukan usaha sama tetapi memiliki daya berbeda jika waktu yang dibutuhkan berbeda.",en:"Power measures how quickly work is done or energy is transferred. Two forces can do the same work but deliver different power if the time differs."},steps:[{id:"Hitung daya rata-rata dengan P = W/Δt.",en:"Calculate average power using P = W/Δt."},{id:"Untuk gaya konstan dan kecepatan sesaat, gunakan P = F·v.",en:"For a constant force and instantaneous velocity, use P = F·v."},{id:"Periksa satuan: watt setara joule per sekon.",en:"Check the unit: one watt equals one joule per second."}],formula:"P_{\\mathrm{avg}}=\\frac{W}{\\Delta t},\\quad P=\\vec F\\cdot\\vec v",takeaway:{id:"Daya besar berarti transfer energi berlangsung cepat, bukan berarti energi total pasti lebih besar.",en:"High power means energy is transferred quickly, not necessarily that the total energy is larger."}},
   {title:{id:"Usaha oleh gaya berubah",en:"Work done by a variable force"},idea:{id:"Jika gaya berubah terhadap posisi, usaha tidak selalu dapat dihitung dengan satu perkalian F·s. Usaha menjadi integral komponen gaya sepanjang lintasan.",en:"When force varies with position, work cannot always be found by one multiplication of F·s. Work becomes the integral of the force component along the path."},steps:[{id:"Gambarkan grafik Fₓ terhadap posisi x.",en:"Plot the x-component of force against position x."},{id:"Hitung usaha sebagai luas bertanda di bawah kurva Fₓ(x).",en:"Calculate work as the signed area under the Fₓ(x) curve."},{id:"Untuk pegas ideal, perubahan energi potensial elastis adalah ΔU = ½k(x_f²−x_i²).",en:"For an ideal spring, the change in elastic potential energy is ΔU = ½k(x_f²−x_i²)."}],formula:"W=\\int_{x_i}^{x_f}F_x(x)\\,dx,\\quad W_{\\mathrm{spring}}=-\\Delta U_s",takeaway:{id:"Integral menjumlahkan kontribusi usaha kecil sepanjang perpindahan; luas di bawah grafik dapat bernilai positif atau negatif.",en:"The integral sums small work contributions along the displacement; area under the graph can be positive or negative."}}
  ]
 },
 incline:{
  overview:{id:"Bidang miring mempermudah analisis gaya karena berat dapat diuraikan menjadi komponen sejajar dan tegak lurus bidang. Hukum II Newton diterapkan pada masing-masing sumbu.",en:"An inclined plane simplifies force analysis because weight can be resolved into components parallel and perpendicular to the surface. Newton's second law is applied along each axis."},
  goals:[{id:"Menggambar diagram benda bebas.",en:"Draw a free-body diagram."},{id:"Menguraikan berat dan menentukan gaya normal serta gesek.",en:"Resolve weight and determine normal and friction forces."},{id:"Menentukan kondisi diam atau meluncur.",en:"Determine whether the block remains at rest or slides."}],
  chapters:[
   {title:{id:"Diagram benda bebas",en:"Free-body diagrams"},idea:{id:"Diagram benda bebas menggambar semua gaya yang bekerja pada satu benda. Pada bidang miring, pilih sumbu sejajar bidang dan tegak lurus bidang agar persamaan lebih sederhana.",en:"A free-body diagram shows all forces acting on one body. On an incline, choose axes parallel and perpendicular to the surface to simplify the equations."},steps:[{id:"Gambarkan balok terpisah dari bidang.",en:"Draw the block isolated from the surface."},{id:"Gambarkan berat mg vertikal ke bawah dan gaya normal tegak lurus bidang.",en:"Draw weight mg vertically downward and the normal force perpendicular to the plane."},{id:"Tambahkan gaya gesek sejajar bidang, berlawanan dengan kecenderungan gerak relatif.",en:"Add friction parallel to the plane, opposing relative motion or its tendency."}],formula:"w=mg,\\quad w_{\\parallel}=mg\\sin\\theta,\\quad w_{\\perp}=mg\\cos\\theta",takeaway:{id:"Gaya normal tidak selalu sama dengan berat; pada bidang miring N=mg cos θ jika tidak ada percepatan tegak lurus bidang.",en:"The normal force is not always equal to weight; on an incline N=mg cos θ when there is no perpendicular acceleration."}},
   {title:{id:"Gaya normal dan gesekan",en:"Normal force and friction"},idea:{id:"Gaya normal menyesuaikan kontak permukaan. Gesekan statis mencegah gerak relatif sampai batas maksimum, sedangkan gesekan kinetis bekerja saat permukaan sudah meluncur.",en:"The normal force adjusts to maintain contact. Static friction prevents relative motion up to a maximum; kinetic friction acts once surfaces slide."},steps:[{id:"Untuk tidak ada percepatan tegak lurus bidang, N=mg cos θ.",en:"With no perpendicular acceleration, N=mg cos θ."},{id:"Gesekan statis memenuhi 0 ≤ fₛ ≤ μₛN.",en:"Static friction satisfies 0 ≤ fₛ ≤ μₛN."},{id:"Saat meluncur, besar gesekan kinetis fₖ=μₖN.",en:"During sliding, kinetic friction has magnitude fₖ=μₖN."}],formula:"0\\leq f_s\\leq\\mu_sN,\\quad f_k=\\mu_kN",takeaway:{id:"Gesekan statis bukan selalu μₛN; nilai itu hanya batas maksimumnya.",en:"Static friction is not always μₛN; that is only its maximum value."}},
   {title:{id:"Hukum II Newton pada bidang",en:"Newton's second law on the plane"},idea:{id:"Komponen gaya sepanjang bidang menentukan percepatan. Benda mulai meluncur dari diam jika komponen berat sepanjang bidang melampaui gesekan statis maksimum.",en:"The net force along the plane determines acceleration. A block starts sliding from rest when the downslope component of weight exceeds maximum static friction."},steps:[{id:"Tulis ΣF∥ = ma∥.",en:"Write ΣF∥ = ma∥."},{id:"Saat meluncur turun, mg sin θ − μₖmg cos θ = ma.",en:"When sliding downhill, mg sin θ − μₖmg cos θ = ma."},{id:"Sebelum meluncur, bandingkan tan θ dengan μₛ untuk kondisi ambang.",en:"Before sliding, compare tan θ with μₛ for the threshold condition."}],formula:"a=g(\\sin\\theta-\\mu_k\\cos\\theta),\\quad \\tan\\theta_c=\\mu_s",takeaway:{id:"Gunakan gesekan statis untuk memutuskan apakah benda mulai bergerak; gunakan gesekan kinetis setelah benda meluncur.",en:"Use static friction to determine whether motion starts; use kinetic friction once sliding occurs."}}
  ]
 },
 collision:{
  overview:{id:"Tumbukan adalah interaksi singkat ketika dua benda memberikan gaya besar satu sama lain. Jika impuls eksternal dapat diabaikan, momentum total sistem tetap.",en:"A collision is a brief interaction in which two bodies exert large forces on each other. If external impulse is negligible, total system momentum is conserved."},
  goals:[{id:"Menerapkan kekekalan momentum.",en:"Apply conservation of momentum."},{id:"Menghubungkan impuls dengan perubahan momentum.",en:"Relate impulse to momentum change."},{id:"Membedakan jenis tumbukan melalui koefisien restitusi.",en:"Classify collisions using the coefficient of restitution."}],
  chapters:[
   {title:{id:"Momentum dan sistem",en:"Momentum and the system"},idea:{id:"Momentum adalah hasil kali massa dan kecepatan. Kekekalan momentum berlaku untuk sistem terisolasi atau ketika impuls eksternal selama tumbukan dapat diabaikan.",en:"Momentum is mass multiplied by velocity. Momentum conservation applies to an isolated system or when external impulse during the collision is negligible."},steps:[{id:"Tentukan batas sistem dan arah positif.",en:"Define the system boundary and positive direction."},{id:"Hitung momentum sebelum tumbukan setiap benda.",en:"Calculate each object's momentum before impact."},{id:"Samakan momentum total sebelum dan sesudah tumbukan.",en:"Set total momentum before impact equal to total momentum after impact."}],formula:"m_1u_1+m_2u_2=m_1v_1+m_2v_2",takeaway:{id:"Kecepatan bertanda. Dua benda yang bergerak berlawanan arah harus memakai tanda yang konsisten.",en:"Velocity is signed. Objects moving in opposite directions must use consistent signs."}},
   {title:{id:"Impuls dan gaya rata-rata",en:"Impulse and average force"},idea:{id:"Impuls adalah perubahan momentum selama interaksi. Gaya rata-rata dapat besar meskipun waktu kontak singkat.",en:"Impulse is the change in momentum during an interaction. Average force can be large even when contact time is short."},steps:[{id:"Tentukan momentum awal dan akhir benda.",en:"Determine the object's initial and final momentum."},{id:"Hitung J = Δp = m(v−u).",en:"Calculate J = Δp = m(v−u)."},{"id":"Jika waktu kontak diketahui, gaya rata-rata adalah J/Δt.",en:"If contact time is known, average force is J/Δt."}],formula:"J=\\Delta p=m(v-u)=F_{avg}\\Delta t",takeaway:{id:"Impuls memiliki satuan N·s yang setara dengan kg·m/s.",en:"Impulse has units N·s, equivalent to kg·m/s."}},
   {title:{id:"Koefisien restitusi dan jenis tumbukan",en:"Coefficient of restitution and collision types"},idea:{id:"Koefisien restitusi membandingkan kelajuan relatif saat saling menjauh dengan saat saling mendekat pada satu garis tumbukan.",en:"The coefficient of restitution compares relative separation speed with relative approach speed along the line of impact."},steps:[{id:"Tuliskan kecepatan relatif sebelum dan sesudah tumbukan.",en:"Write relative velocities before and after impact."},{id:"Hitung e = (v₂−v₁)/(u₁−u₂) dengan arah yang konsisten.",en:"Calculate e = (v₂−v₁)/(u₁−u₂) using a consistent direction convention."},{id:"Interpretasikan: e=1 lenting sempurna, 0<e<1 lenting sebagian, e=0 tidak lenting sama sekali.",en:"Interpret: e=1 perfectly elastic, 0<e<1 partially elastic, e=0 perfectly inelastic."}],formula:"e=\\frac{v_2-v_1}{u_1-u_2},\\quad 0\\leq e\\leq1",takeaway:{id:"Momentum dapat tetap pada semua tumbukan dalam sistem terisolasi, tetapi energi kinetik hanya tetap pada tumbukan lenting sempurna.",en:"Momentum can remain conserved in all isolated collisions, but kinetic energy is conserved only in perfectly elastic collisions."}}
  ]
 },
 spring:{
  overview:{id:"Gerak harmonik sederhana muncul ketika gaya pemulih sebanding dengan simpangan dan arahnya menuju titik keseimbangan. Sistem massa–pegas ideal merupakan model utama.",en:"Simple harmonic motion occurs when a restoring force is proportional to displacement and directed toward equilibrium. The ideal mass–spring system is a central model."},
  goals:[{id:"Memahami hukum Hooke dan gaya pemulih.",en:"Understand Hooke's law and restoring force."},{id:"Menurunkan persamaan gerak harmonik.",en:"Derive the harmonic-motion equation."},{id:"Menghubungkan massa, konstanta pegas, periode, dan energi.",en:"Relate mass, spring constant, period and energy."}],
  chapters:[
   {title:{id:"Hukum Hooke",en:"Hooke's law"},idea:{id:"Pegas ideal memberikan gaya yang berlawanan arah dengan simpangan dari panjang alami. Semakin jauh ditarik atau ditekan, semakin besar gaya pemulihnya.",en:"An ideal spring exerts a force opposite to displacement from its natural length. The farther it is stretched or compressed, the stronger the restoring force."},steps:[{id:"Tentukan titik keseimbangan x=0.",en:"Define the equilibrium position x=0."},{id:"Ukur simpangan x dari titik tersebut.",en:"Measure displacement x from equilibrium."},{id:"Gunakan F = −kx. Tanda minus menyatakan arah kembali ke keseimbangan.",en:"Use F = −kx. The minus sign indicates a force directed back toward equilibrium."}],formula:"F=-kx",takeaway:{id:"Gaya pegas bukan selalu ke kiri atau ke kanan; arahnya selalu melawan simpangan.",en:"Spring force is not always left or right; it always opposes the displacement."}},
   {title:{id:"Menurunkan persamaan GHS",en:"Deriving the SHM equation"},idea:{id:"Gabungkan hukum Hooke dengan Hukum II Newton. Persamaan diferensial yang dihasilkan memiliki solusi sinusoidal.",en:"Combine Hooke's law with Newton's second law. The resulting differential equation has sinusoidal solutions."},steps:[{id:"Mulai dari ΣF=ma dan F=−kx.",en:"Start from ΣF=ma and F=−kx."},{id:"Diperoleh m x¨ = −kx atau x¨ + (k/m)x = 0.",en:"Obtain m x¨ = −kx or x¨ + (k/m)x = 0."},{id:"Definisikan ω=√(k/m); solusi x=A cos(ωt+φ).",en:"Define ω=√(k/m); the solution is x=A cos(ωt+φ)."}],formula:"\\ddot x+\\frac{k}{m}x=0,\\quad x(t)=A\\cos(\\omega t+\\phi),\\quad\\omega=\\sqrt{\\frac{k}{m}}",takeaway:{id:"Frekuensi sudut alami ditentukan oleh rasio k/m, bukan oleh amplitudo pada model ideal.",en:"Natural angular frequency depends on k/m, not amplitude in the ideal model."}},
   {title:{id:"Periode dan energi osilasi",en:"Oscillation period and energy"},idea:{id:"Pada pegas ideal, energi terus bertukar antara energi potensial elastis dan energi kinetik. Jumlah keduanya konstan.",en:"In an ideal spring, energy continually exchanges between elastic potential and kinetic energy. Their sum is constant."},steps:[{id:"Di simpangan maksimum, kecepatan sesaat nol dan energi potensial maksimum.",en:"At maximum displacement, instantaneous speed is zero and potential energy is maximum."},{id:"Di titik keseimbangan, kelajuan maksimum dan energi kinetik maksimum.",en:"At equilibrium, speed and kinetic energy are maximum."},{id:"Gunakan T=2π√(m/k) dan f=1/T.",en:"Use T=2π√(m/k) and f=1/T."}],formula:"E=\\frac12mv^2+\\frac12kx^2=\\text{konstan},\\quad T=2\\pi\\sqrt{\\frac{m}{k}}",takeaway:{id:"Massa lebih besar memperpanjang periode; pegas lebih kaku memperpendek periode.",en:"A larger mass increases the period; a stiffer spring decreases it."}}
  ]
 }
};
function lessonText(value:LocalizedText,language:Language){return language==="ID"?value.id:value.en;}
type LessonExperimentControl={label:LocalizedText;min:number;max:number;step:number;initial:number;unit:string};
function lessonExperimentControl(id:LabId):LessonExperimentControl{
 const map:Record<LabId,LessonExperimentControl>={
  projectile:{label:{id:"Sudut peluncuran",en:"Launch angle"},min:15,max:75,step:1,initial:45,unit:"°"},
  mru:{label:{id:"Kecepatan",en:"Velocity"},min:1,max:20,step:.5,initial:6,unit:"m/s"},
  mrua:{label:{id:"Percepatan",en:"Acceleration"},min:-2,max:4,step:.1,initial:1.5,unit:"m/s²"},
  circular:{label:{id:"Jari-jari",en:"Radius"},min:1,max:6,step:.1,initial:3,unit:"m"},
  energy:{label:{id:"Ketinggian awal",en:"Initial height"},min:1,max:12,step:.5,initial:8,unit:"m"},
  incline:{label:{id:"Sudut bidang",en:"Incline angle"},min:0,max:60,step:1,initial:30,unit:"°"},
  collision:{label:{id:"Koefisien restitusi",en:"Coefficient of restitution"},min:0,max:1,step:.05,initial:1,unit:""},
  spring:{label:{id:"Massa",en:"Mass"},min:.5,max:5,step:.1,initial:1,unit:"kg"}
 };
 return map[id];
}
function calculateLessonExperiment(id:LabId,value:number,language:Language){
 const n=(x:number)=>Number.isFinite(x)?Number(x.toFixed(3)).toString():"—";
 const g=9.81;
 switch(id){
  case "projectile":{
   const v0=20,rad=value*Math.PI/180,vx=v0*Math.cos(rad),vy=v0*Math.sin(rad),tf=2*vy/g,range=vx*tf,height=vy*vy/(2*g);
   return {result:language==="ID"?"Jangkauan horizontal":"Horizontal range",value:range,unit:"m",
    formula:"R=v_{0x}t_f=(v_0\\cos\\theta)\\left(\\frac{2v_0\\sin\\theta}{g}\\right)="+n(range)+"\\,\\mathrm{m}",
    steps:[
     "v_{0x}=v_0\\cos\\theta=(20\\,\\mathrm{m/s})\\cos("+n(value)+"^\\circ)="+n(vx)+"\\,\\mathrm{m/s}",
     "v_{0y}=v_0\\sin\\theta=(20\\,\\mathrm{m/s})\\sin("+n(value)+"^\\circ)="+n(vy)+"\\,\\mathrm{m/s}",
     "t_f=\\frac{2v_{0y}}{g}=\\frac{2("+n(vy)+"\\,\\mathrm{m/s})}{9.81\\,\\mathrm{m/s^2}}="+n(tf)+"\\,\\mathrm{s}",
     "R=v_{0x}t_f=("+n(vx)+"\\,\\mathrm{m/s})("+n(tf)+"\\,\\mathrm{s})="+n(range)+"\\,\\mathrm{m}"
    ],
    extra:language==="ID"?"Asumsi: titik luncur dan titik mendarat setinggi sama, tanpa hambatan udara. Tinggi maksimum "+n(height)+" m.":"Assumption: launch and landing heights are equal, with no air resistance. Maximum rise: "+n(height)+" m."};
  }
  case "mru":{
   const t=5,distance=value*t;
   return {result:language==="ID"?"Perpindahan dalam 5 s":"Displacement after 5 s",value:distance,unit:"m",
    formula:"\\Delta x=vt=("+n(value)+"\\,\\mathrm{m/s})(5\\,\\mathrm{s})="+n(distance)+"\\,\\mathrm{m}",
    steps:[
     "v=("+n(value)+"\\,\\mathrm{m/s})\\quad\\text{(konstan)}",
     "\\Delta x=vt=("+n(value)+"\\,\\mathrm{m/s})(5\\,\\mathrm{s})",
     "\\Delta x="+n(distance)+"\\,\\mathrm{m}"
    ],
    extra:language==="ID"?"Dalam GLB, percepatan nol dan posisi berubah linear terhadap waktu.":"In uniform motion, acceleration is zero and position changes linearly with time."};
  }
  case "mrua":{
   const v0=3,t=4,deltaX=v0*t+.5*value*t*t,v=v0+value*t;
   return {result:language==="ID"?"Perpindahan dalam 4 s":"Displacement after 4 s",value:deltaX,unit:"m",
    formula:"\\Delta x=v_0t+\\frac12at^2=(3)(4)+\\frac12("+n(value)+")(4)^2="+n(deltaX)+"\\,\\mathrm{m}",
    steps:[
     "v(t)=v_0+at=3+("+n(value)+")(4)="+n(v)+"\\,\\mathrm{m/s}",
     "\\Delta x=v_0t+\\frac12at^2=(3\\,\\mathrm{m/s})(4\\,\\mathrm{s})+\\frac12("+n(value)+"\\,\\mathrm{m/s^2})(4\\,\\mathrm{s})^2",
     "\\Delta x="+n(deltaX)+"\\,\\mathrm{m}"
    ],
    extra:(language==="ID"?"Kecepatan akhir: ":"Final velocity: ")+n(v)+" m/s. Percepatan konstan."};
  }
  case "circular":{
   const omega=2,r=value,v=omega*r,a=omega*omega*r,T=2*Math.PI/omega;
   return {result:language==="ID"?"Kelajuan tangensial":"Tangential speed",value:v,unit:"m/s",
    formula:"v=\\omega r=(2\\,\\mathrm{rad/s})("+n(r)+"\\,\\mathrm{m})="+n(v)+"\\,\\mathrm{m/s}",
    steps:[
     "\\omega=2\\,\\mathrm{rad/s}\\quad\\text{(tetap)}",
     "v=\\omega r=(2\\,\\mathrm{rad/s})("+n(r)+"\\,\\mathrm{m})="+n(v)+"\\,\\mathrm{m/s}",
     "a_c=\\omega^2r=(2\\,\\mathrm{rad/s})^2("+n(r)+"\\,\\mathrm{m})="+n(a)+"\\,\\mathrm{m/s^2}"
    ],
    extra:(language==="ID"?"Periode: ":"Period: ")+n(T)+" s. Nilai ω dijaga tetap agar pengaruh radius mudah dibandingkan."};
  }
  case "energy":{
   const m=2,h=value,ep=m*g*h;
   return {result:language==="ID"?"Energi potensial gravitasi":"Gravitational potential energy",value:ep,unit:"J",
    formula:"E_p=mgh=(2\\,\\mathrm{kg})(9.81\\,\\mathrm{m/s^2})("+n(h)+"\\,\\mathrm{m})="+n(ep)+"\\,\\mathrm{J}",
    steps:[
     "m=2\\,\\mathrm{kg},\\quad g=9.81\\,\\mathrm{m/s^2},\\quad h="+n(h)+"\\,\\mathrm{m}",
     "E_p=mgh=(2)(9.81)("+n(h)+")",
     "E_p="+n(ep)+"\\,\\mathrm{J}"
    ],
    extra:language==="ID"?"Acuan energi potensial dipilih di tanah (h = 0). Massa dan gravitasi tetap.":"The ground is chosen as the zero-potential reference (h = 0). Mass and gravity are held constant."};
  }
  case "incline":{
   const theta=value*Math.PI/180,muK=.2,muS=.4,m=5,normal=m*g*Math.cos(theta),holds=Math.tan(theta)<=muS;
   const a=holds?0:g*(Math.sin(theta)-muK*Math.cos(theta));
   const friction=holds?m*g*Math.sin(theta):muK*normal;
   const formula=holds?"a=0\\quad\\left(\\tan\\theta\\leq\\mu_s\\right)":"a=g(\\sin\\theta-\\mu_k\\cos\\theta)=9.81[\\sin("+n(value)+"^\\circ)-0.20\\cos("+n(value)+"^\\circ)]="+n(a)+"\\,\\mathrm{m/s^2}";
   const steps=holds?[
    "\\theta="+n(value)+"^\\circ,\\quad\\mu_s=0.40",
    "\\tan\\theta=\\tan("+n(value)+"^\\circ)="+n(Math.tan(theta))+"\\leq0.40",
    "f_s=mg\\sin\\theta=(5)(9.81)\\sin("+n(value)+"^\\circ)="+n(friction)+"\\,\\mathrm{N}",
    "a=0\\,\\mathrm{m/s^2}\\quad\\text{(balok tetap diam)}"
   ]:[
    "\\theta="+n(value)+"^\\circ,\\quad\\mu_k=0.20",
    "N=mg\\cos\\theta=(5\\,\\mathrm{kg})(9.81\\,\\mathrm{m/s^2})\\cos("+n(value)+"^\\circ)="+n(normal)+"\\,\\mathrm{N}",
    "f_k=\\mu_kN=(0.20)("+n(normal)+"\\,\\mathrm{N})="+n(friction)+"\\,\\mathrm{N}",
    "a=g(\\sin\\theta-\\mu_k\\cos\\theta)=9.81[\\sin("+n(value)+"^\\circ)-0.20\\cos("+n(value)+"^\\circ)]="+n(a)+"\\,\\mathrm{m/s^2}"
   ];
   return {result:language==="ID"?"Percepatan sepanjang bidang":"Acceleration along the plane",value:a,unit:"m/s²",formula,steps,
    extra:language==="ID"?"Massa balok 5 kg. μₛ = 0,40 dan μₖ = 0,20. Gesekan statis menyesuaikan hingga nilai maksimum; jangan gunakan μₛN sebagai nilai gesekan pada semua keadaan.":"Block mass is 5 kg. μₛ = 0.40 and μₖ = 0.20. Static friction adjusts up to its maximum; μₛN is not the friction value in every situation."};
  }
  case "collision":{
   const e=value,m1=2,m2=2,u1=6,u2=0;
   const v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2),v2=((1+e)*m1*u1+(m2-e*m1)*u2)/(m1+m2);
   const pBefore=m1*u1+m2*u2,pAfter=m1*v1+m2*v2;
   return {result:language==="ID"?"Kecepatan akhir benda 1":"Final velocity of body 1",value:v1,unit:"m/s",
    formula:"v_1=\\frac{(m_1-em_2)u_1+(1+e)m_2u_2}{m_1+m_2}="+n(v1)+"\\,\\mathrm{m/s}",
    steps:[
     "p_{awal}=m_1u_1+m_2u_2=(2)(6)+(2)(0)="+n(pBefore)+"\\,\\mathrm{kg\\,m/s}",
     "v_1=\\frac{(m_1-em_2)u_1+(1+e)m_2u_2}{m_1+m_2}="+n(v1)+"\\,\\mathrm{m/s}",
     "v_2=\\frac{(1+e)m_1u_1+(m_2-em_1)u_2}{m_1+m_2}="+n(v2)+"\\,\\mathrm{m/s}",
     "p_{akhir}=m_1v_1+m_2v_2=(2)("+n(v1)+")+(2)("+n(v2)+")="+n(pAfter)+"\\,\\mathrm{kg\\,m/s}"
    ],
    extra:language==="ID"?"Sistem dua benda dianggap terisolasi selama tumbukan. Momentum tetap; energi kinetik hanya tetap jika e = 1.":"The two-body system is treated as isolated during impact. Momentum is conserved; kinetic energy is conserved only when e = 1."};
  }
  case "spring":{
   const m=value,k=25,omega=Math.sqrt(k/m),T=2*Math.PI/omega,frequency=1/T;
   return {result:language==="ID"?"Periode osilasi":"Oscillation period",value:T,unit:"s",
    formula:"T=2\\pi\\sqrt{\\frac{m}{k}}=2\\pi\\sqrt{\\frac{"+n(m)+"\\,\\mathrm{kg}}{25\\,\\mathrm{N/m}}}="+n(T)+"\\,\\mathrm{s}",
    steps:[
     "\\omega=\\sqrt{\\frac{k}{m}}=\\sqrt{\\frac{25\\,\\mathrm{N/m}}{"+n(m)+"\\,\\mathrm{kg}}}="+n(omega)+"\\,\\mathrm{rad/s}",
     "T=2\\pi\\sqrt{\\frac{m}{k}}=2\\pi\\sqrt{\\frac{"+n(m)+"}{25}}",
     "T="+n(T)+"\\,\\mathrm{s},\\quad f=\\frac1T="+n(frequency)+"\\,\\mathrm{Hz}"
    ],
    extra:language==="ID"?"Model ideal tanpa redaman. Konstanta pegas k = 25 N/m dijaga tetap.":"Ideal undamped model. The spring constant k = 25 N/m is held constant."};
  }
 }
}
function LessonDiagram({id,value,stage,language}:{id:LabId;value:number;stage:number;language:Language}){
 const en=language==="EN";
 const text=en?{initial:"Initial",apex:"Apex",range:"Range",position:"Position",velocity:"Velocity",acceleration:"Acceleration",normal:"Normal",weight:"Weight",friction:"Friction",static:"Static",kinetic:"Kinetic",potential:"Potential",energy:"Energy",before:"Before",after:"After",contact:"Contact",restoring:"Restoring force"}:{initial:"Awal",apex:"Puncak",range:"Jangkauan",position:"Posisi",velocity:"Kecepatan",acceleration:"Percepatan",normal:"Normal",weight:"Berat",friction:"Gesek",static:"Statis",kinetic:"Kinetik",potential:"Potensial",energy:"Energi",before:"Sebelum",after:"Sesudah",contact:"Kontak",restoring:"Gaya pemulih"};
 if(id==="projectile"){
  const theta=value*Math.PI/180,v0=20,g=9.81,range=v0*v0*Math.sin(2*theta)/g,hmax=v0*v0*Math.sin(theta)**2/(2*g);
  const px=(tau:number)=>35+310*tau;
  const py=(tau:number)=>150-105*(Math.max(0,v0*Math.sin(theta)*(2*v0*Math.sin(theta)/g*tau)-.5*g*(2*v0*Math.sin(theta)/g*tau)**2)/Math.max(hmax,.01));
  const points=Array.from({length:61},(_,i)=>{const t=i/60;return px(t)+","+py(t);}).join(" ");
  const apexX=px(.5),apexY=py(.5);
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Projectile motion with a parabolic trajectory":"Gerak parabola dengan lintasan kuadratik"}>
   <path d="M22 151 H360" className="diagram-ground"/>
   <polyline points={points} className="diagram-trajectory"/>
   <circle cx="35" cy="150" r="6" className="diagram-object"/>
   <path d="M35 150 L84 150 M35 150 L35 105" className="diagram-vector"/>
   {stage===0&&<><path d="M35 150 L77 126" className="diagram-vector-alt"/><path d="M77 126 V150" className="diagram-guide"/><text x="82" y="147">v₀ₓ = v₀ cos θ</text><text x="42" y="105">v₀ᵧ</text><text x="42" y="91">v₀ sin θ</text></>}
   {stage===1&&<><path d={"M"+apexX+" "+apexY+" V151"} className="diagram-guide"/><path d={"M"+(apexX-19)+" "+apexY+" H"+(apexX+19)} className="diagram-vector-alt"/><text x={apexX+8} y={Math.max(18,apexY-8)}>{text.apex}: vᵧ = 0</text></>}
   {stage===2&&<><path d={"M"+apexX+" "+apexY+" V151 M35 163 H345"} className="diagram-guide"/><text x={apexX+8} y={Math.max(18,apexY-8)}>Hₘₐₓ = {hmax.toFixed(1)} m</text><text x="164" y="179">R = {range.toFixed(1)} m</text><text x="26" y="139">θ = {value}°</text></>}
   <text x="22" y="18">{stage===0?"v₀ → (v₀ₓ, v₀ᵧ)":stage===1?"vᵧ(t)=v₀ sin θ − gt":"x(t), y(t) → R, Hₘₐₓ"}</text>
  </svg>;
 }
 if(id==="mru"||id==="mrua"){
  const v0= id==="mru"?value:3,a=id==="mru"?0:value,t=id==="mru"?5:4,x=v0*t+.5*a*t*t,v=v0+a*t;
  const px=Math.max(48,Math.min(328,45+x*4));
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Linear motion experiment":"Eksperimen gerak lurus"}>
   <path d="M28 124 H350" className="diagram-ground"/>{Array.from({length:11},(_,i)=><path key={i} d={"M"+(35+i*30)+" 119 v10"} className="diagram-tick"/>)}
   <rect x={px-18} y="88" width="36" height="30" rx="5" className="diagram-block"/>
   {stage===0&&<><path d={"M52 74 H"+px} className="diagram-vector"/><text x="35" y="52">{id==="mru"?"v = "+v0+" m/s":"a = "+a+" m/s²"}</text><text x="35" y="164">x(0) = 0</text></>}
   {stage===1&&<><path d="M45 170 H165 V130" className="diagram-guide"/><path d={id==="mru"?"M49 165 L160 132":"M49 165 Q105 157 160 132"} className="diagram-trajectory"/><text x="182" y="137">x(t)</text><text x="182" y="153">{x.toFixed(1)} m at t = {t} s</text></>}
   {stage===2&&<><path d="M45 170 H165 V130" className="diagram-guide"/><path d={"M49 165 L160 "+(stage===2?132:150)} className="diagram-vector-alt"/><text x="180" y="137">v({t} s) = {v.toFixed(1)} m/s</text><text x="180" y="155">a = {a.toFixed(1)} m/s²</text></>}
   <text x="27" y="19">{id==="mru"?(en?"Constant velocity":"Kecepatan konstan"):(en?"Constant acceleration":"Percepatan konstan")}</text>
  </svg>;
 }
 if(id==="circular"){
  const r=24+value*5.2,cx=190,cy=100,angle=.62+stage*.5,px=cx+Math.cos(angle)*r,py=cy+Math.sin(angle)*r;
  const tx=-Math.sin(angle),ty=Math.cos(angle),omega=2,v=omega*value,ac=omega*omega*value;
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Uniform circular motion with tangential and radial vectors":"Gerak melingkar dengan vektor tangensial dan radial"}>
   <circle cx={cx} cy={cy} r={r} className="diagram-orbit"/>
   <circle cx={cx} cy={cy} r="4" className="diagram-centre"/>
   <path d={"M"+cx+" "+cy+" L"+px+" "+py} className="diagram-guide"/>
   <circle cx={px} cy={py} r="9" className="diagram-object"/>
   {stage===0&&<><text x={cx+10} y={cy-12}>r = {value.toFixed(1)} m</text><text x="24" y="22">θ(t) = ωt</text></>}
   {stage===1&&<><path d={"M"+px+" "+py+" l"+(tx*38)+" "+(ty*38)} className="diagram-vector"/><text x="24" y="22">v = ωr = {v.toFixed(1)} m/s</text></>}
   {stage===2&&<><path d={"M"+px+" "+py+" l"+(-Math.cos(angle)*38)+" "+(-Math.sin(angle)*38)} className="diagram-vector-alt"/><text x="24" y="22">a꜀ = ω²r = {ac.toFixed(1)} m/s²</text></>}
   <text x="204" y="178">ω = 2 rad/s</text>
  </svg>;
 }
 if(id==="energy"){
  const h=value,fraction=stage===0?0:stage===1?.4:.75,heightNow=h*(1-fraction),m=2,g=9.81,total=m*g*h,ep=m*g*heightNow,ek=total-ep;
  const y=140-heightNow/h*94;
  const potentialHeight=ep/total*80,kineticHeight=ek/total*80;
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Gravitational energy conversion experiment":"Eksperimen perubahan energi gravitasi"}>
   <path d="M30 151 H205 M54 151 V42" className="diagram-ground"/>
   <path d="M54 42 V151" className="diagram-guide"/>
   <rect x="43" y={y-10} width="22" height="20" rx="4" className="diagram-block"/>
   <path d={"M76 "+y+" V151"} className="diagram-vector-alt"/>
   <text x="84" y={y+5}>h = {heightNow.toFixed(1)} m</text>
   <text x="30" y="24">m = 2 kg · h₀ = {h.toFixed(1)} m</text>
   <text x="234" y="27">{text.energy} (J)</text>
   <rect x="245" y={145-potentialHeight} width="35" height={potentialHeight} rx="3" className="diagram-object"/>
   <rect x="300" y={145-kineticHeight} width="35" height={kineticHeight} rx="3" className="diagram-block"/>
   <text x="245" y="160">Eₚ</text><text x="300" y="160">Eₖ</text>
   <text x="232" y="179">Eₘ = {total.toFixed(1)} J</text>
   <text x="24" y="178">{stage===0?text.initial:stage===1?text.position:text.energy+" "+(en?"conversion":"berubah bentuk")}</text>
  </svg>;
 }
 if(id==="incline"){
  const theta=value*Math.PI/180,m=5,g=9.81,muS=.4,muK=.2,holds=Math.tan(theta)<=muS;
  const a=holds?0:g*(Math.sin(theta)-muK*Math.cos(theta));
  const startX=70,startY=151,L=150,endX=startX+L*Math.cos(theta),endY=startY-L*Math.sin(theta);
  const cx=(startX+endX)/2,cy=(startY+endY)/2-15;
  const downX=-Math.cos(theta),downY=Math.sin(theta),upX=Math.cos(theta),upY=-Math.sin(theta);
  const normalInX=-Math.sin(theta),normalInY=-Math.cos(theta);
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Free-body diagram on an inclined plane":"Diagram gaya bebas pada bidang miring"}>
   <path d={"M"+startX+" "+startY+" L"+endX+" "+endY+" L"+endX+" "+startY+" Z"} className="diagram-plane"/>
   <path d={"M"+startX+" "+startY+" L"+endX+" "+endY} className="diagram-edge"/>
   <g transform={"translate("+cx+" "+cy+") rotate("+(-value)+")"}><rect x="-18" y="-17" width="36" height="34" rx="4" className="diagram-block"/></g>
   {stage===0&&<>
    <path d={"M"+cx+" "+cy+" v48"} className="diagram-vector"/><text x={cx+7} y={cy+44}>mg</text>
    <path d={"M"+cx+" "+cy+" l"+(normalInX*43)+" "+(normalInY*43)} className="diagram-vector-alt"/><text x="20" y="57">N</text>
    <path d={"M"+cx+" "+cy+" l"+(upX*42)+" "+(upY*42)} className="diagram-guide"/><text x="235" y="75">{holds?text.static:text.kinetic} friction</text>
   </>}
   {stage===1&&<>
    <path d={"M"+cx+" "+cy+" l"+(downX*49)+" "+(downY*49)} className="diagram-vector"/>
    <path d={"M"+cx+" "+cy+" l"+(normalInX*42)+" "+(normalInY*42)} className="diagram-vector-alt"/>
    <text x="26" y="76">mg sin θ</text><text x="26" y="94">mg cos θ</text>
   </>}
   {stage===2&&<>
    <path d={"M"+cx+" "+cy+" l"+(upX*43)+" "+(upY*43)} className="diagram-vector"/>
    <text x="235" y="65">{holds?text.static:text.kinetic} friction</text>
    <text x="235" y="84">a = {a.toFixed(2)} m/s²</text>
    <text x="235" y="102">μₛ = 0.40</text><text x="235" y="120">μₖ = 0.20</text>
   </>}
   <text x="28" y="22">θ = {value}° · m = {m} kg</text>
   <text x="28" y="178">{holds?(en?"No sliding":"Tidak meluncur"):(en?"Sliding downhill":"Meluncur turun bidang")}</text>
  </svg>;
 }
 if(id==="collision"){
   const e=value,m1=2,m2=2,u1=6,u2=0,v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2),v2=((1+e)*m1*u1+(m2-e*m1)*u2)/(m1+m2);
  const x1=stage===0?100:stage===1?165:stage===2?100:100;
  const x2=stage===0?280:stage===1?205:stage===2?285:285;
  const speed1=stage===2?Math.abs(v1)*12:stage===0?u1*10:0;
  const speed2=stage===2?Math.abs(v2)*12:0;
  return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"One-dimensional collision stages":"Tahapan tumbukan satu dimensi"}>
   <path d="M25 128 H355" className="diagram-ground"/>
   <circle cx={x1} cy="105" r="18" className="diagram-object"/>
   <rect x={x2-18} y="87" width="36" height="36" rx="6" className="diagram-block"/>
   {stage===0&&<><path d={"M"+(x1+22)+" 105 h"+speed1} className="diagram-vector"/><text x="34" y="35">{text.before}: u₁ = 6 m/s · u₂ = 0</text></>}
   {stage===1&&<><path d="M185 72 V133" className="diagram-guide"/><text x="146" y="35">{text.contact}</text><text x="34" y="166">e = {e.toFixed(2)}</text></>}
   {stage===2&&<><path d={"M"+(x1+22)+" 105 h"+speed1} className="diagram-vector"/><path d={"M"+(x2+22)+" 105 h"+speed2} className="diagram-vector-alt"/><text x="34" y="35">{text.after}: v₁ = {v1.toFixed(2)} m/s</text><text x="34" y="166">v₂ = {v2.toFixed(2)} m/s · e = {e.toFixed(2)}</text></>}
  </svg>;
 }
 const m=value,k=25,omega=Math.sqrt(k/m),T=2*Math.PI/omega,A=1.5,phase=stage*Math.PI/2,x=A*Math.cos(phase),force=-k*x,blockX=210+x*32,ep=.5*k*x*x,ek=.5*k*(A*A-x*x);
 const springPath=Array.from({length:13},(_,i)=>{const t=i/12,xx=55+(blockX-18-55)*t,yy=95+(i===0||i===12?0:(i%2===0?-1:1)*8);return (i===0?"M":"L")+xx+" "+yy;}).join(" ");
 return <svg className="lesson-diagram" viewBox="0 0 380 190" role="img" aria-label={en?"Mass spring oscillator at different phases":"Osilator massa pegas pada beberapa fase"}>
  <path d="M38 48 V143 M38 95 H55" className="diagram-wall"/>
  <path d={springPath} className="diagram-spring"/>
  <rect x={blockX-18} y="78" width="36" height="34" rx="5" className="diagram-block"/>
  <path d={"M"+blockX+" 61 v-15"} className="diagram-vector"/>
  <text x="24" y="22">m = {m.toFixed(1)} kg · k = 25 N/m</text>
  <text x="258" y="67">T = {T.toFixed(2)} s</text>
  <text x="258" y="84">x = {x.toFixed(2)} m</text>
  <text x="24" y="163">F = −kx = {force.toFixed(1)} N</text>
  <text x="24" y="181">Eₚ = {ep.toFixed(1)} J · Eₖ = {ek.toFixed(1)} J</text>
 </svg>;
}
function Learn({language}:{language:Language}) {
 const [learnFocus,setLearnFocus]=useState(false);
 useEffect(()=>{if(!learnFocus)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setLearnFocus(false);};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[learnFocus]);
 const [selectedTopic,setSelectedTopic]=useState<LabId>("projectile");
 const [selectedChapter,setSelectedChapter]=useState(0);const [activeLessonStep,setActiveLessonStep]=useState(0);
 const control=lessonExperimentControl(selectedTopic);
 const [experimentValue,setExperimentValue]=useState(control.initial);
 const lesson=lessonModules[selectedTopic],chapter=lesson.chapters[selectedChapter],experiment=calculateLessonExperiment(selectedTopic,experimentValue,language);
 const en=language==="EN";
 const chooseTopic=(id:LabId)=>{setSelectedTopic(id);setSelectedChapter(0);setActiveLessonStep(0);setExperimentValue(lessonExperimentControl(id).initial);};
 return <main className={learnFocus?"secondary-page lesson-page is-focused":"secondary-page lesson-page"}>
  <div className="secondary-intro"><span className="eyebrow">PHYSIMUS ACADEMY / LEARNING PATH</span><div className="lesson-intro-actions"><div><h1>{en?"Physics learning modules":"Modul belajar Fisika"}</h1><p>{en?"A structured high-school physics course: understand the phenomenon, derive the model, experiment, then practise.":"Materi Fisika SMA yang tersusun: pahami fenomena, turunkan model, bereksperimen, lalu berlatih."}</p></div><button className="secondary-button" type="button" onClick={()=>setLearnFocus(v=>!v)}>{learnFocus?<Minimize2 size={16}/>:<Maximize2 size={16}/>}{learnFocus?(en?"Exit focus":"Keluar fokus"):(en?"Focus view":"Mode fokus")}</button></div></div>
  <div className="lesson-layout">
   <aside className="lesson-topic-nav"><div className="lesson-nav-heading">{en?"COURSE CONTENT":"DAFTAR MATERI"}</div>{labs.map((item,index)=><button key={item.id} className={selectedTopic===item.id?"active":""} onClick={()=>chooseTopic(item.id)}><span>{String(index+1).padStart(2,"0")}</span><strong>{en?item.subtitle:item.title}</strong></button>)}</aside>
   <article className="lesson-content">
    <div className="lesson-topic-heading"><span className="eyebrow">{en?labs.find(x=>x.id===selectedTopic)?.category:"MATERI SMA · "+labs.find(x=>x.id===selectedTopic)?.category}</span><h2>{en?labs.find(x=>x.id===selectedTopic)?.subtitle:labs.find(x=>x.id===selectedTopic)?.title}</h2><p>{lessonText(lesson.overview,language)}</p></div>
    <div className="lesson-goals"><strong>{en?"Learning objectives":"Tujuan pembelajaran"}</strong><ul>{lesson.goals.map((goal,i)=><li key={i}>{lessonText(goal,language)}</li>)}</ul></div>
    <div className="lesson-chapter-tabs" role="tablist">{lesson.chapters.map((item,i)=><button key={i} role="tab" aria-selected={selectedChapter===i} className={selectedChapter===i?"active":""} onClick={()=>{setSelectedChapter(i);setActiveLessonStep(0);}}><span>{String(i+1).padStart(2,"0")}</span>{lessonText(item.title,language)}</button>)}</div>
    <section className="lesson-chapter-card">
     <div className="lesson-chapter-title"><span>{en?"SUBCHAPTER":"SUBBAB"} {selectedChapter+1} / {lesson.chapters.length}</span><h3>{lessonText(chapter.title,language)}</h3></div>
     <p className="lesson-intro-text">{lessonText(chapter.idea,language)}</p>
     <LessonDiagram id={selectedTopic} value={experimentValue} stage={activeLessonStep} language={language}/>
     <div className="lesson-steps"><strong>{en?"Step-by-step explanation":"Penjelasan langkah demi langkah"}</strong><p className="lesson-step-hint">{en?"Select a step to focus the experiment diagram on that part of the explanation.":"Pilih langkah untuk mengarahkan visual eksperimen ke bagian penjelasan tersebut."}</p>{chapter.steps.map((step,i)=><button type="button" className={activeLessonStep===i?"lesson-step active":"lesson-step"} key={i} onClick={()=>setActiveLessonStep(i)} aria-pressed={activeLessonStep===i} title={en?"Show experiment state for step "+(i+1):"Tampilkan eksperimen untuk langkah "+(i+1)}><span>{i+1}</span><p>{lessonText(step,language)}</p><small>{activeLessonStep===i?(en?"Visual active":"Visual aktif"):(en?"View experiment":"Lihat eksperimen")}</small></button>)}</div>
     <div className="lesson-formula-block"><span>{en?"MATHEMATICAL MODEL":"MODEL MATEMATIKA"}</span><Equation value={chapter.formula} display/></div>
     <div className="lesson-takeaway"><strong>{en?"Key idea":"Inti pemahaman"}</strong><p>{lessonText(chapter.takeaway,language)}</p></div>
    </section>
    <div className="lesson-chapter-nav"><button className="secondary-button" disabled={selectedChapter===0} onClick={()=>{setSelectedChapter(v=>Math.max(0,v-1));setActiveLessonStep(0);}}><ArrowLeft size={15}/>{en?"Previous subchapter":"Subbab sebelumnya"}</button><button className="primary-button" disabled={selectedChapter===lesson.chapters.length-1} onClick={()=>{setSelectedChapter(v=>Math.min(lesson.chapters.length-1,v+1));setActiveLessonStep(0);}}>{en?"Next subchapter":"Subbab berikutnya"}<ArrowRight size={15}/></button></div>
    <div className="lesson-practice-intro"><span className="eyebrow">{en?"CHECK YOUR UNDERSTANDING":"UJI PEMAHAMAN"}</span><h3>{en?"Practice this topic":"Latihan soal materi ini"}</h3><p>{en?"A separate practice set is provided for this lesson. Generate a new question and reveal the worked solution when ready.":"Latihan ini berdiri sendiri untuk materi yang sedang dipelajari. Buat soal baru dan buka pembahasan langkah demi langkah."}</p></div>
    <PracticePanel labId={selectedTopic} language={language} variant="lesson"/>
   </article>
   <aside className="lesson-experiment">
    <div className="lesson-experiment-head"><span className="eyebrow">{en?"INTERACTIVE EXPERIMENT":"EKSPERIMEN INTERAKTIF"}</span><h3>{en?"Change one parameter":"Ubah satu parameter"}</h3><p>{en?"Move the slider and observe how the measured result changes.":"Geser parameter dan amati perubahan hasil pengukuran."}</p></div>
    <LessonDiagram id={selectedTopic} value={experimentValue} stage={activeLessonStep} language={language}/>
    <label className="lesson-experiment-slider"><span>{lessonText(control.label,language)} <strong>{experimentValue.toFixed(control.step<1?1:0)} {control.unit}</strong></span><input type="range" min={control.min} max={control.max} step={control.step} value={experimentValue} onChange={e=>setExperimentValue(Number(e.target.value))}/><small>{control.min} {control.unit}<span>{control.max} {control.unit}</span></small></label>
     <div className="lesson-result"><span>{experiment.result}</span><strong>{experiment.value.toFixed(2)} {experiment.unit}</strong><div className="lesson-result-formula"><Equation value={experiment.formula} display/></div><div className="lesson-experiment-steps"><strong>{en?"Calculation steps":"Langkah perhitungan"}</strong>{experiment.steps.map((step,index)=><div className="lesson-experiment-step" key={index}><span>{index+1}</span><div><Equation value={step} display/></div></div>)}</div><p>{experiment.extra}</p></div>
    <p className="lesson-assumption">{en?"Illustrative model: idealised conditions are stated in the lesson. Air resistance is omitted unless specified.":"Model ilustratif: asumsi ideal dijelaskan dalam materi. Hambatan udara diabaikan kecuali dinyatakan lain."}</p>
   </aside>
  </div>
 </main>;
}

export default function App() {
  const [page,setPage]=useState<Page>("discover");
  const [language,setLanguage]=useState<Language>("ID");
  const [selectedLab,setSelectedLab]=useState<LabId>("projectile");
  const [theme,setTheme]=useState<Theme>(()=>{try{return localStorage.getItem("physimus-theme")==="dark"?"dark":"light";}catch{return "light";}});
  const [fontScale,setFontScale]=useState<number>(()=>{try{const value=Number(localStorage.getItem("physimus-font-scale"));return Number.isFinite(value)&&value>=.9&&value<=1.2?value:1;}catch{return 1;}});
  const [motionLevel,setMotionLevel]=useState<MotionLevel>(()=>{try{const value=localStorage.getItem("physimus-motion");return value==="low"||value==="high"?value:"medium";}catch{return "medium";}});
  const [renderMode,setRenderMode]=useState<RenderMode>(()=>{try{const value=localStorage.getItem("physimus-render-mode");return value==="performance"||value==="detail"?value:"auto";}catch{return "auto";}});
  const [density,setDensity]=useState<LayoutDensity>(()=>{try{return localStorage.getItem("physimus-density")==="compact"?"compact":"comfortable";}catch{return "comfortable";}});
  const resetPreferences=()=>{setTheme("light");setFontScale(1);setMotionLevel("medium");setRenderMode("auto");setDensity("comfortable");};
  const openLab=(id:LabId)=>{setSelectedLab(id);setPage("laboratory");};
  useEffect(()=>{try{localStorage.setItem("physimus-theme",theme);localStorage.setItem("physimus-font-scale",String(fontScale));localStorage.setItem("physimus-motion",motionLevel);localStorage.setItem("physimus-render-mode",renderMode);localStorage.setItem("physimus-density",density);}catch{/* Settings remain active for this session if storage is disabled. */}},[theme,fontScale,motionLevel,renderMode,density]);
  return <div className="app-root" data-theme={theme} data-motion={motionLevel} data-density={density} style={{"--font-scale":fontScale} as CSSProperties}>
    <Header page={page} setPage={setPage} language={language} onLanguage={setLanguage} theme={theme} onTheme={setTheme} fontScale={fontScale} onFontScale={setFontScale} motionLevel={motionLevel} onMotionLevel={setMotionLevel} renderMode={renderMode} onRenderMode={setRenderMode} density={density} onDensity={setDensity} onReset={resetPreferences}/>
    {page==="discover"&&<Discover language={language} onOpen={openLab}/>}
    {page==="laboratory"&&<Laboratory key={selectedLab} labId={selectedLab} language={language} theme={theme} motionLevel={motionLevel} renderMode={renderMode} onBack={()=>setPage("discover")} onChoose={openLab}/>}
    {page==="learn"&&<Learn language={language}/>}
    {page==="sandbox"&&<Suspense fallback={<main className="sandbox-workspace sandbox-loading"><span className="eyebrow">PHYSIMUS / SANDBOX</span><p>{language==="ID"?"Menyiapkan ruang eksperimen…":"Preparing the experiment workspace…"}</p></main>}><PhysicsSandbox language={language} theme={theme} motionLevel={motionLevel} renderMode={renderMode}/></Suspense>}
  </div>;
}
