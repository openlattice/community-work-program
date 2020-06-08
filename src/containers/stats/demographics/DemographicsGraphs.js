// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  IconButton,
  Select,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EthnicityChart from './EthnicityChart';
import RaceChart from './RaceChart';
import SexChart from './SexChart';

import {
  ActionsWrapper,
  GraphHeader,
  HeaderActionsWrapper,
  InnerHeaderRow,
  SelectsWrapper,
  SmallSelectWrapper,
} from '../styled/GraphStyles';
import { formatRadialChartData } from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { DOWNLOAD_DEMOGRAPHICS_DATA, downloadDemographicsData } from './DemographicsActions';
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
const { ETHNICITY_DEMOGRAPHICS, RACE_DEMOGRAPHICS, SEX_DEMOGRAPHICS } = STATS;

const DEMOGRAPHICS_TIME_FRAME_OPTIONS :Object[] = [TIME_FRAME_OPTIONS[0], TIME_FRAME_OPTIONS[2]];

const DemographicsCardHeader = styled(GraphHeader)`
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  actions :{
    downloadDemographicsData :RequestSequence;
    getMonthlyDemographicsData :RequestSequence;
  };
  ethnicityDemographics :Map;
  raceDemographics :Map;
  requestStates :{
    DOWNLOAD_DEMOGRAPHICS_DATA :RequestState;
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
  console.log(DEMOGRAPHICS_TIME_FRAME_OPTIONS);
  console.log(timeFrame);
  const onTimeFrameSelectChange = (option :Object) => {
    if (option.value === ALL_TIME) {
      // actions.getMonthlyDemographicsData();
      setTimeFrame(option);
    }
    else setTimeFrame(option);
  };

  const getMonthlyDemographicsData = () => {
    actions.getMonthlyDemographicsData({ month, year });
  };

  return (
    <>
      <CardSegment padding="0 0 30px 0" vertical>
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
                <IconButton
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onClick={getMonthlyDemographicsData} />
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
          <RaceChart raceDemographics={raceDemographics} />
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
          <EthnicityChart ethnicityDemographics={ethnicityDemographics} />
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
          <SexChart sexDemographics={sexDemographics} />
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
    },
    [SEX_DEMOGRAPHICS]: stats.get(SEX_DEMOGRAPHICS),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadDemographicsData,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DemographicsGraphs);
