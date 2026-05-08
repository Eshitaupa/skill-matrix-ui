const ROLE_LEVELS = {
  Engineer: ["L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17"],
  Designer: ["L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15"],
};

function Filters({ filters, setFilters }) {
  const levelOptions = filters.role ? ROLE_LEVELS[filters.role] : [];

  return (
    <div className="filters" style={{ alignItems: "flex-start" }}>
<select
  value={filters.discipline}
  onChange={(e) =>
    setFilters((p) => ({
      ...p,
      discipline: e.target.value,
      role: "",        // ⬅ reset role
      level: ""        // ⬅ reset level (optional but good)
    }))
  }
>

        <option value="">Discipline</option>
        <option value="Process">Process</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Electrical">Electrical</option>
        <option value="Piping Engineering">Piping Engineering</option>
        <option value="Instrumentation">Instrumentation</option>
        <option value="Piping Design">Piping Design</option>
        <option value="CSA">CSA</option>
        <option value="Purchase">Purchase</option>
        <option value="Project Management">Project Management</option>
        <option value="Expedeting">Expedeting</option>
        <option value="Supplier Quantity">Supplier Quantity</option>
        <option value="Project Control">Project Control</option>
        <option value="Others">Others</option>
      </select>

      {/* Role */}
      {/* <select
        value={filters.role}
        onChange={(e) =>
          setFilters({
            ...filters,
            role: e.target.value,
            level: "", // reset level when role changes
          })
        }
      >
         */}
<select
  value={filters.role}
  onChange={(e) =>
    setFilters((p) => ({ ...p, role: e.target.value }))
  }
  disabled={!filters.discipline}
>
  <option value="">Role</option>
  <option value="Engineer">Engineer</option>
  <option value="Designer">Designer</option>
</select>

      {/* Level (dynamic) */}
      <select
        value={filters.level}
        disabled={!filters.role}
        onChange={(e) =>
          setFilters({ ...filters, level: e.target.value })
        }
      >
        <option value="">
          {filters.role ? "Select Level" : "Select Role first"}
        </option>
        {levelOptions.map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl}
          </option>
        ))}
      </select>

      {/* ✅ Proficiency Legend (NOT a dropdown) */}

    </div>
  );
}

export default Filters;
