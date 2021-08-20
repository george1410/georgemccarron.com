import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import sizeOf from 'image-size';
import { parseISO } from 'date-fns';

const POSTS_DIR = path.join(process.cwd(), 'posts');

const ASSETS_DIR = path.join(process.cwd(), 'public');

const getPostSlugs = () => fs.readdirSync(POSTS_DIR);

export const getPostBySlug = (slug, fields = []) => {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(POSTS_DIR, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const coverImagePath = path.join(ASSETS_DIR, data.coverImage);
  const coverImageDimensions = sizeOf(coverImagePath);

  const item = {};

  item.coverImageDimensions = {
    width: coverImageDimensions.width,
    height: coverImageDimensions.height,
  };

  const defaultAuthor = {
    name: 'George McCarron',
    picture: '/assets/blog/authors/george.jpeg',
    bio:
      "I'm a software engineer based in London, UK. I specialise in building, deploying, and maintaining high-quality, performant, reliable, and scalable cloud-native web applications.",
    url: 'https://georgemccarron.com',
  };

  const fieldMapping = {
    slug: realSlug,
    content,
    author: data.author || defaultAuthor,
  };

  return fields.reduce(
    (prev, field) => ({
      ...prev,
      [field]: fieldMapping[field] || data[field],
    }),
    item
  );
};

export const getAllPosts = (fields = []) =>
  getPostSlugs()
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => parseISO(post2.date) - parseISO(post1.date));

export const getPostsByTag = (tag, fields = []) =>
  getAllPosts(fields).filter((post) => post.tags.includes(tag));

export const getPostsPage = (fields = []) =>
  getPostSlugs()
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => parseISO(post2.date) - parseISO(post1.date));

export const getAllTags = (limit) => {
  const allTags = getPostSlugs()
    .map((slug) => getPostBySlug(slug, ['tags']))
    .reduce((prev, cur) => [...prev, ...cur.tags], []);

  const frequencies = {};

  allTags.map((tag) => {
    if (frequencies[tag]) {
      frequencies[tag] = frequencies[tag] + 1;
    } else {
      frequencies[tag] = 1;
    }
  });

  const freqArr = Object.entries(frequencies);
  return freqArr
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))
    .slice(0, limit);
};
