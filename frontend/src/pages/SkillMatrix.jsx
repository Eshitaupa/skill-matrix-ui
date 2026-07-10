// import { useEffect, useMemo, useState } from "react";
// import Papa from "papaparse";

// import employeesCsv from "../data/employees.csv";
// import processEngineerCsv from "../data/process_engineer_baseline.csv";
// import processDesignCsv from "../data/process_design_baseline.csv";

// import Filters from "../components/Filters";
// import SkillTable from "../components/SkillTable";
// import { useExport } from "../context/ExportContext";
// import { exportMatrixToExcel, exportMatrixToPdf } from "../utils/exporters";

// const ROLE_LEVELS = {
//   Engineer: ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"],
//   Designer: ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"],
// };

// // localStorage keys (ONLY these, no other keys anywhere)
// const LS_ADDS = "skillMatrix.savedAdds.v1";
// const LS_EDITS = "skillMatrix.savedEdits.v1";
// const LS_FILTERS = "skillMatrix.filters.v1";

// function safeJsonParse(value, fallback) {
//   try {
//     const parsed = JSON.parse(value);
//     return parsed ?? fallback;
//   } catch {
//     return fallback;
//   }
// }

// function SkillMatrix() {

//   const initialFilters = safeJsonParse(localStorage.getItem(LS_FILTERS), {
//     discipline: "Process",
//     role: "Engineer",
//     level: "",
//     proficiency: "",
//   });

//   const initialAdds = safeJsonParse(localStorage.getItem(LS_ADDS), []);
//   const initialEdits = safeJsonParse(localStorage.getItem(LS_EDITS), {});


//   const [filters, setFilters] = useState(initialFilters);


//   const [employees, setEmployees] = useState([]);
//   const [empQuery, setEmpQuery] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [empOpen, setEmpOpen] = useState(false);


//   const [baselineEngineerRows, setBaselineEngineerRows] = useState([]);
//   const [baselineDesignerRows, setBaselineDesignerRows] = useState([]);


//   const [isEditMode, setIsEditMode] = useState(false);

//   const [savedEdits, setSavedEdits] = useState(initialEdits);
//   const [draftEdits, setDraftEdits] = useState({});

//   const [savedAdds, setSavedAdds] = useState(initialAdds); // persisted custom rows
//   const [draftAdds, setDraftAdds] = useState([]);


//   const [showAddRow, setShowAddRow] = useState(false);
//   const [newRow, setNewRow] = useState({
//     discipline: "",
//     role: "",
//     skill: "",
//     subSkill: "",
//     isNewSkill: false,
//     isNewSubSkill: false,
//   });


//   useEffect(() => {
//     localStorage.setItem(LS_ADDS, JSON.stringify(savedAdds));
//   }, [savedAdds]);

//   useEffect(() => {
//     localStorage.setItem(LS_EDITS, JSON.stringify(savedEdits));
//   }, [savedEdits]);

//   useEffect(() => {
//     localStorage.setItem(LS_FILTERS, JSON.stringify(filters));
//   }, [filters]);


//   useEffect(() => {
//     Papa.parse(employeesCsv, {
//       download: true,
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const cleaned = (results.data || [])
//           .map((r) => ({
//             employee_id: String(r.employee_id || "").trim(),
//             full_name: String(r.full_name || "").trim(),
//             email: String(r.email || "").trim(),
//             discipline: String(r.discipline || "").trim(),
//           }))
//           .filter((r) => r.employee_id && r.full_name && r.email);

//         setEmployees(cleaned);
//       },
//       error: (err) => console.error("Employees CSV parse failed:", err),
//     });
//   }, []);

//   const employeeSuggestions = useMemo(() => {
//     const q = empQuery.trim().toLowerCase();
//     if (!q) return employees.slice(0, 25);

//     return employees
//       .filter(
//         (e) =>
//           e.full_name.toLowerCase().includes(q) ||
//           e.email.toLowerCase().includes(q) ||
//           e.discipline.toLowerCase().includes(q)
//       )
//       .slice(0, 25);
//   }, [empQuery, employees]);

//   const chooseEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setEmpQuery(emp.full_name);
//     setEmpOpen(false);

//     setFilters((p) => ({
//       ...p,
//       discipline: emp.discipline || p.discipline || "Process",
//     }));
//   };

//   useEffect(() => {
//     Papa.parse(processEngineerCsv, {
//       download: true,
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => setBaselineEngineerRows(res.data || []),
//       error: (err) => console.error("Engineer baseline parse failed:", err),
//     });

//     Papa.parse(processDesignCsv, {
//       download: true,
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => setBaselineDesignerRows(res.data || []),
//       error: (err) => console.error("Designer baseline parse failed:", err),
//     });
//   }, []);

//   const disciplineOptions = useMemo(() => {
//     const set = new Set(employees.map((e) => e.discipline).filter(Boolean));
//     set.add("Process");
//     return Array.from(set).sort();
//   }, [employees]);

//   const allSkillIndex = useMemo(() => {
//   const index = {}; // key = "Discipline||Role" -> { Category: Set(Subskills) }

//   const add = (discipline, role, category, subSkill) => {
//     const d = String(discipline || "").trim();
//     const r = String(role || "").trim();
//     const c = String(category || "").trim();
//     const s = String(subSkill || "").trim();
//     if (!d || !r || !c || !s) return;

//     const key = `${d}||${r}`;
//     if (!index[key]) index[key] = {};
//     if (!index[key][c]) index[key][c] = new Set();
//     index[key][c].add(s);
//   };

//   baselineEngineerRows.forEach((row) => {
//     add(
//       "Process",
//       "Engineer",
//       row.Skill,
//       row.Subskill || row.SubSkill
//     );
//   });

