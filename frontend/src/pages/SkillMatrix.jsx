

// import { useEffect, useCallback, useMemo, useState } from "react";
// import Filters from "../components/Filters";
// import SkillTable from "../components/SkillTable";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// const ROLE_LEVELS = {
//   Engineer: ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"],
//   Designer: ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"],
// };

// const DISCIPLINE_ROLE_MAP = {
//   "Piping Engineering": "Engineer",
//   "Project Management": "Engineer",
//   "Piping Design": "Designer",
//   "Instrumentation": "Designer",
//   "Mechanical": "Engineer",
// };

// // const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";
// const API_BASE =
//   process.env.REACT_APP_API_BASE || "http://localhost:3001";
// const API_SKILL = `${API_BASE}/api/skill-matrix`;

// const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
// const keyOfText = (v) => norm(v).toLowerCase();

// function transformApiToMatrix(rows, roleLevels) {
//   const groups = {};

//   (rows || []).forEach((r) => {
//     const categoryRaw = r.Skill || r.category;
//     const subskillRaw = r.Subskill || r.skill_name;

//     const category = norm(categoryRaw);
//     const subskill = norm(subskillRaw);
//     const level = norm(r.LevelKey || r.level);
//     const value = r.Value ?? r.proficiency ?? "NA";

//     if (!category || !subskill || !level) return;

//     const catKey = keyOfText(category);
//     if (!groups[catKey]) groups[catKey] = { category, skills: [] };

//     let rowObj = groups[catKey].skills.find((s) => keyOfText(s.name) === keyOfText(subskill));
//     if (!rowObj) { rowObj = { name: subskill, levels: {} }; groups[catKey].skills.push(rowObj); }

//     rowObj.levels[level] = value;
//   });

//   Object.values(groups).forEach((g) => {
//     g.skills.forEach((s) => {
//       roleLevels.forEach((lvl) => {
//         if (s.levels[lvl] === undefined || s.levels[lvl] === null || s.levels[lvl] === "") {
//           s.levels[lvl] = "NA";
//         }
//       });
//     });
//   });

//   const out = Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
//   out.forEach((g) => g.skills.sort((a, b) => a.name.localeCompare(b.name)));
//   return out;
// }

// async function safeJson(res) { try { return await res.json(); } catch { return null; } }
// async function safeText(res) { try { return await res.text(); } catch { return ""; } }

// function buildExportRows(matrixData, role, selectedLevel) {
//   const levelsAll = ROLE_LEVELS[role] || [];
//   const levels = selectedLevel ? [selectedLevel] : levelsAll;
//   const rows = [];
//   matrixData.forEach((group) => {
//     group.skills.forEach((skill) => {
//       const row = { Skill: group.category, Subskill: skill.name };
//       levels.forEach((lvl) => { row[lvl] = skill.levels?.[lvl] ?? "NA"; });
//       rows.push(row);
//     });
//   });
//   return rows;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// // ✅ allowedDisciplines comes from App.js (e.g. ["Electrical"])
// export default function SkillMatrix({ allowedDisciplines = [], userEmail = "" }) {
//   const [filters, setFilters] = useState({ discipline: "", role: "", level: "" });
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [matrixData, setMatrixData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editedValues, setEditedValues] = useState({});
//   const [showAddRow, setShowAddRow] = useState(false);
//   const [meta, setMeta] = useState({ disciplines: [], roles: ["Engineer", "Designer"] });
//   const [form, setForm] = useState({ discipline: "", role: "", skill: "", subskill: "", isNewSkill: false, isNewSubskill: false });
//   const [modalMatrix, setModalMatrix] = useState([]);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [actionBusy, setActionBusy] = useState(false);

//   // ✅ Load meta from API
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//      const res = await fetch(`${API_SKILL}/meta`, {
//   method: "GET",
//   credentials: "include",
//   headers: {
//     Accept: "application/json",
//   },
// });

