import React from "react";
import logo from "../assets/meridian-logo.png"; // ← put your logo image here

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

const TENANT_ID = process.env.REACT_APP_TENANT_ID || "bfbb9a2b-6d99-4e78-b3c7-95005d555c8b";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "f40b4118-24a7-4c0e-a5e9-1b3cad660d2e";
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

export default function Login() {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const codeVerifier = randomString();
      const challengeBuf = await sha256(codeVerifier);
      const codeChallenge = base64url(challengeBuf);

      localStorage.setItem("pkce_verifier", codeVerifier);

      const authUrl =
        `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
        `?client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent("openid profile email")}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256` +
        `&prompt=select_account`;

      window.location.href = authUrl;
    } catch (err) {
      console.error("Failed to initiate login:", err);
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Real Project Meridian logo */}
        <div style={styles.logoWrapper}>
          <img src={logo} alt="Project Meridian" style={styles.logo} />
        </div>

        <div style={styles.divider} />

        <p style={styles.subtitle}>
          Sign in with your organization account to continue.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
          }}
        >
          {/* Microsoft colored squares */}
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
          )}
          {loading ? "Redirecting to Microsoft…" : "Sign in with Microsoft"}
        </button>

        <p style={styles.note}>
          Access is restricted to authorized Burns &amp; McDonnell team members.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(160deg, #e8f0fe 0%, #dde8f8 50%, #cfdaf4 100%)",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "44px 40px 36px",
    borderRadius: "16px",
    width: "380px",
    boxShadow:
      "0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(37,99,235,0.07)",
    textAlign: "center",
  },
  logoWrapper: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    height: "64px",
    objectFit: "contain",
  },
  divider: {
    height: "1px",
    background: "#f0f2f5",
    margin: "0 0 24px",
  },
  subtitle: {
    margin: "0 0 28px",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    background: "#1a4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    letterSpacing: "0.01em",
    transition: "background 0.15s, transform 0.1s",
  },
  buttonLoading: {
    background: "#93aeed",
    cursor: "not-allowed",
  },
  note: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#9ca3af",
    lineHeight: "1.5",
  },
};