//   baselineDesignerRows.forEach((row) => {
//     add(
//       "Process",
//       "Designer",
//       row.Skill,
//       row.Subskill || row.SubSkill
//     );
//   });

//   const addsToIndex = [...savedAdds, ...(isEditMode ? draftAdds : [])];
//   addsToIndex.forEach((a) => {
//     add(a.discipline, a.role, a.skill, a.subSkill);
//   });

//   return index;
// }, [baselineEngineerRows, baselineDesignerRows, savedAdds, draftAdds, isEditMode]);
  
//   const matrixData = useMemo(() => {
//     const discipline = filters.discipline || "Process";
//     const role = filters.role || "Engineer";

//     const roleLevels = ROLE_LEVELS[role] || [];
//     if (!roleLevels.length) return [];

//     let rows = [];
//     if (discipline === "Process" && role === "Engineer") rows = baselineEngineerRows;
//     if (discipline === "Process" && role === "Designer") rows = baselineDesignerRows;

//     const groups = {};

//     rows.forEach((r) => {
//       const category = String(r.Skill || "").trim();
//       const subSkill = String(r.Subskill || r.SubSkill || "").trim();
//       const levelKey = String(r.LevelKey || "").trim();
//       const value =
//         r.Value === undefined || r.Value === null || String(r.Value).trim() === ""
//           ? "NA"
//           : String(r.Value).trim();

//       if (!category || !subSkill || !levelKey) return;

//       if (!groups[category]) groups[category] = { discipline: "", category, skills: [] };

//       let skillRow = groups[category].skills.find((s) => s.name === subSkill);
//       if (!skillRow) {
//         skillRow = { name: subSkill, levels: {} };
//         groups[category].skills.push(skillRow);
//       }
//       skillRow.levels[levelKey] = value;
//     });

//     // 2) apply persisted adds + draft adds
//     const addsToApply = [...savedAdds, ...(isEditMode ? draftAdds : [])];

//     addsToApply
//       .filter((a) => a.discipline === discipline && a.role === role)
//       .forEach((a) => {
//         const cat = (a.skill || "").trim();
//         const ss = (a.subSkill || "").trim();
//         if (!cat || !ss) return;

//         if (!groups[cat]) groups[cat] = { discipline: "", category: cat, skills: [] };

//         if (!groups[cat].skills.find((s) => s.name === ss)) {
//           groups[cat].skills.push({ name: ss, levels: {} });
//         }
//       });

//     // 3) fill missing levels with NA
//     Object.values(groups).forEach((g) => {
//       g.skills.forEach((s) => {
//         roleLevels.forEach((lvl) => {
//           if (s.levels[lvl] === undefined) s.levels[lvl] = "NA";
//         });
//       });
//     });

//     // stable ordering
//     const out = Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
//     out.forEach((g) => g.skills.sort((a, b) => a.name.localeCompare(b.name)));

//     return out;
//   }, [
//     baselineEngineerRows,
//     baselineDesignerRows,
//     filters.discipline,
//     filters.role,
//     isEditMode,
//     savedAdds,
//     draftAdds,
//   ]);


// const modalSkillOptions = useMemo(() => {
//   if (!newRow.discipline || !newRow.role) return [];
//   const key = `${newRow.discipline}||${newRow.role}`;
//   const bucket = allSkillIndex[key];
//   if (!bucket) return [];
//   return Object.keys(bucket).sort((a, b) => a.localeCompare(b));
// }, [allSkillIndex, newRow.discipline, newRow.role]);

// const modalSubSkillOptions = useMemo(() => {
//   if (!newRow.discipline || !newRow.role || !newRow.skill) return [];
//   const key = `${newRow.discipline}||${newRow.role}`;
//   const bucket = allSkillIndex[key];
//   if (!bucket || !bucket[newRow.skill]) return [];
//   return Array.from(bucket[newRow.skill]).sort((a, b) => a.localeCompare(b));
// }, [allSkillIndex, newRow.discipline, newRow.role, newRow.skill]);


//   const startEditMode = () => {
//     setDraftEdits({ ...savedEdits });
//     setDraftAdds([]);
//     setIsEditMode(true);
//   };


//   const saveWithConfirm = () => {
//     const ok = window.confirm("Do you want to save the changes?");
//     if (!ok) {
//       setDraftEdits({ ...savedEdits });
//       setDraftAdds([]);
//       setIsEditMode(false);
//       setShowAddRow(false);
//       return;
//     }

//     const nextEdits = { ...draftEdits };
//     const nextAdds = [...savedAdds, ...draftAdds];

//     // commit to state
//     setSavedEdits(nextEdits);
//     setSavedAdds(nextAdds);

//     localStorage.setItem(LS_EDITS, JSON.stringify(nextEdits));
//     localStorage.setItem(LS_ADDS, JSON.stringify(nextAdds));
//     localStorage.setItem(LS_FILTERS, JSON.stringify(filters));

//     // close edit mode
//     setDraftAdds([]);
//     setIsEditMode(false);
//     setShowAddRow(false);
//   };

//   const handleAddRow = () => {
//     const discipline = (newRow.discipline || "").trim();
//     const role = (newRow.role || "").trim();
//     const skill = (newRow.skill || "").trim();
//     const subSkill = (newRow.subSkill || "").trim();

//     if (!discipline || !role || !skill || !subSkill) {
//       alert("Please fill Discipline, Role, Skill and Sub-skill.");
//       return;
//     }

//     const exists = [...savedAdds, ...draftAdds].some(
//       (a) =>
//         a.discipline === discipline &&
//         a.role === role &&
//         a.skill === skill &&
//         a.subSkill === subSkill
//     );

//     if (exists) {
//       alert("This Skill/Sub-skill already exists.");
//       return;
//     }

