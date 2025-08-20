import Image from 'next/image';

export const Timeline = () => {
  return (
    <ul>
      <TimelineItem
        title='Senior Software Engineer'
        subtitle='Orbital'
        date='February 2025 - Present'
        url='https://orbital.tech'
        logo='https://img.logo.dev/orbital.tech?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
      />
      <TimelineItem
        title='Software Engineer'
        subtitle='Orbital'
        date='July 2023 - February 2025'
        url='https://orbital.tech'
        logo='https://img.logo.dev/orbital.tech?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
      />
      <TimelineItem
        title='Frontend Engineer'
        subtitle='ClearScore'
        date='February 2022 - July 2023'
        url='https://clearscore.com'
        logo='https://img.logo.dev/clearscore.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
        logoPadding='p-2'
      />
      <TimelineItem
        title='Software Engineer'
        subtitle='Capital One'
        date='September 2020 - February 2022'
        url='https://capitalone.co.uk'
        logo='https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
      />
      <TimelineItem
        title='Software Engineering Intern'
        subtitle='Capital One'
        date='July 2019 - September 2019'
        url='https://capitalone.co.uk'
        logo='https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
      />
      <TimelineItem
        title='BSc (Hons), Computer Science'
        subtitle='University of Nottingham'
        date='2017 - 2020'
        url='https://nottingham.ac.uk'
        logo='https://img.logo.dev/nottingham.ac.uk?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64'
        isLast
      />
    </ul>
  );
};

const TimelineItem = ({
  title,
  subtitle,
  date,
  url,
  logo,
  isLast = false,
  logoPadding = 'p-0',
}: {
  title: string;
  subtitle: string;
  date: string;
  url: string;
  logo: string;
  isLast?: boolean;
  logoPadding?: string;
}) => {
  return (
    <li className='flex flex-col'>
      <div className='flex items-center'>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='mr-4'
        >
          <Image
            src={logo}
            width={64}
            height={64}
            alt=''
            className={`rounded-md border border-slate-200  ${logoPadding}`}
          />
        </a>
        <div>
          <h3 className='font-medium text-slate-500 flex items-baseline gap-2'>
            <span>{title}</span> -
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-700 hover:underline'
            >
              {subtitle}
            </a>
          </h3>
          <span>{date}</span>
        </div>
      </div>
      {!isLast && (
        <div className='h-10 border-l-2 border-slate-200 ml-8 my-2' />
      )}
    </li>
  );
};
