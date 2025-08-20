import Image from 'next/image';

export const Timeline = () => {
  return (
    <ul>
      <li className='flex flex-col'>
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/orbital.tech?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
            width={64}
            height={64}
            alt=''
            className='rounded-md border border-slate-200 mr-4'
          />
          <div>
            <h3 className='font-semibold text-lg text-slate-500'>
              <span className='text-blue-700'>Senior Software Engineer</span> @
              Orbital
            </h3>
            <span>February 2025 - Present</span>
          </div>
        </div>
        <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
      </li>
      <li className='flex flex-col'>
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/orbital.tech?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
            width={64}
            height={64}
            alt=''
            className='rounded-md border border-slate-200 mr-4'
          />
          <div>
            <h3 className='font-semibold text-lg text-slate-500'>
              <span className='text-blue-700'>Software Engineer</span> @ Orbital
            </h3>
            <span>July 2023 - Present</span>
          </div>
        </div>
        <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
      </li>
      <li className='flex flex-col'>
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/clearscore.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
            width={64}
            height={64}
            alt=''
            className='rounded-md border border-slate-200 mr-4 p-2'
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
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
            width={64}
            height={64}
            alt=''
            className='rounded-md border border-slate-200 mr-4'
          />
          <div>
            <h3 className='font-semibold text-lg text-slate-500'>
              <span className='text-blue-700'>Software Engineer</span> @ Capital
              One
            </h3>
            <span>September 2020 - February 2022</span>
          </div>
        </div>
        <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
      </li>
      <li className='flex flex-col'>
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
            width={64}
            height={64}
            alt=''
            className='rounded-md border border-slate-200 mr-4'
          />
          <div>
            <h3 className='font-semibold text-lg text-slate-500'>
              <span className='text-blue-700'>Software Engineering Intern</span>{' '}
              @ Capital One
            </h3>
            <span>July 2019 - September 2019</span>
          </div>
        </div>
        <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
      </li>
      <li className='flex flex-col'>
        <div className='flex items-center'>
          <Image
            src='https://img.logo.dev/nottingham.ac.uk?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
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
  );
};
