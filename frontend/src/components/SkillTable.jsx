

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
const TINT_COUNT = 6;

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
  onToggleCategory,
  onEdit,
  onDeleteRow,
  levelLabels = DEFAULT_LEVEL_LABELS,
}) {
  const ROLE_LEVELS = {
    Engineer: [
      "L7", "L8", "L9", "L10", "L11", "L12",
      "L13", "L14", "L15", "L16", "L17",
    ],
    Designer: [
      "L5", "L6", "L7", "L8", "L9", "L10",
      "L11", "L12", "L13", "L14", "L15",
    ],
  };

  if (!role) return null;

  const levels = ROLE_LEVELS[role] || [];

  const visibleCols = selectedLevel
    ? levels.includes(selectedLevel)
      ? [selectedLevel]
      : []
    : levels;

  const keyOf = (cat, sub, lvl) => `${cat}|${sub}|${lvl}`;
  const rowKey = (cat, sub) => `${cat}|${sub}`;

  const getValue = (group, skill, level) =>
    editedValues[keyOf(group.category, skill.name, level)] ??
    skill.levels?.[level] ??
    "NA";

  const isChanged = (group, skill, level) =>
    editedValues[keyOf(group.category, skill.name, level)] !== undefined;

  const isRowSelected = (category, subskillName) =>
    selectedRows.includes(rowKey(category, subskillName));

  const getCategoryCheckState = (group) => {
    const names = (group?.skills || []).map((skill) => skill.name);

    if (!names.length) return "none";

    const selectedCount = names.filter((name) =>
      isRowSelected(group.category, name)
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === names.length) return "all";

    return "some";
  };

  return (
    <Fragment>
      <style>{`
        .smx-wrap {
          width: 100%;
          border-radius: 12px;
          overflow-x: auto;
          overflow-y: visible;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        }

        .smx-table {
          width: 100%;
          min-width: 1000px;
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

        .smx-action-head {
          width: 88px;
          min-width: 88px;
          text-align: center !important;
        }

        .smx-skill-head {
          min-width: 280px;
          text-align: center !important;
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

        .smx-tint-0 { background: #fef6e0 !important; }
        .smx-tint-0 .smx-code { color: #b45309; }

        .smx-tint-1 { background: #e3f8ee !important; }
        .smx-tint-1 .smx-code { color: #047857; }

        .smx-tint-2 { background: #e6f0ff !important; }
        .smx-tint-2 .smx-code { color: #1d4ed8; }

        .smx-tint-3 { background: #f1ebfe !important; }
        .smx-tint-3 .smx-code { color: #6d28d9; }

        .smx-tint-4 { background: #fef3e2 !important; }
        .smx-tint-4 .smx-code { color: #b45309; }

        .smx-tint-5 { background: #fde8e8 !important; }
        .smx-tint-5 .smx-code { color: #b91c1c; }

        .smx-category-row td {
          background: #eef4ff;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.04em;
          padding: 10px 12px;
          color: #1e3a8a;
        }

        .smx-category-actions {
          width: 88px;
          min-width: 88px;
          text-align: center !important;
          border-left: 4px solid #3b82f6;
        }

        .smx-category-name {
          text-align: center !important;
        }

        .smx-category-check {
          width: 17px;
          height: 17px;
          cursor: pointer;
          accent-color: #2563eb;
          vertical-align: middle;
        }

        .smx-table tbody tr.smx-row {
          background: #ffffff;
          transition: background 0.12s ease;
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
          width: 88px;
          min-width: 88px;
          white-space: nowrap;
          text-align: center !important;
        }

        .smx-action-wrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .smx-row-check {
          width: 17px;
          height: 17px;
          cursor: pointer;
          accent-color: #2563eb;
          flex: 0 0 auto;
        }

        .smx-delete {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #dc2626;
          font-size: 15px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          border-radius: 7px;
        }

        .smx-delete:hover {
          background: #fee2e2;
        }

        .smx-skill-cell {
          text-align: center !important;
          font-weight: 600;
          color: #111827;
          min-width: 280px;
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

        .smx-level-1 { background: #d1fae5; color: #065f46; }
        .smx-level-2 { background: #bfdbfe; color: #1e40af; }
        .smx-level-3 { background: #ddd6fe; color: #5b21b6; }
        .smx-level-4 { background: #fde68a; color: #92400e; }
        .smx-na-badge { background: #e5e7eb; color: #374151; }

        .smx-table select {
          padding: 5px 6px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          font-size: 13px;
        }

        .smx-changed {
          background: #fff3cd;
        }

        .smx-changed select {
          background: #fff3cd;
        }

        .smx-tip {
          position: relative;
          cursor: help;
        }

        @media (max-width: 768px) {
          .smx-table {
            min-width: 950px;
          }

          .smx-action-head,
          .smx-select-cell,
          .smx-category-actions {
            width: 72px;
            min-width: 72px;
          }

          .smx-skill-head,
          .smx-skill-cell {
            min-width: 220px;
          }
        }
      `}</style>

      <div className="smx-wrap">
        <table className="smx-table">
          <thead>
            <tr>
              {editable && (
                <th className="smx-action-head">
                  Select
                </th>
              )}

              <th className="smx-skill-head">
                Skill / Subskill
              </th>

              {visibleCols.map((level, index) => (
                <th
                  key={level}
                  className={`smx-tint-${index % TINT_COUNT}`}
                >
                  <div className="smx-head">
                    <span className="smx-code">{level}</span>

                    {levelLabels[level] && (
                      <span className="smx-role">
                        {levelLabels[level]}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(data || []).map((group, groupIndex) => {
              const categoryState = editable
                ? getCategoryCheckState(group)
                : "none";

              const subskillNames = (group?.skills || []).map(
                (skill) => skill.name
              );

              return (
                <Fragment key={group.category || groupIndex}>
                  <tr className="smx-category-row">
                    {editable && (
                      <td className="smx-category-actions">
                        <input
                          type="checkbox"
                          className="smx-category-check"
                          checked={categoryState === "all"}
                          ref={(element) => {
                            if (element) {
                              element.indeterminate =
                                categoryState === "some";
                            }
                          }}
                          onChange={() =>
                            onToggleCategory?.(
                              group.category,
                              subskillNames
                            )
                          }
                          title="Select all subskills in this category"
                        />
                      </td>
                    )}

                    <td className="smx-category-name">
                      {group.category}
                    </td>

                    <td colSpan={visibleCols.length} />
                  </tr>

                  {(group?.skills || []).map((skill) => {
                    const selected = isRowSelected(
                      group.category,
                      skill.name
                    );

                    return (
                      <tr
                        key={`${group.category}|${skill.name}`}
                        className={`smx-row ${
                          selected ? "smx-row-selected" : ""
                        }`}
                      >
                        {editable && (
                          <td className="smx-select-cell">
                            <div className="smx-action-wrap">
                              <input
                                type="checkbox"
                                className="smx-row-check"
                                checked={selected}
                                onChange={() =>
                                  onToggleRow?.(
                                    group.category,
                                    skill.name
                                  )
                                }
                                title="Select for delete"
                              />

                              <button
                                className="smx-delete"
                                type="button"
                                onClick={() =>
                                  onDeleteRow?.(
                                    group.category,
                                    skill.name
                                  )
                                }
                                title="Delete row"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        )}

                        <td className="smx-skill-cell">
                          {skill.name}
                        </td>

                        {visibleCols.map((level) => {
                          const key = keyOf(
                            group.category,
                            skill.name,
                            level
                          );

                          const changed = isChanged(
                            group,
                            skill,
                            level
                          );

                          const value = getValue(
                            group,
                            skill,
                            level
                          );

                          return (
                            <td
                              key={key}
                              className={
                                changed ? "smx-changed" : ""
                              }
                            >
                              {editable ? (
                                <select
                                  value={value}
                                  title={getProficiencyText(value)}
                                  onChange={(event) =>
                                    onEdit?.(
                                      key,
                                      event.target.value
                                    )
                                  }
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
                                >
                                  NA
                                </span>
                              ) : (
                                <span
                                  className={`smx-badge smx-level-${value} smx-tip`}
                                  title={getProficiencyText(value)}
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