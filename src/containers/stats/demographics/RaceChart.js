// @flow
import React from 'react';
import { Map } from 'immutable';
import { CardSegment } from 'lattice-ui-kit';
import { RadialChart } from 'react-vis';

import { formatRadialChartData } from '../utils/StatsUtils';

type Props = {
  raceDemographics :Map;
};

const RaceChart = ({ ethnicityDemographics, raceDemographics } :Props) => {
  const { chartData: raceChartData } :Object = formatRadialChartData(
    raceDemographics
  );
  return (
    <CardSegment>
      <RadialChart
          data={raceChartData}
          height={400}
          labelsRadiusMultiplier={0.7}
          showLabels
          width={400} />
    </CardSegment>
  );
};

export default RaceChart;
