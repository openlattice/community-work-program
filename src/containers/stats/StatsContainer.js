// @flow
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  Skeleton,
  Spinner,
} from 'lattice-ui-kit';
import {
  VerticalBarSeries,
  XYPlot,
  XAxis,
  YAxis,
} from 'react-vis';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { ContainerHeader, ContainerInnerWrapper, ContainerOuterWrapper } from '../../components/Layout';
import { getDiversionPlans } from '../participants/ParticipantsActions';
import { formatCourtTypeGraphData, getCurrentlyActiveParticipants } from './utils/StatsUtils';
import {
  APP,
  PEOPLE,
  SHARED,
  STATE
} from '../../utils/constants/ReduxStateConsts';

const {
  BLACK,
  BLUE_1,
  NEUTRALS,
  WHITE
} = Colors;
const {
  ENROLLMENT_BY_PARTICIPANT,
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  GET_DIVERSION_PLANS,
  PARTICIPANTS,
  TOTAL_DIVERSION_PLAN_COUNT
} = PEOPLE;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;

const HeaderWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StatsWrapper = styled.div`
  display: flex;
  margin-top: 20px;
`;

const StatBox = styled.div`
  align-items: center;
  background-color: ${WHITE};
  border-radius: 5px;
  border: 1px solid ${NEUTRALS[4]};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 20px 20px 0;
  padding: 17px 0;
  width: 225px;

:last-of-type {
    margin-right: 0;
  }
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

const StatsBoxSkeleton = () => (
  <>
    <Skeleton height={36} width="20%" />
    <Skeleton height={26} width="80%" />
  </>
);

type Props = {
  actions :{
    getDiversionPlans :RequestSequence;
  };
  enrollmentByParticipant :Map;
  enrollmentsByCourtTypeGraphData :Map;
  entitySetIds :Map;
  getDiversionPlansRequestState :RequestState;
  participants :List;
  totalDiversionPlanCount :number;
};

const StatsContainer = ({
  actions,
  enrollmentByParticipant,
  enrollmentsByCourtTypeGraphData,
  entitySetIds,
  getDiversionPlansRequestState,
  participants,
  totalDiversionPlanCount,
} :Props) => {

  useEffect(() => {
    if (!entitySetIds.isEmpty()) actions.getDiversionPlans();
  }, [actions, entitySetIds]);
  const diversionPlansAreLoading :boolean = getDiversionPlansRequestState === RequestStates.PENDING;
  const participantsCount :number = participants.count();
  const currentlyActiveParticipantCount :number = getCurrentlyActiveParticipants(enrollmentByParticipant, participants)
    .count();
  const graphData :Object[] = formatCourtTypeGraphData(enrollmentsByCourtTypeGraphData);
  return (
    <ContainerOuterWrapper>
      <ContainerInnerWrapper>
        <HeaderWrapper>
          <ContainerHeader>Statistics on Community Work Program</ContainerHeader>
        </HeaderWrapper>
        <StatsWrapper>
          {
            diversionPlansAreLoading
              ? (
                <>
                  {
                    [1, 2, 3].map((num :number) => (
                      <StatBox key={num}>
                        <StatsBoxSkeleton />
                      </StatBox>
                    ))
                  }
                </>
              )
              : (
                <>
                  <StatBox>
                    <Number>{ totalDiversionPlanCount }</Number>
                    <Category>Total Enrollments</Category>
                  </StatBox>
                  <StatBox>
                    <Number>{ participantsCount }</Number>
                    <Category>Unique Participants</Category>
                  </StatBox>
                  <StatBox>
                    <Number>{ currentlyActiveParticipantCount }</Number>
                    <Category>Currently Active</Category>
                  </StatBox>
                </>
              )
          }
        </StatsWrapper>
        <Card>
          <CardSegment padding="30px" vertical>
            {
              diversionPlansAreLoading
                ? (
                  <Spinner size="2x" />
                )
                : (
                  <XYPlot
                      xType="ordinal"
                      height={190}
                      margin={{
                        left: 90,
                        right: 10,
                        top: 10,
                        bottom: 40
                      }}
                      style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '11px' }}
                      width={854}>
                    <XAxis />
                    <YAxis />
                    <VerticalBarSeries barWidth={0.55} color={BLUE_1} data={graphData} />
                  </XYPlot>
                )
            }
          </CardSegment>
        </Card>
      </ContainerInnerWrapper>
    </ContainerOuterWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const people = state.get(STATE.PEOPLE);
  const app = state.get(STATE.APP);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: people.get(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [TOTAL_DIVERSION_PLAN_COUNT]: people.get(TOTAL_DIVERSION_PLAN_COUNT),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getDiversionPlansRequestState: people.getIn([ACTIONS, GET_DIVERSION_PLANS, REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getDiversionPlans,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StatsContainer);
