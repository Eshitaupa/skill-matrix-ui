import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import skillMatrixRoutes from "./routes/skillMatrix.routes.js";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* =========================
   ROUTES
========================= */
app.use("/api/skill-matrix", skillMatrixRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ status: "Skill Matrix API running ✅" });
});

/* =========================
   ERROR HANDLER (IMPORTANT)
========================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(` API running on http://localhost:${PORT}`);
});