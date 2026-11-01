import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Page not found</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-500">
        This page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex text-accent underline decoration-accent/40 underline-offset-4"
      >
        Back home
      </Link>
    </div>
  )
}
