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


const { MUSTARD_1, PURPLES, WHITE } = Colors;

type Props = {
  referralsGraphData :Object[];
  toolTipStyle :Object;
};

const ReferralsByCourtTypeGraph = ({ referralsGraphData, toolTipStyle } :Props) => {

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
          color={MUSTARD_1}
          data={referralsGraphData}
          onValueMouseOver={(v :Object) => {
            if (v.x && v.y) {
              setReferralHoverValues({
                referralBackground: PURPLES[1],
                referralHoveredBar: v,
                referralHoverText: `${v.y} referrals`
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
