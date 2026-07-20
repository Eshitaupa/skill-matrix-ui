import express from "express";
import { queryDatabricks } from "../db/databricks.js";
const router = express.Router();

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

//   // "esupadhyaya@burnsmcd.in": ["Electrical"],
// // "esupadhyaya@burnsmcd.com": ["Electrical"],
// };

// function getAllowedDisciplines(email) {
//   return USER_DISCIPLINE_ACCESS[email] || ["All"];
// }
async function getAllowedDisciplines(email) {
  try {
    const sql = `
      SELECT discipline
      FROM ogc_techdept_test.skill_matrix.user_discipline_access
      WHERE lower(email) = lower('${email}')
        AND is_active = true
    `;

    const rows = await queryDatabricks(sql);

    if (!rows || rows.length === 0) {
      return ["All"];
    }

    return rows.map((r) => r[0]);

  } catch (err) {
    console.error("ACCESS LOOKUP ERROR:", err);
    return ["All"];
  }
}
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}

function extractEmail(decoded) {
  return (
    decoded?.preferred_username ||
    decoded?.upn ||
    decoded?.email ||
    decoded?.unique_name ||
    ""
  )
    .trim()
    .toLowerCase();
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

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

router.post("/session", async(req, res) => {
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

    if (!email) {
      return res.status(401).json({
        ok: false,
        message: "Email not found in token",
      });
    }

    const allowedDisciplines = await getAllowedDisciplines(email);

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

// Current User
router.get("/me", async (req, res) => {
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
  const allowedDisciplines = await getAllowedDisciplines(normalizedEmail);

  return res.json({
    authenticated: true,
    email: normalizedEmail,
    allowedDisciplines,
  });
});

// Logout
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