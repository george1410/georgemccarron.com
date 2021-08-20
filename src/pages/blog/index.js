import Head from 'next/head';
import Page from '../../components/Page';
import { getAllTags, getPostsPage } from '../../lib/api';
import {
  SectionHeading,
  Heading,
  Paragraph,
  Link,
} from '../../components/Typography';
import styled from 'styled-components';
import { default as NextLink } from 'next/link';
import { useState } from 'react';
import BlogList from '../../components/BlogList';
import { isFeatureEnabled } from '../../featureFlags';
import Fuse from 'fuse.js';

const SearchInput = styled.input.attrs(() => ({
  type: 'text',
}))`
  width: 100%;
  padding: 10px;
  font-size: 1.2em;
  margin: 20px 0;
  font-family: ${({ theme }) => theme.typography.heading.font};
  color: ${({ theme }) => theme.colors.secondary};
  border: solid 3px ${({ theme }) => theme.colors.muted};
  outline: none;

  ::placeholder {
    color: ${({ theme }) => theme.colors.muted2};
  }

  :focus {
    border-color: ${({ theme }) => theme.colors.muted2};
  }
`;

const Tag = styled(Link)`
  margin: 5px 5px 0px 0px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.secondary};

  :hover {
    background-color: ${({ theme }) => theme.colors.muted2};
  }
`;

const searchPosts = (searchTerm, fuse) => {
  const results = fuse.search(searchTerm);

  console.log(fuse);
  console.log(results);

  return results.map((result) => result.item);
};

const Archive = ({ themeName, toggleTheme, allPosts, allTags }) => {
  const [searchText, setSearchText] = useState('');
  const fuse = new Fuse(allPosts, { keys: ['title', 'tags'], distance: 10000 });
  return (
    <Page themeName={themeName} toggleTheme={toggleTheme}>
      <Head>
        <title>Archive | George McCarron</title>
        <meta name='description' content='TODO: Fill this in' />
      </Head>
      <Heading>
        <NextLink href='/'>
          <a>George McCarron</a>
        </NextLink>
      </Heading>
      <SectionHeading>Ramblings</SectionHeading>
      <Paragraph>
        This is my little corner of the internet where I write stuff. I'm not
        very good at writing, but I'm going to do it anyway. I don't really care
        whether you read any of it or not.
      </Paragraph>
      {isFeatureEnabled('blogSearch') &&
      <SearchInput
        type='text'
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder='Search for posts'
      />}
      {isFeatureEnabled('topTags') && <>
      <h4>Top Tags</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
        {allTags
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map((tag) => (
            <NextLink
              style={{ marginRight: '20px' }}
              href={`/blog/tags/${tag.name}`}
              passHref
              key={tag.name}
            >
              <Tag>
                #{tag.name} ({tag.count})
              </Tag>
            </NextLink>
          ))}
      </div></>}
      <BlogList posts={searchText ? searchPosts(searchText, fuse) : allPosts} />
    </Page>
  );
};

export default Archive;

export const getStaticProps = async () => {
  const allPosts = getPostsPage([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const allTags = getAllTags();

  return { props: { allPosts, allTags } };
};
