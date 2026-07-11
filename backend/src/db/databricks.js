// import axios from "axios";

// const sleep = (ms) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// export async function queryDatabricks(sql) {
//   try {
//     const response = await axios.post(
//       `${process.env.DBX_HOST}/api/2.0/sql/statements`,
//       {
//         statement: sql,
//         warehouse_id: process.env.DBX_WAREHOUSE_ID,
//         wait_timeout: "50s",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.DBX_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // SUCCESS IMMEDIATELY
//     if (
//       response.data.status?.state === "SUCCEEDED"
//     ) {
//       return (
//         response?.data?.result?.data_array ||
//         response?.data?.result?.data?.array ||
//         []
//       );
//     }

//     const statementId = response.data.statement_id;

//     if (!statementId) {
//       throw new Error("No statement id returned");
//     }

//     let finalData = null;

//     // POLLING
//     for (let i = 0; i < 30; i++) {
//       await sleep(1000);

//       const poll = await axios.get(
//         `${process.env.DBX_HOST}/api/2.0/sql/statements/${statementId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.DBX_TOKEN}`,
//           },
//         }
//       );

//       const state = poll.data.status?.state;

//       console.log("DBX STATE:", state);

//       if (state === "SUCCEEDED") {
//         finalData = poll.data;

//         return (
//           finalData?.result?.data_array ||
//           finalData?.result?.data?.array ||
//           []
//         );
//       }

//       if (state === "FAILED") {
//         console.error(poll.data);

//         throw new Error(
//           poll.data.status?.error?.message ||
//             "Databricks query failed"
//         );
//       }
//     }

//     throw new Error("Databricks timeout");
//   } catch (err) {
//     console.error(
//       "Databricks query failed:",
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
  const clientId = process.env.D_CLIENT_ID;
  const clientSecret = process.env.DBX_CLIENT_SECRET;

  if (!host) throw new Error("DBX_HOST is missing");
  if (!clientId) throw new Error("DBX_CLIENT_ID is missing");
  if (!clientSecret) throw new Error("DBX_CLIENT_SECRET is missing");

  // Reuse cached token if it still has >60s of life left
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

    for (let i = 0; i < 30; i++) {
      await sleep(1000);

      const poll = await axios.get(
        `${host}/api/2.0/sql/statements/${statementId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const state = poll.data.status?.state;
      console.log("DBX STATE:", state);

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

    throw new Error("Databricks query timed out");
  } catch (err) {
    console.error(
      "Databricks query failed:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
}