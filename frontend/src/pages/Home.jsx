// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import meridianLogo from "../assets/meridian-logo.png"; 

// export default function Home() {
//   const navigate = useNavigate();
//   const [showProjectInfo, setShowProjectInfo] = useState(false);

//   const navCards = [
//     {
//       key: "info",
//       color: "#e9a84c",
//       bg: "#fef3c7",
//       title: "Project Information",
//       desc: "Scope, objectives, design principles, and the rationale behind the manager-led approach across phases 1–3.",
//       cta: showProjectInfo ? "Hide details ↑" : "Explore ↓",
//       onClick: () => setShowProjectInfo(v => !v),
//       expandable: true,
//     },
//     {
//       key: "matrix",
//       color: "#6d5fc7",
//       bg: "#ede9fe",
//       title: "Master Template",
//       desc: "Standardised skill frameworks and taxonomy by discipline. The canonical source for skill definitions and proficiency levels.",
//       cta: "Open matrix →",
//       onClick: () => navigate("/matrix"),
//     },
//     {
//       key: "assessment",
//       color: "#2a9d8f",
//       bg: "#d1fae5",
//       title: "Assessment Review",
//       desc: "Manager-led assessment workflows, employee assignment views, and structured coaching conversation guides.",
//       cta: "Start review →",
//       onClick: () => navigate("/assessment"),
//     },
//     {
//       key: "analytics",
//       color: "#e07070",
//       bg: "#fee2e2",
//       title: "Gap Analytics",
//       desc: "Workforce-level skill heat maps, role-readiness dashboards, and capability gap reports to guide development planning.",
//       cta: "View analytics →",
//       onClick: () => {},
//     },
//   ];

//   const roadmap = [
//     { phase: "Phase 1", title: "Skills Standardization",  desc: "Taxonomy, templates, and governed skill library",          color: "#6d5fc7" },
//     { phase: "Phase 2", title: "Skills Validation",  desc: "Manager-led rating cycles and employee profiles",           color: "#2a9d8f" },
//     { phase: "Phase 3", title: "Coaching",    desc: "Development plans, role readiness, and gap actions",        color: "#e9a84c" },
//     { phase: "Phase 4", title: "Analytics",   desc: "Workforce planning signals and capability dashboards",      color: "#e07070" },
//   ];

//   const principles = [
//     { title: "Manager-led by design",       desc: "Phases 1–3 equip managers with practical tools backed by structured data.",        color: "#6d5fc7" },
//     { title: "Central and governed",         desc: "One source of truth replaces scattered, discipline-specific artifacts.",            color: "#2563eb" },
//     { title: "Cross-discipline consistency", desc: "Shared expectations and proficiency language across every function.",              color: "#2a9d8f" },
//   ];

//   return (
//     <div className="hp">

//       <div className="hp-brand">
//         <img src={meridianLogo} alt="Project Meridian" className="hp-brand__img" />
//       </div>

//       {/* ── Hero ── */}
//       <section className="hp-hero">
//         <h1 className="hp-hero__title">Project Meridian</h1>
//         <p className="hp-hero__sub">Phase 1 through 3 · Manager-led capability development</p>
//         <p className="hp-hero__desc">
//           A single, structured foundation for how we understand, develop, and grow capability
//           across disciplines. Skill data moves from scattered, discipline-specific artifacts into a
//           central, governed system that supports consistent coaching, role readiness, and workforce planning.
//         </p>

//         <div className="hp-pills">
//           {["Phase 1 · Skills Standardization","Phase 2 · Skills Validation","Phase 3 · Gap Analytics",].map(p => (
//             <span key={p} className="hp-pill">{p}</span>
//           ))}
//         </div>

//         <div className="hp-stats">
//           {[["3","Delivery phases"],["1","Governed system"],["∞","Growth potential"]].map(([n,l]) => (
//             <div key={l} className="hp-stat">
//               <span className="hp-stat__n">{n}</span>
//               <span className="hp-stat__l">{l}</span>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── Navigate ── */}
//       <p className="hp-label">NAVIGATE THE TOOL</p>
//       <div className="hp-cards">
//         {navCards.map(card => (
//           <div
//             key={card.key}
//             className={`hp-card ${showProjectInfo && card.key === "info" ? "hp-card--expanded" : ""}`}
//             style={{ "--accent": card.color }}
//             onClick={card.onClick}
//             role="button" tabIndex={0}
//             onKeyDown={e => e.key === "Enter" && card.onClick()}
//           >
//             <div className="hp-card__dot" style={{ background: card.bg }}>
//               <div style={{ width:16, height:16, borderRadius:4, background: card.color, opacity:.7 }} />
//             </div>
//             <h2 className="hp-card__title">{card.title}</h2>
//             <p className="hp-card__desc">{card.desc}</p>
//             <span className="hp-card__cta" style={{ color: card.color }}>{card.cta}</span>

