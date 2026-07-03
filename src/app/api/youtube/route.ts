import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/constants';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

async function fetchYouTubeRSS(): Promise<YouTubeVideo[]> {
  const channelId = SITE_CONFIG.youtubeChannelId;
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error('Failed to fetch RSS feed');

    const text = await response.text();
    const videos: YouTubeVideo[] = [];

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(text)) !== null) {
      const entry = match[1];

      const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<media:group>[\s\S]*?<media:title>(.*?)<\/media:title>/);
      const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
      const thumbMatch = entry.match(/<media:thumbnail url="(.*?)"/);
      const dateMatch = entry.match(/<published>(.*?)<\/published>/);

      if (idMatch && titleMatch) {
        const id = idMatch[1];
        videos.push({
          id,
          title: titleMatch[1],
          description: descMatch ? descMatch[1].trim() : '',
          thumbnail: thumbMatch ? thumbMatch[1].replace('/hqdefault.jpg', '/mqdefault.jpg') : `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          publishedAt: dateMatch ? dateMatch[1] : '',
          url: `https://www.youtube.com/watch?v=${id}`,
        });
      }
    }

    return videos;
  } catch (error) {
    console.error('YouTube RSS fetch error:', error);
    return [];
  }
}

export async function GET() {
  const videos = await fetchYouTubeRSS();
  return NextResponse.json(videos);
}
