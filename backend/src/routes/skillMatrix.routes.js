
// import express from "express";
// import { queryDatabricks } from "../db/databricks.js";

// const router = express.Router();

// const TABLE = "ogc_techdept_test.skill_matrix.skill_matrix_upload";
// const HISTORY = "ogc_techdept_test.skill_matrix.skill_matrix_history";

// const esc = (v) => String(v ?? "").replaceAll("'", "''");
// const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

// // SQL-side normalize (trim + collapse spaces)
// const normSql = (col) => `TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' '))`;

// /* =========================
//    META
// ========================= */
// router.get("/meta", async (req, res) => {
//   try {
//     const rows = await queryDatabricks(`
//       SELECT DISTINCT Discipline
//       FROM ${TABLE}
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

// /* =========================
//    GET MATRIX  ✅ FIX "revert after save"
//    Key fix: ORDER BY puts normalized Skill/Subskill last so they overwrite messy duplicates in UI
// ========================= */
// router.get("/", async (req, res) => {
//   try {
//     const discipline = norm(req.query.discipline);
//     const role = norm(req.query.role);

//     let sql = `
//       SELECT Discipline, Role, LevelKey, Skill, Subskill, Value
//       FROM ${TABLE}
//       WHERE 1=1
//     `;

//     if (discipline) sql += ` AND LOWER(TRIM(Discipline)) = LOWER(TRIM('${esc(discipline)}')) `;
//     if (role) sql += ` AND LOWER(TRIM(Role)) = LOWER(TRIM('${esc(role)}')) `;

//     // ✅ normalized rows last (so they win in your frontend transform)
//     sql += `
//       ORDER BY
//         ${normSql("Skill")},
//         ${normSql("Subskill")},
//         LevelKey,
//         CASE
//           WHEN Skill = ${normSql("Skill")} AND Subskill = ${normSql("Subskill")}
//           THEN 1 ELSE 0
//         END
//     `;

//     const rows = await queryDatabricks(sql);

//     res.json(
//       rows.map((r) => ({
//         discipline: r[0],
//         role: r[1],
//         level: r[2],
//         category: r[3],
//         skill_name: r[4],
//         proficiency: r[5],
//       }))
//     );
//   } catch (err) {
//     console.error("GET ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Fetch failed" });
//   }
// });

// /* =========================
//    DELETE ROW ✅ reliable (POST)
//    Use this from frontend instead of DELETE
// ========================= */
// router.post("/row/delete", async (req, res) => {
//   try {
//     const Discipline = norm(req.body?.Discipline);
//     const Role = norm(req.body?.Role);
//     const Skill = norm(req.body?.Skill);
//     const Subskill = norm(req.body?.Subskill);

//     if (!Discipline || !Role || !Skill || !Subskill) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     await queryDatabricks(`
//       DELETE FROM ${TABLE}
//       WHERE LOWER(TRIM(Discipline)) = LOWER(TRIM('${esc(Discipline)}'))
//         AND LOWER(TRIM(Role)) = LOWER(TRIM('${esc(Role)}'))
//         AND LOWER(TRIM(Skill)) = LOWER(TRIM('${esc(Skill)}'))
//         AND LOWER(TRIM(Subskill)) = LOWER(TRIM('${esc(Subskill)}'))
//     `);

//     res.json({ success: true });
//   } catch (err) {
//     console.error("DELETE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Delete failed" });
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

//     // ✅ Build source dataset via UNION ALL (no s(col-list) anywhere)
//     const sourceSql = cleaned
//       .map(
//         (r) => `
// SELECT
//   '${esc(r.Discipline)}' AS Discipline,
//   '${esc(r.Role)}' AS Role,
//   '${esc(r.LevelKey)}' AS LevelKey,
//   '${esc(r.Skill)}' AS Skill,
//   '${esc(r.Subskill)}' AS Subskill,
//   '${esc(r.Value)}' AS Value
// `
//       )
//       .join("\nUNION ALL\n");

//     // 1) HISTORY only when changed or inserted
//     const historySql = `
// INSERT INTO ${HISTORY}
// (Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at)
// SELECT
//   s.Discipline, s.Role, s.LevelKey, s.Skill, s.Subskill,
//   t.Value AS old_value,
//   s.Value AS new_value,
//   CASE WHEN t.Value IS NULL THEN 'INSERT' ELSE 'UPDATE' END AS action,
//   CURRENT_TIMESTAMP()
// FROM (
//   ${sourceSql}
// ) s
// LEFT JOIN ${TABLE} t
//   ON t.Discipline = s.Discipline
//  AND t.Role = s.Role
//  AND t.LevelKey = s.LevelKey
//  AND t.Skill = s.Skill
//  AND t.Subskill = s.Subskill
// WHERE t.Value IS NULL OR t.Value <> s.Value
// `;

