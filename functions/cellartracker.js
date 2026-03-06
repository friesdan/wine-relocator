// Cloudflare Pages Function to proxy CellarTracker xlquery requests
// This avoids CORS issues when fetching from the browser

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch from CellarTracker
    const url = `https://www.cellartracker.com/xlquery.asp?User=${encodeURIComponent(username)}&Password=${encodeURIComponent(password)}&Format=tab&Table=List&Location=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WineRelocator/1.0'
      }
    });
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'CellarTracker request failed', status: response.status }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const text = await response.text();
    
    // Check for auth errors (CellarTracker returns HTML on bad auth)
    if (text.includes('<html') || text.includes('Invalid') || text.includes('login')) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ data: text }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
