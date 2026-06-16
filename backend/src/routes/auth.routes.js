import express from "express";

const router = express.Router();

router.post("/session", (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ message: "Missing token" });

  res.cookie("session_token", id_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60,
  });

  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.session_token;
  if (!token) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie("session_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ ok: true });
});

export default router;