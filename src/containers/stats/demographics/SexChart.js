// @flow
import React from 'react';
import { Map } from 'immutable';
import { CardSegment } from 'lattice-ui-kit';
import { RadialChart } from 'react-vis';

import { formatRadialChartData } from '../utils/StatsUtils';

type Props = {
  sexDemographics :Map;
};

const SexChart = ({ sexDemographics } :Props) => {
  const { chartData } :Object = formatRadialChartData(
    sexDemographics
  );
  return (
    <CardSegment>
      <RadialChart
          data={chartData}
          height={400}
          labelsRadiusMultiplier={0.7}
          showLabels
          width={400} />
    </CardSegment>
  );
};

export default SexChart;
