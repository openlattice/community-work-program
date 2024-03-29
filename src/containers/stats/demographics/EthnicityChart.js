// @flow
import React, { useState } from 'react';

import { List, Map } from 'immutable';
import { CardSegment, Colors, Spinner } from 'lattice-ui-kit';
import { Hint, RadialChart } from 'react-vis';

import { toolTipStyle } from '../styled/GraphStyles';
import {
  GraphDescription,
  KeyItem,
  KeyItemWrapper,
  KeySquare,
  KeyWrapper,
} from '../styled/RadialChartStyles';
import { formatRadialChartData, getListForRadialChartKey } from '../utils/StatsUtils';

const { NEUTRAL } = Colors;

type Props = {
  ethnicityDemographics :Map;
  isFetchingDemographics :boolean;
};

const EthnicityChart = ({ ethnicityDemographics, isFetchingDemographics } :Props) => {

  const [hintValue, setHintValue] = useState();
  const toolTipStyleWithBackground :Object = {
    background: NEUTRAL.N700,
    ...toolTipStyle
  };

  const { chartData, valuesNotFound } :Object = formatRadialChartData(ethnicityDemographics);
  const sortedListOfEths :List = getListForRadialChartKey(chartData, valuesNotFound);
  return (
    <>
      {
        isFetchingDemographics
          ? (
            <CardSegment>
              <Spinner size="2x" />
            </CardSegment>
          )
          : (
            <CardSegment>
              <CardSegment padding="0 0 10px 0" vertical={false}>
                <RadialChart
                    colorType="literal"
                    data={chartData}
                    height={400}
                    onValueMouseOver={(v) => setHintValue(v)}
                    onValueMouseOut={() => setHintValue(undefined)}
                    width={400}>
                  {
                    hintValue && (
                      <Hint
                          align={{ vertical: 'top', horizontal: 'right' }}
                          format={() => [
                            { title: hintValue.name, value: '' },
                            { title: 'percentage', value: hintValue.label },
                            { title: 'count', value: `${hintValue.count}` }
                          ]}
                          style={toolTipStyleWithBackground}
                          value={hintValue} />
                    )
                  }
                </RadialChart>
                <KeyWrapper padding="0">
                  {
                    sortedListOfEths.map(({ color, name } :Object) => (
                      <KeyItemWrapper key={name}>
                        <KeySquare color={color} />
                        <KeyItem>{ name }</KeyItem>
                      </KeyItemWrapper>
                    ))
                  }
                </KeyWrapper>
              </CardSegment>
              <GraphDescription>Hover over the chart to see more details.</GraphDescription>
            </CardSegment>
          )
      }
    </>
  );
};

export default EthnicityChart;
