

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
//         const res = await fetch(`${API_SKILL}/meta`);
//         if (!res.ok) return;
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
// if (allowedDisciplines.includes("All")) {
//   return meta.disciplines?.length ? meta.disciplines : [];
// }

// if (allowedDisciplines.length > 0) {
//   return allowedDisciplines;
// }
//   // Fallback for admin/no restriction: use meta
//   return meta.disciplines?.length ? meta.disciplines : [];
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



import { useCallback, useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import SkillTable from "../components/SkillTable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

const API_SKILL = `${API_BASE}/api/skill-matrix`;

const ALL_DISCIPLINES = [
  "Project Management",
  "Process",
  "Mechanical",
  "CSA",
  "Piping Design",
  "Piping Engineering",
  "Instrumentation",
  "Electrical",
];

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
  Process: "Engineer",
  Mechanical: "Engineer",
  CSA: "Engineer",
  "Piping Design": "Designer",
  "Piping Engineering": "Engineer",
  Instrumentation: "Designer",
  Electrical: "Engineer",
};

const norm = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const keyOfText = (value) => norm(value).toLowerCase();

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function readText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function transformApiToMatrix(rows, roleLevels) {
  const groups = {};

  (rows || []).forEach((row) => {
    const category = norm(row.Skill || row.category);
    const subskill = norm(row.Subskill || row.skill_name);
    const level = norm(row.LevelKey || row.level);
    const value = row.Value ?? row.proficiency ?? "NA";

    if (!category || !subskill || !level) {
      return;
    }

    const categoryKey = keyOfText(category);

    if (!groups[categoryKey]) {
      groups[categoryKey] = {
        category,
        skills: [],
      };
    }

    let skillRow = groups[categoryKey].skills.find(
      (item) => keyOfText(item.name) === keyOfText(subskill)
    );

    if (!skillRow) {
      skillRow = {
        name: subskill,
        levels: {},
      };

      groups[categoryKey].skills.push(skillRow);
    }

    skillRow.levels[level] = String(value ?? "NA");
  });

  Object.values(groups).forEach((group) => {
    group.skills.forEach((skill) => {
      roleLevels.forEach((level) => {
        const currentValue = skill.levels[level];

        if (
          currentValue === undefined ||
          currentValue === null ||
          currentValue === ""
        ) {
          skill.levels[level] = "NA";
        }
      });
    });
  });

  const result = Object.values(groups).sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  result.forEach((group) => {
    group.skills.sort((a, b) => a.name.localeCompare(b.name));
  });

  return result;
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

export default function SkillMatrix({
  allowedDisciplines = [],
  userEmail = "",
}) {
  const [filters, setFilters] = useState({
    discipline: "",
    role: "",
    level: "",
  });

  const [meta, setMeta] = useState({
    disciplines: ALL_DISCIPLINES,
    roles: ["Engineer", "Designer"],
  });

  const [matrixData, setMatrixData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  const [showAddRow, setShowAddRow] = useState(false);
  const [modalMatrix, setModalMatrix] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState({
    discipline: "",
    role: "",
    skill: "",
    subskill: "",
    isNewSkill: false,
    isNewSubskill: false,
  });

  /*
   * Load disciplines and roles.
   *
   * The local ALL_DISCIPLINES list is used as a fallback if the
   * backend /meta request fails.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setMetaLoading(true);

      try {
        const response = await fetch(`${API_SKILL}/meta`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Meta request failed with HTTP ${response.status}`
          );
        }

        if (cancelled) {
          return;
        }

        setMeta({
          disciplines:
            Array.isArray(data?.disciplines) && data.disciplines.length > 0
              ? data.disciplines
              : ALL_DISCIPLINES,

          roles:
            Array.isArray(data?.roles) && data.roles.length > 0
              ? data.roles
              : ["Engineer", "Designer"],
        });
      } catch (error) {
        console.error("META LOAD FAILED:", error);

        if (!cancelled) {
          setMeta({
            disciplines: ALL_DISCIPLINES,
            roles: ["Engineer", "Designer"],
          });
        }
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Determine which disciplines the current user may see.
   *
   * ["All"] means show every discipline.
   */
  const disciplineOptions = useMemo(() => {
    const availableDisciplines =
      Array.isArray(meta.disciplines) && meta.disciplines.length > 0
        ? meta.disciplines
        : ALL_DISCIPLINES;

    const normalizedAllowed = Array.isArray(allowedDisciplines)
      ? allowedDisciplines.map((item) => keyOfText(item))
      : [];

    const hasAllAccess = normalizedAllowed.includes("all");

    if (hasAllAccess) {
      return availableDisciplines;
    }

    if (normalizedAllowed.length > 0) {
      return availableDisciplines.filter((discipline) =>
        normalizedAllowed.includes(keyOfText(discipline))
      );
    }

    return availableDisciplines;
  }, [allowedDisciplines, meta.disciplines]);

  const roleOptions = useMemo(() => {
    return Array.isArray(meta.roles) && meta.roles.length > 0
      ? meta.roles
      : ["Engineer", "Designer"];
  }, [meta.roles]);

  /*
   * Automatically select the discipline when the user only has access
   * to one discipline.
   */
  useEffect(() => {
    if (
      disciplineOptions.length === 1 &&
      filters.discipline !== disciplineOptions[0]
    ) {
      setFilters({
        discipline: disciplineOptions[0],
        role: "",
        level: "",
      });
    }
  }, [disciplineOptions, filters.discipline]);

  /*
   * Clear a selected discipline if it is no longer authorized.
   */
  useEffect(() => {
    if (!filters.discipline) {
      return;
    }

    const isAllowed = disciplineOptions.some(
      (discipline) =>
        keyOfText(discipline) === keyOfText(filters.discipline)
    );

    if (!isAllowed) {
      setFilters({
        discipline: "",
        role: "",
        level: "",
      });

      setMatrixData([]);
    }
  }, [disciplineOptions, filters.discipline]);

  /*
   * Automatically select the correct role for the selected discipline.
   */
  useEffect(() => {
    if (!filters.discipline) {
      setFilters((previous) => {
        if (!previous.role && !previous.level) {
          return previous;
        }

        return {
          ...previous,
          role: "",
          level: "",
        };
      });

      setMatrixData([]);
      return;
    }

    const automaticRole =
      DISCIPLINE_ROLE_MAP[filters.discipline] || "";

    setFilters((previous) => {
      if (previous.role === automaticRole) {
        return previous;
      }

      return {
        ...previous,
        role: automaticRole,
        level: "",
      };
    });
  }, [filters.discipline]);

  /*
   * Load the main skill matrix.
   */
  const fetchMatrix = useCallback(async () => {
    if (!filters.discipline || !filters.role) {
      setMatrixData([]);
      return;
    }

    setLoading(true);

    try {
      const query = new URLSearchParams({
        discipline: filters.discipline,
        role: filters.role,
      });

      const response = await fetch(`${API_SKILL}?${query.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Matrix request failed with HTTP ${response.status}`
        );
      }

      const levels = ROLE_LEVELS[filters.role] || [];

      setMatrixData(
        transformApiToMatrix(Array.isArray(data) ? data : [], levels)
      );
    } catch (error) {
      console.error("FETCH MATRIX FAILED:", error);
      setMatrixData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.discipline, filters.role]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix, refreshKey]);

  /*
   * Load existing skill and subskill values for the Add Row modal.
   */
  useEffect(() => {
    if (!showAddRow) {
      return;
    }

    const discipline = form.discipline || filters.discipline;
    const role = form.role || filters.role;

    if (!discipline || !role) {
      setModalMatrix([]);
      return;
    }

    let active = true;

    async function loadModalMatrix() {
      setModalLoading(true);

      try {
        const query = new URLSearchParams({
          discipline,
          role,
        });

        const response = await fetch(`${API_SKILL}?${query.toString()}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Modal data request failed with HTTP ${response.status}`
          );
        }

        if (!active) {
          return;
        }

        setModalMatrix(
          transformApiToMatrix(
            Array.isArray(data) ? data : [],
            ROLE_LEVELS[role] || []
          )
        );
      } catch (error) {
        console.error("MODAL MATRIX LOAD FAILED:", error);

        if (active) {
          setModalMatrix([]);
        }
      } finally {
        if (active) {
          setModalLoading(false);
        }
      }
    }

    loadModalMatrix();

    return () => {
      active = false;
    };
  }, [
    showAddRow,
    form.discipline,
    form.role,
    filters.discipline,
    filters.role,
  ]);

  const modalSkillOptions = useMemo(() => {
    return (modalMatrix || [])
      .map((group) => group.category)
      .filter(Boolean);
  }, [modalMatrix]);

  const modalSubskillOptions = useMemo(() => {
    if (!form.skill) {
      return [];
    }

    const group = (modalMatrix || []).find(
      (item) =>
        keyOfText(item.category) === keyOfText(form.skill)
    );

    return (group?.skills || [])
      .map((skill) => skill.name)
      .filter(Boolean);
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
    const changedEntries = Object.entries(editedValues || {});

    if (changedEntries.length === 0) {
      alert("No changes to save.");
      setIsEditMode(false);
      return;
    }

    const confirmed = window.confirm(
      "Do you want to save the changes?"
    );

    if (!confirmed) {
      return;
    }

    const payload = changedEntries.map(([key, value]) => {
      const [skill, subskill, levelKey] = key.split("|");

      return {
        Discipline: norm(filters.discipline),
        Role: norm(filters.role),
        Skill: norm(skill),
        Subskill: norm(subskill),
        LevelKey: norm(levelKey),
        Value: String(value ?? "NA"),
      };
    });

    setActionBusy(true);

    try {
      const response = await fetch(`${API_SKILL}/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readText(response);
        throw new Error(message || "Save failed.");
      }

      setEditedValues({});
      setIsEditMode(false);
      setRefreshKey((current) => current + 1);

      alert("Changes saved successfully.");
    } catch (error) {
      console.error("SAVE FAILED:", error);
      alert(error.message || "Save failed.");
    } finally {
      setActionBusy(false);
    }
  }

  function openAddModal() {
    if (!isEditMode) {
      setIsEditMode(true);
    }

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
    const discipline = norm(
      form.discipline || filters.discipline
    );

    const role = norm(form.role || filters.role);
    let skill = norm(form.skill);
    let subskill = norm(form.subskill);

    if (!discipline || !role || !skill || !subskill) {
      alert(
        "Please fill Discipline, Role, Skill Category and Subskill."
      );
      return;
    }

    const existingCategory = (modalMatrix || []).find(
      (group) =>
        keyOfText(group.category) === keyOfText(skill)
    );

    if (existingCategory) {
      skill = existingCategory.category;
    }

    const subskillAlreadyExists =
      existingCategory?.skills?.some(
        (item) =>
          keyOfText(item.name) === keyOfText(subskill)
      ) || false;

    if (subskillAlreadyExists) {
      alert("This Skill and Subskill already exists.");
      return;
    }

    const levels = ROLE_LEVELS[role] || [];

    if (levels.length === 0) {
      alert("No levels are configured for this role.");
      return;
    }

    const payload = [
      {
        Discipline: discipline,
        Role: role,
        Skill: skill,
        Subskill: subskill,
        LevelKey: levels[0],
        Value: "NA",
      },
    ];

    setActionBusy(true);

    try {
      const response = await fetch(`${API_SKILL}/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readText(response);
        throw new Error(message || "Add row failed.");
      }

      setShowAddRow(false);
      setRefreshKey((current) => current + 1);

      alert("Skill added successfully.");
    } catch (error) {
      console.error("ADD FAILED:", error);
      alert(error.message || "Add failed.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteRow(category, subskillName) {
    const confirmed = window.confirm(
      `Delete "${subskillName}" from "${category}"?`
    );

    if (!confirmed) {
      return;
    }

    const payload = {
      Discipline: norm(filters.discipline),
      Role: norm(filters.role),
      Skill: norm(category),
      Subskill: norm(subskillName),
    };

    setActionBusy(true);

    try {
      const response = await fetch(`${API_SKILL}/row/delete`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readText(response);
        throw new Error(message || "Delete failed.");
      }

      setRefreshKey((current) => current + 1);

      alert("Row deleted successfully.");
    } catch (error) {
      console.error("DELETE FAILED:", error);
      alert(error.message || "Delete failed.");
    } finally {
      setActionBusy(false);
    }
  }

  function exportToExcel() {
    if (!matrixData.length) {
      alert("No data to export.");
      return;
    }

    const rows = buildExportRows(
      matrixData,
      filters.role,
      filters.level
    );

    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    const levelPart = filters.level
      ? `_${filters.level}`
      : "_ALL_LEVELS";

    const headerRows = [
      ["Project Meridian Skill Matrix"],
      [],
      ["User", userEmail || "-"],
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

    const tableHeaders = Object.keys(rows[0]);

    const tableRows = rows.map((row) =>
      tableHeaders.map((header) => row[header])
    );

    const worksheet = XLSX.utils.aoa_to_sheet([
      ...headerRows,
      tableHeaders,
      ...tableRows,
    ]);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 35 },
      ...tableHeaders.slice(2).map(() => ({ wch: 10 })),
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Skill Matrix"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const filename =
      `Skill_Matrix_${filters.discipline}_${filters.role}` +
      `${levelPart}.xlsx`;

    saveAs(
      new Blob([buffer], {
        type: "application/octet-stream",
      }),
      filename
    );
  }

  function exportToPDF() {
    if (!matrixData.length) {
      alert("No data to export.");
      return;
    }

    const rows = buildExportRows(
      matrixData,
      filters.role,
      filters.level
    );

    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    const levelPart = filters.level
      ? `_${filters.level}`
      : "_ALL_LEVELS";

    const document = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    document.setFontSize(16);
    document.text("Project Meridian Skill Matrix", 14, 12);

    document.setFontSize(9);
    document.text(
      `Discipline: ${filters.discipline || "-"}`,
      14,
      19
    );

    document.text(`Role: ${filters.role || "-"}`, 14, 24);

    document.text(
      `Level: ${filters.level || "All levels"}`,
      14,
      29
    );

    autoTable(document, {
      startY: 34,
      head: [["Proficiency", "Meaning"]],
      body: [
        ["NA", "Not Applicable"],
        ["1", "Familiar"],
        ["2", "Working Level"],
        ["3", "Extensive"],
        ["4", "Authoritative"],
      ],
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [40, 40, 40],
      },
      theme: "grid",
      tableWidth: "wrap",
    });

    const columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));

    autoTable(document, {
      startY: document.lastAutoTable.finalY + 6,
      columns,
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [40, 40, 40],
      },
      didDrawPage: () => {
        const pageNumber =
          document.internal.getNumberOfPages();

        document.setFontSize(8);

        document.text(
          `Page ${pageNumber}`,
          280,
          200
        );
      },
    });

    const filename =
      `Skill_Matrix_${filters.discipline}_${filters.role}` +
      `${levelPart}.pdf`;

    document.save(filename);
  }

  return (
    <div className="page-container">
      <Filters
        filters={filters}
        setFilters={setFilters}
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        canExport={
          matrixData.length > 0 &&
          !loading &&
          !actionBusy
        }
        disciplineOptions={disciplineOptions}
      />

      {metaLoading && (
        <div
          style={{
            marginBottom: "10px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Loading disciplines...
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "10px 0 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn-edit"
            onClick={startEditMode}
            disabled={
              loading ||
              actionBusy ||
              !filters.discipline ||
              !filters.role ||
              isEditMode
            }
          >
            ✏ Edit
          </button>

          <button
            type="button"
            className="btn-edit"
            onClick={openAddModal}
            disabled={
              loading ||
              actionBusy ||
              !filters.discipline ||
              !filters.role
            }
          >
            ➕ Add Row
          </button>

          {isEditMode && (
            <>
              <button
                type="button"
                className="btn-save"
                onClick={saveChanges}
                disabled={loading || actionBusy}
              >
                💾 Save
              </button>

              <button
                type="button"
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

      <div className="table-hover-wrapper">
        <div className="table-responsive">
          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading skill matrix...
            </div>
          ) : !filters.discipline ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Select a discipline to view the skill matrix.
            </div>
          ) : matrixData.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No skill matrix data was found for this discipline.
            </div>
          ) : (
            <SkillTable
              data={matrixData}
              role={filters.role}
              selectedLevel={filters.level}
              editable={isEditMode}
              editedValues={editedValues}
              onEdit={(key, value) =>
                setEditedValues((previous) => ({
                  ...previous,
                  [key]: value,
                }))
              }
              onDeleteRow={handleDeleteRow}
            />
          )}
        </div>

        <div className="hover-legend">
          <span className="legend-title">
            Proficiency Scale
          </span>

          <span className="legend-pill l1">
            NA - Not Applicable
          </span>

          <span className="legend-pill l2">
            1 - Familiar
          </span>

          <span className="legend-pill l3">
            2 - Working Level
          </span>

          <span className="legend-pill l4">
            3 - Extensive
          </span>

          <span className="legend-pill l5">
            4 - Authoritative
          </span>
        </div>
      </div>

      {showAddRow && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ marginTop: 0 }}>
              Add Skill
            </h3>

            <label>Discipline</label>

            <select
              value={form.discipline}
              disabled={actionBusy}
              onChange={(event) => {
                const discipline = event.target.value;
                const role =
                  DISCIPLINE_ROLE_MAP[discipline] || "";

                setForm((previous) => ({
                  ...previous,
                  discipline,
                  role,
                  skill: "",
                  subskill: "",
                  isNewSkill: false,
                  isNewSubskill: false,
                }));
              }}
            >
              <option value="">
                Select Discipline
              </option>

              {disciplineOptions.map((discipline) => (
                <option
                  key={discipline}
                  value={discipline}
                >
                  {discipline}
                </option>
              ))}
            </select>

            <label>Role</label>

            <select
              value={form.role}
              disabled={
                actionBusy || !form.discipline
              }
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  role: event.target.value,
                  skill: "",
                  subskill: "",
                  isNewSkill: false,
                  isNewSubskill: false,
                }))
              }
            >
              <option value="">
                Select Role
              </option>

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
                disabled={
                  modalLoading ||
                  actionBusy ||
                  !form.discipline ||
                  !form.role
                }
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "__new__") {
                    setForm((previous) => ({
                      ...previous,
                      isNewSkill: true,
                      isNewSubskill: true,
                      skill: "",
                      subskill: "",
                    }));

                    return;
                  }

                  setForm((previous) => ({
                    ...previous,
                    skill: value,
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

                {modalSkillOptions.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

                <option value="__new__">
                  + Create new category
                </option>
              </select>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter new category"
                  value={form.skill}
                  disabled={actionBusy}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      skill: event.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  className="link-btn"
                  disabled={actionBusy}
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      isNewSkill: false,
                      isNewSubskill: false,
                      skill: "",
                      subskill: "",
                    }))
                  }
                >
                  Use existing category
                </button>
              </>
            )}

            <label>Subskill</label>

            {form.isNewSkill ? (
              <input
                type="text"
                placeholder="Enter new subskill"
                value={form.subskill}
                disabled={actionBusy}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    subskill: event.target.value,
                  }))
                }
              />
            ) : !form.isNewSubskill ? (
              <select
                value={form.subskill}
                disabled={
                  modalLoading ||
                  actionBusy ||
                  !form.skill
                }
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "__new__") {
                    setForm((previous) => ({
                      ...previous,
                      isNewSubskill: true,
                      subskill: "",
                    }));

                    return;
                  }

                  setForm((previous) => ({
                    ...previous,
                    subskill: value,
                  }));
                }}
              >
                <option value="">
                  {modalLoading
                    ? "Loading subskills..."
                    : "Select Subskill"}
                </option>

                {modalSubskillOptions.map((subskill) => (
                  <option
                    key={subskill}
                    value={subskill}
                  >
                    {subskill}
                  </option>
                ))}

                <option value="__new__">
                  + Create new subskill
                </option>
              </select>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter new subskill"
                  value={form.subskill}
                  disabled={actionBusy}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      subskill: event.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  className="link-btn"
                  disabled={actionBusy}
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      isNewSubskill: false,
                      subskill: "",
                    }))
                  }
                >
                  Use existing subskill
                </button>
              </>
            )}

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                disabled={actionBusy}
                onClick={() =>
                  setShowAddRow(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  actionBusy ||
                  !form.discipline ||
                  !form.role ||
                  !norm(form.skill) ||
                  !norm(form.subskill)
                }
                onClick={handleAddRow}
              >
                {actionBusy ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}