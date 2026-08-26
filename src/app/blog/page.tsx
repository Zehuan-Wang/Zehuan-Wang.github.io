import type { Metadata } from 'next'
import { BlogIndexClient } from '@/components/blog/blog-index-client'
import { groupPostsByYear } from '@/lib/blog'
import { getConfig } from '@/lib/config'
import { getRuntimeI18nConfig } from '@/lib/i18n/config'

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig()
  const title = config.blog?.title ?? 'Blogs'
  const description =
    config.blog?.description ??
    'Writing about research, creative coding, and things I learn along the way.'

  return {
    title,
    description,
    alternates: {
      canonical: '/blog/',
      types: {
        'application/rss+xml': '/rss.xml',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: '/blog/',
    },
  }
}

export default function BlogIndexPage() {
  const config = getConfig()
  const runtimeI18n = getRuntimeI18nConfig(config.i18n)
  const targetLocales = runtimeI18n.enabled
    ? runtimeI18n.locales
    : [runtimeI18n.defaultLocale]

  const blogByLocale: Record<string, { title: string; description: string }> = {}
  for (const locale of targetLocales) {
    const localized = getConfig(locale)
    blogByLocale[locale] = {
      title: localized.blog?.title ?? 'Blogs',
      description:
        localized.blog?.description ??
        'Writing about research, creative coding, and things I learn along the way.',
    }
  }

  const groups = groupPostsByYear()

  return (
    <BlogIndexClient
      groups={groups}
      blogByLocale={blogByLocale}
      defaultLocale={runtimeI18n.defaultLocale}
    />
  )
}
