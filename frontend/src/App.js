import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExportProvider } from "./context/ExportContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import SkillMatrix from "./pages/SkillMatrix";
import AssessmentReview from "./pages/AssessmentReview";
import Login from "./pages/Login";

function App() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (
    <ExportProvider>
      <BrowserRouter>

        <Routes>
          {/* LOGIN */}
          <Route path="/" element={<Login />} />

          {/* PROTECTED APP */}
          <Route
            path="/*"
            element={
              isLoggedIn ? (
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