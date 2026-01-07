import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Get user info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // Generate account data to pass to frontend
    const accountData = {
      id: `google-${userInfo.email}`,
      email: userInfo.email,
      provider: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    // Redirect back to home with account data
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("account", btoa(JSON.stringify(accountData)));

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
