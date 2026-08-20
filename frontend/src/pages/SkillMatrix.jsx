

// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import Filters from "../components/Filters";
// import SkillTable from "../components/SkillTable";

// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const ROLE_LEVELS = {
//   Engineer: [
//     "L7",
//     "L8",
//     "L9",
//     "L10",
//     "L11",
//     "L12",
//     "L13",
//     "L14",
//     "L15",
//     "L16",
//     "L17",
//   ],

//   Designer: [
//     "L5",
//     "L6",
//     "L7",
//     "L8",
//     "L9",
//     "L10",
//     "L11",
//     "L12",
//     "L13",
//     "L14",
//     "L15",
//   ],
// };

// const DISCIPLINE_ROLE_MAP = {
//   "Project Management": "Engineer",
//   "Piping Engineering": "Engineer",
//   Mechanical: "Engineer",
// };

// const API_BASE =
//   process.env.REACT_APP_API_BASE ||
//   "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

// const API_SKILL = `${API_BASE}/api/skill-matrix`;

// /* =========================================================
//    HELPERS
// ========================================================= */

// const norm = (value) =>
//   String(value ?? "")
//     .trim()
//     .replace(/\s+/g, " ");

// const keyOfText = (value) => norm(value).toLowerCase();

// function rowKey(category, subskillName) {
//   return `${norm(category)}|${norm(subskillName)}`;
// }

// function rowKeyLower(category, subskillName) {
//   return rowKey(category, subskillName).toLowerCase();
// }

// async function safeJson(response) {
//   try {
//     return await response.json();
//   } catch {
//     return null;
//   }
// }

// async function safeText(response) {
//   try {
//     return await response.text();
//   } catch {
//     return "";
//   }
// }

// function transformApiToMatrix(rows, roleLevels) {
//   const groups = {};

//   (rows || []).forEach((row) => {
//     const category = norm(row.Skill || row.category);
//     const subskill = norm(row.Subskill || row.skill_name);
//     const level = norm(row.LevelKey || row.level);

//     const value =
//       row.Value ??
//       row.proficiency ??
//       "NA";

//     const sortOrder = Number(
//       row.SortOrder ??
//         row.sort_order ??
//         999999
//     );

//     if (!category || !subskill || !level) {
//       return;
//     }

//     const categoryKey = keyOfText(category);

//     if (!groups[categoryKey]) {
//       groups[categoryKey] = {
//         category,
//         skills: [],
//       };
//     }

//     let skillObject =
//       groups[categoryKey].skills.find(
//         (skill) =>
//           keyOfText(skill.name) ===
//           keyOfText(subskill)
//       );

//     if (!skillObject) {
//       skillObject = {
//         name: subskill,
//         sortOrder,
//         levels: {},
//       };

//       groups[categoryKey].skills.push(
//         skillObject
//       );
//     }

//     if (
//       sortOrder <
//       Number(skillObject.sortOrder ?? 999999)
//     ) {
//       skillObject.sortOrder = sortOrder;
//     }

//     skillObject.levels[level] = String(value);
//   });

//   Object.values(groups).forEach((group) => {
//     group.skills.sort((a, b) => {
//       const aOrder = Number(
//         a.sortOrder ?? 999999
//       );

//       const bOrder = Number(
//         b.sortOrder ?? 999999
//       );

//       if (aOrder !== bOrder) {
//         return aOrder - bOrder;
//       }

//       return String(a.name).localeCompare(
//         String(b.name)
//       );
//     });

//     group.skills.forEach((skill) => {
//       roleLevels.forEach((level) => {
//         if (
//           skill.levels[level] === undefined ||
//           skill.levels[level] === null ||
//           skill.levels[level] === ""
//         ) {
//           skill.levels[level] = "NA";
//         }
//       });
//     });
//   });

//   return Object.values(groups);
// }

// function filterOutDeletedRows(
//   base,
//   deletedKeySet
// ) {
//   if (
//     !deletedKeySet ||
//     deletedKeySet.size === 0
//   ) {
//     return base;
//   }

//   return (base || [])
//     .map((group) => ({
//       ...group,

//       skills: (group.skills || []).filter(
//         (skill) => {
//           const key = rowKeyLower(
//             group.category,
//             skill.name
//           );

//           return !deletedKeySet.has(key);
//         }
//       ),
//     }))
//     .filter(
//       (group) =>
//         (group.skills || []).length > 0
//     );
// }

// function removeRowsLocally(
//   base,
//   rowsToRemove
// ) {
//   const removeSet = new Set(
//     rowsToRemove.map((row) =>
//       rowKeyLower(
//         row.category,
//         row.subskillName
//       )
//     )
//   );

//   return (base || [])
//     .map((group) => ({
//       ...group,

//       skills: (group.skills || []).filter(
//         (skill) => {
//           const key = rowKeyLower(
//             group.category,
//             skill.name
//           );

//           return !removeSet.has(key);
//         }
//       ),
//     }))
//     .filter(
//       (group) =>
//         (group.skills || []).length > 0
//     );
// }

// function applyEditsLocally(
//   base,
//   edits
// ) {
//   return (base || []).map((group) => ({
//     ...group,

//     skills: (group.skills || []).map(
//       (skill) => {
//         const levels = {
//           ...(skill.levels || {}),
//         };

//         let changed = false;

//         Object.entries(edits || {}).forEach(
//           ([key, value]) => {
//             const [category, subskill, level] =
//               key.split("|");

//             if (
//               keyOfText(category) ===
//                 keyOfText(group.category) &&
//               keyOfText(subskill) ===
//                 keyOfText(skill.name)
//             ) {
//               levels[level] = value;
//               changed = true;
//             }
//           }
//         );

//         if (!changed) {
//           return skill;
//         }

//         return {
//           ...skill,
//           levels,
//         };
//       }
//     ),
//   }));
// }

// function buildExportRows(
//   matrixData,
//   role,
//   selectedLevel
// ) {
//   const allLevels =
//     ROLE_LEVELS[role] || [];

//   const levels = selectedLevel
//     ? [selectedLevel]
//     : allLevels;

//   const rows = [];

//   (matrixData || []).forEach((group) => {
//     (group.skills || []).forEach(
//       (skill) => {
//         const row = {
//           Skill: group.category,
//           Subskill: skill.name,
//         };

//         levels.forEach((level) => {
//           row[level] =
//             skill.levels?.[level] ??
//             "NA";
//         });

//         rows.push(row);
//       }
//     );
//   });

