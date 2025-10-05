import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as unknown as { state?: { from?: Location } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!email.trim() || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);

      // Determine redirect path
      const redirectTo = (location.state?.from as any)?.pathname || "/";

      // Navigate with replace to prevent back button issues
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err?.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/iconic-logo.png"
                alt="Iconic Digital World Logo"
                className="h-8 w-8"
              />
              <span className="text-lg font-bold">
                MAGNET Test<sup className="text-xs">TM</sup> Live
              </span>
            </Link>
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in to access MAGNET Admin Settings
          </CardDescription>
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
            Demo credentials: <strong>demo@magnet.app</strong> /{" "}
            <strong>demo123</strong>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              <Link to="/">Back to Home</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
