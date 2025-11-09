import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface AttendanceRecord {
  subject_name: string;
  subject_code: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
  classesHeld?: number;
  classesAttended?: number;
  manualPercentage?: number;
  isEditingManual?: boolean;
}

interface ManualAttendance {
  id?: string;
  subject_code: string;
  classes_held: number;
  classes_attended: number;
}

const Attendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [subjectWiseData, setSubjectWiseData] = useState<AttendanceRecord[]>([]);
  const [manualAttendanceData, setManualAttendanceData] = useState<Map<string, ManualAttendance>>(new Map());
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

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

      // Fetch manual attendance data
      const { data: manualData } = await supabase
        .from("manual_attendance")
        .select("*")
        .eq("student_id", user.id);

      if (manualData) {
        const manualMap = new Map<string, ManualAttendance>();
        manualData.forEach((item: any) => {
          manualMap.set(item.subject_code, {
            id: item.id,
            subject_code: item.subject_code,
            classes_held: item.classes_held,
            classes_attended: item.classes_attended,
          });
        });
        setManualAttendanceData(manualMap);
      }

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

  const saveManualAttendance = async (
    subject_code: string,
    classes_held: number,
    classes_attended: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (classes_attended > classes_held) {
        toast({
          title: "Invalid input",
          description: "Classes attended cannot exceed classes held",
          variant: "destructive",
        });
        return;
      }

      const existing = manualAttendanceData.get(subject_code);

      if (existing?.id) {
        const { error } = await supabase
          .from("manual_attendance")
          .update({
            classes_held,
            classes_attended,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("manual_attendance")
          .insert({
            student_id: user.id,
            subject_code,
            classes_held,
            classes_attended,
          });

        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: `Manual attendance updated for ${subject_code}`,
      });

      setEditingSubject(null);
      await fetchAttendanceData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
                {subjectWiseData.map((subject) => {
                  const manualData = manualAttendanceData.get(subject.subject_code);
                  const isEditing = editingSubject === subject.subject_code;
                  const [tempHeld, setTempHeld] = useState(manualData?.classes_held || 0);
                  const [tempAttended, setTempAttended] = useState(manualData?.classes_attended || 0);
                  const manualPercentage = tempHeld > 0 ? (tempAttended / tempHeld) * 100 : 0;

                  return (
                    <Card key={subject.subject_code} className="p-4">
                      <div className="flex items-center justify-between mb-3">
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

                      <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                        <span>Total: {subject.total}</span>
                        <span className="text-green-600 dark:text-green-400">Present: {subject.present}</span>
                        <span className="text-red-600 dark:text-red-400">Absent: {subject.absent}</span>
                      </div>

                      {isEditing ? (
                        <div className="border-t border-border pt-3">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">
                                Classes Held
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={tempHeld}
                                onChange={(e) => setTempHeld(Number(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">
                                Classes Attended
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={tempAttended}
                                onChange={(e) => setTempAttended(Number(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-primary mb-2">
                            Manual: {manualPercentage.toFixed(1)}%
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                saveManualAttendance(
                                  subject.subject_code,
                                  tempHeld,
                                  tempAttended
                                )
                              }
                              className="flex-1 h-7"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSubject(null);
                                setTempHeld(manualData?.classes_held || 0);
                                setTempAttended(manualData?.classes_attended || 0);
                              }}
                              className="flex-1 h-7"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          {manualData && (
                            <div className="text-xs">
                              <p className="text-muted-foreground">
                                Manual: {manualData.classes_attended}/{manualData.classes_held} (
                                {manualData.classes_held > 0
                                  ? ((manualData.classes_attended / manualData.classes_held) * 100).toFixed(1)
                                  : 0}
                                %)
                              </p>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSubject(subject.subject_code);
                              setTempHeld(manualData?.classes_held || 0);
                              setTempAttended(manualData?.classes_attended || 0);
                            }}
                            className="h-7"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit Manual
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
