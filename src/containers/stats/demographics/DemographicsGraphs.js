// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button, Card, CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EthnicityChart from './EthnicityChart';
import RaceChart from './RaceChart';
import SexChart from './SexChart';
import { GraphHeader } from '../styled/GraphStyles';
import { formatRadialChartData } from '../utils/StatsUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { DOWNLOAD_DEMOGRAPHICS_DATA, downloadDemographicsData } from './DemographicsActions';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { ETHNICITY_DEMOGRAPHICS, RACE_DEMOGRAPHICS, SEX_DEMOGRAPHICS } = STATS;

const DemographicsCardHeader = styled(GraphHeader)`
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  actions :{
    downloadDemographicsData :RequestSequence;
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
} :Props) => (
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
);

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
