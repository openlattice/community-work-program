// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  CardStack,
  IconButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import HoursByWorksiteGraph from './HoursByWorksiteGraph';
import { ActionsWrapper, GraphHeader, SelectsWrapper } from '../styled/GraphStyles';
import { GET_HOURS_WORKED_BY_WORKSITE, getHoursWorkedByWorksite } from '../StatsActions';
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
const { HOURS_BY_WORKSITE } = STATS;

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

type Props = {
  actions :{
    getHoursWorkedByWorksite :RequestSequence;
  };
  hoursByWorksite :Map;
  requestStates :{
    GET_HOURS_WORKED_BY_WORKSITE :RequestState;
  };
};

const WorksiteGraph = ({ actions, hoursByWorksite, requestStates } :Props) => {
  const hoursDataIsLoading :boolean = requestIsPending(requestStates[GET_HOURS_WORKED_BY_WORKSITE]);
  const [timeFrame, setTimeFrame] = useState(TIME_FRAME_OPTIONS[2]);
  const today :DateTime = DateTime.local();
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);
  const getTimeBasedData = () => {
    actions.getHoursWorkedByWorksite({ month: month.value, year: year.value, timeFrame: timeFrame.value });
  };
  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getHoursWorkedByWorksite();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };
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
                        onChange={setMonth}
                        options={MONTHS_OPTIONS}
                        placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                    <Select
                        name="year"
                        onChange={setYear}
                        options={YEARS_OPTIONS}
                        placeholder={today.year} />
                  </SelectsWrapper>
                  <IconButton
                      icon={<FontAwesomeIcon icon={faSearch} />}
                      onClick={getTimeBasedData} />
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
    </CardStack>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [HOURS_BY_WORKSITE]: stats.get(HOURS_BY_WORKSITE),
    requestStates: {
      [GET_HOURS_WORKED_BY_WORKSITE]: stats.getIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getHoursWorkedByWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorksiteGraph);
