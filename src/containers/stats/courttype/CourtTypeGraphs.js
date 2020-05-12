// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  IconButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import MonthlyHoursAndParticipantsGraph from './MonthlyHoursAndParticipantsGraph';
import EnrollmentsAndStatusByCourtType from './EnrollmentsAndStatusByCourtType';
import ReferralsByCourtTypeGraph from './ReferralsByCourtTypeGraph';
import { formatReferralsCourtTypeData } from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { MONTHS_OPTIONS, YEARS_OPTIONS } from '../consts/StatsConsts';
import { GET_MONTHLY_COURT_TYPE_DATA, getMonthlyCourtTypeData } from '../StatsActions';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { BLACK, WHITE } = Colors;
const toolTipStyle :Object = {
  borderRadius: '3px',
  color: WHITE,
  display: 'flex',
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '13px',
  padding: '5px 10px',
};

const GraphHeader = styled(CardHeader)`
  flex-direction: column;
  color: ${BLACK};
  font-size: 20px;
  font-weight: 600;
`;

const ActionsWrapper = styled.div`
  display: flex;
  margin-top: 20px;
`;

const SelectsWrapper = styled.div`
  display: grid;
  grid-template-columns: 150px 150px;
  grid-gap: 0 10px;
  font-weight: normal;
  margin-right: 10px;
`;

type Props = {
  actions :{
    getMonthlyCourtTypeData :RequestSequence;
  };
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  dataIsLoading :boolean;
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
  referralsByCourtTypeGraphData :Map;
  requestStates :{
    GET_MONTHLY_COURT_TYPE_DATA :RequestState;
  };
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const CourtTypeGraphs = ({
  actions,
  activeEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  dataIsLoading,
  monthlyHoursWorkedByCourtType,
  monthlyTotalParticipantsByCourtType,
  referralsByCourtTypeGraphData,
  requestStates,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => {

  const monthlyDataIsLoading = requestIsPending(requestStates[GET_MONTHLY_COURT_TYPE_DATA]);
  const referralsGraphData :Object[] = formatReferralsCourtTypeData(referralsByCourtTypeGraphData);
  const today :DateTime = DateTime.local();
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);
  const getNewData = () => {
    actions.getMonthlyCourtTypeData({ month: month.value, year: year.value });
  };
  return (
    <CardStack>
      <Card>
        <GraphHeader>Total Enrollments by Court Type</GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <EnrollmentsAndStatusByCourtType
                    activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
                    closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
                    successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
                    toolTipStyle={toolTipStyle}
                    unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>
          Number of Referrals (Repeat Enrollments) by Court Type
        </GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <ReferralsByCourtTypeGraph
                    referralsGraphData={referralsGraphData}
                    toolTipStyle={toolTipStyle} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>
          <div>Number of Participants and Hours Worked by Court Type, Monthly</div>
          <ActionsWrapper>
            <SelectsWrapper>
              <Select
                  name="month"
                  onChange={setMonth}
                  options={MONTHS_OPTIONS}
                  placeholder={MONTHS_OPTIONS[today.month - 1].label} />
              <Select
                  name="year"
                  onChange={setYear}
                  options={YEARS_OPTIONS}
                  placeholder={today.year} />
            </SelectsWrapper>
            <IconButton
                icon={<FontAwesomeIcon icon={faSearch} />}
                onClick={getNewData} />
          </ActionsWrapper>
        </GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            (dataIsLoading || monthlyDataIsLoading)
              ? (
                <Spinner size="2x" />
              )
              : (
                <MonthlyHoursAndParticipantsGraph
                    monthlyHoursWorkedByCourtType={monthlyHoursWorkedByCourtType}
                    monthlyTotalParticipantsByCourtType={monthlyTotalParticipantsByCourtType}
                    toolTipStyle={toolTipStyle} />
              )
          }
        </CardSegment>
      </Card>
    </CardStack>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    requestStates: {
      [GET_MONTHLY_COURT_TYPE_DATA]: stats.getIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getMonthlyCourtTypeData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CourtTypeGraphs);
