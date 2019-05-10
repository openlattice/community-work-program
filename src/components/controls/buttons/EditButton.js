/*
 * @flow
 */

import * as React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/pro-solid-svg-icons';
import Button from './StyledButton';
import { OL } from '../../../core/style/Colors';

const EditButtonWrapper = styled(Button)`
  align-items: center;
  display: inline-flex;
  font-size: 11px;
  font-weight: normal;
  line-height: 14px;
  padding: 7px 10px;
  justify-content: center;
  align-content: center;
  background-color: ${OL.GREY08};
  color: ${OL.GREY02};
  &:hover:enabled {
    background-color: ${OL.GREY05};
    cursor: pointer;
  }
  &:active:enabled {
    color: ${OL.WHITE};
    background-color: ${OL.GREY03};
  }
`;

const LeftChevron = styled(FontAwesomeIcon).attrs({
  icon: faPen
})`
  margin-right: 7px;
`;

type Props = {
  className ? :string;
  children :React.Node;
  onClick :() => void;
  size ? :string;
};

const EditButton = (props :Props) => {

  const {
    className,
    children,
    onClick,
    size
  } = props;
  return (
    <EditButtonWrapper className={className} onClick={onClick}>
      <LeftChevron size={size} />
      {children}
    </EditButtonWrapper>
  );
};

EditButton.defaultProps = {
  className: '',
  size: '1x',
};

export default EditButton;
