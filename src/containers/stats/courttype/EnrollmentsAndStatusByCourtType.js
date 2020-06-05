// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
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
  GraphDescription,
  KeyItem,
  KeyItemWrapper,
  KeySquare,
} from '../styled/RadialChartStyles';
import {
  formatEnrollmentsDataForDownload,
  formatEnrollmentStatusPeopleData,
  getBottomRowForEnrollments,
} from '../utils/StatsUtils';
import { isDefined } from '../../../utils/LangUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_MONTHLY_COURT_TYPE_DATA,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getMonthlyCourtTypeData,
} from './CourtTypeActions';
import { GET_STATS_DATA } from '../StatsActions';
import { OL } from '../../../core/style/Colors';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  BLUE_2,
  PURPLES,
  WHITE,
  YELLOW_1,
} = Colors;
const { PINK01 } = OL;

const { ACTIONS, REQUEST_STATE } = SHARED;

const STATUSES_PER_BAR = [
  { status: 'Successful/Completed', color: PURPLES[2] },
  { status: 'Unsuccessful/Noncompliant', color: PURPLES[0] },
  { status: 'Closed', color: BLUE_2 },
  { status: 'Active', color: PINK01 },
  { status: 'Job Search', color: YELLOW_1 },
];

const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  format: []
};
const background :string = PURPLES[1];
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
  closedEnrollmentsByCourtType :Map;
  jobSearchEnrollmentsByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_ENROLLMENTS_BY_COURT_TYPE :RequestState;
    GET_MONTHLY_COURT_TYPE_DATA :RequestState;
    GET_STATS_DATA :RequestState;
  };
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const EnrollmentsAndStatusByCourtType = ({
  actions,
  activeEnrollmentsByCourtType,
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
  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getStatsData();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };
  const getNewEnrollmentsData = () => {
    actions.getEnrollmentsByCourtType({
      month: enrollmentsMonth.value,
      year: enrollmentsYear.value,
      timeFrame: timeFrame.value
    });
  };

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
    const closed = closedEnrollmentsByCourtType.get(courtType, 0);
    const jobSearch = jobSearchEnrollmentsByCourtType.get(courtType, 0);
    const successful = successfulEnrollmentsByCourtType.get(courtType, 0);
    const unsuccessful = unsuccessfulEnrollmentsByCourtType.get(courtType, 0);
    return [
      { title: courtType, value: '' },
      { title: 'successful', value: successful },
      { title: 'unsuccessful', value: unsuccessful },
      { title: 'closed', value: closed },
      { title: 'active', value: active },
      { title: 'job search', value: jobSearch },
      { title: 'total', value: active + closed + jobSearch + successful + unsuccessful },
    ];
  };
  return (
    <Card>
      <GraphHeader>
        <InnerHeaderRow>
          <div>Total Enrollments by Court Type</div>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
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
                      onChange={setEnrollmentsMonth}
                      options={MONTHS_OPTIONS}
                      placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                  <Select
                      name="year"
                      onChange={setEnrollmentsYear}
                      options={YEARS_OPTIONS}
                      placeholder={today.year} />
                </SelectsWrapper>
                <IconButton
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onClick={getNewEnrollmentsData} />
              </ActionsWrapper>
            </InnerHeaderRow>
          )
        }
      </GraphHeader>
      <CardSegment padding="30px" vertical>
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
                    color={PURPLES[2]}
                    data={successfulPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={PURPLES[0]}
                    data={unsuccessfulPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={BLUE_2}
                    data={closedPeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={PINK01}
                    data={activePeopleGraphData}
                    onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
                    onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
                <HorizontalBarSeries
                    color={YELLOW_1}
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
      <CardSegment padding="30px" vertical>
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
      [GET_MONTHLY_COURT_TYPE_DATA]: stats.getIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_STATS_DATA]: stats.getIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getEnrollmentsByCourtType,
    getMonthlyCourtTypeData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentsAndStatusByCourtType);
