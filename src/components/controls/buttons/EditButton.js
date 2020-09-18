// @flow
import React from 'react';
import type { Node } from 'react';

import { faPen } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, IconButton } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

type Props = {
  children ?:Node;
  onClick :() => void;
};

const EditIcon = (
  <FontAwesomeIcon color={NEUTRAL.N500} icon={faPen} />
);

const EditButton = ({ children, onClick } :Props) => {

  if (!children) {
    return (
      <IconButton onClick={onClick}>{EditIcon}</IconButton>
    );
  }

  return (
    <IconButton onClick={onClick} startIcon={EditIcon}>
      {children}
    </IconButton>
  );
};

EditButton.defaultProps = {
  children: undefined,
};

export default EditButton;