//     setDraftAdds((prev) => [...prev, { discipline, role, skill, subSkill }]);

//     setShowAddRow(false);
//     setNewRow({
//       discipline: "",
//       role: "",
//       skill: "",
//       subSkill: "",
//       isNewSkill: false,
//       isNewSubSkill: false,
//     });
//   };

//   const handleDeleteRow = (category, subSkillName) => {
//     const discipline = filters.discipline || "Process";
//     const role = filters.role || "Engineer";

//     const nextAdds = savedAdds.filter(
//       (a) =>
//         !(
//           a.discipline === discipline &&
//           a.role === role &&
//           a.skill === category &&
//           a.subSkill === subSkillName
//         )
//     );

//     const nextEdits = { ...savedEdits };
//     Object.keys(nextEdits).forEach((k) => {
//       if (k.startsWith(`${category}|${subSkillName}|`)) delete nextEdits[k];
//     });

//     setSavedAdds(nextAdds);
//     setSavedEdits(nextEdits);

//     localStorage.setItem(LS_ADDS, JSON.stringify(nextAdds));
//     localStorage.setItem(LS_EDITS, JSON.stringify(nextEdits));
//   };


//   const exportData = useMemo(() => {
//     const cloned = matrixData.map((g) => ({
//       ...g,
//       skills: g.skills.map((s) => ({ ...s, levels: { ...s.levels } })),
//     }));

//     cloned.forEach((g) => {
//       g.skills.forEach((s) => {
//         Object.keys(s.levels).forEach((lvl) => {
//           const key = `${g.category}|${s.name}|${lvl}`;
//           if (savedEdits[key] !== undefined) s.levels[lvl] = savedEdits[key];
//         });
//       });
//     });

//     return cloned;
//   }, [matrixData, savedEdits]);

//   const { setExporters } = useExport();

//   useEffect(() => {
//     const baseName =
//       (filters.discipline ? filters.discipline.replaceAll(" ", "_") : "All") +
//       "_" +
//       (filters.role ? filters.role : "Role") +
//       "_Baseline";

//     setExporters({
//       fileBaseName: baseName,
//       exportExcel: () => exportMatrixToExcel(exportData, filters, baseName),
//       exportPdf: () => exportMatrixToPdf(exportData, filters, baseName),
//     });
//   }, [exportData, filters, setExporters]);

//   const tableEdits = isEditMode ? draftEdits : savedEdits;
// useEffect(() => {
//   setNewRow((p) => ({
//     ...p,
//     skill: "",
//     subSkill: "",
//     isNewSkill: false,
//     isNewSubSkill: false,
//   }));
// }, [newRow.discipline, newRow.role]);

// useEffect(() => {
//   setNewRow((p) => ({ ...p, subSkill: "", isNewSubSkill: false }));
// }, [newRow.skill]);
//   return (
//     <div className="page-container">
//       {/* Employee Search */}
//       <div className="filters" style={{ marginBottom: 12, position: "relative" }}>
//         <div style={{ position: "relative", minWidth: 360 }}>
//           <input
//             className="employee-input"
//             value={empQuery}
//             placeholder="Type to search employee"
//             onChange={(e) => {
//               setEmpQuery(e.target.value);
//               setEmpOpen(true);
//             }}
//             onFocus={() => setEmpOpen(true)}
//           />

//           {empOpen && (
//             <div className="employee-dropdown">
//               {employees.length === 0 ? (
//                 <div className="employee-item muted">No employees loaded</div>
//               ) : employeeSuggestions.length === 0 ? (
//                 <div className="employee-item muted">No matches</div>
//               ) : (
//                 employeeSuggestions.map((emp) => (
//                   <div
//                     key={emp.employee_id}
//                     className="employee-item"
//                     onMouseDown={() => chooseEmployee(emp)}
//                   >
//                     <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
//                     <div style={{ fontSize: 12, color: "#6b7280" }}>
//                       {emp.email} • {emp.discipline}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         <div style={{ fontSize: 12, color: "#6b7280" }}>
//           Employees loaded: {employees.length} | Custom rows saved: {savedAdds.length}
//         </div>
//       </div>

//       {selectedEmployee && (
//         <div className="debug-box" style={{ marginBottom: 12 }}>
//           <strong>Selected:</strong> {selectedEmployee.full_name} ({selectedEmployee.discipline}) —{" "}
//           {selectedEmployee.email}
//         </div>
//       )}

//       <Filters filters={filters} setFilters={setFilters} />

//       {/* ACTION BAR */}
//       <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 10 }}>
//         <button
//           className="btn-edit"
//           onClick={() => {
//             if (!isEditMode) startEditMode();
//           }}
//         >
//           ✏️ Edit
//         </button>

//         <button
//           className="btn-edit"
//           onClick={() => {
//             if (!isEditMode) startEditMode();
//             setNewRow((p) => ({
//               ...p,
//               discipline: p.discipline || filters.discipline || "Process",
//               role: p.role || filters.role || "Engineer",
//             }));
//             setShowAddRow(true);
//           }}
//         >
//           ➕ Add Row
//         </button>

//         {isEditMode && (
//           <button className="btn-save" onClick={saveWithConfirm}>
//             💾 Save
//           </button>
//         )}
//       </div>

//       {/* TABLE */}
//       <div className="table-responsive">
//         <SkillTable
//           data={matrixData}
//           role={filters.role}
//           selectedLevel={filters.level}
//           editable={isEditMode}
//           editedValues={tableEdits}
//           onEdit={(key, value) => setDraftEdits((prev) => ({ ...prev, [key]: value }))}
//           onDeleteRow={handleDeleteRow}
//         />
//       </div>

