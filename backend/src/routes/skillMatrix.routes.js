
// import express from "express";
// import { queryDatabricks } from "../db/databricks.js";

// const router = express.Router();

// const UPLOAD = "ogc_techdept_test.skill_matrix.skill_matrix_upload";     // MASTER
// const HISTORY = "ogc_techdept_test.skill_matrix.skill_matrix_history";  // CHANGES

// const esc = (v) => String(v ?? "").replaceAll("'", "''");
// const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

// const normDispSql = (col) => `TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' '))`;
// const normKeySql = (col) => `LOWER(TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' ')))`;

// function getChangedBy(req) {
//   return String(req.cookies?.user_email || "").trim().toLowerCase() || "unknown";
// }

// router.get("/meta", async (req, res) => {
//   try {
//     // const rows = await queryDatabricks(`
//     //   SELECT DISTINCT Discipline
//     //   FROM ogc_techdept_test.skill_matrix.skill_matrix_upload
//     //   WHERE Discipline IS NOT NULL
//     //   ORDER BY Discipline
//     // `);
// // const rows = [
// //   ["Electrical"],
// //   ["Mechanical"],
// //   ["Process"],
// //   ["CSA"],
// //   ["Piping Engineering"],
// //   ["Instrumentation"]
// // ];
// router.get("/meta", (req, res) => {
//   return res.status(200).json({
//     disciplines: [
//       "Project Management",
//       "Process",
//       "Mechanical",
//       "CSA",
//       "Piping Design",
//       "Piping Engineering",
//       "Instrumentation",
//       "Electrical",
//     ],
//     roles: ["Engineer", "Designer"],
//   });
// });
//     return res.json({
//       disciplines: rows.map(r => r[0]),
//       roles: ["Engineer", "Designer"]
//     });

//   } catch (err) {

//     console.error("META ERROR FULL:", err);
//     console.error("META ERROR MESSAGE:", err.message);
//     console.error("META ERROR DATA:", err.response?.data);

//     return res.status(500).json({
//       message: "Meta failed",
//       error: err.message,
//       data: err.response?.data
//     });
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     const discipline = norm(req.query.discipline);
//     const role = norm(req.query.role);

//     const dFilter = discipline ? ` AND LOWER(TRIM(Discipline)) = LOWER(TRIM('${esc(discipline)}')) ` : "";
//     const rFilter = role ? ` AND LOWER(TRIM(Role)) = LOWER(TRIM('${esc(role)}')) ` : "";

//     const sql = `
// WITH base AS (
//   SELECT
//     Discipline, Role, LevelKey,
//     ${normKeySql("Skill")} AS SkillKey,
//     ${normKeySql("Subskill")} AS SubskillKey,
//     ${normDispSql("Skill")} AS SkillDisp,
//     ${normDispSql("Subskill")} AS SubskillDisp,
//     Value
//   FROM ${UPLOAD}
//   WHERE 1=1
//   ${dFilter}
//   ${rFilter}
// ),
// hist_ranked AS (
//   SELECT
//     Discipline, Role, LevelKey,
//     ${normKeySql("Skill")} AS SkillKey,
//     ${normKeySql("Subskill")} AS SubskillKey,
//     ${normDispSql("Skill")} AS SkillDisp,
//     ${normDispSql("Subskill")} AS SubskillDisp,
//     old_value,
//     new_value,
//     action,
//     changed_at,
//     changed_by,
//     ROW_NUMBER() OVER (
//       PARTITION BY Discipline, Role, LevelKey, ${normKeySql("Skill")}, ${normKeySql("Subskill")}
//       ORDER BY changed_at DESC
//     ) AS rn
//   FROM ${HISTORY}
//   WHERE 1=1
//   ${dFilter}
//   ${rFilter}
// ),
// hl AS (
//   SELECT * FROM hist_ranked WHERE rn = 1
// ),
// all_keys AS (
//   SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM base
//   UNION
//   SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM hl
// ),
// final AS (
//   SELECT
//     k.Discipline,
//     k.Role,
//     k.LevelKey,
//     COALESCE(hl.SkillDisp, b.SkillDisp) AS Skill,
//     COALESCE(hl.SubskillDisp, b.SubskillDisp) AS Subskill,
//     CASE
//       WHEN hl.action = 'DELETE' THEN NULL
//       WHEN hl.new_value IS NOT NULL THEN hl.new_value
//       ELSE b.Value
//     END AS Value,
//     hl.changed_by
//   FROM all_keys k
//   LEFT JOIN base b
//     ON b.Discipline = k.Discipline
//    AND b.Role = k.Role
//    AND b.LevelKey = k.LevelKey
//    AND b.SkillKey = k.SkillKey
//    AND b.SubskillKey = k.SubskillKey
//   LEFT JOIN hl
//     ON hl.Discipline = k.Discipline
//    AND hl.Role = k.Role
//    AND hl.LevelKey = k.LevelKey
//    AND hl.SkillKey = k.SkillKey
//    AND hl.SubskillKey = k.SubskillKey
// )

