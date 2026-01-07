"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { calendarStore } from "@/lib/calendar-store";
import { CalendarAccount } from "@/lib/types";

export default function OAuthHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const accountParam = searchParams.get("account");

    if (accountParam) {
      try {
        const accountData: CalendarAccount = JSON.parse(atob(accountParam));
        calendarStore.addAccount(accountData);

        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete("account");
        window.history.replaceState({}, "", url.toString());
      } catch (error) {
        console.error("Failed to parse account data:", error);
      }
    }
  }, [searchParams]);

  return null;
}
