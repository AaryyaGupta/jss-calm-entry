import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface ClassInfo {
  id: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  room?: string;
}

interface SwapSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (swappedClassId: string) => void;
  currentClass: ClassInfo;
  availableClasses: ClassInfo[];
}

export const SwapSelectionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentClass,
  availableClasses,
}: SwapSelectionDialogProps) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const handleConfirm = () => {
    if (selectedClassId) {
      onConfirm(selectedClassId);
      setSelectedClassId("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedClassId("");
    onClose();
  };

  return (
    <Dialog open={isOpen && !!currentClass} onOpenChange={handleClose}>
      {currentClass && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Class Swap
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {currentClass.subject_name} was swapped
            </p>
          </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select which class it was swapped with:
            </label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{classItem.subject_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {classItem.start_time} - {classItem.end_time}
                        {classItem.room && ` • ${classItem.room}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              The attendance you mark here will be applied to the swapped class automatically.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={!selectedClassId}
              className="flex-1"
            >
              Confirm Swap
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Back
            </Button>
          </div>
        </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
