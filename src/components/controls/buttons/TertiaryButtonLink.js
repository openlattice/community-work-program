import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { OL } from '../../../utils/constants/Colors';

const TertiaryButtonLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin-left: 20px;
  padding: 8px 30px;
  cursor: pointer;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 20px;
  font-size: 14px;
  font-spacing: 2px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  width: auto;
  background-color: ${OL.WHITE};
  color: ${OL.GREY02};
  border: 1px solid ${OL.GREY08};
  border-radius: 3px;

  &:hover:enabled {
    background-color: ${OL.GREY05};
  }

  &:active:enabled {
    background-color: ${OL.GREY02};
    color: ${OL.WHITE};
  }
`;

export default TertiaryButtonLink;
