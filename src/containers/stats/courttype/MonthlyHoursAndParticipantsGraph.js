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
import { formatMonthlyHoursAndParticipantsData } from '../utils/StatsUtils';

const { BLUE_1, BLUE_2, PURPLES } = Colors;
const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  toolTipText: ''
};

type Props = {
  monthlyHoursWorkedByCourtType :Map;
  monthlyTotalParticipantsByCourtType :Map;
};

const MonthlyHoursAndParticipantsGraphs = ({
  monthlyHoursWorkedByCourtType,
  monthlyTotalParticipantsByCourtType,
} :Props) => {

  const { hoursGraphData, participantsGraphData } = formatMonthlyHoursAndParticipantsData(
    monthlyHoursWorkedByCourtType,
    monthlyTotalParticipantsByCourtType
  );
  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    ...toolTipStyle
  };

  return (
    <XYPlot
        yType="ordinal"
        width={600}
        height={600}
        margin={{
          left: 200,
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
          color={BLUE_2}
          data={hoursGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues(
            { background: PURPLES[1], hoveredBar: v, toolTipText: `${v.x} hours` }
          )}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      <HorizontalBarSeries
          color={BLUE_1}
          data={participantsGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues(
            { background: PURPLES[1], hoveredBar: v, toolTipText: `${v.x} participants` }
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

export default MonthlyHoursAndParticipantsGraphs;
