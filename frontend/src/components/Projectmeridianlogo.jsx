// // ProjectMeridianLogo.jsx
// // Usage: <ProjectMeridianLogo size="full" /> or <ProjectMeridianLogo size="icon" />

// export default function ProjectMeridianLogo({ size = "full", theme="default",onClick }) {
// const primary = theme === "white" ? "#ffffff" : "#1e3a8a";
// const secondary = theme === "white" ? "#ffffff" : "#2563eb";
// const text = theme === "white" ? "#ffffff" : "#4b5563";  if (size === "icon") {
//     return (
//       <svg
//         width="36"
//         height="36"
//         viewBox="0 0 60 60"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//         onClick={onClick}
//         style={{ cursor: onClick ? "pointer" : "default", display: "block" }}
//       >
//         {/* Bar chart base */}
//         <rect x="6"  y="34" width="9" height="16" rx="2" fill={secondary} opacity="0.5"/>
//         <rect x="18" y="24" width="9" height="26" rx="2" fill={secondary} opacity="0.75"/>
//         <rect x="30" y="16" width="9" height="34" rx="2" fill={primary}/>
//         {/* Rising arrow line */}
//         <polyline points="6,38 18,28 30,20 45,10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
//         {/* Star */}
//         <polygon points="45,4 46.5,8.5 51,8.5 47.5,11.5 49,16 45,13 41,16 42.5,11.5 39,8.5 43.5,8.5" fill={secondary}/>
//       </svg>
//     );
//   }

//   return (
//     <svg
//       width="100%"
//       viewBox="0 0 340 72"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       onClick={onClick}
//       style={{ cursor: onClick ? "pointer" : "default", display: "block", maxWidth: 1000 }}
//     >
//       <circle cx="28" cy="10" r="7" fill={primary}/>
//       <path d="M28 18 Q18 28 14 38" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
//       <path d="M28 18 Q36 24 44 20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
//       <path d="M14 38 Q12 48 10 54" stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
//       <path d="M14 38 Q20 46 24 52" stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

//       <rect x="30" y="42" width="8"  height="18" rx="2" fill={secondary} opacity="0.45"/>
//       <rect x="41" y="32" width="8"  height="28" rx="2" fill={secondary} opacity="0.7"/>
//       <rect x="52" y="22" width="8"  height="38" rx="2" fill={primary}/>

//       <polyline points="30,46 41,36 52,26 64,14" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

//       <polygon
//         points="64,8 65.4,12 69.5,12 66.3,14.6 67.5,18.5 64,16 60.5,18.5 61.7,14.6 58.5,12 62.6,12"
//         fill={secondary}
//       />

//       <line x1="80" y1="8" x2="80" y2="64" stroke="#dbeafe" strokeWidth="1.5"/>

//       <text
//         x="92" y="32"
//         fontFamily="Segoe UI, system-ui, sans-serif"
//         fontSize="13"
//         fontWeight="400"
//         letterSpacing="2"
//         fill={text}
//       >PROJECT</text>
//       <text
//         x="90" y="54"
//         fontFamily="Segoe UI, system-ui, sans-serif"
//         fontSize="22"
//         fontWeight="700"
//         letterSpacing="1"
//         fill={primary}
//       >MERIDIAN</text>

//       <text
//         x="91" y="66"
//         fontFamily="Segoe UI, system-ui, sans-serif"
//         fontSize="8"
//         fontWeight="600"
//         letterSpacing="1.5"
//         fill="#6b7280"
//       >SKILLS · GROWTH · INTELLIGENCE</text>
//     </svg>
//   );
// }

export default function ProjectMeridianLogo({
  size = "full",
  onClick,
}) {
  const primary = "#082C85";
  const secondary = "#169BFF";
  const light1 = "#B8E2FF";
  const light2 = "#6DC4FF";

  if (size === "icon") {
    return (
      <svg
        viewBox="0 0 220 140"
        width="48"
        height="48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="45" cy="28" r="10" fill={primary} />

        <path
          d="
            M18 78
            C35 45,65 38,92 42
            C80 56,60 68,18 78
            Z
          "
          fill={primary}
        />

        <rect x="58" y="78" width="18" height="34" fill={light1} />
        <rect x="82" y="62" width="18" height="50" fill={light2} />
        <rect x="106" y="40" width="18" height="72" fill={secondary} />

        <path
          d="M36 120 C75 82 120 40 165 8"
          stroke={secondary}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <polygon
          points="
            175,0
            178,9
            188,9
            180,15
            183,25
            175,19
            167,25
            170,15
            162,9
            172,9
          "
          fill={secondary}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1000 250"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "900px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* PERSON HEAD */}
      <circle cx="95" cy="65" r="18" fill={primary} />

      {/* PERSON BODY */}
      <path
        d="
          M45 155
          C75 95 120 80 170 88
          C155 108 132 126 105 140
          C85 150 65 154 45 155
          Z
        "
        fill={primary}
      />

      {/* BARS */}
    <rect x="135" y="130" width="32" height="80" fill={light1}/>
<rect x="175" y="105" width="32" height="105" fill={light2}/>
<rect x="215" y="70" width="32" height="140" fill={secondary}/>

      {/* SWOOSH */}
<path
  d="
    M90 200
    C145 125 215 85 270 40
  "
  stroke={secondary}
  strokeWidth="12"
  fill="none"
  strokeLinecap="round"
/>

      {/* STAR */}
<polygon
  points="
    300,0
    304,12
    317,12
    307,20
    311,33
    300,25
    289,33
    293,20
    283,12
    296,12
  "
  fill={secondary}
/>


      {/* DIVIDER */}
      <line
        x1="360"
        y1="35"
        x2="360"
        y2="190"
        stroke="#E4E9FF"
        strokeWidth="3"
      />

      {/* PROJECT */}
      <text
        x="410"
        y="92"
        fontFamily="Segoe UI, sans-serif"
        fontSize="32"
        letterSpacing="12"
        fill="#4F6CC5"
      >
        PROJECT
      </text>

      {/* MERIDIAN */}
      <text
        x="410"
        y="160"
        fontFamily="Segoe UI, sans-serif"
        fontSize="82"
        fontWeight="700"
        fill={primary}
      >
        MERIDIAN
      </text>

      {/* TAGLINE */}
      <text
        x="410"
        y="215"
        fontFamily="Segoe UI, sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="3"
        fill="#6B7280"
      >
        SKILLS • GROWTH • INTELLIGENCE
      </text>
    </svg>
  );
}