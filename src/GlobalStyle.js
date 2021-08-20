import { createGlobalStyle } from 'styled-components';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    transition: color 0.5s, background 0.5s;
  }

  body, html, #__next {
    width: 100%;
    min-height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    font-family: ${({ theme }) => theme.typography.body.font};
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  code, code * {
    font-family: 'Roboto Mono';
  }
`;

export default GlobalStyle;
