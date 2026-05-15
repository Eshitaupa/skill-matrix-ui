import axios from "axios";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function queryDatabricks(sql) {
  try {
    const response = await axios.post(
      `${process.env.DBX_HOST}/api/2.0/sql/statements`,
      {
        statement: sql,
        warehouse_id: process.env.DBX_WAREHOUSE_ID,
        wait_timeout: "50s",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DBX_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // SUCCESS IMMEDIATELY
    if (
      response.data.status?.state === "SUCCEEDED"
    ) {
      return (
        response?.data?.result?.data_array ||
        response?.data?.result?.data?.array ||
        []
      );
    }

    const statementId = response.data.statement_id;

    if (!statementId) {
      throw new Error("No statement id returned");
    }

    let finalData = null;

    // POLLING
    for (let i = 0; i < 30; i++) {
      await sleep(1000);

      const poll = await axios.get(
        `${process.env.DBX_HOST}/api/2.0/sql/statements/${statementId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.DBX_TOKEN}`,
          },
        }
      );

      const state = poll.data.status?.state;

      console.log("DBX STATE:", state);

      if (state === "SUCCEEDED") {
        finalData = poll.data;

        return (
          finalData?.result?.data_array ||
          finalData?.result?.data?.array ||
          []
        );
      }

      if (state === "FAILED") {
        console.error(poll.data);

        throw new Error(
          poll.data.status?.error?.message ||
            "Databricks query failed"
        );
      }
    }

    throw new Error("Databricks timeout");
  } catch (err) {
    console.error(
      "Databricks query failed:",
      err.response?.data || err.message
    );

    throw err;
  }
}

