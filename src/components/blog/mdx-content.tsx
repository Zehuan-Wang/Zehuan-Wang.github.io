import Link from 'next/link'
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
import * as runtime from 'react/jsx-runtime'
import { Callout } from '@/components/blog/callout'
import { cn } from '@/lib/utils'

const sharedComponents = {
  Callout,
  a: ({ href, children, className, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = href?.startsWith('http')
    const classes = cn(
      'text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      className
    )

    if (href && !isExternal && href.startsWith('/')) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  },
  img: ({ alt, className, ...props }: ComponentPropsWithoutRef<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ''}
      className={cn('my-6 h-auto max-w-full rounded-md', className)}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre
      className={cn(
        'my-6 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-100 p-4 text-sm dark:border-neutral-300 dark:bg-neutral-100',
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const dataLanguage = (props as { 'data-language'?: string })['data-language']
    const isBlock =
      Boolean(dataLanguage) ||
      className?.includes('language-') ||
      className?.includes('code-highlight')
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className={cn(
          'rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-primary dark:bg-neutral-200',
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mt-10 mb-4 text-3xl font-serif font-bold text-primary">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-10 mb-4 border-b border-neutral-200 pb-2 text-2xl font-serif font-bold text-primary dark:border-neutral-300">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-primary">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-4 leading-relaxed text-neutral-700 last:mb-0 dark:text-neutral-600">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-4 ml-4 list-disc space-y-1 text-neutral-700 dark:text-neutral-600">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-4 ml-4 list-decimal space-y-1 text-neutral-700 dark:text-neutral-600">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="mb-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-accent/50 pl-4 italic text-neutral-600 dark:text-neutral-500">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-primary">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic text-neutral-600 dark:text-neutral-500">{children}</em>
  ),
  hr: () => <hr className="my-10 border-neutral-200 dark:border-neutral-300" />,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 min-w-0 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-neutral-700 dark:text-neutral-600">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-neutral-200 px-3 py-2 font-semibold text-primary dark:border-neutral-300">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-300">{children}</td>
  ),
}

function getMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

interface MDXContentProps {
  code: string
  components?: Record<string, ComponentType>
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = getMDXComponent(code)
  return <Component components={{ ...sharedComponents, ...components }} />
}
