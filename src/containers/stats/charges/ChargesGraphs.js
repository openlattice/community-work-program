// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

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
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { DOWNLOAD_CHARGES_STATS, downloadChargesStats } from './ChargesStatsActions';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { ARREST_CHARGE_HEADERS, COURT_CHARGE_HEADERS } from '../consts/StatsConsts';

const { ARREST_CHARGE_TABLE_DATA, COURT_CHARGE_TABLE_DATA } = STATS;
const arrestChargeTableHeaders :Object[] = generateTableHeaders(ARREST_CHARGE_HEADERS);
const courtChargeTableHeaders :Object[] = generateTableHeaders(COURT_CHARGE_HEADERS);

const { ACTIONS, REQUEST_STATE } = SHARED;

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

const ChargesTableHeader = styled(TableHeader)`
  justify-content: space-between;
`;

const tableComponents :Object = {
  Cell: ChargesCell,
  HeadCell: ChargesHeadCell,
  Header: TableHeaderRow,
  Row: ChargesTableRow
};

type Props = {
  actions :{
    downloadChargesStats :RequestSequence;
  };
  arrestChargeTableData :List;
  courtChargeTableData :List;
  requestStates :{
    DOWNLOAD_CHARGES_STATS :RequestState;
  };
};

const ChargesGraphs = ({
  actions,
  arrestChargeTableData,
  courtChargeTableData,
  requestStates,
} :Props) => (
  <CardStack>
    <TableCard>
      <ChargesTableHeader padding="40px">
        <TableName>
          Arrest Charges
        </TableName>
        <Button
            isLoading={requestIsPending(requestStates[DOWNLOAD_CHARGES_STATS])}
            onClick={() => actions.downloadChargesStats(arrestChargeTableData)}>
          Download
        </Button>
      </ChargesTableHeader>
      <CustomTable
          components={tableComponents}
          data={arrestChargeTableData.toJS()}
          headers={arrestChargeTableHeaders}
          isLoading={false} />
    </TableCard>
    <TableCard>
      <ChargesTableHeader padding="40px">
        <TableName>
          Court Charges
        </TableName>
        <Button
            isLoading={requestIsPending(requestStates[DOWNLOAD_CHARGES_STATS])}
            onClick={() => actions.downloadChargesStats(courtChargeTableData)}>
          Download
        </Button>
      </ChargesTableHeader>
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
    requestStates: {
      [DOWNLOAD_CHARGES_STATS]: stats.getIn([ACTIONS, DOWNLOAD_CHARGES_STATS, REQUEST_STATE]),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadChargesStats,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ChargesGraphs);
