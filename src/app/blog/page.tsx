import type { Metadata } from 'next'
import { BlogIndexClient } from '@/components/blog/blog-index-client'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPublishedPosts, groupPostsByYear } from '@/lib/blog'
import { getConfig } from '@/lib/config'
import { getRuntimeI18nConfig } from '@/lib/i18n/config'
import { buildBlogJsonLd, buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig()
  const title = config.blog?.title ?? 'Blogs'
  const description =
    config.blog?.description ??
    'Writing about research, creative coding, and things I learn along the way.'

  return buildPageMetadata({
    title,
    description,
    path: '/blog/',
  })
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
  const posts = getPublishedPosts()
  const blogTitle = config.blog?.title ?? 'Blogs'

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: config.site.title, path: '/' },
            { name: blogTitle, path: '/blog/' },
          ]),
          buildBlogJsonLd(posts),
        ]}
      />
      <BlogIndexClient
        groups={groups}
        blogByLocale={blogByLocale}
        defaultLocale={runtimeI18n.defaultLocale}
      />
    </>
  )
}
