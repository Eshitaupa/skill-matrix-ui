
// import axios from "axios";

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// let cachedToken = null;
// let tokenExpiresAt = 0;

// async function getAccessToken() {
//   const host = String(process.env.DBX_HOST || "").replace(/\/+$/, "");
//   const clientId = process.env.DBX_CLIENT_ID;
//   const clientSecret = process.env.DBX_CLIENT_SECRET;

//   if (!host) throw new Error("DBX_HOST is missing");
//   if (!clientId) throw new Error("DBX_CLIENT_ID is missing");
//   if (!clientSecret) throw new Error("DBX_CLIENT_SECRET is missing");

//   // Reuse cached token if it still has >60s of life left
//   if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
//     return cachedToken;
//   }

//   const params = new URLSearchParams({
//     grant_type: "client_credentials",
//     client_id: clientId,
//     client_secret: clientSecret,
//     scope: "all-apis",
//   });

//   const res = await axios.post(`${host}/oidc/v1/token`, params.toString(), {
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//   });

//   cachedToken = res.data.access_token;
//   tokenExpiresAt = Date.now() + (res.data.expires_in || 3600) * 1000;

//   return cachedToken;
// }

// export async function queryDatabricks(sql) {
//   const host = String(process.env.DBX_HOST || "").replace(/\/+$/, "");
//   const warehouseId = process.env.DBX_WAREHOUSE_ID;

//   if (!host) throw new Error("DBX_HOST is missing");
//   if (!warehouseId) throw new Error("DBX_WAREHOUSE_ID is missing");

//   try {
//     const token = await getAccessToken();

//     const response = await axios.post(
//       `${host}/api/2.0/sql/statements`,
//       {
//         statement: sql,
//         warehouse_id: warehouseId,
//         wait_timeout: "50s",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.status?.state === "SUCCEEDED") {
//       return (
//         response.data?.result?.data_array ||
//         response.data?.result?.data?.array ||
//         []
//       );
//     }

//     const statementId = response.data.statement_id;
//     if (!statementId) {
//       throw new Error(
//         response.data.status?.error?.message || "No Databricks statement ID returned"
//       );
//     }

//     for (let i = 0; i < 30; i++) {
//       await sleep(1000);

//       const poll = await axios.get(
//         `${host}/api/2.0/sql/statements/${statementId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const state = poll.data.status?.state;
//       console.log("DBX STATE:", state);

//       if (state === "SUCCEEDED") {
//         return (
//           poll.data?.result?.data_array ||
//           poll.data?.result?.data?.array ||
//           []
//         );
//       }

//       if (state === "FAILED" || state === "CANCELED") {
//         throw new Error(
//           poll.data.status?.error?.message || `Databricks query ${state.toLowerCase()}`
//         );
//       }
//     }

//     throw new Error("Databricks query timed out");
//   } catch (err) {
//     console.error(
//       "Databricks query failed:",
//       err.response?.status,
//       err.response?.data || err.message
//     );
//     throw err;
//   }
// }


import axios from "axios";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const host = String(process.env.DBX_HOST || "").replace(/\/+$/, "");
  const clientId = process.env.DBX_CLIENT_ID;
  const clientSecret = process.env.DBX_CLIENT_SECRET;

  if (!host) throw new Error("DBX_HOST is missing");
  if (!clientId) throw new Error("DBX_CLIENT_ID is missing");
  if (!clientSecret) throw new Error("DBX_CLIENT_SECRET is missing");

  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "all-apis",
  });

  const res = await axios.post(`${host}/oidc/v1/token`, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = res.data.access_token;
  tokenExpiresAt = Date.now() + (res.data.expires_in || 3600) * 1000;

  return cachedToken;
}

/*
 * CHANGED: warehouses that auto-suspend can take well over 30-60s to
 * cold-start. We now poll for up to 120s (was 30s) and log a clear
 * "warehouse is starting" message so it's obvious in the log stream
 * this is a cold start, not a real failure.
 */
const MAX_POLL_ATTEMPTS = 120;
const POLL_INTERVAL_MS = 1000;

export async function queryDatabricks(sql) {
  const host = String(process.env.DBX_HOST || "").replace(/\/+$/, "");
  const warehouseId = process.env.DBX_WAREHOUSE_ID;

  if (!host) throw new Error("DBX_HOST is missing");
  if (!warehouseId) throw new Error("DBX_WAREHOUSE_ID is missing");

  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${host}/api/2.0/sql/statements`,
      {
        statement: sql,
        warehouse_id: warehouseId,
        wait_timeout: "50s",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status?.state === "SUCCEEDED") {
      return (
        response.data?.result?.data_array ||
        response.data?.result?.data?.array ||
        []
      );
    }

    const statementId = response.data.statement_id;
    if (!statementId) {
      throw new Error(
        response.data.status?.error?.message || "No Databricks statement ID returned"
      );
    }

    console.log("DBX WAREHOUSE STARTING / QUERY PENDING — polling up to", MAX_POLL_ATTEMPTS, "seconds");

    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      await sleep(POLL_INTERVAL_MS);

      const poll = await axios.get(
        `${host}/api/2.0/sql/statements/${statementId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const state = poll.data.status?.state;
      console.log(`DBX STATE (${i + 1}/${MAX_POLL_ATTEMPTS}):`, state);

      if (state === "SUCCEEDED") {
        return (
          poll.data?.result?.data_array ||
          poll.data?.result?.data?.array ||
          []
        );
      }

      if (state === "FAILED" || state === "CANCELED") {
        throw new Error(
          poll.data.status?.error?.message || `Databricks query ${state.toLowerCase()}`
        );
      }
    }

    throw new Error(
      `Databricks query timed out after ${MAX_POLL_ATTEMPTS}s. The SQL warehouse may be slow to start — check its status in the Databricks UI.`
    );
  } catch (err) {
    console.error(
      "Databricks query failed:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
}