// @flow
import React from 'react';
import styled from 'styled-components';
import isFunction from 'lodash/isFunction';

import { StyledTableRow, TableCell } from './styled/index';

export const WorksitesRow = styled(StyledTableRow)`
  :last-of-type {
    border-bottom: 1px solid black;
  }

  ${TableCell}:first-child {
    padding-left: 50px;
    width: 300px;
    white-space: normal;
  }

  ${TableCell}:last-child {
    padding-right: 50px;
  }
`;

type Props = {
  className ? :string;
  components :Object;
  headers ? :Object[];
  onSort ? :(event :SyntheticEvent<HTMLElement>, property :string) => void;
  order ? :any;
  orderBy ? :string;
  sticky ? :boolean;
};

const WorksitesHeaderRow = (props :Props) => {
  const {
    components,
    className,
    headers,
    onSort,
    order,
    orderBy,
    sticky,
  } = props;

  const createSortHandler = (property :string) => (event :SyntheticEvent<HTMLElement>) => {
    if (isFunction(onSort)) {
      onSort(event, property);
    }
  };

  return (
    <thead className={className}>
      <WorksitesRow sticky={sticky}>
        {
          headers && headers.map((header) => {
            const {
              cellStyle,
              key,
              label,
              sortable = true
            } = header;
            return (
              <components.HeadCell
                  key={key}
                  components={components}
                  cellStyle={cellStyle}
                  onClick={(onSort && sortable) ? createSortHandler(key) : undefined}
                  order={orderBy === header.key ? order : false}
                  sortable={sortable}
                  width={label}
                  whiteSpace={label}>
                {label}
              </components.HeadCell>
            );
          })
        }
      </WorksitesRow>
    </thead>
  );
};

export default WorksitesHeaderRow;

WorksitesHeaderRow.defaultProps = {
  className: undefined,
  headers: [],
  onSort: undefined,
  order: false,
  orderBy: undefined,
  sticky: true,
};
