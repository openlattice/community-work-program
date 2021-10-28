// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  CardSegment,
  Colors,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { GET_STATS_BY_COURT_TYPE, getStatsByCourtType } from './CourtTypeActions';

import ChargesHeadCell from '../../../components/table/ChargesHeadCell';
import ChargesTableRow from '../../../components/table/ChargesTableRow';
import TableHeaderRow from '../../../components/table/TableHeaderRow';
import {
  CustomTable,
  TableCard,
  TableCell,
  TableHeader,
  TableName,
} from '../../../components/table/styled/index';
import { COURT_TYPES, ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { generateTableHeaders } from '../../../utils/FormattingUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { SmallSelectWrapper } from '../styled/GraphStyles';

const {
  ENROLLMENT_STATUS_COUNTS_FOR_COURT_TYPE,
  TOTAL_ENROLLMENTS_FOR_COURT_TYPE,
  TOTAL_PARTICIPANTS_FOR_COURT_TYPE,
} = STATS;
const {
  ACTIVE,
  AWAITING_CHECKIN,
  CLOSED,
  COMPLETED,
  JOB_SEARCH,
  REMOVED_NONCOMPLIANT,
  SUCCESSFUL,
  UNSUCCESSFUL,
} = ENROLLMENT_STATUSES;
const { ACTIONS } = SHARED;
const { NEUTRAL } = Colors;
const { isPending } = ReduxUtils;

const COURT_TYPE_OPTIONS = COURT_TYPES.sort().map((courtType :string) => ({ label: courtType, value: courtType }));

const tableHeaders = ['METRIC', 'TOTAL COUNT'];
const formattedTableHeaders :Object[] = generateTableHeaders(tableHeaders);

const ReferralsTableHeader = styled(TableHeader)`
  justify-content: space-between;
  padding-bottom: 20px;
`;

const ReferralsTableName = styled(TableName)`
  font-size: 20px;
`;

const ChargesCell = styled(TableCell)`
  color: ${NEUTRAL.N700};
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

const CourtTypeStatsTable = () => {

  const dispatch = useDispatch();

  const [selectedCourtType, setCourtType] = useState(COURT_TYPE_OPTIONS[0]);
  // console.log('selectedCourtType ', selectedCourtType);

  const onChangeSelect = (selectedTimeValue :Object, event :Object) => {
    if (event.name === 'courtType') setCourtType(selectedTimeValue);
  };

  useEffect(() => {
    dispatch(getStatsByCourtType({ selectedCourtType }));
  }, [dispatch, selectedCourtType]);

  const enrollmentStatusCountsForCourtType = useSelector((store) => store
    .getIn([STATE.STATS, ENROLLMENT_STATUS_COUNTS_FOR_COURT_TYPE]));
  const totalEnrollmentsForCourtType = useSelector((store) => store
    .getIn([STATE.STATS, TOTAL_ENROLLMENTS_FOR_COURT_TYPE]));
  const totalParticipantsForCourtType = useSelector((store) => store
    .getIn([STATE.STATS, TOTAL_PARTICIPANTS_FOR_COURT_TYPE]));

  const tableData = [
    { [tableHeaders[0]]: 'Total Enrollments', [tableHeaders[1]]: totalEnrollmentsForCourtType },
    { [tableHeaders[0]]: 'Total Participants', [tableHeaders[1]]: totalParticipantsForCourtType },
    { [tableHeaders[0]]: `${ACTIVE}/${JOB_SEARCH}`, [tableHeaders[1]]: enrollmentStatusCountsForCourtType.get(ACTIVE) },
    {
      [tableHeaders[0]]: AWAITING_CHECKIN,
      [tableHeaders[1]]: enrollmentStatusCountsForCourtType.get(AWAITING_CHECKIN)
    },
    { [tableHeaders[0]]: CLOSED, [tableHeaders[1]]: enrollmentStatusCountsForCourtType.get(CLOSED) },
    {
      [tableHeaders[0]]: `${COMPLETED}/${SUCCESSFUL}`,
      [tableHeaders[1]]: enrollmentStatusCountsForCourtType.get(COMPLETED)
    },
    {
      [tableHeaders[0]]: `${REMOVED_NONCOMPLIANT}/${UNSUCCESSFUL}`,
      [tableHeaders[1]]: enrollmentStatusCountsForCourtType.get(REMOVED_NONCOMPLIANT)
    },
  ];

  const fetchRequestState :?RequestState = useRequestState([STATE.STATS, ACTIONS, GET_STATS_BY_COURT_TYPE]);

  return (
    <>
      <TableCard>
        <ReferralsTableHeader padding="40px" vertical={false}>
          <ReferralsTableName>
            Stats Breakdown by Court Type
          </ReferralsTableName>
          <SmallSelectWrapper>
            <Select
                name="courtType"
                onChange={onChangeSelect}
                options={COURT_TYPE_OPTIONS}
                placeholder={COURT_TYPE_OPTIONS[0].label} />
          </SmallSelectWrapper>
        </ReferralsTableHeader>
        {
          isPending(fetchRequestState) ? (
            <CardSegment padding="40px">
              <Spinner size="2x" />
            </CardSegment>
          ) : (
            <CustomTable
                components={tableComponents}
                data={tableData}
                headers={formattedTableHeaders}
                isLoading={false} />
          )
        }
      </TableCard>
    </>
  );
};

export default CourtTypeStatsTable;
