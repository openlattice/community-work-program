// @flow
import React, { useState } from 'react';

import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  ExpansionPanel,
  ExpansionPanelDetails,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import HoursByWorksiteGraph from './HoursByWorksiteGraph';
import {
  DOWNLOAD_WORKSITE_STATS_DATA,
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_PARTICIPANTS_BY_WORKSITE,
  downloadWorksiteStatsData,
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
import {
  SpinnerWrapper,
  StyledExpansionPanelSummary,
  expandIcon,
} from '../styled/ExpansionStyles';
import {
  ActionsWrapper,
  GraphHeader,
  HeaderActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
} from '../styled/GraphStyles';
import { formatWorksiteHoursDataForDownload, formatWorksiteParticipantsDataForDownload } from '../utils/StatsUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { HOURS_BY_WORKSITE, PARTICIPANTS_BY_WORKSITE } = STATS;

type Props = {
  actions :{
    downloadWorksiteStatsData :RequestSequence;
    getHoursWorkedByWorksite :RequestSequence;
    getMonthlyParticipantsByWorksite :RequestSequence;
  };
  hoursByWorksite :Map;
  participantsByWorksite :Map;
  requestStates :{
    DOWNLOAD_WORKSITE_STATS_DATA :RequestState;
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

  const onChangeHoursMonth = (newMonth :Object) => {
    setHoursMonth(newMonth);
    actions.getHoursWorkedByWorksite({ month: newMonth.value, year: hoursYear.value, timeFrame: timeFrame.value });
  };

  const onChangeHoursYear = (newYear :Object) => {
    setHoursYear(newYear);
    actions.getHoursWorkedByWorksite({ month: hoursMonth.value, year: newYear.value, timeFrame: timeFrame.value });
  };

  const onChangeParticipantsMonth = (newMonth :Object) => {
    setParticipantsMonth(newMonth);
    actions.getMonthlyParticipantsByWorksite({ month: newMonth.value, year: participantsYear.value });
  };

  const onChangeParticipantsYear = (newYear :Object) => {
    setParticipantsYear(newYear);
    actions.getMonthlyParticipantsByWorksite({ month: participantsMonth.value, year: newYear.value });
  };

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getHoursWorkedByWorksite();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const worksites :List = participantsByWorksite.keySeq().toList().sort();

  const downloadHoursByWorksiteData = () => {
    const formattedWorksiteHoursData = formatWorksiteHoursDataForDownload(hoursByWorksite);
    let fileName :string = 'CWP_Hours_by_Worksite';
    if (timeFrame.value === MONTHLY) {
      fileName += `_${MONTHS_OPTIONS[hoursMonth.value - 1].label}_${hoursYear.value}`;
    }
    if (timeFrame.value === YEARLY) fileName += `_${hoursYear.value}`;
    actions.downloadWorksiteStatsData({
      fileName,
      worksiteData: formattedWorksiteHoursData,
    });
  };

  const downloadParticipantsByWorksite = () => {
    const formattedParticipantsData = formatWorksiteParticipantsDataForDownload(participantsByWorksite);
    /* eslint-disable-next-line */
    let fileName :string = `CWP_Participant_Names_by_Worksite_${MONTHS_OPTIONS[participantsMonth.value - 1].label}_${participantsYear.value}`;
    actions.downloadWorksiteStatsData({
      fileName,
      worksiteData: formattedParticipantsData,
    });
  };

  return (
    <CardStack>
      <Card>
        <GraphHeader>
          <InnerHeaderRow>
            <div>Total Hours Worked by Work Site</div>
            <HeaderActionsWrapper>
              <SmallSelectWrapper>
                <Select
                    onChange={onTimeFrameSelectChange}
                    options={TIME_FRAME_OPTIONS}
                    placeholder={TIME_FRAME_OPTIONS[2].label} />
              </SmallSelectWrapper>
              <Button
                  isLoading={requestIsPending(requestStates[DOWNLOAD_WORKSITE_STATS_DATA])}
                  onClick={downloadHoursByWorksiteData}>
                Download
              </Button>
            </HeaderActionsWrapper>
          </InnerHeaderRow>
          {
            (timeFrame.value === MONTHLY || timeFrame.value === YEARLY) && (
              <InnerHeaderRow>
                <ActionsWrapper>
                  <SelectsWrapper>
                    <Select
                        isDisabled={timeFrame.value === YEARLY}
                        name="month"
                        onChange={onChangeHoursMonth}
                        options={MONTHS_OPTIONS}
                        placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                    <Select
                        name="year"
                        onChange={onChangeHoursYear}
                        options={YEARS_OPTIONS}
                        placeholder={today.year} />
                  </SelectsWrapper>
                </ActionsWrapper>
              </InnerHeaderRow>
            )
          }
        </GraphHeader>
        <CardSegment>
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
          <InnerHeaderRow>
            <div>Participants by Work Site, Monthly</div>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_WORKSITE_STATS_DATA])}
                onClick={downloadParticipantsByWorksite}>
              Download
            </Button>
          </InnerHeaderRow>
          <ActionsWrapper>
            <SelectsWrapper>
              <Select
                  name="month"
                  onChange={onChangeParticipantsMonth}
                  options={MONTHS_OPTIONS}
                  placeholder={MONTHS_OPTIONS[today.month - 1].label} />
              <Select
                  name="year"
                  onChange={onChangeParticipantsYear}
                  options={YEARS_OPTIONS}
                  placeholder={today.year} />
            </SelectsWrapper>
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
                      <CardSegment padding="0">
                        { participants.map((name :string) => <div key={name}>{ name }</div>) }
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
      [DOWNLOAD_WORKSITE_STATS_DATA]: stats.getIn([ACTIONS, DOWNLOAD_WORKSITE_STATS_DATA, REQUEST_STATE]),
      [GET_HOURS_WORKED_BY_WORKSITE]: stats.getIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE]),
      [GET_MONTHLY_PARTICIPANTS_BY_WORKSITE]: stats
        .getIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadWorksiteStatsData,
    getHoursWorkedByWorksite,
    getMonthlyParticipantsByWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorksiteGraphs);
