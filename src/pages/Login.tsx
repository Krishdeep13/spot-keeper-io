import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };
const USER_CREDENTIALS = { username: "user", password: "user123" };

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("parksmartRole", "admin");
      localStorage.setItem("parksmartUser", username);
      toast({ title: "Welcome, Admin!", description: "Redirecting to admin dashboard..." });
      navigate("/admin");
    } else if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
      localStorage.setItem("parksmartRole", "user");
      localStorage.setItem("parksmartUser", username);
      toast({ title: "Welcome!", description: "Redirecting to parking view..." });
      navigate("/");
    } else {
      toast({ title: "Login failed", description: "Invalid username or password.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero">
            <Car className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ParkSmart</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm text-foreground">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            <LogIn className="h-4 w-4" /> Sign In
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground text-center">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-3 text-xs text-secondary-foreground">
            <div className="rounded-lg bg-muted p-2 text-center">
              <p className="font-semibold">Admin</p>
              <p>admin / admin123</p>
            </div>
            <div className="rounded-lg bg-muted p-2 text-center">
              <p className="font-semibold">User</p>
              <p>user / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
