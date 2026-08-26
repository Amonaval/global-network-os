/**
 * HTML Cleaner + Text Chunker — v5
 *
 * Key fix: proper table extraction
 *   Before: td/th cells extracted individually → "Onboarding process flow" (no context)
 *   After:  tables converted to markdown → "| Use Case | Standard OOTB | Personalization |"
 *           Each row stays together, column headers repeat in every chunk that contains
 *           table rows so the LLM always has the full context.
 *
 * Also: table-heavy pages get their own dedicated chunk per table so
 *       table content is never split mid-row.
 */

const cheerio = require('cheerio');

// ── Table → markdown ───────────────────────────────────────────────────────

/**
 * Convert a <table> element to a readable markdown table string.
 * Handles merged cells (colspan) by repeating content.
 * Skips empty tables.
 */
function tableToMarkdown($, tableEl) {
  const rows = [];

  $(tableEl).find('tr').each((_, tr) => {
    const cells = [];
    $(tr).find('td, th').each((_, cell) => {
      const text    = $(cell).text().replace(/\s+/g, ' ').trim();
      const colspan = parseInt($(cell).attr('colspan') || '1', 10);
      for (let i = 0; i < colspan; i++) cells.push(text);
    });
    if (cells.length > 0) rows.push(cells);
  });

  if (rows.length === 0) return '';

  // Determine column count
  const colCount = Math.max(...rows.map(r => r.length));

  // Pad all rows to same width
  const padded = rows.map(r => {
    while (r.length < colCount) r.push('');
    return r;
  });

  // Build markdown
  const lines = [];
  padded.forEach((row, i) => {
    lines.push('| ' + row.join(' | ') + ' |');
    // Add separator after first row (header)
    if (i === 0) lines.push('| ' + row.map(() => '---').join(' | ') + ' |');
  });

  return lines.join('\n');
}

// ── Main extractor ─────────────────────────────────────────────────────────

function extractText(html, meta = {}) {
  const $ = cheerio.load(html);

  // Remove chrome/navigation noise
  $('script, style, nav, footer, .header, .sidebar, .breadcrumb, ' +
    '.article-nav, .feedback, .edit-page, noscript, iframe, ' +
    '.table-of-contents, .toc, [class*="toc"]').remove();

  // Preserve anchor link text — replace <a> with its text so content inside
  // bare divs/spans is not silently dropped by the element selector below.
  $('a').each((_, el) => { $(el).replaceWith($(el).text()); });

  // Collect headings for metadata
  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push({ level: el.tagName, text });
  });

  // Walk the DOM in document order so tables appear in the right place
  const lines = [];
  let lastHeading = '';

  // Process node by node in DOM order
  $('h1, h2, h3, h4, p, li, pre, code, table, ul, ol').each((_, el) => {
    const tag = el.tagName.toLowerCase();

    // Skip nodes that are children of a table (we handle tables whole)
    if ($(el).closest('table').length > 0 && tag !== 'table') return;

    // Skip list items that are inside a list we'll handle at list level
    if (tag === 'li' && $(el).closest('ul, ol').length > 0) {
      // Only process li if its parent list is NOT in our selector iteration
      // (i.e. the parent ul/ol is nested deeper — handle it inline)
    }

    if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      lines.push('');
      lines.push('#'.repeat(parseInt(tag[1])) + ' ' + text);
      lastHeading = text;

    } else if (tag === 'table') {
      // ── Convert whole table to markdown ──────────────────────────────────
      const md = tableToMarkdown($, el);
      if (md) {
        lines.push('');
        // Prepend heading context so each table chunk is self-contained
        if (lastHeading) lines.push('**' + lastHeading + '**');
        lines.push(md);
        lines.push('');
      }

    } else if (tag === 'pre') {
      const text = $(el).text().trim();
      if (text) { lines.push('```'); lines.push(text); lines.push('```'); }

    } else if (tag === 'code' && $(el).closest('pre').length === 0) {
      const text = $(el).text().trim();
      if (text) lines.push('`' + text + '`');

    } else if (tag === 'p') {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) lines.push(text);

    } else if (tag === 'li') {
      const text = $(el).clone().children('ul, ol').remove().end()
        .text().replace(/\s+/g, ' ').trim();
      if (text) lines.push('• ' + text);
    }
  });

  const fullText = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    title:    meta.title || $('h1').first().text().trim() || 'Untitled',
    url:      meta.url    || '',
    section:  meta.section || '',
    headings,
    text:     fullText,
  };
}

// ── Chunker ────────────────────────────────────────────────────────────────

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into overlapping chunks, with special handling for tables:
 * - A markdown table block is NEVER split mid-row
 * - If a table fits within budget it stays as one chunk
 * - If a table is too large it's split by row groups, always keeping the header row
 */