// SELECT Discipline, Role, LevelKey, Skill, Subskill, Value, changed_by
// FROM final
// WHERE Value IS NOT NULL
// ORDER BY Skill, Subskill, LevelKey
// `;

//     const rows = await queryDatabricks(sql);

//     res.json(rows.map((r) => ({
//       discipline: r[0],
//       role: r[1],
//       level: r[2],
//       category: r[3],
//       skill_name: r[4],
//       proficiency: r[5],
//       changed_by: r[6],
//     })));
// } catch (err) {
//   console.error("META ERROR FULL:", err);
//   console.error("META ERROR DATA:", err.response?.data);
//   console.error("META ERROR MESSAGE:", err.message);

//   return res.status(500).json({
//     message: "Meta failed",
//     error: err.response?.data || err.message
//   });
// }
// });

// router.post("/save", async (req, res) => {
//   try {
//     const rows = req.body;
//     const changedBy = getChangedBy(req);

//     if (!Array.isArray(rows) || rows.length === 0) {
//       return res.status(400).json({ message: "Invalid payload" });
//     }

//     const cleaned = rows.map((r) => ({
//       Discipline: norm(r.Discipline),
//       Role: norm(r.Role),
//       LevelKey: norm(r.LevelKey),
//       Skill: norm(r.Skill),
//       Subskill: norm(r.Subskill),
//       Value: norm(r.Value ?? "NA"),
//     }));

//     for (const r of cleaned) {
//       if (!r.Discipline || !r.Role || !r.LevelKey || !r.Skill || !r.Subskill) {
//         return res.status(400).json({ message: "Missing required fields" });
//       }
//     }

//     const insertSql = cleaned.map((r) => `
// SELECT
//   '${esc(r.Discipline)}' AS Discipline,
//   '${esc(r.Role)}' AS Role,
//   '${esc(r.LevelKey)}' AS LevelKey,
//   '${esc(r.Skill)}' AS Skill,
//   '${esc(r.Subskill)}' AS Subskill,
//   (
//     SELECT Value FROM (
//       WITH base AS (
//         SELECT Value
//         FROM ${UPLOAD}
//         WHERE Discipline='${esc(r.Discipline)}'
//           AND Role='${esc(r.Role)}'
//           AND LevelKey='${esc(r.LevelKey)}'
//           AND Skill='${esc(r.Skill)}'
//           AND Subskill='${esc(r.Subskill)}'
//       ),
//       hist_ranked AS (
//         SELECT new_value, action, changed_at,
//           ROW_NUMBER() OVER (ORDER BY changed_at DESC) rn
//         FROM ${HISTORY}
//         WHERE Discipline='${esc(r.Discipline)}'
//           AND Role='${esc(r.Role)}'
//           AND LevelKey='${esc(r.LevelKey)}'
//           AND Skill='${esc(r.Skill)}'
//           AND Subskill='${esc(r.Subskill)}'
//       ),
//       hist_latest AS (
//         SELECT * FROM hist_ranked WHERE rn=1
//       )
//       SELECT
//         CASE
//           WHEN (SELECT action FROM hist_latest)='DELETE' THEN NULL
//           WHEN (SELECT new_value FROM hist_latest) IS NOT NULL THEN (SELECT new_value FROM hist_latest)
//           ELSE (SELECT Value FROM base)
//         END AS Value
//     )
//   ) AS old_value,
//   '${esc(r.Value)}' AS new_value,
//   CASE
//     WHEN (
//       SELECT COUNT(*) FROM ${UPLOAD}
//       WHERE Discipline='${esc(r.Discipline)}'
//         AND Role='${esc(r.Role)}'
//         AND LevelKey='${esc(r.LevelKey)}'
//         AND Skill='${esc(r.Skill)}'
//         AND Subskill='${esc(r.Subskill)}'
//     ) > 0 THEN 'UPDATE'
//     ELSE 'INSERT'
//   END AS action,
//   CURRENT_TIMESTAMP() AS changed_at,
//   '${esc(changedBy)}' AS changed_by
// `).join("\nUNION ALL\n");