//   return rows;
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function SkillMatrix({
//   allowedDisciplines = [],
// }) {
//   /* ---------------------------------------------------------
//      STATE
//   --------------------------------------------------------- */

//   const [filters, setFilters] = useState({
//     discipline: "",
//     role: "",
//     level: "",
//     skillSearch: "",
//   });

//   const [matrixData, setMatrixData] =
//     useState([]);

//   const [
//     initialLoading,
//     setInitialLoading,
//   ] = useState(false);

//   const [
//     refreshLoading,
//     setRefreshLoading,
//   ] = useState(false);

//   const [
//     isEditMode,
//     setIsEditMode,
//   ] = useState(false);

//   const [
//     editedValues,
//     setEditedValues,
//   ] = useState({});

//   const [
//     selectedRows,
//     setSelectedRows,
//   ] = useState([]);

//   const [
//     confirmDelete,
//     setConfirmDelete,
//   ] = useState(null);

//   const [
//     actionBusy,
//     setActionBusy,
//   ] = useState(false);

//   const [
//     showAddRow,
//     setShowAddRow,
//   ] = useState(false);

//   const [toast, setToast] =
//     useState(null);

//   const [metaError, setMetaError] =
//     useState(false);

//   const [meta, setMeta] = useState({
//     disciplines: [],
//     roles: [
//       "Engineer",
//       "Designer",
//     ],
//     allowedDisciplines: [],
//   });

//   const [form, setForm] = useState({
//     discipline: "",
//     role: "",
//     skill: "",
//     subskill: "",
//     isNewSkill: false,
//     isNewSubskill: false,
//   });

//   /* ---------------------------------------------------------
//      REFS
//   --------------------------------------------------------- */

//   const toastTimerRef =
//     useRef(null);

//   const deletedRowKeysRef =
//     useRef(new Set());

//   const matrixLoadedRef =
//     useRef(false);

//   const fetchAbortRef =
//     useRef(null);

//   const fetchMatrixRef =
//     useRef(null);

//   const suppressRealtimeUntilRef =
//     useRef(0);

//   /* ---------------------------------------------------------
//      TOAST
//   --------------------------------------------------------- */

//   const showToast = useCallback(
//     (
//       message,
//       tone = "error"
//     ) => {
//       setToast({
//         message,
//         tone,
//       });

//       if (toastTimerRef.current) {
//         clearTimeout(
//           toastTimerRef.current
//         );
//       }

//       toastTimerRef.current =
//         setTimeout(() => {
//           setToast(null);
//         }, 3500);
//     },
//     []
//   );

//   useEffect(() => {
//     return () => {
//       if (toastTimerRef.current) {
//         clearTimeout(
//           toastTimerRef.current
//         );
//       }

//       if (fetchAbortRef.current) {
//         fetchAbortRef.current.abort();
//       }
//     };
//   }, []);

//   /* ---------------------------------------------------------
//      ACCESS / META
//   --------------------------------------------------------- */

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMeta() {
//       try {
//         const response = await fetch(
//           `${API_SKILL}/meta?t=${Date.now()}`,
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//             headers: {
//               Accept:
//                 "application/json",
//             },
//           }
//         );

//         const data =
//           await safeJson(response);

//         if (!response.ok) {
//           throw new Error(
//             data?.message ||
//               `Meta request failed with status ${response.status}`
//           );
//         }

//         if (cancelled) {
//           return;
//         }

//         const disciplines =
//           Array.isArray(
//             data?.disciplines
//           )
//             ? data.disciplines
//                 .map(norm)
//                 .filter(Boolean)
//             : [];

//         const backendAllowed =
//           Array.isArray(
//             data?.allowedDisciplines
//           )
//             ? data.allowedDisciplines
//                 .map(norm)
//                 .filter(Boolean)
//             : [];

//         const roles =
//           Array.isArray(data?.roles) &&
//           data.roles.length
//             ? data.roles
//             : [
//                 "Engineer",
//                 "Designer",
//               ];

//         setMeta({
//           disciplines,
//           roles,
//           allowedDisciplines:
//             backendAllowed,
//         });

//         setMetaError(false);
//       } catch (error) {
//         console.error(
//           "META LOAD FAILED:",
//           error
//         );

//         if (!cancelled) {
//           setMeta({
//             disciplines: [],
//             roles: [
//               "Engineer",
//               "Designer",
//             ],
//             allowedDisciplines: [],
//           });

//           setMetaError(true);
//         }
//       }
//     }

//     loadMeta();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /* ---------------------------------------------------------
//      DISCIPLINE OPTIONS
//   --------------------------------------------------------- */

//   const effectiveAllowedDisciplines =
//     useMemo(() => {
//       if (
//         Array.isArray(
//           meta.allowedDisciplines
//         ) &&
//         meta.allowedDisciplines.length > 0
//       ) {
//         return meta.allowedDisciplines
//           .map(norm)
//           .filter(Boolean);
//       }

//       return Array.isArray(
//         allowedDisciplines
//       )
//         ? allowedDisciplines
//             .map(norm)
//             .filter(Boolean)
//         : [];
//     }, [
//       meta.allowedDisciplines,
//       allowedDisciplines,
//     ]);

//   const disciplineOptions =
//     useMemo(() => {
//       const hasAll =
//         effectiveAllowedDisciplines.some(
//           (item) => {
//             const value =
//               keyOfText(item);

//             return (
//               value === "all" ||
//               value ===
//                 "all disciplines"
//             );
//           }
//         );

//       if (hasAll) {
//         return Array.isArray(
//           meta.disciplines
//         )
//           ? meta.disciplines
//           : [];
//       }

//       return effectiveAllowedDisciplines;
//     }, [
//       effectiveAllowedDisciplines,
//       meta.disciplines,
//     ]);

//   const roleOptions =
//     useMemo(() => {
//       return meta.roles?.length
//         ? meta.roles
//         : [
//             "Engineer",
//             "Designer",
//           ];
//     }, [meta.roles]);

//   const isDisciplineLocked =
//     disciplineOptions.length === 1 &&
//     ![
//       "all",
//       "all disciplines",
//     ].includes(
//       keyOfText(
//         disciplineOptions[0]
//       )
//     );

//   /* ---------------------------------------------------------
//      AUTO SELECT SINGLE DISCIPLINE
//   --------------------------------------------------------- */

//   useEffect(() => {
//     if (
//       disciplineOptions.length !== 1
//     ) {
//       return;
//     }

//     const onlyDiscipline =
//       disciplineOptions[0];

//     if (
//       !onlyDiscipline ||
//       [
//         "all",
//         "all disciplines",
//       ].includes(
//         keyOfText(onlyDiscipline)
//       )
//     ) {
//       return;
//     }

//     setFilters((previous) => {
//       if (
//         keyOfText(
//           previous.discipline
//         ) ===
//         keyOfText(
//           onlyDiscipline
//         )
//       ) {
//         return previous;
//       }

//       return {
//         ...previous,
//         discipline:
//           onlyDiscipline,
//       };
//     });
//   }, [disciplineOptions]);

//   /* ---------------------------------------------------------
//      DISCIPLINE CHANGE
//   --------------------------------------------------------- */

//   useEffect(() => {
//     if (!filters.discipline) {
//       setMatrixData([]);
//       setSelectedRows([]);
//       setEditedValues({});

//       return;
//     }

//     const fixedRole =
//       DISCIPLINE_ROLE_MAP[
//         filters.discipline
//       ] || "";

//     setFilters((previous) => {
//       if (
//         previous.role === fixedRole &&
//         previous.level === "" &&
//         previous.skillSearch === ""
//       ) {
//         return previous;
//       }

//       return {
//         ...previous,
//         role: fixedRole,
//         level: "",
//         skillSearch: "",
//       };
//     });
//   }, [filters.discipline]);

//   /* ---------------------------------------------------------
//      RESET LOCAL MATRIX GUARDS
//   --------------------------------------------------------- */

//   useEffect(() => {
//     deletedRowKeysRef.current.clear();

//     matrixLoadedRef.current = false;

//     setSelectedRows([]);
//     setEditedValues({});
//     setConfirmDelete(null);
//   }, [
//     filters.discipline,
//     filters.role,
//   ]);

//   /* ---------------------------------------------------------
//      FETCH MATRIX
//   --------------------------------------------------------- */

//   const fetchMatrix = useCallback(
//     async ({
//       silent = false,
//       forceServerTruth = false,
//     } = {}) => {
//       if (
//         !filters.discipline ||
//         !filters.role
//       ) {
//         setMatrixData([]);
//         return;
//       }

//       /*
//        * Cancel an older request if the
//        * user rapidly changes discipline.
//        */
//       if (fetchAbortRef.current) {
//         fetchAbortRef.current.abort();
//       }

//       const controller =
//         new AbortController();

//       fetchAbortRef.current =
//         controller;

//       const firstLoad =
//         !matrixLoadedRef.current;

//       if (
//         firstLoad &&
//         !silent
//       ) {
//         setInitialLoading(true);
//       }

//       try {
//         const url =
//           `${API_SKILL}` +
//           `?discipline=${encodeURIComponent(
//             filters.discipline
//           )}` +
//           `&role=${encodeURIComponent(
//             filters.role
//           )}` +
//           `&t=${Date.now()}`;

//         const response = await fetch(
//           url,
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//             signal:
//               controller.signal,
//             headers: {
//               Accept:
//                 "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           const message =
//             await safeText(
//               response
//             );

//           throw new Error(
//             message ||
//               `Matrix request failed with ${response.status}`
//           );
//         }

//         const data =
//           await safeJson(response);

//         const levels =
//           ROLE_LEVELS[
//             filters.role
//           ] || [];

//         const transformed =
//           transformApiToMatrix(
//             data || [],
//             levels
//           );

//         if (forceServerTruth) {
//           deletedRowKeysRef.current.clear();

//           setMatrixData(
//             transformed
//           );
//         } else {
//           setMatrixData(
//             filterOutDeletedRows(
//               transformed,
//               deletedRowKeysRef.current
//             )
//           );
//         }

//         matrixLoadedRef.current =
//           true;
//       } catch (error) {
//         if (
//           error?.name ===
//           "AbortError"
//         ) {
//           return;
//         }

//         console.error(
//           "MATRIX LOAD FAILED:",
//           error
//         );

//         showToast(
//           "Could not load the matrix.",
//           "error"
//         );
//       } finally {
//         if (
//           fetchAbortRef.current ===
//           controller
//         ) {
//           fetchAbortRef.current =
//             null;
//         }

//         if (
//           firstLoad &&
//           !silent
//         ) {
//           setInitialLoading(
//             false
//           );
//         }
//       }
//     },
//     [
//       filters.discipline,
//       filters.role,
//       showToast,
//     ]
//   );

//   useEffect(() => {
//     fetchMatrixRef.current =
//       fetchMatrix;
//   }, [fetchMatrix]);

//   useEffect(() => {
//     if (
//       !filters.discipline ||
//       !filters.role
//     ) {
//       return;
//     }

//     fetchMatrix();
//   }, [
//     fetchMatrix,
//     filters.discipline,
//     filters.role,
//   ]);

// /* ---------------------------------------------------------
//    REAL-TIME REFRESH
// --------------------------------------------------------- */

// useEffect(() => {
//   if (!filters.discipline || !filters.role) {
//     return;
//   }

//   const source = new EventSource(`${API_SKILL}/stream`, {
//     withCredentials: true,
//   });

//   source.onmessage = (event) => {
//     try {
//       if (actionBusy || isEditMode) {
//         return;
//       }

//       if (Date.now() < suppressRealtimeUntilRef.current) {
//         return;
//       }

//       const payload = JSON.parse(event.data);

//       if (
//         keyOfText(payload.discipline) === keyOfText(filters.discipline) &&
//         keyOfText(payload.role) === keyOfText(filters.role)
//       ) {
//         fetchMatrixRef.current?.({
//           silent: true,
//         });
//       }
//     } catch {
//       // Ignore malformed events
//     }
//   };

//   source.onerror = () => {
//     // EventSource reconnects automatically.
//   };

//   return () => {
//     source.close();
//   };
// }, [filters.discipline, filters.role, actionBusy, isEditMode]);

//   /* ---------------------------------------------------------
//      MANUAL REFRESH
//   --------------------------------------------------------- */

//   const handleRefresh =
//     useCallback(async () => {
//       if (
//         actionBusy ||
//         refreshLoading ||
//         !filters.discipline ||
//         !filters.role
//       ) {
//         return;
//       }

//       setRefreshLoading(true);
//       setSelectedRows([]);
//       setEditedValues({});

//       try {
//         await fetchMatrix({
//           silent: true,
//           forceServerTruth: true,
//         });

//         showToast(
//           "Latest changes loaded.",
//           "success"
//         );
//       } finally {
//         setRefreshLoading(false);
//       }
//     }, [
//       actionBusy,
//       refreshLoading,
//       filters.discipline,
//       filters.role,
//       fetchMatrix,
//       showToast,
//     ]);

//   /* ---------------------------------------------------------
//      EDIT MODE
//   --------------------------------------------------------- */

//   function startEditMode() {
//     setIsEditMode(true);
//   }

//   function cancelEdit() {
//     setEditedValues({});
//     setSelectedRows([]);
//     setConfirmDelete(null);
//     setIsEditMode(false);
//   }

//   /* ---------------------------------------------------------
//      PROFICIENCY EDIT SAVE
//   --------------------------------------------------------- */
// async function saveChanges() {
//   if (actionBusy) {
//     return;
//   }

//   const entries = Object.entries(editedValues || {});

//   if (!entries.length) {
//     setIsEditMode(false);

//     showToast("No proficiency changes to save.", "success");

//     return;
//   }

//   const snapshot = matrixData;

//   const pendingEdits = {
//     ...editedValues,
//   };

//   const optimistic = applyEditsLocally(matrixData, pendingEdits);

//   setMatrixData(optimistic);
//   setEditedValues({});
//   setSelectedRows([]);
//   setConfirmDelete(null);
//   setIsEditMode(false);
//   setActionBusy(true);

//   try {
//     const payload = Object.entries(pendingEdits).map(([key, value]) => {
//       const [Skill, Subskill, LevelKey] = key.split("|");

//       return {
//         Discipline: norm(filters.discipline),
//         Role: norm(filters.role),
//         Skill: norm(Skill),
//         Subskill: norm(Subskill),
//         LevelKey: norm(LevelKey),
//         Value: String(value ?? "NA"),
//       };
//     });

//     suppressRealtimeUntilRef.current = Date.now() + 30000;

//     const response = await fetch(`${API_SKILL}/save`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const message = await safeText(response);

//       throw new Error(message || "Save failed");
//     }

//     showToast("Changes saved.", "success");
//   } catch (error) {
//     console.error("SAVE FAILED:", error);

//     setMatrixData(snapshot);
//     setEditedValues(pendingEdits);
//     setIsEditMode(true);

//     showToast(error.message || "Save failed.", "error");
//   } finally {
//     setActionBusy(false);
//   }
// }
//   /* ---------------------------------------------------------
//      SELECTION
//   --------------------------------------------------------- */

//   function toggleSelectedRow(
//     category,
//     subskillName
//   ) {
//     const key = rowKey(
//       category,
//       subskillName
//     );

//     setSelectedRows(
//       (previous) => {
//         const exists =
//           previous.some(
//             (item) =>
//               String(
//                 item
//               ).toLowerCase() ===
//               key.toLowerCase()
//           );

//         if (exists) {
//           return previous.filter(
//             (item) =>
//               String(
//                 item
//               ).toLowerCase() !==
//               key.toLowerCase()
//           );
//         }

//         return [
//           ...previous,
//           key,
//         ];
//       }
//     );
//   }

//   function toggleCategoryRows(
//     category,
//     subskillNames
//   ) {
//     const keys = (
//       subskillNames || []
//     ).map((name) =>
//       rowKey(category, name)
//     );

//     setSelectedRows(
//       (previous) => {
//         const previousLower =
//           new Set(
//             previous.map(
//               (item) =>
//                 String(
//                   item
//                 ).toLowerCase()
//             )
//           );

//         const allSelected =
//           keys.length > 0 &&
//           keys.every((key) =>
//             previousLower.has(
//               key.toLowerCase()
//             )
//           );

//         if (allSelected) {
//           const removeSet =
//             new Set(
//               keys.map((key) =>
//                 key.toLowerCase()
//               )
//             );

//           return previous.filter(
//             (item) =>
//               !removeSet.has(
//                 String(
//                   item
//                 ).toLowerCase()
//               )
//           );
//         }

//         const result = [
//           ...previous,
//         ];

//         keys.forEach((key) => {
//           if (
//             !previousLower.has(
//               key.toLowerCase()
//             )
//           ) {
//             result.push(key);
//           }
//         });

//         return result;
//       }
//     );
//   }

//   function clearSelectedRows() {
//     setSelectedRows([]);
//     setConfirmDelete(null);
//   }

//   /* ---------------------------------------------------------
//      DELETE REQUEST
//   --------------------------------------------------------- */

//   function requestDeleteRow(
//     category,
//     subskillName
//   ) {
//     setConfirmDelete({
//       rows: [
//         {
//           category,
//           subskillName,
//         },
//       ],
//     });
//   }

//   function requestDeleteSelectedRows() {
//     if (!selectedRows.length) {
//       showToast(
//         "Select at least one subskill.",
//         "error"
//       );

//       return;
//     }

//     const rows =
//       selectedRows
//         .map((key) => {
//           /*
//            * Category/subskill fields in the current
//            * data should be used where possible,
//            * rather than assuming arbitrary "|" chars
//            * never occur inside names.
//            */
//           for (
//             const group of matrixData
//           ) {
//             for (
//               const skill of
//                 group.skills || []
//             ) {
//               if (
//                 rowKeyLower(
//                   group.category,
//                   skill.name
//                 ) ===
//                 String(
//                   key
//                 ).toLowerCase()
//               ) {
//                 return {
//                   category:
//                     group.category,

//                   subskillName:
//                     skill.name,
//                 };
//               }
//             }
//           }

//           return null;
//         })
//         .filter(Boolean);

//     if (!rows.length) {
//       showToast(
//         "No valid rows selected.",
//         "error"
//       );

//       return;
//     }

//     setConfirmDelete({
//       rows,
//     });
//   }

//   /* ---------------------------------------------------------
//      DELETE AND AUTO SAVE
//   --------------------------------------------------------- */

// async function confirmDeleteRows() {
//   if (actionBusy || !confirmDelete?.rows?.length) {
//     return;
//   }

//   const rowsToDelete = confirmDelete.rows;

//   const snapshot = matrixData;

//   setConfirmDelete(null);
//   setSelectedRows([]);
//   setEditedValues({});
//   setActionBusy(true);

//   rowsToDelete.forEach((row) => {
//     deletedRowKeysRef.current.add(
//       rowKeyLower(row.category, row.subskillName)
//     );
//   });

//   setMatrixData((previous) => removeRowsLocally(previous, rowsToDelete));

//   try {
//     suppressRealtimeUntilRef.current = Date.now() + 30000;

//     const response = await fetch(`${API_SKILL}/rows/delete`, {
//       method: "POST",

//       headers: {
//         "Content-Type": "application/json",
//       },

//       credentials: "include",

//       body: JSON.stringify({
//         Discipline: norm(filters.discipline),
//         Role: norm(filters.role),

//         rows: rowsToDelete.map((row) => ({
//           Skill: norm(row.category),
//           Subskill: norm(row.subskillName),
//         })),
//       }),
//     });

//     if (!response.ok) {
//       const message = await safeText(response);

//       throw new Error(message || "Delete failed");
//     }

//     showToast(
//       rowsToDelete.length === 1
//         ? "Deleted and saved."
//         : `${rowsToDelete.length} subskills deleted and saved.`,
//       "success"
//     );
//   } catch (error) {
//     console.error("DELETE FAILED:", error);

//     rowsToDelete.forEach((row) => {
//       deletedRowKeysRef.current.delete(
//         rowKeyLower(row.category, row.subskillName)
//       );
//     });

//     setMatrixData(snapshot);

//     showToast(error.message || "Delete failed. Table restored.", "error");
//   } finally {
//     setActionBusy(false);
//   }
// }
//   /* ---------------------------------------------------------
//      ADD ROW
//   --------------------------------------------------------- */

//   function openAddModal() {
//     setForm({
//       discipline:
//         filters.discipline || "",

//       role:
//         filters.role || "",

//       skill: "",
//       subskill: "",

//       isNewSkill: false,
//       isNewSubskill: false,
//     });

//     setShowAddRow(true);
//   }

//   const modalSkillOptions =
//     useMemo(() => {
//       return (matrixData || [])
//         .map(
//           (group) =>
//             group.category
//         )
//         .filter(Boolean);
//     }, [matrixData]);

//   const modalSubskillOptions =
//     useMemo(() => {
//       if (!form.skill) {
//         return [];
//       }

//       const group =
//         (matrixData || []).find(
//           (item) =>
//             keyOfText(
//               item.category
//             ) ===
//             keyOfText(
//               form.skill
//             )
//         );

//       return (
//         group?.skills || []
//       )
//         .map(
//           (skill) =>
//             skill.name
//         )
//         .filter(Boolean);
//     }, [
//       matrixData,
//       form.skill,
//     ]);

//   async function handleAddRow() {
//     if (actionBusy) {
//       return;
//     }

//     const discipline = norm(
//       form.discipline ||
//         filters.discipline
//     );

//     const role = norm(
//       form.role ||
//         filters.role
//     );

//     let category =
//       norm(form.skill);

//     const subskill =
//       norm(form.subskill);

//     if (
//       !discipline ||
//       !role ||
//       !category ||
//       !subskill
//     ) {
//       showToast(
//         "Fill Discipline, Role, Skill Category and Subskill.",
//         "error"
//       );

//       return;
//     }

//     const existingCategory =
//       (matrixData || []).find(
//         (group) =>
//           keyOfText(
//             group.category
//           ) ===
//           keyOfText(category)
//       );

//     if (existingCategory) {
//       category =
//         existingCategory.category;
//     }

//     const duplicate =
//       Boolean(
//         existingCategory?.skills?.some(
//           (skill) =>
//             keyOfText(
//               skill.name
//             ) ===
//             keyOfText(
//               subskill
//             )
//         )
//       );

//     if (duplicate) {
//       showToast(
//         "This Skill and Subskill already exists.",
//         "error"
//       );

//       return;
//     }

//     const levels =
//       ROLE_LEVELS[role] || [];

//     if (!levels.length) {
//       showToast(
//         "Invalid role.",
//         "error"
//       );

//       return;
//     }

//     /*
//      * Add ALL levels immediately.
//      */
//     const payload =
//       levels.map((level) => ({
//         Discipline:
//           discipline,

//         Role: role,

//         Skill:
//           category,

//         Subskill:
//           subskill,

//         LevelKey:
//           level,

//         Value: "NA",
//       }));

//     const optimisticSkill = {
//       name: subskill,

//       sortOrder: 999999,

//       levels:
//         Object.fromEntries(
//           levels.map(
//             (level) => [
//               level,
//               "NA",
//             ]
//           )
//         ),
//     };

//     const snapshot =
//       matrixData;

//     /*
//      * Remove old delete tombstone if the
//      * same row is intentionally added again.
//      */
//     deletedRowKeysRef.current.delete(
//       rowKeyLower(
//         category,
//         subskill
//       )
//     );

//     /*
//      * Put new row on screen immediately.
//      */
//     setMatrixData(
//       (previous) => {
//         const exists =
//           previous.some(
//             (group) =>
//               keyOfText(
//                 group.category
//               ) ===
//               keyOfText(
//                 category
//               )
//           );

//         if (exists) {
//           return previous.map(
//             (group) => {
//               if (
//                 keyOfText(
//                   group.category
//                 ) !==
//                 keyOfText(
//                   category
//                 )
//               ) {
//                 return group;
//               }

//               return {
//                 ...group,

//                 skills: [
//                   ...(group.skills ||
//                     []),

//                   optimisticSkill,
//                 ],
//               };
//             }
//           );
//         }

//         return [
//           ...previous,

//           {
//             category,

//             skills: [
//               optimisticSkill,
//             ],
//           },
//         ];
//       }
//     );

//     setShowAddRow(false);
//     setActionBusy(true);

//     try {
//       suppressRealtimeUntilRef.current =
//         Date.now() + 3000;

//       const response =
//         await fetch(
//           `${API_SKILL}/save`,
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             credentials:
//               "include",

//             body: JSON.stringify(
//               payload
//             ),
//           }
//         );

//       if (!response.ok) {
//         const message =
//           await safeText(
//             response
//           );

//         throw new Error(
//           message ||
//             "Add failed"
//         );
//       }

//       showToast(
//         "Skill added and saved.",
//         "success"
//       );

//       /*
//        * Do NOT refetch.
//        * UI already contains the new row.
//        */
//     } catch (error) {
//       console.error(
//         "ADD FAILED:",
//         error
//       );

//       setMatrixData(snapshot);

//       showToast(
//         error.message ||
//           "Add failed.",
//         "error"
//       );
//     } finally {
//       setActionBusy(false);
//     }
//   }

//   /* ---------------------------------------------------------
//      SEARCH OPTIONS
//   --------------------------------------------------------- */

//   const skillOptions =
//     useMemo(() => {
//       const options = [];

//       (matrixData || []).forEach(
//         (group) => {
//           if (group.category) {
//             options.push(
//               group.category
//             );
//           }

//           (group.skills || []).forEach(
//             (skill) => {
//               if (skill.name) {
//                 options.push(
//                   skill.name
//                 );
//               }
//             }
//           );
//         }
//       );

//       return [
//         ...new Set(options),
//       ];
//     }, [matrixData]);

//   /* ---------------------------------------------------------
//      FILTER TABLE
//   --------------------------------------------------------- */

//   const filteredMatrixData =
//     useMemo(() => {
//       const query =
//         keyOfText(
//           filters.skillSearch
//         );

//       if (!query) {
//         return matrixData;
//       }

//       return (matrixData || [])
//         .map((group) => {
//           const categoryMatch =
//             keyOfText(
//               group.category
//             ).includes(query);

//           if (categoryMatch) {
//             return group;
//           }

//           const matchingSkills =
//             (
//               group.skills || []
//             ).filter(
//               (skill) =>
//                 keyOfText(
//                   skill.name
//                 ).includes(query)
//             );

//           if (
//             !matchingSkills.length
//           ) {
//             return null;
//           }

//           return {
//             ...group,

//             skills:
//               matchingSkills,
//           };
//         })
//         .filter(Boolean);
//     }, [
//       matrixData,
//       filters.skillSearch,
//     ]);

//   /* ---------------------------------------------------------
//      EXCEL EXPORT
//   --------------------------------------------------------- */

//   function exportToExcel() {
//     if (
//       !filteredMatrixData.length
//     ) {
//       showToast(
//         "No data to export.",
//         "error"
//       );

//       return;
//     }

//     const rows =
//       buildExportRows(
//         filteredMatrixData,
//         filters.role,
//         filters.level
//       );

//     const levelPart =
//       filters.level
//         ? `_${filters.level}`
//         : "_ALLLEVELS";

//     const headerRows = [
//       ["Project Meridian Export"],
//       [],
//       [
//         "Discipline",
//         filters.discipline ||
//           "-",
//       ],
//       [
//         "Role",
//         filters.role || "-",
//       ],
//       [
//         "Level",
//         filters.level ||
//           "All levels",
//       ],
//       [],
//       [
//         "Proficiency",
//         "Meaning",
//       ],
//       [
//         "NA",
//         "Not Applicable",
//       ],
//       ["1", "Familiar"],
//       [
//         "2",
//         "Working Level",
//       ],
//       ["3", "Extensive"],
//       [
//         "4",
//         "Authoritative",
//       ],
//       [],
//     ];

//     const tableHeader =
//       Object.keys(
//         rows[0] || {
//           Skill: "",
//           Subskill: "",
//         }
//       );

//     const tableData =
//       rows.map((row) =>
//         tableHeader.map(
//           (header) =>
//             row[header]
//         )
//       );

//     const worksheet =
//       XLSX.utils.aoa_to_sheet([
//         ...headerRows,
//         tableHeader,
//         ...tableData,
//       ]);

//     worksheet["!cols"] = [
//       { wch: 22 },
//       { wch: 28 },

//       ...tableHeader
//         .slice(2)
//         .map(() => ({
//           wch: 10,
//         })),
//     ];

//     const workbook =
//       XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       "Project Meridian"
//     );

//     const buffer =
//       XLSX.write(
//         workbook,
//         {
//           bookType: "xlsx",
//           type: "array",
//         }
//       );

//     saveAs(
//       new Blob([buffer], {
//         type: "application/octet-stream",
//       }),

//       `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`
//     );
//   }

//   /* ---------------------------------------------------------
//      PDF EXPORT
//   --------------------------------------------------------- */

//   function exportToPDF() {
//     if (
//       !filteredMatrixData.length
//     ) {
//       showToast(
//         "No data to export.",
//         "error"
//       );

//       return;
//     }

//     const levelPart =
//       filters.level
//         ? `_${filters.level}`
//         : "_ALLLEVELS";

//     const document =
//       new jsPDF("landscape");

//     document.setFontSize(16);

//     document.text(
//       "Project Meridian",
//       14,
//       12
//     );

//     document.setFontSize(10);

//     document.text(
//       `Discipline: ${
//         filters.discipline ||
//         "-"
//       }`,
//       14,
//       18
//     );

//     document.text(
//       `Role: ${
//         filters.role || "-"
//       }`,
//       14,
//       23
//     );

//     document.text(
//       `Level: ${
//         filters.level ||
//         "All levels"
//       }`,
//       14,
//       28
//     );

//     autoTable(document, {
//       startY: 32,

//       head: [
//         [
//           "Proficiency",
//           "Meaning",
//         ],
//       ],

//       body: [
//         [
//           "NA",
//           "Not Applicable",
//         ],
//         ["1", "Familiar"],
//         [
//           "2",
//           "Working Level",
//         ],
//         [
//           "3",
//           "Extensive",
//         ],
//         [
//           "4",
//           "Authoritative",
//         ],
//       ],

//       styles: {
//         fontSize: 9,
//       },

//       headStyles: {
//         fillColor: [
//           40,
//           40,
//           40,
//         ],
//       },

//       theme: "grid",

//       tableWidth: "wrap",
//     });

//     const rows =
//       buildExportRows(
//         filteredMatrixData,
//         filters.role,
//         filters.level
//       );

//     const columns =
//       Object.keys(
//         rows[0]
//       ).map((key) => ({
//         header: key,
//         dataKey: key,
//       }));

//     autoTable(document, {
//       startY:
//         document.lastAutoTable
//           .finalY + 6,

//       columns,

//       body: rows,

//       headStyles: {
//         fillColor: [
//           40,
//           40,
//           40,
//         ],
//       },

//       styles: {
//         fontSize: 8,
//       },

//       theme: "grid",
//     });

//     document.save(
//       `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.pdf`
//     );
//   }

//   const selectedCount =
//     selectedRows.length;

//   /* =========================================================
//      UI
//   ========================================================= */

//   return (
//     <div className="page-container">
//       <style>{`

//         /* =========================
//            FILTER BAR
//         ========================= */

//         .sticky-filters {
//           position: sticky;
//           top: 0;
//           z-index: 30;

//           background: #f8fafc;

//           padding-top: 6px;
//           padding-bottom: 6px;
//         }


//         /* =========================
//            TOOLBAR
//         ========================= */

//         .smf-toolbar-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;

//           gap: 10px;

//           margin: 10px 0 12px;

//           flex-wrap: wrap;
//         }



//         /* =========================
//            LOADING
//         ========================= */

//         .smf-loading-state {
//           min-height: 120px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           gap: 10px;

//           color: #64748b;

//           font-size: 14px;
//           font-weight: 600;
//         }

//         .smf-loading-spinner {
//           width: 20px;
//           height: 20px;

//           border: 2px solid #e2e8f0;
//           border-top-color: #2563eb;

//           border-radius: 50%;

//           animation:
//             smfSpin 0.7s linear infinite;
//         }

//         @keyframes smfSpin {
//           to {
//             transform:
//               rotate(360deg);
//           }
//         }


//         /* =========================
//            ADD ROW MODAL
//         ========================= */

//         .sm-add-overlay {
//           position: fixed;
//           inset: 0;

//           z-index: 5000;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           padding: 20px;

//           background:
//             rgba(
//               15,
//               23,
//               42,
//               0.52
//             );

//           overflow-y: auto;

//           box-sizing: border-box;
//         }

//         .sm-add-modal {
//           width:
//             min(
//               560px,
//               calc(
//                 100vw - 40px
//               )
//             );

//           max-height:
//             calc(
//               100vh - 40px
//             );

//           overflow-y: auto;
//           overflow-x: hidden;

//           padding: 22px;

//           background: #ffffff;

//           border:
//             1px solid #e5e7eb;

//           border-radius: 16px;

//           box-shadow:
//             0 24px 70px
//             rgba(
//               15,
//               23,
//               42,
//               0.28
//             );

//           box-sizing: border-box;
//         }

//         .sm-add-modal h3 {
//           margin: 0 0 16px;
//           color: #111827;
//         }

//         .sm-add-modal label {
//           display: block;

//           margin: 12px 0 6px;

//           font-size: 13px;
//           font-weight: 700;

//           color: #374151;
//         }

//         .sm-add-modal select,
//         .sm-add-modal input {
//           width: 100%;

//           box-sizing: border-box;

//           padding: 10px 12px;

//           border:
//             1px solid #cbd5e1;

//           border-radius: 8px;

//           background: #ffffff;

//           font-size: 14px;
//         }

//         .sm-add-modal select:focus,
//         .sm-add-modal input:focus {
//           outline: none;

//           border-color: #4f46e5;

//           box-shadow:
//             0 0 0 3px
//             rgba(
//               79,
//               70,
//               229,
//               0.1
//             );
//         }

//         .sm-add-actions {
//           margin-top: 20px;

//           display: flex;
//           justify-content: flex-end;

//           gap: 10px;
//         }

//         .sm-add-cancel,
//         .sm-add-submit {
//           border: none;
//           border-radius: 8px;

//           padding: 9px 18px;

//           font-size: 13px;
//           font-weight: 700;

//           cursor: pointer;
//         }

//         .sm-add-cancel {
//           background: #f1f5f9;
//           color: #334155;
//         }

//         .sm-add-submit {
//           background: #2563eb;
//           color: #ffffff;
//         }

//         .link-btn {
//           margin-top: 6px;

//           border: none;

//           background: transparent;
//           color: #2563eb;

//           font-size: 12px;
//           font-weight: 600;

//           cursor: pointer;
//         }


//         /* =========================
//            DELETE MODAL
//         ========================= */

//         .smf-modal-overlay {
//           position: fixed;
//           inset: 0;

//           z-index: 5100;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           padding: 18px;

//           background:
//             rgba(
//               15,
//               23,
//               42,
//               0.48
//             );
//         }

//         .smf-delete-card {
//           width:
//             min(
//               520px,
//               94vw
//             );

//           max-height: 90vh;

//           overflow-y: auto;

//           background: #ffffff;

//           border:
//             1px solid #e5e7eb;

//           border-radius: 18px;

//           box-shadow:
//             0 24px 80px
//             rgba(
//               15,
//               23,
//               42,
//               0.35
//             );
//         }

//         .smf-delete-card-header {
//           display: flex;
//           align-items: center;

//           gap: 12px;

//           padding: 18px 20px;

//           background: #fff1f2;

//           border-bottom:
//             1px solid #fecdd3;
//         }

//         .smf-delete-icon {
//           width: 38px;
//           height: 38px;

//           flex: 0 0 auto;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           background: #dc2626;
//           color: #ffffff;

//           border-radius: 50%;
//         }

//         .smf-delete-title {
//           margin: 0;

//           color: #9f1239;

//           font-size: 17px;
//           font-weight: 800;
//         }

//         .smf-delete-subtitle {
//           margin: 3px 0 0;

//           color: #9f1239;

//           font-size: 13px;
//         }

//         .smf-delete-card-body {
//           padding: 18px 20px;
//         }

//         .smf-delete-list {
//           margin-top: 12px;

//           max-height: 260px;

//           overflow-y: auto;

//           background: #f9fafb;

//           border:
//             1px solid #e5e7eb;

//           border-radius: 12px;
//         }

//         .smf-delete-list-item {
//           padding: 10px 12px;

//           border-bottom:
//             1px solid #e5e7eb;
//         }

//         .smf-delete-list-item:last-child {
//           border-bottom: none;
//         }

//         .smf-delete-category {
//           color: #111827;

//           font-size: 13px;
//           font-weight: 800;
//         }

//         .smf-delete-subskill {
//           margin-top: 2px;

//           color: #374151;

//           font-size: 13px;
//         }

//         .smf-delete-card-footer {
//           display: flex;
//           justify-content: flex-end;

//           gap: 10px;

//           padding:
//             14px 20px
//             18px;

//           border-top:
//             1px solid #f1f5f9;
//         }

//         .smf-modal-cancel,
//         .smf-modal-delete {
//           border: none;
//           border-radius: 999px;

//           padding: 8px 18px;

//           font-size: 13px;
//           font-weight: 700;

//           cursor: pointer;
//         }

//         .smf-modal-cancel {
//           background: #f3f4f6;
//           color: #374151;
//         }

//         .smf-modal-delete {
//           background: #dc2626;
//           color: #ffffff;
//         }


//         /* =========================
//            TOAST
//         ========================= */

//         .smf-toast {
//           position: fixed;

//           left: 50%;
//           bottom: 24px;

//           transform:
//             translateX(-50%);

//           z-index: 6000;

//           max-width: 90vw;

//           padding: 10px 18px;

//           color: #ffffff;

//           border-radius: 999px;

//           font-size: 13px;
//           font-weight: 700;

//           box-shadow:
//             0 10px 30px
//             rgba(
//               0,
//               0,
//               0,
//               0.25
//             );
//         }

//         .smf-toast.error {
//           background: #dc2626;
//         }

//         .smf-toast.success {
//           background: #16a34a;
//         }


//         /* =========================
//            MOBILE
//         ========================= */

//         @media (
//           max-width: 600px
//         ) {
//           .smf-toolbar-row {
//             align-items: flex-start;
//           }

//           .smf-toolbar-left,
//           .smf-toolbar-right {
//             width: 100%;
//           }

//           .sm-add-overlay {
//             align-items: flex-start;

//             padding: 12px;
//           }

//           .sm-add-modal {
//             width: 100%;

//             max-height:
//               calc(
//                 100vh - 24px
//               );

//             margin-top: 10px;

//             padding: 16px;

//             border-radius: 12px;
//           }

//           .sm-add-actions {
//             flex-direction:
//               column-reverse;
//           }

//           .sm-add-actions button {
//             width: 100%;
//           }
//         }

//       `}</style>

//       {/* ACCESS ERROR */}

//       {metaError && (
//         <div
//           style={{
//             background: "#fef3c7",
//             color: "#92400e",
//             padding: "8px 14px",
//             fontSize: "12.5px",
//             borderRadius: "10px",
//             marginBottom: "10px",
//             border:
//               "1px solid #fde68a",
//           }}
//         >
//           Could not load your
//           discipline access.
//           Please log out and log
//           in again.
//         </div>
//       )}

//       {/* FILTERS */}

//       <div className="sticky-filters">
//         <Filters
//           filters={filters}
//           setFilters={setFilters}
//           onExportExcel={
//             exportToExcel
//           }
//           onExportPDF={
//             exportToPDF
//           }
//           canExport={
//             filteredMatrixData.length >
//             0
//           }
//           disciplineOptions={
//             disciplineOptions
//           }
//           isDisciplineLocked={
//             isDisciplineLocked
//           }
//           skillOptions={
//             skillOptions
//           }
//         />
//       </div>

//       {/* TOOLBAR */}

//       <div className="smf-toolbar-row">
//         <div className="smf-toolbar-left">

//           <button
//             className="btn-edit"
//             onClick={() => {
//               if (!isEditMode) {
//                 startEditMode();
//               }
//             }}
//             disabled={
//               actionBusy ||
//               !filters.discipline ||
//               !filters.role
//             }
//             type="button"
//           >
//             ✏ Edit
//           </button>

//           <button
//             className="btn-edit"
//             onClick={
//               openAddModal
//             }
//             disabled={
//               actionBusy ||
//               !filters.discipline ||
//               !filters.role
//             }
//             type="button"
//           >
//             ➕ Add Row
//           </button>

//           <button
//             className="smf-refresh-btn"
//             onClick={
//               handleRefresh
//             }
//             disabled={
//               actionBusy ||
//               refreshLoading ||
//               !filters.discipline ||
//               !filters.role
//             }
//             type="button"
//           >
//             {refreshLoading
//               ? "⟳ Refreshing..."
//               : "⟳ Refresh"}
//           </button>

//           {isEditMode && (
//             <>
//               <button
//                 className="btn-save"
//                 onClick={
//                   saveChanges
//                 }
//                 disabled={
//                   actionBusy
//                 }
//                 type="button"
//               >
//                 💾 Save
//               </button>

//               <button
//                 className="btn-edit"
//                 onClick={
//                   cancelEdit
//                 }
//                 disabled={
//                   actionBusy
//                 }
//                 type="button"
//               >
//                 ✖ Cancel
//               </button>
//             </>
//           )}
//         </div>

//         {isEditMode && (
//           <div className="smf-toolbar-right">

//             {selectedCount >
//               0 && (
//               <span className="smf-selected-pill">
//                 {selectedCount}{" "}
//                 selected
//               </span>
//             )}

//             <button
//               className="smf-clear-btn"
//               onClick={
//                 clearSelectedRows
//               }
//               disabled={
//                 actionBusy ||
//                 selectedCount ===
//                   0
//               }
//               type="button"
//             >
//               Clear
//             </button>

//             <button
//               className="smf-danger-btn"
//               onClick={
//                 requestDeleteSelectedRows
//               }
//               disabled={
//                 actionBusy ||
//                 selectedCount ===
//                   0
//               }
//               type="button"
//             >
//               🗑 Delete Selected
//             </button>

//           </div>
//         )}
//       </div>

//       {/* MATRIX */}

//       <div className="table-hover-wrapper">

//         <div className="table-responsive">

//           {initialLoading &&
//           matrixData.length ===
//             0 ? (
//             <div className="smf-loading-state">
//               <span className="smf-loading-spinner" />

//               Loading matrix...
//             </div>
//           ) : (
//             <SkillTable
//               data={
//                 filteredMatrixData
//               }

//               role={
//                 filters.role
//               }

//               selectedLevel={
//                 filters.level
//               }

//               editable={
//                 isEditMode
//               }

//               editedValues={
//                 editedValues
//               }

//               selectedRows={
//                 selectedRows
//               }

//               onToggleRow={
//                 toggleSelectedRow
//               }

//               onToggleCategory={
//                 toggleCategoryRows
//               }

//               onEdit={(
//                 key,
//                 value
//               ) =>
//                 setEditedValues(
//                   (previous) => ({
//                     ...previous,
//                     [key]:
//                       value,
//                   })
//                 )
//               }

//               onDeleteRow={
//                 requestDeleteRow
//               }
//             />
//           )}

//         </div>

//         <div className="hover-legend">
//           <span className="legend-title">
//             Proficiency Scale
//           </span>

//           <span className="legend-pill l1">
//             NA - Not Applicable
//           </span>

//           <span className="legend-pill l2">
//             1 - Familiar
//           </span>

//           <span className="legend-pill l3">
//             2 - Working Level
//           </span>

//           <span className="legend-pill l4">
//             3 - Extensive
//           </span>

//           <span className="legend-pill l5">
//             4 - Authoritative
//           </span>
//         </div>
//       </div>

//       {/* ADD ROW MODAL */}

//       {showAddRow && (
//         <div className="sm-add-overlay">

//           <div className="sm-add-modal">

//             <h3>
//               Add Skill / Subskill
//             </h3>

//             {/* Discipline */}

//             <label>
//               Discipline
//             </label>

//             <select
//               value={
//                 form.discipline
//               }
//               onChange={(
//                 event
//               ) => {
//                 const discipline =
//                   event.target
//                     .value;

//                 const role =
//                   DISCIPLINE_ROLE_MAP[
//                     discipline
//                   ] || "";

//                 setForm(
//                   (previous) => ({
//                     ...previous,

//                     discipline,

//                     role,

//                     skill: "",

//                     subskill:
//                       "",

//                     isNewSkill:
//                       false,

//                     isNewSubskill:
//                       false,
//                   })
//                 );
//               }}
//               disabled={
//                 actionBusy
//               }
//             >
//               <option value="">
//                 Select
//                 Discipline
//               </option>

//               {disciplineOptions.map(
//                 (discipline) => (
//                   <option
//                     key={
//                       discipline
//                     }
//                     value={
//                       discipline
//                     }
//                   >
//                     {
//                       discipline
//                     }
//                   </option>
//                 )
//               )}
//             </select>

//             {/* Role */}

//             <label>
//               Role
//             </label>

//             <select
//               value={
//                 form.role
//               }
//               onChange={(
//                 event
//               ) =>
//                 setForm(
//                   (previous) => ({
//                     ...previous,

//                     role:
//                       event
//                         .target
//                         .value,

//                     skill: "",

//                     subskill:
//                       "",

//                     isNewSkill:
//                       false,

//                     isNewSubskill:
//                       false,
//                   })
//                 )
//               }
//               disabled={
//                 actionBusy
//               }
//             >
//               <option value="">
//                 Select Role
//               </option>

//               {roleOptions.map(
//                 (role) => (
//                   <option
//                     key={role}
//                     value={role}
//                   >
//                     {role}
//                   </option>
//                 )
//               )}
//             </select>

//             {/* Skill Category */}

//             <label>
//               Skill Category
//             </label>

//             {!form.isNewSkill ? (
//               <select
//                 value={
//                   form.skill
//                 }
//                 disabled={
//                   actionBusy
//                 }
//                 onChange={(
//                   event
//                 ) => {
//                   const value =
//                     event
//                       .target
//                       .value;

//                   if (
//                     value ===
//                     "__new__"
//                   ) {
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         isNewSkill:
//                           true,

//                         skill: "",

//                         subskill:
//                           "",

//                         isNewSubskill:
//                           false,
//                       })
//                     );

//                     return;
//                   }

//                   setForm(
//                     (
//                       previous
//                     ) => ({
//                       ...previous,

//                       skill:
//                         value,

//                       subskill:
//                         "",

//                       isNewSubskill:
//                         false,
//                     })
//                   );
//                 }}
//               >
//                 <option value="">
//                   Select
//                   Category
//                 </option>

//                 {modalSkillOptions.map(
//                   (
//                     category
//                   ) => (
//                     <option
//                       key={
//                         category
//                       }
//                       value={
//                         category
//                       }
//                     >
//                       {
//                         category
//                       }
//                     </option>
//                   )
//                 )}

//                 <option value="__new__">
//                   + Create new
//                   category
//                 </option>
//               </select>
//             ) : (
//               <>
//                 <input
//                   placeholder="Enter new category"
//                   value={
//                     form.skill
//                   }
//                   onChange={(
//                     event
//                   ) =>
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         skill:
//                           event
//                             .target
//                             .value,
//                       })
//                     )
//                   }
//                   disabled={
//                     actionBusy
//                   }
//                 />

//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() =>
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         isNewSkill:
//                           false,

//                         skill: "",

//                         subskill:
//                           "",
//                       })
//                     )
//                   }
//                 >
//                   Use existing
//                   category
//                 </button>
//               </>
//             )}

//             {/* Subskill */}

//             <label>
//               Subskill
//             </label>

//             {form.isNewSkill ? (
//               <input
//                 placeholder="Enter new subskill"
//                 value={
//                   form.subskill
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setForm(
//                     (
//                       previous
//                     ) => ({
//                       ...previous,

//                       subskill:
//                         event
//                           .target
//                           .value,
//                     })
//                   )
//                 }
//                 disabled={
//                   actionBusy
//                 }
//               />
//             ) : !form.isNewSubskill ? (
//               <select
//                 value={
//                   form.subskill
//                 }
//                 disabled={
//                   !form.skill ||
//                   actionBusy
//                 }
//                 onChange={(
//                   event
//                 ) => {
//                   const value =
//                     event
//                       .target
//                       .value;

//                   if (
//                     value ===
//                     "__new__"
//                   ) {
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         isNewSubskill:
//                           true,

//                         subskill:
//                           "",
//                       })
//                     );

//                     return;
//                   }

//                   setForm(
//                     (
//                       previous
//                     ) => ({
//                       ...previous,

//                       subskill:
//                         value,
//                     })
//                   );
//                 }}
//               >
//                 <option value="">
//                   Select
//                   Subskill
//                 </option>

//                 {modalSubskillOptions.map(
//                   (
//                     subskill
//                   ) => (
//                     <option
//                       key={
//                         subskill
//                       }
//                       value={
//                         subskill
//                       }
//                     >
//                       {
//                         subskill
//                       }
//                     </option>
//                   )
//                 )}

//                 <option value="__new__">
//                   + Create new
//                   subskill
//                 </option>
//               </select>
//             ) : (
//               <>
//                 <input
//                   placeholder="Enter new subskill"
//                   value={
//                     form.subskill
//                   }
//                   onChange={(
//                     event
//                   ) =>
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         subskill:
//                           event
//                             .target
//                             .value,
//                       })
//                     )
//                   }
//                   disabled={
//                     actionBusy
//                   }
//                 />

//                 <button
//                   type="button"
//                   className="link-btn"
//                   onClick={() =>
//                     setForm(
//                       (
//                         previous
//                       ) => ({
//                         ...previous,

//                         isNewSubskill:
//                           false,

//                         subskill:
//                           "",
//                       })
//                     )
//                   }
//                 >
//                   Use existing
//                   subskill
//                 </button>
//               </>
//             )}

//             {/* Buttons */}

//             <div className="sm-add-actions">

//               <button
//                 className="sm-add-cancel"
//                 onClick={() =>
//                   setShowAddRow(
//                     false
//                   )
//                 }
//                 disabled={
//                   actionBusy
//                 }
//                 type="button"
//               >
//                 Cancel
//               </button>

//               <button
//                 className="sm-add-submit"
//                 onClick={
//                   handleAddRow
//                 }
//                 disabled={
//                   actionBusy
//                 }
//                 type="button"
//               >
//                 {actionBusy
//                   ? "Adding..."
//                   : "Add & Save"}
//               </button>

//             </div>

//           </div>
//         </div>
//       )}

//       {/* DELETE CONFIRM */}

//       {confirmDelete && (
//         <div className="smf-modal-overlay">

//           <div className="smf-delete-card">

//             <div className="smf-delete-card-header">

//               <div className="smf-delete-icon">
//                 🗑
//               </div>

//               <div>
//                 <h3 className="smf-delete-title">
//                   Confirm
//                   Delete
//                 </h3>

//                 <p className="smf-delete-subtitle">
//                   Selected
//                   subskills will
//                   be deleted and
//                   saved
//                   immediately.
//                 </p>
//               </div>

//             </div>

//             <div className="smf-delete-card-body">

//               <div>
//                 Delete{" "}
//                 <strong>
//                   {
//                     confirmDelete
//                       .rows
//                       .length
//                   }
//                 </strong>{" "}
//                 subskill
//                 {confirmDelete
//                   .rows
//                   .length > 1
//                   ? "s"
//                   : ""}
//                 ?
//               </div>

//               <div className="smf-delete-list">

//                 {confirmDelete.rows.map(
//                   (row) => (
//                     <div
//                       className="smf-delete-list-item"

//                       key={rowKey(
//                         row.category,
//                         row.subskillName
//                       )}
//                     >
//                       <div className="smf-delete-category">
//                         {
//                           row.category
//                         }
//                       </div>

//                       <div className="smf-delete-subskill">
//                         {
//                           row.subskillName
//                         }
//                       </div>
//                     </div>
//                   )
//                 )}

//               </div>

//             </div>

//             <div className="smf-delete-card-footer">

//               <button
//                 type="button"
//                 className="smf-modal-cancel"

//                 onClick={() =>
//                   setConfirmDelete(
//                     null
//                   )
//                 }

//                 disabled={
//                   actionBusy
//                 }
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 className="smf-modal-delete"

//                 onClick={
//                   confirmDeleteRows
//                 }

//                 disabled={
//                   actionBusy
//                 }
//               >
//                 {actionBusy
//                   ? "Deleting..."
//                   : "Delete & Save"}
//               </button>

//             </div>

//           </div>
//         </div>
//       )}

//       {/* TOAST */}

//       {toast && (
//         <div
//           className={`smf-toast ${toast.tone}`}
//         >
//           {toast.message}
//         </div>
//       )}

//     </div>
//   );
// }


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Filters from "../components/Filters";
import SkillTable from "../components/SkillTable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   CONSTANTS
========================================================= */

const ROLE_LEVELS = {
  Engineer: [
    "L7",
    "L8",
    "L9",
    "L10",
    "L11",
    "L12",
    "L13",
    "L14",
    "L15",
    "L16",
    "L17",
  ],

  Designer: [
    "L5",
    "L6",
    "L7",
    "L8",
    "L9",
    "L10",
    "L11",
    "L12",
    "L13",
    "L14",
    "L15",
  ],
};

const DISCIPLINE_ROLE_MAP = {
  "Project Management": "Engineer",
  "Piping Engineering": "Engineer",
  Mechanical: "Engineer",
  CSA: "Engineer",
  "Piping Design": "Engineer",
  Electrical: "Engineer",
  Instrumentation: "Engineer",
  Process: "Engineer",
};
const FROZEN_ROLE_DISCIPLINES = [
  "Project Management",
  "Piping Engineering",
  "Mechanical",
];
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://skill-matrix-api-aye4fhfqddhtb0bp.northcentralus-01.azurewebsites.net";

const API_SKILL = `${API_BASE}/api/skill-matrix`;

/* =========================================================
   HELPERS
========================================================= */

const norm = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const keyOfText = (value) => norm(value).toLowerCase();

function rowKey(category, subskillName) {
  return `${norm(category)}|${norm(subskillName)}`;
}

function rowKeyLower(category, subskillName) {
  return rowKey(category, subskillName).toLowerCase();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function transformApiToMatrix(rows, roleLevels) {
  const groups = {};

  (rows || []).forEach((row) => {
    const category = norm(row.Skill || row.category);
    const subskill = norm(row.Subskill || row.skill_name);
    const level = norm(row.LevelKey || row.level);

    const value =
      row.Value ??
      row.proficiency ??
      "NA";

    const sortOrder = Number(
      row.SortOrder ??
        row.sort_order ??
        999999
    );

    if (!category || !subskill || !level) {
      return;
    }

    const categoryKey = keyOfText(category);

    if (!groups[categoryKey]) {
      groups[categoryKey] = {
        category,
        skills: [],
      };
    }

    let skillObject =
      groups[categoryKey].skills.find(
        (skill) =>
          keyOfText(skill.name) ===
          keyOfText(subskill)
      );

    if (!skillObject) {
      skillObject = {
        name: subskill,
        sortOrder,
        levels: {},
      };

      groups[categoryKey].skills.push(
        skillObject
      );
    }

    if (
      sortOrder <
      Number(skillObject.sortOrder ?? 999999)
    ) {
      skillObject.sortOrder = sortOrder;
    }

    skillObject.levels[level] = String(value);
  });

  Object.values(groups).forEach((group) => {
    group.skills.sort((a, b) => {
      const aOrder = Number(
        a.sortOrder ?? 999999
      );

      const bOrder = Number(
        b.sortOrder ?? 999999
      );

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return String(a.name).localeCompare(
        String(b.name)
      );
    });

    group.skills.forEach((skill) => {
      roleLevels.forEach((level) => {
        if (
          skill.levels[level] === undefined ||
          skill.levels[level] === null ||
          skill.levels[level] === ""
        ) {
          skill.levels[level] = "NA";
        }
      });
    });
  });

  return Object.values(groups);
}

function filterOutDeletedRows(
  base,
  deletedKeySet
) {
  if (
    !deletedKeySet ||
    deletedKeySet.size === 0
  ) {
    return base;
  }

  return (base || [])
    .map((group) => ({
      ...group,

      skills: (group.skills || []).filter(
        (skill) => {
          const key = rowKeyLower(
            group.category,
            skill.name
          );

          return !deletedKeySet.has(key);
        }
      ),
    }))
    .filter(
      (group) =>
        (group.skills || []).length > 0
    );
}

function removeRowsLocally(
  base,
  rowsToRemove
) {
  const removeSet = new Set(
    rowsToRemove.map((row) =>
      rowKeyLower(
        row.category,
        row.subskillName
      )
    )
  );

  return (base || [])
    .map((group) => ({
      ...group,

      skills: (group.skills || []).filter(
        (skill) => {
          const key = rowKeyLower(
            group.category,
            skill.name
          );

          return !removeSet.has(key);
        }
      ),
    }))
    .filter(
      (group) =>
        (group.skills || []).length > 0
    );
}

function applyEditsLocally(
  base,
  edits
) {
  return (base || []).map((group) => ({
    ...group,

    skills: (group.skills || []).map(
      (skill) => {
        const levels = {
          ...(skill.levels || {}),
        };

        let changed = false;

        Object.entries(edits || {}).forEach(
          ([key, value]) => {
            const [category, subskill, level] =
              key.split("|");

            if (
              keyOfText(category) ===
                keyOfText(group.category) &&
              keyOfText(subskill) ===
                keyOfText(skill.name)
            ) {
              levels[level] = value;
              changed = true;
            }
          }
        );

        if (!changed) {
          return skill;
        }

        return {
          ...skill,
          levels,
        };
      }
    ),
  }));
}

function buildExportRows(
  matrixData,
  role,
  selectedLevel
) {
  const allLevels =
    ROLE_LEVELS[role] || [];

  const levels = selectedLevel
    ? [selectedLevel]
    : allLevels;

  const rows = [];

  (matrixData || []).forEach((group) => {
    (group.skills || []).forEach(
      (skill) => {
        const row = {
          Skill: group.category,
          Subskill: skill.name,
        };

        levels.forEach((level) => {
          row[level] =
            skill.levels?.[level] ??
            "NA";
        });

        rows.push(row);
      }
    );
  });

  return rows;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function SkillMatrix({
  allowedDisciplines = [],
}) {
  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */

  const [filters, setFilters] = useState({
    discipline: "",
    role: "",
    level: "",
    skillSearch: "",
  });

  const [matrixData, setMatrixData] =
    useState([]);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(false);

  const [
    refreshLoading,
    setRefreshLoading,
  ] = useState(false);

  const [
    isEditMode,
    setIsEditMode,
  ] = useState(false);

  const [
    editedValues,
    setEditedValues,
  ] = useState({});

  const [
    selectedRows,
    setSelectedRows,
  ] = useState([]);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(null);

  const [
    actionBusy,
    setActionBusy,
  ] = useState(false);

  const [
    showAddRow,
    setShowAddRow,
  ] = useState(false);

  const [toast, setToast] =
    useState(null);

  const [metaError, setMetaError] =
    useState(false);

  const [meta, setMeta] = useState({
    disciplines: [],
    roles: [
      "Engineer",
      "Designer",
    ],
    allowedDisciplines: [],
  });

  const [form, setForm] = useState({
    discipline: "",
    role: "",
    skill: "",
    subskill: "",
    isNewSkill: false,
    isNewSubskill: false,
  });

  /* ---------------------------------------------------------
     REFS
  --------------------------------------------------------- */

  const toastTimerRef =
    useRef(null);

  const deletedRowKeysRef =
    useRef(new Set());

  const matrixLoadedRef =
    useRef(false);

  const fetchAbortRef =
    useRef(null);

  const fetchMatrixRef =
    useRef(null);

  const suppressRealtimeUntilRef =
    useRef(0);

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */

  const showToast = useCallback(
    (
      message,
      tone = "error"
    ) => {
      setToast({
        message,
        tone,
      });

      if (toastTimerRef.current) {
        clearTimeout(
          toastTimerRef.current
        );
      }

      toastTimerRef.current =
        setTimeout(() => {
          setToast(null);
        }, 3500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(
          toastTimerRef.current
        );
      }

      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
    };
  }, []);

  /* ---------------------------------------------------------
     ACCESS / META
  --------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const response = await fetch(
          `${API_SKILL}/meta?t=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        const data =
          await safeJson(response);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Meta request failed with status ${response.status}`
          );
        }

        if (cancelled) {
          return;
        }

        const disciplines =
          Array.isArray(
            data?.disciplines
          )
            ? data.disciplines
                .map(norm)
                .filter(Boolean)
            : [];

        const backendAllowed =
          Array.isArray(
            data?.allowedDisciplines
          )
            ? data.allowedDisciplines
                .map(norm)
                .filter(Boolean)
            : [];

        const roles =
          Array.isArray(data?.roles) &&
          data.roles.length
            ? data.roles
            : [
                "Engineer",
                "Designer",
              ];

        setMeta({
          disciplines,
          roles,
          allowedDisciplines:
            backendAllowed,
        });

        setMetaError(false);
      } catch (error) {
        console.error(
          "META LOAD FAILED:",
          error
        );

        if (!cancelled) {
          setMeta({
            disciplines: [],
            roles: [
              "Engineer",
              "Designer",
            ],
            allowedDisciplines: [],
          });

          setMetaError(true);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------
     DISCIPLINE OPTIONS
  --------------------------------------------------------- */

  const effectiveAllowedDisciplines =
    useMemo(() => {
      if (
        Array.isArray(
          meta.allowedDisciplines
        ) &&
        meta.allowedDisciplines.length > 0
      ) {
        return meta.allowedDisciplines
          .map(norm)
          .filter(Boolean);
      }

      return Array.isArray(
        allowedDisciplines
      )
        ? allowedDisciplines
            .map(norm)
            .filter(Boolean)
        : [];
    }, [
      meta.allowedDisciplines,
      allowedDisciplines,
    ]);

  const disciplineOptions =
    useMemo(() => {
      const hasAll =
        effectiveAllowedDisciplines.some(
          (item) => {
            const value =
              keyOfText(item);

            return (
              value === "all" ||
              value ===
                "all disciplines"
            );
          }
        );

      if (hasAll) {
        return Array.isArray(
          meta.disciplines
        )
          ? meta.disciplines
          : [];
      }

      return effectiveAllowedDisciplines;
    }, [
      effectiveAllowedDisciplines,
      meta.disciplines,
    ]);

  const roleOptions =
    useMemo(() => {
      return meta.roles?.length
        ? meta.roles
        : [
            "Engineer",
            "Designer",
          ];
    }, [meta.roles]);

  const isDisciplineLocked =
    disciplineOptions.length === 1 &&
    ![
      "all",
      "all disciplines",
    ].includes(
      keyOfText(
        disciplineOptions[0]
      )
    );

  /* ---------------------------------------------------------
     AUTO SELECT SINGLE DISCIPLINE
  --------------------------------------------------------- */

  useEffect(() => {
    if (
      disciplineOptions.length !== 1
    ) {
      return;
    }

    const onlyDiscipline =
      disciplineOptions[0];

    if (
      !onlyDiscipline ||
      [
        "all",
        "all disciplines",
      ].includes(
        keyOfText(onlyDiscipline)
      )
    ) {
      return;
    }

    setFilters((previous) => {
      if (
        keyOfText(
          previous.discipline
        ) ===
        keyOfText(
          onlyDiscipline
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        discipline:
          onlyDiscipline,
      };
    });
  }, [disciplineOptions]);

  /* ---------------------------------------------------------
     DISCIPLINE CHANGE
  --------------------------------------------------------- */

  useEffect(() => {
    if (!filters.discipline) {
      setMatrixData([]);
      setSelectedRows([]);
      setEditedValues({});

      return;
    }

    const fixedRole =
      DISCIPLINE_ROLE_MAP[
        filters.discipline
      ] || "";

    setFilters((previous) => {
      if (
        previous.role === fixedRole &&
        previous.level === "" &&
        previous.skillSearch === ""
      ) {
        return previous;
      }

      return {
        ...previous,
        role: fixedRole,
        level: "",
        skillSearch: "",
      };
    });
  }, [filters.discipline]);

  /* ---------------------------------------------------------
     RESET LOCAL MATRIX GUARDS
  --------------------------------------------------------- */

  useEffect(() => {
    deletedRowKeysRef.current.clear();

    matrixLoadedRef.current = false;

    setSelectedRows([]);
    setEditedValues({});
    setConfirmDelete(null);
  }, [
    filters.discipline,
    filters.role,
  ]);

  /* ---------------------------------------------------------
     FETCH MATRIX
  --------------------------------------------------------- */

  const fetchMatrix = useCallback(
    async ({
      silent = false,
      forceServerTruth = false,
    } = {}) => {
      if (
        !filters.discipline ||
        !filters.role
      ) {
        setMatrixData([]);
        return;
      }

      /*
       * Cancel an older request if the
       * user rapidly changes discipline.
       */
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }

      const controller =
        new AbortController();

      fetchAbortRef.current =
        controller;

      const firstLoad =
        !matrixLoadedRef.current;

      if (
        firstLoad &&
        !silent
      ) {
        setInitialLoading(true);
      }

      try {
        const url =
          `${API_SKILL}` +
          `?discipline=${encodeURIComponent(
            filters.discipline
          )}` +
          `&role=${encodeURIComponent(
            filters.role
          )}` +
          `&t=${Date.now()}`;

        const response = await fetch(
          url,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal:
              controller.signal,
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        if (!response.ok) {
          const message =
            await safeText(
              response
            );

          throw new Error(
            message ||
              `Matrix request failed with ${response.status}`
          );
        }

        const data =
          await safeJson(response);

        const levels =
          ROLE_LEVELS[
            filters.role
          ] || [];

        const transformed =
          transformApiToMatrix(
            data || [],
            levels
          );

        /*
         * NOTE: previously, a "forceServerTruth" refresh
         * cleared deletedRowKeysRef and trusted the server
         * completely. That caused rows that had just been
         * deleted (but not yet fully committed/visible on
         * the backend) to reappear after clicking Refresh.
         *
         * We now always hide anything the user has already
         * deleted locally, even on a forced refresh. The
         * tombstone is only cleared when a row is explicitly
         * re-added (see handleAddRow) or when the component
         * is reset for a new discipline/role.
         */
        setMatrixData(
          filterOutDeletedRows(
            transformed,
            deletedRowKeysRef.current
          )
        );

        matrixLoadedRef.current =
          true;
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "MATRIX LOAD FAILED:",
          error
        );

        showToast(
          "Could not load the matrix.",
          "error"
        );
      } finally {
        if (
          fetchAbortRef.current ===
          controller
        ) {
          fetchAbortRef.current =
            null;
        }

        if (
          firstLoad &&
          !silent
        ) {
          setInitialLoading(
            false
          );
        }
      }
    },
    [
      filters.discipline,
      filters.role,
      showToast,
    ]
  );

  useEffect(() => {
    fetchMatrixRef.current =
      fetchMatrix;
  }, [fetchMatrix]);

  useEffect(() => {
    if (
      !filters.discipline ||
      !filters.role
    ) {
      return;
    }

    fetchMatrix();
  }, [
    fetchMatrix,
    filters.discipline,
    filters.role,
  ]);

  /* ---------------------------------------------------------
     REAL-TIME REFRESH
  --------------------------------------------------------- */

  useEffect(() => {
    if (
      !filters.discipline ||
      !filters.role
    ) {
      return;
    }

    const source =
      new EventSource(
        `${API_SKILL}/stream`,
        {
          withCredentials: true,
        }
      );

    source.onmessage = (
      event
    ) => {
      try {
        if (
          Date.now() <
          suppressRealtimeUntilRef.current
        ) {
          return;
        }

        const payload =
          JSON.parse(
            event.data
          );

        if (
          keyOfText(
            payload.discipline
          ) ===
            keyOfText(
              filters.discipline
            ) &&
          keyOfText(
            payload.role
          ) ===
            keyOfText(
              filters.role
            )
        ) {
          fetchMatrixRef.current?.({
            silent: true,
          });
        }
      } catch {
        // Ignore malformed events
      }
    };

    source.onerror = () => {
      // EventSource reconnects automatically.
    };

    return () => {
      source.close();
    };
  }, [
    filters.discipline,
    filters.role,
  ]);

  /* ---------------------------------------------------------
     MANUAL REFRESH
  --------------------------------------------------------- */

  const handleRefresh =
    useCallback(async () => {
      if (
        actionBusy ||
        refreshLoading ||
        !filters.discipline ||
        !filters.role
      ) {
        return;
      }

      setRefreshLoading(true);
      setSelectedRows([]);
      setEditedValues({});

      try {
        await fetchMatrix({
          silent: true,
          forceServerTruth: true,
        });

        showToast(
          "Latest changes loaded.",
          "success"
        );
      } finally {
        setRefreshLoading(false);
      }
    }, [
      actionBusy,
      refreshLoading,
      filters.discipline,
      filters.role,
      fetchMatrix,
      showToast,
    ]);

  /* ---------------------------------------------------------
     EDIT MODE
  --------------------------------------------------------- */

  function startEditMode() {
    setIsEditMode(true);
  }

  function cancelEdit() {
    setEditedValues({});
    setSelectedRows([]);
    setConfirmDelete(null);
    setIsEditMode(false);
  }

  /* ---------------------------------------------------------
     PROFICIENCY EDIT SAVE
  --------------------------------------------------------- */

  async function saveChanges() {
    if (actionBusy) {
      return;
    }

    const entries =
      Object.entries(
        editedValues || {}
      );

    if (!entries.length) {
      setIsEditMode(false);

      showToast(
        "No proficiency changes to save.",
        "success"
      );

      return;
    }

    const snapshot =
      matrixData;

    const optimistic =
      applyEditsLocally(
        matrixData,
        editedValues
      );

    /*
     * Reflect the save immediately: update the table,
     * leave edit mode, and confirm to the user right away
     * instead of waiting on the network round trip. This
     * means clicking "Edit" again straight after "Save"
     * shows the saved values, not the stale/unsaved ones.
     */
    setMatrixData(optimistic);

    const pendingEdits = {
      ...editedValues,
    };

    setEditedValues({});
    setIsEditMode(false);

    showToast(
      "Changes saved.",
      "success"
    );

    setActionBusy(true);

    try {
      const payload =
        Object.entries(
          pendingEdits
        ).map(
          ([key, value]) => {
            const [
              Skill,
              Subskill,
              LevelKey,
            ] = key.split("|");

            return {
              Discipline: norm(
                filters.discipline
              ),

              Role: norm(
                filters.role
              ),

              Skill: norm(Skill),

              Subskill:
                norm(Subskill),

              LevelKey:
                norm(LevelKey),

              Value: String(
                value ?? "NA"
              ),
            };
          }
        );

      suppressRealtimeUntilRef.current =
        Date.now() + 3000;

      const response =
        await fetch(
          `${API_SKILL}/save`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!response.ok) {
        const message =
          await safeText(
            response
          );

        throw new Error(
          message ||
            "Save failed"
        );
      }
    } catch (error) {
      console.error(
        "SAVE FAILED:",
        error
      );

      setMatrixData(snapshot);

      setEditedValues(
        pendingEdits
      );

      setIsEditMode(true);

      showToast(
        error.message ||
          "Save failed. Changes restored.",
        "error"
      );
    } finally {
      setActionBusy(false);
    }
  }

  /* ---------------------------------------------------------
     SELECTION
  --------------------------------------------------------- */

  function toggleSelectedRow(
    category,
    subskillName
  ) {
    const key = rowKey(
      category,
      subskillName
    );

    setSelectedRows(
      (previous) => {
        const exists =
          previous.some(
            (item) =>
              String(
                item
              ).toLowerCase() ===
              key.toLowerCase()
          );

        if (exists) {
          return previous.filter(
            (item) =>
              String(
                item
              ).toLowerCase() !==
              key.toLowerCase()
          );
        }

        return [
          ...previous,
          key,
        ];
      }
    );
  }

  function toggleCategoryRows(
    category,
    subskillNames
  ) {
    const keys = (
      subskillNames || []
    ).map((name) =>
      rowKey(category, name)
    );

    setSelectedRows(
      (previous) => {
        const previousLower =
          new Set(
            previous.map(
              (item) =>
                String(
                  item
                ).toLowerCase()
            )
          );

        const allSelected =
          keys.length > 0 &&
          keys.every((key) =>
            previousLower.has(
              key.toLowerCase()
            )
          );

        if (allSelected) {
          const removeSet =
            new Set(
              keys.map((key) =>
                key.toLowerCase()
              )
            );

          return previous.filter(
            (item) =>
              !removeSet.has(
                String(
                  item
                ).toLowerCase()
              )
          );
        }

        const result = [
          ...previous,
        ];

        keys.forEach((key) => {
          if (
            !previousLower.has(
              key.toLowerCase()
            )
          ) {
            result.push(key);
          }
        });

        return result;
      }
    );
  }

  function clearSelectedRows() {
    setSelectedRows([]);
    setConfirmDelete(null);
  }

  /* ---------------------------------------------------------
     DELETE REQUEST
  --------------------------------------------------------- */

  function requestDeleteRow(
    category,
    subskillName
  ) {
    setConfirmDelete({
      rows: [
        {
          category,
          subskillName,
        },
      ],
    });
  }

  function requestDeleteSelectedRows() {
    if (!selectedRows.length) {
      showToast(
        "Select at least one subskill.",
        "error"
      );

      return;
    }

    const rows =
      selectedRows
        .map((key) => {
          /*
           * Category/subskill fields in the current
           * data should be used where possible,
           * rather than assuming arbitrary "|" chars
           * never occur inside names.
           */
          for (
            const group of matrixData
          ) {
            for (
              const skill of
                group.skills || []
            ) {
              if (
                rowKeyLower(
                  group.category,
                  skill.name
                ) ===
                String(
                  key
                ).toLowerCase()
              ) {
                return {
                  category:
                    group.category,

                  subskillName:
                    skill.name,
                };
              }
            }
          }

          return null;
        })
        .filter(Boolean);

    if (!rows.length) {
      showToast(
        "No valid rows selected.",
        "error"
      );

      return;
    }

    setConfirmDelete({
      rows,
    });
  }

  /* ---------------------------------------------------------
     DELETE AND AUTO SAVE
  --------------------------------------------------------- */

  async function confirmDeleteRows() {
    if (
      actionBusy ||
      !confirmDelete?.rows?.length
    ) {
      return;
    }

    const rowsToDelete =
      confirmDelete.rows;

    const snapshot =
      matrixData;

    setConfirmDelete(null);
    setSelectedRows([]);

    rowsToDelete.forEach(
      (row) => {
        deletedRowKeysRef.current.add(
          rowKeyLower(
            row.category,
            row.subskillName
          )
        );
      }
    );

    /*
     * Instant visual delete, and drop out of edit
     * mode right away instead of making the user
     * press Save or Cancel afterwards just to get
     * back to the normal view. The delete is already
     * saved to the backend below.
     */
    setMatrixData(
      (previous) =>
        removeRowsLocally(
          previous,
          rowsToDelete
        )
    );

    setIsEditMode(false);

    showToast(
      rowsToDelete.length === 1
        ? "Deleted and saved."
        : `${rowsToDelete.length} subskills deleted and saved.`,
      "success"
    );

    setActionBusy(true);

    try {
      suppressRealtimeUntilRef.current =
        Date.now() + 3000;

      const response =
        await fetch(
          `${API_SKILL}/rows/delete`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              Discipline: norm(
                filters.discipline
              ),

              Role: norm(
                filters.role
              ),

              rows:
                rowsToDelete.map(
                  (row) => ({
                    Skill: norm(
                      row.category
                    ),

                    Subskill: norm(
                      row.subskillName
                    ),
                  })
                ),
            }),
          }
        );

      if (!response.ok) {
        const message =
          await safeText(
            response
          );

        throw new Error(
          message ||
            "Delete failed"
        );
      }

      /*
       * IMPORTANT:
       * No fetchMatrix here.
       *
       * The POST succeeded and the local table
       * already represents the desired state.
       * The tombstones added above (deletedRowKeysRef)
       * also make sure this row stays hidden even if the
       * user hits Refresh before the backend write is
       * fully visible on read.
       */
    } catch (error) {
      console.error(
        "DELETE FAILED:",
        error
      );

      rowsToDelete.forEach(
        (row) => {
          deletedRowKeysRef.current.delete(
            rowKeyLower(
              row.category,
              row.subskillName
            )
          );
        }
      );

      setMatrixData(snapshot);
      setIsEditMode(true);

      showToast(
        error.message ||
          "Delete failed. Table restored.",
        "error"
      );
    } finally {
      setActionBusy(false);
    }
  }

  /* ---------------------------------------------------------
     ADD ROW
  --------------------------------------------------------- */

  function openAddModal() {
    setForm({
      discipline:
        filters.discipline || "",

      role:
        filters.role || "",

      skill: "",
      subskill: "",

      isNewSkill: false,
      isNewSubskill: false,
    });

    setShowAddRow(true);
  }

  const modalSkillOptions =
    useMemo(() => {
      return (matrixData || [])
        .map(
          (group) =>
            group.category
        )
        .filter(Boolean);
    }, [matrixData]);

  const modalSubskillOptions =
    useMemo(() => {
      if (!form.skill) {
        return [];
      }

      const group =
        (matrixData || []).find(
          (item) =>
            keyOfText(
              item.category
            ) ===
            keyOfText(
              form.skill
            )
        );

      return (
        group?.skills || []
      )
        .map(
          (skill) =>
            skill.name
        )
        .filter(Boolean);
    }, [
      matrixData,
      form.skill,
    ]);

  async function handleAddRow() {
    if (actionBusy) {
      return;
    }

    const discipline = norm(
      form.discipline ||
        filters.discipline
    );

    const role = norm(
      form.role ||
        filters.role
    );

    let category =
      norm(form.skill);

    const subskill =
      norm(form.subskill);

    if (
      !discipline ||
      !role ||
      !category ||
      !subskill
    ) {
      showToast(
        "Fill Discipline, Role, Skill Category and Subskill.",
        "error"
      );

      return;
    }

    const existingCategory =
      (matrixData || []).find(
        (group) =>
          keyOfText(
            group.category
          ) ===
          keyOfText(category)
      );

    if (existingCategory) {
      category =
        existingCategory.category;
    }

    const duplicate =
      Boolean(
        existingCategory?.skills?.some(
          (skill) =>
            keyOfText(
              skill.name
            ) ===
            keyOfText(
              subskill
            )
        )
      );

    if (duplicate) {
      showToast(
        "This Skill and Subskill already exists.",
        "error"
      );

      return;
    }

    const levels =
      ROLE_LEVELS[role] || [];

    if (!levels.length) {
      showToast(
        "Invalid role.",
        "error"
      );

      return;
    }

    /*
     * Add ALL levels immediately.
     */
    const payload =
      levels.map((level) => ({
        Discipline:
          discipline,

        Role: role,

        Skill:
          category,

        Subskill:
          subskill,

        LevelKey:
          level,

        Value: "NA",
      }));

    const optimisticSkill = {
      name: subskill,

      sortOrder: 999999,

      levels:
        Object.fromEntries(
          levels.map(
            (level) => [
              level,
              "NA",
            ]
          )
        ),
    };

    const snapshot =
      matrixData;

    /*
     * Remove old delete tombstone if the
     * same row is intentionally added again.
     */
    deletedRowKeysRef.current.delete(
      rowKeyLower(
        category,
        subskill
      )
    );

    /*
     * Put new row on screen immediately.
     */
    setMatrixData(
      (previous) => {
        const exists =
          previous.some(
            (group) =>
              keyOfText(
                group.category
              ) ===
              keyOfText(
                category
              )
          );

        if (exists) {
          return previous.map(
            (group) => {
              if (
                keyOfText(
                  group.category
                ) !==
                keyOfText(
                  category
                )
              ) {
                return group;
              }

              return {
                ...group,

                skills: [
                  ...(group.skills ||
                    []),

                  optimisticSkill,
                ],
              };
            }
          );
        }

        return [
          ...previous,

          {
            category,

            skills: [
              optimisticSkill,
            ],
          },
        ];
      }
    );

    setShowAddRow(false);

    showToast(
      "Skill added and saved.",
      "success"
    );

    setActionBusy(true);

    try {
      suppressRealtimeUntilRef.current =
        Date.now() + 3000;

      const response =
        await fetch(
          `${API_SKILL}/save`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!response.ok) {
        const message =
          await safeText(
            response
          );

        throw new Error(
          message ||
            "Add failed"
        );
      }

      /*
       * Do NOT refetch.
       * UI already contains the new row.
       */
    } catch (error) {
      console.error(
        "ADD FAILED:",
        error
      );

      setMatrixData(snapshot);

      showToast(
        error.message ||
          "Add failed.",
        "error"
      );
    } finally {
      setActionBusy(false);
    }
  }

  /* ---------------------------------------------------------
     SEARCH OPTIONS
  --------------------------------------------------------- */

  const skillOptions =
    useMemo(() => {
      const options = [];

      (matrixData || []).forEach(
        (group) => {
          if (group.category) {
            options.push(
              group.category
            );
          }

          (group.skills || []).forEach(
            (skill) => {
              if (skill.name) {
                options.push(
                  skill.name
                );
              }
            }
          );
        }
      );

      return [
        ...new Set(options),
      ];
    }, [matrixData]);

  /* ---------------------------------------------------------
     FILTER TABLE
  --------------------------------------------------------- */

  const filteredMatrixData =
    useMemo(() => {
      const query =
        keyOfText(
          filters.skillSearch
        );

      if (!query) {
        return matrixData;
      }

      return (matrixData || [])
        .map((group) => {
          const categoryMatch =
            keyOfText(
              group.category
            ).includes(query);

          if (categoryMatch) {
            return group;
          }

          const matchingSkills =
            (
              group.skills || []
            ).filter(
              (skill) =>
                keyOfText(
                  skill.name
                ).includes(query)
            );

          if (
            !matchingSkills.length
          ) {
            return null;
          }

          return {
            ...group,

            skills:
              matchingSkills,
          };
        })
        .filter(Boolean);
    }, [
      matrixData,
      filters.skillSearch,
    ]);

  /* ---------------------------------------------------------
     EXCEL EXPORT
  --------------------------------------------------------- */

  function exportToExcel() {
    if (
      !filteredMatrixData.length
    ) {
      showToast(
        "No data to export.",
        "error"
      );

      return;
    }

    const rows =
      buildExportRows(
        filteredMatrixData,
        filters.role,
        filters.level
      );

    const levelPart =
      filters.level
        ? `_${filters.level}`
        : "_ALLLEVELS";

    const headerRows = [
      ["Project Meridian Export"],
      [],
      [
        "Discipline",
        filters.discipline ||
          "-",
      ],
      [
        "Role",
        filters.role || "-",
      ],
      [
        "Level",
        filters.level ||
          "All levels",
      ],
      [],
      [
        "Proficiency",
        "Meaning",
      ],
      [
        "NA",
        "Not Applicable",
      ],
      ["1", "Familiar"],
      [
        "2",
        "Working Level",
      ],
      ["3", "Extensive"],
      [
        "4",
        "Authoritative",
      ],
      [],
    ];

    const tableHeader =
      Object.keys(
        rows[0] || {
          Skill: "",
          Subskill: "",
        }
      );

    const tableData =
      rows.map((row) =>
        tableHeader.map(
          (header) =>
            row[header]
        )
      );

    const worksheet =
      XLSX.utils.aoa_to_sheet([
        ...headerRows,
        tableHeader,
        ...tableData,
      ]);

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 28 },

      ...tableHeader
        .slice(2)
        .map(() => ({
          wch: 10,
        })),
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Project Meridian"
    );

    const buffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

    saveAs(
      new Blob([buffer], {
        type: "application/octet-stream",
      }),

      `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.xlsx`
    );
  }

  /* ---------------------------------------------------------
     PDF EXPORT
  --------------------------------------------------------- */

  function exportToPDF() {
    if (
      !filteredMatrixData.length
    ) {
      showToast(
        "No data to export.",
        "error"
      );

      return;
    }

    const levelPart =
      filters.level
        ? `_${filters.level}`
        : "_ALLLEVELS";

    const document =
      new jsPDF("landscape");

    document.setFontSize(16);

    document.text(
      "Project Meridian",
      14,
      12
    );

    document.setFontSize(10);

    document.text(
      `Discipline: ${
        filters.discipline ||
        "-"
      }`,
      14,
      18
    );

    document.text(
      `Role: ${
        filters.role || "-"
      }`,
      14,
      23
    );

    document.text(
      `Level: ${
        filters.level ||
        "All levels"
      }`,
      14,
      28
    );

    autoTable(document, {
      startY: 32,

      head: [
        [
          "Proficiency",
          "Meaning",
        ],
      ],

      body: [
        [
          "NA",
          "Not Applicable",
        ],
        ["1", "Familiar"],
        [
          "2",
          "Working Level",
        ],
        [
          "3",
          "Extensive",
        ],
        [
          "4",
          "Authoritative",
        ],
      ],

      styles: {
        fontSize: 9,
      },

      headStyles: {
        fillColor: [
          40,
          40,
          40,
        ],
      },

      theme: "grid",

      tableWidth: "wrap",
    });

    const rows =
      buildExportRows(
        filteredMatrixData,
        filters.role,
        filters.level
      );

    const columns =
      Object.keys(
        rows[0]
      ).map((key) => ({
        header: key,
        dataKey: key,
      }));

    autoTable(document, {
      startY:
        document.lastAutoTable
          .finalY + 6,

      columns,

      body: rows,

      headStyles: {
        fillColor: [
          40,
          40,
          40,
        ],
      },

      styles: {
        fontSize: 8,
      },

      theme: "grid",
    });

    document.save(
      `Skill_Matrix_${filters.discipline}_${filters.role}${levelPart}.pdf`
    );
  }

  const selectedCount =
    selectedRows.length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="page-container">
      <style>{`

        /* =========================
           FILTER BAR
        ========================= */

        .sticky-filters {
          position: sticky;
          top: 0;
          z-index: 30;

          background: #f8fafc;

          padding-top: 6px;
          padding-bottom: 6px;

          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
        }


        /* =========================
           TOOLBAR
        ========================= */

        .smf-toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 10px;

          margin: 10px 0 12px;

          flex-wrap: wrap;
        }

        .smf-toolbar-left,
        .smf-toolbar-right {
          display: flex;
          align-items: center;

          gap: 8px;

          flex-wrap: wrap;
        }

        .smf-selected-pill {
          display: inline-flex;
          align-items: center;

          background: #eef2ff;
          color: #3730a3;

          border: 1px solid #c7d2fe;
          border-radius: 999px;

          padding: 7px 12px;

          font-size: 12px;
          font-weight: 700;
        }

        .smf-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          border: 1px solid #cbd5e1;

          background: #ffffff;
          color: #334155;

          border-radius: 999px;

          padding: 8px 16px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
        }

        .smf-refresh-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .smf-clear-btn {
          background: #f3f4f6;
          color: #374151;

          border: 1px solid #d1d5db;
          border-radius: 999px;

          padding: 8px 14px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
        }

        .smf-danger-btn {
          background: #dc2626;
          color: #ffffff;

          border: none;
          border-radius: 999px;

          padding: 8px 16px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
        }

        .smf-danger-btn:hover:not(:disabled) {
          background: #b91c1c;
        }

        .smf-refresh-btn:disabled,
        .smf-danger-btn:disabled,
        .smf-clear-btn:disabled,
        .btn-edit:disabled,
        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* =========================
           LOADING
        ========================= */

        .smf-loading-state {
          min-height: 120px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          color: #64748b;

          font-size: 14px;
          font-weight: 600;
        }

        .smf-loading-spinner {
          width: 20px;
          height: 20px;

          border: 2px solid #e2e8f0;
          border-top-color: #2563eb;

          border-radius: 50%;

          animation:
            smfSpin 0.7s linear infinite;
        }

        @keyframes smfSpin {
          to {
            transform:
              rotate(360deg);
          }
        }


        /* =========================
           ADD ROW MODAL
        ========================= */

        .sm-add-overlay {
          position: fixed;
          inset: 0;

          z-index: 5000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(
              15,
              23,
              42,
              0.52
            );

          overflow-y: auto;

          box-sizing: border-box;
        }

        .sm-add-modal {
          width:
            min(
              560px,
              calc(
                100vw - 40px
              )
            );

          max-height:
            calc(
              100vh - 40px
            );

          overflow-y: auto;
          overflow-x: hidden;

          padding: 22px;

          background: #ffffff;

          border:
            1px solid #e5e7eb;

          border-radius: 16px;

          box-shadow:
            0 24px 70px
            rgba(
              15,
              23,
              42,
              0.28
            );

          box-sizing: border-box;
        }

        .sm-add-modal h3 {
          margin: 0 0 16px;
          color: #111827;
        }

        .sm-add-modal label {
          display: block;

          margin: 12px 0 6px;

          font-size: 13px;
          font-weight: 700;

          color: #374151;
        }

        .sm-add-modal select,
        .sm-add-modal input {
          width: 100%;

          box-sizing: border-box;

          padding: 10px 12px;

          border:
            1px solid #cbd5e1;

          border-radius: 8px;

          background: #ffffff;

          font-size: 14px;
        }

        .sm-add-modal select:focus,
        .sm-add-modal input:focus {
          outline: none;

          border-color: #4f46e5;

          box-shadow:
            0 0 0 3px
            rgba(
              79,
              70,
              229,
              0.1
            );
        }

        .sm-add-actions {
          margin-top: 20px;

          display: flex;
          justify-content: flex-end;

          gap: 10px;
        }

        .sm-add-cancel,
        .sm-add-submit {
          border: none;
          border-radius: 8px;

          padding: 9px 18px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
        }

        .sm-add-cancel {
          background: #f1f5f9;
          color: #334155;
        }

        .sm-add-submit {
          background: #2563eb;
          color: #ffffff;
        }

        .link-btn {
          margin-top: 6px;

          border: none;

          background: transparent;
          color: #2563eb;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;
        }


        /* =========================
           DELETE MODAL
        ========================= */

        .smf-modal-overlay {
          position: fixed;
          inset: 0;

          z-index: 5100;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 18px;

          background:
            rgba(
              15,
              23,
              42,
              0.48
            );
        }

        .smf-delete-card {
          width:
            min(
              520px,
              94vw
            );

          max-height: 90vh;

          overflow-y: auto;

          background: #ffffff;

          border:
            1px solid #e5e7eb;

          border-radius: 18px;

          box-shadow:
            0 24px 80px
            rgba(
              15,
              23,
              42,
              0.35
            );
        }

        .smf-delete-card-header {
          display: flex;
          align-items: center;

          gap: 12px;

          padding: 18px 20px;

          background: #fff1f2;

          border-bottom:
            1px solid #fecdd3;
        }

        .smf-delete-icon {
          width: 38px;
          height: 38px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #dc2626;
          color: #ffffff;

          border-radius: 50%;
        }

        .smf-delete-title {
          margin: 0;

          color: #9f1239;

          font-size: 17px;
          font-weight: 800;
        }

        .smf-delete-subtitle {
          margin: 3px 0 0;

          color: #9f1239;

          font-size: 13px;
        }

        .smf-delete-card-body {
          padding: 18px 20px;
        }

        .smf-delete-list {
          margin-top: 12px;

          max-height: 260px;

          overflow-y: auto;

          background: #f9fafb;

          border:
            1px solid #e5e7eb;

          border-radius: 12px;
        }

        .smf-delete-list-item {
          padding: 10px 12px;

          border-bottom:
            1px solid #e5e7eb;
        }

        .smf-delete-list-item:last-child {
          border-bottom: none;
        }

        .smf-delete-category {
          color: #111827;

          font-size: 13px;
          font-weight: 800;
        }

        .smf-delete-subskill {
          margin-top: 2px;

          color: #374151;

          font-size: 13px;
        }

        .smf-delete-card-footer {
          display: flex;
          justify-content: flex-end;

          gap: 10px;

          padding:
            14px 20px
            18px;

          border-top:
            1px solid #f1f5f9;
        }

        .smf-modal-cancel,
        .smf-modal-delete {
          border: none;
          border-radius: 999px;

          padding: 8px 18px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
        }

        .smf-modal-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .smf-modal-delete {
          background: #dc2626;
          color: #ffffff;
        }


        /* =========================
           TOAST
        ========================= */

        .smf-toast {
          position: fixed;

          left: 50%;
          bottom: 24px;

          transform:
            translateX(-50%);

          z-index: 6000;

          max-width: 90vw;

          padding: 10px 18px;

          color: #ffffff;

          border-radius: 999px;

          font-size: 13px;
          font-weight: 700;

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.25
            );
        }

        .smf-toast.error {
          background: #dc2626;
        }

        .smf-toast.success {
          background: #16a34a;
        }


        /* =========================
           MOBILE
        ========================= */

        @media (
          max-width: 600px
        ) {
          .smf-toolbar-row {
            align-items: flex-start;
          }

          .smf-toolbar-left,
          .smf-toolbar-right {
            width: 100%;
          }

          .sm-add-overlay {
            align-items: flex-start;

            padding: 12px;
          }

          .sm-add-modal {
            width: 100%;

            max-height:
              calc(
                100vh - 24px
              );

            margin-top: 10px;

            padding: 16px;

            border-radius: 12px;
          }

          .sm-add-actions {
            flex-direction:
              column-reverse;
          }

          .sm-add-actions button {
            width: 100%;
          }
        }

      `}</style>

      {/* ACCESS ERROR */}

      {metaError && (
        <div
          style={{
            background: "#fef3c7",
            color: "#92400e",
            padding: "8px 14px",
            fontSize: "12.5px",
            borderRadius: "10px",
            marginBottom: "10px",
            border:
              "1px solid #fde68a",
          }}
        >
          Could not load your
          discipline access.
          Please log out and log
          in again.
        </div>
      )}

      {/* FILTERS */}

      <div className="sticky-filters">
        <Filters
          filters={filters}
          setFilters={setFilters}
          onExportExcel={
            exportToExcel
          }
          onExportPDF={
            exportToPDF
          }
          canExport={
            filteredMatrixData.length >
            0
          }
          disciplineOptions={
            disciplineOptions
          }
          isDisciplineLocked={
            isDisciplineLocked
          }
          skillOptions={
            skillOptions
          }
        />

      {/* TOOLBAR */}

      <div className="smf-toolbar-row">
        <div className="smf-toolbar-left">

          <button
            className="btn-edit"
            onClick={() => {
              if (!isEditMode) {
                startEditMode();
              }
            }}
            disabled={
              !filters.discipline ||
              !filters.role
            }
            type="button"
          >
            ✏ Edit
          </button>

          <button
            className="btn-edit"
            onClick={
              openAddModal
            }
            disabled={
              actionBusy ||
              !filters.discipline ||
              !filters.role
            }
            type="button"
          >
            ➕ Add Row
          </button>

          {isEditMode && (
            <>
              <button
                className="btn-save"
                onClick={
                  saveChanges
                }
                disabled={
                  actionBusy
                }
                type="button"
              >
                💾 Save
              </button>

              <button
                className="btn-edit"
                onClick={
                  cancelEdit
                }
                disabled={
                  actionBusy
                }
                type="button"
              >
                ✖ Cancel
              </button>
            </>
          )}
        </div>

        <div className="smf-toolbar-right">

          {isEditMode &&
            selectedCount >
              0 && (
              <span className="smf-selected-pill">
                {selectedCount}{" "}
                selected
              </span>
            )}

          {isEditMode && (
            <>
              <button
                className="smf-clear-btn"
                onClick={
                  clearSelectedRows
                }
                disabled={
                  actionBusy ||
                  selectedCount ===
                    0
                }
                type="button"
              >
                Clear
              </button>

              <button
                className="smf-danger-btn"
                onClick={
                  requestDeleteSelectedRows
                }
                disabled={
                  actionBusy ||
                  selectedCount ===
                    0
                }
                type="button"
              >
                🗑 Delete Selected
              </button>
            </>
          )}

          <button
            className="smf-refresh-btn"
            onClick={
              handleRefresh
            }
            disabled={
              actionBusy ||
              refreshLoading ||
              !filters.discipline ||
              !filters.role
            }
            type="button"
          >
            {refreshLoading
              ? "⟳ Refreshing..."
              : "⟳ Refresh"}
          </button>

        </div>
      </div>
      </div>

      {/* MATRIX */}

      <div className="table-hover-wrapper">

        <div className="table-responsive">

          {initialLoading &&
          matrixData.length ===
            0 ? (
            <div className="smf-loading-state">
              <span className="smf-loading-spinner" />

              Loading matrix...
            </div>
          ) : (
            <SkillTable
              data={
                filteredMatrixData
              }

              role={
                filters.role
              }

              selectedLevel={
                filters.level
              }

              editable={
                isEditMode
              }

              editedValues={
                editedValues
              }

              selectedRows={
                selectedRows
              }

              onToggleRow={
                toggleSelectedRow
              }

              onToggleGroup={
                toggleCategoryRows
              }

              onEdit={(
                key,
                value
              ) =>
                setEditedValues(
                  (previous) => ({
                    ...previous,
                    [key]:
                      value,
                  })
                )
              }

              onDeleteRow={
                requestDeleteRow
              }
            />
          )}

        </div>

        <div className="hover-legend">
          <span className="legend-title">
            Proficiency Scale
          </span>

          <span className="legend-pill l1">
            NA - Not Applicable
          </span>

          <span className="legend-pill l2">
            1 - Familiar
          </span>

          <span className="legend-pill l3">
            2 - Working Level
          </span>

          <span className="legend-pill l4">
            3 - Extensive
          </span>

          <span className="legend-pill l5">
            4 - Authoritative
          </span>
        </div>
      </div>

      {/* ADD ROW MODAL */}

      {showAddRow && (
        <div className="sm-add-overlay">

          <div className="sm-add-modal">

            <h3>
              Add Skill / Subskill
            </h3>

            {/* Discipline */}

            <label>
              Discipline
            </label>

            <select
              value={
                form.discipline
              }
              onChange={(
                event
              ) => {
                const discipline =
                  event.target
                    .value;

                const role =
                  DISCIPLINE_ROLE_MAP[
                    discipline
                  ] || "";

                setForm(
                  (previous) => ({
                    ...previous,

                    discipline,

                    role,

                    skill: "",

                    subskill:
                      "",

                    isNewSkill:
                      false,

                    isNewSubskill:
                      false,
                  })
                );
              }}
              disabled={
                actionBusy
              }
            >
              <option value="">
                Select
                Discipline
              </option>

              {disciplineOptions.map(
                (discipline) => (
                  <option
                    key={
                      discipline
                    }
                    value={
                      discipline
                    }
                  >
                    {
                      discipline
                    }
                  </option>
                )
              )}
            </select>

            {/* Role */}

            <label>
              Role
            </label>

            <select
              value={
                form.role
              }
              onChange={(
                event
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,

                    role:
                      event
                        .target
                        .value,

                    skill: "",

                    subskill:
                      "",

                    isNewSkill:
                      false,

                    isNewSubskill:
                      false,
                  })
                )
              }
                            disabled={
                actionBusy ||
                FROZEN_ROLE_DISCIPLINES.includes(
                  form.discipline
                )
              }
            >
              <option value="">
                Select Role
              </option>

              {roleOptions.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}
            </select>

            {/* Skill Category */}

            <label>
              Skill Category
            </label>

            {!form.isNewSkill ? (
              <select
                value={
                  form.skill
                }
                disabled={
                  actionBusy
                }
                onChange={(
                  event
                ) => {
                  const value =
                    event
                      .target
                      .value;

                  if (
                    value ===
                    "__new__"
                  ) {
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        isNewSkill:
                          true,

                        skill: "",

                        subskill:
                          "",

                        isNewSubskill:
                          false,
                      })
                    );

                    return;
                  }

                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      skill:
                        value,

                      subskill:
                        "",

                      isNewSubskill:
                        false,
                    })
                  );
                }}
              >
                <option value="">
                  Select
                  Category
                </option>

                {modalSkillOptions.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>
                  )
                )}

                <option value="__new__">
                  + Create new
                  category
                </option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new category"
                  value={
                    form.skill
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        skill:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  disabled={
                    actionBusy
                  }
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        isNewSkill:
                          false,

                        skill: "",

                        subskill:
                          "",
                      })
                    )
                  }
                >
                  Use existing
                  category
                </button>
              </>
            )}

            {/* Subskill */}

            <label>
              Subskill
            </label>

            {form.isNewSkill ? (
              <input
                placeholder="Enter new subskill"
                value={
                  form.subskill
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      subskill:
                        event
                          .target
                          .value,
                    })
                  )
                }
                disabled={
                  actionBusy
                }
              />
            ) : !form.isNewSubskill ? (
              <select
                value={
                  form.subskill
                }
                disabled={
                  !form.skill ||
                  actionBusy
                }
                onChange={(
                  event
                ) => {
                  const value =
                    event
                      .target
                      .value;

                  if (
                    value ===
                    "__new__"
                  ) {
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        isNewSubskill:
                          true,

                        subskill:
                          "",
                      })
                    );

                    return;
                  }

                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      subskill:
                        value,
                    })
                  );
                }}
              >
                <option value="">
                  Select
                  Subskill
                </option>

                {modalSubskillOptions.map(
                  (
                    subskill
                  ) => (
                    <option
                      key={
                        subskill
                      }
                      value={
                        subskill
                      }
                    >
                      {
                        subskill
                      }
                    </option>
                  )
                )}

                <option value="__new__">
                  + Create new
                  subskill
                </option>
              </select>
            ) : (
              <>
                <input
                  placeholder="Enter new subskill"
                  value={
                    form.subskill
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        subskill:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  disabled={
                    actionBusy
                  }
                />

                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        isNewSubskill:
                          false,

                        subskill:
                          "",
                      })
                    )
                  }
                >
                  Use existing
                  subskill
                </button>
              </>
            )}

            {/* Buttons */}

            <div className="sm-add-actions">

              <button
                className="sm-add-cancel"
                onClick={() =>
                  setShowAddRow(
                    false
                  )
                }
                disabled={
                  actionBusy
                }
                type="button"
              >
                Cancel
              </button>

              <button
                className="sm-add-submit"
                onClick={
                  handleAddRow
                }
                disabled={
                  actionBusy
                }
                type="button"
              >
                {actionBusy
                  ? "Adding..."
                  : "Add & Save"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}

      {confirmDelete && (
        <div className="smf-modal-overlay">

          <div className="smf-delete-card">

            <div className="smf-delete-card-header">

              <div className="smf-delete-icon">
                🗑
              </div>

              <div>
                <h3 className="smf-delete-title">
                  Confirm
                  Delete
                </h3>

                <p className="smf-delete-subtitle">
                  Selected
                  subskills will
                  be deleted and
                  saved
                  immediately.
                </p>
              </div>

            </div>

            <div className="smf-delete-card-body">

              <div>
                Delete{" "}
                <strong>
                  {
                    confirmDelete
                      .rows
                      .length
                  }
                </strong>{" "}
                subskill
                {confirmDelete
                  .rows
                  .length > 1
                  ? "s"
                  : ""}
                ?
              </div>

              <div className="smf-delete-list">

                {confirmDelete.rows.map(
                  (row) => (
                    <div
                      className="smf-delete-list-item"

                      key={rowKey(
                        row.category,
                        row.subskillName
                      )}
                    >
                      <div className="smf-delete-category">
                        {
                          row.category
                        }
                      </div>

                      <div className="smf-delete-subskill">
                        {
                          row.subskillName
                        }
                      </div>
                    </div>
                  )
                )}

              </div>

            </div>

            <div className="smf-delete-card-footer">

              <button
                type="button"
                className="smf-modal-cancel"

                onClick={() =>
                  setConfirmDelete(
                    null
                  )
                }

                disabled={
                  actionBusy
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="smf-modal-delete"

                onClick={
                  confirmDeleteRows
                }

                disabled={
                  actionBusy
                }
              >
                {actionBusy
                  ? "Deleting..."
                  : "Delete & Save"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div
          className={`smf-toast ${toast.tone}`}
        >
          {toast.message}
        </div>
      )}

    </div>
  );
}