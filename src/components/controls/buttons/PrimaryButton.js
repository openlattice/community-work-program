import styled from 'styled-components';
import StyledButton from './StyledButton';

import { OL } from '../../../utils/constants/Colors';

const PrimaryButton = styled(StyledButton)`
  background-color: ${OL.PURPLE03};
  color: ${OL.WHITE};

  &:hover:enabled {
    background-color: ${OL.PURPLE02};
  }

  &:active:enabled {
    background-color: ${OL.PURPLE01};
  }
`;

export default PrimaryButton;