//       {/* Legend */}
//       <div className="matrix-footer">
//         <div className="matrix-legend">
//           <div className="legend-title">Proficiency</div>
//           <div className="legend-row">
//             <span>NA</span>
//             <span>Not Applicable</span>
//           </div>
//           <div className="legend-row">
//             <span>1</span>
//             <span>Familiar</span>
//           </div>
//           <div className="legend-row">
//             <span>2</span>
//             <span>Working Level</span>
//           </div>
//           <div className="legend-row">
//             <span>3</span>
//             <span>Extensive</span>
//           </div>
//           <div className="legend-row">
//             <span>4</span>
//             <span>Authoritative</span>
//           </div>
//         </div>
//       </div>

//       {/* ADD ROW MODAL */}
//       {showAddRow && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3 style={{ marginTop: 0 }}>Add Skill / Sub-skill</h3>

//             <label>Discipline</label>
//             <select
//               value={newRow.discipline}
//               onChange={(e) => setNewRow((p) => ({ ...p, discipline: e.target.value }))}
//             >
//               <option value="">Select</option>
//               {disciplineOptions.map((d) => (
//                 <option key={d} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select>

//             <label>Role</label>
//             <select
//               value={newRow.role}
//               onChange={(e) => setNewRow((p) => ({ ...p, role: e.target.value }))}
//             >
//               <option value="">Select</option>
//               <option value="Engineer">Engineer</option>
//               <option value="Designer">Designer</option>
//             </select>

//             <label>Skill (Category)</label>
//             {!newRow.isNewSkill ? (
//               <>
//                 <select
//                   value={newRow.skill}
//                   onChange={(e) => setNewRow((p) => ({ ...p, skill: e.target.value }))}
//                 >
//                   <option value="">Select</option>
//                   {modalSkillOptions.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() => setNewRow((p) => ({ ...p, isNewSkill: true, skill: "" }))}
//                 >
//                   + Create new skill
//                 </button>
//               </>
//             ) : (
//               <>
//                 <input
//                   value={newRow.skill}
//                   onChange={(e) => setNewRow((p) => ({ ...p, skill: e.target.value }))}
//                   placeholder="Enter new skill (e.g., Deliverables)"
//                 />
//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() => setNewRow((p) => ({ ...p, isNewSkill: false }))}
//                 >
//                   Use existing skill list
//                 </button>
//               </>
//             )}

//             <label>Sub-skill</label>
//             {!newRow.isNewSubSkill ? (
//               <>
//                 <select
//                   value={newRow.subSkill}
//                   onChange={(e) => setNewRow((p) => ({ ...p, subSkill: e.target.value }))}
//                 >
//                   <option value="">Select</option>
//                   {modalSubSkillOptions.map((ss) => (
//                     <option key={ss} value={ss}>
//                       {ss}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() => setNewRow((p) => ({ ...p, isNewSubSkill: true, subSkill: "" }))}
//                 >
//                   + Create new sub-skill
//                 </button>
//               </>
//             ) : (
//               <>
//                 <input
//                   value={newRow.subSkill}
//                   onChange={(e) => setNewRow((p) => ({ ...p, subSkill: e.target.value }))}
//                   placeholder="Enter new sub-skill"
//                 />
//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() => setNewRow((p) => ({ ...p, isNewSubSkill: false }))}
//                 >
//                   Use existing sub-skill list
//                 </button>
//               </>
//             )}

//             <div className="modal-actions">
//               <button className="btn-edit" type="button" onClick={() => setShowAddRow(false)}>
//                 Cancel
//               </button>
//               <button className="btn-save" type="button" onClick={handleAddRow}>
//                 Add
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SkillMatrix;



// import { useEffect, useCallback, useState } from "react";
// import Filters from "../components/Filters";
// import SkillTable from "../components/SkillTable";

// const ROLE_LEVELS = {
//   Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
//   Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
// };

// // ---------- TRANSFORM API ----------
// function transformApiToMatrix(rows, roleLevels) {
//   const groups = {};

//   (rows || []).forEach((r) => {
//     const category = r.Skill || r.category;
//     const skillName = r.Subskill || r.skill_name;
//     const level = r.LevelKey || r.level;
//     const value = r.Value ?? r.proficiency ?? "NA";

//     if (!category || !skillName) return;

//     if (!groups[category]) {
//       groups[category] = { category, skills: [] };
//     }

//     let skill = groups[category].skills.find((s) => s.name === skillName);

//     if (!skill) {
//       skill = { name: skillName, levels: {} };
//       groups[category].skills.push(skill);
//     }

//     skill.levels[level] = value;
//   });

//   Object.values(groups).forEach((g) => {
//     g.skills = g.skills || [];
//     g.skills.forEach((s) => {
//       roleLevels.forEach((lvl) => {
//         if (!s.levels[lvl]) s.levels[lvl] = "NA";
//       });
//     });
//   });

//   return Object.values(groups);
// }

// export default function SkillMatrix() {
//   const [filters, setFilters] = useState({
//     discipline: "Process",
//     role: "Engineer",
//     level: "",
//   });

//   const [matrixData, setMatrixData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editedValues, setEditedValues] = useState({});

//   const [showAddRow, setShowAddRow] = useState(false);

//   const [form, setForm] = useState({
//     discipline: "",
//     role: "",
//     skill: "",
//     subskill: "",
//     isNewSkill: false,
//     isNewSubskill: false,
//   });

//   const [dropdownData, setDropdownData] = useState({
//     disciplines: [],
//     roles: ["Engineer", "Designer"],
//     skills: [],
//     subskills: []
//   });

//   // ---------- REFRESH (REUSED) ----------
//   const fetchMatrix = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:3001/api/skill-matrix?discipline=${encodeURIComponent(filters.discipline)}&role=${encodeURIComponent(filters.role)}`
//       );
//       const data = await res.json();

