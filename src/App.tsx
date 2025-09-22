import { Suspense, useState, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { Toaster } from "./components/ui/toaster";
import Home from "./components/home";
import AdminSettings from "./components/admin/AdminSettings";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";

function App() {
  const isTempoMode = import.meta.env.VITE_TEMPO === "true";

  return (
    <AuthProvider>
      <SettingsProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<LogoutRoute />} />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
          {isTempoMode && <TempoRoutes />}
        </Suspense>
        <Toaster />
      </SettingsProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function LogoutRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);
  return null;
}

function TempoRoutes() {
  // Dynamic import to avoid build errors when tempo-routes is not available
  const [routes, setRoutes] = useState<any>(null);

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
