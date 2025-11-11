import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: "official" | "manual";
}

interface HolidayCalendarProps {
  onHolidaysUpdate?: () => void;
}

const HolidayCalendar = ({ onHolidaysUpdate }: HolidayCalendarProps) => {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: officialHolidays } = await supabase
        .from("holidays")
        .select("*")
        .eq("type", "official");

      const { data: userHolidays } = await supabase
        .from("holidays")
        .select("*")
        .eq("type", "manual")
        .eq("student_id", user.id);

      const allHolidays = [...(officialHolidays || []), ...(userHolidays || [])];
      setHolidays(allHolidays as Holiday[]);

      const dates = new Set(
        allHolidays.map((h) => h.date)
      );
      setMarkedDates(dates);
    } catch (error: any) {
      toast({
        title: "Error loading holidays",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHolidayMark = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(date, "yyyy-MM-dd");
      const existing = holidays.find(
        (h) => h.date === dateStr && h.type === "manual" && h.date
      );

      if (existing) {
        const { error } = await supabase
          .from("holidays")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;

        toast({
          title: "Holiday unmarked",
          description: `${dateStr} removed from your holidays`,
        });
      } else {
        const { error } = await supabase
          .from("holidays")
          .insert({
            date: dateStr,
            name: "Manual Holiday",
            type: "manual",
            student_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Holiday marked",
          description: `${dateStr} added to your holidays`,
        });
      }

      await fetchHolidays();
      onHolidaysUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isHolidayMarked = (date: Date) => {
    return markedDates.has(format(date, "yyyy-MM-dd"));
  };

  const getHolidayForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.find((h) => h.date === dateStr);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="text-center text-muted-foreground">Loading holidays...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Holiday Calendar</h2>
      </div>

      <Card className="p-6 bg-card">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>

          {selectedDate && (
            <div className="border-t border-border pt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
                <div className="mt-3">
                  {isHolidayMarked(selectedDate) ? (
                    <div className="space-y-2">
                      {getHolidayForDate(selectedDate)?.type === "official" ? (
                        <p className="text-sm font-medium text-primary">
                          Official Holiday: {getHolidayForDate(selectedDate)?.name}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-primary">
                          Marked as Holiday
                        </p>
                      )}
                      {getHolidayForDate(selectedDate)?.type === "manual" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => toggleHolidayMark(selectedDate)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Mark
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => toggleHolidayMark(selectedDate)}
                      className="w-full"
                    >
                      Mark as Holiday
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {holidays.length > 0 && (
        <Card className="p-4 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Marked Holidays
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {holidays
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {format(new Date(holiday.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {holiday.name}{" "}
                      {holiday.type === "official" ? "(Official)" : "(Manual)"}
                    </p>
                  </div>
                  {holiday.type === "manual" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("holidays")
                          .delete()
                          .eq("id", holiday.id);

                        if (!error) {
                          await fetchHolidays();
                          onHolidaysUpdate?.();
                          toast({
                            title: "Holiday removed",
                            description: `${holiday.date} has been unmarked`,
                          });
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HolidayCalendar;
