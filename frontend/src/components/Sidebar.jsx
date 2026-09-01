// // import { sidebarItems } from "../config/sidebarConfig";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { useState } from "react";

// // function Sidebar() {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [collapsed, setCollapsed] = useState(false);

// //   return (
// //     <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
// //       <div
// //         className="sidebar-toggle"
// //         onClick={() => setCollapsed(!collapsed)}
// //       >
// //       </div>

// //       {!collapsed && (
// //         <>
// //           <div className="sidebar-title">SkillMatrix</div>

// //           <ul className="sidebar-menu">
// //             {sidebarItems
// //               .filter(item => item.enabled)
// //               .map(item => (
// //                 <li
// //                   key={item.id}
// //                   className={location.pathname === item.route ? "active" : ""}
// //                   onClick={() => navigate(item.route)}
// //                 >
// //                   {item.label}
// //                 </li>
// //               ))}
// //           </ul>
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // export default Sidebar;
// /**
//  * Sidebar.jsx
//  *
//  * Reads the logged-in user from:
//  *   1. sessionStorage (set by your AuthCallback after POST /api/auth/session)
//  *   2. GET /api/auth/me (httpOnly cookie session — fallback)
//  *
//  * Props:
//  *   onLogout {function} — called when sign-out button is clicked
//  *
//  * HOW TO FIX "Unknown User" WITHOUT changing this file:
//  *   In your AuthCallback.jsx, after the POST /api/auth/session succeeds, add:
//  *     sessionStorage.setItem("userEmail", session.email);
//  *     sessionStorage.setItem("allowedDisciplines", JSON.stringify(session.allowedDisciplines));
//  *   That's it — sidebar reads it instantly on next render.
//  */
// import { useLocation, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { sidebarItems } from "../config/sidebarConfig";
// import meridianLogo from "../assets/meridian-logo.png";

// function Sidebar({ onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);

//   const [email,       setEmail]       = useState(null);
//   const [disciplines, setDisciplines] = useState([]);
//   const [loading,     setLoading]     = useState(true);
// const API_BASE =
//   process.env.REACT_API_BASE ||
//   "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

// useEffect(() => {
//   fetch(`${API_BASE}/api/auth/me`, {
//     credentials: "include",
//   })
//     .then((r) => {
//       if (!r.ok) throw new Error(`${r.status}`);
//       return r.json();
//     })
//     .then((data) => {
//       if (data.authenticated && data.email) {
//         setEmail(data.email);
//         setDisciplines(data.allowedDisciplines ?? []);

//         sessionStorage.setItem("userEmail", data.email);
//         sessionStorage.setItem(
//           "allowedDisciplines",
//           JSON.stringify(data.allowedDisciplines ?? [])
//         );
//       }
//     })
//     .catch((err) =>
//       console.warn("Sidebar /api/auth/me failed:", err)
//     )
//     .finally(() => setLoading(false));
// }, []);

//   // ── Display helpers ──────────────────────────────────────────────────────
//   const getInitials = (e = "") => {
//     const local = e.split("@")[0];
//     const parts = local.match(/[a-zA-Z]+/g) || [];
//     if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
//     return local.slice(0, 2).toUpperCase();
//   };

//   const getDisplayName = (e = "") => {
//     const local = e.split("@")[0];
//     return local.charAt(0).toUpperCase() + local.slice(1);
//   };

//   const initials    = email ? getInitials(email)    : "?";
//   const displayName = email ? getDisplayName(email) : "Not signed in";
//   // const discipline  = disciplines?.[0] ?? "";
//   const discipline = disciplines?.includes("All")
//   ? "All Disciplines"
//   : disciplines?.[0] ?? "";

//   return (
//     <>
//       <style>{`
//         .sidebar {
//           display: flex; flex-direction: column;
//           width: 270px; min-height: 100vh;
// background: linear-gradient(
//   180deg,
//   #1b1b4b 0%,
//   #262677 60%,
//   #343381 100%
// );          transition: width .22s ease;
//           position: relative; flex-shrink: 0; overflow: hidden;
//         }
//         .sidebar.collapsed { width: 76px; }
// .sb-toggle {
//   position: absolute;
//   top: 18px;
//   right: 18px;

//   width: 32px;
//   height: 32px;

//   border: none;
//   border-radius: 999px;