// if (!res.ok) {
//   console.error("META API FAILED:", res.status);
//   return;
// }
//         const data = await safeJson(res);
//         if (!data || cancelled) return;
//         setMeta({
//           disciplines: Array.isArray(data.disciplines) ? data.disciplines : [],
//           roles: Array.isArray(data.roles) && data.roles.length ? data.roles : ["Engineer", "Designer"],
//         });
//       } catch (err) { console.error("META LOAD FAILED:", err); }
//     })();
//     return () => { cancelled = true; };
//   }, []);

//   // ✅ Auto-set role when discipline changes
//   useEffect(() => {
//     if (!filters.discipline) {
//       setFilters((prev) => { if (!prev.role && !prev.level) return prev; return { ...prev, role: "", level: "" }; });
//       setMatrixData([]);
//       return;
//     }
//     const autoRole = DISCIPLINE_ROLE_MAP[filters.discipline] || "";
//     setFilters((prev) => { if (prev.role === autoRole) return prev; return { ...prev, role: autoRole, level: "" }; });
//   }, [filters.discipline]);

//   // ✅ Auto-select discipline if user only has one allowed
//   useEffect(() => {
//     if (allowedDisciplines.length === 1 && !filters.discipline) {
//       setFilters((prev) => ({ ...prev, discipline: allowedDisciplines[0] }));
//     }
//   }, [allowedDisciplines, filters.discipline]);

