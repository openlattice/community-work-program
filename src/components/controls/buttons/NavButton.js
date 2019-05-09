import styled from 'styled-components';

import { OL } from '../../../core/style/Colors';

export const NavButton = styled.button`
  display: flex;
  justify-content: flex-start;
  border: none;
  font-family: 'Open Sans', sans-serif;
  color: ${props => (props.disabled ? `${OL.GREY02}` : `${OL.PURPLE02}`)};
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  background: transparent;
  overflow: hidden;
  span {
    margin-left: 7px;
  }
  &:focus {
    outline: none;
  }
  &:hover {
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    color: ${props => (props.disabled ? `${OL.GREY02}` : `${OL.PURPLE01}`)};
  }
`;
