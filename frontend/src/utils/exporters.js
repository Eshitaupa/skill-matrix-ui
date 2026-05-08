import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//structuring base on levels
function getAllLevelsFromData(groupedData) {
  const levels = new Set();

  groupedData.forEach(group => {
    group.skills.forEach(skill => {
      Object.keys(skill.levels || {}).forEach(level => {
        levels.add(level);
      });
    });
  });

  return Array.from(levels).sort(
    (a, b) => Number(a.substring(1)) - Number(b.substring(1))
  );
}

//for row structuring 
function flattenForExport(groupedData, selectedLevel) {
  const allLevels = getAllLevelsFromData(groupedData);
  const cols = selectedLevel ? [selectedLevel] : allLevels;

  const rows = [];

  groupedData.forEach(group => {
    // Category row (Deliverables etc.)
    rows.push([
      group.category || "",
      ...Array(cols.length).fill("")
    ]);

    group.skills.forEach(skill => {
      rows.push([
        skill.name || "",
        ...cols.map(lvl => skill.levels?.[lvl] ?? "NA")
      ]);
    });
  });

  return { cols, rows };
}


// for excel structuring
export function exportMatrixToExcel(groupedData, filters, fileName) {
  const selectedLevel = filters?.level || "";
  const { cols, rows } = flattenForExport(groupedData, selectedLevel);

  const header = ["Skill", ...cols];

  const sheetData = [
    ["Level Wise Skill Proficiency Matrix"],
    [],
    ["Discipline", filters?.discipline || "-"],
    ["Role", filters?.role || "-"],
    ["Level", filters?.level || "-"],
    [],
    header,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!cols"] = [
    { wch: 35 },
    ...cols.map(() => ({ wch: 8 }))
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Matrix");

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}


//pdf
export function exportMatrixToPdf(groupedData, filters, fileName) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("Level Wise Skill Proficiency Matrix", 14, 14);

  doc.setFontSize(10);
  doc.text(
    `Discipline: ${filters?.discipline || "-"} | Role: ${filters?.role || "-"} | Level: ${filters?.level || "-"}`,
    14,
    22
  );

  const selectedLevel = filters?.level || "";
  const { cols, rows } = flattenForExport(groupedData, selectedLevel);

  const tableRows = [];
  rows.forEach(row => {
    tableRows.push(row);
  });

  autoTable(doc, {
    startY: 28,
    head: [["Skill", ...cols]],
    body: tableRows,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: "bold"
    },
    didParseCell(data) {
      if (data.row.raw[1] === "") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [230, 238, 255];
      }
    }
  });

  doc.save(`${fileName}.pdf`);
}