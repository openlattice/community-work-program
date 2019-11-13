// @flow
import React, { Component } from 'react';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit'

type Props = {
};

type State = {
};

class PrintWorkScheduleContainer extends Component<Props, State> {

  render() {
    return (
      <Card>
        <CardSegment padding="sm" vertical>
          Work Schedule
        </CardSegment>
      </Card>
    );
  }
}

export default PrintWorkScheduleContainer;
