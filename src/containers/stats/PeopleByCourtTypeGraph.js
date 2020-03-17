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
  peopleGraphData :Object[];
  toolTipStyle :Object;
};

const PeopleByCourtTypeGraph = ({ peopleGraphData, toolTipStyle } :Props) => {

  const [peopleHoverValues, setPeopleHoverValues] = useState({
    peopleBackground: WHITE,
    peopleHoveredBar: {},
    peopleHoverText: ''
  });
  const peopleToolTipStyleWithBackground :Object = {
    background: peopleHoverValues.peopleBackground,
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
          color={PURPLES[1]}
          data={peopleGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setPeopleHoverValues({
                peopleBackground: PURPLES[0],
                peopleHoveredBar: v,
                peopleHoverText: `${v.y} active`
              });
            }
          }}
          onValueMouseOut={() => {
            setPeopleHoverValues({
              peopleBackground: WHITE,
              peopleHoveredBar: {},
              peopleHoverText: ''
            });
          }} />
      {
        peopleHoverValues.peopleHoveredBar && (
          <Hint
              value={peopleHoverValues.peopleHoveredBar}>
            <div style={Object.assign(peopleToolTipStyleWithBackground)}>
              { peopleHoverValues.peopleHoverText }
            </div>
          </Hint>
        )
      }
    </XYPlot>
  );
};

export default PeopleByCourtTypeGraph;
