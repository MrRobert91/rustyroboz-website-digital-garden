const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_REQUESTS = 5;
const attempts = new Map<string, number[]>();

export function isContactRateLimited(address: string, now = Date.now()) {
  const recent = (attempts.get(address) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_REQUESTS) {
    attempts.set(address, recent);
    return true;
  }
  recent.push(now);
  attempts.set(address, recent);
  return false;
}

export function resetContactRateLimitForTests() {
  attempts.clear();
}
