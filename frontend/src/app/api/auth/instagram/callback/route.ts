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
    .find((c) => c.startsWith("ig_oauth_state="))
    ?.split("=")[1];

  const dashboardUrl = new URL("/", url.origin);

  if (oauthError) {
    dashboardUrl.searchParams.set("connect_error", `instagram:${oauthError}`);
    return NextResponse.redirect(dashboardUrl);
  }
  if (!code || !state || state !== cookieState) {
    dashboardUrl.searchParams.set("connect_error", "instagram:invalid_state");
    return NextResponse.redirect(dashboardUrl);
  }

  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_OAUTH_REDIRECT_URI!;

  if (!appSecret) {
    dashboardUrl.searchParams.set("connect_error", "instagram:missing_app_secret");
    return NextResponse.redirect(dashboardUrl);
  }

  // Step 1: exchange the code for a short-lived token.
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const shortJson = await shortRes.json();
  if (!shortRes.ok) {
    dashboardUrl.searchParams.set("connect_error", "instagram:code_exchange_failed");
    return NextResponse.redirect(dashboardUrl);
  }

  // Step 2: exchange the short-lived token for a long-lived one (~60 days).
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", shortJson.access_token);
  const longRes = await fetch(longUrl.toString());
  const longJson = await longRes.json();
  if (!longRes.ok) {
    dashboardUrl.searchParams.set("connect_error", "instagram:token_exchange_failed");
    return NextResponse.redirect(dashboardUrl);
  }

  const meRes = await fetch(
    `https://graph.instagram.com/me?fields=username&access_token=${longJson.access_token}`
  );
  const meJson = await meRes.json();
  const handle = meJson.username ?? "instagram account";

  const tokenExpiresAt = new Date(Date.now() + longJson.expires_in * 1000).toISOString();

  await upsertSocialAccount({
    platform: "instagram",
    handle,
    status: "connected",
    externalId: shortJson.user_id ? String(shortJson.user_id) : undefined,
    accessToken: longJson.access_token,
    tokenExpiresAt,
    dailyPostLimit: 25,
  });

  dashboardUrl.searchParams.set("connected", "instagram");
  const response = NextResponse.redirect(dashboardUrl);
  response.cookies.delete("ig_oauth_state");
  return response;
}
