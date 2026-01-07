import { NextRequest, NextResponse } from "next/server";
import { startOfYear, endOfYear } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const { accounts } = await request.json();

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const year = new Date().getFullYear();
    const timeMin = startOfYear(new Date(year, 0, 1)).toISOString();
    const timeMax = endOfYear(new Date(year, 0, 1)).toISOString();

    const allEvents = [];

    for (const account of accounts) {
      try {
        let events = [];

        if (account.provider === "google") {
          events = await fetchGoogleEvents(
            account.accessToken,
            timeMin,
            timeMax,
            account.id,
            account.color
          );
        } else if (account.provider === "microsoft") {
          events = await fetchMicrosoftEvents(
            account.accessToken,
            timeMin,
            timeMax,
            account.id,
            account.color
          );
        }

        allEvents.push(...events);
      } catch (error) {
        console.error(`Error fetching events for ${account.email}:`, error);
      }
    }

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

async function fetchGoogleEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
  accountId: string,
  color: string
) {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("maxResults", "2500");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.items || []).map((event: any) => ({
    id: `${accountId}-${event.id}`,
    title: event.summary || "Untitled Event",
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    accountId,
    color,
    allDay: !event.start.dateTime,
  }));
}

async function fetchMicrosoftEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
  accountId: string,
  color: string
) {
  const url = new URL("https://graph.microsoft.com/v1.0/me/calendar/events");
  url.searchParams.set("$top", "2500");
  url.searchParams.set(
    "$filter",
    `start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}'`
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Microsoft Graph API error: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.value || []).map((event: any) => ({
    id: `${accountId}-${event.id}`,
    title: event.subject || "Untitled Event",
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
    accountId,
    color,
    allDay: event.isAllDay,
  }));
}
