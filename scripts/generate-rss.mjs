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

  const authorName = config.author?.name ?? siteTitle
  const authorEmail = config.author && config.social?.email ? config.social.email : ''
  const newestDate = posts[0]?.date

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}/`
      const categories = (post.tags ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')
      const author = authorEmail
        ? `      <author>${escapeXml(`${authorEmail} (${authorName})`)}</author>\n`
        : ''

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
${author}${categories}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(`${siteUrl}/blog/`)}</link>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${newestDate ? toRfc822(newestDate) : new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`

  const postLines = posts
    .map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug}/): ${post.description}`)
    .join('\n')

  const identity = [
    config.social?.orcid ? `- ORCID: ${config.social.orcid}` : '',
    config.social?.google_scholar ? `- Google Scholar: ${config.social.google_scholar}` : '',
    config.social?.github ? `- GitHub: ${config.social.github}` : '',
  ].filter(Boolean).join('\n')

  const llms = `# ${config.site?.title ?? authorName}

> ${config.site?.description ?? siteDescription}

- Website: ${siteUrl}/
- Blog: ${siteUrl}/blog/
- Publications: ${siteUrl}/publications/
- CV: ${siteUrl}/cv/
- RSS: ${siteUrl}/rss.xml
${identity}

## Blog

${postLines || '- No published posts yet.'}
`

  const publicDir = path.join(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })

  const rssPath = path.join(publicDir, 'rss.xml')
  const llmsPath = path.join(publicDir, 'llms.txt')
  fs.writeFileSync(rssPath, xml, 'utf-8')
  fs.writeFileSync(llmsPath, llms, 'utf-8')
  console.log(`Generated ${rssPath} with ${posts.length} post(s).`)
  console.log(`Generated ${llmsPath}.`)
}

main()