//   // ✅ Fetch matrix
//   const fetchMatrix = useCallback(async () => {
//     if (!filters.discipline || !filters.role) { setMatrixData([]); return; }
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_SKILL}?discipline=${encodeURIComponent(filters.discipline)}&role=${encodeURIComponent(filters.role)}`);
//       if (!res.ok) { setMatrixData([]); return; }
//       const data = await safeJson(res);
//       setMatrixData(transformApiToMatrix(data || [], ROLE_LEVELS[filters.role] || []));
//     } catch (err) { console.error("FETCH MATRIX FAILED:", err); setMatrixData([]); }
//     finally { setLoading(false); }
//   }, [filters.discipline, filters.role]);

//   useEffect(() => { fetchMatrix(); }, [fetchMatrix, refreshKey]);

//   // ✅ Modal matrix for add row dropdowns
//   useEffect(() => {
//     if (!showAddRow) return;
//     const d = form.discipline || filters.discipline;
//     const r = form.role || filters.role;
//     if (!d || !r) return;
//     let alive = true;
//     (async () => {
//       setModalLoading(true);
//       try {
//         const res = await fetch(`${API_SKILL}?discipline=${encodeURIComponent(d)}&role=${encodeURIComponent(r)}`);
//         if (!res.ok) { if (alive) setModalMatrix([]); return; }
//         const data = await safeJson(res);
//         if (alive) setModalMatrix(transformApiToMatrix(data || [], ROLE_LEVELS[r] || []));
//       } catch (err) { console.error("MODAL MATRIX LOAD FAILED:", err); if (alive) setModalMatrix([]); }
//       finally { if (alive) setModalLoading(false); }
//     })();
//     return () => { alive = false; };
//   }, [showAddRow, form.discipline, form.role, filters.discipline, filters.role]);

// const disciplineOptions = useMemo(() => {
//   if (allowedDisciplines.includes("All")) {
//     return meta.disciplines || [];
//   }

//   if (allowedDisciplines.length > 0) {
//     return allowedDisciplines;
//   }

//   return meta.disciplines || [];
// }, [meta.disciplines, allowedDisciplines]);

//   const roleOptions = useMemo(() => (meta.roles?.length ? meta.roles : ["Engineer", "Designer"]), [meta.roles]);

//   const modalSkillOptions = useMemo(() => (modalMatrix || []).map((g) => g.category).filter(Boolean), [modalMatrix]);
//   const modalSubskillOptions = useMemo(() => {
//     if (!form.skill) return [];
//     const grp = (modalMatrix || []).find((g) => keyOfText(g.category) === keyOfText(form.skill));
//     return (grp?.skills || []).map((s) => s.name).filter(Boolean);
//   }, [modalMatrix, form.skill]);

//   function startEditMode() { setIsEditMode(true); }
//   function cancelEdit() { setEditedValues({}); setIsEditMode(false); setShowAddRow(false); }

//   async function saveChanges() {
//     const keys = Object.keys(editedValues || {});
//     if (!keys.length) { alert("No changes to save"); setIsEditMode(false); return; }
//     const ok = window.confirm("Do you want to save the changes?");
//     if (!ok) return;
//     setActionBusy(true);
//     try {
//       const payload = Object.entries(editedValues).map(([key, value]) => {
//         const [Skill, Subskill, LevelKey] = key.split("|");
//         return { Discipline: norm(filters.discipline), Role: norm(filters.role), Skill: norm(Skill), Subskill: norm(Subskill), LevelKey: norm(LevelKey), Value: String(value ?? "NA") };
//       });
// const res = await fetch(`${API_SKILL}/save`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify(payload),
// });      if (!res.ok) { alert((await safeText(res)) || "Save failed"); return; }
//       setEditedValues({}); setIsEditMode(false); setRefreshKey((k) => k + 1);
//     } catch (err) { console.error("SAVE FAILED:", err); alert("Save failed"); }
//     finally { setActionBusy(false); }
//   }

//   function openAddModal() {
//     if (!isEditMode) startEditMode();
//     setForm({ discipline: filters.discipline || "", role: filters.role || "", skill: "", subskill: "", isNewSkill: false, isNewSubskill: false });
//     setShowAddRow(true);
//   }

//   async function handleAddRow() {
//     const d = norm(form.discipline || filters.discipline);
//     const r = norm(form.role || filters.role);
//     let cat = norm(form.skill);
//     let ss = norm(form.subskill);
//     if (!d || !r || !cat || !ss) { alert("Please fill Discipline, Role, Skill (Category) and Subskill."); return; }
//     const catExisting = (modalMatrix || []).find((g) => keyOfText(g.category) === keyOfText(cat));
//     if (catExisting) cat = catExisting.category;
//     const subExists = !!catExisting?.skills?.some((s) => keyOfText(s.name) === keyOfText(ss));
//     if (subExists) { alert("Skill + Subskill already exists. Not allowed."); return; }
//     const levels = ROLE_LEVELS[r] || [];
//     if (!levels.length) { alert("Invalid role levels"); return; }
//     const payload = [{ Discipline: d, Role: r, Skill: cat, Subskill: ss, LevelKey: levels[0], Value: "NA" }];
//     setActionBusy(true);
//     try {
// const res = await fetch(`${API_SKILL}/save`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify(payload),
// });      if (!res.ok) { alert((await safeText(res)) || "Add failed"); return; }
//       alert("Added"); setShowAddRow(false); setRefreshKey((k) => k + 1);
//     } catch (err) { console.error("ADD FAILED:", err); alert("Add failed"); }
//     finally { setActionBusy(false); }
//   }

//   async function handleDeleteRow(category, subskillName) {
//     const ok = window.confirm(`Delete "${subskillName}" from "${category}"?`);
//     if (!ok) return;
//     const payload = { Discipline: norm(filters.discipline), Role: norm(filters.role), Skill: norm(category), Subskill: norm(subskillName) };
//     setActionBusy(true);
//     try {
// const res = await fetch(`${API_SKILL}/row/delete`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify(payload),
// });      if (!res.ok) { alert((await safeText(res)) || "Delete failed"); return; }
//       alert("Deleted"); setRefreshKey((k) => k + 1);
//     } catch (err) { console.error("DELETE FAILED:", err); alert("Delete failed"); }
//     finally { setActionBusy(false); }
//   }

//   function exportToExcel() {
//     if (!matrixData.length) { alert("No data to export"); return; }
//     const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
//     const rows = buildExportRows(matrixData, filters.role, filters.level);
//     const headerRows = [
//       ["Project Meridian Export"], [],
//       ["Discipline", filters.discipline || "-"],
//       ["Role", filters.role || "-"],
//       ["Level", filters.level || "All levels"], [],
//       ["Proficiency", "Meaning"],
//       ["NA", "Not Applicable"], ["1", "Familiar"], ["2", "Working Level"], ["3", "Extensive"], ["4", "Authoritative"], [],
//     ];
//     const tableHeader = Object.keys(rows[0] || { Skill: "", Subskill: "" });
//     const tableData = rows.map((r) => tableHeader.map((h) => r[h]));
//     const sheetAOA = [...headerRows, tableHeader, ...tableData];
//     const ws = XLSX.utils.aoa_to_sheet(sheetAOA);
//     ws["!cols"] = [{ wch: 22 }, { wch: 28 }, ...tableHeader.slice(2).map(() => ({ wch: 10 }))];
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Project Meridian");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`);
//   }

