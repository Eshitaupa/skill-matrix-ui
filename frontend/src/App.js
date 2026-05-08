// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ExportProvider } from "./context/ExportContext";

// import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";

// import SkillMatrix from "./pages/SkillMatrix";
// import AssessmentReview from "./pages/AssessmentReview";

// function App() {
//   return (
//     <ExportProvider>
//       <BrowserRouter>
//         <div className="app-layout">
//           <Sidebar />

//           <div className="main-content">
//             <Header />

//             <Routes>
//               <Route path="/" element={<Navigate to="/matrix" />} />
//               <Route path="/matrix" element={<SkillMatrix />} />
//               <Route path="/assessment" element={<AssessmentReview />} />
//             </Routes>
//           </div>
//         </div>
//       </BrowserRouter>
//     </ExportProvider>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExportProvider } from "./context/ExportContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import SkillMatrix from "./pages/SkillMatrix";
import AssessmentReview from "./pages/AssessmentReview";

function App() {
  return (
    <ExportProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />

          <div className="main-content">
            <Header />

            <Routes>
              <Route path="/" element={<Navigate to="/matrix" />} />
              <Route path="/matrix" element={<SkillMatrix />} />
              <Route path="/assessment" element={<AssessmentReview />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ExportProvider>
  );
}

export default App;