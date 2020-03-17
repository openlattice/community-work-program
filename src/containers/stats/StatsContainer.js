// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  Skeleton,
  Spinner,
} from 'lattice-ui-kit';
import {
  Hint,
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
import { GET_STATS_DATA, getStatsData } from './StatsActions';
import { formatCourtTypeGraphData } from './utils/StatsUtils';
import {
  APP,
  SHARED,
  STATE,
  STATS,
} from '../../utils/constants/ReduxStateConsts';

const {
  BLACK,
  BLUE_2,
  NEUTRALS,
  PURPLES,
  WHITE
} = Colors;
const {
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  TOTAL_ACTIVE_PARTICIPANT_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
} = STATS;
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

const toolTipStyle :Object = {
  alignItems: 'center',
  // background: PURPLES[1],
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
  peopleByCourtTypeGraphData :Map;
  entitySetIds :Map;
  requestStates :{
    GET_STATS_DATA :RequestState;
  };
  totalActiveParticipantCount :number;
  totalDiversionPlanCount :number;
  totalParticipantCount :number;
};

const StatsContainer = ({
  actions,
  enrollmentsByCourtTypeGraphData,
  entitySetIds,
  peopleByCourtTypeGraphData,
  requestStates,
  totalActiveParticipantCount,
  totalDiversionPlanCount,
  totalParticipantCount,
} :Props) => {

  const [hoveredBar, setHoveredBar] = useState({});
  const [hoverText, setHoverText] = useState('');
  const [background, setBackgroundColor] = useState(WHITE);
  const toolTipStyleWithBackground :Object = { background, ...toolTipStyle };

  useEffect(() => {
    if (!entitySetIds.isEmpty()) actions.getStatsData();
  }, [actions, entitySetIds]);
  const dataIsLoading :boolean = requestStates[GET_STATS_DATA] === RequestStates.PENDING;
  const graphData :Object[] = formatCourtTypeGraphData(enrollmentsByCourtTypeGraphData);
  return (
    <ContainerOuterWrapper>
      <ContainerInnerWrapper>
        <HeaderWrapper>
          <ContainerHeader>Statistics on Community Work Program</ContainerHeader>
        </HeaderWrapper>
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
        <Card>
          <CardSegment padding="30px" vertical>
            {
              dataIsLoading
                ? (
                  <Spinner size="2x" />
                )
                : (
                  <XYPlot
                      xType="ordinal"
                      height={190}
                      margin={{
                        left: 40,
                        right: 10,
                        top: 10,
                        bottom: 40
                      }}
                      style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '12px' }}
                      width={1000}>
                    <XAxis />
                    <YAxis title="Number of enrollments" />
                    <VerticalBarSeries
                        barWidth={0.55}
                        color={BLUE_2}
                        data={graphData}
                        onValueMouseOver={(v :Object) => {
                          if (v.x && v.y) {
                            setHoveredBar(v);
                            setHoverText(`${v.y} enrollments`);
                            setBackgroundColor(PURPLES[1]);
                          }
                        }}
                        onValueMouseOut={() => {
                          setHoveredBar({});
                          setHoverText('');
                          setBackgroundColor(WHITE);
                        }} />
                    {
                      hoveredBar && (
                        <Hint
                            value={hoveredBar}>
                          <div style={Object.assign(toolTipStyleWithBackground)}>{ hoverText }</div>
                        </Hint>
                      )
                    }
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
  const stats = state.get(STATE.STATS);
  const app = state.get(STATE.APP);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: stats.get(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA),
    [TOTAL_DIVERSION_PLAN_COUNT]: stats.get(TOTAL_DIVERSION_PLAN_COUNT),
    [TOTAL_PARTICIPANT_COUNT]: stats.get(TOTAL_PARTICIPANT_COUNT),
    [TOTAL_ACTIVE_PARTICIPANT_COUNT]: stats.get(TOTAL_ACTIVE_PARTICIPANT_COUNT),
    [PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
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
