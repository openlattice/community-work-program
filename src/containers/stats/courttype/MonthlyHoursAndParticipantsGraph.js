// @flow
import React, { useState } from 'react';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  IconButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import {
  Hint,
  HorizontalBarSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  ActionsWrapper,
  GraphHeader,
  HeaderActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
  toolTipStyle,
} from '../styled/GraphStyles';
import {
  formatMonthlyHoursAndParticipantsData,
  formatParticipantsAndHoursDataForDownload,
  getBottomRowForParticipantsAndHours,
} from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_MONTHLY_COURT_TYPE_DATA,
  downloadCourtTypeData,
  getMonthlyCourtTypeData,
} from './CourtTypeActions';
import { getStatsData } from '../StatsActions';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;

const { BLUE_1, BLUE_2, PURPLES } = Colors;
const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  toolTipText: ''
};

type Props = {
  actions :{
    downloadCourtTypeData :RequestSequence;
    getMonthlyCourtTypeData :RequestSequence;
    getStatsData :RequestSequence;
  };
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_MONTHLY_COURT_TYPE_DATA :RequestState;
  };
};

const MonthlyHoursAndParticipantsGraphs = ({
  actions,
  monthlyHoursWorkedByCourtType,
  monthlyTotalParticipantsByCourtType,
  requestStates,
} :Props) => {

  const today :DateTime = DateTime.local();
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const [hoursMonth, setHoursMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [hoursYear, setHoursYear] = useState(currentYearOption);

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      // actions.getStatsData();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const getNewHoursData = () => {
    actions.getMonthlyCourtTypeData({ month: hoursMonth.value, year: hoursYear.value, timeFrame: timeFrame.value });
  };

  const downloadParticipantsAndHoursData = () => {
    const formattedParticipantsAndHoursData :List = formatParticipantsAndHoursDataForDownload(
      monthlyHoursWorkedByCourtType,
      monthlyTotalParticipantsByCourtType,
    );
    /* eslint-disable-next-line */
    const fileName :string = `CWP_Participants_and_Hours_by_Court_Type_${MONTHS_OPTIONS[hoursMonth.value - 1].label}_${hoursYear.value}`;
    actions.downloadCourtTypeData({
      courtTypeData: formattedParticipantsAndHoursData,
      fileName,
      getBottomRow: getBottomRowForParticipantsAndHours,
    });
  };

  const { hoursGraphData, participantsGraphData } = formatMonthlyHoursAndParticipantsData(
    monthlyHoursWorkedByCourtType,
    monthlyTotalParticipantsByCourtType
  );
  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    ...toolTipStyle
  };

  return (
    <Card>
      <GraphHeader>
        <InnerHeaderRow>
          <div>Number of Participants and Hours Worked by Court Type</div>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
                  options={TIME_FRAME_OPTIONS}
                  placeholder={TIME_FRAME_OPTIONS[2].label} />
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
                <IconButton
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onClick={getNewHoursData} />
              </ActionsWrapper>
            </InnerHeaderRow>
          )
        }
      </GraphHeader>
      <CardSegment padding="30px" vertical>
        {
          requestIsPending(requestStates[GET_MONTHLY_COURT_TYPE_DATA])
            ? (
              <Spinner size="2x" />
            )
            : (
              <XYPlot
                  yType="ordinal"
                  width={600}
                  height={600}
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
                <HorizontalBarSeries
                    color={BLUE_1}
                    data={participantsGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues(
                      { background: PURPLES[1], hoveredBar: v, toolTipText: `${v.x} participants` }
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
    requestStates: {
      [DOWNLOAD_COURT_TYPE_DATA]: stats.getIn([ACTIONS, DOWNLOAD_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_MONTHLY_COURT_TYPE_DATA]: stats.getIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getMonthlyCourtTypeData,
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(MonthlyHoursAndParticipantsGraphs);
