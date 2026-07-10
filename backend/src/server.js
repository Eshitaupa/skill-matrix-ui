
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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://skill-matrix-fhadc3d4c3g8dhcg.northcentralus-01.azurewebsites.net",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/skill-matrix", skillMatrixRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Project Meridian API Running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});