//   background: rgba(255,255,255,.10);
//   color: #ffffff;

//   display: flex;
//   align-items: center;
//   justify-content: center;

//   cursor: pointer;

//   transition: all .2s ease;
// }

// .sb-toggle:hover {
//   background: rgba(255,255,255,.18);
// }

// .sidebar.collapsed .sb-toggle {
//   position: relative;
//   top: auto;
//   right: auto;
//   margin: 12px auto 0;
// }

// .sidebar.collapsed .sb-toggle {
//   position: relative;
//   top: auto;
// }





//         .sb-logo {
//           display: flex; align-items: center; justify-content: center;
//           padding: 24px; cursor: pointer;min-height:96px;
//           border-bottom: 1px solid rgba(255,255,255,.09);
//           margin-bottom: 6px; min-height: 82px; flex-shrink: 0;
//         }
//         .sb-logo img {
//           width: 148px; height: auto; object-fit: contain;
//           filter: brightness(0) invert(1);
//           transition: opacity .2s;
//         }
//         .sb-logo img:hover { opacity: .82; }
//         .sb-icon {
//   width: 28px;
//   height: 28px;

//   display: flex;
//   align-items: center;
//   justify-content: center;

//   border-radius: 8px;

//   background: rgba(255,255,255,.12);

//   color: white;

//   font-size: 10px;
//   font-weight: 700;

//   flex-shrink: 0;
// }
// .sb-logo-icon {
//   width: 44px;
//   height: 44px;

//   display: flex;
//   align-items: center;
//   justify-content: center;

//   border-radius: 12px;

//   background: rgba(255,255,255,.10);
//   border: 1px solid rgba(255,255,255,.15);

//   color: white;

//   font-size: 13px;
//   font-weight: 800;

//   letter-spacing: 1px;

//   margin: 0 auto;
// }
//   .sidebar.collapsed .sb-dot {
//   display: flex;
// }

//         .sidebar.collapsed .sb-logo { padding: 26px 0 22px; }

//         .sb-menu {
//           list-style: none; padding: 0 8px; margin: 0;
//           flex: 1; display: flex; flex-direction: column; gap: 3px;
//           overflow-y: auto; overflow-x: hidden;
//         }
//       .sb-menu li {
//   display: flex;
//   align-items: center;

//   gap: 12px;

//   height: 48px;

//   padding: 0 16px;

//   border-radius: 14px;

//   font-size: 14px;
//   font-weight: 600;

//   color: rgba(255,255,255,.75);

//   transition: .2s;
// }
//         .sb-menu li:hover {
//   background: rgba(255,255,255,.08);
//   color: white;

//   transform: translateX(4px);
// }
// .sb-menu li.active {
//   background: rgba(255,255,255,.12);

//   color: white;

//   border-left: 4px solid #a5b4fc;

//   font-weight: 700;
// }       .sb-dot {
//   width: 10px;
//   height: 10px;

//   background: #818cf8;

//   box-shadow: 0 0 12px rgba(129,140,248,.7);
// }
//   .sidebar.collapsed .sb-menu {
//   padding: 0 6px;
// }
//         .sb-menu li:hover .sb-dot,
//         .sb-menu li.active .sb-dot { background: #a5b4fc; }
// .sidebar.collapsed .sb-menu li {
//   width: 48px;
//   height: 48px;
//   margin: 0 auto;
// }
//         .sidebar.collapsed .sb-menu li .sb-label { display: none; }

//         /* ── User footer ── */
//         .sb-user {
//           border-top: 1px solid rgba(255,255,255,.10);
//           padding: 14px 12px;
//           display: flex; align-items: center; gap: 11px;
//           flex-shrink: 0; overflow: hidden; min-height: 68px;
//     background: rgba(255,255,255,.05);
// backdrop-filter: blur(8px)
//         }
//         .sb-avatar {
//           width: 36px; height: 36px; border-radius: 50%;
//           background: linear-gradient(135deg,#5b4fd4,#8b7cf8);
//           border: 2px solid rgba(255,255,255,.25);
//           display: flex; align-items: center; justify-content: center;
//           font-size: 13px; font-weight: 700; color: #fff;
//           letter-spacing: .5px; flex-shrink: 0; user-select: none;
//         }
//         .sb-avatar.loading {
//           background: rgba(255,255,255,.1);
//           animation: sbPulse 1.4s ease-in-out infinite;
//         }
//         @keyframes sbPulse { 0%,100%{opacity:.3} 50%{opacity:.8} }