//             {card.expandable && showProjectInfo && (
//               <div className="hp-expand" onClick={e => e.stopPropagation()}>
//                 <h2>Skill Matrix Tool (Phase 1–3)</h2>
//                 <p>The Skill Matrix Tool establishes a single, structured foundation for how we understand, develop, and grow capability across disciplines. It moves skill data from scattered, discipline-specific artifacts into a central, governed system that supports consistent coaching, role readiness, and workforce planning.</p>
//                 <p>Phases 1 through 3 are manager-led by design. The intent is to equip managers with a clear, practical tool for coaching and development, supported by structured data and consistent expectations.</p>

//                 {[
//                   ["Phase 1 –  Skills Standardization (Completed)", [
//                     "A centralized Skills Repository has been established for all Engineering and Project Management disciplines.",
//                     "The minimum proficiency level required for each skill, based on employee grade, has been defined by the respective Discipline Managers.",
//                     "Discipline Managers can add new skills or modify proficiency requirements at any time to ensure the repository remains current and relevant.",
//                     "The repository is exclusively manager-owned and manager-controlled. Access is restricted to GP Managers, EMs, AEMs, Discipline Managers (DMs), and SMs. Employee Owners will not have access to this repository.",
//                   ]],
//                   ["Phase 2 – Skills Validation (Future)", [
//                     "Skills Assessment: Employee Owners will perform a self-assessment by rating their proficiency against the skills defined in Phase 1.",
//                     "Manager Review: After the self-assessment is completed, Managers will review the ratings and provide feedback.",
//                     "Upon completion of the Manager Review, Employee Owners will be able to view: ○ Their self-assessed proficiency level ○ The required proficiency level defined in Phase 1 ○ The proficiency level assigned by their Manager",
//                     "The output from this phase will serve as the foundation for Phase 3.",
//                   ]],
//                   ["Phase 3 – Gap Analytics (Future)", [
//                     "Power BI or similar analytics tools will be used to identify gaps between the required skill levels defined in Phase 1 and the available skill proficiency levels captured in Phase 2 for each Employee Owner.",
//                     "Data from the above analytics will be used by Managers to prepare Career Development Plans & assign appropriate trainings to Employee Owners.",
//                   ]],
//                   ["Why this matters", [
//                     "Builds a consistent coaching toolset.",
//                     "Strengthens role clarity and readiness discussions.",
//                     "Improves alignment between training investment and capability needs.",
//                     "Supports both manager-led development and employee self-direction.",
//                   ]],
//                 ].map(([heading, items]) => (
//                   <div key={heading}>
//                     <h3>{heading}</h3>
//                     <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* ── Design Principles ── */}
//       <p className="hp-label">DESIGN PRINCIPLES</p>
//       <div className="hp-principles">
//         {principles.map(p => (
//           <div key={p.title} className="hp-principle" style={{ "--accent": p.color }}>
//             <h3 className="hp-principle__title">{p.title}</h3>
//             <p className="hp-principle__desc">{p.desc}</p>
//           </div>
//         ))}
//       </div>

//       <style>{`
//         /* ── Page ── */
//         .hp {
//           min-height: 100vh;
//           background:#f8fafc;
//           padding: clamp(16px, 3vw, 40px);
//          font-family:"Inter","Aptos","Segoe UI",sans-serif;
//         }

//         /* ── Logo ── */
// .hp-brand {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: 20px;
//   margin: 0 0 30px;
// }
//         /* Transparent PNG — just render it, no blend tricks needed */
//         .hp-brand__img {
//           height: 140px;
//           width: auto;
//           object-fit: contain;
//         }

//         /* ── Hero ── */
//         .hp-hero {
//          background: linear-gradient(135deg,#343381 0%,#4a49a2 55%,#6766c8 100%);
//           border-radius: 18px;
//           padding: clamp(28px, 4vw, 52px) clamp(20px, 5vw, 56px);
//           color: #fff;
//           text-align: center;
//           margin-bottom: 36px;
//           box-shadow: 0 8px 32px rgba(46,36,128,.28);
//         }
// .hp-hero__title {
//   font-size: clamp(52px, 6vw, 72px);
//   font-weight: 900;
//   line-height: .95;
//   letter-spacing: -3px;
//   color: #ffffff;
// font-family: Inter, sans-serif !important;
//   margin-bottom: 18px;

//   background: transparent;
//   padding: 0;
//   border: 0;
// }
// .hp-hero__sub {
//   font-size: clamp(18px, 2vw, 24px);
//   font-weight: 600;
//   margin-bottom: 22px;
//   opacity: .9;
// }
//       .hp-hero__desc {
//   max-width: 850px;

