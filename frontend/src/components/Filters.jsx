
// const ROLE_LEVELS = {
//   Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
//   Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
// };

// // ✅ Accept disciplineOptions prop — comes filtered from SkillMatrix based on user's auth
// function Filters({
//   filters,
//   setFilters,
//   onExportExcel,
//   onExportPDF,
//   canExport = false,
//   disciplineOptions = [],   // ← replaces hardcoded list
// }) {
//   const levelOptions = filters.role ? ROLE_LEVELS[filters.role] : [];

//   return (
//     <div className="smf-bar">
// <style>{`
//   .smf-bar {
//     display: flex;
//     align-items: center;
//     flex-wrap: wrap;
//     gap: 12px;
//     padding: 12px 16px;
//     margin-bottom: 16px;
//     background: var(--color-base-100);
//     border-color: var(--color-primary);
// border: 1px solid var(--color-base-300);
//     border-radius: 16px;
//   }
//   .smf-label {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     font-size: 12px;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: 0.06em;
//     color: var(--color-primary);
//     white-space: nowrap;
//   }
//  .smf-bar select {
//   appearance: none;
//   -webkit-appearance: none;

//   min-width: 180px;
//   max-width: 240px;
//   width: 100%;

//   padding: 9px 36px 9px 14px;

//   /* Border is now always visible on all 3 dropdowns */
//   border: 1px solid var(--color-primary);
//   border-radius: 999px;

//   background: var(--color-base-100);
//   color: var(--color-base-content);

//   font-size: 13px;
//   font-weight: 500;

//   transition:
//     border-color 0.2s ease,
//     box-shadow 0.2s ease,
//     background-color 0.2s ease;

//   cursor: pointer;
//   outline: none;
// }

// .smf-bar select:hover {
//   border-color: var(--color-primary);
// }

// .smf-bar select:focus {
//   border-color: var(--color-primary);
//   box-shadow: 0 0 0 3px
//     color-mix(in srgb, var(--color-primary) 18%, transparent);
// }

// .smf-bar select:disabled {
//   background: color-mix(
//     in srgb,
//     var(--color-base-300) 30%,
//     white
//   );

//   /* Keep border visible even when Role/Level is disabled */
//   border-color: var(--color-primary);

//   color: #9ca3af;
//   cursor: not-allowed;
//   opacity: 1;
// }
//   .smf-spacer { flex: 1; }
// .smf-export-group .smf-export-btn.excel {
//   background: #217346;
//   border-color: #217346;
//   color: #ffffff;
// }

// .smf-export-group .smf-export-btn.excel:hover:not(:disabled) {
//   background: #185c37;
//   border-color: #185c37;
//   color: #ffffff;
// }
//   .smf-export-btn:hover:not(:disabled) { background: #1d4ed8; border-color: #1d4ed8; }
//   .smf-export-btn.pdf { background: #7c3aed; border-color: #7c3aed; }
//   .smf-export-btn.pdf:hover:not(:disabled) { background: #6d28d9; border-color: #6d28d9; }
//   .smf-export-btn:disabled { background: #cbd5e1; border-color: #cbd5e1; color: #64748b; cursor: not-allowed; }
//   @media (max-width: 992px) {
//     .smf-bar { gap: 10px; }
//     .smf-export-group { width: 100%; margin-left: 0; justify-content: flex-end; }
//   }
//   @media (max-width: 768px) {
//     .smf-bar { flex-direction: column; align-items: stretch; border-radius: 12px; padding: 12px; }
//     .smf-label { justify-content: center; }
//     .smf-bar select { min-width: 100%; max-width: 100%; }
//     .smf-export-group { width: 100%; flex-direction: column; align-items: stretch; }
//     .smf-export-btn { width: 100%; }
//   }
//   @media (max-width: 480px) {
//     .smf-bar { padding: 10px; }
//     .smf-label { font-size: 11px; }
//     .smf-export-btn { font-size: 12px; padding: 10px; }
//   }
// `}</style>

//       <span className="smf-label">
//         <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
//           <path d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
//         </svg>
//         Filters
//       </span>

//       {/* ✅ Discipline — only shows what the user is authorized for */}
//       <select
//         value={filters.discipline}
//         onChange={(e) => setFilters((p) => ({ ...p, discipline: e.target.value, role: "", level: "" }))}
//         disabled={false}
//       >
//         {disciplineOptions.length !== 1 && <option value="">Discipline</option>}
//         {disciplineOptions.map((d) => (
//           <option key={d} value={d}>{d}</option>
//         ))}
//       </select>
// <select
//   value={filters.role}
//   onChange={(e) =>
//     setFilters((p) => ({
//       ...p,
//       role: e.target.value,
//       level: "",
//     }))
//   }
//   disabled={!filters.discipline}
// >
//   <option value="">Role</option>
//   <option value="Engineer">Engineer</option>
//   <option value="Designer">Designer</option>
// </select>

