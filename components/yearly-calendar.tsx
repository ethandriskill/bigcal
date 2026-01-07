"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { calendarStore } from "@/lib/calendar-store";
import MonthCalendar from "./month-calendar";
import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format
} from "date-fns";

export default function YearlyCalendar() {
  const [currentYear] = useState(new Date().getFullYear());
  const events = useSyncExternalStore(
    (callback) => calendarStore.subscribe(callback),
    () => calendarStore.getEvents(),
    () => []
  );

  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 0, 1));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold">{currentYear}</h2>
      </div>

      <div className="space-y-8">
        {months.map((month) => (
          <div key={month.toString()} className="bg-card rounded-lg border p-4">
            <h3 className="text-xl font-semibold mb-4">
              {format(month, "MMMM yyyy")}
            </h3>
            <MonthCalendar month={month} events={events} />
          </div>
        ))}
      </div>
    </div>
  );
}
