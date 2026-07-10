const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const url = 'https://chat.whatsapp.com/FA98eYnS7Rl4hejrzu8xfm';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await res.text();
    console.log("HTML length:", html.length);

    // 1. Search for any .jpg or .png or .webp or .jpeg (case-insensitive)
    const extRegex = /https?:\/\/[^\s"'`<>\\^]+?\.(?:jpg|jpeg|png|webp|svg)/gi;
    const matches = html.match(extRegex) || [];
    console.log("Matched URLs with image extensions:", Array.from(new Set(matches)));

    // 2. Search for any URL that contains "pps.whatsapp.net" or "pps"
    const ppsRegex = /https?:\/\/[^\s"'`<>\\^]+?pps[^\s"'`<>\\^]+/gi;
    const ppsMatches = html.match(ppsRegex) || [];
    console.log("Matched URLs with 'pps':", Array.from(new Set(ppsMatches)));

    // 3. Search for background-image
    const bgMatches = html.match(/background-image:[^;]+/gi) || [];
    console.log("Background Image styles:", bgMatches);

    // 4. Let's inspect the first 10000 characters and the last 10000 characters to see if there is any other block
    console.log("First 500 chars:", html.substring(0, 500));
    console.log("Last 500 chars:", html.substring(html.length - 500));

  } catch (err) {
    console.error(err);
  }
}

run();
