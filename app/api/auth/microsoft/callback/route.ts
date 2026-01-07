import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.MICROSOFT_CLIENT_ID || "",
          client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Get user info
    const userInfoResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    // Generate account data
    const accountData = {
      id: `microsoft-${userInfo.mail || userInfo.userPrincipalName}`,
      email: userInfo.mail || userInfo.userPrincipalName,
      provider: "microsoft",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    // Redirect back to home with account data
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("account", btoa(JSON.stringify(accountData)));

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Microsoft OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
