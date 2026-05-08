// import { useExport } from "../context/ExportContext";

// function Header() {
//   const { exporters } = useExport();

//   return (
//     <div className="topbar">
//       <div>
//         <div className="header-section">CORE – MATRIX VIEW</div>
//         <div className="header-title">Level Wise Skill Proficiency Matrix</div>
//       </div>

//       <div className="header-actions">
//         <button
//           className="btn"
//           onClick={() => exporters.exportExcel && exporters.exportExcel()}
//           disabled={!exporters.exportExcel}
//         >
//           Export Excel
//         </button>

//         <button
//           className="btn btn-primary"
//           onClick={() => exporters.exportPdf && exporters.exportPdf()}
//           disabled={!exporters.exportPdf}
//         >
//           Export PDF
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Header;

import { useExport } from "../context/ExportContext";

function Header() {
  const exportContext = useExport();

  // ✅ SAFETY GUARD
  if (!exportContext || !exportContext.exporters) {
    return (
      <div className="header">
        <span>Skill Matrix</span>
      </div>
    );
  }

  const { exporters } = exportContext;

  return (
    <div className="header">
      <span>Skill Matrix</span>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {exporters.exportExcel && (
          <button onClick={exporters.exportExcel}>Export Excel</button>
        )}
        {exporters.exportPdf && (
          <button onClick={exporters.exportPdf}>Export PDF</button>
        )}
      </div>
    </div>
  );
}

export default Header;