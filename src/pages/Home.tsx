import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile?.full_name) {
      setUserName(profile.full_name.split(" ")[0]);
    }
    
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative Header Background */}
      <div className="relative bg-primary h-48 rounded-b-[3rem] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 300">
          <path d="M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z" fill="hsl(var(--accent))" opacity="0.5"/>
        </svg>
        
        {/* Header Content */}
        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary-foreground/20">
                <AvatarFallback className="bg-card text-foreground">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-primary-foreground font-semibold text-lg">Stadhunt</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Greeting */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-1">
                {getGreeting()},
              </h1>
              <h2 className="text-3xl font-bold text-primary-foreground">{userName}.</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-12 relative z-20">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-accent rounded-3xl p-4 shadow-[var(--shadow-soft)] min-h-[160px] flex flex-col">
            <h3 className="text-accent-foreground font-semibold text-sm mb-2">Attendance</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-foreground">85%</div>
                <div className="text-xs text-accent-foreground/70 mt-1">This Month</div>
              </div>
            </div>
          </Card>

          <Card className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] min-h-[160px] flex flex-col">
            <h3 className="text-foreground font-semibold text-sm mb-2">Slots</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">6/8</div>
                <div className="text-xs text-muted-foreground mt-1">Classes Today</div>
              </div>
            </div>
          </Card>

          <Card className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] min-h-[160px] flex flex-col">
            <h3 className="text-foreground font-semibold text-sm mb-2">Events</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground mt-1">Upcoming</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard Sections */}
        <Card className="bg-card rounded-3xl shadow-[var(--shadow-medium)] p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Student Dashboard</h2>
          
          <Tabs defaultValue="timetable" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="pyq">PYQ</TabsTrigger>
            </TabsList>

            <TabsContent value="timetable" className="space-y-3">
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Mathematics</h4>
                    <p className="text-sm text-muted-foreground">Prof. Kumar</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">9:00 AM</p>
                    <p className="text-xs text-muted-foreground">Room 301</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Physics</h4>
                    <p className="text-sm text-muted-foreground">Dr. Sharma</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">11:00 AM</p>
                    <p className="text-xs text-muted-foreground">Lab 2</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Chemistry</h4>
                    <p className="text-sm text-muted-foreground">Prof. Patel</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">2:00 PM</p>
                    <p className="text-xs text-muted-foreground">Room 205</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-3">
              <div className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Data Structures Assignment</h4>
                    <p className="text-sm text-muted-foreground mt-1">Implement Binary Tree</p>
                  </div>
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                    Due Soon
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Due: Tomorrow, 11:59 PM</p>
              </div>

              <div className="bg-muted rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Web Development Project</h4>
                    <p className="text-sm text-muted-foreground mt-1">Create a responsive portfolio</p>
                  </div>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    3 days
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Due: Dec 15, 2024</p>
              </div>

              <div className="bg-muted rounded-2xl p-4 opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">Physics Lab Report</h4>
                    <p className="text-sm text-muted-foreground mt-1">Newton's Laws Experiment</p>
                  </div>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    Submitted
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Submitted: Dec 10, 2024</p>
              </div>
            </TabsContent>

            <TabsContent value="pyq" className="space-y-3">
              <div className="bg-muted rounded-2xl p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-foreground">Mathematics - 2023</h4>
                    <p className="text-sm text-muted-foreground">Semester 1 Final Exam</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    View
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-foreground">Physics - 2023</h4>
                    <p className="text-sm text-muted-foreground">Semester 1 Mid-term</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    View
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-foreground">Chemistry - 2022</h4>
                    <p className="text-sm text-muted-foreground">Semester 2 Final Exam</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    View
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-2xl p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-foreground">Data Structures - 2023</h4>
                    <p className="text-sm text-muted-foreground">Semester 1 Final Exam</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    View
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Home;
