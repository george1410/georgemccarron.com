import Page from '../components/Page';
import { Heading } from '../components/Typography';

const Uses = ({ themeName, toggleTheme }) => {
  return (
    <Page paddingTop themeName={themeName} toggleTheme={toggleTheme}>
      <Heading>Uses</Heading>
    </Page>
  );
};

export default Uses;
