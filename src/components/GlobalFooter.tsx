import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { NowPlaying } from './NowPlaying';
import { format } from 'date-fns';
import { SocialIcons } from './SocialIcons';

export const GlobalFooter = () => {
  return (
    <div className='bg-zinc-100 flex justify-center'>
      <footer className='max-w-screen-xl w-full my-12 mx-4 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0'>
        <NowPlaying />
        <div className='flex flex-col justify-between items-center md:items-end gap-4'>
          <SocialIcons />
          <span>&copy; George McCarron {format(new Date(), 'yyyy')}</span>
        </div>
      </footer>
    </div>
  );
};
