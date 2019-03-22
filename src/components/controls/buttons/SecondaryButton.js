import styled from 'styled-components';
import StyledButton from './StyledButton';

import { OL } from '../../../utils/constants/Colors';

const SecondaryButton = styled(StyledButton)`
  background-color: ${OL.PURPLE06};
  color: ${OL.PURPLE02};
  font-weight: 600;

  &:hover:enabled {
    background-color: ${OL.PURPLE05};
  }

  &:active:enabled {
    background-color: ${OL.PURPLE04};
  }
`;

export default SecondaryButton;
