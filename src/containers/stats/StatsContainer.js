// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Colors,
  Skeleton,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import CourtTypeGraphs from './courttype/CourtTypeGraphs';
import DemographicsGraphs from './demographics/DemographicsGraphs';
import WorkSiteGraphs from './worksite/WorkSiteGraphs';
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
  WHITE
} = Colors;
const {
  ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  TOTAL_ACTIVE_PARTICIPANT_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
  UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
} = STATS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;

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

`;

const StatsBoxSkeleton = () => (
  <>
    <Skeleton height={36} width="20%" />
    <Skeleton height={26} width="80%" />
  </>
);

const toolTipStyle :Object = {
  borderRadius: '3px',
  color: WHITE,
  display: 'flex',
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '13px',
  padding: '5px 10px',
};

type Props = {
  actions :{
    getStatsData :RequestSequence;
  };
  enrollmentsByCourtTypeGraphData :Map;
  activePeopleByCourtTypeGraphData :Map;
  entitySetIds :Map;
  requestStates :{
    GET_STATS_DATA :RequestState;
  };
  successfulPeopleByCourtTypeGraphData :Map;
  totalActiveParticipantCount :number;
  totalDiversionPlanCount :number;
  totalParticipantCount :number;
  unsuccessfulPeopleByCourtTypeGraphData :Map;
};

const StatsContainer = ({
  actions,
  activePeopleByCourtTypeGraphData,
  enrollmentsByCourtTypeGraphData,
  entitySetIds,
  requestStates,
  successfulPeopleByCourtTypeGraphData,
  totalActiveParticipantCount,
  totalDiversionPlanCount,
  totalParticipantCount,
  unsuccessfulPeopleByCourtTypeGraphData,
} :Props) => {

  const dataIsLoading :boolean = requestStates[GET_STATS_DATA] === RequestStates.PENDING;
  const [screenViewSelected, toggleScreenView] = useState(SCREEN_VIEWS.COURT_TYPE);
  useEffect(() => {
    if (!entitySetIds.isEmpty()) actions.getStatsData();
  }, [actions, entitySetIds]);
  return (
    <ContainerOuterWrapper>
      <ContainerInnerWrapper>
        <StatsWrapper>
          {
            dataIsLoading
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
                    <Number>{ totalParticipantCount }</Number>
                    <Category>Unique Participants</Category>
                  </StatBox>
                  <StatBox>
                    <Number>{ totalActiveParticipantCount }</Number>
                    <Category>Currently Active</Category>
                  </StatBox>
                </>
              )
          }
        </StatsWrapper>
      </ContainerInnerWrapper>
    </ContainerOuterWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  const app = state.get(STATE.APP);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
    [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: stats.get(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA),
    [SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
    [TOTAL_ACTIVE_PARTICIPANT_COUNT]: stats.get(TOTAL_ACTIVE_PARTICIPANT_COUNT),
    [TOTAL_DIVERSION_PLAN_COUNT]: stats.get(TOTAL_DIVERSION_PLAN_COUNT),
    [TOTAL_PARTICIPANT_COUNT]: stats.get(TOTAL_PARTICIPANT_COUNT),
    [UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
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
