import {
  faGithub,
  faXTwitter,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const SocialIcons = () => {
  return (
    <div className='flex gap-3'>
      <a
        href='https://github.com/george1410'
        target='_blank'
        className='text-xl hover:text-slate-500 transition-colors'
      >
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a
        href='https://x.com/george_mccarron'
        target='_blank'
        className='text-xl hover:text-slate-500 transition-colors'
      >
        <FontAwesomeIcon icon={faXTwitter} />
      </a>
      <a
        href='https://linkedin.com/in/georgemccarron'
        target='_blank'
        className='text-xl hover:text-slate-500 transition-colors'
      >
        <FontAwesomeIcon icon={faLinkedin} />
      </a>
    </div>
  );
};
