// @flow
import React from 'react';
import styled from 'styled-components';
import type { RowData } from 'lattice-ui-kit';

import { StyledTableRow } from './styled/index';
import { OL } from '../../core/style/Colors';

export const TableRow = styled(StyledTableRow)`
  border-bottom: 1px solid ${OL.GREY05};

  :last-of-type {
    border-bottom: none;
  }
`;

type Props = {
  className ?:string;
  components :Object;
  data :RowData;
  headers :Object[];
};

const ChargesTableRow = (props :Props) => {
  const {
    className,
    components,
    data,
    headers,
  } = props;

  const { id } = data;

  const cells = headers
    .map((header) => (
      <components.Cell
          key={`${id}_cell_${header.key}`}
          status={data[header.key]}>
        {data[header.key]}
      </components.Cell>
    ));

  return (
    <TableRow className={className}>
      {cells}
    </TableRow>
  );
};

ChargesTableRow.defaultProps = {
  className: undefined,
};

export default ChargesTableRow;
