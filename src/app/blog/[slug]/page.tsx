import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { BlogBackLink, BlogPostHeader } from '@/components/blog/blog-post-header'
import { MDXContent } from '@/components/blog/mdx-content'
import { getAdjacentPosts, getPostBySlug, getPublishedPosts } from '@/lib/blog'
import { getConfig } from '@/lib/config'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {}
  }

  const config = getConfig()
  const canonical = `/blog/${post.slug}/`
  const ogImages = post.cover ? [{ url: post.cover }] : undefined

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: canonical,
      siteName: `${config.author.name}'s Academic Website`,
      publishedTime: post.date,
      images: ogImages,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { previous, next } = getAdjacentPosts(post.slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
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
