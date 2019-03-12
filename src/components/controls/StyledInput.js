import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/constants/Colors';

const StyledInput = styled.input`
  display: flex;
  flex: 0 1 auto;
  width: 100%;
  height: 38px;
  font-size: 14px;
  line-height: 19px;
  border-radius: 3px;
  background-color: ${OL.GREY10};
  border: solid 1px ${OL.GREY05};
  color: ${OL.GREY15};
  padding: 12px 15px;
  background: #fff url(${props => props.icon}) no-repeat 93.5%;

  &:focus {
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
    background-color: ${OL.WHITE};
  }

  &::placeholder {
    color: ${OL.GREY02};
  }

  &:disabled {
    border-radius: 3px;
    background-color: ${OL.GREY10};
    border: solid 1px ${OL.GREY05};
    color: ${OL.GREY02};
    font-weight: normal;
    cursor: default;
  }
`;

export default StyledInput;
