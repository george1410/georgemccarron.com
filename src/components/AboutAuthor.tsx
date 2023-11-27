import Image from 'next/image';
import Me from '../../public/me.jpg';

export const AboutAuthor = () => {
  return (
    <div className='bg-zinc-100 py-8 px-12 flex flex-col md:flex-row gap-4 rounded-lg my-12'>
      <Image
        src={Me}
        alt='Photo of George'
        className='rounded-full aspect-square w-20'
      />
      <div>
        <h3 className='text-xl font-medium'>George McCarron</h3>
        <p>
          I&apos;m a software engineer based in London, UK. I&apos;m currently
          building software that thinks like a real estate lawyer at Orbital
          Witness.
        </p>
      </div>
    </div>
  );
};
