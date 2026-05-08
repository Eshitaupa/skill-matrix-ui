// function SkillTable(props) {
//   const {
//     data,
//     role,
//     selectedLevel,
//     editable = false,
//     editedValues = {},
//     onEdit,
//     onDeleteRow
//   } = props;

//   const ROLE_LEVELS = {
//     Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
//     Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
//   };

// if (!role) {
//   return null;
// }
//   const roleLevels = ROLE_LEVELS[role] || [];

//   const visibleCols = selectedLevel
//     ? roleLevels.includes(selectedLevel)
//       ? [selectedLevel]
//       : []
//     : roleLevels;

//   if (visibleCols.length === 0) {
//     return (
//       <div style={{ marginTop: 20, color: "#6b7280" }}>
//         No applicable levels for selected filters
//       </div>
//     );
//   }

//   const getCellValue = (group, skill, level) => {
//     const key = `${group.category}|${skill.name}|${level}`;
//     return editedValues[key] ?? skill.levels[level] ?? "NA";
//   };

//   return (
//     <table className="skill-table">
//       <thead>
//         <tr>
//           <th>Skill</th>
//           {visibleCols.map((level) => (
//             <th key={level}>{level}</th>
//           ))}
//         </tr>
//       </thead>

//       <tbody>
//         {data.map((group, groupIndex) => (
//           <>
//             <tr key={`cat-${groupIndex}`} className="category-row">
//               <td colSpan={1 + visibleCols.length}>
//                 {group.category}
//               </td>
//             </tr>

//             {group.skills.map((skill, skillIndex) => (
//               <tr key={`skill-${groupIndex}-${skillIndex}`}>
//                 <td className="skill-name">
//                   <div className="skill-row-left">
//                     <span>{skill.name}</span>

//                     {editable && (
//                       <button
//                         type="button"
//                         className="btn-delete"
//                         onClick={() => {
//                           const ok = window.confirm(
//                             `Delete "${skill.name}"?`
//                           );
//                           if (ok && onDeleteRow) {
//                             onDeleteRow(group.category, skill.name);
//                           }
//                         }}
//                       >
//                         🗑
//                       </button>
//                     )}
//                   </div>
//                 </td>

//                 {visibleCols.map((level) => {
//                   const cellKey = `${group.category}|${skill.name}|${level}`;

//                   return (
//                     <td key={cellKey}>
//                       {editable ? (
//                         <select
//                           value={getCellValue(group, skill, level)}
//                           onChange={(e) =>
//                             onEdit(cellKey, e.target.value)
//                           }
//                         >
//                           <option value="NA">NA</option>
//                           <option value="1">1</option>
//                           <option value="2">2</option>
//                           <option value="3">3</option>
//                           <option value="4">4</option>
//                         </select>
//                       ) : (
//                         getCellValue(group, skill, level)
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// export default SkillTable;

import { Fragment } from "react";

function SkillTable({
  data = [],
  role,
  selectedLevel,
  editable,
  editedValues = {},
  onEdit,
  onDeleteRow,
}) {
  const ROLE_LEVELS = {
    Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
    Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
  };

  if (!role) return null;

  const levels = ROLE_LEVELS[role] || [];

  const visibleCols = selectedLevel
    ? levels.includes(selectedLevel)
      ? [selectedLevel]
      : []
    : levels;

  const keyOf = (cat, sub, lvl) => `${cat}|${sub}|${lvl}`;

  const getValue = (g, s, l) =>
    editedValues[keyOf(g.category, s.name, l)] ?? s.levels?.[l] ?? "NA";

  const isChanged = (g, s, l) => editedValues[keyOf(g.category, s.name, l)] !== undefined;

  return (
    <table className="skill-table">
      <thead>
        <tr>
          <th>Skill</th>
          {editable && <th style={{ width: 70 }}>Action</th>}
          {visibleCols.map((l) => (
            <th key={l}>{l}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {(data || []).map((group, i) => (
          <Fragment key={group.category || i}>
            <tr className="category-row">
              <td colSpan={visibleCols.length + 1 + (editable ? 1 : 0)}>
                {group?.category}
              </td>
            </tr>

            {(group?.skills || []).map((skill, j) => (
              <tr key={`${skill?.name}-${j}`}>
                <td>{skill?.name}</td>

                {editable && (
                  <td>
                    <button
                      className="btn-delete"
                      type="button"
                      onClick={() => onDeleteRow?.(group.category, skill.name)}
                      title="Delete row"
                    >
                      🗑
                    </button>
                  </td>
                )}

                {visibleCols.map((l) => {
                  const k = keyOf(group.category, skill.name, l);
                  const changed = isChanged(group, skill, l);

                  return (
                    <td key={k} className={changed ? "cell-changed" : ""}>
                      {editable ? (
                        <select
                          value={getValue(group, skill, l)}
                          onChange={(e) => onEdit?.(k, e.target.value)}
                        >
                          <option value="NA">NA</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      ) : (
                        getValue(group, skill, l)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default SkillTable;