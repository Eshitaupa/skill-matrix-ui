
import express from "express";
import { queryDatabricks } from "../db/databricks.js";

const router = express.Router();

console.log("SKILL MATRIX ROUTES LOADED");
const UPLOAD =
  "ogc_techdept_test.skill_matrix.skill_matrix_upload";

const HISTORY =
  "ogc_techdept_test.skill_matrix.skill_matrix_history";

const ACCESS_TABLE =
  "ogc_techdept_test.skill_matrix.user_discipline_access";

const DISCIPLINES = [
  "CSA",
  "Electrical",
  "Instrumentation",
  "Mechanical",
  "Piping Design",
  "Piping Engineering",
  "Process",
  "Project Management",
];

const ROLES = ["Engineer", "Designer"];

const ENGINEER_LEVELS = [
  "L7", "L8", "L9", "L10", "L11","L12", "L13", "L14", "L15", "L16", "L17",
];

const DESIGNER_LEVELS = [
  "L5", "L6", "L7", "L8", "L9","L10", "L11", "L12", "L13", "L14", "L15",
];


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
ORDER BY
    CASE
        -- Process
        WHEN LOWER(Discipline) = 'process'
             AND LOWER(Skill) = 'deliverables' THEN 1
        WHEN LOWER(Discipline) = 'process'
             AND LOWER(Skill) = 'activities' THEN 2
        WHEN LOWER(Discipline) = 'process'
             AND LOWER(Skill) = 'software skills' THEN 3

        -- Mechanical
        WHEN LOWER(Discipline) = 'mechanical'
             AND LOWER(Skill) = 'static equipment' THEN 1
        WHEN LOWER(Discipline) = 'mechanical'
             AND LOWER(Skill) = 'rotary & packaged equipment' THEN 2
        WHEN LOWER(Discipline) = 'mechanical'
             AND LOWER(Skill) = 'software skills' THEN 3

                    WHEN LOWER(Discipline) = 'piping design'
             AND LOWER(Skill) = 'arrangements' THEN 1
        WHEN LOWER(Discipline) = 'piping design'
             AND LOWER(Skill) = 'fixed equipment' THEN 2
        WHEN LOWER(Discipline) = 'piping design'
             AND LOWER(Skill) = 'rotary equipments' THEN 3
                WHEN LOWER(Discipline) = 'piping design'
             AND LOWER(Skill) = 'piping' THEN 4
                WHEN LOWER(Discipline) = 'piping design'
             AND LOWER(Skill) = 'softwares' THEN 5


                      WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'analysis' THEN 1
        WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'fixed equipments' THEN 2
        WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'rotating equipments' THEN 3
                WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'materials' THEN 4
                WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'piping materials' THEN 5
                            WHEN LOWER(Discipline) = 'piping engineering'
             AND LOWER(Skill) = 'softwares' THEN 6
             
                    WHEN LOWER(Discipline) = 'electrical'
             AND LOWER(Skill) = 'engineering' THEN 1
                               WHEN LOWER(Discipline) = 'electrical'
             AND LOWER(Skill) = 'drafting 2D layouts' THEN 2
                               WHEN LOWER(Discipline) = 'electrical'
             AND LOWER(Skill) = '3D modelling' THEN 3
                               WHEN LOWER(Discipline) = 'electrical'
             AND LOWER(Skill) = 'software capabilities' THEN 4

       WHEN LOWER(Discipline) = 'instrumentation'
             AND LOWER(Skill) = 'lists' THEN 1

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'analyzers' THEN 2

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'flow' THEN 3

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'valves' THEN 4

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'control & automation' THEN 5

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'modelling' THEN 6

       WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'wiring/loops' THEN 7
               WHEN LOWER(Discipline) = 'instrumentation'
                    AND LOWER(Skill) = 'general' THEN 7

                    WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'personal effectiveness & leadership' THEN 1
                               WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'communication & collaboration' THEN 2
                               WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'engineering management' THEN 3
                               WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'project planning & control' THEN 4
                 WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'commercial & cost' THEN 5
                 WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'risk & construction' THEN 6
                 WHEN LOWER(Discipline) = 'project management'
             AND LOWER(Skill) = 'business & knowledge' THEN 7

        ELSE 99
    END,
    Skill,
    Subskill,
    Role,
    CAST(REPLACE(LevelKey, 'L', '') AS INT);
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