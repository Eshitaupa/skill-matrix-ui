
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";

// import skillMatrixRoutes from "./routes/skillMatrix.routes.js";
// import authRoutes from "./routes/auth.routes.js";   

// dotenv.config();

// const app = express();

// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:3002"],  
//   credentials: true,
// }));
// app.use(cookieParser());
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
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://skill-matrix-fhadc3d4c3g8dhcg.northcentralus-01.azurewebsites.net"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/skill-matrix", skillMatrixRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Project Meridian API Running"
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    ok: false,
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});