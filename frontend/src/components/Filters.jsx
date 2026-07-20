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
    background: var(--color-base-100);
    border: 1px solid var(--color-base-300);
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
    color: var(--color-primary);
    white-space: nowrap;
  }

  /* All three dropdowns always have the primary border */
  .smf-bar select {
    appearance: none;
    -webkit-appearance: none;
    min-width: 180px;
    max-width: 240px;
    width: 100%;
    padding: 9px 36px 9px 14px;

    border: 1px solid var(--color-primary);
    background-color: var(--color-base-100);
    color: var(--color-base-content);

    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    outline: none;
  }

  .smf-bar select:hover {
    border-color: var(--color-primary);
  }

  .smf-bar select:focus,
  .smf-bar select:focus-visible {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary) 18%, transparent);
  }

  /* Disabled role/level dropdowns also retain a visible border */
  .smf-bar select:disabled {
    border-color: var(--color-primary);
    background: color-mix(
      in srgb,
      var(--color-base-300) 30%,
      var(--color-base-100)
    );
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.75;
  }

  .smf-spacer {
    flex: 1;
  }

  .smf-export-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    flex-wrap: wrap;
  }

  /* Excel has permanent blue color */
  .smf-export-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 14px;
    border-radius: 999px;

    border: 1px solid var(--color-primary);
    background-color: var(--color-primary);
    color: var(--color-primary-content);

    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    white-space: nowrap;
  }

  .smf-export-btn:hover:not(:disabled) {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
    color: #ffffff;
  }

  /* PDF permanently purple */
  .smf-export-btn.pdf {
    background-color: #7c3aed;
    border-color: #7c3aed;
    color: #ffffff;
  }

  .smf-export-btn.pdf:hover:not(:disabled) {
    background-color: #6d28d9;
    border-color: #6d28d9;
  }

  .smf-export-btn:disabled {
    background-color: #cbd5e1;
    border-color: #cbd5e1;
    color: #64748b;
    cursor: not-allowed;
  }

  @media (max-width: 992px) {
    .smf-bar {
      gap: 10px;
    }

    .smf-export-group {
      width: 100%;
      margin-left: 0;
      justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    .smf-bar {
      flex-direction: column;
      align-items: stretch;
      border-radius: 12px;
      padding: 12px;
    }

    .smf-label {
      justify-content: center;
    }

    .smf-bar select {
      min-width: 100%;
      max-width: 100%;
    }

    .smf-export-group {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }

    .smf-export-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .smf-bar {
      padding: 10px;
    }

    .smf-label {
      font-size: 11px;
    }

    .smf-export-btn {
      font-size: 12px;
      padding: 10px;
    }
  }
`}</style>

      <span className="smf-label">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <path d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        Filters
      </span>

      {/* ✅ Discipline — only shows what the user is authorized for */}
      <select
        value={filters.discipline}
        onChange={(e) => setFilters((p) => ({ ...p, discipline: e.target.value, role: "", level: "" }))}
        disabled={false}
      >
        {disciplineOptions.length !== 1 && <option value="">Discipline</option>}
        {disciplineOptions.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
<select
  value={filters.role}
  onChange={(e) =>
    setFilters((p) => ({
      ...p,
      role: e.target.value,
      level: "",
    }))
  }
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