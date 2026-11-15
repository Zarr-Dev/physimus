import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import katex from "katex";
import PhysicsSandbox from "./PhysicsSandbox";
import {
  Activity, ArrowLeft, ArrowRight, Atom, BookOpen, Check, ChevronDown,
  CircleHelp, Copy, Download, FlaskConical, Globe2, Grid3X3, Home as HomeIcon,
  Layers3, Pause, Play, RotateCcw, Save, Settings2, SlidersHorizontal,
  Sparkles, Upload, Waves
} from "lucide-react";

type Language = "ID" | "EN";
type Page = "discover" | "laboratory" | "learn" | "sandbox";
type Theme = "light" | "dark";
type MotionLevel = "low" | "medium" | "high";
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
    id: "energy", category: "DINAMIKA & ENERGI", title: "Kekekalan Energi Mekanik", subtitle: "Mechanical Energy",
    description: "Ikuti perubahan energi potensial gravitasi menjadi energi kinetik saat benda meluncur menuruni bidang miring. Gesekan dapat diatur.",
    formula: String.raw`E_m=E_k+E_p=\frac12mv^2+mgh`,
    question: "Apakah energi mekanik tetap ketika ada gaya gesek? Ke mana energi mekanik berpindah?",
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
    formula: String.raw`m_1u_1+m_2u_2=m_1v_1+m_2v_2,\quad e=\\frac{v_2-v_1}{u_1-u_2}`,
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

type EquationEntry = { id:string; titleID:string; titleEN:string; formula:string; noteID:string; noteEN:string };
const equationLibrary: Record<LabId, EquationEntry[]> = {
 projectile:[
  {id:"components",titleID:"Komponen kecepatan",titleEN:"Velocity components",formula:String.raw`v_x=v_0\cos\theta,\quad v_y=v_0\sin\theta-gt`,noteID:"Komponen horizontal tetap, sedangkan komponen vertikal berubah karena gravitasi.",noteEN:"The horizontal component stays constant while the vertical component changes under gravity."},
  {id:"coordinates",titleID:"Persamaan posisi",titleEN:"Position equations",formula:String.raw`x(t)=x_0+v_0\cos\theta\,t,\quad y(t)=h_0+v_0\sin\theta\,t-\frac12gt^2`,noteID:"Posisi diperoleh dengan mengintegralkan komponen kecepatan terhadap waktu.",noteEN:"Position follows by integrating each velocity component over time."},
  {id:"flight",titleID:"Waktu hingga menyentuh tanah",titleEN:"Time to reach the ground",formula:String.raw`t_f=\frac{v_0\sin\theta+\sqrt{(v_0\sin\theta)^2+2gh_0}}{g}`,noteID:"Akar positif dipilih karena waktu fisik tidak negatif.",noteEN:"Choose the positive root because physical flight time cannot be negative."},
  {id:"peak",titleID:"Tinggi maksimum",titleEN:"Maximum height",formula:String.raw`H_{\max}=h_0+\frac{v_0^2\sin^2\theta}{2g}`,noteID:"Di titik tertinggi, kecepatan vertikal sesaat sama dengan nol.",noteEN:"At the apex, vertical velocity is momentarily zero."},
  {id:"range",titleID:"Jangkauan horizontal",titleEN:"Horizontal range",formula:String.raw`R=v_0\cos\theta\,t_f`,noteID:"Bentuk ini berlaku untuk ketinggian awal umum, termasuk h₀ bukan nol.",noteEN:"This form supports a nonzero launch height."}
 ],
 mru:[
  {id:"position",titleID:"Persamaan posisi",titleEN:"Position equation",formula:String.raw`x(t)=x_0+vt`,noteID:"Grafik x–t berupa garis lurus; gradiennya adalah kecepatan.",noteEN:"The x–t graph is a straight line whose slope is velocity."},
  {id:"velocity",titleID:"Kecepatan konstan",titleEN:"Constant velocity",formula:String.raw`v=\frac{\Delta x}{\Delta t}=\text{konstan}`,noteID:"Perpindahan per selang waktu selalu sama.",noteEN:"Displacement per time interval remains constant."},
  {id:"acceleration",titleID:"Percepatan",titleEN:"Acceleration",formula:String.raw`a=\frac{\Delta v}{\Delta t}=0`,noteID:"Karena kecepatan tidak berubah, percepatannya nol.",noteEN:"Since velocity does not change, acceleration is zero."}
 ],
 mrua:[
  {id:"position",titleID:"Persamaan posisi",titleEN:"Position equation",formula:String.raw`x=x_0+v_0t+\frac12at^2`,noteID:"Grafik posisi terhadap waktu berbentuk parabola jika percepatan tidak nol.",noteEN:"Position versus time is parabolic when acceleration is nonzero."},
  {id:"velocity",titleID:"Persamaan kecepatan",titleEN:"Velocity equation",formula:String.raw`v=v_0+at`,noteID:"Gradien grafik v–t sama dengan percepatan.",noteEN:"The slope of a velocity–time graph equals acceleration."},
  {id:"torricelli",titleID:"Persamaan tanpa waktu",titleEN:"Time-independent equation",formula:String.raw`v^2=v_0^2+2a(x-x_0)`,noteID:"Berguna ketika waktu tidak diketahui atau tidak diperlukan.",noteEN:"Useful when time is unknown or not needed."},
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
  {id:"motion",titleID:"Persamaan gerak",titleEN:"Motion equation",formula:String.raw`x(t)=A\cos(\omega t+\phi)`,noteID:"Fase awal φ menentukan posisi dan arah gerak pada t = 0.",noteEN:"Initial phase φ determines position and direction at t = 0."},
  {id:"frequency",titleID:"Frekuensi sudut",titleEN:"Angular frequency",formula:String.raw`\omega=\sqrt{\frac{k}{m}}`,noteID:"Pegas lebih kaku meningkatkan frekuensi; massa lebih besar menurunkannya.",noteEN:"A stiffer spring increases frequency; a larger mass decreases it."},
  {id:"period",titleID:"Periode dan frekuensi",titleEN:"Period and frequency",formula:String.raw`T=2\pi\sqrt{\frac{m}{k}},\quad f=\frac1T`,noteID:"Periode adalah waktu satu osilasi penuh pada model pegas ideal.",noteEN:"The period is the time for one full oscillation in the ideal spring model."},
  {id:"energy",titleID:"Energi osilasi",titleEN:"Oscillation energy",formula:String.raw`E=\frac12mv^2+\frac12kx^2=\frac12kA^2`,noteID:"Tanpa redaman, energi mekanik total tetap.",noteEN:"Without damping, total mechanical energy remains constant."}
 ]
};

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
  collision: {description:"Compare elastic, partially inelastic, and perfectly inelastic one-dimensional collisions. Explore momentum conservation, impulse, restitution, and kinetic-energy changes for two bodies.",question:"How does the coefficient of restitution affect final velocities and kinetic energy?"},
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
    speed:"Initial speed",x0:"Initial position",mass1:"Mass of body 1",mass2:"Mass of body 2",velocity1:"Initial velocity of body 1",velocity2:"Initial velocity of body 2",separation:"Initial separation",restitution:"Coefficient of restitution",angle:"Launch angle",height:"Initial height",gravity:"Gravity",
    acceleration:"Acceleration",radius:"Radius",omega:"Angular velocity",mass:"Mass",
    friction:"Kinetic friction coefficient",staticFriction:"Static friction coefficient",spring:"Spring constant",amplitude:"Amplitude"
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

