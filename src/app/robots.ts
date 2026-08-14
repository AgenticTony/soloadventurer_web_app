import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.soloadventurer.travel'

/**
 * robots.txt — allow everything public; no AI-crawler games, nothing to hide.
 * The authed app surfaces are client-side and not in the sitemap anyway.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
