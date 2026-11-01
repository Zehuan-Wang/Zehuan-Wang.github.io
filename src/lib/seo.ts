import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { getConfig } from '@/lib/config'
import { getTomlContent } from '@/lib/content'
import type { Publication } from '@/types/publication'

type JsonLdNode = Record<string, unknown>

type PageMetadataInput = {
  title?: string
  absoluteTitle?: string
  description?: string
  path: string
  openGraphType?: 'website' | 'article'
  publishedTime?: string
  tags?: string[]
  images?: string[]
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
}

export function getSiteUrl(): string {
  const configured = getConfig().site.url?.trim()
  return (configured || 'https://zehuan-wang.github.io').replace(/\/$/, '')
}

export function absoluteUrl(pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname

  const siteUrl = getSiteUrl()
  if (!pathname || pathname === '/') return `${siteUrl}/`

  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const looksLikeFile = /\.[a-z0-9]+$/i.test(withLeadingSlash)
  if (looksLikeFile) return `${siteUrl}${withLeadingSlash}`

  return `${siteUrl}${withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`}`
}

export function getDefaultSocialImage(): string | undefined {
  const avatar = getConfig().author.avatar?.trim()
  if (!avatar) return undefined
  if (/^https?:\/\//i.test(avatar)) return avatar

  const relative = avatar.replace(/^\//, '')
  if (!fs.existsSync(path.join(process.cwd(), 'public', relative))) return undefined
  return avatar
}

function getResearchInterests(): string[] {
  const about = getTomlContent<{ profile?: { research_interests?: string[] } }>('about.toml')
  return about?.profile?.research_interests ?? []
}

export function buildSiteKeywords(): string[] {
  const config = getConfig()
  const zh = getConfig('zh')

  return uniqueStrings([
    config.author.name,
    zh.author.name,
    config.author.institution,
    zh.author.institution,
    'Tongji University',
    '同济大学',
    config.author.title,
    'PhD',
    'HCI',
    'human-computer interaction',
    'human-AI collaboration',
    'AI agents',
    ...getResearchInterests(),
  ])
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const config = getConfig()
  const explicitImage = input.images?.[0]
  const socialImage = explicitImage ?? getDefaultSocialImage()
  const resolvedTitle = input.absoluteTitle ?? input.title
  const title = input.absoluteTitle ? { absolute: input.absoluteTitle } : input.title
  const images = socialImage
    ? [{ url: socialImage, alt: resolvedTitle ?? config.site.title }]
    : undefined
  const keywords = input.tags && input.tags.length > 0
    ? uniqueStrings([config.author.name, getConfig('zh').author.name, ...input.tags])
    : undefined

  const openGraph = input.openGraphType === 'article'
    ? {
        title: resolvedTitle,
        description: input.description,
        type: 'article' as const,
        url: input.path,
        siteName: config.site.title,
        publishedTime: input.publishedTime,
        modifiedTime: input.publishedTime,
        authors: [config.author.name],
        tags: input.tags,
        images,
      }
    : {
        title: resolvedTitle,
        description: input.description,
        type: 'website' as const,
        url: input.path,
        siteName: config.site.title,
        images,
      }

  return {
    ...(title ? { title } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(keywords ? { keywords } : {}),
    authors: [{ name: config.author.name, url: absoluteUrl('/') }],
    alternates: {
      canonical: input.path,
      types: {
        'application/rss+xml': '/rss.xml',
      },
    },
    openGraph,
    twitter: {
      card: explicitImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: input.description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  }
}

function personNode(): JsonLdNode {
  const config = getConfig()
  const zh = getConfig('zh')
  const siteUrl = getSiteUrl()
  const sameAs = uniqueStrings([
    config.social.orcid,
    config.social.google_scholar,
    config.social.github,
    config.social.linkedin,
  ])

  return {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: config.author.name,
    alternateName: zh.author.name === config.author.name ? undefined : zh.author.name,
    jobTitle: config.author.title,
    description: config.site.description,
    url: absoluteUrl('/'),
    email: config.social.email,
    address: config.social.location,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: config.author.institution,
      alternateName: zh.author.institution === config.author.institution ? undefined : zh.author.institution,
    },
    knowsAbout: getResearchInterests(),
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}

export function buildSiteGraph(): JsonLdNode {
  const config = getConfig()
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(),
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: absoluteUrl('/'),
        name: config.site.title,
        alternateName: getConfig('zh').site.title,
        description: config.site.description,
        inLanguage: ['en', 'zh-CN'],
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  }
}

export function buildProfilePageJsonLd(): JsonLdNode {
  const config = getConfig()
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/#profile`,
    url: absoluteUrl('/'),
    name: config.site.title,
    description: config.site.description,
    inLanguage: ['en', 'zh-CN'],
    mainEntity: { '@id': `${siteUrl}/#person` },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

type BlogPostSeo = {
  title: string
  description: string
  date: string
  slug: string
  tags: string[]
  series?: string
  readingTime: number
  cover?: string
}

export function buildBlogJsonLd(posts: BlogPostSeo[]): JsonLdNode {
  const config = getConfig()
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}/blog/#blog`,
    name: config.blog?.title ?? 'Blog',
    description: config.blog?.description,
    url: absoluteUrl('/blog/'),
    inLanguage: 'en',
    author: { '@id': `${siteUrl}/#person` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: absoluteUrl(`/blog/${post.slug}/`),
    })),
  }
}

export function buildBlogPostingJsonLd(post: BlogPostSeo): JsonLdNode {
  const config = getConfig()
  const siteUrl = getSiteUrl()
  const url = absoluteUrl(`/blog/${post.slug}/`)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en',
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    articleSection: post.series,
    timeRequired: `PT${post.readingTime}M`,
    url,
    mainEntityOfPage: url,
    image: post.cover ? absoluteUrl(post.cover) : undefined,
    author: { '@id': `${siteUrl}/#person` },
    publisher: { '@id': `${siteUrl}/#person` },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${siteUrl}/blog/#blog`,
      name: config.blog?.title ?? 'Blog',
      url: absoluteUrl('/blog/'),
    },
  }
}

export function buildPublicationsJsonLd(input: {
  title: string
  description?: string
  path: string
  publications: Publication[]
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.publications.map((publication, index) => {
        const venue = publication.journal || publication.conference
        const doi = publication.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'ScholarlyArticle',
            name: publication.title,
            author: publication.authors.map((author) => ({
              '@type': 'Person',
              name: author.name,
            })),
            datePublished: String(publication.year),
            url: publication.url,
            sameAs: doi ? `https://doi.org/${doi}` : undefined,
            isPartOf: venue
              ? {
                  '@type': publication.journal ? 'Periodical' : 'Book',
                  name: venue,
                }
              : undefined,
          },
        }
      }),
    },
  }
}
