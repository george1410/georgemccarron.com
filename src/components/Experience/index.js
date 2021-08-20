import { useState } from 'react';
import ExperienceCard from '../ExperienceCard';
import Switch from '../Switch';
import { SectionHeading } from '../Typography';
import SectionHeader from '../SectionHeader';
import experiences from './data';

const Experience = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <SectionHeader>
        <SectionHeading>Journey So Far</SectionHeading>
        <Switch
          checked={showAll}
          onChange={() => setShowAll((prev) => !prev)}
          label='Show All'
        />
      </SectionHeader>

      {experiences.map((experience) => (
        <ExperienceCard
          key={`${experience.title}-${experience.organisation}`}
          title={experience.title}
          date={experience.date}
          organisation={experience.organisation}
          details={experience.details}
          imagePath={experience.imagePath}
          display={showAll || experience.relevant}
        />
      ))}
    </>
  );
};

export default Experience;
