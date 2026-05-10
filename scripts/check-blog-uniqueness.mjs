import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const MIN_LENGTH = 140;
const MAX_OCCURRENCES = 2;

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => file.endsWith('.md'))
  .sort();

function stripFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\s*/u, '');
}

function normalizeParagraph(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

function extractParagraphs(markdown) {
  const lines = stripFrontmatter(markdown).split(/\r?\n/u);
  const paragraphs = [];
  let buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    const paragraph = normalizeParagraph(buffer.join(' '));
    if (paragraph.length >= MIN_LENGTH) paragraphs.push(paragraph);
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    if (
      /^#{1,6}\s/u.test(trimmed) ||
      /^[-*+]\s/u.test(trimmed) ||
      /^\d+\.\s/u.test(trimmed) ||
      /^>\s/u.test(trimmed) ||
      /^```/u.test(trimmed) ||
      /^\|/u.test(trimmed)
    ) {
      flush();
      continue;
    }

    buffer.push(trimmed);
  }

  flush();
  return paragraphs;
}

const paragraphMap = new Map();

for (const file of files) {
  const fullPath = path.join(BLOG_DIR, file);
  const markdown = fs.readFileSync(fullPath, 'utf8');
  const slug = file.replace(/\.md$/u, '');

  for (const paragraph of extractParagraphs(markdown)) {
    if (!paragraphMap.has(paragraph)) paragraphMap.set(paragraph, new Set());
    paragraphMap.get(paragraph).add(slug);
  }
}

const repeated = [...paragraphMap.entries()]
  .map(([paragraph, slugs]) => ({ paragraph, slugs: [...slugs].sort() }))
  .filter((entry) => entry.slugs.length > MAX_OCCURRENCES)
  .sort((a, b) => b.slugs.length - a.slugs.length || b.paragraph.length - a.paragraph.length);

if (repeated.length) {
  console.error(
    JSON.stringify(
      {
        status: 'failed',
        maxOccurrences: MAX_OCCURRENCES,
        repeated: repeated.slice(0, 20).map((entry) => ({
          count: entry.slugs.length,
          slugs: entry.slugs,
          paragraph: entry.paragraph.slice(0, 220)
        }))
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: 'ok',
      files: files.length,
      maxOccurrences: MAX_OCCURRENCES,
      minLength: MIN_LENGTH,
      repeatedCount: 0
    },
    null,
    2
  )
);
