import styled from 'styled-components';

const ButtonLink = styled.a`
  margin-top: 20px;
  display: inline-block;

  background-color: ${({ theme }) => theme.colors.muted};
  padding: 10px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.heading.font};
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 3px;
  font-size: 0.9em;

  :hover {
    background-color: ${({ theme }) => theme.colors.muted2};
  }
`;

export default ButtonLink;
