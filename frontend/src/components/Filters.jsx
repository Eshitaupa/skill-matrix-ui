import React, { useState, useEffect, useRef } from "react";

/* =========================================================
   AVAILABLE LEVELS BY ROLE
   ========================================================= */

const ROLE_LEVELS = {
  Engineer: [
    "L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17",
  ],
  Designer: [
    "L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15",
  ],
};

/* =========================================================
   ENGINEER ONLY DISCIPLINES
   ========================================================= */

const ENGINEER_ONLY_DISCIPLINES = [
  "Mechanical",
  "Piping Engineering",
  "Project Management",
  "Project Engineering",
];

/* =========================================================
   COMMON DESIGNATIONS
   ========================================================= */

const STANDARD_ENGINEER_DESIGNATIONS = {
  L7: "Trainee",
  L8: "Engineer",
  L9: "Associate Sr. Engineer",
  L10: "Sr. Engineer",
  L11: "Principal Engineer",
  L12: "Sr. Principal Engineer / Asst. Manager",
  L13: "Asst. Chief Engineer / Manager",
  L14: "Deputy Chief Engineer / Sr. Manager (Dy. Chief)",
  L15: "Chief Engineer / AGM",
  L16: "Sr. Chief Engineer / DGM (Sr. Chief Engineer)",
  L17: "General Manager",
};

const STANDARD_DESIGNER_DESIGNATIONS = {
  L5: "General Office Staff",
  L6: "Technician or Trainee Designer",
  L7: "Jr. Draftsman or Jr. Designer or Trainee Design Engineer",
  L8: "Designer or Draftsman or Design Engineer",
  L9: "Asso. Sr. Designer or Asso. Sr. Draftsman or Asso. Sr. Design Engineer",
  L10: "Sr. Designer or Sr. Draftsman or Sr. Design Engineer",
  L11: "Principal Designer or Principal Detailer or Principal Design Engineer",
  L12: "Sr. Prin. Designer or Sr. Prin. Detailer or Sr. Prin. Design Engineer",
  L13: "Asst. Chief Designer or Asst. Chief Design Engineer",
  L14: "Dept Chief Designer or Dept Chief Detailer or Dept Chief Design Engineer",
  L15: "Chief Designer or Chief Detailer or Chief Design Engineer",
};

/* =========================================================
   DESIGNATIONS BY DISCIPLINE AND ROLE
   ========================================================= */

const LEVEL_DESIGNATIONS = {
  Instrumentation: {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: STANDARD_DESIGNER_DESIGNATIONS,
  },
  Process: {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: STANDARD_DESIGNER_DESIGNATIONS,
  },
  Mechanical: {
    Engineer: {
      L7: "Trainee",
      L8: "Engineer (1 yr)",
      L9: "Associate Sr. Engineer (3 yrs)",
      L10: "Sr. Engineer (6 yrs)",
      L11: "Principal Engineer (9 yrs)",
      L12: "Sr. Principal Engineer / Asst. Manager (12 yrs)",
      L13: "Asst. Chief Engineer / Manager (15 yrs)",
      L14: "Deputy Chief Engineer / Sr. Manager (Dy. Chief) (18 yrs)",
      L15: "Chief Engineer / AGM (21 yrs)",
      L16: "Sr. Chief Engineer / DGM (Sr. Chief Engineer) (26 yrs)",
      L17: "General Manager (30 yrs)",
    },
    Designer: {},
  },
  "Piping Engineering": {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: {},
  },
  "Piping Design": {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: STANDARD_DESIGNER_DESIGNATIONS,
  },
  CSA: {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: STANDARD_DESIGNER_DESIGNATIONS,
  },
  Electrical: {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: STANDARD_DESIGNER_DESIGNATIONS,
  },
  "Project Management": {
    Engineer: {
      L7: "Trainee",
      L8: "Project Engineer",
      L9: "Associate Sr. Project Engineer",
      L10: "Sr. Project Engineer",
      L11: "Principal Project Engineer",
      L12: "Sr. Principal Project Engineer",
      L13: "Asst. Project Manager",
      L14: "Project Manager",
      L15: "Asst. General Manager",
      L16: "Deputy General Manager",
      L17: "General Manager",
    },
    Designer: {},
  },
  "Project Engineering": {
    Engineer: STANDARD_ENGINEER_DESIGNATIONS,
    Designer: {},
  },
};

/* =========================================================
   SEARCHABLE SKILL / SUBSKILL COMBOBOX
   One control that behaves like a dropdown (click to browse)
   AND a search box (type to filter, including by subskill).
   ========================================================= */

