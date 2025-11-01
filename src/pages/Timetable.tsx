import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimetableEntry {
  id: string;
  subject_name: string;
  subject_code: string;
  professor_name: string;
  start_time: string;
  end_time: string;
  room: string;
  class_type: string;
  day_of_week: number;
}

const Timetable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSection, setUserSection] = useState<string>("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = ["08:45", "09:45", "10:45", "11:45", "13:45", "14:45", "15:45"];

  useEffect(() => {
    checkUserAndFetchTimetable();
  }, []);

  const checkUserAndFetchTimetable = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("section")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      setUserSection(profile.section);

      const { data: timetableData, error: timetableError } = await supabase
        .from("timetable")
        .select("*")
        .eq("section", profile.section)
        .order("day_of_week")
        .order("start_time");

      if (timetableError) throw timetableError;

      setTimetable(timetableData || []);
    } catch (error: any) {
      toast({
        title: "Error loading timetable",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getClassesForDayAndTime = (day: number, time: string) => {
    return timetable.filter(
      (entry) =>
        entry.day_of_week === day &&
        entry.start_time.startsWith(time)
    );
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case "Lab":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "Tutorial":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
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
            <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
            <p className="text-sm text-muted-foreground">Section {userSection}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Full Week Schedule</span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="p-6">
        <div className="bg-card rounded-2xl shadow-[var(--shadow-medium)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Time
                  </th>
                  {daysOfWeek.map((day, index) => (
                    <th key={index} className="p-3 text-left text-sm font-medium text-muted-foreground min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, timeIndex) => (
                  <tr key={timeIndex} className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-foreground whitespace-nowrap">
                      {time}
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      const classes = getClassesForDayAndTime(dayIndex, time);
                      return (
                        <td key={dayIndex} className="p-2">
                          {classes.map((classInfo) => (
                            <div
                              key={classInfo.id}
                              className="mb-2 last:mb-0"
                            >
                              <div className={`p-2 rounded-lg ${getClassTypeColor(classInfo.class_type)}`}>
                                <p className="text-xs font-semibold truncate">
                                  {classInfo.subject_code}
                                </p>
                                <p className="text-xs truncate">
                                  {classInfo.professor_name.split(" ").slice(0, 2).join(" ")}
                                </p>
                                <p className="text-xs truncate">{classInfo.room}</p>
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10"></div>
            <span className="text-xs text-muted-foreground">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/30"></div>
            <span className="text-xs text-muted-foreground">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30"></div>
            <span className="text-xs text-muted-foreground">Tutorial</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
