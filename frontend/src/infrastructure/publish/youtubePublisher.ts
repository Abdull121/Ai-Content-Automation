import "server-only";

interface YouTubeAccount {
  refreshToken: string;
}

interface VideoMetadata {
  title: string;
  description: string;
  hashtags: string[];
}

async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_OAUTH_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_OAUTH_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`YouTube token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

/**
 * YouTube's "multipart" upload type wants a single `multipart/related` body:
 * a JSON metadata part followed by the raw video bytes, joined by one boundary.
 * This is small-file friendly; a resumable upload would be needed for
 * multi-GB files, which is out of scope for the videos this pipeline handles.
 */
function buildMultipartBody(metadata: object, videoBuffer: Buffer, boundary: string): Buffer {
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--`);
  return Buffer.concat([head, videoBuffer, tail]);
}

export async function publishToYouTube(
  account: YouTubeAccount,
  videoBuffer: Buffer,
  metadata: VideoMetadata
): Promise<string> {
  const accessToken = await getAccessToken(account.refreshToken);
  const boundary = `content_automation_${Date.now()}`;

  const body = buildMultipartBody(
    {
      snippet: {
        title: metadata.title || "Untitled",
        description: [metadata.description, metadata.hashtags.join(" ")].filter(Boolean).join("\n\n"),
        tags: metadata.hashtags.map((h) => h.replace(/^#/, "")),
      },
      status: { privacyStatus: "public" },
    },
    videoBuffer,
    boundary
  );

  const res = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: new Uint8Array(body),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(`YouTube upload failed: ${JSON.stringify(json)}`);
  return json.id;
}
