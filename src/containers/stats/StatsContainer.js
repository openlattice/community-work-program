// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Colors,
  Skeleton,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faCheckCircle,
  faClipboard,
  faHandPaper,
  faTimesCircle,
  faUserAlt,
} from '@fortawesome/pro-duotone-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ChargesGraphs from './charges/ChargesGraphs';
import CourtTypeGraphs from './courttype/CourtTypeGraphs';
import DemographicsGraphs from './demographics/DemographicsGraphs';
import WorksiteGraphs from './worksite/WorksiteGraphs';
import LogoLoader from '../../components/LogoLoader';
import { ContainerInnerWrapper, ContainerOuterWrapper } from '../../components/Layout';
import { GET_STATS_DATA, getStatsData } from './StatsActions';
import {
  APP,
  SHARED,
  STATE,
  STATS,
} from '../../utils/constants/ReduxStateConsts';

const {
  BLACK,
  NEUTRALS,
  PURPLES,
  WHITE
} = Colors;
const {
  ACTIVE_ENROLLMENTS_BY_COURT_TYPE,
  CLOSED_ENROLLMENTS_BY_COURT_TYPE,
  MONTHLY_HOURS_WORKED_BY_COURT_TYPE,
  MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  REFERRALS_BY_COURT_TYPE_GRAPH_DATA,
  SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE,
  TOTAL_ACTIVE_ENROLLMENTS_COUNT,
  TOTAL_CLOSED_ENROLLMENTS_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
  TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT,
  TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT,
  UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE,
} = STATS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;

const StatsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatsRow = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const StatBox = styled.div`
  align-items: center;
  background-color: ${WHITE};
  border-radius: 5px;
  border: 1px solid ${NEUTRALS[4]};
  box-sizing: border-box;
  display: flex;
  margin: 0 20px 20px 0;
  padding: 20px;
  width: 300px;

  :last-of-type {
    margin-right: 0;
  }
`;

const StatBoxInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`;

const Number = styled.div`
  color: ${BLACK};
  font-size: 30px;
`;

const Category = styled.div`
  color: ${NEUTRALS[1]};
  font-size: 16px;
  font-weight: 600;
`;

const ToolbarRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ToolbarWrapper = styled.div`
  display: flex;
  margin: 30px 0;
