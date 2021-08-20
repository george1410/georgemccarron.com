import styled from 'styled-components';
import BlogPostCard from '../BlogPostCard';

const LoadingMessage = styled.div`
  text-align: center;
`;

const BlogList = ({ posts }) => {
  return (
    <>
      {posts.length ? (
        <>
          {posts.map((post) => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
          <LoadingMessage>No more posts to display</LoadingMessage>
        </>
      ) : (
        <LoadingMessage>No posts to display</LoadingMessage>
      )}
    </>
  );
};

export default BlogList;
