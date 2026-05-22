

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

function Header() {
  const exportContext = useExport();

  // ✅ USER DATA
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ✅ SAFETY GUARD (UNCHANGED LOGIC)
  if (!exportContext || !exportContext.exporters) {
    return (
      <div className="header" style={styles.header}>
        <span>Skill Matrix</span>

        <div style={styles.right}>
          {email && <span style={styles.email}>{email}</span>}
          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  const { exporters } = exportContext;

  return (
    <div className="header" style={styles.header}>
      {/* ✅ LEFT SIDE */}
      <span>Skill Matrix</span>

      {/* ✅ RIGHT SIDE */}
      <div style={styles.right}>
        
        {/* ✅ EXISTING EXPORT BUTTONS */}
        {exporters.exportExcel && (
          <button onClick={exporters.exportExcel}>Export Excel</button>
        )}

        {exporters.exportPdf && (
          <button onClick={exporters.exportPdf}>Export PDF</button>
        )}

        {/* ✅ USER EMAIL */}
        {email && <span style={styles.email}>{email}</span>}

        {/* ✅ LOGOUT */}
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
    padding: "10px 15px",
    borderBottom: "1px solid #ddd",
    background: "#fff",
  },
  right: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  email: {
    fontSize: "13px",
    color: "#444",
  },
  logout: {
    padding: "5px 10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};