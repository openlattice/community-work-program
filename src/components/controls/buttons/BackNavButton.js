// @flow
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

import { NavButton } from './NavButton';

type Props = {
  children :any;
  onClick :() => void;
};

const BackNavButton = ({ children, onClick } :Props) => (
  <NavButton onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
    <span>{children}</span>
  </NavButton>
);

export default BackNavButton;
