import { escHtml } from './format'

export function renderMarkdown(md: string): string {
  if (!md) return ''
  let h = escHtml(md)
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>')
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>')
  h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  h = h.replace(/^## (.+)$/gm,  '<h2>$1</h2>')
  h = h.replace(/^# (.+)$/gm,   '<h1>$1</h1>')
  h = h.replace(/^[•\-*] (.+)$/gm, '<li>$1</li>')
  h = h.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  h = h.split(/\n\n+/).map(block => {
    if (/^<(h[1-4]|ul|ol|li|pre|blockquote)/.test(block.trim())) return block
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('\n')
  return h
}

interface CitationSource {
  url?: string
  title?: string
  section?: string
  snippet?: string
}

export function renderMarkdownWithCitations(md: string, sources: CitationSource[]): string {
  if (!md) return ''
  const html = renderMarkdown(md)
  if (!sources.length) return html

  // Replace [N] citation markers, but skip inside <pre> and <code> blocks
  const parts = html.split(/(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part  // captured code/pre block — leave untouched
    return part.replace(/\[(\d{1,2})\]/g, (match, num) => {
      const idx = parseInt(num, 10) - 1
      if (idx < 0 || idx >= sources.length) return match
      const src = sources[idx]
      const href = src.url || '#'
      const label = escHtml(src.title || src.section || `Source ${num}`)
      const tooltip = src.snippet ? `${label} — ${escHtml(src.snippet)}` : label
      return `<sup><a href="${href}" target="_blank" rel="noopener" class="citation-link" title="${tooltip}">[${num}]</a></sup>`
    })
  }).join('')
}