//       setMatrixData(
//         transformApiToMatrix(data, ROLE_LEVELS[filters.role] || [])
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [filters.discipline, filters.role]);

//   // ---------------- FETCH MATRIX ----------------
//   useEffect(() => {
//     fetchMatrix();
//   }, [fetchMatrix]);

//   // ---------------- FETCH META ----------------
//   useEffect(() => {
//     async function fetchMeta() {
//       const res = await fetch("http://localhost:3001/api/skill-matrix/meta");
//       const data = await res.json();
//       setDropdownData(data);
//     }
//     fetchMeta();
//   }, []);

//   // ---------------- START EDIT MODE (old behavior) ----------------
//   function startEditMode() {
//     setIsEditMode(true);
//     // keep existing edits, or reset if you want:
//     // setEditedValues({});
//   }

//   // ---------------- CANCEL EDIT ----------------
//   function cancelEdit() {
//     setEditedValues({});
//     setIsEditMode(false);
//     setShowAddRow(false);
//   }

//   // ---------------- SAVE ----------------
//   async function saveChanges() {
//     const keys = Object.keys(editedValues);
//     if (keys.length === 0) {
//       alert("No changes to save");
//       setIsEditMode(false);
//       return;
//     }

//     const ok = window.confirm("Do you want to save the changes?");
//     if (!ok) {
//       return;
//     }

//     const payload = Object.entries(editedValues).map(([key, value]) => {
//       const [skill, subskill, level] = key.split("|");

//       return {
//         Discipline: filters.discipline,
//         Role: filters.role,
//         Skill: skill,
//         Subskill: subskill,
//         LevelKey: level,
//         Value: value
//       };
//     });

//     const res = await fetch("http://localhost:3001/api/skill-matrix/save", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       alert("Save failed");
//       return;
//     }

//     alert("Saved");
//     setEditedValues({});
//     setIsEditMode(false);

//     // IMPORTANT: refresh table from DB
//     fetchMatrix();
//   }

//   // ---------------- ADD ROW ----------------
//   async function handleAddRow() {
//     const payload = {
//       Discipline: form.discipline || filters.discipline,
//       Role: form.role || filters.role,
//       Skill: form.skill,
//       Subskill: form.subskill,
//       LevelKey: "L7",
//       Value: "NA"
//     };

//     if (!payload.Discipline || !payload.Role || !payload.Skill || !payload.Subskill) {
//       alert("Please fill Discipline, Role, Skill and Subskill.");
//       return;
//     }

//     const res = await fetch("http://localhost:3001/api/skill-matrix/save", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify([payload]),
//     });

//     if (!res.ok) {
//       alert("Add failed");
//       return;
//     }

//     alert("Added");
//     setShowAddRow(false);

//     // IMPORTANT: refresh table from DB
//     fetchMatrix();
//   }

//   // ---------------- UI ----------------
//   return (
//     <div className="page-container">
//       <Filters filters={filters} setFilters={setFilters} />

//       {/* ACTION BAR (same structure as old) */}
//       <div
//         style={{
//           display: "flex",
//           gap: 8,
//           justifyContent: "flex-end",
//           marginBottom: 10,
//           position: "relative",
//           zIndex: 2,
//         }}
//       >
//         <button
//           className="btn-edit"
//           onClick={() => {
//             if (!isEditMode) startEditMode();
//           }}
//           disabled={loading}
//         >
//           ✏️ Edit
//         </button>

//         <button
//           className="btn-edit"
//           onClick={() => {
//             if (!isEditMode) startEditMode();
//             setForm((p) => ({
//               ...p,
//               discipline: p.discipline || filters.discipline,
//               role: p.role || filters.role,
//             }));
//             setShowAddRow(true);
//           }}
//           disabled={loading}
//         >
//           ➕ Add Row
//         </button>

//         {isEditMode && (
//           <>
//             <button className="btn-save" onClick={saveChanges} disabled={loading}>
//               💾 Save
//             </button>
//             <button className="btn-edit" onClick={cancelEdit} disabled={loading}>
//               ✖ Cancel
//             </button>
//           </>
//         )}
//       </div>

//       {/* TABLE (wrapped like old code) */}
//       <div className="table-responsive">
//         {loading ? (
//           <div>Loading...</div>
//         ) : (
//           <SkillTable
//             data={matrixData}
//             role={filters.role}
//             selectedLevel={filters.level}
//             editable={isEditMode}
//             editedValues={editedValues}
//             onEdit={(key, value) =>
//               setEditedValues((prev) => ({ ...prev, [key]: value }))
//             }
//           />
//         )}
//       </div>

//       {/* LEGEND (same as old code — at END of table) */}
//       <div className="matrix-footer">
//         <div className="matrix-legend">
//           <div className="legend-title">Proficiency</div>

//           <div className="legend-row">
//             <span>NA</span>
//             <span>Not Applicable</span>
//           </div>
//           <div className="legend-row">
//             <span>1</span>
//             <span>Familiar</span>
//           </div>
//           <div className="legend-row">
//             <span>2</span>
//             <span>Working Level</span>
//           </div>
//           <div className="legend-row">
//             <span>3</span>
//             <span>Extensive</span>
//           </div>
//           <div className="legend-row">
//             <span>4</span>
//             <span>Authoritative</span>
//           </div>
//         </div>
//       </div>

//       {/* ADD MODAL */}
//       {showAddRow && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3>Add Skill</h3>

//             {/* Discipline */}
//             <select
//               value={form.discipline}
//               onChange={(e) => setForm({ ...form, discipline: e.target.value })}
//             >
//               <option value="">Select Discipline</option>
//               {dropdownData.disciplines.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>

