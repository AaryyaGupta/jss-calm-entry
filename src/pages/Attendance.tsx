import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface AttendanceRecord {
  subject_name: string;
  subject_code: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

const Attendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [subjectWiseData, setSubjectWiseData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Get user's section
      const { data: profile } = await supabase
        .from("profiles")
        .select("section")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Get timetable entries for the section
      const { data: timetableEntries } = await supabase
        .from("timetable")
        .select("id, subject_name, subject_code")
        .eq("section", profile.section);

      // Get attendance records
      const { data: attendanceRecords } = await supabase
        .from("attendance_records")
        .select("timetable_id, status")
        .eq("student_id", user.id);

      if (!timetableEntries || !attendanceRecords) {
        setLoading(false);
        return;
      }

      // Calculate subject-wise attendance
      const subjectMap = new Map<string, AttendanceRecord>();
      
      timetableEntries.forEach((entry) => {
        if (!subjectMap.has(entry.subject_code)) {
          subjectMap.set(entry.subject_code, {
            subject_name: entry.subject_name,
            subject_code: entry.subject_code,
            total: 0,
            present: 0,
            absent: 0,
            percentage: 0,
          });
        }
      });

      attendanceRecords.forEach((record) => {
        const timetableEntry = timetableEntries.find(t => t.id === record.timetable_id);
        if (timetableEntry && record.status !== "cancelled" && record.status !== "swapped") {
          const subjectData = subjectMap.get(timetableEntry.subject_code);
          if (subjectData) {
            subjectData.total++;
            if (record.status === "present" || record.status === "rescheduled") subjectData.present++;
            if (record.status === "absent") subjectData.absent++;
            subjectData.percentage = (subjectData.present / subjectData.total) * 100;
          }
        }
      });

      const subjectData = Array.from(subjectMap.values()).filter(s => s.total > 0);
      setSubjectWiseData(subjectData);

      // Calculate overall percentage
      const totalClasses = subjectData.reduce((sum, s) => sum + s.total, 0);
      const totalPresent = subjectData.reduce((sum, s) => sum + s.present, 0);
      setOverallPercentage(totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0);

    } catch (error: any) {
      toast({
        title: "Error loading attendance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return "hsl(var(--primary))";
    if (percentage >= 60) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 pt-8 pb-6 px-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-sm text-muted-foreground">Track your attendance</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Attendance Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Overall Attendance</h2>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">
              {overallPercentage.toFixed(1)}%
            </span>
          </div>
          {overallPercentage < 75 && (
            <p className="mt-3 text-sm text-destructive">
              ⚠️ Your attendance is below 75%. Please attend more classes.
            </p>
          )}
          {overallPercentage >= 75 && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400">
              ✓ Great! You're maintaining good attendance.
            </p>
          )}
        </Card>

        {/* Subject-wise Attendance */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Subject-wise Breakdown</h2>
          
          {subjectWiseData.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No attendance records yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start marking your attendance to see stats
              </p>
            </Card>
          ) : (
            <>
              {/* Bar Chart */}
              <Card className="p-4 mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectWiseData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="subject_code" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="percentage" name="Attendance %" radius={[8, 8, 0, 0]}>
                      {subjectWiseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Subject Cards */}
              <div className="space-y-3">
                {subjectWiseData.map((subject) => (
                  <Card key={subject.subject_code} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{subject.subject_name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.subject_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: getBarColor(subject.percentage) }}>
                          {subject.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Total: {subject.total}</span>
                      <span className="text-green-600 dark:text-green-400">Present: {subject.present}</span>
                      <span className="text-red-600 dark:text-red-400">Absent: {subject.absent}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
