import Head from 'next/head';
import Page from '../../../components/Page';
import {
  Heading,
  Paragraph,
  SectionHeading,
} from '../../../components/Typography';
import Link, { default as NextLink } from 'next/link';
import { getAllTags, getPostsByTag } from '../../../lib/api';
import ButtonLink from '../../../components/ButtonLink';
import BlogPostCard from '../../../components/BlogPostCard';
import styled from 'styled-components';
import BlogList from '../../../components/BlogList';

const BackButton = () => (
  <NextLink href='/blog' passHref>
    <ButtonLink>← All Posts</ButtonLink>
  </NextLink>
);

const LoadingMessage = styled.div`
  text-align: center;
`;

const TagArchive = ({ themeName, toggleTheme, tag, allPosts }) => {
  return (
    <Page themeName={themeName} toggleTheme={toggleTheme}>
      <Head>
        <title>Archive | George McCarron</title>
        <meta name='description' content='TODO: Fill this in' />
      </Head>
      <BackButton />
      <Heading>
        <Link href='/'>
          <a>George McCarron</a>
        </Link>
      </Heading>
      <SectionHeading>#{tag}</SectionHeading>
      <Paragraph>Showing all posts tagged with '{tag}'.</Paragraph>
      <BlogList posts={allPosts} />
    </Page>
  );
};

export const getStaticProps = async ({ params }) => {
  const allPosts = getPostsByTag(params.tag, [
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  return {
    props: {
      tag: params.tag,
      allPosts,
    },
  };
};

export const getStaticPaths = async () => {
  const tags = getAllTags().map(({ name }) => ({
    params: { tag: name },
  }));

  return {
    paths: tags,
    fallback: false,
  };
};

export default TagArchive;
