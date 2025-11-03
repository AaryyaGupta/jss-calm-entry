import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RescheduleData) => void;
  classInfo: {
    subject_name: string;
    start_time: string;
    end_time: string;
  };
}

export interface RescheduleData {
  wasRescheduled: boolean;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  room?: string;
  notes?: string;
}

export const RescheduleDialog = ({ isOpen, onClose, onConfirm, classInfo }: RescheduleDialogProps) => {
  const [step, setStep] = useState<"confirm" | "details">("confirm");
  const [formData, setFormData] = useState<Partial<RescheduleData>>({});

  const handleConfirmRescheduled = (wasRescheduled: boolean) => {
    if (!wasRescheduled) {
      onConfirm({ wasRescheduled: false });
      handleClose();
    } else {
      setStep("details");
    }
  };

  const handleSubmit = () => {
    onConfirm({
      wasRescheduled: true,
      ...formData,
    } as RescheduleData);
    handleClose();
  };

  const handleClose = () => {
    setStep("confirm");
    setFormData({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "confirm" ? "Was This Class Rescheduled?" : "Reschedule Details"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {classInfo.subject_name} • {classInfo.start_time}-{classInfo.end_time}
          </p>
        </DialogHeader>

        {step === "confirm" ? (
          <div className="space-y-4 py-4">
            <Button
              onClick={() => handleConfirmRescheduled(true)}
              className="w-full"
              size="lg"
            >
              Yes, it was rescheduled
            </Button>
            <Button
              onClick={() => handleConfirmRescheduled(false)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              No, just cancelled
            </Button>
            <Button onClick={handleClose} variant="ghost" className="w-full">
              Back
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">New Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.newDate || ""}
                  onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.newStartTime || ""}
                  onChange={(e) => setFormData({ ...formData, newStartTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.newEndTime || ""}
                  onChange={(e) => setFormData({ ...formData, newEndTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room (optional)</Label>
              <Input
                id="room"
                placeholder="e.g., Lab 3"
                value={formData.room || ""}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!formData.newDate || !formData.newStartTime || !formData.newEndTime}
                className="flex-1"
              >
                Confirm Reschedule
              </Button>
              <Button onClick={() => setStep("confirm")} variant="outline" className="flex-1">
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
