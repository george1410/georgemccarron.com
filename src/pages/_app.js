import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../GlobalStyle';
import { lightTheme, darkTheme } from '../themes';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const App = ({ Component, pageProps }) => {
  const [theme, setTheme] = useState('light');
  return (
    <>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyle />
        <Component
          {...pageProps}
          toggleTheme={() =>
            setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
          }
          themeName={theme}
        />
      </ThemeProvider>
    </>
  );
};
export default App;
