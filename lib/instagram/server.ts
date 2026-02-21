import "server-only";

type InstagramGraphResponse = {
  data?: Array<{
    id: string;
    caption?: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url?: string;
    permalink: string;
    thumbnail_url?: string;
    timestamp?: string;
  }>;
};

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl?: string;
  permalink: string;
  thumbnailUrl?: string;
  timestamp?: string;
};

export async function getInstagramMedia(limit = 6): Promise<InstagramMediaItem[] | null> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString(), { next: { revalidate: 60 * 60 } });
    if (!response.ok) return null;

    const json = (await response.json()) as InstagramGraphResponse;
    const items = json.data ?? [];

    return items.map((item) => ({
      id: item.id,
      caption: item.caption,
      mediaType: item.media_type,
      mediaUrl: item.media_url,
      permalink: item.permalink,
      thumbnailUrl: item.thumbnail_url,
      timestamp: item.timestamp,
    }));
  } catch {
    return null;
  }
}