function SkillCombobox({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const query = (value || "").trim().toLowerCase();

  const filteredOptions = (options || []).filter((opt) =>
    query ? opt.toLowerCase().includes(query) : true
  );

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && filteredOptions[highlight]) {
        handleSelect(filteredOptions[highlight]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="smf-skill-combo" ref={wrapRef}>
      <input
        type="text"
        className="smf-skill-combo-input"
        aria-label="Search or select skill / subskill"
        placeholder="Skill / Subskill"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {value ? (
        <button
          type="button"
          className="smf-skill-combo-clear"
          aria-label="Clear skill filter"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          disabled={disabled}
        >
          ×
        </button>
      ) : (
        <span className="smf-skill-combo-chevron" aria-hidden="true">
          ▾
        </span>
      )}

      {open && !disabled && filteredOptions.length > 0 && (
        <ul className="smf-skill-combo-list" role="listbox">
          {filteredOptions.slice(0, 50).map((opt, idx) => (
            <li
              key={opt}
              role="option"
              aria-selected={idx === highlight}
              className={`smf-skill-combo-option${
                idx === highlight ? " active" : ""
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================
   FILTER COMPONENT
   ========================================================= */

function Filters({
  filters,
  setFilters,
  onExportExcel,
  onExportPDF,
  canExport = false,
  disciplineOptions = [],
  isDisciplineLocked = false,
  skillOptions = [],
}) {
  const isEngineerOnlyDiscipline = ENGINEER_ONLY_DISCIPLINES.includes(
    filters.discipline
  );

  const levelOptions = filters.role ? ROLE_LEVELS[filters.role] || [] : [];

  const getLevelLabel = (level) => {
    const discipline = filters.discipline;
    const role = filters.role;

    const designation = LEVEL_DESIGNATIONS?.[discipline]?.[role]?.[level];

    return designation ? `${level} - ${designation}` : level;
  };

  const handleDisciplineChange = (event) => {
    const discipline = event.target.value;

    const shouldFreezeRole = ENGINEER_ONLY_DISCIPLINES.includes(discipline);

    setFilters((previous) => ({
      ...previous,
      discipline,
      role: shouldFreezeRole ? "Engineer" : "",
      level: "",
      skillSearch: "",
    }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setFilters((previous) => ({
      ...previous,
      role,
      level: "",
      skillSearch: "",
    }));
  };

  const handleLevelChange = (event) => {
    const level = event.target.value;

    setFilters((previous) => ({
      ...previous,
      level,
    }));
  };

  const handleSkillSearchChange = (value) => {
    setFilters((previous) => ({
      ...previous,
      skillSearch: value,
    }));
  };

  return (
    <div className="smf-bar">
      <style>
        {`
          /* =====================================================
             FILTER CONTAINER
             ===================================================== */

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

          /* =====================================================
             FILTER LABEL
             ===================================================== */

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
            flex: 0 0 auto;
          }

          /* =====================================================
             DROPDOWNS
             ===================================================== */

          .smf-bar select.smf-select {
            appearance: none !important;
            -webkit-appearance: none !important;

            display: block !important;
            box-sizing: border-box !important;

            min-width: 180px !important;
            max-width: 360px !important;
            width: 180px !important;
            height: 38px !important;

            margin: 0 !important;
            padding: 8px 36px 8px 14px !important;

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
              width 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              background-color 0.2s ease !important;
          }

          .smf-bar select.smf-level-select {
            width: 280px !important;
            max-width: 420px !important;
          }

          .smf-bar select.smf-select:hover:not(:disabled) {
            border-color: #1d4ed8 !important;
            background-color: #f8fafc !important;
          }

          .smf-bar select.smf-select:focus,
          .smf-bar select.smf-select:focus-visible {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18) !important;
            outline: none !important;
          }

          .smf-bar select.smf-select:disabled {
            border-width: 1px !important;
            border-style: solid !important;
            border-color: #2563eb !important;

            background-color: #f8fafc !important;
            color: #94a3b8 !important;

            cursor: not-allowed !important;
            opacity: 1 !important;
          }

          /* =====================================================
             SKILL / SUBSKILL SEARCHABLE COMBOBOX
             (replaces the old separate skill-dropdown + search-box)
             ===================================================== */

          .smf-skill-combo {
            position: relative;

            flex: 0 0 260px;
            min-width: 220px;
            max-width: 360px;
          }

          .smf-skill-combo-input {
            display: block;
            box-sizing: border-box;

            width: 100%;
            height: 38px;

            margin: 0;
            padding: 8px 36px 8px 14px;

            border: 1px solid #2563eb;
            border-radius: 999px;

            background-color: #ffffff;
            color: #1f2937;

            font-family: inherit;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.2;

            outline: none;
          }

          .smf-skill-combo-input:hover:not(:disabled) {
            border-color: #1d4ed8;
            background-color: #f8fafc;
          }

          .smf-skill-combo-input:focus,
          .smf-skill-combo-input:focus-visible {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
          }

          .smf-skill-combo-input:disabled {
            border-color: #2563eb;
            background-color: #f8fafc;
            color: #94a3b8;
            cursor: not-allowed;
          }

          .smf-skill-combo-chevron {
            position: absolute;
            top: 50%;
            right: 14px;
            transform: translateY(-50%);

            font-size: 11px;
            color: #6b7280;
            pointer-events: none;
          }

          .smf-skill-combo-clear {
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);

            width: 22px;
            height: 22px;
            border: none;
            border-radius: 50%;
            background: transparent;

            font-size: 15px;
            line-height: 1;
            color: #6b7280;
            cursor: pointer;
          }

          .smf-skill-combo-clear:hover:not(:disabled) {
            background: #eef2ff;
            color: #1d4ed8;
          }

          .smf-skill-combo-list {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            z-index: 40;

            max-height: 280px;
            overflow-y: auto;

            margin: 0;
            padding: 6px;
            list-style: none;

            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
          }

          .smf-skill-combo-option {
            padding: 8px 10px;
            border-radius: 8px;

            font-size: 13px;
            color: #1f2937;
            cursor: pointer;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .smf-skill-combo-option:hover,
          .smf-skill-combo-option.active {
            background: #eef2ff;
            color: #1d4ed8;
          }

          /* =====================================================
             SPACER
             ===================================================== */

          .smf-spacer {
            flex: 1;
          }

          /* =====================================================
             EXPORT BUTTON CONTAINER
             ===================================================== */

          .smf-export-group {
            display: flex;
            align-items: center;
            gap: 8px;

            margin-left: auto;
            flex-wrap: wrap;
          }

          /* =====================================================
             BASE EXPORT BUTTON
             ===================================================== */

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
            box-shadow: 0 4px 10px rgba(33, 115, 70, 0.25) !important;
            transform: translateY(-1px);
          }

          .smf-export-group button.smf-export-btn.excel:focus-visible {
            box-shadow: 0 0 0 3px rgba(33, 115, 70, 0.22) !important;
          }

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
            box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25) !important;
            transform: translateY(-1px);
          }

          .smf-export-group button.smf-export-btn.pdf:focus-visible {
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.22) !important;
          }

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

          @media (max-width: 1200px) {
            .smf-bar select.smf-level-select {
              width: 230px !important;
              max-width: 300px !important;
            }
          }

          /* =====================================================
             MOBILE: keep every filter on ONE horizontally
             scrollable line instead of stacking vertically
             ===================================================== */

          @media (max-width: 992px) {
            .smf-export-group {
              width: 100%;
              margin-left: 0;
              justify-content: flex-end;
            }
          }

          @media (max-width: 768px) {
            .smf-bar {
              flex-wrap: nowrap;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;

              padding: 10px 12px;
              border-radius: 12px;

              scrollbar-width: thin;
            }

            .smf-bar::-webkit-scrollbar {
              height: 4px;
            }

            .smf-bar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 999px;
            }

            .smf-label {
              justify-content: center;
            }

            .smf-bar select.smf-select,
            .smf-bar select.smf-level-select {
              flex: 0 0 auto !important;
              min-width: 160px !important;
              width: 160px !important;
              max-width: none !important;
            }

            .smf-bar select.smf-level-select {
              min-width: 220px !important;
              width: 220px !important;
            }

            .smf-skill-combo {
              flex: 0 0 220px;
              min-width: 220px;
              max-width: none;
            }

            .smf-spacer {
              display: none;
            }

            .smf-export-group {
              flex: 0 0 auto;
              width: auto;
              margin-left: 8px;

              flex-direction: row;
              align-items: center;
            }

            .smf-export-group button.smf-export-btn {
              width: auto !important;
              min-width: 72px !important;
              padding: 8px 12px !important;
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
              padding: 8px 10px !important;
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

      {/* Discipline dropdown */}
      <select
        className="smf-select"
        aria-label="Select discipline"
        value={filters.discipline || ""}
        onChange={handleDisciplineChange}
        disabled={isDisciplineLocked}
      >
        <option value="" disabled hidden>
          Select Discipline
        </option>
        {disciplineOptions.map((discipline) => (
          <option key={discipline} value={discipline}>
            {discipline}
          </option>
        ))}
      </select>

      {/* Role dropdown */}
      <select
        className="smf-select"
        aria-label="Select role"
        value={filters.role || ""}
        onChange={handleRoleChange}
        disabled={!filters.discipline || isEngineerOnlyDiscipline}
      >
        <option value="" disabled hidden>
          Select Role
        </option>
        <option value="Engineer">Engineer</option>
        {!isEngineerOnlyDiscipline && (
          <option value="Designer">Designer</option>
        )}
      </select>

      {/* Level dropdown */}
      <select
        className="smf-select smf-level-select"
        aria-label="Select level"
        value={filters.level || ""}
        onChange={handleLevelChange}
        disabled={!filters.role}
      >
        <option value="">All Levels</option>
        {levelOptions.map((level) => (
          <option key={level} value={level}>
            {getLevelLabel(level)}
          </option>
        ))}
      </select>

      {/* Single searchable Skill / Subskill combobox */}
      <SkillCombobox
        value={filters.skillSearch}
        options={skillOptions}
        onChange={handleSkillSearchChange}
        disabled={!filters.discipline || !filters.role}
      />

      <div className="smf-spacer" />

      {/* Export buttons */}
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