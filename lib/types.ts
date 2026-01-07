export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  accountId: string;
  color?: string;
  allDay?: boolean;
}

export interface CalendarAccount {
  id: string;
  email: string;
  provider: "google" | "microsoft";
  accessToken: string;
  refreshToken: string;
  color: string;
}

export interface DayEvents {
  date: Date;
  events: CalendarEvent[];
}
