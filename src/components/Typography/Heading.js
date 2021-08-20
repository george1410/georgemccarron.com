import styled from 'styled-components';

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.heading.font};
  font-size: ${({ theme }) => theme.typography.heading.size};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 20px;
  margin-top: 20px;
  line-height: 1em;
`;

export default Heading;
