// @flow
import React, { useState } from 'react';

import { Map } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import {
  Hint,
  HorizontalBarSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';

import { toolTipStyle } from '../styled/GraphStyles';
import { formatHoursByWorksiteData } from '../utils/StatsUtils';

const { BLUE, ORANGE, WHITE } = Colors;
const defaultToolTipValues :Object = {
  background: WHITE,
  hoveredBar: {},
  toolTipText: ''
};

type Props = {
  hoursByWorksite :Map;
};

const HoursByWorksiteGraph = ({ hoursByWorksite } :Props) => {

  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    ...toolTipStyle
  };
  const hoursGraphData = formatHoursByWorksiteData(hoursByWorksite);

  return (
    <XYPlot
        yType="ordinal"
        width={600}
        height={600}
        margin={{
          left: 250,
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
          color={ORANGE.O300}
          data={hoursGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues(
            { background: BLUE.B300, hoveredBar: v, toolTipText: `${v.x} hours` }
          )}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      {
        toolTipValues.hoveredBar && (
          <Hint
              style={Object.assign(toolTipStyleWithBackground)}
              value={toolTipValues.hoveredBar}>
            { toolTipValues.toolTipText }
          </Hint>
        )
      }
    </XYPlot>
  );
};

export default HoursByWorksiteGraph;
