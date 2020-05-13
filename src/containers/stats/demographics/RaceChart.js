// @flow
import React, { useState } from 'react';
import { Map } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import {
  RadialChart
} from 'react-vis';

const RaceChart = () => {
  const myData = [{ angle: 1, label: 'hey' }, { angle: 5, label: 'hello' }, { angle: 2, label: 'hi' }];
  return (
    <RadialChart
        data={myData}
        width={300}
        height={300}
        showLabels />
  );
};

export default RaceChart;
