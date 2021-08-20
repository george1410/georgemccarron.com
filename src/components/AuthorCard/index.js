import Image from 'next/image';
import { default as NextLink } from 'next/link';
import styled from 'styled-components';
import { Paragraph, SectionHeading, Link } from '../Typography';

const StyledAuthorCard = styled.div`
  background-color: ${({ theme }) => theme.colors.muted};
  padding: 20px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 1280px) {
    flex-direction: row;
  }
`;

const Photo = styled(Image)`
  border-radius: 100px;
`;

const PhotoWrapper = styled.div`
  min-width: 120px;
  @media (min-width: 1280px) {
    margin-right: 20px !important;
  }
`;

const AuthorCard = ({ author }) => {
  return (
    <StyledAuthorCard>
      <PhotoWrapper>
        <Photo
          width='120px'
          height='120px'
          src={author.picture}
          alt={`Photo of ${author.name}`}
          quality={90}
        />
      </PhotoWrapper>
      <div>
        <SectionHeading>{author.name}</SectionHeading>
        <Paragraph>
          {author.bio}{' '}
          {author.url && (
            <NextLink href={author.url} passHref>
              <Link>More about me</Link>
            </NextLink>
          )}
        </Paragraph>
      </div>
    </StyledAuthorCard>
  );
};

export default AuthorCard;
