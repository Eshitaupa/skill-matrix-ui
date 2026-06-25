// const ROLE_LEVELS = {
//   Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
//   Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
// };

// function Filters({ filters, setFilters }) {
//   const levelOptions = filters.role ? ROLE_LEVELS[filters.role] : [];

//   return (
//     <div className="filters" style={{ alignItems: "flex-start" }}>
// <select
//   value={filters.discipline}
//   onChange={(e) =>
//     setFilters((p) => ({
//       ...p,
//       discipline: e.target.value,
//       role: "",        // ⬅ reset role
//       level: ""        // ⬅ reset level (optional but good)
//     }))
//   }
// >

//         <option value="">Discipline</option>
//         <option value="Process">Process</option>
//         <option value="Mechanical">Mechanical</option>
//         <option value="Electrical">Electrical</option>
//         <option value="Piping Engineering">Piping Engineering</option>
//         <option value="Instrumentation">Instrumentation</option>
//         <option value="Piping Design">Piping Design</option>
//         <option value="CSA">CSA</option>
//         <option value="Purchase">Purchase</option>
//         <option value="Project Management">Project Management</option>
//         <option value="Expedeting">Expedeting</option>
//         <option value="Supplier Quantity">Supplier Quantity</option>
//         <option value="Project Control">Project Control</option>
//         <option value="Others">Others</option>
//       </select>

//       {/* Role */}
//       {/* <select
//         value={filters.role}
//         onChange={(e) =>
//           setFilters({
//             ...filters,
//             role: e.target.value,
//             level: "", // reset level when role changes
//           })
//         }
//       >
//          */}
// <select
//   value={filters.role}
//   onChange={(e) =>
//     setFilters((p) => ({ ...p, role: e.target.value }))
//   }
//   disabled={!filters.discipline}
// >
//   <option value="">Role</option>
//   <option value="Engineer">Engineer</option>
//   <option value="Designer">Designer</option>
// </select>

//       {/* Level (dynamic) */}
//       <select
//         value={filters.level}
//         disabled={!filters.role}
//         onChange={(e) =>
//           setFilters({ ...filters, level: e.target.value })
//         }
//       >
//         <option value="">
//           {filters.role ? "Select Level" : "Select Role first"}
//         </option>
//         {levelOptions.map((lvl) => (
//           <option key={lvl} value={lvl}>
//             {lvl}
//           </option>
//         ))}
//       </select>

//       {/* ✅ Proficiency Legend (NOT a dropdown) */}

//     </div>
//   );
// }

// export default Filters;

const ROLE_LEVELS = {
  Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
  Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
};

// ✅ Accept disciplineOptions prop — comes filtered from SkillMatrix based on user's auth
function Filters({
  filters,
  setFilters,
  onExportExcel,
  onExportPDF,
  canExport = false,
  disciplineOptions = [],   // ← replaces hardcoded list
}) {
  const levelOptions = filters.role ? ROLE_LEVELS[filters.role] : [];

  return (
    <div className="smf-bar">
<style>{`
  .smf-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
  }
  .smf-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #2563eb;
    white-space: nowrap;
  }
  .smf-bar select {
    appearance: none;
    -webkit-appearance: none;
    min-width: 180px;
    max-width: 240px;
    width: 100%;
    padding: 9px 36px 9px 14px;
    border: 1px solid #dbe2ea;
    border-radius: 999px;
    background:
      #fff
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'><path d='M5 7.5L10 12.5L15 7.5' stroke='%236b7280' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>")
      no-repeat right 12px center;
    background-size: 14px;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .smf-bar select:hover { border-color: #cbd5e1; }
  .smf-bar select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
  .smf-bar select:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
  .smf-spacer { flex: 1; }
  .smf-export-group { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
  .smf-export-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 14px; border-radius: 999px; border: 1px solid #2563eb;
    background: #2563eb; color: #fff; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
  }
  .smf-export-btn:hover:not(:disabled) { background: #1d4ed8; border-color: #1d4ed8; }
  .smf-export-btn.pdf { background: #7c3aed; border-color: #7c3aed; }
  .smf-export-btn.pdf:hover:not(:disabled) { background: #6d28d9; border-color: #6d28d9; }
  .smf-export-btn:disabled { background: #cbd5e1; border-color: #cbd5e1; color: #64748b; cursor: not-allowed; }
  @media (max-width: 992px) {
    .smf-bar { gap: 10px; }
    .smf-export-group { width: 100%; margin-left: 0; justify-content: flex-end; }
  }
  @media (max-width: 768px) {
    .smf-bar { flex-direction: column; align-items: stretch; border-radius: 12px; padding: 12px; }
    .smf-label { justify-content: center; }
    .smf-bar select { min-width: 100%; max-width: 100%; }
    .smf-export-group { width: 100%; flex-direction: column; align-items: stretch; }
    .smf-export-btn { width: 100%; }
  }
  @media (max-width: 480px) {
    .smf-bar { padding: 10px; }
    .smf-label { font-size: 11px; }
    .smf-export-btn { font-size: 12px; padding: 10px; }
  }
`}</style>

      <span className="smf-label">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <path d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z" stroke="#2563eb" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        Filters
      </span>

      {/* ✅ Discipline — only shows what the user is authorized for */}
      <select
        value={filters.discipline}
        onChange={(e) => setFilters((p) => ({ ...p, discipline: e.target.value, role: "", level: "" }))}
        disabled={disciplineOptions.length === 1}  // ← auto-locked if only one option
      >
        {disciplineOptions.length !== 1 && <option value="">Discipline</option>}
        {disciplineOptions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={filters.role}
        onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value, level: "" }))}
        disabled={!filters.discipline}
      >
        <option value="">Role</option>
        <option value="Engineer">Engineer</option>
        <option value="Designer">Designer</option>
      </select>

      <select
        value={filters.level}
        disabled={!filters.role}
        onChange={(e) => setFilters((p) => ({ ...p, level: e.target.value }))}
      >
        <option value="">{filters.role ? "Select Level" : "Select Role first"}</option>
        {levelOptions.map((lvl) => (
          <option key={lvl} value={lvl}>{lvl}</option>
        ))}
      </select>

      <div className="smf-spacer" />

      <div className="smf-export-group">
        <button type="button" className="smf-export-btn" onClick={onExportExcel} disabled={!canExport}>
          ⬇ Excel
        </button>
        <button type="button" className="smf-export-btn pdf" onClick={onExportPDF} disabled={!canExport}>
          ⬇ PDF
        </button>
      </div>
    </div>
  );
}

export default Filters;