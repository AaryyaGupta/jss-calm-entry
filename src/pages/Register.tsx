import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jssLogo from "@/assets/jss-logo.png";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  collegeId: z.string().trim().min(1, "College ID is required").max(50, "College ID must be less than 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
});

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = registerSchema.parse({
        fullName,
        email,
        collegeId,
        password,
      });

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
            college_id: validatedData.collegeId,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account already exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Registration successful!",
          description: "Welcome to JSS Students App",
        });
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
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
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Join the JSS Students community
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-medium)] p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="fullName" 
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="collegeId" 
                className="text-sm font-medium text-foreground"
              >
                College ID
              </Label>
              <Input
                id="collegeId"
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Enter your college ID"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
                disabled={isLoading}
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
                placeholder="Create a password (min. 6 characters)"
                className="h-12 rounded-2xl bg-input border-border focus-visible:ring-ring transition-[var(--transition-smooth)]"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-medium shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-medium)] hover:-translate-y-0.5"
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-primary font-medium hover:underline transition-[var(--transition-smooth)]"
              >
                Login
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

export default Register;
