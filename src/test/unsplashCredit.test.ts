import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// These only use the photo URL for og:image / twitter:image meta tags, never render it.
const META_ONLY = new Set(['SEO.tsx', 'GuideArticle.tsx']);
const IMAGE_CALLS = /\b(getCityImageUrl|getCityThumbnailUrl|useCityImage)\s*\(/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('Unsplash credit', () => {
  it('every component rendering a city photo imports UnsplashCredit', () => {
    const files = ['src/components', 'src/pages']
      .flatMap(walk)
      .filter((f) => f.endsWith('.tsx') && !META_ONLY.has(f.split('/').pop()!));
    const callers = files.filter((f) => IMAGE_CALLS.test(readFileSync(f, 'utf8')));
    expect(callers.length).toBeGreaterThan(0);
    const missing = callers.filter(
      (f) => !/import\s+UnsplashCredit\b[^;]*UnsplashAttribution/.test(readFileSync(f, 'utf8')) &&
        !/import\s+\w+\s+from\s+'@\/components\/UnsplashAttribution'/.test(readFileSync(f, 'utf8')),
    );
    expect(missing).toEqual([]);
  });
});
