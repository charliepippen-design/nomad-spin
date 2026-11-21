import { Fragment, type ReactNode } from 'react';

/**
 * Renders a translated sentence that contains marked spans:
 *   "Read the <link>methodology</link> before you compare."
 *   rich(text, { link: (children) => <Link to="/methodology">{children}</Link> })
 * Translators move the tags with the words; tags do not nest.
 */
export function rich(text: string, tags: Record<string, (children: string) => ReactNode>): ReactNode {
  const parts: ReactNode[] = [];
  const pattern = /<(\w+)>(.*?)<\/\1>/gs;
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const render = tags[match[1]];
    parts.push(<Fragment key={index++}>{render ? render(match[2]) : match[2]}</Fragment>);
    last = start + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
