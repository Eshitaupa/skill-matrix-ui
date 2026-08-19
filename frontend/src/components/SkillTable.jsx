

// import { Fragment } from "react";

// function SkillTable({
//   data = [],
//   role,
//   selectedLevel,
//   editable,
//   editedValues = {},
//   onEdit,
//   onDeleteRow,
// }) {
//   const ROLE_LEVELS = {
//     Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
//     Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
//   };

//   if (!role) return null;

//   const levels = ROLE_LEVELS[role] || [];

//   const visibleCols = selectedLevel
//     ? levels.includes(selectedLevel)
//       ? [selectedLevel]
//       : []
//     : levels;

//   const keyOf = (cat, sub, lvl) => `${cat}|${sub}|${lvl}`;

//   const getValue = (g, s, l) =>
//     editedValues[keyOf(g.category, s.name, l)] ?? s.levels?.[l] ?? "NA";

//   const isChanged = (g, s, l) => editedValues[keyOf(g.category, s.name, l)] !== undefined;

//   return (
//     <table className="skill-table">
//       <thead>
//         <tr>
//           <th>Skill</th>
//           {editable && <th style={{ width: 70 }}>Action</th>}
//           {visibleCols.map((l) => (
//             <th key={l}>{l}</th>
//           ))}
//         </tr>
//       </thead>

//       <tbody>
//         {(data || []).map((group, i) => (
//           <Fragment key={group.category || i}>
//             <tr className="category-row">
//               <td colSpan={visibleCols.length + 1 + (editable ? 1 : 0)}>
//                 {group?.category}
//               </td>
//             </tr>

//             {(group?.skills || []).map((skill, j) => (
//               <tr key={`${skill?.name}-${j}`}>
//                 <td>{skill?.name}</td>

//                 {editable && (
//                   <td>
//                     <button
//                       className="btn-delete"
//                       type="button"
//                       onClick={() => onDeleteRow?.(group.category, skill.name)}
//                       title="Delete row"
//                     >
//                       🗑
//                     </button>
//                   </td>
//                 )}

//                 {visibleCols.map((l) => {
//                   const k = keyOf(group.category, skill.name, l);
//                   const changed = isChanged(group, skill, l);

//                   return (
//                     <td key={k} className={changed ? "cell-changed" : ""}>
//                       {editable ? (
//                         <select
//                           value={getValue(group, skill, l)}
//                           onChange={(e) => onEdit?.(k, e.target.value)}
//                         >
//                           <option value="NA">NA</option>
//                           <option value="1">1</option>
//                           <option value="2">2</option>
//                           <option value="3">3</option>
//                           <option value="4">4</option>
//                         </select>
//                       ) : (
//                         getValue(group, skill, l)
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </Fragment>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// export default SkillTable;
import { Fragment } from "react";

const DEFAULT_LEVEL_LABELS = {};

const PROFICIENCY_LABELS = {
  NA: "Not Applicable",
  "1": "Familiar",
  "2": "Working Level",
  "3": "Extensive",
  "4": "Authoritative",
};

const getProficiencyText = (value) => {
  const v = String(value ?? "NA");
  return `${v} - ${PROFICIENCY_LABELS[v] || ""}`;
};

