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
import { GraphHeader } from '../styled/GraphStyles';
import { STATE, STATS } from '../../../utils/constants/ReduxStateConsts';

const { ETHNICITY_DEMOGRAPHICS, RACE_DEMOGRAPHICS } = STATS;

type Props = {
  ethnicityDemographics :Map;
  raceDemographics :Map;
};

const DemographicsGraphs = ({ ethnicityDemographics, raceDemographics } :Props) => (
  <CardStack>
    <Card>
      <GraphHeader>Race and Ethnicity</GraphHeader>
      <CardSegment vertical>
        <RaceChart ethnicityDemographics={ethnicityDemographics} raceDemographics={raceDemographics} />
      </CardSegment>
    </Card>
  </CardStack>
);

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [ETHNICITY_DEMOGRAPHICS]: stats.get(ETHNICITY_DEMOGRAPHICS),
    [RACE_DEMOGRAPHICS]: stats.get(RACE_DEMOGRAPHICS),
  };
};

// $FlowFixMe
export default connect(mapStateToProps, null)(DemographicsGraphs);
