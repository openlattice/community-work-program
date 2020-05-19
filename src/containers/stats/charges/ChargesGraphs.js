// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';

import ChargesHeadCell from '../../../components/table/ChargesHeadCell';
import ChargesTableRow from '../../../components/table/ChargesTableRow';
import TableHeaderRow from '../../../components/table/TableHeaderRow';
import {
  TableCell,
  CustomTable,
  TableCard,
  TableHeader,
  TableName,
} from '../../../components/table/styled/index';
import { generateTableHeaders } from '../../../utils/FormattingUtils';
import { STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { ARREST_CHARGE_HEADERS, COURT_CHARGE_HEADERS } from '../consts/StatsConsts';

const { ARREST_CHARGE_TABLE_DATA, COURT_CHARGE_TABLE_DATA } = STATS;
const arrestChargeTableHeaders :Object[] = generateTableHeaders(ARREST_CHARGE_HEADERS);
const courtChargeTableHeaders :Object[] = generateTableHeaders(COURT_CHARGE_HEADERS);

const ChargesCell = styled(TableCell)`
  font-size: 14px;

  :first-child {
    padding-left: 40px;
    width: 600px;
    white-space: normal;
  }

  :last-child {
    padding-right: 40px;
  }
`;

const tableComponents :Object = {
  Cell: ChargesCell,
  HeadCell: ChargesHeadCell,
  Header: TableHeaderRow,
  Row: ChargesTableRow
};

type Props = {
  arrestChargeTableData :List;
  courtChargeTableData :List;
};

const ChargesGraphs = ({ arrestChargeTableData, courtChargeTableData } :Props) => (
  <CardStack>
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
    <TableCard>
      <TableHeader padding="40px">
        <TableName>
          Court Charges
        </TableName>
      </TableHeader>
      <CustomTable
          components={tableComponents}
          data={courtChargeTableData.toJS()}
          headers={courtChargeTableHeaders}
          isLoading={false} />
    </TableCard>
  </CardStack>
);

const mapStateToProps = (state :Map) => {
  const stats :Map = state.get(STATE.STATS);
  return {
    [ARREST_CHARGE_TABLE_DATA]: stats.get(ARREST_CHARGE_TABLE_DATA),
    [COURT_CHARGE_TABLE_DATA]: stats.get(COURT_CHARGE_TABLE_DATA),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ChargesGraphs);
