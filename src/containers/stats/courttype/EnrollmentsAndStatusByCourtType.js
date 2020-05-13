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
import { formatEnrollmentStatusPeopleData } from '../utils/StatsUtils';
import { isDefined } from '../../../utils/LangUtils';
import { OL } from '../../../core/style/Colors';

const { BLUE_2, PURPLES, WHITE } = Colors;
const { PINK01 } = OL;

const defaultToolTipValues :Object = {
  background: 'rgba(0, 0, 0, 0.0)',
  hoveredBar: {},
  format: []
};
const background :string = PURPLES[1];
const color :string = WHITE;

type Props = {
  activeEnrollmentsByCourtType :Map;
  closedEnrollmentsByCourtType :Map;
  successfulEnrollmentsByCourtType :Map;
  unsuccessfulEnrollmentsByCourtType :Map;
};

const EnrollmentsAndStatusByCourtType = ({
  activeEnrollmentsByCourtType,
  closedEnrollmentsByCourtType,
  successfulEnrollmentsByCourtType,
  unsuccessfulEnrollmentsByCourtType,
} :Props) => {

  const activePeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(activeEnrollmentsByCourtType);
  const successfulPeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(successfulEnrollmentsByCourtType);
  const unsuccessfulPeopleGraphData :Object[] = formatEnrollmentStatusPeopleData(
    unsuccessfulEnrollmentsByCourtType
  );
  const closedPeopleGraphData = formatEnrollmentStatusPeopleData(closedEnrollmentsByCourtType);

  const [toolTipValues, setToolTipValues] = useState(defaultToolTipValues);
  const toolTipStyleWithBackground :Object = {
    background: toolTipValues.background,
    color: toolTipValues.color,
    ...toolTipStyle
  };

  const getTotalsForBar = (v) => {
    const courtType :string = v.y;
    if (!isDefined(courtType)) return [];
    const active = activeEnrollmentsByCourtType.get(courtType, 0);
    const closed = closedEnrollmentsByCourtType.get(courtType, 0);
    const successful = successfulEnrollmentsByCourtType.get(courtType, 0);
    const unsuccessful = unsuccessfulEnrollmentsByCourtType.get(courtType, 0);
    return [
      { title: courtType, value: '' },
      { title: 'successful', value: successful },
      { title: 'unsuccessful', value: unsuccessful },
      { title: 'closed', value: closed },
      { title: 'active', value: active },
      { title: 'total', value: active + closed + successful + unsuccessful },
    ];
  };
  return (
    <XYPlot
        yType="ordinal"
        width={800}
        height={800}
        stackBy="x"
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
          color={PURPLES[2]}
          data={successfulPeopleGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      <HorizontalBarSeries
          color={PURPLES[0]}
          data={unsuccessfulPeopleGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      <HorizontalBarSeries
          color={BLUE_2}
          data={closedPeopleGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      <HorizontalBarSeries
          color={PINK01}
          data={activePeopleGraphData}
          onValueMouseOver={(v :Object) => setToolTipValues({ background, color, hoveredBar: v })}
          onValueMouseOut={() => setToolTipValues(defaultToolTipValues)} />
      {
        toolTipValues.hoveredBar && (
          <Hint
              format={getTotalsForBar}
              style={Object.assign(toolTipStyleWithBackground)}
              value={toolTipValues.hoveredBar} />
        )
      }
    </XYPlot>
  );
};

export default EnrollmentsAndStatusByCourtType;