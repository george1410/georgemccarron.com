import Image from 'next/image';
import Me from '../../public/me2.jpg';
import { SocialIcons } from './SocialIcons';

export const AboutAuthor = () => {
  return (
    <div className='bg-zinc-100 py-8 px-12 flex flex-col md:flex-row gap-4 rounded-lg my-12 items-center'>
      <Image
        src={Me}
        alt='Photo of George'
        className='rounded-full w-[6rem] h-[6rem]'
      />
      <div className='flex flex-col gap-2'>
        <h3 className='text-xl font-medium'>George McCarron</h3>
        <p>
          I&apos;m a software engineer based in London, UK. I&apos;m currently
          building software that thinks like a Real Estate Lawyer at Orbital
          Witness. Sometimes I write. Sometimes I speak.
        </p>
        <SocialIcons />
      </div>
    </div>
  );
};
