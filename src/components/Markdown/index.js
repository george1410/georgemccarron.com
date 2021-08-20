import styled from 'styled-components';

const Markdown = styled.div`
  color: ${({ theme }) => theme.colors.secondary};

  & p {
    font-family: ${({ theme }) => theme.typography.body.font};
    font-size: ${({ theme }) => theme.typography.body.size};
    color: ${({ theme }) => theme.colors.secondary};
    line-height: ${({ theme }) => theme.typography.body.lineHeight};

    :not(:last-of-type) {
      margin-bottom: 20px;
    }
  }

  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    font-family: ${({ theme }) => theme.typography.heading.font};
    color: ${({ theme }) => theme.colors.primary};
  }

  & p code {
    background-color: ${({ theme }) => theme.colors.muted};
    border-radius: 3px;
    padding: 2px;
  }

  & pre code {
    border-radius: 3px;
    margin-bottom: 20px;
    font-size: 0.9em;
    padding: 20px;
  }

  & a {
    color: ${({ theme }) => theme.colors.link};
  }

  & blockquote {
    border-left-color: ${({ theme }) => theme.colors.muted};
    border-left-width: 3px;
    border-left-style: solid;
    padding-left: 10px;
    margin-left: 20px;
    margin-right: 30px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin-bottom: 20px;

    p {
      margin: 0;
    }
  }

  & hr {
    border: none;
    border-top: solid 1px ${({ theme }) => theme.colors.muted};
    margin-bottom: 20px;
  }

  & ul,
  & ol {
    padding-left: 40px;
    margin-bottom: 20px;
  }

  & li {
    font-size: 0.9em;
  }
`;

export default Markdown;
