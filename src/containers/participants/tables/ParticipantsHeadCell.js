// @flow
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/pro-duotone-svg-icons';
import type { Node } from 'react';

import { Cell } from './styled/index';

type Props = {
  cellStyle ? :Object;
  children :Node;
  className ? :string;
  onClick ? :(e :SyntheticEvent<HTMLElement>) => void;
  order ? :any;
  sortable ? :boolean;
  width ? :string;
  whiteSpace ? :string;
};

const HeadCell = (props :Props) => {
  const {
    cellStyle,
    children,
    className,
    onClick,
    order,
    sortable,
    width,
    whiteSpace,
  } = props;

  let icon = faSort;
  if (order === 'asc') icon = faSortUp;
  if (order === 'desc') icon = faSortDown;

  return (
    <Cell
        as="th"
        cellStyle={cellStyle}
        className={className}
        onClick={onClick}
        width={width}
        whiteSpace={whiteSpace}>
      {children}
      { (sortable) && <span><FontAwesomeIcon icon={icon} fixedWidth /></span> }
    </Cell>
  );

};

HeadCell.defaultProps = {
  cellStyle: {},
  className: undefined,
  onClick: undefined,
  order: false,
  sortable: false,
  width: '',
  whiteSpace: '',
};

export default HeadCell;
