import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import katex from "katex";
import {
  Activity, ArrowRight, Atom, BookOpen, Check, ChevronDown, CircleHelp,
  Download, Eye, EyeOff, FlaskConical, Globe2, Grid3X3,
  Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Upload, Waves, Zap
} from "lucide-react";

type Page = "home" | "workspace";
type Language = "EN" | "ID";
type GraphMode = "trajectory" | "time";

const copy = {
  EN: {
    discover: "Discover", laboratory: "Laboratory", learn: "Learn", sandbox: "Sandbox",
    kicker: "AN OPEN PHYSICS LABORATORY", headlineA: "Make physics", headlineB: "make sense.",
    heroText: "A calm space to explore the laws of nature. Change a variable, see what happens, and understand why.",
    start: "Open the laboratory", explore: "Explore the workspace",
    learnTitle: "Understand the idea.", learnText: "Build intuition before diving into equations.",
    experimentTitle: "Change the world.", experimentText: "Adjust conditions and watch a physical system respond.",
    createTitle: "Make it yours.", createText: "Build, save, and revisit your own experiments.",
    featured: "START WITH MECHANICS", featuredTitle: "Projectile motion", featuredText: "Explore how launch speed, angle, and gravity shape a trajectory.",
    openExperiment: "Try the experiment", footer: "Physics Laboratory for Anyone.",
    language: "LANGUAGE", back: "Discover", lab: "LABORATORY", mechanics: "MECHANICS",
    motionTitle: "Projectile motion", description: "Explore the relationship between launch conditions and motion.",
    equations: "Expressions", parameters: "Parameters", model: "IDEAL MODEL",
    horizontal: "Horizontal position", vertical: "Vertical position", acceleration: "Vertical acceleration",
    initialSpeed: "Initial speed", launchAngle: "Launch angle", gravity: "Gravity",
    trajectory: "Trajectory", positionTime: "Position · time", grid: "Grid", vectors: "Vectors",
    trail: "Trail", simulation: "SIMULATION", play: "Play", pause: "Pause", reset: "Reset",
    time: "TIME", measurements: "Live values", range: "Range", maxHeight: "Max height",
    flightTime: "Flight time", positionX: "Position x", positionY: "Position y",
    velocity: "Speed", exportCsv: "Export CSV", saveProject: "Save project",
    loadProject: "Open project", saved: "Project downloaded", imported: "Experiment loaded",
    importError: "Could not read this project file", assumption: "Idealized model: level launch and landing, uniform gravity, no air resistance.",
    graphX: "Horizontal position", graphY: "Vertical position", timeAxis: "Time (s)",
    distanceAxis: "Position (m)", guest: "Local workspace", ready: "READY",
    help: "Change a slider to explore the model. The graph and measurements update together.",
    show: "Show", hide: "Hide", resetView: "Reset experiment"
  },
  ID: {
    discover: "Jelajahi", laboratory: "Laboratorium", learn: "Belajar", sandbox: "Sandbox",
    kicker: "LABORATORIUM FISIKA TERBUKA", headlineA: "Buat Fisika", headlineB: "lebih masuk akal.",
    heroText: "Ruang untuk menjelajahi hukum alam. Ubah variabel, amati hasilnya, lalu pahami mengapa itu terjadi.",
    start: "Buka laboratorium", explore: "Jelajahi workspace",
    learnTitle: "Pahami konsepnya.", learnText: "Bangun intuisi sebelum menyelami persamaan.",
    experimentTitle: "Ubah kondisinya.", experimentText: "Atur parameter dan amati respons sistem Fisika.",
    createTitle: "Buat eksperimenmu.", createText: "Rancang, simpan, dan buka kembali eksperimen sendiri.",
    featured: "MULAI DARI MEKANIKA", featuredTitle: "Gerak parabola", featuredText: "Pelajari pengaruh kecepatan awal, sudut, dan gravitasi terhadap lintasan.",
    openExperiment: "Coba eksperimen", footer: "Laboratorium Fisika untuk Semua.",
    language: "BAHASA", back: "Jelajahi", lab: "LABORATORIUM", mechanics: "MEKANIKA",
    motionTitle: "Gerak parabola", description: "Jelajahi hubungan kondisi awal dengan gerak benda.",
    equations: "Persamaan", parameters: "Parameter", model: "MODEL IDEAL",
    horizontal: "Posisi horizontal", vertical: "Posisi vertikal", acceleration: "Percepatan vertikal",
    initialSpeed: "Kecepatan awal", launchAngle: "Sudut peluncuran", gravity: "Gravitasi",
    trajectory: "Lintasan", positionTime: "Posisi · waktu", grid: "Grid", vectors: "Vektor",
    trail: "Jejak", simulation: "SIMULASI", play: "Mulai", pause: "Jeda", reset: "Ulangi",
    time: "WAKTU", measurements: "Nilai saat ini", range: "Jangkauan", maxHeight: "Tinggi maks.",
    flightTime: "Waktu tempuh", positionX: "Posisi x", positionY: "Posisi y",
    velocity: "Kelajuan", exportCsv: "Ekspor CSV", saveProject: "Simpan proyek",
    loadProject: "Buka proyek", saved: "Proyek berhasil diunduh", imported: "Eksperimen berhasil dimuat",
    importError: "File proyek tidak dapat dibaca", assumption: "Model ideal: titik awal dan akhir setinggi sama, gravitasi seragam, tanpa hambatan udara.",
    graphX: "Posisi horizontal", graphY: "Posisi vertikal", timeAxis: "Waktu (s)",
    distanceAxis: "Posisi (m)", guest: "Workspace lokal", ready: "SIAP",
    help: "Ubah slider untuk menjelajahi model. Grafik dan pengukuran akan diperbarui bersama.",
    show: "Tampilkan", hide: "Sembunyikan", resetView: "Ulangi eksperimen"
  }
};

