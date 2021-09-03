// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
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
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_HOURS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getHoursByCourtType,
} from './CourtTypeActions';

import { isDefined } from '../../../utils/LangUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { GET_STATS_DATA, getStatsData } from '../StatsActions';
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
import {
  GraphDescription,
  KeyItem,
  KeyItemWrapper,
  KeySquare,
} from '../styled/RadialChartStyles';
import {
  formatEnrollmentStatusPeopleData,
  formatEnrollmentsDataForDownload,
  getBottomRowForEnrollments,
} from '../utils/StatsUtils';

const {
  BLUE,
  MAGENTA,
  PURPLE,
  WHITE,
  YELLOW,
} = Colors;

const { ACTIONS, REQUEST_STATE } = SHARED;

const STATUSES_PER_BAR = [
  { status: 'Successful/Completed', color: BLUE.B200 },
  { status: 'Unsuccessful/Noncompliant', color: BLUE.B500 },
  { status: 'Closed', color: PURPLE.P200 },
  { status: 'Active', color: MAGENTA.M300 },
  { status: 'Job Search', color: YELLOW.Y200 },
];

const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  format: []
};
const background :string = PURPLE.P300;
const color :string = WHITE;

const KeyWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const KeyItemWrapperHorizontal = styled(KeyItemWrapper)`
  margin-right: 20px;
`;

