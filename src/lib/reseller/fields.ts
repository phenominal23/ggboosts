// Turns the buyer's checkout answers into the field names Liteboosts expects.
// "Discord Username" fields are who Liteboosts contacts — always us, never the customer.

const pick = (fields: Record<string, unknown>, test: RegExp) => {
  const key = Object.keys(fields).find(k => test.test(k.toLowerCase()));
  const v = key ? fields[key] : undefined;
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v);
};

export function buildResellerFields(customerFields: Record<string, unknown>, contactUsername: string): Record<string, string> {
  return {
    // Text fields (Liteboosts ignores keys a product doesn't define)
    "Permanent Discord Server Invite": pick(customerFields, /invite/),
    "Discord Server ID": pick(customerFields, /server id/),
    "Discord Username": contactUsername,
    "Discord or Telegram Username": contactUsername,
    // Confirmation checkboxes — the buyer ticked the matching boxes on our checkout.
    "I confirm anti-raid/protection and server applications are disabled.": "true",
    "I confirm that I will not kick, remove, or ban the delivered accounts from my server.": "true",
    "I confirm that I have read and agree to the Terms of Service.": "true",
  };
}
