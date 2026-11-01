import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'
import { getConfig } from '@/lib/config'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

function parseIsoDate(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getConfig()
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()

  const add = (
    pathname: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    lastModified?: Date
  ) => {
    const url = absoluteUrl(pathname)
    entries.set(url, {
      url,
      priority,
      changeFrequency,
      ...(lastModified ? { lastModified } : {}),
    })
  }

  add('/', 1, 'weekly')
  add('/blog/', 0.9, 'weekly')

  for (const item of config.navigation) {
    if (item.type !== 'page' || item.href === '/') continue
    add(item.href, 0.6, 'monthly')
  }

  for (const post of getPublishedPosts()) {
    add(`/blog/${post.slug}/`, 0.7, 'monthly', parseIsoDate(post.date))
  }

  return [...entries.values()]
}
