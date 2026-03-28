import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // ── Background: organic ink blobs + EKG line ──
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, blobs, time = 0;
    let animationFrameId;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function makeBlob(x, y, r, speed, color) {
      return { 
        x, y, r, speed, color,
        ox: x, oy: y,
        px: Math.random() * 6.28, py: Math.random() * 6.28,
        ax: (Math.random() - 0.5) * 0.008,
        ay: (Math.random() - 0.5) * 0.008 
      };
    }

    function initBlobs() {
      blobs = [
        makeBlob(W * 0.15, H * 0.2,  W * 0.22, 0.4,  'rgba(139,92,60,0.07)'),
        makeBlob(W * 0.8,  H * 0.15, W * 0.18, 0.3,  'rgba(74,103,65,0.06)'),
        makeBlob(W * 0.6,  H * 0.7,  W * 0.25, 0.35, 'rgba(139,92,60,0.05)'),
        makeBlob(W * 0.05, H * 0.75, W * 0.2,  0.5,  'rgba(74,103,65,0.05)'),
        makeBlob(W * 0.9,  H * 0.6,  W * 0.16, 0.45, 'rgba(180,120,60,0.06)'),
      ];
    }

    /* EKG path data */
    function drawEkg(t) {
      const y0 = H * 0.88;
      const amp = 28;
      const period = 180;
      const offset = (t * 60) % W;

      ctx.beginPath();
      ctx.moveTo(0, y0);

      for (let x = 0; x < W + period; x++) {
        const p = ((x + offset) % period) / period; // 0-1 within one cycle
        let dy = 0;
        if (p < 0.3) dy = 0;
        else if (p < 0.35) dy = -amp * 0.4 * ((p - 0.3) / 0.05);
        else if (p < 0.4)  dy = amp * 1.8 * ((p - 0.35) / 0.05) - amp * 0.4;
        else if (p < 0.45) dy = amp * 1.4 - amp * 2.2 * ((p - 0.4) / 0.05);
        else if (p < 0.5)  dy = -amp * 0.8 * ((p - 0.45) / 0.05);
        else if (p < 0.55) dy = -amp * 0.8 + amp * 0.6 * ((p - 0.5) / 0.05);
        else if (p < 0.65) dy = -amp * 0.2 * Math.sin((p - 0.55) / 0.1 * Math.PI);
        else dy = 0;

        ctx.lineTo(x, y0 + dy);
      }

      ctx.strokeStyle = 'rgba(200,132,58,0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* second subtle line */
      ctx.beginPath();
      ctx.moveTo(0, y0 * 0.15);
      for (let x = 0; x < W + period; x++) {
        const p = ((x + offset * 0.7) % period) / period;
        let dy = 0;
        if (p < 0.3) dy = 0;
        else if (p < 0.35) dy = -amp * 0.3 * ((p - 0.3) / 0.05);
        else if (p < 0.4)  dy = amp * 1.4 * ((p - 0.35) / 0.05) - amp * 0.3;
        else if (p < 0.45) dy = amp * 1.1 - amp * 1.7 * ((p - 0.4) / 0.05);
        else if (p < 0.5)  dy = -amp * 0.6 * ((p - 0.45) / 0.05);
        else if (p < 0.55) dy = -amp * 0.6 + amp * 0.4 * ((p - 0.5) / 0.05);
        else dy = 0;
        ctx.lineTo(x, H * 0.15 + dy);
      }
      ctx.strokeStyle = 'rgba(74,103,65,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function tick(ts) {
      time = ts / 1000;
      ctx.clearRect(0, 0, W, H);

      /* blobs */
      blobs.forEach(b => {
        b.px += b.ax * b.speed;
        b.py += b.ay * b.speed;
        const cx = b.ox + Math.sin(b.px) * b.r * 0.5;
        const cy = b.oy + Math.cos(b.py) * b.r * 0.3;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      /* grid lines (subtle) */
      ctx.strokeStyle = 'rgba(26,23,16,0.04)';
      ctx.lineWidth = 1;
      const gs = 80;
      for (let x = 0; x < W; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      drawEkg(time);
      animationFrameId = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', () => { resize(); initBlobs(); });
    resize();
    initBlobs();
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', () => { resize(); initBlobs(); });
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    /* ── Scroll reveal ── */
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    return () => {
      revealEls.forEach(el => io.unobserve(el));
    }
  }, []);

  return (
    <div className="landing-page">
      {/* Animated background canvas */}
      <canvas id="bg-canvas" ref={canvasRef}></canvas>

      <div className="page">

        {/* NAV */}
        <nav>
          <a className="nav-logo" href="#">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            MedForensics
          </a>
          <ul className="nav-links">
            <li><a href="#features">Agents</a></li>
            <li><a href="#pipeline">How it Works</a></li>
            <li><a href="#docs">Docs</a></li>
            <li><Link to="/app" className="nav-cta">Launch Dashboard</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="pulse-dot"></span>
              Clinical AI Safety — Defense in Depth
            </div>

            <h1 className="hero-title">
              Stop AI from<br />
              harming your<br />
              <em>patients.</em>
            </h1>

            <p className="hero-sub">
              MedForensics is middleware that intercepts every clinical LLM output before a clinician sees it — catching hallucinations, flagging bad citations, and surfacing dangerous dosage outliers in real time.
            </p>

            <div className="hero-actions">
              <Link to="/app" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Launch Dashboard
              </Link>
              <a href="#pipeline" className="btn-secondary">
                See the architecture →
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">4<span>×</span></div>
                <div className="stat-label">Forensic Agents</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">&lt;<span>80</span>ms</div>
                <div className="stat-label">Median Latency</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">99<span>%</span></div>
                <div className="stat-label">Uptime SLA</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            {/* Floating badges */}
            <div className="arch-badge" style={{ top: '-16px', right: '24px' }}>
              <span className="badge-dot dot-red"></span> Contradiction detected
            </div>
            <div className="arch-badge" style={{ bottom: '40px', right: '-12px', animationDelay: '-0.7s' }}>
              <span className="badge-dot dot-green"></span> Citation verified
            </div>
            <div className="arch-badge" style={{ bottom: '-12px', left: '20px', animationDelay: '-1.4s' }}>
              <span className="badge-dot dot-amber"></span> Dosage: outlier flagged
            </div>

            <div className="arch-card">
              <div className="arch-label">// Agentic flow — hallucination_forensics_architecture</div>
              {/* Embedded SVG architecture diagram (adapted for dark bg) */}
              <svg viewBox="0 0 680 560" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="#9A9585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                  <marker id="arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="#7FA876" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                  <marker id="arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="#C4382E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                </defs>

                {/* Row 1: LLM output */}
                <rect x="240" y="20" width="200" height="44" rx="8" fill="#2A2720" stroke="#6B6860" strokeWidth="0.8"/>
                <text x="340" y="42" textAnchor="middle" dominantBaseline="central" fill="#C8C4B8" fontFamily="DM Mono, monospace" fontSize="13" fontWeight="500">Clinical LLM output</text>

                <line x1="340" y1="64" x2="340" y2="98" stroke="#6B6860" strokeWidth="1.5" markerEnd="url(#arr)"/>

                {/* Row 2: Middleware */}
                <rect x="200" y="98" width="280" height="44" rx="8" fill="#2D2840" stroke="#6B6499" strokeWidth="0.8"/>
                <text x="340" y="120" textAnchor="middle" dominantBaseline="central" fill="#A8A4D8" fontFamily="DM Mono, monospace" fontSize="13" fontWeight="500">Forensics middleware</text>

                {/* Fan-out lines */}
                <line x1="260" y1="142" x2="90" y2="196" stroke="#6B6499" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="305" y1="142" x2="240" y2="196" stroke="#6B6499" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="375" y1="142" x2="440" y2="196" stroke="#6B6499" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="420" y1="142" x2="590" y2="196" stroke="#6B6499" strokeWidth="1.3" markerEnd="url(#arr)"/>

                {/* External source labels */}
                <text x="22" y="190" fill="#6B6860" fontFamily="DM Mono, monospace" fontSize="10">EHR / patient</text>
                <text x="174" y="190" fill="#6B6860" fontFamily="DM Mono, monospace" fontSize="10">Drug DB</text>
                <text x="378" y="190" fill="#6B6860" fontFamily="DM Mono, monospace" fontSize="10">Clinical cohort</text>
                <text x="528" y="190" fill="#6B6860" fontFamily="DM Mono, monospace" fontSize="10">Uncertainty</text>

                {/* Row 3: 4 agents */}
                {/* Agent 1 */}
                <rect x="20" y="200" width="140" height="70" rx="8" fill="#1E2B1C" stroke="#4A6741" strokeWidth="0.8"/>
                <text x="90" y="222" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Contradiction</text>
                <text x="90" y="238" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Hunter</text>
                <text x="90" y="256" textAnchor="middle" dominantBaseline="central" fill="#4A6741" fontFamily="DM Mono, monospace" fontSize="10">cross-refs EHR</text>

                {/* Agent 2 */}
                <rect x="180" y="200" width="140" height="70" rx="8" fill="#1E2B1C" stroke="#4A6741" strokeWidth="0.8"/>
                <text x="250" y="222" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Citation</text>
                <text x="250" y="238" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Verifier</text>
                <text x="250" y="256" textAnchor="middle" dominantBaseline="central" fill="#4A6741" fontFamily="DM Mono, monospace" fontSize="10">RAG vs FDA labels</text>

                {/* Agent 3 */}
                <rect x="380" y="200" width="140" height="70" rx="8" fill="#1E2B1C" stroke="#4A6741" strokeWidth="0.8"/>
                <text x="450" y="222" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Outlier</text>
                <text x="450" y="238" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Detector</text>
                <text x="450" y="256" textAnchor="middle" dominantBaseline="central" fill="#4A6741" fontFamily="DM Mono, monospace" fontSize="10">stat dosage check</text>

                {/* Agent 4 */}
                <rect x="540" y="200" width="120" height="70" rx="8" fill="#1E2B1C" stroke="#4A6741" strokeWidth="0.8"/>
                <text x="600" y="222" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Uncertainty</text>
                <text x="600" y="238" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Scorer</text>
                <text x="600" y="256" textAnchor="middle" dominantBaseline="central" fill="#4A6741" fontFamily="DM Mono, monospace" fontSize="10">confidence grading</text>

                {/* Converge lines to aggregator */}
                <line x1="90" y1="270" x2="270" y2="322" stroke="#6B6860" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="250" y1="270" x2="310" y2="322" stroke="#6B6860" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="450" y1="270" x2="390" y2="322" stroke="#6B6860" strokeWidth="1.3" markerEnd="url(#arr)"/>
                <line x1="600" y1="270" x2="430" y2="322" stroke="#6B6860" strokeWidth="1.3" markerEnd="url(#arr)"/>

                {/* Row 4: Aggregator */}
                <rect x="210" y="322" width="260" height="44" rx="8" fill="#2A2720" stroke="#6B6860" strokeWidth="0.8"/>
                <text x="340" y="344" textAnchor="middle" dominantBaseline="central" fill="#C8C4B8" fontFamily="DM Mono, monospace" fontSize="12" fontWeight="500">Risk aggregator / scorer</text>

                {/* Branch lines */}
                <line x1="310" y1="366" x2="260" y2="398" stroke="#7FA876" strokeWidth="1.3" markerEnd="url(#arr-g)"/>
                <line x1="370" y1="366" x2="420" y2="398" stroke="#C4382E" strokeWidth="1.3" markerEnd="url(#arr-r)"/>

                {/* Row 5: outcomes */}
                <rect x="200" y="398" width="120" height="44" rx="8" fill="#1A2E18" stroke="#4A7A3A" strokeWidth="0.8"/>
                <text x="260" y="420" textAnchor="middle" dominantBaseline="central" fill="#90C47A" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Pass + annotate</text>

                <rect x="360" y="398" width="120" height="44" rx="8" fill="#2E1A1A" stroke="#7A3A3A" strokeWidth="0.8"/>
                <text x="420" y="420" textAnchor="middle" dominantBaseline="central" fill="#E07070" fontFamily="DM Mono, monospace" fontSize="11" fontWeight="500">Flag + rewrite</text>

                {/* Bottom lines */}
                <line x1="260" y1="442" x2="260" y2="476" stroke="#7FA876" strokeWidth="1.3" markerEnd="url(#arr-g)"/>
                <line x1="420" y1="442" x2="420" y2="476" stroke="#C4382E" strokeWidth="1.3" markerEnd="url(#arr-r)"/>

                {/* Row 6: clinician */}
                <rect x="180" y="476" width="140" height="44" rx="8" fill="#2A2720" stroke="#6B6860" strokeWidth="0.8"/>
                <text x="250" y="498" textAnchor="middle" dominantBaseline="central" fill="#C8C4B8" fontFamily="DM Mono, monospace" fontSize="11">Clinician sees it</text>

                <rect x="360" y="476" width="140" height="44" rx="8" fill="#2A2720" stroke="#6B6860" strokeWidth="0.8"/>
                <text x="430" y="490" textAnchor="middle" dominantBaseline="central" fill="#C8C4B8" fontFamily="DM Mono, monospace" fontSize="11">Clinician sees</text>
                <text x="430" y="506" textAnchor="middle" dominantBaseline="central" fill="#C8C4B8" fontFamily="DM Mono, monospace" fontSize="11">flagged version</text>
              </svg>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker-track">
            {/* duplicated for seamless loop */}
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Contradiction Hunter</strong> — cross-references patient allergies & EHR</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Citation Verifier</strong> — RAG verification against FDA drug labels</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Outlier Detector</strong> — statistically unusual dosage detection</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Uncertainty Scorer</strong> — confidence grading & uncertainty grammar</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>&lt;80ms</strong> median latency per intercept pass</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Contradiction Hunter</strong> — cross-references patient allergies & EHR</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Citation Verifier</strong> — RAG verification against FDA drug labels</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Outlier Detector</strong> — statistically unusual dosage detection</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>Uncertainty Scorer</strong> — confidence grading & uncertainty grammar</span>
            <span className="ticker-item"><span className="ticker-sep">✦</span> <strong>&lt;80ms</strong> median latency per intercept pass</span>
          </div>
        </div>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="features-header reveal">
            <div>
              <div className="section-tag">// Forensic Agents</div>
              <h2 className="section-title">Four agents.<br />One interceptor.</h2>
            </div>
            <p className="section-sub">Each agent runs in parallel, targeting a different failure mode of clinical LLMs. All results feed a risk aggregator before any output reaches your clinicians.</p>
          </div>

          <div className="features-grid">

            {/* Featured card */}
            <div className="feat-card featured reveal">
              <div>
                <div className="feat-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </div>
                <div className="feat-name" style={{ color: 'var(--lp-cream)' }}>Contradiction Hunter</div>
                <p className="feat-desc">Pulls live EHR data and cross-references every clinical recommendation against the patient's allergy list, prior diagnoses, and current medications. Flags semantic contradictions not just keyword matches.</p>
                <span className="feat-tag" style={{ background: 'rgba(200,132,58,0.2)', color: 'var(--lp-amber-lt)' }}>Agentic RAG</span>
              </div>
              <div className="mini-flow">
                <div className="flow-step"><div className="flow-num">1</div> LLM output intercepted</div>
                <div className="flow-arrow">↓</div>
                <div className="flow-step"><div className="flow-num">2</div> EHR patient record pulled</div>
                <div className="flow-arrow">↓</div>
                <div className="flow-step"><div className="flow-num">3</div> Semantic contradiction check</div>
                <div className="flow-arrow">↓</div>
                <div className="flow-step"><div className="flow-num">4</div> Risk score emitted</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feat-card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div className="feat-name">Citation Verifier</div>
              <p className="feat-desc">Runs RAG lookups against FDA drug label databases and clinical guidelines. Any hallucinated or stale citation is flagged before it reaches a clinician.</p>
              <span className="feat-tag">FDA Drug Labels</span>
            </div>

            {/* Card 3 */}
            <div className="feat-card reveal" style={{ transitionDelay: '0.15s' }}>
              <div className="feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div className="feat-name">Outlier Detector</div>
              <p className="feat-desc">Uses clinical cohort data to identify statistically unusual dosages or treatment regimens — catching both over- and under-dosing at a population level.</p>
              <span className="feat-tag">Statistical Analysis</span>
            </div>

            {/* Card 4 */}
            <div className="feat-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="feat-name">Uncertainty Scorer</div>
              <p className="feat-desc">Applies uncertainty grammar to grade model confidence. Surfaces hedged or low-confidence outputs with a calibrated risk band so clinicians know when to trust less.</p>
              <span className="feat-tag">Confidence Grading</span>
            </div>

            {/* Card 5: Risk Aggregator */}
            <div className="feat-card reveal" style={{ transitionDelay: '0.25s' }}>
              <div className="feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="feat-name">Risk Aggregator</div>
              <p className="feat-desc">Combines signals from all four agents into a composite risk score. Outputs either a clean annotated response, or a hard-flagged version routed for clinician review.</p>
              <span className="feat-tag">Composite Scoring</span>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="howitworks" id="pipeline">
          <div style={{ maxWidth: '560px' }} className="reveal">
            <div className="section-tag">// Agentic Pipeline</div>
            <h2 className="section-title">From LLM output<br />to safe clinical view</h2>
            <p className="section-sub">Every response traverses this pipeline before a clinician ever sees it. Parallel agent execution keeps latency under 80ms.</p>
          </div>

          <div className="pipeline reveal">
            <div className="pipeline-steps">
              <div className="pipe-step">
                <div className="pipe-num">01</div>
                <div className="pipe-name">LLM Output</div>
                <div className="pipe-desc">Raw clinical recommendation exits the model</div>
              </div>
              <div className="pipe-step">
                <div className="pipe-num">02</div>
                <div className="pipe-name">Intercept</div>
                <div className="pipe-desc">Middleware captures the stream before display</div>
              </div>
              <div className="pipe-step">
                <div className="pipe-num">03</div>
                <div className="pipe-name">4× Agents</div>
                <div className="pipe-desc">Parallel forensic analysis across all dimensions</div>
              </div>
              <div className="pipe-step">
                <div className="pipe-num">04</div>
                <div className="pipe-name">Aggregate</div>
                <div className="pipe-desc">Risk scores merged into a composite verdict</div>
              </div>
              <div className="pipe-step">
                <div className="pipe-num">05</div>
                <div className="pipe-name">Deliver</div>
                <div className="pipe-desc">Annotated or flagged output reaches clinician</div>
              </div>
            </div>
          </div>

          <div className="risk-callout reveal">
            <div className="risk-card">
              <div className="risk-indicator risk-green"></div>
              <div>
                <div className="risk-title">Pass + Annotate path</div>
                <div className="risk-body">Output passes all checks. Delivered with inline confidence annotations and citation tooltips. Clinician receives full context on model certainty.</div>
              </div>
            </div>
            <div className="risk-card">
              <div className="risk-indicator risk-red"></div>
              <div>
                <div className="risk-title">Flag + Rewrite path</div>
                <div className="risk-body">One or more agents raise a risk above threshold. Output is quarantined, rewritten with safe language, and surfaced with a red-flag banner for mandatory review.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="section-tag">// Get Started</div>
          <h2 className="section-title">Protect your patients.<br />Deploy in minutes.</h2>
          <p className="section-sub">Drop MedForensics into your existing healthcare GenAI stack as a middleware layer. No model changes required.</p>
          <Link to="/app" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Launch Dashboard
          </Link>
        </section>

        {/* FOOTER */}
        <footer>
          <span className="logo">MedForensics</span>
          <span>Clinical AI Safety Middleware · Defense-in-depth forensics</span>
          <span>
            <a href="#">Docs</a> &nbsp;·&nbsp;
            <a href="#">API</a> &nbsp;·&nbsp;
            <a href="#">Privacy</a>
          </span>
        </footer>

      </div>{/* /page */}
    </div>
  );
}

export default Landing;
