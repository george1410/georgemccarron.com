import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';
import { Paragraph } from '../Typography';

const StyledExperienceCard = styled.div`
  display: flex;
  margin-bottom: 20px;
  display: ${({ display }) => (display ? 'flex' : 'none')};
`;

const StyledImage = styled(Image)`
  border-radius: 3px;
`;

const ImageWrapper = styled.div`
  margin-right: 10px;
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  height: 60px;
  width: 60px;
  min-width: 60px;
  border-radius: 3px;
`;

const Title = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.body.size};
`;

const Organisation = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8em;
  margin-bottom: 5px;
`;

const ExpandBtn = styled.button`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.link};
  cursor: pointer;
`;

const ExperienceCard = ({
  display,
  title,
  organisation,
  imagePath,
  date,
  details,
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <StyledExperienceCard display={display}>
      <ImageWrapper>
        <StyledImage
          src={imagePath}
          loading='eager'
          alt={`${organisation} logo`}
          placeholder='blur'
        />
      </ImageWrapper>
      <div>
        <Title>{title}</Title>
        <Organisation>
          {organisation}
          {date && ` \u00b7 ${date}`}
        </Organisation>
        {details && (
          <ExpandBtn onClick={() => setExpanded((prev) => !prev)}>
            {!expanded && (
              <>
                More <FontAwesomeIcon icon={faCaretDown} />
              </>
            )}
            {expanded && (
              <>
                Less <FontAwesomeIcon icon={faCaretUp} />
              </>
            )}
          </ExpandBtn>
        )}
        {expanded && details && <Paragraph>{details}</Paragraph>}
      </div>
    </StyledExperienceCard>
  );
};

export default ExperienceCard;
