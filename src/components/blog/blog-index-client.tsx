'use client'

import { BlogListItem } from '@/components/blog/blog-list-item'
import type { Post } from '@/lib/blog'
import { useMessages } from '@/lib/i18n/useMessages'
import { useLocaleStore } from '@/lib/stores/localeStore'

interface BlogCopy {
  title: string
  description: string
}

interface BlogIndexClientProps {
  groups: Array<{ year: number; posts: Post[] }>
  blogByLocale: Record<string, BlogCopy>
  defaultLocale: string
}

export function BlogIndexClient({
  groups,
  blogByLocale,
  defaultLocale,
}: BlogIndexClientProps) {
  const locale = useLocaleStore((state) => state.locale)
  const messages = useMessages()
  const blog =
    blogByLocale[locale] ||
    blogByLocale[defaultLocale] ||
    Object.values(blogByLocale)[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">
            {blog?.title ?? 'Blogs'}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-500 max-w-2xl">
            {blog?.description ?? ''}
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-500">{messages.blog.empty}</p>
        ) : (
          <div className="space-y-12">
            {groups.map(({ year, posts }) => (
              <section key={year} aria-labelledby={`year-${year}`}>
                <h2
                  id={`year-${year}`}
                  className="mb-4 border-b border-neutral-200 pb-2 text-sm font-medium tracking-wide text-neutral-500 dark:border-neutral-300"
                >
                  {year}
                </h2>
                <div className="divide-y divide-neutral-200/70 dark:divide-neutral-300/40">
                  {posts.map((post) => (
                    <BlogListItem key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
