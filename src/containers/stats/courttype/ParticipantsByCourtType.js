// @flow
import React, { useState } from 'react';

import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import {
  Hint,
  HorizontalBarSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getTotalParticipantsByCourtType,
} from './CourtTypeActions';

import { requestIsPending } from '../../../utils/RequestStateUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { getStatsData } from '../StatsActions';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import {
  ActionsWrapper,
  GraphHeader,
  HeaderActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
  toolTipStyle,
} from '../styled/GraphStyles';
import { formatParticipantsByCourtTypeData, formatTotalParticipantsDataForDownload } from '../utils/StatsUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { TOTAL_PARTICIPANTS_BY_COURT_TYPE } = STATS;

const { BLUE, PURPLE } = Colors;
const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  toolTipText: ''
};

type Props = {
  actions :{
    downloadCourtTypeData :RequestSequence;
    getTotalParticipantsByCourtType :RequestSequence;
    getStatsData :RequestSequence;
  };
  totalParticipantsByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE :RequestState;
  };
};

const ParticipantsByCourtTypeGraph = ({
  actions,
  totalParticipantsByCourtType,
  requestStates,
} :Props) => {

  const today :DateTime = DateTime.local();
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);

  const downloadParticipantsData = () => {
    const formattedData :List = formatTotalParticipantsDataForDownload(totalParticipantsByCourtType);
    actions.downloadCourtTypeData({
      courtTypeData: formattedData,
      fileName: 'CWP_Total_Participants_by_Court_Type',
    });
  };

  const graphData :Object[] = formatParticipantsByCourtTypeData(totalParticipantsByCourtType);
  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    ...toolTipStyle
  };

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getTotalParticipantsByCourtType({ month: month.value, year: year.value, timeFrame: ALL_TIME });
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const onChangeMonth = (newMonth :Object) => {
    setMonth(newMonth);
    actions.getTotalParticipantsByCourtType({ month: newMonth.value, year: year.value, timeFrame: timeFrame.value });
  };

  const onChangeYear = (newYear :Object) => {
    setYear(newYear);
    actions.getTotalParticipantsByCourtType({ month: month.value, year: newYear.value, timeFrame: timeFrame.value });
  };

  return (
    <Card>
      <GraphHeader>
        <InnerHeaderRow>
          <div>Total Number of Participants by Court Type</div>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
                  options={TIME_FRAME_OPTIONS}
                  placeholder={TIME_FRAME_OPTIONS[2].label} />
            </SmallSelectWrapper>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_COURT_TYPE_DATA])}
                onClick={downloadParticipantsData}>
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
                      onChange={onChangeMonth}
                      options={MONTHS_OPTIONS}
                      placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                  <Select
                      name="year"
                      onChange={onChangeYear}
                      options={YEARS_OPTIONS}
                      placeholder={today.year} />
                </SelectsWrapper>
              </ActionsWrapper>
            </InnerHeaderRow>
          )
        }
      </GraphHeader>
      <CardSegment padding="30px">
        {
          requestIsPending(requestStates[GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE])
            ? (
              <Spinner size="2x" />
            )
            : (
              <XYPlot
                  yType="ordinal"
                  width={800}
                  height={800}
                  margin={{
                    left: 200,
                    right: 10,
                    top: 10,
                    bottom: 40
                  }}
                  style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '14px' }}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <HorizontalBarSeries
                    color={BLUE.B300}
                    data={graphData}
                    onValueMouseOver={(v :Object) => setToolTipValues(
                      { background: PURPLE.P300, hoveredBar: v, toolTipText: `${v.x} participants` }
                    )}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                {
                  toolTipValues.hoveredBar && (
                    <Hint
                        style={Object.assign(toolTipStyleWithBackground)}
                        value={toolTipValues.hoveredBar}>
                      { toolTipValues.toolTipText }
                    </Hint>
                  )
                }
              </XYPlot>
            )
        }
      </CardSegment>
    </Card>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [TOTAL_PARTICIPANTS_BY_COURT_TYPE]: stats.get(TOTAL_PARTICIPANTS_BY_COURT_TYPE),
    requestStates: {
      [DOWNLOAD_COURT_TYPE_DATA]: stats.getIn([ACTIONS, DOWNLOAD_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE]: stats
        .getIn([ACTIONS, GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getTotalParticipantsByCourtType,
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsByCourtTypeGraph);
