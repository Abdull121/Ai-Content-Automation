import { NextResponse } from "next/server";
import { upsertSocialAccount } from "@/infrastructure/appwrite/upsertSocialAccount";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("yt_oauth_state="))
    ?.split("=")[1];

  const dashboardUrl = new URL("/", url.origin);

  if (oauthError) {
    dashboardUrl.searchParams.set("connect_error", `youtube:${oauthError}`);
    return NextResponse.redirect(dashboardUrl);
  }
  if (!code || !state || state !== cookieState) {
    dashboardUrl.searchParams.set("connect_error", "youtube:invalid_state");
    return NextResponse.redirect(dashboardUrl);
  }

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET!;
  const redirectUri = process.env.YOUTUBE_OAUTH_REDIRECT_URI!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokenJson = await tokenRes.json();

  if (!tokenRes.ok) {
    dashboardUrl.searchParams.set("connect_error", `youtube:${tokenJson.error ?? "token_exchange_failed"}`);
    return NextResponse.redirect(dashboardUrl);
  }
  if (!tokenJson.refresh_token) {
    // Happens if the user already has an active grant and Google is not
    // returning a new refresh token despite prompt=consent — extremely rare,
    // but surface it clearly instead of silently overwriting with nothing.
    dashboardUrl.searchParams.set("connect_error", "youtube:no_refresh_token");
    return NextResponse.redirect(dashboardUrl);
  }

  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${tokenJson.access_token}` } }
  );
  const channelJson = await channelRes.json();
  const handle = channelJson.items?.[0]?.snippet?.title ?? "YouTube channel";
  const externalId = channelJson.items?.[0]?.id;

  await upsertSocialAccount({
    platform: "youtube",
    handle,
    status: "connected",
    externalId,
    refreshToken: tokenJson.refresh_token,
    dailyPostLimit: 6,
  });

  dashboardUrl.searchParams.set("connected", "youtube");
  const response = NextResponse.redirect(dashboardUrl);
  response.cookies.delete("yt_oauth_state");
  return response;
}