function chunkText(text, meta = {}, maxTokens = 500, overlapTokens = 60) {
  // Prepend breadcrumb context so every chunk is self-locating for retrieval
  const breadcrumbPrefix = meta.breadcrumb
    ? '**Space:** ' + (meta.spaceKey || meta.section || '') +
      '\n**Page:** ' + meta.breadcrumb + '\n\n'
    : '';
  const fullText = breadcrumbPrefix + text;

  // Split into logical blocks — tables stay as single blocks
  const rawBlocks = fullText.split(/\n\n+/);
  const blocks    = mergeTableBlocks(rawBlocks);

  const chunks   = [];
  let   buffer   = [];
  let   bufTokens = 0;

  const flush = (overlapBlocks = []) => {
    const chunkStr = buffer.join('\n\n').trim();
    if (chunkStr.length < 30) return;

    const headingLine = buffer.find(l => /^#{1,4} /.test(l)) || '';

    chunks.push({
      text:   chunkStr,
      tokens: estimateTokens(chunkStr),
      meta: {
        ...meta,
        chunkIndex:  chunks.length,
        nearHeading: headingLine.replace(/^#+\s*/, ''),
      },
    });

    buffer    = [...overlapBlocks];
    bufTokens = overlapBlocks.reduce((s, b) => s + estimateTokens(b), 0);
  };

  for (const block of blocks) {
    const blockTokens = estimateTokens(block);
    const isTable     = block.includes('| --- |') || block.includes('|---|');

    if (isTable) {
      // Flush current buffer before a table
      if (buffer.length > 0) flush([]);

      if (blockTokens <= maxTokens * 1.5) {
        // Table fits — emit as single chunk
        buffer = [block];
        bufTokens = blockTokens;
        flush([]);
      } else {
        // Large table: split by rows, always keep header
        const tableLines  = block.split('\n');
        const headerLines = tableLines.slice(0, 2); // header + separator
        const dataRows    = tableLines.slice(2);
        const headerText  = headerLines.join('\n');

        let rowBuf   = [headerText];
        let rowToks  = estimateTokens(headerText);

        for (const row of dataRows) {
          const rowTok = estimateTokens(row);
          if (rowToks + rowTok > maxTokens && rowBuf.length > 1) {
            buffer = [rowBuf.join('\n')];
            flush([]);
            rowBuf  = [headerText, row];  // restart with header
            rowToks = estimateTokens(headerText) + rowTok;
          } else {
            rowBuf.push(row);
            rowToks += rowTok;
          }
        }
        if (rowBuf.length > 1) { buffer = [rowBuf.join('\n')]; flush([]); }
      }
      continue;
    }

    // Normal block
    if (bufTokens + blockTokens > maxTokens && buffer.length > 0) {
      const overlapBuf = [];
      let   oc         = 0;
      for (let i = buffer.length - 1; i >= 0; i--) {
        const t = estimateTokens(buffer[i]);
        if (oc + t > overlapTokens) break;
        overlapBuf.unshift(buffer[i]);
        oc += t;
      }
      flush(overlapBuf);
    }

    buffer.push(block);
    bufTokens += blockTokens;
  }

  if (buffer.length > 0) flush();
  return chunks;
}

/**
 * Merge consecutive lines that belong to the same markdown table
 * into a single block so the splitter sees it as one unit.
 */
function mergeTableBlocks(blocks) {
  const merged = [];
  let   tableAcc = null;

  for (const block of blocks) {
    const isTableLine = block.trim().startsWith('|');

    if (isTableLine) {
      if (tableAcc === null) tableAcc = block;
      else tableAcc += '\n' + block;
    } else {
      if (tableAcc !== null) { merged.push(tableAcc); tableAcc = null; }
      merged.push(block);
    }
  }
  if (tableAcc !== null) merged.push(tableAcc);
  return merged.filter(b => b.trim().length > 0);
}

// ── Document-type detection ────────────────────────────────────────────────

const LEGAL_PATTERNS = [
  /\bwhereas\b/i, /\bhereinafter\b/i, /\bhereby\b/i, /\bin witness whereof\b/i,
  /\bparty of the (first|second)\b/i, /\bnotwithstanding\b/i, /\bpursuant to\b/i,
  /\barthicle\s+[IVX\d]+/i, /\bsection\s+\d+\.\d+/i, /\bclause\s+\d+/i,
];

const RESEARCH_PATTERNS = [
  /\babstract\b/i, /\bmethodology\b/i, /\bhypothesis\b/i, /\bexperiment(al)?\b/i,
  /\bfindings\b/i, /\bdiscussion\b/i, /\bconclusion(s)?\b/i, /\breferences\b/i,
  /\bliterature review\b/i, /\bresearch question\b/i,
];

function detectDocType(text) {
  const legalHits    = LEGAL_PATTERNS.filter(p => p.test(text)).length;
  const researchHits = RESEARCH_PATTERNS.filter(p => p.test(text)).length;
  if (legalHits >= 3)    return 'legal';
  if (researchHits >= 4) return 'research';
  return 'standard';
}

// ── Legal hierarchical chunker ─────────────────────────────────────────────

// Splits at Article/Section/Clause boundaries, carries heading context forward
function chunkLegal(text, meta = {}, maxTokens = 500, overlapTokens = 60) {
  // Identify top-level boundaries
  const BOUNDARY_RE = /^(article\s+[\divx]+|section\s+\d+[\.\d]*|clause\s+\d+[\.\d]*|\d+\.\s)/im;

  const paragraphs = text.split(/\n\n+/);
  const chunks   = [];
  let   buffer   = [];
  let   bufTok   = 0;
  let   lastHead = '';

  const flush = () => {
    const str = buffer.join('\n\n').trim();
    if (str.length < 30) return;
    chunks.push({
      text:   str,
      tokens: estimateTokens(str),
      meta: { ...meta, chunkIndex: chunks.length, nearHeading: lastHead, docType: 'legal' },
    });
    // Carry the heading into the overlap
    buffer   = lastHead ? [lastHead] : [];
    bufTok   = lastHead ? estimateTokens(lastHead) : 0;
  };

  for (const para of paragraphs) {
    const tok   = estimateTokens(para);
    const isBoundary = BOUNDARY_RE.test(para.substring(0, 120));

    if (isBoundary) {
      if (buffer.length > 0) flush();
      lastHead = para.substring(0, 120).trim();
    }

    if (bufTok + tok > maxTokens && buffer.length > 0) flush();
    buffer.push(para);
    bufTok += tok;
  }
  if (buffer.length > 0) flush();
  return chunks;
}

// ── Semantic chunker for research papers ──────────────────────────────────

// Splits at section headings; within a section, splits at paragraph boundaries
// when the next paragraph starts a new sub-topic (detected via heading or length)
function chunkSemantic(text, meta = {}, maxTokens = 500, overlapTokens = 60) {
  const HEADING_RE = /^#{1,4} /m;

  // Split at headings first
  const sections = [];
  const rawLines = text.split('\n');
  let current = { heading: '', lines: [] };

  for (const line of rawLines) {
    if (HEADING_RE.test(line)) {
      if (current.lines.length > 0) sections.push({ ...current });
      current = { heading: line.trim(), lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0) sections.push(current);

  const chunks = [];

  for (const sec of sections) {
    const secText = sec.lines.join('\n').trim();
    if (secText.length < 30) continue;
    const secTok  = estimateTokens(secText);

    if (secTok <= maxTokens) {
      chunks.push({
        text:   secText,
        tokens: secTok,
        meta:   { ...meta, chunkIndex: chunks.length, nearHeading: sec.heading.replace(/^#+\s*/, ''), docType: 'research' },
      });
    } else {
      // Section is large — split by paragraphs within section
      const paras = secText.split(/\n\n+/);
      let buf  = [];
      let bufT = 0;

      const flush = () => {
        const str = buf.join('\n\n').trim();
        if (str.length < 30) return;
        chunks.push({
          text:   str,
          tokens: estimateTokens(str),
          meta:   { ...meta, chunkIndex: chunks.length, nearHeading: sec.heading.replace(/^#+\s*/, ''), docType: 'research' },
        });
        // Overlap: keep last paragraph
        buf  = buf.slice(-1);
        bufT = buf.reduce((s, p) => s + estimateTokens(p), 0);
      };

      for (const para of paras) {
        const t = estimateTokens(para);
        if (bufT + t > maxTokens && buf.length > 0) flush();
        buf.push(para);
        bufT += t;
      }
      if (buf.length > 0) flush();
    }
  }

  return chunks;
}

// ── Type-aware chunking entry point ───────────────────────────────────────

function chunkByDocType(text, meta = {}, maxTokens = 500, overlapTokens = 60) {
  const enabled = (process.env.DOC_TYPE_CHUNKING || 'false').toLowerCase() === 'true';
  if (!enabled) return chunkText(text, meta, maxTokens, overlapTokens);

  const docType = detectDocType(text);
  if (docType === 'legal')    return chunkLegal(text, meta, maxTokens, overlapTokens);
  if (docType === 'research') return chunkSemantic(text, meta, maxTokens, overlapTokens);
  return chunkText(text, meta, maxTokens, overlapTokens);
}

module.exports = { extractText, chunkText, chunkByDocType, detectDocType, chunkLegal, chunkSemantic, estimateTokens, tableToMarkdown };
