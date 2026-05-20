export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { type, ...body } = JSON.parse(event.body);

  // Supabase — dohvati vijesti
  if (type === "get_vijesti") {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/vijesti?order=vrijeme.desc`, {
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  // Supabase — spremi vijest
  if (type === "post_vijest") {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/vijesti?columns=zupanija,rubrika,naslov,kratki_tekst,vazna`, {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(body.vijest)
    });
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  // Anthropic — generiraj vijest
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify(data) };
}