type Props = {
  actions :{
    downloadCourtTypeData :RequestSequence;
    getEnrollmentsByCourtType :RequestSequence;
    getStatsData :RequestSequence;
  };
  activeEnrollmentsByCourtType :Map;
  becameActiveEnrollmentsByCourtType :Map,
  closedEnrollmentsByCourtType :Map;
  jobSearchEnrollmentsByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_ENROLLMENTS_BY_COURT_TYPE :RequestState;
    GET_HOURS_BY_COURT_TYPE :RequestState;
    GET_STATS_DATA :RequestState;
  };
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const EnrollmentsAndStatusByCourtType = ({
  actions,
  activeEnrollmentsByCourtType,
  becameActiveEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  jobSearchEnrollmentsByCourtType,
  requestStates,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => {

  const today :DateTime = DateTime.local();
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const [enrollmentsMonth, setEnrollmentsMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [enrollmentsYear, setEnrollmentsYear] = useState(currentYearOption);

  const onChangeSelect = (selectedTimeValue :Object, event :Object) => {
    if (event.name === 'month') setEnrollmentsMonth(selectedTimeValue);
    if (event.name === 'year') setEnrollmentsYear(selectedTimeValue);
    if (event.name === 'timeframe') setTimeFrame(selectedTimeValue);
  };

  useEffect(() => {
    actions.getEnrollmentsByCourtType({
      month: enrollmentsMonth.value,
      year: enrollmentsYear.value,
      timeFrame: timeFrame.value
    });
  }, [actions, enrollmentsMonth, enrollmentsYear, timeFrame]);

  const downloadEnrollmentsData = () => {
    const formattedEnrollmentsData :List = formatEnrollmentsDataForDownload(
      activeEnrollmentsByCourtType,
      closedEnrollmentsByCourtType,
      jobSearchEnrollmentsByCourtType,
      successfulEnrollmentsByCourtType,
      unsuccessfulEnrollmentsByCourtType
    );
    let fileName :string = 'CWP_Enrollments_by_Court_Type';
    if (timeFrame.value === MONTHLY) {
      fileName += `_${MONTHS_OPTIONS[enrollmentsMonth.value - 1].label}_${enrollmentsYear.value}`;
    }
    if (timeFrame.value === YEARLY) fileName += `_${enrollmentsYear.value}`;
    actions.downloadCourtTypeData({
      courtTypeData: formattedEnrollmentsData,
      fileName,
      getBottomRow: getBottomRowForEnrollments,
    });
  };

  const activePeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(activeEnrollmentsByCourtType);
  const successfulPeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(successfulEnrollmentsByCourtType);
  const unsuccessfulPeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(
    unsuccessfulEnrollmentsByCourtType
  );
  const closedPeopleGraphData = formatEnrollmentStatusPeopleData(closedEnrollmentsByCourtType);
  const jobSearchPeopleGraphData = formatEnrollmentStatusPeopleData(jobSearchEnrollmentsByCourtType);

  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    color: toolTipValues.color,
    ...toolTipStyle
  };

  const getTotalsForBar = (v) => {
    const courtType :string = v.y;
    if (!isDefined(courtType)) return [];
    const active = activeEnrollmentsByCourtType.get(courtType, 0);
    const becameActive = becameActiveEnrollmentsByCourtType.get(courtType, 0);
    const closed = closedEnrollmentsByCourtType.get(courtType, 0);
    const jobSearch = jobSearchEnrollmentsByCourtType.get(courtType, 0);
    const successful = successfulEnrollmentsByCourtType.get(courtType, 0);
    const unsuccessful = unsuccessfulEnrollmentsByCourtType.get(courtType, 0);
    const statusCounts = [
      { title: courtType, value: '' },
      { title: 'successful', value: successful },
      { title: 'unsuccessful', value: unsuccessful },
      { title: 'closed', value: closed },
      { title: 'active', value: active },
      { title: '[became active]', value: becameActive },
      { title: 'job search', value: jobSearch },
      { title: 'total', value: active + closed + jobSearch + successful + unsuccessful },
    ];
    if (timeFrame.value === ALL_TIME) {
      statusCounts.splice(5, 1);
    }
    return statusCounts;
  };
  return (
    <Card>
      <GraphHeader>
        <InnerHeaderRow>
          <div>Total Enrollments by Court Type</div>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  name="timeframe"
                  onChange={onChangeSelect}
                  options={TIME_FRAME_OPTIONS}
                  placeholder={TIME_FRAME_OPTIONS[2].label} />
            </SmallSelectWrapper>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_COURT_TYPE_DATA])}
                onClick={downloadEnrollmentsData}>
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
                      onChange={onChangeSelect}
                      options={MONTHS_OPTIONS}
                      placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                  <Select
                      name="year"
                      onChange={onChangeSelect}
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
          requestIsPending(requestStates[GET_STATS_DATA])
            || requestIsPending(requestStates[GET_ENROLLMENTS_BY_COURT_TYPE])
            ? (
              <Spinner size="2x" />
            )
            : (
              <XYPlot
                  yType="ordinal"
                  width={800}
                  height={800}
                  stackBy="x"
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
                    color={BLUE.B200}
                    data={successfulPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={BLUE.B500}
                    data={unsuccessfulPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={PURPLE.P200}
                    data={closedPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={MAGENTA.M300}
                    data={activePeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={YELLOW.Y200}
                    data={jobSearchPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                {
                  toolTipValues.hoveredBar && (
                    <Hint
                        format={getTotalsForBar}
                        style={Object.assign(toolTipStyleWithBackground)}
                        value={toolTipValues.hoveredBar} />
                  )
                }
              </XYPlot>
            )
        }
      </CardSegment>
      <CardSegment padding="30px">
        <KeyWrapper>
          {
            STATUSES_PER_BAR.map(({ status, color: statusColor } :Object) => (
              <KeyItemWrapperHorizontal key={status}>
                <KeySquare color={statusColor} />
                <KeyItem>{ status }</KeyItem>
              </KeyItemWrapperHorizontal>
            ))
          }
        </KeyWrapper>
        <GraphDescription>
          Monthly and yearly graphs show all enrollment statuses recorded in that time period. Therefore,
          enrollments may be counted more than once if the status changed within the time period.
        </GraphDescription>
      </CardSegment>
    </Card>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    requestStates: {
      [DOWNLOAD_COURT_TYPE_DATA]: stats.getIn([ACTIONS, DOWNLOAD_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_ENROLLMENTS_BY_COURT_TYPE]: stats.getIn([ACTIONS, GET_ENROLLMENTS_BY_COURT_TYPE, REQUEST_STATE]),
      [GET_HOURS_BY_COURT_TYPE]: stats.getIn([ACTIONS, GET_HOURS_BY_COURT_TYPE, REQUEST_STATE]),
      [GET_STATS_DATA]: stats.getIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getEnrollmentsByCourtType,
    getHoursByCourtType,
    getStatsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentsAndStatusByCourtType);