//   function exportToPDF() {
//     if (!matrixData.length) { alert("No data to export"); return; }
//     const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
//     const doc = new jsPDF("landscape");
//     doc.setFontSize(16); doc.text("Project Meridian", 14, 12);
//     doc.setFontSize(10);
//     doc.text(`Discipline: ${filters.discipline || "-"}`, 14, 18);
//     doc.text(`Role: ${filters.role || "-"}`, 14, 23);
//     doc.text(`Level: ${filters.level || "All levels"}`, 14, 28);
//     autoTable(doc, { startY: 32, head: [["Proficiency", "Meaning"]], body: [["NA", "Not Applicable"], ["1", "Familiar"], ["2", "Working Level"], ["3", "Extensive"], ["4", "Authoritative"]], styles: { fontSize: 9 }, headStyles: { fillColor: [40, 40, 40] }, theme: "grid", tableWidth: "wrap" });
//     const rows = buildExportRows(matrixData, filters.role, filters.level);
//     const columns = Object.keys(rows[0]).map((k) => ({ header: k, dataKey: k }));
//     autoTable(doc, { startY: doc.lastAutoTable.finalY + 6, columns, body: rows, headStyles: { fillColor: [40, 40, 40] }, styles: { fontSize: 8 }, theme: "grid", didDrawPage: () => { doc.setFontSize(8); doc.text(`Page ${doc.internal.getNumberOfPages()}`, 285, 200); } });
//     doc.save(`Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.pdf`);
//   }

//   return (
//     <div className="page-container">
//       <Filters
//         filters={filters}
//         setFilters={setFilters}
//         onExportExcel={exportToExcel}
//         onExportPDF={exportToPDF}
//         canExport={matrixData.length > 0 && !loading}
//         // ✅ Pass filtered discipline options to Filters component
//         disciplineOptions={disciplineOptions}
//       />

//       <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0 12px 0" }}>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
//           <div style={{ display: "flex", gap: "8px" }}>
//             <button className="btn-edit" onClick={() => { if (!isEditMode) startEditMode(); }} disabled={loading || actionBusy}>✏ Edit</button>
//             <button className="btn-edit" onClick={openAddModal} disabled={loading || actionBusy}>➕ Add Row</button>
//             {isEditMode && (
//               <>
//                 <button className="btn-save" onClick={saveChanges} disabled={loading || actionBusy}>💾 Save</button>
//                 <button className="btn-edit" onClick={cancelEdit} disabled={loading || actionBusy}>✖ Cancel</button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="table-hover-wrapper">
//         <div className="table-responsive">
//           {loading ? (
//             <div>Loading...</div>
//           ) : (
//             <SkillTable
//               data={matrixData}
//               role={filters.role}
//               selectedLevel={filters.level}
//               editable={isEditMode}
//               editedValues={editedValues}
//               onEdit={(key, value) => setEditedValues((prev) => ({ ...prev, [key]: value }))}
//               onDeleteRow={handleDeleteRow}
//             />
//           )}
//         </div>
//         <div className="hover-legend">
//           <span className="legend-title">Proficiency Scale</span>
//           <span className="legend-pill l1">NA - Not Applicable</span>
//           <span className="legend-pill l2">1 - Familiar</span>
//           <span className="legend-pill l3">2 - Working Level</span>
//           <span className="legend-pill l4">3 - Extensive</span>
//           <span className="legend-pill l5">4 - Authoritative</span>
//         </div>
//       </div>

