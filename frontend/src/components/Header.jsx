

// import { useExport } from "../context/ExportContext";

// function Header() {
//   const exportContext = useExport();

//   // ✅ SAFETY GUARD
//   if (!exportContext || !exportContext.exporters) {
//     return (
//       <div className="header">
//         <span>Skill Matrix</span>
//       </div>
//     );
//   }

//   const { exporters } = exportContext;

//   return (
//     <div className="header">
//       <span>Skill Matrix</span>

//       <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
//         {exporters.exportExcel && (
//           <button onClick={exporters.exportExcel}>Export Excel</button>
//         )}
//         {exporters.exportPdf && (
//           <button onClick={exporters.exportPdf}>Export PDF</button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Header;
import { useExport } from "../context/ExportContext";

function Header({ onLogout }) {
  const exportContext = useExport();
  const exporters = exportContext?.exporters || {};

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <div className="header" style={styles.header}>
      <span>Skill Matrix</span>

      <div style={styles.right}>
        {exporters.exportExcel && (
          <button onClick={exporters.exportExcel}>Export Excel</button>
        )}

        {exporters.exportPdf && (
          <button onClick={exporters.exportPdf}>Export PDF</button>
        )}

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px 15px",
    borderBottom: "1px solid #ddd",
    background: "#fff",
  },

  right: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  logout: {
    padding: "6px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};