import { describe, expect, it } from 'vitest';
import type { Guide } from '@/data/guides';
import { GuideDatabaseTimeoutError, mergeGuides, withTimeout } from '@/lib/guideCatalog';

function guide(partial: Pick<Guide, 'id' | 'slug' | 'title'> & Partial<Guide>): Guide {
  return {
    excerpt: 'Excerpt long enough to stand in for a real guide summary in tests.',
    date: '2026-10-07',
    readTime: '5 min read',
    content: 'Body copy for the guide under test. It is long enough to be treated as content.',
    ...partial,
  };
}

describe('mergeGuides', () => {
  const chiangMai = guide({
    id: 'static-chiang-mai',
    slug: 'living-in-chiang-mai',
    title: 'The Ultimate Guide to Living in Chiang Mai',
  });
  const bali = guide({
    id: 'static-bali',
    slug: 'living-in-bali',
    title: 'Living in Bali',
  });

  it('returns the static catalog when the live query has not resolved', () => {
    expect(mergeGuides(undefined, [chiangMai, bali])).toEqual([chiangMai, bali]);
  });

  it('keeps static guides when the live query returns no rows', () => {
    expect(mergeGuides([], [chiangMai]).map((item) => item.slug)).toEqual(['living-in-chiang-mai']);
  });

  it('lets a live row replace the static guide with the same slug', () => {
    const live = guide({
      id: '9',
      slug: 'living-in-chiang-mai',
      title: 'Live Chiang Mai title',
    });
    const merged = mergeGuides([live], [chiangMai, bali]);
    expect(merged.map((item) => item.title)).toEqual(['Live Chiang Mai title', 'Living in Bali']);
  });
});

describe('withTimeout', () => {
  it('rejects when the live guide query never settles', async () => {
    await expect(withTimeout(new Promise<string>(() => {}), 20)).rejects.toBeInstanceOf(GuideDatabaseTimeoutError);
  });

  it('rejects when the request is aborted', async () => {
    const controller = new AbortController();
    const pending = withTimeout(new Promise<string>(() => {}), 5_000, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('resolves when the query settles before the timeout', async () => {
    await expect(withTimeout(Promise.resolve(['ok']), 1_000)).resolves.toEqual(['ok']);
  });
});
