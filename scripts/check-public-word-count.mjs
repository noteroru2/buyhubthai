import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const target = Number(process.argv.find((arg) => arg.startsWith('--target='))?.split('=')[1] ?? 3500);
const includeRedirects = process.argv.includes('--include-redirects');

const redirectPrefixes = ['/blog', '/sell', '/service-area', '/about', '/contact', '/how-it-works'];
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }

    if (entry.isFile() && entry.name === 'index.html') {
      files.push(full);
    }
  }

  return files;
};

const decodeHtml = (value) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&#x[0-9a-f]+;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ');

const countWords = (html) => {
  const cleaned = decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  let count = 0;
  for (const token of segmenter.segment(cleaned)) {
    if (token.isWordLike) count += 1;
  }

  return count;
};

const files = await walk(root);
const pages = [];

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const pagePath = '/' + path.relative(root, path.dirname(file)).replace(/\\/g, '/');

  if (
    !includeRedirects &&
    redirectPrefixes.some((prefix) => pagePath === prefix || pagePath.startsWith(`${prefix}/`))
  ) {
    continue;
  }

  pages.push({
    path: pagePath,
    words: countWords(html)
  });
}

pages.sort((a, b) => a.words - b.words);

const belowTarget = pages.filter((page) => page.words < target);

console.log(
  JSON.stringify(
    {
      target,
      includeRedirects,
      totalPages: pages.length,
      belowTargetCount: belowTarget.length,
      lowestPages: pages.slice(0, 25),
      belowTarget
    },
    null,
    2
  )
);
