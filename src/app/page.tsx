import Image from 'next/image';
import Me from '../../public/me.jpg';
import Link from 'next/link';
import { BlogPostGrid } from '@/components/BlogPostGrid';

export default function Home() {
  return (
    <main className='flex gap-12 flex-col'>
      <section className='flex gap-8 flex-col md:flex-row items-center'>
        <Image src={Me} alt='Photo of George' className='rounded-full w-40' />
        <div className='self-center md:order-0'>
          <h1 className='text-6xl font-black tracking-wide mb-4'>
            George McCarron
          </h1>

          <p className='text-lg'>
            I&apos;m a software engineer based in London, UK. I&apos;m currently
            building software that thinks like a real estate lawyer at Orbital
            Witness.
          </p>
        </div>
      </section>

      <section className='flex flex-col'>
        <h2 className='text-2xl font-semibold mb-4'>Latest Posts</h2>
        <BlogPostGrid limit={3} />
        <Link
          href='/blog'
          className='self-end border-2 border-slate-200 py-2 px-4 rounded-lg font-semibold text-slate-400 hover:bg-slate-100 w-full md:w-auto text-center mt-4 md:mt-0'
        >
          View All Posts
        </Link>
      </section>

      <section className='flex flex-col'>
        <h2 className='text-2xl font-semibold mb-4'>Timeline</h2>
        <ul>
          <li className='flex flex-col'>
            <div className='flex items-start'>
              <Image
                src='https://logo.clearbit.com/orbitalwitness.com'
                width={64}
                height={64}
                alt=''
                className='rounded-md border border-slate-200 mr-4'
              />
              <div>
                <h3 className='font-semibold text-lg text-slate-500'>
                  <span className='text-blue-700'>Frontend Engineer</span> @
                  Orbital Witness
                </h3>
                <span>July 2023 - Present</span>
              </div>
            </div>
            <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
          </li>
          <li className='flex flex-col'>
            <div className='flex items-start'>
              <Image
                src='https://logo.clearbit.com/clearscore.com'
                width={64}
                height={64}
                alt=''
                className='rounded-md border border-slate-200 mr-4'
              />
              <div>
                <h3 className='font-semibold text-lg text-slate-500'>
                  <span className='text-blue-700'>Frontend Engineer</span> @
                  ClearScore
                </h3>
                <span>February 2022 - July 2023</span>
              </div>
            </div>
            <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
          </li>
          <li className='flex flex-col'>
            <div className='flex items-start'>
              <Image
                src='https://logo.clearbit.com/capitalone.com'
                width={64}
                height={64}
                alt=''
                className='rounded-md border border-slate-200 mr-4'
              />
              <div>
                <h3 className='font-semibold text-lg text-slate-500'>
                  <span className='text-blue-700'>Software Engineer</span> @
                  Capital One
                </h3>
                <span>September 2020 - February 2022</span>
              </div>
            </div>
            <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
          </li>
          <li className='flex flex-col'>
            <div className='flex items-start'>
              <Image
                src='https://logo.clearbit.com/capitalone.com'
                width={64}
                height={64}
                alt=''
                className='rounded-md border border-slate-200 mr-4'
              />
              <div>
                <h3 className='font-semibold text-lg text-slate-500'>
                  <span className='text-blue-700'>
                    Software Engineering Intern
                  </span>{' '}
                  @ Capital One
                </h3>
                <span>July 2019 - September 2019</span>
              </div>
            </div>
            <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
          </li>
          <li className='flex flex-col'>
            <div className='flex items-start'>
              <Image
                src='https://logo.clearbit.com/nottingham.ac.uk'
                width={64}
                height={64}
                alt=''
                className='rounded-md border border-slate-200 mr-4'
              />
              <div>
                <h3 className='font-semibold text-lg text-slate-500'>
                  <span className='text-blue-700'>
                    BSc (Hons), Computer Science
                  </span>{' '}
                  @ University of Nottingham
                </h3>
                <span>2017 - 2020</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