//     // 2) MERGE UPSERT (no alias column list)
//     const mergeSql = `
// MERGE INTO ${TABLE} t
// USING (
//   ${sourceSql}
// ) s
// ON  t.Discipline = s.Discipline
// AND t.Role = s.Role
// AND t.LevelKey = s.LevelKey
// AND t.Skill = s.Skill
// AND t.Subskill = s.Subskill
// WHEN MATCHED THEN UPDATE SET t.Value = s.Value
// WHEN NOT MATCHED THEN
//   INSERT (Discipline, Role, LevelKey, Skill, Subskill, Value)
//   VALUES (s.Discipline, s.Role, s.LevelKey, s.Skill, s.Subskill, s.Value)
// `;

//     await queryDatabricks(historySql);
//     await queryDatabricks(mergeSql);

//     res.json({ success: true, count: cleaned.length });
//   } catch (err) {
//     console.error("SAVE ERROR:", err.response?.data || err.message);
//     res.status(500).json({ message: "Save failed", error: err.message });
//   }
// });

// export default router;




import express from "express";
import { queryDatabricks } from "../db/databricks.js";

const router = express.Router();

const UPLOAD = "ogc_techdept_test.skill_matrix.skill_matrix_upload";     // MASTER (READ ONLY)
const HISTORY = "ogc_techdept_test.skill_matrix.skill_matrix_history";  // CHANGES (APPEND ONLY)

const esc = (v) => String(v ?? "").replaceAll("'", "''");
const norm = (v) => String(v ?? "").trim().replace(/\s+/g, " ");

const normDispSql = (col) => `TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' '))`;

const normKeySql  = (col) => `LOWER(TRIM(REGEXP_REPLACE(${col}, '\\\\s+', ' ')))`;


/* =========================================================
   META (disciplines + roles) from MASTER table
========================================================= */
router.get("/meta", async (req, res) => {
  try {
    const rows = await queryDatabricks(`
      SELECT DISTINCT Discipline
      FROM ${UPLOAD}
      WHERE Discipline IS NOT NULL
      ORDER BY Discipline
    `);

    res.json({
      disciplines: rows.map((r) => r[0]),
      roles: ["Engineer", "Designer"],
    });
  } catch (err) {
    console.error("META ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Meta failed" });
  }
});


// router.get("/", async (req, res) => {
//   try {
//     const discipline = norm(req.query.discipline);
//     const role = norm(req.query.role);

//     const dFilter = discipline ? ` AND LOWER(TRIM(Discipline)) = LOWER(TRIM('${esc(discipline)}')) ` : "";
//     const rFilter = role ? ` AND LOWER(TRIM(Role)) = LOWER(TRIM('${esc(role)}')) ` : "";

//     const sql = `
// WITH base AS (
//   SELECT
//     Discipline, Role, LevelKey, Skill, Subskill, Value
//   FROM ${UPLOAD}
//   WHERE 1=1
//   ${dFilter}
//   ${rFilter}
// ),
// hist_ranked AS (
//   SELECT
//     Discipline, Role, LevelKey, Skill, Subskill,
//     old_value, new_value, action, changed_at,
//     ROW_NUMBER() OVER (
//       PARTITION BY Discipline, Role, LevelKey, Skill, Subskill
//       ORDER BY changed_at DESC
//     ) AS rn
//   FROM ${HISTORY}
//   WHERE 1=1
//   ${dFilter}
//   ${rFilter}
// ),
// hist_latest AS (
//   SELECT * FROM hist_ranked WHERE rn = 1
// ),
// -- union keys: all base rows + any newly inserted keys from history
// all_keys AS (
//   SELECT Discipline, Role, LevelKey, Skill, Subskill FROM base
//   UNION
//   SELECT Discipline, Role, LevelKey, Skill, Subskill FROM hist_latest
// ),
// final AS (
//   SELECT
//     k.Discipline, k.Role, k.LevelKey, k.Skill, k.Subskill,
//     CASE
//       WHEN hl.action = 'DELETE' THEN NULL
//       WHEN hl.new_value IS NOT NULL THEN hl.new_value
//       ELSE b.Value
//     END AS Value,
//     hl.action AS last_action,
//     hl.changed_at AS last_changed_at
//   FROM all_keys k
//   LEFT JOIN base b
//     ON b.Discipline=k.Discipline AND b.Role=k.Role AND b.LevelKey=k.LevelKey
//    AND b.Skill=k.Skill AND b.Subskill=k.Subskill
//   LEFT JOIN hist_latest hl
//     ON hl.Discipline=k.Discipline AND hl.Role=k.Role AND hl.LevelKey=k.LevelKey
//    AND hl.Skill=k.Skill AND hl.Subskill=k.Subskill
// )
// SELECT Discipline, Role, LevelKey, Skill, Subskill, Value
// FROM final
// WHERE Value IS NOT NULL
// ORDER BY
//   ${normSql("Skill")},
//   ${normSql("Subskill")},
//   LevelKey
// `;