//         .sb-info { flex: 1; overflow: hidden; min-width: 0; }
//         .sb-name {
//           font-size: 13px; font-weight: 700; color: #fff;
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//           line-height: 1.35;
//         }
//         .sb-email {
//           font-size: 10.5px; color: rgba(255,255,255,.42);
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//           margin-top: 2px;
//         }
//         .sb-discipline {
//           font-size: 11px; font-weight: 600;
//           color: rgba(165,180,252,.9);
//           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//           margin-top: 3px;
//         }
//         .sb-logout {
//           background: none; border: none; cursor: pointer;
//           color: rgba(255,255,255,.32);
//           width: 28px; height: 28px; border-radius: 7px;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 15px; flex-shrink: 0;
//           transition: color .15s, background .15s;
//         }
//         .sb-logout:hover { color: #f87171; background: rgba(248,113,113,.14); }

//         .sidebar.collapsed .sb-user  { justify-content: center; padding: 13px 0; }
//         .sidebar.collapsed .sb-info,
//         .sidebar.collapsed .sb-logout { display: none; }
//       `}</style>

//       <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

//         <button className="sb-toggle" onClick={() => setCollapsed(c => !c)}>
//           {collapsed ? "›" : "‹"}
//         </button>

//         <div className="sb-logo" onClick={() => navigate("/home")}>
//           {collapsed
//             ? <div className="sb-logo-icon">PM</div>
//             : <img src={meridianLogo} alt="Project Meridian" />}
//         </div>

// <ul className="sb-menu">
//   {sidebarItems
//     .filter((item) => item.enabled)
//     .map((item) => {
//       const isActive =
//         location.pathname === item.route ||
//         location.pathname.startsWith(`${item.route}/`);

//       return (
//         <li
//           key={item.id}
//           className={isActive ? "active" : ""}
//           onClick={() => navigate(item.route)}
//           title={collapsed ? item.label : ""}
//         >
//           <span className="sb-icon">{item.icon}</span>

//           <span className="sb-label">
//             {item.shortLabel || item.label}
//           </span>
//         </li>
//       );
//     })}
// </ul>
//         <div className="sb-user" title={collapsed ? (email ?? "") : ""}>
//           <div className={`sb-avatar ${loading ? "loading" : ""}`}>
//             {!loading && initials}
//           </div>
//           <div className="sb-info">
//             <div className="sb-name">{loading ? "Loading…" : displayName}</div>
//             {!loading && email     && <div className="sb-email">{email}</div>}
//             {!loading && discipline && <div className="sb-discipline">{discipline}</div>}
//           </div>
//           {/* {onLogout && (
//             <button className="sb-logout" title="Sign out"
//               onClick={e => { e.stopPropagation(); onLogout(); }}>
//               ⏻
//             </button>
//           )} */}
//           <button
//   className="sb-logout"
//   title="Sign out"
//   onClick={(e) => {
//     e.stopPropagation();

//     if (onLogout) {
//       onLogout();
//     } else {
//       sessionStorage.clear();
//       window.location.replace("/");
//     }
//   }}
// >
//   ⏻
// </button>
//         </div>

//       </div>
//     </>
//   );
// }

// export default Sidebar;


