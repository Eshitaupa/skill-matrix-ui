import { createContext, useContext, useState } from "react";

const ExportContext = createContext(null);

// export const ExportContext = React.createContext(null);

export function ExportProvider({ children }) {
  const [exporters, setExporters] = useState(null);

  return (
    <ExportContext.Provider value={{ exporters, setExporters }}>
      {children}
    </ExportContext.Provider>
  );
}

export function useExport() {
  return useContext(ExportContext);
}

