// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

const DatesWrapper = styled.div`
  width: 610px;
`;

type Props = {
};

const PrintWorkScheduleContainer = () => {

  return (
    <Card>
      <CardSegment padding="lg" vertical>
        Print
      </CardSegment>
    </Card>
  );
};

export default PrintWorkScheduleContainer;
