export interface CookieMetadata {
  name: string;
  value: string;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: string;
}

export interface DecodedCookie {
  raw: string;
  decoded: string;
  json?: any;
}

/**
 * Parse document.cookie string into key-value pairs
 */
export function parseCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!document.cookie) {
    return cookies;
  }

  document.cookie.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    if (name && valueParts.length > 0) {
      cookies[name.trim()] = valueParts.join('=').trim();
    }
  });

  return cookies;
}

/**
 * Get specific cookie by name
 */
export function getCookie(name: string): string | null {
  const cookies = parseCookies();
  return cookies[name] || null;
}

/**
 * Decode cookie value - try URL decode, base64 decode, JSON parse
 */
export function decodeCookieValue(value: string): DecodedCookie {
  const result: DecodedCookie = {
    raw: value,
    decoded: value
  };

  try {
    // Try URL decoding
    const urlDecoded = decodeURIComponent(value);
    result.decoded = urlDecoded;

    // Try JSON parsing
    try {
      result.json = JSON.parse(urlDecoded);
    } catch {
      // Try base64 decoding
      try {
        const base64Decoded = atob(urlDecoded);
        result.decoded = base64Decoded;

        // Try parsing the base64 decoded value as JSON
        try {
          result.json = JSON.parse(base64Decoded);
        } catch {
          // Not JSON, that's fine
        }
      } catch {
        // Not base64, that's fine
      }
    }
  } catch {
    // Decoding failed, use raw value
  }

  return result;
}

/**
 * Parse cookie metadata from Set-Cookie header format
 * Note: This is for display purposes only. JavaScript cannot access
 * cookie attributes like HttpOnly, Secure, etc. from document.cookie
 */
export function parseCookieMetadata(cookieString: string): CookieMetadata {
  const parts = cookieString.split(';').map(p => p.trim());
  const [nameValue, ...attributes] = parts;
  const [name, value] = nameValue.split('=');

  const metadata: CookieMetadata = {
    name: name.trim(),
    value: value ? value.trim() : ''
  };

  attributes.forEach(attr => {
    const [key, val] = attr.split('=');
    const lowerKey = key.toLowerCase();

    if (lowerKey === 'expires') {
      metadata.expires = new Date(val);
    } else if (lowerKey === 'domain') {
      metadata.domain = val;
    } else if (lowerKey === 'path') {
      metadata.path = val;
    } else if (lowerKey === 'secure') {
      metadata.secure = true;
    } else if (lowerKey === 'samesite') {
      metadata.sameSite = val;
    }
  });

  return metadata;
}

/**
 * Calculate cookie size in bytes
 */
export function getCookieSize(value: string): number {
  return new Blob([value]).size;
}
