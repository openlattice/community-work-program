// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  Select,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
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
const { isPending } = ReduxUtils;

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
  const [timeFrame, setTimeFrame] = useState(DEMOGRAPHICS_TIME_FRAME_OPTIONS[1].value);
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1].value);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const currentYear = currentYearOption.value;
  const [year, setYear] = useState(currentYear);

  const dispatch = useDispatch();

  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      dispatch(getParticipantsDemographics({ timeFrame: option.value }));
      setTimeFrame(option.value);
    }
    else {
      setTimeFrame(option.value);
      dispatch(getParticipantsDemographics({ month, timeFrame: option.value, year }));
    }
  };

  const onChangeMonthSelect = (selectedTimeValue :Object, event :Object) => {
    if (event.name === 'month') {
      setMonth(selectedTimeValue.value);
      dispatch(getParticipantsDemographics({ month: selectedTimeValue.value, timeFrame: MONTHLY, year }));
    }
    if (event.name === 'year') {
      setYear(selectedTimeValue.value);
      dispatch(getParticipantsDemographics({ month, timeFrame: MONTHLY, year: selectedTimeValue.value }));
    }
  };

  const fetchRequestState = useRequestState([
    STATE.STATS,
    ACTIONS,
    GET_PARTICIPANTS_DEMOGRAPHICS,
  ]);
  const isFetchingDemographics = isPending(fetchRequestState);

  const downloadRequestState = useRequestState([
    STATE.STATS,
    ACTIONS,
    DOWNLOAD_DEMOGRAPHICS_DATA,
  ]);
  const isDownloadingDemographics = isPending(downloadRequestState);

  return (
    <>
      <CardSegment padding="0 0 30px 0">
        <Typography gutterBottom>Select the timeframe for viewing participant demographics:</Typography>
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
          timeFrame === MONTHLY && (
            <InnerHeaderRow>
              <ActionsWrapper>
                <SelectsWrapper>
                  <Select
                      name="month"
                      onChange={onChangeMonthSelect}
                      options={MONTHS_OPTIONS}
                      placeholder={MONTHS_OPTIONS[today.month - 1].label} />
                  <Select
                      name="year"
                      onChange={onChangeMonthSelect}
                      options={YEARS_OPTIONS}
                      placeholder={today.year} />
                </SelectsWrapper>
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
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(raceDemographics))}>
                isLoading={isDownloadingDemographics}
              Download
            </Button>
          </DemographicsCardHeader>
          <RaceChart isFetchingDemographics={isFetchingDemographics} raceDemographics={raceDemographics} />
        </Card>
        <Card>
          <DemographicsCardHeader>
            <div>Ethnicity</div>
            <Button
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(ethnicityDemographics))}>
                isLoading={isDownloadingDemographics}
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
                onClick={() => actions.downloadDemographicsData(formatRadialChartData(sexDemographics))}>
                isLoading={isDownloadingDemographics}
              Download
            </Button>
          </DemographicsCardHeader>
          <SexChart isFetchingDemographics={isFetchingDemographics} sexDemographics={sexDemographics} />
        </Card>
      </CardStack>
    </>
  );
};

export default DemographicsGraphs;
