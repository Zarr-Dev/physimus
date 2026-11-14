import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import {
  Activity, ArrowDownRight, ArrowRight, Atom, ChevronDown,
  CircleHelp, Clock3, Globe2, Grid2X2, Maximize2, MoreHorizontal,
  Pause, Play, Plus, RotateCcw, Save, Settings2, Share2,
  SlidersHorizontal, Sparkles, Square, Waves, Zap
} from "lucide-react";

type Page = "home" | "workspace";
type Language = "EN" | "ID";

function Equation({ expression, display = false }: { expression: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(expression, { throwOnError: false, displayMode: display }), [expression, display]);
  return <span className={display ? "equation display-equation" : "equation"} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand">
    <div className="brand-mark"><Atom size={compact ? 19 : 22} strokeWidth={2.1} /></div>
    {!compact && <span>physimus<span className="brand-period">.</span></span>}
  </div>;
}

function Header({ page, setPage, language, setLanguage }: {
  page: Page; setPage: (page: Page) => void; language: Language; setLanguage: (language: Language) => void;
}) {
  return <header className="topbar">
    <button className="brand-button" onClick={() => setPage("home")} aria-label="Physimus home"><Brand /></button>
    <nav className="main-nav" aria-label="Main navigation">
      <button className={page === "home" ? "nav-link active" : "nav-link"} onClick={() => setPage("home")}>{language === "EN" ? "Discover" : "Jelajahi"}</button>
      <button className={page === "workspace" ? "nav-link active" : "nav-link"} onClick={() => setPage("workspace")}>Laboratory</button>
      <button className="nav-link" onClick={() => setPage("home")}>Learn</button>
      <button className="nav-link" onClick={() => setPage("workspace")}>Sandbox <span className="nav-new">BETA</span></button>
    </nav>
    <div className="top-actions">
      <button className="language-button" onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}><Globe2 size={15} /> {language} <ChevronDown size={13} /></button>
      <button className="icon-button theme-button" aria-label="Light theme"><Sparkles size={17} /></button>
      <button className="avatar-button" aria-label="Guest profile">G</button>
    </div>
  </header>;
}

function Hero({ onExplore, language }: { onExplore: () => void; language: Language }) {
  const id = language === "ID";
  return <section className="hero">
    <div className="hero-copy">
      <div className="eyebrow"><span className="eyebrow-dot" /> OPEN PHYSICS LABORATORY</div>
      <h1>{id ? <>Fisika, bukan sekadar<br /><span>untuk dipelajari.</span></> : <>Physics is not just<br /><span>something to learn.</span></>}</h1>
      <p>{id ? "Jelajahi hukum alam semesta. Ubah variabel, jalankan eksperimen, dan temukan jawabannya sendiri." : "Explore the laws of the universe. Change variables, run experiments, and discover the answers yourself."}</p>
      <div className="hero-actions">
        <button className="primary-button" onClick={onExplore}>{id ? "Mulai bereksperimen" : "Start experimenting"} <ArrowRight size={17} /></button>
        <button className="text-button" onClick={onExplore}><Play size={15} /> Explore the laboratory</button>
      </div>
      <div className="hero-proof"><div className="proof-avatars"><span>∑</span><span>π</span><span>λ</span></div><span>Curiosity is the starting point.</span></div>
    </div>
    <div className="hero-art" aria-label="Abstract physics illustration">
      <div className="art-glow" />
      <div className="orbit orbit-one"><i /></div><div className="orbit orbit-two"><i /></div>
      <div className="orbit orbit-three"><i /></div>
      <div className="art-core"><Atom size={62} strokeWidth={1.15} /></div>
      <span className="art-label label-top">MOTION <b>01</b></span>
      <span className="art-label label-right">ENERGY <b>02</b></span>
      <span className="art-label label-bottom">DISCOVERY <b>03</b></span>
      <div className="floating-formula"><Equation expression="E = mc^2" /></div>
      <div className="floating-coordinate"><span>x</span><span>y</span><span>z</span></div>
    </div>
    <div className="hero-index"><span>01 / 03</span><div className="index-line"><i /></div><span>EXPLORE</span></div>
  </section>;
}

