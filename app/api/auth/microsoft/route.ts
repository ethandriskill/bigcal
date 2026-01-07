import { NextResponse } from "next/server";

export async function GET() {
  const msAuthUrl = new URL(
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
  );

  const params = {
    client_id: process.env.MICROSOFT_CLIENT_ID || "",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`,
    response_type: "code",
    scope: "openid email Calendars.Read offline_access",
    response_mode: "query",
  };

  msAuthUrl.search = new URLSearchParams(params).toString();

  return NextResponse.redirect(msAuthUrl.toString());
}
