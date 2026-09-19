// GET /api/data
// Returns the latest saved dashboard data from Cloudflare KV, or null if nothing
// has been saved yet (in which case the page falls back to the data baked into
// index.html at the time it was last deployed).
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.ENERGY_KV) {
    return new Response(
      JSON.stringify({ error: "ENERGY_KV binding is not configured on this Pages project" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const value = await env.ENERGY_KV.get("energy_data");
  if (!value) {
    return new Response("null", { headers: { "content-type": "application/json" } });
  }
  return new Response(value, { headers: { "content-type": "application/json" } });
}