function Equation({ expression, display = false }: { expression: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(expression, { throwOnError: false, displayMode: display }), [expression, display]);
  return <span className={display ? "equation equation-display" : "equation"} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Brand() {
  return <div className="brand">
    <span className="brand-symbol"><Atom size={19} strokeWidth={1.9} /></span>
    <span>physimus<span className="brand-dot">.</span></span>
  </div>;
}

function LanguageSwitch({ language, setLanguage }: { language: Language; setLanguage: (value: Language) => void }) {
  return <div className="language-switch" aria-label="Choose language">
    <Globe2 size={14} />
    <button className={language === "EN" ? "selected" : ""} onClick={() => setLanguage("EN")} aria-pressed={language === "EN"}>EN</button>
    <span />
    <button className={language === "ID" ? "selected" : ""} onClick={() => setLanguage("ID")} aria-pressed={language === "ID"}>ID</button>
  </div>;
}

function Header({ page, setPage, language, setLanguage }: {
  page: Page; setPage: (value: Page) => void; language: Language; setLanguage: (value: Language) => void;
}) {
  const t = copy[language];
  return <header className="site-header">
    <button className="brand-button" onClick={() => setPage("home")} aria-label="Physimus home"><Brand /></button>
    <nav className="site-nav" aria-label="Main navigation">
      <button className={page === "home" ? "nav-item active" : "nav-item"} onClick={() => setPage("home")}>{t.discover}</button>
      <button className={page === "workspace" ? "nav-item active" : "nav-item"} onClick={() => setPage("workspace")}>{t.laboratory}</button>
      <button className="nav-item" onClick={() => setPage("home")}>{t.learn}</button>
      <button className="nav-item nav-sandbox" onClick={() => setPage("workspace")}>{t.sandbox}</button>
    </nav>
    <div className="header-meta"><span className="local-indicator"><i /> {t.guest}</span><button className="header-language" onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}>{language} <ChevronDown size={13} /></button></div>
  </header>;
}

