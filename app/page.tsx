"use client";

import { Suspense } from "react";
import YearlyCalendar from "@/components/yearly-calendar";
import AccountManager from "@/components/account-manager";
import OAuthHandler from "@/components/oauth-handler";
import { useCalendarSync } from "@/hooks/use-calendar-sync";

export default function Home() {
  useCalendarSync();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>
      <div className="max-w-[1800px] mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BigCal</h1>
            <p className="text-muted-foreground text-sm">Your year at a glance</p>
          </div>
          <AccountManager />
        </header>
        <YearlyCalendar />
      </div>
    </main>
  );
}
