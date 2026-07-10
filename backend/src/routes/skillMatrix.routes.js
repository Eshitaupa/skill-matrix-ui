



// import express from "express";
// import { queryDatabricks } from "../db/databricks.js";

// const router = express.Router();

// const UPLOAD = "ogc_techdept_test.skill_matrix.skill_matrix_upload";     // MASTER 
// const HISTORY = "ogc_techdept_test.skill_matrix.skill_matrix_history";  // CHANGES 

// const esc = (v) => String(v ?? "").replaceAll("'", "''");
// const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

// const normDispSql = (col) => `TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' '))`;

// const normKeySql  = (col) => `LOWER(TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' ')))`;


// router.get("/meta", async (req, res) => {
//   try {
//     const rows = await queryDatabricks(`
//       SELECT DISTINCT Discipline
//       FROM ${UPLOAD}
//       WHERE Discipline IS NOT NULL
//       ORDER BY Discipline
//     `);

//     res.json({
//       disciplines: rows.map((r) => r[0]),
//       roles: ["Engineer", "Designer"],
//     });
//   } catch (err) {
//     console.error("META ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Meta failed" });
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
//     ${normKeySql("Skill")}    AS SkillKey,
//     ${normKeySql("Subskill")} AS SubskillKey,
//     ${normDispSql("Skill")}   AS SkillDisp,
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
//     ${normKeySql("Skill")}    AS SkillKey,
//     ${normKeySql("Subskill")} AS SubskillKey,
//     ${normDispSql("Skill")}   AS SkillDisp,
//     ${normDispSql("Subskill")} AS SubskillDisp,
//     old_value, new_value, action, changed_at,
//     ROW_NUMBER() OVER (
//       PARTITION BY Discipline, Role, LevelKey, ${normKeySql("Skill")}, ${normKeySql("Subskill")}
//       ORDER BY changed_at DESC
//     ) AS rn
//   FROM ${HISTORY}
//   WHERE 1=1
//   ${dFilter}
//   ${rFilter}
// ),
// hl AS (SELECT * FROM hist_ranked WHERE rn = 1),

// all_keys AS (
//   SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM base
//   UNION
//   SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM hl
// ),

// final AS (
//   SELECT
//     k.Discipline, k.Role, k.LevelKey,
//     COALESCE(hl.SkillDisp, b.SkillDisp) AS Skill,
//     COALESCE(hl.SubskillDisp, b.SubskillDisp) AS Subskill,
//     CASE
//       WHEN hl.action = 'DELETE' THEN NULL
//       WHEN hl.new_value IS NOT NULL THEN hl.new_value
//       ELSE b.Value
//     END AS Value
//   FROM all_keys k
//   LEFT JOIN base b
//     ON b.Discipline = k.Discipline
//    AND b.Role       = k.Role
//    AND b.LevelKey   = k.LevelKey
//    AND b.SkillKey   = k.SkillKey
//    AND b.SubskillKey= k.SubskillKey
//   LEFT JOIN hl
//     ON hl.Discipline = k.Discipline
//    AND hl.Role       = k.Role
//    AND hl.LevelKey   = k.LevelKey
//    AND hl.SkillKey   = k.SkillKey
//    AND hl.SubskillKey= k.SubskillKey
// )

// SELECT Discipline, Role, LevelKey, Skill, Subskill, Value
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
//     })));
//   } catch (err) {
//     console.error("GET ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Fetch failed" });
//   }
// });


// router.post("/save", async (req, res) => {
//   try {
//     const rows = req.body;

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
//   CURRENT_TIMESTAMP() AS changed_at
// `).join("\nUNION ALL\n");

//     const historyInsert = `
// INSERT INTO ${HISTORY}
// (Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at)
// ${insertSql}
// `;

//     await queryDatabricks(historyInsert);

//     res.json({ success: true, count: cleaned.length });

//   } catch (err) {
//     console.error("SAVE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Save failed", error: err.message });
//   }
// });


// router.post("/row/delete", async (req, res) => {
//   try {
//     const Discipline = norm(req.body?.Discipline);
//     const Role = norm(req.body?.Role);
//     const Skill = norm(req.body?.Skill);
//     const Subskill = norm(req.body?.Subskill);

//     if (!Discipline || !Role || !Skill || !Subskill) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }


//     const roleLevels =
//       Role.toLowerCase() === "designer"
//         ? ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"]
//         : ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"];

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
//   CURRENT_TIMESTAMP() AS changed_at
// `).join("\nUNION ALL\n");

//     const sql = `
// INSERT INTO ${HISTORY}
// (Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at)
// ${deleteUnion}
// `;

//     await queryDatabricks(sql);
//     res.json({ success: true });

