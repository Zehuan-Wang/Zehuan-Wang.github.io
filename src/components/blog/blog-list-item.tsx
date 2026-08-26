import Link from 'next/link'
import type { Post } from '@/lib/blog'
import { formatBlogListDate } from '@/lib/date'

interface BlogListItemProps {
  post: Post
}

export function BlogListItem({ post }: BlogListItemProps) {
  return (
    <article className="group py-5 first:pt-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
        <time
          dateTime={post.date}
          className="w-16 shrink-0 text-sm text-neutral-500 sm:pt-1"
        >
          {formatBlogListDate(post.date)}
        </time>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-serif font-semibold text-primary">
            <Link
              href={`/blog/${post.slug}/`}
              className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {post.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-500">
            {post.description}
          </p>
          {post.tags.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              {post.tags.join(' · ')}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
