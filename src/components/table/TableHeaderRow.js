// @flow
import React from 'react';
import styled from 'styled-components';
import isFunction from 'lodash/isFunction';

import { StyledTableRow } from './styled/index';

const StyledHeaderRow = styled(StyledTableRow)`
  border-bottom: 1px solid black;
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

const TableHeader = (props :Props) => {
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
      <StyledHeaderRow sticky={sticky}>
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
      </StyledHeaderRow>
    </thead>
  );
};

export default TableHeader;

TableHeader.defaultProps = {
  className: undefined,
  headers: [],
  onSort: undefined,
  order: false,
  orderBy: undefined,
  sticky: true,
};
