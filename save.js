// POST /api/save
// Saves the dashboard's full data JSON to Cloudflare KV. Requires a bearer
// token that must match the CLERK_TOKEN environment variable/secret set on
// the Pages project -- this is the "only the clerk can save" gate.
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ENERGY_KV) {
    return new Response(
      JSON.stringify({ error: "ENERGY_KV binding is not configured on this Pages project" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
  if (!env.CLERK_TOKEN) {
    return new Response(
      JSON.stringify({ error: "CLERK_TOKEN environment variable is not set on this Pages project" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token !== env.CLERK_TOKEN) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await request.text();
  // basic sanity check -- must be valid JSON before we store it
  try {
    JSON.parse(body);
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  await env.ENERGY_KV.put("energy_data", body);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
