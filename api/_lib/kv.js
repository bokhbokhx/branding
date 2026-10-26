const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvFetch(path, options) {
  options = options || {};
  const res = await fetch(KV_URL + path, {
    method: options.method || "POST",
    headers: Object.assign({ Authorization: "Bearer " + KV_TOKEN }, options.headers || {}),
    body: options.body
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("KV error " + res.status + ": " + text);
  }
  return res.json();
}

async function kvSet(key, value) {
  const body = typeof value === "string" ? value : JSON.stringify(value);
  await kvFetch("/set/" + encodeURIComponent(key), { body });
}

async function kvGet(key) {
  const data = await kvFetch("/get/" + encodeURIComponent(key));
  if (data.result == null) return null;
  try {
    return JSON.parse(data.result);
  } catch (e) {
    return data.result;
  }
}

async function kvKeys(pattern) {
  const data = await kvFetch("/keys/" + encodeURIComponent(pattern));
  return data.result || [];
}

async function kvDel(key) {
  await kvFetch("/del/" + encodeURIComponent(key));
}

module.exports = { kvSet, kvGet, kvKeys, kvDel };