//   font-size: 17px;
//   line-height: 1.9;

//   margin: 0 auto 36px;
// }
//         .hp-pills {
//           display: flex; flex-wrap: wrap; gap: 8px;
//           justify-content: center; margin-bottom: 28px;
//         }
//         .hp-pill {
//           background: rgba(255,255,255,.14);
//           border: 1px solid rgba(255,255,255,.24);
//           border-radius: 999px;
//           padding: 5px 15px;
//           font-size: 12px; font-weight: 500;
//         }
//         .hp-stats {
//           display: flex; justify-content: center;
//           gap: clamp(10px,3vw,32px); flex-wrap: wrap;
//         }
//         .hp-stat {
//           background: rgba(255,255,255,.12);
//           border-radius: 14px;
//           padding: 16px 28px;
//           min-width: 110px;
//           display: flex; flex-direction: column; align-items: center; gap: 4px;
//         }
//         .hp-stat__n { font-size: clamp(22px,3vw,34px); font-weight: 800; }
//         .hp-stat__l { font-size: 12px; opacity: .72; text-align: center; }

// .hp-label {
//   margin-bottom: 32px;

//   font-size: 28px;
//   font-weight: 900;
// }

//         /* ── Nav cards ── */
//         .hp-cards {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//           gap: 20px;
//           margin-bottom: 36px;
//         }
//    .hp-card {
//    min-height: 240px;
// padding: 24px;
//   background: white;
//   border-radius: 20px;
// border: 1px solid #d9e2ef;
// border-top: 4px solid var(--accent);

//   box-shadow:
//     0 4px 12px rgba(0,0,0,.04),
//     0 8px 28px rgba(0,0,0,.06);

//   transition: all .25s ease;
// }

//         .hp-card:hover {
//   transform: translateY(-6px);

//   box-shadow:
//     0 12px 30px rgba(0,0,0,.09),
//     0 18px 40px rgba(0,0,0,.06);
// }
//         .hp-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
//         .hp-card--expanded { grid-column: 1 / -1; }

//         .hp-card__dot {
//           width: 38px; height: 38px; border-radius: 10px;
//           display: flex; align-items: center; justify-content: center;
//         }
//        .hp-card__title {
//   font-size: 24px;
//   font-weight: 800;
//   line-height: 1.2;
//   margin-bottom: 12px;
// }
//         .hp-card__desc  { font-size: clamp(12px,1.2vw,13.5px); color: #6b7280; line-height: 1.65; margin: 0; flex: 1; }
//         .hp-card__cta   { font-size: 13px; font-weight: 700; }

//         /* Expanded project info */
//         .hp-expand {
//           margin-top: 20px;
//           padding-top: 20px;
//           border-top: 1px solid #e5e7eb;
//           animation: fadeUp .3s ease;
//         }
//         .hp-expand h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px; }
//         .hp-expand h3 { font-size: 14px; font-weight: 700; color: #d97706; margin: 20px 0 8px; }
//         .hp-expand p  { font-size: 14px; line-height: 1.8; color: #4b5563; margin: 0 0 10px; }
//         .hp-expand ul { padding-left: 20px; margin: 0; }
//         .hp-expand li { font-size: 14px; line-height: 1.75; color: #4b5563; margin-bottom: 6px; }
//         @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

//         /* ── Roadmap ── */
//         .hp-roadmap {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
//           gap: 16px; margin-bottom: 36px;
//         }
//    .hp-rm {
//   background: white;

//   padding: 28px;

//   border: 1px solid #d9e2ef;

//   border-left: 4px solid var(--accent);

//   border-radius: 14px;

//   min-height: 190px;
// }
//         .hp-rm__phase { font-size: 11px; font-weight: 700; letter-spacing: .5px; }
// .hp-rm__title {
//   display: block;

//   margin-top: 12px;
//   margin-bottom: 12px;

//   font-size: 24px;
//   font-weight: 800;

//   line-height: 1.15;
// }
// .hp-rm__desc {
//   font-size: 15px;
//   line-height: 1.8;
//   color: #475569;
// }

//         /* ── Principles ── */
//         .hp-principles {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
//           gap: 20px; margin-bottom: 48px;
//         }
//         .hp-principle {
//   background: white;

//   border: 1px solid #d9e2ef;
//   border-top: 5px solid var(--accent);

//   border-radius: 16px;

//   padding: 32px;

//   min-height: 220px;

//   box-shadow: 0 4px 16px rgba(0,0,0,.05);

//   transition: .25s;
// }
//         .hp-principle:hover { transform: translateY(-4px); box-shadow: 0 14px 28px rgba(0,0,0,.11); }
//         .hp-principle__title {
//   font-size: 24px;
//   font-weight: 800;
//   line-height: 1.2;

