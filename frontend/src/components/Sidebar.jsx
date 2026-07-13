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
  process.env.REACT_APP_API_BASE ||
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

const getDisplayName = (email = "") => {
  const local = email.split("@")[0];

  return local
    .split(/[._-]/)
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
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
          width: 230px; min-height: 100vh;
          background: var(--color-primary);
          transition: width .22s ease;
          position: relative; flex-shrink: 0; overflow: hidden;
        }
        .sidebar.collapsed { width: 58px; }

        .sb-toggle {
          position: absolute; top: 16px; right: -13px;
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--color-base-100);
color: var(--color-primary);
          font-size: 14px; font-weight: 800; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,.22); z-index: 20;
          transition: background .15s; user-select: none;
        }
        .sb-toggle:hover { background: color-mix(in srgb, var(--color-primary) 10%, white);}

        .sb-logo {
          display: flex; align-items: center; justify-content: center;
          padding: 26px 16px 22px; cursor: pointer;
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
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(255,255,255,.14);
          font-size: 16px; font-weight: 800; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .sidebar.collapsed .sb-logo { padding: 26px 0 22px; }

        .sb-menu {
          list-style: none; padding: 0 8px; margin: 0;
          flex: 1; display: flex; flex-direction: column; gap: 3px;
          overflow-y: auto; overflow-x: hidden;
        }
        .sb-menu li {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 13px; border-radius: 11px;
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,.68); cursor: pointer;
          transition: background .15s, color .15s;
          white-space: nowrap; overflow: hidden;
        }
        .sb-menu li:hover  { background: rgba(255,255,255,.11); color: #fff; }
        .sb-menu li.active { background: rgba(255,255,255,.17); color: #fff; font-weight: 600; }
        .sb-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,.35); flex-shrink: 0;
          transition: background .15s;
        }
        .sb-menu li:hover .sb-dot,
        .sb-menu li.active .sb-dot { background: #a5b4fc; }
        .sidebar.collapsed .sb-menu li { justify-content: center; padding: 10px 0; }
        .sidebar.collapsed .sb-menu li .sb-label { display: none; }

        /* ── User footer ── */
        .sb-user {
          border-top: 1px solid rgba(255,255,255,.10);
          padding: 14px 12px;
          display: flex; align-items: center; gap: 11px;
          flex-shrink: 0; overflow: hidden; min-height: 68px;
          background: rgba(0,0,0,.15);
        }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--color-primary);
color: var(--color-primary-content);
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
          color: var(--color-primary-content);
opacity:.9;
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
            ? <div className="sb-logo-icon">M</div>
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