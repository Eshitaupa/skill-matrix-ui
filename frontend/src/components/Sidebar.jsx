// import { sidebarItems } from "../config/sidebarConfig";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";

// function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
//       <div
//         className="sidebar-toggle"
//         onClick={() => setCollapsed(!collapsed)}
//       >
//       </div>

//       {!collapsed && (
//         <>
//           <div className="sidebar-title">SkillMatrix</div>

//           <ul className="sidebar-menu">
//             {sidebarItems
//               .filter(item => item.enabled)
//               .map(item => (
//                 <li
//                   key={item.id}
//                   className={location.pathname === item.route ? "active" : ""}
//                   onClick={() => navigate(item.route)}
//                 >
//                   {item.label}
//                 </li>
//               ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }

// export default Sidebar;
/**
 * Sidebar.jsx
 *
 * Reads the logged-in user from:
 *   1. sessionStorage (set by your AuthCallback after POST /api/auth/session)
 *   2. GET /api/auth/me (httpOnly cookie session — fallback)
 *
 * Props:
 *   onLogout {function} — called when sign-out button is clicked
 *
 * HOW TO FIX "Unknown User" WITHOUT changing this file:
 *   In your AuthCallback.jsx, after the POST /api/auth/session succeeds, add:
 *     sessionStorage.setItem("userEmail", session.email);
 *     sessionStorage.setItem("allowedDisciplines", JSON.stringify(session.allowedDisciplines));
 *   That's it — sidebar reads it instantly on next render.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { sidebarItems } from "../config/sidebarConfig";
import meridianLogo from "../assets/meridian-logo.png";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const [email,       setEmail]       = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [loading,     setLoading]     = useState(true);
const API_BASE =
  process.env.REACT_API_BASE ||
  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

useEffect(() => {
  fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include",
  })
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    })
    .then((data) => {
      if (data.authenticated && data.email) {
        setEmail(data.email);
        setDisciplines(data.allowedDisciplines ?? []);

        sessionStorage.setItem("userEmail", data.email);
        sessionStorage.setItem(
          "allowedDisciplines",
          JSON.stringify(data.allowedDisciplines ?? [])
        );
      }
    })
    .catch((err) =>
      console.warn("Sidebar /api/auth/me failed:", err)
    )
    .finally(() => setLoading(false));
}, []);

  // ── Display helpers ──────────────────────────────────────────────────────
  const getInitials = (e = "") => {
    const local = e.split("@")[0];
    const parts = local.match(/[a-zA-Z]+/g) || [];
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return local.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (e = "") => {
    const local = e.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  };

  const initials    = email ? getInitials(email)    : "?";
  const displayName = email ? getDisplayName(email) : "Not signed in";
  // const discipline  = disciplines?.[0] ?? "";
  const discipline = disciplines?.includes("All")
  ? "All Disciplines"
  : disciplines?.[0] ?? "";

  return (
    <>
      <style>{`
        .sidebar {
          display: flex; flex-direction: column;
          width: 270px; min-height: 100vh;
background: linear-gradient(
  180deg,
  #1b1b4b 0%,
  #262677 60%,
  #343381 100%
);          transition: width .22s ease;
          position: relative; flex-shrink: 0; overflow: hidden;
        }
        .sidebar.collapsed { width: 76px; }

//        .sb-toggle {
//   position: absolute;
//   top: 16px;
//   right: 12px;

//   width: 32px;
//   height: 32px;

//   border-radius: 10px;

//   background: rgba(255,255,255,.12);
//   border: 1px solid rgba(255,255,255,.14);

//   color: white;

//   backdrop-filter: blur(10px);

//   box-shadow: none;
// }

.sidebar.collapsed .sb-toggle {
  position: relative;
  margin: 12px auto 0;
  right: auto;
  top: auto;
  display: flex;
}

        .sb-toggle:hover { background: #ede9fe; }

        .sb-logo {
          display: flex; align-items: center; justify-content: center;
          padding: 24px; cursor: pointer;min-height:96px;
          border-bottom: 1px solid rgba(255,255,255,.09);
          margin-bottom: 6px; min-height: 82px; flex-shrink: 0;
        }
        .sb-logo img {
          width: 148px; height: auto; object-fit: contain;
          filter: brightness(0) invert(1);
          transition: opacity .2s;
        }
        .sb-logo img:hover { opacity: .82; }
      .sb-logo-icon {
  width: 42px;
  height: 42px;

  border-radius: 14px;

  background: rgba(255,255,255,.12);

  border: 1px solid rgba(255,255,255,.15);

  color: white;

  font-size: 14px;
  font-weight: 800;

  letter-spacing: 1px;

  display: flex;
  align-items: center;
  justify-content: center;

  backdrop-filter: blur(10px);
}
  .sidebar.collapsed .sb-dot {
  display: none;
}

        .sidebar.collapsed .sb-logo { padding: 26px 0 22px; }

        .sb-menu {
          list-style: none; padding: 0 8px; margin: 0;
          flex: 1; display: flex; flex-direction: column; gap: 3px;
          overflow-y: auto; overflow-x: hidden;
        }
      .sb-menu li {
  display: flex;
  align-items: center;

  gap: 12px;

  height: 48px;

  padding: 0 16px;

  border-radius: 14px;

  font-size: 14px;
  font-weight: 600;

  color: rgba(255,255,255,.75);

  transition: .2s;
}
        .sb-menu li:hover {
  background: rgba(255,255,255,.08);
  color: white;

  transform: translateX(4px);
}
.sb-menu li.active {
  background: rgba(255,255,255,.12);

  color: white;

  border-left: 4px solid #a5b4fc;

  font-weight: 700;
}       .sb-dot {
  width: 10px;
  height: 10px;

  background: #818cf8;

  box-shadow: 0 0 12px rgba(129,140,248,.7);
}
  .sidebar.collapsed .sb-menu {
  padding: 0 6px;
}
        .sb-menu li:hover .sb-dot,
        .sb-menu li.active .sb-dot { background: #a5b4fc; }
.sidebar.collapsed .sb-menu li {
  width: 48px;
  height: 48px;
  margin: 0 auto;
}
        .sidebar.collapsed .sb-menu li .sb-label { display: none; }

        /* ── User footer ── */
        .sb-user {
          border-top: 1px solid rgba(255,255,255,.10);
          padding: 14px 12px;
          display: flex; align-items: center; gap: 11px;
          flex-shrink: 0; overflow: hidden; min-height: 68px;
    background: rgba(255,255,255,.05);
backdrop-filter: blur(8px)
        }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#5b4fd4,#8b7cf8);
          border: 2px solid rgba(255,255,255,.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          letter-spacing: .5px; flex-shrink: 0; user-select: none;
        }
        .sb-avatar.loading {
          background: rgba(255,255,255,.1);
          animation: sbPulse 1.4s ease-in-out infinite;
        }
        @keyframes sbPulse { 0%,100%{opacity:.3} 50%{opacity:.8} }

        .sb-info { flex: 1; overflow: hidden; min-width: 0; }
        .sb-name {
          font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.35;
        }
        .sb-email {
          font-size: 10.5px; color: rgba(255,255,255,.42);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 2px;
        }
        .sb-discipline {
          font-size: 11px; font-weight: 600;
          color: rgba(165,180,252,.9);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 3px;
        }
        .sb-logout {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.32);
          width: 28px; height: 28px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
          transition: color .15s, background .15s;
        }
        .sb-logout:hover { color: #f87171; background: rgba(248,113,113,.14); }

        .sidebar.collapsed .sb-user  { justify-content: center; padding: 13px 0; }
        .sidebar.collapsed .sb-info,
        .sidebar.collapsed .sb-logout { display: none; }
      `}</style>

      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        <button className="sb-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? "›" : "‹"}
        </button>

        <div className="sb-logo" onClick={() => navigate("/home")}>
          {collapsed
            ? <div className="sb-logo-icon">PM</div>
            : <img src={meridianLogo} alt="Project Meridian" />}
        </div>

        <ul className="sb-menu">
          {sidebarItems.filter(i => i.enabled).map(item => (
            <li
              key={item.id}
              className={location.pathname === item.route ? "active" : ""}
              onClick={() => navigate(item.route)}
              title={collapsed ? item.label : ""}
            >
              <span className="sb-dot" />
              <span className="sb-label">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sb-user" title={collapsed ? (email ?? "") : ""}>
          <div className={`sb-avatar ${loading ? "loading" : ""}`}>
            {!loading && initials}
          </div>
          <div className="sb-info">
            <div className="sb-name">{loading ? "Loading…" : displayName}</div>
            {!loading && email     && <div className="sb-email">{email}</div>}
            {!loading && discipline && <div className="sb-discipline">{discipline}</div>}
          </div>
          {/* {onLogout && (
            <button className="sb-logout" title="Sign out"
              onClick={e => { e.stopPropagation(); onLogout(); }}>
              ⏻
            </button>
          )} */}
          <button
  className="sb-logout"
  title="Sign out"
  onClick={(e) => {
    e.stopPropagation();

    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.clear();
      window.location.replace("/");
    }
  }}
>
  ⏻
</button>
        </div>

      </div>
    </>
  );
}

export default Sidebar;