//     const historyInsert = `
// INSERT INTO ${HISTORY}
// (Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at, changed_by)
// ${insertSql}
// `;

//     await queryDatabricks(historyInsert);

//     res.json({ success: true, count: cleaned.length, changed_by: changedBy });
//   } catch (err) {
//     console.error("SAVE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Save failed", error: err.message });
//   }
// });

// router.post("/row/delete", async (req, res) => {
//   try {
//     const changedBy = getChangedBy(req);

//     const Discipline = norm(req.body?.Discipline);
//     const Role = norm(req.body?.Role);
//     const Skill = norm(req.body?.Skill);
//     const Subskill = norm(req.body?.Subskill);

//     if (!Discipline || !Role || !Skill || !Subskill) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const roleLevels =
//       Role.toLowerCase() === "designer"
//         ? ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"]
//         : ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"];

//     const deleteUnion = roleLevels.map((lvl) => `
// SELECT
//   '${esc(Discipline)}' AS Discipline,
//   '${esc(Role)}' AS Role,
//   '${esc(lvl)}' AS LevelKey,
//   '${esc(Skill)}' AS Skill,
//   '${esc(Subskill)}' AS Subskill,
//   NULL AS old_value,
//   NULL AS new_value,
//   'DELETE' AS action,
//   CURRENT_TIMESTAMP() AS changed_at,
//   '${esc(changedBy)}' AS changed_by
// `).join("\nUNION ALL\n");

//     const sql = `
// INSERT INTO ${HISTORY}
// (Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at, changed_by)
// ${deleteUnion}
// `;

//     await queryDatabricks(sql);

//     res.json({ success: true, changed_by: changedBy });
//   } catch (err) {
//     console.error("DELETE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// export default router;
import express from "express";
import { queryDatabricks } from "../db/databricks.js";

const router = express.Router();

console.log("SKILL MATRIX ROUTES LOADED");

/* =========================================================
   CONSTANTS
   ========================================================= */

const UPLOAD =
  "ogc_techdept_test.skill_matrix.skill_matrix_upload";

const HISTORY =
  "ogc_techdept_test.skill_matrix.skill_matrix_history";

const ACCESS_TABLE =
  "ogc_techdept_test.skill_matrix.user_discipline_access";

const DISCIPLINES = [
  "Project Management",
  "Process",
  "Mechanical",
  "CSA",
  "Piping Design",
  "Piping Engineering",
  "Instrumentation",
  "Electrical",
];

const ROLES = ["Engineer", "Designer"];

const ENGINEER_LEVELS = [
  "L7", "L8", "L9", "L10", "L11",
  "L12", "L13", "L14", "L15", "L16", "L17",
];

const DESIGNER_LEVELS = [
  "L5", "L6", "L7", "L8", "L9",
  "L10", "L11", "L12", "L13", "L14", "L15",
];

/* =========================================================
   HELPERS
   ========================================================= */

const esc = (value) =>
  String(value ?? "").replaceAll("'", "''");

const norm = (value) =>
  String(value ?? "").trim().replace(/\s+/g, " ");

