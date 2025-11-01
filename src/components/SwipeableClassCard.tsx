import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableClassCardProps {
  classInfo: {
    id: string;
    subject_name: string;
    subject_code: string;
    professor_name: string;
    start_time: string;
    end_time: string;
    room: string;
    class_type: string;
  };
  status?: "present" | "absent" | "pending" | null;
  isPast: boolean;
  isCurrent: boolean;
  canMark: boolean;
  onSwipe: (direction: "left" | "right") => void;
}

export const SwipeableClassCard = ({
  classInfo,
  status,
  isPast,
  isCurrent,
  canMark,
  onSwipe,
}: SwipeableClassCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!canMark) return;
      setSwipeOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      if (!canMark) return;
      onSwipe("left");
      setSwipeOffset(0);
    },
    onSwipedRight: () => {
      if (!canMark) return;
      onSwipe("right");
      setSwipeOffset(0);
    },
    onSwiped: () => {
      setSwipeOffset(0);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const getStatusIcon = () => {
    if (status === "present") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "absent") return <XCircle className="w-5 h-5 text-red-600" />;
    if (isPast) return <Clock className="w-5 h-5 text-muted-foreground" />;
    if (!canMark) return <Lock className="w-5 h-5 text-muted-foreground" />;
    return null;
  };

  const getBackgroundColor = () => {
    if (swipeOffset > 50) return "rgba(34, 197, 94, 0.1)"; // green
    if (swipeOffset < -50) return "rgba(239, 68, 68, 0.1)"; // red
    if (status === "present") return "hsl(var(--secondary))";
    if (status === "absent") return "hsl(var(--secondary))";
    if (isCurrent) return "hsl(var(--accent) / 0.2)";
    return "hsl(var(--card))";
  };

  return (
    <motion.div
      {...handlers}
      style={{
        x: canMark ? swipeOffset : 0,
        backgroundColor: getBackgroundColor(),
      }}
      className={cn(
        "relative rounded-2xl shadow-[var(--shadow-soft)] p-4 cursor-grab active:cursor-grabbing transition-colors",
        isPast && "opacity-60",
        !canMark && "cursor-not-allowed"
      )}
    >
      {/* Swipe Indicators */}
      {canMark && (
        <>
          <div
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-600 transition-opacity",
              swipeOffset > 30 ? "opacity-100" : "opacity-0"
            )}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-medium">Present</span>
          </div>
          <div
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-600 transition-opacity",
              swipeOffset < -30 ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="font-medium">Absent</span>
            <XCircle className="w-6 h-6" />
          </div>
        </>
      )}

      {/* Card Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">
              {classInfo.subject_name}
            </h3>
            {getStatusIcon()}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {classInfo.subject_code} • {classInfo.class_type}
          </p>
          <p className="text-sm text-muted-foreground">
            {classInfo.professor_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {classInfo.start_time.slice(0, 5)} - {classInfo.end_time.slice(0, 5)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {classInfo.room}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      {status && (
        <div className="mt-3 flex items-center gap-2">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              status === "present" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
              status === "absent" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
              status === "pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            )}
          >
            {status === "present" && "Marked Present"}
            {status === "absent" && "Marked Absent"}
            {status === "pending" && "Pending"}
          </div>
        </div>
      )}

      {/* Helper text */}
      {canMark && !status && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          ← Swipe left for Absent | Swipe right for Present →
        </p>
      )}
    </motion.div>
  );
};
