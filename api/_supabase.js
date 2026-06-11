const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function normalizeName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function requireConfig(res) {
  if (isConfigured()) return true;
  json(res, 503, {
    error: "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
  });
  return false;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

async function supabase(path, options = {}) {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.hint || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function handleError(res, error) {
  const status = error.status && error.status < 500 ? error.status : 500;
  json(res, status, {
    error: error.message || "Something went wrong.",
    details: error.details || undefined
  });
}

module.exports = {
  handleError,
  isConfigured,
  json,
  normalizeName,
  readBody,
  requireConfig,
  supabase
};