//   margin-bottom: 16px;
// }
//         .hp-principle__desc  { margin: 0; line-height: 1.8; color: #6b7280; font-size: 15px; }

//         /* ── Mobile ── */
//         @media (max-width: 600px) {
//           .hp-hero { border-radius: 12px; }
//           .hp-stat { min-width: 90px; padding: 12px 16px; }
//           .hp-cards, .hp-roadmap, .hp-principles { grid-template-columns: 1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }


import { useEffect, useCallback, useMemo, useState } from "react";
import Filters from "../components/Filters";
import SkillTable from "../components/SkillTable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ROLE_LEVELS = {
  Engineer: [
    "L7",
    "L8",
    "L9",
    "L10",
    "L11",
    "L12",
    "L13",
    "L14",
    "L15",
    "L16",
    "L17",
  ],
  Designer: [
    "L5",
    "L6",
    "L7",
    "L8",
    "L9",
    "L10",
    "L11",
    "L12",
    "L13",
    "L14",
    "L15",
  ],
};

const DISCIPLINE_ROLE_MAP = {
  "Project Management": "Engineer",
  "Piping Engineering": "Engineer",
  "Mechanical": "Engineer",
};

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

const API_SKILL = `${API_BASE}/api/skill-matrix`;

const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
const keyOfText = (v) => norm(v).toLowerCase();

