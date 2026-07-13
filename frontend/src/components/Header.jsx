
// import { useExport } from "../context/ExportContext";

// function Header({ onLogout }) {
//   const exportContext = useExport();
//   const exporters = exportContext?.exporters || {};

//   const handleLogout = () => {
//     if (onLogout) {
//       onLogout();
//       return;
//     }

//     sessionStorage.clear();
//     window.location.replace("/");
//   };

//   return (
//     <div className="header" style={styles.header}>
//       <span>Skill Matrix</span>

//       <div style={styles.right}>
//         {exporters.exportExcel && (
//           <button onClick={exporters.exportExcel}>Export Excel</button>
//         )}

//         {exporters.exportPdf && (
//           <button onClick={exporters.exportPdf}>Export PDF</button>
//         )}

//         <button onClick={handleLogout} style={styles.logout}>
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Header;

// const styles = {
//   header: {
//     display: "flex",
//     alignItems: "center",
//     flexWrap: "wrap",
//     gap: "10px",
//     padding: "10px 15px",
//     borderBottom: "1px solid #ddd",
//     background: "#fff",
//   },

//   right: {
//     marginLeft: "auto",
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     flexWrap: "wrap",
//   },

//   logout: {
//     padding: "6px 12px",
//     background: "#ef4444",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     whiteSpace: "nowrap",
//   },
// };

import { useNavigate } from "react-router-dom";
import { useExport } from "../context/ExportContext";

function Header({ onLogout }) {
  const navigate = useNavigate();
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
      <div style={styles.left}>
      <button
  style={styles.backButton}
  onClick={() => {
    window.location.href = "/home";
  }}
>
  ←
</button>
       
      </div>

      <div style={styles.right}>
        {exporters.exportExcel && (
          <button style={styles.actionBtn} onClick={exporters.exportExcel}>
            Export Excel
          </button>
        )}

        {exporters.exportPdf && (
          <button style={styles.actionBtn} onClick={exporters.exportPdf}>
            Export PDF
          </button>
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
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "12px 18px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },

backButton: {
  cursor: "pointer",
  color: "#4338ca",
  fontSize: "24px",
  fontWeight: "700",
  border: "none",
  background: "none",
},

  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  actionBtn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  logout: {
    padding: "8px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};
