import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jssLogo from "@/assets/jss-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempted with:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-card shadow-[var(--shadow-soft)] flex items-center justify-center">
              <img 
                src={jssLogo} 
                alt="JSS Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            JSS Students App
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personalised college app.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-medium)] p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium text-foreground"
              >
                Email / College ID
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or college ID"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-medium shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-medium)] hover:-translate-y-0.5"
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <a 
                href="/register" 
                className="text-primary font-medium hover:underline transition-[var(--transition-smooth)]"
              >
                Register
              </a>
            </p>
          </div>
        </div>

        {/* Footer tagline */}
        <p className="text-center text-xs text-muted-foreground mt-8 italic">
          "Where functionality meets warmth"
        </p>
      </div>
    </div>
  );
};

export default Login;
