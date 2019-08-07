// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { DATETIME_START } from '../../core/edm/constants/FullyQualifiedNames';

const labelMap :OrderedMap = OrderedMap({
  sentenceDate: 'Sentence date',
  checkInDeadline: 'Check-in deadline',
  checkedInDate: 'Date checked in',
  orientationDate: 'Orientation date',
  workStartDate: 'Started work',
  sentenceEndDate: 'Sentence end date',
});

const DatesWrapper = styled.div`
  width: 600px;
`;

type Props = {
  sentenceTerm :Map;
};

const KeyDates = ({ sentenceTerm } :Props) => {

  const { [DATETIME_START]: sentDate } = getEntityProperties(sentenceTerm, [DATETIME_START]);
  const sentenceDate = sentDate ? formatAsDate(sentDate) : '';
  const sentenceDateObj = DateTime.fromISO(sentDate);
  const checkInDeadline = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ hours: 48 }).toLocaleString()
    : '';
  const sentenceEndDate = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ days: 90 }).toLocaleString()
    : '';

  const data :Map = fromJS({
    sentenceDate,
    checkInDeadline,
    checkedInDate: '',
    orientationDate: '',
    workStartDate: '',
    sentenceEndDate,
  });
  return (
    <DatesWrapper>
      <Card>
        <CardSegment padding="lg" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </Card>
    </DatesWrapper>
  );
};

export default KeyDates;
