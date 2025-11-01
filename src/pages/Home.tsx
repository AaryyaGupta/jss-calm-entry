import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, LogOut, User, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeableClassCard } from "@/components/SwipeableClassCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";

interface ClassInfo {
  id: string;
  subject_name: string;
  subject_code: string;
  professor_name: string;
  start_time: string;
  end_time: string;
  room: string;
  class_type: string;
}

interface AttendanceStatus {
  timetable_id: string;
  status: "present" | "absent" | "pending";
}

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState("Student");
  const [userSection, setUserSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState<ClassInfo[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, section")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.section) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile setup",
          variant: "destructive",
        });
        return;
      }

      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      }
      setUserSection(profile.section);

      // Fetch today's timetable
      const today = new Date().getDay();
      const dayOfWeek = today === 0 ? 6 : today - 1; // Convert to 0=Monday

      const { data: classes, error: classesError } = await supabase
        .from("timetable")
        .select("*")
        .eq("section", profile.section)
        .eq("day_of_week", dayOfWeek)
        .order("start_time");

      if (classesError) throw classesError;
      setTodayClasses(classes || []);

      // Fetch today's attendance
      const todayDate = format(new Date(), "yyyy-MM-dd");
      const { data: attendance, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("timetable_id, status")
        .eq("student_id", user.id)
        .eq("date", todayDate);

      if (attendanceError) throw attendanceError;
      setAttendanceStatus((attendance || []) as AttendanceStatus[]);

      // Calculate overall attendance percentage
      const { data: allAttendance } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("student_id", user.id);

      if (allAttendance && allAttendance.length > 0) {
        const present = allAttendance.filter(a => a.status === "present").length;
        setAttendancePercentage((present / allAttendance.length) * 100);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (classInfo: ClassInfo, direction: "left" | "right") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const status = direction === "right" ? "present" : "absent";
    const todayDate = format(new Date(), "yyyy-MM-dd");

    try {
      const { error } = await supabase
        .from("attendance_records")
        .upsert({
          student_id: user.id,
          timetable_id: classInfo.id,
          date: todayDate,
          status,
          marked_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,timetable_id,date'
        });

      if (error) throw error;

      toast({
        title: `Marked ${status}`,
        description: `${classInfo.subject_name} - ${status === "present" ? "✓" : "✗"}`,
      });

      // Refresh attendance status
      const { data: attendance } = await supabase
        .from("attendance_records")
        .select("timetable_id, status")
        .eq("student_id", user.id)
        .eq("date", todayDate);

      setAttendanceStatus((attendance || []) as AttendanceStatus[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canMarkAttendance = (startTime: string) => {
    const now = new Date();
    const [hours, minutes] = startTime.split(":").map(Number);
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0);
    
    const diff = (now.getTime() - classTime.getTime()) / (1000 * 60);
    return diff >= -30 && diff <= 30;
  };

  const isClassPast = (endTime: string) => {
    const now = new Date();
    const [hours, minutes] = endTime.split(":").map(Number);
    const classEndTime = new Date();
    classEndTime.setHours(hours, minutes, 0);
    
    return now > classEndTime;
  };

  const isClassCurrent = (startTime: string, endTime: string) => {
    const now = new Date();
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    const classStart = new Date();
    classStart.setHours(startHours, startMinutes, 0);
    const classEnd = new Date();
    classEnd.setHours(endHours, endMinutes, 0);
    
    return now >= classStart && now <= classEnd;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-32 w-full mb-6 rounded-3xl" />
        <Skeleton className="h-24 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 pt-8 pb-6 px-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Section {userSection}</p>
              <p className="font-semibold text-foreground">JSS Students</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {getGreeting()},
          </h1>
          <h2 className="text-3xl font-bold text-foreground">{userName}.</h2>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-8 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card shadow-[var(--shadow-soft)]" onClick={() => navigate("/attendance")}>
            <BarChart3 className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{attendancePercentage.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </Card>
          <Card className="p-4 bg-card shadow-[var(--shadow-soft)]" onClick={() => navigate("/timetable")}>
            <Calendar className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{todayClasses.length}</p>
            <p className="text-xs text-muted-foreground">Classes Today</p>
          </Card>
          <Card className="p-4 bg-card shadow-[var(--shadow-soft)]">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">-</p>
            <p className="text-xs text-muted-foreground">Assignments</p>
          </Card>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Today's Classes</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/timetable")}
            className="text-primary"
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {todayClasses.length === 0 ? (
            <Card className="p-8 text-center bg-card">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No classes today</p>
              <p className="text-sm text-muted-foreground mt-1">Enjoy your day off!</p>
            </Card>
          ) : (
            todayClasses.map((classInfo) => {
              const attendance = attendanceStatus.find(a => a.timetable_id === classInfo.id);
              const isPast = isClassPast(classInfo.end_time);
              const isCurrent = isClassCurrent(classInfo.start_time, classInfo.end_time);
              const canMark = canMarkAttendance(classInfo.start_time) && !attendance;

              return (
                <SwipeableClassCard
                  key={classInfo.id}
                  classInfo={classInfo}
                  status={attendance?.status}
                  isPast={isPast}
                  isCurrent={isCurrent}
                  canMark={canMark}
                  onSwipe={(direction) => handleSwipe(classInfo, direction)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 shadow-[0_-4px_20px_-2px_hsl(var(--shadow-soft))]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2" onClick={() => navigate("/home")}>
            <Calendar className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-primary font-medium">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2" onClick={() => navigate("/timetable")}>
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-xs">Timetable</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2" onClick={() => navigate("/attendance")}>
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">Attendance</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
