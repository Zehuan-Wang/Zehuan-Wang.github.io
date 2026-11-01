import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { BlogBackLink, BlogPostHeader } from '@/components/blog/blog-post-header'
import { MDXContent } from '@/components/blog/mdx-content'
import { JsonLd } from '@/components/seo/JsonLd'
import { getAdjacentPosts, getPostBySlug, getPublishedPosts } from '@/lib/blog'
import { getConfig } from '@/lib/config'
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  const published = getPublishedPosts()

  // `output: "export"` rejects an empty generateStaticParams() result.
  // Use a placeholder that resolves to notFound() when there are no posts.
  if (published.length === 0) {
    return [{ slug: '__no_posts__' }]
  }

  return published.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {}
  }

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}/`,
    openGraphType: 'article',
    publishedTime: post.date,
    tags: post.tags,
    images: post.cover ? [post.cover] : undefined,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { previous, next } = getAdjacentPosts(post.slug)
  const config = getConfig()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: config.site.title, path: '/' },
            { name: config.blog?.title ?? 'Blogs', path: '/blog/' },
            { name: post.title, path: `/blog/${post.slug}/` },
          ]),
          buildBlogPostingJsonLd(post),
        ]}
      />
      <article className="mx-auto w-full max-w-[720px] min-w-0">
        <BlogBackLink />
        <BlogPostHeader post={post} />
        <div className="blog-prose min-w-0">
          <MDXContent code={post.code} />
        </div>
        <BlogPagination previous={previous} next={next} />
      </article>
    </div>
  )
}
