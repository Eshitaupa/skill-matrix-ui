import express from "express";
import { queryDatabricks } from "../db/databricks.js";

const router = express.Router();

const ACCESS_TABLE =
  "ogc_techdept_test.skill_matrix.user_discipline_access";

/* =========================================================
   HELPERS
   ========================================================= */

const escSql = (value) =>
  String(value ?? "").replaceAll("'", "''");

const norm = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

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

/* =========================================================
   ACCESS LOOKUP
   Strict whitelist — no fallback. No row = no access.
   ========================================================= */

async function getAllowedDisciplines(email) {
  const candidates = getEmailCandidates(email);

  if (candidates.length === 0) {
    return [];
  }

  const inClause = candidates
    .map((e) => `'${escSql(e)}'`)
    .join(", ");

  const sql = `
    SELECT DISTINCT discipline
    FROM ${ACCESS_TABLE}
    WHERE LOWER(TRIM(email)) IN (${inClause})
      AND is_active = true
      AND discipline IS NOT NULL
  `;

  console.log("LOOKING UP ACCESS FOR:", candidates);

  const rows = await queryDatabricks(sql);

  console.log("RAW ACCESS ROWS:", rows);

  const disciplines = (rows || [])
    .map((row) => String(row?.[0] || "").trim())
    .filter(Boolean);

  console.log("FINAL DISCIPLINES:", disciplines);

  // 🚫 No fallback. Empty array = user not authorized.
  return disciplines;
}

/* =========================================================
   JWT / TOKEN HELPERS
   ========================================================= */

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}

function extractEmail(decoded) {
  const email =
    decoded?.preferred_username ||
    decoded?.upn ||
    decoded?.email ||
    decoded?.unique_name ||
    "";

  console.log("TOKEN preferred_username:", decoded?.preferred_username);
  console.log("TOKEN upn:", decoded?.upn);
  console.log("TOKEN email:", decoded?.email);
  console.log("TOKEN unique_name:", decoded?.unique_name);
  console.log("FINAL EXTRACTED EMAIL:", email);

  return String(email).trim().toLowerCase();
}

function validateToken(decoded) {
  if (!decoded) {
    return {
      valid: false,
      reason: "Invalid token",
    };
  }

  const now = Math.floor(Date.now() / 1000);

  if (decoded.exp && decoded.exp < now) {
    return {
      valid: false,
      reason: "Token expired",
    };
  }

  return {
    valid: true,
  };
}

/* =========================================================
   COOKIE CONFIG
   ========================================================= */

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60, // 1 hour
};

const clearCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

/* =========================================================
   POST /api/auth/session
   Creates a session after MSAL login.
   Blocks anyone not in the access table.
   ========================================================= */

router.post("/session", async (req, res) => {
  try {
    console.log("POST /api/auth/session");

    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({
        ok: false,
        message: "Missing id_token",
      });
    }

    const decoded = decodeJwt(id_token);
    const validation = validateToken(decoded);

    if (!validation.valid) {
      return res.status(401).json({
        ok: false,
        message: validation.reason,
      });
    }

    const email = extractEmail(decoded);
    console.log("SESSION EMAIL USED FOR ACCESS:", email);

    if (!email) {
      return res.status(401).json({
        ok: false,
        message: "Email not found in token",
      });
    }

    const allowedDisciplines = await getAllowedDisciplines(email);

    // 🚫 Whitelist enforcement — user must be in the access table
    if (!allowedDisciplines || allowedDisciplines.length === 0) {
      console.warn("LOGIN BLOCKED — no access row for:", email);

      // Ensure no stale session lingers
      res.clearCookie("session_token", clearCookieOptions);
      res.clearCookie("user_email", clearCookieOptions);

      return res.status(403).json({
        ok: false,
        authenticated: false,
        message:
          "You are not authorized to use Skill Matrix. Please contact the administrator.",
      });
    }

    res.cookie("session_token", id_token, cookieOptions);
    res.cookie("user_email", email, cookieOptions);

    return res.json({
      ok: true,
      authenticated: true,
      email,
      allowedDisciplines,
    });
  } catch (err) {
    console.error("SESSION ERROR:", err);

    return res.status(500).json({
      ok: false,
      message: "Failed to create session",
    });
  }
});

