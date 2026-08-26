'use client'

import Link from 'next/link'
import type { Post } from '@/lib/blog'
import { useMessages } from '@/lib/i18n/useMessages'

interface BlogPaginationProps {
  previous: Post | null
  next: Post | null
}

export function BlogPagination({ previous, next }: BlogPaginationProps) {
  const messages = useMessages()

  if (!previous && !next) {
    return null
  }

  return (
    <nav
      aria-label={messages.blog.postNavigation}
      className="mt-12 flex flex-col gap-4 border-t border-neutral-200 pt-8 sm:flex-row sm:items-start sm:justify-between dark:border-neutral-300"
    >
      <div className="min-w-0 sm:max-w-[45%]">
        {previous ? (
          <Link
            href={`/blog/${previous.slug}/`}
            className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${messages.blog.previous}: ${previous.title}`}
          >
            <span className="text-xs text-neutral-500">{messages.blog.previous}</span>
            <span className="mt-1 block text-sm font-medium text-primary group-hover:text-accent">
              {previous.title}
            </span>
          </Link>
        ) : null}
      </div>
      <div className="min-w-0 sm:max-w-[45%] sm:text-right">
        {next ? (
          <Link
            href={`/blog/${next.slug}/`}
            className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${messages.blog.next}: ${next.title}`}
          >
            <span className="text-xs text-neutral-500">{messages.blog.next}</span>
            <span className="mt-1 block text-sm font-medium text-primary group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
