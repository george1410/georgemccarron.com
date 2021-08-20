import styled from 'styled-components';
import Page from '../../../components/Page';
import { Heading } from '../../../components/Typography';
import { getAllPosts, getPostBySlug } from '../../../lib/api';
import markdownToHtml from '../../../lib/markdownToHtml';
import formatDate from '../../../lib/formatDate';
import Markdown from '../../../components/Markdown';
import Head from 'next/head';
import Image from 'next/image';
import Link, { default as NextLink } from 'next/link';
import AuthorCard from '../../../components/AuthorCard';
import ButtonLink from '../../../components/ButtonLink';

const CoverImage = styled(Image)`
  width: 100%;
`;

const CoverImageContainer = styled.div`
  margin: 20px 0;
`;

const Date = styled.div`
  font-size: 0.75em;
  text-transform: uppercase;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 5px;
`;

const EndMarker = styled.hr`
  border: none;
  overflow: visible;
  text-align: center;
  margin-bottom: 20px;

  ::after {
    content: '. . .';
    font-size: 2.5em;
    color: ${({ theme }) => theme.colors.secondary};
    position: relative;
    top: -11px;
  }
`;

const BackButton = () => (
  <NextLink href='/blog' passHref>
    <ButtonLink>← All Posts</ButtonLink>
  </NextLink>
);

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 5px;
`;

const Tag = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 0.8em;
  font-weight: 700;
  margin-right: 10px;

  & a {
    color: ${({ theme }) => theme.colors.secondary};

    :hover {
      text-decoration: underline;
    }
  }
`;

const Post = ({ themeName, toggleTheme, post }) => {
  return (
    <Page themeName={themeName} toggleTheme={toggleTheme}>
      <Head>
        <title>{post.title} | George McCarron</title>
        <meta name='description' content={post.excerpt} />
      </Head>
      <BackButton />
      <Heading>{post.title}</Heading>
      <Date>
        {formatDate(post.date)} {`\u00b7`} {post.author.name}
      </Date>
      <TagsContainer>
        {post.tags.map((tag) => (
          <Tag>
            <Link href={`/blog/tags/${tag}`}>
              <a>
                <span>#</span>
                {tag}
              </a>
            </Link>
          </Tag>
        ))}
      </TagsContainer>
      <CoverImageContainer>
        <CoverImage
          src={post.coverImage}
          alt=''
          layout='responsive'
          width={post.coverImageDimensions.width}
          height={post.coverImageDimensions.height}
          quality={90}
          placeholder='blur'
        />
      </CoverImageContainer>
      <Markdown dangerouslySetInnerHTML={{ __html: post.content }} />
      <EndMarker />
      <AuthorCard author={post.author} />
      <BackButton />
    </Page>
  );
};

export default Post;

export const getStaticProps = async ({ params }) => {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
};

export const getStaticPaths = async () => ({
  paths: getAllPosts(['slug']).map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});