`;

const ToolbarButton = styled(Button)`
  background-color: ${(props) => (props.selected ? PURPLES[1] : NEUTRALS[7])};
  border-bottom: 1px solid ${NEUTRALS[4]};
  border-radius: 0;
  border-right: 1px solid ${NEUTRALS[4]};
  border-top: 1px solid ${NEUTRALS[4]};
  color: ${(props) => (props.selected ? WHITE : NEUTRALS[0])};
  width: 150px;

  &:hover {
    background-color: ${(props) => (props.selected ? PURPLES[1] : NEUTRALS[5])};
    border-color: ${(props) => (props.selected ? PURPLES[1] : NEUTRALS[4])};
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
    border-left: 1px solid ${NEUTRALS[4]};
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const StatsBoxSkeleton = () => (
  <StatsWrapper>
    <StatsRow>
      {
        [0, 1, 2].map((num) => (
          <StatBox key={num}>
            <Skeleton height={48} width="48px" />
            <StatBoxInnerWrapper>
              <Skeleton height={45} width="136px" />
              <Skeleton height={26} width="180px" />
            </StatBoxInnerWrapper>
          </StatBox>
        ))
      }
    </StatsRow>
    <StatsRow>
      {
        [0, 1].map((num) => (
          <StatBox key={num}>
            <Skeleton height={48} width="48px" />
            <StatBoxInnerWrapper>
              <Skeleton height={45} width="136px" />
              <Skeleton height={26} width="180px" />
            </StatBoxInnerWrapper>
          </StatBox>
        ))
      }
    </StatsRow>
  </StatsWrapper>
);

const SCREEN_VIEWS = {
  COURT_TYPE: 'Court Type',
  WORK_SITES: 'Work Sites',
  DEMOGRAPHICS: 'Demographics',
  CHARGES: 'Charges'
};

type Props = {
  actions :{
    getStatsData :RequestSequence;
  };
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  entitySetIds :Map;
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
  referralsByCourtTypeGraphData :Map;
  requestStates :{
    GET_STATS_DATA :RequestState;
  };
  successfulEnrollmentsByCourtType :Map;
  totalActiveEnrollmentsCount :number;
  totalClosedEnrollmentsCount :number;
  totalDiversionPlanCount :number;
  totalParticipantCount :number;
  totalSuccessfulEnrollmentsCount :number;
  totalUnsuccessfulEnrollmentsCount :number;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const StatsContainer = ({
  actions,
  activeEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  entitySetIds,
  monthlyHoursWorkedByCourtType,
  monthlyTotalParticipantsByCourtType,
  referralsByCourtTypeGraphData,
  requestStates,
  successfulEnrollmentsByCourtType,
  totalActiveEnrollmentsCount,
  totalClosedEnrollmentsCount,
  totalDiversionPlanCount,
  totalParticipantCount,
  totalSuccessfulEnrollmentsCount,
  totalUnsuccessfulEnrollmentsCount,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => {

  const dataIsLoading :boolean = requestStates[GET_STATS_DATA] === RequestStates.PENDING;
  const [screenViewSelected, toggleScreenView] = useState(SCREEN_VIEWS.COURT_TYPE);
  useEffect(() => {
    if (!entitySetIds.isEmpty()) actions.getStatsData();
  }, [actions, entitySetIds]);

  let screenViewComponent;

  const courtTypeGraphsComponent = (
    <CourtTypeGraphs
        activeEnrollmentsByCourtType={activeEnrollmentsByCourtType}
        closedEnrollmentsByCourtType={closedEnrollmentsByCourtType}
        dataIsLoading={dataIsLoading}
        monthlyHoursWorkedByCourtType={monthlyHoursWorkedByCourtType}
        monthlyTotalParticipantsByCourtType={monthlyTotalParticipantsByCourtType}
        referralsByCourtTypeGraphData={referralsByCourtTypeGraphData}
        successfulEnrollmentsByCourtType={successfulEnrollmentsByCourtType}
        unsuccessfulEnrollmentsByCourtType={unsuccessfulEnrollmentsByCourtType} />
  );
  switch (screenViewSelected) {
    case SCREEN_VIEWS.COURT_TYPE:
      screenViewComponent = courtTypeGraphsComponent;
      break;

    case SCREEN_VIEWS.WORK_SITES:
      screenViewComponent = <WorksiteGraphs />;
      break;

    case SCREEN_VIEWS.DEMOGRAPHICS:
      screenViewComponent = <DemographicsGraphs />;
      break;

    case SCREEN_VIEWS.CHARGES:
      screenViewComponent = <ChargesGraphs />;
      break;

    default:
      screenViewComponent = courtTypeGraphsComponent;
      break;
  }

  const buttonOptions :Object[] = Object.values(SCREEN_VIEWS).map((value) => ({
    label: value,
    value,
    onClick: () => toggleScreenView(value)
  }));

  return (
    <ContainerOuterWrapper>
      <ContainerInnerWrapper>
        <StatsWrapper>
          {
            dataIsLoading
              ? (
                <StatsBoxSkeleton />
              )
              : (
                <>
                  <StatsRow>
                    <StatBox>
                      <FontAwesomeIcon icon={faClipboard} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalDiversionPlanCount }</Number>
                        <Category>Total Enrollments</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                    <StatBox>
                      <FontAwesomeIcon icon={faUserAlt} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalParticipantCount }</Number>
                        <Category>Unique Participants</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                    <StatBox>
                      <FontAwesomeIcon icon={faBriefcase} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalActiveEnrollmentsCount }</Number>
                        <Category>Active Enrollments</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                  </StatsRow>
                  <StatsRow>
                    <StatBox>
                      <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalSuccessfulEnrollmentsCount }</Number>
                        <Category>Completed/Successful</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                    <StatBox>
                      <FontAwesomeIcon icon={faTimesCircle} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalUnsuccessfulEnrollmentsCount }</Number>
                        <Category>Removed/Unsuccessful</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                    <StatBox>
                      <FontAwesomeIcon icon={faHandPaper} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalClosedEnrollmentsCount }</Number>
                        <Category>Closed Enrollments</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                  </StatsRow>
                </>
              )
          }
        </StatsWrapper>
        <ToolbarRow>
          <ToolbarWrapper>
            { buttonOptions.map((option :Object) => (
              <ToolbarButton
                  key={option.value}
                  onClick={option.onClick}
                  selected={option.value === screenViewSelected}>
                {option.label}
              </ToolbarButton>
            )) }
          </ToolbarWrapper>
        </ToolbarRow>
        { dataIsLoading ? <LogoLoader loadingText="Loading charts..." size={50} /> : screenViewComponent }
      </ContainerInnerWrapper>
    </ContainerOuterWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  const app = state.get(STATE.APP);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ACTIVE_ENROLLMENTS_BY_COURT_TYPE]: stats.get(ACTIVE_ENROLLMENTS_BY_COURT_TYPE),
    [CLOSED_ENROLLMENTS_BY_COURT_TYPE]: stats.get(CLOSED_ENROLLMENTS_BY_COURT_TYPE),
    [MONTHLY_HOURS_WORKED_BY_COURT_TYPE]: stats.get(MONTHLY_HOURS_WORKED_BY_COURT_TYPE),
    [MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE]: stats.get(MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE),
    [REFERRALS_BY_COURT_TYPE_GRAPH_DATA]: stats.get(REFERRALS_BY_COURT_TYPE_GRAPH_DATA),
    [SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE]: stats.get(SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE),
    [TOTAL_ACTIVE_ENROLLMENTS_COUNT]: stats.get(TOTAL_ACTIVE_ENROLLMENTS_COUNT),
    [TOTAL_CLOSED_ENROLLMENTS_COUNT]: stats.get(TOTAL_CLOSED_ENROLLMENTS_COUNT),
    [TOTAL_DIVERSION_PLAN_COUNT]: stats.get(TOTAL_DIVERSION_PLAN_COUNT),
    [TOTAL_PARTICIPANT_COUNT]: stats.get(TOTAL_PARTICIPANT_COUNT),
    [TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT]: stats.get(TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT),
    [TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT]: stats.get(TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT),
    [UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE]: stats.get(UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    requestStates: {
      [GET_STATS_DATA]: stats.getIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StatsContainer);
