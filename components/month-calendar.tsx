"use client";

import { CalendarEvent } from "@/lib/types";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from "date-fns";

interface MonthCalendarProps {
  month: Date;
  events: CalendarEvent[];
}

export default function MonthCalendar({ month, events }: MonthCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return isSameDay(day, eventStart) ||
             (day >= eventStart && day <= eventEnd);
    });
  };

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, month);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`min-h-[80px] border rounded-md p-1 ${
                !isCurrentMonth
                  ? "bg-muted/30 text-muted-foreground"
                  : "bg-background"
              } ${isTodayDate ? "ring-2 ring-primary" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isTodayDate ? "text-primary font-bold" : ""
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs px-1 py-0.5 rounded truncate"
                    style={{
                      backgroundColor: event.color || "#3b82f6",
                      color: "white",
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
