// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';

import ChargesTableRow from '../../../components/table/ChargesTableRow';
import TableHeaderRow from '../../../components/table/TableHeaderRow';
import TableHeadCell from '../../../components/table/TableHeadCell';
import {
  TableCell,
  CustomTable,
  TableCard,
  TableHeader,
  TableName,
} from '../../../components/table/styled/index';
import { generateTableHeaders } from '../../../utils/FormattingUtils';
import { STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { ARREST_CHARGE_HEADERS } from '../consts/StatsConsts';

const { ARREST_CHARGE_TABLE_DATA } = STATS;
const arrestChargeTableHeaders :Object[] = generateTableHeaders(ARREST_CHARGE_HEADERS);

const ChargesHeadCell = styled(TableCell)`
  :first-child {
    padding-left: 50px;
    width: 600px;
    white-space: normal;
  }

  :last-child {
    padding-right: 50px;
  }
`;

const ChargesCell = styled(ChargesHeadCell)`
  font-size: 14px;
`;

const tableComponents :Object = {
  Cell: ChargesCell,
  HeadCell: ChargesHeadCell,
  Header: TableHeaderRow,
  Row: ChargesTableRow
};

type Props = {
  arrestChargeTableData :List;
};

const ChargesGraphs = ({ arrestChargeTableData } :Props) => {
  return (
    <TableCard>
      <TableHeader padding="40px">
        <TableName>
          Arrest Charges
        </TableName>
      </TableHeader>
      <CustomTable
          components={tableComponents}
          data={arrestChargeTableData.toJS()}
          headers={arrestChargeTableHeaders}
          isLoading={false} />
    </TableCard>
  );
};

const mapStateToProps = (state :Map) => {
  const stats :Map = state.get(STATE.STATS);
  return {
    [ARREST_CHARGE_TABLE_DATA]: stats.get(ARREST_CHARGE_TABLE_DATA),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ChargesGraphs);
