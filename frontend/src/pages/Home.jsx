import { useState } from "react";
import { useNavigate } from "react-router-dom";
import meridianLogo from "../assets/meridian-logo.png"; 

export default function Home() {
  const navigate = useNavigate();
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const navCards = [
    {
      key: "info",
      color: "#e9a84c",
      bg: "#fef3c7",
      title: "Project Information",
      desc: "Scope, objectives, design principles, and the rationale behind the manager-led approach across phases 1–3.",
      cta: showProjectInfo ? "Hide details ↑" : "Explore ↓",
      onClick: () => setShowProjectInfo(v => !v),
      expandable: true,
    },
    {
      key: "matrix",
      color: "#6d5fc7",
      bg: "#ede9fe",
      title: "Master Template",
      desc: "Standardised skill frameworks and taxonomy by discipline. The canonical source for skill definitions and proficiency levels.",
      cta: "Open matrix →",
      onClick: () => navigate("/matrix"),
    },
    {
      key: "assessment",
      color: "#2a9d8f",
      bg: "#d1fae5",
      title: "Assessment Review",
      desc: "Manager-led assessment workflows, employee assignment views, and structured coaching conversation guides.",
      cta: "Start review →",
      onClick: () => navigate("/assessment"),
    },
    {
      key: "analytics",
      color: "#e07070",
      bg: "#fee2e2",
      title: "Gap Analytics",
      desc: "Workforce-level skill heat maps, role-readiness dashboards, and capability gap reports to guide development planning.",
      cta: "View analytics →",
      onClick: () => {},
    },
  ];

  const roadmap = [
    { phase: "Phase 1", title: "Foundation",  desc: "Taxonomy, templates, and governed skill library",          color: "#6d5fc7" },
    { phase: "Phase 2", title: "Assessment",  desc: "Manager-led rating cycles and employee profiles",           color: "#2a9d8f" },
    { phase: "Phase 3", title: "Coaching",    desc: "Development plans, role readiness, and gap actions",        color: "#e9a84c" },
    { phase: "Phase 4", title: "Analytics",   desc: "Workforce planning signals and capability dashboards",      color: "#e07070" },
  ];

  const principles = [
    { title: "Manager-led by design",       desc: "Phases 1–3 equip managers with practical tools backed by structured data.",        color: "#6d5fc7" },
    { title: "Central and governed",         desc: "One source of truth replaces scattered, discipline-specific artifacts.",            color: "#2563eb" },
    { title: "Cross-discipline consistency", desc: "Shared expectations and proficiency language across every function.",              color: "#2a9d8f" },
  ];

  return (
    <div className="hp">

      {/* ── Logo ── transparent PNG on grey bg — no white box */}
      <div className="hp-brand">
        <img src={meridianLogo} alt="Project Meridian" className="hp-brand__img" />
      </div>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <h1 className="hp-hero__title">Project Meridian</h1>
        <p className="hp-hero__sub">Phase 1 through 4 · Manager-led capability development</p>
        <p className="hp-hero__desc">
          A single, structured foundation for how we understand, develop, and grow capability
          across disciplines. Skill data moves from scattered, discipline-specific artifacts into a
          central, governed system that supports consistent coaching, role readiness, and workforce planning.
        </p>

        <div className="hp-pills">
          {["Phase 1 · Foundation","Phase 2 · Assessment","Phase 3 · Review cycles","Phase 4 · Analytics"].map(p => (
            <span key={p} className="hp-pill">{p}</span>
          ))}
        </div>

        <div className="hp-stats">
          {[["4","Delivery phases"],["1","Governed system"],["∞","Growth potential"]].map(([n,l]) => (
            <div key={l} className="hp-stat">
              <span className="hp-stat__n">{n}</span>
              <span className="hp-stat__l">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Navigate ── */}
      <p className="hp-label">NAVIGATE THE TOOL</p>
      <div className="hp-cards">
        {navCards.map(card => (
          <div
            key={card.key}
            className={`hp-card ${showProjectInfo && card.key === "info" ? "hp-card--expanded" : ""}`}
            style={{ "--accent": card.color }}
            onClick={card.onClick}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === "Enter" && card.onClick()}
          >
            <div className="hp-card__dot" style={{ background: card.bg }}>
              <div style={{ width:16, height:16, borderRadius:4, background: card.color, opacity:.7 }} />
            </div>
            <h2 className="hp-card__title">{card.title}</h2>
            <p className="hp-card__desc">{card.desc}</p>
            <span className="hp-card__cta" style={{ color: card.color }}>{card.cta}</span>

            {card.expandable && showProjectInfo && (
              <div className="hp-expand" onClick={e => e.stopPropagation()}>
                <h2>Skill Matrix Tool (Phase 1–4)</h2>
                <p>The Skill Matrix Tool establishes a single, structured foundation for how we understand, develop, and grow capability across disciplines. It moves skill data from scattered, discipline-specific artifacts into a central, governed system that supports consistent coaching, role readiness, and workforce planning.</p>
                <p>Phases 1 through 3 are manager-led by design. The intent is to equip managers with a clear, practical tool for coaching and development, supported by structured data and consistent expectations.</p>

                {[
                  ["Phase 1 – Centralize and standardize", [
                    "Consolidate all discipline skill matrices into a single SharePoint-based location.",
                    "Establish common structure, ownership, and update procedures.",
                    "Enable metadata access so skills can be queried and reused.",
                    "Remove ambiguity around ownership and maintenance.",
                  ]],
                  ["Phase 2 – Connect skills to job descriptions", [
                    "Link the centralized skill matrix to standardized job descriptions.",
                    "Make role expectations explicit by discipline and level.",
                    "Create a bridge between competencies and progression readiness.",
                    "Align capability definitions with evaluation processes.",
                  ]],
                  ["Phase 3 – Enable AI-assisted coaching", [
                    "Bring together skill matrix, job descriptions and development plans.",
                    "Identify strengths and growth areas.",
                    "Recommend training and stretch assignments.",
                    "Build competency-based growth plans.",
                    "Support managers without replacing their judgment.",
                  ]],
                  ["Phase 4 – Employee-facing guidance experience", [
                    "Self-service role-aware guidance.",
                    "Personalized development pathways.",
                    "Preparation for higher-quality manager conversations.",
                    "Governed and consistent messaging.",
                    "Improved employee agency while maintaining a single source of truth.",
                  ]],
                  ["Why this matters", [
                    "Builds a consistent coaching toolset.",
                    "Strengthens role clarity and readiness discussions.",
                    "Improves alignment between training investment and capability needs.",
                    "Supports both manager-led development and employee self-direction.",
                  ]],
                ].map(([heading, items]) => (
                  <div key={heading}>
                    <h3>{heading}</h3>
                    <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Roadmap ── */}
      <p className="hp-label">ROADMAP AT A GLANCE</p>
      <div className="hp-roadmap">
        {roadmap.map(r => (
          <div key={r.phase} className="hp-rm" style={{ "--accent": r.color }}>
            <span className="hp-rm__phase" style={{ color: r.color }}>{r.phase}</span>
            <strong className="hp-rm__title">{r.title}</strong>
            <p className="hp-rm__desc">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Design Principles ── */}
      <p className="hp-label">DESIGN PRINCIPLES</p>
      <div className="hp-principles">
        {principles.map(p => (
          <div key={p.title} className="hp-principle" style={{ "--accent": p.color }}>
            <h3 className="hp-principle__title">{p.title}</h3>
            <p className="hp-principle__desc">{p.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        /* ── Page ── */
        .hp {
          min-height: 100vh;
          background:#f8fafc;
          padding: clamp(16px, 3vw, 40px);
         font-family:"Inter","Aptos","Segoe UI",sans-serif;
        }

        /* ── Logo ── */
.hp-brand {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin: 0 0 30px;
}
        /* Transparent PNG — just render it, no blend tricks needed */
        .hp-brand__img {
          height: 72px;
          width: auto;
          object-fit: contain;
        }

        /* ── Hero ── */
        .hp-hero {
         background: linear-gradient(135deg,#343381 0%,#4a49a2 55%,#6766c8 100%);
          border-radius: 18px;
          padding: clamp(28px, 4vw, 52px) clamp(20px, 5vw, 56px);
          color: #fff;
          text-align: center;
          margin-bottom: 36px;
          box-shadow: 0 8px 32px rgba(46,36,128,.28);
        }
.hp-hero__title {
  font-size: clamp(52px, 6vw, 72px);
  font-weight: 900;
  line-height: .95;
  letter-spacing: -3px;
  color: #ffffff;

  margin-bottom: 18px;

  background: transparent;
  padding: 0;
  border: 0;
}
.hp-hero__sub {
  font-size: clamp(18px, 2vw, 24px);
  font-weight: 600;
  margin-bottom: 22px;
  opacity: .9;
}
      .hp-hero__desc {
  max-width: 850px;

  font-size: 17px;
  line-height: 1.9;

  margin: 0 auto 36px;
}
        .hp-pills {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center; margin-bottom: 28px;
        }
        .hp-pill {
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 999px;
          padding: 5px 15px;
          font-size: 12px; font-weight: 500;
        }
        .hp-stats {
          display: flex; justify-content: center;
          gap: clamp(10px,3vw,32px); flex-wrap: wrap;
        }
        .hp-stat {
          background: rgba(255,255,255,.12);
          border-radius: 14px;
          padding: 16px 28px;
          min-width: 110px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .hp-stat__n { font-size: clamp(22px,3vw,34px); font-weight: 800; }
        .hp-stat__l { font-size: 12px; opacity: .72; text-align: center; }

 .hp-label {
  font-size: 26px;
  font-weight: 800;

  color: #051B38;

  letter-spacing: -.5px;

  margin-bottom: 24px;

  text-transform: none;
}

        /* ── Nav cards ── */
        .hp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }
   .hp-card {
   min-height: 240px;
padding: 24px;
  background: white;
  border-radius: 20px;
border: 1px solid #d9e2ef;
border-top: 4px solid var(--accent);

  box-shadow:
    0 4px 12px rgba(0,0,0,.04),
    0 8px 28px rgba(0,0,0,.06);

  transition: all .25s ease;
}

        .hp-card:hover {
  transform: translateY(-6px);

  box-shadow:
    0 12px 30px rgba(0,0,0,.09),
    0 18px 40px rgba(0,0,0,.06);
}
        .hp-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
        .hp-card--expanded { grid-column: 1 / -1; }

        .hp-card__dot {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
       .hp-card__title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 12px;
}
        .hp-card__desc  { font-size: clamp(12px,1.2vw,13.5px); color: #6b7280; line-height: 1.65; margin: 0; flex: 1; }
        .hp-card__cta   { font-size: 13px; font-weight: 700; }

        /* Expanded project info */
        .hp-expand {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          animation: fadeUp .3s ease;
        }
        .hp-expand h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px; }
        .hp-expand h3 { font-size: 14px; font-weight: 700; color: #d97706; margin: 20px 0 8px; }
        .hp-expand p  { font-size: 14px; line-height: 1.8; color: #4b5563; margin: 0 0 10px; }
        .hp-expand ul { padding-left: 20px; margin: 0; }
        .hp-expand li { font-size: 14px; line-height: 1.75; color: #4b5563; margin-bottom: 6px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

        /* ── Roadmap ── */
        .hp-roadmap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
          gap: 16px; margin-bottom: 36px;
        }
   .hp-rm {
  background: white;

  padding: 22px;

  border: 1px solid #d9e2ef;

  border-left: 4px solid var(--accent);

  border-radius: 14px;

  min-height: 130px;
}
        .hp-rm__phase { font-size: 11px; font-weight: 700; letter-spacing: .5px; }
        .hp-rm__title { font-size: 20px; color: #111827; }
        .hp-rm__desc  { font-size: clamp(11px,1.1vw,13px); color: #6b7280; line-height: 1.5; margin: 0; }

        /* ── Principles ── */
        .hp-principles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
          gap: 20px; margin-bottom: 48px;
        }
        .hp-principle {
          background:;
          border-radius: 16px;
          padding: 26px;
          border-top: 4px solid var(--accent);
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
          transition: transform .2s, box-shadow .2s;
        }
        .hp-principle:hover { transform: translateY(-4px); box-shadow: 0 14px 28px rgba(0,0,0,.11); }
        .hp-principle__title { margin: 0 0 10px; font-size: 17px; font-weight: 700; color: #111827; }
        .hp-principle__desc  { margin: 0; line-height: 1.75; color: #6b7280; font-size: 14px; }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .hp-hero { border-radius: 12px; }
          .hp-stat { min-width: 90px; padding: 12px 16px; }
          .hp-cards, .hp-roadmap, .hp-principles { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}