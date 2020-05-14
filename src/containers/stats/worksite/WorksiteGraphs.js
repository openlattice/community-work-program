// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  CardStack,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import HoursByWorksiteGraph from './HoursByWorksiteGraph';
import { ActionsWrapper, GraphHeader, SelectsWrapper } from '../styled/GraphStyles';
import {
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_PARTICIPANTS_BY_WORKSITE,
  getHoursWorkedByWorksite,
  getMonthlyParticipantsByWorksite
} from './WorksiteStatsActions';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { HOURS_BY_WORKSITE, PARTICIPANTS_BY_WORKSITE } = STATS;

const expandIcon = <FontAwesomeIcon icon={faChevronDown} size="xs" />;

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)`
  && {
    background-color: white;
  }
`;

const InnerHeaderRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SmallSelectWrapper = styled.div`
  font-weight: normal;
  width: 150px;
`;

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

type Props = {
  actions :{
    getHoursWorkedByWorksite :RequestSequence;
    getMonthlyParticipantsByWorksite :RequestSequence;
  };
  hoursByWorksite :Map;
  participantsByWorksite :Map;
  requestStates :{
    GET_HOURS_WORKED_BY_WORKSITE :RequestState;
    GET_MONTHLY_PARTICIPANTS_BY_WORKSITE :RequestState;
  };
};

const WorksiteGraphs = ({
  actions,
  hoursByWorksite,
  participantsByWorksite,
  requestStates
} :Props) => {

  const hoursDataIsLoading :boolean = requestIsPending(requestStates[GET_HOURS_WORKED_BY_WORKSITE]);
  const participantsDataIsLoading :boolean = requestIsPending(requestStates[GET_MONTHLY_PARTICIPANTS_BY_WORKSITE]);

  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const today :DateTime = DateTime.local();
  const [hoursMonth, setHoursMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [hoursYear, setHoursYear] = useState(currentYearOption);
  const [participantsMonth, setParticipantsMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const [participantsYear, setParticipantsYear] = useState(currentYearOption);

  const getHoursData = () => {
    actions.getHoursWorkedByWorksite({ month: hoursMonth.value, year: hoursYear.value, timeFrame: timeFrame.value });
  };

  const getParticipantsData = () => {
    actions.getMonthlyParticipantsByWorksite({ month: participantsMonth.value, year: participantsYear.value });
  };

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getHoursWorkedByWorksite();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const worksites :List = participantsByWorksite.keySeq().toList().sort();

  return (
    <CardStack>
      <Card>
        <GraphHeader>
          <InnerHeaderRow>
            <div>Total Hours Worked by Work Site</div>
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
                      onClick={getHoursData} />
                </ActionsWrapper>
              </InnerHeaderRow>
            )
          }
        </GraphHeader>
        <CardSegment vertical>
          {
            hoursDataIsLoading
              ? (
                <Spinner size="2x" />
              )
              : (
                <HoursByWorksiteGraph hoursByWorksite={hoursByWorksite} />
              )
          }
        </CardSegment>
      </Card>
      <Card>
        <GraphHeader>
          <div>Participants by Work Site, Monthly</div>
          <ActionsWrapper>
            <SelectsWrapper>
              <Select
                  name="month"
                  onChange={setParticipantsMonth}
                  options={MONTHS_OPTIONS}
                  placeholder={MONTHS_OPTIONS[today.month - 1].label} />
              <Select
                  name="year"
                  onChange={setParticipantsYear}
                  options={YEARS_OPTIONS}
                  placeholder={today.year} />
            </SelectsWrapper>
            <IconButton
                icon={<FontAwesomeIcon icon={faSearch} />}
                onClick={getParticipantsData} />
          </ActionsWrapper>
        </GraphHeader>
      </Card>
      <div>
        {
          participantsDataIsLoading
            ? (
              <SpinnerWrapper>
                <Spinner size="2x" />
              </SpinnerWrapper>
            )
            : (
              worksites.map((worksiteName :string) => {
                const participants :List = participantsByWorksite.get(worksiteName, List())
                  .sort((name1 :string, name2 :string) => {
                    if (name1.split(' ')[1] < name2.split(' ')[1]) return -1;
                    if (name1.split(' ')[1] > name2.split(' ')[1]) return 1;
                    return 0;
                  });
                const title = `${worksiteName} • ${participants.count()}`;
                return (
                  <ExpansionPanel key={worksiteName}>
                    <StyledExpansionPanelSummary expandIcon={expandIcon}>
                      <div>{ title }</div>
                    </StyledExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <CardSegment padding="0" vertical>
                        { participants.map((name :string) => <div>{ name }</div>) }
                      </CardSegment>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                );
              })
            )
        }
      </div>
    </CardStack>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [HOURS_BY_WORKSITE]: stats.get(HOURS_BY_WORKSITE),
    [PARTICIPANTS_BY_WORKSITE]: stats.get(PARTICIPANTS_BY_WORKSITE),
    requestStates: {
      [GET_HOURS_WORKED_BY_WORKSITE]: stats.getIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE]),
      [GET_MONTHLY_PARTICIPANTS_BY_WORKSITE]: stats
        .getIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getHoursWorkedByWorksite,
    getMonthlyParticipantsByWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorksiteGraphs);
