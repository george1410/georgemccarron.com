import styled from 'styled-components';

const Paragraph = styled.p`
  font-family: ${({ theme }) => theme.typography.body.font};
  font-size: ${({ theme }) => theme.typography.body.size};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: ${({ theme }) => theme.typography.body.lineHeight};

  :not(:last-of-type) {
    padding-bottom: 20px;
  }
`;

export default Paragraph;
