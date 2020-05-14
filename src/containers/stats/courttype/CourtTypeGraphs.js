// @flow
import React, { useState } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  CardStack,
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
import { ActionsWrapper, GraphHeader, SelectsWrapper } from '../styled/GraphStyles';
import { MONTHS_OPTIONS, YEARS_OPTIONS } from '../consts/TimeConsts';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { GET_MONTHLY_COURT_TYPE_DATA, getMonthlyCourtTypeData } from '../StatsActions';
import { formatReferralsCourtTypeData } from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;

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