/* =========================================================
   GET /api/auth/me
   Returns current user. Re-checks whitelist on every call
   so revoked users are kicked out even mid-session.
   ========================================================= */

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.session_token;
    const email = req.cookies.user_email;

    if (!token || !email) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const decoded = decodeJwt(token);
    const validation = validateToken(decoded);

    if (!validation.valid) {
      res.clearCookie("session_token", clearCookieOptions);
      res.clearCookie("user_email", clearCookieOptions);

      return res.status(401).json({
        authenticated: false,
        message: validation.reason,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const allowedDisciplines = await getAllowedDisciplines(
      normalizedEmail
    );

    // 🚫 Kick out if access was revoked while session was active
    if (!allowedDisciplines || allowedDisciplines.length === 0) {
      console.warn(
        "SESSION REVOKED — user no longer has access:",
        normalizedEmail
      );

      res.clearCookie("session_token", clearCookieOptions);
      res.clearCookie("user_email", clearCookieOptions);

      return res.status(403).json({
        authenticated: false,
        message: "You are not authorized to use Skill Matrix.",
      });
    }

    return res.status(200).json({
      authenticated: true,
      email: normalizedEmail,
      allowedDisciplines,
    });
  } catch (err) {
    console.error("ME ERROR:", err);

    return res.status(500).json({
      authenticated: false,
      message: "Failed to load session",
    });
  }
});

/* =========================================================
   POST /api/auth/logout
   ========================================================= */

router.post("/logout", (req, res) => {
  res.clearCookie("session_token", clearCookieOptions);
  res.clearCookie("user_email", clearCookieOptions);

  return res.json({
    ok: true,
  });
});

export default router;


// import express from "express";
// import axios from "axios";

// const router = express.Router();

// const TENANT_ID = process.env.TENANT_ID;
// const ENTERPRISE_APP_OBJECT_ID = process.env.ENTERPRISE_APP_OBJECT_ID;
// const GRAPH_CLIENT_ID = process.env.GRAPH_CLIENT_ID;
// const GRAPH_CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;

// /**
//  * Discipline restriction map only.
//  * This does NOT control login.
//  * Azure Enterprise App assignment controls login permission.
//  */
// const USER_DISCIPLINE_ACCESS = {
//   "pnshinde@burnsmcd.in": ["Project Management"],
//   "akdalal@burnsmcd.in": ["Process"],
//   "ndkhandale@burnsmcd.in": ["Process"],
//   "saharchandani@burnsmcd.in": ["Process"],
//   "tvmahale@burnsmcd.in": ["Mechanical"],
//   "jssahoo@burnsmcd.in": ["Mechanical"],
//   "mjsawant@burnsmcd.in": ["CSA"],
//   "ptbhosale@burnsmcd.in": ["CSA"],
//   "ambane@burnsmcd.in": ["CSA"],
//   "sswale@burnsmcd.in": ["CSA"],
//   "vatelkar@burnsmcd.in": ["Piping Design"],
//   "mringulkar@burnsmcd.in": ["Piping Design"],
//   "sbbabar@burnsmcd.in": ["Piping Design"],
//   "hpdoshi@burnsmcd.in": ["Piping Engineering"],
//   "svboppa@burnsmcd.in": ["Piping Engineering"],
//   "jkshirodkar@burnsmcd.in": ["Instrumentation"],
//   "kpsave@burnsmcd.in": ["Instrumentation"],
//   "mchakrabartti@burnsmcd.in": ["Electrical"],
//   "vsvyas@burnsmcd.in": ["Electrical"],
//   "dmpatil@burnsmcd.in": ["Electrical"],
// };

// function normalizeEmail(value) {
//   return String(value || "").trim().toLowerCase();
// }

// function decodeJwt(token) {
//   try {
//     const payload = token.split(".")[1];
//     const decoded = Buffer.from(payload, "base64url").toString("utf8");
//     return JSON.parse(decoded);
//   } catch (err) {
//     console.error("JWT decode failed:", err);
//     return null;
//   }
// }

// async function getGraphAccessToken() {
//   const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

