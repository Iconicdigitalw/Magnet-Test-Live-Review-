import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { Toaster } from "./components/ui/toaster";
import Home from "./components/home";
import AdminSettings from "./components/admin/AdminSettings";

function App() {
  const isTempoMode = import.meta.env.VITE_TEMPO === "true";

  return (
    <SettingsProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
        {isTempoMode && <TempoRoutes />}
      </Suspense>
      <Toaster />
    </SettingsProvider>
  );
}

function TempoRoutes() {
  // Dynamic import to avoid build errors when tempo-routes is not available
  const [routes, setRoutes] = useState(null);

  useEffect(() => {
    if (import.meta.env.VITE_TEMPO === "true") {
      import("tempo-routes")
        .then((module) => setRoutes(module.default))
        .catch(() => setRoutes([]));
    }
  }, []);

  // Always call useRoutes to maintain consistent hook order
  // Pass empty array as fallback when routes is null
  const routeElement = useRoutes(routes || []);
  return routeElement;
}

export default App;
