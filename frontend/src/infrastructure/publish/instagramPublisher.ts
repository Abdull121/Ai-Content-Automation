import "server-only";

interface InstagramAccount {
  accessToken: string;
  externalId: string; // Instagram-scoped user id, captured at connect time
}

interface VideoMetadata {
  title: string;
  description: string;
  hashtags: string[];
}

const GRAPH_BASE = "https://graph.instagram.com";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForContainerReady(containerId: string, accessToken: string): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(
      `${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const json = await res.json();
    if (!res.ok) throw new Error(`Instagram container status check failed: ${JSON.stringify(json)}`);
    if (json.status_code === "FINISHED") return;
    if (json.status_code === "ERROR") throw new Error("Instagram failed to process the video container");
    await sleep(3000);
  }
  throw new Error("Timed out waiting for Instagram to process the video");
}

export async function publishToInstagram(
  account: InstagramAccount,
  fileUrl: string,
  metadata: VideoMetadata
): Promise<string> {
  const caption = [metadata.title, metadata.description, metadata.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");

  const createRes = await fetch(`${GRAPH_BASE}/${account.externalId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      media_type: "REELS",
      video_url: fileUrl,
      caption,
      access_token: account.accessToken,
    }),
  });
  const createJson = await createRes.json();
  if (!createRes.ok) throw new Error(`Instagram container creation failed: ${JSON.stringify(createJson)}`);

  await waitForContainerReady(createJson.id, account.accessToken);

  const publishRes = await fetch(`${GRAPH_BASE}/${account.externalId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      creation_id: createJson.id,
      access_token: account.accessToken,
    }),
  });
  const publishJson = await publishRes.json();
  if (!publishRes.ok) throw new Error(`Instagram publish failed: ${JSON.stringify(publishJson)}`);
  return publishJson.id;
}
