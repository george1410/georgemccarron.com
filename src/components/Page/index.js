import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
  @media (min-width: 1280px) {
    ${({ paddingTop }) => paddingTop && `padding-top: 100px`};
    padding-bottom: 80px;
  }
`;

const ThemeButton = styled.button`
  font-size: 2em;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Page = ({ themeName, toggleTheme, children, paddingTop }) => (
  <Container>
    <ThemeButton aria-label='Toggle Theme' onClick={toggleTheme}>
      <FontAwesomeIcon icon={themeName === 'light' ? faMoon : faSun} />
    </ThemeButton>
    <Content paddingTop={paddingTop}>{children}</Content>
  </Container>
);

export default Page;
