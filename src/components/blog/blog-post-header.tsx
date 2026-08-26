'use client'

import Link from 'next/link'
import type { Post } from '@/lib/blog'
import { formatBlogDetailDate } from '@/lib/date'
import { useMessages } from '@/lib/i18n/useMessages'

export function BlogBackLink() {
  const messages = useMessages()

  return (
    <Link
      href="/blog/"
      className="mb-8 inline-flex text-sm text-neutral-500 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
    >
      {messages.blog.backToList}
    </Link>
  )
}

interface BlogPostHeaderProps {
  post: Post
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const messages = useMessages()

  return (
    <header className="mb-10">
      <h1 className="text-3xl font-serif font-bold text-primary sm:text-4xl text-balance">
        {post.title}
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        <time dateTime={post.date}>{formatBlogDetailDate(post.date)}</time>
        <span aria-hidden="true"> · </span>
        <span>
          {post.readingTime} {messages.blog.minRead}
        </span>
      </p>
      {post.tags.length > 0 && (
        <p className="mt-2 text-sm text-neutral-500">{post.tags.join(' · ')}</p>
      )}
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt=""
          className="mt-8 h-auto w-full max-w-full rounded-md"
        />
      ) : null}
    </header>
  )
}
