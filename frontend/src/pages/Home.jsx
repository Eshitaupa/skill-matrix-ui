import { useState } from "react";
import { useNavigate } from "react-router-dom";
import meridianLogo from "../assets/meridian-logo.png"; 

export default function Home() {
  const navigate = useNavigate();
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const navCards = [
  {
    key: "info",
    title: "Project Information",
    desc: "Scope, objectives, design principles and roadmap.",
    cta: showProjectInfo ? "Hide Details" : "Explore",
    onClick: () => setShowProjectInfo((v) => !v),
    expandable: true,
  },
  {
    key: "matrix",
    title: "Master Template",
    desc: "Governed source for all discipline skill frameworks.",
    cta: "Open Matrix",
    onClick: () => navigate("/matrix"),
  },
  {
    key: "assessment",
    title: "Assessment Review",
    desc: "Manager-led reviews and coaching workflows.",
    cta: "Start Review",
    onClick: () => navigate("/assessment"),
  },
  {
    key: "analytics",
    title: "Gap Analytics",
    desc: "Capability dashboards and workforce insights.",
    cta: "View Analytics",
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
  <div className="min-h-screen bg-base-100 p-6 lg:p-10">

    {/* Logo */}

    <div className="flex justify-center mb-8">
      <img
        src={meridianLogo}
        alt="Project Meridian"
        className="h-20 object-contain"
      />
    </div>

    {/* Hero */}

    <div className="hero rounded-3xl bg-primary text-primary-content shadow-xl border border-primary/20">

      <div className="hero-content text-center py-16 px-8">

        <div className="max-w-4xl">

          <h1 className="text-5xl font-extrabold mb-4">
            Project Meridian
          </h1>

          <p className="text-lg opacity-90 mb-6">
            Phase 1 through 4 · Manager-led Capability Development
          </p>

          <p className="max-w-3xl mx-auto text-base leading-8 opacity-90">
            A structured and governed foundation for understanding,
            developing and growing capability across disciplines.
            Skill data moves from disconnected artifacts into a
            central system supporting coaching, readiness and
            workforce planning.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <div className="badge badge-outline badge-lg text-white">
              Phase 1 · Foundation
            </div>

            <div className="badge badge-outline badge-lg text-white">
              Phase 2 · Assessment
            </div>

            <div className="badge badge-outline badge-lg text-white">
              Phase 3 · Coaching
            </div>

            <div className="badge badge-outline badge-lg text-white">
              Phase 4 · Analytics
            </div>
          </div>

          <div className="stats stats-horizontal mt-10 shadow-lg bg-white/10">

            <div className="stat text-center">
              <div className="stat-value text-white">4</div>
              <div className="stat-desc text-white">
                Delivery Phases
              </div>
            </div>

            <div className="stat text-center">
              <div className="stat-value text-white">1</div>
              <div className="stat-desc text-white">
                Governed System
              </div>
            </div>

            <div className="stat text-center">
              <div className="stat-value text-white">∞</div>
              <div className="stat-desc text-white">
                Growth Potential
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

    {/* Navigation */}

    <div className="mt-10">

      <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/60 mb-4">
        Navigate the Tool
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {navCards.map((card) => (
          <div
            key={card.key}
            onClick={card.onClick}
            className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="card-body">

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-primary" />
              </div>

              <h3 className="card-title text-lg">
                {card.title}
              </h3>

              <p className="text-sm leading-7 text-base-content/70">
                {card.desc}
              </p>

              <div className="text-primary font-semibold">
                {card.cta} →
              </div>

            </div>
          </div>
        ))}

      </div>

    </div>

    {/* Roadmap */}

    <div className="mt-12">

      <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/60 mb-4">
        Roadmap at a Glance
      </h2>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {roadmap.map((item) => (
          <div
            key={item.phase}
            className="card bg-base-100 border-l-4 border-primary border border-base-300 shadow-sm"
          >
            <div className="card-body">

              <span className="text-xs font-bold uppercase text-primary">
                {item.phase}
              </span>

              <h3 className="font-bold text-lg">
                {item.title}
              </h3>

              <p className="text-sm text-base-content/70">
                {item.desc}
              </p>

            </div>
          </div>
        ))}

      </div>

    </div>

    {/* Principles */}

    <div className="mt-12">

      <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/60 mb-4">
        Design Principles
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        {principles.map((p) => (
          <div
            key={p.title}
            className="card bg-base-100 border-t-4 border-primary shadow-md"
          >
            <div className="card-body">

              <h3 className="text-lg font-bold">
                {p.title}
              </h3>

              <p className="text-base-content/70">
                {p.desc}
              </p>

            </div>
          </div>
        ))}

      </div>

    </div>

  </div>
);
}