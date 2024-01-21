import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypePrettyCode from 'rehype-pretty-code';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    subtitle: { type: 'string', required: false },
    heroImage: { type: 'string', required: true },
    draft: { type: 'boolean', required: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) =>
        `/blog/${post._raw.sourceFileName.replace('.mdx', '')}`,
    },
    slug: {
      type: 'string',
      resolve: (post) => post._raw.sourceFileName.replace('.mdx', ''),
    },
  },
}));

export const Talk = defineDocumentType(() => ({
  name: 'Talk',
  filePathPattern: `talks/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    videoUrl: { type: 'string', required: true },
    conference: { type: 'string', required: true },
    conferenceUrl: { type: 'string', required: false },
    location: { type: 'string', required: false },
    blurb: { type: 'string', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (talk) =>
        `/speaking/${talk._raw.sourceFileName.replace('.mdx', '')}`,
    },
    slug: {
      type: 'string',
      resolve: (talk) => talk._raw.sourceFileName.replace('.mdx', ''),
    },
  },
}));

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Post, Talk],
  mdx: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    remarkPlugins: [remarkGfm, remarkEmoji],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: 'nord',
        },
      ],
    ],
  },
});
