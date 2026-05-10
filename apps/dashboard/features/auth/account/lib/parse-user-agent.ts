export function parseUserAgent(ua: string): string {
  if (!ua) return "Unknown device";

  let browser = "Unknown browser";
  // Check Edge before Chrome — Edge UA contains "Chrome"
  if (/Edg\/[\d.]+/i.test(ua)) {
    browser = "Edge";
  } else if (/Chrome\/[\d.]+/i.test(ua)) {
    browser = "Chrome";
  } else if (/Firefox\/[\d.]+/i.test(ua)) {
    browser = "Firefox";
  } else if (/Safari\/[\d.]+/i.test(ua)) {
    browser = "Safari";
  }

  let os = "Unknown OS";
  if (/iPhone|iPad/i.test(ua)) {
    os = "iOS";
  } else if (/Android/i.test(ua)) {
    os = "Android";
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/Windows/i.test(ua)) {
    os = "Windows";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
}
