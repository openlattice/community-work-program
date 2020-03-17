// @flow
import React, { useState } from 'react';
import { Colors } from 'lattice-ui-kit';
import {
  Hint,
  VerticalBarSeries,
  XYPlot,
  XAxis,
  YAxis,
} from 'react-vis';

const { PURPLES, WHITE } = Colors;

type Props = {
  enrollmentsGraphData :Object[];
  toolTipStyle :Object;
};

const EnrollmentsByCourtTypeGraph = ({ enrollmentsGraphData, toolTipStyle } :Props) => {

  const [enrollmentHoverValues, setEnrollmentHoverValues] = useState({
    enrollmentBackground: WHITE,
    enrollmentHoveredBar: {},
    enrollmentHoverText: ''
  });
  const enrollmentToolTipStyleWithBackground :Object = {
    background: enrollmentHoverValues.enrollmentBackground,
    ...toolTipStyle
  };

  return (
    <XYPlot
        xType="ordinal"
        height={190}
        margin={{
          left: 40,
          right: 10,
          top: 10,
          bottom: 40
        }}
        style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '12px' }}
        width={1000}>
      <XAxis />
      <YAxis />
      <VerticalBarSeries
          barWidth={0.55}
          color={PURPLES[3]}
          data={enrollmentsGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setEnrollmentHoverValues({
                enrollmentBackground: PURPLES[2],
                enrollmentHoveredBar: v,
                enrollmentHoverText: `${v.y} enrollments`
              });
            }
          }}
          onValueMouseOut={() => {
            setEnrollmentHoverValues({
              enrollmentBackground: WHITE,
              enrollmentHoveredBar: {},
              enrollmentHoverText: ''
            });
          }} />
      {
        enrollmentHoverValues.enrollmentHoveredBar && (
          <Hint
              value={enrollmentHoverValues.enrollmentHoveredBar}>
            <div style={Object.assign(enrollmentToolTipStyleWithBackground)}>
              { enrollmentHoverValues.enrollmentHoverText }
            </div>
          </Hint>
        )
      }
    </XYPlot>
  );
};

export default EnrollmentsByCourtTypeGraph;
