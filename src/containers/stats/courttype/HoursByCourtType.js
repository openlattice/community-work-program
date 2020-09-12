// @flow
import React, { useState } from 'react';

import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  IconButton,
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
  GET_HOURS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getHoursByCourtType,
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
import { formatHoursByCourtTypeData, formatHoursByCourtTypeDataForDownload } from '../utils/StatsUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { HOURS_BY_COURT_TYPE } = STATS;

const { BLUE_2, PURPLES } = Colors;
const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  toolTipText: ''
};

type Props = {
  actions :{
    downloadCourtTypeData :RequestSequence;
    getHoursByCourtType :RequestSequence;
    getStatsData :RequestSequence;
  };
  hoursByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_HOURS_BY_COURT_TYPE :RequestState;
  };
};

const HoursByCourtType = ({
  actions,
  hoursByCourtType,
  requestStates,
} :Props) => {

  const today :DateTime = DateTime.local();
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[0]);
  const [hoursMonth, setHoursMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [hoursYear, setHoursYear] = useState(currentYearOption);

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getHoursByCourtType({ month: hoursMonth.value, year: hoursYear.value, timeFrame: ALL_TIME });
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const getNewHoursData = () => {
    actions.getHoursByCourtType({ month: hoursMonth.value, year: hoursYear.value, timeFrame: timeFrame.value });
  };

  const downloadParticipantsAndHoursData = () => {
    const formattedParticipantsAndHoursData :List = formatHoursByCourtTypeDataForDownload(
      hoursByCourtType,
    );
    /* eslint-disable-next-line */
    const fileName :string = `CWP_Hours_by_Court_Type_${MONTHS_OPTIONS[hoursMonth.value - 1].label}_${hoursYear.value}`;
    actions.downloadCourtTypeData({
      courtTypeData: formattedParticipantsAndHoursData,
      fileName,
    });
  };

  const hoursGraphData = formatHoursByCourtTypeData(hoursByCourtType);
  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    ...toolTipStyle
  };

  return (
    <Card>
      <GraphHeader>
        <InnerHeaderRow>
          <div>Number of Hours Worked by Court Type</div>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
                  options={TIME_FRAME_OPTIONS}
                  placeholder={TIME_FRAME_OPTIONS[0].label} />
            </SmallSelectWrapper>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_COURT_TYPE_DATA])}
                onClick={downloadParticipantsAndHoursData}>
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
                      onChange={setHoursMonth}
                      options={MONTHS_OPTIONS}
                      placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                  <Select
                      name="year"
                      onChange={setHoursYear}
                      options={YEARS_OPTIONS}
                      placeholder={today.year} />
                </SelectsWrapper>
                <IconButton onClick={getNewHoursData}>
                  <FontAwesomeIcon icon={faSearch} />
                </IconButton>
              </ActionsWrapper>
            </InnerHeaderRow>
          )
        }
      </GraphHeader>
      <CardSegment padding="30px">
        {
          requestIsPending(requestStates[GET_HOURS_BY_COURT_TYPE])
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
                    color={BLUE_2}
                    data={hoursGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues(
                      { background: PURPLES[1], hoveredBar: v, toolTipText: `${v.x} hours` }
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
    [HOURS_BY_COURT_TYPE]: stats.get(HOURS_BY_COURT_TYPE),
    requestStates: {
      [DOWNLOAD_COURT_TYPE_DATA]: stats.getIn([ACTIONS, DOWNLOAD_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_HOURS_BY_COURT_TYPE]: stats.getIn([ACTIONS, GET_HOURS_BY_COURT_TYPE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getHoursByCourtType,
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(HoursByCourtType);
