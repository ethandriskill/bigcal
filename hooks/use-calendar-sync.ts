"use client";

import { useEffect, useCallback } from "react";
import { calendarStore } from "@/lib/calendar-store";

export function useCalendarSync() {
  const fetchEvents = useCallback(async () => {
    const accounts = calendarStore.getAccounts();

    if (accounts.length === 0) {
      calendarStore.setEvents([]);
      return;
    }

    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accounts }),
      });

      if (response.ok) {
        const data = await response.json();
        calendarStore.setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = calendarStore.subscribe(() => {
      fetchEvents();
    });

    // Initial fetch
    fetchEvents();

    return unsubscribe;
  }, [fetchEvents]);

  return { refetch: fetchEvents };
}
