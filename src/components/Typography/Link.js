import styled from 'styled-components';

const Link = styled.a`
  color: ${({ theme }) => theme.colors.link};
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;

export default Link;