function SkillTable({
  data = [],
  role,
  selectedLevel,
  editable,
  editedValues = {},
  selectedRows = [],
  onToggleRow,
  onToggleGroup,
  onEdit,
  onDeleteRow,
  levelLabels = DEFAULT_LEVEL_LABELS,
}) {
  const ROLE_LEVELS = {
    Engineer: ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"],
    Designer: ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"],
  };

  if (!role) return null;

  const levels = ROLE_LEVELS[role] || [];

  const visibleCols = selectedLevel
    ? levels.includes(selectedLevel)
      ? [selectedLevel]
      : []
    : levels;

  const cellKey = (cat, sub, lvl) => `${cat}|${sub}|${lvl}`;
  const rowKey = (cat, sub) => `${cat}|${sub}`;

  const getValue = (g, s, l) =>
    editedValues[cellKey(g.category, s.name, l)] ?? s.levels?.[l] ?? "NA";

  const isChanged = (g, s, l) =>
    editedValues[cellKey(g.category, s.name, l)] !== undefined;

  const isRowSelected = (category, subskillName) =>
    selectedRows.includes(rowKey(category, subskillName));

  const isGroupSelected = (group) => {
    const skills = group?.skills || [];
    if (!skills.length) return false;

    return skills.every((skill) =>
      selectedRows.includes(rowKey(group.category, skill.name))
    );
  };

  return (
    <Fragment>
      <style>{`
        .smx-wrap {
          border-radius: 12px;
          overflow: auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        }

        .smx-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .smx-table thead th {
          position: sticky;
          top: 0;
          z-index: 5;
          padding: 12px 10px;
          font-weight: 700;
          text-align: center;
          background: #f8fafc;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
          color: #374151;
        }

        .smx-select-head {
          width: 70px;
          min-width: 70px;
          text-align: center;
        }

        .smx-skill-head {
          text-align: center;
          min-width: 240px;
        }

        .smx-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .smx-code {
          font-size: 15px;
          font-weight: 700;
        }

        .smx-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .smx-category-row td {
          background: #eef4ff;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.04em;
          padding: 10px 14px;
          border-left: 4px solid #3b82f6;
          color: #1e3a8a;
          cursor: pointer;
          user-select: none;
        }

        .smx-category-row:hover td {
          background: #dfeaff;
        }

        .smx-category-select-cell {
          text-align: center !important;
          width: 70px;
          border-left: 4px solid #3b82f6;
        }

        .smx-category-name-cell {
          text-align: center !important;
        }

        .smx-table tbody tr.smx-row {
          background: #ffffff;
          transition: background 0.15s ease;
        }

        .smx-table tbody tr.smx-row:hover {
          background: #f9fafb;
        }

        .smx-table tbody tr.smx-row-selected {
          background: #fff7ed;
        }

        .smx-table tbody tr.smx-row-selected:hover {
          background: #ffedd5;
        }

        .smx-table td {
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #f1f3f5;
          vertical-align: middle;
        }

        .smx-select-cell {
          width: 70px;
          min-width: 70px;
          text-align: center;
          white-space: nowrap;
        }

        .smx-skill-cell {
          text-align: center;
          font-weight: 600;
          color: #111827;
          min-width: 240px;
        }

        .smx-action-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .smx-row-check,
        .smx-group-check {
          width: 17px;
          height: 17px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .smx-delete {
          border: none;
          background: transparent;
          color: #dc2626;
          font-size: 15px;
          cursor: pointer;
          line-height: 1;
          padding: 3px;
          border-radius: 6px;
        }

        .smx-delete:hover {
          background: #fee2e2;
          transform: scale(1.08);
        }

        .smx-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 28px;
          padding: 0 6px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
        }

        .smx-level-1 {
          background: #d1fae5;
          color: #065f46;
        }

        .smx-level-2 {
          background: #bfdbfe;
          color: #1e40af;
        }

        .smx-level-3 {
          background: #ddd6fe;
          color: #5b21b6;
        }

        .smx-level-4 {
          background: #fde68a;
          color: #92400e;
        }

        .smx-na-badge {
          background: #e5e7eb;
          color: #374151;
        }

        .smx-table select {
          padding: 5px 6px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          font-size: 13px;
        }

        .smx-changed {
          background: #fff3cd;
          border-radius: 6px;
        }

        .smx-changed select {
          background: #fff3cd;
        }

        .smx-tip {
          position: relative;
          cursor: help;
        }

        .smx-tip:hover::after {
          content: attr(data-tip);
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%);
          background: #111827;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          z-index: 9999;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
        }

        .smx-tip:hover::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: calc(100% + 2px);
          transform: translateX(-50%);
          border-width: 6px 6px 0 6px;
          border-style: solid;
          border-color: #111827 transparent transparent transparent;
          z-index: 9999;
        }
      `}</style>

      <div className="smx-wrap">
        <table className="smx-table">
          <thead>
            <tr>
              {editable && <th className="smx-select-head">Select</th>}

              <th className="smx-skill-head">Skill</th>

              {visibleCols.map((l) => (
                <th key={l}>
                  <div className="smx-head">
                    <span className="smx-code">{l}</span>
                    {levelLabels[l] && (
                      <span className="smx-role">{levelLabels[l]}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(data || []).map((group, i) => {
              const groupSelected = isGroupSelected(group);

              return (
                <Fragment key={group.category || i}>
                  <tr
                    className="smx-category-row"
                    onClick={() => editable && onToggleGroup?.(group.category)}
                    title={
                      editable
                        ? "Click category to select or unselect all subskills"
                        : ""
                    }
                  >
                    {editable && (
                      <td className="smx-category-select-cell">
                        <input
                          type="checkbox"
                          className="smx-group-check"
                          checked={groupSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => onToggleGroup?.(group.category)}
                          title="Select all subskills under this category"
                        />
                      </td>
                    )}

                    <td
                      className="smx-category-name-cell"
                      colSpan={visibleCols.length + 1}
                    >
                      {group?.category}
                    </td>
                  </tr>

                  {(group?.skills || []).map((skill, j) => {
                    const selected = isRowSelected(group.category, skill.name);

                    return (
                      <tr
                        key={`${skill?.name}-${j}`}
                        className={`smx-row ${selected ? "smx-row-selected" : ""}`}
                      >
                        {editable && (
                          <td className="smx-select-cell">
                            <div className="smx-action-wrap">
                              <input
                                type="checkbox"
                                className="smx-row-check"
                                checked={selected}
                                onChange={() =>
                                  onToggleRow?.(group.category, skill.name)
                                }
                                title="Select for bulk delete"
                              />

                              <button
                                className="smx-delete"
                                type="button"
                                onClick={() =>
                                  onDeleteRow?.(group.category, skill.name)
                                }
                                title="Delete this row"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        )}

                        <td className="smx-skill-cell">{skill?.name}</td>

                        {visibleCols.map((l) => {
                          const k = cellKey(group.category, skill.name, l);
                          const changed = isChanged(group, skill, l);
                          const value = getValue(group, skill, l);

                          return (
                            <td key={k} className={changed ? "smx-changed" : ""}>
                              {editable ? (
                                <select
                                  value={value}
                                  title={getProficiencyText(value)}
                                  onChange={(e) => onEdit?.(k, e.target.value)}
                                >
                                  <option value="NA">NA</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                </select>
                              ) : String(value) === "NA" ? (
                                <span
                                  className="smx-badge smx-na-badge smx-tip"
                                  title="NA - Not Applicable"
                                  data-tip="NA - Not Applicable"
                                >
                                  NA
                                </span>
                              ) : (
                                <span
                                  className={`smx-badge smx-level-${value} smx-tip`}
                                  title={getProficiencyText(value)}
                                  data-tip={getProficiencyText(value)}
                                >
                                  {value}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
}

export default SkillTable;