import { SITE_URL } from './constants';

/** Normalize path for canonical URLs — no trailing slash except root. */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

export function buildCanonicalUrl(path: string): string {
  const pathname = path.startsWith('http') ? new URL(path).pathname : path;
  return new URL(normalizePathname(pathname), SITE_URL).href;
}