//   const body = new URLSearchParams({
//     client_id: GRAPH_CLIENT_ID,
//     client_secret: GRAPH_CLIENT_SECRET,
//     scope: "https://graph.microsoft.com/.default",
//     grant_type: "client_credentials",
//   });

//   const response = await axios.post(tokenUrl, body.toString(), {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   });

//   return response.data.access_token;
// }

// /**
//  * Checks whether logged-in user is assigned to Enterprise Application.
//  * This checks Azure Enterprise App > Users and groups.
//  */
// async function isUserAssignedToEnterpriseApp(userObjectId) {
//   if (!userObjectId) return false;

//   const graphToken = await getGraphAccessToken();

//   let url =
//     `https://graph.microsoft.com/v1.0/servicePrincipals/${ENTERPRISE_APP_OBJECT_ID}` +
//     `/appRoleAssignedTo?$select=principalId,principalType,principalDisplayName`;

//   while (url) {
//     const response = await axios.get(url, {
//       headers: {
//         Authorization: `Bearer ${graphToken}`,
//       },
//     });

//     const assignments = response.data.value || [];

//     const found = assignments.some(
//       (a) =>
//         String(a.principalId).toLowerCase() ===
//         String(userObjectId).toLowerCase()
//     );

//     if (found) return true;

//     url = response.data["@odata.nextLink"] || null;
//   }

//   return false;
// }

// router.post("/session", async (req, res) => {
//   try {
//     const { id_token } = req.body;

//     if (!id_token) {
//       return res.status(400).json({ message: "Missing token" });
//     }

//     const decoded = decodeJwt(id_token);

//     const email =
//       decoded?.preferred_username ||
//       decoded?.upn ||
//       decoded?.email ||
//       "";

//     const userEmail = normalizeEmail(email);

//     /**
//      * Azure user object id.
//      * This is what we compare against Enterprise App assigned users.
//      */
//     const userObjectId = decoded?.oid;

//     console.log("LOGIN USER EMAIL:", userEmail);
//     console.log("LOGIN USER OBJECT ID:", userObjectId);

//     if (!userEmail || !userObjectId) {
//       return res.status(401).json({
//         message: "Unable to identify logged-in user",
//       });
//     }

//     const assigned = await isUserAssignedToEnterpriseApp(userObjectId);

//     if (!assigned) {
//       return res.status(403).json({
//         message: "User is not assigned to this Enterprise Application",
//         email: userEmail,
//       });
//     }

//     res.cookie("session_token", id_token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60,
//     });

//     res.cookie("user_email", userEmail, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60,
//     });

//     res.cookie("user_oid", userObjectId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60,
//     });

//     const allowedDisciplines =
//       USER_DISCIPLINE_ACCESS[userEmail] || null;

//     return res.json({
//       ok: true,
//       authenticated: true,
//       email: userEmail,
//       allowedDisciplines,
//     });
//   } 
//   catch (err) {
//     console.error("SESSION ERROR:", err.response?.data || err.message);

//     return res.status(500).json({
//       message: "Failed to create session",
//       error: err.response?.data || err.message,
//     });
//   }
// });

// router.get("/me", async (req, res) => {
//   try {
//     const token = req.cookies?.session_token;
//     const email = normalizeEmail(req.cookies?.user_email);
//     const userObjectId = req.cookies?.user_oid;

//     if (!token || !email || !userObjectId) {
//       return res.status(401).json({ authenticated: false });
//     }

//     const assigned = await isUserAssignedToEnterpriseApp(userObjectId);

//     if (!assigned) {
//       return res.status(403).json({
//         authenticated: false,
//         message: "User is not assigned to this Enterprise Application",
//         email,
//       });
//     }

//     const allowedDisciplines =
//       USER_DISCIPLINE_ACCESS[email] || null;

//     return res.json({
//       authenticated: true,
//       email,
//       allowedDisciplines,
//     });
//   } catch (err) {
//     console.error("ME ERROR:", err.response?.data || err.message);

//     return res.status(500).json({
//       authenticated: false,
//       message: "Failed to verify user assignment",
//     });
//   }
// });

// router.post("/logout", (req, res) => {
//   res.clearCookie("session_token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });

//   res.clearCookie("user_email", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });

//   res.clearCookie("user_oid", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });

//   return res.json({ ok: true });
// });

// export default router;