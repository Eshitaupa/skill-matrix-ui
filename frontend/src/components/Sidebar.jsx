import { sidebarItems } from "../config/sidebarConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Arrow Toggle */}
      <div
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {/* {collapsed ? "▶" : "◀"} */}
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-title">SkillMatrix</div>

          <ul className="sidebar-menu">
            {sidebarItems
              .filter(item => item.enabled)
              .map(item => (
                <li
                  key={item.id}
                  className={location.pathname === item.route ? "active" : ""}
                  onClick={() => navigate(item.route)}
                >
                  {item.label}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Sidebar;