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

// Supabase — obriši vijest
if (type === "delete_vijest") {
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/vijesti?id=eq.${body.id}`, {
    method: "DELETE",
    headers: {
      "apikey": process.env.SUPABASE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_KEY}`
    }
  });
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}
  
  // Supabase — spremi vijest i pošalji obavijest
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
    const spremljena = data[0];

    // Pošalji push obavijest ako je vijest važna
    if (spremljena && body.vijest.vazna) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
        },
        body: JSON.stringify({
  app_id: "48669045-803a-4541-b9b8-4fe516169dab",
  included_segments: ["All"],
  headings: { en: spremljena.zupanija },
  contents: { en: spremljena.naslov },
  url: `https://demoaplikacijanovosti.netlify.app/?vijest=${spremljena.id}&zupanija=${encodeURIComponent(spremljena.zupanija)}`
})
      });
    }

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