function Hero({ language, setLanguage, onOpen }: {
  language: Language; setLanguage: (value: Language) => void; onOpen: () => void;
}) {
  const t = copy[language];
  return <section className="hero-section">
    <div className="hero-copy">
      <div className="hero-meta">
        <span className="hero-kicker"><i /> {t.kicker}</span>
        <LanguageSwitch language={language} setLanguage={setLanguage} />
      </div>
      <h1>{t.headlineA}<br /><span>{t.headlineB}</span></h1>
      <p className="hero-description">{t.heroText}</p>
      <button className="button-primary" onClick={onOpen}>{t.start}<ArrowRight size={16} /></button>
      <div className="hero-caption"><span>01</span><span className="caption-line" /><span>LEARN · EXPERIMENT · DISCOVER</span></div>
    </div>
    <div className="hero-visual">
      <div className="visual-topline"><span>MECHANICS / 01</span><span>IDEAL MOTION</span></div>
      <svg className="hero-trajectory" viewBox="0 0 600 390" role="img" aria-label="Illustration of a projectile trajectory">
        <defs>
          <linearGradient id="trajectoryStroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#4d9bf2" /><stop offset="100%" stopColor="#8fc4f7" />
          </linearGradient>
          <radialGradient id="trajectoryGlow"><stop stopColor="#7bb8f2" stopOpacity=".20"/><stop offset="1" stopColor="#7bb8f2" stopOpacity="0"/></radialGradient>
        </defs>
        <circle cx="315" cy="180" r="178" fill="url(#trajectoryGlow)" />
        <g className="hero-grid-lines">
          <path d="M55 70H560M55 130H560M55 190H560M55 250H560M55 310H560" />
          <path d="M115 35V330M215 35V330M315 35V330M415 35V330M515 35V330" />
        </g>
        <path d="M55 310H558" className="hero-axis"/>
        <path d="M55 310 Q306 -150 558 310" fill="none" stroke="url(#trajectoryStroke)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 310 Q180 82 306 75" fill="none" stroke="#a8ccef" strokeWidth="1.5" strokeDasharray="5 7"/>
        <circle cx="55" cy="310" r="6" fill="#347fd5"/>
        <circle cx="306" cy="75" r="6" fill="#347fd5"/>
        <circle cx="558" cy="310" r="6" fill="#347fd5"/>
        <path d="M55 310L123 228" stroke="#e7a34b" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M123 228l-3 13m3-13l-13 4" stroke="#e7a34b" strokeWidth="2" strokeLinecap="round"/>
        <text x="68" y="342" className="hero-graph-label">START</text>
        <text x="528" y="342" className="hero-graph-label">RANGE</text>
        <text x="320" y="60" className="hero-graph-label">APEX</text>
      </svg>
      <div className="hero-formula"><span>THE EQUATION</span><Equation expression="y(x)=x\tan\theta-\frac{gx^2}{2v_0^2\cos^2\theta}" /></div>
      <div className="hero-visual-note"><Sparkles size={14} /><span>One model. Infinite questions.</span></div>
    </div>
  </section>;
}

