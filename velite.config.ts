import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkMath from 'remark-math'
import { defineCollection, defineConfig, s } from 'velite'

const posts = defineCollection({
  name: 'Post',
  pattern: 'blogs/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(200),
      date: s.isodate(),
      description: s.string().max(500),
      tags: s.array(s.string()).default([]),
      cover: s.string().optional(),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const normalizedPath = meta.path.replace(/\\/g, '/')
      const filename = normalizedPath.split('/').pop() ?? ''
      const slug = filename.replace(/\.mdx?$/, '')

      return {
        title: data.title,
        date: data.date,
        description: data.description,
        tags: data.tags,
        cover: data.cover,
        draft: data.draft,
        code: data.code,
        slug,
        readingTime: Math.max(1, Math.ceil(data.metadata.readingTime)),
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark',
          },
          keepBackground: false,
        },
      ],
    ],
  },
})
