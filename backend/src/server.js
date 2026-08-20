
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";

// import skillMatrixRoutes from "./routes/skillMatrix.routes.js";
// import authRoutes from "./routes/auth.routes.js";

// dotenv.config();

// const app = express();

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173",

//   "https://skill-matrix-fhadc3d4c3g8dhcg.northcentralus-01.azurewebsites.net",

//   "https://skill-matrix-uat-g5dba9ate9eyhhhc.northcentralus-01.azurewebsites.net",
// ];
// app.use(
//   cors({
//     origin(origin, callback) {
//       console.log("REQUEST ORIGIN:", JSON.stringify(origin));
//       console.log("ALLOWED ORIGINS:", allowedOrigins);

//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       console.error(
//         "CORS BLOCKED:",
//         JSON.stringify(origin)
//       );

//       return callback(new Error(`CORS blocked origin: ${origin}`));
//     },

//     credentials: true,

//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

//     allowedHeaders: [
//       "Content-Type",
//       "Accept",
//       "Authorization",
//     ],
//   })
// );

// app.use(cookieParser());
// app.use(express.json({ limit: "10mb" }));

// app.use("/api/auth", authRoutes);
// app.use("/api/skill-matrix", skillMatrixRoutes);

// app.get("/", (req, res) => {
//   res.json({
//     ok: true,
//     message: "Project Meridian API Running",
//   });
// });

// app.use((req, res) => {
//   res.status(404).json({
//     ok: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// app.use((err, req, res, next) => {
//   console.error("SERVER ERROR:", err);

//   res.status(500).json({
//     ok: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`API running on port ${PORT}`);
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import skillMatrixRoutes from "./routes/skillMatrix.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

const configuredFrontendOrigins = String(process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://skill-matrix-fhadc3d4c3g8dhcg.northcentralus-01.azurewebsites.net",
  "https://skill-matrix-uat-g5dba9ate9eyhhhc.northcentralus-01.azurewebsites.net",
  ...configuredFrontendOrigins,
].filter((origin, index, array) => origin && array.indexOf(origin) === index);

console.log("=================================================");
console.log("Project Meridian API");
console.log("BUILD MARKER: cors-fix-v2");
console.log("=================================================");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", PORT);
console.log("CORS ALLOWED ORIGINS:");
allowedOrigins.forEach((origin) => console.log("  -", origin));
console.log("=================================================");

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/+$/, "") === normalizedOrigin
      );

      if (isAllowed) {
        return callback(null, true);
      }

      console.error("CORS BLOCKED:", origin);
      console.error("CORS ALLOWED ORIGINS:", allowedOrigins);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Project Meridian API Running",
    environment: process.env.NODE_ENV || "unknown",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({ ok: true, status: "healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/skill-matrix", skillMatrixRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  return res.status(500).json({
    ok: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});

export default app;