import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExportProvider } from "./context/ExportContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import SkillMatrix from "./pages/SkillMatrix";
import AssessmentReview from "./pages/AssessmentReview";
import Login from "./pages/Login";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";
const TENANT_ID = "bfbb9a2b-6d99-4e78-b3c7-95005d555c8b";
const CLIENT_ID = "f40b4118-24a7-4c0e-a5e9-1b3cad660d2e";
const REDIRECT_URI = "http://localhost:3000/auth/callback";

// Handles the redirect back from Microsoft — no visible UI of its own
function AuthCallbackHandler() {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setErrorMsg(`${error}: ${errorDesc}`);
      return;
    }
    if (!code) {
      setErrorMsg("No code received");
      return;
    }

    const codeVerifier = sessionStorage.getItem("pkce_verifier");
    if (!codeVerifier) {
      setErrorMsg("Missing PKCE verifier — please try logging in again");
      return;
    }

    (async () => {
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
          setErrorMsg(`${tokenData.error}: ${tokenData.error_description}`);
          return;
        }

        sessionStorage.removeItem("pkce_verifier");

        const sessionRes = await fetch(`${API_BASE}/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id_token: tokenData.id_token }),
        });

        if (!sessionRes.ok) {
          setErrorMsg("Failed to create session");
          return;
        }

        // Full reload so App's auth check re-runs with the new cookie present
        window.location.href = "/matrix";
      } catch (err) {
        console.error(err);
        setErrorMsg("Login failed: " + err.message);
      }
    })();
  }, []);

  if (errorMsg) {
    return <div style={{ padding: 40 }}>Login failed: {errorMsg}</div>;
  }
  return <div style={{ padding: 40 }}>Signing you in...</div>;
}

function App() {
  const [authed, setAuthed] = useState(null); // null = checking, true/false after check

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <div className="app-loading">Checking session...</div>;
  }

  return (
    <ExportProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={authed ? <Navigate to="/matrix" /> : <Login />}
          />

          <Route path="/auth/callback" element={<AuthCallbackHandler />} />

          <Route
            path="/*"
            element={
              authed ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Header />
                    <Routes>
                      <Route path="/matrix" element={<SkillMatrix />} />
                      <Route path="/assessment" element={<AssessmentReview />} />
                      <Route path="*" element={<Navigate to="/matrix" />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ExportProvider>
  );
}

export default App;