//     const rows = await queryDatabricks(sql);

//     // Map to frontend shape
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
    ${normKeySql("Skill")}    AS SkillKey,
    ${normKeySql("Subskill")} AS SubskillKey,
    ${normDispSql("Skill")}   AS SkillDisp,
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
    ${normKeySql("Skill")}    AS SkillKey,
    ${normKeySql("Subskill")} AS SubskillKey,
    ${normDispSql("Skill")}   AS SkillDisp,
    ${normDispSql("Subskill")} AS SubskillDisp,
    old_value, new_value, action, changed_at,
    ROW_NUMBER() OVER (
      PARTITION BY Discipline, Role, LevelKey, ${normKeySql("Skill")}, ${normKeySql("Subskill")}
      ORDER BY changed_at DESC
    ) AS rn
  FROM ${HISTORY}
  WHERE 1=1
  ${dFilter}
  ${rFilter}
),
hl AS (SELECT * FROM hist_ranked WHERE rn = 1),

all_keys AS (
  SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM base
  UNION
  SELECT Discipline, Role, LevelKey, SkillKey, SubskillKey FROM hl
),

final AS (
  SELECT
    k.Discipline, k.Role, k.LevelKey,
    COALESCE(hl.SkillDisp, b.SkillDisp) AS Skill,
    COALESCE(hl.SubskillDisp, b.SubskillDisp) AS Subskill,
    CASE
      WHEN hl.action = 'DELETE' THEN NULL
      WHEN hl.new_value IS NOT NULL THEN hl.new_value
      ELSE b.Value
    END AS Value
  FROM all_keys k
  LEFT JOIN base b
    ON b.Discipline = k.Discipline
   AND b.Role       = k.Role
   AND b.LevelKey   = k.LevelKey
   AND b.SkillKey   = k.SkillKey
   AND b.SubskillKey= k.SubskillKey
  LEFT JOIN hl
    ON hl.Discipline = k.Discipline
   AND hl.Role       = k.Role
   AND hl.LevelKey   = k.LevelKey
   AND hl.SkillKey   = k.SkillKey
   AND hl.SubskillKey= k.SubskillKey
)

SELECT Discipline, Role, LevelKey, Skill, Subskill, Value
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
    })));
  } catch (err) {
    console.error("GET ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* =========================================================
   SAVE (HISTORY ONLY)
   - DO NOT UPDATE UPLOAD TABLE
   - Insert history rows for UPDATE/INSERT actions
   - We do NOT need old_value to be perfect; but we can fetch old from current view for correctness
========================================================= */
router.post("/save", async (req, res) => {
  try {
    const rows = req.body;

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
  CURRENT_TIMESTAMP() AS changed_at
`).join("\nUNION ALL\n");

    const historyInsert = `
INSERT INTO ${HISTORY}
(Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at)
${insertSql}
`;

    await queryDatabricks(historyInsert);

    res.json({ success: true, count: cleaned.length });

  } catch (err) {
    console.error("SAVE ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Save failed", error: err.message });
  }
});


router.post("/row/delete", async (req, res) => {
  try {
    const Discipline = norm(req.body?.Discipline);
    const Role = norm(req.body?.Role);
    const Skill = norm(req.body?.Skill);
    const Subskill = norm(req.body?.Subskill);

    if (!Discipline || !Role || !Skill || !Subskill) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const roleLevels =
      Role.toLowerCase() === "designer"
        ? ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"]
        : ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"];

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
  CURRENT_TIMESTAMP() AS changed_at
`).join("\nUNION ALL\n");

    const sql = `
INSERT INTO ${HISTORY}
(Discipline, Role, LevelKey, Skill, Subskill, old_value, new_value, action, changed_at)
${deleteUnion}
`;

    await queryDatabricks(sql);
    res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
