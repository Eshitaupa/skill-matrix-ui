import { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExportProvider } from "./context/ExportContext";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AssessmentReview from "./pages/AssessmentReview";
import SkillMatrix from "./pages/SkillMatrix";
import Login from "./pages/Login";

const API_BASE =
 process.env.REACT_APP_API_BASE || "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";
const TENANT_ID =
  process.env.REACT_APP_TENANT_ID || "bfbb9a2b-6d99-4e78-b3c7-95005d555c8b";
const CLIENT_ID =
  process.env.REACT_APP_CLIENT_ID || "f40b4118-24a7-4c0e-a5e9-1b3cad660d2e";
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

function AuthCallbackHandler() {
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setErrorMsg(`Microsoft sign-in error: ${errorDesc || error}`);
      setStatus("error");
      return;
    }

    if (!code) {
      setErrorMsg("No authorization code was returned. Please try signing in again.");
      setStatus("error");
      return;
    }

const codeVerifier = localStorage.getItem("pkce_verifier");

if (!codeVerifier) {
  setErrorMsg("Session data is missing. Please sign in again.");
  setStatus("error");
  return;
}
    async function completeLogin() {
      try {
        const tokenRes = await fetch(
          `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              grant_type: "authorization_code",
              code,
              redirect_uri: REDIRECT_URI,
              scope: "openid profile email",
              code_verifier: codeVerifier,
            }),
          }
        );

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          setErrorMsg(
            `Sign-in failed: ${
              tokenData.error_description || tokenData.error || "Token exchange failed"
            }`
          );
          setStatus("error");
          return;
        }

        localStorage.removeItem("pkce_verifier");

        const sessionRes = await fetch(`${API_BASE}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id_token: tokenData.id_token,
          }),
        });

        const sessionData = await sessionRes.json().catch(() => ({}));

        if (!sessionRes.ok) {
          setErrorMsg(sessionData?.message || "Failed to create session");
          setStatus("error");
          return;
        }

        sessionStorage.setItem("userEmail", sessionData.email || "");
        sessionStorage.setItem(
          "allowedDisciplines",
          JSON.stringify(sessionData.allowedDisciplines || [])
        );

        window.location.replace("/home");
      } catch (err) {
        console.error("Auth callback error:", err);
        setErrorMsg(`Cannot complete sign-in. Make sure backend is running at ${API_BASE}.`);
        setStatus("error");
      }
    }

    completeLogin();
  }, []);

  if (status === "loading") {
    return (
      <div style={callbackStyles.page}>
        <div style={callbackStyles.card}>
          <div style={callbackStyles.spinner} />
          <p style={callbackStyles.message}>Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={callbackStyles.page}>
      <div style={callbackStyles.card}>
        <div style={callbackStyles.errorIcon}>!</div>
        <p style={callbackStyles.errorTitle}>Sign-in failed</p>
        <p style={callbackStyles.errorMsg}>{errorMsg}</p>
        <button style={callbackStyles.retryBtn} onClick={() => window.location.replace("/")}>
          Back to login
        </button>
      </div>
    </div>
  );
}

function AppLayout({ children, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Header onLogout={onLogout} />
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ authed, onLogout, children }) {
  if (!authed) return <Navigate to="/" replace />;
  return <AppLayout onLogout={onLogout}>{children}</AppLayout>;
}

function App() {
  const [authed, setAuthed] = useState(null);
  const [allowedDisciplines, setAllowedDisciplines] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [checkError, setCheckError] = useState(false);

const checkSession = useCallback(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

if (res.status === 401 || res.status === 403) {
  const errorData = await res.json().catch(() => ({}));

  console.error("SESSION ACCESS DENIED:", errorData);

  setAuthed(false);
  setAllowedDisciplines([]);
  setUserEmail("");
  setCheckError(false);

  sessionStorage.clear();
  return;
}

    if (!res.ok) {
      throw new Error(`Session check failed: HTTP ${res.status}`);
    }

    const data = await res.json();

    setAuthed(Boolean(data.authenticated));
    setAllowedDisciplines(data.allowedDisciplines || []);
    setUserEmail(data.email || "");
    setCheckError(false);

    sessionStorage.setItem("userEmail", data.email || "");
    sessionStorage.setItem(
      "allowedDisciplines",
      JSON.stringify(data.allowedDisciplines || [])
    );
  } catch (err) {
    console.error("Session check failed:", err);

    setAuthed(false);
    setAllowedDisciplines([]);
    setUserEmail("");
    setCheckError(true);
  }
}, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    }

    sessionStorage.clear();
    setAuthed(false);
    setAllowedDisciplines([]);
    setUserEmail("");

    window.location.replace("/");
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (authed === null) {
    return (
      <div style={loadingStyle}>
        Checking session…
      </div>
    );
  }

  return (
    <ExportProvider>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
{checkError && (
  <div style={bannerStyle}>
    ⚠ Cannot reach the server at {API_BASE}. Check that the backend is running.
  </div>
)}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={authed ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/auth/callback" element={<AuthCallbackHandler />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute authed={authed} onLogout={handleLogout}>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matrix"
            element={
              <ProtectedRoute authed={authed} onLogout={handleLogout}>
                <SkillMatrix allowedDisciplines={allowedDisciplines} userEmail={userEmail} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessment"
            element={
              <ProtectedRoute authed={authed} onLogout={handleLogout}>
                <AssessmentReview />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={authed ? "/home" : "/"} replace />} />
        </Routes>
      </BrowserRouter>
    </ExportProvider>
  );
}

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#6b7280",
};

const bannerStyle = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "10px 20px",
  fontSize: "13px",
  textAlign: "center",
  borderBottom: "1px solid #fde68a",
  fontFamily: "'Segoe UI', sans-serif",
};

const callbackStyles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4ff",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "48px 40px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 0.8s linear infinite",
  },
  message: {
    color: "#6b7280",
    fontSize: "15px",
    margin: 0,
  },
  errorIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: "20px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  errorTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 8px",
  },
  errorMsg: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 24px",
    lineHeight: "1.5",
  },
  retryBtn: {
    padding: "10px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default App;