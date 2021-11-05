// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  CardSegment,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { GET_REFERRALS_BY_COURT_TYPE, getReferralsByCourtType } from './CourtTypeActions';

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
import { generateTableHeaders } from '../../../utils/FormattingUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import {
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import {
  ActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
} from '../styled/GraphStyles';

const { REFERRALS_BY_COURT_TYPE } = STATS;
const { ACTIONS } = SHARED;
const { isPending } = ReduxUtils;

const ReferralsTableHeader = styled(TableHeader)`
  justify-content: space-between;
  padding-bottom: 20px;
`;

const ReferralsTableName = styled(TableName)`
  font-size: 20px;
`;

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

const tableHeaders = ['COURT TYPE', 'REFERRALS COUNT'];
const formattedTableHeaders :Object[] = generateTableHeaders(tableHeaders);

const ReferralsByCourtType = () => {

  const dispatch = useDispatch();
  const today :DateTime = DateTime.local();

  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);

  const onChangeSelect = (selectedTimeValue :Object, event :Object) => {
    if (event.name === 'month') setMonth(selectedTimeValue);
    if (event.name === 'year') setYear(selectedTimeValue);
    if (event.name === 'timeframe') setTimeFrame(selectedTimeValue);
  };

  useEffect(() => {
    dispatch(getReferralsByCourtType({ month: month.value, year: year.value, timeFrame: timeFrame.value }));
  }, [dispatch, month, timeFrame, year]);

  const referralsByCourtType = useSelector((store) => store.getIn([STATE.STATS, REFERRALS_BY_COURT_TYPE]));

  const tableData = [];
  referralsByCourtType.forEach((referralsCount :number, courtType :string) => {
    tableData.push({ [tableHeaders[0]]: courtType, [tableHeaders[1]]: referralsCount, id: courtType });
  });

  const fetchRequestState :?RequestState = useRequestState([STATE.STATS, ACTIONS, GET_REFERRALS_BY_COURT_TYPE]);

  return (
    <>
      <TableCard>
        <ReferralsTableHeader padding="40px" vertical={false}>
          <ReferralsTableName>
            Total Referrals By Court Type
          </ReferralsTableName>
          <SmallSelectWrapper>
            <Select
                name="timeframe"
                onChange={onChangeSelect}
                options={[TIME_FRAME_OPTIONS[0], TIME_FRAME_OPTIONS[2]]}
                placeholder={TIME_FRAME_OPTIONS[2].label} />
          </SmallSelectWrapper>
        </ReferralsTableHeader>
        {
          (timeFrame.value === MONTHLY) && (
            <CardSegment padding="0 40px 20px">
              <InnerHeaderRow>
                <ActionsWrapper>
                  <SelectsWrapper>
                    <Select
                        name="month"
                        onChange={onChangeSelect}
                        options={MONTHS_OPTIONS}
                        placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                    <Select
                        name="year"
                        onChange={onChangeSelect}
                        options={YEARS_OPTIONS}
                        placeholder={today.year} />
                  </SelectsWrapper>
                </ActionsWrapper>
              </InnerHeaderRow>
            </CardSegment>
          )
        }
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

export default ReferralsByCourtType;
