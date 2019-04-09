import styled from 'styled-components';
import StyledButton from './StyledButton';

import { OL } from '../../../utils/constants/Colors';

const TertiaryButton = styled(StyledButton)`
  background-color: ${OL.GREY07};
  color: ${OL.GREY02};
  font-weight: 600;

  &:hover:enabled {
    background-color: ${OL.GREY05};
  }

  &:active:enabled {
    background-color: ${OL.GREY02};
    color: ${OL.WHITE};
  }
`;

export default TertiaryButton;
