import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';

export const GlobalFooter = () => {
  return (
    <div className='bg-zinc-100 flex justify-center'>
      <footer className='max-w-screen-xl w-full my-12 mx-4 flex justify-between'>
        &copy; George McCarron 2023
        <div className='flex gap-3'>
          <a
            href='https://github.com/george1410'
            target='_blank'
            className='text-xl'
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            href='https://x.com/george_mccarron'
            target='_blank'
            className='text-xl'
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a
            href='https://linkedin.com/in/georgemccarron'
            target='_blank'
            className='text-xl'
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        </div>
      </footer>
    </div>
  );
};