const branches = [
  { number: "01", title: "Mechanics", subtitle: "Motion, forces & energy", icon: Activity, color: "blue", topics: "12 topics" },
  { number: "02", title: "Thermodynamics", subtitle: "Heat, work & entropy", icon: Waves, color: "orange", topics: "8 topics" },
  { number: "03", title: "Electromagnetism", subtitle: "Fields, circuits & waves", icon: Zap, color: "purple", topics: "10 topics" },
  { number: "04", title: "Modern physics", subtitle: "Quantum & relativity", icon: Atom, color: "green", topics: "9 topics" },
];

function Home({ onExplore, language }: { onExplore: () => void; language: Language }) {
  return <main>
    <Hero onExplore={onExplore} language={language} />
    <section className="intro-strip">
      <div><span className="section-kicker">A DIFFERENT WAY TO LEARN</span><h2>Curiosity meets <span>physics.</span></h2></div>
      <p>From your first equation to your own virtual experiment. One place to understand, explore, and create.</p>
    </section>
    <section className="branch-section">
      <div className="section-heading"><div><span className="section-kicker">THE KNOWLEDGE LIBRARY</span><h2>Explore the universe.</h2></div><button className="view-all" onClick={onExplore}>Explore all subjects <ArrowRight size={16} /></button></div>
      <div className="branch-grid">
        {branches.map((branch) => {
          const Icon = branch.icon;
          return <button className="branch-card" key={branch.number} onClick={onExplore}>
            <div className="branch-card-top"><span>{branch.number} / PHYSICS</span><Icon className={`branch-icon ${branch.color}`} size={23} /></div>
            <div><h3>{branch.title}</h3><p>{branch.subtitle}</p></div>
            <div className="branch-card-bottom"><span>{branch.topics}</span><ArrowDownRight size={18} /></div>
          </button>;
        })}
      </div>
    </section>
    <section className="lab-promo">
      <div className="lab-promo-copy"><span className="section-kicker">YOUR DIGITAL LABORATORY</span><h2>Don't just read<br />the equation.<br /><span>Make it move.</span></h2><p>Change a parameter. Watch the world respond. Understand the physics behind every movement.</p><button className="primary-button" onClick={onExplore}>Open the laboratory <ArrowRight size={17} /></button></div>
      <div className="promo-visual"><div className="promo-tag"><span className="live-dot" /> LIVE SIMULATION</div><div className="promo-path"><svg viewBox="0 0 520 270" role="img" aria-label="Illustrative projectile trajectory"><path d="M35 226 Q245 -90 485 226" fill="none" stroke="#7bb8f8" strokeWidth="2.5" strokeDasharray="6 7"/><path d="M35 226 L485 226" stroke="#cbd8e8" strokeWidth="1.5"/><circle cx="35" cy="226" r="7" fill="#277de2"/><circle cx="260" cy="74" r="7" fill="#277de2"/><circle cx="485" cy="226" r="7" fill="#277de2"/><path d="M35 226 L105 166" stroke="#f59e0b" strokeWidth="2"/><path d="M105 166 l-13 3 7 10" fill="none" stroke="#f59e0b" strokeWidth="2"/></svg></div><div className="promo-equation"><Equation expression="y(x)=x\tan\theta-\frac{gx^2}{2v_0^2\cos^2\theta}" /></div><div className="promo-stat"><span>INITIAL VELOCITY</span><b>24.0 <small>m/s</small></b></div></div>
    </section>
    <section className="closing-line"><span className="section-kicker">PHYSIMUS PHILOSOPHY</span><h2>Imagine. Experiment. <span>Discover.</span></h2><p>Physics belongs to everyone.</p></section>
  </main>;
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return <label className="parameter">
    <span className="parameter-heading"><span>{label}</span><strong>{value.toFixed(step < 1 ? 1 : 0)} <small>{unit}</small></strong></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    <span className="range-limits"><span>{min}</span><span>{max}</span></span>
  </label>;
}