//             {/* Role */}
//             <select
//               value={form.role}
//               onChange={(e) => setForm({ ...form, role: e.target.value })}
//             >
//               <option value="">Select Role</option>
//               {dropdownData.roles.map((r) => (
//                 <option key={r} value={r}>{r}</option>
//               ))}
//             </select>

//             {/* Skill */}
//             <input
//               placeholder="Skill"
//               value={form.skill}
//               onChange={(e) => setForm({ ...form, skill: e.target.value })}
//             />

//             {/* Subskill */}
//             <input
//               placeholder="Subskill"
//               value={form.subskill}
//               onChange={(e) => setForm({ ...form, subskill: e.target.value })}
//             />

//             <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
//               <button onClick={() => setShowAddRow(false)}>Cancel</button>
//               <button onClick={handleAddRow}>Add</button>
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
  "Piping Design": "Designer",
  "Instrumentation": "Designer",
  "Mechanical": "Engineer",
};
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
// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";
const API_BASE =
  process.env.REACT_APP_API_BASE ||  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";
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

    let rowObj = groups[catKey].skills.find((s) => keyOfText(s.name) === keyOfText(subskill));
    if (!rowObj) { rowObj = { name: subskill, levels: {} }; groups[catKey].skills.push(rowObj); }

    rowObj.levels[level] = value;
  });

  Object.values(groups).forEach((g) => {
    g.skills.forEach((s) => {
      roleLevels.forEach((lvl) => {
        if (s.levels[lvl] === undefined || s.levels[lvl] === null || s.levels[lvl] === "") {
          s.levels[lvl] = "NA";
        }
      });
    });
  });

  const out = Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
  out.forEach((g) => g.skills.sort((a, b) => a.name.localeCompare(b.name)));
  return out;
}

async function safeJson(res) { try { return await res.json(); } catch { return null; } }
async function safeText(res) { try { return await res.text(); } catch { return ""; } }

function buildExportRows(matrixData, role, selectedLevel) {
  const levelsAll = ROLE_LEVELS[role] || [];
  const levels = selectedLevel ? [selectedLevel] : levelsAll;
  const rows = [];
  matrixData.forEach((group) => {
    group.skills.forEach((skill) => {
      const row = { Skill: group.category, Subskill: skill.name };
      levels.forEach((lvl) => { row[lvl] = skill.levels?.[lvl] ?? "NA"; });
      rows.push(row);
    });
  });
  return rows;
}

// ─── Component ────────────────────────────────────────────────────────────────

