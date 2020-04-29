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
  activePeopleGraphData :Object[];
  successfulPeopleGraphData :Object[];
  unsuccessfulPeopleGraphData :Object[];
  toolTipStyle :Object;
};

const PeopleByCourtTypeGraph = ({
  activePeopleGraphData,
  successfulPeopleGraphData,
  toolTipStyle,
  unsuccessfulPeopleGraphData,
} :Props) => {

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
          color={PURPLES[0]}
          data={activePeopleGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setPeopleHoverValues({
                peopleBackground: PURPLES[1],
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
      <VerticalBarSeries
          barWidth={0.55}
          color={PURPLES[2]}
          data={successfulPeopleGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setPeopleHoverValues({
                peopleBackground: PURPLES[1],
                peopleHoveredBar: v,
                peopleHoverText: `${v.y} successful`
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
      <VerticalBarSeries
          barWidth={0.55}
          color={PURPLES[4]}
          data={unsuccessfulPeopleGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setPeopleHoverValues({
                peopleBackground: PURPLES[1],
                peopleHoveredBar: v,
                peopleHoverText: `${v.y} unsuccessful`
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
