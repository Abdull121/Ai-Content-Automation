import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const SCOPES = ["instagram_business_basic", "instagram_business_content_publish"].join(",");

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_OAUTH_REDIRECT_URI;
  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Instagram OAuth is not configured (missing INSTAGRAM_APP_ID/REDIRECT_URI)" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");

  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    maxAge: 600,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
