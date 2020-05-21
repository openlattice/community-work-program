// @flow
import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/pro-duotone-svg-icons';
import type { Node } from 'react';

import { TableCell } from './styled/index';

const HeadCell = styled(TableCell)`
  :first-child {
    padding-left: 40px;
    width: 600px;
    white-space: normal;
  }

  :last-child {
    padding-right: 40px;
  }
`;

type Props = {
  cellStyle ?:Object;
  children :Node;
  className ?:string;
  onClick ?:(e :SyntheticEvent<HTMLElement>) => void;
  order ?:any;
  sortable ?:boolean;
  width ?:string;
  whiteSpace ?:string;
};

const ChargesHeadCell = (props :Props) => {
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
    <HeadCell
        as="th"
        cellStyle={cellStyle}
        className={className}
        onClick={onClick}
        width={width}
        whiteSpace={whiteSpace}>
      {children}
      { (sortable) && <span><FontAwesomeIcon icon={icon} fixedWidth /></span> }
    </HeadCell>
  );

};

ChargesHeadCell.defaultProps = {
  cellStyle: {},
  className: undefined,
  onClick: undefined,
  order: false,
  sortable: false,
  width: '',
  whiteSpace: '',
};

export default ChargesHeadCell;
