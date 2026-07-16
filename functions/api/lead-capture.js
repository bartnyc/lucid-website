// Cloudflare Pages Function — POST /api/lead-capture
// No build step required: Pages auto-detects any file under /functions as a route.
// Env vars (set in Cloudflare dashboard → Settings → Environment variables):
//   HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID  (optional — relays lead to HubSpot)
//   SLACK_WEBHOOK_URL                      (optional — posts lead to Slack)

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, practice, interest, message } = payload ?? {};

  // Validation
  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("name");
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRe.test(email)) {
    errors.push("email");
  }
  if (errors.length > 0) {
    return Response.json(
      { ok: false, error: `Invalid or missing fields: ${errors.join(", ")}` },
      { status: 400 }
    );
  }

  const lead = {
    name: name.trim(),
    email: email.trim(),
    practice: (practice ?? "").toString().trim(),
    interest: (interest ?? "Just exploring").toString().trim(),
    message: (message ?? "").toString().trim(),
    submittedAt: new Date().toISOString(),
  };

  // Fire-and-forget relays — failures here must never block the user-facing response.
  const relays = [];

  if (env.SLACK_WEBHOOK_URL) {
    relays.push(
      fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New LucidClaim lead: *${lead.name}* (${lead.email}) — ${lead.practice || "no practice given"} — interest: ${lead.interest}`,
        }),
      }).catch((err) => console.error("Slack relay failed:", err))
    );
  }

  if (env.HUBSPOT_PORTAL_ID && env.HUBSPOT_FORM_GUID) {
    const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${env.HUBSPOT_PORTAL_ID}/${env.HUBSPOT_FORM_GUID}`;
    relays.push(
      fetch(hsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [
            { name: "email", value: lead.email },
            { name: "firstname", value: lead.name },
            { name: "company", value: lead.practice },
          ],
        }),
      }).catch((err) => console.error("HubSpot relay failed:", err))
    );
  }

  await Promise.allSettled(relays);

  return Response.json({ ok: true });
}

export async function onRequestGet() {
  return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
