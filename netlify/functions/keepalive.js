export async function handler(event) {
  try {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/vijesti?select=id&limit=1`, {
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`
      }
    });
  } catch (e) {}
  return { statusCode: 200, body: "OK" };
}