const keyOf = (value) => norm(value).toLowerCase();

const normDispSql = (column) =>
  `TRIM(REGEXP_REPLACE(${column}, '\\\\s+', ' '))`;

const normKeySql = (column) =>
  `LOWER(TRIM(REGEXP_REPLACE(${column}, '\\\\s+', ' ')))`;

function getUserEmail(req) {
  return String(req.cookies?.user_email || "")
    .trim()
    .toLowerCase();
}

function levelsForRole(role) {
  return keyOf(role) === "designer"
    ? DESIGNER_LEVELS
    : ENGINEER_LEVELS;
}

function hasAllAccess(allowedDisciplines) {
  return (allowedDisciplines || []).some((discipline) => {
    const value = keyOf(discipline);
    return value === "all" || value === "all disciplines";
  });
}

function isDisciplineAllowed(requestedDiscipline, allowedDisciplines) {
  if (hasAllAccess(allowedDisciplines)) return true;

  const requestedKey = keyOf(requestedDiscipline);

  return (allowedDisciplines || []).some(
    (allowed) => keyOf(allowed) === requestedKey
  );
}

/* =========================================================
   ACCESS LOOKUP
   No row in DB = user sees ALL disciplines (login gate
   is handled by Azure, not this table).
   ========================================================= */

function getEmailCandidates(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return [];
  }

  const [username] = normalizedEmail.split("@");

  return [
    normalizedEmail,
    `${username}@burnsmcd.in`,
    `${username}@burnsmcd.com`,
  ].filter((value, index, array) => array.indexOf(value) === index);
}

async function getAllowedDisciplinesFromAccessTable(email) {
  const candidates = getEmailCandidates(email);

  if (candidates.length === 0) return ["All"];

  const inClause = candidates
    .map((e) => `LOWER('${esc(e)}')`)
    .join(", ");

  const sql = `
    SELECT DISTINCT discipline
    FROM ${ACCESS_TABLE}
    WHERE LOWER(TRIM(email)) IN (${inClause})
      AND is_active = true
      AND discipline IS NOT NULL
  `;

  console.log("MATRIX ACCESS CANDIDATES:", candidates);

  const rows = await queryDatabricks(sql);

  const disciplines = (rows || [])
    .map((row) => norm(row?.[0]))
    .filter(Boolean);

  console.log("MATRIX ACCESS RESULT:", disciplines);

  // No row = full access
  if (disciplines.length === 0) return ["All"];

  return disciplines;
}

async function getAccessForRequest(req) {
  const email = getUserEmail(req);

  console.log("ACCESS CHECK EMAIL:", email);

  if (!email) {
    return { email: "", allowedDisciplines: [] };
  }

  const allowedDisciplines =
    await getAllowedDisciplinesFromAccessTable(email);

  console.log("ACCESS CHECK DISCIPLINES:", allowedDisciplines);

  return { email, allowedDisciplines };
}

async function requireDisciplineAccess(req, res, requestedDiscipline) {
  const { email, allowedDisciplines } = await getAccessForRequest(req);

  if (!email) {
    res.status(401).json({
      message:
        "User session email is missing. Please log out and log in again.",
    });
    return null;
  }

  if (
    requestedDiscipline &&
    !isDisciplineAllowed(requestedDiscipline, allowedDisciplines)
  ) {
    res.status(403).json({
      message: "You do not have access to this discipline.",
      allowedDisciplines,
    });
    return null;
  }

  return { email, allowedDisciplines };
}

/* =========================================================
   GET /api/skill-matrix/meta
   ========================================================= */

router.get("/meta", async (req, res) => {
  try {
    res.set({
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      SurrogateControl: "no-store",
    });

    const access = await requireDisciplineAccess(req, res, "");
    if (!access) return;

    const { email, allowedDisciplines } = access;

    const visibleDisciplines = hasAllAccess(allowedDisciplines)
      ? DISCIPLINES
      : DISCIPLINES.filter((discipline) =>
          allowedDisciplines.some(
            (allowed) => keyOf(allowed) === keyOf(discipline)
          )
        );

    return res.status(200).json({
      email,
      disciplines: visibleDisciplines,
      roles: ROLES,
      allowedDisciplines,
    });
  } catch (err) {
    console.error("META ERROR:", err);
    console.error("META ERROR DATA:", err.response?.data);

    return res.status(500).json({
      message: "Meta fetch failed",
      disciplines: [],
      roles: ROLES,
      allowedDisciplines: [],
      error: err.response?.data || err.message,
    });
  }
});

