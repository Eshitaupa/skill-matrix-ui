

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