import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebarItems } from "../config/sidebarConfig";
import meridianLogo from "../assets/meridian-logo.png";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("userEmail");
    const storedDisciplines = sessionStorage.getItem(
      "allowedDisciplines"
    );

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedDisciplines) {
      try {
        setDisciplines(JSON.parse(storedDisciplines));
      } catch {
        setDisciplines([]);
      }
    }

    fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (!data.authenticated || !data.email) return;

        const allowedDisciplines =
          data.allowedDisciplines ?? [];

        setEmail(data.email);
        setDisciplines(allowedDisciplines);

        sessionStorage.setItem("userEmail", data.email);
        sessionStorage.setItem(
          "allowedDisciplines",
          JSON.stringify(allowedDisciplines)
        );
      })
      .catch((error) => {
        console.warn("Sidebar auth request failed:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getInitials = (userEmail = "") => {
    const username = userEmail.split("@")[0] || "";
    const parts = username.match(/[a-zA-Z]+/g) || [];

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return username.slice(0, 2).toUpperCase() || "?";
  };

  const getDisplayName = (userEmail = "") => {
    const username = userEmail.split("@")[0] || "";

    if (!username) return "Not signed in";

    return username
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getDisciplineText = () => {
    if (
      disciplines.includes("All") ||
      disciplines.includes("All Disciplines")
    ) {
      return "All Disciplines";
    }

    if (disciplines.length === 1) {
      return disciplines[0];
    }

    if (disciplines.length > 1) {
      return `${disciplines.length} Disciplines`;
    }

    return "";
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    sessionStorage.clear();
    window.location.replace("/");
  };

  const initials = getInitials(email);
  const displayName = getDisplayName(email);
  const disciplineText = getDisciplineText();

  return (
    <>
      <style>{`
        .sidebar {
          position: relative;

          display: flex;
          flex-direction: column;

          width: 250px;
          min-width: 250px;
          min-height: 100vh;

          flex-shrink: 0;

          overflow: hidden;

          background: linear-gradient(
            180deg,
            #1b1b4b 0%,
            #262677 58%,
            #343381 100%
          );

          transition:
            width 0.22s ease,
            min-width 0.22s ease;
        }

        .sidebar.collapsed {
          width: 76px;
          min-width: 76px;
        }

        /* ================================
           COLLAPSE BUTTON
           ================================ */

        .sb-toggle {
          position: absolute;
          top: 18px;
          right: 14px;
          z-index: 5;

          width: 32px;
          height: 32px;

          padding: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;

          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;

          font-size: 19px;
          line-height: 1;

          cursor: pointer;

          transition:
            background-color 0.18s ease,
            transform 0.18s ease;
        }

        .sb-toggle:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: scale(1.04);
        }

        .sidebar.collapsed .sb-toggle {
          top: 14px;
          right: 50%;
          transform: translateX(50%);
        }

        .sidebar.collapsed .sb-toggle:hover {
          transform: translateX(50%) scale(1.04);
        }

        /* ================================
           LOGO
           ================================ */

        .sb-logo {
          min-height: 102px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px 48px 14px 18px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.09);

          cursor: pointer;
          flex-shrink: 0;
        }

        .sb-logo img {
          display: block;

          width: 132px;
          height: auto;

          object-fit: contain;

          filter: brightness(0) invert(1);

          transition: opacity 0.18s ease;
        }

        .sb-logo:hover img {
          opacity: 0.84;
        }

        .sb-logo-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 12px;

          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;

          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.07em;
        }

        .sidebar.collapsed .sb-logo {
          min-height: 94px;
          padding: 52px 0 12px;
        }

        /* ================================
           MENU
           ================================ */

        .sb-menu {
          list-style: none;

          display: flex;
          flex-direction: column;
          gap: 8px;

          flex: 1;

          margin: 0;
          padding: 14px 12px;

          overflow-x: hidden;
          overflow-y: auto;
        }

        .sb-menu-item {
          position: relative;

          display: flex;
          align-items: center;
          gap: 11px;

          min-height: 48px;

          padding: 8px 12px;

          border: 1px solid transparent;
          border-radius: 12px;

          color: rgba(255, 255, 255, 0.78);

          cursor: pointer;

          transition:
            background-color 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .sb-menu-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transform: translateX(2px);
        }

        .sb-menu-item.active {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.04);
          color: #ffffff;
        }

        .sb-menu-item.active::before {
          content: "";

          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;

          width: 3px;

          border-radius: 0 999px 999px 0;

          background: #a5b4fc;
        }

        .sb-icon {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          background: rgba(255, 255, 255, 0.11);
          color: #ffffff;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .sb-menu-item.active .sb-icon {
          background: rgba(165, 180, 252, 0.24);
        }

        .sb-label {
          min-width: 0;

          font-size: 13px;
          font-weight: 600;
          line-height: 1.25;

          white-space: normal;
          overflow-wrap: anywhere;
        }

        .sidebar.collapsed .sb-menu {
          align-items: center;

          padding: 14px 8px;
        }

        .sidebar.collapsed .sb-menu-item {
          width: 48px;
          min-height: 48px;

          justify-content: center;

          padding: 0;

          transform: none;
        }

        .sidebar.collapsed .sb-menu-item.active::before {
          top: 10px;
          bottom: 10px;
        }

        .sidebar.collapsed .sb-label {
          display: none;
        }

        /* ================================
           USER FOOTER
           ================================ */

        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;

          min-height: 76px;

          padding: 13px 12px;

          flex-shrink: 0;

          overflow: hidden;

          border-top: 1px solid rgba(255, 255, 255, 0.1);

          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
        }

        .sb-avatar {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border: 2px solid rgba(255, 255, 255, 0.24);
          border-radius: 50%;

          background: linear-gradient(
            135deg,
            #5b4fd4,
            #8b7cf8
          );

          color: #ffffff;

          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.03em;

          user-select: none;
        }

        .sb-avatar.loading {
          color: transparent;

          background: rgba(255, 255, 255, 0.1);

          animation: sbPulse 1.4s ease-in-out infinite;
        }

        @keyframes sbPulse {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 0.85;
          }
        }

        .sb-info {
          min-width: 0;
          flex: 1;

          overflow: hidden;
        }

        .sb-name {
          overflow: hidden;

          color: #ffffff;

          font-size: 13px;
          font-weight: 700;
          line-height: 1.3;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sb-email {
          margin-top: 2px;

          overflow: hidden;

          color: rgba(255, 255, 255, 0.46);

          font-size: 10.5px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sb-discipline {
          margin-top: 3px;

          overflow: hidden;

          color: rgba(165, 180, 252, 0.95);

          font-size: 11px;
          font-weight: 600;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sb-logout {
          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          padding: 0;

          border: none;
          border-radius: 8px;

          background: transparent;
          color: rgba(255, 255, 255, 0.4);

          font-size: 15px;

          cursor: pointer;

          transition:
            background-color 0.16s ease,
            color 0.16s ease;
        }

        .sb-logout:hover {
          background: rgba(248, 113, 113, 0.14);
          color: #f87171;
        }

        .sidebar.collapsed .sb-user {
          justify-content: center;

          padding: 13px 0;
        }

        .sidebar.collapsed .sb-info,
        .sidebar.collapsed .sb-logout {
          display: none;
        }

        /* ================================
           RESPONSIVE
           ================================ */

        @media (max-width: 900px) {
          .sidebar:not(.collapsed) {
            width: 230px;
            min-width: 230px;
          }
        }
      `}</style>

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""}`}
      >
        <button
          type="button"
          className="sb-toggle"
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          onClick={() =>
            setCollapsed((previous) => !previous)
          }
        >
          {collapsed ? "›" : "‹"}
        </button>

        <div
          className="sb-logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/home")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate("/home");
            }
          }}
        >
          {collapsed ? (
            <div className="sb-logo-icon">PM</div>
          ) : (
            <img
              src={meridianLogo}
              alt="Project Meridian"
            />
          )}
        </div>

        <ul className="sb-menu">
          {sidebarItems
            .filter((item) => item.enabled)
            .map((item) => {
              const isActive =
                location.pathname === item.route ||
                location.pathname.startsWith(
                  `${item.route}/`
                );

              return (
                <li
                  key={item.id}
                  className={`sb-menu-item ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => navigate(item.route)}
                  title={collapsed ? item.label : ""}
                >
                  <span className="sb-icon">
                    {item.icon || "•"}
                  </span>

                  <span className="sb-label">
                    {item.shortLabel || item.label}
                  </span>
                </li>
              );
            })}
        </ul>

        <div
          className="sb-user"
          title={collapsed ? email : ""}
        >
          <div
            className={`sb-avatar ${
              loading ? "loading" : ""
            }`}
          >
            {!loading && initials}
          </div>

          <div className="sb-info">
            <div className="sb-name">
              {loading ? "Loading..." : displayName}
            </div>

            {!loading && email && (
              <div className="sb-email">{email}</div>
            )}

            {!loading && disciplineText && (
              <div className="sb-discipline">
                {disciplineText}
              </div>
            )}
          </div>

          <button
            type="button"
            className="sb-logout"
            title="Sign out"
            aria-label="Sign out"
            onClick={(event) => {
              event.stopPropagation();
              handleLogout();
            }}
          >
            ⏻
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;