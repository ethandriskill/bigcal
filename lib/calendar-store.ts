"use client";

import { CalendarEvent, CalendarAccount } from "./types";

class CalendarStore {
  private events: CalendarEvent[] = [];
  private accounts: CalendarAccount[] = [];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getEvents(): CalendarEvent[] {
    return this.events;
  }

  getAccounts(): CalendarAccount[] {
    return this.accounts;
  }

  addAccount(account: CalendarAccount) {
    this.accounts.push(account);
    this.saveToLocalStorage();
    this.notify();
  }

  removeAccount(accountId: string) {
    this.accounts = this.accounts.filter((a) => a.id !== accountId);
    this.events = this.events.filter((e) => e.accountId !== accountId);
    this.saveToLocalStorage();
    this.notify();
  }

  setEvents(events: CalendarEvent[]) {
    this.events = events;
    this.notify();
  }

  addEvents(newEvents: CalendarEvent[]) {
    this.events = [...this.events, ...newEvents];
    this.notify();
  }

  private saveToLocalStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendar-accounts", JSON.stringify(this.accounts));
    }
  }

  loadFromLocalStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("calendar-accounts");
      if (stored) {
        try {
          this.accounts = JSON.parse(stored);
          this.notify();
        } catch (e) {
          console.error("Failed to parse stored accounts", e);
        }
      }
    }
  }
}

export const calendarStore = new CalendarStore();
