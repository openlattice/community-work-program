// @flow
import React, { useState } from 'react';
import { Colors } from 'lattice-ui-kit';
import {
  Hint,
  HorizontalBarSeries,
  HorizontalGridLines,
  VerticalGridLines,
  XYPlot,
  XAxis,
  YAxis,
} from 'react-vis';

import { toolTipStyle } from '../styled/GraphStyles';

const { GREENS, PURPLES, WHITE } = Colors;

type Props = {
  referralsGraphData :Object[];
};

const ReferralsByCourtTypeGraph = ({ referralsGraphData } :Props) => {

  const [referralHoverValues, setReferralHoverValues] = useState({
    referralBackground: WHITE,
    referralHoveredBar: {},
    referralHoverText: ''
  });
  const referralToolTipStyleWithBackground :Object = {
    background: referralHoverValues.referralBackground,
    ...toolTipStyle
  };

  return (
    <XYPlot
        yType="ordinal"
        margin={{
          left: 200,
          right: 10,
          top: 10,
          bottom: 40
        }}
        style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '14px' }}
        width={600}
        height={600}>
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis />
      <YAxis />
      <HorizontalBarSeries
          color={GREENS[4]}
          data={referralsGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setReferralHoverValues({
                referralBackground: PURPLES[1],
                referralHoveredBar: v,
                referralHoverText: `${v.x} referrals`
              });
            }
          }}
          onValueMouseOut={() => {
            setReferralHoverValues({
              referralBackground: WHITE,
              referralHoveredBar: {},
              referralHoverText: ''
            });
          }} />
      {
        referralHoverValues.referralHoveredBar && (
          <Hint value={referralHoverValues.referralHoveredBar}>
            <div style={Object.assign(referralToolTipStyleWithBackground)}>
              { referralHoverValues.referralHoverText }
            </div>
          </Hint>
        )
      }
    </XYPlot>
  );
};

export default ReferralsByCourtTypeGraph;