//       <select
//         value={filters.level}
//         disabled={!filters.role}
//         onChange={(e) => setFilters((p) => ({ ...p, level: e.target.value }))}
//       >
//         <option value="">{filters.role ? "Select Level" : "Select Role first"}</option>
//         {levelOptions.map((lvl) => (
//           <option key={lvl} value={lvl}>{lvl}</option>
//         ))}
//       </select>

//       <div className="smf-spacer" />

//       <div className="smf-export-group">
//         <button type="button" className="smf-export-btn excel" onClick={onExportExcel} disabled={!canExport}>
//           ⬇ Excel
//         </button>
//         <button type="button" className="smf-export-btn pdf" onClick={onExportPDF} disabled={!canExport}>
//           ⬇ PDF
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Filters;


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

function Filters({
  filters,
  setFilters,
  onExportExcel,
  onExportPDF,
  canExport = false,
  disciplineOptions = [],
  isDisciplineLocked = false,
}) {
  const levelOptions = filters.role
    ? ROLE_LEVELS[filters.role] || []
    : [];

  const handleDisciplineChange = (event) => {
    const discipline = event.target.value;

    setFilters((previous) => ({
      ...previous,
      discipline,
      role: "",
      level: "",
    }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setFilters((previous) => ({
      ...previous,
      role,
      level: "",
    }));
  };

  const handleLevelChange = (event) => {
    const level = event.target.value;

    setFilters((previous) => ({
      ...previous,
      level,
    }));
  };

  return (
    <div className="smf-bar">
      <style>
        {`
          /* ========================================
             FILTER CONTAINER
             ======================================== */

          .smf-bar {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;

            width: 100%;
            box-sizing: border-box;

            padding: 12px 16px;
            margin-bottom: 16px;

            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
          }


          /* ========================================
             FILTER LABEL
             ======================================== */

          .smf-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;

            color: #1e3a8a;
            white-space: nowrap;
          }


          /* ========================================
             ALL THREE DROPDOWNS
             ======================================== */

          .smf-bar select.smf-select {
            appearance: none !important;
            -webkit-appearance: none !important;

            display: block !important;
            box-sizing: border-box !important;

            min-width: 180px !important;
            max-width: 240px !important;
            width: 180px !important;
            height: 38px !important;

            margin: 0 !important;
            padding: 8px 36px 8px 14px !important;

            /* Permanent blue border */
            border-width: 1px !important;
            border-style: solid !important;
            border-color: #2563eb !important;
            border-radius: 999px !important;

            background-color: #ffffff !important;

            background-image:
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%236b7280' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;

            background-repeat: no-repeat !important;
            background-position: right 13px center !important;
            background-size: 14px 14px !important;

            color: #1f2937 !important;

            font-family: inherit !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            line-height: 1.2 !important;

            cursor: pointer !important;
            outline: none !important;
            opacity: 1 !important;

            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              background-color 0.2s ease !important;
          }


          /* Dropdown hover */
          .smf-bar select.smf-select:hover:not(:disabled) {
            border-color: #1d4ed8 !important;
            background-color: #f8fafc !important;
          }


          /* Dropdown focus */
          .smf-bar select.smf-select:focus,
          .smf-bar select.smf-select:focus-visible {
            border-color: #2563eb !important;

            box-shadow:
              0 0 0 3px rgba(37, 99, 235, 0.18) !important;

            outline: none !important;
          }


          /* Disabled Role and Level dropdowns */
          .smf-bar select.smf-select:disabled {
            /* Border remains visible */
            border-width: 1px !important;
            border-style: solid !important;
            border-color: #2563eb !important;

            background-color: #f8fafc !important;
            color: #94a3b8 !important;

            cursor: not-allowed !important;
            opacity: 1 !important;
          }


          /* ========================================
             SPACER
             ======================================== */

          .smf-spacer {
            flex: 1;
          }


          /* ========================================
             EXPORT BUTTON CONTAINER
             ======================================== */

          .smf-export-group {
            display: flex;
            align-items: center;
            gap: 8px;

            margin-left: auto;
            flex-wrap: wrap;
          }


          /* ========================================
             BASE EXPORT BUTTON
             ======================================== */

          .smf-export-group button.smf-export-btn {
            appearance: none !important;
            -webkit-appearance: none !important;

            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;

            box-sizing: border-box !important;

            min-width: 88px !important;
            height: 38px !important;

            margin: 0 !important;
            padding: 8px 16px !important;

            border-width: 1px !important;
            border-style: solid !important;
            border-radius: 999px !important;

            font-family: inherit !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 1 !important;

            color: #ffffff !important;

            cursor: pointer !important;
            white-space: nowrap !important;

            box-shadow: none !important;
            outline: none !important;
            opacity: 1 !important;

            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease !important;
          }


          /* ========================================
             EXCEL BUTTON — ALWAYS GREEN
             ======================================== */

          .smf-export-group button.smf-export-btn.excel {
            background: #217346 !important;
            background-color: #217346 !important;
            border-color: #217346 !important;
            color: #ffffff !important;
          }

          .smf-export-group button.smf-export-btn.excel:hover:not(:disabled) {
            background: #185c37 !important;
            background-color: #185c37 !important;
            border-color: #185c37 !important;

            box-shadow:
              0 4px 10px rgba(33, 115, 70, 0.25) !important;

            transform: translateY(-1px);
          }

          .smf-export-group button.smf-export-btn.excel:focus-visible {
            box-shadow:
              0 0 0 3px rgba(33, 115, 70, 0.22) !important;
          }


          /* ========================================
             PDF BUTTON — ALWAYS PURPLE
             ======================================== */

          .smf-export-group button.smf-export-btn.pdf {
            background: #7c3aed !important;
            background-color: #7c3aed !important;
            border-color: #7c3aed !important;
            color: #ffffff !important;
          }

          .smf-export-group button.smf-export-btn.pdf:hover:not(:disabled) {
            background: #6d28d9 !important;
            background-color: #6d28d9 !important;
            border-color: #6d28d9 !important;

            box-shadow:
              0 4px 10px rgba(124, 58, 237, 0.25) !important;

            transform: translateY(-1px);
          }

          .smf-export-group button.smf-export-btn.pdf:focus-visible {
            box-shadow:
              0 0 0 3px rgba(124, 58, 237, 0.22) !important;
          }


          /* ========================================
             DISABLED EXPORT BUTTONS

             Keep original colors, but show that the
             buttons are temporarily unavailable.
             ======================================== */

          .smf-export-group button.smf-export-btn:disabled {
            cursor: not-allowed !important;
            opacity: 0.55 !important;
            transform: none !important;
            box-shadow: none !important;
          }

          .smf-export-group button.smf-export-btn.excel:disabled {
            background: #217346 !important;
            background-color: #217346 !important;
            border-color: #217346 !important;
            color: #ffffff !important;
          }

          .smf-export-group button.smf-export-btn.pdf:disabled {
            background: #7c3aed !important;
            background-color: #7c3aed !important;
            border-color: #7c3aed !important;
            color: #ffffff !important;
          }


          /* ========================================
             TABLET RESPONSIVENESS
             ======================================== */

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


          /* ========================================
             MOBILE RESPONSIVENESS
             ======================================== */

          @media (max-width: 768px) {
            .smf-bar {
              flex-direction: column;
              align-items: stretch;

              padding: 12px;
              border-radius: 12px;
            }

            .smf-label {
              justify-content: center;
            }

            .smf-bar select.smf-select {
              min-width: 100% !important;
              max-width: 100% !important;
              width: 100% !important;
            }

            .smf-spacer {
              display: none;
            }

            .smf-export-group {
              width: 100%;
              margin-left: 0;

              flex-direction: column;
              align-items: stretch;
            }

            .smf-export-group button.smf-export-btn {
              width: 100% !important;
            }
          }


          @media (max-width: 480px) {
            .smf-bar {
              padding: 10px;
            }

            .smf-label {
              font-size: 11px;
            }

            .smf-export-group button.smf-export-btn {
              padding: 10px 14px !important;
              font-size: 12px !important;
            }
          }
        `}
      </style>

      <span className="smf-label">
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>

        Filters
      </span>

      {/* Discipline */}
 <select
  className="smf-select"
  aria-label="Select discipline"
  value={filters.discipline || ""}
  onChange={handleDisciplineChange}
  disabled={isDisciplineLocked}
>
        {!isDisciplineLocked && (
          <option value="">Discipline</option>
        )}

        {disciplineOptions.map((discipline) => (
          <option key={discipline} value={discipline}>
            {discipline}
          </option>
        ))}
      </select>

      {/* Role */}
      <select
        className="smf-select"
        aria-label="Select role"
        value={filters.role || ""}
        onChange={handleRoleChange}
        disabled={!filters.discipline}
      >
        <option value="">Role</option>
        <option value="Engineer">Engineer</option>
        <option value="Designer">Designer</option>
      </select>

      {/* Level */}
      <select
        className="smf-select"
        aria-label="Select level"
        value={filters.level || ""}
        onChange={handleLevelChange}
        disabled={!filters.role}
      >
        <option value="">
          {filters.role ? "Select Level" : "Select Role first"}
        </option>

        {levelOptions.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      <div className="smf-spacer" />

      <div className="smf-export-group">
        <button
          type="button"
          className="smf-export-btn excel"
          onClick={onExportExcel}
          disabled={!canExport}
          title={
            canExport
              ? "Export matrix to Excel"
              : "Select the required filters before exporting"
          }
        >
          <span aria-hidden="true">⬇</span>
          <span>Excel</span>
        </button>

        <button
          type="button"
          className="smf-export-btn pdf"
          onClick={onExportPDF}
          disabled={!canExport}
          title={
            canExport
              ? "Export matrix to PDF"
              : "Select the required filters before exporting"
          }
        >
          <span aria-hidden="true">⬇</span>
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
}

export default Filters;