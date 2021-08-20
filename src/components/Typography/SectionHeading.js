import styled from 'styled-components';

const SectionHeading = styled.h2`
  font-family: ${({ theme }) => theme.typography.subheading.font};
  font-size: ${({ theme }) => theme.typography.subheading.size};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  text-transform: uppercase;
`;

export default SectionHeading;
