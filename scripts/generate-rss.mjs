import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'smol-toml'

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function loadSiteConfig() {
  const configPath = path.join(process.cwd(), 'content', 'config.toml')
  const raw = fs.readFileSync(configPath, 'utf-8')
  return parse(raw)
}

function loadPosts() {
  const postsPath = path.join(process.cwd(), '.velite', 'posts.json')
  if (!fs.existsSync(postsPath)) {
    throw new Error('Missing .velite/posts.json. Run `velite --clean` before generating RSS.')
  }
  const raw = fs.readFileSync(postsPath, 'utf-8')
  return JSON.parse(raw)
}

function toRfc822(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) {
    throw new Error(`Invalid ISO date for RSS: ${isoDate}`)
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return date.toUTCString()
}

function main() {
  const config = loadSiteConfig()
  const siteUrl = (config.site?.url ?? '').replace(/\/$/, '')
  if (!siteUrl) {
    throw new Error('content/config.toml is missing [site].url')
  }

  const siteTitle = config.blog?.title ?? config.site?.title ?? 'Blogs'
  const siteDescription =
    config.blog?.description ?? config.site?.description ?? 'Blog feed'

  const posts = loadPosts()
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}/`
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(`${siteUrl}/blog/`)}</link>
    <description>${escapeXml(siteDescription)}</description>
${items}
  </channel>
</rss>
`

  const outPath = path.join(process.cwd(), 'public', 'rss.xml')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, xml, 'utf-8')
  console.log(`Generated ${outPath} with ${posts.length} post(s).`)
}

main()
