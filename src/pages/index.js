import styled from 'styled-components';
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import Page from '../components/Page';
import SocialIconLink from '../components/SocialIconLink';
import Experience from '../components/Experience';
import {
  Paragraph,
  SectionHeading,
  Heading,
  Link,
} from '../components/Typography';
import { default as NextLink } from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import SmallBlogPostCard from '../components/SmallBlogPostCard';
import { getPostsPage } from '../lib/api';
import SectionHeader from '../components/SectionHeader';

const Photo = styled(Image)`
  border-radius: 100px;
`;

const SocialIconsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export default function Home({ themeName, toggleTheme, recentPosts }) {
  return (
    <>
      <Head>
        <title>George McCarron</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <meta
          name='description'
          content="I'm a software engineer based in London, UK. I specialise in
            building, deploying, and maintaining high-quality, reliable and
            scalable cloud-native web applications."
        />
      </Head>
      <Page paddingTop themeName={themeName} toggleTheme={toggleTheme}>
        <HeaderRow>
          <Photo
            width='120px'
            height='120px'
            src='/assets/profile.jpeg'
            alt='Photo of George McCarron'
            quality={90}
          />
        </HeaderRow>
        <Heading>George McCarron</Heading>

        <SocialIconsContainer>
          <SocialIconLink
            url='https://github.com/george1410'
            icon={faGithub}
            title='GitHub'
          />
          <SocialIconLink
            url='https://linkedin.com/in/mccarrong'
            icon={faLinkedin}
            title='LinkedIn'
          />
          <SocialIconLink
            url='https://twitter.com/george_mccarron'
            icon={faTwitter}
            title='Twitter'
          />
          <Link href='mailto:hello@georgemccarron.com'>
            <Paragraph>hello@georgemccarron.com</Paragraph>
          </Link>
        </SocialIconsContainer>

        <div>
          <Paragraph>
            I'm a software engineer based in London, UK. I specialise in
            building, deploying, and maintaining high-quality, performant,
            reliable, and scalable cloud-native web applications.
          </Paragraph>

          <Paragraph>
            I try to use the right tools for the job, and am always trying to
            keep up with the latest tech. For frontend work, my current weapons
            of choice are React, Next.js, and all the latest juicy JS features.
            On the backend I use Node.js for most personal projects but also
            dabble in Python, Java and have been recently getting into Go. When
            it comes to deploying infrastructure (traditional or serverless), I
            have experience with AWS (
            <Link href='https://www.credly.com/users/george-mccarron'>
              + the certs to prove it!
            </Link>
            ) and Terraform. I like GitHub actions for personal projects; at
            work I write Jenkins pipelines with Groovy. Bit of a
            jack-of-all-trades: I'll jump into anything to get the job done!
          </Paragraph>
        </div>

        <Experience />

        <SectionHeader>
          <SectionHeading>Stuff I Built</SectionHeading>
        </SectionHeader>

        <SectionHeader>
          <SectionHeading>Ramblings</SectionHeading>
        </SectionHeader>
        <Paragraph>
          It seems like every man and his dog who works in tech has a blog these
          days so I'm gonna jump on the bandwagon and see what happens... Check
          out some of my most recent posts below, or head over to my{' '}
          <NextLink href='/blog'>
            <Link>blog</Link>
          </NextLink>{' '}
          for more.
        </Paragraph>
        {recentPosts.slice(0, 3).map((post) => (
          <SmallBlogPostCard key={post.slug} {...post} />
        ))}
      </Page>
    </>
  );
}

export const getStaticProps = async () => {
  const recentPosts = getPostsPage([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  return { props: { recentPosts } };
};
