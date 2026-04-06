/**
 * Matches API requests whether {@link HttpRequest.url} is relative (`/api/...`) or absolute
 * (`http://localhost:8080/api/...`) so the auth header is applied consistently.
 */
export function requestTargetsApiBase(reqUrl: string, apiBase: string): boolean {
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    return reqUrl.startsWith(apiBase);
  }
  const path = pathnameOnly(reqUrl);
  return path === apiBase || path.startsWith(`${apiBase}/`);
}

function pathnameOnly(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.split('?')[0];
}