/* =========================================================
   GET /api/skill-matrix
   ========================================================= */

router.get("/", async (req, res) => {
  try {
    const requestedDiscipline = norm(req.query.discipline);
    const role = norm(req.query.role);

    const access = await requireDisciplineAccess(
      req,
      res,
      requestedDiscipline
    );
    if (!access) return;

    const { allowedDisciplines } = access;

    let effectiveDiscipline = requestedDiscipline;

    if (
      !effectiveDiscipline &&
      !hasAllAccess(allowedDisciplines) &&
      allowedDisciplines.length === 1
    ) {
      effectiveDiscipline = allowedDisciplines[0];
    }

    let disciplineFilter = "";

    if (effectiveDiscipline) {
      disciplineFilter = `
        AND ${normKeySql("Discipline")}
          = LOWER('${esc(effectiveDiscipline)}')
      `;
    } else if (!hasAllAccess(allowedDisciplines)) {
      const allowedSql = allowedDisciplines
        .map((discipline) => `LOWER('${esc(norm(discipline))}')`)
        .join(", ");

      disciplineFilter = `
        AND ${normKeySql("Discipline")} IN (${allowedSql})
      `;
    }

    const roleFilter = role
      ? `
        AND ${normKeySql("Role")}
          = LOWER('${esc(role)}')
      `
      : "";

    const sql = `
      WITH base AS (
        SELECT
          ${normDispSql("Discipline")} AS Discipline,
          ${normDispSql("Role")} AS Role,
          ${normDispSql("LevelKey")} AS LevelKey,
          ${normKeySql("Skill")} AS SkillKey,
          ${normKeySql("Subskill")} AS SubskillKey,
          ${normDispSql("Skill")} AS SkillDisp,
          ${normDispSql("Subskill")} AS SubskillDisp,
          Value
        FROM ${UPLOAD}
        WHERE 1 = 1
          ${disciplineFilter}
          ${roleFilter}
      ),

      hist_ranked AS (
        SELECT
          ${normDispSql("Discipline")} AS Discipline,
          ${normDispSql("Role")} AS Role,
          ${normDispSql("LevelKey")} AS LevelKey,
          ${normKeySql("Skill")} AS SkillKey,
          ${normKeySql("Subskill")} AS SubskillKey,
          ${normDispSql("Skill")} AS SkillDisp,
          ${normDispSql("Subskill")} AS SubskillDisp,
          old_value,
          new_value,
          action,
          changed_at,
          changed_by,

          ROW_NUMBER() OVER (
            PARTITION BY
              ${normKeySql("Discipline")},
              ${normKeySql("Role")},
              ${normKeySql("LevelKey")},
              ${normKeySql("Skill")},
              ${normKeySql("Subskill")}
            ORDER BY changed_at DESC
          ) AS rn

        FROM ${HISTORY}
        WHERE 1 = 1
          ${disciplineFilter}
          ${roleFilter}
      ),

      latest_history AS (
        SELECT * FROM hist_ranked WHERE rn = 1
      ),

      all_keys AS (
        SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey
        FROM base

        UNION

        SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey
        FROM latest_history
      ),

      final_data AS (
        SELECT
          keys.Discipline,
          keys.Role,
          keys.LevelKey,

          COALESCE(history.SkillDisp, base.SkillDisp) AS Skill,
          COALESCE(history.SubskillDisp, base.SubskillDisp) AS Subskill,

          CASE
            WHEN history.action = 'DELETE' THEN NULL
            WHEN history.new_value IS NOT NULL THEN history.new_value
            ELSE base.Value
          END AS Value,

          history.changed_by

        FROM all_keys keys

        LEFT JOIN base
          ON base.Discipline = keys.Discipline
         AND base.Role = keys.Role
         AND base.LevelKey = keys.LevelKey
         AND base.SkillKey = keys.SkillKey
         AND base.SubskillKey = keys.SubskillKey

        LEFT JOIN latest_history history
          ON history.Discipline = keys.Discipline
         AND history.Role = keys.Role
         AND history.LevelKey = keys.LevelKey
         AND history.SkillKey = keys.SkillKey
         AND history.SubskillKey = keys.SubskillKey
      )

      SELECT
        Discipline,
        Role,
        LevelKey,
        Skill,
        Subskill,
        Value,
        changed_by

      FROM final_data

      WHERE Value IS NOT NULL

      ORDER BY Skill, Subskill, LevelKey
    `;

    const rows = await queryDatabricks(sql);

    return res.status(200).json(
      rows.map((row) => ({
        discipline: row[0],
        role: row[1],
        level: row[2],
        category: row[3],
        skill_name: row[4],
        proficiency: row[5],
        changed_by: row[6],
      }))
    );
  } catch (err) {
    console.error("MATRIX ERROR:", err);
    console.error("MATRIX ERROR DATA:", err.response?.data);

    return res.status(500).json({
      message: "Matrix fetch failed",
      error: err.response?.data || err.message,
    });
  }
});

