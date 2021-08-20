import mandsLogo from '../../../public/assets/m-and-s.png';
import capitalOneLogo from '../../../public/assets/capital-one.jpeg';
import myTutorLogo from '../../../public/assets/my-tutor.jpeg';
import uonLogo from '../../../public/assets/uon.jpeg';
import dgsLogo from '../../../public/assets/dgs.jpeg';

export default [
  {
    title: 'Software Engineer',
    organisation: 'Capital One',
    date: 'Sep 20 - Present',
    imagePath: capitalOneLogo,
    relevant: true,
  },
  {
    title: 'Foods Customer Assistant',
    organisation: 'Marks and Spencer',
    date: 'Dec 14 - Jan 20',
    imagePath: mandsLogo,
    relevant: false,
    details:
      'Worked throughout the Christmas period from 2014 - 2020, and through the summer in 2017 and 2018. Maintained accuracy of the stock file to maintain high availability of products for customers, ensuring that the store consistently met A&A KPIs. Assisted customers with general queries, helping them to place orders, and resolving problems both face-to-face and over the phone, communicating in a friendly and professional manner at all times. Trained and engaged new members of staff in various aspects of their role.',
  },
  {
    title: 'Software Engineering Intern',
    organisation: 'Capital One',
    date: 'Jul 19 - Sep 19',
    imagePath: capitalOneLogo,
    relevant: true,
  },
  {
    title: 'Private Tutor',
    organisation: 'MyTutor',
    date: 'Sep 17 - Jul 19',
    imagePath: myTutorLogo,
    relevant: false,
  },
  {
    title: 'Computer Science BSc (Hons)',
    organisation: 'University of Nottingham',
    date: '2017 - 2020',
    imagePath: uonLogo,
    relevant: true,
  },
  {
    title: 'IB Diploma',
    organisation: 'Dartford Grammar School Sixth Form',
    date: '2015 - 2017',
    imagePath: dgsLogo,
    relevant: false,
  },
  {
    title: 'GCSEs',
    organisation: 'Dartford Grammar School',
    date: '2010 - 2015',
    imagePath: dgsLogo,
    relevant: false,
  },
];
