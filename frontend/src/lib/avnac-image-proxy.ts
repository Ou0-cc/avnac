import { getPublicApiBase } from './public-api-base'

function parseImageUrl(raw: string): URL | null {
  if (typeof window === 'undefined') return null
  try {
    return new URL(raw, window.location.href)
  } catch {
    return null
  }
}

function isProxyUrl(raw: string): boolean {
  const parsed = parseImageUrl(raw)
  if (!parsed) return false
  // Detect wsrv proxy URLs by hostname (e.g. wsrv.nl) or by presence
  // of a `url` search param (some proxies embed the target as `?url=`).
  const hostname = parsed.hostname || ''
  if (hostname.includes('wsrv.nl')) return true
  return parsed.searchParams.has('url')
}

export function getExportSafeImageUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  const parsed = parseImageUrl(trimmed)
  if (!parsed) return trimmed
  if (parsed.protocol === 'data:' || parsed.protocol === 'blob:') return trimmed
  if (parsed.origin === window.location.origin) return trimmed

  // If the URL is already a proxy (possibly nested), try to unwrap
  // the innermost target and re-wrap it only once. This prevents
  // double- or multi-wrapping like wsrv.nl/?url=wsrv.nl/?url=...
  if (isProxyUrl(trimmed)) {
    let current = parsed
    let inner: string | null = null
    // Unwrap nested `url` params until we reach a non-wsrv host
    // or there are no more `url` params.
    while (current) {
      if (!current.searchParams.has('url')) break
      inner = current.searchParams.get('url')
      if (!inner) break
      const next = parseImageUrl(inner)
      if (!next) break
      current = next
      if (!current.hostname.includes('wsrv.nl')) break
    }

    const finalUrl = inner ?? parsed.toString()
    const finalParsed = parseImageUrl(finalUrl)
    if (!finalParsed) return trimmed
    if (finalParsed.protocol === 'data:' || finalParsed.protocol === 'blob:') return finalUrl
    if (finalParsed.origin === window.location.origin) return finalUrl
    if (finalParsed.protocol !== 'http:' && finalParsed.protocol !== 'https:') return finalUrl
    return `https://wsrv.nl/?url=${encodeURIComponent(finalParsed.toString())}`
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return trimmed
  // If the URL host is already wsrv, don't re-wrap.
  if ((parsed.hostname || '').includes('wsrv.nl')) return trimmed

  return `https://wsrv.nl/?url=${encodeURIComponent(parsed.toString())}`
}

export async function loadImageMetadata(
  rawUrl: string,
): Promise<{
  src: string
  naturalWidth: number
  naturalHeight: number
}> {
  const src = getExportSafeImageUrl(rawUrl)
  const img = new Image()
  if (!src.startsWith('data:') && !src.startsWith('blob:')) {
    img.crossOrigin = 'anonymous'
  }
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Could not load image: ${rawUrl}`))
    img.src = src
  })
  return {
    src,
    naturalWidth: Math.max(1, img.naturalWidth || img.width || 1),
    naturalHeight: Math.max(1, img.naturalHeight || img.height || 1),
  }
}