/* =========================================================
   POST /api/skill-matrix/save
   ========================================================= */

router.post("/save", async (req, res) => {
  try {
    const requestRows = req.body;

    if (!Array.isArray(requestRows) || requestRows.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const cleanedRows = requestRows.map((row) => ({
      Discipline: norm(row.Discipline),
      Role: norm(row.Role),
      LevelKey: norm(row.LevelKey),
      Skill: norm(row.Skill),
      Subskill: norm(row.Subskill),
      Value: norm(row.Value ?? "NA"),
    }));

    for (const row of cleanedRows) {
      if (
        !row.Discipline ||
        !row.Role ||
        !row.LevelKey ||
        !row.Skill ||
        !row.Subskill
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }
    }

    const access = await requireDisciplineAccess(req, res, "");
    if (!access) return;

    for (const row of cleanedRows) {
      if (
        !isDisciplineAllowed(row.Discipline, access.allowedDisciplines)
      ) {
        return res.status(403).json({
          message: `You do not have access to ${row.Discipline}.`,
          allowedDisciplines: access.allowedDisciplines,
        });
      }
    }

    const changedBy = access.email;

    const insertRowsSql = cleanedRows
      .map(
        (row) => `
          SELECT
            '${esc(row.Discipline)}' AS Discipline,
            '${esc(row.Role)}' AS Role,
            '${esc(row.LevelKey)}' AS LevelKey,
            '${esc(row.Skill)}' AS Skill,
            '${esc(row.Subskill)}' AS Subskill,

            (
              SELECT Value
              FROM (
                WITH base_value AS (
                  SELECT Value
                  FROM ${UPLOAD}
                  WHERE ${normKeySql("Discipline")}
                    = LOWER('${esc(row.Discipline)}')
                    AND ${normKeySql("Role")}
                    = LOWER('${esc(row.Role)}')
                    AND ${normKeySql("LevelKey")}
                    = LOWER('${esc(row.LevelKey)}')
                    AND ${normKeySql("Skill")}
                    = LOWER('${esc(row.Skill)}')
                    AND ${normKeySql("Subskill")}
                    = LOWER('${esc(row.Subskill)}')
                  LIMIT 1
                ),

                history_ranked AS (
                  SELECT
                    new_value,
                    action,
                    changed_at,
                    ROW_NUMBER() OVER (
                      ORDER BY changed_at DESC
                    ) AS rn
                  FROM ${HISTORY}
                  WHERE ${normKeySql("Discipline")}
                    = LOWER('${esc(row.Discipline)}')
                    AND ${normKeySql("Role")}
                    = LOWER('${esc(row.Role)}')
                    AND ${normKeySql("LevelKey")}
                    = LOWER('${esc(row.LevelKey)}')
                    AND ${normKeySql("Skill")}
                    = LOWER('${esc(row.Skill)}')
                    AND ${normKeySql("Subskill")}
                    = LOWER('${esc(row.Subskill)}')
                ),

                latest_history AS (
                  SELECT * FROM history_ranked WHERE rn = 1
                )

                SELECT
                  CASE
                    WHEN (SELECT action FROM latest_history) = 'DELETE'
                      THEN NULL

                    WHEN (SELECT new_value FROM latest_history) IS NOT NULL
                      THEN (SELECT new_value FROM latest_history)

                    ELSE (SELECT Value FROM base_value)
                  END AS Value
              )
            ) AS old_value,

            '${esc(row.Value)}' AS new_value,

            CASE
              WHEN (
                SELECT COUNT(*)
                FROM ${UPLOAD}
                WHERE ${normKeySql("Discipline")}
                  = LOWER('${esc(row.Discipline)}')
                  AND ${normKeySql("Role")}
                  = LOWER('${esc(row.Role)}')
                  AND ${normKeySql("LevelKey")}
                  = LOWER('${esc(row.LevelKey)}')
                  AND ${normKeySql("Skill")}
                  = LOWER('${esc(row.Skill)}')
                  AND ${normKeySql("Subskill")}
                  = LOWER('${esc(row.Subskill)}')
              ) > 0 THEN 'UPDATE'

              ELSE 'INSERT'
            END AS action,

            CURRENT_TIMESTAMP() AS changed_at,
            '${esc(changedBy)}' AS changed_by
        `
      )
      .join("\nUNION ALL\n");

    const historyInsertSql = `
      INSERT INTO ${HISTORY}
      (
        Discipline,
        Role,
        LevelKey,
        Skill,
        Subskill,
        old_value,
        new_value,
        action,
        changed_at,
        changed_by
      )

      ${insertRowsSql}
    `;

    await queryDatabricks(historyInsertSql);

    return res.status(200).json({
      success: true,
      count: cleanedRows.length,
      changed_by: changedBy,
    });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    console.error("SAVE ERROR DATA:", err.response?.data);

    return res.status(500).json({
      message: "Save failed",
      error: err.response?.data || err.message,
    });
  }
});

/* =========================================================
   POST /api/skill-matrix/row/delete
   ========================================================= */

router.post("/row/delete", async (req, res) => {
  try {
    const Discipline = norm(req.body?.Discipline);
    const Role = norm(req.body?.Role);
    const Skill = norm(req.body?.Skill);
    const Subskill = norm(req.body?.Subskill);

    if (!Discipline || !Role || !Skill || !Subskill) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const access = await requireDisciplineAccess(req, res, Discipline);
    if (!access) return;

    const changedBy = access.email;
    const roleLevels = levelsForRole(Role);

    const deleteRowsSql = roleLevels
      .map(
        (level) => `
          SELECT
            '${esc(Discipline)}' AS Discipline,
            '${esc(Role)}' AS Role,
            '${esc(level)}' AS LevelKey,
            '${esc(Skill)}' AS Skill,
            '${esc(Subskill)}' AS Subskill,
            NULL AS old_value,
            NULL AS new_value,
            'DELETE' AS action,
            CURRENT_TIMESTAMP() AS changed_at,
            '${esc(changedBy)}' AS changed_by
        `
      )
      .join("\nUNION ALL\n");

    const deleteSql = `
      INSERT INTO ${HISTORY}
      (
        Discipline,
        Role,
        LevelKey,
        Skill,
        Subskill,
        old_value,
        new_value,
        action,
        changed_at,
        changed_by
      )

      ${deleteRowsSql}
    `;

    await queryDatabricks(deleteSql);

    return res.status(200).json({
      success: true,
      changed_by: changedBy,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    console.error("DELETE ERROR DATA:", err.response?.data);

    return res.status(500).json({
      message: "Delete failed",
      error: err.response?.data || err.message,
    });
  }
});

export default router;