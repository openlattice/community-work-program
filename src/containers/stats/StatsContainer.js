// @flow
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Colors,
  Select,
  Skeleton,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faCheckCircle,
  faClipboard,
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
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from './consts/StatsConsts';

const {
  BLACK,
  NEUTRALS,
  PURPLES,
  WHITE
} = Colors;
const {
  ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  TOTAL_ACTIVE_PARTICIPANT_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
  TOTAL_SUCCESSFUL_PARTICIPANT_COUNT,
  TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT,
  UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
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

const SelectWrapper = styled.div`
  margin-left: 20px;
  width: 150px;
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

const MonthAndYearRow = styled(ToolbarRow)`
  justify-content: flex-end;
  margin-bottom: 30px;
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
  totalSuccessfulParticipantCount :number;
  totalUnsuccessfulParticipantCount :number;
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
  totalSuccessfulParticipantCount,
  totalUnsuccessfulParticipantCount,
  unsuccessfulPeopleByCourtTypeGraphData,
} :Props) => {

  const dataIsLoading :boolean = requestStates[GET_STATS_DATA] === RequestStates.PENDING;
  const [screenViewSelected, toggleScreenView] = useState(SCREEN_VIEWS.COURT_TYPE);
  useEffect(() => {
    if (!entitySetIds.isEmpty()) actions.getStatsData();
  }, [actions, entitySetIds]);

  let screenViewComponent;

  const courtTypeGraphsComponent = (
    <CourtTypeGraphs
        activePeopleByCourtTypeGraphData={activePeopleByCourtTypeGraphData}
        enrollmentsByCourtTypeGraphData={enrollmentsByCourtTypeGraphData}
        dataIsLoading={dataIsLoading}
        successfulPeopleByCourtTypeGraphData={successfulPeopleByCourtTypeGraphData}
        unsuccessfulPeopleByCourtTypeGraphData={unsuccessfulPeopleByCourtTypeGraphData} />
  );
  switch (screenViewSelected) {
    case SCREEN_VIEWS.COURT_TYPE:
      screenViewComponent = courtTypeGraphsComponent;
      break;

    case SCREEN_VIEWS.WORK_SITES:
      screenViewComponent = <WorkSiteGraphs />;
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

  const [timeFrame, setTimeFrame] = useState(ALL_TIME);
  const timeFrameSelectChange = (option :Object) => {
    const { value } = option;
    setTimeFrame(value);
  };

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
                        <Number>{ totalActiveParticipantCount }</Number>
                        <Category>Currently Active</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                  </StatsRow>
                  <StatsRow>
                    <StatBox>
                      <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalSuccessfulParticipantCount }</Number>
                        <Category>Completed/Successful</Category>
                      </StatBoxInnerWrapper>
                    </StatBox>
                    <StatBox>
                      <FontAwesomeIcon icon={faTimesCircle} size="3x" />
                      <StatBoxInnerWrapper>
                        <Number>{ totalUnsuccessfulParticipantCount }</Number>
                        <Category>Removed/Unsuccessful</Category>
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
          <SelectWrapper>
            <Select
                onChange={timeFrameSelectChange}
                options={TIME_FRAME_OPTIONS}
                placeholder={timeFrame} />
          </SelectWrapper>
        </ToolbarRow>
        <MonthAndYearRow>
          { timeFrame === MONTHLY
            && (
              <SelectWrapper>
                <Select
                    options={MONTHS_OPTIONS}
                    placeholder="Select month..." />
              </SelectWrapper>
            )}
          { (timeFrame === MONTHLY || timeFrame === YEARLY)
            && (
              <SelectWrapper>
                <Select
                    options={YEARS_OPTIONS}
                    placeholder="Select year..." />
              </SelectWrapper>
            )}
        </MonthAndYearRow>
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
    [ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
    [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: stats.get(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA),
    [SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: stats.get(SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA),
    [TOTAL_ACTIVE_PARTICIPANT_COUNT]: stats.get(TOTAL_ACTIVE_PARTICIPANT_COUNT),
    [TOTAL_DIVERSION_PLAN_COUNT]: stats.get(TOTAL_DIVERSION_PLAN_COUNT),
    [TOTAL_PARTICIPANT_COUNT]: stats.get(TOTAL_PARTICIPANT_COUNT),
    [TOTAL_SUCCESSFUL_PARTICIPANT_COUNT]: stats.get(TOTAL_SUCCESSFUL_PARTICIPANT_COUNT),
    [TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT]: stats.get(TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT),
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
