// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
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

import EnrollmentsAndStatusByCourtType from './EnrollmentsAndStatusByCourtType';
import MonthlyHoursAndParticipantsGraph from './MonthlyHoursAndParticipantsGraph';
import ReferralsByCourtTypeGraph from './ReferralsByCourtTypeGraph';
import {
  ActionsWrapper,
  GraphHeader,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
} from '../styled/GraphStyles';
import {
  GraphDescription,
  KeyItem,
  KeyItemWrapper,
  KeySquare,
} from '../styled/RadialChartStyles';
import { formatReferralsCourtTypeData } from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_MONTHLY_COURT_TYPE_DATA,
  getEnrollmentsByCourtType,
  getMonthlyCourtTypeData,
  getStatsData,
} from '../StatsActions';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { OL } from '../../../core/style/Colors';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { BLUE_2, PURPLES, YELLOW_1 } = Colors;
const { PINK01 } = OL;

const STATUSES_PER_BAR = [
  { status: 'Successful/Completed', color: PURPLES[2] },
  { status: 'Unsuccessful/Noncompliant', color: PURPLES[0] },
  { status: 'Closed', color: BLUE_2 },
  { status: 'Active', color: PINK01 },
  { status: 'Job Search', color: YELLOW_1 },
];

const KeyWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const KeyItemWrapperHorizontal = styled(KeyItemWrapper)`
  margin-right: 20px;
`;

type Props = {
  actions :{
    getEnrollmentsByCourtType :RequestSequence;
    getMonthlyCourtTypeData :RequestSequence;
    getStatsData :RequestSequence;
  };
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  dataIsLoading :boolean;
  jobSearchEnrollmentsByCourtType :Map;
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
  referralsByCourtTypeGraphData :Map;
  requestStates :{
    GET_ENROLLMENTS_BY_COURT_TYPE :RequestState;
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
  jobSearchEnrollmentsByCourtType,
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
  // hours/participants by court type:
  const [hoursMonth, setHoursMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [hoursYear, setHoursYear] = useState(currentYearOption);
  const getNewHoursData = () => {
    actions.getMonthlyCourtTypeData({ month: hoursMonth.value, year: hoursYear.value });
  };
  // enrollments by court type:
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const [enrollmentsMonth, setEnrollmentsMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const [enrollmentsYear, setEnrollmentsYear] = useState(currentYearOption);
  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getStatsData();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };
  const getNewEnrollmentsData = () => {
    actions.getEnrollmentsByCourtType({
      month: enrollmentsMonth.value,
      year: enrollmentsYear.value,
      timeFrame: timeFrame.value
    });
  };

  return (
    <CardStack>
      <Card>
        <GraphHeader>
          <InnerHeaderRow>
            <div>Total Enrollments by Court Type</div>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
                  options={TIME_FRAME_OPTIONS}
                  placeholder={TIME_FRAME_OPTIONS[2].label} />
            </SmallSelectWrapper>
          </InnerHeaderRow>
          {
            (timeFrame.value === MONTHLY || timeFrame.value === YEARLY) && (
              <InnerHeaderRow>
                <ActionsWrapper>
                  <SelectsWrapper>
                    <Select
                        isDisabled={timeFrame.value === YEARLY}
                        name="month"
                        onChange={setEnrollmentsMonth}
                        options={MONTHS_OPTIONS}
                        placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                    <Select
                        name="year"
                        onChange={setEnrollmentsYear}
                        options={YEARS_OPTIONS}
                        placeholder={today.year} />
                  </SelectsWrapper>
                  <IconButton
                      icon={<FontAwesomeIcon icon={faSearch} />}
                      onClick={getNewEnrollmentsData} />
                </ActionsWrapper>
              </InnerHeaderRow>
            )
          }
        </GraphHeader>
        <CardSegment padding="30px" vertical>
          {
            dataIsLoading || requestIsPending(requestStates[GET_ENROLLMENTS_BY_COURT_TYPE])
              ? (
                <Spinner size="2x" />
              )
              : (
                <EnrollmentsAndStatusByCourtType
                    activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
                    closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
                    jobSearchEnrollmentsByCourtType={jobSearchEnrollmentsByCourtType}
                    successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
                    unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
              )
          }
        </CardSegment>
        <CardSegment padding="30px" vertical>
          <KeyWrapper>
            {
              STATUSES_PER_BAR.map(({ status, color } :Object) => (
                <KeyItemWrapperHorizontal key={status}>
                  <KeySquare color={color} />
                  <KeyItem>{ status }</KeyItem>
                </KeyItemWrapperHorizontal>
              ))
            }
          </KeyWrapper>
          <GraphDescription>
            Monthly and yearly graphs show all enrollment statuses recorded in that time period. Therefore,
            enrollments may be counted more than once if the status changed within the time period.
          </GraphDescription>
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
                    referralsGraphData={referralsGraphData} />
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
                  onChange={setHoursMonth}
                  options={MONTHS_OPTIONS}
                  placeholder={MONTHS_OPTIONS[today.month - 1].label} />
              <Select
                  name="year"
                  onChange={setHoursYear}
                  options={YEARS_OPTIONS}
                  placeholder={today.year} />
            </SelectsWrapper>
            <IconButton
                icon={<FontAwesomeIcon icon={faSearch} />}
                onClick={getNewHoursData} />
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
                    monthlyTotalParticipantsByCourtType={monthlyTotalParticipantsByCourtType} />
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
      [GET_ENROLLMENTS_BY_COURT_TYPE]: stats.getIn([ACTIONS, GET_ENROLLMENTS_BY_COURT_TYPE, REQUEST_STATE]),
      [GET_MONTHLY_COURT_TYPE_DATA]: stats.getIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getEnrollmentsByCourtType,
    getMonthlyCourtTypeData,
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CourtTypeGraphs);
