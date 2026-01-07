import { NextResponse } from "next/server";

export async function GET() {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
  };

  googleAuthUrl.search = new URLSearchParams(params).toString();

  return NextResponse.redirect(googleAuthUrl.toString());
}