//       {showAddRow && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3 style={{ marginTop: 0 }}>Add Skill</h3>

//             <label>Discipline</label>
//             <select value={form.discipline} onChange={(e) => setForm((p) => ({ ...p, discipline: e.target.value, skill: "", subskill: "" }))} disabled={actionBusy}>
//               <option value="">Select Discipline</option>
//               {/* ✅ Modal discipline list also restricted */}
//               {disciplineOptions.map((d) => <option key={d} value={d}>{d}</option>)}
//             </select>

//             <label>Role</label>
//             <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value, skill: "", subskill: "" }))} disabled={actionBusy}>
//               <option value="">Select Role</option>
//               {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
//             </select>

//             <label>Skill (Category)</label>
//             {!form.isNewSkill ? (
//               <select value={form.skill} disabled={modalLoading || actionBusy} onChange={(e) => {
//                 const v = e.target.value;
//                 if (v === "__new__") { setForm((p) => ({ ...p, isNewSkill: true, skill: "", subskill: "", isNewSubskill: false })); return; }
//                 setForm((p) => ({ ...p, skill: v, subskill: "", isNewSubskill: false }));
//               }}>
//                 <option value="">{modalLoading ? "Loading categories..." : "Select Category"}</option>
//                 {modalSkillOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                 <option value="__new__">+ Create new category</option>
//               </select>
//             ) : (
//               <>
//                 <input placeholder="Enter new category" value={form.skill} onChange={(e) => setForm((p) => ({ ...p, skill: e.target.value }))} disabled={actionBusy} />
//                 <button type="button" className="link-btn" onClick={() => setForm((p) => ({ ...p, isNewSkill: false, skill: "", subskill: "" }))} disabled={actionBusy}>Use existing category list</button>
//               </>
//             )}

//             <label>Subskill</label>
//             {form.isNewSkill ? (
//               <input placeholder="Enter new subskill" value={form.subskill} onChange={(e) => setForm((p) => ({ ...p, subskill: e.target.value }))} disabled={actionBusy} />
//             ) : !form.isNewSubskill ? (
//               <select value={form.subskill} disabled={modalLoading || !form.skill || actionBusy} onChange={(e) => {
//                 const v = e.target.value;
//                 if (v === "__new__") { setForm((p) => ({ ...p, isNewSubskill: true, subskill: "" })); return; }
//                 setForm((p) => ({ ...p, subskill: v }));
//               }}>
//                 <option value="">{modalLoading ? "Loading subskills..." : "Select Subskill"}</option>
//                 {modalSubskillOptions.map((ss) => <option key={ss} value={ss}>{ss}</option>)}
//                 <option value="__new__">+ Create new subskill</option>
//               </select>
//             ) : (
//               <>
//                 <input placeholder="Enter new subskill" value={form.subskill} onChange={(e) => setForm((p) => ({ ...p, subskill: e.target.value }))} disabled={actionBusy} />
//                 <button type="button" className="link-btn" onClick={() => setForm((p) => ({ ...p, isNewSubskill: false, subskill: "" }))} disabled={actionBusy}>Use existing subskill list</button>
//               </>
//             )}

//             <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
//               <button onClick={() => setShowAddRow(false)} disabled={actionBusy}>Cancel</button>
//               <button onClick={handleAddRow} disabled={actionBusy}>Add</button>
//             </div>
//           </div>
//         </div>
//       )}
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
  Engineer: ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"],
  Designer: ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"],
};

const DISCIPLINE_ROLE_MAP = {
  "Piping Engineering": "Engineer",
  "Project Management": "Engineer",
"Instrumentation": "Designer",
};

