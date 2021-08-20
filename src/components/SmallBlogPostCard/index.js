import { default as NextLink } from 'next/link';
import styled from 'styled-components';
import { Link, Paragraph } from '../Typography';
import formatDate from '../../lib/formatDate';

const StyledBlogPostCard = styled.div`
  margin-bottom: 20px;
  margin-top: 20px;
`;

const Date = styled.div`
  font-size: 0.75em;
  text-transform: uppercase;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 5px;
`;

const Title = styled.h3`
  font-size: 1.5em;
  & a {
    color: ${({ theme }) => theme.colors.primary};
  }
  font-family: ${({ theme }) => theme.typography.heading.font};
  font-weight: 700;
  display: inline-block;
  text-decoration: underline;
`;

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
  }
`;

const SmallBlogPostCard = (props) => {
  return (
    <StyledBlogPostCard>
      <Title>
        <NextLink href={`/blog/posts/${props.slug}`}>
          <a>{props.title}</a>
        </NextLink>
      </Title>
      <Date>{formatDate(props.date)}</Date>
      <TagsContainer>
        {props.tags.map((tag) => (
          <Tag key={tag}>
            <NextLink passHref href={`/blog/tags/${tag}`}>
              <Link>
                <span>#</span>
                {tag}
              </Link>
            </NextLink>
          </Tag>
        ))}
      </TagsContainer>
      <Paragraph>
        {props.excerpt}{' '}
        <NextLink href={`/blog/posts/${props.slug}`} passHref>
          <Link>Continue Reading</Link>
        </NextLink>
      </Paragraph>
    </StyledBlogPostCard>
  );
};

export default SmallBlogPostCard;
