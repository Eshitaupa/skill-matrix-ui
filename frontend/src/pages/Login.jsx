import React from "react";

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return await window.crypto.subtle.digest("SHA-256", data);
}

function randomString(len = 64) {
  const arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return base64url(arr);
}

const TENANT_ID = "bfbb9a2b-6d99-4e78-b3c7-95005d555c8b";
const CLIENT_ID = "f40b4118-24a7-4c0e-a5e9-1b3cad660d2e";
const REDIRECT_URI = "http://localhost:3000/auth/callback";

export default function Login() {
  const handleLogin = async () => {
    const codeVerifier = randomString();
    const challengeBuf = await sha256(codeVerifier);
    const codeChallenge = base64url(challengeBuf);

    sessionStorage.setItem("pkce_verifier", codeVerifier);

    const authUrl =
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent("openid profile email")}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    window.location.href = authUrl;
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Skill Matrix</h2>
        <p style={styles.subtitle}>Sign in with your organization account</p>
        <button onClick={handleLogin} style={styles.button}>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f2f5f9" },
  card: { background: "#fff", padding: "30px", borderRadius: "10px", width: "350px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)", textAlign: "center" },
  title: { marginBottom: "5px" },
  subtitle: { marginBottom: "20px", fontSize: "14px", color: "#666" },
  button: { width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
};