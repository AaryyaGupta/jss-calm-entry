import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Ban, RefreshCw } from "lucide-react";

interface AttendanceActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: "present" | "absent" | "cancelled" | "swapped" | "rescheduled") => void;
  classInfo: {
    subject_name: string;
    start_time: string;
    end_time: string;
  } | null;
}

export const AttendanceActionSheet = ({
  isOpen,
  onClose,
  onSelect,
  classInfo,
}: AttendanceActionSheetProps) => {
  const handleSelect = (action: "present" | "absent" | "cancelled" | "swapped" | "rescheduled") => {
    onSelect(action);
  };

  return (
    <Dialog open={isOpen && !!classInfo} onOpenChange={onClose}>
      {classInfo && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {classInfo.subject_name} • {classInfo.start_time}-{classInfo.end_time}
            </p>
          </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            onClick={() => handleSelect("present")}
            className="h-14 justify-start gap-3 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Mark Present</span>
          </Button>

          <Button
            onClick={() => handleSelect("absent")}
            className="h-14 justify-start gap-3 bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Mark Absent</span>
          </Button>

          <Button
            onClick={() => handleSelect("cancelled")}
            className="h-14 justify-start gap-3 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Ban className="h-5 w-5" />
            <span className="font-medium">Class Cancelled</span>
          </Button>

          <Button
            onClick={() => handleSelect("swapped")}
            className="h-14 justify-start gap-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="font-medium">Class Swapped</span>
          </Button>

          <Button onClick={onClose} variant="ghost" className="mt-2">
            Cancel
          </Button>
        </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