//   } catch (err) {
//     console.error("DELETE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// export default router;


import express from "express";
import { queryDatabricks } from "../db/databricks.js";

const router = express.Router();

const UPLOAD = "ogc_techdept_test.skill_matrix.skill_matrix_upload";     // MASTER
const HISTORY = "ogc_techdept_test.skill_matrix.skill_matrix_history";  // CHANGES

const esc = (v) => String(v ?? "").replaceAll("'", "''");
const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

const normDispSql = (col) => `TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' '))`;
const normKeySql = (col) => `LOWER(TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' ')))`;

function getChangedBy(req) {
  return String(req.cookies?.user_email || "").trim().toLowerCase() || "unknown";
}

router.get("/meta", async (req, res) => {
  try {

    console.log("==== META API HIT ====");
    console.log("DBX_HOST:", process.env.DBX_HOST);
    console.log("DBX_WAREHOUSE_ID:", process.env.DBX_WAREHOUSE_ID);
    console.log("TOKEN EXISTS:", !!process.env.DBX_TOKEN);

    const rows = await queryDatabricks(`
      SELECT DISTINCT Discipline
      FROM ${UPLOAD}
      WHERE Discipline IS NOT NULL
      ORDER BY Discipline
    `);

    console.log("DISCIPLINES:", rows);

    res.json({
      disciplines: rows.map((r) => r[0]),
      roles: ["Engineer", "Designer"]
    });

  } catch (err) {

    console.error("========== META FAILED ==========");
    console.error("MESSAGE:", err.message);
    console.error("STATUS:", err.response?.status);
    console.error("DATA:", err.response?.data);

    return res.status(500).json({
      message: "Meta failed",
      error: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const discipline = norm(req.query.discipline);
    const role = norm(req.query.role);

    const dFilter = discipline ? ` AND LOWER(TRIM(Discipline)) = LOWER(TRIM('${esc(discipline)}')) ` : "";
    const rFilter = role ? ` AND LOWER(TRIM(Role)) = LOWER(TRIM('${esc(role)}')) ` : "";

    const sql = `
WITH base AS (
  SELECT
    Discipline, Role, LevelKey,
    ${normKeySql("Skill")} AS SkillKey,
    ${normKeySql("Subskill")} AS SubskillKey,
    ${normDispSql("Skill")} AS SkillDisp,
    ${normDispSql("Subskill")} AS SubskillDisp,
    Value
  FROM ${UPLOAD}
  WHERE 1=1
  ${dFilter}
  ${rFilter}
),
hist_ranked AS (
  SELECT
    Discipline, Role, LevelKey,
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
      PARTITION BY Discipline, Role, LevelKey, ${normKeySql("Skill")}, ${normKeySql("Subskill")}
      ORDER BY changed_at DESC
    ) AS rn
  FROM ${HISTORY}
  WHERE 1=1
  ${dFilter}
  ${rFilter}
),
hl AS (
  SELECT * FROM hist_ranked WHERE rn = 1
),
all_keys AS (
  SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM base
  UNION
  SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM hl
),
final AS (
  SELECT
    k.Discipline,
    k.Role,
    k.LevelKey,
    COALESCE(hl.SkillDisp, b.SkillDisp) AS Skill,
    COALESCE(hl.SubskillDisp, b.SubskillDisp) AS Subskill,
    CASE
      WHEN hl.action = 'DELETE' THEN NULL
      WHEN hl.new_value IS NOT NULL THEN hl.new_value
      ELSE b.Value
    END AS Value,
    hl.changed_by
  FROM all_keys k
  LEFT JOIN base b
    ON b.Discipline = k.Discipline
   AND b.Role = k.Role
   AND b.LevelKey = k.LevelKey
   AND b.SkillKey = k.SkillKey
   AND b.SubskillKey = k.SubskillKey
  LEFT JOIN hl
    ON hl.Discipline = k.Discipline
   AND hl.Role = k.Role
   AND hl.LevelKey = k.LevelKey
   AND hl.SkillKey = k.SkillKey
   AND hl.SubskillKey = k.SubskillKey
)

SELECT Discipline, Role, LevelKey, Skill, Subskill, Value, changed_by
FROM final
WHERE Value IS NOT NULL
ORDER BY Skill, Subskill, LevelKey
`;

    const rows = await queryDatabricks(sql);

    res.json(rows.map((r) => ({
      discipline: r[0],
      role: r[1],
      level: r[2],
      category: r[3],
      skill_name: r[4],
      proficiency: r[5],
      changed_by: r[6],
    })));
} catch (err) {
  console.error("META ERROR FULL:", err);
  console.error("META ERROR DATA:", err.response?.data);
  console.error("META ERROR MESSAGE:", err.message);

  return res.status(500).json({
    message: "Meta failed",
    error: err.response?.data || err.message
  });
}
});

router.post("/save", async (req, res) => {
  try {
    const rows = req.body;
    const changedBy = getChangedBy(req);

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const cleaned = rows.map((r) => ({
      Discipline: norm(r.Discipline),
      Role: norm(r.Role),
      LevelKey: norm(r.LevelKey),
      Skill: norm(r.Skill),
      Subskill: norm(r.Subskill),
      Value: norm(r.Value ?? "NA"),
    }));

    for (const r of cleaned) {
      if (!r.Discipline || !r.Role || !r.LevelKey || !r.Skill || !r.Subskill) {
        return res.status(400).json({ message: "Missing required fields" });
      }
    }

    const insertSql = cleaned.map((r) => `
SELECT
  '${esc(r.Discipline)}' AS Discipline,
  '${esc(r.Role)}' AS Role,
  '${esc(r.LevelKey)}' AS LevelKey,
  '${esc(r.Skill)}' AS Skill,
  '${esc(r.Subskill)}' AS Subskill,
  (
    SELECT Value FROM (
      WITH base AS (
        SELECT Value
        FROM ${UPLOAD}
        WHERE Discipline='${esc(r.Discipline)}'
          AND Role='${esc(r.Role)}'
          AND LevelKey='${esc(r.LevelKey)}'
          AND Skill='${esc(r.Skill)}'
          AND Subskill='${esc(r.Subskill)}'
      ),
      hist_ranked AS (
        SELECT new_value, action, changed_at,
          ROW_NUMBER() OVER (ORDER BY changed_at DESC) rn
        FROM ${HISTORY}
        WHERE Discipline='${esc(r.Discipline)}'
          AND Role='${esc(r.Role)}'
          AND LevelKey='${esc(r.LevelKey)}'
          AND Skill='${esc(r.Skill)}'
          AND Subskill='${esc(r.Subskill)}'
      ),
      hist_latest AS (
        SELECT * FROM hist_ranked WHERE rn=1
      )
      SELECT
        CASE
          WHEN (SELECT action FROM hist_latest)='DELETE' THEN NULL
          WHEN (SELECT new_value FROM hist_latest) IS NOT NULL THEN (SELECT new_value FROM hist_latest)
          ELSE (SELECT Value FROM base)
        END AS Value
    )
  ) AS old_value,
  '${esc(r.Value)}' AS new_value,
  CASE
    WHEN (
      SELECT COUNT(*) FROM ${UPLOAD}
      WHERE Discipline='${esc(r.Discipline)}'
        AND Role='${esc(r.Role)}'
        AND LevelKey='${esc(r.LevelKey)}'
        AND Skill='${esc(r.Skill)}'
        AND Subskill='${esc(r.Subskill)}'
    ) > 0 THEN 'UPDATE'
    ELSE 'INSERT'
  END AS action,
  CURRENT_TIMESTAMP() AS changed_at,
  '${esc(changedBy)}' AS changed_by
`).join("\nUNION ALL\n");

    const historyInsert = `
INSERT INTO ${HISTORY}
(Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at, changed_by)
${insertSql}
`;

    await queryDatabricks(historyInsert);

    res.json({ success: true, count: cleaned.length, changed_by: changedBy });
  } catch (err) {
    console.error("SAVE ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Save failed", error: err.message });
  }
});

router.post("/row/delete", async (req, res) => {
  try {
    const changedBy = getChangedBy(req);

    const Discipline = norm(req.body?.Discipline);
    const Role = norm(req.body?.Role);
    const Skill = norm(req.body?.Skill);
    const Subskill = norm(req.body?.Subskill);

    if (!Discipline || !Role || !Skill || !Subskill) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const roleLevels =
      Role.toLowerCase() === "designer"
        ? ["L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"]
        : ["L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17"];

    const deleteUnion = roleLevels.map((lvl) => `
SELECT
  '${esc(Discipline)}' AS Discipline,
  '${esc(Role)}' AS Role,
  '${esc(lvl)}' AS LevelKey,
  '${esc(Skill)}' AS Skill,
  '${esc(Subskill)}' AS Subskill,
  NULL AS old_value,
  NULL AS new_value,
  'DELETE' AS action,
  CURRENT_TIMESTAMP() AS changed_at,
  '${esc(changedBy)}' AS changed_by
`).join("\nUNION ALL\n");

    const sql = `
INSERT INTO ${HISTORY}
(Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at, changed_by)
${deleteUnion}
`;

    await queryDatabricks(sql);

    res.json({ success: true, changed_by: changedBy });
  } catch (err) {
    console.error("DELETE ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;