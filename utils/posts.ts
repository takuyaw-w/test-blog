import { extract } from "$std/encoding/front_matter.ts";
import { join } from "$std/path/posix.ts";
import { walk } from "https://deno.land/std@0.161.0/fs/walk.ts";

const DIRECTORY = "./posts";

export interface Post {
  slug: string;
  title: string;
  publishedAt: Date;
  snippet: string;
  content: string;
}

export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir(DIRECTORY);
  const deadcode = walk(DIRECTORY, { exts: [".md"] });
  console.log(deadcode);
  const promises = [];
  for await (const file of files) {
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = await Promise.all(promises) as Post[];
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  const text = await Deno.readTextFile(join(DIRECTORY, `${slug}.md`));
  const { attrs, body } = extract(text);
  return {
    slug,
    title: attrs.title,
    publishedAt: new Date(attrs.published_at),
    content: body,
    snippet: attrs.snippet,
  };
}
