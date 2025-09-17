import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";

function App() {
  const isTempoMode = import.meta.env.VITE_TEMPO === "true";

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        {isTempoMode && <TempoRoutes />}
      </>
    </Suspense>
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

  return routes ? useRoutes(routes) : null;
}

export default App;