const DEFAULT_DISCIPLINES = [
  "Project Management",
  "Process",
  "Mechanical",
  "CSA",
  "Piping Design",
  "Piping Engineering",
  "Instrumentation",
  "Electrical",
];

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
    if (!groups[catKey]) groups[catKey] = { category, skills: [] };

    let rowObj = groups[catKey].skills.find(
      (s) => keyOfText(s.name) === keyOfText(subskill)
    );

    if (!rowObj) {
      rowObj = { name: subskill, levels: {} };
      groups[catKey].skills.push(rowObj);
    }

    rowObj.levels[level] = value;
  });

  Object.values(groups).forEach((g) => {
    g.skills.forEach((s) => {
      roleLevels.forEach((lvl) => {
        if (
          s.levels[lvl] === undefined ||
          s.levels[lvl] === null ||
          s.levels[lvl] === ""
        ) {
          s.levels[lvl] = "NA";
        }
      });
    });
  });

  const out = Object.values(groups).sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  out.forEach((g) =>
    g.skills.sort((a, b) => a.name.localeCompare(b.name))
  );

  return out;
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
  const levelsAll = ROLE_LEVELS[role] || [];
  const levels = selectedLevel ? [selectedLevel] : levelsAll;
  const rows = [];

  matrixData.forEach((group) => {
    group.skills.forEach((skill) => {
      const row = { Skill: group.category, Subskill: skill.name };
      levels.forEach((lvl) => {
        row[lvl] = skill.levels?.[lvl] ?? "NA";
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

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const res = await fetch(`${API_SKILL}/meta`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          console.error("META API FAILED:", res.status);

          if (!cancelled) {
            setMeta({
              disciplines: DEFAULT_DISCIPLINES,
              roles: ["Engineer", "Designer"],
            });
            setMetaError(true);
          }
          return;
        }

        const data = await safeJson(res);
        if (cancelled) return;

        const disciplines =
          Array.isArray(data?.disciplines) && data.disciplines.length
            ? data.disciplines
            : DEFAULT_DISCIPLINES;

        const roles =
          Array.isArray(data?.roles) && data.roles.length
            ? data.roles
            : ["Engineer", "Designer"];

        setMeta({ disciplines, roles });
        setMetaError(false);
      } catch (err) {
        console.error("META LOAD FAILED:", err);

        if (!cancelled) {
          setMeta({
            disciplines: DEFAULT_DISCIPLINES,
            roles: ["Engineer", "Designer"],
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
        return { ...prev, role: "", level: "" };
      });
      setMatrixData([]);
      return;
    }

    const autoRole = DISCIPLINE_ROLE_MAP[filters.discipline] || "";

    setFilters((prev) => {
      if (prev.role === autoRole) return prev;
      return { ...prev, role: autoRole, level: "" };
    });
  }, [filters.discipline]);

  useEffect(() => {
    const onlyDiscipline = allowedDisciplines[0];

    if (
      allowedDisciplines.length === 1 &&
      onlyDiscipline &&
      keyOfText(onlyDiscipline) !== "all" &&
      !filters.discipline
    ) {
      setFilters((prev) => ({
        ...prev,
        discipline: onlyDiscipline,
      }));
    }
  }, [allowedDisciplines, filters.discipline]);

  const fetchMatrix = useCallback(async () => {
    if (!filters.discipline || !filters.role) {
      setMatrixData([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_SKILL}?discipline=${encodeURIComponent(
          filters.discipline
        )}&role=${encodeURIComponent(filters.role)}`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      if (!res.ok) {
        console.error("MATRIX API FAILED:", res.status);
        setMatrixData([]);
        return;
      }

      const data = await safeJson(res);
      setMatrixData(
        transformApiToMatrix(data || [], ROLE_LEVELS[filters.role] || [])
      );
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

    const d = form.discipline || filters.discipline;
    const r = form.role || filters.role;

    if (!d || !r) return;

    let alive = true;

    async function loadModalMatrix() {
      setModalLoading(true);

      try {
        const res = await fetch(
          `${API_SKILL}?discipline=${encodeURIComponent(
            d
          )}&role=${encodeURIComponent(r)}`,
          {
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (!res.ok) {
          if (alive) setModalMatrix([]);
          return;
        }

        const data = await safeJson(res);

        if (alive) {
          setModalMatrix(
            transformApiToMatrix(data || [], ROLE_LEVELS[r] || [])
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
  }, [showAddRow, form.discipline, form.role, filters.discipline, filters.role]);

  const disciplineOptions = useMemo(() => {
    const hasAllAccess = allowedDisciplines.some(
      (item) => keyOfText(item) === "all"
    );

    if (hasAllAccess) {
      return meta.disciplines?.length
        ? meta.disciplines
        : DEFAULT_DISCIPLINES;
    }

    if (allowedDisciplines.length > 0) {
      return allowedDisciplines;
    }

    return meta.disciplines?.length
      ? meta.disciplines
      : DEFAULT_DISCIPLINES;
  }, [meta.disciplines, allowedDisciplines]);

  const roleOptions = useMemo(
    () =>
      meta.roles?.length ? meta.roles : ["Engineer", "Designer"],
    [meta.roles]
  );

  const modalSkillOptions = useMemo(
    () => (modalMatrix || []).map((g) => g.category).filter(Boolean),
    [modalMatrix]
  );

  const modalSubskillOptions = useMemo(() => {
    if (!form.skill) return [];

    const grp = (modalMatrix || []).find(
      (g) => keyOfText(g.category) === keyOfText(form.skill)
    );

    return (grp?.skills || []).map((s) => s.name).filter(Boolean);
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
      alert("No changes to save");
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Save failed");
        return;
      }

      setEditedValues({});
      setIsEditMode(false);
      setRefreshKey((k) => k + 1);
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
    const d = norm(form.discipline || filters.discipline);
    const r = norm(form.role || filters.role);
    let cat = norm(form.skill);
    let ss = norm(form.subskill);

    if (!d || !r || !cat || !ss) {
      alert("Please fill Discipline, Role, Skill (Category) and Subskill.");
      return;
    }

    const catExisting = (modalMatrix || []).find(
      (g) => keyOfText(g.category) === keyOfText(cat)
    );

    if (catExisting) cat = catExisting.category;

    const subExists = !!catExisting?.skills?.some(
      (s) => keyOfText(s.name) === keyOfText(ss)
    );

    if (subExists) {
      alert("Skill + Subskill already exists. Not allowed.");
      return;
    }

    const levels = ROLE_LEVELS[r] || [];

    if (!levels.length) {
      alert("Invalid role levels");
      return;
    }

    const payload = [
      {
        Discipline: d,
        Role: r,
        Skill: cat,
        Subskill: ss,
        LevelKey: levels[0],
        Value: "NA",
      },
    ];

    setActionBusy(true);

    try {
      const res = await fetch(`${API_SKILL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Add failed");
        return;
      }

      alert("Added");
      setShowAddRow(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("ADD FAILED:", err);
      alert("Add failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteRow(category, subskillName) {
    const ok = window.confirm(
      `Delete "${subskillName}" from "${category}"?`
    );

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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert((await safeText(res)) || "Delete failed");
        return;
      }

      alert("Deleted");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("DELETE FAILED:", err);
      alert("Delete failed");
    } finally {
      setActionBusy(false);
    }
  }

  function exportToExcel() {
    if (!matrixData.length) {
      alert("No data to export");
      return;
    }

    const levelPart = filters.level
      ? `_${filters.level}`
      : "_ALLLEVELS";

    const rows = buildExportRows(
      matrixData,
      filters.role,
      filters.level
    );

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

    const tableHeader = Object.keys(
      rows[0] || { Skill: "", Subskill: "" }
    );

    const tableData = rows.map((r) =>
      tableHeader.map((h) => r[h])
    );

    const sheetAOA = [...headerRows, tableHeader, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(sheetAOA);

    ws["!cols"] = [
      { wch: 22 },
      { wch: 28 },
      ...tableHeader.slice(2).map(() => ({ wch: 10 })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Meridian");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`
    );
  }

  function exportToPDF() {
    if (!matrixData.length) {
      alert("No data to export");
      return;
    }

    const levelPart = filters.level
      ? `_${filters.level}`
      : "_ALLLEVELS";

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
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] },
      theme: "grid",
      tableWidth: "wrap",
    });

    const rows = buildExportRows(
      matrixData,
      filters.role,
      filters.level
    );

    const columns = Object.keys(rows[0]).map((k) => ({
      header: k,
      dataKey: k,
    }));

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 6,
      columns,
      body: rows,
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 8 },
      theme: "grid",
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          285,
          200
        );
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
          Could not load the discipline list from the API. Showing the default list.
        </div>
      )}

      <Filters
        filters={filters}
        setFilters={setFilters}
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        canExport={matrixData.length > 0 && !loading}
        disciplineOptions={disciplineOptions}
      />

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
              disabled={loading || actionBusy}
            >
              ✏ Edit
            </button>

            <button
              className="btn-edit"
              onClick={openAddModal}
              disabled={loading || actionBusy}
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
              data={matrixData}
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
              onChange={(e) => {
                const selectedDiscipline = e.target.value;
                const selectedRole =
                  DISCIPLINE_ROLE_MAP[selectedDiscipline] || "";

                setForm((p) => ({
                  ...p,
                  discipline: selectedDiscipline,
                  role: selectedRole,
                  skill: "",
                  subskill: "",
                }));
              }}
              disabled={actionBusy}
            >
              <option value="">Select Discipline</option>
              {disciplineOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  role: e.target.value,
                  skill: "",
                  subskill: "",
                }))
              }
              disabled={actionBusy}
            >
              <option value="">Select Role</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label>Skill (Category)</label>
            {!form.isNewSkill ? (
              <select
                value={form.skill}
                disabled={modalLoading || actionBusy}
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "__new__") {
                    setForm((p) => ({
                      ...p,
                      isNewSkill: true,
                      skill: "",
                      subskill: "",
                      isNewSubskill: false,
                    }));
                    return;
                  }

                  setForm((p) => ({
                    ...p,
                    skill: v,
                    subskill: "",
                    isNewSubskill: false,
                  }));
                }}
              >
                <option value="">
                  {modalLoading
                    ? "Loading categories..."
                    : "Select Category"}
                </option>

                {modalSkillOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

                <option value="__new__">+ Create new category</option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new category"
                  value={form.skill}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      skill: e.target.value,
                    }))
                  }
                  disabled={actionBusy}
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
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
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    subskill: e.target.value,
                  }))
                }
                disabled={actionBusy}
              />
            ) : !form.isNewSubskill ? (
              <select
                value={form.subskill}
                disabled={modalLoading || !form.skill || actionBusy}
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "__new__") {
                    setForm((p) => ({
                      ...p,
                      isNewSubskill: true,
                      subskill: "",
                    }));
                    return;
                  }

                  setForm((p) => ({
                    ...p,
                    subskill: v,
                  }));
                }}
              >
                <option value="">
                  {modalLoading
                    ? "Loading subskills..."
                    : "Select Subskill"}
                </option>

                {modalSubskillOptions.map((ss) => (
                  <option key={ss} value={ss}>
                    {ss}
                  </option>
                ))}

                <option value="__new__">+ Create new subskill</option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new subskill"
                  value={form.subskill}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subskill: e.target.value,
                    }))
                  }
                  disabled={actionBusy}
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
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
              <button
                onClick={() => setShowAddRow(false)}
                disabled={actionBusy}
              >
                Cancel
              </button>

              <button
                onClick={handleAddRow}
                disabled={actionBusy}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}