import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to manually extract metadata in an extremely robust and fast way (like Android/Kotlin app scrapers)
function extractSocialMetadata(html: string, urlStr: string) {
  const getMeta = (property: string) => {
    // Search for property or name in meta tags with flexible spacing/quotes
    const regexList = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i')
    ];

    for (const regex of regexList) {
      const match = html.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  let titleRaw = getMeta('og:title') || getMeta('twitter:title') || '';
  if (!titleRaw) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      titleRaw = titleMatch[1];
    }
  }

  const descriptionRaw = getMeta('og:description') || getMeta('twitter:description') || '';
  const image_url = getMeta('og:image') || getMeta('twitter:image') || '';

  // Detect platform and sub-type from URL
  let platform = 'WhatsApp';
  let sub_type = 'Group';
  if (urlStr.includes('t.me') || urlStr.includes('telegram.me') || urlStr.includes('telegram.dog')) {
    platform = 'Telegram';
    // If it has "joinchat" or " + ", it's usually a group, otherwise channel
    if (urlStr.includes('joinchat') || urlStr.includes('/+') || titleRaw.toLowerCase().includes('group')) {
      sub_type = 'Group';
    } else {
      sub_type = 'Channel';
    }
  } else if (urlStr.includes('facebook.com') || urlStr.includes('fb.com') || urlStr.includes('fb.me')) {
    platform = 'Facebook';
    if (urlStr.includes('/groups/')) {
      sub_type = 'Group';
    } else {
      sub_type = 'Page';
    }
  }

  // Parse HTML entities
  const cleanEntities = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  let title = cleanEntities(titleRaw);
  let description = cleanEntities(descriptionRaw);

  // Clean generic platform suffixes or prefixes to make names professional and accurate
  if (platform === 'Telegram') {
    title = title.replace(/ – Telegram$/i, '').replace(/ - Telegram$/i, '');
    title = title.replace(/^Telegram:\s*Contact\s*@?/i, '');
    if (!title || title.toLowerCase() === 'telegram') {
      // Try to parse from URL path if title is generic
      const pathParts = new URL(urlStr).pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        title = '@' + pathParts[pathParts.length - 1];
      }
    }
  } else if (platform === 'WhatsApp') {
    title = title.replace(/ - WhatsApp Group Invite$/i, '').replace(/WhatsApp Group Invite/i, '');
    if (!title || title.toLowerCase().trim() === 'whatsapp') {
      title = 'WhatsApp Community Group';
    }
  } else if (platform === 'Facebook') {
    title = title.replace(/ \| Facebook$/i, '').replace(/ - Home$/i, '');
  }

  // Double check title fallback
  if (!title) {
    title = `Public ${platform} ${sub_type}`;
  }

  if (!description) {
    description = `Join this public ${platform} ${sub_type.toLowerCase()} community.`;
  }

  // Parse member count from description/title if available (e.g. "1,250 members", "5.4K subscribers")
  let member_count = 0;
  const countRegex = /([0-9.,]+[kKmM]?)\s*(?:members|subscribers|followers|likes|members)/i;
  const countMatch = description.match(countRegex) || title.match(countRegex) || html.match(countRegex);
  if (countMatch && countMatch[1]) {
    const rawNum = countMatch[1].toLowerCase();
    if (rawNum.includes('k')) {
      member_count = Math.round(parseFloat(rawNum.replace('k', '')) * 1000);
    } else if (rawNum.includes('m')) {
      member_count = Math.round(parseFloat(rawNum.replace('m', '')) * 1000000);
    } else {
      member_count = parseInt(rawNum.replace(/,/g, '')) || 0;
    }
  }

  // Provide high quality platform-specific fallback image if scraped image is missing or invalid
  let finalImageUrl = image_url;
  if (finalImageUrl && finalImageUrl.includes('pps.whatsapp.net') && finalImageUrl.endsWith('.jp')) {
    finalImageUrl = finalImageUrl + 'g';
  }

  if (!finalImageUrl || finalImageUrl.startsWith('/') || !finalImageUrl.startsWith('http')) {
    if (platform === 'WhatsApp') {
      finalImageUrl = 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80'; // Clean green theme
    } else if (platform === 'Telegram') {
      finalImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'; // Tech theme
    } else {
      finalImageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'; // Social network theme
    }
  }

  return {
    title,
    description,
    image_url: finalImageUrl,
    platform,
    sub_type,
    member_count
  };
}

// API endpoint to fetch and parse external link details
app.get("/api/fetch-link-details", async (req, res) => {
  const urlStr = req.query.url as string;
  if (!urlStr) {
    return res.status(400).json({ error: "URL query parameter is required" });
  }

  try {
    // Validate URL format
    const parsedUrl = new URL(urlStr);
    
    console.log(`[FastScraper] Fetching URL: ${urlStr}`);
    
    // Low timeout (3000ms) for high-speed responsiveness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const html = await response.text();
    
    // Limit parsing content to <head> for maximum speed and efficiency
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const parsingContent = headMatch ? headMatch[1] : html.substring(0, 150000);

    const result = extractSocialMetadata(parsingContent, urlStr);
    
    console.log(`[FastScraper] Successfully parsed: "${result.title}"`);
    return res.json(result);

  } catch (err: any) {
    console.error(`[FastScraper] Error: ${err.message}`);
    
    // Quick local url-based fallback prediction (instant UI update)
    let platform = "WhatsApp";
    let sub_type = "Group";
    if (urlStr.includes('t.me') || urlStr.includes('telegram')) {
      platform = "Telegram";
      sub_type = "Channel";
    } else if (urlStr.includes('facebook.com') || urlStr.includes('fb.com')) {
      platform = "Facebook";
      sub_type = "Page";
    }

    // Try parsing username from the URL path for fallback title
    let title = `Public ${platform} ${sub_type}`;
    try {
      const pathname = new URL(urlStr).pathname;
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0 && parts[parts.length - 1].length > 3) {
        title = `${parts[parts.length - 1].replace(/[-_]+/g, ' ')}`;
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
    } catch (_) {}

    return res.json({
      title,
      description: `Join this ${platform} community on social networks.`,
      image_url: platform === 'WhatsApp' 
        ? 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80'
        : platform === 'Telegram'
          ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      platform,
      sub_type,
      member_count: 0
    });
  }
});

// Proxy endpoint for secure and cross-origin loading of WhatsApp CDN images (pps.whatsapp.net)
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("URL parameter is required");
  }
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).send(`Error proxying image: ${err.message}`);
  }
});

// Vite & Static file handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Only start the server listener if we are not running on Vercel's serverless platform
if (!process.env.VERCEL) {
  startServer();
}

export default app;
