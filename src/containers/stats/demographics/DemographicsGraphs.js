// @flow
import React from 'react';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  CardStack,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';

import RaceChart from './RaceChart';
import SexChart from './SexChart';
import { GraphHeader } from '../styled/GraphStyles';
import { STATE, STATS } from '../../../utils/constants/ReduxStateConsts';

const { ETHNICITY_DEMOGRAPHICS, RACE_DEMOGRAPHICS, SEX_DEMOGRAPHICS } = STATS;

type Props = {
  ethnicityDemographics :Map;
  raceDemographics :Map;
  sexDemographics :Map;
};

const DemographicsGraphs = ({ ethnicityDemographics, raceDemographics, sexDemographics } :Props) => (
  <CardStack>
    <Card>
      <GraphHeader>Race and Ethnicity</GraphHeader>
      <CardSegment vertical>
        <RaceChart ethnicityDemographics={ethnicityDemographics} raceDemographics={raceDemographics} />
      </CardSegment>
    </Card>
    <Card>
      <GraphHeader>Sex</GraphHeader>
      <CardSegment vertical>
        <SexChart sexDemographics={sexDemographics} />
      </CardSegment>
    </Card>
  </CardStack>
);

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [ETHNICITY_DEMOGRAPHICS]: stats.get(ETHNICITY_DEMOGRAPHICS),
    [RACE_DEMOGRAPHICS]: stats.get(RACE_DEMOGRAPHICS),
    [SEX_DEMOGRAPHICS]: stats.get(SEX_DEMOGRAPHICS),
  };
};

// $FlowFixMe
export default connect(mapStateToProps, null)(DemographicsGraphs);
