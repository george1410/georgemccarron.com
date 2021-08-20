import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import styled from 'styled-components';

const StyledSocialIcon = styled(FontAwesomeIcon)`
  font-size: 1.1em;

  color: ${({ theme }) => theme.colors.primary};

  pointer-events: none;
`;

const StyledLink = styled.a`
  margin-right: 15px;
`;

const SocialIconLink = ({ url, icon, title }) => (
  <Link href={url} passHref>
    <StyledLink target='_blank' rel='noopener noreferrer'>
      <StyledSocialIcon icon={icon} title={title} />
    </StyledLink>
  </Link>
);

export default SocialIconLink;
