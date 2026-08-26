/**
 * HTML Cleaner + Text Chunker
 * Converts raw HTML pages from the crawler into clean, overlapping text chunks
 * ready for embedding.
 */

const cheerio = require('cheerio');

// ── HTML → clean text ──────────────────────────────────────────────────────

/**
 * Extract clean, readable text from a page's raw HTML.
 * Returns { title, text, headings[] }
 */
function extractText(html, meta = {}) {
  const $ = cheerio.load(html);

  // Remove noisy elements
  $('script, style, nav, footer, .header, .sidebar, .breadcrumb, ' +
    '.article-nav, .feedback, .edit-page, noscript, iframe').remove();

  // Collect headings for metadata
  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push({ level: el.tagName, text });
  });

  // Convert to structured text — preserve heading hierarchy
  let lines = [];
  $('h1, h2, h3, h4, p, li, pre, code, td, th').each((_, el) => {
    const tag  = el.tagName.toLowerCase();
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (!text) return;

    if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
      lines.push('');
      lines.push(`${'#'.repeat(parseInt(tag[1]))} ${text}`);
    } else if (tag === 'li') {
      lines.push(`• ${text}`);
    } else if (['pre', 'code'].includes(tag)) {
      lines.push('```');
      lines.push(text);
      lines.push('```');
    } else {
      lines.push(text);
    }
  });

  const fullText = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    title:    meta.title || $('h1').first().text().trim() || 'Untitled',
    url:      meta.url || '',
    section:  meta.section || '',
    headings,
    text:     fullText,
  };
}

// ── Chunker ────────────────────────────────────────────────────────────────

/**
 * Naive token estimator (~4 chars per token for English)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into overlapping chunks.
 * Tries to split on paragraph/heading boundaries first.
 *
 * @param {string} text        - clean text
 * @param {object} meta        - { title, url, section }
 * @param {number} maxTokens   - target chunk size in tokens
 * @param {number} overlapTokens - overlap between consecutive chunks
 * @returns {Array<{text, tokens, meta}>}
 */
function chunkText(text, meta = {}, maxTokens = 600, overlapTokens = 80) {
  // Split by paragraph / heading boundaries
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);

  const chunks   = [];
  let   buffer   = [];
  let   bufTokens = 0;

  const flush = (overlap = []) => {
    const chunkText = buffer.join('\n\n').trim();
    if (chunkText.length < 40) return; // skip tiny fragments

    // Extract the nearest heading above this chunk for context
    const headingLine = buffer.find(l => l.startsWith('#')) || '';

    chunks.push({
      text:   chunkText,
      tokens: estimateTokens(chunkText),
      meta: {
        ...meta,
        chunkIndex:  chunks.length,
        nearHeading: headingLine.replace(/^#+\s*/, ''),
      },
    });

    // Start next chunk with overlap paragraphs
    buffer    = [...overlap];
    bufTokens = overlap.reduce((s, p) => s + estimateTokens(p), 0);
  };

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    if (bufTokens + paraTokens > maxTokens && buffer.length > 0) {
      // Compute overlap: take last N paragraphs that fit within overlapTokens
      const overlapBuf = [];
      let overlapCount = 0;
      for (let i = buffer.length - 1; i >= 0; i--) {
        const t = estimateTokens(buffer[i]);
        if (overlapCount + t > overlapTokens) break;
        overlapBuf.unshift(buffer[i]);
        overlapCount += t;
      }
      flush(overlapBuf);
    }

    buffer.push(para);
    bufTokens += paraTokens;
  }

  if (buffer.length > 0) flush();

  return chunks;
}

module.exports = { extractText, chunkText, estimateTokens };
