// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import authRoutes from "./routes/auth.routes.js";
// import skillMatrixRoutes from "./routes/skillMatrix.routes.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "10mb" }));

// app.use("/auth", authRoutes);
// app.use("/api/skill-matrix", skillMatrixRoutes);

// app.get("/", (req, res) => {
//   res.json({ status: "Skill Matrix API running ✅" });
// });

// app.use((err, req, res, next) => {
//   console.error("GLOBAL ERROR:", err);
//   res.status(500).json({ message: "Internal server error" });
// });

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => {
//   console.log(`API running on http://localhost:${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import skillMatrixRoutes from "./routes/skillMatrix.routes.js";
import authRoutes from "./routes/auth.routes.js";   

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);                        
app.use("/api/skill-matrix", skillMatrixRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Skill Matrix API running ✅" });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});