function transformApiToMatrix(rows, roleLevels) {
  const groups = {};

  (rows || []).forEach((r) => {
    const categoryRaw = r.Skill || r.category;
    const subskillRaw = r.Subskill || r.skill_name;

    const category = norm(categoryRaw);
    const subskill = norm(subskillRaw);
    const level = norm(r.LevelKey || r.level);
    const value = r.Value ?? r.proficiency ?? "NA";

    if (!category || !subskill || !level) return;

    const catKey = keyOfText(category);

    if (!groups[catKey]) {
      groups[catKey] = {
        category,
        skills: [],
      };
    }

    let rowObj = groups[catKey].skills.find(
      (s) => keyOfText(s.name) === keyOfText(subskill)
    );

    if (!rowObj) {
      rowObj = {
        name: subskill,
        levels: {},
      };
      groups[catKey].skills.push(rowObj);
    }

    rowObj.levels[level] = value;
  });

  Object.values(groups).forEach((group) => {
    group.skills.forEach((skill) => {
      roleLevels.forEach((level) => {
        if (
          skill.levels[level] === undefined ||
          skill.levels[level] === null ||
          skill.levels[level] === ""
        ) {
          skill.levels[level] = "NA";
        }
      });
    });
  });


  return Object.values(groups);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function buildExportRows(matrixData, role, selectedLevel) {
  const allLevels = ROLE_LEVELS[role] || [];
  const levels = selectedLevel ? [selectedLevel] : allLevels;
  const rows = [];

  matrixData.forEach((group) => {
    group.skills.forEach((skill) => {
      const row = {
        Skill: group.category,
        Subskill: skill.name,
      };

      levels.forEach((level) => {
        row[level] = skill.levels?.[level] ?? "NA";
      });

      rows.push(row);
    });
  });

  return rows;
}

export default function SkillMatrix({ allowedDisciplines = [], userEmail = "" }) {
  const [filters, setFilters] = useState({
    discipline: "",
    role: "",
    level: "",
    skillCategory: "",
    skillSearch: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [matrixData, setMatrixData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
 const [meta, setMeta] = useState({
  disciplines: [],
  roles: ["Engineer", "Designer"],
  allowedDisciplines: [],
});
  const [metaError, setMetaError] = useState(false);

  const [form, setForm] = useState({
    discipline: "",
    role: "",
    skill: "",
    subskill: "",
    isNewSkill: false,
    isNewSubskill: false,
  });

  const [modalMatrix, setModalMatrix] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // The backend /meta response is the source of truth for discipline access.
  const effectiveAllowedDisciplines = useMemo(() => {
    if (
      Array.isArray(meta.allowedDisciplines) &&
      meta.allowedDisciplines.length > 0
    ) {
      return meta.allowedDisciplines.map(norm).filter(Boolean);
    }

    // Temporary fallback while /meta is loading.
    return Array.isArray(allowedDisciplines)
      ? allowedDisciplines.map(norm).filter(Boolean)
      : [];
  }, [meta.allowedDisciplines, allowedDisciplines]);

  const disciplineOptions = useMemo(() => {
    const hasAllAccess = effectiveAllowedDisciplines.some((item) => {
      const value = keyOfText(item);
      return value === "all" || value === "all disciplines";
    });

    if (hasAllAccess) {
      return Array.isArray(meta.disciplines) ? meta.disciplines : [];
    }

    return effectiveAllowedDisciplines;
  }, [meta.disciplines, effectiveAllowedDisciplines]);

  const isDisciplineLocked =
    disciplineOptions.length === 1 &&
    !["all", "all disciplines"].includes(keyOfText(disciplineOptions[0]));

useEffect(() => {
  let cancelled = false;

  async function loadMeta() {
    try {
      const res = await fetch(`${API_SKILL}/meta?t=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(
          data?.message || `Meta request failed with status ${res.status}`
        );
      }

      if (cancelled) return;

      const disciplines = Array.isArray(data?.disciplines)
        ? data.disciplines.map(norm).filter(Boolean)
        : [];

      const backendAllowedDisciplines = Array.isArray(
        data?.allowedDisciplines
      )
        ? data.allowedDisciplines.map(norm).filter(Boolean)
        : [];

      const roles =
        Array.isArray(data?.roles) && data.roles.length > 0
          ? data.roles
          : ["Engineer", "Designer"];

      console.log("META RESPONSE:", data);
      console.log("VISIBLE DISCIPLINES:", disciplines);
      console.log(
        "BACKEND ALLOWED DISCIPLINES:",
        backendAllowedDisciplines
      );

      setMeta({
        disciplines,
        roles,
        allowedDisciplines: backendAllowedDisciplines,
      });

      setMetaError(false);
    } catch (err) {
      console.error("META LOAD FAILED:", err);

      if (!cancelled) {
        setMeta({
          disciplines: [],
          roles: ["Engineer", "Designer"],
          allowedDisciplines: [],
        });

        setFilters({
  discipline: "",
  role: "",
  level: "",
  skillCategory: "",
  skillSearch: "",
});
        setMetaError(true);
      }
    }
  }

  loadMeta();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    if (!filters.discipline) {
      setFilters((prev) => {
        if (!prev.role && !prev.level) return prev;

        return {
          ...prev,
          role: "",
          level: "",
          skillCategory: "",
          skillSearch: "",
        };
      });

      setMatrixData([]);
      return;
    }

    const autoRole = DISCIPLINE_ROLE_MAP[filters.discipline] || "";

    setFilters((prev) => {
      if (prev.role === autoRole && prev.level === "") return prev;

      return {
        ...prev,
        role: autoRole,
        level: "",
        skillCategory: "",
        skillSearch: "",
      };
    });
  }, [filters.discipline]);

  useEffect(() => {
  if (disciplineOptions.length !== 1) {
    return;
  }

  const onlyDiscipline = disciplineOptions[0];

  if (
    !onlyDiscipline ||
    keyOfText(onlyDiscipline) === "all" ||
    keyOfText(onlyDiscipline) === "all disciplines"
  ) {
    return;
  }

  setFilters((previous) => {
    if (
      keyOfText(previous.discipline) ===
      keyOfText(onlyDiscipline)
    ) {
      return previous;
    }

    return {
      ...previous,
      discipline: onlyDiscipline,
      role: "",
      level: "",
      skillCategory: "",
      skillSearch:"",
    };
  });
}, [disciplineOptions]);

  const fetchMatrix = useCallback(async () => {
    if (!filters.discipline || !filters.role) {
      setMatrixData([]);
      return;
    }

    setLoading(true);

    try {
      const url = `${API_SKILL}?discipline=${encodeURIComponent(
        filters.discipline
      )}&role=${encodeURIComponent(filters.role)}`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.error("MATRIX API FAILED:", res.status, await safeText(res));
        setMatrixData([]);
        return;
      }

      const data = await safeJson(res);
      const levels = ROLE_LEVELS[filters.role] || [];

      setMatrixData(transformApiToMatrix(data || [], levels));
    } catch (err) {
      console.error("FETCH MATRIX FAILED:", err);
      setMatrixData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.discipline, filters.role]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix, refreshKey]);

  useEffect(() => {
    if (!showAddRow) return;

    const discipline = form.discipline || filters.discipline;
    const role = form.role || filters.role;

    if (!discipline || !role) {
      setModalMatrix([]);
      return;
    }

    let alive = true;

    async function loadModalMatrix() {
      setModalLoading(true);

      try {
        const url = `${API_SKILL}?discipline=${encodeURIComponent(
          discipline
        )}&role=${encodeURIComponent(role)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (alive) setModalMatrix([]);
          return;
        }

        const data = await safeJson(res);

        if (alive) {
          setModalMatrix(
            transformApiToMatrix(data || [], ROLE_LEVELS[role] || [])
          );
        }
      } catch (err) {
        console.error("MODAL MATRIX LOAD FAILED:", err);

        if (alive) setModalMatrix([]);
      } finally {
        if (alive) setModalLoading(false);
      }
    }

    loadModalMatrix();

    return () => {
      alive = false;
    };
  }, [
    showAddRow,
    form.discipline,
    form.role,
    filters.discipline,
    filters.role,
  ]);

  const roleOptions = useMemo(() => {
    return meta.roles?.length ? meta.roles : ["Engineer", "Designer"];
  }, [meta.roles]);

  const modalSkillOptions = useMemo(() => {
    return (modalMatrix || []).map((group) => group.category).filter(Boolean);
  }, [modalMatrix]);

  const modalSubskillOptions = useMemo(() => {
    if (!form.skill) return [];

    const group = (modalMatrix || []).find(
      (g) => keyOfText(g.category) === keyOfText(form.skill)
    );

    return (group?.skills || []).map((skill) => skill.name).filter(Boolean);
  }, [modalMatrix, form.skill]);

  function startEditMode() {
    setIsEditMode(true);
  }

  function cancelEdit() {
    setEditedValues({});
    setIsEditMode(false);
    setShowAddRow(false);
  }

  async function saveChanges() {
    const keys = Object.keys(editedValues || {});

    if (!keys.length) {
      // alert("No changes to save");
      setIsEditMode(false);
      return;
    }

    const ok = window.confirm("Do you want to save the changes?");
    if (!ok) return;

    setActionBusy(true);

    try {
      const payload = Object.entries(editedValues).map(([key, value]) => {
        const [Skill, Subskill, LevelKey] = key.split("|");

        return {
          Discipline: norm(filters.discipline),
          Role: norm(filters.role),
          Skill: norm(Skill),
          Subskill: norm(Subskill),
          LevelKey: norm(LevelKey),
          Value: String(value ?? "NA"),
        };
      });

      const res = await fetch(`${API_SKILL}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Save failed");
        return;
      }

      setEditedValues({});
      setIsEditMode(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("SAVE FAILED:", err);
      alert("Save failed");
    } finally {
      setActionBusy(false);
    }
  }

  function openAddModal() {
    if (!isEditMode) startEditMode();

    setForm({
      discipline: filters.discipline || "",
      role: filters.role || "",
      skill: "",
      subskill: "",
      isNewSkill: false,
      isNewSubskill: false,
    });

    setShowAddRow(true);
  }

  async function handleAddRow() {
    const discipline = norm(form.discipline || filters.discipline);
    const role = norm(form.role || filters.role);
    let category = norm(form.skill);
    let subskill = norm(form.subskill);

    if (!discipline || !role || !category || !subskill) {
      alert("Please fill Discipline, Role, Skill Category and Subskill.");
      return;
    }

    const existingCategory = (modalMatrix || []).find(
      (group) => keyOfText(group.category) === keyOfText(category)
    );

    if (existingCategory) {
      category = existingCategory.category;
    }

    const subskillAlreadyExists = !!existingCategory?.skills?.some(
      (skill) => keyOfText(skill.name) === keyOfText(subskill)
    );

    if (subskillAlreadyExists) {
      alert("Skill and Subskill already exists. Not allowed.");
      return;
    }

    const levels = ROLE_LEVELS[role] || [];

    if (!levels.length) {
      alert("Invalid role levels");
      return;
    }

    const payload = [
      {
        Discipline: discipline,
        Role: role,
        Skill: category,
        Subskill: subskill,
        LevelKey: levels[0],
        Value: "NA",
      },
    ];

    setActionBusy(true);

    try {
      const res = await fetch(`${API_SKILL}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Add failed");
        return;
      }

      alert("Added");
      setShowAddRow(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("ADD FAILED:", err);
      alert("Add failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteRow(category, subskillName) {
    const ok = window.confirm(`Delete "${subskillName}" from "${category}"?`);
    if (!ok) return;

    const payload = {
      Discipline: norm(filters.discipline),
      Role: norm(filters.role),
      Skill: norm(category),
      Subskill: norm(subskillName),
    };

    setActionBusy(true);

    try {
      const res = await fetch(`${API_SKILL}/row/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Delete failed");
        return;
      }

      alert("Deleted");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("DELETE FAILED:", err);
      alert("Delete failed");
    } finally {
      setActionBusy(false);
    }
  }

const skillOptions = useMemo(() => {
  const options = [];

  (matrixData || []).forEach((group) => {
    if (group.category) {
      options.push(group.category);
    }

    (group.skills || []).forEach((skill) => {
      if (skill.name) {
        options.push(skill.name);
      }
    });
  });

  return [...new Set(options)];
}, [matrixData]);

// Distinct skill CATEGORIES only (the light-blue group headers), scoped
// to whatever discipline + role is currently loaded in matrixData. No
// extra Databricks round trip is needed — the categories already live
// inside the rows fetched for the selected discipline/role.
const skillCategoryOptions = useMemo(() => {
  const categories = (matrixData || [])
    .map((group) => group.category)
    .filter(Boolean);

  return [...new Set(categories)];
}, [matrixData]);

const filteredMatrixData = useMemo(() => {
  const query = keyOfText(filters.skillSearch);
  const categoryFilter = keyOfText(filters.skillCategory);

  return (matrixData || [])
    .filter((group) => {
      if (!categoryFilter) return true;
      return keyOfText(group.category) === categoryFilter;
    })
    .map((group) => {
      if (!query) {
        return group;
      }

      const categoryMatch = keyOfText(group.category).includes(query);

      if (categoryMatch) {
        return group;
      }

      const matchingSkills = (group.skills || []).filter((skill) =>
        keyOfText(skill.name).includes(query)
      );

      if (!matchingSkills.length) {
        return null;
      }

      return {
        ...group,
        skills: matchingSkills,
      };
    })
    .filter(Boolean);
}, [matrixData, filters.skillSearch, filters.skillCategory]);

  function exportToExcel() {
if (!filteredMatrixData.length) {
      alert("No data to export");
      return;
    }

    const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
    const rows = buildExportRows(filteredMatrixData, filters.role, filters.level);

    const headerRows = [
      ["Project Meridian Export"],
      [],
      ["Discipline", filters.discipline || "-"],
      ["Role", filters.role || "-"],
      ["Level", filters.level || "All levels"],
      [],
      ["Proficiency", "Meaning"],
      ["NA", "Not Applicable"],
      ["1", "Familiar"],
      ["2", "Working Level"],
      ["3", "Extensive"],
      ["4", "Authoritative"],
      [],
    ];

    const tableHeader = Object.keys(rows[0] || { Skill: "", Subskill: "" });
    const tableData = rows.map((row) => tableHeader.map((header) => row[header]));

    const sheetAOA = [...headerRows, tableHeader, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(sheetAOA);

    ws["!cols"] = [
      {
        wch: 22,
      },
      {
        wch: 28,
      },
      ...tableHeader.slice(2).map(() => ({
        wch: 10,
      })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Meridian");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type: "application/octet-stream",
      }),
      `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`
    );
  }

  function exportToPDF() {
    if (!filteredMatrixData.length) {
      alert("No data to export");
      return;
    }

    const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("Project Meridian", 14, 12);

    doc.setFontSize(10);
    doc.text(`Discipline: ${filters.discipline || "-"}`, 14, 18);
    doc.text(`Role: ${filters.role || "-"}`, 14, 23);
    doc.text(`Level: ${filters.level || "All levels"}`, 14, 28);

    autoTable(doc, {
      startY: 32,
      head: [["Proficiency", "Meaning"]],
      body: [
        ["NA", "Not Applicable"],
        ["1", "Familiar"],
        ["2", "Working Level"],
        ["3", "Extensive"],
        ["4", "Authoritative"],
      ],
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [40, 40, 40],
      },
      theme: "grid",
      tableWidth: "wrap",
    });

    const rows = buildExportRows(filteredMatrixData, filters.role, filters.level);

    const columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 6,
      columns,
      body: rows,
      headStyles: {
        fillColor: [40, 40, 40],
      },
      styles: {
        fontSize: 8,
      },
      theme: "grid",
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 285, 200);
      },
    });

    doc.save(
      `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.pdf`
    );
  }

  return (
    <div className="page-container">
      {metaError && (
        <div
          style={{
            background: "#fef3c7",
            color: "#92400e",
            padding: "8px 14px",
            fontSize: "12.5px",
            borderRadius: "10px",
            marginBottom: "10px",
            border: "1px solid #fde68a",
          }}
        >
          Could not load your discipline access. Please log out and log in again.
        </div>
      )}

      {/* <Filters
        filters={filters}
        setFilters={setFilters}
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        canExport={matrixData.length > 0 && !loading}
        disciplineOptions={disciplineOptions}
        isDisciplineLocked={isDisciplineLocked}
      /> */}
      <div className="sticky-filters">
<Filters
  filters={filters}
  setFilters={setFilters}
  onExportExcel={exportToExcel}
  onExportPDF={exportToPDF}
  canExport={filteredMatrixData.length > 0 && !loading}
  disciplineOptions={disciplineOptions}
  isDisciplineLocked={isDisciplineLocked}
  skillOptions={skillOptions}
  skillCategoryOptions={skillCategoryOptions}
/>
</div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "10px 0 12px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn-edit"
              onClick={() => {
                if (!isEditMode) startEditMode();
              }}
              disabled={loading || actionBusy || !filters.discipline || !filters.role}
            >
              ✏ Edit
            </button>

            <button
              className="btn-edit"
              onClick={openAddModal}
              disabled={loading || actionBusy || !filters.discipline || !filters.role}
            >
              ➕ Add Row
            </button>

            {isEditMode && (
              <>
                <button
                  className="btn-save"
                  onClick={saveChanges}
                  disabled={loading || actionBusy}
                >
                  💾 Save
                </button>

                <button
                  className="btn-edit"
                  onClick={cancelEdit}
                  disabled={loading || actionBusy}
                >
                  ✖ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="table-hover-wrapper">
        <div className="table-responsive">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <SkillTable
              data={filteredMatrixData}
              role={filters.role}
              selectedLevel={filters.level}
              editable={isEditMode}
              editedValues={editedValues}
              onEdit={(key, value) =>
  setEditedValues((prev) => ({
    ...prev,
    [key]: value,
  }))
}
              onDeleteRow={handleDeleteRow}
            />
          )}
        </div>

        <div className="hover-legend">
          <span className="legend-title">Proficiency Scale</span>
          <span className="legend-pill l1">NA - Not Applicable</span>
          <span className="legend-pill l2">1 - Familiar</span>
          <span className="legend-pill l3">2 - Working Level</span>
          <span className="legend-pill l4">3 - Extensive</span>
          <span className="legend-pill l5">4 - Authoritative</span>
        </div>
      </div>

      {showAddRow && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ marginTop: 0 }}>Add Skill</h3>

            <label>Discipline</label>
            <select
              value={form.discipline}
              onChange={(event) => {
                const selectedDiscipline = event.target.value;
                const selectedRole = DISCIPLINE_ROLE_MAP[selectedDiscipline] || "";

                setForm((prev) => ({
                  ...prev,
                  discipline: selectedDiscipline,
                  role: selectedRole,
                  skill: "",
                  subskill: "",
                  isNewSkill: false,
                  isNewSubskill: false,
                }));
              }}
              disabled={actionBusy}
            >
              <option value="">Select Discipline</option>
              {disciplineOptions.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
            </select>

            <label>Role</label>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  role: event.target.value,
                  skill: "",
                  subskill: "",
                  isNewSkill: false,
                  isNewSubskill: false,
                }))
              }
              disabled={actionBusy}
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <label>Skill Category</label>
            {!form.isNewSkill ? (
              <select
                value={form.skill}
                disabled={modalLoading || actionBusy}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "__new__") {
                    setForm((prev) => ({
                      ...prev,
                      isNewSkill: true,
                      skill: "",
                      subskill: "",
                      isNewSubskill: false,
                    }));
                    return;
                  }

                  setForm((prev) => ({
                    ...prev,
                    skill: value,
                    subskill: "",
                    isNewSubskill: false,
                  }));
                }}
              >
                <option value="">
                  {modalLoading ? "Loading categories..." : "Select Category"}
                </option>

                {modalSkillOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}

                <option value="__new__">+ Create new category</option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new category"
                  value={form.skill}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      skill: event.target.value,
                    }))
                  }
                  disabled={actionBusy}
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      isNewSkill: false,
                      skill: "",
                      subskill: "",
                    }))
                  }
                  disabled={actionBusy}
                >
                  Use existing category list
                </button>
              </>
            )}

            <label>Subskill</label>
            {form.isNewSkill ? (
              <input
                placeholder="Enter new subskill"
                value={form.subskill}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    subskill: event.target.value,
                  }))
                }
                disabled={actionBusy}
              />
            ) : !form.isNewSubskill ? (
              <select
                value={form.subskill}
                disabled={modalLoading || !form.skill || actionBusy}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "__new__") {
                    setForm((prev) => ({
                      ...prev,
                      isNewSubskill: true,
                      subskill: "",
                    }));
                    return;
                  }

                  setForm((prev) => ({
                    ...prev,
                    subskill: value,
                  }));
                }}
              >
                <option value="">
                  {modalLoading ? "Loading subskills..." : "Select Subskill"}
                </option>

                {modalSubskillOptions.map((subskill) => (
                  <option key={subskill} value={subskill}>
                    {subskill}
                  </option>
                ))}

                <option value="__new__">+ Create new subskill</option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new subskill"
                  value={form.subskill}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      subskill: event.target.value,
                    }))
                  }
                  disabled={actionBusy}
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      isNewSubskill: false,
                      subskill: "",
                    }))
                  }
                  disabled={actionBusy}
                >
                  Use existing subskill list
                </button>
              </>
            )}

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={() => setShowAddRow(false)} disabled={actionBusy}>
                Cancel
              </button>

              <button onClick={handleAddRow} disabled={actionBusy}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}