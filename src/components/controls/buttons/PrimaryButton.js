import styled from 'styled-components';
import StyledButton from './StyledButton';

const PrimaryButton = styled(StyledButton)`
  background-color: #6124e2;
  color: #fff;

  &:hover:enabled {
    background-color: #8045ff;
  }

  &:active:enabled {
    background-color: #361876;
  }
`;

export default PrimaryButton;
