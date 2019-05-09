import styled from 'styled-components';
import StyledButton from './StyledButton';

import { OL } from '../../../core/style/Colors';

const TertiaryButton = styled(StyledButton)`
  background-color: ${OL.WHITE};
  color: ${OL.GREY02};
  border: 1px solid ${OL.GREY08};
  font-weight: 600;
  &:hover:enabled {
    background-color: ${OL.GREY07};
  }
  &:active:enabled {
    background-color: ${OL.GREY05};
    color: ${OL.WHITE};
  }
`;

export default TertiaryButton;
