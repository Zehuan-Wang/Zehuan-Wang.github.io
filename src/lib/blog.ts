import { posts, type Post } from '#site/index'
import { getYearFromISODate } from '@/lib/date'

function comparePostsByDateDesc(a: Post, b: Post): number {
  if (a.date === b.date) {
    return a.slug.localeCompare(b.slug)
  }
  return a.date < b.date ? 1 : -1
}

function sortPosts(list: Post[]): Post[] {
  return [...list].sort(comparePostsByDateDesc)
}

export function getAllPosts(): Post[] {
  return sortPosts(posts)
}

export function getPublishedPosts(): Post[] {
  return sortPosts(posts.filter((post) => !post.draft))
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((post) => post.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return getPublishedPosts().map((post) => post.slug)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const post of getPublishedPosts()) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

export function getAdjacentPosts(slug: string): {
  previous: Post | null
  next: Post | null
} {
  const published = getPublishedPosts()
  const index = published.findIndex((post) => post.slug === slug)

  if (index === -1) {
    return { previous: null, next: null }
  }

  // Sorted newest → oldest: previous = older (index + 1), next = newer (index - 1)
  return {
    previous: published[index + 1] ?? null,
    next: published[index - 1] ?? null,
  }
}

export function groupPostsByYear(list: Post[] = getPublishedPosts()): Array<{
  year: number
  posts: Post[]
}> {
  const groups = new Map<number, Post[]>()

  for (const post of list) {
    const year = getYearFromISODate(post.date)
    const existing = groups.get(year)
    if (existing) {
      existing.push(post)
    } else {
      groups.set(year, [post])
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, yearPosts]) => ({
      year,
      posts: sortPosts(yearPosts),
    }))
}

export type { Post }
