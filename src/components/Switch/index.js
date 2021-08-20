import styled from 'styled-components';

const HiddenCheckbox = styled.input.attrs((props) => ({
  type: 'checkbox',
  id: props.id,
}))`
  display: none;
`;

const StyledSwitch = styled.span`
  width: 50px;
  height: 26px;
  border-radius: 20px;
  display: flex;
  background-color: ${({ theme, checked }) =>
    checked ? '#B6C649' : theme.colors.secondary};
  transition: all 0.3s;
  position: relative;
  cursor: pointer;

  ::before {
    position: absolute;
    content: '';
    left: 1px;
    top: 1px;
    width: 24px;
    height: 24px;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    z-index: 1;
    transition: transform 0.3s, color 0.5s, background 0.5s;
    transform: ${({ checked }) => (checked ? 'translateX(24px)' : 'none')};
  }
`;

const LabelText = styled.span`
  font-size: 0.8em;
  font-weight: 700;
  margin-right: 5px;
  color: ${({ theme }) => theme.colors.primary};
`;

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
`;

const Switch = ({ checked, onChange, label }) => {
  return (
    <StyledLabel>
      <HiddenCheckbox onChange={onChange} />
      <LabelText>{label}</LabelText>
      <StyledSwitch checked={checked} />
    </StyledLabel>
  );
};

export default Switch;
