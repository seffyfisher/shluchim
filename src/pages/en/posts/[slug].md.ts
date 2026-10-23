import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { markdownPaths, markdownResponse, storyMarkdown } from '../../../lib/post-md';

// Plain-Markdown copy of each English story at /en/posts/<slug>.md, for AI agents and answer engines (generated, never hand-edit).
export const getStaticPaths = () => markdownPaths('en');
export const GET = async ({ props, site }: APIContext<{ post: CollectionEntry<'posts'> }>) => markdownResponse(await storyMarkdown(props.post, site!));
