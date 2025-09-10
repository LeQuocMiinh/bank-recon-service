export async function validateCSVRequest(c, next) {
  const contentType = c.req.header("Content-Type") || "";
  if (!contentType.startsWith("multipart/form-data")) {
    return c.json({ ok: false, error: "Content-Type must be multipart/form-data" }, 400);
  }

  const formData = await c.req.formData(); 
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json({ ok: false, error: "Missing 'file' field" }, 400);
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return c.json({ ok: false, error: "File must be CSV" }, 400);
  }

  c.set("file", file);

  await next();
}