function Home({ language, setLanguage, onOpen }: {
  language: Language; setLanguage: (value: Language) => void; onOpen: () => void;
}) {
  const t = copy[language];
  return <main className="home-page">
    <Hero language={language} setLanguage={setLanguage} onOpen={onOpen} />
    <section className="principles-section">
      <div className="principles-heading">
        <span className="section-eyebrow">THE PHYSIMUS APPROACH</span>
        <h2>From curiosity<br />to understanding.</h2>
      </div>
      <div className="principle-list">
        <article className="principle-row"><span className="principle-number">01</span><BookOpen size={19}/><div><h3>{t.learnTitle}</h3><p>{t.learnText}</p></div></article>
        <article className="principle-row"><span className="principle-number">02</span><FlaskConical size={19}/><div><h3>{t.experimentTitle}</h3><p>{t.experimentText}</p></div></article>
        <article className="principle-row"><span className="principle-number">03</span><Atom size={19}/><div><h3>{t.createTitle}</h3><p>{t.createText}</p></div></article>
      </div>
    </section>
    <section className="featured-experiment">
      <div className="featured-copy">
        <span className="section-eyebrow">{t.featured}</span>
        <h2>{t.featuredTitle}</h2>
        <p>{t.featuredText}</p>
        <button className="text-link" onClick={onOpen}>{t.openExperiment}<ArrowRight size={16}/></button>
      </div>
      <div className="featured-preview">
        <div className="preview-toolbar"><span><i/> PHYSIMUS / MECHANICS</span><span>PREVIEW</span></div>
        <div className="preview-graph">
          <svg viewBox="0 0 540 230" role="img" aria-label="Projectile graph preview">
            <g className="preview-grid">{[35,80,125,170,215].map(y => <line key={y} x1="18" y1={y} x2="522" y2={y}/>)}{[40,140,240,340,440,520].map(x => <line key={x} x1={x} y1="12" x2={x} y2="218"/>)}</g>
            <path d="M25 205H525" className="preview-axis"/>
            <path d="M25 205 Q275 -165 525 205" className="preview-path"/>
            <circle cx="25" cy="205" r="5" className="preview-dot"/><circle cx="275" cy="32" r="5" className="preview-dot"/>
          </svg>
        </div>
        <div className="preview-equation"><Equation expression="x(t)=v_0\cos\theta\;t" /><Equation expression="y(t)=v_0\sin\theta\;t-\frac12gt^2" /></div>
      </div>
    </section>
    <footer className="home-footer"><Brand/><span>{t.footer}</span><span>IMAGINE. EXPERIMENT. DISCOVER.</span></footer>
  </main>;
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void;
}) {
  return <label className="parameter-control">
    <span className="parameter-line"><span>{label}</span><strong>{value.toFixed(step < 1 ? 2 : 0)} <small>{unit}</small></strong></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} />
    <span className="parameter-limits"><span>{min}</span><span>{max}</span></span>
  </label>;
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 8 * Math.cos(angle - Math.PI / 6), y2 - 8 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - 8 * Math.cos(angle + Math.PI / 6), y2 - 8 * Math.sin(angle + Math.PI / 6));
  ctx.closePath(); ctx.fill();
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Workspace({ language, setLanguage, onBack }: {
  language: Language; setLanguage: (value: Language) => void; onBack: () => void;
}) {
  const t = copy[language];
  const [speed, setSpeed] = useState(24);
  const [angle, setAngle] = useState(52);
  const [gravity, setGravity] = useState(9.81);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [playback, setPlayback] = useState(1);
  const [mode, setMode] = useState<GraphMode>("trajectory");
  const [showGrid, setShowGrid] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showHorizontal, setShowHorizontal] = useState(true);
  const [showVertical, setShowVertical] = useState(true);
  const [notice, setNotice] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const radians = angle * Math.PI / 180;
  const vx = speed * Math.cos(radians);
  const vy0 = speed * Math.sin(radians);
  const flightTime = 2 * vy0 / gravity;
  const range = vx * flightTime;
  const maxHeight = vy0 * vy0 / (2 * gravity);
  const elapsedSafe = Math.min(elapsed, flightTime);
  const x = vx * elapsedSafe;
  const y = Math.max(0, vy0 * elapsedSafe - .5 * gravity * elapsedSafe * elapsedSafe);
  const currentVy = vy0 - gravity * elapsedSafe;
  const currentSpeed = Math.hypot(vx, currentVy);
  const progress = flightTime > 0 ? elapsedSafe / flightTime : 0;

  const reset = () => {
    setRunning(false); elapsedRef.current = 0; setElapsed(0);
  };

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const delta = Math.min((now - last) / 1000, .05) * playback;
      last = now;
      const next = elapsedRef.current + delta;
      elapsedRef.current = Math.min(next, flightTime);
      setElapsed(elapsedRef.current);
      if (next >= flightTime) { setRunning(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, flightTime, playback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(rect.width * dpr);
      const pixelHeight = Math.round(rect.height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth; canvas.height = pixelHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const width = rect.width; const height = rect.height;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#fbfdff"; context.fillRect(0, 0, width, height);

      const left = 58, right = 26, top = 25, bottom = 48;
      const plotWidth = width - left - right;
      const plotHeight = height - top - bottom;
      const xMax = Math.max(range * 1.12, 1);
      const yMax = Math.max(maxHeight * 1.3, 1);
      const xScale = plotWidth / xMax;
      const yScale = plotHeight / yMax;
      const px = (value: number) => left + value * xScale;
      const py = (value: number) => top + plotHeight - value * yScale;
      const axis = "#8394a8";
      const grid = "#eaf0f6";
      const tickText = "#8392a5";

      if (showGrid) {
        context.strokeStyle = grid; context.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const gx = left + plotWidth * i / 5;
          const gy = top + plotHeight * i / 5;
          context.beginPath(); context.moveTo(gx, top); context.lineTo(gx, top + plotHeight); context.stroke();
          context.beginPath(); context.moveTo(left, gy); context.lineTo(left + plotWidth, gy); context.stroke();
        }
      }
      context.strokeStyle = axis; context.lineWidth = 1.2;
      context.beginPath(); context.moveTo(left, top); context.lineTo(left, top + plotHeight); context.lineTo(left + plotWidth, top + plotHeight); context.stroke();
      context.fillStyle = tickText; context.font = "10px Inter";
      context.textAlign = "center";
      for (let i = 0; i <= 5; i++) {
        const value = xMax * i / 5;
        context.fillText(value.toFixed(1), left + plotWidth * i / 5, top + plotHeight + 17);
      }
      context.textAlign = "right";
      for (let i = 0; i <= 5; i++) {
        const value = yMax * i / 5;
        context.fillText(value.toFixed(1), left - 9, top + plotHeight - plotHeight * i / 5 + 3);
      }
      context.textAlign = "center";
      context.fillText(mode === "trajectory" ? "x (m)" : t.timeAxis, left + plotWidth / 2, height - 8);
      context.save(); context.translate(15, top + plotHeight / 2); context.rotate(-Math.PI / 2);
      context.fillText(mode === "trajectory" ? "y (m)" : t.distanceAxis, 0, 0); context.restore();

      if (mode === "trajectory") {
        const trajectoryPoint = (time: number) => ({ x: px(vx * time), y: py(Math.max(0, vy0 * time - .5 * gravity * time * time)) });
        context.beginPath();
        for (let i = 0; i <= 180; i++) {
          const p = trajectoryPoint(flightTime * i / 180);
          if (i === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
        }
        context.strokeStyle = "#a9c9eb"; context.lineWidth = 2; context.setLineDash([5, 6]); context.stroke(); context.setLineDash([]);

        if (showTrail && elapsedSafe > 0) {
          context.beginPath();
          for (let i = 0; i <= 100; i++) {
            const p = trajectoryPoint(elapsedSafe * i / 100);
            if (i === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
          }
          context.strokeStyle = "#347fd5"; context.lineWidth = 3; context.lineCap = "round"; context.stroke();
        }
        const currentPoint = trajectoryPoint(elapsedSafe);
        if (showVectors) {
          const vectorTime = .52;
          const endX = currentPoint.x + vx * vectorTime * xScale;
          const endY = currentPoint.y - currentVy * vectorTime * yScale;
          drawArrow(context, currentPoint.x, currentPoint.y, endX, currentPoint.y, "#e7a34b");
          drawArrow(context, currentPoint.x, currentPoint.y, currentPoint.x, endY, "#57ad8d");
        }
        context.beginPath(); context.arc(currentPoint.x, currentPoint.y, 7, 0, Math.PI * 2);
        context.fillStyle = "#347fd5"; context.shadowColor = "#347fd544"; context.shadowBlur = 12; context.fill(); context.shadowBlur = 0;
        context.beginPath(); context.arc(currentPoint.x, currentPoint.y, 2.3, 0, Math.PI * 2); context.fillStyle = "#fff"; context.fill();
      } else {
        const drawLine = (fn: (time: number) => number, color: string, visible: boolean) => {
          if (!visible) return;
          context.beginPath();
          for (let i = 0; i <= 180; i++) {
            const time = flightTime * i / 180;
            const xx = left + plotWidth * time / flightTime;
            const yy = py(Math.max(0, fn(time)));
            if (i === 0) context.moveTo(xx, yy); else context.lineTo(xx, yy);
          }
          context.strokeStyle = color; context.lineWidth = 2.5; context.lineCap = "round"; context.stroke();
        };
        drawLine(time => vx * time, "#347fd5", showHorizontal);
        drawLine(time => vy0 * time - .5 * gravity * time * time, "#57ad8d", showVertical);
        const cursorX = left + plotWidth * progress;
        context.strokeStyle = "#e7a34b"; context.setLineDash([4, 4]); context.beginPath();
        context.moveTo(cursorX, top); context.lineTo(cursorX, top + plotHeight); context.stroke(); context.setLineDash([]);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [angle, elapsedSafe, flightTime, gravity, maxHeight, mode, range, showGrid, showHorizontal, showTrail, showVectors, showVertical, t.distanceAxis, t.timeAxis, vx, vy0]);

  const startPause = () => {
    if (running) { setRunning(false); return; }
    if (elapsedRef.current >= flightTime) { elapsedRef.current = 0; setElapsed(0); }
    setRunning(true);
  };

  const seek = (value: number) => {
    const time = Math.max(0, Math.min(flightTime, value));
    elapsedRef.current = time; setElapsed(time);
    if (time >= flightTime) setRunning(false);
  };

  const exportCsv = () => {
    const rows = ["time_s,x_m,y_m,vx_m_s,vy_m_s,speed_m_s"];
    for (let i = 0; i <= 100; i++) {
      const time = flightTime * i / 100;
      const posX = vx * time;
      const posY = Math.max(0, vy0 * time - .5 * gravity * time * time);
      const velY = vy0 - gravity * time;
      rows.push([time, posX, posY, vx, velY, Math.hypot(vx, velY)].map(value => value.toFixed(6)).join(","));
    }
    downloadFile("physimus-projectile-data.csv", rows.join("\n"), "text/csv;charset=utf-8");
    setNotice("CSV exported");
  };

  const saveProject = () => {
    const project = {
      schema: "physimus.projectile.v1",
      title: "Projectile motion",
      parameters: { initialSpeed: speed, launchAngle: angle, gravity },
      view: { mode, showGrid, showVectors, showTrail, showHorizontal, showVertical }
    };
    downloadFile("physimus-projectile.physimus.json", JSON.stringify(project, null, 2), "application/json");
    setNotice(t.saved);
  };

  const loadProject = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          schema?: string;
          parameters?: { initialSpeed?: number; launchAngle?: number; gravity?: number };
          view?: { mode?: GraphMode; showGrid?: boolean; showVectors?: boolean; showTrail?: boolean; showHorizontal?: boolean; showVertical?: boolean };
        };
        if (data.schema !== "physimus.projectile.v1" || !data.parameters) throw new Error("Invalid project");
        const clamp = (value: unknown, min: number, max: number, fallback: number) =>
          typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
        setSpeed(clamp(data.parameters.initialSpeed, 5, 50, 24));
        setAngle(clamp(data.parameters.launchAngle, 5, 85, 52));
        setGravity(clamp(data.parameters.gravity, 1, 20, 9.81));
        if (data.view) {
          setMode(data.view.mode === "time" ? "time" : "trajectory");
          setShowGrid(data.view.showGrid !== false);
          setShowVectors(data.view.showVectors !== false);
          setShowTrail(data.view.showTrail !== false);
          setShowHorizontal(data.view.showHorizontal !== false);
          setShowVertical(data.view.showVertical !== false);
        }
        reset(); setNotice(t.imported);
      } catch {
        setNotice(t.importError);
      }
      input.value = "";
    };
    reader.readAsText(file);
  };

  return <main className="workspace">
    <div className="workspace-topline">
      <div className="workspace-title-group">
        <button className="back-button" onClick={onBack}>PHYSIMUS <span>/</span> {t.lab}</button>
        <h1>{t.motionTitle}<span className="model-tag">{t.model}</span></h1>
        <p>{t.description}</p>
      </div>
      <div className="workspace-actions">
        <LanguageSwitch language={language} setLanguage={setLanguage} />
        <button className="tool-button" onClick={() => fileInputRef.current?.click()}><Upload size={15}/><span>{t.loadProject}</span></button>
        <button className="tool-button" onClick={saveProject}><Download size={15}/><span>{t.saveProject}</span></button>
        <input ref={fileInputRef} className="visually-hidden" type="file" accept=".json,.physimus.json,application/json" onChange={loadProject}/>
      </div>
    </div>

    <div className="studio">
      <aside className="expression-panel">
        <div className="panel-section-heading"><span>01</span><h2>{t.equations}</h2><button className="panel-menu" aria-label="Expression settings"><SlidersHorizontal size={15}/></button></div>
        <div className="expression-row">
          <button className={showHorizontal ? "expression-toggle blue" : "expression-toggle off"} onClick={() => setShowHorizontal(!showHorizontal)} aria-label={showHorizontal ? t.hide : t.show}>{showHorizontal ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
          <div className="expression-content"><span>{t.horizontal}</span><Equation expression="x(t)=v_0\cos(\theta)t"/></div>
        </div>
        <div className="expression-row">
          <button className={showVertical ? "expression-toggle green" : "expression-toggle off"} onClick={() => setShowVertical(!showVertical)} aria-label={showVertical ? t.hide : t.show}>{showVertical ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
          <div className="expression-content"><span>{t.vertical}</span><Equation expression="y(t)=v_0\sin(\theta)t-\frac12gt^2"/></div>
        </div>
        <div className="expression-row expression-static">
          <span className="expression-color amber">ƒ</span>
          <div className="expression-content"><span>{t.acceleration}</span><Equation expression="a_y=-g"/></div>
        </div>

        <div className="panel-section-heading parameter-heading"><span>02</span><h2>{t.parameters}</h2><SlidersHorizontal size={15}/></div>
        <div className="parameter-stack">
          <Slider label={t.initialSpeed} value={speed} min={5} max={50} step={1} unit="m/s" onChange={value => {setSpeed(value); reset();}}/>
          <Slider label={t.launchAngle} value={angle} min={5} max={85} step={1} unit="°" onChange={value => {setAngle(value); reset();}}/>
          <Slider label={t.gravity} value={gravity} min={1} max={20} step={.01} unit="m/s²" onChange={value => {setGravity(value); reset();}}/>
        </div>
        <div className="assumption"><CircleHelp size={14}/><span>{t.assumption}</span></div>
        <div className="panel-help">{t.help}</div>
      </aside>

      <section className="graph-workspace">
        <div className="graph-toolbar">
          <div className="graph-mode-switch">
            <button className={mode === "trajectory" ? "active" : ""} onClick={() => setMode("trajectory")}>{t.trajectory}</button>
            <button className={mode === "time" ? "active" : ""} onClick={() => setMode("time")}>{t.positionTime}</button>
          </div>
          <div className="graph-tools">
            <button className={showGrid ? "graph-tool selected" : "graph-tool"} onClick={() => setShowGrid(!showGrid)} title={t.grid}><Grid3X3 size={15}/><span>{t.grid}</span></button>
            <button className={showVectors ? "graph-tool selected" : "graph-tool"} onClick={() => setShowVectors(!showVectors)} title={t.vectors}><Activity size={15}/><span>{t.vectors}</span></button>
            <button className={showTrail ? "graph-tool selected" : "graph-tool"} onClick={() => setShowTrail(!showTrail)} title={t.trail}><Waves size={15}/><span>{t.trail}</span></button>
          </div>
        </div>
        <div className="graph-canvas-wrap">
          <canvas ref={canvasRef} className="graph-canvas" aria-label={mode === "trajectory" ? "Projectile trajectory graph" : "Position versus time graph"}/>
          <div className="graph-overlay-label">{mode === "trajectory" ? "x–y PLANE" : "TIME SERIES"} <span>· SI</span></div>
          {mode === "trajectory" && showVectors && <div className="vector-legend"><span><i className="legend-x"/>vₓ</span><span><i className="legend-y"/>vᵧ</span></div>}
        </div>
        <div className="transport-bar">
          <div className="transport-buttons">
            <button className="play-button" onClick={startPause} aria-label={running ? t.pause : t.play}>{running ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}</button>
            <button className="reset-button" onClick={reset} aria-label={t.reset}><RotateCcw size={15}/></button>
          </div>
          <div className="timeline-control">
            <div className="timeline-meta"><span>{t.time}</span><strong>{elapsedSafe.toFixed(2)} <small>s</small></strong><span className="timeline-total">/ {flightTime.toFixed(2)} s</span></div>
            <input type="range" min={0} max={flightTime} step={Math.max(flightTime / 500, .001)} value={elapsedSafe} onChange={event => seek(Number(event.target.value))}/>
          </div>
          <div className="speed-control" aria-label="Playback speed">
            {[.5, 1, 2].map(value => <button key={value} className={playback === value ? "active" : ""} onClick={() => setPlayback(value)}>{value}×</button>)}
          </div>
        </div>
        <div className="readout-strip">
          <div className="readout-heading"><span>03</span><b>{t.measurements}</b></div>
          <div className="readout"><span>{t.positionX}</span><strong>{x.toFixed(2)} <small>m</small></strong></div>
          <div className="readout"><span>{t.positionY}</span><strong>{y.toFixed(2)} <small>m</small></strong></div>
          <div className="readout"><span>{t.velocity}</span><strong>{currentSpeed.toFixed(2)} <small>m/s</small></strong></div>
          <div className="readout"><span>{t.maxHeight}</span><strong>{maxHeight.toFixed(2)} <small>m</small></strong></div>
          <div className="readout"><span>{t.range}</span><strong>{range.toFixed(2)} <small>m</small></strong></div>
        </div>
        <div className="workspace-bottom"><span><i/> {t.ready} · {t.model}</span><button onClick={exportCsv}><Download size={14}/>{t.exportCsv}</button><button onClick={reset}><RotateCcw size={13}/>{t.resetView}</button>{notice && <span className="notice"><Check size={13}/>{notice}</span>}</div>
      </section>
    </div>
  </main>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [language, setLanguage] = useState<Language>("EN");

  useEffect(() => {
    document.documentElement.lang = language === "ID" ? "id" : "en";
  }, [language]);

  return <div className="app-shell">
    <Header page={page} setPage={setPage} language={language} setLanguage={setLanguage}/>
    {page === "home"
      ? <Home language={language} setLanguage={setLanguage} onOpen={() => setPage("workspace")}/>
      : <Workspace language={language} setLanguage={setLanguage} onBack={() => setPage("home")}/>}
  </div>;
}