function Header({page,setPage,language,onLanguage,theme,onTheme,fontScale,onFontScale,motionLevel,onMotionLevel}:{page:Page;setPage:(p:Page)=>void;language:Language;onLanguage:(v:Language)=>void;theme:Theme;onTheme:(v:Theme)=>void;fontScale:number;onFontScale:(v:number)=>void;motionLevel:MotionLevel;onMotionLevel:(v:MotionLevel)=>void}) {
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
      <button className={settingsOpen?"settings-trigger active":"settings-trigger"} onClick={()=>setSettingsOpen(v=>!v)} aria-expanded={settingsOpen} aria-label={language==="ID"?"Buka pengaturan tampilan":"Open display settings"}><Settings2 size={18}/></button>
    </div>
    {settingsOpen&&<section className="settings-popover" aria-label={language==="ID"?"Pengaturan tampilan":"Display settings"}>
      <div className="settings-popover-head"><div><span className="eyebrow">PHYSIMUS / SETTINGS</span><strong>{language==="ID"?"Preferensi tampilan":"Display preferences"}</strong></div><button onClick={()=>setSettingsOpen(false)} aria-label="Close">×</button></div>
      <div className="settings-control"><span>{language==="ID"?"Tema":"Theme"}</span><div className="settings-choice"><button className={theme==="light"?"chosen":""} onClick={()=>onTheme("light")}>{language==="ID"?"Terang":"Light"}</button><button className={theme==="dark"?"chosen":""} onClick={()=>onTheme("dark")}>{language==="ID"?"Gelap":"Dark"}</button></div></div>
      <div className="settings-control"><label htmlFor="font-scale">{language==="ID"?"Ukuran teks & antarmuka":"Text & interface scale"} <strong>{Math.round(fontScale*100)}%</strong></label><input id="font-scale" type="range" min=".9" max="1.2" step=".05" value={fontScale} onChange={e=>onFontScale(Number(e.target.value))}/><div className="settings-range-labels"><span>{language==="ID"?"Kecil":"Small"}</span><span>{language==="ID"?"Besar":"Large"}</span></div></div>
      <div className="settings-control"><span>{language==="ID"?"Intensitas animasi":"Animation intensity"}</span><div className="settings-choice three"><button className={motionLevel==="low"?"chosen":""} onClick={()=>onMotionLevel("low")}>{language==="ID"?"Rendah":"Low"}</button><button className={motionLevel==="medium"?"chosen":""} onClick={()=>onMotionLevel("medium")}>{language==="ID"?"Sedang":"Med"}</button><button className={motionLevel==="high"?"chosen":""} onClick={()=>onMotionLevel("high")}>{language==="ID"?"Tinggi":"High"}</button></div></div>
      <p className="settings-note">{language==="ID"?"Preferensi disimpan pada browser ini. Animasi tetap menghormati pengaturan Reduce Motion perangkat.":"Preferences are saved in this browser. Animations still respect your device's Reduce Motion setting."}</p>
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
  const digits=param.step<1? (String(param.step).split(".")[1]?.length??1):0;
  return <label className="slider-control">
    <span className="slider-heading"><span>{param.label}</span><strong>{value.toFixed(digits)} <small>{param.unit}</small></strong></span>
    <input type="range" min={param.min} max={param.max} step={param.step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
    <span className="slider-limits"><span>{param.min}</span><span>{param.max}</span></span>
  </label>;
}

function collisionResults(v:Record<string,number>){
  const m1=v.mass1??2,m2=v.mass2??2,u1=v.velocity1??6,u2=v.velocity2??0,e=Math.max(0,Math.min(1,v.restitution??1));
  const separation=v.separation??6,contactDistance=0.8;
  const relative=u1-u2,collisionTime=relative>0?Math.max(0,separation-contactDistance)/relative:Infinity;
  const v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2);
  const v2=((1+e)*m1*u1+(m2-e*m1)*u2)/(m1+m2);
  return {m1,m2,u1,u2,e,separation,contactDistance,collisionTime,v1,v2,initialMomentum:m1*u1+m2*u2,initialKinetic:.5*m1*u1*u1+.5*m2*u2*u2};
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
  const energyStaticHolds=Math.tan(energyAngle)<=p("staticFriction");
  const energyAcceleration=energyStaticHolds?0:g*(Math.sin(energyAngle)-p("friction")*Math.cos(energyAngle));
  if(lab.id==="energy"&&energyAcceleration>0) duration=Math.sqrt(2*(p("height")/Math.sin(energyAngle))/energyAcceleration);
  if(lab.id==="spring") duration=2*Math.PI/Math.sqrt(p("spring")/p("mass"))*2;
  const count=240;
  const points:Point[]=[];
  const angle=p("angle")*Math.PI/180;
  const omega=lab.id==="spring"?Math.sqrt(p("spring")/p("mass")):p("omega");
  const inclineAngle=lab.id==="energy"?Math.PI/6:angle;
  const totalDistance=lab.id==="energy"?p("height")/Math.sin(inclineAngle):0;
  const staticHolds=(lab.id==="incline"||lab.id==="energy")&&Math.tan(inclineAngle)<=p("staticFriction");
  const accel=lab.id==="incline"&&!staticHolds?Math.max(0,g*(Math.sin(angle)-p("friction")*Math.cos(angle))):0;
  for(let i=0;i<=count;i++) {
    const time=duration*i/count;
    let x=0,y=0,vx=0,vy=0,kinetic=0,potential=0,x2:number|undefined,vx2:number|undefined;
    const mass=p("mass")||1;
    if(lab.id==="projectile") {
      const v=p("speed"),theta=angle;
      vx=v*Math.cos(theta);vy=v*Math.sin(theta)-g*time;
      x=v*Math.cos(theta)*time;
      y=Math.max(0,p("height")+v*Math.sin(theta)*time-.5*g*time*time);
      const h=p("height")+v*Math.sin(theta)*time-.5*g*time*time;
      kinetic=.5*mass*(vx*vx+vy*vy);potential=mass*g*Math.max(0,h);
    } else if(lab.id==="mru") {
      vx=p("speed");x=p("x0")+vx*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="mrua") {
      vx=p("speed")+p("acceleration")*time;x=p("x0")+p("speed")*time+.5*p("acceleration")*time*time;kinetic=.5*mass*vx*vx;
    } else if(lab.id==="circular") {
      const theta=omega*time,r=p("radius");
      x=r*Math.cos(theta);y=r*Math.sin(theta);
      vx=-r*omega*Math.sin(theta);vy=r*omega*Math.cos(theta);kinetic=.5*mass*(r*omega)**2;
    } else if(lab.id==="collision") {
      const c=collisionResults(values),elapsed=Math.max(0,time-c.collisionTime),hasCollided=time>=c.collisionTime;
      if(hasCollided&&Number.isFinite(c.collisionTime)){
        const contactX1=-c.separation/2+c.u1*c.collisionTime,contactX2=c.separation/2+c.u2*c.collisionTime;
        x=contactX1+c.v1*elapsed;x2=contactX2+c.v2*elapsed;vx=c.v1;vx2=c.v2;
      }else{
        x=-(values.separation??6)/2+c.u1*time;x2=(values.separation??6)/2+c.u2*time;vx=c.u1;vx2=c.u2;
      }
      kinetic=.5*c.m1*vx*vx+.5*c.m2*(vx2??0)**2;
    } else if(lab.id==="energy") {
      const s=Math.min(totalDistance,.5*Math.max(0,energyAcceleration)*time*time);
      const h=Math.max(0,p("height")-s*Math.sin(inclineAngle));
      const v=Math.max(0,energyAcceleration)*time;
      x=s*Math.cos(inclineAngle);y=h;vx=v*Math.cos(inclineAngle);vy=-v*Math.sin(inclineAngle);kinetic=.5*mass*v*v;potential=mass*g*h;
    } else if(lab.id==="incline") {
      const a=accel;
      const distance=.5*a*time*time;
      x=distance*Math.cos(angle);y=-distance*Math.sin(angle);vx=a*time*Math.cos(angle);vy=-a*time*Math.sin(angle);kinetic=.5*mass*vx*vx/(Math.cos(angle)**2||1);potential=0;
    } else if(lab.id==="spring") {
      const a=p("amplitude"),w=omega;
      x=a*Math.cos(w*time);vx=-a*w*Math.sin(w*time);
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
  if(lab.id==="collision"){
    const c=collisionResults(values),occurred=point.collisionOccurred??false,v1=occurred?c.v1:c.u1,v2=occurred?c.v2:c.u2;
    return [
      [language==="ID"?"Kecepatan benda 1":"Body 1 velocity",v1,"m/s"],
      [language==="ID"?"Kecepatan benda 2":"Body 2 velocity",v2,"m/s"],
      [language==="ID"?"Momentum total":"Total momentum",c.initialMomentum,"kg·m/s"],
      [language==="ID"?"Energi kinetik sistem":"System kinetic energy",point.kinetic,"J"],
      [language==="ID"?"Impuls benda 1":"Impulse on body 1",c.m1*(v1-c.u1),"N·s"],
      [language==="ID"?"Waktu tumbukan":"Collision time",Number.isFinite(c.collisionTime)?c.collisionTime:0,"s"]
    ] as [string,number,string][];
  }
  if(lab.id==="energy") return [
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.mechanical,total,"J"],
    [language==="ID"?"Energi terdisipasi":"Dissipated energy",Math.max(0,mass*g*values.height-total),"J"],
    [labels.height,point.y,"m"],[labels.speed,point.speed,"m/s"]
  ] as [string,number,string][];
  if(lab.id==="incline") {
    const angle=values.angle*Math.PI/180;
    const acceleration=Math.tan(angle)<=values.staticFriction?0:Math.max(0,values.gravity*(Math.sin(angle)-values.friction*Math.cos(angle)));
    return [
      [labels.acceleration,acceleration,"m/s²"],[labels.net,mass*acceleration,"N"],
      [language==="ID"?"Gaya normal":"Normal force",mass*values.gravity*Math.cos(angle),"N"],
      [language==="ID"?"Gaya gesek":"Friction force",acceleration===0?mass*values.gravity*Math.sin(angle):values.friction*mass*values.gravity*Math.cos(angle),"N"],
      [labels.velocity,point.speed,"m/s"],[labels.distance,Math.hypot(point.x,point.y),"m"]
    ] as [string,number,string][];
  }
  return [
    [labels.position,point.x,"m"],[labels.velocity,point.vx,"m/s"],[labels.acceleration,-(values.spring/values.mass)*point.x,"m/s²"],
    [labels.kinetic,point.kinetic,"J"],[labels.potential,point.potential,"J"],[labels.period,2*Math.PI*Math.sqrt(values.mass/values.spring),"s"]
  ] as [string,number,string][];
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
  ctx.save();ctx.translate(x,y);if(style==="rocket")ctx.rotate(orientation+Math.PI/2);else if(style==="satellite"||style==="block")ctx.rotate(orientation);
  if(style==="car"||style==="cart"||style==="train"){
    ctx.fillStyle=style==="train"?"#617e9e":color;ctx.beginPath();ctx.roundRect(-19,-12,38,18,5);ctx.fill();
    if(style==="train"){ctx.fillStyle="#e7f1fa";ctx.fillRect(-12,-8,8,7);ctx.fillRect(1,-8,8,7);}
    ctx.fillStyle="#344b64";ctx.beginPath();ctx.arc(-11,8,5,0,Math.PI*2);ctx.arc(12,8,5,0,Math.PI*2);ctx.fill();
  }else if(style==="satellite"){
    ctx.fillStyle="#d99a46";ctx.fillRect(-7,-7,14,14);ctx.fillStyle="#8da5bd";ctx.fillRect(-26,-5,16,10);ctx.fillRect(10,-5,16,10);ctx.strokeStyle="#657f98";ctx.strokeRect(-26,-5,16,10);ctx.strokeRect(10,-5,16,10);
  }else if(style==="planet"){
    ctx.strokeStyle="#b7a5e8";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,18,7,-.3,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#8b6bd6";ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
  }else if(style==="rocket"){
    ctx.fillStyle="#8b6bd6";ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(10,9);ctx.lineTo(-10,9);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d99a46";ctx.beginPath();ctx.moveTo(-4,9);ctx.lineTo(0,20);ctx.lineTo(4,9);ctx.closePath();ctx.fill();
  }else if(style==="mass"){
    ctx.strokeStyle="#8298af";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-52,0);for(let i=0;i<8;i++)ctx.lineTo(-48+i*5,Math.sin(i*Math.PI)*7);ctx.lineTo(-12,0);ctx.stroke();
    ctx.fillStyle=color;ctx.fillRect(-10,-10,20,20);ctx.strokeStyle="#fff";ctx.strokeRect(-10,-10,20,20);
  }else if(style==="block"){
    ctx.fillStyle=color;ctx.fillRect(-12,-11,24,22);ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.strokeRect(-12,-11,24,22);
  }else{
    ctx.fillStyle=style==="football"?"#4b9b79":style==="sphere"?"#d99a46":color;
    ctx.beginPath();ctx.arc(0,0,style==="football"?11:10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#fff";ctx.lineWidth=1.8;ctx.stroke();
    if(style==="football"){ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(7,7);ctx.moveTo(-7,7);ctx.lineTo(7,-7);ctx.stroke();}
  }
  ctx.restore();
}

function liveEquationsFor(lab:Lab,v:Record<string,number>,p:Point,t:number):{title:string;formula:string}[] {
  const n=(x:number)=>Number.isFinite(x)?x.toFixed(2):"0.00";
  const g=v.gravity??9.81,m=v.mass??1;
  if(lab.id==="projectile"){
    const th=(v.angle??0),rad=th*Math.PI/180,v0=v.speed??0;
    return [
      {title:"Posisi horizontal",formula:"x(t)="+n(v0)+"\\cos("+n(th)+"^\\circ)\\cdot "+n(t)+" = "+n(p.x)+"\\;\\mathrm{m}"},
      {title:"Posisi vertikal",formula:"y(t)="+n(v.height??0)+"+"+n(v0)+"\\sin("+n(th)+"^\\circ)\\cdot "+n(t)+"-\\frac12("+n(g)+")("+n(t)+")^2="+n(p.y)+"\\;\\mathrm{m}"},
      {title:"Komponen kecepatan",formula:"v_x="+n(v0*Math.cos(rad))+"\\;\\mathrm{m/s},\\quad v_y="+n(p.vy)+"\\;\\mathrm{m/s}"},
      {title:"Energi kinetik",formula:"E_k=\\frac12("+n(m)+")("+n(p.speed)+")^2="+n(p.kinetic)+"\\;\\mathrm{J}"}
    ];
  }
  if(lab.id==="mru") return [
    {title:"Posisi",formula:"x(t)="+n(v.x0??0)+"+"+n(v.speed??0)+"\\cdot "+n(t)+"="+n(p.x)+"\\;\\mathrm{m}"},
    {title:"Kecepatan tetap",formula:"v(t)=v_0="+n(v.speed??0)+"\\;\\mathrm{m/s}"},
    {title:"Percepatan",formula:"a(t)=\\frac{\\Delta v}{\\Delta t}=0\\;\\mathrm{m/s^2}"},
    {title:"Energi kinetik",formula:"E_k=\\frac12("+n(m)+")("+n(p.speed)+")^2="+n(p.kinetic)+"\\;\\mathrm{J}"}
  ];
  if(lab.id==="mrua") return [
    {title:"Posisi",formula:"x(t)="+n(v.x0??0)+"+"+n(v.speed??0)+"t+\\frac12("+n(v.acceleration??0)+")t^2="+n(p.x)+"\\;\\mathrm{m}"},
    {title:"Kecepatan",formula:"v(t)="+n(v.speed??0)+"+("+n(v.acceleration??0)+")("+n(t)+")="+n(p.vx)+"\\;\\mathrm{m/s}"},
    {title:"Hukum II Newton",formula:"\\sum F=ma=("+n(m)+")("+n(v.acceleration??0)+")="+n(m*(v.acceleration??0))+"\\;\\mathrm{N}"},
    {title:"Energi kinetik",formula:"E_k=\\frac12mv^2="+n(p.kinetic)+"\\;\\mathrm{J}"}
  ];
  if(lab.id==="circular") return [
    {title:"Posisi sudut",formula:"\\theta(t)=\\omega t=("+n(v.omega??0)+")("+n(t)+")="+n((v.omega??0)*t)+"\\;\\mathrm{rad}"},
    {title:"Kelajuan tangensial",formula:"v=\\omega r=("+n(v.omega??0)+")("+n(v.radius??0)+")="+n(p.speed)+"\\;\\mathrm{m/s}"},
    {title:"Percepatan sentripetal",formula:"a_c=\\omega^2r=("+n(v.omega??0)+")^2("+n(v.radius??0)+")="+n((v.omega??0)**2*(v.radius??0))+"\\;\\mathrm{m/s^2}"},
    {title:"Periode",formula:"T=\\frac{2\\pi}{\\omega}= "+n(2*Math.PI/(v.omega??1))+"\\;\\mathrm{s}"}
  ];
  if(lab.id==="collision"){
    const c=collisionResults(v),occurred=p.collisionOccurred??false,v1=occurred?c.v1:c.u1,v2=occurred?c.v2:c.u2;
    const currentKinetic=.5*c.m1*v1*v1+.5*c.m2*v2*v2;
    return [
      {title:"Momentum total",formula:"p_{tot}=m_1u_1+m_2u_2="+n(c.initialMomentum)+"\\;\\mathrm{kg\\,m/s}"},
      {title:"Kecepatan akhir benda 1",formula:"v_1="+n(v1)+"\\;\\mathrm{m/s}"},
      {title:"Kecepatan akhir benda 2",formula:"v_2="+n(v2)+"\\;\\mathrm{m/s}"},
      {title:"Impuls benda 1",formula:"J_1=m_1(v_1-u_1)="+n(c.m1*(v1-c.u1))+"\\;\\mathrm{N\\,s}"},
      {title:"Energi kinetik sistem",formula:"K=\\frac12m_1v_1^2+\\frac12m_2v_2^2="+n(currentKinetic)+"\\;\\mathrm{J}"}
    ];
  }
  if(lab.id==="energy"){
    const alpha=Math.PI/6,distanceTravelled=p.x/Math.cos(alpha),mu=v.friction??0;
    return [
      {title:"Energi potensial",formula:"E_p=mgh=("+n(m)+")("+n(g)+")("+n(p.y)+")="+n(p.potential)+"\\;\\mathrm{J}"},
      {title:"Energi kinetik",formula:"E_k=\\frac12mv^2=\\frac12("+n(m)+")("+n(p.speed)+")^2="+n(p.kinetic)+"\\;\\mathrm{J}"},
      {title:"Usaha gesekan",formula:"W_f=-\\mu_kmg\\cos 30^\\circ\\,s="+n(-mu*m*g*Math.cos(alpha)*Math.max(0,distanceTravelled))+"\\;\\mathrm{J}"},
      {title:"Energi mekanik",formula:"E_m=E_k+E_p="+n(p.kinetic+p.potential)+"\\;\\mathrm{J}"}
    ];
  }
  if(lab.id==="incline"){
    const th=(v.angle??0)*Math.PI/180,holds=Math.tan(th)<=(v.staticFriction??0),acc=holds?0:Math.max(0,g*(Math.sin(th)-(v.friction??0)*Math.cos(th)));
    return [
      {title:"Komponen berat sejajar",formula:"F_{\\parallel}=mg\\sin\\theta="+n(m*g*Math.sin(th))+"\\;\\mathrm{N}"},
      {title:"Gaya normal",formula:"N=mg\\cos\\theta="+n(m*g*Math.cos(th))+"\\;\\mathrm{N}"},
      {title:"Percepatan sepanjang bidang",formula:"a="+(holds?"0":"g(\\sin\\theta-\\mu_k\\cos\\theta)")+"="+n(acc)+"\\;\\mathrm{m/s^2}"},
      {title:"Resultan gaya",formula:"\\sum F_{\\parallel}=ma="+n(m*acc)+"\\;\\mathrm{N}"}
    ];
  }
  const omega=Math.sqrt((v.spring??0)/m);
  return [
    {title:"Frekuensi sudut",formula:"\\omega=\\sqrt{\\frac{k}{m}}=\\sqrt{\\frac{"+n(v.spring??0)+"}{"+n(m)+"}}="+n(omega)+"\\;\\mathrm{rad/s}"},
    {title:"Posisi massa",formula:"x(t)="+n(v.amplitude??0)+"\\cos("+n(omega)+"t)="+n(p.x)+"\\;\\mathrm{m}"},
    {title:"Gaya pemulih",formula:"F=-kx=-("+n(v.spring??0)+")("+n(p.x)+")="+n(-(v.spring??0)*p.x)+"\\;\\mathrm{N}"},
    {title:"Energi mekanik",formula:"E=\\frac12kA^2="+n(.5*(v.spring??0)*(v.amplitude??0)**2)+"\\;\\mathrm{J}"}
  ];
}

type PracticeQuestion={prompt:string;given:string;formula:string;answer:number;unit:string;steps:string[];resultLabel:string};
function makePracticeQuestion(id:LabId,language:Language):PracticeQuestion {
  const r=(min:number,max:number,step:number)=>Math.round((min+Math.random()*(max-min))/step)*step;
  const f=(x:number)=>Number(x.toFixed(2));
  const en=language==="EN";
  if(id==="projectile"){
    const v=r(14,28,1),a=r(25,65,1),g=9.81,rad=a*Math.PI/180,answer=v*v*Math.sin(rad)**2/(2*g);
    return {prompt:en?"Find the rise above launch point at maximum height.":"Hitung kenaikan ketinggian maksimum dari titik peluncuran.",given:"v₀ = "+v+" m/s, θ = "+a+"°, g = 9.81 m/s²",formula:"\\Delta h_{max}=\\frac{v_0^2\\sin^2\\theta}{2g}",answer,unit:"m",resultLabel:en?"Maximum rise":"Kenaikan maksimum",steps:["\\Delta h=\\frac{("+v+")^2\\sin^2("+a+"^\\circ)}{2(9.81)}","\\Delta h="+f(answer)+"\\;\\mathrm{m}"]};
  }
  if(id==="mru"){
    const v=r(3,18,1),t=r(2,12,1),answer=v*t;
    return {prompt:en?"How far does the object travel in the given time?":"Berapa perpindahan benda selama waktu tersebut?",given:"v = "+v+" m/s, t = "+t+" s, x₀ = 0",formula:"\\Delta x=vt",answer,unit:"m",resultLabel:en?"Displacement":"Perpindahan",steps:["\\Delta x=("+v+")("+t+")","\\Delta x="+f(answer)+"\\;\\mathrm{m}"]};
  }
  if(id==="mrua"){
    const v0=r(0,8,1),a=r(.5,3,.5),t=r(2,8,1),answer=v0+a*t;
    return {prompt:en?"Determine the velocity after the stated time.":"Tentukan kecepatan setelah selang waktu tersebut.",given:"v₀ = "+v0+" m/s, a = "+a+" m/s², t = "+t+" s",formula:"v=v_0+at",answer,unit:"m/s",resultLabel:en?"Final velocity":"Kecepatan akhir",steps:["v="+v0+"+("+a+")("+t+")","v="+f(answer)+"\\;\\mathrm{m/s}"]};
  }
  if(id==="circular"){
    const omega=r(.5,4,.5),radius=r(1,8,1),answer=omega*omega*radius;
    return {prompt:en?"Calculate the centripetal acceleration.":"Hitung percepatan sentripetal benda.",given:"ω = "+omega+" rad/s, r = "+radius+" m",formula:"a_c=\\omega^2r",answer,unit:"m/s²",resultLabel:en?"Centripetal acceleration":"Percepatan sentripetal",steps:["a_c=("+omega+")^2("+radius+")","a_c="+f(answer)+"\\;\\mathrm{m/s^2}"]};
  }
  if(id==="energy"){
    const h=r(1,15,.5),g=9.81,answer=Math.sqrt(2*g*h);
    return {prompt:en?"Find the speed after a frictionless drop from rest.":"Tentukan kelajuan setelah benda turun tanpa gesekan dari keadaan diam.",given:"Δh = "+h+" m, v₀ = 0, g = 9.81 m/s²",formula:"v=\\sqrt{2g\\Delta h}",answer,unit:"m/s",resultLabel:en?"Speed":"Kelajuan",steps:["\\frac12mv^2=mg\\Delta h","v=\\sqrt{2(9.81)("+h+")}","v="+f(answer)+"\\;\\mathrm{m/s}"]};
  }
  if(id==="incline"){
    const angle=r(28,55,1),mu=r(.05,.2,.01),g=9.81,rad=angle*Math.PI/180,answer=g*(Math.sin(rad)-mu*Math.cos(rad));
    return {prompt:en?"A block is already sliding downhill. Find its acceleration.":"Balok sudah meluncur menuruni bidang. Hitung percepatannya.",given:"θ = "+angle+"°, μₖ = "+mu.toFixed(2)+", g = 9.81 m/s²",formula:"a=g(\\sin\\theta-\\mu_k\\cos\\theta)",answer,unit:"m/s²",resultLabel:en?"Down-slope acceleration":"Percepatan turun bidang",steps:["a=9.81(\\sin "+angle+"^\\circ-"+mu.toFixed(2)+"\\cos "+angle+"^\\circ)","a="+f(answer)+"\\;\\mathrm{m/s^2}"]};
  }
  if(id==="collision"){
    const m1=r(1,4,.5),m2=r(1,4,.5),u1=r(5,10,.5),u2=r(-2,2,.5),e=r(0,1,.1);
    const v1=((m1-e*m2)*u1+(1+e)*m2*u2)/(m1+m2),answer=m1*(v1-u1);
    return {prompt:en?"Find the impulse delivered to body 1 during the collision.":"Tentukan impuls yang diterima benda 1 selama tumbukan.",given:"m₁ = "+m1+" kg, m₂ = "+m2+" kg, u₁ = "+u1+" m/s, u₂ = "+u2+" m/s, e = "+e.toFixed(1),formula:"J_1=m_1(v_1-u_1)",answer,unit:"N·s",resultLabel:en?"Impulse on body 1":"Impuls benda 1",steps:["v_1=\\frac{(m_1-em_2)u_1+(1+e)m_2u_2}{m_1+m_2}","v_1="+f(v1)+"\\;\\mathrm{m/s}","J_1=("+m1+")("+f(v1)+"-"+u1+")","J_1="+f(answer)+"\\;\\mathrm{N\\,s}"]};
  }
  const m=r(.5,5,.5),k=r(10,100,5),answer=2*Math.PI*Math.sqrt(m/k);
  return {prompt:en?"Calculate the period of an ideal mass–spring oscillator.":"Hitung periode osilasi sistem massa–pegas ideal.",given:"m = "+m+" kg, k = "+k+" N/m",formula:"T=2\\pi\\sqrt{\\frac{m}{k}}",answer,unit:"s",resultLabel:en?"Oscillation period":"Periode osilasi",steps:["T=2\\pi\\sqrt{\\frac{"+m+"}{"+k+"}}","T="+f(answer)+"\\;\\mathrm{s}"]};
}
function PracticePanel({labId,language}:{labId:LabId;language:Language}) {
  const en=language==="EN";
  const [question,setQuestion]=useState(()=>makePracticeQuestion(labId,language));
  const [answer,setAnswer]=useState("");const [checked,setChecked]=useState(false);const [showSolution,setShowSolution]=useState(false);
  useEffect(()=>{setQuestion(makePracticeQuestion(labId,language));setAnswer("");setChecked(false);setShowSolution(false);},[labId,language]);
  const numeric=Number(answer);
  const correct=answer.trim()!==""&&Number.isFinite(numeric)&&Math.abs(numeric-question.answer)<=Math.max(.02,Math.abs(question.answer)*.01);
  const replace=()=>{setQuestion(makePracticeQuestion(labId,language));setAnswer("");setChecked(false);setShowSolution(false);};
  return <section className="practice-panel">
    <div className="practice-top"><div><span className="eyebrow">{en?"PRACTICE LAB":"LATIHAN LABORATORIUM"}</span><h2>{en?"Random challenge":"Tantangan acak"}</h2><p>{en?"Solve a short problem using the active topic.":"Selesaikan soal singkat sesuai materi laboratorium yang sedang dibuka."}</p></div><button className="secondary-button" onClick={replace}><RotateCcw size={15}/>{en?"New question":"Soal baru"}</button></div>
    <div className="practice-content"><div className="practice-question"><strong>{question.prompt}</strong><p>{question.given}</p><div className="practice-formula"><Equation value={question.formula} display/></div></div>
      <div className="practice-answer"><label>{en?"Your answer":"Jawabanmu"} ({question.unit})<input type="number" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} placeholder={en?"Enter a number":"Masukkan angka"}/></label><button className="primary-button" onClick={()=>setChecked(true)} disabled={!answer.trim()}>{en?"Check answer":"Periksa jawaban"}</button>
      {checked&&<p className={correct?"practice-correct":"practice-incorrect"}>{correct?(en?"Correct — well done!":"Benar — perhitungannya tepat!"):(en?"Not quite. Recheck the substitution and units.":"Belum tepat. Periksa kembali substitusi angka dan satuannya.")}</p>}
      <button className="practice-solution-button" onClick={()=>setShowSolution(v=>!v)}>{showSolution?(en?"Hide solution":"Sembunyikan pembahasan"):(en?"Show worked solution":"Lihat pembahasan")}</button></div>
    </div>
    {showSolution&&<div className="practice-solution"><strong>{question.resultLabel}: {question.answer.toFixed(2)} {question.unit}</strong>{question.steps.map((step,i)=><div key={i}><span>{i+1}</span><Equation value={step} display/></div>)}</div>}
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

function Laboratory({labId,language,onBack,onChoose,theme}:{labId:LabId;language:Language;onBack:()=>void;onChoose:(id:LabId)=>void;theme:Theme}) {
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
  const [showTangent,setShowTangent]=useState(false);
  const [graphMode,setGraphMode]=useState<"trajectory"|"position-time"|"velocity-time"|"acceleration-time">("trajectory");
  const [selectedObject,setSelectedObject]=useState(()=>objectOptionsFor(lab.id,language)[0].value);
  const [selectedObject2,setSelectedObject2]=useState(()=>objectOptionsFor(lab.id,language)[1]?.value??objectOptionsFor(lab.id,language)[0].value);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const drawRef=useRef<()=>void>(()=>{});
  const timeRef=useRef(0);
  const fileRef=useRef<HTMLInputElement>(null);
  const points=useMemo(()=>makePoints(lab,values),[lab,values]);
  const duration=points[points.length-1]?.t??1;
  const current=points[Math.min(points.length-1,Math.round(time/duration*(points.length-1)))]??points[0];
  const metrics=metricsFor(lab,values,current,points,language);
  const liveEquations=liveEquationsFor(lab,values,current,time);
  const objectOrientation=lab.id==="energy"?Math.PI/6:lab.id==="incline"?(values.angle??0)*Math.PI/180:(lab.id==="projectile"||lab.id==="circular")?Math.atan2(-current.vy,current.vx):0;

  useEffect(()=>{
    const initial=Object.fromEntries(lab.params.map(p=>[p.key,p.initial]));
    setValues(initial);setSelectedObject(objectOptionsFor(lab.id,language)[0].value);setSelectedObject2(objectOptionsFor(lab.id,language)[1]?.value??objectOptionsFor(lab.id,language)[0].value);setTime(0);timeRef.current=0;setPlaying(false);setNotice("");
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
      const plotStyle=getComputedStyle(canvas),plotBg=plotStyle.getPropertyValue("--plot-bg").trim()||(theme==="dark"?"#111d2b":"#fff"),gridMajor=plotStyle.getPropertyValue("--plot-grid").trim()||(theme==="dark"?"#26384b":"#edf2f7"),axisColor=plotStyle.getPropertyValue("--plot-axis").trim()||(theme==="dark"?"#70869d":"#748ba2");ctx.clearRect(0,0,width,height);ctx.fillStyle=plotBg;ctx.fillRect(0,0,width,height);
      const plotted=graphMode==="trajectory"?points:points.map((p,i)=>{
        const acceleration=lab.id==="mru"?0:lab.id==="mrua"?values.acceleration??0:lab.id==="incline"?(Math.tan((values.angle??0)*Math.PI/180)<=(values.staticFriction??0)?0:Math.max(0,(values.gravity??9.81)*(Math.sin((values.angle??0)*Math.PI/180)-(values.friction??0)*Math.cos((values.angle??0)*Math.PI/180)))):lab.id==="spring"?-(values.spring??0)/(values.mass??1)*p.x:lab.id==="circular"?-((values.omega??0)**2)*p.x:lab.id==="energy"?(values.gravity??9.81)*(Math.sin(Math.PI/6)-(values.friction??0)*Math.cos(Math.PI/6)):lab.id==="projectile"?-(values.gravity??9.81):lab.id==="collision"?0:(i===0?0:(points[i].vx-points[i-1].vx)/Math.max(.000001,points[i].t-points[i-1].t));
        return graphMode==="position-time"?{...p,x:p.t,y:(lab.id==="energy"||lab.id==="incline")?Math.hypot(p.x,p.y):p.x}:graphMode==="velocity-time"?{...p,x:p.t,y:(lab.id==="energy"||lab.id==="incline")?p.speed:p.vx}:{...p,x:p.t,y:acceleration};
      });
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
      const sx=(maxX-minX)||1,sy=(maxY-minY)||1;
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
  },[lab,values,points,time,current,showGrid,showVectors,showTrail,showRuler,showTangent,graphMode,selectedObject,selectedObject2,objectOrientation,theme]);

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
  const assumptions:Record<LabId,{id:string;en:string}> = {
    projectile:{id:"Lintasan 2D ideal tanpa hambatan udara; gravitasi konstan dan permukaan tanah datar.",en:"Ideal 2D trajectory without air drag; gravity is constant and the ground is level."},
    mru:{id:"Gerak satu dimensi pada lintasan lurus; kecepatan konstan dan resultan gaya nol.",en:"One-dimensional straight-line motion; velocity is constant and net force is zero."},
    mrua:{id:"Gerak satu dimensi dengan percepatan konstan; gaya resultan konstan.",en:"One-dimensional motion with constant acceleration; net force is constant."},
    circular:{id:"Gerak melingkar beraturan: jari-jari dan kecepatan sudut konstan; percepatan sentripetal menuju pusat.",en:"Uniform circular motion: fixed radius and angular speed; centripetal acceleration points inward."},
    energy:{id:"Bidang miring 30°; benda mulai diam. Gesekan statis menentukan apakah benda mulai bergerak, lalu gesekan kinetis berlaku saat meluncur. Hambatan udara diabaikan.",en:"A 30° incline; the object starts from rest. Static friction determines whether it starts moving, then kinetic friction applies while sliding. Air drag is ignored."},
    incline:{id:"Balok pada bidang miring; gesekan statis menentukan ambang gerak, gesekan kinetis berlaku selama meluncur. Hambatan udara diabaikan.",en:"A block on an inclined plane; static friction sets the motion threshold, and kinetic friction applies while sliding. Air drag is ignored."},
    collision:{id:"Tumbukan satu dimensi terisolasi: impuls eksternal diabaikan dan kontak dimodelkan seketika. Grafik percepatan menandai waktu tumbukan; gaya puncak selama kontak tidak dimodelkan.",en:"Isolated one-dimensional collision: external impulse is neglected and contact is modeled as instantaneous. The acceleration plot marks impact time; peak contact force is not modeled."},
    spring:{id:"Osilator massa–pegas ideal: pegas linear, tanpa redaman, dan tanpa gaya luar.",en:"Ideal mass–spring oscillator: linear spring, no damping, and no external driving force."}
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
    <div className="lab-studio">
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
          {drawerTab==="parameters"&&<><div className="panel-title"><span>01</span><h2>{w.parameters}</h2></div><div className="parameter-list">{lab.params.map(param=><Slider key={param.key} param={{...param,label:parameterText(language,param.key,param.label)}} value={values[param.key]} onChange={v=>changeParam(param.key,v)}/>)}</div></>}
          {drawerTab==="equations"&&<><div className="panel-title"><span>02</span><h2>{w.expr}</h2></div><div className="equation-feature"><span className="eyebrow">{language==="ID"?"PERSAMAAN UTAMA":"MAIN MODEL"}</span><div className="formula-box"><Equation value={lab.formula} display/></div><p>{language==="ID"?"Model inti yang digunakan untuk membangun simulasi ini.":"Core model used to build this simulation."}</p></div><div className="equation-list">{equationLibrary[lab.id].map((eq,index)=><article className="equation-card" key={eq.id}><div className="equation-card-head"><span>{String(index+1).padStart(2,"0")}</span><strong>{language==="ID"?eq.titleID:eq.titleEN}</strong><button title={language==="ID"?"Salin LaTeX":"Copy LaTeX"} onClick={()=>{void navigator.clipboard?.writeText(eq.formula);setNotice(language==="ID"?"LaTeX disalin":"LaTeX copied");}}><Copy size={15}/></button></div><div className="equation-math"><Equation value={eq.formula} display/></div><p>{language==="ID"?eq.noteID:eq.noteEN}</p></article>)}</div><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div></>}
          {drawerTab==="tools"&&<><div className="panel-title"><span>03</span><h2>{language==="ID"?"Alat grafik":"Graph tools"}</h2></div><label className="tool-select-label">{language==="ID"?"Jenis grafik":"Graph type"}<select value={graphMode} onChange={e=>setGraphMode(e.target.value as typeof graphMode)}><option value="trajectory">{language==="ID"?"Lintasan / bidang":"Trajectory / plane"}</option><option value="position-time">{language==="ID"?"Posisi–waktu (x–t)":"Position–time (x–t)"}</option><option value="velocity-time">{language==="ID"?"Kecepatan–waktu (v–t)":"Velocity–time (v–t)"}</option><option value="acceleration-time">{language==="ID"?"Percepatan–waktu (a–t)":"Acceleration–time (a–t)"}</option></select></label><button className={showRuler?"drawer-tool active": "drawer-tool"} onClick={()=>setShowRuler(v=>!v)}>{language==="ID"?"Penggaris koordinat":"Coordinate ruler"}<span>{showRuler?"ON":"OFF"}</span></button><button disabled={graphMode==="trajectory"} className={showTangent?"drawer-tool active":"drawer-tool"} onClick={()=>setShowTangent(v=>!v)}>{language==="ID"?"Garis singgung & gradien":"Tangent & slope"}<span>{showTangent?"ON":"OFF"}</span></button><button className={showGrid?"drawer-tool active":"drawer-tool"} onClick={()=>setShowGrid(v=>!v)}>{w.grid}<span>{showGrid?"ON":"OFF"}</span></button><button className={showVectors?"drawer-tool active":"drawer-tool"} onClick={()=>setShowVectors(v=>!v)}>{w.vectors}<span>{showVectors?"ON":"OFF"}</span></button><button className={showTrail?"drawer-tool active":"drawer-tool"} onClick={()=>setShowTrail(v=>!v)}>{w.trail}<span>{showTrail?"ON":"OFF"}</span></button><p className="drawer-help">{language==="ID"?"Penggaris menampilkan garis bantu dan koordinat titik saat ini. Grafik waktu memakai sumbu horizontal t.":"The ruler shows guide lines and the current point coordinates. Time plots use t on the horizontal axis."}</p></>}
          {drawerTab==="model"&&<><div className="panel-title"><span>04</span><h2>{w.assumptions}</h2></div><div className="question-box"><span><CircleHelp size={17}/>{w.question}</span><p>{activeLabLabel.question}</p></div><p className="drawer-help">{language==="ID"?assumptions[lab.id].id:assumptions[lab.id].en}</p></>}
        </div>
      </aside>
      <section className="graph-panel">
        <div className="graph-header"><div><span className="eyebrow">{w.graph}</span><strong>{language==="ID"?"Visualisasi sistem":"System visualization"}</strong></div><div className="graph-tools">
          <label className="object-picker"><span>{language==="ID"?"Objek 1":"Object 1"}</span><select value={selectedObject} onChange={e=>setSelectedObject(e.target.value)}>{objectOptionsFor(lab.id,language).map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{lab.id==="collision"&&<label className="object-picker"><span>{language==="ID"?"Objek 2":"Object 2"}</span><select value={selectedObject2} onChange={e=>setSelectedObject2(e.target.value)}>{objectOptionsFor(lab.id,language).map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
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
        <div className="measurement-area"><div className="measurement-heading"><span>03</span><strong>{w.values}</strong></div><div className="measurement-grid">{metrics.map(([label,value,unit])=><div className="measurement" key={label}><span>{label}</span><strong>{Number.isFinite(value)?value.toFixed(2):"—"} <small>{unit}</small></strong></div>)}</div>
          <div className="live-equation-panel"><div className="live-equation-heading"><span className="ready-dot"/><strong>{language==="ID"?"Persamaan berjalan":"Live equations"}</strong></div>{liveEquations.map((row,index)=><div className="live-equation-row" key={index}><span>{row.title}</span><Equation value={row.formula}/></div>)}</div>
        </div>
        <div className="graph-footer"><span className="ready-dot"/>{w.status}<span className="footer-spacer"/><button onClick={exportCsv}><Download size={16}/>{w.export}</button><button onClick={reset}><RotateCcw size={15}/>{w.resetView}</button>{notice&&<span className="notice"><Check size={15}/>{notice}</span>}</div>
      </section>
    </div>
    <PracticePanel labId={lab.id} language={language}/>
  </main>;
}

function Learn({language,onOpen}:{language:Language;onOpen:(id:LabId)=>void}) {
  const w=words[language];
  return <main className="secondary-page"><div className="secondary-intro"><span className="eyebrow">PHYSIMUS ACADEMY</span><h1>{w.learnTitle}</h1><p>{w.learnText}</p></div>
    <div className="learning-list">{labs.map(lab=><article className="learning-row" key={lab.id}><div><span className="eyebrow">{lab.category}</span><h2>{language==="ID"?lab.title:lab.subtitle}</h2><p>{tLabel(language,lab).description}</p><div className="learning-formula"><Equation value={lab.formula}/></div></div><button className="secondary-button" onClick={()=>onOpen(lab.id)}>{w.experiment}<ArrowRight size={17}/></button></article>)}</div>
  </main>;
}

export default function App() {
  const [page,setPage]=useState<Page>("discover");
  const [language,setLanguage]=useState<Language>("ID");
  const [selectedLab,setSelectedLab]=useState<LabId>("projectile");
  const [theme,setTheme]=useState<Theme>(()=>{try{return localStorage.getItem("physimus-theme")==="dark"?"dark":"light";}catch{return "light";}});
  const [fontScale,setFontScale]=useState<number>(()=>{try{const value=Number(localStorage.getItem("physimus-font-scale"));return Number.isFinite(value)&&value>=.9&&value<=1.2?value:1;}catch{return 1;}});
  const [motionLevel,setMotionLevel]=useState<MotionLevel>(()=>{try{const value=localStorage.getItem("physimus-motion");return value==="low"||value==="high"?value:"medium";}catch{return "medium";}});
  const openLab=(id:LabId)=>{setSelectedLab(id);setPage("laboratory");};
  useEffect(()=>{try{localStorage.setItem("physimus-theme",theme);localStorage.setItem("physimus-font-scale",String(fontScale));localStorage.setItem("physimus-motion",motionLevel);}catch{/* Settings remain active for this session if storage is disabled. */}},[theme,fontScale,motionLevel]);
  return <div className="app-root" data-theme={theme} data-motion={motionLevel} style={{"--font-scale":fontScale} as CSSProperties}>
    <Header page={page} setPage={setPage} language={language} onLanguage={setLanguage} theme={theme} onTheme={setTheme} fontScale={fontScale} onFontScale={setFontScale} motionLevel={motionLevel} onMotionLevel={setMotionLevel}/>
    {page==="discover"&&<Discover language={language} onOpen={openLab}/>}
    {page==="laboratory"&&<Laboratory key={selectedLab} labId={selectedLab} language={language} theme={theme} onBack={()=>setPage("discover")} onChoose={openLab}/>}
    {page==="learn"&&<Learn language={language} onOpen={openLab}/>}
    {page==="sandbox"&&<PhysicsSandbox language={language} theme={theme}/>}
  </div>;
}
