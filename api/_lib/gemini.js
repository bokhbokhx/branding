async function fetchWithRetry(url, options, retries) {
  retries = retries == null ? 2 : retries;
  let lastRes;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const r = await fetch(url, options);
    if (r.status !== 503 && r.status !== 429) return r;
    lastRes = r;
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }
  return lastRes;
}

module.exports = { fetchWithRetry };
