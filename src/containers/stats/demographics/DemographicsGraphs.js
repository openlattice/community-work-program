// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  IconButton,
  Select,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EthnicityChart from './EthnicityChart';
import RaceChart from './RaceChart';
import SexChart from './SexChart';
import {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_MONTHLY_DEMOGRAPHICS,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getMonthlyDemographics,
  getParticipantsDemographics,
} from './DemographicsActions';

import { requestIsPending } from '../../../utils/RequestStateUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARS_OPTIONS,
} from '../consts/TimeConsts';
import {
  ActionsWrapper,
  GraphHeader,
  HeaderActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
} from '../styled/GraphStyles';
import { formatRadialChartData } from '../utils/StatsUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { ETHNICITY_DEMOGRAPHICS, RACE_DEMOGRAPHICS, SEX_DEMOGRAPHICS } = STATS;

const DEMOGRAPHICS_TIME_FRAME_OPTIONS :Object[] = [TIME_FRAME_OPTIONS[0], TIME_FRAME_OPTIONS[2]];

const DemographicsCardHeader = styled(GraphHeader)`
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  actions :{
    downloadDemographicsData :RequestSequence;
    getMonthlyDemographics :RequestSequence;
    getParticipantsDemographics :RequestSequence;
  };
  ethnicityDemographics :Map;
  raceDemographics :Map;
  requestStates :{
    DOWNLOAD_DEMOGRAPHICS_DATA :RequestState;
    GET_MONTHLY_DEMOGRAPHICS :RequestState;
    GET_PARTICIPANTS_DEMOGRAPHICS :RequestState;
  };
  sexDemographics :Map;
};

const DemographicsGraphs = ({
  actions,
  ethnicityDemographics,
  raceDemographics,
  requestStates,
  sexDemographics
} :Props) => {

  const today :DateTime = DateTime.local();
  const [timeFrame, setTimeFrame] = useState(DEMOGRAPHICS_TIME_FRAME_OPTIONS[1]);
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      actions.getParticipantsDemographics();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const getMonthlyDemographicsData = () => {
    actions.getMonthlyDemographics({ month: month.value, year: year.value });
  };

  const isFetchingDemographics = requestIsPending(requestStates[GET_MONTHLY_DEMOGRAPHICS])
    || requestIsPending(requestStates[GET_PARTICIPANTS_DEMOGRAPHICS]);

  return (
    <>
      <CardSegment padding="0 0 30px 0">
        <InnerHeaderRow>
          <HeaderActionsWrapper>
            <SmallSelectWrapper>
              <Select
                  onChange={onTimeFrameSelectChange}
                  options={DEMOGRAPHICS_TIME_FRAME_OPTIONS}
                  placeholder={DEMOGRAPHICS_TIME_FRAME_OPTIONS[1].label} />
            </SmallSelectWrapper>
          </HeaderActionsWrapper>
        </InnerHeaderRow>
        {
          timeFrame.value === MONTHLY && (
            <InnerHeaderRow>
              <ActionsWrapper>
                <SelectsWrapper>
                  <Select
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
                <IconButton onClick={getMonthlyDemographicsData}>
                  <FontAwesomeIcon icon={faSearch} />
                </IconButton>
              </ActionsWrapper>
            </InnerHeaderRow>
          )
        }
      </CardSegment>
      <CardStack>
        <Card>
          <DemographicsCardHeader>
            <div>Race</div>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_DEMOGRAPHICS_DATA])}
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(raceDemographics))}>
              Download
            </Button>
          </DemographicsCardHeader>
          <RaceChart isFetchingDemographics={isFetchingDemographics} raceDemographics={raceDemographics} />
        </Card>
        <Card>
          <DemographicsCardHeader>
            <div>Ethnicity</div>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_DEMOGRAPHICS_DATA])}
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(ethnicityDemographics))}>
              Download
            </Button>
          </DemographicsCardHeader>
          <EthnicityChart
              ethnicityDemographics={ethnicityDemographics}
              isFetchingDemographics={isFetchingDemographics} />
        </Card>
        <Card>
          <DemographicsCardHeader>
            <div>Sex</div>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_DEMOGRAPHICS_DATA])}
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(sexDemographics))}>
              Download
            </Button>
          </DemographicsCardHeader>
          <SexChart isFetchingDemographics={isFetchingDemographics} sexDemographics={sexDemographics} />
        </Card>
      </CardStack>
    </>
  );
};

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [ETHNICITY_DEMOGRAPHICS]: stats.get(ETHNICITY_DEMOGRAPHICS),
    [RACE_DEMOGRAPHICS]: stats.get(RACE_DEMOGRAPHICS),
    requestStates: {
      [DOWNLOAD_DEMOGRAPHICS_DATA]: stats.getIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, REQUEST_STATE]),
      [GET_MONTHLY_DEMOGRAPHICS]: stats.getIn([ACTIONS, GET_MONTHLY_DEMOGRAPHICS, REQUEST_STATE]),
      [GET_PARTICIPANTS_DEMOGRAPHICS]: stats.getIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, REQUEST_STATE]),
    },
    [SEX_DEMOGRAPHICS]: stats.get(SEX_DEMOGRAPHICS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadDemographicsData,
    getMonthlyDemographics,
    getParticipantsDemographics,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DemographicsGraphs);