function Workspace() {
  const [speed, setSpeed] = useState(24);
  const [angle, setAngle] = useState(52);
  const [gravity, setGravity] = useState(9.81);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  const flightTime = (2 * speed * Math.sin(angle * Math.PI / 180)) / gravity;
  const range = (speed * speed * Math.sin(2 * angle * Math.PI / 180)) / gravity;
  const maxHeight = (speed * speed * Math.sin(angle * Math.PI / 180) ** 2) / (2 * gravity);
  const maxTime = Math.max(flightTime, 0.1);
  const progress = Math.min(elapsed / maxTime, 1);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      if (!previous) previous = now;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const next = elapsedRef.current + delta;
      elapsedRef.current = next;
      if (next >= maxTime) {
        setElapsed(maxTime);
        setRunning(false);
        return;
      }
      setElapsed(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, maxTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fbfdff";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#eaf0f7";
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y < height; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
    const pad = 42;
    const scaleX = (width - 2 * pad) / Math.max(range, 1);
    const scaleY = (height - 2 * pad) / Math.max(maxHeight * 1.25, 1);
    const originY = height - pad;
    const pointAt = (t: number) => ({ x: pad + speed * Math.cos(angle * Math.PI / 180) * t * scaleX, y: originY - (speed * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t) * scaleY });
    context.strokeStyle = "#9ac6f5";
    context.lineWidth = 2.5;
    context.setLineDash([6, 6]);
    context.beginPath();
    for (let i = 0; i <= 100; i++) {
      const point = pointAt(flightTime * i / 100);
      if (i === 0) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "#8fa4bb";
    context.lineWidth = 1.5;
    context.beginPath(); context.moveTo(pad, originY); context.lineTo(width - pad / 2, originY); context.stroke();
    const current = pointAt(Math.min(elapsed, flightTime));
    context.fillStyle = "#277de2";
    context.shadowColor = "rgba(39,125,226,.25)";
    context.shadowBlur = 12;
    context.beginPath(); context.arc(current.x, current.y, 7, 0, Math.PI * 2); context.fill();
    context.shadowBlur = 0;
    context.fillStyle = "#71839a";
    context.font = "11px Inter";
    context.fillText("x (m)", width - 75, originY + 24);
    context.fillText("y (m)", 10, 18);
  }, [speed, angle, gravity, elapsed, flightTime, range, maxHeight]);

  const reset = () => { setRunning(false); elapsedRef.current = 0; setElapsed(0); };
  return <main className="workspace-page">
    <div className="workspace-heading"><div><div className="breadcrumb">LABORATORY <span>/</span> MECHANICS <span>/</span> PROJECTILE MOTION</div><h1>Projectile motion <span className="workspace-beta">INTERACTIVE</span></h1><p>Explore how launch velocity and angle shape a projectile's trajectory.</p></div><div className="workspace-heading-actions"><button className="soft-button"><Save size={15}/> Save</button><button className="soft-button"><Share2 size={15}/> Share</button><button className="icon-button"><MoreHorizontal size={18}/></button></div></div>
    <div className="workspace-toolbar"><div className="toolbar-left"><span className="status-dot" /> MODEL: IDEAL PROJECTILE <span className="toolbar-divider" /> SI UNITS</div><div className="toolbar-right"><button className="toolbar-button"><Grid2X2 size={15}/> Grid</button><button className="toolbar-button"><Maximize2 size={15}/> Expand</button><button className="toolbar-button"><Settings2 size={15}/> Settings</button></div></div>
    <div className="workspace-grid">
      <aside className="workspace-panel equation-panel">
        <div className="panel-heading"><div><span className="panel-kicker">01 / MODEL</span><h3>Equations</h3></div><button className="panel-icon"><Plus size={16}/></button></div>
        <div className="equation-card"><span className="equation-label">HORIZONTAL POSITION</span><Equation expression="x(t)=v_0\cos(\theta)t" display /></div>
        <div className="equation-card"><span className="equation-label">VERTICAL POSITION</span><Equation expression="y(t)=v_0\sin(\theta)t-\frac12gt^2" display /></div>
        <div className="equation-card muted-equation"><span className="equation-label">ACCELERATION</span><Equation expression="a_y=-g" display /></div>
        <div className="panel-heading parameter-heading-title"><div><span className="panel-kicker">02 / INPUT</span><h3>Parameters</h3></div><SlidersHorizontal size={16} className="muted-icon"/></div>
        <div className="parameter-list">
          <Slider label="Initial velocity" value={speed} min={5} max={50} step={1} unit="m/s" onChange={(v) => {setSpeed(v); reset();}} />
          <Slider label="Launch angle" value={angle} min={5} max={85} step={1} unit="°" onChange={(v) => {setAngle(v); reset();}} />
          <Slider label="Gravity" value={gravity} min={1} max={20} step={0.1} unit="m/s²" onChange={(v) => {setGravity(v); reset();}} />
        </div>
        <div className="assumption-note"><CircleHelp size={15}/><span>Ideal model: air resistance is ignored and the gravitational field is uniform.</span></div>
      </aside>
      <section className="workspace-center">
        <div className="canvas-card">
          <div className="canvas-header"><div><span className="panel-kicker">03 / SIMULATION</span><h3>Motion canvas</h3></div><span className="canvas-live"><i/> 2D VIEW</span></div>
          <canvas ref={canvasRef} width={760} height={390} className="simulation-canvas" />
          <div className="simulation-controls"><div className="transport-controls"><button className="transport-main" onClick={() => {if (elapsed >= flightTime) { elapsedRef.current = 0; setElapsed(0); } setRunning(!running);}}>{running ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}</button><button className="transport-secondary" onClick={reset}><RotateCcw size={16}/></button><button className="transport-secondary" onClick={() => {setRunning(false);elapsedRef.current = flightTime;setElapsed(flightTime);}}><Square size={14}/></button></div><div className="timeline"><div className="timeline-label"><span>SIMULATION TIME</span><b>{elapsed.toFixed(2)} s</b></div><div className="timeline-track"><i style={{width: `${progress * 100}%`}}/></div></div><span className="speed-label"><Clock3 size={14}/> 1×</span></div>
        </div>
        <div className="data-card"><div className="panel-heading"><div><span className="panel-kicker">04 / LIVE OUTPUT</span><h3>Measurements</h3></div><span className="unit-pill">SI</span></div><div className="metrics-grid"><div className="metric"><span>MAX. HEIGHT</span><strong>{maxHeight.toFixed(2)} <small>m</small></strong></div><div className="metric"><span>RANGE</span><strong>{range.toFixed(2)} <small>m</small></strong></div><div className="metric"><span>FLIGHT TIME</span><strong>{flightTime.toFixed(2)} <small>s</small></strong></div><div className="metric"><span>HORIZONTAL SPEED</span><strong>{(speed * Math.cos(angle * Math.PI / 180)).toFixed(2)} <small>m/s</small></strong></div></div></div>
      </section>
      <aside className="workspace-panel analysis-panel">
        <div className="panel-heading"><div><span className="panel-kicker">05 / ANALYSIS</span><h3>Trajectory data</h3></div><button className="panel-icon"><MoreHorizontal size={16}/></button></div>
        <div className="mini-chart"><div className="chart-labels"><span>y (m)</span><span>THEORETICAL</span></div><svg viewBox="0 0 280 190" role="img" aria-label="Theoretical projectile trajectory graph"><g stroke="#edf1f6" strokeWidth="1">{[25,60,95,130,165].map(y=><line key={y} x1="32" y1={y} x2="270" y2={y}/>)}{[32,90,148,206,264].map(x=><line key={x} x1={x} y1="15" x2={x} y2="165"/>)}</g><path d={`M32 165 Q148 ${Math.max(20,165-maxHeight*2.5)} 264 165`} fill="none" stroke="#398ce5" strokeWidth="2.5" strokeLinecap="round"/><path d="M32 165 L270 165" stroke="#9aaabd"/><text x="250" y="183" fontSize="10" fill="#8493a5">x</text></svg></div>
        <div className="analysis-equation"><span>THEORETICAL RANGE</span><Equation expression="R=\frac{v_0^2\sin 2\theta}{g}" display/></div>
        <div className="analysis-equation"><span>MAXIMUM HEIGHT</span><Equation expression="H=\frac{v_0^2\sin^2\theta}{2g}" display/></div>
        <div className="insight-box"><Sparkles size={15}/><div><b>Did you know?</b><p>For a fixed launch speed on level ground, the ideal projectile has its maximum range at 45°.</p></div></div>
        <button className="export-button"><ArrowDownRight size={15}/> Export data <span>CSV</span></button>
      </aside>
    </div>
    <div className="workspace-footnote"><span><span className="status-dot"/> MODEL READY</span><span>Analytical solution · Uniform gravity · No air resistance</span><span>PHYSIMUS CORE PREVIEW</span></div>
  </main>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [language, setLanguage] = useState<Language>("EN");
  return <div className="app-shell">
    <Header page={page} setPage={setPage} language={language} setLanguage={setLanguage}/>
    {page === "home" ? <Home onExplore={() => setPage("workspace")} language={language}/> : <Workspace />}
    <footer className="site-footer"><Brand /><span>Physics Laboratory for Anyone.</span><span>© 2026 Physimus</span></footer>
  </div>;
}