// ✅ allowedDisciplines comes from App.js (e.g. ["Electrical"])
export default function SkillMatrix({ allowedDisciplines = [], userEmail = "" }) {
  const [filters, setFilters] = useState({ discipline: "", role: "", level: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [matrixData, setMatrixData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [meta, setMeta] = useState({ disciplines: [], roles: ["Engineer", "Designer"] });
  const [form, setForm] = useState({ discipline: "", role: "", skill: "", subskill: "", isNewSkill: false, isNewSubskill: false });
  const [modalMatrix, setModalMatrix] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // ✅ Load meta from API
useEffect(() => {
  let cancelled = false;

  async function loadMeta() {
    try {
      const res = await fetch(`${API_SKILL}/meta`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `Meta request failed with HTTP ${res.status}`
        );
      }

      if (cancelled) return;

      setMeta({
        disciplines:
          Array.isArray(data?.disciplines) && data.disciplines.length
            ? data.disciplines
            : ALL_DISCIPLINES,

        roles:
          Array.isArray(data?.roles) && data.roles.length
            ? data.roles
            : ["Engineer", "Designer"],
      });
    } catch (err) {
      console.error("META LOAD FAILED:", err);

      // Keeps the dropdown working even if /meta temporarily fails.
      if (!cancelled) {
        setMeta({
          disciplines: ALL_DISCIPLINES,
          roles: ["Engineer", "Designer"],
        });
      }
    }
  }

  loadMeta();

  return () => {
    cancelled = true;
  };
}, []);

  // ✅ Auto-set role when discipline changes
  useEffect(() => {
    if (!filters.discipline) {
      setFilters((prev) => { if (!prev.role && !prev.level) return prev; return { ...prev, role: "", level: "" }; });
      setMatrixData([]);
      return;
    }
    const autoRole = DISCIPLINE_ROLE_MAP[filters.discipline] || "";
    setFilters((prev) => { if (prev.role === autoRole) return prev; return { ...prev, role: autoRole, level: "" }; });
  }, [filters.discipline]);

  // ✅ Auto-select discipline if user only has one allowed
  useEffect(() => {
    if (allowedDisciplines.length === 1 && !filters.discipline) {
      setFilters((prev) => ({ ...prev, discipline: allowedDisciplines[0] }));
    }
  }, [allowedDisciplines, filters.discipline]);

  // ✅ Fetch matrix
  const fetchMatrix = useCallback(async () => {
    if (!filters.discipline || !filters.role) { setMatrixData([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_SKILL}?discipline=${encodeURIComponent(filters.discipline)}&role=${encodeURIComponent(filters.role)}`);
      if (!res.ok) { setMatrixData([]); return; }
      const data = await safeJson(res);
      setMatrixData(transformApiToMatrix(data || [], ROLE_LEVELS[filters.role] || []));
    } catch (err) { console.error("FETCH MATRIX FAILED:", err); setMatrixData([]); }
    finally { setLoading(false); }
  }, [filters.discipline, filters.role]);

  useEffect(() => { fetchMatrix(); }, [fetchMatrix, refreshKey]);

  // ✅ Modal matrix for add row dropdowns
  useEffect(() => {
    if (!showAddRow) return;
    const d = form.discipline || filters.discipline;
    const r = form.role || filters.role;
    if (!d || !r) return;
    let alive = true;
    (async () => {
      setModalLoading(true);
      try {
        const res = await fetch(`${API_SKILL}?discipline=${encodeURIComponent(d)}&role=${encodeURIComponent(r)}`);
        if (!res.ok) { if (alive) setModalMatrix([]); return; }
        const data = await safeJson(res);
        if (alive) setModalMatrix(transformApiToMatrix(data || [], ROLE_LEVELS[r] || []));
      } catch (err) { console.error("MODAL MATRIX LOAD FAILED:", err); if (alive) setModalMatrix([]); }
      finally { if (alive) setModalLoading(false); }
    })();
    return () => { alive = false; };
  }, [showAddRow, form.discipline, form.role, filters.discipline, filters.role]);

const disciplineOptions = useMemo(() => {
  const availableDisciplines =
    Array.isArray(meta.disciplines) && meta.disciplines.length
      ? meta.disciplines
      : ALL_DISCIPLINES;

  if (allowedDisciplines.includes("All")) {
    return availableDisciplines;
  }

  if (allowedDisciplines.length > 0) {
    return availableDisciplines.filter((discipline) =>
      allowedDisciplines.some(
        (allowed) => keyOfText(allowed) === keyOfText(discipline)
      )
    );
  }

  return availableDisciplines;
}, [meta.disciplines, allowedDisciplines]);

  const roleOptions = useMemo(() => (meta.roles?.length ? meta.roles : ["Engineer", "Designer"]), [meta.roles]);

  const modalSkillOptions = useMemo(() => (modalMatrix || []).map((g) => g.category).filter(Boolean), [modalMatrix]);
  const modalSubskillOptions = useMemo(() => {
    if (!form.skill) return [];
    const grp = (modalMatrix || []).find((g) => keyOfText(g.category) === keyOfText(form.skill));
    return (grp?.skills || []).map((s) => s.name).filter(Boolean);
  }, [modalMatrix, form.skill]);

  function startEditMode() { setIsEditMode(true); }
  function cancelEdit() { setEditedValues({}); setIsEditMode(false); setShowAddRow(false); }

  async function saveChanges() {
    const keys = Object.keys(editedValues || {});
    if (!keys.length) { alert("No changes to save"); setIsEditMode(false); return; }
    const ok = window.confirm("Do you want to save the changes?");
    if (!ok) return;
    setActionBusy(true);
    try {
      const payload = Object.entries(editedValues).map(([key, value]) => {
        const [Skill, Subskill, LevelKey] = key.split("|");
        return { Discipline: norm(filters.discipline), Role: norm(filters.role), Skill: norm(Skill), Subskill: norm(Subskill), LevelKey: norm(LevelKey), Value: String(value ?? "NA") };
      });
const res = await fetch(`${API_SKILL}/save`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload),
});      if (!res.ok) { alert((await safeText(res)) || "Save failed"); return; }
      setEditedValues({}); setIsEditMode(false); setRefreshKey((k) => k + 1);
    } catch (err) { console.error("SAVE FAILED:", err); alert("Save failed"); }
    finally { setActionBusy(false); }
  }

  function openAddModal() {
    if (!isEditMode) startEditMode();
    setForm({ discipline: filters.discipline || "", role: filters.role || "", skill: "", subskill: "", isNewSkill: false, isNewSubskill: false });
    setShowAddRow(true);
  }

  async function handleAddRow() {
    const d = norm(form.discipline || filters.discipline);
    const r = norm(form.role || filters.role);
    let cat = norm(form.skill);
    let ss = norm(form.subskill);
    if (!d || !r || !cat || !ss) { alert("Please fill Discipline, Role, Skill (Category) and Subskill."); return; }
    const catExisting = (modalMatrix || []).find((g) => keyOfText(g.category) === keyOfText(cat));
    if (catExisting) cat = catExisting.category;
    const subExists = !!catExisting?.skills?.some((s) => keyOfText(s.name) === keyOfText(ss));
    if (subExists) { alert("Skill + Subskill already exists. Not allowed."); return; }
    const levels = ROLE_LEVELS[r] || [];
    if (!levels.length) { alert("Invalid role levels"); return; }
    const payload = [{ Discipline: d, Role: r, Skill: cat, Subskill: ss, LevelKey: levels[0], Value: "NA" }];
    setActionBusy(true);
    try {
const res = await fetch(`${API_SKILL}/save`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload),
});      if (!res.ok) { alert((await safeText(res)) || "Add failed"); return; }
      alert("Added"); setShowAddRow(false); setRefreshKey((k) => k + 1);
    } catch (err) { console.error("ADD FAILED:", err); alert("Add failed"); }
    finally { setActionBusy(false); }
  }

  async function handleDeleteRow(category, subskillName) {
    const ok = window.confirm(`Delete "${subskillName}" from "${category}"?`);
    if (!ok) return;
    const payload = { Discipline: norm(filters.discipline), Role: norm(filters.role), Skill: norm(category), Subskill: norm(subskillName) };
    setActionBusy(true);
    try {
const res = await fetch(`${API_SKILL}/row/delete`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload),
});      if (!res.ok) { alert((await safeText(res)) || "Delete failed"); return; }
      alert("Deleted"); setRefreshKey((k) => k + 1);
    } catch (err) { console.error("DELETE FAILED:", err); alert("Delete failed"); }
    finally { setActionBusy(false); }
  }

  function exportToExcel() {
    if (!matrixData.length) { alert("No data to export"); return; }
    const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
    const rows = buildExportRows(matrixData, filters.role, filters.level);
    const headerRows = [
      ["Project Meridian Export"], [],
      ["Discipline", filters.discipline || "-"],
      ["Role", filters.role || "-"],
      ["Level", filters.level || "All levels"], [],
      ["Proficiency", "Meaning"],
      ["NA", "Not Applicable"], ["1", "Familiar"], ["2", "Working Level"], ["3", "Extensive"], ["4", "Authoritative"], [],
    ];
    const tableHeader = Object.keys(rows[0] || { Skill: "", Subskill: "" });
    const tableData = rows.map((r) => tableHeader.map((h) => r[h]));
    const sheetAOA = [...headerRows, tableHeader, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(sheetAOA);
    ws["!cols"] = [{ wch: 22 }, { wch: 28 }, ...tableHeader.slice(2).map(() => ({ wch: 10 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Meridian");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`);
  }

  function exportToPDF() {
    if (!matrixData.length) { alert("No data to export"); return; }
    const levelPart = filters.level ? `_${filters.level}` : "_ALLLEVELS";
    const doc = new jsPDF("landscape");
    doc.setFontSize(16); doc.text("Project Meridian", 14, 12);
    doc.setFontSize(10);
    doc.text(`Discipline: ${filters.discipline || "-"}`, 14, 18);
    doc.text(`Role: ${filters.role || "-"}`, 14, 23);
    doc.text(`Level: ${filters.level || "All levels"}`, 14, 28);
    autoTable(doc, { startY: 32, head: [["Proficiency", "Meaning"]], body: [["NA", "Not Applicable"], ["1", "Familiar"], ["2", "Working Level"], ["3", "Extensive"], ["4", "Authoritative"]], styles: { fontSize: 9 }, headStyles: { fillColor: [40, 40, 40] }, theme: "grid", tableWidth: "wrap" });
    const rows = buildExportRows(matrixData, filters.role, filters.level);
    const columns = Object.keys(rows[0]).map((k) => ({ header: k, dataKey: k }));
    autoTable(doc, { startY: doc.lastAutoTable.finalY + 6, columns, body: rows, headStyles: { fillColor: [40, 40, 40] }, styles: { fontSize: 8 }, theme: "grid", didDrawPage: () => { doc.setFontSize(8); doc.text(`Page ${doc.internal.getNumberOfPages()}`, 285, 200); } });
    doc.save(`Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.pdf`);
  }

  return (
    <div className="page-container">
      <Filters
        filters={filters}
        setFilters={setFilters}
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        canExport={matrixData.length > 0 && !loading}
        // ✅ Pass filtered discipline options to Filters component
        disciplineOptions={disciplineOptions}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0 12px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-edit" onClick={() => { if (!isEditMode) startEditMode(); }} disabled={loading || actionBusy}>✏ Edit</button>
            <button className="btn-edit" onClick={openAddModal} disabled={loading || actionBusy}>➕ Add Row</button>
            {isEditMode && (
              <>
                <button className="btn-save" onClick={saveChanges} disabled={loading || actionBusy}>💾 Save</button>
                <button className="btn-edit" onClick={cancelEdit} disabled={loading || actionBusy}>✖ Cancel</button>
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
              onEdit={(key, value) => setEditedValues((prev) => ({ ...prev, [key]: value }))}
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
            <select value={form.discipline} onChange={(e) => setForm((p) => ({ ...p, discipline: e.target.value, skill: "", subskill: "" }))} disabled={actionBusy}>
              <option value="">Select Discipline</option>
              {/* ✅ Modal discipline list also restricted */}
              {disciplineOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value, skill: "", subskill: "" }))} disabled={actionBusy}>
              <option value="">Select Role</option>
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <label>Skill (Category)</label>
            {!form.isNewSkill ? (
              <select value={form.skill} disabled={modalLoading || actionBusy} onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") { setForm((p) => ({ ...p, isNewSkill: true, skill: "", subskill: "", isNewSubskill: false })); return; }
                setForm((p) => ({ ...p, skill: v, subskill: "", isNewSubskill: false }));
              }}>
                <option value="">{modalLoading ? "Loading categories..." : "Select Category"}</option>
                {modalSkillOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                <option value="__new__">+ Create new category</option>
              </select>
            ) : (
              <>
                <input placeholder="Enter new category" value={form.skill} onChange={(e) => setForm((p) => ({ ...p, skill: e.target.value }))} disabled={actionBusy} />
                <button type="button" className="link-btn" onClick={() => setForm((p) => ({ ...p, isNewSkill: false, skill: "", subskill: "" }))} disabled={actionBusy}>Use existing category list</button>
              </>
            )}

            <label>Subskill</label>
            {form.isNewSkill ? (
              <input placeholder="Enter new subskill" value={form.subskill} onChange={(e) => setForm((p) => ({ ...p, subskill: e.target.value }))} disabled={actionBusy} />
            ) : !form.isNewSubskill ? (
              <select value={form.subskill} disabled={modalLoading || !form.skill || actionBusy} onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") { setForm((p) => ({ ...p, isNewSubskill: true, subskill: "" })); return; }
                setForm((p) => ({ ...p, subskill: v }));
              }}>
                <option value="">{modalLoading ? "Loading subskills..." : "Select Subskill"}</option>
                {modalSubskillOptions.map((ss) => <option key={ss} value={ss}>{ss}</option>)}
                <option value="__new__">+ Create new subskill</option>
              </select>
            ) : (
              <>
                <input placeholder="Enter new subskill" value={form.subskill} onChange={(e) => setForm((p) => ({ ...p, subskill: e.target.value }))} disabled={actionBusy} />
                <button type="button" className="link-btn" onClick={() => setForm((p) => ({ ...p, isNewSubskill: false, subskill: "" }))} disabled={actionBusy}>Use existing subskill list</button>
              </>
            )}

            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddRow(false)} disabled={actionBusy}>Cancel</button>
              <button onClick={handleAddRow} disabled={actionBusy}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}